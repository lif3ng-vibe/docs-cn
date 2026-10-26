import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LiteLLM 托管向量存储

将已有的提供商向量存储（Bedrock 知识库、Vertex AI Search 数据存储、Azure AI Search 索引、Milvus collection、Valkey 搜索索引、[MongoDB Vector Search 索引（BETA）](../providers/mongodb_vector_stores.md) 等）注册到 LiteLLM，代理的所有使用方就能通过同一套 OpenAI 兼容 API 访问它，既无需了解底层提供商，也无需持有其凭据。

托管向量存储（managed vector store）是一份映射关系，保存在 `config.yaml` 或 LiteLLM 数据库中，包含：

| 字段 | 是否必填 | 说明 |
|---|---|---|
| `vector_store_id` | 是 | 客户端引用时使用的 id，通常就是提供商自身的存储 id（知识库 id、数据存储 id、索引名） |
| `custom_llm_provider` | 是 | 路由到哪个提供商后端，例如 `bedrock`、`vertex_ai/search_api`、`azure_ai`、`milvus`、`mongodb`（BETA）、`valkey`、`gemini`、`openai`、`pg_vector` |
| `vector_store_name` | 否 | 在界面上显示的人类可读名称 |
| `vector_store_description` | 否 | 在界面上显示的描述 |
| `vector_store_metadata` | 否 | 自由格式的元数据对象 |
| `litellm_credential_name` | 否 | 用于身份验证的[已存储凭据](../proxy/config_settings.md)名称 |
| `litellm_params` | 否 | 提供商参数，例如 Vertex AI 的 `vertex_project` 和 `vertex_location`、Bedrock 的 `aws_region_name` |

注册动作不会在提供商侧创建任何资源。如果想新建一个上游存储，请改用 [`POST /v1/vector_stores`](./create.md)。

## 注册向量存储

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
vector_store_registry:
  - vector_store_name: "docs-knowledgebase"
    litellm_params:
      vector_store_id: "T37J8R4WTM"
      custom_llm_provider: "bedrock"
      aws_region_name: "us-west-2"

  - vector_store_name: "website-search"
    litellm_params:
      vector_store_id: "my-datastore_1234567890"
      custom_llm_provider: "vertex_ai/search_api"
      vertex_project: "my-gcp-project"
      vertex_location: "global"
```

`litellm_params` 中必须提供 `vector_store_id` 和 `custom_llm_provider`，缺少时代理将无法启动。

</TabItem>
<TabItem value="api" label="管理 API">

```bash showLineNumbers title="Register a Vertex AI Search datastore"
curl -X POST 'http://localhost:4000/vector_store/new' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "vector_store_id": "my-datastore_1234567890",
    "custom_llm_provider": "vertex_ai/search_api",
    "vector_store_name": "website-search",
    "litellm_params": {
      "vertex_project": "my-gcp-project",
      "vertex_location": "global"
    }
  }'
```

该存储会写入 LiteLLM 数据库，立即可用于直接搜索，无需重启。如果代理启动时没有注册任何向量存储，那么首次通过界面或 API 注册之后，对话检索功能要等数据库同步完成或代理重启后才可用。响应会原样返回存储的对象，但敏感的 `litellm_params` 值会被遮蔽。

</TabItem>
<TabItem value="ui" label="Admin UI">

在管理界面（Admin UI）中进入 **Tools > Vector Stores > Add new vector store**（工具 > 向量存储 > 添加新向量存储），选择提供商，然后填写存储 id 和提供商参数。界面调用的同样是 `POST /vector_store/new` 端点。截图见[对话补全指南](../completion/knowledgebase.md)。

</TabItem>
</Tabs>

## 使用已注册的存储

通过统一端点搜索它。LiteLLM 会根据注册信息解析出提供商与凭据：

```bash showLineNumbers title="Unified search"
curl -X POST 'http://localhost:4000/v1/vector_stores/my-datastore_1234567890/search' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "How do I authenticate?"}'
```

无论底层是哪家提供商，响应都是 OpenAI 的 `vector_store.search_results.page` 结构。全部请求参数见[搜索](./search.md)。

也可以把它挂到对话补全上，LiteLLM 会在调用模型前先搜索该存储，并把结果作为上下文注入：

```bash showLineNumbers title="RAG in /chat/completions"
curl -X POST 'http://localhost:4000/v1/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.6",
    "messages": [{"role": "user", "content": "What is LiteLLM?"}],
    "tools": [{"type": "file_search", "vector_store_ids": ["my-datastore_1234567890"]}]
  }'
```

请求必须显式引用该存储（顶层 `vector_store_ids` 或放在 `tools` 里）；仅注册存储本身不会改变任何对话补全的行为。细节、引用标注与流式行为见[在对话补全中使用向量存储](../completion/knowledgebase.md)。

### 检索到的上下文会经过调用前防护栏

存储中的文档属于不可信输入：它可能携带针对模型的指令，即通过 RAG 进行的间接提示注入（indirect prompt injection）。因此，凡是对请求执行 `pre_call` 的防护栏（guardrail）（配置里 `default_on: true`，或通过请求、密钥、团队上的 `guardrails` 指定），都会在检索到的上下文注入提示词之前对每个存储分别扫描一次。阻断型防护栏会返回与拦截用户消息时相同的 400 错误，错误中带有 `guardrail_name` 和 `guardrail_mode`，模型不会被调用。掩蔽型防护栏则会改写注入的上下文。设为 `during_call` 或 `post_call` 的防护栏照旧只查看请求和响应，不会扫描检索到的上下文。

```json title="A blocked chunk, with the Azure Prompt Shield guardrail from the guardrails docs"
{
  "error": {
    "message": "Violated Azure Prompt Shield guardrail policy",
    "type": "invalid_request_error",
    "param": null,
    "code": "400",
    "provider_specific_fields": {
      "error": "Violated Azure Prompt Shield guardrail policy",
      "detection_message": "Attack detected: {'attackDetected': True}",
      "guardrail_name": "azure-prompt-shield",
      "guardrail_mode": "pre_call"
    }
  }
}
```

防护栏在扫描检索到的上下文时如果自身出错，同样会导致请求失败，而不会把未经扫描的上下文注入进去。

## 管理 API 参考

所有端点都需要 LiteLLM 密钥（`Authorization: Bearer ...`）。可以通过 `general_settings.disable_vector_stores_for_internal_users` 和 `allow_vector_stores_for_team_admins` 限制访问；代理管理员始终拥有访问权。

| 端点 | Method | 请求体 / 参数 |
|---|---|---|
| `/vector_store/new` | POST | 上表中的各字段 |
| `/vector_store/list` | GET | `page`、`page_size`（也可通过 `/v1/vector_store/list` 访问） |
| `/vector_store/info` | POST | `{"vector_store_id": "..."}` |
| `/vector_store/update` | POST | `vector_store_id` 加上 `custom_llm_provider`、`vector_store_name`、`vector_store_description`、`vector_store_metadata` 中任意若干 |
| `/vector_store/delete` | POST | `{"vector_store_id": "..."}` |

`GET /vector_store/list` 返回 `{"object": "list", "data": [...], "total_count": n, "current_page": n, "total_pages": n}`。通过 API 或界面注册的存储会打上创建密钥的 `team_id` 和 `user_id` 标记；以团队身份创建的存储在列表和搜索结果中只对该团队可见（代理管理员可见全部）。

## 将密钥与团队限定到特定存储

创建密钥或团队时设置 `object_permission.vector_stores`，即可控制其 LLM 请求可以引用哪些存储 id：

```bash showLineNumbers title="Key limited to one store"
curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "object_permission": {"vector_stores": ["my-datastore_1234567890"]}
  }'
```

该密钥发出的请求若在 `vector_store_ids` 中使用了其他已注册存储 id，会被拒绝。列表为空或未设置表示密钥不受限制，除非开启了 [`vector_store_deny_by_default`](#默认拒绝向量存储)。同样的字段也适用于团队和用户。

## 默认拒绝向量存储

在没有限制的情况下，代理接受的任何密钥都能查询代理的提供商凭据可触达的任何存储 id。要让每个存储都改为显式授权后才可用，请开启 `vector_store_deny_by_default`：

```yaml showLineNumbers title="config.yaml"
general_settings:
  vector_store_deny_by_default: true
```

该设置默认为 `false`。开启后，请求引用的每个存储 id，无论是通过 `/v1/rag/query` 或 `/rag/query`（`retrieval_config.vector_store_id`）、`/v1/vector_stores/{vector_store_id}/...` 路径、顶层 `vector_store_ids`，还是 `file_search` 工具中的 `vector_store_ids`，都必须列在请求所解析到的每个身份的 `object_permission.vector_stores` 中。一次请求点名多个存储时，每个都要有授权。`vector_store_ids` 的值若不是字符串列表，会以 `400` 拒绝。

| 调用方 | 所需授权 |
|---|---|
| 无团队的虚拟密钥（virtual key） | 该密钥 |
| 有团队的虚拟密钥 | 该密钥及其团队 |
| 无虚拟密钥的团队成员（JWT 或 `lite login` 会话） | 请求所解析到的团队 |
| 既无虚拟密钥也无团队的用户 | 该用户 |

缺失的权限记录、`null` 列表和空列表都不授予任何权限。用户的个人授权只在请求既无虚拟密钥也无团队时生效，因此绝不会放宽或收紧基于密钥或团队的请求；用户所属其他团队上的授权会被忽略。如果密钥指定的团队无法加载，请求会被拒绝，而不会被当作无团队的密钥处理。被拒绝的请求在任何提供商调用之前就会失败，错误码为 `key_vector_store_access_denied`、`team_vector_store_access_denied` 或 `user_vector_store_access_denied`。

对团队密钥，需要在两个对象上都授予该存储：

```bash showLineNumbers title="Team and key both grant the store"
curl -X POST 'http://localhost:4000/team/new' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"team_alias": "support", "object_permission": {"vector_stores": ["YOUR_KNOWLEDGE_BASE_ID"]}}'

curl -X POST 'http://localhost:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"team_id": "<team_id from above>", "object_permission": {"vector_stores": ["YOUR_KNOWLEDGE_BASE_ID"]}}'
```

注册存储并不等于授予访问权，而被显式授权的提供商原生存储也可以保持未注册状态。主密钥（master key）不受此限制。仪表板登录会话目前尚不受该设置约束。

把该开关改回 `false` 会恢复原先的行为，即列表为空或未设置意味着不受限制。但已有的检查不会因此关闭：非空的 `vector_stores` 列表只要没有包含所请求的存储，仍然会被拒绝。
