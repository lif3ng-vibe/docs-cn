import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Milvus - 向量存储

将 Milvus 用作 RAG 的向量存储（vector store）。

## 快速上手

你需要准备三样东西：
1. 一个 Milvus 实例（云端或自托管）
2. 一个嵌入模型（embedding model），用于把查询转换为向量
3. 一个包含向量字段的 Milvus 集合（collection）

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### 基础搜索

```python
from litellm import vector_stores
import os

# Set your credentials
os.environ["MILVUS_API_KEY"] = "your-milvus-api-key"
os.environ["MILVUS_API_BASE"] = "https://your-milvus-instance.milvus.io"

# Search the vector store
response = vector_stores.search(
    vector_store_id="my-collection-name",  # Your Milvus collection name
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
        "api_version": "2025-09-01"
    },
    milvus_text_field="book_intro",  # Field name that contains text content
    api_key=os.getenv("MILVUS_API_KEY"),
)

print(response)
```

### 异步搜索

```python
from litellm import vector_stores

response = await vector_stores.asearch(
    vector_store_id="my-collection-name",
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
        "api_version": "2025-09-01"
    },
    milvus_text_field="book_intro",
    api_key=os.getenv("MILVUS_API_KEY"),
)

print(response)
```

### 高级选项

```python
from litellm import vector_stores

response = vector_stores.search(
    vector_store_id="my-collection-name",
    query="What is the capital of France?",
    custom_llm_provider="milvus",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
    },
    milvus_text_field="book_intro",
    api_key=os.getenv("MILVUS_API_KEY"),
    # Milvus-specific parameters
    limit=10,  # Number of results to return
    offset=0,  # Pagination offset
    milvus_db_name="default",  # Database name, sent to Milvus as dbName
    annsField="book_intro_vector",  # Vector field name
    outputFields=["id", "book_intro", "title"],  # Fields to return
    filter='book_id > 0',  # Metadata filter expression
    searchParams={"metric_type": "L2", "params": {"nprobe": 10}},  # Search parameters
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="代理">

### 配置设置

把以下内容添加到你的 config.yaml 中：

```yaml
vector_store_registry:
  - vector_store_name: "milvus-knowledgebase"
    litellm_params:
        vector_store_id: "my-collection-name"
        custom_llm_provider: "milvus"
        api_key: os.environ/MILVUS_API_KEY
        api_base: https://your-milvus-instance.milvus.io
        litellm_embedding_model: "azure/text-embedding-3-large"
        litellm_embedding_config:
            api_base: https://your-endpoint.cognitiveservices.azure.com/
            api_key: os.environ/AZURE_API_KEY
            api_version: "2025-09-01"
        milvus_text_field: "book_intro"
        # Optional Milvus parameters
        annsField: "book_intro_vector"
        limit: 10
```

### 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 通过 API 搜索

```bash
curl -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-collection-name/search' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "query": "What is the capital of France?"
}'
```

</TabItem>
</Tabs>

## 必需参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `vector_store_id` | string | 你的 Milvus 集合名称 |
| `custom_llm_provider` | string | 设置为 `"milvus"` |
| `litellm_embedding_model` | string | 用于生成查询嵌入的模型（如 `"azure/text-embedding-3-large"`） |
| `litellm_embedding_config` | dict | 嵌入模型的配置（api_base、api_key、api_version） |
| `milvus_text_field` | string | 集合中存放文本内容的字段名 |
| `api_key` | string | 你的 Milvus API 密钥（也可设置 `MILVUS_API_KEY` 环境变量） |
| `api_base` | string | 你的 Milvus API 基础 URL（也可设置 `MILVUS_API_BASE` 环境变量） |

## 可选参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `milvus_db_name` | string | 要搜索的 Milvus 数据库，以 `dbName` 传递（未设置时 Milvus 使用 "default"） |
| `annsField` | string | 要搜索的向量字段名（默认值："book_intro_vector"） |
| `limit` | integer | 返回结果的最大数量 |
| `offset` | integer | 分页偏移量 |
| `filter` | string | 用于元数据过滤的过滤表达式 |
| `groupingField` | string | 对结果进行分组的字段 |
| `outputFields` | list | 结果中返回的字段列表 |
| `searchParams` | dict | 搜索参数，例如度量类型（metric type）等 |
| `milvus_partition_names` | list | 要搜索的分区，以 `partitionNames` 传递 |
| `consistencyLevel` | string | 搜索的一致性级别 |

## 支持的功能

| 功能 | 状态 | 说明 |
|---------|--------|-------|
| 日志 | ✅ 支持 | 提供完整的日志支持 |
| 防护栏 | ❌ 暂不支持 | 向量存储目前不支持防护栏（guardrails） |
| 成本追踪 | ✅ 支持 | Milvus 搜索的成本为 $0 |
| 统一 API | ✅ 支持 | 通过 OpenAI 兼容的 `/v1/vector_stores/search` 端点调用 |
| 透传 | ✅ 支持 | 使用原生 Milvus API 格式 |

## 响应格式

响应遵循 LiteLLM 标准的向量存储格式：

```json
{
  "object": "vector_store.search_results.page",
  "search_query": "What is the capital of France?",
  "data": [
    {
      "score": 0.95,
      "content": [
        {
          "text": "Paris is the capital of France...",
          "type": "text"
        }
      ],
      "file_id": null,
      "filename": null,
      "attributes": {
        "id": "123",
        "title": "France Geography"
      }
    }
  ]
}
```

## 透传 API（原生 Milvus 格式）

通过透传（passthrough）API，开发者可以用原生 Milvus API 格式来**创建**和**搜索**向量存储，而无需向他们提供 Milvus 凭据。

此功能仅适用于 LiteLLM 代理服务器。

### 管理员流程

#### 1. 将向量存储添加到 LiteLLM

```yaml
model_list:  
  - model_name: embedding-model
    litellm_params:
      model: azure/text-embedding-3-large
      api_base: https://your-endpoint.cognitiveservices.azure.com/
      api_key: os.environ/AZURE_API_KEY
      api_version: "2025-09-01"

vector_store_registry:
  - vector_store_name: "milvus-store"
    litellm_params:
      vector_store_id: "can-be-anything" # vector store id can be anything for the purpose of passthrough api
      custom_llm_provider: "milvus"
      api_key: os.environ/MILVUS_API_KEY
      api_base: https://your-milvus-instance.milvus.io

general_settings:
    database_url: "postgresql://user:password@host:port/database"
    master_key: "sk-<your-litellm-master-key>"
```

把你的向量存储凭据添加到 LiteLLM。

#### 2. 启动代理

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### 3. 创建虚拟索引

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/indexes' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{ 
    "index_name": "dall-e-6",
    "litellm_params": {
        "vector_store_index": "real-collection-name",
        "vector_store_name": "milvus-store"
    }
}'
```

这是一个虚拟索引，开发者可以用它来创建和搜索向量存储。

#### 4. 创建具有向量存储权限的密钥

```bash
curl -L -X POST 'http://0.0.0.0:4000/key/generate' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "allowed_vector_store_indexes": [{"index_name": "dall-e-6", "index_permissions": ["write", "read"]}],
    "models": ["embedding-model"]
}'
```

为这把密钥授予访问虚拟索引和嵌入模型的权限。

**预期响应**

```json
{
    "key": "sk-my-virtual-key"
}
```

### 开发者流程

#### MilvusRESTClient

要使用透传 API，你需要一个简单的 REST 客户端。把 `milvus_rest_client.py` 文件复制到你的项目中：

<details>
<summary>点击展开 milvus_rest_client.py</summary>

```python
"""
Simple Milvus REST API v2 Client
Based on: https://milvus.io/api-reference/restful/v2.6.x/
"""

import requests
from typing import List, Dict, Any, Optional


class DataType:
    """Milvus data types"""

    INT64 = "Int64"
    FLOAT_VECTOR = "FloatVector"
    VARCHAR = "VarChar"
    BOOL = "Bool"
    FLOAT = "Float"


class CollectionSchema:
    """Collection schema builder"""

    def __init__(self):
        self.fields = []

    def add_field(
        self,
        field_name: str,
        data_type: str,
        is_primary: bool = False,
        dim: Optional[int] = None,
        description: str = "",
    ):
        """Add a field to the schema"""
        field = {
            "fieldName": field_name,
            "dataType": data_type,
            "isPrimary": is_primary,
            "description": description,
        }
        if data_type == DataType.FLOAT_VECTOR and dim:
            field["elementTypeParams"] = {"dim": str(dim)}
        self.fields.append(field)
        return self

    def to_dict(self):
        """Convert schema to dict for API"""
        return {"fields": self.fields}


class IndexParams:
    """Index parameters builder"""

    def __init__(self):
        self.indexes = []

    def add_index(
        self, field_name: str, metric_type: str = "L2", index_name: Optional[str] = None
    ):
        """Add an index"""
        index = {
            "fieldName": field_name,
            "indexName": index_name or f"{field_name}_index",
            "metricType": metric_type,
        }
        self.indexes.append(index)
        return self

    def to_list(self):
        """Convert to list for API"""
        return self.indexes


class MilvusRESTClient:
    """
    Simple Milvus REST API v2 Client

    Reference: https://milvus.io/api-reference/restful/v2.6.x/
    """

    def __init__(self, uri: str, token: str, db_name: str = "default"):
        """
        Initialize Milvus REST client

        Args:
            uri: Milvus server URI (e.g., http://localhost:19530)
            token: Authentication token
            db_name: Database name
        """
        self.base_url = uri.rstrip("/")
        self.token = token
        self.db_name = db_name
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a POST request to Milvus API"""
        url = f"{self.base_url}{endpoint}"

        # Add dbName if not already in data and not default
        if "dbName" not in data and self.db_name != "default":
            data["dbName"] = self.db_name

        try:
            response = requests.post(url, json=data, headers=self.headers)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"e.response.text: {e.response.content}")
            raise e

        result = response.json()

        # Check for API errors
        if result.get("code") != 0:
            raise Exception(
                f"Milvus API Error: {result.get('message', 'Unknown error')}"
            )

        return result

    def has_collection(self, collection_name: str) -> bool:
        """
        Check if a collection exists

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Has.md
        """
        try:
            result = self._make_request(
                "/v2/vectordb/collections/has", {"collectionName": collection_name}
            )
            return result.get("data", {}).get("has", False)
        except Exception:
            return False

    def drop_collection(self, collection_name: str):
        """
        Drop a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Drop.md
        """
        return self._make_request(
            "/v2/vectordb/collections/drop", {"collectionName": collection_name}
        )

    def create_schema(self) -> CollectionSchema:
        """Create a new collection schema"""
        return CollectionSchema()

    def prepare_index_params(self) -> IndexParams:
        """Create index parameters"""
        return IndexParams()

    def create_collection(
        self,
        collection_name: str,
        schema: CollectionSchema,
        index_params: Optional[IndexParams] = None,
    ):
        """
        Create a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Create.md
        """
        data = {"collectionName": collection_name, "schema": schema.to_dict()}

        if index_params:
            data["indexParams"] = index_params.to_list()

        return self._make_request("/v2/vectordb/collections/create", data)

    def describe_collection(self, collection_name: str) -> Dict[str, Any]:
        """
        Describe a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Describe.md
        """
        result = self._make_request(
            "/v2/vectordb/collections/describe", {"collectionName": collection_name}
        )
        return result.get("data", {})

    def insert(
        self,
        collection_name: str,
        data: List[Dict[str, Any]],
        partition_name: Optional[str] = None,
    ):
        """
        Insert data into a collection

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Vector%20(v2)/Insert.md
        """
        payload = {"collectionName": collection_name, "data": data}

        if partition_name:
            payload["partitionName"] = partition_name

        result = self._make_request("/v2/vectordb/entities/insert", payload)
        return result.get("data", {})

    def flush(self, collection_name: str):
        """
        Flush collection data to storage

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Collection%20(v2)/Flush.md
        """
        return self._make_request(
            "/v2/vectordb/collections/flush", {"collectionName": collection_name}
        )

    def search(
        self,
        collection_name: str,
        data: List[List[float]],
        anns_field: str,
        limit: int = 10,
        search_params: Optional[Dict[str, Any]] = None,
        output_fields: Optional[List[str]] = None,
    ) -> List[List[Dict]]:
        """
        Search for vectors

        Reference: https://milvus.io/api-reference/restful/v2.6.x/v2/Vector%20(v2)/Search.md
        """
        payload = {
            "collectionName": collection_name,
            "data": data,
            "annsField": anns_field,
            "limit": limit,
        }

        if search_params:
            payload["searchParams"] = search_params

        if output_fields:
            payload["outputFields"] = output_fields

        result = self._make_request("/v2/vectordb/entities/search", payload)
        return result.get("data", [])
```

</details>

#### 1. 使用 Schema 创建集合

注意：透传 API 使用的是你配置中的 `milvus` provider，请使用 `/milvus` 端点。

```python
from milvus_rest_client import MilvusRESTClient, DataType  # Use the client from above
import random
import time

# Configuration
uri = "http://0.0.0.0:4000/milvus"  # IMPORTANT: Use the '/milvus' endpoint for passthrough
token = "sk-my-virtual-key"
collection_name = "dall-e-6"  # Virtual index name

# Initialize client
milvus_client = MilvusRESTClient(uri=uri, token=token)
print(f"Connected to DB: {uri} successfully")

# Check if the collection exists and drop if it does
check_collection = milvus_client.has_collection(collection_name)
if check_collection:
    milvus_client.drop_collection(collection_name)
    print(f"Dropped the existing collection {collection_name} successfully")

# Define schema
dim = 64  # Vector dimension

print("Start to create the collection schema")
schema = milvus_client.create_schema()
schema.add_field(
    "book_id", DataType.INT64, is_primary=True, description="customized primary id"
)
schema.add_field("word_count", DataType.INT64, description="word count")
schema.add_field(
    "book_intro", DataType.FLOAT_VECTOR, dim=dim, description="book introduction"
)

# Prepare index parameters
print("Start to prepare index parameters with default AUTOINDEX")
index_params = milvus_client.prepare_index_params()
index_params.add_index("book_intro", metric_type="L2")

# Create collection
print(f"Start to create example collection: {collection_name}")
milvus_client.create_collection(
    collection_name, schema=schema, index_params=index_params
)
collection_property = milvus_client.describe_collection(collection_name)
print("Collection details: %s" % collection_property)
```

#### 2. 向集合插入数据

```python
# Insert data with customized ids
nb = 1000
insert_rounds = 2
start = 0  # first primary key id
total_rt = 0  # total response time for insert

print(
    f"Start to insert {nb*insert_rounds} entities into example collection: {collection_name}"
)
for i in range(insert_rounds):
    vector = [random.random() for _ in range(dim)]
    rows = [
        {"book_id": i, "word_count": random.randint(1, 100), "book_intro": vector}
        for i in range(start, start + nb)
    ]
    t0 = time.time()
    milvus_client.insert(collection_name, rows)
    ins_rt = time.time() - t0
    start += nb
    total_rt += ins_rt
print(f"Insert completed in {round(total_rt, 4)} seconds")

# Flush the collection
print("Start to flush")
start_flush = time.time()
milvus_client.flush(collection_name)
end_flush = time.time()
print(f"Flush completed in {round(end_flush - start_flush, 4)} seconds")
```

#### 3. 搜索集合

```python
# Search configuration
nq = 3  # Number of query vectors
search_params = {"metric_type": "L2", "params": {"level": 2}}
limit = 2  # Number of results to return

# Perform searches
for i in range(5):
    search_vectors = [[random.random() for _ in range(dim)] for _ in range(nq)]
    t0 = time.time()
    results = milvus_client.search(
        collection_name,
        data=search_vectors,
        limit=limit,
        search_params=search_params,
        anns_field="book_intro",
    )
    t1 = time.time()
    print(f"Search {i} results: {results}")
    print(f"Search {i} latency: {round(t1-t0, 4)} seconds")
```

#### 完整示例

下面是一个完整的可运行示例：

```python
from milvus_rest_client import MilvusRESTClient, DataType  # Use the client from above
import random
import time

# ----------------------------
# 🔐 CONFIGURATION
# ----------------------------
uri = "http://0.0.0.0:4000/milvus"  # IMPORTANT: Use the '/milvus' endpoint
token = "sk-my-virtual-key"
collection_name = "dall-e-6"  # Your virtual index name

# ----------------------------
# 📋 STEP 1 — Initialize Client
# ----------------------------
milvus_client = MilvusRESTClient(uri=uri, token=token)
print(f"✅ Connected to DB: {uri} successfully")

# ----------------------------
# 🗑️  STEP 2 — Drop Existing Collection (if needed)
# ----------------------------
check_collection = milvus_client.has_collection(collection_name)
if check_collection:
    milvus_client.drop_collection(collection_name)
    print(f"🗑️  Dropped the existing collection {collection_name} successfully")

# ----------------------------
# 📐 STEP 3 — Create Collection Schema
# ----------------------------
dim = 64  # Vector dimension

print("📐 Creating the collection schema")
schema = milvus_client.create_schema()
schema.add_field(
    "book_id", DataType.INT64, is_primary=True, description="customized primary id"
)
schema.add_field("word_count", DataType.INT64, description="word count")
schema.add_field(
    "book_intro", DataType.FLOAT_VECTOR, dim=dim, description="book introduction"
)

# ----------------------------
# 🔍 STEP 4 — Create Index
# ----------------------------
print("🔍 Preparing index parameters with default AUTOINDEX")
index_params = milvus_client.prepare_index_params()
index_params.add_index("book_intro", metric_type="L2")

# ----------------------------
# 🏗️  STEP 5 — Create Collection
# ----------------------------
print(f"🏗️  Creating collection: {collection_name}")
milvus_client.create_collection(
    collection_name, schema=schema, index_params=index_params
)
collection_property = milvus_client.describe_collection(collection_name)
print(f"✅ Collection created: {collection_property}")

# ----------------------------
# 📤 STEP 6 — Insert Data
# ----------------------------
nb = 1000
insert_rounds = 2
start = 0
total_rt = 0

print(f"📤 Inserting {nb*insert_rounds} entities into collection")
for i in range(insert_rounds):
    vector = [random.random() for _ in range(dim)]
    rows = [
        {"book_id": i, "word_count": random.randint(1, 100), "book_intro": vector}
        for i in range(start, start + nb)
    ]
    t0 = time.time()
    milvus_client.insert(collection_name, rows)
    ins_rt = time.time() - t0
    start += nb
    total_rt += ins_rt
print(f"✅ Insert completed in {round(total_rt, 4)} seconds")

# ----------------------------
# 💾 STEP 7 — Flush Collection
# ----------------------------
print("💾 Flushing collection")
start_flush = time.time()
milvus_client.flush(collection_name)
end_flush = time.time()
print(f"✅ Flush completed in {round(end_flush - start_flush, 4)} seconds")

# ----------------------------
# 🔍 STEP 8 — Search
# ----------------------------
nq = 3
search_params = {"metric_type": "L2", "params": {"level": 2}}
limit = 2

print(f"🔍 Performing {5} search operations")
for i in range(5):
    search_vectors = [[random.random() for _ in range(dim)] for _ in range(nq)]
    t0 = time.time()
    results = milvus_client.search(
        collection_name,
        data=search_vectors,
        limit=limit,
        search_params=search_params,
        anns_field="book_intro",
    )
    t1 = time.time()
    print(f"✅ Search {i} results: {results}")
    print(f"   Search {i} latency: {round(t1-t0, 4)} seconds")
```

## 工作原理

搜索时的处理流程如下：

1. LiteLLM 用你指定的嵌入模型把查询转换成向量
2. 通过 `/v2/vectordb/entities/search` 端点把向量发送到你的 Milvus 实例
3. Milvus 利用向量相似度搜索，在你的集合中找出最相似的文档
4. 结果附带距离分数返回

嵌入模型可以是 LiteLLM 支持的任意模型，例如 Azure OpenAI、OpenAI、Bedrock 等。
