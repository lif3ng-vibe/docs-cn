# Nadir

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Nadir 是一个智能 LLM 路由器。它只提供一个虚拟模型 `auto`，由服务端按复杂度分类，并路由到满足质量门槛的最便宜模型。 |
| LiteLLM 提供商路由 | `nadir/` |
| 提供商文档链接 | [Nadir 文档 ↗](https://getnadir.com/docs) |
| Base URL | `https://api.getnadir.com/v1` |
| 支持的操作 | `/chat/completions` |

<br />

Nadir 采用 OpenAI 的 `/v1/chat/completions` 方言，因此无需对请求做任何转换。

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["NADIR_API_KEY"] = ""  # your Nadir API key
```

## 可选变量

```python showLineNumbers title="Environment Variables"
os.environ["NADIR_API_BASE"] = ""  # defaults to https://api.getnadir.com/v1
```

## LiteLLM Python SDK 用法

### 非流式

```python showLineNumbers title="Nadir Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NADIR_API_KEY"] = "your-api-key"

response = completion(
    model="nadir/auto",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
)
print(response)
```

### 流式

```python showLineNumbers title="Nadir Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NADIR_API_KEY"] = "your-api-key"

response = completion(
    model="nadir/auto",
    messages=[{"content": "Hello, how are you?", "role": "user"}],
    stream=True,
)
for chunk in response:
    print(chunk)
```

## LiteLLM 代理用法

将以下内容添加到 LiteLLM 代理配置文件中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: nadir-auto
    litellm_params:
      model: nadir/auto
      api_key: os.environ/NADIR_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml
```

```bash showLineNumbers title="Nadir via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "nadir-auto",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

## 模型

Nadir 只提供一个虚拟模型。发送 `nadir/auto` 后，路由器会为每次请求挑选底层模型。

| 模型名称 | 函数调用 |
|------------|---------------|
| auto | `completion(model="nadir/auto", messages=messages)` |

## 成本追踪

响应中的 `model` 字段会标明 Nadir 实际路由到的模型。非流式调用时，Nadir 会返回它自己算出的成本，LiteLLM 将其记录为响应成本，因此 SDK 的 `response_cost`、代理的 `x-litellm-response-cost` 响应头以及花费日志里用的都是 Nadir 给出的数字：

```python
print(f"Request cost: ${response._hidden_params['response_cost']}")
```

流式响应不携带 Nadir 的成本数据。LiteLLM 会按被路由模型在 LiteLLM 模型成本表（model cost map）中的条目计价，例如 `openrouter/anthropic/claude-haiku-4.5`；如果被路由的模型在成本表中没有条目，流式调用就会按 $0 记录。

## 支持的 OpenAI 参数

Nadir 会按自己的 schema 校验请求，并丢弃超出范围的内容，因此 LiteLLM 只声明该端点真正支持的参数：

`frequency_penalty`, `max_tokens`, `presence_penalty`, `response_format`,
`stream`, `temperature`, `top_p`

`extra_headers` 和 `max_retries` 由 LiteLLM 传输层处理，不会随请求体发送。传入其他任何参数都会抛出 `litellm.UnsupportedParamsError`，除非设置了 `drop_params=True`。

:::info

`tools`、`tool_choice` 和 `functions` 均**不支持**。函数调用（function calling）目前不在 Nadir 的请求 schema 之内。

:::
