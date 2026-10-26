---
title: 连接自托管分类器
sidebar_label: 自托管分类器
description: 将自托管的 Laya 或 Bespoke Nimble 端点接入 LiteLLM Auto Router。设置端点、凭据、分类器模型和路由层级。
---

将已有的 Laya 或 Bespoke Nimble 端点接入 LiteLLM Auto Router。分类器为每个请求选择一个复杂度层级（tier），然后 LiteLLM 调用分配给该层级的补全（completion）模型。你的应用通过对话补全 API 使用一个路由器模型名即可。

如需带截图的操作演示和完整的调优参考，参见[自定义分类器](./optimize_classifier.md#接入自托管分类器)。该指南还介绍了如何用自托管的 OpenAI 兼容 LLM 充当裁判，替代 System One 分类器。

**Laya 与 Bespoke Nimble 是受支持的自托管分类器选项**。Jev 使用 TypeSafe 的托管 API，配置流程与之相同。在仪表板中选择 **OSS Classifier**，或使用 `classifier_type: oss_classifier` 并在 `opensource_classifier_config` 中指定提供商。

## 你需要托管什么

分类器模型由你自己托管在一个 System One HTTP API 之后，与 LiteLLM 网关相互独立。LiteLLM 把请求上下文和层级判定标准发给它，再根据它的决策路由补全。本指南假设该端点已在运行。托管方式参见 [Laya HTTP 服务器指南](https://github.com/NandhaKishorM/laya/blob/main/docs/http-api.md)或 [Nimble 项目](https://github.com/bespokelabsai/nimble#quickstart)。

| 组件 | 作用 | 运行位置 |
| --- | --- | --- |
| LiteLLM 网关 | 接收客户端请求，向分类器询问层级，然后路由补全 | 你的网关部署 |
| 分类器服务器 | 运行 Laya 或 Nimble 推理并返回层级选择 | 由你部署和运维的服务器 |
| 补全模型 | 在路由决策之后生成回答 | 你配置的托管提供商或自托管模型端点 |

所用的 base URL 必须能从网关访问到。分类器部署在内网时，用内网服务地址即可。在 LiteLLM 中选定分类器只是连接到该服务，并不会启动模型服务器。

### 请求上下文与数据流

分类器会收到当前用户请求、选定的系统文本、已配置的历史轮次上下文（如有），以及层级判定标准。设置 `classifier_context_window_size: 0` 可以省略历史轮次，但当前请求和选定的系统文本仍会发送给分类器。下文的 YAML 示例使用的就是这一设置。

补全模型仍然会收到生成回答所需的请求。自行托管分类器不会改变补全的执行位置。历史窗口和字符预算的设置见[分类器上下文参考](/docs/proxy/auto_routing)。

## 选择分类器

| 分类器 | 运行位置 | 分类器模型 | `opensource_classifier_config.provider` |
| --- | --- | --- | --- |
| [Laya](https://github.com/NandhaKishorM/laya) | 自托管 | `english`、`multilingual` 或 `typed-decisions` | `laya` |
| [Bespoke Nimble](https://github.com/bespokelabsai/nimble) | 自托管 System One 服务器 | `nimble-latest`、`nimble`（Ollama）或 `bespokelabs/Bespoke-Nimble-9B` | `bespoke` |
| [Jev](https://docs.typesafe.ai/) | TypeSafe 托管 API | `jev-latest` | `jev` |

三者都使用 System One 决策协议。LiteLLM 会向 `POST /v1/systemone` 发送一个描述各层级选项的 `choice` 问题。`api_base` 设为服务器的基础 URL，且不带 `/v1/systemone`；只暴露 `/v1/evaluate` 或对话补全的端点不满足要求。

:::info 可用性

本指南中的配置名和 Laya 支持需要包含[后端改动 #43626](https://github.com/BerriAI/litellm/pull/43626) 的网关版本。仪表板中的 **OSS Classifier** 选择器还需要[界面改动 #43768](https://github.com/BerriAI/litellm/pull/43768)。两处改动均已合入，请使用包含它们的网关版本。Bespoke Nimble 支持需要 [Nimble 相关改动 #44246](https://github.com/BerriAI/litellm/pull/44246)。

兼容 Jev 的既有配置可以继续保留 `classifier_type: jev` 和 `jev_classifier_config`。新建路由器请使用下文的规范名称；升级已有路由器时参见[迁移](#迁移已有的-jev-或-nimble-路由器)。

:::

## 将分类器连接到网关

在 **LiteLLM 网关环境**中设置分类器的连接变量。下文示例使用内部主机名，请替换为你端点的基础 URL。LiteLLM 会自动追加 `/v1/systemone`，所以 URL 中不要带该路径。

### 连接 Laya {#laya-self-hosted-http-server}

将 LiteLLM 指向你的 Laya HTTP 端点：

```bash
export LAYA_API_BASE="http://laya-server:8000"
# Set this only if your endpoint requires bearer authentication.
export LAYA_API_KEY="<classifier-bearer-key>"
```

使用 `provider: laya`，并选择你端点提供的检查点（checkpoint）：`english`、`multilingual` 或 `typed-decisions`。在[完整路由器配置](#configure-the-router)中使用：

```yaml
opensource_classifier_config:
  provider: laya
  model: english
  timeout_ms: 15000
```

### 连接 Nimble {#nimble-self-hosted-system-one-server}

将 LiteLLM 指向你的 Nimble System One 端点：

```bash
export BESPOKE_API_BASE="http://nimble-server:8000"
# Set this only if your endpoint requires bearer authentication.
export BESPOKE_API_KEY="<classifier-bearer-key>"
```

使用 `provider: bespoke`，并把 `model` 设为你端点提供的名称。将[完整路由器配置](#configure-the-router)中的分类器块替换为：

```yaml
opensource_classifier_config:
  provider: bespoke
  model: nimble-latest
  timeout_ms: 30000
```

Ollama 端点使用 `model: nimble`。其他部署可能提供 `nimble-latest` 或 `bespokelabs/Bespoke-Nimble-9B`。`bespoke` 提供商与 LiteLLM 的 Nimble 搜索集成是两个独立的功能。

### 端点与认证设置

- **Base URL**：填网关能访问到的主机名和端口。`localhost` 指网关自身所在的主机或容器。
- **凭据**：LiteLLM 会把 `LAYA_API_KEY` 或 `BESPOKE_API_KEY` 作为 bearer token 发送。填你端点接受的凭据即可；端点不要求认证时可以省略。这些设置不会在分类器服务器上启用认证。
- **模型**：与端点实际提供的名称保持一致。
- **超时**：先用上文示例中的值，再根据分类器的响应时间调整。

修改环境后重启网关。之后即可[在仪表板中配置 Auto Router](#通过仪表板配置)，或[使用 YAML](#configure-the-router)。

如果连接只针对某个路由器，在 `opensource_classifier_config` 内设置 `api_base` 和与之匹配的 `api_key`。显式设置的 `api_base` 不会继承环境变量中的密钥。如果端点要求其他认证方案，比如 Modal 的 `Modal-Key` 和 `Modal-Secret` 请求头，可以用一个代理把 bearer 凭据转换成所需的请求头。

### Jev 托管版 TypeSafe API

要使用托管选项，请用你的密钥管理器（secret manager）在网关环境中设置 `TYPESAFE_API_KEY`，并在[完整路由器配置](#configure-the-router)中使用以下分类器块：

```yaml
opensource_classifier_config:
  provider: jev
  model: jev-latest
  timeout_ms: 3000
```

`provider: jev` 使用 TypeSafe 的传输层和环境变量。`TYPESAFE_API_BASE` 可选，默认为 `https://api.typesafe.ai`。

如果要为单个路由器指定端点，在 `opensource_classifier_config` 内同时提供 `api_base` 和匹配的 `api_key`。显式指定的端点不会继承 TypeSafe 的环境变量密钥。模型、超时、指令和熔断器（circuit breaker）相关字段参见 [Jev 参考](/docs/proxy/auto_routing#jev-分类器)，其中的示例沿用已发布版本支持的名称。

## 通过仪表板配置

先在网关上设置[上文的连接变量](#将分类器连接到网关)。你选择提供商时，仪表板会使用这条连接。

1. 打开 **Models + Endpoints → Auto Router**，新建或编辑一个路由器。
2. 在 **What classifies your requests?** 下选择 **OSS Classifier**，在 **OSS provider** 下选择 **Laya** 或 **Bespoke Nimble**。
3. 把 **Classifier Model** 设为你服务器支持的名称，把 **Classifier Timeout (ms)** 设为适合该服务器的值。Laya 可先用 `15000`，Nimble 可先用 `30000`，模型预热完成后再调优。
4. 把已有的补全部署分配到 `SIMPLE`、`MEDIUM`、`COMPLEX` 和 `REASONING` 层级，并选择一个默认模型。
5. 用有代表性的提示词试跑 **Test Routing**，检查分类器结果，然后保存路由器。客户端请求按[下文](#测试路由并发送请求)所示发送到路由器的模型名。

内置的 OSS 分类使用随版本附带的层级判定标准，无需 LiteLLM 许可证即可使用。自定义指令和自定义层级的可用额度以仪表板显示为准。

管理员可以通过管理 API 配置 `api_base` 和 `api_key` 覆盖项。显式设置的 `api_base` 不会继承环境变量密钥；服务器要求凭据时，需同时提供匹配的 `api_key`。仪表板负责编辑模型和分类器选项，连接本身由网关持有。保存同一个提供商会保留已存的连接；更换提供商会丢弃上一个提供商的端点和密钥。团队成员不能通过管理 API 提交端点或凭据覆盖项。

## 在 YAML 中配置路由器 {#configure-the-router}

这个完整示例使用自托管的 Laya 分类器。先在网关上设置 [Laya 连接变量](#laya-self-hosted-http-server)。要改用 Nimble，把分类器块替换为 [Nimble 配置](#nimble-self-hosted-system-one-server)。`small-solver` 和 `large-solver` 只是示例部署名，请把它们背后的模型换成你网关能访问到的模型：

```yaml title="config.yaml"
model_list:
  - model_name: small-solver
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: large-solver
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
  - model_name: decision-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_default_model: large-solver
      complexity_router_config:
        classifier_type: oss_classifier
        opensource_classifier_config:
          provider: laya
          model: english
          timeout_ms: 15000
        tiers:
          SIMPLE: small-solver
          MEDIUM: small-solver
          COMPLEX: large-solver
          REASONING: large-solver
        classifier_fallback: default_model
        classifier_context_window_size: 0
```

此示例把分类器失败回退到 `large-solver`，且不向分类器发送历史对话轮次。当前请求和选定的系统文本仍会发送。省略时的默认回退方式是 `heuristic`；默认历史窗口为最近三个用户轮次，且历史轮次总量不超过 8000 字符。

## 测试路由并发送请求

设置好分类器连接变量和补全提供商凭据后，启动 LiteLLM：

```bash
litellm --config config.yaml
```

在 **Models + Endpoints → Auto Router** 中打开新建或编辑表单，用 **Test Routing** 查看选中的层级和模型，期间不会实际调用补全模型。回退成功并不能证明分类器正常工作：请检查路由原因（cause）和分类器模型。三家提供商的决策模型结果都使用 `cause: jev_classifier`。Laya 上报形如 `laya/english` 的分类器模型；Nimble 上报 `bespoke/<model>`，服务器有返回模型名时优先使用返回值。

使用有权访问 `decision-router` 的 LiteLLM 虚拟密钥（virtual key）发起一次补全：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "decision-router",
    "messages": [{"role": "user", "content": "Explain what an HTTP status code means"}]
  }'
```

如果仪表板里看不到该提供商，请确认你的网关和仪表板包含上文可用性说明中列出的改动。旧版仪表板将该分类器标注为 **JEV Classifier**。

## 调用原生决策 API

配置好对应的服务器 URL，然后使用有权访问带提供商前缀模型的 LiteLLM 虚拟密钥。请求体中写明原生模型名：

| 提供商 | 网关端点 | 请求体 `model` | 虚拟密钥模型权限 |
| --- | --- | --- | --- |
| Laya | `/laya/v1/systemone` | `english` | `laya/english` |
| Bespoke Nimble | `/bespoke/v1/systemone` | `nimble-latest` (`nimble` on Ollama) | `bespoke/nimble-latest` (`bespoke/nimble` on Ollama) |

下面的 Laya 示例同样适用于 Nimble，只需按 Nimble 那一行替换端点和请求体中的模型：

```bash
curl http://localhost:4000/laya/v1/systemone \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "english",
    "state": "My invoice has two identical charges",
    "questions": {
      "department": {
        "type": "choice",
        "instructions": "Choose the department that should help",
        "criteria": {
          "billing": "Invoices, payments, and refunds",
          "technical": "Bugs and connectivity problems"
        }
      }
    }
  }'
```

每个原生 Laya 请求都必须显式选择 `english`、`multilingual` 或 `typed-decisions`，并拥有对应 `laya/<checkpoint>` 模型的权限。未知名称和自动选择都会被拒绝。响应会保留 Laya 原生的 `answers`、`usage` 和 `routing` 字段。两条原生路由都只支持 System One 请求，不暴露 `/v1/evaluate`、对话补全和流式接口。Nimble 保留其原生的 `answers` 和 `usage` 响应。

## 评估质量与成本

在改动生产路由之前，先用有代表性的提示词比较各层级的选择结果。概率描述的是所给的选项；不同模型家族的置信度分数不能互相当作准确率估计来用。下游回答质量、分类器延迟、回退频率和总成本可用[评估指南](/docs/auto_router/evaluate)来衡量。

Jev 调用可能产生 TypeSafe 费用。自托管 Nimble 或 Laya 即使没有托管推理费，也有计算成本。Laya 和 Bespoke Nimble 内置目录的 token 单价为 0，基础设施费用另计。日志命名方面，Jev 使用 `typesafe/<model>`，Laya 使用 `laya/<checkpoint>`，Bespoke Nimble 使用 `bespoke/<model>`。OSS 分类器的名称不会改变路由结果中的 `cause: jev_classifier` 值。

如果分类器发生回退，请检查端点、检查点名称、凭据、模型预热和超时设置。超时还可能触发分类器熔断器，其恢复间隔默认为 30 秒。请确认服务器本身接受 `/v1/systemone`，而不是把该路径加进 `api_base`。

## 迁移已有的 Jev 或 Nimble 路由器

升级到包含[后端改动 #43626](https://github.com/BerriAI/litellm/pull/43626) 的版本后，使用 `classifier_type: oss_classifier`，并把 `jev_classifier_config` 改名为 `opensource_classifier_config`。设置 `provider: jev`，保留原有的模型、端点、凭据和分类器选项。例如，托管 Jev 配置会变成：

```yaml
classifier_type: oss_classifier
opensource_classifier_config:
  provider: jev
  model: jev-latest
  timeout_ms: 3000
```

对于已有的 YAML 和已保存的路由器，新后端仍接受 `classifier_type: jev`、`jev_classifier_config` 和旧值 `provider: typesafe`。分类器配置块只能提供一个。携带分类器配置的模型管理创建与更新请求会写入规范名称；不改动配置的更新请求则保留已保存的值。

保留 `provider: jev` 的既有配置会继续使用 TypeSafe 传输层和环境变量。要把兼容的 Nimble System One 服务器迁移到 `provider: bespoke`，选择 `nimble-latest`，配置 `BESPOKE_API_BASE` 和可选的 `BESPOKE_API_KEY`，并授予 `bespoke/nimble-latest` 的访问权限。更换提供商会清除已保存的 Jev 连接覆盖项；管理员需要重新显式提供需要的覆盖项。新调用在日志中使用 `bespoke/<model>`，而 `cause: jev_classifier` 保持不变。
