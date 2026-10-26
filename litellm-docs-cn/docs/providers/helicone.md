import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Helicone

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Helicone 是一个 AI 网关（AI gateway）与可观测性（observability）平台，提供 OpenAI 兼容端点，并具备高级监控、缓存与分析能力。 |
| LiteLLM 中的提供商路由 | `helicone/` |
| 提供商文档链接 | [Helicone 官方文档 ↗](https://docs.helicone.ai) |
| 基础 URL | `https://ai-gateway.helicone.ai/` |
| 支持的操作 | [`/chat/completions`](/docs/providers/helicone#用法---litellm-python-sdk), [`/completions`](#文本补全), `/embeddings` |

<br />

**Helicone AI 网关上的[所有可用模型](https://helicone.ai/models)我们都支持**。发送请求时，请使用 `helicone/` 作为模型名前缀。

## Helicone 是什么？

Helicone 是一个面向 LLM 应用的开源可观测性平台，提供以下能力：
- **请求监控**：以详细的指标追踪所有 LLM 请求
- **缓存**：借助智能缓存降低成本与延迟
- **限流**（rate limiting）：按用户或密钥控制请求速率
- **成本追踪**（cost tracking）：监控各模型、各用户的花费
- **自定义属性**：为请求附加元数据标签，便于筛选与分析
- **提示词管理**：对提示词进行版本控制

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key
```

请从 [Helicone 仪表板](https://helicone.ai)获取你的 Helicone API 密钥（API key）。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Helicone Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Helicone call - routes through Helicone gateway to OpenAI
response = completion(
    model="helicone/{{openai_large}}",
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Helicone Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Helicone call with streaming
response = completion(
    model="helicone/{{openai_large}}",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 使用自定义属性

```python showLineNumbers title="Helicone with Custom Properties"
import os
import litellm
from litellm import completion

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

response = completion(
    model="helicone/{{openai_small}}",
    messages=[{"role": "user", "content": "What's the weather like?"}],
    extra_headers={
        "Helicone-Property-Environment": "production",
        "Helicone-Property-User-Id": "user_123",
        "Helicone-Property-Session-Id": "session_abc"
    }
)

print(response)
```

### 文本补全

```python showLineNumbers title="Helicone Text Completion"
import os
import litellm

os.environ["HELICONE_API_KEY"] = ""  # your Helicone API key

response = litellm.completion(
    model="helicone/{{openai_small}}",  # text completion model
    prompt="Once upon a time"
)

print(response)
```


## 重试与回退机制

```python
import litellm

litellm.api_base = "https://ai-gateway.helicone.ai/"
litellm.headers = {
    "Helicone-Retry-Enabled": "true",
    "helicone-retry-num": "3",
    "helicone-retry-factor": "2",
}

response = litellm.completion(
    model="helicone/{{openai_small}}/openai,{{anthropic}}/anthropic", # Try OpenAI first, then fallback to Anthropic, then continue with other models,
    messages=[{"role": "user", "content": "Hello"}]
)
```

## 支持的 OpenAI 参数

Helicone 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 和 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID（如 gpt-4、claude-3-opus 等） |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。可生成的最大 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否已出现施加惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `n` | integer | 可选。生成的补全数量 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用行为 |
| `response_format` | object | 可选。响应格式规范 |
| `user` | string | 可选。用户标识符 |

## Helicone 专用请求头

要使用 Helicone 的各项功能，可以用 `extra_headers` 把这些请求头随请求传入；也可以设置 `litellm.headers`，让每次调用都自动携带。`metadata` 参数不会转发给 Helicone：

| 请求头 | 说明 |
|--------|-------------|
| `Helicone-Property-*` | 用于筛选的自定义属性（如 `Helicone-Property-User-Id`） |
| `Helicone-Cache-Enabled` | 为本次请求启用缓存 |
| `Helicone-User-Id` | 用于追踪的用户标识符 |
| `Helicone-Session-Id` | 用于分组请求的会话标识符 |
| `Helicone-Prompt-Id` | 用于版本管理的提示词标识符 |
| `Helicone-Rate-Limit-Policy` | 限流策略名称 |

请求头使用示例：

```python showLineNumbers title="Helicone with Custom Headers"
import litellm

response = litellm.completion(
    model="helicone/{{openai_large}}",
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={
        "Helicone-Cache-Enabled": "true",
        "Helicone-Property-Environment": "production",
        "Helicone-Property-User-Id": "user_123",
        "Helicone-Session-Id": "session_abc",
        "Helicone-Prompt-Id": "prompt_v1"
    }
)
```

## 高级用法

### 搭配不同提供商使用

Helicone 充当网关，支持多家提供商：

```python showLineNumbers title="Helicone with Anthropic"
import litellm

# Set both Helicone and Anthropic keys
os.environ["HELICONE_API_KEY"] = "your-helicone-key"

response = litellm.completion(
    model="helicone/{{anthropic}}/anthropic",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### 缓存

启用缓存可降低成本与延迟：

```python showLineNumbers title="Helicone Caching"
import litellm

response = litellm.completion(
    model="helicone/{{openai_large}}",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    extra_headers={
        "Helicone-Cache-Enabled": "true"
    }
)

# Subsequent identical requests will be served from cache
response2 = litellm.completion(
    model="helicone/{{openai_large}}",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    extra_headers={
        "Helicone-Cache-Enabled": "true"
    }
)
```

## 功能特性

### 请求监控
- 以详细的指标追踪所有请求
- 查看请求/响应对
- 监控延迟与错误
- 按自定义属性筛选

### 成本追踪
- 按模型追踪成本
- 按用户追踪成本
- 成本告警与预算
- 历史成本分析

### 限流
- 按用户的速率限制
- 按 API 密钥的速率限制
- 自定义限流策略
- 自动执行

### 数据分析
- 请求量趋势
- 成本趋势
- 延迟百分位
- 错误率

详情请见 [Helicone 定价页面](https://helicone.ai/pricing)。

## 更多资源

- [Helicone 官方文档](https://docs.helicone.ai)
- [Helicone 仪表板](https://helicone.ai)
- [Helicone GitHub](https://github.com/Helicone/helicone)
- [API 参考](https://docs.helicone.ai/rest/ai-gateway/post-v1-chat-completions)
