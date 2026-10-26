import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vercel AI Gateway

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | Vercel AI Gateway 提供统一接口，通过单一端点即可访问多家 AI 提供商（provider），并内置缓存、限流（rate limiting）与分析功能。 |
| LiteLLM 中的提供商路由 | `vercel_ai_gateway/` |
| 提供商文档链接 | [Vercel AI Gateway 文档 ↗](https://vercel.com/docs/ai-gateway) |
| 基础 URL | `https://ai-gateway.vercel.sh/v1` |
| 支持的操作 | `/chat/completions`, `/embeddings`, `/models` |

<br />
<br />

https://vercel.com/docs/ai-gateway

**Vercel AI Gateway 上所有可用模型均受支持，发送补全（completion）请求时只需在模型名前加上 `vercel_ai_gateway/` 前缀**

## 必需变量

```python showLineNumbers title="Environment Variables"
os.environ["VERCEL_AI_GATEWAY_API_KEY"] = ""  # your Vercel AI Gateway API key
# OR
os.environ["VERCEL_OIDC_TOKEN"] = ""  # your Vercel OIDC token for authentication
```

## 可选变量

```python showLineNumbers title="Environment Variables"
os.environ["VERCEL_SITE_URL"] = ""  # your site url
# OR
os.environ["VERCEL_APP_NAME"] = ""  # your app name
```

注意：如何获取密钥，参见 [Vercel AI Gateway 文档](https://vercel.com/docs/ai-gateway#using-the-ai-gateway-with-an-api-key)。

## 用法：LiteLLM Python SDK

### 非流式

```python showLineNumbers title="Vercel AI Gateway Non-streaming Completion"
import os
import litellm
from litellm import completion

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Vercel AI Gateway call
response = completion(
    model="vercel_ai_gateway/openai/{{openai_large}}", 
    messages=messages
)

print(response)
```

### 流式

```python showLineNumbers title="Vercel AI Gateway Streaming Completion"
import os
import litellm
from litellm import completion

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

messages = [{"content": "Hello, how are you?", "role": "user"}]

# Vercel AI Gateway call with streaming
response = completion(
    model="vercel_ai_gateway/openai/{{openai_large}}",
    messages=messages,
    stream=True
)

for chunk in response:
    print(chunk)
```

### 嵌入

```python showLineNumbers title="Vercel AI Gateway Embeddings"
import os
from litellm import embedding

os.environ["VERCEL_AI_GATEWAY_API_KEY"] = "your-api-key"

# Vercel AI Gateway embedding call
response = embedding(
    model="vercel_ai_gateway/openai/text-embedding-3-small",
    input="Hello world"
)

print(response.data[0]["embedding"][:5])  # Print first 5 dimensions
```

也可以通过 `dimensions` 参数指定维度：

```python showLineNumbers title="Vercel AI Gateway Embeddings with Dimensions"
response = embedding(
    model="vercel_ai_gateway/openai/text-embedding-3-small",
    input=["Hello world", "Goodbye world"],
    dimensions=768
)
```

## 用法：LiteLLM Proxy

在 LiteLLM Proxy 配置文件中加入以下内容：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4o-gateway
    litellm_params:
      model: vercel_ai_gateway/openai/{{openai_large}}
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY

  - model_name: claude-4-sonnet-gateway
    litellm_params:
      model: vercel_ai_gateway/anthropic/claude-4-sonnet
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY

  - model_name: text-embedding-3-small-gateway
    litellm_params:
      model: vercel_ai_gateway/openai/text-embedding-3-small
      api_key: os.environ/VERCEL_AI_GATEWAY_API_KEY
```

启动 LiteLLM Proxy 服务器：

```bash showLineNumbers title="Start LiteLLM Proxy"
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Vercel AI Gateway via Proxy - Non-streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Non-streaming response
response = client.chat.completions.create(
    model="gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Vercel AI Gateway via Proxy - Streaming"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"       # Your proxy API key
)

# Streaming response
response = client.chat.completions.create(
    model="gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Vercel AI Gateway via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.completion(
    model="litellm_proxy/gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    api_base="http://localhost:4000",
    api_key="your-proxy-api-key"
)

print(response.choices[0].message.content)
```

```python showLineNumbers title="Vercel AI Gateway via Proxy - LiteLLM SDK Streaming"
import litellm

# Configure LiteLLM to use your proxy with streaming
response = litellm.completion(
    model="litellm_proxy/gpt-4o-gateway",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
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

```bash showLineNumbers title="Vercel AI Gateway via Proxy - cURL"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-4o-gateway",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'
```

```bash showLineNumbers title="Vercel AI Gateway via Proxy - cURL Streaming"
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-proxy-api-key" \
  -d '{
    "model": "gpt-4o-gateway",
    "messages": [{"role": "user", "content": "Hello, how are you?"}],
    "stream": true
  }'
```

</TabItem>
</Tabs>

想更深入地了解 LiteLLM Proxy 的用法，参见 [LiteLLM Proxy 文档](../providers/litellm_proxy)。

## 更多资源

- [Vercel AI Gateway 文档](https://vercel.com/docs/ai-gateway)
