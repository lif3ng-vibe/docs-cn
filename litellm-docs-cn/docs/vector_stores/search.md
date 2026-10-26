import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /vector_stores/search - 搜索向量存储

根据查询和文件属性过滤器，在向量存储（vector store）中搜索相关的内容块（chunk）。这非常适合检索增强生成（RAG）场景。

## 概览

| 功能 | 支持情况 | 说明 |
|---------|-----------|-------|
| 成本追踪 | ✅ | 按每次搜索操作追踪 |
| 日志 | ✅ | 适用于所有集成方式 |
| 终端用户追踪 | ✅ | |
| 支持的 LLM 提供商 | **OpenAI, Azure OpenAI, Bedrock, Vertex RAG Engine, Azure AI, Milvus, Valkey, Gemini** | 各提供商均完整支持向量存储 API |

如需通过 HTTP 执行**检索、列出、更新与删除**操作（包括 `custom_llm_provider` / `model` 路由），参见[创建向量存储](./create.md#代理上的向量存储管理与路由)。

## 用法

### LiteLLM Python SDK

<Tabs>
<TabItem value="basic" label="基本用法">

#### 非流式示例
```python showLineNumbers title="Search Vector Store - Basic"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?"
)
print(response)
```

#### 同步示例
```python showLineNumbers title="Search Vector Store - Sync"
import litellm

response = litellm.vector_stores.search(
    vector_store_id="vs_abc123",
    query="What is the capital of France?"
)
print(response)
```

</TabItem>

<TabItem value="advanced" label="高级配置">

#### 使用过滤器与排序选项
```python showLineNumbers title="Search Vector Store - Advanced"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    filters={
        "file_ids": ["file-abc123", "file-def456"]
    },
    max_num_results=5,
    ranking_options={
        "score_threshold": 0.7
    },
    rewrite_query=True
)
print(response)
```

</TabItem>

<TabItem value="multiple-queries" label="多个查询">

#### 使用多个查询进行搜索
```python showLineNumbers title="Search Vector Store - Multiple Queries"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query=[
        "What is the capital of France?",
        "What is the population of Paris?"
    ],
    max_num_results=10
)
print(response)
```

</TabItem>

<TabItem value="openai-provider" label="OpenAI 提供商">

#### 显式指定 OpenAI 提供商
```python showLineNumbers title="Search Vector Store - OpenAI Provider"
import litellm
import os

# Set API key
os.environ["OPENAI_API_KEY"] = "your-openai-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    custom_llm_provider="openai"
)
print(response)
```

</TabItem>

<TabItem value="azure-ai-provider" label="Azure AI 提供商">

#### 使用 Azure AI Search
```python showLineNumbers title="Search Vector Store - Azure AI Provider"
import litellm
import os

# Set credentials
os.environ["AZURE_SEARCH_API_KEY"] = "your-search-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": "your-embedding-endpoint",
        "api_key": "your-embedding-api-key",
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)
print(response)
```

[查看完整的 Azure AI 向量存储文档](../providers/azure_ai_vector_stores.md)

</TabItem>

<TabItem value="milvus-provider" label="Milvus 提供商">

#### 使用 Milvus
```python showLineNumbers title="Search Vector Store - Milvus Provider"
import litellm
import os

# Set credentials
os.environ["MILVUS_API_KEY"] = "your-milvus-api-key"
os.environ["MILVUS_API_BASE"] = "https://your-milvus-instance.milvus.io"

response = await litellm.vector_stores.asearch(
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
)
print(response)
```

[查看完整的 Milvus 向量存储文档](../providers/milvus_vector_stores.md)

</TabItem>

<TabItem value="mongodb-provider" label="MongoDB 提供商（BETA）">

#### 使用 MongoDB（BETA）

在 Atlas 或自托管部署上搜索现有的 MongoDB Vector Search 索引。先安装 `litellm[mongodb]`，再设置 `MONGODB_CONNECTION_STRING` 与嵌入提供商的凭据。将占位符替换为你的索引名称、集合字段，以及用于嵌入文档的模型。

```python showLineNumbers title="Search Vector Store - MongoDB Provider (BETA)"
import os

import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="<index-name>",  # Exact MongoDB Vector Search index name
    query="<question-about-your-documents>",
    custom_llm_provider="mongodb",
    mongodb_connection_string=os.environ["MONGODB_CONNECTION_STRING"],
    mongodb_database="<database-name>",
    mongodb_collection="<collection-name>",
    mongodb_text_field="<text-field>",
    mongodb_embedding_field="<vector-field>",
    litellm_embedding_model="<provider>/<embedding-model>",
    max_num_results=3,
)
print(response)
```

嵌入模型必须与存储向量时使用的模型一致。该 BETA 集成仅支持搜索，不支持创建索引、数据写入、过滤器、排序选项和查询改写。

[MongoDB 设置与参考](../providers/mongodb_vector_stores.md) · [示例文档演示](../tutorials/mongodb_vector_search.md)

</TabItem>

<TabItem value="valkey-provider" label="Valkey 提供商">

#### 使用 Valkey
```python showLineNumbers title="Search Vector Store - Valkey Provider"
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="my-search-index",  # name of the FT index in Valkey
    query="What is the capital of France?",
    custom_llm_provider="valkey",
    valkey_host="my-valkey.example.com",
    valkey_port=6379,
    litellm_embedding_model="openai/text-embedding-3-small",
    max_num_results=3,
)
print(response)
```

[查看完整的 Valkey 向量存储文档](../providers/valkey_vector_stores.md)

</TabItem>

<TabItem value="gemini-provider" label="Gemini 提供商">

#### 使用 Gemini File Search
```python showLineNumbers title="Search Vector Store - Gemini Provider"
import litellm
import os

# Set credentials
os.environ["GEMINI_API_KEY"] = "your-gemini-api-key"

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is the capital of France?",
    custom_llm_provider="gemini",
    max_num_results=5
)
print(response)
```

**使用元数据过滤器**：
```python showLineNumbers title="Search with Metadata Filter"
response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is LiteLLM?",
    custom_llm_provider="gemini",
    filters={"author": "John Doe", "category": "documentation"},
    max_num_results=5
)
print(response)
```

[查看完整的 Gemini File Search 文档](../providers/gemini_file_search.md)

</TabItem>
</Tabs>

### LiteLLM 代理服务器

<Tabs>
<TabItem value="proxy-setup" label="设置与使用">

1. 配置 config.yaml

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  # Vector store settings can be added here if needed
```

2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

3. 用 OpenAI SDK 测试！

```python showLineNumbers title="OpenAI SDK via LiteLLM Proxy"
from openai import OpenAI

# Point OpenAI SDK to LiteLLM proxy
client = OpenAI(
    base_url="http://0.0.0.0:4000",
    api_key="sk-<your-litellm-api-key>",  # Your LiteLLM API key
)

search_results = client.beta.vector_stores.search(
    vector_store_id="vs_abc123",
    query="What is the capital of France?",
    max_num_results=5
)
print(search_results)
```

</TabItem>

<TabItem value="curl-proxy" label="curl">

```bash showLineNumbers title="Search Vector Store via curl"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores/vs_abc123/search' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "query": "What is the capital of France?",
  "filters": {
    "file_ids": ["file-abc123", "file-def456"]
  },
  "max_num_results": 5,
  "ranking_options": {
    "score_threshold": 0.7
  },
  "rewrite_query": true
}'
```

</TabItem>

<TabItem value="vertex-search-proxy" label="Vertex AI Search">

将数据存储或搜索应用注册为[托管向量存储](./managed_vector_stores.md)，provider 设为 `vertex_ai/search_api`。Discovery Engine 原生的搜索字段放在 `extra_body` 中。

使用基于版面分块（layout-based chunking）的数据存储时，默认返回整篇文档的摘要片段。请改为请求分块结果，让每条命中都带上对应的段落：

```bash showLineNumbers title="Search a chunked data store"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-datastore_1234567890/search' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "query": "annual pass refund window",
  "max_num_results": 5,
  "extra_body": {
    "contentSearchSpec": {"searchResultMode": "CHUNKS"}
  }
}'
```

每条结果的 `content[0].text` 是分块文本，`file_id` 和 `filename` 对应源文档的 URI 与标题，`attributes` 则携带 `document_id`、`chunk_id`、`pageSpan`，以及数据存储提供的文档 `structData`（如果有的话）。

企业版（Enterprise-tier）搜索应用可以改为返回抽取式片段或答案，其优先级高于 `content[0].text` 中的摘要片段（先片段，后答案）：

```bash showLineNumbers title="Search with extractive content"
curl -L -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-search-app/search' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
  "query": "how does billing work",
  "extra_body": {
    "contentSearchSpec": {
      "extractiveContentSpec": {"maxExtractiveSegmentCount": 1, "maxExtractiveAnswerCount": 1}
    }
  }
}'
```

结构化数据存储会把每条记录放在 `attributes.structData` 下返回。

</TabItem>
</Tabs>

## 设置向量存储

要搜索提供商上已存在的存储，需先将其注册到 LiteLLM，方式有 `config.yaml`、`POST /vector_store/new` 或管理界面（Admin UI）；参见[托管向量存储](./managed_vector_stores.md)。各提供商的具体配置参见[向量存储配置指南](../completion/knowledgebase.md)：

- 提供商专属配置（Bedrock、OpenAI、Azure、Vertex AI、PG Vector）
- Python SDK 与代理的配置示例
- 认证与凭据管理

## 在对话补全中使用向量存储

在对话补全请求中传入 `vector_store_ids`，即可自动检索相关上下文。实现细节参见[在对话补全中使用向量存储](../completion/knowledgebase.md#2-使用-vector_store_ids-参数发起请求)。
