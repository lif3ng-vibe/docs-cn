import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Meta Llama

| 属性 | 详情 |
|-------|-------|
| 描述 | Meta 的 Llama API 提供对 Meta 系列大语言模型的访问。 |
| LiteLLM 提供商路由 | `meta_llama/` |
| 支持的端点 | `/chat/completions`, `/completions`, `/responses` |
| API 参考 | [Llama API 参考 ↗](https://llama.developer.meta.com?utm_source=partner-litellm&utm_medium=website) |

## 必需变量

```python showLineNumbers title="环境变量"
os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key
```

## 支持的模型

:::info
此处列出的所有模型 https://llama.developer.meta.com/docs/models/ 均受支持。模型列表、Token 窗口等信息由我们持续维护，见[这里](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)。

:::


| 模型 ID | 输入上下文长度 | 输出上下文长度 | 输入模态 | 输出模态 |
| --- | --- | --- | --- | --- |
| `Llama-4-Scout-17B-16E-Instruct-FP8` | 128k | 4028 | 文本、图像 | 文本 |
| `Llama-4-Maverick-17B-128E-Instruct-FP8` | 128k | 4028 | 文本、图像 | 文本 |
| `Llama-3.3-70B-Instruct` | 128k | 4028 | 文本 | 文本 |
| `Llama-3.3-8B-Instruct` | 128k | 4028 | 文本 | 文本 |

## 用法：LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Meta Llama 非流式补全"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Meta Llama call
response = completion(model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8", messages=messages)
```

### 流式

```python showLineNumbers title="Meta Llama 流式补全"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Meta Llama call with streaming
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 函数调用

```python showLineNumbers title="Meta Llama 函数调用"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "What's the weather like in San Francisco?", "role": "user"}]

# Define the function
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

# Meta Llama call with function calling
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

### 工具调用

```python showLineNumbers title="Meta Llama 工具调用"
import os
import litellm
from litellm import completion

os.environ["LLAMA_API_KEY"] = ""  # your Meta Llama API key

messages = [{"content": "Create a chart showing the population growth of New York City from 2010 to 2020", "role": "user"}]

# Define the tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "create_chart",
            "description": "Create a chart with the provided data",
            "parameters": {
                "type": "object",
                "properties": {
                    "chart_type": {
                        "type": "string",
                        "enum": ["bar", "line", "pie", "scatter"],
                        "description": "The type of chart to create"
                    },
                    "title": {
                        "type": "string",
                        "description": "The title of the chart"
                    },
                    "data": {
                        "type": "object",
                        "description": "The data to plot in the chart"
                    }
                },
                "required": ["chart_type", "title", "data"]
            }
        }
    }
]

# Meta Llama call with tool use
response = completion(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.content)
```

## 用法：LiteLLM Proxy


在 LiteLLM Proxy 配置文件中加入以下内容：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: meta_llama/Llama-3.3-70B-Instruct
    litellm_params:
      model: meta_llama/Llama-3.3-70B-Instruct
      api_key: os.environ/LLAMA_API_KEY

  - model_name: meta_llama/Llama-3.3-8B-Instruct
    litellm_params:
      model: meta_llama/Llama-3.3-8B-Instruct
      api_key: os.environ/LLAMA_API_KEY
```

启动 LiteLLM Proxy 服务器：

```bash showLineNumbers title="启动 LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Meta Llama 经代理调用：非流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=[{"role": "user", "content": "Write a short poem about AI."}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Meta Llama 经代理调用：流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="meta_llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Meta Llama 经代理调用：LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/meta_llama/Llama-3.3-70B-Instruct",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Meta Llama 经代理调用：LiteLLM SDK 流式"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/meta_llama/Llama-3.3-70B-Instruct",
    messages=[{"role": "user", "content": "Write a short poem about AI."}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key",
    stream=True
)

for chunk in response:
    if hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Meta Llama 经代理调用：cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "meta_llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Write a short poem about AI."}]
  }'
```

```bash showLineNumbers title="Meta Llama 经代理调用：cURL 流式"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "meta_llama/Llama-3.3-70B-Instruct",
    "messages": [{"role": "user", "content": "Write a short poem about AI."}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

想深入了解 LiteLLM Proxy 的用法，请参阅 [LiteLLM Proxy 文档](../providers/litellm_proxy)。
