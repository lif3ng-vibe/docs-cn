import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Inception

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Inception 提供 Mercury 系列扩散式 LLM（dLLM）。其 API 与 OpenAI 兼容。 |
| LiteLLM 中的提供商路由 | `inception/`（对话补全）、`text-completion-inception/`（中间填充） |
| 提供商官方文档 | [Inception 平台文档 ↗](https://docs.inceptionlabs.ai/) |
| Base URL | `https://api.inceptionlabs.ai/v1` |
| 支持的操作 | [`/chat/completions`](#用法---litellm-python-sdk)、[`/fim/completions`](#中间填充fim) |

<br />
<br />

## 可用模型

| 模型 | 说明 | 上下文窗口 |
|-------|-------------|----------------|
| `inception/mercury-2` | 高速推理对话模型，支持工具调用与结构化输出 | 128,000 tokens |
| `text-completion-inception/mercury-edit-2` | 面向中间填充（FIM）自动补全的代码模型 | 32,000 tokens |

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key
```

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Inception Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Inception call
response = completion(
    model="inception/mercury-2",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Inception Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key

messages = [{"content": "Write a short story about AI", "role": "user"}]

# Inception call with streaming
response = completion(
    model="inception/mercury-2",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 推理力度与推理摘要

Mercury 提供了 `reasoning_effort` 控制，除标准的 `low`、`medium`、`high` 之外，还包含 Inception 特有的 `instant` 取值，用于获得接近实时的响应。设置 `reasoning_summary=True` 后，响应中会附带模型推理过程的摘要。

```python showLineNumbers title="Inception Reasoning"
import os
from litellm import completion

os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key

response = completion(
    model="inception/mercury-2",
    messages=[{"role": "user", "content": "If a bat and ball cost $1.10 and the bat is $1 more than the ball, how much is the ball?"}],
    reasoning_effort="high",
    reasoning_summary=True,
)

print(response.choices[0].message.content)
print(response.reasoning_summary)  # {"content": "...", "status": "complete"}
```

### 函数调用

```python showLineNumbers title="Inception Function Calling"
import os
from litellm import completion

os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key

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
    model="inception/mercury-2",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response)
```

### 中间填充（FIM）

`mercury-edit-2` 通过 Inception 的 `/v1/fim/completions` 端点提供代码自动补全。使用 `text_completion` 并走 `text-completion-inception/` 路由，传入 `prompt`（前缀）和可选的 `suffix`（后缀）。

```python showLineNumbers title="Inception FIM"
import os
from litellm import text_completion

os.environ["INCEPTION_API_KEY"] = ""  # your Inception API key

response = text_completion(
    model="text-completion-inception/mercury-edit-2",
    prompt="def add(a, b):\n    return ",
    suffix="\n",
    max_tokens=64,
)

print(response.choices[0].text)
```

## 用法 - LiteLLM 代理服务器

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: mercury-2
    litellm_params:
      model: inception/mercury-2
      api_key: os.environ/INCEPTION_API_KEY
  - model_name: mercury-edit-2
    litellm_params:
      model: text-completion-inception/mercury-edit-2
      api_key: os.environ/INCEPTION_API_KEY
```

## 支持的 OpenAI 参数

- `max_tokens`
- `max_completion_tokens`
- `temperature`
- `stop`
- `tools`
- `tool_choice`
- `stream`
- `stream_options`
- `response_format`

## Inception 专属参数

以下参数会透传给 Inception 对话 API：

- `reasoning_effort` (`instant` | `low` | `medium` | `high`)
- `reasoning_summary`（bool）：返回模型推理过程的摘要
- `reasoning_summary_wait`（bool）：等待摘要生成完成后再返回
- `diffusing`（bool）：流式输出中间去噪步骤
- `realtime`（bool）：针对最低延迟进行优化
