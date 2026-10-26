# Xinference [Xorbits Inference]
https://inference.readthedocs.io/en/latest/index.html

## 概述

| 属性 | 说明 |
|-------|-------|
| 描述 | Xinference 是一个开源平台，可用于运行各类开源 LLM、图像生成模型等的推理。 |
| LiteLLM 提供商路由 | `xinference/` |
| 提供商文档链接 | [Xinference ↗](https://inference.readthedocs.io/en/latest/index.html) |
| 支持的操作 | [`/embeddings`](#用法示例---嵌入)、[`/images/generations`](#图像生成) |

LiteLLM 支持 Xinference 的嵌入与图像生成调用。

## API Base 与密钥
```python
# env variable
os.environ['XINFERENCE_API_BASE'] = "http://127.0.0.1:9997/v1"
os.environ['XINFERENCE_API_KEY'] = "anything" #[optional] no api key required
```

这些环境变量只会被 `embedding()` 读取；`image_generation()` 会忽略它们，因此需要在调用时或 `litellm_params` 中传入 `api_base` 和一个非空的 `api_key`。缺少 `api_base` 时，请求会被发送到 `https://api.openai.com/v1`；缺少 `api_key` 时，除非设置了 `OPENAI_API_KEY`，否则调用会抛出 AuthenticationError。

## 用法示例 - 嵌入
```python showLineNumbers
from litellm import embedding
import os

os.environ['XINFERENCE_API_BASE'] = "http://127.0.0.1:9997/v1"
response = embedding(
    model="xinference/bge-base-en",
    input=["good morning from litellm"],
)
print(response)
```

## 用法示例 - `api_base` 参数
```python showLineNumbers
from litellm import embedding
import os

response = embedding(
    model="xinference/bge-base-en",
    api_base="http://127.0.0.1:9997/v1",
    input=["good morning from litellm"],
)
print(response)
```

## 图像生成

### 用法 - LiteLLM Python SDK

```python showLineNumbers
from litellm import image_generation
import os

# xinference image generation call
response = image_generation(
    model="xinference/stabilityai/stable-diffusion-3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    api_base="http://127.0.0.1:9997/v1",
    api_key="anything",  # any non-empty value, Xinference does not check it
)
print(response)
```

### 用法 - LiteLLM 代理服务器

#### 1. 设置 config.yaml

```yaml showLineNumbers
model_list:
  - model_name: xinference-sd
    litellm_params:
      model: xinference/stabilityai/stable-diffusion-3.5-large
      api_base: http://127.0.0.1:9997/v1
      api_key: anything
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
    "model": "xinference-sd",
    "prompt": "A beautiful sunset over a calm ocean",
    "n": 1,
    "size": "1024x1024",
    "response_format": "url"
}'
```

### 进阶用法 - 附加参数

```python showLineNumbers
from litellm import image_generation
import os

response = image_generation(
    model="xinference/stabilityai/stable-diffusion-3.5-large",
    prompt="A beautiful sunset over a calm ocean",
    api_base="http://127.0.0.1:9997/v1",
    api_key="anything",            # any non-empty value, Xinference does not check it
    n=1,                           # number of images
    size="1024x1024",             # image size
    response_format="b64_json",   # return format
)
print(response)
```

### 支持的图像生成模型

Xinference 支持多种 stable diffusion 模型。以下是一些示例：

| 模型名称                                              | 函数调用                                                                                      |
|---------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| stabilityai/stable-diffusion-3.5-large                 | `image_generation(model="xinference/stabilityai/stable-diffusion-3.5-large", prompt="...")`      |
| stabilityai/stable-diffusion-xl-base-1.0               | `image_generation(model="xinference/stabilityai/stable-diffusion-xl-base-1.0", prompt="...")`    |
| runwayml/stable-diffusion-v1-5                         | `image_generation(model="xinference/runwayml/stable-diffusion-v1-5", prompt="...")`              |

完整的受支持图像生成模型列表见：https://inference.readthedocs.io/en/latest/models/builtin/image/index.html

## 支持的模型
此处列出的所有模型均受支持：https://inference.readthedocs.io/en/latest/models/builtin/embedding/index.html

| 模型名称                  | 函数调用                                                      |
|-----------------------------|--------------------------------------------------------------------|
| bge-base-en                 | `embedding(model="xinference/bge-base-en", input)`                 |
| bge-base-en-v1.5            | `embedding(model="xinference/bge-base-en-v1.5", input)`            |
| bge-base-zh                 | `embedding(model="xinference/bge-base-zh", input)`                 |
| bge-base-zh-v1.5            | `embedding(model="xinference/bge-base-zh-v1.5", input)`            |
| bge-large-en                | `embedding(model="xinference/bge-large-en", input)`                |
| bge-large-en-v1.5           | `embedding(model="xinference/bge-large-en-v1.5", input)`           |
| bge-large-zh                | `embedding(model="xinference/bge-large-zh", input)`                |
| bge-large-zh-noinstruct     | `embedding(model="xinference/bge-large-zh-noinstruct", input)`     |
| bge-large-zh-v1.5           | `embedding(model="xinference/bge-large-zh-v1.5", input)`           |
| bge-small-en-v1.5           | `embedding(model="xinference/bge-small-en-v1.5", input)`           |
| bge-small-zh                | `embedding(model="xinference/bge-small-zh", input)`                |
| bge-small-zh-v1.5           | `embedding(model="xinference/bge-small-zh-v1.5", input)`           |
| e5-large-v2                 | `embedding(model="xinference/e5-large-v2", input)`                 |
| gte-base                    | `embedding(model="xinference/gte-base", input)`                    |
| gte-large                   | `embedding(model="xinference/gte-large", input)`                   |
| jina-embeddings-v2-base-en  | `embedding(model="xinference/jina-embeddings-v2-base-en", input)`  |
| jina-embeddings-v2-small-en | `embedding(model="xinference/jina-embeddings-v2-small-en", input)` |
| multilingual-e5-large       | `embedding(model="xinference/multilingual-e5-large", input)`       |
