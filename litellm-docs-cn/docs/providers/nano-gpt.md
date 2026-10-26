# NanoGPT

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | NanoGPT 是一个支持按提示词付费与订阅制的 AI 服务，可即时使用 200 多个强大的 AI 模型，无需订阅或注册。 |
| LiteLLM 中的提供商路由 | `nano-gpt/` |
| 提供商文档链接 | [NanoGPT 网站 ↗](https://nano-gpt.com) |
| Base URL | `https://nano-gpt.com/api/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/nano-gpt#用法---litellm-python-sdk), `/completions` |

<br />

## NanoGPT 是什么？

NanoGPT 是一个灵活的 AI API 服务，提供以下能力：
- **按提示词付费**：无需订阅，只为实际用量付费
- **200 多个 AI 模型**：可使用文本、图像与视频生成模型
- **无需注册**：即刻上手
- **兼容 OpenAI 的 API**：轻松接入现有代码
- **支持流式**：响应实时流式返回
- **工具调用**：支持函数调用

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key
```

请在 [nano-gpt.com](https://nano-gpt.com) 获取你的 NanoGPT API 密钥。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="NanoGPT Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# NanoGPT call
response = completion(
    model="nano-gpt/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="NanoGPT Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["NANOGPT_API_KEY"] = ""  # your NanoGPT API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# NanoGPT call with streaming
response = completion(
    model="nano-gpt/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 工具调用

```python showLineNumbers title="NanoGPT Tool Calling"
import os
import litellm

os.environ["NANOGPT_API_KEY"] = ""

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                }
            }
        }
    }
]

response = litellm.completion(
    model="nano-gpt/model-name",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools
)
```

## 用法 - LiteLLM 代理服务器

### 1. 在环境中保存密钥

```bash
export NANOGPT_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: nano-gpt-model
    litellm_params:
      model: nano-gpt/model-name  # Replace with actual model name
      api_key: os.environ/NANOGPT_API_KEY
```

## 支持的 OpenAI 参数

NanoGPT 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 与 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID，从 200 多个可用模型中选取 |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样参数 |
| `max_tokens` | integer | 可选。生成的最大 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 进行惩罚 |
| `presence_penalty` | float | 可选。根据出现情况对 Token 进行惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `n` | integer | 可选。生成的补全数量 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用 |
| `response_format` | object | 可选。响应格式规范 |
| `user` | string | 可选。用户标识符 |

## 模型分类

NanoGPT 提供多种模型类别：
- **文本生成**：200 多个 LLM，可用于对话、补全与分析
- **图像生成**：用于生成图像的 AI 模型
- **视频生成**：用于生成视频的 AI 模型

## 定价模式

NanoGPT 提供灵活的定价结构：
- **按提示词付费**：无需订阅
- **无需注册**：即刻开始使用
- **定价透明**：只为实际用量付费

## API 文档

详细的 API 文档请访问 [docs.nano-gpt.com](https://docs.nano-gpt.com)。

## 更多资源

- [NanoGPT 网站](https://nano-gpt.com)
- [NanoGPT API 文档](https://nano-gpt.com/api)
- [NanoGPT 模型列表](https://docs.nano-gpt.com/api-reference/endpoint/models)
