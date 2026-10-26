import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vertex AI 嵌入

## 嵌入用法

<Tabs>
<TabItem value="sdk" label="SDK">

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
</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">


1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: snowflake-arctic-embed-m-long-1731622468876
    litellm_params:
      model: vertex_ai/<your-model-id>
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="snowflake-arctic-embed-m-long-1731622468876", 
    input = ["good morning from litellm", "this is another item"],
)

print(response)
```


</TabItem>
</Tabs>

#### 支持的嵌入模型
[此处](https://github.com/BerriAI/litellm/blob/57f37f743886a0249f630a6792d49dffc2c5d9b7/model_prices_and_context_window.json#L835)列出的所有模型均受支持

| 模型名称               | 函数调用                                                                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| text-embedding-004 | `embedding(model="vertex_ai/text-embedding-004", input)` | 
| text-multilingual-embedding-002 | `embedding(model="vertex_ai/text-multilingual-embedding-002", input)` | 
| textembedding-gecko | `embedding(model="vertex_ai/textembedding-gecko", input)` | 
| textembedding-gecko-multilingual | `embedding(model="vertex_ai/textembedding-gecko-multilingual", input)` | 
| textembedding-gecko-multilingual@001 | `embedding(model="vertex_ai/textembedding-gecko-multilingual@001", input)` | 
| textembedding-gecko@001 | `embedding(model="vertex_ai/textembedding-gecko@001", input)` | 
| textembedding-gecko@003 | `embedding(model="vertex_ai/textembedding-gecko@003", input)` | 
| text-embedding-preview-0409 | `embedding(model="vertex_ai/text-embedding-preview-0409", input)` |
| text-multilingual-embedding-preview-0409 | `embedding(model="vertex_ai/text-multilingual-embedding-preview-0409", input)` | 
| gemini-embedding-2-preview | `embedding(model="vertex_ai/gemini-embedding-2-preview", input)` | [多模态文档](#gemini-embedding-2-preview多模态) |
| gemini-embedding-2 *(GA)* | `embedding(model="vertex_ai/gemini-embedding-2", input)` | [多模态文档](#gemini-embedding-2-preview多模态) · [GA 说明](https://docs.litellm.ai/blog//blog/gemini_embedding_2_ga) |
| 微调或自定义嵌入模型 | `embedding(model="vertex_ai/<your-model-id>", input)` | 

### 支持的 OpenAI（统一）参数

| [参数](../embedding/supported_embedding.md#litellmembedding-的输入参数) | 类型 | [Vertex 对应参数](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api) |
|-------|-------------|--------------------|
| `input` | **string or List[string]** | `instances` |
| `dimensions` | **int** | `output_dimensionality` |
| `input_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** | `task_type` |

#### 使用 OpenAI（统一）参数


<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"],
    input_type = "RETRIEVAL_DOCUMENT",
    dimensions=1,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "input_type": "RETRIEVAL_QUERY",
    }
)

print(response)
```
</TabItem>
</Tabs>


### 支持的 Vertex 专属参数

| 参数 | 类型 |
|-------|-------------|
| `auto_truncate` | **bool** |
| `task_type` | **Literal["RETRIEVAL_QUERY","RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING", "QUESTION_ANSWERING", "FACT_VERIFICATION"]** |
| `title` | **str** |

#### 使用 Vertex 专属参数（传入 `task_type` 与 `title`）

你可以把任意 Vertex 专属参数传给嵌入模型，只需像下面这样传给 embedding 函数即可：

[包含全部嵌入参数的 Vertex AI 官方文档](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api#request_body)

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = litellm.embedding(
    model="vertex_ai/text-embedding-004",
    input=["good morning from litellm", "gm"],
    task_type = "RETRIEVAL_DOCUMENT",
    title = "test",
    dimensions=1,
    auto_truncate=True,
)
```
</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">


```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="text-embedding-004", 
    input = ["good morning from litellm", "gm"],
    dimensions=1,
    extra_body = {
        "task_type": "RETRIEVAL_QUERY",
        "auto_truncate": True,
        "title": "test",
    }
)

print(response)
```
</TabItem>
</Tabs>

## **BGE 嵌入**

使用部署在 Vertex AI 上的 BGE（Baidu General Embedding）模型。

### 用法

<Tabs>
<TabItem value="sdk" label="SDK">

```python showLineNumbers title="在 Vertex AI 上使用 BGE"
import litellm

response = litellm.embedding(
    model="vertex_ai/bge/<your-endpoint-id>",
    input=["Hello", "World"],
    vertex_project="your-project-id",
    vertex_location="your-location"
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="LiteLLM PROXY">

1. 在 config.yaml 中添加模型
```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: bge-embedding
    litellm_params:
      model: vertex_ai/bge/<your-endpoint-id>
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
      vertex_credentials: your-credentials.json

litellm_settings:
  drop_params: True
```

2. 启动代理

```bash
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 发起请求

```python showLineNumbers title="向 BGE 发起请求"
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

response = client.embeddings.create(
    model="bge-embedding",
    input=["good morning from litellm", "this is another item"]
)

print(response)
```

使用 Private Service Connect（PSC）端点

```yaml showLineNumbers title="config.yaml（PSC）"
model_list:
  - model_name: bge-small-en-v1.5
    litellm_params:
      model: vertex_ai/bge/1234567890 
      api_base: http://10.96.32.8  # Your PSC IP
      vertex_project: my-project-id  #optional
      vertex_location: us-central1 #optional
```

</TabItem>
</Tabs>

## **多模态嵌入**

### Gemini Embedding 2 Preview（多模态）

`gemini-embedding-2-preview` 支持**统一多模态嵌入**：文本、图像、音频、视频和 PDF 可以放进同一次请求。详情见[博客文章](https://docs.litellm.ai/blog//blog/gemini_embedding_2_multimodal)。GA 版模型 id `gemini-embedding-2` 行为完全相同，把下面任一示例中的模型名换掉即可。成本覆盖与定价说明见 [GA 博客](https://docs.litellm.ai/blog//blog/gemini_embedding_2_ga)。

:::warning[响应形态：Vertex 只返回一个合并向量]

Vertex AI 的 Gemini 嵌入端点只提供单内容的 `embedContent`（没有 `batchEmbedContents`），因此在 `input=[...]` 中传入 N 个条目时，返回的是把所有部分融合在一起的**1 个统一嵌入**，而非 N 个独立向量。想为每个条目各取一个向量，请对每个输入分别调用一次 `embedding(...)`。

这与走 Gemini API 路径（`gemini/gemini-embedding-2-preview`）的行为不同，后者会为每个输入元素各返回一个嵌入（与 OpenAI 兼容）。参见 [Gemini 嵌入文档](../embedding/supported_embedding#gemini-embedding-2-preview多模态)。

:::


**输入格式**：
- **Data URI**：`data:image/png;base64,<encoded_data>`
- **GCS URL**：`gs://bucket/path/to/file.png`（MIME 类型由扩展名推断）
- **文件内容块**：`{"type": "file", "file": {...}}`，与对话补全接收的块相同，适用于媒体部分需要显式 MIME 类型或视频片段的场景（见[下文](#视频片段与显式-mime-类型)）

**支持的 MIME 类型**：`image/png`、`image/jpeg`、`audio/mpeg`、`audio/wav`、`video/mp4`、`video/quicktime`、`application/pdf`

<Tabs>
<TabItem value="sdk" label="SDK">

```python
import litellm
from litellm import embedding

litellm.vertex_project = "your-project-id"
litellm.vertex_location = "us-central1"

# Text + Image (GCS URL)
response = embedding(
    model="vertex_ai/gemini-embedding-2-preview",
    input=[
        "Describe this image",
        "gs://my-bucket/images/photo.png"
    ],
)

# Text + Image (base64)
response = embedding(
    model="vertex_ai/gemini-embedding-2-preview",
    input=[
        "The food was delicious",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
    ],
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY">

```yaml
model_list:
  - model_name: vertex-gemini-embedding-2-preview
    litellm_params:
      model: vertex_ai/gemini-embedding-2-preview
      vertex_project: "your-project-id"
      vertex_location: "us-central1"
```

```bash
curl -X POST http://localhost:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vertex-gemini-embedding-2-preview",
    "input": ["Describe this", "gs://bucket/image.png"]
  }'
```

</TabItem>
</Tabs>

#### 视频片段与显式 MIME 类型

想嵌入视频中的某一段时间窗口，或者需要指定一个 LiteLLM 无法从 GCS 扩展名或 data URI 推断出的 MIME 类型时，可以把该元素作为[对话补全](./vertex#视频元数据控制)早已支持的 OpenAI 文件内容块传入：`file.file_id`（`gs://...`）或 `file.file_data`（data URI），可选的 `file.format` 指定 MIME 类型，可选的 `file.video_metadata` 携带 `fps`、`start_offset` 和 `end_offset`，LiteLLM 会把它们作为该部分的 `videoMetadata` 转发。在 Vertex 上，这个块会像其他部分一样与其余元素融合进同一个向量；此路径仍不支持嵌套列表。

```python
response = embedding(
    model="vertex_ai/gemini-embedding-2-preview",
    input=[
        {
            "type": "file",
            "file": {
                "file_id": "gs://my-bucket/clip.mp4",
                "video_metadata": {"start_offset": "3s", "end_offset": "6s"},
            },
        },
        "a solid blue clip",
    ],
)
```

Gemini 嵌入 API 总会对 PDF 输入自动运行 OCR，且没有可控制它的参数，因此无需传任何东西。

### multimodalembedding@001（旧版）

已知限制：
- 每次请求只支持 1 张图片或 1 个视频
- 只支持 GCS 或 base64 编码的图片 / 视频

### 用法

<Tabs>
<TabItem value="sdk" label="SDK">

使用 GCS 图片

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png" # will be sent as a gcs image
)
```

使用 base64 编码的图片

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input="data:image/jpeg;base64,..." # will be sent as a base64 encoded image
)
```

</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY（统一端点）">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求


<Tabs>

<TabItem value="OpenAI SDK" label="OpenAI SDK">

使用 GCS 图片 / 视频 URI 的请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png",
)

print(response)
```

使用 base64 编码图片的请求

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = "data:image/jpeg;base64,...",
)

print(response)
```

</TabItem>

<TabItem value="langchain" label="Langchain">

使用 GCS 图片 / 视频 URI 的请求
```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # type: ignore
)


query_result = embeddings.embed_query(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)
print(query_result)

```

使用 base64 编码图片的请求

```python
from langchain_openai import OpenAIEmbeddings

embeddings_models = "multimodalembedding@001"

embeddings = OpenAIEmbeddings(
    model="multimodalembedding@001",
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # type: ignore
)


query_result = embeddings.embed_query(
    "data:image/jpeg;base64,..."
)
print(query_result)

```

</TabItem>

</Tabs>
</TabItem>


<TabItem value="proxy-vtx" label="LiteLLM PROXY（Vertex SDK）">

1. 在 config.yaml 中添加模型
```yaml
default_vertex_config:
  vertex_project: "adroit-crow-413218"
  vertex_location: "us-central1"
  vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 发起请求

```python
import vertexai

from vertexai.vision_models import Image, MultiModalEmbeddingModel, Video
from vertexai.vision_models import VideoSegmentConfig
from google.auth.credentials import Credentials


LITELLM_PROXY_API_KEY = "sk-<your-litellm-api-key>"
LITELLM_PROXY_BASE = "http://0.0.0.0:4000/vertex-ai"

import datetime

class CredentialsWrapper(Credentials):
    def __init__(self, token=None):
        super().__init__()
        self.token = token
        self.expiry = None  # or set to a future date if needed
        
    def refresh(self, request):
        pass
    
    def apply(self, headers, token=None):
        headers['Authorization'] = f'Bearer {self.token}'

    @property
    def expired(self):
        return False  # Always consider the token as non-expired

    @property
    def valid(self):
        return True  # Always consider the credentials as valid

credentials = CredentialsWrapper(token=LITELLM_PROXY_API_KEY)

vertexai.init(
    project="adroit-crow-413218",
    location="us-central1",
    api_endpoint=LITELLM_PROXY_BASE,
    credentials = credentials,
    api_transport="rest",
   
)

model = MultiModalEmbeddingModel.from_pretrained("multimodalembedding")
image = Image.load_from_file(
    "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"
)

embeddings = model.get_embeddings(
    image=image,
    contextual_text="Colosseum",
    dimension=1408,
)
print(f"Image Embedding: {embeddings.image_embedding}")
print(f"Text Embedding: {embeddings.text_embedding}")
```

</TabItem>
</Tabs>


### 文本 + 图像 + 视频嵌入

<Tabs>
<TabItem value="sdk" label="SDK">

文本 + 图像

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"] # will be sent as a gcs image
)
```

文本 + 视频

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```

图像 + 视频

```python
response = await litellm.aembedding(
    model="vertex_ai/multimodalembedding@001",
    input=["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"] # will be sent as a gcs image
)
```


</TabItem>
<TabItem value="proxy" label="LiteLLM PROXY（统一端点）">

1. 在 config.yaml 中添加模型
```yaml
model_list:
  - model_name: multimodalembedding@001
    litellm_params:
      model: vertex_ai/multimodalembedding@001
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: adroit-crow-413218-a956eef1a2a8.json 

litellm_settings:
  drop_params: True
```

2. 启动代理

```
$ litellm --config /path/to/config.yaml
```

3. 使用 OpenAI Python SDK 或 Langchain Python SDK 发起请求


文本 + 图像

```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png"],
)

print(response)
```

文本 + 视频
```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["hey", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

图像 + 视频
```python
import openai

client = openai.OpenAI(api_key="sk-<your-litellm-api-key>", base_url="http://0.0.0.0:4000")

# # request sent to model set on litellm proxy, `litellm --model`
response = client.embeddings.create(
    model="multimodalembedding@001", 
    input = ["gs://cloud-samples-data/vertex-ai/llm/prompts/landmark1.png", "gs://my-bucket/embeddings/supermarket-video.mp4"],
)

print(response)
```

</TabItem>
</Tabs>