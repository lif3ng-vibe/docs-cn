import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP 部署指南

如何将 LiteLLM 部署为集中式网关，统一承载 LLM、MCP（Model Context Protocol）服务器与智能体（agent）。

---

## 核心思路

LiteLLM 是一个统一控制平面，管理三类资源：

| 资源 | 注册方式 |
|----------|--------------|
| **LLM** | 配置中的 `model_list`，或通过 API 注册 |
| **MCP Server** | 配置中的 `mcp_servers`，或通过 UI 注册 |
| **Agent** | A2A（Agent-to-Agent）路由 |

三者共享同一套认证（LiteLLM API 密钥）、限流（rate limiting）与用量仪表板，不必另设独立注册表，即可获得一份统一资源目录。

---

## 部署拓扑

### 方案 A：单一网关（推荐）

由一个 LiteLLM 实例同时承担 LLM 路由、MCP 工具调用与 A2A 智能体调用。

```
Agents / AI clients
        │
        ▼
┌───────────────────────────────────┐
│         LiteLLM Gateway           │
│  /v1/chat/completions  (LLMs)     │
│  /mcp                  (tools)    │
│  /a2a                  (agents)   │
└───────┬───────┬──────────┬────────┘
        │       │          │
   OpenAI   MCP servers  Downstream
   Bedrock  (internal)    agents
   Azure    (public)
```

一个服务、一份配置、一套 API 密钥。借助[公网过滤器（public internet filter）](./mcp_public_internet.md)可以控制哪些 MCP 服务器对外部调用方（Claude Desktop、ChatGPT）可见，哪些仅限内部使用。

```yaml title="config.yaml" showLineNumbers
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  store_model_in_db: true
  mcp_internal_ip_ranges:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
    - "192.168.0.0/16"
    - "100.64.0.0/10"   # VPN/Tailscale range

model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

mcp_servers:
  internal_db:
    url: http://db-mcp.internal:8000/mcp
    transport: http
    available_on_public_internet: false  # internal callers only

  web_search:
    url: https://mcp.exa.ai/mcp
    transport: http
    available_on_public_internet: true   # visible to ChatGPT / Claude Desktop (the default)
```

服务器名称中不能含连字符，启动时代理会直接拒绝 `internal-db` 这类 `mcp_servers` 键名，请改用下划线。

---

### 方案 B：LLM 网关与 MCP 网关分离

拆成两个 LiteLLM 部署：一个负责 LLM 路由（不对互联网暴露），一个负责 MCP 服务（可选对互联网开放）。

```
Internal AI clients             External AI clients
        │                       (ChatGPT, Claude Desktop)
        │                               │
        ▼                               ▼
┌────────────────────┐     ┌────────────────────────┐
│  LLM Gateway       │     │  MCP Gateway           │
│  (no public port)  │     │  (port 443 / public)   │
│  /v1/chat/...      │     │  /mcp                  │
└────────┬───────────┘     └──────────┬─────────────┘
         │                            │
    LLM providers              MCP servers
    (OpenAI, Bedrock, …)       (internal + public)
```

LLM API 密钥始终保留在防火墙之内，即使 MCP 网关被攻破也不会暴露。当需要对外提供 MCP 访问、又要保证 LLM 凭据完全私有时，选择这种方案。

---

## 统一资源目录

LiteLLM 通过标准端点（endpoint）暴露所有资源类型：

| 端点 | 返回内容 |
|----------|---------|
| `GET /v1/models` | 全部已注册的 LLM |
| `GET /v1/mcp/server` | 全部 MCP 服务器 |
| `GET /mcp` | 全部 MCP 工具（跨所有服务器） |
| `GET /a2a/{agent_id}/.well-known/agent-card.json` | A2A 智能体卡片 |

**MCP 注册表**（可选开启）：为 Claude Desktop / Cursor 暴露一个服务发现端点：

```yaml title="config.yaml"
general_settings:
  enable_mcp_registry: true
```

```json title="Claude Desktop 配置"
{
  "mcpServers": {
    "litellm": {
      "url": "https://your-litellm.example.com/mcp",
      "headers": { "Authorization": "Bearer sk-..." }
    }
  }
}
```

---

## 安全注意事项

### 开放端口的问题

如果你把 LiteLLM 的端口暴露到互联网上（供 Claude Desktop / ChatGPT 使用），`/v1/chat/completions` 也会随之可从外部访问。LLM 凭据仍有密钥认证保护，但你需要清楚这一点并慎重对待。

**缓解措施**：
1. **分开部署**（方案 B）：LLM 网关永远不会开放公网端口
2. **防火墙**：在网络层屏蔽来自公网 IP 的 `/v1/chat/completions` 请求
3. **短时效的受限密钥**：缩小密钥泄露后的影响范围

### MCP 服务器可访问公网

注册外部 MCP URL（例如 `https://mcp.exa.ai/mcp`）后，LiteLLM 每次工具调用都会向它发出出站请求。请确认网络策略允许这种行为，且安全团队接受数据流出网络边界。

如果是物理隔离（air-gapped）网络：只注册边界内的 MCP 服务器，并为每一台都设置 `available_on_public_internet: false`。默认值是 `true`，也就是说，只要不显式设为 `false`，服务器对外部调用方就是可见的。

### 访问控制

默认情况下，所有已认证的调用方都可以调用全部 MCP 工具。可用以下手段加以限制：

| 控制手段 | 详见 |
|---------|-------|
| 按密钥控制工具访问 | [密钥级 MCP 权限](./mcp_control.md) |
| 按团队控制工具访问 | [团队级 MCP 权限](./mcp_control.md) |
| 对外部调用方隐藏内部服务器 | [available_on_public_internet](./mcp_public_internet.md) |
| 验证请求确实经过 LiteLLM | [MCP 零信任（JWT）](./mcp_zero_trust.md) |
| 拦截响应中的敏感数据 | [MCP 防护栏（guardrails）](./mcp_guardrail.md) |

---

## 相关文档

- [MCP 概览](./mcp.md)
- [公网过滤器](./mcp_public_internet.md)
- [MCP 访问控制](./mcp_control.md)
- [MCP 零信任](./mcp_zero_trust.md)
- [MCP 防护栏](./mcp_guardrail.md)
