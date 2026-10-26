import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Black Forest Labs 图像生成

Black Forest Labs 通过其 FLUX 模型提供最先进的文本转图像（text-to-image）生成能力。

## 概览

| 属性 | 详情 |
|----------|---------|
| 说明 | Black Forest Labs FLUX 模型，用于高质量文本转图像生成 |
| LiteLLM 提供商路由 | `black_forest_labs/` |
| 提供商文档 | [Black Forest Labs API ↗](https://docs.bfl.ai/) |
| 支持的操作 | [`/images/generations`](#图像生成) |

## 设置

### API 密钥

```python showLineNumbers
import os

# Set your Black Forest Labs API key
os.environ["BFL_API_KEY"] = "your-api-key-here"
```

请从 [Black Forest Labs](https://blackforestlabs.ai/) 获取你的 API 密钥。

## 支持的模型

| 模型名称 | 说明 | 价格 |
|------------|-------------|-------|
| `black_forest_labs/flux-pro-1.1` | 快速可靠的标准生成 | $0.04/张 |
| `black_forest_labs/flux-pro-1.1-ultra` | 超高分辨率（最高 4MP） | $0.06/张 |
| `black_forest_labs/flux-dev` | 开发/开源版本 | $0.025/张 |
| `black_forest_labs/flux-pro` | 最初的 pro 模型 | $0.05/张 |

## 图像生成

### 用法：LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基础用法">

```python showLineNumbers title="基础图像生成"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate an image
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A beautiful sunset over the ocean with sailing boats",
)

# BFL returns URLs
print(response.data[0].url)
```

</TabItem>

<TabItem value="async" label="异步用法">

```python showLineNumbers title="异步图像生成"
import os
import asyncio
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

async def generate_image():
    response = await litellm.aimage_generation(
        model="black_forest_labs/flux-pro-1.1",
        prompt="A futuristic city skyline at night",
    )
    print(response.data[0].url)

# Run the async function
asyncio.run(generate_image())
```

</TabItem>

<TabItem value="size" label="自定义尺寸">

```python showLineNumbers title="自定义尺寸图像生成"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate with specific dimensions
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A majestic mountain landscape",
    size="1792x1024",  # Maps to width/height
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="ultra" label="超高分辨率">

```python showLineNumbers title="flux-pro-1.1-ultra 超高分辨率生成"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate ultra high-resolution image
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1-ultra",
    prompt="Detailed portrait of a fantasy character",
    size="2048x2048",    # Up to 4MP supported
    quality="hd",        # Maps to raw=True for natural look
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="advanced" label="高级参数">

```python showLineNumbers title="使用 BFL 参数的高级图像生成"
import os
import litellm

# Set your API key
os.environ["BFL_API_KEY"] = "your-api-key-here"

# Generate with BFL-specific parameters
response = litellm.image_generation(
    model="black_forest_labs/flux-pro-1.1",
    prompt="A cute orange cat sitting on a windowsill",
    seed=42,                    # For reproducible results
    output_format="png",        # png or jpeg
    safety_tolerance=2,         # 0-6, higher = more permissive
    prompt_upsampling=True,     # Enhance prompt for better results
)

print(response.data[0].url)
```

</TabItem>
</Tabs>

### 用法：LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers title="Black Forest Labs 图像生成配置"
model_list:
  - model_name: flux-pro
    litellm_params:
      model: black_forest_labs/flux-pro-1.1
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

  - model_name: flux-ultra
    litellm_params:
      model: black_forest_labs/flux-pro-1.1-ultra
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

  - model_name: flux-dev
    litellm_params:
      model: black_forest_labs/flux-dev
      api_key: os.environ/BFL_API_KEY
    model_info:
      mode: image_generation

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

#### 2. 启动 LiteLLM 代理服务器

```bash showLineNumbers title="启动 LiteLLM 代理服务器"
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 发起图像生成请求

<Tabs>
<TabItem value="openai-sdk" label="OpenAI SDK">

```python showLineNumbers title="通过代理使用 Black Forest Labs - OpenAI SDK"
from openai import OpenAI

# Initialize client with your proxy URL
client = OpenAI(
    base_url="http://localhost:4000",
    api_key="sk-<your-litellm-api-key>"
)

# Generate image with FLUX Pro
response = client.images.generate(
    model="flux-pro",
    prompt="A beautiful garden with colorful flowers",
    size="1024x1024",
)

print(response.data[0].url)
```

</TabItem>

<TabItem value="curl" label="cURL">

```bash showLineNumbers title="通过代理使用 Black Forest Labs - cURL"
curl -X POST 'http://localhost:4000/v1/images/generations' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "flux-pro",
    "prompt": "A beautiful garden with colorful flowers",
    "size": "1024x1024"
  }'
```

</TabItem>
</Tabs>

## 支持的参数

### OpenAI 兼容参数

| 参数 | 类型 | 说明 | 映射 |
|-----------|------|-------------|---------|
| `prompt` | string | 要生成图像的文字描述 | 直接传递 |
| `model` | string | 要使用的 FLUX 模型 | 直接传递 |
| `size` | string | 图像尺寸（如 `1024x1024`） | 映射到 `width` 与 `height` |
| `n` | integer | 生成图像的数量（仅 ultra 模型支持，最多 4 张） | 映射到 `num_images` |
| `quality` | string | 设为 `hd` 可获得更自然的观感 | ultra 模型下映射到 `raw=True` |
| `response_format` | string | `url` 或 `b64_json` | 直接传递 |

### Black Forest Labs 专属参数

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| `width` | integer | 图像宽度（256-1920，16 的倍数） | 1024 |
| `height` | integer | 图像高度（256-1920，16 的倍数） | 1024 |
| `aspect_ratio` | string | width/height 的替代写法（如 `16:9`、`1:1`） | - |
| `seed` | integer | 用于结果可复现的随机种子 | Random |
| `output_format` | string | 输出格式：`png` 或 `jpeg` | `png` |
| `safety_tolerance` | integer | 安全过滤器容忍度（0-6，数值越高越宽松） | 2 |
| `prompt_upsampling` | boolean | 增强提示词以获得更好效果 | `false` |

### Ultra 模型专属参数

| 参数 | 类型 | 说明 | 默认值 |
|-----------|------|-------------|---------|
| `raw` | boolean | 原始模式，画面更自然、合成感更低 | `false` |
| `num_images` | integer | 生成图像的数量（1-4） | 1 |

## 工作原理

Black Forest Labs 采用基于轮询（polling）的 API：

1. **提交请求**：LiteLLM 将你的提示词发送给 BFL。
2. **获取任务 ID**：BFL 返回任务 ID 和轮询 URL。
3. **轮询结果**：LiteLLM 自动轮询，直到图像生成完毕。
4. **返回结果**：返回生成图像的 URL。

整个轮询过程由 LiteLLM 自动完成，你只需调用 `image_generation()`，就能拿到结果。

## 入门

1. 在 [Black Forest Labs](https://blackforestlabs.ai/) 注册账号
2. 在仪表板（dashboard）中获取你的 API 密钥
3. 设置 `BFL_API_KEY` 环境变量
4. 使用 `litellm.image_generation()` 调用任意受支持的模型

## 更多资源

- [Black Forest Labs 文档](https://docs.bfl.ai/)
- [Black Forest Labs 图像编辑](./black_forest_labs_img_edit.md)：用于编辑已有图像
- [FLUX 模型信息](https://blackforestlabs.ai/)
