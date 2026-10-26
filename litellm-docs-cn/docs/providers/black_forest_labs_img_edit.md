import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Black Forest Labs 图像编辑

Black Forest Labs 基于 FLUX 系列模型提供强大的图像编辑能力，可以根据文字描述修改已有图像。

## 概述

| 属性 | 说明 |
|----------|---------|
| 描述 | Black Forest Labs 图像编辑使用 FLUX Kontext 等模型，根据文本提示词对图像进行修改、局部重绘（inpainting）和边界扩展（outpainting）。 |
| LiteLLM 中的提供商路由 | `black_forest_labs/` |
| 提供商文档 | [Black Forest Labs API ↗](https://docs.bfl.ai/) |
| 支持的操作 | [`/images/edits`](#图像编辑) |

## 设置

### API 密钥

```python showLineNumbers
import os

# Set your Black Forest Labs API key
os.environ["BFL_API_KEY"] = "your-api-key-here"
```

请从 [Black Forest Labs](https://blackforestlabs.ai/) 获取你的 API 密钥。

## 支持的模型

| 模型名 | 说明 | 适用场景 |
|------------|-------------|----------|
| `black_forest_labs/flux-kontext-pro` | FLUX Kontext Pro：通过提示词进行通用图像编辑 | 常规编辑、风格迁移 |
| `black_forest_labs/flux-kontext-max` | FLUX Kontext Max：品质更高的编辑效果 | 高质量编辑 |
| `black_forest_labs/flux-pro-1.0-fill` | FLUX Pro Fill：基于蒙版的局部重绘 | 移除或替换物体 |
| `black_forest_labs/flux-pro-1.0-expand` | FLUX Pro Expand：边界扩展 | 扩展图像边界 |

## 图像编辑

### LiteLLM Python SDK 用法

<Tabs>
<TabItem value="basic-edit" label="基础用法">

```python showLineNumbers title="Basic Image Editing"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Edit an image with a prompt
response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add a green leaf to the scene",
)

# BFL returns URLs
print(response.data[0].url)
```

</TabItem>

<TabItem value="async-edit" label="异步用法">

```python showLineNumbers title="Async Image Editing"
import os
import asyncio
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

async def edit_image():
    response = await litellm.aimage_edit(
        model="black_forest_labs/flux-kontext-pro",
        image=open("path/to/your/image.png", "rb"),
        prompt="Make this image look like a watercolor painting",
    )
    print(response.data[0].url)

# Run the async function
asyncio.run(edit_image())
```

</TabItem>

<TabItem value="inpainting" label="局部重绘（Fill）">

```python showLineNumbers title="Inpainting with Mask"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Use flux-pro-1.0-fill for inpainting
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-fill",
    image=open("path/to/your/image.png", "rb"),
    mask=open("path/to/mask.png", "rb"),  # White areas will be edited
    prompt="Replace with a beautiful garden",
    steps=50,  # BFL-specific parameter
    guidance=30,  # BFL-specific parameter
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="outpainting" label="边界扩展（Expand）">

```python showLineNumbers title="Outpainting - Expand Image Borders"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Use flux-pro-1.0-expand to extend image borders
response = litellm.image_edit(
    model="black_forest_labs/flux-pro-1.0-expand",
    image=open("path/to/your/image.png", "rb"),
    prompt="Continue the scene with a mountain landscape",
    top=256,     # Expand 256 pixels at top
    bottom=256,  # Expand 256 pixels at bottom
    left=128,    # Expand 128 pixels at left
    right=128,   # Expand 128 pixels at right
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="advanced" label="高级参数">

```python showLineNumbers title="Advanced Image Editing with BFL Parameters"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Edit image with BFL-specific parameters
response = litellm.image_edit(
    model="black_forest_labs/flux-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Transform into cyberpunk style with neon lights",
    seed=42,                    # For reproducible results
    output_format="png",        # png or jpeg
    safety_tolerance=2,         # 0-6, higher = more permissive
    aspect_ratio="16:9",        # Output aspect ratio
)

print(response.data[0].url)
```

</TabItem>
</Tabs>

### LiteLLM 代理服务器用法

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Black Forest Labs Image Editing Configuration"
model_list:
  - model_name: bfl-kontext-pro
    litellm_params:
      model: black_forest_labs/flux-kontext-pro
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-kontext-max
    litellm_params:
      model: black_forest_labs/flux-kontext-max
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-fill
    litellm_params:
      model: black_forest_labs/flux-pro-1.0-fill
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_edit

  - model_name: bfl-expand
    litellm_params:
      model: black_forest_labs/flux-pro-1.0-expand
      api_key: os.environ/BFL_API_KEY
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

#### 3. 发起图像编辑请求

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="Black Forest Labs via Proxy - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Edit image with FLUX Kontext Pro
response = client.images.edit(
    model="bfl-kontext-pro",
    image=open("path/to/your/image.png", "rb"),
    prompt="Add magical sparkles and fairy dust",
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="Black Forest Labs via Proxy - cURL"
curl --location 'http://localhost:4000/v1/images/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'model="bfl-kontext-pro"' \
--form 'prompt="Add a sunset in the background"' \
--form 'image=@"path/to/your/image.png"'
```

</TabItem>
</Tabs>

## 支持的参数

### OpenAI 兼容参数

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| `image` | file | 待编辑的图像文件 | Required |
| `prompt` | string | 描述期望修改效果的文本 | Required |
| `model` | string | 要使用的 FLUX 模型 | Required |
| `mask` | file | 用于局部重绘的蒙版图像（flux-pro-1.0-fill） | Optional |
| `n` | integer | 生成图像的数量（BFL 每次请求返回 1 张） | `1` |
| `size` | string | 映射到 aspect_ratio | Optional |
| `response_format` | string | `url` 或 `b64_json` | `url` |

### Black Forest Labs 专属参数

| 参数 | 类型 | 说明 | 默认值 | 适用模型 |
|-----------|------|-------------|---------|--------|
| `seed` | integer | 用于结果复现的随机种子 | Random | All |
| `output_format` | string | 输出格式：`png` 或 `jpeg` | `png` | All |
| `safety_tolerance` | integer | 安全过滤容忍度（0-6） | 2 | All |
| `aspect_ratio` | string | 输出宽高比（如 `16:9`、`1:1`） | Original | Kontext models |
| `steps` | integer | 推理步数 | Model default | Fill |
| `guidance` | float | 引导强度（guidance scale） | Model default | Fill |
| `grow_mask` | integer | 蒙版向外扩展的像素数 | 0 | Fill |
| `top` | integer | 顶部向外扩展的像素数 | 0 | Expand |
| `bottom` | integer | 底部向外扩展的像素数 | 0 | Expand |
| `left` | integer | 左侧向外扩展的像素数 | 0 | Expand |
| `right` | integer | 右侧向外扩展的像素数 | 0 | Expand |

## 工作原理

Black Forest Labs 采用基于轮询（polling）的 API：

1. **提交请求**：LiteLLM 将你的图像和提示词发送给 BFL
2. **获取任务 ID**：BFL 返回一个任务 ID 和轮询 URL
3. **轮询结果**：LiteLLM 自动轮询，直到图像生成完毕
4. **返回结果**：最终返回生成图像的 URL

轮询过程完全由 LiteLLM 自动处理，你只需调用 `image_edit()`，即可拿到最终结果。

## 入门

1. 在 [Black Forest Labs](https://blackforestlabs.ai/) 注册账号
2. 在仪表板中获取你的 API 密钥
3. 设置 `BFL_API_KEY` 环境变量
4. 使用 `litellm.image_edit()` 搭配任意支持的模型

## 其他资源

- [Black Forest Labs 文档](https://docs.bfl.ai/)
- [FLUX 模型信息](https://blackforestlabs.ai/)
