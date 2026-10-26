import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 记忆管理

保存用户的偏好与反馈，让 LLM 跨会话记住这些信息。作用域按用户与团队划分，并内置访问控制（access control）。

**前置要求**：LiteLLM `v1.83.10+`，且已连接 PostgreSQL。无需更改任何配置。

### 创建

<Tabs>
<TabItem value="curl" label="curl">

```shell
curl -X POST "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"version": 1}
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:4000",
    headers={"Authorization": "Bearer sk-<your-litellm-api-key>"},
)

client.post("/v1/memory", json={
    "key": "user:preferences",
    "value": "Prefers concise responses. Timezone: PST.",
    "metadata": {"version": 1},
})
```

</TabItem>
</Tabs>

### 读取

```shell
curl "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

### 更新

```shell
curl -X PUT "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": "Prefers concise responses. Timezone: EST."}'
```

### 列出

```shell
# All entries
curl "http://localhost:4000/v1/memory" \
  -H "Authorization: Bearer $LITELLM_API_KEY"

# By prefix
curl "http://localhost:4000/v1/memory?key_prefix=user:" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

### 删除

```shell
curl -X DELETE "http://localhost:4000/v1/memory/user:preferences" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

## 访问控制

作用域基于 API 密钥自动划定。

| 角色 | 可读取 | 可写入 |
|------|-------|--------|
| 用户 | 本人 + 团队条目 | 仅本人条目 |
| 团队管理员 | 本人 + 团队条目 | 本人 + 团队条目 |
| 代理管理员 | 全部 | 全部 |

## 键命名

键全局唯一。用前缀划分命名空间并进行查询：

```
user:preferences           → per-user settings
team:playbook:onboarding   → shared team resources
agent:memory:scratchpad    → agent working memory
```

## 示例：Slack 机器人中的每用户记忆

按 Slack 工作区和用户拆分记忆，让每个人的偏好彼此隔离。

**键格式**：`slack:{team_id}:{user_id}`

```python
import httpx

LITELLM_BASE = "http://localhost:4000"
LITELLM_KEY = "sk-<your-litellm-api-key>"

def memory_key(team_id: str, user_id: str) -> str:
    return f"slack:{team_id}:{user_id}"

async def get_preferences(team_id: str, user_id: str) -> str:
    """Read saved preferences. Returns "" if none exist."""
    key = memory_key(team_id, user_id)
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{LITELLM_BASE}/v1/memory/{key}",
            headers={"Authorization": f"Bearer {LITELLM_KEY}"},
        )
    if r.status_code == 404:
        return ""
    return r.json().get("value", "")

async def save_preference(team_id: str, user_id: str, note: str):
    """Append a preference. PUT upserts — creates or updates."""
    key = memory_key(team_id, user_id)
    existing = await get_preferences(team_id, user_id)

    # Store as bullet list
    bullets = [b for b in existing.split("\n") if b.strip()]
    bullets.append(f"- {note}")
    
    async with httpx.AsyncClient() as client:
        await client.put(
            f"{LITELLM_BASE}/v1/memory/{key}",
            headers={"Authorization": f"Bearer {LITELLM_KEY}"},
            json={"value": "\n".join(bullets)},
        )
```

**每一轮都注入到系统提示词**（system prompt）：

```python
prefs = await get_preferences(team_id, user_id)

messages = [
    {"role": "system", "content": f"""You are a helpful assistant.

SAVED USER PREFERENCES:
{prefs}

Follow these unless the current message contradicts them."""},
    {"role": "user", "content": user_message},
]
```

**查询某个工作区的全部偏好**：

```shell
curl "http://localhost:4000/v1/memory?key_prefix=slack:T024BE7LD:" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

## 元数据

可以为条目附加任意 JSON：

```json
{
  "key": "agent:findings",
  "value": "Q1 API usage up 15%...",
  "metadata": {"tags": ["research"], "confidence": 0.92}
}
```

## API 参考

完整的请求/响应 schema、参数与错误码见 [/memory 端点参考](/docs/memory_management)。
