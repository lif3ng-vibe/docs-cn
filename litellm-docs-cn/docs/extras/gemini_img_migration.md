# Gemini 图像生成迁移指南

## 受影响范围

所有通过 /chat/completions 使用以下模型的用户：
- `gemini/gemini-2.0-flash-exp-image-generation`
- `vertex_ai/gemini-2.0-flash-exp-image-generation`

## 关键变更

:::info
从 v1.77.0 起，LiteLLM 会在 `response.choices[0].message.images` 中返回图像列表，而不是在 `response.choices[0].message.image` 中返回单张图像。
:::

Gemini 模型现已支持通过对话补全（chat completions）生成图像。图像会以 base64 数据 URL 的形式放在 `response.choices[0].message.images` 中返回。

## 变更前后

### 变更前
```python
from litellm import completion

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)


base_64_image_data = response.choices[0].message.content
```

### 变更后
```python
from litellm import completion

response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)

# Image is now available in the response
image_url = response.choices[0].message.images[0]["image_url"]["url"]  # "data:image/png;base64,..."
```

### 变更原因

因为较新的 `gemini-2.5-flash-image-preview` 模型会在同一次响应中把文本和图像一起返回。这套接口让开发者可以显式地访问响应中的图像或文本部分；在此之前，开发者得自己在消息内容里翻找模型生成的图像。

**为什么从 `image` 改成 `images`**？
这是为了与 OpenRouter API 保持一致，尽可能沿用简单、广为人知的接口约定。

## 用法

### 使用 Python SDK

**关键变更**：
```diff
# Before
-- base_64_image_data = response.choices[0].message.content

# After
++ image_url = response.choices[0].message.images[0]["image_url"]["url"]
```

#### 基础图像生成

```python
from litellm import completion
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key"

# Generate an image
response = completion(
    model="gemini/gemini-2.0-flash-exp-image-generation",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    modalities=["image", "text"],
)

# Access the generated image
print(response.choices[0].message.content)  # Text response (if any)
print(response.choices[0].message.images[0])    # Image data
```

#### 响应格式

图像会放在 `message.images` 字段中返回：

```python
{
    "image_url": {
        "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "detail": "auto"
    },
    "index": 0,
    "type": "image_url"
}
```

### 使用 LiteLLM 代理服务器

**关键变更**：
```diff
# Before
-- "content": "base64-image-data..."

# After  
++ "images": [{
++   "image_url": {
++     "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
++     "detail": "auto"
++   },
++   "index": 0,
++   "type": "image_url"
++ }]
```

#### 配置准备

1. **在 `config.yaml` 中配置模型**：

```yaml
model_list:
  - model_name: gemini-image-gen
    litellm_params:
      model: gemini/gemini-2.0-flash-exp-image-generation
      api_key: os.environ/GEMINI_API_KEY
  - model_name: vertex-image-gen  
    litellm_params:
      model: vertex_ai/gemini-2.5-flash-image-preview
      vertex_project: your-project-id
      vertex_location: us-central1

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY  # Your proxy API key
```

2. **启动代理服务器**：

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 发起请求

**使用 OpenAI SDK**：

```python
from openai import OpenAI

# Point to your proxy server
client = OpenAI(
    api_key="sk-<your-litellm-api-key>",  # Your proxy API key
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="gemini-image-gen",
    messages=[{"role": "user", "content": "Generate an image of a cat"}],
    extra_body={"modalities": ["image", "text"]}
)

# Access the generated image
print(response.choices[0].message.content)  # Text response (if any)
print(response.choices[0].message.images[0]["image_url"]["url"])  # "data:image/png;base64,..."
```

**使用 curl**：

```bash
curl -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "model": "gemini-image-gen",
  "messages": [
    {
      "role": "user",
      "content": "Generate an image of a cat"
    }
  ],
  "modalities": ["image", "text"]
}'
```

**代理服务器返回的响应格式**：

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1704089632,
  "model": "gemini-image-gen",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's an image of a cat for you!",
        "images": [{
          "image_url": {
            "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
            "detail": "auto"
          },
          "index": 0,
          "type": "image_url"
        }]
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```
