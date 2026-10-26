import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /memory

LiteLLM 代理（proxy）提供这组 CRUD 端点，用于存储和读取用户/团队维度的记忆条目（memory entry）。可用它们持久化对话上下文、智能体记忆、团队 playbook，或任何归属于特定用户和团队的键值数据。

## 概览

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 创建记忆 | ✅ | `POST /v1/memory` |
| 列出记忆 | ✅ | `GET /v1/memory`，支持可选过滤条件 |
| 按 key 获取记忆 | ✅ | `GET /v1/memory/{key}` |
| Upsert 记忆 | ✅ | `PUT /v1/memory/{key}` |
| 删除记忆 | ✅ | `DELETE /v1/memory/{key}` |
| 用户维度访问 | ✅ | 条目归属于 `user_id` |
| 团队维度访问 | ✅ | 条目归属于 `team_id` |
| JSON 元数据 | ✅ | 每条可附带任意 JSON 元数据 |
| 分页 | ✅ | 按页码返回，页大小可配置 |
| key 前缀过滤 | ✅ | 类 Redis 的命名空间扫描 |
| 审计记录 | ✅ | `created_by`、`updated_by` 附带时间戳 |
| 支持的 LiteLLM 版本 | `v1.83.10+` | |

## 前提条件

- LiteLLM 代理服务器（Proxy）正在运行，且已连接 **PostgreSQL** 数据库
- 已执行数据库迁移（`LiteLLM_MemoryTable` 会自动创建）
- 准备好用于身份验证的有效 API 密钥（API key）

无需在 `config.yaml` 中添加任何额外配置。代理连上数据库启动后，这些端点即自动可用。

## 快速上手

### 创建记忆条目

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Create memory"
curl -X POST "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:123:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"tags": ["preferences", "user-settings"]}
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Create memory"
import httpx

client = httpx.Client(
    base_url="http://localhost:4000",
    headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
)

response = client.post("/v1/memory", json={
    "key": "user:123:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"tags": ["preferences", "user-settings"]},
})
print(response.json())
```

</TabItem>
</Tabs>

**响应：**

```json
{
  "memory_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "key": "user:123:preferences",
  "value": "Prefers concise responses. Timezone: PST.",
  "metadata": {"tags": ["preferences", "user-settings"]},
  "user_id": "user-123",
  "team_id": "team-abc",
  "created_at": "2025-04-21T12:00:00Z",
  "created_by": "user-123",
  "updated_at": "2025-04-21T12:00:00Z",
  "updated_by": "user-123"
}
```

### 列出记忆

<Tabs>
<TabItem value="curl" label="curl">

```shell title="List all memories"
curl "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```shell title="Filter by key prefix"
curl "http://localhost:4000/v1/memory?key_prefix=user:123:" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

```shell title="Paginate results"
curl "http://localhost:4000/v1/memory?page=2&page_size=10" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="List memories"
# List all
response = client.get("/v1/memory")
print(response.json())

# Filter by key prefix
response = client.get("/v1/memory", params={"key_prefix": "user:123:"})
print(response.json())

# Paginate
response = client.get("/v1/memory", params={"page": 2, "page_size": 10})
print(response.json())
```

</TabItem>
</Tabs>

**响应：**

```json
{
  "memories": [
    {
      "memory_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "key": "user:123:preferences",
      "value": "Prefers concise responses. Timezone: PST.",
      "metadata": {"tags": ["preferences", "user-settings"]},
      "user_id": "user-123",
      "team_id": "team-abc",
      "created_at": "2025-04-21T12:00:00Z",
      "created_by": "user-123",
      "updated_at": "2025-04-21T12:00:00Z",
      "updated_by": "user-123"
    }
  ],
  "total": 1
}
```

### 按 Key 获取记忆

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Get memory by key"
curl "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Get memory by key"
response = client.get("/v1/memory/user:123:preferences")
print(response.json())
```

</TabItem>
</Tabs>

### 更新（Upsert）记忆

key 已存在时执行更新，不存在时新建条目。

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Upsert memory"
curl -X PUT "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Prefers concise responses. Timezone: EST. Language: English.",
    "metadata": {"tags": ["preferences", "user-settings"], "version": 2}
  }'
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Upsert memory"
response = client.put("/v1/memory/user:123:preferences", json={
    "value": "Prefers concise responses. Timezone: EST. Language: English.",
    "metadata": {"tags": ["preferences", "user-settings"], "version": 2},
})
print(response.json())
```

</TabItem>
</Tabs>

### 删除记忆

<Tabs>
<TabItem value="curl" label="curl">

```shell title="Delete memory"
curl -X DELETE "http://localhost:4000/v1/memory/user:123:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="python" label="Python (httpx)">

```python showLineNumbers title="Delete memory"
response = client.delete("/v1/memory/user:123:preferences")
print(response.json())
```

</TabItem>
</Tabs>

**响应：**

```json
{
  "key": "user:123:preferences",
  "deleted": true
}
```

## API 参考

### POST `/v1/memory`

创建一条新的记忆条目。

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `key` | string | ✅ | 全局唯一的 key。建议使用带命名空间的 key（如 `user:123:notes`）。 |
| `value` | string | ✅ | 记忆内容，通常为 markdown 或纯文本。 |
| `metadata` | any (JSON) | ❌ | 可选的 JSON 元数据（字典、列表、标量均可）。 |
| `user_id` | string | ❌ | 指定所属用户。默认取调用者的 `user_id`；仅管理员可覆盖。 |
| `team_id` | string | ❌ | 指定所属团队。默认取调用者的 `team_id`；仅管理员可覆盖。 |

**响应：** `201`，返回新建的 `LiteLLM_MemoryRow`。

---

### GET `/v1/memory`

列出调用者可见的记忆条目。

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `key` | string | — | 按 key 精确匹配过滤。 |
| `key_prefix` | string | — | 按 key 前缀过滤（如 `user:123:`）；优先级高于 `key`。 |
| `page` | int | 1 | 页码（从 1 开始）。 |
| `page_size` | int | 50 | 每页条数（最大 500）。 |

**响应：** `200`，返回 `MemoryListResponse`，包含 `memories` 数组和 `total` 总数。

---

### GET `/v1/memory/{key}`

按 key 获取单条记忆条目。

**路径参数：**

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `key` | string | 要获取的记忆 key。 |

**响应：** `200`，返回该 `LiteLLM_MemoryRow`。

---

### PUT `/v1/memory/{key}`

Upsert 一条记忆条目：key 不存在则新建，已存在则更新。

**路径参数：**

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `key` | string | 要创建或更新的记忆 key。 |

**请求体：**

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `value` | string | ✅（创建时） | 记忆内容。创建时必填，更新时可选。 |
| `metadata` | any (JSON) | ❌ | 更新后的元数据。省略则保留原值，传 `null` 则清空。 |
| `user_id` | string | ❌ | 仅创建时生效；仅管理员可覆盖。 |
| `team_id` | string | ❌ | 仅创建时生效；仅管理员可覆盖。 |

**响应：** `200`，返回创建或更新后的 `LiteLLM_MemoryRow`。

---

### DELETE `/v1/memory/{key}`

按 key 删除一条记忆条目。

**路径参数：**

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `key` | string | 要删除的记忆 key。 |

**响应：** `200`，返回 `{"key": "...", "deleted": true}`。

## 响应对象

所有会返回记忆条目的端点均使用以下 schema：

```json
{
  "memory_id": "string (UUID)",
  "key": "string",
  "value": "string",
  "metadata": "any (JSON) or null",
  "user_id": "string or null",
  "team_id": "string or null",
  "created_at": "datetime",
  "created_by": "string",
  "updated_at": "datetime",
  "updated_by": "string"
}
```

## 访问控制

记忆条目按 `user_id` 和 `team_id` 划分作用域，可见性与写入权限均基于角色控制。

### 可见性（读取）

| 角色 | 可见范围 |
|------|---------|
| **代理管理员** | 所有记忆条目 |
| **普通用户** | `user_id` 与自身一致，或 `team_id` 与自身一致的条目 |

### 写入权限（更新 / 删除）

| 场景 | 谁可写入 |
|----------|---------------|
| 条目的 `user_id` 与调用者一致 | 所有者可更新/删除 |
| 条目仅归属团队（无 `user_id`） | 仅团队管理员和组织管理员 |
| 任意条目 | 代理管理员 |

:::info

团队成员可以**读取**团队维度的条目，但只有**团队管理员**能修改或删除这些条目，避免队友之间相互覆盖。

:::

### 创建时的作用域

- `user_id` 和 `team_id` 默认取自 API 密钥对应的调用者身份
- **代理管理员**可覆盖 `user_id` / `team_id`，为其他用户或团队创建条目
- 非管理员调用者必须至少提供 `user_id` 或 `team_id` 之一，否则无法创建条目

## Key 命名规范

key 全局唯一。建议使用带命名空间的 key 来组织条目：

```
user:{user_id}:preferences      # User preferences
user:{user_id}:context          # Conversation context
team:{team_id}:playbook         # Team playbook
agent:{agent_id}:memory         # Agent memory
project:{project_id}:config     # Project configuration
```

在列表端点中传入 `key_prefix`，即可扫描某个命名空间下的全部条目：

```shell
# Get all entries for a user
curl "http://localhost:4000/v1/memory?key_prefix=user:123:" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

## 错误码

| 状态码 | 含义 |
|-------------|---------|
| `200` | 成功（GET、PUT、DELETE） |
| `201` | 已创建（POST） |
| `400` | 输入无效（缺少必填字段、PUT 请求体为空、孤立行） |
| `403` | 权限不足（越权写入、非管理员覆盖作用域） |
| `404` | key 不存在或对调用者不可见 |
| `409` | 创建时 key 重复 |
| `500` | 服务器内部错误（数据库问题） |
