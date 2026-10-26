import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 敏感数据路由（内置防护栏）

这是一道**内置防护栏**（built-in guardrail），用于检测请求中的敏感数据，并将其重新路由到本地部署模型（on-premise model），而不是拦截或脱敏。无需任何外部依赖。

**何时使用**？当敏感提示词必须交给本地部署模型而非云端提供商来处理，同时又要保证用户工作流不中断时。

## 概览

| 属性 | 说明 |
|----------|---------|
| 描述 | 通过正则表达式与关键词匹配检测敏感数据，并将请求重新路由到本地部署模型。一旦某个会话中出现敏感数据，该会话后续的每一轮也都会路由到本地部署。 |
| 防护栏名称 | `sensitive_data_routing` |
| 检测方式 | 预置正则模式、自定义正则、关键词匹配 |
| 动作 | 重新路由到本地部署模型（绝不拦截或脱敏） |
| 支持的模式 | `pre_call` |
| 性能 | 快速；本地运行，无外部 API 调用 |

## 工作原理

该防护栏在模型选择之前运行。每次收到请求时，它都会使用你配置的模式与关键词扫描各条消息中是否含有敏感数据。一旦命中，就把目标模型改写为你的 `on_premise_model`，由本地部署来处理该请求。提示词原样透传，不会被拦截或脱敏，对话照常继续。

启用 `sticky_session`（默认启用）后，会话中首次出现敏感数据时，该会话就会被固定到本地部署模型。此后该会话的每一轮都会路由到本地部署，即使某些轮次并不包含敏感数据，也就是说，一旦对话触及过敏感数据，就再也不会离开本地部署模型。固定机制依赖客户端发送的稳定会话 ID（参见 [会话粘性](#会话粘性)）。

`on_premise_model` 只是 `model_list` 中的一个模型组（model group），把它指向你实际运行的任意本地部署即可（vLLM、Ollama、自托管的 OpenAI 兼容端点等）。

## 快速上手

### 步骤 1：在 config.yaml 中定义防护栏与本地部署模型

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: cloud-model
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: on-prem-model
    litellm_params:
      model: hosted_vllm/meta-llama/Llama-3.1-8B-Instruct
      api_base: http://your-on-prem-host:8000/v1

guardrails:
  - guardrail_name: "sensitive-data-routing"
    litellm_params:
      guardrail: sensitive_data_routing
      mode: "pre_call"
      default_on: true

      # The model group (from model_list above) to route sensitive requests to
      on_premise_model: "on-prem-model"

      # Built-in detectors
      prebuilt_patterns:
        - us_ssn
        - credit_card
        - email
      regex_patterns:
        - "project\\s+titan"
      keywords:
        - confidential
        - internal only

      # Keep the whole session on-premise once sensitive data is seen
      sticky_session: true
      session_ttl_seconds: 14400
```

### 步骤 2：启动代理

```bash
litellm --config config.yaml --detailed_debug
```

### 步骤 3：发送不含敏感数据的请求（由云端模型处理）

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cloud-model",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "metadata": {"session_id": "abc-123"}
  }'
```

响应中的 `model` 字段显示的是云端模型。

### 步骤 4：发送含敏感数据的请求（重新路由到本地部署）

```bash showLineNumbers
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cloud-model",
    "messages": [{"role": "user", "content": "My SSN is 123-45-6789, summarize my record"}],
    "metadata": {"session_id": "abc-123"}
  }'
```

该请求由 `on-prem-model` 处理。由于 `sticky_session` 已开启且使用了同一个 `session_id`，`abc-123` 会话后续的每个请求也都会由本地部署处理，即使其中不含敏感数据。

## 配置

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------------|
| `on_premise_model` | string | required | 用于承接敏感请求的模型组（取自 `model_list`） |
| `prebuilt_patterns` | list[string] | none | 要匹配的内置模式名称（如 `us_ssn`、`credit_card`、`email`）。与 [LiteLLM 内容过滤](./litellm_content_filter) 使用同一套模式库 |
| `regex_patterns` | list[string] | none | 自定义正则表达式；任意一条消息命中即触发重新路由 |
| `keywords` | list[string] | none | 不区分大小写的关键词；任意一条消息命中即触发重新路由 |
| `sticky_session` | bool | `true` | 首次检测到敏感数据后，让整个会话保持在本地部署 |
| `session_ttl_seconds` | int | `14400` | 检测到敏感数据后，会话保持固定的时长 |

`prebuilt_patterns`、`regex_patterns`、`keywords` 三者至少需要配置一个。

## 会话粘性

首次检测到敏感数据后，粘性机制就会把会话固定到本地部署模型。会话通过请求中的 `litellm_session_id`、`metadata.session_id` 或 `litellm_metadata.session_id` 来识别，因此客户端必须在各轮对话之间发送稳定的 ID，粘性才能生效。

如果代理配置了 Redis 缓存，固定状态会在所有代理 worker 与实例之间共享，因此粘性对整个部署生效，而不只限于单个 worker。

如果没有发送会话 ID，每一轮仍会被独立评估，因此本身包含敏感数据的轮次依然会路由到本地部署；但没有会话 ID 的轮次不会在整个对话范围内被固定。
