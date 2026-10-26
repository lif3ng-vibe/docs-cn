import Image from '@theme/IdealImage';

# 健康检查

代理（proxy）的健康状态有两类使用者。你的编排器（orchestrator，如 Kubernetes、负载均衡器、可用性监控）轮询轻量级探针端点，判断进程是否已启动、能否接收流量；而你作为运维者，要确认每个已配置的 LLM 是否真能处理请求。本页两部分都会讲到。

## 探针端点

这些端点回答"网关进程是否已启动、能否处理流量"这一问题，全程不发起任何 LLM 调用。它们是代理在存活（liveness）与就绪（readiness）探测上的标准契约。

| 端点 | 认证 | 返回值 | 含义 |
|------|------|--------|------|
| `GET /health/liveliness` | none | `"I'm alive!"`（200）；优雅停机期间返回 `{"status": "shutting_down"}`（503） | 进程已启动，不检查任何依赖。`GET /health/liveness` 是 Kubernetes 拼法的别名，两个路由都真实存在 |
| `GET /health/readiness` | none | 就绪时返回 `{"status": "healthy", "db": ...}`（200）；配置的数据库不可达时返回 503 | 工作进程已准备好接收流量。`db` 字段取值为 `"connected"`、`"disconnected"`，未配置数据库时为 `"Not connected"` |

借助 `db` 的取值，编排器可以区分健康的工作进程与已启动却连不上数据库的进程。数据库已配置但不可达时，readiness 返回 503，pod 因此被移出轮换。

默认的就绪响应刻意保持低细节，即使暴露给未经认证的探针也是安全的。要获取完整诊断信息（回调、缓存、版本），可以设置 `general_settings.allow_public_health_readiness_details: true` 来扩展 `/health/readiness` 本身，也可以调用需要认证的 `GET /health/readiness/details` 端点。

下面是跑在代理 4000 端口上的一组最小化 Kubernetes 探针：

```yaml
livenessProbe:
  httpGet:
    path: /health/liveliness
    port: 4000
readinessProbe:
  httpGet:
    path: /health/readiness
    port: 4000
```

完整的部署清单见[生产环境部署指南](./deploy.md)与[生产环境检查清单](./prod.md)。

## Admin UI 中的模型健康状态

要确认模型是否正常服务，首选入口是管理界面（Admin UI）。进入 Models + Endpoints 页面，打开 Health Status 标签页，点击 Run All Checks。每个模型会显示状态，失败时给出错误详情，以及最近一次检查与最近一次成功的时间。

<Image img={require('../../img/ui_health_status.png')} alt="Run All Checks 之后 Health Status 标签页中显示的健康模型" />

对应的 API 是 `GET /health`，接受任何有效密钥。它会向每个已配置模型发起一次真实的测试请求，因此每个模型都要消耗少量 token。

```shell
curl --location 'http://0.0.0.0:4000/health' -H "Authorization: Bearer $LITELLM_API_KEY"
```

```json
{
    "healthy_endpoints": [
        {"model": "azure/{{openai_small}}", "api_base": "https://my-endpoint-canada-berri992.openai.azure.com/"}
    ],
    "unhealthy_endpoints": [
        {"model": "azure/{{openai_small}}", "api_base": "https://openai-france-1234.openai.azure.com/"}
    ]
}
```

要检查单个模型，传入 `?model=<model_name>` 或 `?model_id=<id>`；模型的 id 可以从 `GET /v1/model/info` 查到。

## 后台健康检查

默认情况下，`/health` 每次被调用都会探测全部模型。为避免查询过于频繁，可以让检查在后台运行，`/health` 直接返回最近一次的缓存结果。在 `general_settings` 中配置：

```yaml
general_settings:
  background_health_checks: true      # run checks in the background
  health_check_interval: 300          # seconds between runs (default 300)
  health_check_details: true          # include endpoint URLs and errors in the response (default true)
```

当代理面向大范围受众暴露时，可设置 `health_check_details: false`，从响应中剔除端点 URL、错误信息及其他参数。

要把某个模型排除出后台检查循环，在其 `model_info` 中设置 `disable_background_health_check: true`。这只跳过后台循环；按需发起的 `GET /health` 仍会探测它，除非再设置 `general_settings.health_check_skip_disabled_background_models: true`，这样这些部署也会从按需和共享健康检查中剔除。

```yaml
model_list:
  - model_name: openai/{{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      disable_background_health_check: true
```

与其逐个排除模型，也可以把后台检查范围限定到特定模型组：把 `general_settings.background_health_check_model_groups` 设为要探测的模型组名称列表。只有列表中模型组下的部署会被检查，因此 `/health` 只报告这些组，[健康检查路由](./health_check_routing.md)也只对它们生效；未列出的组保持原有路由行为。之后新增的模型组不会被探测，直到你把它加入列表；配置值不是字符串列表时启动会直接报错。

```yaml
general_settings:
  background_health_checks: true
  background_health_check_model_groups: ["prod-openai"]
```

如果要在多个 pod 之间协调检查、避免昂贵的模型在每个 pod 各探测一次，见[共享健康检查状态](./shared_health_check.md)。

## 模型模式

健康检查会根据模型的 `model_info.mode` 选择要测试的操作。请设置该字段，让探测走正确的 API 通道；若不设置，LiteLLM 会根据模型能力自动判断，兜底走对话补全（chat completion）。

| `mode` | 健康检查调用 |
|--------|--------------|
| `chat`（默认） | `/chat/completions` |
| `completion` | `/completions` |
| `embedding` | `/embeddings` |
| `image_generation` | 图像生成 |
| `audio_transcription` | 语音转写 |
| `audio_speech` | 文本转语音（需要 `health_check_voice`） |
| `rerank` | 重排序 |
| `batch` | 批处理（仅 Azure） |
| `realtime` | 实时会话 |
| `ocr` | OCR |
| `video_generation` | 视频生成 |
| `image_edit` | 图像编辑 |
| `anthropic_messages` | `/v1/messages` |

Bedrock Mantle 上的 Claude 模型只能通过 Anthropic Messages API 服务，因此 `bedrock_mantle/anthropic.claude-*` 部署在未设置 `mode` 时，会改用 `anthropic_messages` 而非对话补全来探测。显式设置的 `mode` 仍然优先。

对于通配路由（`litellm_params.model` 中包含 `*`），请把 `health_check_model` 设为探测应调用的具体模型。通配路由未设置 `mode` 时，探测请求不会携带 `max_tokens`。

```yaml
model_list:
  - model_name: azure-embedding-model
    litellm_params:
      model: azure/azure-embedding-model
      api_base: os.environ/AZURE_API_BASE
      api_key: os.environ/AZURE_API_KEY
      api_version: "2023-07-01-preview"
    model_info:
      mode: embedding
```

## 健康检查调优参考

除另有说明外，以下配置都放在模型的 `model_info` 下，用于控制探测请求的构造方式。

| 键 | 默认值 | 用途 |
|----|--------|------|
| `health_check_timeout` | 60s | 探测的按模型超时时间 |
| `health_check_max_tokens` | 16 (unset for wildcard routes) | 探测请求上的 `max_tokens` |
| `health_check_max_tokens_reasoning` | unset | 未设置 `health_check_max_tokens` 时，推理模型使用的 `max_tokens` |
| `health_check_max_tokens_non_reasoning` | unset | 未设置 `health_check_max_tokens` 时，非推理模型使用的 `max_tokens` |
| `health_check_reasoning_effort` | unset | 探测请求上的 `reasoning_effort`（仅 chat、completion、batch、responses 模式） |
| `health_check_voice` | `alloy` | `audio_speech` 探测使用的语音。自 v1.107.0 起，Gemini TTS 部署会把 `alloy` 及其他 OpenAI 语音名映射为 Gemini 预置语音（`alloy` 对应 `Kore`，见[映射表](../providers/gemini#音色名称)），默认值因此可以直接用；要直接指定某个 Gemini 语音，可设为 `Kore` 之类的名称，早期版本需要这样做 |
| `health_check_model` | unset | 通配路由探测时调用的具体模型 |
| `disable_background_health_check` | false | 后台循环跳过该模型 |

推理模型的探测通常需要更大的 `max_tokens`，因为提供商会把推理 token 计入补全预算；独立的 reasoning 与 non-reasoning 键让你无需逐个列出模型即可调高该值。有三个环境变量提供全局默认：`DEFAULT_HEALTH_CHECK_PROMPT` 覆盖默认探测提示词（`"test from litellm"`）；`BACKGROUND_HEALTH_CHECK_MAX_TOKENS` 是全局 `max_tokens` 兜底值；对非通配的推理模型，`BACKGROUND_HEALTH_CHECK_MAX_TOKENS_REASONING` 优先级更高。

要把流量从健康检查失败的部署上切走，见[健康检查驱动的路由](./health_check_routing.md)。

## 其他健康端点

以下端点除特别说明外都需要有效密钥。

- `GET /health/services?service=<name>` 测试某个已配置的告警或日志服务（datadog、slack、langfuse 等）；接受任何有效密钥
- `GET /health/readiness/details` 返回需要认证的就绪诊断信息（数据库、缓存、回调、版本）
- `GET /health/history` 返回历史健康检查结果
- `GET /health/latest` 返回最近一次健康检查结果
- `GET /health/backlog` 返回工作进程上正在处理中的请求数
- `GET /health/drain` 为 Kubernetes `preStop` 钩子启动优雅排空（drain）；默认关闭（返回 404），需设置 `general_settings.enable_drain_endpoint: true` 才启用；设置了 `DRAIN_ENDPOINT_TOKEN` 时还需通过 `X-Drain-Token` 请求头校验
