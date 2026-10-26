import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 代理（LLM 网关）


| 属性 | 说明 |
|-------|-------|
| 描述 | LiteLLM 代理是一个兼容 OpenAI 的网关，让你通过统一的 API 与多个 LLM 提供商交互。只需在模型名前加上 `litellm_proxy/` 前缀，请求便会经由代理转发。 |
| LiteLLM 中的提供商路由 | `litellm_proxy/`（在模型名前加上该前缀，即可将任意请求路由到 litellm_proxy，例如 `litellm_proxy/your-model-name`） |
| 搭建 LiteLLM 网关 | [LiteLLM 网关 ↗](../simple_proxy) |
| 支持的端点 |`/chat/completions`, `/completions`, `/embeddings`, `/audio/speech`, `/audio/transcriptions`, `/images`, `/images/edits`, `/rerank` |



## 必需变量

```python
os.environ["LITELLM_PROXY_API_KEY"] = "" # "sk-<your-litellm-api-key>" your litellm proxy api key 
os.environ["LITELLM_PROXY_API_BASE"] = "" # "http://localhost:4000" your litellm proxy api base
```


## 用法（非流式）
```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

# set custom api base to your proxy
# either set .env or litellm.api_base
# os.environ["LITELLM_PROXY_API_BASE"] = ""
litellm.api_base = "your-openai-proxy-url"


messages = [{ "content": "Hello, how are you?","role": "user"}]

# litellm proxy call
response = completion(model="litellm_proxy/your-model-name", messages=messages)
```

## 用法：每次请求传入 `api_base` 与 `api_key`

如果需要动态设置 api_base，直接在 completion 调用中传入即可：completion(...,api_base="your-proxy-api-base")

```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# litellm proxy call
response = completion(
    model="litellm_proxy/your-model-name", 
    messages=messages, 
    api_base = "your-litellm-proxy-url",
    api_key = "your-litellm-proxy-api-key"
)
```
## 用法（流式）

```python
import os 
import litellm
from litellm import completion

os.environ["LITELLM_PROXY_API_KEY"] = ""

messages = [{ "content": "Hello, how are you?","role": "user"}]

# openai call
response = completion(
    model="litellm_proxy/your-model-name", 
    messages=messages,
    api_base = "your-litellm-proxy-url", 
    stream=True
)

for chunk in response:
    print(chunk)
```

## 嵌入

```python
import litellm

response = litellm.embedding(
    model="litellm_proxy/your-embedding-model",
    input="Hello world",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 图像生成

```python
import litellm

response = litellm.image_generation(
    model="litellm_proxy/dall-e-3",
    prompt="A beautiful sunset over mountains",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 图像编辑

```python
import litellm

with open("your-image.png", "rb") as f:
    response = litellm.image_edit(
        model="litellm_proxy/gpt-image-1",
        prompt="Make this image a watercolor painting",
        image=[f],
        api_base="your-litellm-proxy-url",
        api_key="your-litellm-proxy-api-key",
    )
```

## 语音转写

```python
import litellm

response = litellm.transcription(
    model="litellm_proxy/whisper-1",
    file="your-audio-file",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```

## 文本转语音

```python
import litellm

response = litellm.speech(
    model="litellm_proxy/tts-1",
    input="Hello world",
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
``` 

## 重排序（Rerank）

```python
import litellm

import litellm

response = litellm.rerank(
    model="litellm_proxy/rerank-english-v2.0",
    query="What is machine learning?",
    documents=[
        "Machine learning is a field of study in artificial intelligence",
        "Biology is the study of living organisms"
    ],
    api_base="your-litellm-proxy-url",
    api_key="your-litellm-proxy-api-key"
)
```


## 与其他库集成

LiteLLM 代理可与 Langchain、LlamaIndex、OpenAI JS、Anthropic SDK、Instructor 等库配合使用。

[了解如何在 LiteLLM 代理中使用这些库 →](../proxy/user_keys)

## 将所有 SDK 请求发送至 LiteLLM 代理

:::info

需要 v1.72.1 或更高版本。

:::

如果某个已在使用 LiteLLM SDK 的库或代码库需要调用 LiteLLM 代理，就用这种方式。

设置这些开关后，无论指定哪个模型，所有请求都会经由你的 LiteLLM 代理路由。

启用后，请求将使用 `LITELLM_PROXY_API_BASE`，并以 `LITELLM_PROXY_API_KEY` 完成认证。

### 方式一：在代码中全局设置

```python
# Set the flag globally for all requests
litellm.use_litellm_proxy = True

response = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### 方式二：通过环境变量控制

```python
# Control proxy usage through environment variable
os.environ["USE_LITELLM_PROXY"] = "True"

response = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}]
)
```

### 方式三：按请求设置

```python
# Enable proxy for specific requests only
response = litellm.completion(
    model="vertex_ai/{{gemini_flash}}",
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    use_litellm_proxy=True
)
```

## OAuth2/JWT 认证

如果你的 LiteLLM 代理需要 OAuth2/JWT 认证（例如 Azure AD、Keycloak、Okta），SDK 会自动为你获取并刷新令牌。

```python
import litellm
from litellm.proxy_auth import AzureADCredential, ProxyAuthHandler

litellm.proxy_auth = ProxyAuthHandler(
    credential=AzureADCredential(),
    scope="api://my-litellm-proxy/.default"
)
litellm.api_base = "https://my-proxy.example.com"

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

[进一步了解 SDK 代理认证（OAuth2/JWT 自动刷新）→](../proxy_auth)

## 向 LiteLLM 代理发送 `tags`

标签（tags）让你能够对 API 请求做分类和追踪，用于监控、调试与分析。可以把标签作为字符串列表，通过 `extra_body` 参数发送给 LiteLLM 代理。

### 用法

在补全请求的 `extra_body` 参数中带上标签即可发送：

```python showLineNumbers title="用法"
import litellm

response = litellm.completion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>",
    extra_body={"tags": ["user:ishaan", "department:engineering", "priority:high"]}
)
```

### 异步用法

```python showLineNumbers title="异步用法"
import litellm

response = await litellm.acompletion(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    api_base="http://localhost:4000", 
    api_key="sk-<your-litellm-api-key>",
    extra_body={"tags": ["user:ishaan", "department:engineering"]}
)
```
