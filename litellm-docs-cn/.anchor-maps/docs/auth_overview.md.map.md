Gateway Auth Reference | 网关认证参考 | 网关认证参考
1. Client → LiteLLM (authenticating the caller) | 1. 客户端 → LiteLLM（认证调用方） | 1-客户端--litellm认证调用方
2. LiteLLM → Backend (authenticating the gateway to the agent or MCP server) | 2. LiteLLM → 后端（网关向 Agent 或 MCP 服务器认证） | 2-litellm--后端网关向-agent-或-mcp-服务器认证
MCP: `auth_type` enum | MCP：`auth_type` 枚举 | mcpauth_type-枚举
A2A: auth mode inferred from `litellm_params` | A2A：从 `litellm_params` 推断认证模式 | a2a从-litellm_params-推断认证模式
Zero-trust add-on (MCP only) | 零信任附加层（仅 MCP） | 零信任附加层仅-mcp
3. Per-user header passthrough | 3. 按用户透传请求头 | 3-按用户透传请求头
4. Authorization: RBAC and access groups | 4. 授权：RBAC 与访问组 | 4-授权rbac-与访问组
5. Trace IDs and identity propagation | 5. 追踪 ID 与身份传递 | 5-追踪-id-与身份传递
6. Guardrails on the gateway path | 6. 网关路径上的防护栏 | 6-网关路径上的防护栏
7. Cheatsheet: what header does what | 7. 速查表：各请求头的作用 | 7-速查表各请求头的作用
