import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Crusoe

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Crusoe Cloud 为开源大语言模型提供 GPU 加速推理，针对性能与成本效率做了优化。 |
| LiteLLM 提供商路由 | `crusoe/` |
| 提供商文档链接 | [Crusoe 托管推理文档 ↗](https://docs.crusoecloud.com/managed-inference/overview/index.html) |
| Base URL | `https://managed-inference-api-proxy.crusoecloud.com/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/crusoe#用法---litellm-python-sdk) |

<br />
<br />

**支持全部 Crusoe 模型，发送补全（completion）请求时只需在模型名前加上 `crusoe/` 前缀**

## 可用模型

| 模型 | 说明 | 上下文窗口 |
|-------|-------------|----------------|
| `crusoe/deepseek-ai/DeepSeek-R1-0528` | DeepSeek R1 推理模型（2025 年 5 月） | 163,840 token |
| `crusoe/deepseek-ai/DeepSeek-V3-0324` | DeepSeek V3 对话模型（2025 年 3 月） | 163,840 token |
| `crusoe/google/gemma-3-12b-it` | Google Gemma 3 12B 指令微调版 | 131,072 token |
| `crusoe/meta-llama/Llama-3.3-70B-Instruct` | Llama 3.3 70B 指令微调版 | 131,072 token |
| `crusoe/moonshotai/Kimi-K2-Thinking` | Kimi K2 扩展思考模型 | 262,144 token |
| `crusoe/openai/gpt-oss-120b` | OpenAI 120B 开源模型 | 131,072 token |
| `crusoe/Qwen/Qwen3-235B-A22B-Instruct-2507` | Qwen3 235B MoE 指令微调版 | 262,144 token |

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["CRUSOE_API_KEY"] = ""  # your Crusoe API key
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Crusoe Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CRUSOE_API_KEY"] = ""  # your Crusoe API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Crusoe call
response = completion(
    model="crusoe/meta-llama/Llama-3.3-70B-Instruct",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Crusoe Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["CRUSOE_API_KEY"] = ""  # your Crusoe API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# Crusoe call with streaming
response = completion(
    model="crusoe/meta-llama/Llama-3.3-70B-Instruct",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 函数调用

```python showLineNumbers title="Crusoe Function Calling"
import os
import litellm
from litellm import completion

os.environ["CRUSOE_API_KEY"] = ""  # your Crusoe API key

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

response = completion(
    model="crusoe/meta-llama/Llama-3.3-70B-Instruct",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: llama-3.3-70b
    litellm_params:
      model: crusoe/meta-llama/Llama-3.3-70B-Instruct
      api_key: os.environ/CRUSOE_API_KEY
  - model_name: deepseek-r1
    litellm_params:
      model: crusoe/deepseek-ai/DeepSeek-R1-0528
      api_key: os.environ/CRUSOE_API_KEY
  - model_name: deepseek-v3
    litellm_params:
      model: crusoe/deepseek-ai/DeepSeek-V3-0324
      api_key: os.environ/CRUSOE_API_KEY
  - model_name: qwen3-235b
    litellm_params:
      model: crusoe/Qwen/Qwen3-235B-A22B-Instruct-2507
      api_key: os.environ/CRUSOE_API_KEY
  - model_name: kimi-k2
    litellm_params:
      model: crusoe/moonshotai/Kimi-K2-Thinking
      api_key: os.environ/CRUSOE_API_KEY
```

## 自定义 API Base

**方式 1：环境变量**

```python showLineNumbers title="Custom API Base via env var"
import os
from litellm import completion

os.environ["CRUSOE_API_BASE"] = "https://custom.crusoecloud.com/v1"
os.environ["CRUSOE_API_KEY"] = ""  # your API key

response = completion(
    model="crusoe/meta-llama/Llama-3.3-70B-Instruct",
    messages=[{"content": "Hello!", "role": "user"}],
)
```

**方式 2：直接传入**

```python showLineNumbers title="Custom API Base via parameter"
from litellm import completion

response = completion(
    model="crusoe/meta-llama/Llama-3.3-70B-Instruct",
    messages=[{"content": "Hello!", "role": "user"}],
    api_base="https://custom.crusoecloud.com/v1",
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
- `tools`
- `tool_choice`
- `response_format`
- `seed`
- `user`
- `logit_bias`
- `logprobs`
- `top_logprobs`
