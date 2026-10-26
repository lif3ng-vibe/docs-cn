import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Token 计数

## 概述

LiteLLM 通过调用各提供商（provider）专属的 token 计数 API 来提供精确的 token 计数。你可以在发出请求前就拿到准确的 token 数量，方便估算成本和管理上下文窗口（context window）。

| 功能 | 说明 |
|---------|---------|
| SDK 方法 | `litellm.acount_tokens()` |
| 代理端点 | `/v1/messages/count_tokens`（Anthropic 格式）、`/v1/responses/input_tokens`（OpenAI 格式） |
| 回退（fallback） | 对不支持的提供商改用本地 tiktoken 计数 |

## 支持的提供商

| 提供商 | Token 计数 API | 格式 |
|----------|-------------------|--------|
| OpenAI | [Responses API `/input_tokens`](https://platform.openai.com/docs/api-reference/responses/input-tokens) | OpenAI Responses |
| Anthropic | [Messages `/count_tokens`](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) | Anthropic Messages |
| Vertex AI (Claude) | Vertex AI Partner Models Token Counter | Anthropic Messages |
| Bedrock (Claude) | AWS Bedrock CountTokens API；若其拒绝某个 Claude 模型，则改用 bedrock-mantle（参见 [Bedrock Claude 模型](#bedrock-claude-模型)） | Anthropic Messages |
| Gemini | Google AI Studio countTokens API | Anthropic Messages |
| Vertex AI (Gemini) | Vertex AI countTokens API | Anthropic Messages |
| 其他提供商 | 本地 tiktoken 回退 | N/A |

## SDK 用法

### 基本用法

```python
import asyncio
import litellm

async def main():
    # OpenAI
    result = await litellm.acount_tokens(
        model="openai/{{openai_large}}",
        messages=[{"role": "user", "content": "Hello, how are you?"}],
    )
    print(f"Token count: {result.total_tokens}")
    print(f"Tokenizer: {result.tokenizer_type}")  # "openai_api"

    # Anthropic
    result = await litellm.acount_tokens(
        model="anthropic/{{anthropic}}",
        messages=[{"role": "user", "content": "Hello, how are you?"}],
    )
    print(f"Token count: {result.total_tokens}")
    print(f"Tokenizer: {result.tokenizer_type}")  # "anthropic_api"

asyncio.run(main())
```

### 含工具与系统消息

```python
import asyncio
import litellm

async def main():
    result = await litellm.acount_tokens(
        model="openai/{{openai_large}}",
        messages=[{"role": "user", "content": "What's the weather in Paris?"}],
        tools=[{
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather for a city",
                "parameters": {
                    "type": "object",
                    "properties": {"city": {"type": "string"}},
                },
            },
        }],
        system="You are a helpful weather assistant.",
    )
    print(f"Token count (with tools): {result.total_tokens}")

asyncio.run(main())
```

### 响应格式

`litellm.acount_tokens()` 返回 `TokenCountResponse`：

```python
TokenCountResponse(
    total_tokens=15,           # Token count
    request_model="openai/{{openai_large}}",  # Model requested
    model_used="{{openai_large}}",      # Model used for counting
    tokenizer_type="openai_api",    # "openai_api", "anthropic_api", "bedrock_api", "bedrock_mantle_api", "local_tokenizer"
    original_response={"input_tokens": 15},  # Raw API response
    error=False,               # True if counting failed
    error_message=None,        # Error details if failed
)
```

### 回退行为

如果提供商不支持 token 计数 API，或者缺少 API 密钥，`acount_tokens()` 会自动回退到基于本地 tiktoken 的计数：

```python
# Unsupported provider → automatic fallback
result = await litellm.acount_tokens(
    model="together_ai/meta-llama/Llama-3-8b-chat-hf",
    messages=[{"role": "user", "content": "Hello"}],
)
print(result.tokenizer_type)  # "local_tokenizer"
```

在代理（proxy）侧，本地计数运行在 worker 线程中，因此处理大负载不会阻塞其他请求。每个 worker 进程同一时间最多对 `TOKEN_COUNTER_MAX_CONCURRENT_COUNTS` 个负载计数（默认 4），其余进入队列，从而限制了一批大计数请求可能占用的内存。长度超过 `TOKEN_COUNTER_MAX_EXACT_CHARS` 个字符（默认 4,000,000，约合 100 万 token）的字符串改为估算：对均匀分布的 16 个样本分词（这些样本合计覆盖相同数量的字符），再按字符串长度等比放大结果，让最大负载的开销保持在有界范围。

### Bedrock Claude 模型

bedrock-runtime 的 CountTokens API 会以 400 拒绝部分 Claude 模型（撰写本文时包括 Claude Opus 4.8、5 和 5.5）。对被它拒绝的 Claude 模型，LiteLLM 会把同样的请求体发给 bedrock-mantle（`https://bedrock-mantle.<region>.api.aws/anthropic/v1/messages/count_tokens`），使用该部署的 AWS 凭证签名，并报告 `tokenizer_type: "bedrock_mantle_api"`。bedrock-runtime 能直接计数的模型不会走到 Mantle，保持 `tokenizer_type: "bedrock_api"`。

凭证除了 `bedrock:CountTokens`，还需要 IAM 操作 `bedrock-mantle:CountTokens`。缺少该权限时 Mantle 会返回 403，计数回退到本地分词器，两处错误都会出现在代理日志里。Bedrock API 密钥（`AWS_BEARER_TOKEN_BEDROCK`）会作为 bearer token 发送给 Mantle，因此同样受这条策略约束。

设置 `BEDROCK_MANTLE_API_BASE` 可以把 Mantle 调用指向另一台主机，例如 VPC 端点。部署级配置 `api_base` 和 `aws_bedrock_runtime_endpoint` 只对 bedrock-runtime 生效。该区域内 Mantle 不提供服务的 Claude 模型，以及一切非 Claude 模型，都保持本地回退。

## 代理用法

### OpenAI 格式：`/v1/responses/input_tokens`

<Tabs>
<TabItem value="curl" label="curl">

```bash
curl -X POST "http://localhost:4000/v1/responses/input_tokens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "input": "Hello, how are you?"
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python
import httpx

response = httpx.post(
    "http://localhost:4000/v1/responses/input_tokens",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-<your-litellm-api-key>"
    },
    json={
        "model": "{{openai_large}}",
        "input": "Hello, how are you?"
    }
)

print(response.json())
# {"object": "response.input_tokens", "input_tokens": 13}
```

</TabItem>
</Tabs>

**响应**：
```json
{"object": "response.input_tokens", "input_tokens": 13}
```

### Anthropic 格式：`/v1/messages/count_tokens`

完整文档参见 [Anthropic Token 计数](./anthropic_count_tokens.md)。

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

## 代理配置

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: {{anthropic}}
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
```
