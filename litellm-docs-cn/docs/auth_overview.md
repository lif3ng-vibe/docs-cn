import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 网关认证参考

LiteLLM 对外提供两个网关入口（gateway surface），它们共享绝大多数认证与授权的基础机制，但在少数关键之处并不相同。本页是一份并排对照参考：哪个请求头负责什么、两个入口在哪些地方一致、哪些地方不一致。每一节都附有指向专门页面的链接，可查看完整细节。

| 入口 | 端点 | 专门文档 |
|---|---|---|
| **MCP 网关** | `/mcp`, `/{server}/mcp`, `/toolset/{name}/mcp`, `/sse`, `/v1/mcp/...`, `/mcp-rest/...` | [MCP 概览](./mcp) |
| **A2A Agent 网关** | `/a2a/{agent_id}`, `/a2a/{agent_id}/message/send`, `/v1/agents/...` | [A2A 概览](./a2a) |

---

## 1. 客户端 → LiteLLM（认证调用方）

两个入口都接受同一组 LiteLLM 虚拟密钥（virtual key）请求头和同一组身份标识请求头。唯一的不同之处在于：MCP **ASGI** 路由（即 `/mcp`、`/{name}/mcp`、`/toolset/{name}/mcp`、`/sse` 这些流式 MCP 端点）绕过了标准的 FastAPI 认证依赖项，既不解析各厂商特有的认证别名（`API-Key`、`x-api-key`、`x-goog-api-key`、`Ocp-Apim-Subscription-Key`），也不解析 `x-litellm-tags`。MCP **REST/管理**路由（`/v1/mcp/...`、`/mcp-rest/...`）以及**全部** A2A 路由则接受完整的请求头集合。

| 请求头 | 用途 | MCP ASGI | MCP REST + A2A |
|---|---|---|---|
| `x-litellm-api-key: Bearer sk-...` | 首选的 LiteLLM 虚拟密钥请求头。只要入站 `Authorization` 请求头可能携带其他令牌（OAuth 透传、OBO、A2A 按用户转发），就应使用它。 | ✓ | ✓ |
| `Authorization: Bearer sk-...` | 标准回退选项。查找前会先剥离 `Bearer ` 前缀。 | ✓ | ✓ |
| `API-Key`, `x-api-key`, `x-goog-api-key`, `Ocp-Apim-Subscription-Key` | 各厂商特有的别名（Azure、Anthropic、Google AI Studio、Azure APIM）。 | — | ✓ |
| `x-litellm-end-user-id` | 终端用户身份标识。在密钥之上叠加按终端用户的预算、MCP 访问交集与审计日志记录。`x-litellm-customer-id` 是可接受的别名。 | ✓ | ✓ |
| `x-litellm-trace-id` | 跨请求关联 ID。缺失时回退到 `x-litellm-session-id` 或任何匹配的 `x-<vendor>-session-id` 请求头。 | ✓ | ✓ |
| `x-litellm-session-id` | 会话分组。与 trace-id 走相同的解析路径，优先级更低。 | ✓ | ✓ |
| `x-litellm-tags` | 逗号分隔的标签，用于花费日志标记与基于标签的路由。请求体字段 `tags` 优先。 | —（MCP ASGI 上不解析） | ✓ |
| `x-litellm-mcp-debug: true` | 返回脱敏后的诊断响应头（`x-mcp-debug-*`）。参见 [MCP OAuth 调试](./mcp_oauth#oauth-调试)。 | ✓ | — |
| `x-mcp-servers` | 把请求限定到指定的 MCP 服务器（逗号分隔）。 | ✓ | — |

---

## 2. LiteLLM → 后端（网关向 Agent 或 MCP 服务器认证）

这是 MCP 与 A2A 差异最大的部分。MCP 为每个服务器注册项提供了一等公民的 `auth_type` 字段。**A2A 则完全没有 `auth_type` 字段**，出站认证模式是从 `litellm_params` 中已有的内容推断出来的。

### MCP：`auth_type` 枚举

MCP 服务器的出站 `Authorization` 请求头（或按请求计算的 SigV4 签名）由 `auth_type` 决定。完整对照表见 [MCP 概览：添加 HTTP MCP 服务器](./mcp#添加-http-mcp-服务器)。

| `auth_type` | 机制 | 专门文档 |
|---|---|---|
| `none` | 不添加认证请求头 | — |
| `api_key` / `bearer_token` / `basic` / `authorization` / `token` | 静态请求头，每次调用原样发送 | [MCP 概览](./mcp) |
| `oauth2` | PKCE（交互式）或 M2M `client_credentials`，由 `oauth2_flow` 区分。 | [MCP OAuth](./mcp_oauth) |
| `oauth2_token_exchange` | RFC 8693 On-Behalf-Of（OBO）：用调用方的 bearer 令牌换取限定范围的 MCP 令牌 | [MCP OBO 认证](./mcp_obo_auth) |
| `oauth2_id_jag` | 身份断言授权许可（Identity Assertion Authorization Grant）：两步交换，把用户的身份令牌（入站令牌或 SSO 登录时捕获的令牌）换成 MCP 访问令牌 | [MCP ID-JAG 认证](./mcp_id_jag) |
| `true_passthrough` | LiteLLM 不做准入校验，客户端自己的 `Authorization` 原样转发给上游 | [MCP OAuth 透传](./mcp_oauth_passthrough) |
| `oauth_delegate` | LiteLLM 先凭 `x-litellm-api-key` 对调用方做准入校验，再转发客户端放在 `Authorization` 中的另一个上游 bearer 令牌；准入密钥绝不外发 | [MCP OAuth 透传](./mcp_oauth_passthrough) |
| `aws_sigv4` | 使用 MCP 侧专用的凭证链按请求计算 SigV4 签名 | [MCP AWS SigV4](./mcp_aws_sigv4) |

### A2A：从 `litellm_params` 推断认证模式

Agent 上没有 `auth_type` 字段。提供商处理器会根据 `litellm_params` 的内容挑选认证机制：

| 模式 | 触发条件 | 发送给后端 |
|---|---|---|
| **Bearer / JWT** | 设置了 `litellm_params.api_key` | `Authorization: Bearer <api_key>` |
| **SigV4**（仅 AgentCore） | 未设置 `litellm_params.api_key` | 通过完整的 AWS 凭证链按请求计算 SigV4。参见 [Bedrock AgentCore 的 A2A 网关认证](./providers/bedrock_agentcore#a2a-gateway-authentication)。 |
| **提供商原生** | `litellm_params.custom_llm_provider` 匹配到非 Bedrock 提供商（Vertex AI Agent Engine、LangGraph、Azure AI Foundry、Pydantic AI） | 走该提供商正常的认证路径 |

JWT 与 SigV4 的双模式是 AgentCore 特有的。其他 A2A 提供商（Vertex、LangGraph、Azure Foundry）使用各自惯用的凭证约定。相关页面见 [提供商](./providers) 下的对应文档。

### 零信任附加层（仅 MCP）

如果 MCP 服务器需要**以密码学方式验证**请求确实经过了 LiteLLM，可以在其上叠加 [MCP JWT 签名器](./mcp_zero_trust)防护栏。它用短时效的 RS256 JWT 给每个出站工具调用签名，并发布一个 JWKS 端点供 MCP 服务器校验。这是一种防护栏（`guardrail: mcp_jwt_signer`、`mode: pre_mcp_call`），而不是 `auth_type`，并且可与任何 `auth_type` 组合使用。

---

## 3. 按用户透传请求头

两个入口都允许客户端在管理员不做任何预配置的情况下，把发给特定后端服务器/Agent 的凭证转发过去。这两套命名约定看起来对称，解析规则却不同，复制粘贴时要格外仔细。

| 入口 | 前缀 | 解析规则 | 匹配对象 | 示例 |
|---|---|---|---|---|
| **MCP** | `x-mcp-` | 格式：`x-mcp-{server_alias}-{header_name}` | 先匹配服务器的 `alias`，再匹配 `server_name`（不区分大小写） | `x-mcp-github-authorization: Bearer ghp_...` → 服务器 `github`，请求头 `Authorization` |
| **A2A** | `x-a2a-` | 格式：`x-a2a-{agent_name_or_id}-{header_name}`；与 Agent 的 UUID 和人类可读名称比对（两者都尝试） | Agent 的 UUID **和**人类可读名称（两者都尝试） | `x-a2a-my-agent-x-api-key: secret` → Agent `my-agent`，请求头 `x-api-key` |

两个入口还支持由管理员控制的替代机制，可与按用户透传叠加使用：

| 机制 | MCP | A2A | 说明 |
|---|---|---|---|
| `static_headers: {K: V}` | ✓ | ✓ | 始终发送。键冲突时**优先于按用户透传**。 |
| `extra_headers: [name, name, ...]` | ✓ | ✓ | 管理员配置的允许清单，列出可原样转发的客户端请求头名称。 |
| `x-<surface>-<id>-<header>` 约定 | ✓（`x-mcp-`） | ✓（`x-a2a-`） | 由客户端驱动，无需管理员配置。 |

完整机制见 [MCP 概览：转发自定义请求头](./mcp#向-mcp-服务器转发自定义请求头) 与 [A2A Agent 认证请求头](./a2a_agent_headers)。

---

## 4. 授权：RBAC 与访问组

两个入口都采用 `object_permission` 模型并以交集方式解析，但目前的解析深度不同：MCP 覆盖六个层级，A2A 只覆盖两个。详细的流程图和表格见各自专门页面：

- [MCP 权限层级](./mcp_control#权限层级)
- [A2A Agent 权限管理：工作原理](./a2a_agent_permissions#概述)

| 层级 | MCP 字段 | A2A 字段 |
|---|---|---|
| **密钥** | `object_permission.mcp_servers`, `object_permission.mcp_access_groups`, `object_permission.mcp_tool_permissions` | `object_permission.agents`, `object_permission.agent_access_groups` |
| **团队** | 同上 | 同上（继承优先：若密钥上没有配置列表，则继承团队的） |
| **终端用户** | 同上（通过 `x-litellm-end-user-id`） | — 目前不解析 |
| **Agent** | 同上（通过 `x-litellm-agent-id`） | — 不适用（Agent 本身就是目标） |
| **内部用户** | 同上（即请求所认证的那个真实用户）；与其余解析结果取交集，因此只会收紧权限 | — 目前不解析 |
| **组织** | 同上，作为**上限** | — 目前不解析 |

| 场景 | MCP | A2A |
|---|---|---|
| 按服务器 / 按 Agent 的允许清单 | `object_permission.mcp_servers` | `object_permission.agents` |
| 访问组（基于标签的授权） | `object_permission.mcp_access_groups` | `object_permission.agent_access_groups` |
| 按服务器的工具级允许清单 | `object_permission.mcp_tool_permissions: {server_id: [tool, ...]}` | 不适用（工具包含在 Agent 内部） |
| 服务器注册项上的允许清单（管理员静态配置） | MCP 服务器上的 `allowed_tools` / `disallowed_tools` | 不适用 |
| 参数级允许清单 | MCP 服务器上的 `allowed_params: {tool_name: [param, ...]}` | 不适用 |
| 拒绝行为 | `list_tools` 会过滤掉被隐藏的服务器；`call_tool` 返回错误 | `GET /v1/agents` 过滤；`POST /a2a/{agent_id}` 返回 HTTP **403** |

---

## 5. 追踪 ID 与身份传递

每个请求上的 `x-litellm-trace-id` 都会被**接受**，并贯穿两个入口的日志记录。另有几个 A2A 特有的配置项：

| 配置项 | 作用范围 | 行为 |
|---|---|---|
| `require_trace_id_on_calls_to_agent: true` | 按 Agent 生效，配置在 Agent 的 `litellm_params` 上 | 入站 `/a2a/{agent_id}` 调用若缺少 `x-litellm-trace-id`（或回退用的 `x-litellm-session-id`），将以 **HTTP 400** 拒绝。参见 [A2A 概览：追踪 ID 强制校验](./a2a#trace-id-强制校验可选按智能体)。 |
| `require_trace_id_on_calls_by_agent: true` | 按 Agent 生效，配置在 Agent 的 `litellm_params` 上 | 反向约束：当该 Agent **所持有的**密钥发起出站调用时，要求这些调用同样携带追踪 ID。 |

**子 Agent 身份传递**。当 LiteLLM 作为 A2A 调用的一部分向下游发起请求时，会转发 `X-LiteLLM-Trace-Id` 和 `X-LiteLLM-Agent-Id`，以保持追踪连续性与花费归属。原始虚拟密钥与终端用户身份**不会**自动转发。要显式传递身份，请使用 `extra_headers` 或 `x-a2a-{agent_name_or_id}-{header}` 约定。参见 [A2A 概览：子 Agent 身份传递](./a2a#子智能体身份传递)。

---

## 6. 网关路径上的防护栏

| 场景 | MCP | A2A |
|---|---|---|
| 调用前输入防护栏（Presidio、Bedrock、Lakera、Aporia 等） | `mode: pre_mcp_call` | 标准对话补全防护栏作用于 Agent 发起的底层 LLM 调用 |
| 调用中干预 | `mode: during_mcp_call` | — |
| 零信任 JWT 签名 | [`mcp_jwt_signer` 防护栏](./mcp_zero_trust) | —（目前不适用于 A2A） |
| 文档 | [MCP 防护栏](./mcp_guardrail)、[MCP 零信任](./mcp_zero_trust) | 标准[防护栏文档](/docs/proxy/guardrails/quick_start)通过 Agent 底层的模型调用生效 |

---

## 7. 速查表：各请求头的作用

以下内容可直接复制粘贴，涵盖两个入口的高频请求头：

```http
# Always (LiteLLM-side auth and identification)
x-litellm-api-key: Bearer sk-...
# or
Authorization: Bearer sk-...

x-litellm-end-user-id: user-42
x-litellm-trace-id: 8f4a-2b1c-d3e5-...

# MCP — server scoping / per-user passthrough
x-mcp-servers: github,zapier
x-mcp-github-authorization: Bearer ghp_<user-token>     # user passthrough to github_mcp
x-litellm-mcp-debug: true                                # diagnostic response headers

# A2A — per-user passthrough
x-a2a-my-agent-authorization: Bearer <user-token>        # caller's token to my-agent
x-a2a-my-agent-x-api-key: <user-key>                     # additional per-agent header
```

如需深入了解，可顺着上文各处的交叉链接进入对应专门页面。
