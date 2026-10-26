import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 客户与终端用户

为你的客户追踪花费，并设置预算与权限。

## 追踪客户花费与权限

### 1. 携带客户 ID 发起 LLM API 调用

LiteLLM 按以下顺序查找客户/终端用户 ID（命中第一个即生效）：

| 优先级 | 方法 | 位置 | 说明 |
|----------|--------|-------|-------|
| 1 | `x-litellm-customer-id` 请求头 | 请求头 | 标准请求头，始终检查 |
| 2 | `x-litellm-end-user-id` 请求头 | 请求头 | 标准请求头，始终检查 |
| 3 | 通过 `user_header_mappings` 配置的自定义请求头 | 请求头 | 在 `general_settings` 中配置 |
| 4 | 通过 `user_header_name` 配置的自定义请求头 | 请求头 | 已弃用，请改用 `user_header_mappings` |
| 5 | `user` 字段 | 请求体 | 标准 OpenAI 字段 |
| 6 | `litellm_metadata.user` 字段 | 请求体 | Anthropic 风格的元数据 |
| 7 | `metadata.user_id` 字段 | 请求体 | 通用元数据模式 |
| 8 | `safety_identifier` 字段 | 请求体 | Responses API |

:::info[JWT 认证优先]

如果启用了 [JWT 认证](token_auth) 并配置了 `end_user_id_jwt_field`，从已验证 JWT 声明中取出的客户 ID 会优先于上面列出的所有请求头和请求体字段。只有当 JWT 未给出终端用户 ID 时，才会使用请求携带的那些字段。由于声明来自 LiteLLM 已校验过的令牌，调用方无法用 `x-litellm-end-user-id`、`metadata.user_id` 等方式覆盖它。

:::

**选项 1：标准请求头**（推荐，无需修改请求体）

```bash showLineNumbers title="Make request with customer ID in header"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --header 'x-litellm-end-user-id: ishaan3' \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

`x-litellm-customer-id` 和 `x-litellm-end-user-id` 均受支持，无需任何配置就会始终检查。

**选项 2：请求体中的 `user` 字段**（兼容 OpenAI）

```bash showLineNumbers title="Make request with customer ID in body"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --data '{
        "model": "azure-gpt-3.5",
        "user": "ishaan3",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

**选项 3：通过 `user_header_mappings` 自定义请求头**（可配置）

```yaml showLineNumbers title="config.yaml"
general_settings:
  user_header_mappings:
    - header_name: "x-my-app-user-id"
      litellm_user_role: "customer"
```

```bash showLineNumbers title="Make request with custom header"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --header 'x-my-app-user-id: ishaan3' \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}]
        }'
```

**选项 4：`litellm_metadata.user`**（Anthropic 风格）

```bash showLineNumbers title="Make request with litellm_metadata.user"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --data '{
        "model": "{{anthropic}}",
        "messages": [{"role": "user", "content": "what time is it"}],
        "litellm_metadata": {"user": "ishaan3"}
        }'
```

**选项 5：`metadata.user_id`**

```bash showLineNumbers title="Make request with metadata.user_id"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
        --header 'Content-Type: application/json' \
        --header "Authorization: Bearer $LITELLM_API_KEY" \
        --data '{
        "model": "azure-gpt-3.5",
        "messages": [{"role": "user", "content": "what time is it"}],
        "metadata": {"user_id": "ishaan3"}
        }'
```

customer_id 会连同新花费一起被 upsert 进数据库。

如果 customer_id 已经存在，花费会在其基础上累加。

### 2. 查询客户花费

<Tabs>
<TabItem value="all-up" label="总花费">

调用 `/customer/info` 获取某个客户的总花费。

```bash showLineNumbers title="Get customer spend"
# end_user_id: 👈 客户 ID
# Authorization: 👈 你的代理密钥
curl -X GET 'http://0.0.0.0:4000/customer/info?end_user_id=ishaan3' \
        -H "Authorization: Bearer $LITELLM_API_KEY"
```

预期响应：

```json showLineNumbers title="Response"
{
    "user_id": "ishaan3",
    "blocked": false,
    "alias": null,
    "spend": 0.001413,
    "allowed_model_region": null,
    "default_model": null,
    "litellm_budget_table": null
}
```

</TabItem>
<TabItem value="event-webhook" label="事件 Webhook">

要在客户端自己的数据库中更新花费，把代理指向你的 webhook。

例如，你的服务器是 `https://webhook.site`，监听路径为 `6ab090e8-c55f-4a23-b075-3209f5c57906`。

1. 将 webhook URL 加入代理的环境变量：

```bash showLineNumbers title="Set webhook URL"
export WEBHOOK_URL="https://webhook.site/6ab090e8-c55f-4a23-b075-3209f5c57906"
```

2. 在 config.yaml 中加入 "webhook"

```yaml showLineNumbers title="config.yaml"
general_settings: 
  alerting: ["webhook"] # 👈 关键改动
```

3. 测试一下！

```bash showLineNumbers title="Test webhook"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "model": "mistral",
    "messages": [
        {
        "role": "user",
        "content": "What's the weather like in Boston today?"
        }
    ],
    "user": "krrish12"
}
'
```

预期响应

```json showLineNumbers title="Webhook event payload"
{
  "spend": 0.0011120000000000001, # 👈 花费
  "max_budget": null,
  "token": "example-api-key-123",
  "customer_id": "krrish12",  # 👈 客户 ID
  "user_id": null,
  "team_id": null,
  "user_email": null,
  "key_alias": null,
  "projected_exceeded_date": null,
  "projected_spend": null,
  "event": "spend_tracked",
  "event_group": "customer",
  "event_message": "Customer spend tracked. Customer=krrish12, spend=0.0011120000000000001"
}
```

[查看 Webhook 规范](./alerting.md#webhook-事件的-api-规范)

</TabItem>
</Tabs>


## 限制哪些 ID 会成为客户

LiteLLM 见到的每个不同的客户 ID 都会被 upsert 进客户表，当客户端发送按会话变化的标识符时，这就会出问题。例如 Claude Code 会在 `metadata.user_id` 里放一段 JSON：

```json title="What Claude Code sends"
{"device_id": "4ec41ed1...", "account_uuid": "...", "session_id": "..."}
```

于是每个会话都会作为独立客户出现在 Usage -> Customer Usage 页面中；如果你配置了[默认客户预算](#所有客户的默认预算)，每个会话都会各自拿到一份该预算，本该约束真实客户的月度上限就变成了对这类流量的按会话限额。

设置 `validate_end_user_id_in_db` 可以把这些 ID 挡在客户表之外。v1.87.0 及以上版本可用。

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  validate_end_user_id_in_db: true
```

此后，只有当 ID 匹配某个已有客户的 `user_id`、某个内部用户的 `user_id` 或某个内部用户邮箱时才会被接受。形似 JSON 对象或数组的 ID 会在查询数据库之前直接丢弃，因为它们从来不是真实的客户标识。丢弃不视为错误：请求依然成功，只是不带客户身份，其花费照常归到虚拟密钥（virtual key）、团队和内部用户名下。查询结果会缓存：ID 命中时缓存 5 分钟，未命中时缓存 1 分钟，因此新建的客户最多可能要等一分钟才会被识别。

### 为未注册客户保留默认预算

单独使用时，`validate_end_user_id_in_db` 会丢弃所有没有匹配记录的 ID；如果你依赖 `max_end_user_budget_id` 来约束那些从未显式创建的客户，两者就会互相冲突。把两者一起设置则能协同工作：JSON 形态的 ID 照样丢弃，而没有对应记录的普通字符串 ID 会被保留，默认预算依然对其生效。

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  validate_end_user_id_in_db: true
  max_end_user_budget_id: "your_default_budget_id"
```

### 把内部流量归入同一个客户

如果你不想丢弃这些流量，而是想给它打上统一标签，可以让客户端发送 `x-litellm-customer-id`。请求头先于任何请求体字段被检查，因此无论客户端在 `metadata.user_id` 里放了什么，请求头都会胜出。Claude Code 通过 `ANTHROPIC_CUSTOM_HEADERS` 即可设置，无需其他改动；Codex CLI 则通过其 `config.toml` 中的 `http_headers` 实现同样效果。参见 [Claude Code 细粒度成本追踪](../tutorials/claude_code_customer_tracking.md)与 [Codex CLI 细粒度成本追踪](../tutorials/codex_customer_tracking.md)。

通过 `/customer/new` 创建这个客户并为其单独配预算。这样既满足 `validate_end_user_id_in_db` 的校验，显式的客户预算又会优先于默认预算，内部流量就能拥有与真实客户不同的限额。

## 限制客户可用的模型

在客户上设置 `models`，可以限制以其名义发起的请求能调用哪些模型。请求通过 `user` 字段或 `x-litellm-customer-id` 请求头携带该客户的 ID 时，只要所请求的模型不在列表中，即使虚拟密钥和团队都放行，也会收到 403 拒绝。列表为空或未设置表示该客户不附加任何模型限制。客户列表只会收紧访问：密钥与团队自身的模型限制仍会叠加生效，所以在客户上列出某个模型，永远不会让密钥因此获得它的访问权

列表条目遵循与密钥、团队 `models` 相同的规则，因此 `anthropic/*` 这类通配符或模型访问组名称在这里同样可用

客户端传入的 `fallbacks` 也会对照客户列表检查；启用 `enforce_fallback_model_access` 时，路由器回退同样受此约束

```bash showLineNumbers title="Create a customer limited to one model"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "models": ["{{openai_small}}"]
  }'
```

此后，以 `user_1` 名义请求列表之外的任何模型都会失败，错误结构与密钥、团队模型检查一致，`type` 为 `customer_model_access_denied`

```bash showLineNumbers title="Request a model outside the customer's list"
curl -L -X POST 'http://localhost:4000/v1/chat/completions' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-H 'x-litellm-customer-id: user_1' \
-d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "hi"}]
  }'
```

```json title="Response (403)"
{
  "error": {
    "message": "The requested model '{{openai_large}}' is not in the allowed models for this customer. Check the models this customer can use and try again.",
    "type": "customer_model_access_denied",
    "param": "model",
    "code": "403"
  }
}
```

用 `/customer/update` 修改列表。省略 `models` 则保持当前列表不变，发送 `"models": []` 则解除限制。`/customer/info` 会在 `models` 字段中返回当前列表

```bash showLineNumbers title="Remove the customer's model restriction"
curl -L -X POST 'http://localhost:4000/customer/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "models": []
  }'
```

## 设置客户对象权限

控制客户可以访问哪些资源（MCP 服务器、向量存储、智能体）。

### 什么是对象权限？

对象权限（object permission）可以把客户能访问的对象限制在以下几类：
- **MCP 服务器**：限制客户可以调用哪些 MCP 服务器
- **MCP 访问组**：把客户分配到预定义的 MCP 服务器组
- **MCP 工具权限**：细粒度控制客户可以使用 MCP 服务器内的哪些工具
- **向量存储**：控制客户可以查询哪些向量存储
- **智能体**：限制客户可以与哪些智能体交互
- **智能体访问组**：把客户分配到预定义的智能体组

### 创建带对象权限的客户

```bash showLineNumbers title="Create customer with object permissions"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "object_permission": {
      "mcp_servers": ["server_1", "server_2"],
      "mcp_access_groups": ["public_group"],
      "mcp_tool_permissions": {
        "server_1": ["tool_a", "tool_b"]
      },
      "vector_stores": ["vector_store_1"],
      "agents": ["agent_1"],
      "agent_access_groups": ["basic_agents"]
    }
  }'
```

**参数：**
- `mcp_servers`（Optional[List[str]]）：允许的 MCP 服务器 ID 列表
- `mcp_access_groups`（Optional[List[str]]）：MCP 访问组名称列表
- `mcp_tool_permissions`（Optional[Dict[str, List[str]]]）：服务器 ID 到允许工具名称的映射
- `vector_stores`（Optional[List[str]]）：允许的向量存储 ID 列表
- `agents`（Optional[List[str]]）：允许的智能体 ID 列表
- `agent_access_groups`（Optional[List[str]]）：智能体访问组名称列表

**注意：** 如果 `object_permission` 为 `null` 或 `{}`，客户就不受任何对象级限制。

### 更新客户对象权限

可以为已有客户更新对象权限：

```bash showLineNumbers title="Update customer object permissions"
curl -L -X POST 'http://localhost:4000/customer/update' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "user_1",
    "object_permission": {
      "mcp_servers": ["server_3"],
      "vector_stores": ["vector_store_2", "vector_store_3"]
    }
  }'
```

### 查看客户对象权限

查询客户信息时，响应中会包含对象权限：

```bash showLineNumbers title="Get customer info with object permissions"
curl -X GET 'http://0.0.0.0:4000/customer/info?end_user_id=user_1' \
    -H "Authorization: Bearer $LITELLM_API_KEY"
```

**响应：**
```json showLineNumbers title="Response with object permissions"
{
  "user_id": "user_1",
  "blocked": false,
  "alias": "John Doe",
  "spend": 0.0,
  "object_permission": {
    "object_permission_id": "perm_abc123",
    "mcp_servers": ["server_1", "server_2"],
    "mcp_access_groups": ["public_group"],
    "mcp_tool_permissions": {
      "server_1": ["tool_a", "tool_b"]
    },
    "vector_stores": ["vector_store_1"],
    "agents": ["agent_1"],
    "agent_access_groups": ["basic_agents"]
  },
  "litellm_budget_table": null
}
```

### 使用场景

**1. 分层访问控制**
为你的客户创建不同的权限层级：

```bash showLineNumbers title="Free tier customer"
# 免费层，访问受限
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "free_user",
    "budget_id": "free_tier",
    "object_permission": {
      "mcp_access_groups": ["public_group"],
      "agent_access_groups": ["basic_agents"]
    }
  }'
```

```bash showLineNumbers title="Premium tier customer"
# 高级层，完整访问
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "premium_user",
    "budget_id": "premium_tier",
    "object_permission": {
      "mcp_servers": ["server_1", "server_2", "server_3"],
      "vector_stores": ["vector_store_1", "vector_store_2"],
      "agents": ["agent_1", "agent_2", "agent_3"]
    }
  }'
```

**2. 按部门限制访问**
把客户限制在其部门相关的资源范围内：

```bash showLineNumbers title="Sales team customer"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "sales_user",
    "object_permission": {
      "mcp_servers": ["crm_server", "email_server"],
      "agents": ["sales_assistant"],
      "vector_stores": ["sales_knowledge_base"]
    }
  }'
```

**3. 工具级限制**
只授权访问 MCP 服务器内的特定工具：

```bash showLineNumbers title="Limited tool access"
curl -L -X POST 'http://localhost:4000/customer/new' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'Content-Type: application/json' \
-d '{
    "user_id": "restricted_user",
    "object_permission": {
      "mcp_servers": ["database_server"],
      "mcp_tool_permissions": {
        "database_server": ["read_only_query", "get_table_schema"]
      }
    }
  }'
```

## 设置客户预算

在 LiteLLM 代理服务器上为客户设置预算，例如月度预算、TPM/RPM（每分钟 Token 数/每分钟请求数）限制。

### 所有客户的默认预算

为所有未显式设置预算的客户统一应用预算限制。适合对所有终端用户做统一的限流与花费控制。

**第 1 步：创建默认预算**

```bash showLineNumbers title="Create default budget"
curl -X POST 'http://localhost:4000/budget/new' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "max_budget": 10,
    "rpm_limit": 2,
    "tpm_limit": 1000
}'
```

**第 2 步：配置默认预算 ID**

```yaml showLineNumbers title="config.yaml"
litellm_settings:
  max_end_user_budget_id: "budget_id_from_step_1"
```

**第 3 步：测试**

```bash showLineNumbers title="Make request with customer ID"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-d '{
    "model": "{{openai_small}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "user": "my-customer-id"
}'
```

该客户将受默认预算限制（RPM、TPM 与美元预算）约束。有显式预算的客户不受影响，数据库中还不存在的客户同样适用默认预算。LiteLLM 会把预算对象缓存 60 秒，对它的修改最多需要一分钟才生效。

浮点数配置 `max_end_user_budget` 已不再生效；如果你的配置里还有它，请按上面的写法换成 `max_end_user_budget_id`。

凡进入客户追踪环节的 ID 都适用默认预算，包括智能体客户端发送的按会话变化的 ID。如果你想把这些 ID 挡在客户表之外、同时让真实客户继续享有默认预算，参见[限制哪些 ID 会成为客户](#限制哪些-id-会成为客户)。

### 快速上手

创建/更新带预算的客户

**创建带预算的新客户**
```bash showLineNumbers title="Create customer with budget"
curl -X POST 'http://0.0.0.0:4000/customer/new'         
    -H "Authorization: Bearer $LITELLM_API_KEY"         
    -H 'Content-Type: application/json'         
    -d '{
        "user_id" : "my-customer-id",
        "max_budget": 10
    }'
```

`/customer/new` 支持内联传入预算字段：`max_budget`、`soft_budget`、`budget_duration`、`tpm_limit`、`rpm_limit`、`max_parallel_requests` 和 `model_max_budget`。`max_budget` 与 `budget_id` 只能二选一，同时传入会被拒绝。客户的 `tpm_limit` 和 `rpm_limit` 存放在预算对象上，因此只有当客户关联了预算对象时才生效，可以通过上面的内联方式，也可以通过 `budget_id` 关联。

`/customer/update` 接受的字段更少：`user_id`、`alias`、`blocked`、`max_budget`、`budget_id`、`allowed_model_region`、`default_model` 和 `object_permission`。其余字段（包括 `tpm_limit`、`rpm_limit` 和 `budget_duration`）会被静默丢弃；要修改这些，请改用 `/budget/update` 更新预算对象。

客户预算在每个部署内是全局的。花费只按客户 ID 追踪，因此同一客户在所有虚拟密钥与团队之间共享同一个预算，客户预算也无法只作用于单个密钥或团队。

**测试一下！**

```bash showLineNumbers title="Test customer budget"
curl -X POST 'http://localhost:4000/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "model": "mistral",
    "messages": [
        {
        "role": "user",
        "content": "What'\''s the weather like in Boston today?"
        }
    ],
    "user": "ishaan-jaff-48"
}
```

### 分配定价层级

创建定价层级（pricing tier）并将客户分配到对应层级。

#### 1. 创建预算

<Tabs>
<TabItem value="ui" label="UI">

- 在管理界面中打开 "Budgets" 标签页。
- 点击 "+ Create Budget"。
- 创建你的定价层级（例如预算 $4 的 "my-free-tier"）。这表示该层级上的每个用户都将有 $4 的预算上限。

<Image img={require('../../img/create_budget_modal.png')} />

</TabItem>
<TabItem value="api" label="API">

使用 `/budget/new` 端点创建新预算。[API 参考](https://docs.litellm.ai/api-reference/#/budget%20management/new_budget_budget_new_post)

```bash showLineNumbers title="Create budget via API"
curl -X POST 'http://localhost:4000/budget/new' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "budget_id": "my-free-tier", 
    "max_budget": 4 
}
```

</TabItem>
</Tabs>

:::info

`tpm_limit` 和 `rpm_limit` 在预算上是可选的。不设置时存为 `null`，LiteLLM 对该预算下的客户不施加任何每客户 TPM 或 RPM 限制，只有提供商自身的速率限制生效。只在你确实想让 LiteLLM 限制客户时才设置它们

```bash
curl -X POST 'http://localhost:4000/budget/info' \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"budgets": ["my-free-tier"]}'
```

未设置 LiteLLM 限制时，`tpm_limit` 和 `rpm_limit` 会返回 `null`

:::

#### 2. 将预算分配给客户

在应用代码中，创建新客户时为其分配预算。

只需使用创建预算时的那个 `budget_id`。在本例中就是 `my-free-tier`。

```bash showLineNumbers title="Assign budget to customer"
curl -X POST 'http://localhost:4000/customer/new' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "user_id": "my-customer-id",
    "budget_id": "my-free-tier" # 👈 关键改动
}
```

#### 3. 测试一下

<Tabs>
<TabItem value="curl" label="curl">

```bash showLineNumbers title="Test with curl"
curl -X POST 'http://localhost:4000/customer/new' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-D '{
    "user_id": "my-customer-id",
    "budget_id": "my-free-tier" # 👈 关键改动
}
```

</TabItem>
<TabItem value="openai" label="OpenAI">

```python showLineNumbers title="Test with OpenAI SDK"
from openai import OpenAI
client = OpenAI(
  base_url="<your_proxy_base_url>",
  api_key="<your_proxy_key>"
)

completion = client.chat.completions.create(
  model="{{openai_small}}",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  user="my-customer-id"
)

print(completion.choices[0].message)
```

</TabItem>
</Tabs>
