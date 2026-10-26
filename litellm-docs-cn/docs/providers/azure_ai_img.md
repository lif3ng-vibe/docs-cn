import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI 图像生成（Black Forest Labs - Flux）

Azure AI 基于 Black Forest Labs 的 FLUX 模型提供强大的图像生成能力，可根据文字描述创建高质量图像。

## 概览

| 属性 | 详情 |
|----------|---------|
| 描述 | Azure AI 图像生成使用 FLUX 模型，根据文字描述生成高质量图像。 |
| LiteLLM 中的提供商（provider）路由 | `azure_ai/` |
| 提供商文档 | [Azure AI FLUX 模型 ↗](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659) |
| 支持的操作 | [`/images/generations`](#图像生成)、[`/images/edits`](#图像编辑) |

## 设置

### API 密钥与 Base URL

```python showLineNumbers
# Set your Azure AI API credentials
import os
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://your-endpoint.eastus2.inference.ai.azure.com/
```

API 密钥（API key）和端点可从 [Azure AI Studio](https://ai.azure.com/) 获取。

## 支持的模型

| 模型名称 | 描述 | 每张图片成本 |
|------------|-------------|----------------|
| `azure_ai/FLUX-1.1-pro` | 最新版 FLUX 1.1 Pro 模型，用于高质量图像生成 | $0.04 |
| `azure_ai/FLUX.1-Kontext-pro` | FLUX 1 Kontext Pro 模型，具备更强的上下文理解能力 | $0.04 |
| `azure_ai/flux.2-pro` | FLUX 2 Pro 模型，面向新一代图像生成 | $0.04 |
| `azure_ai/FLUX.2-flex` | FLUX 2 Flex 模型，可调节 `guidance` 和 `steps` | 每百万像素 $0.05（1024x1024 分辨率下为 $0.052） |

FLUX 2 系列模型不走 Azure OpenAI 部署路由，而是由 Azure 的 Black Forest Labs 路由提供服务：`flux.2-pro` 的请求发往 `api_base` 下的 `/providers/blackforestlabs/v1/flux-2-pro`，`FLUX.2-flex` 的请求发往 `/providers/blackforestlabs/v1/flux-2-flex`。模型名匹配不区分大小写，因此 `azure_ai/flux.2-flex` 同样有效。FLUX 2 Flex 按生成图像的像素计费，LiteLLM 记录的成本取决于你请求的 `size`（或 `width` 与 `height`）；未指定尺寸时按 1024x1024 记录，这也是 Azure 默认生成的尺寸。

## 图像生成

### LiteLLM Python SDK 用法

<Tabs>
<TabItem value="basic" label="基础用法">

```python showLineNumbers title="Basic Image Generation"
import litellm
import os

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"

# Generate a single image
response = litellm.image_generation(
    model="azure_ai/FLUX.1-Kontext-pro",
    prompt="A cute baby sea otter swimming in crystal clear water",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"]
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="flux11" label="FLUX 1.1 Pro">

```python showLineNumbers title="FLUX 1.1 Pro Image Generation"
import litellm
import os

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"

# Generate image with FLUX 1.1 Pro
response = litellm.image_generation(
    model="azure_ai/FLUX-1.1-pro",
    prompt="A futuristic cityscape at night with neon lights and flying cars",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"]
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="flux2" label="FLUX 2 Pro">

```python showLineNumbers title="FLUX 2 Pro Image Generation"
import litellm
import os

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://litellm-ci-cd-prod.services.ai.azure.com

# Generate image with FLUX 2 Pro
response = litellm.image_generation(
    model="azure_ai/flux.2-pro",
    prompt="A photograph of a red fox in an autumn forest",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version="preview",
    size="1024x1024",
    n=1
)

print(response.data[0].b64_json)  # FLUX 2 returns base64 encoded images
```

</TabItem>

<TabItem value="flux2flex" label="FLUX 2 Flex">

```python showLineNumbers title="FLUX 2 Flex Image Generation"
import litellm
import os

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://your-resource.services.ai.azure.com

# Generate image with FLUX 2 Flex, tuning guidance and steps
response = litellm.image_generation(
    model="azure_ai/FLUX.2-flex",
    prompt="A photograph of a red fox in an autumn forest",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version="preview",
    size="1536x1024",
    n=1,
    guidance=4.5,
    steps=32,
)

print(response.data[0].b64_json)  # FLUX 2 returns base64 encoded images
```

</TabItem>

<TabItem value="async" label="异步用法">

```python showLineNumbers title="Async Image Generation"
import litellm
import asyncio
import os

async def generate_image():
    # Set your API credentials
    os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
    os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"

    # Generate image asynchronously
    response = await litellm.aimage_generation(
        model="azure_ai/FLUX.1-Kontext-pro",
        prompt="A beautiful sunset over mountains with vibrant colors",
        api_base=os.environ["AZURE_AI_API_BASE"],
        api_key=os.environ["AZURE_AI_API_KEY"],
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

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"

# Generate image with additional parameters
response = litellm.image_generation(
    model="azure_ai/FLUX-1.1-pro",
    prompt="A majestic dragon soaring over a medieval castle at dawn",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    n=1,
    size="1024x1024",
    quality="standard"
)

for image in response.data:
    print(f"Generated image URL: {image.url}")
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器用法

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Azure AI Image Generation Configuration"
model_list:
  - model_name: azure-flux-kontext
    litellm_params:
      model: azure_ai/FLUX.1-Kontext-pro
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
    model_info:
      mode: image_generation

  - model_name: azure-flux-11-pro
    litellm_params:
      model: azure_ai/FLUX-1.1-pro
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
    model_info:
      mode: image_generation

  - model_name: azure-flux-2-pro
    litellm_params:
      model: azure_ai/flux.2-pro
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
      api_version: preview
    model_info:
      mode: image_generation

  - model_name: azure-flux-2-flex
    litellm_params:
      model: azure_ai/FLUX.2-flex
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
      api_version: preview
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

```python showLineNumbers title="Azure AI Image Generation via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="sk-<your-litellm-api-key>"                  # Your proxy API key
)

# Generate image with FLUX Kontext Pro
response = client.images.generate(
    model="azure-flux-kontext",
    prompt="A serene Japanese garden with cherry blossoms and a peaceful pond",
    n=1,
    size="1024x1024"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="litellm-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Azure AI Image Generation via Proxy - LiteLLM SDK"
import litellm

# Configure LiteLLM to use your proxy
response = litellm.image_generation(
    model="litellm_proxy/azure-flux-11-pro",
    prompt="A cyberpunk warrior in a neon-lit alleyway",
    api_base="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Azure AI Image Generation via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/generations' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "azure-flux-kontext",
    "prompt": "A cozy coffee shop interior with warm lighting and rustic wooden furniture",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
</Tabs>

## 图像编辑

FLUX 2 Pro 支持图像编辑：传入一张输入图像，再附带一段描述所需修改的提示词即可。

### LiteLLM Python SDK 用法

<Tabs>
<TabItem value="basic-edit" label="基础图像编辑">

```python showLineNumbers title="Basic Image Editing with FLUX 2 Pro"
import litellm
import os

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://litellm-ci-cd-prod.services.ai.azure.com

# Edit an existing image
response = litellm.image_edit(
    model="azure_ai/flux.2-pro",
    prompt="Add a red hat to the subject",
    image=open("input_image.png", "rb"),
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version="preview",
)

print(response.data[0].b64_json)  # FLUX 2 returns base64 encoded images
```

</TabItem>

<TabItem value="async-edit" label="异步图像编辑">

```python showLineNumbers title="Async Image Editing"
import litellm
import asyncio
import os

async def edit_image():
    os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
    os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"

    response = await litellm.aimage_edit(
        model="azure_ai/flux.2-pro",
        prompt="Change the background to a sunset beach",
        image=open("input_image.png", "rb"),
        api_base=os.environ["AZURE_AI_API_BASE"],
        api_key=os.environ["AZURE_AI_API_KEY"],
        api_version="preview",
    )

    return response

asyncio.run(edit_image())
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器用法

<Tabs>
<TabItem value="curl-edit" label="cURL">

```bash showLineNumbers title="Image Edit via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'model="azure-flux-2-pro"' \
--form 'prompt="Add sunglasses to the person"' \
--form 'image=@"input_image.png"'
```

</TabItem>

<TabItem value="openai-sdk-edit" label="OpenAI SDK">

```python showLineNumbers title="Image Edit via Proxy - OpenAI SDK"
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

response = client.images.edit(
    model="azure-flux-2-pro",
    prompt="Make the sky more dramatic with storm clouds",
    image=open("input_image.png", "rb"),
)

print(response.data[0].b64_json)
```

</TabItem>
</Tabs>

## 支持的参数

Azure AI 图像生成支持以下与 OpenAI 兼容的参数：

| 参数 | 类型 | 描述 | 默认值 | 示例 |
|-----------|------|-------------|---------|---------|
| `prompt` | string | 待生成图像的文字描述 | Required | `"A sunset over the ocean"` |
| `model` | string | 用于生成的 FLUX 模型 | Required | `"azure_ai/FLUX.1-Kontext-pro"` |
| `n` | integer | 生成图像的数量（1-4） | `1` | `2` |
| `size` | string | 图像尺寸 | `"1024x1024"` | `"512x512"`、`"1024x1024"` |
| `api_base` | string | 你的 Azure AI 端点 URL | Required | `"https://your-endpoint.eastus2.inference.ai.azure.com/"` |
| `api_key` | string | 你的 Azure AI API 密钥 | Required | 环境变量或直接给定值 |

### FLUX 2 参数

FLUX 2 Pro 和 FLUX 2 Flex 接受 `n`、`size`、`output_format`、`seed`、`safety_tolerance` 和 `aspect_ratio`，也接受 Black Forest Labs 的原生命名 `width`、`height`、`num_images`、`guidance` 和 `steps`。`size` 会拆成 `width` 和 `height` 发送（`"1536x1024"` 变为 `width: 1536, height: 1024`），`n` 会转成 `num_images` 发送，而 `size: "auto"` 不发送任何尺寸，由 Azure 采用其默认值。不符合 `WxH` 形式的 `size`（例如 `"large"`）会被 400 状态码拒绝，报错中会注明期望的格式。仅 OpenAI 提供的字段 `user`、`quality`、`background`、`moderation` 和 `output_compression` 会被接受并丢弃，因此面向 `gpt-image-1` 编写的客户端无需设置 `drop_params` 即可继续工作。其余不支持的参数一律拒绝，除非设置了 `drop_params`。FLUX 2 模型无论 `n` 取值如何，Azure 每次请求都只返回一张图像。

| 参数 | 类型 | 描述 | 示例 |
|-----------|------|-------------|---------|
| `size` | string | `WxH` 形式的尺寸，或 `"auto"` 表示采用 Azure 默认值 | `"1536x1024"` |
| `width`、`height` | integer | 以像素为单位的尺寸，可替代 `size` | `1536`、`1024` |
| `output_format` | string | 图像编码格式 | `"jpeg"`、`"png"` |
| `seed` | integer | 用于复现结果的随机种子 | `42` |
| `safety_tolerance` | integer | 内容审核严格程度 | `2` |
| `aspect_ratio` | string | 生成图像的宽高比 | `"16:9"` |
| `guidance` | float | 提示词遵循程度（FLUX 2 Flex） | `4.5` |
| `steps` | integer | 扩散步数（FLUX 2 Flex） | `32` |

## 快速上手

1. 在 [Azure AI Studio](https://ai.azure.com/) 注册账号
2. 在 Azure AI Studio 工作区中部署一个 FLUX 模型
3. 从部署详情中获取 API 密钥和端点
4. 设置 `AZURE_AI_API_KEY` 和 `AZURE_AI_API_BASE` 环境变量
5. 开始使用 LiteLLM 生成图像

## 更多资源

- [Azure AI Studio 文档](https://docs.microsoft.com/en-us/azure/ai-services/)
- [FLUX 模型发布公告](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659)
