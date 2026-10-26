import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Fal AI

Fal AI 让你快速、可扩展地使用 FLUX、Stable Diffusion、Imagen 等最先进的图像生成模型。

## 概述

| 属性 | 说明 |
|----------|---------|
| 简介 | Fal AI 提供经过优化的基础设施，可低延迟、大规模地运行图像生成模型。 |
| LiteLLM 上的提供商路由 | `fal_ai/` |
| 提供商文档 | [Fal AI 官方文档 ↗](https://fal.ai/models) |
| 支持的操作 | [`/images/generations`](#图像生成) |

## 设置

### API 密钥

```python showLineNumbers
import os

# Set your Fal AI API key
os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"
```

API 密钥可从 [fal.ai](https://fal.ai/) 获取。

## 支持的模型

| 模型名称 | 说明 | 文档 |
|------------|-------------|---------------|
| `fal_ai/fal-ai/flux-pro/v1.1` | FLUX Pro v1.1 - 兼顾速度与质量 | [文档 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1) |
| `fal_ai/flux/schnell` | Flux Schnell - 低延迟生成，支持 `image_size` | [文档 ↗](https://fal.ai/models/fal-ai/flux/schnell) |
| `fal_ai/fal-ai/bytedance/seedream/v3/text-to-image` | ByteDance Seedream v3 - 文生图，支持 `image_size` 控制 | [文档 ↗](https://fal.ai/models/fal-ai/bytedance/seedream/v3/text-to-image) |
| `fal_ai/fal-ai/bytedance/dreamina/v3.1/text-to-image` | ByteDance Dreamina v3.1 - 文生图，支持 `image_size` 控制 | [文档 ↗](https://fal.ai/models/fal-ai/bytedance/dreamina/v3.1/text-to-image) |
| `fal_ai/fal-ai/flux-pro/v1.1-ultra` | FLUX Pro v1.1 Ultra - 高质量图像生成 | [文档 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra) |
| `fal_ai/fal-ai/imagen4/preview` | Google 的 Imagen 4 - 质量最高的模型 | [文档 ↗](https://fal.ai/models/fal-ai/imagen4/preview) |
| `fal_ai/fal-ai/recraft/v3/text-to-image` | Recraft v3 - 多种风格可选 | [文档 ↗](https://fal.ai/models/fal-ai/recraft/v3/text-to-image) |
| `fal_ai/fal-ai/ideogram/v3` | Ideogram v3 - 擅长文字排版的创意模型（Balanced 档：每张 $0.06） | [文档 ↗](https://fal.ai/models/fal-ai/ideogram/v3) |
| `fal_ai/fal-ai/stable-diffusion-v35-medium` | Stable Diffusion v3.5 Medium | [文档 ↗](https://fal.ai/models/fal-ai/stable-diffusion-v35-medium) |
| `fal_ai/bria/text-to-image/3.2` | Bria 3.2 - 商用级生成 | [文档 ↗](https://fal.ai/models/bria/text-to-image/3.2) |

## 图像生成

### LiteLLM Python SDK 用法

<Tabs>
<TabItem value="basic" label="基本用法">

```python showLineNumbers title="基本图像生成"
import litellm
import os

# Set your API key
os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate an image
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A serene mountain landscape at sunset with vibrant colors"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="imagen4" label="Imagen 4">

```python showLineNumbers title="Google Imagen 4 生成"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with Imagen 4
response = litellm.image_generation(
    model="fal_ai/fal-ai/imagen4/preview",
    prompt="A vintage 1960s kitchen with flour package on countertop",
    aspect_ratio="16:9",
    num_images=1
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="recraft" label="Recraft v3">

```python showLineNumbers title="Recraft v3 指定风格生成"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with specific style
response = litellm.image_generation(
    model="fal_ai/fal-ai/recraft/v3/text-to-image",
    prompt="A red panda eating bamboo",
    style="realistic_image",
    image_size="landscape_4_3"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="async" label="异步用法">

```python showLineNumbers title="异步图像生成"
import litellm
import asyncio
import os

async def generate_image():
    os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"
    
    response = await litellm.aimage_generation(
        model="fal_ai/fal-ai/stable-diffusion-v35-medium",
        prompt="A cyberpunk cityscape with neon lights",
        guidance_scale=7.5,
        num_inference_steps=50
    )
    
    print(response.data[0].url)
    return response

asyncio.run(generate_image())
```

</TabItem>

<TabItem value="advanced" label="高级参数">

```python showLineNumbers title="FLUX Pro 高级参数生成"
import litellm
import os

os.environ["FAL_AI_API_KEY"] = "your-fal-api-key"

# Generate with advanced parameters
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A majestic dragon soaring over mountains",
    n=2,
    size="1792x1024",  # Maps to aspect_ratio="16:9"
    seed=42,
    safety_tolerance="2",
    enhance_prompt=True
)

for image in response.data:
    print(f"Generated image: {image.url}")
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器用法

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Fal AI 图像生成配置"
model_list:
  - model_name: flux-ultra
    litellm_params:
      model: fal_ai/fal-ai/flux-pro/v1.1-ultra
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation
  
  - model_name: imagen4
    litellm_params:
      model: fal_ai/fal-ai/imagen4/preview
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation
  
  - model_name: stable-diffusion
    litellm_params:
      model: fal_ai/fal-ai/stable-diffusion-v35-medium
      api_key: os.environ/FAL_AI_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动 LiteLLM 代理服务器

```bash showLineNumbers title="启动代理服务器"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 发起请求

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理生成 - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

response = client.images.generate(
    model="flux-ultra",
    prompt="A beautiful sunset over the ocean",
    n=1,
    size="1024x1024"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="通过代理生成 - LiteLLM SDK"
import litellm

response = litellm.image_generation(
    model="litellm_proxy/imagen4",
    prompt="A cozy coffee shop interior",
    api_base="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="通过代理生成 - cURL"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "stable-diffusion",
    "prompt": "A serene Japanese garden with cherry blossoms",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
</Tabs>



## 使用模型专属参数

LiteLLM 会把额外的参数原样转发给 Fal AI API。你可以在请求中传入模型专属参数，它们会被直接发送给 Fal AI。

```python showLineNumbers title="传入模型专属参数"
import litellm

# Any parameters beyond the standard ones are forwarded to Fal AI
response = litellm.image_generation(
    model="fal_ai/fal-ai/flux-pro/v1.1-ultra",
    prompt="A beautiful sunset",
    # Model-specific Fal AI parameters
    aspect_ratio="16:9",
    safety_tolerance="2",
    enhance_prompt=True,
    seed=42
)
```

各模型支持的完整参数列表见：
- [FLUX Pro v1.1-ultra 参数 ↗](https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra/api)
- [Imagen 4 参数 ↗](https://fal.ai/models/fal-ai/imagen4/preview/api)
- [Recraft v3 参数 ↗](https://fal.ai/models/fal-ai/recraft/v3/text-to-image/api)
- [Stable Diffusion v3.5 参数 ↗](https://fal.ai/models/fal-ai/stable-diffusion-v35-medium/api)
- [Bria 3.2 参数 ↗](https://fal.ai/models/bria/text-to-image/3.2/api)

## 支持的参数

适用于所有模型的标准 OpenAI 兼容参数：

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| `prompt` | string | 所需图像的文字描述 | Required |
| `model` | string | 要使用的 Fal AI 模型 | Required |
| `n` | integer | 要生成的图像数量（1-4） | `1` |
| `size` | string | 图像尺寸（映射为模型专属格式） | Model default |
| `api_key` | string | 你的 Fal AI API 密钥 | Environment variable |

## 快速上手

1. 在 [fal.ai](https://fal.ai/) 注册账号
2. 在账号设置中获取 API 密钥
3. 设置 `FAL_AI_API_KEY` 环境变量
4. 从 [Fal AI 模型画廊](https://fal.ai/models)中挑选一个模型
5. 开始用 LiteLLM 生成图像

## 更多资源

- [Fal AI 官方文档](https://fal.ai/docs)
- [模型画廊](https://fal.ai/models)
- [API 参考](https://fal.ai/docs/api-reference)
- [定价](https://fal.ai/pricing)
