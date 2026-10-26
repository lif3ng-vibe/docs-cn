import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# AWS S3 Vectors

把 [Amazon S3 Vectors](https://aws.amazon.com/s3/features/vectors/) 用作 LiteLLM 统一向量库与 RAG 端点背后的向量存储。LiteLLM 直接以 SigV4 签名请求调用 S3 Vectors REST API；向量操作本身无需 boto3 客户端。

| 属性 | 说明 |
|----------|---------|
| LiteLLM 提供商路由 | `s3_vectors` |
| 支持的端点 | `POST /v1/vector_stores/{id}/search`, `POST /rag/ingest`, `POST /rag/query`, `file_search` on `/chat/completions` and `/v1/responses` |
| 不支持 | `POST /v1/vector_stores`（OpenAI 形式的创建端点）。请改用 `/rag/ingest`，它会自动创建向量桶和索引 |
| 向量库 id 格式 | `<vector_bucket_name>:<index_name>` |
| 提供商文档 | [Amazon S3 Vectors ↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors.html) |

## 工作原理

`/rag/ingest` 接收一个文档，先分块，再用任意 LiteLLM 嵌入模型生成嵌入（embedding），最后把向量写入 S3 向量桶中的索引（`PutVectors`）。桶和索引不存在时会自动创建。生成的向量库在其余所有接口里都按 `bucket_name:index_name` 寻址：`/v1/vector_stores/{id}/search` 用配置好的嵌入模型把查询向量化，然后对该索引执行 `QueryVectors`；同一个 id 也适用于 `/chat/completions` 和 `/v1/responses` 上的 `file_search` 工具。

在代理服务器（proxy）上，摄取成功后还会把该向量库注册进 LiteLLM 数据库（见下文[摄取文件的追踪方式](#摄取文件的追踪方式)），于是它会出现在 Admin UI 里，按 id 即可搜索，无需在每次请求中单独配置 AWS。

## 快速上手

### 1. 设置 config.yaml

你需要一个嵌入模型来支撑摄取和搜索。AWS 凭证来自环境变量（或其他受支持的方式，见[凭证](#凭证)）。

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: text-embedding-3-small
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY
```

```bash showLineNumbers title="Environment"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION_NAME="us-west-2"

litellm --config config.yaml
```

### 2. 摄取文档

在 `vector_store` 块中传入 `custom_llm_provider: "s3_vectors"`。在这里设置 `aws_region_name` 和 `embedding_model` 很关键：`vector_store` 块里的每个键都会持久化到该向量库的注册信息上，之后针对这个已注册向量库的搜索会自动复用它们。

```bash showLineNumbers title="Ingest into S3 Vectors"
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
            \"embedding\": {\"model\": \"text-embedding-3-small\"},
            \"vector_store\": {
                \"custom_llm_provider\": \"s3_vectors\",
                \"vector_bucket_name\": \"my-embeddings\",
                \"aws_region_name\": \"us-west-2\",
                \"embedding_model\": \"text-embedding-3-small\"
            }
        }
    }"
```

```json title="Response"
{
  "id": "ingest_abc123",
  "status": "completed",
  "vector_store_id": "my-embeddings:litellm-index-a1b2c3d4",
  "file_id": "document.txt"
}
```

省略 `index_name` 时 LiteLLM 会自动生成一个（`litellm-index-<id>`）。要让多次请求都摄取进同一个索引，请显式传入 `index_name`。摄取选项的完整列表见 [RAG Ingest 参考](../rag_ingest.md#vector_store-aws-s3-vectors)。

:::warning[保持嵌入模型一致]
索引维度在创建时由摄取所用的嵌入模型决定（自动检测，例如 `text-embedding-3-small` 为 1536）。搜索必须用相同维度的模型对查询做嵌入。请在 `vector_store` 块内（如上所示）或注册项上设置 `embedding_model`；如果两处都没有设置，搜索会回退到 `text-embedding-3-small`。
:::

### 3. 搜索向量库

```bash showLineNumbers title="Search"
curl -X POST "http://localhost:4000/v1/vector_stores/my-embeddings:litellm-index-a1b2c3d4/search" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "What does the document say about pricing?", "max_num_results": 5}'
```

```json title="Response"
{
  "object": "vector_store.search_results.page",
  "search_query": "What does the document say about pricing?",
  "data": [
    {
      "score": 0.87,
      "content": [{"text": "Pricing is based on ...", "type": "text"}],
      "file_id": "s3-vectors-chunk-0",
      "filename": "document.txt",
      "attributes": {"source_text": "Pricing is based on ...", "chunk_index": "0", "filename": "document.txt"}
    }
  ]
}
```

`max_num_results` 映射到 S3 Vectors 的 `topK`（默认 5）。结果从 LiteLLM 摄取时写入的 `source_text` 元数据键读取；其他工具写入索引、但缺少该键的向量会被跳过。

### 4. 在对话补全中用于 RAG

```bash showLineNumbers title="file_search tool"
curl -X POST "http://localhost:4000/v1/chat/completions" \
    -H "Authorization: Bearer $LITELLM_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "{{openai_large}}",
        "messages": [{"role": "user", "content": "Summarize our pricing policy"}],
        "tools": [{"type": "file_search", "vector_store_ids": ["my-embeddings:litellm-index-a1b2c3d4"]}]
    }'
```

`/rag/query`（一次调用同时完成搜索与补全）使用相同的向量库 id，见 [RAG Query](../rag_query.md)。

## 注册已有索引

如果向量桶和索引已经存在（由更早的摄取、其他工具或 Terraform 创建），可以把它们注册到[向量库注册表](../vector_stores/managed_vector_stores.md)，让代理上的所有密钥都能搜索它们：

```yaml showLineNumbers title="config.yaml"
vector_store_registry:
  - vector_store_name: "product-docs"
    litellm_params:
      vector_store_id: "my-embeddings:my-index"
      custom_llm_provider: "s3_vectors"
      aws_region_name: "us-west-2"
      embedding_model: "text-embedding-3-small"
```

搜索必须提供 `aws_region_name`。`embedding_model` 应与构建索引所用的模型一致。除了 `bucket:index` 形式的 id，也可以在 `litellm_params` 中设置 `vector_bucket_name`，并把索引名直接作为 `vector_store_id`。注册完成后，凡是指定了该向量库 id 的 `/rag/ingest` 请求也会落入这个索引，提供商、区域、凭证和嵌入模型都取自注册信息而非请求本身。

## 配置参考

搜索侧的 `litellm_params`（写在注册项里，或由摄取自动持久化）：

| 参数 | 必填 | 说明 |
|-----------|----------|-------------|
| `custom_llm_provider` | 是 | `"s3_vectors"` |
| `vector_store_id` | 是 | `bucket:index`，或在设置了 `vector_bucket_name` 时直接写索引名 |
| `aws_region_name` | 是 | 向量桶所在区域 |
| `embedding_model` | 否 | 用于对搜索查询做嵌入的模型。默认 `text-embedding-3-small` |
| `vector_bucket_name` | 否 | 让 `vector_store_id` 可以只写索引名 |
| `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`, `aws_role_name`, `aws_session_name`, `aws_profile_name`, `aws_web_identity_token` | 否 | 显式指定 AWS 凭证，见[凭证](#凭证) |
| `litellm_credential_name` | 否 | 引用 `credential_list` 中的具名凭证 |

摄取侧的选项（`ingest_options` 中的 `vector_store` 块）记录在 [RAG Ingest 参考](../rag_ingest.md#vector_store-aws-s3-vectors)：`vector_store_id`（已有索引，形如 `bucket:index`；设置了 `vector_bucket_name` 时也可只写索引名）、`vector_bucket_name`（`vector_store_id` 未携带桶名时必填）、`index_name`、`dimension`、`distance_metric`（默认 `cosine`，或 `euclidean`）、`non_filterable_metadata_keys`（默认 `["source_text"]`），以及同一组 AWS 凭证参数。

## 区域、端点与加密

LiteLLM 始终调用区域化的 S3 Vectors 端点 `https://s3vectors.<aws_region_name>.api.aws`。该提供商没有 `api_base` 覆盖项。摄取时，区域按以下顺序解析：请求中的 `aws_region_name`，然后是 `AWS_REGION_NAME` 和 `AWS_REGION` 环境变量，最后回退到 `us-west-2`。搜索时，注册项或持久化的摄取参数中必须带有 `aws_region_name`。

自动创建的向量桶采用 S3 Vectors 默认的服务端加密（SSE-S3）。LiteLLM 调用 `CreateVectorBucket` 时不会传入加密配置，因此想用 SSE-KMS 的话，请自行用你的 KMS 密钥创建向量桶并让 LiteLLM 指向它；存在性检查会发现桶已存在并跳过创建。桶名遵循 S3 规则：至少 3 个字符，只能包含小写字母、数字、连字符和句点。

## 凭证

认证复用 LiteLLM 标准的 AWS 凭证解析链（与 Bedrock 相同的 `BaseAWSLLM` 链路）。顺序为：注册项或摄取请求上显式传入的 `aws_*` 参数、通过 `litellm_credential_name` 引用的具名凭证、环境变量（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`）、`aws_profile_name`、通过 `aws_role_name` 和 `aws_session_name` 进行的 STS 角色代入、Web 身份令牌（EKS 上的 IRSA），最后是默认的 boto3 链路（实例配置文件、ECS 任务角色）。各种方式的细节见 [Bedrock 认证](./bedrock.md#boto3-认证)。

### IAM 权限

| 操作 | 用途 |
|--------|-----------|
| `s3vectors:QueryVectors` | 搜索、`/rag/query`、`file_search` |
| `s3vectors:PutVectors` | `/rag/ingest` |
| `s3vectors:GetVectorBucket` | `/rag/ingest` 存在性检查 |
| `s3vectors:CreateVectorBucket` | `/rag/ingest` 自动创建 |
| `s3vectors:GetIndex` | `/rag/ingest` 存在性检查 |
| `s3vectors:CreateIndex` | `/rag/ingest` 自动创建 |

如果桶和索引已预先创建，摄取所需的最小权限策略是 `GetVectorBucket`、`GetIndex` 和 `PutVectors`；仅搜索的凭证只需要 `QueryVectors`。代理还需要嵌入模型本身要求的凭证（如上面快速上手中的 OpenAI 密钥，或 `bedrock/amazon.titan-embed-text-v2:0` 以全程留在 AWS 体系内）。

## 摄取文件的追踪方式

在连接了数据库的代理上，`/rag/ingest` 会把新向量库连同调用密钥的 `team_id` 和 `user_id` 存入 `LiteLLM_ManagedVectorStoresTable`，加入内存注册表，并把每个摄取过的文件（文件名或 URL、时间戳）记录在该向量库的 `ingested_files` 元数据里。再次摄取到相同的桶和索引时，只会向这份文件列表追加，而不会新建条目。此后该向量库会出现在 Admin UI 的 Vector Stores 之下，访问控制遵循标准的[向量库权限模型](../vector_stores/managed_vector_stores.md)：在密钥或团队上设置 `object_permission.vector_stores`，即可控制其请求能引用哪些向量库 id。

原始文件字节不会存入 S3，也不会存入 LiteLLM 数据库；只保留分块文本（作为 `source_text` 存放在向量元数据中）和文件元数据。

## 存在"默认向量库"设置吗？

没有。LiteLLM 目前没有代理级的默认向量库提供商。`vector_store` 块未指定提供商时，`/rag/ingest` 会默认使用 `custom_llm_provider: "openai"`，因此凡是要落入 S3 Vectors 的摄取请求都必须显式传入 `custom_llm_provider: "s3_vectors"`，除非其 `vector_store_id` 指向注册表或数据库里的某个向量库：此时提供商、区域、凭证和嵌入模型都取自该注册信息，请求只需给出 id。摄取完成后，其余任何地方都不需要再选提供商：搜索、`/rag/query` 和 `file_search` 都直接按 id 寻址向量库，持久化的注册信息已带上提供商和 AWS 设置。

## S3 能作为 /v1/files 的默认存储吗？

目前不能。`/v1/files` 上传的文件会发往目标 LLM 提供商（OpenAI、Azure、Bedrock、Vertex），而 `target_storage` 上传参数唯一的备用存储后端是 `azure_storage`（Azure Blob Storage），没有 S3 存储后端。不过确实有两条与 S3 相关的路径：为 [Bedrock 批处理](./bedrock_batches.md)上传的文件会借助模型的 `s3_bucket_name` 参数暂存在你的 S3 桶里；而本页的 RAG 流程完全不需要文件存储，因为 `/rag/ingest` 接受内联文件（multipart 或 base64）、`file_url`，或已有的提供商 `file_id`。

## 验证

摄取完成后，端到端确认整条链路：摄取响应中应包含 `"status": "completed"` 和 `vector_store_id`；用该 id 搜索能在 `data[].content` 中返回你的文档文本；Admin UI 的 Vector Stores 下会列出该向量库；AWS 控制台中，在配置的区域下的 Amazon S3、Vector buckets 里能看到向量桶和索引。如果搜索返回空的 `data` 数组，请检查查询嵌入模型是否与摄取模型一致（维度不匹配会被 S3 Vectors 拒绝），以及向量是否带有 `source_text` 元数据。
