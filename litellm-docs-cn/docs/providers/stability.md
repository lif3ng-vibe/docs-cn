# Stability AI
https://stability.ai/

## 概览

| 属性 | 说明 |
|-------|-------|
| 简介 | Stability AI 打造开放的 AI 模型，覆盖图像、视频、音频与 3D 生成，以 Stable Diffusion 闻名。 |
| LiteLLM 提供商路由 | `stability/` |
| 提供商文档链接 | [Stability AI API ↗](https://platform.stability.ai/docs/api-reference) |
| 支持的操作 | [`/images/generations`](#图像生成)、[`/images/edits`](#图像编辑) |

LiteLLM 通过 Stability AI 的 REST API（而非 Bedrock）支持 Stability AI 的图像生成调用。

## API 密钥

```python
# env variable
os.environ['STABILITY_API_KEY'] = "your-api-key"
```

API 密钥可前往 [Stability AI Platform](https://platform.stability.ai/) 获取。

## 图像生成

### 用法 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Stability AI image generation call
response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: sd3
    litellm_params:
      model: stability/sd3.5-large
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动代理

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 测试

```bash showLineNumbers
curl --location 'http://0.0.0.0:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "sd3",
    "prompt": "A beautiful sunset over a calm ocean"
}'
```

### 高级用法 - 附加参数

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    size="1792x1024",  # Maps to aspect_ratio 16:9
    negative_prompt="blurry, low quality",  # Stability-specific
    seed=12345,  # For reproducibility
)
print(response)
```

### 支持的参数

Stability AI 支持以下 OpenAI 兼容参数：

| 参数 | 类型 | 说明 | 示例 |
|-----------|------|-------------|---------|
| `size` | string | 图像尺寸（映射为 aspect_ratio） | `"1024x1024"` |
| `n` | integer | 图像数量（注意：Stability 每次请求仅返回 1 张） | `1` |
| `response_format` | string | 响应格式（Stability 仅支持 `b64_json`） | `"b64_json"` |

### 尺寸与宽高比映射

`size` 参数会自动映射为 Stability 的 `aspect_ratio`：

| OpenAI 尺寸 | Stability 宽高比 |
|-------------|----------------------|
| `1024x1024` | `1:1` |
| `1792x1024` | `16:9` |
| `1024x1792` | `9:16` |
| `512x512` | `1:1` |
| `256x256` | `1:1` |

### 使用 Stability 专有参数

可以在请求中直接传入 Stability AI 专有的参数：

```python showLineNumbers
from litellm import image_generation
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

response = image_generation(
    model="stability/sd3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    # Stability-specific parameters
    negative_prompt="blurry, watermark, text",
    aspect_ratio="16:9",  # Use directly instead of size
    seed=42,
    output_format="png",  # png, jpeg, or webp
)
print(response)
```

### 支持的图像生成模型

| 模型名 | 调用方式 | 说明 |
|------------|---------------|-------------|
| sd3 | `image_generation(model="stability/sd3", ...)` | Stable Diffusion 3 |
| sd3-large | `image_generation(model="stability/sd3-large", ...)` | SD3 Large |
| sd3-large-turbo | `image_generation(model="stability/sd3-large-turbo", ...)` | SD3 Large Turbo（更快） |
| sd3-medium | `image_generation(model="stability/sd3-medium", ...)` | SD3 Medium |
| sd3.5-large | `image_generation(model="stability/sd3.5-large", ...)` | SD 3.5 Large（推荐） |
| sd3.5-large-turbo | `image_generation(model="stability/sd3.5-large-turbo", ...)` | SD 3.5 Large Turbo |
| sd3.5-medium | `image_generation(model="stability/sd3.5-medium", ...)` | SD 3.5 Medium |
| stable-image-ultra | `image_generation(model="stability/stable-image-ultra", ...)` | Stable Image Ultra |
| stable-image-core | `image_generation(model="stability/stable-image-core", ...)` | Stable Image Core |

有关可用模型与功能的更多详情，请参阅：https://platform.stability.ai/docs/api-reference

## 响应格式

Stability AI 返回 base64 格式的图像，响应结构与 OpenAI 兼容：

```python
{
    "created": 1234567890,
    "data": [
        {
            "b64_json": "iVBORw0KGgo..."  # Base64 encoded image
        }
    ]
}
```

## 图像编辑

Stability AI 支持多种图像编辑操作，包括局部重绘（inpainting）、图像放大（upscaling）、图像外扩（outpainting）、背景移除（background removal）等。

:::info[可选参数]
**注意**：不同 Stability 模型对参数的要求不同：
- 部分模型不需要 `prompt`（例如图像放大、背景移除）。
- `outpaint` 模型接受数字类型的 `left` 和 `right` 像素数量。Stability 用于垂直方向外扩的 `up`、`down` 字段不会被 LiteLLM 转发，因此目前经由 `stability/` 只能做水平方向的外扩。
- 风格迁移（Style Transfer）目前经由 `stability/` 无法使用：`stability/style-transfer` 会被解析到风格指南端点（`/v2beta/stable-image/control/style`），输入也总是以 `image` 发送，而 Stability 的风格迁移端点要求 `init_image`。
:::

### 用法 - LiteLLM Python SDK

#### 局部重绘（用蒙版编辑）

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Inpainting - edit specific areas using a mask
response = image_edit(
    model="stability/inpaint",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"), 
    prompt="Add a beautiful sunset in the masked area",
    size="1024x1024",
)
print(response)
```

#### 图像放大

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Conservative upscaling - preserves details
response = image_edit(
    model="stability/conservative",
    image=open("low_res_image.png", "rb"),
    prompt="Upscale this image while preserving details",
)

# Creative upscaling - adds creative details
response = image_edit(
    model="stability/creative",
    image=open("low_res_image.png", "rb"),
    prompt="Upscale and enhance with creative details",
    creativity=0.3,  # 0-0.35, higher = more creative
)

# Fast upscaling - quick upscaling (no prompt needed)
response = image_edit(
    model="stability/fast",
    image=open("low_res_image.png", "rb"),
    # No prompt required for fast upscale
)
print(response)
```

#### 图像外扩

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Extend image beyond its borders
response = image_edit(
    model="stability/outpaint",
    image=open("original_image.png", "rb"),
    prompt="Extend this landscape with mountains",
    left=100,   # Pixels to extend on the left
    right=100,  # Pixels to extend on the right
)
print(response)
```

#### 背景移除

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Remove background from image
response = image_edit(
    model="stability/remove-background",
    image=open("portrait.png", "rb"),
    # No prompt required for fast upscale
)
print(response)
```

#### 搜索与替换

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Search and replace objects in image
response = image_edit(
    model="stability/search-and-replace",
    image=open("scene.png", "rb"),
    prompt="A red sports car",
    search_prompt="blue sedan",  # What to replace
)

# Search and recolor
response = image_edit(
    model="stability/search-and-recolor",
    image=open("scene.png", "rb"),
    prompt="Make it golden yellow",
    select_prompt="the car",  # What to recolor
)
print(response)
```

#### 图像控制（草图/结构）

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Control with sketch
response = image_edit(
    model="stability/sketch",
    image=open("sketch.png", "rb"),
    prompt="Turn this sketch into a realistic photo",
    control_strength=0.7,  # 0-1, higher = more control
)

# Control with structure
response = image_edit(
    model="stability/structure",
    image=open("structure_reference.png", "rb"),
    prompt="Generate image following this structure",
    control_strength=0.7,
)
print(response)
```

#### 擦除对象

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Erase objects from image
response = image_edit(
    model="stability/erase",
    image=open("scene.png", "rb"),
    mask=open("object_mask.png", "rb"),  # Mask the object to erase
    # No prompt needed
)
print(response)
```
#### 风格指南

```python showLineNumbers
from litellm import image_edit
import os

os.environ['STABILITY_API_KEY'] = "your-api-key"

# Generate a new image in the style of a reference image
response = image_edit(
    model="stability/style",
    image=open("style_reference.png", "rb"),  # Style reference
    prompt="A lighthouse on a cliff at sunset",
)

print(response)
```

### 支持的图像编辑模型

| 模型名 | 调用方式 | 说明 |
|------------|---------------|-------------|
| inpaint | `image_edit(model="stability/inpaint", ...)` | 用蒙版做局部重绘 |
| conservative | `image_edit(model="stability/conservative", ...)` | 保守放大 |
| creative | `image_edit(model="stability/creative", ...)` | 创意放大 |
| fast | `image_edit(model="stability/fast", ...)` | 快速放大 |
| outpaint | `image_edit(model="stability/outpaint", ...)` | 向外扩展图像边界 |
| remove-background | `image_edit(model="stability/remove-background", ...)` | 移除背景 |
| search-and-replace | `image_edit(model="stability/search-and-replace", ...)` | 搜索并替换对象 |
| search-and-recolor | `image_edit(model="stability/search-and-recolor", ...)` | 搜索并重新着色 |
| sketch | `image_edit(model="stability/sketch", ...)` | 以草图控制 |
| structure | `image_edit(model="stability/structure", ...)` | 以结构控制 |
| erase | `image_edit(model="stability/erase", ...)` | 擦除对象 |
| style | `image_edit(model="stability/style", ...)` | 应用风格指南 |

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: stability-inpaint
    litellm_params:
      model: stability/inpaint
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_edit

  - model_name: stability-upscale
    litellm_params:
      model: stability/conservative
      api_key: os.environ/STABILITY_API_KEY
    model_info:
      mode: image_edit

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动代理

```bash showLineNumbers
litellm --config config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 测试

```bash showLineNumbers
curl -X POST "http://0.0.0.0:4000/v1/images/edits" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -F "model=stability-inpaint" \
  -F "image=@original_image.png" \
  -F "mask=@mask_image.png" \
  -F "prompt=Add a beautiful garden in the masked area"
```

## AWS Bedrock 上的 Stability

LiteLLM 也支持通过 AWS Bedrock 使用 Stability AI 模型。如果你已经在使用 AWS 基础设施，这会很有用。

### 用法 - Bedrock Stability

```python showLineNumbers
from litellm import image_edit
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Bedrock Stability inpainting
response = image_edit(
    model="bedrock/us.stability.stable-image-inpaint-v1:0",
    image=open("original_image.png", "rb"),
    mask=open("mask_image.png", "rb"),
    prompt="Add flowers in the masked area",
)
print(response)

# Fast upscale without prompt
response = image_edit(
    model="bedrock/stability.stable-fast-upscale-v1:0",
    image=open("low_res_image.png", "rb"),
)

# Outpaint with numeric parameters
response = image_edit(
    model="bedrock/stability.stable-outpaint-v1:0",
    image=open("original_image.png", "rb"),
    left=100,   # Automatically converted to int
    right=100,
    up=50,
    down=50,
)

print(response)
```

### 支持的 Bedrock Stability 模型

所有 Stability AI 图像编辑模型都可通过 Bedrock 使用，加上 `bedrock/` 前缀即可：

| 直连 API 模型 | Bedrock 模型 | 说明 |
|------------------|---------------|-------------|
| stability/inpaint | bedrock/us.stability.stable-image-inpaint-v1:0 | 局部重绘 |
| stability/conservative | bedrock/stability.stable-conservative-upscale-v1:0 | 保守放大 |
| stability/creative | bedrock/stability.stable-creative-upscale-v1:0 | 创意放大 |
| stability/fast | bedrock/stability.stable-fast-upscale-v1:0 | 快速放大 |
| stability/outpaint | bedrock/stability.stable-outpaint-v1:0 | 外扩 |
| stability/remove-background | bedrock/stability.stable-image-remove-background-v1:0 | 移除背景 |
| stability/search-and-replace | bedrock/stability.stable-image-search-replace-v1:0 | 搜索并替换 |
| stability/search-and-recolor | bedrock/stability.stable-image-search-recolor-v1:0 | 搜索并重新着色 |
| stability/sketch | bedrock/stability.stable-image-control-sketch-v1:0 | 以草图控制 |
| stability/structure | bedrock/stability.stable-image-control-structure-v1:0 | 以结构控制 |
| stability/erase | bedrock/stability.stable-image-erase-object-v1:0 | 擦除对象 |

**注意**：Bedrock 模型 ID 可能使用 `us.stability.*` 或 `stability.*` 前缀，具体取决于所在区域和模型。

## 路由对比

LiteLLM 提供两条路由来使用 Stability AI 模型：

| 路由 | 提供商 | 适用场景 | 图像生成 | 图像编辑 |
|-------|----------|----------|------------------|---------------|
| `stability/` | Stability AI 直连 API | 直连访问，覆盖全部最新模型 | ✅ | ✅ |
| `bedrock/stability.*` | AWS Bedrock | 与 AWS 集成，具备企业版特性 | ✅ | ✅ |

需要直连 API 访问就用 `stability/`；已经在用 AWS Bedrock 的话，就用 `bedrock/stability.*`。
