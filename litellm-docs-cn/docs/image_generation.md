
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 图像生成

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪（cost tracking） | ✅ | 适用于所有受支持的模型 |
| 日志记录（logging） | ✅ | 所有集成都可用 |
| 终端用户追踪 | ✅ | |
| 回退机制（fallbacks） | ✅ | 可在受支持的模型之间使用 |
| 负载均衡（loadbalancing） | ✅ | 可在受支持的模型之间使用 |
| 防护栏（guardrails） | ✅ | 作用于输入提示词（仅非流式） |
| 受支持的提供商 | OpenAI, Azure, Google AI Studio, Vertex AI, AWS Bedrock, Black Forest Labs, Recraft, OpenRouter, Xinference, Nscale | |

## 快速上手

### LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os 

# set api keys 
os.environ["OPENAI_API_KEY"] = ""

response = image_generation(prompt="A cute baby sea otter", model="dall-e-3")

print(f"response: {response}")
```

### LiteLLM 代理

### 配置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: gpt-image-1 ### RECEIVED MODEL NAME ###
    litellm_params: # all params accepted by litellm.image_generation()
      model: azure/gpt-image-1 ### MODEL NAME sent to `litellm.image_generation()` ###
      api_base: https://my-endpoint-europe-berri-992.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU" # does os.getenv("AZURE_API_KEY_EU")

```

### 启动代理

```bash showLineNumbers
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 测试

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl -X POST 'http://0.0.0.0:4000/v1/images/generations' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "gpt-image-1",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python showLineNumbers
from openai import OpenAI
client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://0.0.0.0:4000"
)


image = client.images.generate(
    prompt="A cute baby sea otter",
    model="dall-e-3",
)

print(image)
```
</TabItem>
</Tabs>

## `litellm.image_generation()` 的输入参数

:::info

任何非 OpenAI 的参数都会被视为提供商特定参数，并以 kwargs 的形式放入请求体发送给提供商。

[**查看保留参数**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L4082)
:::

### 必填字段

- `prompt`: *string* - 所需图像的文本描述。

### LiteLLM 可选字段

    model: Optional[str] = None,
    n: Optional[int] = None,
    quality: Optional[str] = None,
    response_format: Optional[str] = None,
    size: Optional[str] = None,
    style: Optional[str] = None,
    user: Optional[str] = None,
    timeout=600,  # default to 10 minutes
    api_key: Optional[str] = None,
    api_base: Optional[str] = None,
    api_version: Optional[str] = None,
    litellm_logging_obj=None,
    custom_llm_provider=None,

- `model`: *string (optional)* 用于图像生成的模型，默认为 openai/gpt-image-1。

- `n`: *int (optional)* 要生成的图像数量，取值必须在 1 到 10 之间。dall-e-3 仅支持 n=1。

- `quality`: *string (optional)* 生成图像的质量。
  *   `auto`（默认值）会为给定模型自动选择最佳质量。
  *   `gpt-image-1` 支持 `high`、`medium` 和 `low`。
  *   `dall-e-3` 支持 `hd` 和 `standard`。
  *   `dall-e-2` 仅提供 `standard` 一个选项。

- `response_format`: *string (optional)* 生成图像的返回格式，取值必须为 url 或 b64_json。

- `size`: *string (optional)* 生成图像的尺寸。`gpt-image-1` 的取值必须为 `1024x1024`、`1536x1024`（横向）、`1024x1536`（纵向）或 `auto`（默认值）；`dall-e-2` 的取值必须为 `256x256`、`512x512` 或 `1024x1024`；`dall-e-3` 的取值必须为 `1024x1024`、`1792x1024` 或 `1024x1792`。

- `timeout`: *integer* - 等待 API 响应的最长时间（秒），默认为 600 秒（10 分钟）。

- `user`: *string (optional)* 代表你终端用户的唯一标识符。

- `api_base`: *string (optional)* - 调用模型所用的 API 端点。

- `api_version`: *string (optional)* - （Azure 专用）本次调用使用的 API 版本；Azure 上的 dall-e-3 必须提供。

- `api_key`: *string (optional)* - 用于请求认证与授权的 API 密钥。若未提供，则使用默认 API 密钥。

- `api_type`: *string (optional)* - 要使用的 API 类型。

### `litellm.image_generation()` 的输出

```python

{
    "created": 1703658209,
    "data": [{
        'b64_json': None, 
        'revised_prompt': 'Adorable baby sea otter with a coat of thick brown fur, playfully swimming in blue ocean waters. Its curious, bright eyes gleam as it is surfaced above water, tiny paws held close to its chest, as it playfully spins in the gentle waves under the soft rays of a setting sun.', 
        'url': 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-ikDc4ex8NB5ZzfTf8m5WYVB7/user-JpwZsbIXubBZvan3Y3GchiiB/img-dpa3g5LmkTrotY6M93dMYrdE.png?st=2023-12-27T05%3A23%3A29Z&se=2023-12-27T07%3A23%3A29Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-12-26T13%3A22%3A56Z&ske=2023-12-27T13%3A22%3A56Z&sks=b&skv=2021-08-06&sig=hUuQjYLS%2BvtsDdffEAp2gwewjC8b3ilggvkd9hgY6Uw%3D'
    }],
    "usage": {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
}
```

## OpenAI 图像生成模型

### 用法
```python showLineNumbers
from litellm import image_generation
import os
os.environ['OPENAI_API_KEY'] = ""
response = image_generation(model='gpt-image-1', prompt="cute baby otter")
```

| 模型名称           | 函数调用                               | 所需环境变量                |
|----------------------|---------------------------------------------|--------------------------------------|
| gpt-image-1 | `image_generation(model='gpt-image-1', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |
| dall-e-3 | `image_generation(model='dall-e-3', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |
| dall-e-2 | `image_generation(model='dall-e-2', prompt="cute baby otter")` | `os.environ['OPENAI_API_KEY']`       |

## Azure OpenAI 图像生成模型

### API 密钥
可以先设置成环境变量，也可以作为**参数直接传给 litellm.image_generation()**。
```python showLineNumbers
import os
os.environ['AZURE_API_KEY'] = ""
os.environ['AZURE_API_BASE'] = ""
os.environ['AZURE_API_VERSION'] = ""
```

### 用法
```python showLineNumbers
from litellm import image_generation
response = image_generation(
    model="azure/<your deployment name>",
    prompt="cute baby otter",
    api_key=api_key,
    api_base=api_base,
    api_version=api_version,
)
print(response)
```

| 模型名称           | 函数调用                               |
|----------------------|---------------------------------------------|
| gpt-image-1 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |
| dall-e-3 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |
| dall-e-2 | `image_generation(model="azure/<your deployment name>", prompt="cute baby otter")` |

## Xinference 图像生成模型

用于调用托管在 Xinference 上的 Stable Diffusion 模型

#### 用法

LiteLLM 中 Xinference 的用法见[这里](./providers/xinference.md#图像生成)

## Recraft 图像生成模型

用于通过 Recraft 进行 AI 设计与图像生成

#### 用法

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

LiteLLM 中 Recraft 的用法见[这里](./providers/recraft.md#图像生成)

## OpenRouter 图像生成模型

用于调用通过 OpenRouter 提供的图像生成模型（例如 Google Gemini 的图像生成模型）

#### 用法

```python showLineNumbers
from litellm import image_generation
import os

os.environ['OPENROUTER_API_KEY'] = "your-api-key"

response = image_generation(
    model="openrouter/google/gemini-2.5-flash-image",
    prompt="A beautiful sunset over a calm ocean",
    size="1024x1024",
    quality="high",
)
print(response)
```

## OpenAI 兼容的图像生成模型
用于调用 OpenAI 兼容服务器上的 `/image_generation` 端点，例如 https://github.com/xorbitsai/inference

**注意**：模型名需加上 `openai/` 前缀，litellm 才知道要路由到 OpenAI

### 用法
```python showLineNumbers
from litellm import image_generation
response = image_generation(
  model = "openai/<your-llm-name>",     # add `openai/` prefix to model so litellm knows to route to OpenAI
  api_base="http://0.0.0.0:8000/",      # set API Base of your Custom OpenAI Endpoint
  prompt="cute baby otter"
)
```

## Bedrock 上的 Stable Diffusion
用于调用 Bedrock 上的 Stable Diffusion


### 用法
```python showLineNumbers
import os
from litellm import image_generation

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""

response = image_generation(
            prompt="A cute baby sea otter",
            model="bedrock/stability.stable-diffusion-xl-v0",
        )
print(f"response: {response}")
```

## VertexAI 图像生成模型

### 用法

用于调用 VertexAI 上的图像生成模型

```python showLineNumbers
response = litellm.image_generation(
    prompt="An olympic size swimming pool",
    model="vertex_ai/imagegeneration@006",
    vertex_ai_project="adroit-crow-413218",
    vertex_ai_location="us-central1",
)
print(f"response: {response}")
```

## 受支持的提供商

#### ⚡️在 [models.litellm.ai](https://models.litellm.ai/) 查看所有受支持的模型与提供商

| 提供商 | 文档链接 |
|----------|-------------------|
| OpenAI | [OpenAI 图像生成 →](./providers/openai) |
| Azure OpenAI | [Azure OpenAI 图像生成 →](/docs/providers/azure) |
| Google AI Studio | [Google AI Studio 图像生成 →](./providers/google_ai_studio/image_gen) |
| Vertex AI | [Vertex AI 图像生成 →](./providers/vertex_image) |
| AWS Bedrock | [Bedrock 图像生成 →](./providers/bedrock) |
| Recraft | [Recraft 图像生成 →](./providers/recraft#图像生成) |
| OpenRouter | [OpenRouter 图像生成 →](./providers/openrouter#图像生成) |
| Xinference | [Xinference 图像生成 →](./providers/xinference#图像生成) |
| Nscale | [Nscale 图像生成 →](./providers/nscale#图像生成) |
