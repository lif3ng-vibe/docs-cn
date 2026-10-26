# Synthetic

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Synthetic 在美国和欧盟的安全数据中心运行开源 AI 模型，专注于隐私保护。绝不会用你的数据训练模型，API 数据会在 14 天内自动删除。 |
| LiteLLM 提供商路由 | `synthetic/` |
| 提供商文档链接 | [Synthetic 官网 ↗](https://synthetic.new) |
| Base URL | `https://api.synthetic.new/openai/v1` |
| 支持的操作 | [`/chat/completions`](/docs/providers/synthetic#用法---litellm-python-sdk) |

<br />

## Synthetic 是什么？

Synthetic 是一个专注于隐私的 AI 平台，让你可以访问多种开源 LLM，并作出以下承诺：
- **隐私优先**：数据绝不会被用于训练
- **安全托管**：模型运行在美国和欧盟的安全数据中心
- **自动删除**：API 数据在 14 天内自动删除
- **开源**：运行开源 AI 模型

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key
```

从 [synthetic.new](https://synthetic.new) 获取你的 Synthetic API 密钥（API key）。

## 用法 - LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Synthetic Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key

messages = [{"content": "What is the capital of France?", "role": "user"}]

# Synthetic call
response = completion(
    model="synthetic/model-name",  # Replace with actual model name
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Synthetic Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["SYNTHETIC_API_KEY"] = ""  # your Synthetic API key

messages = [{"content": "Write a short poem about AI", "role": "user"}]

# Synthetic call with streaming
response = completion(
    model="synthetic/model-name",  # Replace with actual model name
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

## 用法 - LiteLLM 代理服务器

### 1. 将密钥保存到环境变量

```bash
export SYNTHETIC_API_KEY=""
```

### 2. 启动代理

```yaml
model_list:
  - model_name: synthetic-model
    litellm_params:
      model: synthetic/model-name  # Replace with actual model name
      api_key: os.environ/SYNTHETIC_API_KEY
```

## 支持的 OpenAI 参数

Synthetic 支持所有标准的 OpenAI 兼容参数：

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `messages` | array | **必填**。包含 'role' 和 'content' 的消息对象数组 |
| `model` | string | **必填**。模型 ID |
| `stream` | boolean | 可选。启用流式响应 |
| `temperature` | float | 可选。采样温度 |
| `top_p` | float | 可选。核采样（nucleus sampling）参数 |
| `max_tokens` | integer | 可选。最多生成的 Token 数 |
| `frequency_penalty` | float | 可选。对高频 Token 施加惩罚 |
| `presence_penalty` | float | 可选。根据 Token 是否出现过施加惩罚 |
| `stop` | string/array | 可选。停止序列 |

## 隐私与安全

Synthetic 提供企业级的隐私保护：
- 数据在 14 天内自动删除
- 不使用任何数据训练模型
- 在美国和欧盟的数据中心安全托管
- 架构对合规友好

## 更多资源

- [Synthetic 官网](https://synthetic.new)
