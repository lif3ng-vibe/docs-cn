# Recraft
https://www.recraft.ai/

## 概览

| 属性 | 详情 |
|-------|-------|
| 描述 | Recraft 是一款 AI 驱动的设计工具，可生成高质量图像，并支持对风格和内容的精准控制。 |
| LiteLLM 提供商路由 | `recraft/` |
| 提供商文档链接 | [Recraft ↗](https://www.recraft.ai/docs) |
| 支持的操作 | [`/images/generations`](#图像生成), [`/images/edits`](#图像编辑) |

LiteLLM 支持 Recraft 的图像生成与图像编辑调用。

## API Base 与密钥
```python
# env variable
os.environ['RECRAFT_API_KEY'] = "your-api-key"
os.environ['RECRAFT_API_BASE'] = "https://external.api.recraft.ai"  # [optional] 
```

## 图像生成

### 用法 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

# recraft image generation call
response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: recraft-v3
    litellm_params:
      model: recraft/recraftv3
      api_key: os.environ/RECRAFT_API_KEY
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
    "model": "recraft-v3",
    "prompt": "A beautiful sunset over a calm ocean",
}'
```

### 进阶用法 - 携带额外参数

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 支持的参数

Recraft 支持以下 OpenAI 兼容参数：

| 参数 | 类型 | 说明 | 示例 |
|-----------|------|-------------|---------|
| `n` | integer | 生成图像的数量（1-4） | `1` |
| `response_format` | string | 响应格式（`url` 或 `b64_json`） | `"url"` |
| `size` | string | 图像尺寸 | `"1024x1024"` |
| `style` | string | 图像风格 / 艺术方向 | `"realistic"` |

### 使用非 OpenAI 参数

若要传入 OpenAI 不支持的参数，可将其直接放入请求体，LiteLLM 会自动将其路由给 recraft。

本例中我们会向 recraft 图像生成调用传入 `style_id` 参数。

**LiteLLM Python SDK 用法**

```python showLineNumbers
from litellm import image_generation
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

response = image_generation(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
    style_id="your-style-id",
)
```

**LiteLLM 代理服务器 + OpenAI Python SDK 用法**

```python showLineNumbers
from openai import OpenAI
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

client = OpenAI(api_key=os.environ['RECRAFT_API_KEY'])

response = client.images.generate(
    model="recraft/recraftv3",
    prompt="A beautiful sunset over a calm ocean",
    extra_body={
        "style_id": "your-style-id",
    },
)
print(response)
```

### 支持的图像生成模型

**注意：所有 recraft 模型均受 LiteLLM 支持** 只需按 `recraft/<model_name>` 的格式传入模型名，litellm 就会自动将其路由到 recraft。

| 模型名 | 函数调用 |
|------------|---------------|
| recraftv3 | `image_generation(model="recraft/recraftv3", prompt="...")` |
| recraftv2 | `image_generation(model="recraft/recraftv2", prompt="...")` |

有关可用模型与功能的更多细节，参见：https://www.recraft.ai/docs

## 图像编辑

### 用法 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

# Open the image file
with open("reference_image.png", "rb") as image_file:
    # recraft image edit call
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image that combines all the reference images. Make sure the person looks like a CTO.",
        image=image_file,
    )
print(response)
```

### 用法 - LiteLLM 代理服务器

#### 1. 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: recraft-v3
    litellm_params:
      model: recraft/recraftv3
      api_key: os.environ/RECRAFT_API_KEY
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
curl --location 'http://0.0.0.0:4000/v1/images/edits' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--form 'model="recraft-v3"' \
--form 'prompt="Create a studio ghibli style image that combines all the reference images. Make sure the person looks like a CTO."' \
--form 'image=@"reference_image.png"'
```

### 进阶用法 - 携带额外参数

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

with open("reference_image.png", "rb") as image_file:
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        n=2,  # Generate 2 variations
        response_format="url",  # Return URLs instead of base64
        style="realistic_image",  # Set artistic style
        strength=0.5  # Control transformation strength (0-1)
    )
print(response)
```

### 支持的图像编辑参数

Recraft 支持以下 OpenAI 兼容的图像编辑参数：

| 参数 | 类型 | 说明 | 默认值 | 示例 |
|-----------|------|-------------|---------|---------|
| `n` | integer | 生成图像的数量（1-4） | `1` | `2` |
| `response_format` | string | 响应格式（`url` 或 `b64_json`） | `"url"` | `"b64_json"` |
| `style` | string | 图像风格 / 艺术方向 | - | `"realistic_image"` |
| `strength` | float | 控制图像变换幅度（0.0-1.0） | `0.2` | `0.5` |

### 使用非 OpenAI 参数

不属于 OpenAI API 的 Recraft 专有参数，可以在请求中直接传入：

**LiteLLM Python SDK 用法**

```python showLineNumbers
from litellm import image_edit
import os

os.environ['RECRAFT_API_KEY'] = "your-api-key"

with open("reference_image.png", "rb") as image_file:
    response = image_edit(
        model="recraft/recraftv3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        style_id="your-style-id",  # Recraft-specific parameter
        strength=0.7
    )
```

**LiteLLM 代理服务器 + OpenAI Python SDK 用法**

```python showLineNumbers
from openai import OpenAI
import os

client = OpenAI(
    api_key="sk-<your-litellm-master-key>",  # your LiteLLM proxy master key
    base_url="http://0.0.0.0:4000"  # your LiteLLM proxy URL
)

with open("reference_image.png", "rb") as image_file:
    response = client.images.edit(
        model="recraft-v3",
        prompt="Create a studio ghibli style image",
        image=image_file,
        extra_body={
            "style_id": "your-style-id",
            "strength": 0.7
        }
    )
print(response)
```

### 支持的图像编辑模型

**注意：所有 recraft 模型均受 LiteLLM 支持** 只需按 `recraft/<model_name>` 的格式传入模型名，litellm 就会自动将其路由到 recraft。

| 模型名 | 函数调用 |
|------------|---------------|
| recraftv3 | `image_edit(model="recraft/recraftv3", ...)` |

## API 密钥配置

前往 [Recraft 官网](https://www.recraft.ai/)获取 API 密钥（API key），然后将其设置为环境变量：

```bash
export RECRAFT_API_KEY="your-api-key"
```
