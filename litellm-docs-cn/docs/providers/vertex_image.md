# Vertex AI 图像生成

Vertex AI 支持两类图像生成：

1. **Gemini 图像生成模型**（Nano Banana 🍌）：通过 `generateContent` API 实现对话式图像生成
2. **Imagen 模型**：通过 `predict` API 实现传统图像生成

| 属性 | 详情 |
|----------|---------|
| 描述 | Vertex AI 图像生成同时支持 Gemini 图像生成模型 |
| LiteLLM 提供商路由 | `vertex_ai/` |
| 提供商文档 | [Google Cloud Vertex AI 图像生成 ↗](https://cloud.google.com/vertex-ai/docs/generative-ai/image/generate-images) |
| Gemini 图像生成文档 | [Gemini 图像生成 ↗](https://ai.google.dev/gemini-api/docs/image-generation) |

## 快速上手

### Gemini 图像生成模型

Gemini 图像生成模型支持对话式图像创作，能力包括：
- 文生图（text-to-image）
- 图像编辑（文本 + 图像 → 图像）
- 多轮图像细化
- 高保真文字渲染
- 最高 4K 分辨率（Gemini 3 Pro）

```python showLineNumbers title="Gemini 2.5 Flash Image"
import litellm

# Generate a single image
response = await litellm.aimage_generation(
    prompt="A nano banana dish in a fancy restaurant with a Gemini theme",
    model="vertex_ai/gemini-2.5-flash-image",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
)

print(response.data[0].b64_json)  # Gemini returns base64 images
```

```python showLineNumbers title="Gemini 3 Pro Image Preview (4K output)"
import litellm

# Generate high-resolution image
response = await litellm.aimage_generation(
    prompt="Da Vinci style anatomical sketch of a dissected Monarch butterfly",
    model="vertex_ai/gemini-3-pro-image-preview",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
    # Optional: specify image size for Gemini 3 Pro
    # imageSize="4K",  # Options: "1K", "2K", "4K"
)

print(response.data[0].b64_json)
```

### Google 搜索接地（Grounding）

Gemini 图像模型（例如 `gemini-3.1-flash-image-preview`、`gemini-3-pro-image-preview`）在 `/v1/images/generations` 上支持 Google 搜索。LiteLLM 会把 `web_search_options` 或 OpenAI 风格的 `web_search` 工具，映射到底层 `generateContent` 请求中 Gemini 的 `googleSearch` 工具。

```python showLineNumbers title="Image generation with Google Search"
import litellm

response = await litellm.aimage_generation(
    prompt="Generate an image of the latest iPhone design",
    model="vertex_ai/gemini-3.1-flash-image-preview",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    web_search_options={},
)

print(response.data[0].b64_json)
```

```python showLineNumbers title="Using OpenAI-style web_search tool"
import litellm

response = await litellm.aimage_generation(
    prompt="Generate an image of the latest iPhone design",
    model="vertex_ai/gemini-3.1-flash-image-preview",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    tools=[{"type": "web_search"}],
)
```

通过 LiteLLM 代理（`/v1/images/generations`）：

```bash showLineNumbers title="Proxy request with web_search_options"
curl -X POST 'http://localhost:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "gemini-3.1-flash-image-preview",
    "prompt": "Generate an image of the latest iPhone design",
    "web_search_options": {}
}'
```

### 传递 imageConfig（Gemini 模型）

Gemini 图像生成模型支持完整的 [`ImageConfig`](https://cloud.google.com/vertex-ai/docs/reference/rpc/google.cloud.aiplatform.v1#imageconfig) 对象。在任意 `/v1/images/generations` 请求中传入 `imageConfig`，LiteLLM 都会把其中所有字段原样转发给 `generationConfig.imageConfig`。

| 字段 | 类型 | 说明 |
|---|---|---|
| `aspectRatio` | string | `"1:1"`、`"16:9"`、`"9:16"`、`"4:3"`、`"3:4"`、`"4:5"`、`"5:4"`、`"2:3"`、`"3:2"`、`"21:9"` |
| `imageSize` | string | `"1K"`、`"2K"`、`"4K"`（Gemini 3 Pro 及更高版本支持） |
| `personGeneration` | string | `"DONT_ALLOW"`、`"ALLOW_ADULT"`、`"ALLOW_ALL"` |
| `imageOutputOptions` | object | `{"mimeType": "image/jpeg"\|"image/png"\|"image/webp", "compressionQuality": 0–100}` |

```python showLineNumbers title="Passing imageConfig via Python SDK"
import litellm

response = await litellm.aimage_generation(
    model="vertex_ai/gemini-3.1-flash-image",
    prompt="A nano banana on a desk",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
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
```

```bash showLineNumbers title="Passing imageConfig via Proxy"
curl -X POST 'http://localhost:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "gemini-3.1-flash-image",
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

也可以用扁平参数（flat params）作为 `aspectRatio` 和 `imageSize` 的简写：

```python showLineNumbers title="Flat param shorthand"
response = await litellm.aimage_generation(
    model="vertex_ai/gemini-3.1-flash-image",
    prompt="A nano banana on a desk",
    aspect_ratio="16:9",   # or aspectRatio="16:9"
    image_size="2K",       # or imageSize="2K"
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
)
```

扁平参数（`aspect_ratio`、`image_size`、`aspectRatio`、`imageSize`）与 `imageConfig` 同时存在时，会覆盖其中同名的键。

### Imagen 模型

```python showLineNumbers title="Imagen Image Generation"
import litellm

# Generate a single image
response = await litellm.aimage_generation(
    prompt="An olympic size swimming pool with crystal clear water and modern architecture",
    model="vertex_ai/imagen-4.0-generate-001",
    vertex_ai_project="your-project-id",
    vertex_ai_location="us-central1",
    n=1,
    size="1024x1024",
)

print(response.data[0].b64_json)  # Imagen also returns base64 images
```

### LiteLLM 代理

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Vertex AI Image Generation Configuration"
model_list:
  - model_name: vertex-imagen
    litellm_params:
      model: vertex_ai/imagen-4.0-generate-001
      vertex_ai_project: "your-project-id"
      vertex_ai_location: "us-central1"
      vertex_ai_credentials: "path/to/service-account.json"  # Optional if using environment auth
```

#### 2. 启动 LiteLLM 代理服务器

```bash title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 使用 OpenAI Python SDK 发送请求

```python showLineNumbers title="Basic Image Generation via Proxy"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-proxy-api-key"      # Your proxy API key
)

# Generate image
response = client.images.generate(
    model="vertex-imagen",
    prompt="An olympic size swimming pool with crystal clear water and modern architecture",
)

print(response.data[0].url)
```

## 支持的模型

### Gemini 图像生成模型

- `vertex_ai/gemini-2.5-flash-image`：快速、高效的图像生成（1024px 分辨率）
- `vertex_ai/gemini-3.1-flash-image-preview`：支持 Google 搜索接地的快速图像生成
- `vertex_ai/gemini-3-pro-image-preview`：高级模型，支持 4K 输出、Google 搜索接地与思考模式（thinking mode）
- `vertex_ai/gemini-2.0-flash-preview-image`：预览版模型
- `vertex_ai/gemini-2.5-flash-image-preview`：预览版模型

### Imagen 模型

- `vertex_ai/imagegeneration@006`：旧版 Imagen 模型
- `vertex_ai/imagen-4.0-generate-001`：最新 Imagen 模型
- `vertex_ai/imagen-3.0-generate-001`：Imagen 3.0 模型

:::tip

**我们支持所有 Vertex AI 图像生成模型，发送 litellm 请求时只需把 `model=vertex_ai/<any-model-on-vertex_ai>` 作为前缀设置即可**。

:::

如需查看完整且最新的支持模型列表，请访问：[https://models.litellm.ai/](https://models.litellm.ai/)
