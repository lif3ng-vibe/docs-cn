# OpenRouter
LiteLLM 支持 [OpenRouter](https://openrouter.ai/docs) 的所有文本 / 对话 / 视觉 / 嵌入模型

<a target="_blank" href="https://colab.research.google.com/github/BerriAI/litellm/blob/main/cookbook/LiteLLM_OpenRouter.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

## 用法
```python
import os
from litellm import completion

os.environ["OPENROUTER_API_KEY"] = ""
os.environ["OPENROUTER_API_BASE"] = "" # [OPTIONAL] defaults to https://openrouter.ai/api/v1
os.environ["OR_SITE_URL"] = "" # [OPTIONAL]
os.environ["OR_APP_NAME"] = "" # [OPTIONAL]

response = completion(
            model="openrouter/google/palm-2-chat-bison",
            messages=messages,
        )
```

## 通过环境变量配置

在生产环境中，你可以通过环境变量动态配置 base_url：

```python
import os
from litellm import completion

# Configure with environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")

# Set environment for LiteLLM
os.environ["OPENROUTER_API_KEY"] = OPENROUTER_API_KEY
os.environ["OPENROUTER_API_BASE"] = OPENROUTER_BASE_URL

response = completion(
    model="openrouter/google/palm-2-chat-bison",
    messages=messages,
    base_url=OPENROUTER_BASE_URL  # Explicitly pass base_url for clarity
)
```

这种方式让配置管理更灵活，能够轻松覆盖开发、预发布、生产等不同环境，也更容易在自托管与云端端点之间切换。

## OpenRouter 对话补全模型
🚨 LiteLLM 支持全部 OpenRouter 模型，传入 `model=openrouter/<your-openrouter-model>` 即可将请求发送到 OpenRouter。全部模型列表见[这里](https://openrouter.ai/models)

| 模型名称                | 函数调用                                       |
|---------------------------|-----------------------------------------------------|
| openrouter/openai/gpt-3.5-turbo | `completion('openrouter/openai/gpt-3.5-turbo', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/openai/gpt-3.5-turbo-16k | `completion('openrouter/openai/gpt-3.5-turbo-16k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/openai/gpt-4    | `completion('openrouter/openai/gpt-4', messages)`       | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/openai/gpt-4-32k | `completion('openrouter/openai/gpt-4-32k', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/anthropic/claude-2 | `completion('openrouter/anthropic/claude-2', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/anthropic/claude-instant-v1 | `completion('openrouter/anthropic/claude-instant-v1', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/google/palm-2-chat-bison | `completion('openrouter/google/palm-2-chat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/google/palm-2-codechat-bison | `completion('openrouter/google/palm-2-codechat-bison', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/meta-llama/llama-2-13b-chat | `completion('openrouter/meta-llama/llama-2-13b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |
| openrouter/meta-llama/llama-2-70b-chat | `completion('openrouter/meta-llama/llama-2-70b-chat', messages)` | `os.environ['OR_SITE_URL']`,`os.environ['OR_APP_NAME']`,`os.environ['OPENROUTER_API_KEY']` |

## 传递 OpenRouter 参数：transforms、models、route
把 `transforms`、`models`、`route` 作为参数传给 `litellm.completion()`

```python
import os
from litellm import completion

os.environ["OPENROUTER_API_KEY"] = ""

response = completion(
            model="openrouter/google/palm-2-chat-bison",
            messages=messages,
            transforms = [""],
            route= ""
        )
```

## 嵌入

```python
from litellm import embedding
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = embedding(
    model="openrouter/openai/text-embedding-3-small",
    input=["good morning from litellm", "this is another item"],
)
print(response)
```

## 图像生成

OpenRouter 通过部分模型支持图像生成，例如 Google Gemini 的图像生成模型。LiteLLM 会把标准的图像生成请求转换为 OpenRouter 的对话补全格式。

### 支持的参数

- `size`：对应 OpenRouter 的 `aspect_ratio` 格式
  - `1024x1024` → `1:1`（正方形）
  - `1536x1024` → `3:2`（横版）
  - `1024x1536` → `2:3`（竖版）
  - `1792x1024` → `16:9`（宽幅横版）
  - `1024x1792` → `9:16`（长幅竖版）

- `quality`：对应 OpenRouter 的 `image_size` 格式（Gemini 模型）
  - `low` 或 `standard` → `1K`
  - `medium` → `2K`
  - `high` 或 `hd` → `4K`

- `n`：生成图像的数量

### 用法

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Basic image generation
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A beautiful sunset over a calm ocean",
)
print(response)
```

### 带参数的高级用法

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Generate high-quality landscape image
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A serene mountain landscape with a lake",
    size="1536x1024",  # Landscape format
    quality="high",     # High quality (4K)
)

# Access the generated image
image_data = response.data[0]
if image_data.b64_json:
    # Base64 encoded image
    print(f"Generated base64 image: {image_data.b64_json[:50]}...")
elif image_data.url:
    # Image URL
    print(f"Generated image URL: {image_data.url}")
```

### 使用 OpenRouter 专属参数

也可以通过 `image_config` 直接传入 OpenRouter 专属参数：

```python
from litellm import image_generation
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A futuristic cityscape at night",
    image_config={
        "aspect_ratio": "16:9",  # OpenRouter native format
        "image_size": "4K"       # OpenRouter native format
    }
)
print(response)
```

### 响应格式

响应遵循 LiteLLM 标准的 ImageResponse 格式：

```python
{
    "created": 1703658209,
    "data": [{
        "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",  # Base64 encoded image
        "url": None,
        "revised_prompt": None
    }],
    "usage": {
        "input_tokens": 10,
        "output_tokens": 1290,
        "total_tokens": 1300
    }
}
```

### 成本追踪

OpenRouter 会在响应中返回成本信息，LiteLLM 会自动追踪：

```python
response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A cute baby sea otter",
)

# Cost is available in the response metadata
print(f"Request cost: ${response._hidden_params['additional_headers']['llm_provider-x-litellm-response-cost']}")
```

## 图像编辑

OpenRouter 通过部分模型支持图像编辑，例如 Google Gemini 的图像模型。LiteLLM 会把图像编辑请求转发到 OpenRouter 的对话补全端点，源图像以 base64 data URL 的形式传入，并携带 `modalities: ["image", "text"]`。

### 支持的模型

| 模型 | 说明 |
|-------|-------------|
| `openrouter/google/gemini-2.5-flash-image` | Gemini 2.5 Flash，支持图像编辑 |

全部可用图像模型见 [OpenRouter 模型列表](https://openrouter.ai/models?modality=image)。

### 支持的参数

| 参数 | OpenRouter 映射 | 说明 |
|-----------|--------------------|-------|
| `size` | `image_config.aspect_ratio` | `1024x1024` → `1:1`, `1536x1024` → `3:2`, `1024x1536` → `2:3`, `1792x1024` → `16:9`, `1024x1792` → `9:16` |
| `quality` | `image_config.image_size` | `low`/`standard` → `1K`, `medium` → `2K`, `high`/`hd` → `4K` |
| `n` | `n` | 图像数量 |

:::note
`quality=high`（4K）仅 `google/gemini-3-pro-image-preview` 与 `google/gemini-3.1-flash-image-preview` 支持；`google/gemini-2.5-flash-image` 模型最高支持到 `medium`（2K）。
:::

### 用法

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Basic image edit
response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("original_image.png", "rb"),
    prompt="Make the sky a vibrant purple sunset",
)

print(response)
```

### 带参数的高级用法

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

# Edit with size and quality parameters
response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=open("photo.png", "rb"),
    prompt="Add northern lights to the sky",
    size="1536x1024",   # Maps to aspect_ratio 3:2
    quality="high",      # Maps to image_size 4K
)

# Access the edited image
image_data = response.data[0]
if image_data.b64_json:
    import base64
    with open("edited.png", "wb") as f:
        f.write(base64.b64decode(image_data.b64_json))
```

### 多图编辑

```python
from litellm import image_edit
import os

os.environ["OPENROUTER_API_KEY"] = "your-api-key"

response = image_edit(
    model="openrouter/google/gemini-2.5-flash-image",
    image=[
        open("scene.png", "rb"),
        open("style_reference.png", "rb"),
    ],
    prompt="Blend the reference style into the scene",
)

print(response)
```
