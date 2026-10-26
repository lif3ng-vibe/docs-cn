import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /embeddings

## 快速上手
```python
from litellm import embedding
import os
os.environ['OPENAI_API_KEY'] = ""
response = embedding(model='text-embedding-ada-002', input=["good morning from litellm"])
```

## 异步用法 - `aembedding()`

LiteLLM 为 `embedding` 函数提供了名为 `aembedding` 的异步版本：

```python
from litellm import aembedding
import asyncio

async def get_embedding():
    response = await aembedding(
        model='text-embedding-ada-002',
        input=["good morning from litellm"]
    )
    return response

response = asyncio.run(get_embedding())
print(response)
```

## 代理用法

**注意**
使用 `vertex_ai` 时，需要先设置：
```bash
export GOOGLE_APPLICATION_CREDENTIALS="absolute/path/to/service_account.json"
```

### 将模型添加到配置

```yaml
model_list:
- model_name: textembedding-gecko
  litellm_params:
    model: vertex_ai/textembedding-gecko

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 启动代理

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

### 测试

<Tabs>
<TabItem value="curl" label="Curl">

```bash
curl --location 'http://0.0.0.0:4000/embeddings' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--header 'Content-Type: application/json' \
--data '{"input": ["Academia.edu uses"], "model": "textembedding-gecko", "encoding_format": "base64"}'
```

</TabItem>
<TabItem value="openai" label="OpenAI (python)">

```python
from openai import OpenAI
client = OpenAI(
  api_key="sk-<your-litellm-api-key>",
  base_url="http://0.0.0.0:4000"
)

client.embeddings.create(
  model="textembedding-gecko",
  input="The food was delicious and the waiter...",
  encoding_format="float"
)
```
</TabItem>
<TabItem value="langchain" label="Langchain 嵌入">

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="textembedding-gecko", openai_api_base="http://0.0.0.0:4000", openai_api_key="sk-<your-api-key>")

text = "This is a test document."

query_result = embeddings.embed_query(text)

print(f"VERTEX AI EMBEDDINGS")
print(query_result[:5])
```
</TabItem>
</Tabs>


## 图像嵌入

对于支持图像嵌入的模型，可以在 `input` 参数中传入 base64 编码的图像字符串。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

# set your api key
os.environ["COHERE_API_KEY"] = ""

response = embedding(model="cohere/embed-english-v3.0", input=["<base64 encoded image>"])
```

</TabItem>
<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: cohere-embed
    litellm_params:
      model: cohere/embed-english-v3.0
      api_key: os.environ/COHERE_API_KEY
```


2. 启动代理

```bash
litellm --config /path/to/config.yaml 

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```bash
curl -X POST 'http://0.0.0.0:4000/v1/embeddings' \
-H 'Authorization: Bearer sk-54d77cd67b9febbb' \
-H 'Content-Type: application/json' \
-d '{
  "model": "cohere/embed-english-v3.0",
  "input": ["<base64 encoded image>"]
}'
```
</TabItem>
</Tabs>

## `litellm.embedding()` 的输入参数


:::info

任何非 OpenAI 参数都会被视为提供商特定参数，以 kwargs 形式随请求体发送给提供商。

[**查看保留参数**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L3130)

[**查看示例**](#示例)
:::

### 必填字段

- `model`：*string* - 要使用的模型 ID。示例：`model='text-embedding-ada-002'`

- `input`：*string 或 array* - 要嵌入的输入文本，编码为字符串或 token 数组。若要在一次请求中嵌入多个输入，可传入字符串数组或 token 数组的数组。输入不得超过模型的最大输入 token 数（text-embedding-ada-002 为 8192 个 token），不能是空字符串，且任何数组的维度不得超过 2048。
```python
input=["good morning from litellm"]
```

### LiteLLM 可选字段

- `user`：*string（可选）* 代表你的最终用户的唯一标识符，

- `dimensions`：*integer（可选）* 输出嵌入应有的维度数。仅 OpenAI/Azure 的 text-embedding-3 及之后模型支持。

- `encoding_format`：*string（可选）* 返回嵌入的格式，可为 `"float"` 或 `"base64"`。默认为 `encoding_format="float"`

- `timeout`：*integer（可选）* - 等待 API 响应的最长时间（秒）。默认 600 秒（10 分钟）。

- `api_base`：*string（可选）* - 调用模型时要使用的 API 端点

- `api_version`：*string（可选）* - （仅限 Azure）本次调用使用的 API 版本

- `api_key`：*string（可选）* - 用于请求身份验证与授权的 API 密钥。未提供时使用默认 API 密钥。

- `api_type`：*string（可选）* - 要使用的 API 类型。

### `litellm.embedding()` 的输出

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [
        -0.0022326677571982145,
        0.010749882087111473,
        ...
   
      ]
    }
  ],
  "model": "text-embedding-ada-002-v2",
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

## OpenAI 嵌入模型

### 用法
```python
from litellm import embedding
import os
os.environ['OPENAI_API_KEY'] = ""
response = embedding(
    model="text-embedding-3-small",
    input=["good morning from litellm", "this is another item"],
    metadata={"anything": "good day"},
    dimensions=5 # Only supported in text-embedding-3 and later models.
)
```

| 模型名称               | 函数调用                                    | 所需环境变量                          |
|----------------------|---------------------------------------------|--------------------------------------|
| text-embedding-3-small | `embedding('text-embedding-3-small', input)` | `os.environ['OPENAI_API_KEY']`       |
| text-embedding-3-large | `embedding('text-embedding-3-large', input)` | `os.environ['OPENAI_API_KEY']`       |
| text-embedding-ada-002 | `embedding('text-embedding-ada-002', input)` | `os.environ['OPENAI_API_KEY']`       |

## OpenAI 兼容嵌入模型
用于调用 OpenAI 兼容服务器上的 `/embedding` 端点，例如 https://github.com/xorbitsai/inference

**注意：在模型名前加上 `openai/` 前缀，litellm 才知道要将其路由到 OpenAI**

### 用法
```python
from litellm import embedding
response = embedding(
  model = "openai/<your-llm-name>",     # add `openai/` prefix to model so litellm knows to route to OpenAI
  api_base="http://0.0.0.0:4000/",      # set API Base of your Custom OpenAI Endpoint
  input=["good morning from litellm"]
)
```

## Bedrock 嵌入

### API 密钥
这些值可以设为环境变量，或作为 **litellm.embedding() 的参数**传入
```python
import os
os.environ["AWS_ACCESS_KEY_ID"] = ""  # Access key
os.environ["AWS_SECRET_ACCESS_KEY"] = "" # Secret access key
os.environ["AWS_REGION_NAME"] = "" # us-east-1, us-east-2, us-west-1, us-west-2
```

### 用法
```python
from litellm import embedding
response = embedding(
    model="amazon.titan-embed-text-v1",
    input=["good morning from litellm"],
)
print(response)
```

| 模型名称               | 函数调用                               |
|----------------------|---------------------------------------------|
| Amazon Nova Multimodal Embeddings | `embedding(model="bedrock/amazon.nova-2-multimodal-embeddings-v1:0", input=input)` | [Nova 文档](../providers/bedrock_embedding#amazon-nova-多模态嵌入) |
| Amazon Nova (Async) | `embedding(model="bedrock/async_invoke/amazon.nova-2-multimodal-embeddings-v1:0", input=input, input_type="text", output_s3_uri="s3://bucket/")` | [Nova 异步文档](../providers/bedrock_embedding#异步调用支持) |
| Titan Embeddings - G1 | `embedding(model="amazon.titan-embed-text-v1", input=input)` |
| Cohere Embeddings - English | `embedding(model="cohere.embed-english-v3", input=input)` |
| Cohere Embeddings - Multilingual | `embedding(model="cohere.embed-multilingual-v3", input=input)` |
| TwelveLabs Marengo (Async) | `embedding(model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text")` | [异步调用文档](../providers/bedrock_embedding#异步调用支持) |

## TwelveLabs Bedrock 嵌入模型

TwelveLabs Marengo 模型支持多模态嵌入（文本、图像、视频、音频），并要求通过 `input_type` 参数指定输入格式。

### 用法

```python
from litellm import embedding
import os

# Set AWS credentials
os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = "us-east-1"

# Text embedding
response = embedding(
    model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["Hello world from LiteLLM!"],
    input_type="text"  # Required parameter
)

# Image embedding (base64)
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."],
    input_type="image",  # Required parameter
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)

# Video embedding (S3 URL)
response = embedding(
    model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0",
    input=["s3://your-bucket/video.mp4"],
    input_type="video",  # Required parameter
    output_s3_uri="s3://your-bucket/async-invoke-output/"
)
```

### 必填参数

| 参数 | 说明 | 取值 |
|-----------|-------------|--------|
| `input_type` | 输入内容的类型 | `"text"`, `"image"`, `"video"`, `"audio"` |

### 支持的模型

| 模型名称 | 函数调用 | 说明 |
|------------|---------------|-------|
| TwelveLabs Marengo 2.7 (Sync) | `embedding(model="bedrock/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text")` | 仅支持文本嵌入 |
| TwelveLabs Marengo 2.7 (Async) | `embedding(model="bedrock/async_invoke/us.twelvelabs.marengo-embed-2-7-v1:0", input=input, input_type="text/image/video/audio")` | 支持所有输入类型，需要 `output_s3_uri` |

## Cohere 嵌入模型
https://docs.cohere.com/reference/embed

### 用法
```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" # optional param for v3 llms
)
```
| 模型名称                 | 函数调用                                                     |
|--------------------------|--------------------------------------------------------------|
| embed-english-v3.0       | `embedding(model="embed-english-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-light-v3.0 | `embedding(model="embed-english-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-v3.0  | `embedding(model="embed-multilingual-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-light-v3.0 | `embedding(model="embed-multilingual-light-v3.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-v2.0       | `embedding(model="embed-english-v2.0", input=["good morning from litellm", "this is another item"])` |
| embed-english-light-v2.0 | `embedding(model="embed-english-light-v2.0", input=["good morning from litellm", "this is another item"])` |
| embed-multilingual-v2.0  | `embedding(model="embed-multilingual-v2.0", input=["good morning from litellm", "this is another item"])` |

## NVIDIA NIM 嵌入模型

### API 密钥
这些值可以设为环境变量，或作为 **litellm.embedding() 的参数**传入
```python
import os
os.environ["NVIDIA_NIM_API_KEY"] = ""  # api key
os.environ["NVIDIA_NIM_API_BASE"] = "" # nim endpoint url
```

### 用法
```python
from litellm import embedding
import os
os.environ['NVIDIA_NIM_API_KEY'] = ""
response = embedding(
    model='nvidia_nim/<model_name>', 
    input=["good morning from litellm"],
    input_type="query"
)
```
## 嵌入模型的 `input_type` 参数

某些嵌入模型（如 `nvidia/embed-qa-4` 和 E5 系列）以**双重模式**工作：一种用于**索引文档**（passage），另一种用于**查询**。请正确设置 `input_type` 参数，让检索准确率保持高位。

### 用法

将 `input_type` 参数设置为以下值之一：

- `"passage"` – 在**索引**阶段嵌入内容时使用（如文档）。
- `"query"` – 在**检索**阶段嵌入内容时使用（如用户查询）。

> **警告**：`input_type` 使用不当会导致检索性能显著下降。



支持[此处](https://build.nvidia.com/explore/retrieval)列出的所有模型：

| 模型名称           | 函数调用                                             |
| :---               | :---                                                  |
| NV-Embed-QA | `embedding(model="nvidia_nim/NV-Embed-QA", input)` |
| nvidia/nv-embed-v1 | `embedding(model="nvidia_nim/nvidia/nv-embed-v1", input)` |
| nvidia/nv-embedqa-mistral-7b-v2 | `embedding(model="nvidia_nim/nvidia/nv-embedqa-mistral-7b-v2", input)` |
| nvidia/nv-embedqa-e5-v5 | `embedding(model="nvidia_nim/nvidia/nv-embedqa-e5-v5", input)` |
| nvidia/embed-qa-4 | `embedding(model="nvidia_nim/nvidia/embed-qa-4", input)` |
| nvidia/llama-3.2-nv-embedqa-1b-v1 | `embedding(model="nvidia_nim/nvidia/llama-3.2-nv-embedqa-1b-v1", input)` |
| nvidia/llama-3.2-nv-embedqa-1b-v2 | `embedding(model="nvidia_nim/nvidia/llama-3.2-nv-embedqa-1b-v2", input)` |
| snowflake/arctic-embed-l | `embedding(model="nvidia_nim/snowflake/arctic-embed-l", input)` |
| baai/bge-m3 | `embedding(model="nvidia_nim/baai/bge-m3", input)` |


## HuggingFace 嵌入模型
LiteLLM 支持所有 Feature-Extraction 与 Sentence Similarity 类嵌入模型：https://huggingface.co/models?pipeline_tag=feature-extraction

### 用法
```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm"]
)
```

### 用法 - 设置 input_type

LiteLLM 会通过向 API base 发送 GET 请求来推断输入类型（feature-extraction 或 sentence-similarity）。

自行设置 `input_type` 即可覆盖这一行为。

```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm", "you are a good bot"],
    api_base = "https://p69xlsj6rpno5drq.us-east-1.aws.endpoints.huggingface.cloud", 
    input_type="sentence-similarity"
)
```

### 用法 - 自定义 API Base
```python
from litellm import embedding
import os
os.environ['HUGGINGFACE_API_KEY'] = ""
response = embedding(
    model='huggingface/microsoft/codebert-base', 
    input=["good morning from litellm"],
    api_base = "https://p69xlsj6rpno5drq.us-east-1.aws.endpoints.huggingface.cloud"
)
```

| 模型名称              | 函数调用 | 所需环境变量                                   |
|-----------------------|--------------------------------------------------------------|-------------------------------------------------|
| microsoft/codebert-base    | `embedding('huggingface/microsoft/codebert-base', input=input)`               | `os.environ['HUGGINGFACE_API_KEY']`                                             |
| BAAI/bge-large-zh | `embedding('huggingface/BAAI/bge-large-zh', input=input)`         | `os.environ['HUGGINGFACE_API_KEY']`                                             |
| any-hf-embedding-model | `embedding('huggingface/hf-embedding-model', input=input)`         | `os.environ['HUGGINGFACE_API_KEY']`                                             |


## Mistral AI 嵌入模型
此处 https://docs.mistral.ai/platform/endpoints 列出的所有模型均受支持

### 用法
```python
from litellm import embedding
import os

os.environ['MISTRAL_API_KEY'] = ""
response = embedding(
    model="mistral/mistral-embed",
    input=["good morning from litellm"],
)
print(response)
```

| 模型名称                 | 函数调用                                                                                                                                                           |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mistral-embed | `embedding(model="mistral/mistral-embed", input)` | 

## Gemini AI 嵌入模型

### API 密钥

这些值可以设为环境变量，或作为 **litellm.embedding() 的参数**传入
```python
import os
os.environ["GEMINI_API_KEY"] = ""
```

### 用法 - 嵌入
```python
from litellm import embedding
response = embedding(
  model="gemini/text-embedding-004",
  input=["good morning from litellm"],
)
print(response)
```

支持[此处](https://ai.google.dev/gemini-api/docs/models/gemini)列出的所有模型：

| 模型名称           | 函数调用                                         |
| :---               | :---                                                  |
| text-embedding-004 | `embedding(model="gemini/text-embedding-004", input)` |
| gemini-embedding-2-preview | `embedding(model="gemini/gemini-embedding-2-preview", input)` | [多模态文档](#gemini-embedding-2-preview多模态) |
| gemini-embedding-2 *(GA)* | `embedding(model="gemini/gemini-embedding-2", input)` | [多模态文档](#gemini-embedding-2-preview多模态) · [GA 说明](https://docs.litellm.ai/blog//blog/gemini_embedding_2_ga) |

### Gemini Embedding 2 Preview（多模态）

`gemini-embedding-2-preview` 支持**多模态嵌入**：单次请求即可同时传入文本、图像、音频、视频和 PDF。详情见[博客文章](https://docs.litellm.ai/blog//blog/gemini_embedding_2_multimodal)。GA 模型 `gemini-embedding-2` 行为完全一致，只需在下面任一示例中替换模型名即可。成本覆盖与定价说明见 [GA 博客](https://docs.litellm.ai/blog//blog/gemini_embedding_2_ga)。

:::info[响应结构]

走 Gemini API 路径（`gemini/gemini-embedding-2-preview`）时，每个输入元素都会返回**各自**的嵌入（索引为 `0..N-1`），与 OpenAI 的 `/embeddings` 语义一致。LiteLLM 会路由到 Gemini 的 `batchEmbedContents` 端点，为每个输入构造一个 `EmbedContentRequest`。Vertex AI 路径则不同，它会把所有部分合并为单一向量；参见 [Vertex AI 嵌入文档](../providers/vertex_embedding#gemini-embedding-2-preview多模态)。

:::


**输入格式**：
- **Data URI**：`data:image/png;base64,<encoded_data>`
- **Gemini 文件引用**：`files/abc123`（预先通过 Gemini Files API 上传）
- **文件内容块**：`{"type": "file", "file": {...}}`，与对话补全接受的块相同，适用于媒体部分需要显式 MIME 类型或视频片段的场景（见[下文](#视频片段与显式-mime-类型)）

**支持的 MIME 类型**：`image/png`, `image/jpeg`, `audio/mpeg`, `audio/wav`, `video/mp4`, `video/quicktime`, `application/pdf`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os
os.environ["GEMINI_API_KEY"] = ""

# Text + Image (base64)
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[
        "The food was delicious and the waiter...",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ],
)
print(response)
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2-preview",
    "input": [
      "The food was delicious and the waiter...",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ]
  }'
```

</TabItem>
</Tabs>

**可选**：`dimensions` 映射到 Gemini 的 `outputDimensionality`。

#### 合并多模态嵌入

默认情况下，`input` 列表中的每个元素都会生成**独立**的嵌入（与 OpenAI 兼容）。若要把多个输入合并为**单个**嵌入（例如用文本 + 图像表示同一实体），可将它们包在嵌套列表中：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding

# Separate: 2 inputs → 2 embeddings
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=["a red shoe", "data:image/png;base64,..."],
)
# response.data has 2 embeddings

# Combined: text + image → 1 embedding
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."]],
)
# response.data has 1 embedding representing both together

# Mixed: 1 combined + 1 separate → 2 embeddings
response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[["a red shoe", "data:image/png;base64,..."], "just text"],
)
# response.data has 2 embeddings
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2-preview",
    "input": [["a red shoe", "data:image/png;base64,..."], "just text"]
  }'
```

</TabItem>
</Tabs>

这适合把多模态实体（例如带名称 + 照片的商品）表示为单一向量，供搜索与检索使用。仅 Gemini API 支持此用法；Vertex AI 无论输入形态如何，始终返回单一合并向量（参见 [Vertex AI 嵌入文档](../providers/vertex_embedding#gemini-embedding-2-preview多模态)）。

#### 视频片段与显式 MIME 类型

普通字符串元素不携带任何选项，因此若要只嵌入视频的某一段窗口，或指定 LiteLLM 无法推断的 MIME 类型，可以把该元素写成 [对话补全](../providers/vertex#视频元数据控制)已支持的 OpenAI 文件内容块。这种块既可以作为顶层元素，也可以放在嵌套列表中，并会作为一个携带 `videoMetadata` 的 Gemini `Part` 透传。

| 字段 | 说明 |
|-------|-------------|
| `file.file_id` | `gs://bucket/clip.mp4`、Gemini Files API 引用 `files/abc123`，或 `/v1/files` 为 Gemini 上传返回的 id（`https://generativelanguage.googleapis.com/v1beta/files/abc123`） |
| `file.file_data` | Data URI，形如 `data:video/mp4;base64,<encoded_data>` |
| `file.format` | 可选的 MIME 类型，覆盖根据扩展名或 data URI 推断出的类型 |
| `file.video_metadata` | 可选的 `fps`（数字）、`start_offset` 与 `end_offset`（如 `"3s"` 的字符串），会转换为 Gemini 的 `startOffset` 与 `endOffset` |

`file_id` 与 `file_data` 必须且只能提供一个。块内出现未知键（例如对话补全的 `detail`）时会返回 400 并指明该键；若在全局或请求级设置了 `drop_params`，该键则会被丢弃，处理方式与不支持的参数一致。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding

response = embedding(
    model="gemini/gemini-embedding-2-preview",
    input=[
        {
            "type": "file",
            "file": {
                "file_id": "files/abc123",
                "video_metadata": {"fps": 1, "start_offset": "3s", "end_offset": "6s"},
            },
        },
        "a solid blue clip",
    ],
)
# response.data has 2 embeddings: the 3s-6s window of the video, then the text
```

</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-embedding-2-preview",
    "input": [[
      {
        "type": "file",
        "file": {
          "file_data": "data:video/mp4;base64,...",
          "video_metadata": {"start_offset": "3s", "end_offset": "6s"}
        }
      },
      "a solid blue clip"
    ]]
  }'
```

</TabItem>
</Tabs>

:::note[PDF OCR]
Gemini 嵌入 API 总会对 PDF 输入执行 OCR，且没有参数可以开关它，因此无需为此传入任何内容。
:::


## Vertex AI 嵌入模型

### 用法 - 嵌入
```python
import litellm
from litellm import embedding
litellm.vertex_project = "hardy-device-38811" # Your Project ID
litellm.vertex_location = "us-central1"  # proj location

response = embedding(
    model="vertex_ai/textembedding-gecko",
    input=["good morning from litellm"],
)
print(response)
```

### 支持的模型
支持[此处](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835)列出的所有模型

| 模型名称                 | 函数调用                                                                                                                                                           |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| textembedding-gecko | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| textembedding-gecko-multilingual | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| textembedding-gecko-multilingual@001 | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| textembedding-gecko@001 | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| textembedding-gecko@003 | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| text-embedding-preview-0409 | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| text-multilingual-embedding-preview-0409 | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 

## VoyageAI by MongoDB 嵌入模型

### 用法 - 嵌入
```python
from litellm import embedding
import os

os.environ['VOYAGE_API_KEY'] = ""
response = embedding(
    model="voyage/voyage-01",
    input=["good morning from litellm"],
)
print(response)
```

### 支持的模型
此处 https://docs.voyageai.com/embeddings/#models-and-specifics 列出的所有模型均受支持

| 模型名称                 | 函数调用                                                                                                                                                           |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| voyage-01 | `embedding(model="voyage/voyage-01", input)` | 
| voyage-lite-01 | `embedding(model="voyage/voyage-lite-01", input)` | 
| voyage-lite-01-instruct | `embedding(model="voyage/voyage-lite-01-instruct", input)` | 

### 提供商特定参数


:::info

任何非 OpenAI 参数都会被视为提供商特定参数，以 kwargs 形式随请求体发送给提供商。

[**查看保留参数**](https://github.com/BerriAI/litellm/blob/2f5f85cb52f36448d1f8bbfbd3b8af8167d0c4c8/litellm/main.py#L3130)
:::

### **示例**

Cohere v3 模型有一个必填参数 `input_type`，可取以下四个值之一：

- `input_type="search_document"`：（默认）用于要存入向量数据库的文本（文档）
- `input_type="search_query"`：用于搜索查询，从向量数据库中找出最相关的文档
- `input_type="classification"`：当嵌入要作为分类系统的输入时使用
- `input_type="clustering"`：当嵌入要用于文本聚类时使用

https://txt.cohere.com/introducing-embed-v3/

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
os.environ["COHERE_API_KEY"] = "cohere key"

# cohere call
response = embedding(
    model="embed-english-v3.0", 
    input=["good morning from litellm", "this is another item"], 
    input_type="search_document" # 👈 PROVIDER-SPECIFIC PARAM
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

**通过 config 配置**

```yaml
model_list:
  - model_name: "cohere-embed"
    litellm_params:
      model: embed-english-v3.0
      input_type: search_document # 👈 PROVIDER-SPECIFIC PARAM
```

**通过请求传入**

```bash
curl -X POST 'http://0.0.0.0:4000/v1/embeddings' \
-H 'Authorization: Bearer sk-54d77cd67b9febbb' \
-H 'Content-Type: application/json' \
-d '{
  "model": "cohere-embed",
  "input": ["Are you authorized to work in United States of America?"],
  "input_type": "search_document" # 👈 PROVIDER-SPECIFIC PARAM
}'
```
</TabItem>
</Tabs>

## Nebius AI Studio 嵌入模型

### 用法 - 嵌入
```python
from litellm import embedding
import os

os.environ['NEBIUS_API_KEY'] = ""
response = embedding(
    model="nebius/BAAI/bge-en-icl",
    input=["Good morning from litellm!"],
)
print(response)
```

### 支持的模型
所有支持的模型见：https://studio.nebius.ai/models/embedding

| 模型名称                 | 函数调用                                                         |
|--------------------------|-----------------------------------------------------------------|
| BAAI/bge-en-icl | `embedding(model="nebius/BAAI/bge-en-icl", input)`              | 
| BAAI/bge-multilingual-gemma2 | `embedding(model="nebius/BAAI/bge-multilingual-gemma2", input)` | 
| intfloat/e5-mistral-7b-instruct | `embedding(model="nebius/intfloat/e5-mistral-7b-instruct", input)`      | 

