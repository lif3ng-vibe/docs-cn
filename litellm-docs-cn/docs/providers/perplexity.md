import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Perplexity AI (pplx-api)
https://www.perplexity.ai

## API 密钥
```python
# env variable
os.environ['PERPLEXITYAI_API_KEY']
```

## 使用示例
```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-pro", 
    messages=messages
)
print(response)
```

## 使用示例：流式
```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-pro", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 推理力度

需要 v1.72.6 及以上版本。

:::info

LiteLLM 推理功能的完整指南见[这里](../reasoning_content)。

:::

通过设置 `reasoning_effort` 参数即可控制推理力度（reasoning effort）。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import completion
import os

os.environ['PERPLEXITYAI_API_KEY'] = ""
response = completion(
    model="perplexity/sonar-reasoning", 
    messages=messages,
    reasoning_effort="high"
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: perplexity-sonar-reasoning-model
    litellm_params:
        model: perplexity/sonar-reasoning
        api_key: os.environ/PERPLEXITYAI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

请把 `anything` 替换成你的 LiteLLM 代理虚拟密钥（virtual key），[配置方法](../proxy/virtual_keys)见这里。

```bash
curl http://0.0.0.0:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "perplexity-sonar-reasoning-model",
    "messages": [{"role": "user", "content": "Who won the World Cup in 2022?"}],
    "reasoning_effort": "high"
  }'
```

</TabItem>
</Tabs>

## 支持的模型
此处列出的所有模型 https://docs.perplexity.ai/docs/model-cards 均已支持，只需设置 `model=perplexity/<model-name>` 即可调用。

| 模型名称 | 调用方式 |
|---|---|
| sonar-deep-research | `completion(model="perplexity/sonar-deep-research", messages)` |
| sonar-reasoning-pro | `completion(model="perplexity/sonar-reasoning-pro", messages)` |
| sonar-reasoning | `completion(model="perplexity/sonar-reasoning", messages)` |
| sonar-pro | `completion(model="perplexity/sonar-pro", messages)` |
| sonar | `completion(model="perplexity/sonar", messages)` |
| r1-1776 | `completion(model="perplexity/r1-1776", messages)` |





## Agent API（Responses API）

需要 v1.72.6 及以上版本。


### 使用预设

预设（preset）针对特定使用场景提供了调优后的默认配置。想快速上手，可以先从预设开始：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

# Using the pro-search preset
response = responses(
    model="perplexity/preset/pro-search",
    input="What are the latest developments in AI?",
    custom_llm_provider="perplexity",
)

print(response.output)
```

</TabItem>
<TabItem value="proxy" label="代理">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: perplexity-pro-search
    litellm_params:
        model: perplexity/preset/pro-search
        api_key: os.environ/PERPLEXITY_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer anything" \
  -d '{
    "model": "perplexity-pro-search",
    "input": "What are the latest developments in AI?"
  }'
```

</TabItem>
</Tabs>

### 使用第三方模型

通过 Perplexity 的统一 API，即可访问 OpenAI、Anthropic、Google、xAI 等提供商的模型：

<Tabs>
<TabItem value="openai" label="OpenAI">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="Explain quantum computing in simple terms",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="anthropic" label="Anthropic">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/anthropic/{{anthropic}}",
    input="Write a short story about a robot learning to paint",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="google" label="Google">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/google/{{gemini_flash}}",
    input="Explain the concept of neural networks",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
<TabItem value="xai" label="xAI">

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/xai/grok-4-1-fast-non-reasoning",
    input="What makes a good AI assistant?",
    custom_llm_provider="perplexity",
    max_output_tokens=500,
)

print(response.output)
```

</TabItem>
</Tabs>

### 联网搜索工具

开启联网搜索能力，即可获取实时信息：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="What's the weather in San Francisco today?",
    custom_llm_provider="perplexity",
    tools=[{"type": "web_search"}],
    instructions="You have access to a web_search tool. Use it for questions about current events.",
)

print(response.output)
```

### 函数调用

Agent API 支持自定义函数工具，传入的函数工具会原样透传：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="What's the weather in San Francisco?",
    custom_llm_provider="perplexity",
    tools=[
        {"type": "web_search"},
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                },
            },
        },
    ],
    instructions="Use tools when appropriate.",
)

print(response.output)
```

### 结构化输出

通过 `text` 参数请求 JSON schema 结构化输出：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/preset/pro-search",
    input="Extract key facts about the Eiffel Tower",
    custom_llm_provider="perplexity",
    text={
        "format": {
            "type": "json_schema",
            "name": "facts",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "height_meters": {"type": "number"},
                    "year_built": {"type": "integer"},
                },
                "required": ["name", "height_meters", "year_built"],
            },
            "strict": True,
        }
    },
)

print(response.output)
```


### 推理力度（Responses API）

为具备推理能力的模型控制推理力度档位：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="Solve this complex problem step by step",
    custom_llm_provider="perplexity",
    reasoning={"effort": "high"},  # Options: low, medium, high
    max_output_tokens=1000,
)

print(response.output)
```

### 多轮对话

使用消息数组进行带上下文的多轮对话：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/anthropic/{{anthropic}}",
    input=[
        {"type": "message", "role": "system", "content": "You are a helpful assistant."},
        {"type": "message", "role": "user", "content": "What are the latest AI developments?"},
    ],
    custom_llm_provider="perplexity",
    instructions="Provide detailed, well-researched answers.",
    max_output_tokens=800,
)

print(response.output)
```

### 流式响应

以流式方式获取响应，实现实时输出：

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="Tell me a story about space exploration",
    custom_llm_provider="perplexity",
    stream=True,
    max_output_tokens=500,
)

for chunk in response:
    if hasattr(chunk, 'type'):
        if chunk.type == "response.output_text.delta":
            print(chunk.delta, end="", flush=True)
```

### 支持的第三方模型

| 提供商 | 模型名称 | 调用方式 |
|---|---|---|
| OpenAI | gpt-5.2 | `responses(model="perplexity/openai/gpt-5.2", ...)` |
| OpenAI | gpt-5.1 | `responses(model="perplexity/openai/gpt-5.1", ...)` |
| OpenAI | gpt-5-mini | `responses(model="perplexity/openai/gpt-5-mini", ...)` |
| Anthropic | claude-opus-4-6 | `responses(model="perplexity/anthropic/claude-opus-4-6", ...)` |
| Anthropic | claude-opus-4-5 | `responses(model="perplexity/anthropic/claude-opus-4-5", ...)` |
| Anthropic | claude-sonnet-4-5 | `responses(model="perplexity/anthropic/claude-sonnet-4-5", ...)` |
| Anthropic | claude-haiku-4-5 | `responses(model="perplexity/anthropic/claude-haiku-4-5", ...)` |
| Google | gemini-3-pro-preview | `responses(model="perplexity/google/gemini-3-pro-preview", ...)` |
| Google | gemini-3-flash-preview | `responses(model="perplexity/google/gemini-3-flash-preview", ...)` |
| Google | gemini-2.5-pro | `responses(model="perplexity/google/gemini-2.5-pro", ...)` |
| Google | gemini-2.5-flash | `responses(model="perplexity/google/gemini-2.5-flash", ...)` |
| xAI | grok-4-1-fast-non-reasoning | `responses(model="perplexity/xai/grok-4-1-fast-non-reasoning", ...)` |
| Perplexity | sonar | `responses(model="perplexity/perplexity/sonar", ...)` |

### 可用预设

| 预设名称 | 调用方式 |
|---|---|
| fast-search | `responses(model="perplexity/preset/fast-search", ...)` |
| pro-search | `responses(model="perplexity/preset/pro-search", ...)` |
| deep-research | `responses(model="perplexity/preset/deep-research", ...)` |
| advanced-deep-research | `responses(model="perplexity/preset/advanced-deep-research", ...)` |

### 完整示例

```python
from litellm import responses
import os

os.environ['PERPLEXITY_API_KEY'] = ""

# Comprehensive example with multiple features
response = responses(
    model="perplexity/openai/{{openai_large}}",
    input="Research the latest developments in quantum computing and provide sources",
    custom_llm_provider="perplexity",
    tools=[
        {"type": "web_search"},
        {"type": "fetch_url"}
    ],
    instructions="Use web_search to find relevant information and fetch_url to retrieve detailed content from sources. Provide citations for all claims.",
    max_output_tokens=1000,
    temperature=0.7,
)

print(f"Response ID: {response.id}")
print(f"Model: {response.model}")
print(f"Status: {response.status}")
print(f"Output: {response.output}")
print(f"Usage: {response.usage}")
```

:::info

有关传入提供商特有参数的更多信息，请[前往这里](../completion/provider_specific_params.md)。
:::
