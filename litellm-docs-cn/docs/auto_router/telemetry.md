---
title: Auto Router OTEL 遥测
sidebar_label: OTEL 遥测
description: 追踪 Auto Router 的配置、所选模型、路由原因以及已恢复的分类器失败。在网关上启用一次 OpenTelemetry，即可在 Lens 或其他 OTLP 后端查看结果。
---

Auto Router 会向 OpenTelemetry（OTEL）追踪记录添加 `litellm.routing.*` 属性，帮助你弄清实际运行的是哪份配置、为什么选中了某个模型，以及请求恢复之前是否发生过分类器失败。

**如果你的网关已经在导出 OTEL 追踪记录，就不存在需要逐个路由器开启的遥测开关**。升级到包含下述插桩的构建版本即可。路由阶段细节与重试/回退事件请使用 OTEL v2。调用网关的应用无需额外的 SDK，也不必改用其他推理端点。

:::info 可用性

这些属性要求网关构建版本包含 [LiteLLM #44926](https://github.com/BerriAI/litellm/pull/44926)。在旧版本上设置 OTEL 环境变量并不会带来这些插桩。本指南覆盖通过网关异步 Router 路径发起的推理；仪表板中未保存的 **Test Routing** 预览并不能作为等价的追踪测试。

:::

## 需要额外配置吗？

| 你网关的现状 | 需要做什么 |
| --- | --- |
| OTEL v2 已经在导出追踪记录 | 升级到包含插桩的构建版本。既有路由器和新路由器都会自动输出可用字段。 |
| 通过 `otel` 回调使用通用 OTEL v1 | 升级后的构建版本会在模型 span 上附加路由属性。启用 v2 并重启，即可获得路由阶段属性与重试/回退事件。参见[迁移指南](/docs/observability/opentelemetry_v2_migration)。 |
| 尚无 OTEL 导出器 | 参照下方示例，在网关上完成一次性追踪配置。 |
| Lens 运行在另一个网关上 | 配置源网关的导出器或其 collector，把追踪转发给 Lens。仅打开 Lens 并不会连通两个网关。 |

哪些追踪能到达后端，仍由你的导出器、采样规则和 collector 过滤器决定。如果某个 collector 只转发指定名称的路由器，新增路由器时要同步更新该过滤器。

## 在网关上启用追踪

从一份现成的 [Auto Router 配置](./setup.md)入手，并确保网关能访问某个 OTLP collector。网关运行时需要 OpenTelemetry SDK 和 HTTP 导出器；网关服务端的 span 还需要 `opentelemetry-instrumentation-fastapi`。LiteLLM 的 `proxy-runtime` extra 已包含这些依赖。

在**启动前的网关进程环境**中设置以下变量，然后重启网关：

```bash
export LITELLM_OTEL_V2=true
export OTEL_EXPORTER=otlp_http
export OTEL_ENDPOINT="http://otel-collector:4318"
export OTEL_SERVICE_NAME="litellm-gateway"
export OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=no_content
```

把端点替换成你 collector 的地址。对 OTLP/HTTP 而言，LiteLLM 会在这个基础 URL 后追加 `/v1/traces`。如果你的 collector 需要认证，请设置 `OTEL_HEADERS`，例如 `Authorization=Bearer <collector-token>`。避免同时把等价的 `OTEL_EXPORTER_OTLP_*` 别名设置成相互冲突的值。

下方的完整示例显式注册了通用 `otel` 回调。如果已经配置过，保留该条目即可。OTEL v2 还会根据环境设置在代理上初始化一个通用导出器；不需要为每个路由器新增回调。

```yaml title="config.yaml"
model_list:
  - model_name: efficient
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: capable
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: smart-router
    model_info:
      id: smart-router-config
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_default_model: capable
      complexity_router_config:
        classifier_type: heuristic
        tiers:
          SIMPLE: efficient
          MEDIUM: efficient
          COMPLEX: capable
          REASONING: capable

litellm_settings:
  callbacks: ["otel"]

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

通过部署的密钥配置提供 `OPENAI_API_KEY` 和 `LITELLM_MASTER_KEY`，然后启动代理：

```bash
litellm --config config.yaml --port 4000
```

还没有 collector？可以用 console 导出，直接在网关输出里查看 span：

```bash
unset OTEL_ENDPOINT OTEL_TRACES_ENDPOINT
unset OTEL_EXPORTER_OTLP_ENDPOINT OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
export OTEL_EXPORTER=console
```

要清空这些端点变量，因为只要配置了端点，即便 `OTEL_EXPORTER=console` 也会走网络导出。如果你在 `callback_settings.otel` 中配置过显式网络导出器，做这种仅限 console 的预览时也要一并移除。Console 导出不会把追踪发送到 Lens 或其他后端。

这些路由属性和 span 事件不要求设置 `LITELLM_OTEL_INTEGRATION_ENABLE_METRICS` 或 `LITELLM_OTEL_INTEGRATION_ENABLE_EVENTS`。

### 将追踪发送到 Lens

先[在 Lens 网关上启用追踪接收](/docs/proxy/lens)，并取得一个有权在那里接收追踪的 LiteLLM 密钥。若要从源网关直接导出，请使用 Lens 网关的基础 URL 和接收密钥：

```bash
export LENS_GATEWAY_URL="https://your-lens-gateway.example"
export LENS_INGEST_KEY="<lens-ingestion-key>"
export OTEL_EXPORTER=otlp_http
export OTEL_ENDPOINT="${LENS_GATEWAY_URL}/v1/traces"
export OTEL_HEADERS="Authorization=Bearer ${LENS_INGEST_KEY}"
```

保留 `LITELLM_OTEL_V2=true`，并在修改导出器后重启源网关。如果现有 collector 已经把追踪送往另一个后端，把 Lens 加为 collector 目的地即可两份都保留。应用仍向源网关发送推理请求；只有遥测数据被转发到 Lens。接收端配置与示例见 [Lens OpenTelemetry 集成](/docs/proxy/lens/integrations/opentelemetry)。

## 验证 Auto Router 请求

使用一个有权访问 `smart-router` 的 LiteLLM 虚拟密钥（virtual key）作为 `LITELLM_API_KEY`：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"smart-router","messages":[{"role":"user","content":"What is 2+2?"}]}'
```

在追踪后端中，于 service `litellm-gateway` 下查找该请求。在 Lens 里打开 **Lens > Traces**，选中该请求，再选中 **route smart-router**，然后打开 **Attributes**。查看 `litellm.routing.router_config_id=smart-router-config`、`litellm.routing.routed_model` 和 `litellm.routing.cause`。

| 追踪位置 | 可查看的数据 |
| --- | --- |
| V2 的 `route <requested-model>` 阶段 | 分类前的所选配置；随后在可用时附上最终完成的决策。在形成决策之前失败，仍可能保留该配置。 |
| 模型调用 span（v1 或 v2） | 与该模型调用关联的最终路由决策。span 名称可能仍是请求时的路由器别名；要获取所选模型组，请看 `routed_model`。 |
| V2 请求根 span，或尚无根 span 时的当前 span | 路由重试/回退事件，附带路由器名称、错误类别和现有重试计数。 |

内部的分类器调用和嵌入调用不会继承外层尚未完成的路由决策。如果 Auto Router 某次尝试失败后回退到普通模型，最终那个模型 span 会清除先前的决策。要排查失败的路由器，请检查更早的路由阶段。

## 可用的遥测数据

本表中的属性名都以 **`litellm.routing.`** 开头。各字段均为可选，只有当所选策略产出标量值时才会出现。字段缺失并不代表值为零、为假或操作成功。

| 属性后缀 | 含义 |
| --- | --- |
| `router_model_name`, `router_type` | 注册在案的路由器标识以及实际执行的策略类型：`complexity`、`semantic`、`adaptive` 或 `quality`。注册名可能与团队对外别名不同。 |
| `router_config_id`, `router_config_updated_at` | 所选定义的 ID 与更新时间戳（如果可用）。静态配置可能没有更新时间戳。 |
| `router_config_fingerprint` | 所配置的路由字段、模型与标签的指纹，在策略注册时计算。 |
| `routed_model`, `cause` | 所选模型组以及选择它的原因。 |
| `tier`, `tier_label`, `request_type`, `score` | 策略自身的分类结果。层级（tier）可使用自定义名称；score 也不一定是概率。 |
| `classifier_model`, `classifier_cost`, `classifier_confidence` | 分类器标识、记录到的成本与置信度（如果可用）。 |
| `classifier_failure_reason`, `classifier_error_type` | 有界失败类别与异常类名（存在异常时）。这些字段不包含异常消息本身。 |
| `classifier_primary_rule`, `classifier_capability_boundary` | 能力分类器报告的规则与能力边界。 |
| `classifier_p_solve`, `classifier_calibrated_p_solve`, `classifier_calibration_version`, `classifier_threshold` | 可用的能力估计值、校准标识与阈值。 |
| `classifier_efficient_p_solve`, `classifier_capable_p_solve`, `classifier_calibrated_efficient_p_solve`, `classifier_calibrated_capable_p_solve` | efficient 与 capable 两个模型可用的求解预测值。 |
| `classifier_max_quality_gap`, `classifier_prompt_version` | 所配置的质量差距约束与分类器提示词版本（如果产出）。 |
| `escalated`, `context_escalated`, `context_escalation_original_tier`, `reasoning_override_min_score` | 升级（escalation）与推理覆盖（reasoning override）细节。 |
| `conversation_continuing` | 该决策是否判定当前为一段延续中的对话。 |
| `savings_baseline_model`, `savings_baseline_deployment_id` | 路由决策所用基线的标识。仅凭这些字段并不能确定节省金额。 |

指纹并不是影响路由的所有因素的完整快照。它不包含被引用文件的内容、自适应的实时状态以及插件的实现与状态。请把它与配置 ID、时间戳以及实际部署的网关版本对照使用。

既有的模型调用遥测已提供提供商、Token 用量与成本属性；span 计时提供耗时。本功能不会创建新的路由指标、仪表板或告警。外围的追踪数据参见 [OTEL v2 参考](/docs/observability/opentelemetry_v2)。

### 可自恢复的分类器失败

HTTP 响应成功也可能内含分类器失败。例如 LLM 分类器可能失败，而配置好的启发式回退仍能选出模型并完成请求。一个示意性的决策如下：

```json
{
  "litellm.routing.router_model_name": "smart-router",
  "litellm.routing.router_config_id": "smart-router-config",
  "litellm.routing.routed_model": "efficient",
  "litellm.routing.cause": "heuristic_scorer",
  "litellm.routing.classifier_failure_reason": "classifier_error",
  "litellm.routing.classifier_error_type": "InternalServerError"
}
```

这个恢复示例依赖 LLM 分类器；上面那份纯启发式配置不会发起任何分类器模型调用。要找出已恢复的失败，可搜索是否存在 `classifier_failure_reason`。只按 HTTP 错误状态码或包含 `fallback` 的 `cause` 过滤，会漏掉其中一部分。

![显示所选配置、分类器错误与启发式恢复过程的 Lens 路由 span](/img/auto-router/otel-telemetry.jpg)

| `classifier_failure_reason` | 含义 |
| --- | --- |
| `timeout` | 分类器调用超时。 |
| `circuit_open` | 熔断处于打开状态，未能发起分类器调用。 |
| `not_configured` | 所需的分类器配置不可用。 |
| `unsupported_input` | 分类器无法处理该输入。 |
| `invalid_response` | 分类器结果无法用作有效决策。 |
| `declined` | 分类器拒绝选择层级。 |
| `classifier_error` | 发生了其他分类器异常。 |

路由的 `cause` 保留的是实际决策原因，例如 `heuristic_scorer`、`heuristic_v2`、`llm_classifier`、`capability_classifier`、`jev_classifier`、`classifier_plugin` 或 `default_model_fallback`。语义路由器会上报 `semantic_match`、`semantic_no_match` 或 `semantic_error`；正常的未命中并不属于分类器失败。其他路由策略也可以上报各自的原因。

### 重试与回退事件

当 Router 为一次自动路由的尝试记录重试/回退簿记时，OTEL v2 会记录 **`litellm.routing.retry`** 事件。该事件包含 `litellm.routing.router_model_name`、`litellm.retry.count` 和 `error.type`，已知时还会包含 `litellm.deployment.model_group` 和 `litellm.deployment.id`。

该计数沿用现有的请求重试计数器。事件描述的可能是某次已耗尽的尝试，也可能是一次回退切换；它不保证还会再发起一次出站重试，也不等于提供商调用的确切次数。配置标识仍保留在路由 span 上。

## 数据捕获与性能

新增的标量路由属性不包含会引用提示词内容的字段，例如 `signals`、命中的关键词和 `classifier_crux`，也不包含原始配置、异常消息和嵌套的预测映射。其他 span 属性与日志仍遵循各自的捕获与脱敏设置。尤其要注意，v1 保留其现有的元数据导出；这份允许清单并不能让整条追踪做到不含提示词内容。

遥测会带来额外的属性处理和更大的追踪负载。它不会新增分类器或补全调用，且配置指纹会在请求之间复用。标准网络导出器在后台批量发送；console 和显式配置的 simple processor 行为则不同。在设定性能预期之前，请用你自己的导出器和真实流量测量吞吐量与尾延迟。

## 故障排查

| 现象 | 排查点 |
| --- | --- |
| 收不到追踪记录 | 确认源网关已配置 OTEL、目的地接受该协议与凭证，且采样或 collector 过滤器保留了该请求。补全成功并不能证明导出成功。 |
| 追踪到达但没有 `litellm.routing.*` | 确认网关包含相应插桩、请求是通过网关推理 API 走已保存的路由器发出的，并且你查看的是路由 span 或模型调用 span。 |
| 有模型属性，但没有路由阶段细节 | 在启动前启用 v2 并重启。检查后端或预设是否保留了非 LLM span，以及网关插桩依赖是否已安装。 |
| 有配置字段但没有选出的模型 | 该次尝试可能在产生路由决策之前就已失败。检查该阶段及其错误。 |
| 最终成功的 span 没有路由字段 | 回退到普通模型会清除先前的路由器决策。请检查之前的路由阶段。 |
| 没有指纹或时间戳 | 定义可能本就没有时间戳；当所配置的定义无法序列化时，指纹也可能缺失。请使用可用的标识字段。 |
| 已恢复的失败没有异常类 | 有些失败类别是一种决策，而不是捕获到的异常。请把 `classifier_failure_reason` 和 `cause` 结合起来查看。 |
