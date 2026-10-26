# GMI Cloud

## 概览

| 属性 | 详情 |
|-------|-------|
| 简介 | GMI Cloud 是一家 GPU 云基础设施提供商，通过 OpenAI 兼容 API 提供对 Claude、GPT、DeepSeek、Gemini 等顶尖 AI 模型的访问。 |
| LiteLLM 提供商路由 | `gmi/` |
| 提供商文档链接 | [GMI Cloud 文档 ↗](https://docs.gmicloud.ai) |
| Base URL | `https://api.gmi-serving.com/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/gmi#用法litellm-python-sdk), [`/models`](#支持的模型) |

<br />

## GMI Cloud 是什么？

GMI Cloud 是一家获得风险投资支持的数字基础设施公司（融资超过 8200 万美元），能够提供：
- **顶级 GPU 资源**：面向 AI 工作负载的 NVIDIA H100 GPU
- **多样的 AI 模型**：涵盖 Claude、GPT、DeepSeek、Gemini、Kimi、Qwen 等
- **OpenAI 兼容 API**：可直接替换 OpenAI SDK，即插即用
- **全球化基础设施**：数据中心位于美国（科罗拉多）和亚太地区（台湾）

## 必需的环境变量

```python showLineNumbers title="环境变量"
os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key
```

请前往 [console.gmicloud.ai](https://console.gmicloud.ai) 获取你的 GMI Cloud API 密钥（API key）。

## 用法：LiteLLM Python SDK

### 非流式

```python showLineNumbers title="GMI Cloud 非流式补全"
import os
import litellm
from litellm import completion

os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# GMI Cloud call
response = completion(
    model="gmi/deepseek-ai/DeepSeek-V3.2",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="GMI Cloud 流式补全"
import os
import litellm
from litellm import completion

os.environ["GMI_API_KEY"] = ""  # your GMI Cloud API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# GMI Cloud call with streaming
response = completion(
    model="gmi/anthropic/claude-sonnet-4.5",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法：LiteLLM 代理服务器

### 1. 将密钥保存到环境变量

```bash
export GMI_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: deepseek-v3
    litellm_params:
      model: gmi/deepseek-ai/DeepSeek-V3.2
      api_key: os.environ/GMI_API_KEY
  - model_name: claude-sonnet
    litellm_params:
      model: gmi/anthropic/claude-sonnet-4.5
      api_key: os.environ/GMI_API_KEY
```

## 支持的模型

| 模型 | 模型 ID | 上下文长度 |
|-------|----------|----------------|
| Claude Opus 4.5 | `gmi/anthropic/claude-opus-4.5` | 409K |
| Claude Sonnet 4.5 | `gmi/anthropic/claude-sonnet-4.5` | 409K |
| Claude Sonnet 4 | `gmi/anthropic/claude-sonnet-4` | 409K |
| Claude Opus 4 | `gmi/anthropic/claude-opus-4` | 409K |
| GPT-5.2 | `gmi/openai/gpt-5.2` | 409K |
| GPT-5.1 | `gmi/openai/gpt-5.1` | 409K |
| GPT-5 | `gmi/openai/gpt-5` | 409K |
| GPT-4o | `gmi/openai/gpt-4o` | 131K |
| GPT-4o-mini | `gmi/openai/gpt-4o-mini` | 131K |
| DeepSeek V3.2 | `gmi/deepseek-ai/DeepSeek-V3.2` | 163K |
| DeepSeek V3 0324 | `gmi/deepseek-ai/DeepSeek-V3-0324` | 163K |
| Gemini 3 Pro | `gmi/google/gemini-3-pro-preview` | 1M |
| Gemini 3 Flash | `gmi/google/gemini-3-flash-preview` | 1M |
| Kimi K2 Thinking | `gmi/moonshotai/Kimi-K2-Thinking` | 262K |
| MiniMax M2.1 | `gmi/MiniMaxAI/MiniMax-M2.1` | 196K |
| Qwen3-VL 235B | `gmi/Qwen/Qwen3-VL-235B-A22B-Instruct-FP8` | 262K |
| GLM-4.7 | `gmi/zai-org/GLM-4.7-FP8` | 202K |

## 支持的 OpenAI 参数

GMI Cloud 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必需**。包含 'role' 和 'content' 的消息对象数组 |
| `model` | string | **必需**。取自可用模型列表的模型 ID |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。可生成的最大 Token 数 |
| `frequency_penalty` | float | 可选。对出现频繁的 Token 进行惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否已出现进行惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `response_format` | object | 可选。JSON 模式，取值为 `{"type": "json_object"}` |

## 其他资源

- [GMI Cloud 官网](https://www.gmicloud.ai)
- [GMI Cloud 文档](https://docs.gmicloud.ai)
- [GMI Cloud 控制台](https://console.gmicloud.ai)
