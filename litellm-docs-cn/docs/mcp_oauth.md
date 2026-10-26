# MCP OAuth

LiteLLM 为 MCP 服务器提供多种 OAuth 2.0 接入模式。`config.yaml` 中每个 `auth_type: oauth2` 的服务器都必须通过 `oauth2_flow` 声明所用流程；各透传模式则使用独立的 `auth_type` 取值，详见 [MCP OAuth 透传](./mcp_oauth_passthrough.md)：

| 流程 | `oauth2_flow` | 适用场景 | 工作方式 |
|------|---------------|----------|--------------|
| **交互式**（PKCE） | `authorization_code` | 面向用户的应用（Claude Code、Cursor） | 基于浏览器的授权确认，按用户发放令牌 |
| **机器对机器**（M2M） | `client_credentials` | 后端服务、CI/CD、自动化智能体 | `client_credentials` 授权，令牌由代理托管 |
| **代表用户**（OBO） | n/a（使用 `auth_type: oauth2_token_exchange`） | 以用户上下文调用受保护的 MCP 服务器 | LiteLLM 把调用方令牌换成限定作用域的 MCP 令牌。参见 [MCP OBO 认证](./mcp_obo_auth.md)。 |
| **透传**（透明） | n/a（使用 `auth_type: true_passthrough`） | 客户端已持有上游令牌；LiteLLM 自身不附加认证 | 原样转发客户端的 `Authorization`，不经 LiteLLM 准入。参见 [MCP OAuth 透传](./mcp_oauth_passthrough.md) |
| **上游委托 OAuth** | n/a（使用 `auth_type: oauth_delegate`） | LiteLLM 负责调用方准入；工具授权由上游掌控 | LiteLLM 准入之外单独转发上游 bearer，保留花费统计与速率限制。参见 [MCP OAuth 透传](./mcp_oauth_passthrough.md) |

交互式流程得到的按用户令牌存储在调用密钥对应的 `user_id` 下。关于它与 服务账号（service account） 密钥如何配合，以及非 OAuth 的按用户方案（按请求头、BYOK 密钥、按用户环境变量），参见 [按用户与按密钥的上游凭证](./mcp_per_user_auth.md)。

## 交互式 OAuth（PKCE）

对于面向用户的 MCP 客户端（Claude Code、Cursor），LiteLLM 支持带 PKCE 的完整 OAuth 2.0 授权码流程。

### 配置

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    oauth2_flow: authorization_code
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
```

[**查看 Claude Code 教程**](/docs/tutorials/claude_responses_api)

### 工作原理

```mermaid
sequenceDiagram
    participant Browser as User-Agent (Browser)
    participant Client as Client
    participant LiteLLM as LiteLLM Proxy
    participant MCP as MCP Server (Resource Server)
    participant Auth as Authorization Server

    Note over Client,LiteLLM: Step 1 – Resource discovery
    Client->>LiteLLM: GET /.well-known/oauth-protected-resource/{mcp_server_name}/mcp
    LiteLLM->>Client: Return resource metadata

    Note over Client,LiteLLM: Step 2 – Authorization server discovery
    Client->>LiteLLM: GET /.well-known/oauth-authorization-server/{mcp_server_name}
    LiteLLM->>Client: Return authorization server metadata

    Note over Client,Auth: Step 3 – Dynamic client registration
    Client->>LiteLLM: POST /{mcp_server_name}/register
    LiteLLM->>Auth: Forward registration request
    Auth->>LiteLLM: Issue client credentials
    LiteLLM->>Client: Return client credentials

    Note over Client,Browser: Step 4 – User authorization (PKCE)
    Client->>Browser: Open authorization URL + code_challenge + resource
    Browser->>Auth: Authorization request
    Note over Auth: User authorizes
    Auth->>Browser: Redirect with authorization code
    Browser->>LiteLLM: Callback to LiteLLM with code
    LiteLLM->>Browser: Redirect back with authorization code
    Browser->>Client: Callback with authorization code

    Note over Client,Auth: Step 5 – Token exchange
    Client->>LiteLLM: Token request + code_verifier + resource
    LiteLLM->>Auth: Forward token request
    Auth->>LiteLLM: Access (and refresh) token
    LiteLLM->>Client: Return tokens

    Note over Client,MCP: Step 6 – Authenticated MCP call
    Client->>LiteLLM: MCP request with access token + LiteLLM API key
    LiteLLM->>MCP: MCP request with Bearer token
    MCP-->>LiteLLM: MCP response
    LiteLLM-->>Client: Return MCP response
```

**参与者**

- **客户端**（Client）：代表用户发起 OAuth 发现、授权与工具调用的 MCP 智能体（如 Claude Code、Cursor 或其他 IDE/智能体）。
- **LiteLLM 代理**（Proxy）：中转所有 OAuth 发现、注册、令牌交换与 MCP 流量，并保护已存储的凭证。
- **授权服务器**（Authorization Server）：通过动态客户端注册、PKCE 授权与令牌端点签发 OAuth 2.0 令牌。
- **MCP 服务器**（资源服务器）：接收 LiteLLM 已认证 JSON-RPC 请求的受保护 MCP 端点。
- **用户代理**（浏览器）：仅在授权环节短暂介入，让最终用户完成授权确认。

**流程步骤**

1. **资源发现**：客户端从 LiteLLM 的 `.well-known/oauth-protected-resource` 端点获取 MCP 资源元数据，以了解作用域（scopes）与能力。
2. **授权服务器发现**：客户端通过 LiteLLM 的 `.well-known/oauth-authorization-server` 端点获取 OAuth 服务器元数据（令牌端点、授权端点、支持的 PKCE 方法）。
3. **动态客户端注册**：客户端通过 LiteLLM 注册，LiteLLM 把请求转发给授权服务器（RFC 7591）。如果提供商不支持动态注册，可以预先把 `client_id`/`client_secret` 存在 LiteLLM 中（例如 GitHub MCP），流程照常进行。
4. **用户授权**：客户端拉起浏览器会话（附带 code challenge 与资源提示）。用户批准访问后，授权服务器把授权码经 LiteLLM 回传给客户端。
5. **令牌交换**：客户端携带授权码、code verifier 与资源参数调用 LiteLLM；LiteLLM 与授权服务器完成交换，并返回签发的访问/刷新令牌。
6. **MCP 调用**：拿到有效令牌后，客户端把 MCP JSON-RPC 请求（连同 LiteLLM API 密钥）发给 LiteLLM，由 LiteLLM 转发给 MCP 服务器并回传工具响应。

更多细节可参考官方的 [MCP 授权流程](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#authorization-flow-steps)。

### 静态 OAuth 客户端的重定向 URL {#static-client-redirect-urls}

当上游身份提供商（IdP）要求预先注册应用时，使用静态 OAuth 客户端。在 LiteLLM 的 MCP 服务器条目中配置该应用的 `client_id` 与 `client_secret`。这可以支持不提供动态客户端注册（Dynamic Client Registration，RFC 7591）的提供商。

授权流程会用到两个回调 URL：

| 回调 | 用途 | 配置方式 |
|----------|---------|---------------|
| LiteLLM 回调 | 接收来自上游 IdP 的授权响应。 | 在 IdP 应用的 **Redirect URI** 或 **Callback URL** 字段中登记 `<proxy origin>/callback`。 |
| MCP 客户端回调 | 把来自 LiteLLM 的授权响应回传给 MCP 客户端。 | 客户端以 `redirect_uri` 参数向 `/{mcp_server_name}/authorize` 提供该 URL。校验规则有要求时，在 LiteLLM 中配置额外的可信回调。 |

例如，部署在 `https://llm.example.com` 的代理用 `https://llm.example.com/callback` 作为 IdP 回调。桌面客户端的本地回调（如 `http://localhost:33418/callback`）只需提供给 LiteLLM，无需在上游 IdP 登记。

#### 配置上游 OAuth 应用

把 `PROXY_BASE_URL` 设为代理的公网来源（origin），并在 IdP 处登记对应的 `/callback` URL：

```bash
export PROXY_BASE_URL=https://llm.example.com
# IdP 回调 URL: https://llm.example.com/callback
```

LiteLLM 依次从 `PROXY_BASE_URL`、受信任的 `X-Forwarded-*` 请求头、进站请求 URL 中解析公网来源。请求头信任要求见[反向代理与入口配置](#reverse-proxy-and-ingress-configuration)。

把应用的凭证与 OAuth 端点加入 MCP 服务器配置：

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  jira_mcp:
    url: https://mcp.example.com/mcp
    auth_type: oauth2
    oauth2_flow: authorization_code
    client_id: os.environ/JIRA_OAUTH_CLIENT_ID
    client_secret: os.environ/JIRA_OAUTH_CLIENT_SECRET
    authorization_url: https://idp.example.com/oauth2/authorize
    token_url: https://idp.example.com/oauth2/token
    scopes:
      - read:jira-work
```

请把示例中的服务器 URL、OAuth 端点与 scopes 替换为你所用提供商的实际值。当上游 MCP 服务器发布了 LiteLLM 可发现的 OAuth 元数据时，`authorization_url` 与 `token_url` 可省略；显式配置的端点优先于发现到的冲突端点。

当上游完全不发布 OAuth 元数据时（例如 [ms-365-mcp-server](./mcp_servers/microsoft_365.md) 背后的 Microsoft Graph），添加 `per_server_oauth_discovery: true`，让 LiteLLM 自己为 `/{mcp_server_name}/mcp` 发布发现文档，并用自带的 `/{mcp_server_name}/authorize` 与 `/{mcp_server_name}/token` 端点代理上述提供商 URL。该选项仅在 `auth_type: oauth2`、`oauth2_flow: authorization_code` 且未设置 `delegate_auth_to_upstream` 时可用。

对静态客户端，LiteLLM 会在本地处理 `POST /{mcp_server_name}/register`：返回 MCP 服务器名作为 `client_id`、`dummy` 作为 `client_secret`，以及客户端提交的 `redirect_uris`。授权与令牌交换仍使用配置中的上游凭证。

#### 确定 MCP 客户端的回调 URL

回调 URL 可从客户端在 `POST /{mcp_server_name}/register` 中的 `redirect_uris` 字段，或 `GET /{mcp_server_name}/authorize` 的 `redirect_uri` 参数获得。回调路径与端口可能随客户端版本和部署方式变化。

来源不匹配时，`HTTP 400` 响应会在 `detail.redirect_uri` 中带回提交的 URL。代理还会以 warning 级别记录被拒绝的值，日志形如 `MCP OAuth: rejecting redirect_uri '<value>'`。

下表汇总了常见的回调配置：

| 客户端或回调类型 | 回调示例 | LiteLLM 配置 |
|-------------------------|------------------|-----------------------|
| Cursor | `cursor://anysphere.cursor-mcp/oauth/callback` | 已内置在可信回调中。 |
| 使用回环监听的桌面或命令行客户端 | `http://localhost:33418/callback` | 回环回调在任意端口均可接受。 |
| VS Code 网页版 | `https://vscode.dev/redirect` 或 `https://insiders.vscode.dev/redirect` | 将 `vscode.dev,insiders.vscode.dev` 加入 `MCP_TRUSTED_REDIRECT_ORIGINS`。 |
| 部署在独立来源上的 Web 应用 | `https://app.example.com/oauth/callback` | 将 `app.example.com` 加入 `MCP_TRUSTED_REDIRECT_ORIGINS`。 |
| 使用自定义 URI scheme 的原生客户端 | `myclient://auth/callback` | 将回调 URI 加入 `MCP_TRUSTED_NATIVE_REDIRECT_URIS`。 |
| LiteLLM Admin UI | `<proxy origin>/ui/mcp/oauth/callback` | 代理解析出的公网来源与 UI 来源一致时即被接受。 |

客户端需要额外可信回调时，在代理部署中设置对应的环境变量：

```bash
# 受信任的 HTTPS 客户端主机，可带端口或通配符子域。
export MCP_TRUSTED_REDIRECT_ORIGINS='app.example.com,*.tools.example.com'

# 受信任的原生客户端回调 URI。
export MCP_TRUSTED_NATIVE_REDIRECT_URIS='myclient://auth/callback'
```

`MCP_TRUSTED_REDIRECT_ORIGINS` 接受逗号分隔的主机或 `host:port` 列表；`MCP_TRUSTED_NATIVE_REDIRECT_URIS` 接受逗号分隔的原生回调 URI 列表。必须包含回调路径，`myclient://auth/callback` 与 `myclient://auth/callback/` 是两个不同条目。

#### 重定向 URI 校验

单服务器静态 OAuth 场景下，`/{mcp_server_name}/authorize` 按以下规则校验回调：

| 回调类型 | 要求 |
|---------------|--------------|
| 受信任的原生回调 | 匹配内置的 Cursor 回调，或 `MCP_TRUSTED_NATIVE_REDIRECT_URIS` 中的条目。 |
| 回环地址 | 使用 HTTP 或 HTTPS，主机为 `localhost`、`127.0.0.0/8` 中的地址或 `::1`；任意端口与路径均可。 |
| 同源 | 与代理解析出的公网来源使用相同的 scheme、主机与端口；默认端口会被归一化。 |
| 额外可信来源 | 使用 HTTPS，且主机或 `host:port` 在 `MCP_TRUSTED_REDIRECT_ORIGINS` 中列出。`*.tools.example.com` 这类通配符匹配子域（包括 `a.tools.example.com`），但不包含 `tools.example.com` 本身。 |

回调 URL 必须包含主机，且不得包含片段（`#...`）、内嵌凭证（`user:pass@host`）或主机中的反斜杠。自定义 URI scheme 必须有受信任的原生回调条目；原生回调 URI 不得携带查询字符串。HTTP 与 HTTPS 回调可以携带查询字符串，LiteLLM 重定向回客户端时会原样保留。

#### 排查回调错误

LiteLLM 拒绝单服务器回调时返回 `HTTP 400`，`detail.error` 为 `invalid_request`；`detail.error_description` 说明具体的校验失败原因。部分响应还带 `detail.hint` 提供配置指引；来源不匹配的响应会包含 `detail.redirect_uri`。

| 错误或现象 | 解决方法 |
|------------------|------------|
| 上游 IdP 报告重定向 URI 不匹配。 | 检查 IdP 应用登记的回调是否为 `<proxy origin>/callback`，并确认 LiteLLM 解析出了预期的公网来源。 |
| LiteLLM 拒绝代理公网来源上的回调。 | 设置 `PROXY_BASE_URL` 或配置可信转发头。参见[反向代理与入口配置](#reverse-proxy-and-ingress-configuration)。 |
| LiteLLM 拒绝独立来源上的 HTTPS 回调。 | 将获批的客户端主机（如有必要含端口）加入 `MCP_TRUSTED_REDIRECT_ORIGINS`。 |
| LiteLLM 拒绝自定义 URI scheme。 | 将客户端回调 URI 加入 `MCP_TRUSTED_NATIVE_REDIRECT_URIS`。 |
| LiteLLM 提示回调包含 URL 片段。 | 让客户端改用不含片段的回调 URL。 |

例如，来源不匹配的响应包含以下字段：

```json title="来源不匹配响应（节选字段）"
{
  "detail": {
    "error": "invalid_request",
    "error_description": "redirect_uri origin (https://app.example.com) does not match the proxy origin. host/port: redirect_uri 'app.example.com' does not match the proxy origin",
    "redirect_uri": "https://app.example.com/oauth/callback"
  }
}
```

#### 网关动态客户端注册

聚合的 `/mcp` 端点使用网关级注册，通过 `POST /register`、`GET /authorize` 与 `POST /token` 完成。每次注册接受一至四个 `redirect_uris`，每个 URI 最长 256 字符。

此流程下，提供给 `/authorize` 的 `redirect_uri` 必须与注册值完全一致；未注册的值返回 `HTTP 400`，顶层 JSON 字段如下：

```json
{
  "error": "invalid_request",
  "error_description": "redirect_uri is not registered for this client"
}
```

单服务器静态注册返回占位凭证，且不存储针对具体客户端的回调允许列表；其授权端点采用上文所述的单服务器校验规则。

#### 验证配置

用以下请求验证发现、静态注册与授权重定向。示例假设代理监听在 `http://localhost:4000`，设置了 `PROXY_BASE_URL=https://llm.example.com`，并使用上文的 `jira_mcp` 配置。

获取授权服务器元数据：

```bash
curl -sS http://localhost:4000/.well-known/oauth-authorization-server/jira_mcp | jq .issuer
# "https://llm.example.com/jira_mcp"
```

issuer 的来源是 `https://llm.example.com`，因此 IdP 回调 URL 为 `https://llm.example.com/callback`。

验证静态注册响应：

```bash
curl -sS -X POST http://localhost:4000/jira_mcp/register \
  -H 'Content-Type: application/json' \
  -d '{"client_name":"my-mcp-client","redirect_uris":["http://localhost:33418/callback"]}'
# {"client_id":"jira_mcp","client_secret":"dummy","redirect_uris":["http://localhost:33418/callback"]}
```

使用回环回调请求授权：

```bash
curl -sS -o /dev/null -D - --get http://localhost:4000/jira_mcp/authorize \
  --data-urlencode 'response_type=code' \
  --data-urlencode 'client_id=jira_mcp' \
  --data-urlencode 'redirect_uri=http://localhost:33418/callback' \
  --data-urlencode 'state=example-state' \
  --data-urlencode 'code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM' \
  --data-urlencode 'code_challenge_method=S256'
```

预期响应为 `HTTP 307 Temporary Redirect`，其 `Location` 头指向上游授权端点，并带有配置的上游 `client_id` 与 URL 编码后的 `redirect_uri=https://llm.example.com/callback`。

要验证额外的可信来源，把 `redirect_uri=https://app.example.com/oauth/callback` 再请求一次授权。没有匹配的 `MCP_TRUSTED_REDIRECT_ORIGINS` 条目时，预期响应为 `HTTP 400`；设置 `MCP_TRUSTED_REDIRECT_ORIGINS=app.example.com`，重启代理后重试，预期响应为 `HTTP 307`。

### 反向代理与入口配置 {#reverse-proxy-and-ingress-configuration}

如果 LiteLLM 部署在 TLS 卸载的入口层之后（Kubernetes、ALB、nginx、Cloudflare 等），代理需要知道自己的公网来源，OAuth `authorize` 端点才能把浏览器提交的 `redirect_uri`（例如 `https://llm.example.com/ui/mcp/oauth/callback`）与自身的 scheme + host + port 做对比。若代理解析到的是内部地址（`http://<pod-ip>:4000`），同源校验会失败，MCP 服务器页面上的 **Connect** 按钮将返回 `400 Bad Request` 与 `{"detail":"invalid_request"}`。

最简单也最推荐的做法，是把 `PROXY_BASE_URL` 设为用户在地址栏看到的准确来源：

```bash
PROXY_BASE_URL=https://llm.example.com
```

取值规则：

- 只能是完整来源：scheme + host（端口非默认时加上端口）。
- 不带末尾斜杠，不带路径。
- 必须与地址栏完全一致。`https://llm.example.com` 与 `https://llm.example.com:443` 视为同一来源（默认端口会被归一化），但 `https://llm.example.com` 匹配不了运行在 `https://llm.example.com:8443` 的浏览器。

设置了 `PROXY_BASE_URL` 时，LiteLLM 直接采用该值，跳过下文所述的 `X-Forwarded-*` 信任路径。

#### 公网来源的解析顺序

对 MCP OAuth 端点，LiteLLM 按以下顺序解析代理公网来源：

1. **`PROXY_BASE_URL` 环境变量**：只要是合法的 `http(s)` URL 就原样使用；非法值会告警并忽略。
2. **`X-Forwarded-Proto` / `X-Forwarded-Host` / `X-Forwarded-Port`**：仅当 [`use_x_forwarded_for`](./proxy/config_settings#general_settings-参考) 为 `true` **且**请求对端 IP 落在 [`mcp_trusted_proxy_ranges`](./proxy/config_settings#general_settings-参考) 内时才采纳。只开 `use_x_forwarded_for` 而不配 `mcp_trusted_proxy_ranges` 时，这些请求头不受信任（否则无法区分可信反向代理与直接攻击者）。
3. **`request.base_url`**：FastAPI 在请求上看到的原始 URL。走入口层的部署中通常是 `http://<internal-host>:4000`，与浏览器来源对不上。

无法设置或不想设置 `PROXY_BASE_URL` 时，显式配置 X-Forwarded 路径：

```yaml title="config.yaml" showLineNumbers
general_settings:
  use_x_forwarded_for: true
  mcp_trusted_proxy_ranges:
    - "10.0.0.0/8"      # 你的入口层 / 负载均衡器 CIDR
```

并确认入口层会发送 `X-Forwarded-Proto`、`X-Forwarded-Host` 与（端口非默认时的）`X-Forwarded-Port`。诊断用 curl 命令见 [MCP OAuth 故障排查](./mcp_troubleshoot#mcp-oauth-invalid-request)。

#### 允许额外的第一方 redirect_uri 来源 {#allowing-additional-first-party-redirect_uri-origins}

如果第一方 OAuth 客户端部署在兄弟域名上（例如 `app.example.com` 上的内部 Web 应用要向 `llm.example.com` 上的 MCP 代理注册），设置 `MCP_TRUSTED_REDIRECT_ORIGINS`，在代理自身来源之外将其加入允许列表：

```bash
MCP_TRUSTED_REDIRECT_ORIGINS=app.example.com,*.tools.example.com
```

- 逗号分隔的 `host` 或 `host:port` 列表。
- 仅限 HTTPS。走允许列表路径时，任何非 `https` 的 `redirect_uri` 都会被拒绝。
- `*.suffix` 条目匹配比 `suffix` 更深的子域（`*.tools.example.com` 匹配 `a.tools.example.com`，但不匹配 `tools.example.com`）。
- 回环地址（`localhost`、`127.0.0.0/8`、`::1`）始终接受，不受此设置影响。

这适用于你可控的第一方 OAuth 客户端。标准的入口层场景请优先使用 `PROXY_BASE_URL`。

#### 为什么要有同源校验

MCP 代理的 `/v1/mcp/server/oauth/<server_id>/authorize` 端点会校验调用方的 `redirect_uri` 与代理自身公网来源（或上文的某个回环 / 允许列表条目）共享 scheme + host + port。这项校验是为了防止攻击者把已登录的管理员钓鱼到一个链接上，让 GitHub、Slack 这类上游受 OAuth 保护的 MCP 服务器的授权码经由攻击者控制的主机中转。同源（加上显式的运维允许列表）是原生 MCP 客户端仅允许回环规则在威胁模型上安全的等价形式。

对走入口层的部署来说，`PROXY_BASE_URL` 是正确的逃生通道：运维方以带外方式声明代理的真实公网来源，而不是让代理从攻击者可能伪造的请求头里推断。校验本身并未放宽。

## 机器对机器（M2M）认证

LiteLLM 通过 `client_credentials` 授权自动获取、缓存并刷新 OAuth2 令牌，无需手动管理令牌。

### 配置

可以通过 LiteLLM UI 或 `config.yaml` 配置 M2M OAuth。

### 界面配置

进入 **MCP Servers** 页面，点击 **+ Add New MCP Server**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/d1f1e89c-a789-4975-8846-b15d9821984a/ascreenshot_630800e00a2e4b598baabfc25efbabd3_text_export.jpeg)

输入服务器名称，传输类型选 **HTTP**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/2008c9d6-6093-4121-beab-1e52c71376aa/ascreenshot_516ffd6c7b524465a253a56048c3d228_text_export.jpeg)

粘贴 MCP 服务器 URL。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/b0ee8b7d-6de8-492b-8962-287987feec29/ascreenshot_b3efca82078a4c6bb1453c58161909f9_text_export.jpeg)

在 **Authentication** 下选择 **OAuth**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/e1597814-ff8e-40b9-9d7b-864dcdbe0910/ascreenshot_2097612712264d8f9e553f7ca9175fb0_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/f6ea5694-f28a-4bc3-9c9a-bb79f199bd65/ascreenshot_9be839f55b1b4f96bfe24030ba2c7f8d_text_export.jpeg)

OAuth 流程类型选 **Machine-to-Machine (M2M)**。它面向服务器对服务器认证，使用 `client_credentials` 授权，全程无需浏览器交互。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/9853310c-1d86-4628-bad1-7a391eca0e4d/ascreenshot_f302a286fa264fdd8d56db53b8f9395c_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/df64dc65-ef86-475d-adaf-12e227d5e873/ascreenshot_9e2f41d43a76435f918a00b52ffcc639_text_export.jpeg)

填入 OAuth 提供商提供的 **Client ID** 与 **Client Secret**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/0de5a7bd-9898-4fc7-8843-b23dd5aac47f/ascreenshot_b9087aaa81a14b5b9c199929efc4a563_text_export.jpeg)

填入 **Token URL**，即 LiteLLM 用 `client_credentials` 获取访问令牌时调用的端点。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/0aea70f1-558c-4dca-91bc-1175fe1ddc89/ascreenshot_b3fcf8a1287e4e2d9a3d67c4a29f7bff_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/e842ef09-1fd7-47a6-909b-252d389f0abc/ascreenshot_2a87dad3624847e7ac370591d1d1aedd_text_export.jpeg)

向下滚动，核对服务器 URL 与所有字段，然后点击 **Create MCP Server**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/0857712b-4b53-40f8-8c1f-a4c72edaa644/ascreenshot_47be3fcd5de64ed391f70c1fb74a8bfc_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/9d961765-955f-4905-a3dc-1a446aa3b2cc/ascreenshot_43fd39d014224564bc6b35aced1fb6d3_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/3825d5fa-8fd1-4e71-b090-77ff0259c3f6/ascreenshot_2509a7ebd9bf421eb0e82f2553566745_text_export.jpeg)

创建完成后，打开该服务器并进入 **MCP Tools** 标签页，确认 LiteLLM 能连接并列出可用工具。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/8107e27b-5072-4675-8fd6-89b47692b1bd/ascreenshot_f774bc76138f430d808fb4482ebfcdca_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/ce94bb7b-c81b-4396-9939-178efb2cdfce/ascreenshot_28b838ab6ae34c76858454555c4c1d79_text_export.jpeg)

选择一个工具（例如 **echo**）进行测试。填入所需参数后点击 **Call Tool**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/c459c1d3-ec29-4211-9c28-37fbe7783bbc/ascreenshot_e9b138b3c2cc4440bb1a6f42ac7ae861_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/5438ac60-e0ac-4a79-bf6f-5594f160d3b5/ascreenshot_9133a17d26204c46bce497e74685c483_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/a8f6821b-3982-4b4d-9b25-70c8aff5ac31/ascreenshot_28d474d0e62545a482cff6128527883a_text_export.jpeg)

LiteLLM 会在后台自动获取 OAuth 令牌并调用工具。结果正常即说明 M2M OAuth 流程端到端跑通。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-10/c3924549-a949-48d1-ac67-ab4c30475859/ascreenshot_8f6eca9d717f45478d50a881bd244bb3_text_export.jpeg)

### Config.yaml 配置

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  my_mcp_server:
    url: "https://my-mcp-server.com/mcp"
    auth_type: oauth2
    oauth2_flow: client_credentials
    client_id: os.environ/MCP_CLIENT_ID
    client_secret: os.environ/MCP_CLIENT_SECRET
    token_url: "https://auth.example.com/oauth/token"
    scopes: ["mcp:read", "mcp:write"]  # 可选
```

### 在其他请求头中携带令牌

默认情况下，LiteLLM 解析出的令牌以 `Authorization: Bearer <token>` 发出，几乎所有 MCP 服务器都按此预期。但有些部署把 MCP 服务器放在 API 网关后面：网关从自己的私有请求头读取凭证，而网关后面的服务器仍希望从 `Authorization` 拿到自己的 bearer。这就需要同一请求同时携带两份凭证。

把 `upstream_token_header` 设为解析出的令牌要使用的请求头名。`static_headers` 下配置的内容则保持原样不动，第二份凭证就能原封不动地送达网关后面的服务器。

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  my_mcp_server:
    url: "https://my-mcp-server.com/mcp"
    auth_type: oauth2
    oauth2_flow: client_credentials
    client_id: os.environ/MCP_CLIENT_ID
    client_secret: os.environ/MCP_CLIENT_SECRET
    token_url: "https://auth.example.com/oauth/token"
    upstream_token_header: "esb-oauth"
    static_headers:
      Authorization: "Bearer os.environ/UPSTREAM_MCP_TOKEN"
```

此后发往 MCP 服务器的每个请求都会同时携带两者：

```
esb-oauth: Bearer <the token LiteLLM minted>
Authorization: Bearer <the token you configured>
```

不设置 `upstream_token_header` 就保持默认行为，现有服务器不受影响。该值必须是合法的 HTTP 请求头名；格式非法时代理拒绝启动，管理 API 也会以 400 拒绝。

在 UI 中，同一设置是 MCP 服务器表单 OAuth 区块的 **Token Header** 字段；除 M2M 外，它同样作用于交互式流程与令牌交换模式。

### 工作原理

1. 首次 MCP 请求时，LiteLLM 向 `token_url` 发送 `grant_type=client_credentials` 的 POST 请求
2. 访问令牌缓存在内存中，TTL 为 `expires_in - 60s`
3. 后续请求复用缓存的令牌
4. 令牌过期后，LiteLLM 自动获取新令牌

```mermaid
sequenceDiagram
    participant Client as Client
    participant LiteLLM as LiteLLM Proxy
    participant Auth as Authorization Server
    participant MCP as MCP Server

    Client->>LiteLLM: MCP request + LiteLLM API key
    LiteLLM->>Auth: POST /oauth/token (client_credentials)
    Auth->>LiteLLM: access_token (expires_in: 3600)
    LiteLLM->>MCP: MCP request + Bearer token
    MCP-->>LiteLLM: MCP response
    LiteLLM-->>Client: MCP response

    Note over LiteLLM: Token cached for subsequent requests
    Client->>LiteLLM: Next MCP request
    LiteLLM->>MCP: MCP request + cached Bearer token
    MCP-->>LiteLLM: MCP response
    LiteLLM-->>Client: MCP response
```

### 使用模拟服务器测试

可用 [BerriAI/mock-oauth2-mcp-server](https://github.com/BerriAI/mock-oauth2-mcp-server) 在本地测试：

```bash title="终端 1：启动模拟服务器" showLineNumbers
uv add fastapi uvicorn
python mock_oauth2_mcp_server.py  # 启动在 8765 端口
```

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  test_oauth2:
    url: "http://localhost:8765/mcp"
    auth_type: oauth2
    oauth2_flow: client_credentials
    client_id: "test-client"
    client_secret: "test-secret"
    token_url: "http://localhost:8765/oauth/token"
```

```bash title="终端 2：启动代理并测试" showLineNumbers
litellm --config config.yaml --port 4000

# 完整示例（server_id、工具命名、常见错误）见 MCP REST API 指南
# https://docs.litellm.ai/docs/mcp_rest_api

curl http://localhost:4000/mcp-rest/tools/list \
  -H "Authorization: Bearer $LITELLM_API_KEY"

curl http://localhost:4000/mcp-rest/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "server_id": "test_oauth2",
    "name": "echo",
    "arguments": {"message": "hello"}
  }'
```

### 配置参考

| 字段 | 是否必填 | 说明 |
|-------|----------|-------------|
| `auth_type` | 是 | 必须为 `oauth2`。RFC 8693 代表用户场景请改用 `oauth2_token_exchange`，参见 [MCP OBO 认证](./mcp_obo_auth.md)。 |
| `oauth2_flow` | 是 | 流程选择器。取 `"client_credentials"`（M2M）或 `"authorization_code"`（交互式 PKCE，含 `delegate_auth_to_upstream`）之一。`config.yaml` 中每个 `auth_type: oauth2` 的服务器都必须声明；缺失或非法时代理拒绝启动。通过 UI 创建的服务器会从 OAuth 流程类型选择器取得该值；只有在该字段出现之前创建的旧数据库记录才会在请求时按字段形态推断，config 条目从不推断。 |
| `client_id` | M2M 必填，交互式可选 | OAuth2 客户端 ID。`client_credentials` 必填。交互式流程下，若上游支持，可在 `POST /{server_name}/register` 通过动态客户端注册（RFC 7591）获取。支持 `os.environ/VAR_NAME`。 |
| `client_secret` | M2M 必填，交互式可选 | OAuth2 客户端密钥。适用范围与 `client_id` 相同。支持 `os.environ/VAR_NAME`。 |
| `token_url` | M2M 必填，交互式可选 | 令牌端点 URL。`client_credentials` 与授权码交换都向该端点发 POST。 |
| `authorization_url` | 仅交互式 | 上游授权端点。配置后 LiteLLM 将该服务器视为交互式 PKCE，并把 `GET /{server_name}/authorize` 代理到此 URL。 |
| `registration_url` | 可选 | 上游动态客户端注册端点（RFC 7591）。配置后 `POST /{server_name}/register` 会代理到此 URL。 |
| `scopes` | 否 | 要请求的作用域列表。M2M 场景下拼入令牌请求的 `scope` 参数；交互式场景下随授权请求转发。 |
| `token_validation` | 否 | 键值规则字典，在 `/token` 交换后对 OAuth 令牌响应进行核对。任一规则不匹配即判定交换失败，错误为 `token_validation_failed`。适合断言租户声明，如 `{"team.enterprise_id": "T12345"}`。 |
| `token_storage_ttl_seconds` | 否 | 覆盖按用户令牌缓存（交互式流程）的 TTL。未设置时，LiteLLM 使用令牌响应中的 `expires_in - buffer`。 |

## OAuth 调试

LiteLLM 代理部署在远端、拿不到服务器日志时，可启用**调试头**（debug headers），在 HTTP 响应中获取脱敏后的认证诊断信息。

### 启用调试模式

在 MCP 客户端请求中加上 `x-litellm-mcp-debug: true` 请求头。

**Claude Code**：

```bash
claude mcp add --transport http litellm_proxy http://proxy.example.com/atlassian_mcp/mcp \
  --header "x-litellm-api-key: Bearer sk-..." \
  --header "x-litellm-mcp-debug: true"
```

**curl**：

```bash
curl -X POST http://localhost:4000/atlassian_mcp/mcp \
  -H "Content-Type: application/json" \
  -H "x-litellm-api-key: Bearer sk-..." \
  -H "x-litellm-mcp-debug: true" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

### 读取调试响应头

响应会包含以下请求头（所有敏感值均已脱敏）：

| 请求头 | 说明 |
|--------|-------------|
| `x-mcp-debug-inbound-auth` | 出现了哪些入站认证请求头。 |
| `x-mcp-debug-oauth2-token` | OAuth2 令牌（已脱敏）。若显示 `SAME_AS_LITELLM_KEY`，说明 LiteLLM 密钥正在泄漏。 |
| `x-mcp-debug-auth-resolution` | 实际采用的认证方式：`oauth2-passthrough`、`m2m-client-credentials`、`per-request-header`、`static-token` 或 `no-auth`。 |
| `x-mcp-debug-outbound-url` | 上游 MCP 服务器 URL。 |
| `x-mcp-debug-server-auth-type` | 服务器上配置的 `auth_type`。 |

**示例：正常的 OAuth2 透传**

```
x-mcp-debug-inbound-auth: x-litellm-api-key=Bearer****1234; authorization=Bearer****ef01
x-mcp-debug-oauth2-token: Bearer****ef01
x-mcp-debug-auth-resolution: oauth2-passthrough
x-mcp-debug-outbound-url: https://mcp.atlassian.com/v1/mcp
x-mcp-debug-server-auth-type: oauth2
```

**示例：LiteLLM 密钥泄漏**（配置错误）

```
x-mcp-debug-inbound-auth: authorization=Bearer****1234
x-mcp-debug-oauth2-token: Bearer****1234 (SAME_AS_LITELLM_KEY - likely misconfigured)
x-mcp-debug-auth-resolution: oauth2-passthrough
x-mcp-debug-outbound-url: https://mcp.atlassian.com/v1/mcp
x-mcp-debug-server-auth-type: oauth2
```

### 常见问题

#### LiteLLM API 密钥泄漏到 MCP 服务器

**症状**：`x-mcp-debug-oauth2-token` 显示 `SAME_AS_LITELLM_KEY`。

`Authorization` 头里装的是 LiteLLM API 密钥而非 OAuth2 令牌。客户端预先设置了 `Authorization` 头，导致 OAuth2 流程根本没有启动。

**修复方法**：把 LiteLLM 密钥移到 `x-litellm-api-key`：

```bash
# 错误：会阻断 OAuth2 发现
claude mcp add --transport http my_server http://proxy/server/mcp \
    --header "Authorization: Bearer sk-..."

# 正确：LiteLLM 密钥放专用请求头，把 Authorization 留给 OAuth2
claude mcp add --transport http my_server http://proxy/server/mcp \
    --header "x-litellm-api-key: Bearer sk-..."
```

#### 没有 OAuth2 令牌

**症状**：`x-mcp-debug-oauth2-token` 显示 `(none)`，`x-mcp-debug-auth-resolution` 显示 `no-auth`。

请检查：
1. 客户端配置中没有把 `Authorization` 设为静态请求头。
2. LiteLLM 配置中的 MCP 服务器已设置 `auth_type: oauth2`。
3. `.well-known/oauth-protected-resource` 端点返回了有效元数据。

#### 用了 M2M 令牌而不是用户令牌

**症状**：`x-mcp-debug-auth-resolution` 显示 `m2m-client-credentials`。

服务器配置了 `client_id`/`client_secret`/`token_url`，于是 LiteLLM 去获取机器对机器令牌，而不是使用按用户 OAuth2 令牌。要改用按用户令牌，请从服务器配置中移除这些客户端凭证。

## 透传与上游委托 OAuth

当客户端已直接向上游自己的 OAuth issuer 认证时，LiteLLM 可以直接转发客户端的上游令牌，而不自己管理令牌。透明的 `auth_type: true_passthrough` 模式、带准入门槛的 `auth_type: oauth_delegate` 模式，以及旧版 `delegate_auth_to_upstream` 标志，均见 [MCP OAuth 透传](./mcp_oauth_passthrough.md)。该页还记录了 `dcr_bridge` 标志，面向 OpenCode、Claude Code、Cursor、Claude Desktop 这类仅支持 OAuth 的客户端：由网关托管注册与登录，客户端只需一个 OAuth 流程即可接入。
