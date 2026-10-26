import Image from '@theme/IdealImage';

# MCP 故障排查指南

当 LiteLLM 充当 MCP（Model Context Protocol）网关时，流量路径为 `Client -> LiteLLM Proxy -> MCP Server`，启用 OAuth 的部署还会额外引入一个用于元数据发现的授权服务器。本页是一份从症状到修复的速查手册：先跑一次诊断命令，在矩阵中找到匹配的症状，再顺着该行找到修复方法。如果仍需上报支持，请收齐[支持信息包（support bundle）](#support-bundle)，免得后续还要有人重新拼凑上下文。

配置步骤与配置字段见 [mcp.md](./mcp.md)。端点、传输方式与认证模式如何选型，参见 [MCP 配置参考](./mcp_config_reference)。

## 五分钟快速排查 {#locate-the-error-source}

本页所有命令都沿用快速上手（quickstart）的约定：代理运行在 `http://localhost:4000`，LiteLLM 密钥放在 `x-litellm-api-key` 中，服务器别名（如 `deepwiki`）来自 `config.yaml` 的 `mcp_servers`。请替换成你自己的主机、密钥和别名。

第 1 步：对故障服务器的命名端点运行下面的诊断命令。它会保留 HTTP 状态码、响应头和响应体，这正是你需要的全部证据。不要用 `grep` 过滤输出，否则你会丢掉用于定位故障层的那部分信息。

```bash
curl -sS -D - -X POST http://localhost:4000/deepwiki/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-litellm-api-key: Bearer $LITELLM_API_KEY" \
  -H "x-litellm-mcp-debug: true" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

第 2 步：读取 HTTP 状态行和响应体，然后在矩阵中找到对应行。状态码会告诉你故障在哪一层：401/403/404/405/406 是 LiteLLM 在调用上游之前返回的（Client -> LiteLLM）；而返回 `200` 但响应体里报 `"status": "unreachable"` 或工具列表为空，说明 LiteLLM 正常应答，但到上游那一跳失败了（LiteLLM -> MCP Server）。

第 3 步：用 `x-mcp-debug-*` 响应头（通过 `x-litellm-mcp-debug: true` 开启，见[调试响应头](#debug-headers)）和对应的代理日志行确认故障层，然后按该行的修复方案处理。

正常的对照响应如下。先拿到一份，因为有了可用的基线，下面每一种故障才有解读的参照：

```text
HTTP/1.1 200 OK
content-type: text/event-stream

event: message
data: {"jsonrpc":"2.0","id":1,"result":{"_meta":{"litellm.ai/server_outcomes":{"deepwiki":{"status":"ok","tool_count":3}}},"tools":[{"name":"deepwiki-ask_question",...}]}}
```

## 症状矩阵

| 症状 | 可能的故障层 | 诊断方法 | 预期证据 | 修复方式 | 上报时附上 |
|---|---|---|---|---|---|
| `401` `Authentication Error, Malformed API Key` | Client -> LiteLLM | 带/不带密钥头各跑一次诊断 curl | `{"detail":"Authentication Error, Malformed API Key passed in. Ensure Key has 'Bearer ' prefix."}` | 发送 `x-litellm-api-key: Bearer <key>`，注意带上 Bearer 前缀 | 完整状态码与响应体，[信息包](#support-bundle) |
| `401` 密钥无效或已过期 | Client -> LiteLLM | 诊断 curl；检查 `x-mcp-debug-inbound-auth` | 401 响应体指明被拒的密钥；调试响应头显示代理看到的脱敏密钥 | 改用有效的虚拟密钥（virtual key）或主密钥（master key）；已过期则重新生成 | 脱敏密钥 ID、密钥创建时间 |
| `403` 密钥有效但无权访问 | LiteLLM 认证/路由 | 对命名端点跑诊断 curl | 403 响应体提及团队/密钥的 MCP 权限 | 为该密钥/团队授予访问该服务器或[访问组](./mcp_control.md)的权限 | 密钥/团队配置片段 |
| `404` `MCP server, toolset, or access group '<alias>' not found` | LiteLLM 认证/路由 | 向 `/<alias>/mcp` 发诊断 curl | 404 响应体原文，指明别名 | 修正别名使其与 `config.yaml` 中的 `mcp_servers` 一致，或补上该服务器 | `mcp_servers` 配置片段 |
| `404` `{"detail":"Not Found"}` | Client -> LiteLLM | 将 URL 与 `/<alias>/mcp` 对照 | 普通 FastAPI 404，未指明别名 | 补上缺失的 `/mcp` 后缀或修正路径 | 实际使用的完整 URL |
| `405` `Method Not Allowed` | Client -> LiteLLM | `curl -sS -D - -X PUT ...` 可复现 | `allow: GET, POST, DELETE` 响应头加 JSON-RPC 错误体 | JSON-RPC 调用请用 POST；端点协议是 streamable HTTP，既不是纯 SSE 也不是 WebSocket | 请求方法与客户端传输配置 |
| `406` `Not Acceptable` | Client -> LiteLLM | 不带 `Accept` 头跑诊断 curl | `Client must accept both application/json and text/event-stream` | 发送 `Accept: application/json, text/event-stream` | 客户端 HTTP 配置 |
| UI 中 OAuth Connect 返回 `400`：`{"detail":"invalid_request"}` | LiteLLM 认证/路由 | 见 [OAuth redirect_uri 被拒](#mcp-oauth-invalid-request) | 日志行 `MCP OAuth: rejecting redirect_uri ...` | 设置 `PROXY_BASE_URL` 或信任 `X-Forwarded-*` | `.well-known` 的 issuer 输出 |
| OAuth 流程把 LiteLLM 密钥发给了上游 | LiteLLM 认证/路由 | 诊断 curl，读取 `x-mcp-debug-oauth2-token` | 响应头中出现 `SAME_AS_LITELLM_KEY` | 把 LiteLLM 密钥移到 `x-litellm-api-key`，把 `Authorization` 留给上游令牌，见 [OAuth 调试](./mcp_oauth#oauth-调试) | 调试响应头 |
| 客户端无法注册（DCR）或发现失败 | LiteLLM 认证/路由 | `curl -sS http://localhost:4000/.well-known/oauth-authorization-server` | 含 `authorization_endpoint` 与 `token_endpoint` 的 JSON | 确认客户端能访问到该元数据；支持的授权类型见 [OAuth 文档](./mcp_oauth) | 元数据 JSON、客户端报错原文 |
| 返回 `200` 但 `"status": "unreachable"`、工具列表为空 | LiteLLM -> MCP Server | 诊断 curl + 在代理日志中按别名 grep | 日志：`httpx.ConnectError: All connection attempts failed`（网络）或 `CERTIFICATE_VERIFY_FAILED`（TLS） | 修复上游 URL、网络路径、防火墙或服务器证书 | 代理日志行与 MCP 服务器日志 |
| 聚合端点 `/mcp` 返回 `200` 但工具列表为空 | LiteLLM -> MCP Server | 读取响应体中的 `litellm.ai/server_outcomes` | 每台服务器的 `status` 会标出哪个上游失败、哪些正常返回了工具 | 修复故障的那台服务器；聚合端点会吸收单台服务器的失败，而不是让整个列表失败 | `server_outcomes` 对象 |
| 工具调用失败：`Tool '<name>' not found` | Client -> LiteLLM | 用 `tools/list` 返回的确切名称发起 `tools/call` | `{"content":[{"type":"text","text":"Error: Tool 'nonexistent_tool' not found"}],"isError":true}` | 聚合端点和命名端点都用带前缀的名称（`deepwiki-ask_question`） | `tools/list` 输出 |
| `/v1/responses` 或 `/v1/chat/completions` 忽略 MCP 工具 | LiteLLM 认证/路由 | 将 `server_label` 与配置中的别名对照 | 成功时会出现 `mcp_tools_fetched` 和 `tool_execution_results` 输出项；label 不对只会得到没有工具项的普通回答 | 把 `server_label` 设为确切的别名，`server_url` 设为 `litellm_proxy` | 完整请求体（脱敏后）与响应 |
| 请求中途超时 | LiteLLM -> MCP Server | 给诊断 curl 计时；检查 MCP 服务器日志 | curl 卡住后报错；代理日志出现超时 | 调高客户端超时，排查上游延迟与网络路径 | 双方时间戳、拓扑 |

## 端点与会话

LiteLLM 提供一个聚合端点，并为每台服务器提供一个命名端点。`POST /mcp` 会列出你的密钥可访问的所有服务器上的工具，每个工具名都带服务器别名前缀（`deepwiki-ask_question`），并在 `_meta` 中附带按服务器划分的 `litellm.ai/server_outcomes` 报告。`POST /<alias>/mcp` 则把调用限定在一台服务器上，是排查故障时的正确目标，因为聚合响应可能让一台故障服务器被其他健康服务器掩盖。

这些端点使用 MCP streamable HTTP 协议。即使是单次 JSON-RPC 调用，响应也以 `text/event-stream` 帧返回，因此 `Accept` 头必须同时允许这两种内容类型。裸的 `tools/list` 和 `tools/call` 请求无需先做 `initialize` 握手即可工作，所以用 curl 排查不需要准备任何会话。执行了 `initialize` 的 MCP 客户端会获得一个会话；如果客户端在列出工具之前就失败，请抓取它的第一个 HTTP 交互，因为传输不匹配（405）和缺少 `Accept` 头（406）都发生在第一个请求上。

## 已验证的故障模式

下面每一条响应都采自真实运行的代理：使用快速上手配置和一台 `deepwiki` 服务器，另外为矩阵里的网络和 TLS 两行专门准备了故意弄坏的服务器。

### 401 与 403：认证问题 {#auth-failures}

密钥缺失或格式错误：

```text
HTTP/1.1 401 Unauthorized
{"detail":"Authentication Error, Malformed API Key passed in. Ensure Key has `Bearer ` prefix."}
```

未知或已过期的密钥同样返回 401，响应体会指明被拒的密钥：

```text
HTTP/1.1 401 Unauthorized
{"detail":"Authentication Error, Invalid proxy server token passed. Received API Key = sk-..., Key Hash (Token) =2ab06c... Unable to find token in cache or `LiteLLM_VerificationTokenTable`"}
```

403 表示密钥认证通过，但没有该服务器的 MCP 权限；此时要修的是密钥/团队的[权限分配](./mcp_control.md)，而不是去换凭证。

### 404：服务器或路由问题 {#server-route-404}

未知别名，被 LiteLLM 路由拒绝：

```text
HTTP/1.1 404 Not Found
{"detail":"MCP server, toolset, or access group 'nosuchserver' not found"}
```

路径错误（缺少 `/mcp` 后缀），请求根本没到 MCP 路由：

```text
HTTP/1.1 404 Not Found
{"detail":"Not Found"}
```

两种响应体看着相似，含义却不同：前者是配置/别名问题，后者是 URL 问题。

### 405 与 406：传输或端点不匹配 {#transport-mismatch}

非 JSON-RPC 的方法（例如 PUT）会返回 405，并附上允许的方法：

```text
HTTP/1.1 405 Method Not Allowed
allow: GET, POST, DELETE
{"jsonrpc":"2.0","id":"server-error","error":{"code":-32600,"message":"Method Not Allowed"}}
```

省略 `Accept` 头会返回 406：

```text
HTTP/1.1 406 Not Acceptable
{"jsonrpc":"2.0","id":"server-error","error":{"code":-32600,"message":"Not Acceptable: Client must accept both application/json and text/event-stream"}}
```

这两种都指向客户端的传输配置，与上游服务器无关。对该端点发 GET 会打开一个 streamable HTTP 事件流（你会看到 `: ping` 保活帧），这是预期行为，不是错误。

### OAuth 发现、DCR 与重定向 {#oauth-issues}

调试任何客户端流程之前，先确认代理已发布 OAuth 元数据：

```bash
curl -sS http://localhost:4000/.well-known/oauth-authorization-server
```

```text
{"issuer":"http://localhost:4000","authorization_endpoint":"http://localhost:4000/v1/mcp/oauth/authorize","token_endpoint":"http://localhost:4000/v1/mcp/oauth/token","response_types_supported":["code"],"grant_types_supported":["authorization_code"],"code_challenge_methods_supported":["S256"]}
```

`issuer` 必须与用户在浏览器里输入的源（origin）一致。如果显示的是入口（ingress）后面的内部主机名，请看下面的 redirect_uri 一节。调试令牌流程时，`x-mcp-debug-oauth2-token` 中出现 `SAME_AS_LITELLM_KEY` 说明泄漏到上游的是 LiteLLM 密钥而不是 OAuth 令牌；见 [OAuth 调试](./mcp_oauth#oauth-调试)。

#### MCP OAuth：Connect 返回 `{"detail":"invalid_request"}` {#mcp-oauth-invalid-request}

**症状**。在 LiteLLM UI 中点击 MCP OAuth 服务器的 **Connect** 按钮时返回：

```text
HTTP/1.1 400 Bad Request
{"detail":"invalid_request"}
```

代理日志（开启 verbose 日志时）会出现类似 `MCP OAuth: rejecting redirect_uri ... as invalid_request. Computed proxy base=...` 的行。

**原因**。`/v1/mcp/server/oauth/{server_id}/authorize` 端点会校验浏览器提供的 `redirect_uri`（`https://llm.example.com/ui/mcp/oauth/callback`）是否与代理自身公网源的 scheme + host + port 一致。在终结 TLS 的入口层（Kubernetes、ALB、nginx、Cloudflare 等）后面，代理默认解析到的是自己的内部地址（`http://<pod-ip>:4000`），于是同源校验拒绝。

**诊断**。把代理对外宣称的源与浏览器看到的源做对比：

```bash
curl -sS https://llm.example.com/.well-known/oauth-authorization-server | jq .issuer
```

`issuer` 的值应等于用户在浏览器里输入的源（`https://llm.example.com`）。如果返回的是内部主机名或 `http://...`，说明代理解析出的源不对。

**修复方案**，按推荐程度排序：

1. **设置 `PROXY_BASE_URL`**（推荐）。由运维方在带外声明代理真正的公网源，无需信任任何请求头：

   ```bash
   PROXY_BASE_URL=https://llm.example.com
   ```

   只填完整源：scheme + host（非默认端口时加上端口），不带末尾斜杠，不带路径。见[反向代理与入口配置](./mcp_oauth#reverse-proxy-and-ingress-configuration)。

2. **信任来自入口层的 `X-Forwarded-*`**。在 `general_settings` 中设置以下两个键：

   ```yaml title="config.yaml" showLineNumbers
   general_settings:
     use_x_forwarded_for: true
     mcp_trusted_proxy_ranges:
       - "10.0.0.0/8"      # your ingress / load-balancer CIDR(s)
   ```

   只设 `use_x_forwarded_for` 还不够。缺少 `mcp_trusted_proxy_ranges` 时，代理会拒绝采纳 `X-Forwarded-*`，因为它无法区分可信反向代理和直接攻击者。请确认你的入口层会发送 `X-Forwarded-Proto`、`X-Forwarded-Host`，以及（运行在非默认端口时的）`X-Forwarded-Port`。

3. **修好入口层**。如果入口层在剥离或改写 `X-Forwarded-*`，任何代理侧设置都无济于事；要在入口层把这些头恢复原样。

对于部署在独立域名上的已批准 OAuth 客户端（例如内部 Web 应用），把回调主机加入 `MCP_TRUSTED_REDIRECT_ORIGINS`。见[允许更多第一方 redirect_uri 来源](./mcp_oauth#allowing-additional-first-party-redirect_uri-origins)。

预注册的 OAuth 应用请看[静态 OAuth 客户端的重定向 URL](./mcp_oauth#static-client-redirect-urls)，其中涵盖 IdP 回调配置、MCP 客户端回调要求和校验报错。

动态客户端注册（DCR）失败时，收集客户端的错误响应以及上文展示的授权服务器元数据。元数据里列出了支持的授权类型。

### 网络、TLS 与超时 {#network-tls-timeouts}

上游不可达并不会以网关 502 的形式暴露。命名端点会返回 200，附带空工具列表和按服务器的状态：

```text
HTTP/1.1 200 OK
event: message
data: {"jsonrpc":"2.0","id":1,"result":{"_meta":{"litellm.ai/server_outcomes":{"brokenserver":{"status":"unreachable"}}},"tools":[]}}
```

代理日志能区分具体是哪类故障。连接被拒或 DNS 问题：

```text
09:00:34 - LiteLLM:WARNING: mcp_server_manager.py - Error listing tools from brokenserver: All connection attempts failed
httpx.ConnectError: All connection attempts failed
```

TLS 故障（证书过期或不受信任）：

```text
09:01:40 - LiteLLM:WARNING: mcp_server_manager.py - Error listing tools from tlsbroken: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: certificate has expired (_ssl.c:1000)
```

遇到超时，给诊断 curl 计时，并对比代理与 MCP 服务器日志中的时间戳，看是哪一侧卡住了。

### 工具列表为空与工具命名 {#empty-tools}

在聚合端点 `/mcp` 上，一台服务器坏了不会导致整个请求失败。健康的服务器照常返回工具，`litellm.ai/server_outcomes` 会逐台报告状态：

```text
data: {"jsonrpc":"2.0","id":1,"result":{"_meta":{"litellm.ai/server_outcomes":{"deepwiki":{"status":"ok","tool_count":3},"brokenserver":{"status":"unreachable"}}},"tools":[{"name":"deepwiki-ask_question",...}]}}
```

如果整个列表为空，去 `server_outcomes` 里逐台查看失败状态，不要靠猜。工具名带服务器别名前缀，所以要调 `deepwiki-ask_question`，而不是 `ask_question`。调用不带前缀或错误的名称时，失败发生在工具结果内部，而不是 HTTP 层：

```text
HTTP/1.1 200 OK
data: {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"Error: Tool 'nonexistent_tool' not found"}],"isError":true}}
```

### Responses 与 Chat Completions 故障 {#responsescompletions-with-embedded-mcp-calls}

在 `/v1/responses` 或 `/v1/chat/completions` 过程中，如果请求携带了 `server_url: "litellm_proxy"` 的 MCP 工具，LiteLLM 会在请求中途执行 MCP 工具调用。请求正常时，输出项里会显式呈现这一 MCP 跳：

```bash
curl -sS http://localhost:4000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "input": "List the top-level wiki pages for BerriAI/litellm",
    "tools": [{"type": "mcp", "server_label": "deepwiki", "server_url": "litellm_proxy", "require_approval": "never"}]
  }'
```

成功时，助手消息旁边会出现 `mcp_tools_fetched` 和 `tool_execution_results` 输出项。如果 `server_label` 与任何已配置别名都对不上，请求仍返回 200，但这些输出项缺失，模型在没有工具的情况下作答；这种静默降级就是要盯的症状。`/v1/chat/completions` 携带相同 `tools` 数组时情况相同。如果工具输出项在但工具结果里含错误，直接跳到矩阵中对应错误的那一行（工具名未知、上游不可达），因为内嵌调用与直接 curl 走的是同一条 MCP 路径。

## 调试响应头 {#debug-headers}

在任何 MCP 请求上加 `x-litellm-mcp-debug: true`，即可拿到脱敏的诊断响应头：

```text
x-mcp-debug-inbound-auth: x-litellm-api-key=Bearer****1234
x-mcp-debug-oauth2-token: (none)
x-mcp-debug-auth-resolution: no-auth
x-mcp-debug-outbound-url: https://mcp.deepwiki.com/mcp
x-mcp-debug-server-auth-type: (none)
```

`x-mcp-debug-auth-resolution` 会告诉你 LiteLLM 如何解析出站认证：`oauth2-passthrough`、`m2m-client-credentials`、`per-request-header`、`static-token` 或 `no-auth`。`x-mcp-debug-outbound-url` 能确认代理实际调用了哪个上游。所有值都已脱敏，可以放心放进支持信息包。

如果是 Claude Code，把调试头加进 MCP 配置即可：

```bash
claude mcp add --transport http my_server http://localhost:4000/deepwiki/mcp \
  --header "x-litellm-api-key: Bearer sk-..." \
  --header "x-litellm-mcp-debug: true"
```

## 验证连通性

### MCP Inspector

需要在同一处同时测试 `Client -> LiteLLM` 和 `Client -> MCP` 两段通信时，用 MCP Inspector；隔离故障一跳会变得非常直观。

1. 在你的工作站上运行 `npx @modelcontextprotocol/inspector`。
2. 配置并连接：
   - **Transport Type**：选择客户端使用的传输方式（LiteLLM 用 Streamable HTTP）。
   - **URL**：待测端点（测 `Client -> LiteLLM` 填 LiteLLM MCP URL，测 `Client -> MCP` 填 MCP 服务器 URL）。
   - **Custom Headers**：例如 `x-litellm-api-key: Bearer <LiteLLM API Key>`。
3. 打开 **Tools** 标签页并点击 **List Tools**，验证该 MCP 别名有响应。

### `curl` 冒烟测试

在不方便安装 Inspector 的服务器上，`curl` 是理想选择。它复现的正是 LiteLLM 将要发起的 MCP 工具调用；把域名换成被测系统（LiteLLM 或 MCP 服务器）即可。

```bash
curl -sS -D - -X POST https://your-target-domain.example.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

目标是需要认证的 LiteLLM 端点时，加上 `-H "x-litellm-api-key: Bearer <LiteLLM API Key>"`。如果 `curl` 与 LiteLLM 出现相同的失败，即可确认问题出在 MCP 服务器或网络/OAuth 层。在 LiteLLM 所在主机上直测 MCP 服务器，则能坐实或排除网络路径这一原因。

### LiteLLM UI / Playground

MCP 创建表单或 MCP 工具测试 Playground 里显示的失败，意味着 LiteLLM 代理够不到 MCP 服务器。常见原因包括配置错误（传输方式、请求头、凭证）、MCP/服务器宕机、网络/防火墙阻断，或 OAuth 元数据无法访问。在 Playground 中复现客户端侧的失败，即可确认问题出在 LiteLLM -> MCP 这一跳，而不是客户端。

<Image
  img={require('../img/mcp_tool_testing_playground.png')}
  style={{width: '80%', display: 'block', margin: '0'}}
/>

## 查看日志

范围明确的日志能说清 LiteLLM 到底有没有到达 MCP 服务器，以及之后发生了什么。

### 访问日志示例（成功的 MCP 调用）

```text
INFO:     127.0.0.1:57230 - "POST /deepwiki/mcp HTTP/1.1" 200 OK
```

### 错误日志示例（失败的 MCP 调用）

```text
07:22:00 - LiteLLM:ERROR: client.py:224 - MCP client list_tools failed - Error Type: ExceptionGroup, Error: unhandled errors in a TaskGroup (1 sub-exception), Server: http://localhost:3001/mcp, Transport: MCPTransport.http
  httpcore.ConnectError: All connection attempts failed
ERROR:LiteLLM:MCP client list_tools failed - Error Type: ExceptionGroup, Error: unhandled errors in a TaskGroup (1 sub-exception)...
  httpx.ConnectError: All connection attempts failed
```

## 支持信息包 {#support-bundle}

如果矩阵没能解决问题，请一次性收集齐下面所有材料。一份完整的支持信息包可以省去支持人员逐步还原你环境的那次沟通。

1. LiteLLM 版本：`curl -sS http://localhost:4000/health/readiness` 的输出，或镜像标签。
2. 配置片段：`mcp_servers` 块，以及 `general_settings` 中所有涉及 MCP 或转发的键，须先移除其中的密钥。
3. 确切失败的请求：完整 curl 命令，密钥脱敏（`sk-****1234`）。
4. 诊断 curl 的 HTTP 状态行、响应头和响应体（`-D -` 的完整输出，不做任何过滤）。
5. 开启 `x-litellm-mcp-debug: true` 后一次运行拿到的 `x-mcp-debug-*` 响应头（本身已脱敏）。
6. 覆盖该失败请求的 LiteLLM 代理日志，可能的话用 `--detailed_debug` 启动。
7. 同一时段的 MCP 服务器日志。
8. 拓扑：客户端、LiteLLM、入口/负载均衡器和 MCP 服务器各自运行在哪，TLS 在哪里终结。
9. 每次抓取请求时带时区的时间戳，便于跨日志对齐。

绝不外发：明文的 LiteLLM 虚拟密钥或主密钥、来自 `mcp_servers` 认证配置的上游 API 密钥或静态令牌、OAuth 客户端密钥、未脱敏的 `Authorization` 头值，以及 `.env` 文件内容。调试响应头做了脱敏，就是为了让你永远不必粘贴真实凭证。
