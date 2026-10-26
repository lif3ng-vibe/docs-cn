import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Google AI Studio 图像生成

Google AI Studio 借助 Google 的 Imagen 模型提供强大的图像生成能力，可根据文字描述生成高质量图像。

## 概览

| 属性 | 详情 |
|----------|---------|
| 描述 | Google AI Studio 图像生成基于 Google 的 Imagen 模型，可根据文字描述生成高质量图像。 |
| LiteLLM 中的提供商路由 | `gemini/` |
| 提供商文档 | [Google AI Studio 图像生成 ↗](https://ai.google.dev/gemini-api/docs/imagen) |
| 支持的操作 | [`/images/generations`](#图像生成) |

## 设置

### API 密钥

```python showLineNumbers
# Set your Google AI Studio API key
import os
os.environ["GEMINI_API_KEY"] = "your-api-key-here"
```

API 密钥可从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取。

## 图像生成

### 用法 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基础用法">

```python showLineNumbers title="Basic Image Generation"
import litellm
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key-here"

# Generate a single image
response = litellm.image_generation(
    model="gemini/imagen-4.0-generate-001",
    prompt="A cute baby sea otter swimming in crystal clear water"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="async" label="异步用法">

```python showLineNumbers title="Async Image Generation"
import litellm
import asyncio
import os

async def generate_image():
    # Set your API key
    os.environ["GEMINI_API_KEY"] = "your-api-key-here"
    
    # Generate image asynchronously
    response = await litellm.aimage_generation(
        model="gemini/imagen-4.0-generate-001",
        prompt="A beautiful sunset over mountains with vibrant colors",
        n=1,
    )
    
    print(response.data[0].url)
    return response

# Run the async function
asyncio.run(generate_image())
```

</TabItem>

<TabItem value="advanced" label="高级参数">

```python showLineNumbers title="Advanced Image Generation with Parameters"
import litellm
import os

# Set your API key
os.environ["GEMINI_API_KEY"] = "your-api-key-here"

# Generate image with additional parameters
response = litellm.image_generation(
    model="gemini/imagen-4.0-generate-001",
    prompt="A futuristic cityscape at night with neon lights",
    n=1,
    size="1024x1024"
)

for image in response.data:
    print(f"Generated image URL: {image.url}")
```

</TabItem>
</Tabs>

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Google AI Studio Image Generation Configuration"
model_list:
  - model_name: google-imagen
    litellm_params:
      model: gemini/imagen-4.0-generate-001
      api_key: os.environ/GEMINI_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动 LiteLLM 代理服务器

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 使用 OpenAI Python SDK 发起请求

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Google AI Studio Image Generation via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="sk-<your-litellm-api-key>"                  # Your proxy API key
)

# Generate image
response = client.images.generate(
    model="google-imagen",
    prompt="A majestic eagle soaring over snow-capped mountains",
    n=1,
    size="1024x1024"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Google AI Studio Image Generation via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.image_generation(
    model="litellm_proxy/google-imagen",
    prompt="A serene Japanese garden with cherry blossoms",
    api_base="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Google AI Studio Image Generation via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "google-imagen",
    "prompt": "A cozy coffee shop interior with warm lighting",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
</Tabs>

## Gemini 图像模型

Gemini 图像模型（如 `gemini-3.1-flash-image-preview`、`gemini-3-pro-image-preview`）使用 `generateContent` API，返回 base64 格式的图像。在 `/v1/images/generations` 上，它们还支持 **Google Search grounding**。

```python showLineNumbers title="Gemini image generation with Google Search"
import litellm
import os

os.environ["GEMINI_API_KEY"] = "your-api-key-here"

response = litellm.image_generation(
    model="gemini/gemini-3.1-flash-image-preview",
    prompt="Generate an image of the latest iPhone design",
    web_search_options={},
)

print(response.data[0].b64_json)
```

```bash showLineNumbers title="Proxy request with web_search_options"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gemini-3.1-flash-image-preview",
    "prompt": "Generate an image of the latest iPhone design",
    "web_search_options": {}
}'
```

你也可以传入 `tools=[{"type": "web_search"}]`，或使用原生形式 `tools=[{"googleSearch": {}}]`。

### 传入 imageConfig

Gemini 图像模型接受完整的 `imageConfig` 对象。所有字段直接映射到底层 `generateContent` 请求中的 `generationConfig.imageConfig`。

```python showLineNumbers title="imageConfig with all fields"
import litellm
import os

os.environ["GEMINI_API_KEY"] = "your-api-key-here"

response = litellm.image_generation(
    model="gemini/gemini-3.1-flash-image-preview",
    prompt="A nano banana on a desk",
    imageConfig={
        "aspectRatio": "16:9",
        "imageSize": "2K",
        "personGeneration": "DONT_ALLOW",
        "imageOutputOptions": {
            "mimeType": "image/jpeg",
            "compressionQuality": 85,
        },
    },
)

print(response.data[0].b64_json)
```

```bash showLineNumbers title="imageConfig via Proxy"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "gemini-3.1-flash-image-preview",
    "prompt": "A nano banana on a desk",
    "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K",
        "personGeneration": "DONT_ALLOW",
        "imageOutputOptions": {
            "mimeType": "image/jpeg",
            "compressionQuality": 85
        }
    }
}'
```

## 支持的参数

Google AI Studio 图像生成支持以下 OpenAI 兼容参数：

| 参数 | 类型 | 说明 | 默认值 | 示例 |
|-----------|------|-------------|---------|---------|
| `prompt` | string | 要生成的图像的文字描述 | Required | `"A sunset over the ocean"` |
| `model` | string | 用于生成的模型 | Required | `"gemini/imagen-4.0-generate-001"` |
| `n` | integer | 生成图像的数量（1-4） | `1` | `2` |
| `size` | string | 图像尺寸 | `"1024x1024"` | `"512x512"`, `"1024x1024"` |
| `web_search_options` | object | 启用 Google Search grounding（仅限 Gemini 图像模型） | - | `{}` |
| `tools` | array | 传入 `{"type": "web_search"}` 或 `{"googleSearch": {}}`（仅限 Gemini 图像模型） | - | `[{"type": "web_search"}]` |
| `imageConfig` | object | 完整的 [ImageConfig](https://cloud.google.com/vertex-ai/docs/reference/rpc/google.cloud.aiplatform.v1#imageconfig) 对象（仅限 Gemini 图像模型）。字段：`aspectRatio`、`imageSize`、`personGeneration`、`imageOutputOptions` | - | `{"aspectRatio": "16:9", "imageSize": "2K"}` |

1. 在 [Google AI Studio](https://aistudio.google.com/) 注册账号
2. 在 [API Keys 页面](https://aistudio.google.com/app/apikey) 生成 API 密钥
3. 设置你的 `GEMINI_API_KEY` 环境变量
4. 使用 LiteLLM 开始生成图像

## 更多资源

- [Google AI Studio 文档](https://ai.google.dev/gemini-api/docs)
- [Imagen 模型概览](https://ai.google.dev/gemini-api/docs/imagen)
- [LiteLLM 图像生成指南](/docs/image_generation)
