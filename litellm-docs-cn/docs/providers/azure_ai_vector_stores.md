import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Azure AI Search - 向量存储（统一 API）

借助 LiteLLM 统一的 `/chat/completions` API，即可对 Azure AI Search 向量存储（vector store）执行**搜索**。

## 快速上手

你需要准备三样东西：
1. 一个 Azure AI Search 服务
2. 一个嵌入模型（embedding model），用于把查询转成向量
3. 一个包含向量字段的搜索索引

## 用法

<Tabs>
<TabItem value="sdk" label="SDK">

### 基本搜索

```python
from litellm import vector_stores
import os

# Set your credentials
os.environ["AZURE_SEARCH_API_KEY"] = "your-search-api-key"
os.environ["AZURE_AI_SEARCH_EMBEDDING_API_BASE"] = "your-embedding-endpoint"
os.environ["AZURE_AI_SEARCH_EMBEDDING_API_KEY"] = "your-embedding-api-key"

# Search the vector store
response = vector_stores.search(
    vector_store_id="my-vector-index",  # Your Azure AI Search index name
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)

print(response)
```

### 异步搜索

```python
from litellm import vector_stores

response = await vector_stores.asearch(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
)

print(response)
```

### 高级选项

```python
from litellm import vector_stores

response = vector_stores.search(
    vector_store_id="my-vector-index",
    query="What is the capital of France?",
    custom_llm_provider="azure_ai",
    azure_search_service_name="your-search-service",
    litellm_embedding_model="azure/text-embedding-3-large",
    litellm_embedding_config={
        "api_base": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_BASE"),
        "api_key": os.getenv("AZURE_AI_SEARCH_EMBEDDING_API_KEY"),
    },
    api_key=os.getenv("AZURE_SEARCH_API_KEY"),
    top_k=10,  # Number of results to return
    azure_search_vector_field="contentVector",  # Custom vector field name
)

print(response)
```

</TabItem>

<TabItem value="proxy" label="代理">

### 配置文件设置

把以下内容加进你的 config.yaml：

```yaml
vector_store_registry:
  - vector_store_name: "azure-ai-search-litellm-website-knowledgebase"
    litellm_params:
        vector_store_id: "my-vector-index"  # Your Azure AI Search index name
        custom_llm_provider: "azure_ai"
        azure_search_service_name: "your-search-service"  # or api_base: https://your-search-service.search.windows.net
        api_key: os.environ/AZURE_SEARCH_API_KEY
        litellm_embedding_model: "azure/text-embedding-3-large"
        litellm_embedding_config:
            api_base: https://krris-mh44uf7y-eastus2.cognitiveservices.azure.com/
            api_key: os.environ/AZURE_API_KEY
            api_version: "2025-09-01"
```

### 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 通过 API 搜索

```bash
curl -X POST 'http://0.0.0.0:4000/v1/vector_stores/my-vector-index/search' \
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
|------|------|------|
| `vector_store_id` | string | 你的 Azure AI Search 索引名称 |
| `custom_llm_provider` | string | 设为 `"azure_ai"` |
| `azure_search_service_name` | string | 你的 Azure AI Search 服务名称 |
| `litellm_embedding_model` | string | 用于生成查询向量的模型（如 `"azure/text-embedding-3-large"`） |
| `litellm_embedding_config` | dict | 嵌入模型的配置（api_base、api_key、api_version） |
| `api_key` | string | 你的 Azure AI Search API 密钥 |

## 支持的功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 日志 | ✅ 已支持 | 提供完整的日志支持 |
| 防护栏（guardrails） | ❌ 暂不支持 | 向量存储目前不支持防护栏 |
| 成本追踪 | ✅ 已支持 | 按 Azure 的说法，成本为 $0 |
| 统一 API | ✅ 已支持 | 通过 OpenAI 兼容的 `/v1/vector_stores/search` 端点调用 |
| 透传 | ❌ 暂不支持 |  |

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
      "file_id": "doc_123",
      "filename": "Document doc_123",
      "attributes": {
        "document_id": "doc_123"
      }
    }
  ]
}
```

## 工作原理

执行搜索时：

1. LiteLLM 用你指定的嵌入模型把查询转成向量
2. 再把这个向量发送给 Azure AI Search
3. Azure AI Search 在你的索引里找出最相似的文档
4. 结果会带上相似度分数返回

嵌入模型可以是 LiteLLM 支持的任意模型，例如 Azure OpenAI、OpenAI、Bedrock 等。

## 配置你的 Azure AI Search 索引

你的索引需要一个向量字段，大致如下：

```json
{
  "name": "my-vector-index",
  "fields": [
    {
      "name": "id",
      "type": "Edm.String",
      "key": true
    },
    {
      "name": "content",
      "type": "Edm.String"
    },
    {
      "name": "contentVector",
      "type": "Collection(Edm.Single)",
      "searchable": true,
      "dimensions": 1536,
      "vectorSearchProfile": "myVectorProfile"
    }
  ]
}
```

向量维度必须与你的嵌入模型一致。例如：
- `text-embedding-3-large`：1536 维
- `text-embedding-3-small`：1536 维
- `text-embedding-ada-002`：1536 维


## 常见问题

**"Failed to generate embedding for query"**

你的嵌入模型配置有问题。请检查：
- `litellm_embedding_config` 中的 api_base 和 api_key 是否正确
- 嵌入模型名称是否正确
- 凭证是否可用

**"Index not found"**

`vector_store_id` 与搜索服务里的任何索引都不匹配。请检查：
- 索引名称是否正确
- 搜索服务名称是否用对了

**"Field 'contentVector' not found"**

你的索引使用了不同的向量字段名。请通过 `azure_search_vector_field` 传入。
