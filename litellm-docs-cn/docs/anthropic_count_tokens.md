import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /v1/messages/count_tokens

## 概览

兼容 Anthropic 的 Token 统计端点，在把消息发给模型之前预先统计其 Token 数。

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪（cost tracking） | ❌ | 仅统计 Token，不产生费用 |
| 日志（logging） | ✅ | 适用于所有集成方式 |
| 终端用户追踪 | ✅ | |
| 支持的提供商（provider） | Anthropic、Vertex AI (Claude)、Bedrock (Claude)、Gemini、Vertex AI | 自动路由到各提供商专用的 Token 统计 API |

## 快速上手

### 1. 启动 LiteLLM 代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

### 2. 统计 Token

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python
import httpx

response = httpx.post(
    "http://localhost:4000/v1/messages/count_tokens",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-<your-litellm-api-key>"
    },
    json={
        "model": "{{anthropic}}",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ]
    }
)

print(response.json())
# {"input_tokens": 14}
```

</TabItem>
</Tabs>

**预期响应**：

```json
{
  "input_tokens": 14
}
```

## LiteLLM 代理配置

在 `config.yaml` 中添加模型：

```yaml
model_list:
  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: claude-vertex
    litellm_params:
      model: vertex_ai/{{anthropic}}
      vertex_project: my-project
      vertex_location: us-east5
      vertex_count_tokens_location: us-east5 # Optional: Override location for token counting (count_tokens not available on global location)

  - model_name: claude-bedrock
    litellm_params:
      model: bedrock/us.anthropic.{{anthropic}}
      aws_region_name: us-west-2
```

## 请求参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | ✅ | 用于统计 Token 的模型 |
| `messages` | array | ✅ | Anthropic 格式的消息数组 |

### Messages 格式

```json
{
  "messages": [
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "How are you?"}
  ]
}
```

## 响应格式

```json
{
  "input_tokens": "<number>"
}
```

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `input_tokens` | integer | 输入消息中的 Token 数量 |

## 支持的提供商

`/v1/messages/count_tokens` 端点会自动路由到对应提供商专用的 Token 统计 API：

| 提供商 | Token 统计方式 |
|----------|----------------------|
| Anthropic | [Anthropic Token 统计 API](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) |
| OpenAI | [OpenAI Responses API `/input_tokens`](https://platform.openai.com/docs/api-reference/responses/input-tokens)，参见 [Token 统计](./count_tokens.md) |
| Vertex AI (Claude) | Vertex AI Partner Models Token Counter |
| Bedrock (Claude) | AWS Bedrock CountTokens API；被其拒绝的 Claude 模型则改走 bedrock-mantle，参见 [Bedrock Claude 模型](./count_tokens.md#bedrock-claude-模型) |
| Gemini | Google AI Studio countTokens API |
| Vertex AI (Gemini) | Vertex AI countTokens API |

## 示例

### 带系统提示词统计 Token

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "You are a helpful assistant. Please help me write a haiku about programming."}
    ]
  }'
```

### 多轮对话的 Token 统计

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{anthropic}}",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"},
      {"role": "assistant", "content": "The capital of France is Paris."},
      {"role": "user", "content": "What is its population?"}
    ]
  }'
```

### 在 Vertex AI Claude 上使用

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-vertex",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### 在 Bedrock Claude 上使用

```bash
curl -X POST "http://localhost:4000/v1/messages/count_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "claude-bedrock",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## 与 Anthropic 透传的对比

LiteLLM 提供两种统计 Token 的方式：

| 端点 | 说明 | 适用场景 |
|----------|-------------|----------|
| `/v1/messages/count_tokens` | LiteLLM 的 Anthropic 兼容端点 | 可用于所有支持的提供商（Anthropic、Vertex AI、Bedrock 等） |
| `/anthropic/v1/messages/count_tokens` | [透传至 Anthropic API](./pass_through/anthropic_completion.md#example-2-token-counting-api) | 携带原生请求头直接访问 Anthropic API |

### 透传示例

如需携带完整的原生请求头直接访问 Anthropic API：

```bash
curl --request POST \
    --url http://0.0.0.0:4000/anthropic/v1/messages/count_tokens \
    --header "x-api-key: $LITELLM_API_KEY" \
    --header "anthropic-version: 2023-06-01" \
    --header "anthropic-beta: token-counting-2024-11-01" \
    --header "content-type: application/json" \
    --data '{
        "model": "{{anthropic}}",
        "messages": [
            {"role": "user", "content": "Hello, world"}
        ]
    }'
```
