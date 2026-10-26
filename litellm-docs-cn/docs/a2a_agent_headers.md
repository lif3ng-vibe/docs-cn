import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# A2A 智能体认证请求头

将客户端的认证凭据（Bearer 令牌、API 密钥等）转发给后端 A2A（Agent-to-Agent）智能体。

## 概览

当 LiteLLM 将请求代理到后端 A2A 智能体时，智能体可能要求使用自己的认证请求头。提供方式有三种：

| 方式 | 配置者 | 工作原理 |
|---|---|---|
| **静态请求头** | 管理员（UI / API） | 无论客户端请求如何都始终发送 |
| **转发客户端请求头** | 管理员（UI / API） | 指定要从客户端请求中提取并转发的请求头名称 |
| **基于命名约定** | 客户端（无需管理员配置） | 客户端发送 `x-a2a-{agent_name}-{header}`，自动完成路由 |

三种方式可以叠加使用。同名冲突时**静态请求头始终优先**。

---

## 方式 1：静态请求头

由管理员配置、始终发送给后端智能体的请求头。适用于服务间（server-to-server）令牌或内部凭据，客户端既看不到，也无法覆盖。

<Tabs>
<TabItem value="ui" label="UI">

1. 进入 LiteLLM 仪表板的 **Agents**（智能体）页面。
2. 创建或编辑一个智能体。
3. 打开 **Authentication Headers**（认证请求头）面板。
4. 在 **Static Headers**（静态请求头）区域，点击 **Add Static Header**（添加静态请求头），填写请求头名称和值。

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "static_headers": {
      "Authorization": "Bearer internal-server-token",
      "X-Internal-Service": "litellm-proxy"
    }
  }'
```

更新已有智能体：

```bash
curl -X PATCH http://localhost:4000/v1/agents/{agent_id} \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "static_headers": {
      "Authorization": "Bearer new-token"
    }
  }'
```

</TabItem>
</Tabs>

**客户端调用**（无需任何特殊请求头）：

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0", "id": "1", "method": "message/send",
    "params": { "message": { "role": "user", "parts": [{"kind": "text", "text": "Hello"}], "messageId": "msg-1" } }
  }'
```

后端智能体会收到 `Authorization: Bearer internal-server-token`，而客户端全程不知晓该值。

---

## 方式 2：转发客户端请求头

管理员指定一组请求头**名称**。当客户端请求携带这些请求头时，LiteLLM 会提取其值并转发给后端智能体。请求头的值由客户端决定，哪些请求头允许转发则由管理员决定。

<Tabs>
<TabItem value="ui" label="UI">

1. 进入 LiteLLM 仪表板的 **Agents** 页面。
2. 创建或编辑一个智能体。
3. 打开 **Authentication Headers** 面板。
4. 在 **Forward Client Headers**（转发客户端请求头）区域，输入请求头名称后按 **Enter**（例如 `x-api-key`、`Authorization`）。

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "extra_headers": ["x-api-key", "x-user-token"]
  }'
```

</TabItem>
</Tabs>

**客户端调用**（需携带要转发的请求头）：

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-api-key: user-secret-value" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

后端智能体会收到 `x-api-key: user-secret-value`。

:::note
请求头名称匹配**不区分大小写**。若客户端发送 `X-API-Key`，而 `extra_headers` 中列出的是 `x-api-key`，两者即可匹配。
:::

---

## 方式 3：基于命名约定的转发

无需管理员预先配置，客户端即可使用以下命名约定，把请求头转发给指定智能体：

```
x-a2a-{agent_name_or_id}-{header_name}: value
```

LiteLLM 会自动解析这些请求头，并只路由到匹配的智能体。

**示例**：

| 客户端发送的请求头 | 智能体名称/ID | 转发后的形式 |
|---|---|---|
| `x-a2a-my-agent-authorization: Bearer tok` | `my-agent` | `authorization: Bearer tok` |
| `x-a2a-my-agent-x-api-key: secret` | `my-agent` | `x-api-key: secret` |
| `x-a2a-abc123-authorization: Bearer tok` | 智能体 ID `abc123` | `authorization: Bearer tok` |

```bash
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-a2a-my-agent-authorization: Bearer agent-specific-token" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

同一请求中发送的 `x-a2a-other-agent-authorization` 请求头**不会**转发给 `my-agent`，而是被静默忽略。

:::tip[同时匹配智能体名称与智能体 ID]
人类可读的名称（如 `my-agent`）和 UUID（如 `abc123-...`）都有效，客户端用哪个方便就用哪个。
:::

---

## 合并优先级

当多种方式提供同名请求头时，**静态请求头优先**：

```
dynamic (forwarded/convention)  →  merged  ←  static (overlays, wins)
```

示例：

| 来源 | `Authorization` 值 |
|---|---|
| 客户端发送（经 `extra_headers` 或命名约定） | `Bearer client-token` |
| 管理员配置的 `static_headers` | `Bearer server-token` |
| **后端智能体实际收到**|**`Bearer server-token`** |

这样可以确保管理员控制的凭据不会被客户端请求覆盖。

当凭据由 LiteLLM 自行生成时（例如智能体上配置了 `databricks_oauth` 块或 Microsoft Entra 字段），生成的 `Authorization` 优先于上述两种来源，且客户端发送的任意大小写的同名请求头（`authorization`、`Authorization`）都会被丢弃，从而保证后端只收到一行 `Authorization`。

---

## 三种方式结合使用

```bash
# Register agent with static + forwarded headers
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-agent",
    "agent_card_params": { ... },
    "static_headers": {
      "X-Internal-Token": "secret123"
    },
    "extra_headers": ["x-user-id"]
  }'

# Client call using all three mechanisms
curl -X POST http://localhost:4000/a2a/my-agent \
  -H "Authorization: Bearer sk-client-key" \
  -H "x-user-id: user-42" \
  -H "x-a2a-my-agent-x-request-id: req-abc" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

后端智能体会收到：

```
X-Internal-Token: secret123          ← static header (always)
x-user-id: user-42                   ← forwarded (in extra_headers)
x-request-id: req-abc                ← convention-based (x-a2a-my-agent-*)
X-LiteLLM-Trace-Id: <uuid>           ← LiteLLM internal
X-LiteLLM-Agent-Id: <agent-id>       ← LiteLLM internal
```

---

## 请求头隔离

每次智能体调用都使用隔离的 HTTP 连接。为智能体 A 配置的请求头**绝不会**发送给智能体 B，即使两个智能体同时在运行并接收请求。

---

## API 参考

### `POST /v1/agents` / `PATCH /v1/agents/{agent_id}`

| 字段 | 类型 | 说明 |
|---|---|---|
| `static_headers` | `object` | `{"Header-Name": "value"}`，始终转发 |
| `extra_headers` | `string[]` | 要从客户端请求中提取并转发的请求头名称 |

### 智能体响应

这两个字段都会在 `GET /v1/agents` 和 `GET /v1/agents/{agent_id}` 的响应中返回：

```json
{
  "agent_id": "...",
  "agent_name": "my-agent",
  "static_headers": { "X-Internal-Token": "secret123" },
  "extra_headers": ["x-user-id"],
  ...
}
```

:::warning
`static_headers` 的值会存入数据库，并通过 API 返回。请像对待其他凭据一样对待它们：如果你的 API 可公开访问，不要在这里存放敏感的长期令牌，建议改用短期令牌或通过环境变量注入的密钥。
:::
