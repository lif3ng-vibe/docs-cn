import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jina AI
https://jina.ai/embeddings/

支持的端点（endpoint）：
- /embeddings
- /rerank

## API 密钥
```python
# env variable
os.environ['JINA_AI_API_KEY']
```

## 嵌入用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import embedding
import os

os.environ['JINA_AI_API_KEY'] = ""
response = embedding(
    model="jina_ai/jina-embeddings-v3",
    input=["good morning from litellm"],
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 添加到 config.yaml
```yaml
model_list:
  - model_name: embedding-model
    litellm_params:
      model: jina_ai/jina-embeddings-v3
      api_key: os.environ/JINA_AI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000/
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"input": ["hello world"], "model": "embedding-model"}'
```

</TabItem>
</Tabs>

## 重排序用法示例

<Tabs>
<TabItem value="sdk" label="SDK">

```python
from litellm import rerank
import os

os.environ["JINA_AI_API_KEY"] = "sk-..."

query = "What is the capital of the United States?"
documents = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Washington, D.C. is the capital of the United States.",
    "Capital punishment has existed in the United States since before it was a country.",
]

response = rerank(
    model="jina_ai/jina-reranker-v2-base-multilingual",
    query=query,
    documents=documents,
    top_n=3,
)
print(response)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

1. 添加到 config.yaml
```yaml
model_list:
  - model_name: rerank-model
    litellm_params:
      model: jina_ai/jina-reranker-v2-base-multilingual
      api_key: os.environ/JINA_AI_API_KEY
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 测试一下！

```bash
curl -L -X POST 'http://0.0.0.0:4000/rerank' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "model": "rerank-model",
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

</TabItem>
</Tabs>

## 支持的模型
https://jina.ai/embeddings/ 上列出的所有模型均受支持。

## 支持的可选重排序参数

所有 Cohere 重排序（rerank）参数均受支持。

## 支持的可选嵌入参数

```
dimensions
```

## 提供商特有参数

将任何 Jina AI 特有的参数以关键字参数的形式传给 `embedding` 或 `rerank` 函数，例如：

<Tabs>
<TabItem value="sdk" label="SDK">

```python
response = embedding(
    model="jina_ai/jina-embeddings-v3",
    input=["good morning from litellm"],
    dimensions=1536,
    my_custom_param="my_custom_value", # any other jina ai specific parameters
)
```
</TabItem>
<TabItem value="proxy" label="PROXY">

```bash
curl -L -X POST 'http://0.0.0.0:4000/embeddings' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{"input": ["good morning from litellm"], "model": "jina_ai/jina-embeddings-v3", "dimensions": 1536, "my_custom_param": "my_custom_value"}'
```

</TabItem>
</Tabs>
