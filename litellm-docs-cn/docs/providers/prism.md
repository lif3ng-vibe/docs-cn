import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prism

## 概述

| 属性 | 详情 |
|-------|-------|
| 描述 | Prism Inference 通过 OpenAI Chat Completions、OpenAI Responses 与 Anthropic Messages API 为编码智能体（coding agents）提供开放权重模型，对输入与输出均不保留任何数据。 |
| LiteLLM 提供商路由 | `prism/` |
| 提供商文档链接 | [Prism 文档 ↗](https://docs.prisminference.com) |
| 基础地址（Base URL） | `https://api.prisminference.com/v1` |
| 支持的操作 | [`/chat/completions`](#用法---litellm-python-sdk)、[`/responses`](#responses-api)、[`/messages`](#anthropic-messages-api) |

<br />
<br />

**我们支持全部 Prism 模型，发送请求时只需在模型名前加上 `prism/` 前缀**

## 可用模型

| 模型 | 描述 | 上下文窗口 | 最大输出 |
|-------|-------------|----------------|------------|
| `prism/deepseek-v4.1-flash` | DeepSeek-V4.1-Flash，当前一代面向编码、视觉、推理与工具调用循环的模型；接受文本和图像输入 | 1,000,000 tokens | 384,000 tokens |
| `prism/deepseek-v4-flash` | DeepSeek-V4-Flash，纯文本模型，适合快速编码与工具调用循环 | 1,000,000 tokens | 384,000 tokens |

两款模型都支持推理、函数调用（function calling）、JSON 模式和 JSON schema 输出，LiteLLM 也内置了它们的价格（输入、输出与缓存输入），开箱即可追踪花费。Prism 在 `GET https://api.prisminference.com/v1/models` 提供的模型目录还列出了更多模型（例如 `glm-5.3` 和 `kimi-k3`），它们都能配合 `prism/` 前缀使用；不过在这些模型进入 LiteLLM 模型成本表之前，若要追踪它们的花费，需要在 `litellm_params` 里传入 `input_cost_per_token` 和 `output_cost_per_token`。

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["PRISM_API_KEY"] = ""  # your Prism API key
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Prism Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Prism call
response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Prism Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# Prism call with streaming
response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 函数调用

```python showLineNumbers title="Prism Function Calling"
import os
import litellm
from litellm import completion

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city, e.g. San Francisco"
                }
            },
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in San Francisco?"}]

response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

### 结构化输出

```python showLineNumbers title="Prism JSON Schema Output"
import os
from litellm import completion

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=[{"role": "user", "content": "The city is San Francisco"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "city",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
                "additionalProperties": False,
            },
        },
    },
)

print(response)
```

### 视觉

`prism/deepseek-v4.1-flash` 支持图像输入。

```python showLineNumbers title="Prism Image Input"
import os
from litellm import completion

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What colour fills this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}},
        ],
    }],
)

print(response)
```

### Responses API

Prism 原生提供 OpenAI Responses API，因此 `litellm.responses` 会把请求直接发往 `https://api.prisminference.com/v1/responses`。

```python showLineNumbers title="Prism Responses API"
import os
import litellm

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

response = litellm.responses(
    model="prism/deepseek-v4.1-flash",
    input="Say hello",
)

print(response.output_text)
```

### Anthropic Messages API

Prism 同样原生提供 Anthropic Messages API，因此 `litellm.anthropic.messages.acreate` 会把请求直接发往 `https://api.prisminference.com/v1/messages`。

```python showLineNumbers title="Prism Anthropic Messages API"
import asyncio
import os
import litellm

os.environ["PRISM_API_KEY"] = ""  # your Prism API key

async def main():
    response = await litellm.anthropic.messages.acreate(
        model="prism/deepseek-v4.1-flash",
        messages=[{"role": "user", "content": "Say hello"}],
        max_tokens=64,
    )
    print(response["content"][0]["text"])

asyncio.run(main())
```

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: deepseek-v4.1-flash
    litellm_params:
      model: prism/deepseek-v4.1-flash
      api_key: os.environ/PRISM_API_KEY
  - model_name: deepseek-v4-flash
    litellm_params:
      model: prism/deepseek-v4-flash
      api_key: os.environ/PRISM_API_KEY
```

按这种方式配置的部署会在代理上同时提供三个端点：`/v1/chat/completions`、`/v1/responses` 和 `/v1/messages`。

<Tabs>
<TabItem value="chat" label="对话补全">

```bash showLineNumbers title="curl"
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

</TabItem>
<TabItem value="responses" label="Responses">

```bash showLineNumbers title="curl"
curl http://0.0.0.0:4000/v1/responses \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "input": "Hello, how are you?"
  }'
```

</TabItem>
<TabItem value="messages" label="Messages">

```bash showLineNumbers title="curl"
curl http://0.0.0.0:4000/v1/messages \
  -H "x-api-key: $LITELLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4.1-flash",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

</TabItem>
</Tabs>

## 自定义 API 地址

**方式 1：环境变量**

```python showLineNumbers title="Custom API Base via env var"
import os
from litellm import completion

os.environ["PRISM_API_BASE"] = "https://custom.prisminference.example/v1"
os.environ["PRISM_API_KEY"] = ""  # your API key

response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=[{"content": "Hello!", "role": "user"}],
)
```

**方式 2：直接传参**

```python showLineNumbers title="Custom API Base via parameter"
from litellm import completion

response = completion(
    model="prism/deepseek-v4.1-flash",
    messages=[{"content": "Hello!", "role": "user"}],
    api_base="https://custom.prisminference.example/v1",
    api_key="your-api-key",
)
```

## 支持的 OpenAI 参数

- `temperature`
- `max_tokens`
- `max_completion_tokens`
- `top_p`
- `frequency_penalty`
- `presence_penalty`
- `stop`
- `n`
- `stream`
- `stream_options`
- `tools`
- `tool_choice`
- `response_format`
- `seed`
- `logprobs`
- `top_logprobs`
