import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gemini File Search

配合 LiteLLM 使用 Google Gemini 的 File Search，实现检索增强生成（Retrieval Augmented Generation，RAG）。

Gemini File Search 会对你的数据进行导入、分块和索引，让你能够基于用户提示词快速检索相关信息。这些信息随后会作为上下文提供给模型，让回答更准确、更切题。

[Gemini File Search 官方文档](https://ai.google.dev/gemini-api/docs/file-search)

## 功能特性

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪 | ❌ | 暂未实现费用计算 |
| 日志记录 | ✅ | 完整记录请求与响应 |
| RAG 摄取 API | ✅ | 上传 → 分块 → 嵌入 → 存储 |
| 向量存储搜索（vector store search） | ✅ | 支持带元数据过滤条件的搜索 |
| 自定义分块（chunking） | ✅ | 可配置分块大小与重叠 |
| 元数据过滤（metadata filtering） | ✅ | 按自定义元数据过滤 |
| 引文（citation） | ✅ | 从 grounding 元数据中提取 |

## 快速上手

### 配置

设置你的 Gemini API 密钥：

```bash
export GEMINI_API_KEY="your-api-key"
# or
export GOOGLE_API_KEY="your-api-key"
```

### 基础 RAG 摄取

<Tabs>
<TabItem value="python" label="Python SDK">

```python
import litellm

# Ingest a document
response = await litellm.aingest(
    ingest_options={
        "name": "my-document-store",
        "vector_store": {
            "custom_llm_provider": "gemini"
        }
    },
    file_data=("document.txt", b"Your document content", "text/plain")
)

print(f"Vector Store ID: {response['vector_store_id']}")
print(f"File ID: {response['file_id']}")
```

</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy">

```bash
curl -X POST "http://localhost:4000/v1/rag/ingest" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "file": {
      "filename": "document.txt",
      "content": "'$(base64 -i document.txt)'",
      "content_type": "text/plain"
    },
    "ingest_options": {
      "name": "my-document-store",
      "vector_store": {
        "custom_llm_provider": "gemini"
      }
    }
  }'
```

</TabItem>
</Tabs>

### 搜索向量存储

<Tabs>
<TabItem value="python" label="Python SDK">

```python
import litellm

# Search the vector store
response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is the main topic?",
    custom_llm_provider="gemini",
    max_num_results=5
)

for result in response["data"]:
    print(f"Score: {result.get('score')}")
    print(f"Content: {result['content'][0]['text']}")
```

</TabItem>

<TabItem value="proxy" label="LiteLLM Proxy">

```bash
curl -X POST "http://localhost:4000/v1/vector_stores/fileSearchStores/your-store-id/search" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "custom_llm_provider": "gemini",
    "max_num_results": 5
  }'
```

</TabItem>
</Tabs>

## 高级功能

### 自定义分块配置

控制文档切分为分块的方式：

```python
import litellm

response = await litellm.aingest(
    ingest_options={
        "name": "custom-chunking-store",
        "vector_store": {
            "custom_llm_provider": "gemini"
        },
        "chunking_strategy": {
            "white_space_config": {
                "max_tokens_per_chunk": 200,
                "max_overlap_tokens": 20
            }
        }
    },
    file_data=("document.txt", document_content, "text/plain")
)
```

**分块参数**：
- `max_tokens_per_chunk`：每个分块的最大 token 数（默认 800，最小 100，最大 4096）
- `max_overlap_tokens`：分块之间的重叠 token 数（默认 400）

### 元数据过滤

为文件附加自定义元数据，并据此过滤搜索结果：

#### 摄取时附加元数据

```python
import litellm

response = await litellm.aingest(
    ingest_options={
        "name": "metadata-store",
        "vector_store": {
            "custom_llm_provider": "gemini",
            "custom_metadata": [
                {"key": "author", "string_value": "John Doe"},
                {"key": "year", "numeric_value": 2024},
                {"key": "category", "string_value": "documentation"}
            ]
        }
    },
    file_data=("document.txt", document_content, "text/plain")
)
```

#### 使用元数据过滤搜索

```python
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="What is LiteLLM?",
    custom_llm_provider="gemini",
    filters={"author": "John Doe", "category": "documentation"}
)
```

**过滤语法**：
- 简单等值匹配：`{"key": "value"}`
- Gemini 会将其转换为：`key="value"`
- 多个过滤条件之间是 AND 关系

### 使用已有向量存储

将文档摄取到已有的 File Search 存储中：

```python
import litellm

# First, create a store
create_response = await litellm.vector_stores.acreate(
    name="My Persistent Store",
    custom_llm_provider="gemini"
)
store_id = create_response["id"]

# Then ingest multiple documents into it
for doc in documents:
    await litellm.aingest(
        ingest_options={
            "vector_store": {
                "custom_llm_provider": "gemini",
                "vector_store_id": store_id  # Reuse existing store
            }
        },
        file_data=(doc["name"], doc["content"], doc["type"])
    )
```

### 引文提取

Gemini 会随结果返回包含引文的 grounding 元数据：

```python
import litellm

response = await litellm.vector_stores.asearch(
    vector_store_id="fileSearchStores/your-store-id",
    query="Explain the concept",
    custom_llm_provider="gemini"
)

for result in response["data"]:
    # Access citation information
    if "attributes" in result:
        print(f"URI: {result['attributes'].get('uri')}")
        print(f"Title: {result['attributes'].get('title')}")
    
    # Content with relevance score
    print(f"Score: {result.get('score')}")
    print(f"Text: {result['content'][0]['text']}")
```

## 完整示例

端到端完整流程：

```python
import litellm

# 1. Create a File Search store
store_response = await litellm.vector_stores.acreate(
    name="Knowledge Base",
    custom_llm_provider="gemini"
)
store_id = store_response["id"]
print(f"Created store: {store_id}")

# 2. Ingest documents with custom chunking and metadata
documents = [
    {
        "name": "intro.txt",
        "content": b"Introduction to LiteLLM...",
        "metadata": [
            {"key": "section", "string_value": "intro"},
            {"key": "priority", "numeric_value": 1}
        ]
    },
    {
        "name": "advanced.txt",
        "content": b"Advanced features...",
        "metadata": [
            {"key": "section", "string_value": "advanced"},
            {"key": "priority", "numeric_value": 2}
        ]
    }
]

for doc in documents:
    ingest_response = await litellm.aingest(
        ingest_options={
            "name": f"ingest-{doc['name']}",
            "vector_store": {
                "custom_llm_provider": "gemini",
                "vector_store_id": store_id,
                "custom_metadata": doc["metadata"]
            },
            "chunking_strategy": {
                "white_space_config": {
                    "max_tokens_per_chunk": 300,
                    "max_overlap_tokens": 50
                }
            }
        },
        file_data=(doc["name"], doc["content"], "text/plain")
    )
    print(f"Ingested: {doc['name']}")

# 3. Search with filters
search_response = await litellm.vector_stores.asearch(
    vector_store_id=store_id,
    query="How do I get started?",
    custom_llm_provider="gemini",
    filters={"section": "intro"},
    max_num_results=3
)

# 4. Process results
for i, result in enumerate(search_response["data"]):
    print(f"\nResult {i+1}:")
    print(f"  Score: {result.get('score')}")
    print(f"  File: {result.get('filename')}")
    print(f"  Content: {result['content'][0]['text'][:100]}...")
```

## 支持的文件类型

Gemini File Search 支持多种文件格式：

### 文档
- PDF（`application/pdf`）
- Microsoft Word（`.docx`、`.doc`）
- Microsoft Excel（`.xlsx`、`.xls`）
- Microsoft PowerPoint（`.pptx`）
- OpenDocument 格式（`.odt`、`.ods`、`.odp`）

### 文本文件
- 纯文本（`text/plain`）
- Markdown（`text/markdown`）
- HTML（`text/html`）
- CSV（`text/csv`）
- JSON（`application/json`）
- XML（`application/xml`）

### 代码文件
- Python、JavaScript、TypeScript、Java、C/C++、Go、Rust 等
- 支持大多数常见编程语言

完整列表参见 [Gemini 支持的文件类型一览](https://ai.google.dev/gemini-api/docs/file-search#supported-file-types)。

## 价格

- **索引**：每 100 万 token $0.15（按嵌入定价计费）
- **存储**：免费
- **查询嵌入**：免费
- **检索到的 token**：按普通上下文 token 计费

## 支持的模型

File Search 可搭配以下模型使用：
- `{{gemini_pro}}`
- `{{gemini_flash}}`（含预览版本）

## 故障排查

### 认证错误

```python
# Ensure API key is set
import os
os.environ["GEMINI_API_KEY"] = "your-api-key"

# Or pass explicitly
response = await litellm.aingest(
    ingest_options={
        "vector_store": {
            "custom_llm_provider": "gemini",
            "api_key": "your-api-key"
        }
    },
    file_data=(...)
)
```

### 找不到存储

请确保使用完整的存储名称格式：
- ✅ `fileSearchStores/abc123`
- ❌ `abc123`

### 大文件

超过 100MB 的文件，请先切成更小的块再摄取。

### 索引缓慢

摄取完成后，Gemini 可能还需要一段时间为文档建立索引。搜索前请等待几秒：

```python
import time

# After ingest
await litellm.aingest(...)

# Wait for indexing
time.sleep(5)

# Then search
await litellm.vector_stores.asearch(...)
```

## 相关资源

- [Gemini File Search 官方文档](https://ai.google.dev/gemini-api/docs/file-search)
- [LiteLLM RAG 摄取 API](/docs/rag_ingest)
- [LiteLLM 向量存储搜索](/docs/vector_stores/search)
- [在对话中使用向量存储](/docs/completion/knowledgebase)
