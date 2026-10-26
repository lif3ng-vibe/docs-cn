# MCP 按用户与按密钥的上游凭据

只需在 LiteLLM 中注册一次 MCP（Model Context Protocol）服务器，之后用户和服务账号（service account）就能用各自的上游凭据来调用它。若凭据由 LiteLLM 存储，请为每个服务账号分配一个独立的机器用户（machine user），并把它的虚拟密钥（virtual key）挂到该用户名下

已存储的 BYOK（bring your own key，自带密钥）密钥、按用户环境变量（per-user env vars）和按用户 OAuth 令牌，都归属于 `(user_id, server_id)`，而不是某一把具体的虚拟密钥。**同一个 `user_id` 下的两把密钥会共用该服务器存储的那份凭据**。当服务账号需要各自独立的上游身份时，请使用不同的机器用户。系统原生不支持按密钥或按团队覆盖已存储的凭据

## 为服务账号存储凭据

先注册共享的 MCP 服务器。下例假设已有一个别名为 `github` 的 [BYOK 服务器](#byok-服务器按用户的-api-密钥)。创建一个机器用户，为它创建可访问该服务器的虚拟密钥，再用新生成的密钥存储上游凭据

```bash
curl -X POST "http://localhost:4000/user/new" \
  -H "Authorization: Bearer sk-master" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "svc-ci-bot", "user_role": "internal_user", "auto_create_key": false}'

curl -X POST "http://localhost:4000/key/generate" \
  -H "Authorization: Bearer sk-master" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "svc-ci-bot", "key_alias": "ci-bot", "object_permission": {"mcp_servers": ["github"]}}'

curl -X POST "http://localhost:4000/v1/mcp/server/{server_id}/user-credential" \
  -H "Authorization: Bearer sk-ci-bot-key" \
  -H "Content-Type: application/json" \
  -d '{"credential": "ghp_ci_bot_token"}'
```

把 `{server_id}` 替换为注册 MCP 服务器时返回的 ID，把 `sk-ci-bot-key` 替换为 `/key/generate` 返回的密钥。之后用这把密钥发起的工具调用，都会使用该机器用户已存储的上游凭据

若要使用[按用户的环境变量](#按用户的环境变量)或 [OAuth 令牌](#按用户的-oauth)，请用同一把机器用户密钥调用对应的凭据端点。当 `oauth_identity_binding.mode` 为 `enforce` 时，无法直接预置 OAuth 令牌，此时请改走网关的 OAuth 授权流程

**请用服务账号自己的密钥来写入凭据**。这些写入端点始终使用调用者的 `user_id`，管理员密钥无法指定另一个用户作为写入目标。管理员可以列出 BYOK 凭据的归属用户，并吊销其他用户的 BYOK 或 OAuth 凭据

没有 `user_id` 的密钥无法使用这些凭据存储端点，调用会返回 `400 User ID not found in token`。需要已存储 BYOK 凭据或交互式 OAuth 凭据的调用会以 `401` 失败；缺少必需的按用户环境变量会让工具调用以 `412` 失败。如果服务器的认证模式允许，客户端自带凭据也是一种替代方案，但这类凭据不会存储在 LiteLLM 中

## 各方式速览

| 方式 | 凭据由谁提供 | 存储在哪里 | 归属键 | 无 `user_id` 的密钥是否可用 |
|---|---|---|---|---|
| [每次请求的请求头](#每次请求的请求头覆盖) | 客户端，随每次请求提供 | 不存储在 LiteLLM 的任何地方 | 不适用 | 可以，仅限支持的认证模式 |
| [BYOK 服务器](#byok-服务器按用户的-api-密钥)（`is_byok`） | 每个用户一次 | LiteLLM 数据库，加密存储 | `(user_id, server_id)` | 否 |
| [按用户的环境变量](#按用户的环境变量)（`env_vars` 配合 `scope: user`） | 每个用户一次 | LiteLLM 数据库，加密存储 | `(user_id, server_id)` | 否 |
| [按用户的 OAuth](#按用户的-oauth)（`auth_type: oauth2`，授权码模式） | 每个用户经 OAuth 流程提供 | LiteLLM 数据库，加密存储 | `(user_id, server_id)` | 否 |
| [委托式 DCR 桥接](#dcr-桥接客户端持有的-oauth-凭据)（`oauth_delegate`，`dcr_bridge: true`） | 客户端经 OAuth 提供 | 客户端，以密封令牌形式持有 | 浏览器用户或被准入的密钥哈希 | 可以，仅限密钥绑定的铸造；浏览器登录则改为绑定用户 |

请根据服务器的认证模式选择凭据来源。每次请求的请求头并不能一律覆盖已存储的凭据：交互式 OAuth、OBO 与 ID-JAG 仍按各自配置解析凭据。即使客户端发送了认证头，必需的按用户环境变量也仍然要提前填好

服务器级设置参见 [MCP 非 OAuth 认证](./mcp_authentication.md)与 [MCP OAuth](./mcp_oauth.md)。

## 每次请求的请求头覆盖

对于静态凭据服务器和 BYOK 服务器，调用方可以在每次请求中用 `x-mcp-{server_alias}-{header_name}` 自带上游凭据。例如 `x-mcp-github-authorization: Bearer ghp_xxx` 会为 `github` 服务器提供 `Authorization` 请求头。发送 `Authorization` 时要带上 scheme；其他类型的凭据则使用上游要求的请求头名称，例如 `x-api-key`

在支持的认证模式下，没有 `user_id` 也能这样用，但凭据始终留在客户端手里。它不会替换 `oauth2` 授权码服务器上已存储的令牌，也无法绕过 OBO/ID-JAG 的令牌交换；缺少必需的按用户环境变量时，它同样无济于事

命名约定参见 [请求头路由](./auth_overview.md#3-按用户透传请求头)，客户端示例参见 [MCP 客户端认证](./mcp.md)。`true_passthrough` 与 `oauth_delegate` 的准入和上游令牌处理，遵循 [MCP OAuth 透传](./mcp_oauth_passthrough.md)。

## BYOK 服务器（按用户的 API 密钥）

BYOK 服务器没有共享的上游凭据。每个用户各自存储一次自己的 API 密钥，LiteLLM 会在该用户的工具调用中注入它

BYOK 是服务器记录上的一个标志位，在通过管理界面（Admin UI）或 [REST API](./mcp_rest_api.md) 创建或更新服务器时设置。它不会从 `config.yaml` 读取

```bash
curl -X POST "http://localhost:4000/v1/mcp/server" \
  -H "Authorization: Bearer sk-master" \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "github",
    "alias": "github",
    "url": "https://api.githubcopilot.com/mcp/",
    "transport": "http",
    "auth_type": "bearer_token",
    "is_byok": true
  }'
```

然后每个用户各自存储密钥。该端点用调用者的 LiteLLM 密钥完成认证，并把凭据存到这把密钥所属的 `user_id` 名下

```bash
curl -X POST "http://localhost:4000/v1/mcp/server/{server_id}/user-credential" \
  -H "Authorization: Bearer sk-user-key" \
  -H "Content-Type: application/json" \
  -d '{"credential": "ghp_xxx"}'
```

既没有已存储凭据、也没有可用的按请求覆盖时，工具调用会以 `401` 失败，返回指明服务器名称的 `byok_auth_required` 错误体，并附带 `WWW-Authenticate` 响应头，把支持 OAuth 的 MCP 客户端引向 LiteLLM 内置的 BYOK 授权页面（`/v1/mcp/oauth/authorize`），用户在那里粘贴自己的密钥。不遵循 `WWW-Authenticate` 的客户端可以直接调用上面的端点，或使用管理界面

`DELETE /v1/mcp/server/{server_id}/user-credential` 删除调用者自己的密钥。代理管理员可以传 `?user_id=` 来吊销其他用户的密钥；`GET /v1/mcp/server/{server_id}/user-credentials` 会列出哪些用户存有凭据（不会返回任何密钥值）

## 按用户的环境变量

[Server Variables 概览](./mcp.md#服务器变量)介绍了共享变量与按用户变量。当服务器需要把凭据放进自定义请求头，或需要多个值时，就用按用户环境变量。先在服务器上声明变量，把每个用户必须自行提供的那些标成 `scope: user`，再在 `static_headers` 里用 `${NAME}` 引用

```json
{
  "server_name": "internal-tools",
  "url": "https://tools.internal/mcp",
  "transport": "http",
  "auth_type": "none",
  "static_headers": {
    "X-Tenant-Token": "${TENANT_TOKEN}",
    "X-Region": "${REGION}"
  },
  "env_vars": [
    {"name": "TENANT_TOKEN", "scope": "user", "description": "Your tenant token"},
    {"name": "REGION", "scope": "global", "value": "us-east-1"}
  ]
}
```

用户通过 `POST /v1/mcp/server/{server_id}/user-env-vars` 并携带 `{"values": {"TENANT_TOKEN": "..."}}` 这样的请求体来填写自己的值；用 `GET /v1/mcp/server/{server_id}/user-env-vars` 查看还缺哪些（值只写不读，永远不会回显）；再用同一路径上的 `DELETE` 清除。工具调用引用了某个 `scope: user` 变量但没有已存值也没有全局兜底值时，会被 `412` 拒绝，并返回一个 `setup_url`，用户打开即可补填

## 按用户的 OAuth

上游支持 OAuth 时，注册服务器请设置 `auth_type: oauth2` 并采用授权码许可。LiteLLM 会跑完浏览器授权流程，把每个用户的访问令牌和刷新令牌加密存储在 `(user_id, server_id)` 之下，负责刷新，并在该用户的调用中注入。配置步骤见 [MCP OAuth](./mcp_oauth.md)。

在 LiteLLM 之外拿到的令牌，可以用 `POST /v1/mcp/server/{server_id}/oauth-user-credential` 并携带 `{"access_token": "...", "refresh_token": "...", "expires_in": 3600}` 的请求体预先写入。当服务器的 `oauth_identity_binding.mode` 设为 `enforce` 时，该端点会被禁用，因为它无法校验令牌属于谁。`GET .../oauth-user-credential/status` 报告调用者是否已有令牌及其过期时间；`GET /v1/mcp/user-credentials` 列出调用者连接过的所有服务器；`DELETE .../oauth-user-credential` 吊销令牌（管理员可以传 `?user_id=`）

## DCR 桥接：客户端持有的 OAuth 凭据

对 `true_passthrough` 与 `oauth_delegate` 服务器，设置 `dcr_bridge: true` 后，OAuth 注册和登录由网关托管，产生的凭据由客户端持有。在 `oauth_delegate` 上，密封凭据会把上游令牌绑定到交互式登录的浏览器用户；若令牌请求改用虚拟密钥认证，则绑定到被准入的密钥哈希

这种纯 OAuth 的客户端接入方式，要求 LiteLLM 浏览器登录可用，且客户端支持交互。用管理员身份登录，绑定的是该浏览器用户，而不是某个独立的服务账号密钥。经密钥认证的铸造路径接受没有 `user_id` 的有效密钥，但仍需要与上游完成 OAuth 授权码交换，且凭据保存在客户端一侧。它不会为这把密钥提供网关存储的凭据覆盖

配置方法和支持的客户端见 [网关托管登录（DCR 桥接）](./mcp_oauth_passthrough.md#gateway-hosted-sign-in-dcr-bridge)。若要凭据由客户端持有的全脚本化委托，请使用文档中的双请求头 `oauth_delegate` 流程并关闭 `dcr_bridge`

## 不支持的场景

系统没有按密钥或按团队的已存储请求头覆盖对象。密钥和团队通过访问列表（`object_permission.mcp_servers`）控制可以调用哪些 MCP 服务器，上游凭据则来自上文几种机制之一。需要网关存储凭据时，请为每个服务账号使用一个独立的机器用户；没有用户时，就把凭据留在客户端，并采用上游支持的转发模式。DCR 桥接则受上文所述交互式配置要求的约束
