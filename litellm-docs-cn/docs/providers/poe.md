# Poe

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Poe 是 Quora 旗下的 AI 平台，通过开发者友好的 API 提供对 100 多个模型的访问，覆盖文本、图像、视频和语音等多种模态。 |
| LiteLLM 提供商路由 | `poe/` |
| 提供商文档链接 | [Poe 官网 ↗](https://poe.com) |
| Base URL | `https://api.poe.com/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/poe#用法---litellm-python-sdk) |

<br />

## Poe 是什么？

Poe 是 Quora 旗下的 AI 平台，具备以下特点：
- **100 多个模型**：涵盖品类繁多的 AI 模型
- **多种模态**：文本、图像、视频与语音 AI
- **热门模型**：包括 OpenAI 的 GPT 系列与 Anthropic 的 Claude
- **开发者 API**：应用集成轻松简单
- **广泛触达**：背靠 Quora 每月 4 亿独立访客的流量

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["POE_API_KEY"] = ""  # your Poe API key
```

请在 [Poe 平台](https://poe.com)获取你的 Poe API 密钥。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Poe Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["POE_API_KEY"] = ""  # your Poe API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Poe call
response = completion(
    model="poe/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Poe Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["POE_API_KEY"] = ""  # your Poe API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Poe call with streaming
response = completion(
    model="poe/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法 - LiteLLM 代理服务器

### 1. 将密钥保存到环境变量

```bash
export POE_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: poe-model
    litellm_params:
      model: poe/model-name  # Replace with actual model name
      api_key: os.environ/POE_API_KEY
```

## 支持的 OpenAI 参数

Poe 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。消息对象数组，每个对象含 'role' 和 'content' |
| `model` | string | **必填**。模型 ID，可从 100 多个可用模型中选择 |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。生成的最大 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 进行惩罚 |
| `presence_penalty` | float | 可选。按出现与否对 Token 进行惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用 |
| `response_format` | object | 可选。指定响应格式 |
| `user` | string | 可选。用户标识符 |

## 可用模型类别

Poe 提供来自多家提供商的模型：
- **OpenAI 模型**：包括 GPT-4、GPT-4 Turbo、GPT-3.5 Turbo
- **Anthropic 模型**：包括 Claude 3 Opus、Sonnet、Haiku
- **其他热门模型**：提供各家提供商的多种模型
- **多模态**：文本、图像、视频与语音模型

## 平台优势

通过 LiteLLM 使用 Poe 有以下几点优势：
- **统一接入**：一个 API 通达众多不同的模型
- **Quora 整合**：触达庞大的用户群与内容生态
- **内容分享**：可将模型输出分享给关注者
- **内容分发**：优质 AI 内容分发给全体用户
- **模型发现**：高效探索新的 AI 模型

## 开发者资源

Poe 正在积极建设开发者功能，欢迎申请 API 集成的抢先体验资格。

## 其他资源

- [Poe 官网](https://poe.com)
- [Poe AI Quora 空间](https://poeai.quora.com)
- [Quora 关于 Poe 的博客文章](https://quorablog.quora.com/Poe)
