# 向量存储概览

LiteLLM 提供三种彼此独立的方式来使用向量存储（vector stores）。它们是三套各自独立、端点互不相同的 API，弄清楚自己需要哪一种，可以省去很多困惑：

1. **LiteLLM 托管向量存储**（managed vector stores）：向量存储已经存在于某个提供商（provider）侧（比如 Bedrock Knowledge Base、Vertex AI Search 数据存储、Azure AI Search 索引等），只需向 LiteLLM 注册一次，LiteLLM 会保存提供商、凭证与 id 映射。此后代理上的每个密钥都能通过同一个 OpenAI 兼容端点查询它，也可以把它挂到 `/chat/completions` 与 `/v1/responses` 请求上做 RAG。注册可以在 `config.yaml` 中完成，也可以通过[管理 API](./managed_vector_stores.md)（`POST /vector_store/new`），或在管理界面（Admin UI）中进行。

2. **OpenAI 兼容向量存储 API**：沿用 OpenAI API 的形态，通过 LiteLLM 直接*在提供商侧*创建和管理向量存储。`POST /v1/vector_stores` 在上游新建一个存储，`/v1/vector_stores/{id}/files` 管理存储内的文件，`/rag/ingest` 则把上传、分块、嵌入和建库打包进一次调用。

3. **提供商透传 API**（passthrough）：通过代理调用提供商的原生 API（原生请求与响应形态），例如 `/vertex_ai/discovery/...` 或 `/bedrock/knowledgebases/...`。当你需要的提供商特性是统一 API 没有暴露的，就选这条路。

:::info[术语说明]
LiteLLM 中的**托管向量存储**是一种*注册*，而不是新建一个存储：LiteLLM 记录存储位于哪个提供商、以及如何向它认证，请求就能按 id 引用它。提供商侧不会创建任何东西。旧文档把这个概念叫作 “knowledge base”（知识库），两者是同一个东西。
:::

## 我该用哪个端点？

| 你想做的事 | 该用什么 | 文档 |
|---|---|---|
| 通过同一个统一 API 查询提供商侧已有的存储 | 先注册，然后用 `POST /v1/vector_stores/{id}/search` | [托管向量存储](./managed_vector_stores.md) |
| 在 `/chat/completions` 中给模型提供 RAG 上下文 | 使用已注册的存储，配合 `tools: [{"type": "file_search", "vector_store_ids": [...]}]` | [在对话补全中使用向量存储](../completion/knowledgebase.md) |
| 在 `/v1/responses` 上使用 `file_search` | 已注册的存储 + `file_search` 工具 | [File Search 教程](../tutorials/file_search_responses_api.md) |
| 在提供商侧全新创建一个存储 | `POST /v1/vector_stores` | [创建](./create.md) |
| 一次调用完成文档上传、分块、嵌入与入库 | `POST /rag/ingest` | [RAG Ingest](../rag_ingest.md) |
| 一次调用完成搜索、重排序与补全 | `POST /rag/query` | [RAG Query](../rag_query.md) |
| 管理存储内的文件 | `/v1/vector_stores/{id}/files` | [文件管理](../vector_store_files.md) |
| 直接调用提供商的原生 API | 透传路由 | [Vertex AI Search](../pass_through/vertex_ai_search_datastores.md)、[Azure AI（透传）](../providers/azure_ai/azure_ai_vector_stores_passthrough.md) |

注意两个名字相近的创建端点：`POST /v1/vector_stores`（复数）在提供商侧**新建**一个存储；`POST /vector_store/new`（单数）则是把一个**已有**存储注册到 LiteLLM。完整的管理 API 见[托管向量存储](./managed_vector_stores.md)。

## 提供商支持

各提供商对统一端点的支持程度不一。`Search` 对应 `POST /v1/vector_stores/{id}/search`；`Create` 对应 `POST /v1/vector_stores`。

| 提供商（`custom_llm_provider`） | Search | Create | 说明 |
|---|---|---|---|
| `openai` | Yes | Yes | 同时支持[文件 API](../vector_store_files.md) |
| `azure`（Azure OpenAI） | Yes | Yes | |
| `bedrock`（Knowledge Bases） | Yes | No | [配置](../providers/bedrock_vector_store.md) |
| `vertex_ai`（RAG Engine） | Yes | Yes | |
| `vertex_ai/search_api`（Vertex AI Search） | Yes | No | 将数据存储注册为[托管向量存储](./managed_vector_stores.md) |
| `azure_ai`（Azure AI Search） | Yes | No | [配置](../providers/azure_ai_vector_stores.md) |
| `gemini`（File Search） | Yes | Yes | [配置](../providers/gemini_file_search.md) |
| `milvus` | Yes | No | 查询已有的集合（collection），[配置](../providers/milvus_vector_stores.md) |
| `mongodb`（BETA） | Yes | No | 查询 Atlas 或自托管部署上已有的 MongoDB Vector Search 索引。[配置](../providers/mongodb_vector_stores.md)、[对话补全](../providers/mongodb_vector_stores.md#在对话补全中使用-mongodb)、[完整示例](../tutorials/mongodb_vector_search.md) |
| `pg_vector` | Yes | Yes | 需要 [litellm-pgvector](../completion/knowledgebase.md) 连接器 |
| `s3_vectors` | Yes | No | 通过 [/rag/ingest](../rag_ingest.md) 创建，[配置](../providers/s3_vectors.md) |
| `valkey` | Yes | No | 查询已存在的 valkey-search 索引，[配置](../providers/valkey_vector_stores.md) |
| `ragflow` | No | Yes | 仅支持数据集管理，[配置](https://docs.litellm.ai/docs/providers/ragflow_vector_stores) |

检索、列举、更新与删除（`GET`/`POST`/`DELETE /v1/vector_stores/{id}`）会按原样透传 OpenAI 的请求形态，因此请搭配暴露 OpenAI 形态向量存储 API 的提供商（OpenAI、Azure OpenAI）使用。路由细节见[创建](./create.md#代理上的向量存储管理与路由)。
