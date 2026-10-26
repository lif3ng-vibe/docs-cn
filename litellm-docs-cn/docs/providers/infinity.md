import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Infinity

| 属性 | 说明 |
| --- | --- |
| 描述 | Infinity 是一个高吞吐、低延迟的 REST API，用于提供文本嵌入（text embeddings）、重排序模型与 CLIP 模型服务 |
| LiteLLM 上的提供商路由 | `infinity/` |
| 支持的操作 | `/rerank`, `/embeddings` |
| 提供商文档链接 | [Infinity ↗](https://github.com/michaelfeil/infinity) |

## **用法 - LiteLLM Python SDK**

```python
from litellm import rerank, embedding
import os

os.environ["INFINITY_API_BASE"] = "http://localhost:8080"

response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
)
```

## **用法 - LiteLLM 代理**

LiteLLM 提供与 Cohere API 兼容的 `/rerank` 端点，用于发起重排序（rerank）请求。

**配置**

将以下内容添加到 litellm 代理的 config.yaml 中：

```yaml
model_list:
  - model_name: custom-infinity-rerank
    litellm_params:
      model: infinity/rerank
      api_base: https://localhost:8080
      api_key: os.environ/INFINITY_API_KEY
```

启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

## 测试请求

### 重排序（Rerank）

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "top_n": 3
  }'
```

#### 支持的 Cohere 重排序 API 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `query` | `str` | 用于对文档进行重排序的查询文本 |
| `documents` | `list[str]` | 待重排序的文档列表 |
| `top_n` | `int` | 返回的文档数量 |
| `return_documents` | `bool` | 是否在响应中返回文档 |

### 用法 - 返回文档

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
    return_documents=True,
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
    "query": "What is the capital of France?",
    "documents": [
        "Paris",
        "London",
        "Berlin",
        "Madrid"
    ],
    "return_documents": True,
  }'
```

</TabItem>
</Tabs>

## 传递提供商专属参数

任何未被映射的参数都会原样传给提供商。

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["INFINITY_API_BASE"] = "http://localhost:8080"

response = rerank(
    model="infinity/rerank",
    query="What is the capital of France?",
    documents=["Paris", "London", "Berlin", "Madrid"],
    raw_scores=True, # 👈 PROVIDER-SPECIFIC PARAM
)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: custom-infinity-rerank
    litellm_params:
      model: infinity/rerank
      api_base: https://localhost:8080
      raw_scores: True # 👈 EITHER SET PROVIDER-SPECIFIC PARAMS HERE OR IN REQUEST BODY
```

2. 启动 litellm

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

3. 测试一下！

```bash
curl http://0.0.0.0:4000/rerank \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-rerank",
    "query": "What is the capital of the United States?",
    "documents": [
        "Carson City is the capital city of the American state of Nevada.",
        "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
        "Washington, D.C. is the capital of the United States.",
        "Capital punishment has existed in the United States since before it was a country."
    ],
    "raw_scores": True # 👈 PROVIDER-SPECIFIC PARAM
  }'
```

</TabItem>

</Tabs>

## 嵌入（Embeddings）

LiteLLM 提供与 OpenAI API 兼容的 `/embeddings` 端点，用于发起嵌入请求。

**配置**

将以下内容添加到 litellm 代理的 config.yaml 中：

```yaml
model_list:
  - model_name: custom-infinity-embedding
    litellm_params:
      model: infinity/provider/custom-embedding-v1
      api_base: http://localhost:8080
      api_key: os.environ/INFINITY_API_KEY
```

### 测试请求

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-embedding",
    "input": ["hello"]
  }'
```

#### 支持的嵌入 API 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `model` | `str` | 要使用的嵌入模型 |
| `input` | `list[str]` | 需要为其生成嵌入的文本输入 |
| `encoding_format` | `str` | 返回嵌入的格式（如 "float"、"base64"） |
| `modality` | `str` | 输入类型（如 "text"、"image"、"audio"） |

### 用法 - 基础示例

<Tabs>
<TabItem value="sdk" label="SDK">

`INFINITY_API_BASE` 只有 rerank 会读取，因此嵌入调用需要显式传入 `api_base`。

```python
from litellm import embedding

response = embedding(
    model="infinity/bge-small",
    input=["good morning from litellm"],
    api_base="http://localhost:8080",
)

print(response.data[0]['embedding'])
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-infinity-embedding",
    "input": ["hello"]
  }'
```

</TabItem>
</Tabs>

### 用法 - OpenAI 客户端

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from openai import OpenAI

client = OpenAI(
  api_key="<LITELLM_MASTER_KEY>",
  base_url="<LITELLM_URL>"
)

response = client.embeddings.create(
  model="bge-small",
  input=["The food was delicious and the waiter..."],
  encoding_format="float"
)

print(response.data[0].embedding)
```

</TabItem>

<TabItem value="proxy" label="PROXY">

```bash
curl http://0.0.0.0:4000/embeddings \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bge-small",
    "input": ["The food was delicious and the waiter..."],
    "encoding_format": "float"
  }'
```

</TabItem>
</Tabs>
