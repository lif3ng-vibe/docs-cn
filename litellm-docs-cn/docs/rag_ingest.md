# /rag/ingest

一站式文档导入流水线：**上传 → 分块 → 嵌入 → 向量存储**

| 功能 | 是否支持 |
|---------|-----------|
| 日志 | 支持 |
| 支持的提供商 | `openai`, `bedrock`, `vertex_ai`, `gemini`, `s3_vectors` |

:::tip
文档导入完成后，可使用 [/rag/query](./rag_query.md) 基于已导入的内容进行搜索并生成回答。
:::

## 快速上手

### OpenAI

```bash showLineNumbers title="导入 OpenAI 向量存储"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

### Bedrock

```bash showLineNumbers title="导入 Bedrock Knowledge Base"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"bedrock\"
            }
        }
    }"
```

### Vertex AI RAG Engine

```bash showLineNumbers title="导入 Vertex AI RAG Corpus"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"vertex_ai\",
                \"vector_store_id\": \"your-corpus-id\",
                \"gcs_bucket\": \"your-gcs-bucket\"
            }
        }
    }"
```

### AWS S3 Vectors

完整配置步骤、IAM 权限与搜索设置请参阅 [AWS S3 Vectors](./providers/s3_vectors.md)。

```bash showLineNumbers title="导入 S3 Vectors"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"embedding\": {
                \"model\": \"text-embedding-3-small\"
            },
            \"vector_store\": {
                \"custom_llm_provider\": \"s3_vectors\",
                \"vector_bucket_name\": \"my-embeddings\",
                \"aws_region_name\": \"us-west-2\"
            }
        }
    }"
```

## 响应

```json
{
  "id": "ingest_abc123",
  "status": "completed",
  "vector_store_id": "vs_xyz789",
  "file_id": "file_123"
}
```

## 使用 RAG 查询

导入完成后，使用 [/rag/query](./rag_query.md) 端点搜索内容并生成 LLM 回答：

```bash showLineNumbers title="RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_small}}",
        "messages": [{"role": "user", "content": "What is the main topic?"}],
        "retrieval_config": {
            "vector_store_id": "vs_xyz789",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

执行流程如下：
1. 在向量存储中搜索相关上下文
2. 将上下文拼接到你的消息前面
3. 生成 LLM 回答

### 直接搜索向量存储

也可以直接调用 `/vector_stores/{vector_store_id}/search` 搜索向量存储：

```bash showLineNumbers title="搜索向量存储"
curl -X POST "http://localhost:4000/v1/vector_stores/vs_xyz789/search" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "What is the main topic?",
        "max_num_results": 5
    }'
```

## 端到端示例

### OpenAI

#### 1. 导入文档

```bash showLineNumbers title="步骤 1：导入"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"test_document.txt\",
            \"content\": \"$(base64 -i test_document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"name\": \"test-basic-ingest\",
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

响应：
```json
{
  "id": "ingest_d834f544-fc5e-4751-902d-fb0bcc183b85",
  "status": "completed",
  "vector_store_id": "vs_692658d337c4819183f2ad8488d12fc9",
  "file_id": "file-M2pJJiWH56cfUP4Fe7rJay"
}
```

#### 2. 查询

```bash showLineNumbers title="步骤 2：查询"
curl -X POST "http://localhost:4000/v1/vector_stores/vs_692658d337c4819183f2ad8488d12fc9/search" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "query": "What is LiteLLM?",
        "custom_llm_provider": "openai"
    }'
```

响应：
```json
{
  "object": "vector_store.search_results.page",
  "search_query": ["What is LiteLLM?"],
  "data": [
    {
      "file_id": "file-M2pJJiWH56cfUP4Fe7rJay",
      "filename": "test_document.txt",
      "score": 0.4004629778869299,
      "attributes": {},
      "content": [
        {
          "type": "text",
          "text": "Test document abc123 for RAG ingestion.\nThis is a sample document to test the RAG ingest API.\nLiteLLM provides a unified interface for vector stores."
        }
      ]
    }
  ],
  "has_more": false,
  "next_page": null
}
```

## 请求参数

### 顶层参数

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `file` | object | file/file_url/file_id 三选一 | Base64 编码的文件 |
| `file.filename` | string | 是 | 文件名（含扩展名） |
| `file.content` | string | 是 | Base64 编码的内容 |
| `file.content_type` | string | 是 | MIME 类型（如 `text/plain`） |
| `file_url` | string | file/file_url/file_id 三选一 | 从该 URL 拉取文件 |
| `file_id` | string | file/file_url/file_id 三选一 | 已有文件的 ID |
| `ingest_options` | object | 是 | 流水线配置 |

### ingest_options

| 参数 | 类型 | 是否必填 | 说明 |
|-----------|------|----------|-------------|
| `vector_store` | object | 是 | 向量存储配置 |
| `name` | string | 否 | 用于日志记录的流水线名称 |

:::info[已注册的存储]
当 `vector_store.vector_store_id` 指向[向量存储注册表](./vector_stores/managed_vector_stores.md)中的某个存储，或此前某次导入保存过的存储时，提供商、凭证和目标设置均以该注册信息为准。请求中只有每次上传相关的选项会生效（`data_source_id`、`wait_for_ingestion`、`ingestion_timeout`、`custom_metadata`、`file_description`、`max_embedding_requests_per_min`），其余 `vector_store` 键一律忽略。若 `custom_llm_provider` 没有对应的导入实现，请求会被拒绝并返回 400，错误信息中会列出支持的提供商。
:::

### vector_store (OpenAI)

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"openai"` |
| `vector_store_id` | string | auto-create | 已有向量存储的 ID |

### vector_store (Bedrock)

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"bedrock"` |
| `vector_store_id` | string | auto-create | 已有知识库的 ID |
| `wait_for_ingestion` | boolean | `false` | 是否等待索引建立完成 |
| `ingestion_timeout` | integer | `300` | 等待时的超时时间（秒） |
| `s3_bucket` | string | auto-create | 存放文档的 S3 存储桶 |
| `s3_prefix` | string | `"data/"` | S3 键前缀 |
| `embedding_model` | string | `amazon.titan-embed-text-v2:0` | Bedrock 嵌入模型 |
| `aws_region_name` | string | `us-west-2` | AWS 区域 |

:::info[Bedrock 自动创建]
省略 `vector_store_id` 时，LiteLLM 会自动创建：
- 存放文档的 S3 存储桶
- OpenSearch Serverless 集合
- 具备所需权限的 IAM 角色
- Bedrock 知识库
- 数据源
:::

### vector_store (Vertex AI)

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"vertex_ai"` |
| `vector_store_id` | string | **required** | RAG 语料库 ID |
| `gcs_bucket` | string | **required** | 用于文件上传的 GCS 存储桶 |
| `vertex_project` | string | env `VERTEXAI_PROJECT` | GCP 项目 ID |
| `vertex_location` | string | `us-central1` | GCP 区域 |
| `vertex_credentials` | string | ADC | 凭证 JSON 文件路径 |
| `wait_for_import` | boolean | `true` | 是否等待导入完成 |
| `import_timeout` | integer | `600` | 等待时的超时时间（秒） |

:::info[Vertex AI 前置条件]
1. 在 Vertex AI 控制台或通过 API 创建 RAG 语料库
2. 创建用于文件上传的 GCS 存储桶
3. 通过 `gcloud auth application-default login` 完成认证
4. 安装依赖：`uv add 'google-cloud-aiplatform>=1.60.0'`
:::

### vector_store (AWS S3 Vectors)

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `custom_llm_provider` | string | - | `"s3_vectors"` |
| `vector_store_id` | string | auto-create | 已有索引，格式为 `bucket:index`；或 `vector_bucket_name` 内的索引名 |
| `vector_bucket_name` | string | **required** unless `vector_store_id` is `bucket:index` | S3 向量存储桶名称 |
| `index_name` | string | auto-create | 向量索引名称 |
| `dimension` | integer | auto-detect | 向量维度（由嵌入模型自动检测） |
| `distance_metric` | string | `cosine` | 距离度量：`cosine` 或 `euclidean` |
| `non_filterable_metadata_keys` | array | `["source_text"]` | 不参与过滤的元数据键 |
| `aws_region_name` | string | `us-west-2` | AWS 区域 |
| `aws_access_key_id` | string | env | AWS 访问密钥 |
| `aws_secret_access_key` | string | env | AWS 秘密访问密钥 |

:::info[S3 Vectors 自动创建]
省略 `index_name` 时，LiteLLM 会自动创建：
- S3 向量存储桶（如尚不存在）
- 向量索引，维度根据嵌入模型自动检测

**维度自动检测**：向量维度通过向指定模型发起一次测试嵌入请求自动探测，无需手动指定！

**支持的嵌入模型**：任何 LiteLLM 支持的嵌入模型均可使用（OpenAI、Cohere、Bedrock、Azure 等）
:::

**自动检测示例**：
```json
{
  "embedding": {
    "model": "text-embedding-3-small"  // Dimension auto-detected as 1536
  },
  "vector_store": {
    "custom_llm_provider": "s3_vectors",
    "vector_bucket_name": "my-embeddings"
  }
}
```

**自定义嵌入提供商示例**：
```json
{
  "embedding": {
    "model": "cohere/embed-english-v3.0"  // Dimension auto-detected as 1024
  },
  "vector_store": {
    "custom_llm_provider": "s3_vectors",
    "vector_bucket_name": "my-embeddings",
    "distance_metric": "cosine"
  }
}
```

## 输入示例

### 文件（Base64）

```json title="请求体"
{
  "file": {
    "filename": "document.txt",
    "content": "<base64-encoded-content>",
    "content_type": "text/plain"
  },
  "ingest_options": {
    "vector_store": {"custom_llm_provider": "openai"}
  }
}
```

### 文件 URL

```bash showLineNumbers title="从 URL 导入"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "file_url": "https://example.com/document.pdf",
        "ingest_options": {"vector_store": {"custom_llm_provider": "openai"}}
    }'
```

## 分块策略

控制在嵌入之前如何把文档切成小块。在 `ingest_options` 中指定 `chunking_strategy`。

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `chunk_size` | integer | `1000` | 每个分块的最大长度 |
| `chunk_overlap` | integer | `200` | 相邻分块之间的重叠量 |

### Vertex AI RAG Engine

Vertex AI RAG Engine 支持通过 `chunking_strategy` 参数自定义分块，分块在导入期间由服务端处理。

```bash showLineNumbers title="Vertex AI 自定义分块"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"document.txt\",
            \"content\": \"$(base64 -i document.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"chunking_strategy\": {
                \"chunk_size\": 500,
                \"chunk_overlap\": 100
            },
            \"vector_store\": {
                \"custom_llm_provider\": \"vertex_ai\",
                \"vector_store_id\": \"your-corpus-id\",
                \"gcs_bucket\": \"your-gcs-bucket\"
            }
        }
    }"
```
