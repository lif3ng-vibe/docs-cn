# MCP OBO 认证

OAuth 2.0 的 On-Behalf-Of（OBO）认证让 LiteLLM 把用户请求中携带的 Bearer 令牌（bearer token）交换为仅对特定 MCP 服务器有效的限定作用域令牌（scoped token）。

以下场景适合使用 OBO：

- MCP 服务器应当收到专门为它签发的令牌。
- 你的身份提供商（identity provider）支持 [RFC 8693 OAuth 2.0 令牌交换](https://datatracker.ietf.org/doc/html/rfc8693)，或者就是 LiteLLM 原生支持的 Microsoft Entra ID（见下文 [Microsoft Entra ID](#microsoft-entra-idazure-ad)）。
- 你不希望用户的原始令牌被直接转发给 MCP 服务器。

## 工作原理

```mermaid
flowchart TD
    A[User or agent calls LiteLLM with a bearer token] --> B[LiteLLM identifies the target MCP server]
    B --> C{MCP server auth_type is oauth2_token_exchange?}
    C -- No --> D[Use the server's configured auth flow]
    C -- Yes --> E[LiteLLM extracts the caller bearer token as the subject token]
    E --> F[LiteLLM POSTs an RFC 8693 token exchange request to the IdP]
    F --> G[IdP validates the subject token, audience, client, and scopes]
    G --> H[IdP returns a scoped access token for the MCP server]
    H --> I[LiteLLM caches the scoped token per subject token and MCP server]
    I --> J[LiteLLM calls the MCP server with the scoped bearer token]
    J --> K[MCP server executes the tool and returns the result]
```

简要流程如下：

1. 客户端携带 Bearer 令牌向 LiteLLM 发起请求。
2. LiteLLM 把这个 Bearer 令牌当作 RFC 8693 的 `subject_token`。
3. LiteLLM 在身份提供商的令牌交换端点完成交换。
4. LiteLLM 只把交换所得的限定作用域令牌转发给 MCP 服务器。
5. LiteLLM 会缓存交换所得的令牌直到其过期，因此重复调用不必再跑一趟身份提供商。

## 为 MCP 服务器配置 OBO

在 MCP 服务器上设置 `auth_type: oauth2_token_exchange`。

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  internal_tools:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: oauth2_token_exchange

    # OAuth 2.0 Token Exchange endpoint on your identity provider
    token_exchange_endpoint: "https://idp.example.com/oauth2/token"

    # Token exchange client registered with your identity provider
    client_id: "<idp-client-id>"
    client_secret: "<idp-client-secret>"

    # Optional but recommended: restrict the exchanged token to this MCP server
    audience: "api://internal-tools-mcp"
    scopes:
      - "mcp.tools.read"
      - "mcp.tools.execute"

    # Optional. Defaults to access_token.
    subject_token_type: "urn:ietf:params:oauth:token-type:access_token"
```

### 配置字段

| 字段 | 是否必填 | 说明 |
|-------|----------|-------------|
| `auth_type` | 必填 | 必须为 `oauth2_token_exchange`。 |
| `token_exchange_endpoint` | 必填 | 身份提供商上接受 RFC 8693 令牌交换请求的端点。 |
| `client_id` | 必填 | LiteLLM 调用令牌交换端点时使用的 OAuth 客户端 ID。 |
| `client_secret` | 必填 | LiteLLM 调用令牌交换端点时使用的 OAuth 客户端密钥。 |
| `audience` | 建议配置 | MCP 服务器的资源标识符。LiteLLM 会把它作为令牌交换的 `audience` 参数发送。 |
| `scopes` | 可选 | LiteLLM 为交换所得令牌申请的权限范围。LiteLLM 会把列表拼接成 OAuth 的 `scope` 参数。 |
| `subject_token_type` | 可选 | RFC 8693 的主体令牌类型。默认为 `urn:ietf:params:oauth:token-type:access_token`。 |
| `upstream_token_header` | 可选 | 指定由哪个上游请求头携带交换所得令牌，默认为 `Authorization`。参见[在其他请求头中发送交换令牌](#在其他请求头中发送交换令牌)。 |
| `token_exchange_profile` | 可选 | 令牌交换采用的报文格式。`rfc8693`（默认）使用标准的令牌交换授权；`entra_obo` 使用 Microsoft Entra ID 的 On-Behalf-Of 流程。参见 [Microsoft Entra ID](#microsoft-entra-idazure-ad)。 |

### 在其他请求头中发送交换令牌

默认情况下，交换所得的令牌以 `Authorization: Bearer <token>` 的形式发出。当 MCP 服务器位于某个 API 网关之后、网关从一个私有请求头读取自己的凭据，而网关后面的服务器仍期望在 `Authorization` 上收到自己的 Bearer 令牌时，两份凭据就得出现在同一个请求里。

把 `upstream_token_header` 设置为交换令牌应使用的请求头名称。`static_headers` 里的内容不受影响，因此共享凭据仍会送达网关后面的服务器。

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  my_mcp_server:
    url: "https://gateway.example.com/mcp"
    auth_type: oauth2_token_exchange
    token_exchange_endpoint: "https://idp.example.com/token"
    client_id: os.environ/MCP_CLIENT_ID
    client_secret: os.environ/MCP_CLIENT_SECRET
    audience: "api://esb"
    upstream_token_header: "esb-oauth"
    static_headers:
      Authorization: "Bearer os.environ/UPSTREAM_MCP_TOKEN"
```

这样一来，每个上游请求都会同时带上两者，且交换所得的令牌只对发起调用的用户有效：

```
esb-oauth: Bearer <token exchanged for this user>
Authorization: Bearer <the shared token you configured>
```

交换所得的令牌仍然按用户缓存，因此令牌寿命短并不意味着每次请求都要交换一次。不设置 `upstream_token_header` 则保持默认行为。

如果上游返回的重定向跨越了源（origin），这个自定义请求头会被丢弃而不是继续转发，与 HTTP 客户端丢弃 `Authorization` 的做法一致。确实需要跨源重定向的上游，在第二跳上就看不到这份凭据了。

## 令牌交换请求

对每一对未命中缓存的主体令牌（subject token）与 MCP 服务器，LiteLLM 都会向 `token_exchange_endpoint` 发送如下表单编码请求：

```http
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&subject_token=<caller-bearer-token>
&subject_token_type=urn:ietf:params:oauth:token-type:access_token
&client_id=<idp-client-id>
&client_secret=<idp-client-secret>
&audience=api://internal-tools-mcp
&scope=mcp.tools.read mcp.tools.execute
```

身份提供商应返回一个访问令牌（access token）：

```json
{
  "access_token": "scoped-token-for-mcp-server",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

随后 LiteLLM 用它来调用 MCP 服务器：

```http
Authorization: Bearer scoped-token-for-mcp-server
```

## Microsoft Entra ID（Azure AD）

Microsoft Entra ID 并未实现上文提到的 RFC 8693 令牌交换授权。它的 On-Behalf-Of 流程改用 RFC 7523 的 `jwt-bearer` 授权：调用方的令牌放在 `assertion` 字段而非 `subject_token` 中，没有 `audience` 参数，而且靠微软私有的 `requested_token_use=on_behalf_of` 扩展，才把这个授权从普通的 jwt-bearer 交换变成一次委托。LiteLLM 把 Entra 当作内置的一等配置档来处理，因此对接 Entra 只是改一处配置，不需要另做一套集成：设置 `token_exchange_profile: entra_obo`，LiteLLM 就会构造 jwt-bearer 表单，而不是 RFC 8693 表单。

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  internal_tools:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: oauth2_token_exchange
    token_exchange_profile: entra_obo

    # Your Entra tenant's v2.0 token endpoint
    token_exchange_endpoint: "https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token"

    # App registration LiteLLM uses to call the token endpoint. The caller's
    # token must have been issued with this client_id as its `aud`.
    client_id: "<entra-app-client-id>"
    client_secret: "<entra-app-client-secret>"

    # Entra has no audience parameter, so the target resource goes in scope
    # as <app-id-uri>/.default
    scopes:
      - "api://internal-tools-mcp/.default"
```

使用 `entra_obo` 时，`audience` 和 `subject_token_type` 都不会被用到：Entra 没有 audience 参数（目标资源改放在 `scope` 中），jwt-bearer 授权也不检查主体令牌类型。

对每一对未命中缓存的调用方令牌与 MCP 服务器，LiteLLM 都会发送：

```http
POST /<tenant-id>/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<caller-bearer-token>
&scope=api://internal-tools-mcp/.default
&requested_token_use=on_behalf_of
&client_id=<entra-app-client-id>
&client_secret=<entra-app-client-secret>
```

Entra 返回的访问令牌响应结构与上文展示的相同；无论使用哪个配置档，LiteLLM 对交换所得令牌的缓存与转发方式都一样。

:::note
调用方的令牌必须是签发给 LiteLLM 应用注册（app registration）的，不能是其他 Entra 应用的。如果你的调用框架对接的是另一个应用注册，先让它为本应用的 scope 申请一枚令牌，再把这枚令牌发给 LiteLLM。
:::

## 调用 OBO MCP 服务器

入站请求必须带上用户的 Bearer 令牌，LiteLLM 才有 `subject_token` 可供交换。

直接调用 MCP 时，把 LiteLLM 密钥放在 `x-litellm-api-key` 中，把 `Authorization` 留给用户令牌：

```bash title="Direct MCP call" showLineNumbers
curl -X POST "https://litellm.example.com/internal_tools/mcp" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer <litellm-api-key>" \
  -H "Authorization: Bearer <user-token>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

使用 Responses API 时，在 MCP 工具的请求头中把 LiteLLM 密钥与用户令牌分开传递：

```bash title="Responses API with MCP OBO" showLineNumbers
curl -X POST "https://litellm.example.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <litellm-api-key>" \
  -d '{
    "model": "{{openai_large}}",
    "input": "List the available internal tools",
    "tools": [
      {
        "type": "mcp",
        "server_label": "internal_tools",
        "server_url": "https://litellm.example.com/internal_tools/mcp",
        "require_approval": "never",
        "headers": {
          "x-litellm-api-key": "Bearer <litellm-api-key>",
          "Authorization": "Bearer <user-token>"
        }
      }
    ]
  }'
```

:::tip
如果 MCP 客户端只能发送一个 `Authorization` 请求头，就把 LiteLLM 密钥放进 `x-litellm-api-key`，把 `Authorization` 留给用户令牌。LiteLLM 需要用户令牌来充当 OBO 的 `subject_token`。
:::

## 缓存行为

LiteLLM 按以下两个维度缓存交换所得的令牌：

- 主体令牌
- MCP 服务器 ID

也就是说，两个不同的用户会各自拿到独立的令牌；同一用户反复调用同一个 MCP 服务器时，会复用缓存中的令牌直到其过期。

缓存 TTL 取 `expires_in` 减去 LiteLLM 的 OAuth 过期缓冲。如果 `expires_in` 缺失或无效，LiteLLM 会使用默认的 OAuth 令牌缓存 TTL。

## 缺少主体令牌的请求

发往 `oauth2_token_exchange` 服务器的请求若未携带用户 Bearer 令牌，LiteLLM 会以 `401 Unauthorized` 和 `WWW-Authenticate: Bearer resource_metadata="/.well-known/oauth-protected-resource/mcp/<server_name>", error="invalid_token", error_description="Missing or invalid subject token; authenticate with the IdP and retry"` 拒绝该请求。不存在回退到 OAuth `client_credentials` 的路径，且没有交换所得令牌的请求绝不会转发给 MCP 服务器。

如果还需要以机器对机器（machine-to-machine）的方式访问同一个 MCP 服务器，请另行注册一个服务器条目，配置 `auth_type: oauth2` 以及 `client_id`、`client_secret` 和 `token_url`，并在该条目上设置 `oauth2_flow: client_credentials`；没有显式指定 `oauth2_flow` 时，代理会拒绝启动 `oauth2` 服务器。

## 故障排查

| 症状 | 排查方法 |
|---------|-------|
| MCP 服务器收到的是 LiteLLM 密钥 | 把 LiteLLM 密钥移到 `x-litellm-api-key`，把 `Authorization` 留给用户令牌。 |
| 令牌交换端点返回 400 | 确认 `audience`、`scopes`、`client_id` 和 `subject_token_type` 与身份提供商的配置一致。 |
| MCP 服务器没有收到 `Authorization` 请求头 | 确认 MCP 服务器已配置 `auth_type: oauth2_token_exchange`，且入站请求带有用户 Bearer 令牌。 |
| 每个请求都在调用身份提供商 | 确认身份提供商返回了 `expires_in`，且复用的是同一用户令牌和同一 MCP 服务器。 |
