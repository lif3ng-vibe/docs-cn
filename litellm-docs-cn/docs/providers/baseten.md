import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Baseten

LiteLLM 同时支持 Baseten 的 Model API 和专属部署（dedicated deployment），并支持自动路由。

## API 类型

### Model API（默认）
- **URL**：`https://inference.baseten.co/v1`
- **格式**：`baseten/<model-name>`（如 `baseten/openai/gpt-oss-120b`）
- **适用场景**：快速访问热门模型

### 专属部署
- **URL**：`https://model-{id}.api.baseten.co/environments/production/sync/v1`
- **格式**：`baseten/{8-digit-alphanumeric-code}`（如 `baseten/abcd1234`）
- **适用场景**：自定义模型、有延迟 SLA 要求的场景

:::tip
**自动路由**：LiteLLM 会根据模型格式自动判断类型：
- 8 位字母数字编码 → 专属部署
- 其他所有格式 → Model API
:::


## 快速上手

```python
import os
from litellm import completion

os.environ['BASETEN_API_KEY'] = "your-api-key"

# Model API (default)
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Hello!"}]
)

# Dedicated deployment (8-digit ID)
response = completion(
    model="baseten/abcd1234",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## 示例

### 基本用法
```python
# Model API
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    max_tokens=500,
    temperature=0.7
)

# Dedicated deployment
response = completion(
    model="baseten/abcd1234",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    max_tokens=500,
    temperature=0.7
)
```

### 流式输出（仅限 Model API）
```python
response = completion(
    model="baseten/openai/gpt-oss-120b",
    messages=[{"role": "user", "content": "Write a poem"}],
    stream=True,
    stream_options={"include_usage": True}
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## 在 LiteLLM 代理中使用

1. **配置**：
```yaml
model_list:
  - model_name: baseten-model
    litellm_params:
      model: baseten/openai/gpt-oss-120b
      api_key: your-baseten-api-key
```

2. **请求**：
```python
import openai
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="baseten-model",
    messages=[{"role": "user", "content": "Hello!"}]
)
```
