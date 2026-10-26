import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI 图像编辑

Azure AI 借助 Black Forest Labs 的 FLUX 模型提供强大的图像编辑能力，可以根据文字描述修改现有图像。

## 概览

| 属性 | 说明 |
|----------|---------|
| 描述 | Azure AI 图像编辑使用 FLUX 模型，根据文本提示词修改现有图像。 |
| LiteLLM 提供商路由 | `azure_ai/` |
| 提供商文档 | [Azure AI FLUX 模型 ↗](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659) |
| 支持的操作 | [`/images/edits`](#图像编辑) |

## 设置

### API 密钥与 Base URL 和 API 版本

```python showLineNumbers
# Set your Azure AI API credentials
import os
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://your-endpoint.eastus2.inference.ai.azure.com/
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"  # Example API version
```

在 [Azure AI Studio](https://ai.azure.com/) 获取 API 密钥和端点。

## 支持的模型

| 模型名称 | 说明 | 单张图片成本 |
|------------|-------------|----------------|
| `azure_ai/FLUX.1-Kontext-pro` | FLUX 1 Kontext Pro 模型，上下文理解能力更强，适合编辑场景 | $0.04 |
| `azure_ai/flux.2-pro` | FLUX 2 Pro，每次编辑最多 8 张参考图 | $0.04 |
| `azure_ai/FLUX.2-flex` | FLUX 2 Flex，每次编辑最多 10 张参考图，`guidance` 与 `steps` 可调 | $0.05/百万像素（1024x1024 下为 $0.052） |

FLUX 2 编辑请求走的是与 FLUX 2 生成相同的模型专属 Black Forest Labs 路由（`/providers/blackforestlabs/v1/flux-2-pro` 或 `/providers/blackforestlabs/v1/flux-2-flex`），参考图以 base64 形式放在 JSON 请求体里，而不是 multipart 表单数据。把多个文件组成列表传给 `image`，即可同时参照多张参考图进行编辑。模型名匹配不区分大小写，所以 `azure_ai/flux.2-flex` 也能用。

## 图像编辑

### 用法 - LiteLLM Python SDK

<Tabs>
<TabItem value="basic-edit" label="基础用法">

```python showLineNumbers title="Basic Image Editing"
import os
import base64
from pathlib import Path

import litellm

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

# Edit an image with a prompt
response = litellm.image_edit(
    model="azure_ai/FLUX.1-Kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a winter theme with snow and cold colors",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version=os.environ["AZURE_AI_API_VERSION"]
)

img_base64 = response.data[0].get("b64_json")
img_bytes = base64.b64decode(img_base64)
path = Path("edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="async-edit" label="异步用法">

```python showLineNumbers title="Async Image Editing"
import os
import base64
from pathlib import Path

import litellm
import asyncio

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

async def edit_image():
    # Edit image asynchronously
    response = await litellm.aimage_edit(
        model="azure_ai/FLUX.1-Kontext-pro",
        image=open("path/to/your/image.png", "rb"),
        prompt="Make this image look like a watercolor painting",
        api_base=os.environ["AZURE_AI_API_BASE"],
        api_key=os.environ["AZURE_AI_API_KEY"],
        api_version=os.environ["AZURE_AI_API_VERSION"]
    )
    img_base64 = response.data[0].get("b64_json")
    img_bytes = base64.b64decode(img_base64)
    path = Path("async_edited_image.png")
    path.write_bytes(img_bytes)

# Run the async function
asyncio.run(edit_image())
```

</TabItem>

<TabItem value="advanced-edit" label="高级参数">

```python showLineNumbers title="Advanced Image Editing with Parameters"
import os
import base64
from pathlib import Path

import litellm

# Set your API credentials
os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"
os.environ["AZURE_AI_API_VERSION"] = "2025-04-01-preview"

# Edit image with additional parameters
response = litellm.image_edit(
    model="azure_ai/FLUX.1-Kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add magical elements like floating crystals and mystical lighting",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version=os.environ["AZURE_AI_API_VERSION"],
    n=1
)
img_base64 = response.data[0].get("b64_json")
img_bytes = base64.b64decode(img_base64)
path = Path("advanced_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="flux2-multi-edit" label="FLUX 2 多参考图">

```python showLineNumbers title="FLUX 2 Flex Edit with Several Reference Images"
import os
import base64
from pathlib import Path

import litellm

os.environ["AZURE_AI_API_KEY"] = "your-api-key-here"
os.environ["AZURE_AI_API_BASE"] = "your-azure-ai-endpoint"  # e.g., https://your-resource.services.ai.azure.com

# FLUX 2 Flex accepts up to 10 reference images, FLUX 2 Pro up to 8
response = litellm.image_edit(
    model="azure_ai/FLUX.2-flex",
    image=[open("subject.png", "rb"), open("style.png", "rb")],
    prompt="Render the subject from the first image in the style of the second",
    api_base=os.environ["AZURE_AI_API_BASE"],
    api_key=os.environ["AZURE_AI_API_KEY"],
    api_version="preview",
    size="1024x1024",
    guidance=4.5,
    steps=32,
)
img_bytes = base64.b64decode(response.data[0].get("b64_json"))
Path("flux2_edited_image.png").write_bytes(img_bytes)
```

</TabItem>
</Tabs>

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Azure AI Image Editing Configuration"
model_list:
  - model_name: azure-flux-kontext-edit
    litellm_params:
      model: azure_ai/FLUX.1-Kontext-pro
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
      api_version: os.environ/AZURE_AI_API_VERSION
    model_info:
      mode: image_edit

  - model_name: azure-flux-2-flex-edit
    litellm_params:
      model: azure_ai/FLUX.2-flex
      api_key: os.environ/AZURE_AI_API_KEY
      api_base: os.environ/AZURE_AI_API_BASE
      api_version: preview
    model_info:
      mode: image_edit

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动 LiteLLM 代理服务器

```bash showLineNumbers title="Start LiteLLM Proxy Server"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 使用 OpenAI Python SDK 发起图像编辑请求

<Tabs>
<TabItem value="openai-edit-sdk" label="OpenAI SDK">

```python showLineNumbers title="Azure AI Image Editing via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",  # Your proxy URL
    api_key="sk-<your-litellm-api-key>"                  # Your proxy API key
)

# Edit image with FLUX Kontext Pro
response = client.images.edit(
    model="azure-flux-kontext-edit",
    image=open("path/to/your/image.png", "rb"),
    prompt="Transform this image into a beautiful oil painting style",
)

img_base64 = response.data[0].b64_json
img_bytes = base64.b64decode(img_base64)
path = Path("proxy_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="litellm-edit-sdk" label="LiteLLM SDK">

```python showLineNumbers title="Azure AI Image Editing via Proxy - LiteLLM SDK"
import litellm

# Edit image through proxy
response = litellm.image_edit(
    model="litellm_proxy/azure-flux-kontext-edit",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a mystical forest background with magical creatures",
    api_base="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

img_base64 = response.data[0].b64_json
img_bytes = base64.b64decode(img_base64)
path = Path("proxy_edited_image.png")
path.write_bytes(img_bytes)
```

</TabItem>

<TabItem value="curl-edit" label="cURL">

```bash showLineNumbers title="Azure AI Image Editing via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'model="azure-flux-kontext-edit"' \
--form 'prompt="Convert this image to a vintage sepia tone with old-fashioned effects"' \
--form 'image=@"path/to/your/image.png"'
```

</TabItem>
</Tabs>

## 支持的参数

Azure AI 图像编辑支持以下 OpenAI 兼容参数：

| 参数 | 类型 | 说明 | 默认值 | 示例 |
|-----------|------|-------------|---------|---------|
| `image` | file | 要编辑的图片文件 | Required | File object or binary data |
| `prompt` | string | 描述期望改动的文字 | Required | `"Add snow and winter elements"` |
| `model` | string | 用于编辑的 FLUX 模型 | Required | `"azure_ai/FLUX.1-Kontext-pro"` |
| `n` | integer | 生成的编辑结果数量（只能指定 1） | `1` | `1` |
| `api_base` | string | 你的 Azure AI 端点 URL | Required | `"https://your-endpoint.eastus2.inference.ai.azure.com/"` |
| `api_key` | string | 你的 Azure AI API 密钥 | Required | Environment variable or direct value |
| `api_version` | string | Azure AI 的 API 版本 | Required | `"2025-04-01-preview"` |

FLUX 2 Pro 和 FLUX 2 Flex 的编辑请求接受与 [FLUX 2 生成](./azure_ai_img#flux-2-参数)相同的参数：`size`（或 `width` 与 `height`）、`output_format`、`seed`、`safety_tolerance`、`aspect_ratio`，Flex 还支持 `guidance` 和 `steps`。OpenAI 独有的 `user`、`quality`、`background`、`moderation`、`output_compression` 字段会被接受但直接丢弃，设置了这些字段的 OpenAI SDK 客户端仍能正常工作。

## 入门

1. 在 [Azure AI Studio](https://ai.azure.com/) 注册账号
2. 在 Azure AI Studio 工作区部署一个 FLUX 模型
3. 从部署详情中获取 API 密钥和端点
4. 设置 `AZURE_AI_API_KEY`、`AZURE_AI_API_BASE` 和 `AZURE_AI_API_VERSION` 环境变量
5. 准备好原始图片
6. 使用 `litellm.image_edit()` 通过文字指令修改图片

## 更多资源

- [Azure AI Studio 文档](https://docs.microsoft.com/en-us/azure/ai-services/)
- [FLUX 模型发布公告](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/black-forest-labs-flux-1-kontext-pro-and-flux1-1-pro-now-available-in-azure-ai-f/4434659)
