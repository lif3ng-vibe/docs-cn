# Apertis AI (Stima API)

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Apertis AI（原 Stima API）是一个统一的 API 平台，通过单一接口即可访问 430 多个 AI 模型，成本最高可省 50%。 |
| LiteLLM 提供商路由 | `apertis/` |
| 提供商文档链接 | [Apertis AI 网站 ↗](https://api.stima.tech) |
| 基础 URL | `https://api.stima.tech/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/apertis#用法litellm-python-sdk) |

<br />

## Apertis AI 是什么？

Apertis AI 是一个统一的 API 平台，开发者可以：
- **访问 430 多个 AI 模型**：所有模型都通过同一个 API 调用
- **成本直降 50%**：定价有竞争力，折扣力度大
- **统一计费**：所有模型用量合并为一张账单
- **快速上手**：$2 注册即可开始使用
- **GitHub 集成**：关联你的 GitHub 账号

## 必需的环境变量

```python showLineNumbers title="Environment Variables"
os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key
```

在 [api.stima.tech](https://api.stima.tech) 获取你的 Apertis AI API 密钥。

## 用法：LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Apertis AI Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Apertis AI call
response = completion(
    model="apertis/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Apertis AI Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["STIMA_API_KEY"] = ""  # your Apertis AI API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Apertis AI call with streaming
response = completion(
    model="apertis/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法：LiteLLM 代理服务器

### 1. 在环境中保存密钥

```bash
export STIMA_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: apertis-model
    litellm_params:
      model: apertis/model-name  # Replace with actual model name
      api_key: os.environ/STIMA_API_KEY
```

## 支持的 OpenAI 参数

Apertis AI 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 与 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID，从 430 多个可用模型中选取 |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样参数 |
| `max_tokens` | integer | 可选。最多生成的 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否出现过施加惩罚 |
| `stop` | string/array | 可选。停止序列 |
| `tools` | array | 可选。可用工具/函数列表 |
| `tool_choice` | string/object | 可选。控制工具/函数调用 |

## 成本优势

Apertis AI 具有显著的成本优势：
- **节省 50% 成本**：相比直接向各提供商付费更省钱
- **统一计费**：所有 AI 模型用量只出一张发票
- **门槛低**：$2 注册即可开始

## 模型可用性

借助对 430 多个 AI 模型的访问能力，Apertis AI 可以提供：
- 一个 API 接入多家提供商
- 最新的模型发布
- 多种模型类型（文本、图像、视频）

## 其他资源

- [Apertis AI 网站](https://api.stima.tech)
- [Apertis AI 企业版](https://api.stima.tech/enterprise)
