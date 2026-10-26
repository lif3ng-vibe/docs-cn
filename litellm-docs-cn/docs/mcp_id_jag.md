# MCP ID-JAG 认证（Okta）

ID-JAG（Identity Assertion Authorization Grant，身份断言授权，见 [draft-ietf-oauth-identity-assertion-authz-grant](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/)）让 LiteLLM 能够为一个 MCP 服务器获取访问令牌（access token），适用于该服务器的授权服务器（authorization server）与用户身份提供商（identity provider）不同的场景。Okta 以 [AI agent token exchange](https://developer.okta.com/docs/guides/ai-agent-token-exchange/-/main/) 的形式提供了这套机制。

在以下场景使用 ID-JAG：

- MCP 服务器信任的资源授权服务器（例如 Okta 自定义授权服务器）独立于认证用户的组织授权服务器。
- 你希望由身份提供商处的管理员策略，而非交互式的授权确认页，来决定网关能否代表用户调用 MCP。这正是它能用于无界面（headless）agent 的原因。
- 你希望网关获得的访问权限限定在具体用户范围内、可审计，并且可以从身份提供商侧吊销。

ID-JAG 与 [OBO 令牌交换](./mcp_obo_auth)不同：OBO 是面向单个授权服务器的一次 RFC 8693 交换，而 ID-JAG 是跨越两个授权服务器的两段流程。

## 工作原理

```mermaid
flowchart TD
    A[User signs in and the client gets an Okta id_token] --> B[Client calls LiteLLM with the id_token]
    B --> C{MCP server auth_type is oauth2_id_jag?}
    C -- No --> D[Use the server's configured auth flow]
    C -- Yes --> E[Leg 1: LiteLLM POSTs an RFC 8693 token exchange to the org authorization server, requested_token_type=id-jag]
    E --> F[Org authorization server applies admin policy and returns a signed ID-JAG assertion]
    F --> G[Leg 2: LiteLLM POSTs an RFC 7523 jwt-bearer grant with the ID-JAG to the resource authorization server]
    G --> H[Resource authorization server validates the ID-JAG and returns an access token]
    H --> I[LiteLLM caches the access token per subject token and MCP server]
    I --> J[LiteLLM calls the MCP server with the access token]
    J --> K[MCP server executes the tool and returns the result]
```

简要来说：

1. 客户端携带用户的 `id_token` 向 LiteLLM 发起请求。
2. LiteLLM 把这个 `id_token` 作为 RFC 8693 的 `subject_token`，到组织授权服务器（`token_exchange_endpoint`）交换出 ID-JAG 断言。
3. LiteLLM 通过 RFC 7523 的 `jwt-bearer` 授权类型把 ID-JAG 提交给资源授权服务器（`id_jag_resource_token_endpoint`），换取 MCP 访问令牌。
4. LiteLLM 只把访问令牌转发给 MCP 服务器。
5. LiteLLM 会缓存访问令牌直至其过期，因此同一用户的重复调用能省去与两个授权服务器的全部往返。

LiteLLM 使用 private-key-JWT 形式的 `client_assertion`（RFC 7523）向两个授权服务器认证自身，这正是 Okta 的要求。未配置私钥时，则回退使用 `client_secret`。

## 配置 Okta

ID-JAG 需要 **Okta for AI Agents** 订阅。大致步骤如下：

1. 把 LiteLLM 网关注册为一个 OAuth 应用（即 agent）。客户端认证方式配置为 `private_key_jwt`，并将公钥以 JWKS 形式上传，对应的私钥保留给 LiteLLM 使用。记下 `kid`。
2. 确认组织授权服务器的令牌端点 `https://<your-org>.okta.com/oauth2/v1/token`，它就是第一段的 `token_exchange_endpoint`。
3. 搭建 MCP 信任的资源（自定义）授权服务器，其令牌端点为 `https://<your-org>.okta.com/oauth2/<custom-as-id>/v1/token`，也就是第二段的 `id_jag_resource_token_endpoint`。它的 issuer 标识符就是第一段使用的 `audience`。
4. 配置跨应用访问策略（cross-app access policy），授权网关应用为该资源获取 ID-JAG，包括它可以请求的 scopes。

逐步操作指引见 Okta 的 [AI agent token exchange guide](https://developer.okta.com/docs/guides/ai-agent-token-exchange/-/main/)。

## 为 ID-JAG 配置 MCP 服务器

在 MCP 服务器上设置 `auth_type: oauth2_id_jag`。

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  internal_tools:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: oauth2_id_jag

    # Org authorization server token endpoint (leg 1: token exchange -> ID-JAG)
    token_exchange_endpoint: "https://your-org.okta.com/oauth2/v1/token"

    # Resource (custom) authorization server token endpoint (leg 2: jwt-bearer -> access token)
    id_jag_resource_token_endpoint: "https://your-org.okta.com/oauth2/<custom-as-id>/v1/token"

    # Gateway app registered with Okta
    client_id: "<okta-agent-client-id>"

    # Private-key-JWT client authentication (RFC 7523). Okta requires this.
    client_private_key: |
      -----BEGIN PRIVATE KEY-----
      ...
      -----END PRIVATE KEY-----
    client_private_key_id: "<jwks-kid>"
    client_assertion_signing_alg: "RS256"

    # Resource authorization server identifier; sent as the leg-1 audience
    audience: "https://your-org.okta.com/oauth2/<custom-as-id>"

    # Optional RFC 8707 resource indicator for leg 1
    id_jag_resource: "https://mcp.example.com/"

    # Optional scopes requested for the access token
    scopes:
      - "mcp.tools.read"
      - "mcp.tools.execute"
```

### 配置字段

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `auth_type` | 是 | 必须为 `oauth2_id_jag`。 |
| `token_exchange_endpoint` | 是 | 第一段使用的组织授权服务器令牌端点（RFC 8693 令牌交换）。 |
| `id_jag_resource_token_endpoint` | 是 | 第二段使用的资源授权服务器令牌端点（RFC 7523 jwt-bearer 授权类型）。 |
| `client_id` | 是 | 网关应用在授权服务器处的 OAuth 客户端标识。 |
| `client_private_key` | 推荐 | LiteLLM 用来签署 `client_assertion` 的 PEM 私钥。Okta 场景必需。 |
| `client_private_key_id` | 可选 | 在 `client_assertion` 的 JWT 头中作为 `kid` 声明的密钥 ID。 |
| `client_assertion_signing_alg` | 可选 | `client_assertion` 的签名算法，默认 `RS256`。 |
| `client_secret` | 可选 | 仅在未设置 `client_private_key` 时作为回退使用。 |
| `audience` | 推荐 | 资源授权服务器的标识符。LiteLLM 把它作为第一段的 `audience` 发送。 |
| `id_jag_resource` | 可选 | 第一段发送的 RFC 8707 资源指示符。 |
| `scopes` | 可选 | LiteLLM 请求的 scopes，拼接进 OAuth 的 `scope` 参数。 |
| `subject_token_type` | 可选 | 第一段的主体令牌类型。ID-JAG 场景默认为 `urn:ietf:params:oauth:token-type:id_token`。 |

## 两段流程

### 第一段：用令牌交换获取 ID-JAG

对每一对未命中缓存的主体令牌（subject token）与 MCP 服务器，LiteLLM 都会向 `token_exchange_endpoint` 发起一次 RFC 8693 令牌交换：

```http
POST /oauth2/v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange
&requested_token_type=urn:ietf:params:oauth:token-type:id-jag
&subject_token=<user-id-token>
&subject_token_type=urn:ietf:params:oauth:token-type:id_token
&audience=https://your-org.okta.com/oauth2/<custom-as-id>
&resource=https://mcp.example.com/
&scope=mcp.tools.read mcp.tools.execute
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=<signed-jwt>
```

组织授权服务器应用其管理员策略后，返回 ID-JAG 断言：

```json
{
  "issued_token_type": "urn:ietf:params:oauth:token-type:id-jag",
  "access_token": "<id-jag-jwt>",
  "token_type": "N_A",
  "expires_in": 300
}
```

ID-JAG 是一个带 `typ: oauth-id-jag+jwt` 的已签名 JWT，其 `aud` 指向资源授权服务器。

### 第二段：用 jwt-bearer 获取访问令牌

LiteLLM 以 RFC 7523 授权类型把 ID-JAG 提交给 `id_jag_resource_token_endpoint`：

```http
POST /oauth2/<custom-as-id>/v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<id-jag-jwt>
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=<signed-jwt>
```

资源授权服务器校验 ID-JAG 后返回访问令牌：

```json
{
  "access_token": "access-token-for-mcp-server",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

随后 LiteLLM 用下面的头部调用 MCP 服务器：

```http
Authorization: Bearer access-token-for-mcp-server
```

## 调用 ID-JAG MCP 服务器

第一段需要一个用于断言的身份令牌，LiteLLM 从两个来源之一取得它。如果请求在 `Authorization` 中携带了用户的 `id_token`，该令牌就是主体；否则 LiteLLM 使用用户通过 LiteLLM SSO 登录时捕获的身份断言。正因如此，只持有 LiteLLM 虚拟密钥（virtual key）的 agent 也能以该密钥所属用户的身份访问 MCP 服务器。用户始终是虚拟密钥解析到的那个人，任何请求字段都无法指定向上游断言其他人的身份。

自行传递 `id_token` 时，请把 LiteLLM 密钥放进 `x-litellm-api-key`，把 `Authorization` 留给用户令牌：

```bash title="直接调用 MCP" showLineNumbers
curl -X POST "https://litellm.example.com/internal_tools/mcp" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer <litellm-api-key>" \
  -H "Authorization: Bearer <user-okta-id-token>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

:::tip
如果 MCP 客户端只能发送一个 `Authorization` 头，请用 `x-litellm-api-key` 携带 LiteLLM 密钥，把 `Authorization` 留给用户的 `id_token`。LiteLLM 需要把 `id_token` 用作第一段的 `subject_token`。
:::

### 仅凭虚拟密钥，主体令牌取自存储

不带 `Authorization` 头时，同样的调用对任何至少通过 LiteLLM SSO 登录过一次、且断言尚未过期的用户都有效：

```bash title="仅虚拟密钥" showLineNumbers
curl -X POST "https://litellm.example.com/internal_tools/mcp" \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer <litellm-api-key>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

断言的读取结果按进程缓存，时长为 `MCP_SSO_ASSERTION_CACHE_TTL_SECONDS`（默认 60 秒），因此某个 pod 上新完成的 SSO 登录，最迟一个 TTL 内就会对其他 pod 可见。

## 连接时的凭证错误

在 `/internal_tools/mcp` 或 `/mcp/internal_tools` 这类单服务器路由上，LiteLLM 会在打开 MCP 会话之前先解析 ID-JAG 凭证，因此失败会以客户端能够处理的 HTTP 状态码返回，而不是表现为一个看起来没有任何工具的会话。这个预检针对的是存储来源的流程（不带 `Authorization` 头），下表中的失败正是在调用任何授权服务器之前就判定的。

| 状态码 | 含义 | 解决办法 |
|--------|---------|---------------|
| `412 Precondition Failed` | 该用户没有已存储的身份断言，或已存储的断言已过期。响应体会指明是哪种情况。 | 让用户通过 LiteLLM SSO 登录，网关即可捕获到新的断言。 |
| `503 Service Unavailable` | 断言存储（LiteLLM 的数据库）不可达。 | 与用户侧无关；请检查数据库连通性。 |

412 是一个带 JSON 响应体的普通状态码，不是 OAuth 质询。响应中没有 `WWW-Authenticate` 头，因为客户端无法通过拉取授权服务器元数据再重试来解决它；只有一次 LiteLLM SSO 登录才能解决。

```bash
$ curl -s -i -X POST https://litellm.example.com/mcp/internal_tools \
    -H "x-litellm-api-key: Bearer <litellm-api-key>" \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
HTTP/1.1 412 Precondition Failed
content-type: application/json

{"detail":"precondition required: ID-JAG requires an IdP identity assertion for this user and none is stored. Sign in through LiteLLM SSO so the gateway captures one."}
```

在同一路由上执行 `tools/call` 同样返回这个 412，而不是报出工具不存在。

在同时服务多个服务器的聚合路由 `/mcp` 上，单个服务器的凭证失败不能拖垮整个连接，因此改为按服务器分别上报。`tools/list` 照常成功，失败的服务器不贡献任何工具，原因落在响应的 `_meta` 里：

```json
{"_meta":{"litellm.ai/server_outcomes":{"internal_tools":{"status":"internal","http_status":412}}},"tools":[]}
```

看到这种结构时，如果想直接拿到状态码和错误信息，请改走该服务器的单服务器路由。

已知限制：当请求携带 `Authorization` bearer 时，`tools/list` 目前仍从已存储的断言解析主体，而 `tools/call` 使用的是 bearer 令牌。于是，持有有效 `id_token` 但没有已存储断言的调用方，得到的会是空列表加上上述 `_meta` 中的 412，而不是连接时的状态码；并且这条请求不会执行预检，所以它无法拒绝一个工具调用本来会接受的凭证。通过 LiteLLM SSO 登录一次即可消除这种不一致。

## 缓存行为

LiteLLM 按主体令牌和 MCP 服务器 ID 缓存第二段的访问令牌，因此两个不同用户拿到的是各自的令牌，而同一用户对同一 MCP 服务器的重复调用会复用缓存令牌直至其过期。缓存 TTL 取第二段的 `expires_in` 减去 LiteLLM 的 OAuth 过期缓冲。`expires_in` 缺失或无效时，LiteLLM 使用默认的 OAuth 令牌缓存 TTL。

## 故障排查

| 症状 | 排查方向 |
|---------|-------|
| MCP 服务器收到的是 LiteLLM 密钥 | 把 LiteLLM 密钥移到 `x-litellm-api-key`，`Authorization` 留给用户的 `id_token`。 |
| 连接时收到 `412 Precondition Failed` | 该用户没有已存储的 SSO 断言，或断言已过期。让用户通过 LiteLLM SSO 登录后重试。参见[连接时的凭证错误](#连接时的凭证错误)。 |
| 连接时收到 `503 Service Unavailable` | 断言存储不可达。检查 LiteLLM 的数据库连接。 |
| `tools/list` 返回空列表且 `_meta` 显示 `http_status: 412` | 你走的是聚合路由 `/mcp`。改用单服务器路由即可直接拿到状态码和错误信息。 |
| 第一段返回 400 或 403 | 确认跨应用访问策略允许网关应用为该资源及这些 scopes 获取 ID-JAG，并确认 `audience` 与资源授权服务器标识符一致。 |
| 第一段返回 401 | 确认 `client_id`、`client_private_key`、`client_private_key_id` 与网关应用注册的 JWKS 匹配。 |
| 第二段拒绝断言 | 确认 `id_jag_resource_token_endpoint` 指向信任该组织授权服务器的资源授权服务器，并确认其时钟与 ID-JAG 的 `exp` 一致。 |
| 每次请求都在调用授权服务器 | 确认第二段返回了 `expires_in`，并确认重复调用使用的是同一用户的 `id_token` 和同一 MCP 服务器。 |
