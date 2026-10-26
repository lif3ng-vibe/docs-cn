import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Hyperbolic

## 概述

| 属性 | 详情 |
|-------|-------|
| 描述 | Hyperbolic 让你以远低于传统云平台的成本访问最新模型，并通过 OpenAI 兼容 API 提供 LLM、图像生成等服务。 |
| LiteLLM 提供商路由 | `hyperbolic/` |
| 提供商文档链接 | [Hyperbolic 官方文档 ↗](https://docs.hyperbolic.xyz) |
| Base URL | `https://api.hyperbolic.xyz/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/hyperbolic#用法---litellm-python-sdk) |

<br />
<br />

https://docs.hyperbolic.xyz

**支持所有 Hyperbolic 模型，发送补全（completion）请求时只需在模型名前加上 `hyperbolic/` 前缀即可**

## 可用模型

### 语言模型

| 模型 | 描述 | 上下文窗口 | 每百万 Token 定价 |
|-------|-------------|----------------|----------------------|
| `hyperbolic/deepseek-ai/DeepSeek-V3` | DeepSeek V3，快速高效 | 131,072 tokens | $0.25 |
| `hyperbolic/deepseek-ai/DeepSeek-V3-0324` | DeepSeek V3 2024 年 3 月版本 | 131,072 tokens | $0.25 |
| `hyperbolic/deepseek-ai/DeepSeek-R1` | DeepSeek R1，推理模型 | 131,072 tokens | $2.00 |
| `hyperbolic/deepseek-ai/DeepSeek-R1-0528` | DeepSeek R1 2028 年 5 月版本 | 131,072 tokens | $0.25 |
| `hyperbolic/Qwen/Qwen2.5-72B-Instruct` | Qwen 2.5 72B Instruct | 131,072 tokens | $0.40 |
| `hyperbolic/Qwen/Qwen2.5-Coder-32B-Instruct` | Qwen 2.5 Coder 32B，用于代码生成 | 131,072 tokens | $0.20 |
| `hyperbolic/Qwen/Qwen3-235B-A22B` | Qwen 3 235B A22B 变体 | 131,072 tokens | $2.00 |
| `hyperbolic/Qwen/QwQ-32B` | Qwen QwQ 32B | 131,072 tokens | $0.20 |
| `hyperbolic/meta-llama/Llama-3.3-70B-Instruct` | Llama 3.3 70B Instruct | 131,072 tokens | $0.80 |
| `hyperbolic/meta-llama/Meta-Llama-3.1-405B-Instruct` | Llama 3.1 405B Instruct | 131,072 tokens | $5.00 |
| `hyperbolic/moonshotai/Kimi-K2-Instruct` | Kimi K2 Instruct | 131,072 tokens | $2.00 |

## 必需变量

```python showLineNumbers title="环境变量"
os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key
```

到 [Hyperbolic 仪表板](https://app.hyperbolic.ai) 获取 API 密钥。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Hyperbolic 非流式补全"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Hyperbolic call
response = completion(
    model="hyperbolic/Qwen/Qwen2.5-72B-Instruct", 
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Hyperbolic 流式补全"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Hyperbolic call with streaming
response = completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3", 
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 函数调用

```python showLineNumbers title="Hyperbolic 函数调用"
import os
import litellm
from litellm import completion

os.environ["HYPERBOLIC_API_KEY"] = ""  # your Hyperbolic API key

tools = [
    {
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

response = completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3",
    messages=[{"role": "user", "content": "What's the weather like in New York?"}],
    tools=tools,
    tool_choice="auto"
)

print(response)
```

## 用法 - LiteLLM Proxy

将以下内容添加到 LiteLLM Proxy 配置文件中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: deepseek-fast
    litellm_params:
      model: hyperbolic/deepseek-ai/DeepSeek-V3
      api_key: os.environ/HYPERBOLIC_API_KEY

  - model_name: qwen-coder
    litellm_params:
      model: hyperbolic/Qwen/Qwen2.5-Coder-32B-Instruct
      api_key: os.environ/HYPERBOLIC_API_KEY

  - model_name: deepseek-reasoning
    litellm_params:
      model: hyperbolic/deepseek-ai/DeepSeek-R1
      api_key: os.environ/HYPERBOLIC_API_KEY
```

启动 LiteLLM Proxy 服务器：

```bash showLineNumbers title="启动 LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理使用 Hyperbolic - 非流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="deepseek-fast",
    messages=[{"role": "user", "content": "Explain quantum computing in simple terms"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="通过代理使用 Hyperbolic - 流式"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="qwen-coder",
    messages=[{"role": "user", "content": "Write a Python function to sort a list"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="通过代理使用 Hyperbolic - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/deepseek-fast",
    messages=[{"role": "user", "content": "What are the benefits of renewable energy?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="通过代理使用 Hyperbolic - LiteLLM SDK 流式"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/qwen-coder",
    messages=[{"role": "user", "content": "Implement a binary search algorithm"}],
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

```bash showLineNumbers title="通过代理使用 Hyperbolic - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "deepseek-fast",
    "messages": [{"role": "user", "content": "What is machine learning?"}]
  }'
```

```bash showLineNumbers title="通过代理使用 Hyperbolic - cURL 流式"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "qwen-coder",
    "messages": [{"role": "user", "content": "Write a REST API in Python"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

有关 LiteLLM Proxy 的更多详细用法，请参阅 [LiteLLM Proxy 文档](../providers/litellm_proxy)。

## 支持的 OpenAI 参数

Hyperbolic 支持以下 OpenAI 兼容参数：

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 "role" 与 "content" 的消息对象数组 |
| `model` | string | **必填**。模型 ID（如 deepseek-ai/DeepSeek-V3、Qwen/Qwen2.5-72B-Instruct） |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度（0.0 到 2.0） |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。生成的最大 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否已出现施加惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `n` | integer | 可选。生成的补全数量 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用行为 |
| `response_format` | object | 可选。响应格式规约 |
| `seed` | integer | 可选。用于结果可复现的随机种子 |
| `user` | string | 可选。用户标识符 |

## 高级用法

### 自定义 API Base

如果你使用的是自定义的 Hyperbolic 部署：

```python showLineNumbers title="自定义 API Base"
import litellm

response = litellm.completion(
    model="hyperbolic/deepseek-ai/DeepSeek-V3",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="https://your-custom-hyperbolic-endpoint.com/v1",
    api_key="your-api-key"
)
```

### 速率限制

Hyperbolic 提供不同的套餐层级：
- **基础版（Basic）**：每分钟 60 个请求（RPM）
- **专业版（Pro）**：600 RPM
- **企业版（Enterprise）**：可自定义限额

## 定价

Hyperbolic 采用有竞争力的按量付费定价，没有隐藏费用，也没有长期合约约束。每百万 Token 的具体价格见上方的模型表。

### 精度选项
- **BF16**：精度与性能最佳，适合对准确性要求极高的任务
- **FP8**：为效率与速度优化，适合以更低成本追求高吞吐的应用

## 其他资源

- [Hyperbolic 官方文档](https://docs.hyperbolic.xyz)
- [Hyperbolic 仪表板](https://app.hyperbolic.ai)
- [API 参考](https://docs.hyperbolic.xyz/docs/rest-api)
