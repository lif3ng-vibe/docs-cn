# /rag/query

RAG 查询端点：**搜索向量存储 →（重排序）→ LLM 补全**

| 特性 | 支持情况 |
|---------|-----------|
| 日志 | 支持 |
| 流式 | 支持 |
| 重排序（rerank） | 支持（可选） |
| 支持的提供商 | `openai`, `bedrock`, `vertex_ai` |

## 快速上手

```bash showLineNumbers title="使用 OpenAI 的 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_small}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

## 工作原理

RAG 查询端点会依次执行以下步骤：

1. **提取查询**：从最后一条用户消息中提取查询文本
2. **搜索向量存储**：在指定的向量存储（vector store）中搜索相关上下文
3. **重排序**（可选）：使用重排序模型对检索结果重新排序
4. **生成回复**：将检索到的上下文拼接到消息前面，再调用 LLM

## 响应

响应沿用标准的 OpenAI 对话补全（chat completion）格式，并附带额外的搜索元数据：

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1703123456,
  "model": "{{openai_small}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "LiteLLM is a unified interface for 100+ LLMs..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 50,
    "total_tokens": 200
  },
  "_hidden_params": {
    "search_results": {...},
    "rerank_results": {...}
  }
}
```

## 启用重排序

添加 `rerank` 配置可以提升结果质量：

```bash showLineNumbers title="带重排序的 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_small}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai",
            "top_k": 10
        },
        "rerank": {
            "enabled": true,
            "model": "cohere/rerank-english-v3.0",
            "top_n": 3
        }
    }'
```

## 流式传输

开启流式即可实时获取响应：

```bash showLineNumbers title="流式 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_small}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "vs_abc123",
            "custom_llm_provider": "openai"
        },
        "stream": true
    }'
```

## 过滤检索结果

设置 `retrieval_config.retrieval_filter`，可将检索范围缩小到元数据匹配的分块。该过滤器会作为向量存储的 `filters` 参数原样传入，因此具体接受什么格式由提供商决定：Bedrock Knowledge Bases 接受其原生运算符（`equals`、`notEquals`、`andAll`、`orAll` 等，其中 `andAll` 与 `orAll` 至少需要两个子句），同时也接受 OpenAI 风格的比较结构（`{"key": ..., "value": ..., "operator": "eq"}`）；OpenAI 向量存储则接受其自带的过滤器对象。`retrieval_config.filters` 可作为别名使用；两个键同时设置时，以 `retrieval_filter` 为准。被向量存储拒绝的过滤器会导致请求失败，并返回该存储的状态码与错误信息。

```bash showLineNumbers title="带 Bedrock 元数据过滤器的 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "bedrock/us.anthropic.{{anthropic}}",
        "messages": [{"role": "user", "content": "How do I reset my password?"}],
        "retrieval_config": {
            "vector_store_id": "KNOWLEDGE_BASE_ID",
            "custom_llm_provider": "bedrock",
            "top_k": 5,
            "retrieval_filter": {
                "andAll": [
                    {"equals": {"key": "department", "value": "billing"}},
                    {"equals": {"key": "doc_type", "value": "manual"}}
                ]
            }
        }
    }'
```

## 请求参数

### 顶层参数

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `model` | string | 是 | 用于生成回复的 LLM 模型 |
| `messages` | array | 是 | 对话消息数组（OpenAI 格式） |
| `retrieval_config` | object | 是 | 向量存储搜索配置 |
| `rerank` | object | 否 | 重排序配置 |
| `stream` | boolean | 否 | 是否开启流式（默认：`false`） |

### retrieval_config

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `vector_store_id` | string | **required** | 要搜索的向量存储 ID |
| `custom_llm_provider` | string | `"openai"` | 向量存储提供商 |
| `top_k` | integer | `10` | 检索返回的结果数量 |
| `retrieval_filter` | object | - | 转发给向量存储检索的元数据过滤器（参见[过滤检索结果](#过滤检索结果)） |
| `filters` | object | - | `retrieval_filter` 的别名；两个键同时设置时以 `retrieval_filter` 为准 |

### rerank

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `enabled` | boolean | `false` | 是否开启重排序 |
| `model` | string | - | 重排序模型（如 `cohere/rerank-english-v3.0`） |
| `top_n` | integer | `5` | 重排序后保留的结果数量 |

## 端到端示例

### 1. 摄取文档

首先，通过 [/rag/ingest](./rag_ingest.md) 端点摄取一份文档：

```bash showLineNumbers title="第 1 步：摄取"
curl -X POST "http://localhost:4000/v1/rag/ingest" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"file\": {
            \"filename\": \"company_docs.txt\",
            \"content\": \"$(base64 -i company_docs.txt)\",
            \"content_type\": \"text/plain\"
        },
        \"ingest_options\": {
            \"vector_store\": {
                \"custom_llm_provider\": \"openai\"
            }
        }
    }"
```

响应：
```json
{
  "id": "ingest_abc123",
  "status": "completed",
  "vector_store_id": "vs_xyz789",
  "file_id": "file-123"
}
```

### 2. 使用 RAG 查询

接下来，查询已摄取的文档：

```bash showLineNumbers title="第 2 步：查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_small}}",
        "messages": [
            {"role": "user", "content": "What products does the company offer?"}
        ],
        "retrieval_config": {
            "vector_store_id": "vs_xyz789",
            "custom_llm_provider": "openai",
            "top_k": 5
        }
    }'
```

响应：
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "{{openai_small}}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Based on the company documents, the company offers..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

## 提供商示例

### Bedrock

```bash showLineNumbers title="使用 Bedrock 的 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "bedrock/us.anthropic.{{anthropic}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "KNOWLEDGE_BASE_ID",
            "custom_llm_provider": "bedrock",
            "top_k": 5
        }
    }'
```

### Vertex AI

```bash showLineNumbers title="使用 Vertex AI 的 RAG 查询"
curl -X POST "http://localhost:4000/v1/rag/query" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "vertex_ai/{{gemini_pro}}",
        "messages": [{"role": "user", "content": "What is LiteLLM?"}],
        "retrieval_config": {
            "vector_store_id": "your-corpus-id",
            "custom_llm_provider": "vertex_ai",
            "top_k": 5
        }
    }'
```

## Python SDK

```python showLineNumbers title="使用 litellm.aquery()"
import litellm

response = await litellm.aquery(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "What is LiteLLM?"}],
    retrieval_config={
        "vector_store_id": "vs_abc123",
        "custom_llm_provider": "openai",
        "top_k": 5,
    },
    rerank={
        "enabled": True,
        "model": "cohere/rerank-english-v3.0",
        "top_n": 3,
    },
)

print(response.choices[0].message.content)
```
