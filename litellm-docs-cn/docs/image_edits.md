import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /images/edits

LiteLLM 提供图像编辑功能，对应 OpenAI 的 `/images/edits` API 端点。现已同时支持单张与多张图像编辑。

| 功能 | 是否支持 | 说明 |
|---------|-----------|--------|
| 成本追踪 | ✅ | 适用于所有支持的模型 |
| 日志记录 | ✅ | 适用于所有集成 |
| 终端用户追踪 | ✅ | |
| 回退机制 | ✅ | 可在支持的模型之间使用 |
| 负载均衡 | ✅ | 可在支持的模型之间使用 |
| 支持的操作 | 创建图像编辑 | 支持单张与多张图像 |
| 支持的 LiteLLM SDK 版本 | 1.63.8+ | Gemini 支持需 1.79.3+ |
| 支持的 LiteLLM 代理版本 | 1.71.1+ | Gemini 支持需 1.79.3+ |
| 支持的 LLM 提供商 | **OpenAI**、**Gemini (Google AI Studio)**、**Vertex AI**、**OpenRouter**、**Stability AI**、**AWS Bedrock (Stability)**、**Black Forest Labs**、**Azure AI (FLUX)**、**Hosted vLLM (vLLM-Omni)** | Gemini 支持新的 `gemini-2.5-flash-image` 系列。Vertex AI 同时支持 Gemini 与 Imagen 模型。OpenRouter 通过对话补全（chat completion）路由图像编辑请求。Stability AI 与 Bedrock Stability 支持多种图像编辑操作。Black Forest Labs 支持 FLUX Kontext 模型。Hosted vLLM 则路由到 vLLM-Omni 服务器的 OpenAI 兼容 `/v1/images/edits` 端点。 |

 #### ⚡️在 [models.litellm.ai](https://models.litellm.ai/) 查看所有支持的模型与提供商


## 用法

### LiteLLM Python SDK

<Tabs>
<TabItem value="openai" label="OpenAI">

#### 基础图像编辑
```python showLineNumbers title="OpenAI Image Edit"
import litellm

# Edit an image with a prompt
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
    n=1,
    size="1024x1024"
)

print(response)
```

#### 多图编辑
```python showLineNumbers title="OpenAI Multiple Images Edit"
import litellm

# Edit multiple images with a prompt
response = litellm.image_edit(
    model="gpt-image-1",
    image=[
        open("image1.png", "rb"),
        open("image2.png", "rb"),
        open("image3.png", "rb")
    ],
    prompt="Apply vintage filter to all images",
    n=1,
    size="1024x1024"
)

print(response)
```

#### 使用蒙版的图像编辑
```python showLineNumbers title="OpenAI Image Edit with Mask"
import litellm

# Edit an image with a mask to specify the area to edit
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),  # Transparent areas will be edited
    prompt="Replace the background with a beach scene",
    n=2,
    size="512x512",
    response_format="url"
)

print(response)
```

#### 异步图像编辑
```python showLineNumbers title="Async OpenAI Image Edit"
import litellm
import asyncio

async def edit_image():
    response = await litellm.aimage_edit(
        model="gpt-image-1",
        image=open("original_image.png", "rb"),
        prompt="Make the image look like a painting",
        n=1,
        size="1024x1024",
        response_format="b64_json"
    )
    return response

# Run the async function
response = asyncio.run(edit_image())
print(response)
```

#### 异步多图编辑
```python showLineNumbers title="Async OpenAI Multiple Images Edit"
import litellm
import asyncio

async def edit_multiple_images():
    response = await litellm.aimage_edit(
        model="gpt-image-1",
        image=[
            open("portrait1.png", "rb"),
            open("portrait2.png", "rb")
        ],
        prompt="Add professional lighting to the portraits",
        n=1,
        size="1024x1024",
        response_format="url"
    )
    return response

# Run the async function
response = asyncio.run(edit_multiple_images())
print(response)
```

#### 使用自定义参数的图像编辑
```python showLineNumbers title="OpenAI Image Edit with Custom Parameters"
import litellm

# Edit image with additional parameters
response = litellm.image_edit(
    model="gpt-image-1",
    image=open("portrait.png", "rb"),
    prompt="Add sunglasses and a smile",
    n=3,
    size="1024x1024",
    response_format="url",
    user="user-123",
    timeout=60,
    extra_headers={"Custom-Header": "value"}
)

print(f"Generated {len(response.data)} image variations")
for i, image_data in enumerate(response.data):
    print(f"Image {i+1}: {image_data.url}")
```

```

</TabItem>

<TabItem value="gemini" label="Gemini">

#### 基础图像编辑
```python showLineNumbers title="Gemini Image Edit"
import base64
import os
from litellm import image_edit

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = image_edit(
    model="gemini/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Add aurora borealis to the night sky",
    size="1792x1024",  # mapped to aspectRatio=16:9 for Gemini
)

edited_image_bytes = base64.b64decode(response.data[0].b64_json)
with open("edited_image.png", "wb") as f:
    f.write(edited_image_bytes)
```

#### 多图编辑
```python showLineNumbers title="Gemini Multiple Images Edit"
import base64
import os
from litellm import image_edit

os.environ["GEMINI_API_KEY"] = "your-api-key"

response = image_edit(
    model="gemini/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene while keeping the subject sharp.",
)

for idx, image_obj in enumerate(response.data):
    with open(f"gemini_edit_{idx}.png", "wb") as f:
        f.write(base64.b64decode(image_obj.b64_json))
```

</TabItem>

<TabItem value="bfl" label="Black Forest Labs">

#### 基础图像编辑
```python showLineNumbers title="Black Forest Labs Image Edit"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("original_image.png", "rb"),
    prompt="Add a green leaf to the scene",
)

print(response.data[0].url)
```

#### 使用蒙版局部重绘
```python showLineNumbers title="Black Forest Labs Inpainting"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

# Use flux-pro-1.0-fill for inpainting
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-fill",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),
    prompt="Replace with a garden",
)

print(response.data[0].url)
```

#### 外绘扩图
```python showLineNumbers title="Black Forest Labs Outpainting"
import os
import litellm

os.environ["BFL_API_KEY"] = "your-api-key"

# Use flux-pro-1.0-expand to extend image borders
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-expand",
    image=open("original_image.png", "rb"),
    prompt="Continue the scene with mountains",
    top=256,
    bottom=256,
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="vertex_ai" label="Vertex AI">

#### Gemini 基础图像编辑
```python showLineNumbers title="Vertex AI Gemini Image Edit"
import os
import litellm

# Set Vertex AI credentials
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service-account.json"

response = litellm.image_edit(
    model="vertex_ai/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Add neon lights in the background",
    size="1024x1024",
)

print(response)
```

#### 支持蒙版的 Imagen 图像编辑
```python showLineNumbers title="Vertex AI Imagen Image Edit"
import os
import litellm

# Set Vertex AI credentials
os.environ["VERTEXAI_PROJECT"] = "your-gcp-project-id"
os.environ["VERTEXAI_LOCATION"] = "us-central1"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service-account.json"

# Imagen supports mask for inpainting
response = litellm.image_edit(
    model="vertex_ai/imagen-3.0-capability-001",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),  # Optional: for inpainting
    prompt="Turn this into watercolor style scenery",
    n=2,  # Number of variations
    size="1024x1024",
)

print(response)
```

</TabItem>

<TabItem value="openrouter" label="OpenRouter">

#### 基础图像编辑
```python showLineNumbers title="OpenRouter Image Edit"
import os
from litellm import image_edit

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Add aurora borealis to the night sky",
)

print(response)
```

#### 多图编辑
```python showLineNumbers title="OpenRouter Multiple Images Edit"
import os
from litellm import image_edit

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene",
    size="1536x1024",   # mapped to aspect_ratio 3:2
    quality="high",      # mapped to image_size 4K
)

print(response)
```

</TabItem>
<TabItem value="hosted_vllm" label="Hosted vLLM">

#### 基础图像编辑
```python showLineNumbers title="Hosted vLLM Image Edit"
import os
from litellm import image_edit

os.environ["HOSTED_VLLM_API_BASE"] = "http://localhost:8091"

response = image_edit(
    model="hosted_vllm/Qwen/Qwen-Image-Edit-2511",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
)

print(response)
```

</TabItem>
</Tabs>

### 配合 OpenAI SDK 使用 LiteLLM 代理


<Tabs>
<TabItem value="openai" label="OpenAI">

首先，将以下配置添加到 litellm 代理的 config.yaml 中：
```yaml showLineNumbers title="OpenAI Proxy Configuration"
model_list:
  - model_name: gpt-image-1
    litellm_params:
      model: gpt-image-1
      api_key: os.environ/OPENAI_API_KEY
```

启动 LiteLLM 代理服务器：

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 通过代理进行基础图像编辑
```python showLineNumbers title="OpenAI Proxy Image Edit"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="your-api-key"             # Your proxy API key
)

# Edit an image
response = client.images.edit(
    model="gpt-image-1",
    image=open("original_image.png", "rb"),
    prompt="Add a red hat to the person in the image",
    n=1,
    size="1024x1024"
)

print(response)
```

#### cURL 示例
```bash showLineNumbers title="cURL Image Edit Request"
curl -X POST "http://localhost:4000/v1/images/edits" \
  -H "Authorization: Bearer your-api-key" \
  -F "model=gpt-image-1" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Add a beautiful sunset in the background" \
  -F "n=1" \
  -F "size=1024x1024" \
  -F "response_format=url"
```

#### cURL 多图示例
```bash showLineNumbers title="cURL Multiple Images Edit Request"
curl -X POST "http://localhost:4000/v1/images/edits" \
  -H "Authorization: Bearer your-api-key" \
  -F "model=gpt-image-1" \
  -F "image=@image1.png" \
  -F "image=@image2.png" \
  -F "image=@image3.png" \
  -F "prompt=Apply artistic filter to all images" \
  -F "n=1" \
  -F "size=1024x1024" \
  -F "response_format=url"
```

```

</TabItem>

<TabItem value="gemini" label="Gemini">

1. 在 `config.yaml` 中添加 Gemini 图像编辑模型：
```yaml showLineNumbers title="Gemini Proxy Configuration"
model_list:
  - model_name: gemini-image-edit
    litellm_params:
      model: gemini/gemini-2.5-flash-image
      api_key: os.environ/GEMINI_API_KEY
```

2. 启动 LiteLLM 代理服务器：
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. 发起图像编辑请求（Gemini 的响应仅支持 base64）：
```bash showLineNumbers title="Gemini Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=gemini-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Add a warm golden-hour glow to the scene" \
  -F "size=1024x1024"
```

</TabItem>

<TabItem value="bfl" label="Black Forest Labs">

1. 在 `config.yaml` 中添加 Black Forest Labs 图像编辑模型：
```yaml showLineNumbers title="Black Forest Labs Proxy Configuration"
model_list:
  - model_name: bfl-kontext-pro
    litellm_params:
      model: black_forest_labs/flux-kontext-pro
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit
```

2. 启动 LiteLLM 代理服务器：
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. 发起图像编辑请求：
```bash showLineNumbers title="Black Forest Labs Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=bfl-kontext-pro" \
  -F "image=@original_image.png" \
  -F "prompt=Add a sunset in the background"
```

</TabItem>

<TabItem value="vertex_ai" label="Vertex AI">

1. 在 `config.yaml` 中添加 Vertex AI 图像编辑模型：
```yaml showLineNumbers title="Vertex AI Proxy Configuration"
model_list:
  - model_name: vertex-gemini-image-edit
    litellm_params:
      model: vertex_ai/gemini-2.5-flash-image
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/GOOGLE_APPLICATION_CREDENTIALS

  - model_name: vertex-imagen-image-edit
    litellm_params:
      model: vertex_ai/imagen-3.0-capability-001
      vertex_project: os.environ/VERTEXAI_PROJECT
      vertex_location: os.environ/VERTEXAI_LOCATION
      vertex_credentials: os.environ/GOOGLE_APPLICATION_CREDENTIALS
```

2. 启动 LiteLLM 代理服务器：
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. 发起图像编辑请求：
```bash showLineNumbers title="Vertex AI Gemini Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=vertex-gemini-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Add neon lights in the background" \
  -F "size=1024x1024"
```

4. 使用蒙版进行 Imagen 图像编辑：
```bash showLineNumbers title="Vertex AI Imagen Proxy Image Edit with Mask"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=vertex-imagen-image-edit" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Turn this into watercolor style scenery" \
  -F "n=2" \
  -F "size=1024x1024"
```

</TabItem>

<TabItem value="openrouter" label="OpenRouter">

1. 在 `config.yaml` 中添加 OpenRouter 图像编辑模型：
```yaml showLineNumbers title="OpenRouter Proxy Configuration"
model_list:
  - model_name: openrouter-image-edit
    litellm_params:
      model: openrouter/google/gemini-2.5-flash-image
      api_key: os.environ/OPENROUTER_API_KEY
```

2. 启动 LiteLLM 代理服务器：
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. 发起图像编辑请求：
```bash showLineNumbers title="OpenRouter Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=openrouter-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Make the sky a vibrant purple sunset" \
  -F "size=1024x1024"
```

</TabItem>
<TabItem value="hosted_vllm" label="Hosted vLLM">

1. 在 `config.yaml` 中添加 vLLM-Omni 图像编辑模型：
```yaml showLineNumbers title="Hosted vLLM Proxy Configuration"
model_list:
  - model_name: qwen-image-edit
    litellm_params:
      model: hosted_vllm/Qwen/Qwen-Image-Edit-2511
      api_base: http://localhost:8091
    model_info:
      mode: image_edit
```

2. 启动 LiteLLM 代理服务器：
```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml
```

3. 发起图像编辑请求：
```bash showLineNumbers title="Hosted vLLM Proxy Image Edit"
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer <YOUR-LITELLM-KEY>" \
  -F "model=qwen-image-edit" \
  -F "image=@original_image.png" \
  -F "prompt=Add a red hat to the person in the image"
```

</TabItem>
</Tabs>

## 支持的图像编辑参数

| 参数 | 类型 | 说明 | 是否必填 |
|-----------|------|-------------|----------|
| `image` | `FileTypes` | 要编辑的图像。必须是有效的 PNG 文件，小于 4MB，且为正方形。 | ✅ |
| `prompt` | `str` | 描述期望编辑效果的文本。 | ✅ |
| `model` | `str` | 用于图像编辑的模型 | 可选（默认为 `dall-e-2`） |
| `mask` | `str` | 一张附加图像，其完全透明的区域指示原图中需要编辑的位置。必须是有效的 PNG 文件，小于 4MB，且与 `image` 尺寸相同。 | 可选 |
| `n` | `int` | 要生成的图像数量。必须在 1 到 10 之间。 | 可选（默认为 1） |
| `size` | `str` | 生成图像的尺寸。必须是 `256x256`、`512x512` 或 `1024x1024` 之一。 | 可选（默认为 `1024x1024`） |
| `response_format` | `str` | 生成图像的返回格式。必须是 `url` 或 `b64_json` 之一。 | 可选（默认为 `url`） |
| `user` | `str` | 代表你的终端用户的唯一标识符。 | 可选 |


## 响应格式

响应遵循 OpenAI Images API 的格式：

```python showLineNumbers title="Image Edit Response Structure"
{
    "created": 1677649800,
    "data": [
        {
            "url": "https://example.com/edited_image_1.png"
        },
        {
            "url": "https://example.com/edited_image_2.png"
        }
    ]
}
```

对于 `b64_json` 格式：
```python showLineNumbers title="Base64 Response Structure"
{
    "created": 1677649800,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ]
}
```
