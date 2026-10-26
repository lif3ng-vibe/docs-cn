# 面向 OpenAI 兼容提供商的 /v1/messages 与 /v1/responses 原生透传

当部署对应的提供商原生不支持 Anthropic Messages 时，LiteLLM 会把每个 `/v1/messages` 请求翻译成该提供商自己的 API：`openai/` 部署走 OpenAI Responses API（参数映射见[此处](./messages_to_responses_mapping.md)），其余则走 `/v1/chat/completions`。这层翻译只保留目标 API 能表达的内容：`cache_control` 块会被丢弃，`thinking` 会映射为提供商自己的推理参数，其他 Anthropic 专有的请求细节只能近似转换或直接丢失。

许多 OpenAI 兼容服务器（自托管的 vLLM、推理平台、提供 Anthropic 兼容端点的模型厂商）本身也原生提供 Anthropic Messages API。对这类服务器，你可以让某个部署选择直接转发未翻译的 Anthropic 负载。该功能自 v1.92.0 起可用。

## 用 `supported_endpoints` 开启

在部署的 `model_info.supported_endpoints` 中加上 `/v1/messages`：

```yaml
model_list:
  - model_name: my-open-model
    litellm_params:
      model: openai/some-open-model
      api_base: https://inference.example.com/v1
      api_key: os.environ/EXAMPLE_API_KEY
    model_info:
      supported_endpoints: ["/v1/chat/completions", "/v1/messages"]
```

开启后，发到代理 `/v1/messages` 的请求会原样 POST 到 `{api_base}/v1/messages`，Anthropic 请求体保持不变，只有 `cache_control` 例外（见下文）。`api_base` 末尾的 `/v1` 会先被去掉，因此 `https://inference.example.com/v1` 和 `https://inference.example.com` 都会解析到 `https://inference.example.com/v1/messages`。除非请求已带有 `Authorization` 或 `x-api-key` 头，否则 LiteLLM 会发送 `Authorization: Bearer <api_key>`；`anthropic-version` 默认补为 `2023-06-01`；`anthropic-beta` 头会一并转发，调用方发来的和 LiteLLM 为上下文管理等功能自动添加的都会带上。流式传输与响应解析的处理方式和原生 Anthropic 部署完全相同。

不开启时，部署行为与之前一致，请求会被翻译。无论是否开启，发往同一部署的 `/v1/chat/completions` 调用都不受影响。

## `cache_control` 会精简为可移植的核心字段

严格实现 Messages API 的服务端会拒绝 Anthropic 专有的 `cache_control` 扩展（如 `ttl`），报出 `cache_control.ttl: 1h is not supported`；而开启 1 小时提示词缓存（prompt caching）后，Claude Code 这类客户端会在每个提示词块上带上 `{"type": "ephemeral", "ttl": "1h"}`。因此默认情况下，转发请求体里的每个 `cache_control` 都会精简为 `{"type": "ephemeral"}`，覆盖请求级别，以及 system 块、tools、消息内容块和 `tool_result` 内容。`tool_use.input` 和工具的 `input_schema` 这类应用数据永远不会被改动。

如果上游支持 `ttl`，可以在 `model_info` 中设置 `cache_control_ttl: true` 来保留它：

```yaml
model_list:
  - model_name: my-open-model
    litellm_params:
      model: openai/some-open-model
      api_base: https://inference.example.com/v1
      api_key: os.environ/EXAMPLE_API_KEY
    model_info:
      supported_endpoints: ["/v1/chat/completions", "/v1/messages"]
      cache_control_ttl: true
```

内置 Anthropic Messages 支持的提供商（`anthropic/`、`bedrock/`、`vertex_ai/` 等）对应的部署会照原样转发 `cache_control`，不受此影响。

在请求中带上一个 Anthropic 专有特性来验证：

```bash
curl http://0.0.0.0:4000/v1/messages \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "my-open-model",
    "max_tokens": 64,
    "system": [{"type": "text", "text": "You are concise", "cache_control": {"type": "ephemeral"}}],
    "messages": [{"role": "user", "content": "Say hi in three words"}]
  }'
```

响应会以提供商原生的 Anthropic 格式返回，包含其自身的 `usage` 字段，例如 `cache_creation_input_tokens` 和 `cache_read_input_tokens`。

这个开关只对 LiteLLM 本来会翻译的提供商有意义，例如 `openai/` 和 `custom_openai/` 部署。内置 Anthropic Messages 支持的提供商（`anthropic/`、`bedrock/`、`vertex_ai/` 等）本来就原生转发，会忽略该配置。

## 原生 `/v1/responses` 透传

`litellm_params.model` 带 `openai/` 前缀的部署，本来就原生把 `/v1/responses` 发到 `{api_base}/responses`。而 `custom_openai/` 这类通用 OpenAI 兼容部署没有自己的 Responses API 配置，所以默认情况下 LiteLLM 会把 `/v1/responses` 桥接到 `/v1/chat/completions`：把 input 转成 messages，再把对话补全结果转回 Responses 对象，Responses 专有的请求字段只能近似转换或丢弃。如果服务器自己提供 `/responses` 端点，就把 `/v1/responses` 加进 `model_info.supported_endpoints`，让请求原样转发。该功能自 v1.102.0 起可用。

```yaml
model_list:
  - model_name: my-open-model
    litellm_params:
      model: custom_openai/some-open-model
      api_base: https://inference.example.com/v1
      api_key: os.environ/EXAMPLE_API_KEY
    model_info:
      supported_endpoints: ["/v1/chat/completions", "/v1/responses"]
```

开启后，发到代理 `/v1/responses` 的请求会带上 `Authorization: Bearer <api_key>`，POST 到 `{api_base}/responses`（本例即 `https://inference.example.com/v1/responses`），流式与非流式请求一视同仁。`model_info` 中配置了 `mode: responses` 的部署行为相同。不开启时，部署继续通过 `/v1/chat/completions` 桥接，而发往该部署的 `/v1/chat/completions` 调用同样不受影响。`/v1/messages` 和 `/v1/responses` 两个开关相互独立：服务器两者都支持就都列上。

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model": "my-open-model", "input": "Say hi in three words"}'
```

### 无状态后端上的 `previous_response_id`

原生路径会把 `previous_response_id` 按原样转发给后端，由后端负责解析。不存储响应的 OpenAI 兼容服务器会拒绝该字段，通常返回 400，且这个错误会原封不动地返回给调用方。对这类后端，要么每轮都在 `input` 里带上完整的对话历史，要么不开这个开关，改走桥接路径并配置 `store_prompts_in_spend_logs: true`，让 LiteLLM 从自己的花费日志中解析 `previous_response_id`。

| 部署的 `model` | `/v1/messages`（开启后） | `/v1/messages`（不开启） | `/v1/responses`（开启后） | `/v1/responses`（不开启） |
|---|---|---|---|---|
| `openai/<model>` | 原生透传 | 经 Responses API 翻译 | 原生 | 原生 |
| `custom_openai/<model>` | 原生透传 | 经 `/v1/chat/completions` 翻译 | 原生透传 | 经 `/v1/chat/completions` 桥接 |

一些具名的 OpenAI 兼容提供商（例如 `hosted_vllm/`）自带 Responses API 支持，不开这个开关也会原生发送 `/v1/responses`。具体情况见各提供商的文档页。
