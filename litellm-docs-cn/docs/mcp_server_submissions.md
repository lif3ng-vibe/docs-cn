import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 服务器提交

LiteLLM 为 MCP（Model Context Protocol）服务器提供了一套提交与审批工作流。团队成员可以提交 MCP 服务器供管理员审核，服务器会保持 `pending_review`（待审核）状态，直到管理员批准或拒绝。

这样，组织既能允许团队成员自助注册 MCP 服务器，又不会把未经批准的服务器立即暴露给所有用户。

:::info[相关文档]
- [MCP 概览](./mcp.md) - 添加与管理 MCP 服务器
- [MCP 权限管理](./mcp_control.md) - 按密钥、团队或组织控制 MCP 访问
:::

## 工作原理

```
Team member submits MCP server via API
        ↓
Server saved as "pending_review" (NOT loaded into registry)
        ↓
Admin reviews in the Submitted MCPs tab
        ↓
Approve → server goes "active" and is loaded into the registry
Reject  → server stays out with optional review notes
```

**前提条件**：
- 代理配置中必须设置 `store_model_in_db: true`（持久化保存 MCP 服务器所必需）
- 提交者必须使用**团队作用域 API 密钥**（admin 密钥会绕过该工作流，直接调用 `POST /v1/mcp/server`）

```yaml title="config.yaml" showLineNumbers
general_settings:
  store_model_in_db: true
```

---

## 用户：提交 MCP 服务器

请使用团队作用域 API 密钥。该端点会拒绝 admin 密钥；管理员应直接调用 `POST /v1/mcp/server`。

<Tabs>
<TabItem value="curl" label="curl">

```bash title="Submit MCP server for review" showLineNumbers
curl -X POST http://localhost:4000/v1/mcp/server/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEAM_API_KEY" \
  -d '{
    "server_name": "github_mcp",
    "url": "https://api.githubcopilot.com/mcp",
    "transport": "sse",
    "description": "GitHub MCP for code search and PR management"
  }'
```

</TabItem>
<TabItem value="python" label="Python">

```python title="Submit MCP server for review" showLineNumbers
import requests

response = requests.post(
    "http://localhost:4000/v1/mcp/server/register",
    headers={
        "Authorization": f"Bearer {team_api_key}",
        "Content-Type": "application/json",
    },
    json={
        "server_name": "github_mcp",
        "url": "https://api.githubcopilot.com/mcp",
        "transport": "sse",
        "description": "GitHub MCP for code search and PR management",
    },
)
print(response.json())
```

</TabItem>
</Tabs>

**响应**：服务器以 `pending_review` 状态创建：

```json
{
  "server_id": "832d6abc-7a5c-457a-a9f6-cfe4ae05f776",
  "server_name": "github_mcp",
  "url": "https://api.githubcopilot.com/mcp",
  "transport": "sse",
  "approval_status": "pending_review",
  "submitted_by": "7fd77c87-207b-4d6c-9d51-b72efb8962dc",
  "submitted_at": "2026-04-29T18:50:34Z"
}
```

:::note
此时该服务器对 MCP 客户端**还不可访问**。只有管理员批准后，它才会生效。
:::

---

## 管理员：审核提交

### 通过管理界面

前往 **MCP Servers → Submitted MCPs** 标签页，可以看到：
- 提交数量统计：Total Submitted（总提交）、Pending Review（待审核）、Active（已生效）、Rejected（已拒绝）
- 每张提交卡片展示服务器名称、描述、URL、传输方式（transport）和提交日期
- 每张卡片上都带有 **Approve**（批准）与 **Reject**（拒绝）按钮

<Image
  img={require('../static/img/mcp/02_submitted_mcps_tab.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

**批准**某台服务器时会弹出确认对话框。点击 **Approve**，该服务器会立即转为 `active` 并加载进 MCP 注册表（registry）。

<Image
  img={require('../static/img/mcp/04_approve_dialog.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

批准后，卡片徽标变为 **Active**，各项计数随之更新：

<Image
  img={require('../static/img/mcp/05_after_approve.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

**拒绝**时会打开一个对话框，其中包含可选的审核备注（review notes）输入框，用于说明拒绝原因：

<Image
  img={require('../static/img/mcp/03_reject_dialog.png')}
  style={{width: '100%', display: 'block', margin: '1rem 0'}}
/>

### 通过 API

需要 admin 或 `proxy_admin_viewer` 角色。

<Tabs>
<TabItem value="list" label="列出提交">

```bash title="List all MCP submissions" showLineNumbers
curl http://localhost:4000/v1/mcp/server/submissions \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

响应：

```json
{
  "total": 1,
  "pending_review": 1,
  "active": 0,
  "rejected": 0,
  "items": [
    {
      "server_id": "832d6abc-7a5c-457a-a9f6-cfe4ae05f776",
      "server_name": "github_mcp",
      "approval_status": "pending_review",
      "submitted_by": "7fd77c87-207b-4d6c-9d51-b72efb8962dc",
      "submitted_at": "2026-04-29T18:50:34Z"
    }
  ]
}
```

</TabItem>
<TabItem value="approve" label="批准">

```bash title="Approve a submitted MCP server" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server/{server_id}/approve \
  -H "Authorization: Bearer $ADMIN_API_KEY"
```

服务器状态变为 `active`，并立即加载进 MCP 运行时注册表。

</TabItem>
<TabItem value="reject" label="拒绝">

```bash title="Reject a submitted MCP server" showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server/{server_id}/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -d '{"review_notes": "This URL is not on the approved vendor list."}'
```

`review_notes` 为可选字段。该服务器不会进入注册表。

</TabItem>
</Tabs>

---

## 审批状态取值

| 状态 | 含义 |
|--------|---------|
| `pending_review` | 已提交，等待管理员审核。MCP 客户端不可访问。 |
| `active` | 已批准。已加载进 MCP 注册表，客户端可以使用。 |
| `rejected` | 已被管理员拒绝。不可访问。可能包含 `review_notes`。 |

---

## 常见问题（FAQ）

**管理员能否重新批准已拒绝的服务器**？

可以。调用 `PUT /v1/mcp/server/{id}/approve`；该端点同时接受 `pending_review` 和 `rejected` 状态的服务器。

**之前已生效的服务器被拒绝后会发生什么**？

它会被立即移出运行时注册表，客户端从此看不到它的工具。

**需要特殊的配置开关才能启用提交功能吗**？

不需要。只要设置了 `store_model_in_db: true`，提交端点默认即可用，无需额外的功能开关。
