import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SCX.ai

## 概述

| 属性 | 详情 |
|-------|-------|
| 描述 | SCX.ai 是一个澳大利亚主权 AI 平台，托管于可再生能源驱动的基础设施之上，通过 OpenAI 兼容 API 提供开放模型服务。 |
| LiteLLM 提供商路由 | `scx-ai/` |
| 提供商文档链接 | [SCX.ai 文档 ↗](https://scx.ai) |
| Base URL | `https://api.scx.ai/v1` |
| 支持的操作 | [`/chat/completions`](#用法---litellm-python-sdk) |

<br />
<br />

**支持全部 SCX.ai 对话模型，发送补全（completion）请求时只需在模型名前加 `scx-ai/` 前缀**

## 可用模型

| 模型 | 描述 | 上下文窗口 | 最大输出 |
|-------|-------------|----------------|------------|
| `scx-ai/GLM-5.2` | Z.ai GLM-5.2，753B 稀疏 MoE（Mixture of Experts，混合专家）模型，面向长程智能体编码 | 1,048,576 tokens | 131,072 tokens |
| `scx-ai/Qwen3.8-Max` | 阿里巴巴 Qwen3.8 Max，2.4T 稀疏 MoE，接受文本和图像输入 | 1,000,000 tokens | 131,072 tokens |

两个模型均支持推理、函数调用、JSON 模式和 JSON schema 输出。`scx-ai/Qwen3.8-Max` 还额外支持图像输入。两者都会自动应用提示词缓存（prompt caching），缓存命中会计入 `usage.prompt_tokens_details.cached_tokens`，并按缓存输入的费率计费。

## 必需变量

```python showLineNumbers title="环境变量"
os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="SCX.ai 非流式补全"
import os
import litellm
from litellm import completion

os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# SCX.ai call
response = completion(
    model="scx-ai/GLM-5.2",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="SCX.ai 流式补全"
import os
import litellm
from litellm import completion

os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# SCX.ai call with streaming
response = completion(
    model="scx-ai/GLM-5.2",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 函数调用

```python showLineNumbers title="SCX.ai 函数调用"
import os
import litellm
from litellm import completion

os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key

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
                    "description": "The city, e.g. Sydney"
                }
            },
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Sydney?"}]

response = completion(
    model="scx-ai/GLM-5.2",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

### 结构化输出

```python showLineNumbers title="SCX.ai JSON Schema 输出"
import os
from litellm import completion

os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key

response = completion(
    model="scx-ai/GLM-5.2",
    messages=[{"role": "user", "content": "The city is Sydney"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "city",
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

`scx-ai/Qwen3.8-Max` 支持图像输入，图像的每一边至少需要 10 像素。

```python showLineNumbers title="SCX.ai 图像输入"
import os
from litellm import completion

os.environ["SCX_API_KEY"] = ""  # your SCX.ai API key

response = completion(
    model="scx-ai/Qwen3.8-Max",
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

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: glm-5.2
    litellm_params:
      model: scx-ai/GLM-5.2
      api_key: os.environ/SCX_API_KEY
  - model_name: qwen3.8-max
    litellm_params:
      model: scx-ai/Qwen3.8-Max
      api_key: os.environ/SCX_API_KEY
```

## 自定义 API 地址

**方式 1：环境变量**

```python showLineNumbers title="通过环境变量自定义 API 地址"
import os
from litellm import completion

os.environ["SCX_API_BASE"] = "https://custom.scx.ai/v1"
os.environ["SCX_API_KEY"] = ""  # your API key

response = completion(
    model="scx-ai/GLM-5.2",
    messages=[{"content": "Hello!", "role": "user"}],
)
```

**方式 2：直接传参**

```python showLineNumbers title="通过参数自定义 API 地址"
from litellm import completion

response = completion(
    model="scx-ai/GLM-5.2",
    messages=[{"content": "Hello!", "role": "user"}],
    api_base="https://custom.scx.ai/v1",
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
- `logit_bias`
- `logprobs`
- `top_logprobs`

`max_completion_tokens` 会以 `max_tokens` 的形式发送给上游。SCX.ai 接受 `[0.0, 2.0)` 范围内的 `temperature`，但不接受 `2.0` 本身，因此 LiteLLM 会把更高的取值钳制到 `1.99`。
