import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lambda AI

## 概览

| 属性 | 详情 |
|-------|-------|
| 简介 | Lambda AI 依托其云端 GPU 基础设施，提供对大量开源语言模型的访问，并针对大规模推理场景做了优化。 |
| LiteLLM 提供商路由 | `lambda_ai/` |
| 提供商文档链接 | [Lambda AI API 文档 ↗](https://docs.lambda.ai/api) |
| 基础 URL | `https://api.lambda.ai/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/lambda_ai#用法---litellm-python-sdk) |

<br />
<br />

https://docs.lambda.ai/api

**我们支持所有 Lambda AI 模型，只需在发送补全（completion）请求时加上 `lambda_ai/` 前缀即可**

## 可用模型

Lambda AI 提供了多种前沿开源模型可供选择：

### 大语言模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/llama3.3-70b-instruct-fp8` | 采用 FP8 量化的 Llama 3.3 70B | 8,192 tokens |
| `lambda_ai/llama3.1-405b-instruct-fp8` | 采用 FP8 量化的 Llama 3.1 405B | 8,192 tokens |
| `lambda_ai/llama3.1-70b-instruct-fp8` | 采用 FP8 量化的 Llama 3.1 70B | 8,192 tokens |
| `lambda_ai/llama3.1-8b-instruct` | 经指令微调的 Llama 3.1 8B | 8,192 tokens |
| `lambda_ai/llama3.1-nemotron-70b-instruct-fp8` | Llama 3.1 Nemotron 70B | 8,192 tokens |

### DeepSeek 模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/deepseek-llama3.3-70b` | DeepSeek Llama 3.3 70B | 8,192 tokens |
| `lambda_ai/deepseek-r1-0528` | DeepSeek R1 0528 | 8,192 tokens |
| `lambda_ai/deepseek-r1-671b` | DeepSeek R1 671B | 8,192 tokens |
| `lambda_ai/deepseek-v3-0324` | DeepSeek V3 0324 | 8,192 tokens |

### Hermes 模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/hermes3-405b` | Hermes 3 405B | 8,192 tokens |
| `lambda_ai/hermes3-70b` | Hermes 3 70B | 8,192 tokens |
| `lambda_ai/hermes3-8b` | Hermes 3 8B | 8,192 tokens |

### 编程模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/qwen25-coder-32b-instruct` | Qwen 2.5 Coder 32B | 8,192 tokens |
| `lambda_ai/qwen3-32b-fp8` | 采用 FP8 的 Qwen 3 32B | 8,192 tokens |

### 视觉模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/llama3.2-11b-vision-instruct` | 具备视觉能力的 Llama 3.2 11B | 8,192 tokens |

### 专项模型

| 模型 | 描述 | 上下文窗口 |
|-------|-------------|----------------|
| `lambda_ai/llama-4-maverick-17b-128e-instruct-fp8` | 提供 128k 上下文的 Llama 4 Maverick | 131,072 tokens |
| `lambda_ai/llama-4-scout-17b-16e-instruct` | 提供 16k 上下文的 Llama 4 Scout | 16,384 tokens |
| `lambda_ai/lfm-40b` | LFM 40B 模型 | 8,192 tokens |
| `lambda_ai/lfm-7b` | LFM 7B 模型 | 8,192 tokens |

## 必需变量

```python showLineNumbers title="环境变量"
os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Lambda AI 非流式补全"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Lambda AI call
response = completion(
    model="lambda_ai/llama3.1-8b-instruct", 
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Lambda AI 流式补全"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# Lambda AI call with streaming
response = completion(
    model="lambda_ai/llama3.1-70b-instruct-fp8", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 视觉/多模态支持

Llama 3.2 Vision 模型支持图像输入：

```python showLineNumbers title="Lambda AI 视觉/多模态"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

messages = [{
    "role": "user",
    "content": [
        {
            "type": "text",
            "text": "What's in this image?"
        },
        {
            "type": "image_url",
            "image_url": {
                "url": "https://example.com/image.jpg"
            }
        }
    ]
}]

# Lambda AI vision model call
response = completion(
    model="lambda_ai/llama3.2-11b-vision-instruct",
    messages=messages
)

print(response)
```

### 函数调用

Lambda AI 模型支持函数调用（function calling）：

```python showLineNumbers title="Lambda AI 函数调用"
import os
import litellm
from litellm import completion

os.environ["LAMBDA_API_KEY"] = ""  # your Lambda AI API key

# Define tools
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current weather in a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Boston?"}]

# Lambda AI call with function calling
response = completion(
    model="lambda_ai/hermes3-70b",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-8b
    litellm_params:
      model: lambda_ai/llama3.1-8b-instruct
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: deepseek-70b
    litellm_params:
      model: lambda_ai/deepseek-llama3.3-70b
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: hermes-405b
    litellm_params:
      model: lambda_ai/hermes3-405b
      api_key: os.environ/LAMBDA_API_KEY
  - model_name: qwen-coder
    litellm_params:
      model: lambda_ai/qwen25-coder-32b-instruct
      api_key: os.environ/LAMBDA_API_KEY
```

## 自定义 API 基础地址

如果需要使用自定义的 API 基础地址（base URL）：

```python showLineNumbers title="自定义 API 基础地址"
import os
import litellm
from litellm import completion

# Using environment variable
os.environ["LAMBDA_API_BASE"] = "https://custom.lambda-api.com/v1"
os.environ["LAMBDA_API_KEY"] = ""  # your API key

# Or pass directly
response = completion(
    model="lambda_ai/llama3.1-8b-instruct",
    messages=[{"content": "Hello!", "role": "user"}],
    api_base="https://custom.lambda-api.com/v1",
    api_key="your-api-key"
)
```

## 支持的 OpenAI 参数

Lambda AI 完全兼容 OpenAI 接口，因此所有标准 OpenAI 参数均受支持：

- `temperature`
- `max_tokens`
- `top_p`
- `frequency_penalty`
- `presence_penalty`
- `stop`
- `n`
- `stream`
- `tools`
- `tool_choice`
- `response_format`
- `seed`
- `user`
- `logit_bias`

带参数的调用示例：

```python showLineNumbers title="Lambda AI 参数示例"
response = completion(
    model="lambda_ai/hermes3-405b",
    messages=[{"content": "Explain quantum computing", "role": "user"}],
    temperature=0.7,
    max_tokens=500,
    top_p=0.9,
    frequency_penalty=0.2,
    presence_penalty=0.1
)
```
