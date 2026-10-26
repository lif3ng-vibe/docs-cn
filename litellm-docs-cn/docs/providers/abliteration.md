# Abliteration

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Abliteration 提供与 OpenAI 兼容的 `/chat/completions` 端点。 |
| LiteLLM 上的提供商路由 | `abliteration/` |
| 提供商文档链接 | [Abliteration](https://abliteration.ai) |
| 基础 URL | `https://api.abliteration.ai/v1` |
| 支持的操作 | [`/chat/completions`](#使用示例) |

<br />

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["ABLITERATION_API_KEY"] = ""  # your Abliteration API key
```

## 使用示例

```python showLineNumbers title="Abliteration Completion"
import os
from litellm import completion

os.environ["ABLITERATION_API_KEY"] = ""

response = completion(
    model="abliteration/abliterated-model",
    messages=[{"role": "user", "content": "Hello from LiteLLM"}],
)

print(response)
```

## 流式使用示例

```python showLineNumbers title="Abliteration Streaming Completion"
import os
from litellm import completion

os.environ["ABLITERATION_API_KEY"] = ""

response = completion(
    model="abliteration/abliterated-model",
    messages=[{"role": "user", "content": "Stream a short reply"}],
    stream=True,
)

for chunk in response:
    print(chunk)
```

## 在 LiteLLM 代理服务器中使用

1. 将模型添加到代理配置中：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: abliteration-chat
    litellm_params:
      model: abliteration/abliterated-model
      api_key: os.environ/ABLITERATION_API_KEY
```

2. 启动代理：

```bash
litellm --config /path/to/config.yaml
```

## 直接 API 调用（Bearer Token）

将环境变量作为 Bearer 令牌，直接请求 OpenAI 兼容端点：`https://api.abliteration.ai/v1/chat/completions`。

```bash showLineNumbers title="cURL"
export ABLITERATION_API_KEY=""
curl https://api.abliteration.ai/v1/chat/completions \
  -H "Authorization: Bearer ${ABLITERATION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "abliterated-model",
    "messages": [{"role": "user", "content": "Hello from Abliteration"}]
  }'
```

```python showLineNumbers title="Python (requests)"
import os
import requests

api_key = os.environ["ABLITERATION_API_KEY"]

response = requests.post(
    "https://api.abliteration.ai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "abliterated-model",
        "messages": [{"role": "user", "content": "Hello from Abliteration"}],
    },
    timeout=60,
)

print(response.json())
```
