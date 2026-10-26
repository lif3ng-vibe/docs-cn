import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP REST API

通过 HTTP **直接**调用 MCP 工具的指南。

适合你已经明确知道要运行哪个工具的场景。若要由 LLM 自主决定调用哪些工具，请参阅 [MCP 使用指南](./mcp_usage.md)。

**基础 URL**：`http://localhost:4000`（替换为你的 LiteLLM 代理地址）

**认证**：每个请求都需携带 LiteLLM API 密钥：

```bash
-H "Authorization: Bearer $LITELLM_API_KEY"
# 或
-H "x-litellm-api-key: sk-<your-litellm-api-key>"
```

---

## 端点

| Method | 路径 | 用途 |
|--------|------|---------|
| `GET` | `/v1/mcp/server` | 列出 MCP 服务器（获取 `server_id` / `server_name`） |
| `GET` | `/mcp-rest/tools/list` | 列出工具（所有服务器，或指定某一台） |
| `POST` | `/mcp-rest/tools/call` | 执行某个工具 |

这些路由与 Claude Desktop 和 Cursor 所使用的 JSON-RPC MCP 传输端点（`/mcp` 或 `/{server_name}/mcp`）相互独立。完整的端点选型对照，请参阅 [MCP 配置参考](./mcp_config_reference)。

---

## 工具命名

LiteLLM 会注册来自多个 MCP 服务器的工具。请求中的工具名称遵循以下两种模式之一：

| 模式 | 适用场景 | 示例 |
|---------|-------------|---------|
| **带前缀** | 全局工具列表，或自包含的工具标识 | `places_api-getPlaces` |
| **不带前缀 + `server_id`** | 按服务器分别列出工具 | `server_id: places_api`、`name: getPlaces` |

**前缀格式**：`{server_prefix}{separator}{upstream_tool_name}`

- 默认**分隔符**为 `-`（连字符）。
- 可在代理上通过环境变量 `MCP_TOOL_PREFIX_SEPARATOR` 覆盖。
- 设置 `LITELLM_USE_SHORT_MCP_TOOL_PREFIX=true` 后，前缀改为 3 个字符的短 id，而非服务器名称（形态仍是 `{prefix}{separator}{tool}`）。

代理调用**上游** MCP 服务器时，使用的是不带前缀的工具名（如 `getPlaces`），而不是完整的前缀字符串。

---

## 1. 列出 MCP 服务器

```bash
curl -s http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_API_KEY" | jq .
```

后续调用可直接使用响应返回的 `server_id` 或 `server_name`。在 `/mcp-rest/*` 中，二者都可以充当 `server_id`。

---

## 2. 列出工具

### 所有服务器

```bash
curl -s http://localhost:4000/mcp-rest/tools/list \
  -H "Authorization: Bearer $LITELLM_API_KEY" | jq .
```

工具的 `name` 往往是**不带前缀**的（如 `getPlaces`），由 `mcp_info.server_name` 标明所属服务器。调用 `tools/call` 时任选其一：

- 使用**带前缀**的 `name`：`places_api-getPlaces`；或
- 使用**不带前缀**的 `name` 加 **`server_id`**：`getPlaces` 加 `places_api`。

### 单个服务器（推荐用于发现工具）

`server_id` 可接受 UUID、`server_name` 或别名。

```bash
curl -s "http://localhost:4000/mcp-rest/tools/list?server_id=places_api" \
  -H "Authorization: Bearer $LITELLM_API_KEY" | jq .
```

返回**不带前缀**的上游工具名（如 `getPlaces`、`ping`）。

---

## 3. 调用工具

### 请求体

| 字段 | 必填 | 类型 | 说明 |
|-------|----------|------|-------------|
| `server_id` | 是 | string | UUID、`server_name` 或别名 |
| `name` | 是 | string | 带前缀或不带前缀的工具名（见上文） |
| `arguments` | 推荐 | object | 工具参数；没有参数时传 `{}`。省略该字段时，代理会按 `{}` 处理。不要传 `null`。 |

可选的 JSON-RPC 字段（`jsonrpc`、`method`、`id`）会被 REST 处理器忽略；为了兼容现有客户端，保留它们也没有问题。

### 可用：带前缀名称与服务器 UUID

```bash
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "17a4490465f74d3696caf12b30220166",
    "name": "places_api-getPlaces",
    "arguments": {}
  }' | jq .
```

### 可用：不带前缀名称与服务器名称

```bash
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "places_api",
    "name": "getPlaces",
    "arguments": { "query": "coffee" }
  }' | jq .
```

### 可用：`x-litellm-api-key` 请求头

```bash
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "x-litellm-api-key: sk-<your-litellm-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "order_status_mcp",
    "name": "order_status_mcp-order_status",
    "arguments": { "orderId": "ord1234" }
  }' | jq .
```

---

## 以下写法**不**可用

### 缺少 `server_id`

```bash
# 400 missing_parameter
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "places_api-getPlaces", "arguments": {} }'
```

### `arguments: null`

```bash
# 500 — arguments must be a JSON object, not null
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "places_api",
    "name": "places_api-getPlaces",
    "arguments": null
  }'
```

**修复方法**：改用 `"arguments": {}`，或干脆省略该字段。

### 工具名分隔符用错（下划线代替连字符）

默认分隔符是 `-`，不是 `_`。

```bash
# 工具未找到，或被路由到错误的服务器
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "places_api",
    "name": "places_api_getPlaces",
    "arguments": {}
  }'
```

**修复方法**：改用 `places_api-getPlaces`，或把 `MCP_TOOL_PREFIX_SEPARATOR` 设置成与你命名约定一致的分隔符。

### 工具不属于 `server_id` 指定的服务器

```bash
# 403 tool_server_mismatch
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "order_status_mcp",
    "name": "places_api-getPlaces",
    "arguments": {}
  }'
```

响应：

```json
{
  "detail": {
    "error": "tool_server_mismatch",
    "message": "Tool 'places_api-getPlaces' belongs to MCP server 'places_api' but request specified server_id for 'order_status_mcp'."
  }
}
```

### `server_id` 无效或不存在

```bash
# 404 server_not_found (unknown name/uuid)
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "serverid1",
    "name": "some-tool",
    "arguments": {}
  }'
```

```bash
# 403 access_denied (server exists but key cannot access it)
```

### 客户示例中的占位符 ID

`"serverid1"`、`"serverid2"` 这类字符串并不是有效的 id，除非你确实创建过使用这些 id 的服务器。请运行 `GET /v1/mcp/server`，复制一个真实的 `server_id`，或改用 `server_name`。

---

## 快速参考

<Tabs>
<TabItem value="list" label="列出工具">

```bash
# 所有服务器
curl -s http://localhost:4000/mcp-rest/tools/list \
  -H "Authorization: Bearer $LITELLM_API_KEY"

# 单个服务器
curl -s "http://localhost:4000/mcp-rest/tools/list?server_id=MY_SERVER" \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

</TabItem>
<TabItem value="call" label="调用工具">

```bash
curl -s -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "MY_SERVER",
    "name": "MY_SERVER-tool_name",
    "arguments": {}
  }'
```

</TabItem>
</Tabs>

---

## 相关文档

- [MCP 使用指南](./mcp_usage.md)：Responses API、Cursor、OpenAI SDK（LLM 驱动的 MCP）
- [MCP 概览](./mcp.md)：网关配置与 JSON-RPC `/mcp` 路由
- [MCP OAuth](./mcp_oauth.md)：受 OAuth 保护的 MCP 服务器
- [MCP Zero Trust](./mcp_zero_trust.md)：为上游 MCP 服务器做 JWT 签名
- [MCP 故障排查](./mcp_troubleshoot.md)：连接与认证问题
