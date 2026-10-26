import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# Microsoft Agent 365 防护栏

在 LiteLLM 执行每个 MCP（Model Context Protocol）工具调用之前，先将其送往 [Microsoft Agent 365](https://learn.microsoft.com/en-us/agent-365/overview) 的评估 API。Microsoft Defender 返回放行或阻断的裁定，该调用也会以登录用户的身份记录在 Microsoft 侧

<Image img={require('../../../img/agent365_guardrail_flow.png')} style={{ width: '100%', maxWidth: '4000px' }} alt="MCP 工具调用从客户端发往 LiteLLM MCP 网关，网关以 On-Behalf-Of 方式交换用户的 Entra 令牌，向 Microsoft Agent 365 与 Defender 请求裁定，随后在 MCP 服务器上执行该工具或将其阻断，并把防护栏状态记入请求日志" />

## 支持的模式

| 模式 | 作用 |
|------|------|
| `pre_mcp_call` | 在执行前用 Defender 评估工具名称、参数和服务器。裁定为阻断时拦截调用 |

该防护栏（guardrail）只作用于 MCP 工具调用，对话补全（chat completion）和其他 LLM 路由不受影响

## 工作原理

Agent 365 以登录用户的身份进行评估，因此每个受防护的工具调用都需要在 `Authorization` 请求头中携带该用户的 Entra 访问令牌，且令牌的受众（audience）必须指向你的网关应用注册。防护栏会通过 On-Behalf-Of（OBO）机制将其换取一个委托的 Agent 365 令牌，并以该用户身份完成评估。不存在服务或代理身份模式：缺少用户令牌的调用会被拒绝

LiteLLM 密钥则通过 `x-litellm-api-key` 单独传递。在已通过 [JWT 认证](/docs/proxy/token_auth)接受 Entra 令牌的代理上，Entra 令牌同时也是 LiteLLM 的凭据

每次工具调用的处理流程：

1. LiteLLM 准入检查：先校验密钥或 JWT，再校验该密钥的 MCP 服务器与工具权限。凭据无效会在此处以常见的 401 或 403 失败
2. 防护栏从 `Authorization` 中读取 Entra 令牌。缺失或不是 JWT 时，调用被拒绝
3. 进行 OBO 交换，结果在令牌有效期内缓存
4. 将待执行的调用送往 Agent 365，内容包括：工具名称、参数、服务器名称、`conversationId`，如果 LiteLLM 此前列举过该服务器的工具，还包括工具描述与输入 schema；若调用方密钥设有别名，则以该密钥别名作为 agent id。用户的提示词（prompt）绝不发送
5. 放行且 `defender.status: Evaluated`：LiteLLM 执行该工具。阻断：调用被拒绝，附带 Defender 消息与关联 id（correlation id），MCP 服务器不会被联系。放行但未评估（`Skipped`、`FailedOpen`）：视为未扫描，由 `unreachable_fallback` 决定处置（默认阻断）

拒绝信息如何送达客户端取决于路由。`/mcp-rest/tools/call` 会按[失败行为](#失败行为)中的 HTTP 状态码响应，并返回完整的 JSON 响应体。在 `/mcp` 传输方式下，HTTP 响应为 200，工具结果带 `isError: true`，只包含简短的错误信息，例如 `Error: Blocked by Microsoft Defender`。包含 Defender 消息与关联 id 的完整响应体，在该调用的[日志行](#日志)的错误详情中

### MCP 服务器认证类型

防护栏不检查服务器的 `auth_type`。它总是从客户端的 `Authorization` 请求头中获取用户令牌，因此请选择能把该请求头留在网关侧的认证类型

| `auth_type` | 与防护栏配合时的行为 |
|-------------|--------------------|
| `none`, `api_key`, `bearer_token`, `basic`, `authorization`, `token`, `aws_sigv4`, `oauth2` with `oauth2_flow: client_credentials` | 可用。上游拿到的是服务器自身的凭据，绝不会是用户的 Entra 令牌。不要把 `Authorization` 列入 `extra_headers`；转发 `x-api-key` 之类的其他客户端请求头没有问题 |
| `oauth2_token_exchange` | 可用。同一个 Entra 令牌就是 LiteLLM 与上游交换所用的主体令牌（subject token），参见 [MCP OBO 认证](/docs/mcp_obo_auth) |
| `true_passthrough`, `Authorization` under `extra_headers` | 会照常评估与阻断，与其他服务器无异，但用户的 Entra 令牌也会在每次请求（包括工具列举）时转发给上游。启用 JWT 认证时，该令牌同时还是用户的 LiteLLM 凭据。避免使用 |
| `oauth_delegate`, or `oauth2` with `delegate_auth_to_upstream: true` and any flow other than `client_credentials` | 当调用在 `x-litellm-api-key` 中携带 LiteLLM 密钥时，行为与 `true_passthrough` 相同：Entra 令牌会被转发到上游。对仅用 JWT 的调用方，LiteLLM 会剥离该令牌，上游拿不到任何凭据。避免使用 |
| `oauth2` with `oauth2_flow: authorization_code` | LiteLLM 会用该用户在此服务器上已保存的 OAuth 令牌替代客户端的 `Authorization` 发给上游，因此 Entra 令牌可以留在 `Authorization` 中。凭据保存在调用方的 LiteLLM `user_id` 名下，所以虚拟密钥（virtual key）必须归属到某个用户（[MCP OAuth](/docs/mcp_oauth)）。在用户存有凭据之前，调用会在防护栏运行前失败：`/mcp` 对 `initialize` 返回 401，`/mcp-rest/tools/call` 返回 500 `Tool ... not found` |
| `oauth2_id_jag` | 工具列举使用该用户已保存的 SSO 断言；没有断言时，列举以 412 失败，调用则在防护栏运行前以 `Tool ... not found`（REST 500）失败。有断言时，防护栏正常评估，随后 `Authorization` 中的 Entra 令牌会顶替 SSO 断言成为 ID-JAG 主体，除非设置了 `subject_token_type`，否则以 `id_token` 形式发送。若身份提供方不接受该令牌，交换会失败，客户端在评估完成后收到 503。这类服务器请关闭防护栏，或改用 `oauth2_token_exchange` |

## 前置条件

以下 Entra 设置由租户管理员一次性完成

1. 联系你的 Microsoft Agent 365 对接人，为你的租户开通权限。在此之前，评估端点会返回 `409 BAPForbiddenTenantAccess`
2. 在 **Microsoft Entra ID > App registrations** 下注册一个网关应用，选择单租户，不配置重定向 URI。记下 client id 和 tenant id，并在 **Certificates & secrets** 下创建一个 client secret。它们分别对应防护栏的 `client_id`、`tenant_id` 和 `client_secret`
3. 在 **Expose an API** 下，把 Application ID URI 设为 `api://<client_id>`，并添加名为 `access_as_user` 的作用域（scope）。MCP 客户端请求的就是这个作用域
4. 仍在 **Expose an API** 下，为用户使用的每个应用预先授权其 client id。若要在终端里测试，请预先授权 Azure CLI（Microsoft 的公开应用 id `04b07795-8ddb-461a-bbee-02f9e1bf7b46`）
5. 在 **API permissions > Add a permission > APIs my organization uses** 下，添加 **Agent Tools** API（Microsoft 的公开应用 id `ea9ffc3e-8a23-4a7d-836d-234d7c7565c1`），勾选委托权限 `ThreatProtection.Evaluate.All`，并授予管理员同意。必须是委托（delegated）权限而非应用程序（application）权限：应用程序权限签发的令牌会被 Agent 365 拒绝

在动 LiteLLM 之前，先验证上述设置

```bash
az login --tenant <tenant_id>
az account get-access-token --tenant <tenant_id> --resource api://<gateway_client_id>
```

解码该令牌，确认 `aud` 为 `api://<gateway_client_id>` 且 `scp` 包含 `access_as_user`。这就是你的 MCP 客户端要发送的令牌

## 快速上手

### 1. 在 `config.yaml` 中定义防护栏

步骤 3 中的虚拟密钥需要数据库支持

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL

guardrails:
  - guardrail_name: agent365-mcp
    litellm_params:
      guardrail: agent_365
      mode: pre_mcp_call
      default_on: true
      tenant_id: os.environ/AGENT365_TENANT_ID
      client_id: os.environ/AGENT365_CLIENT_ID
      client_secret: os.environ/AGENT365_CLIENT_SECRET

mcp_servers:
  deepwiki:
    transport: "http"
    url: "https://mcp.deepwiki.com/mcp"
```

### 2. 启动代理

```bash
export AGENT365_TENANT_ID="<your Entra tenant id>"
export AGENT365_CLIENT_ID="<gateway app client id>"
export AGENT365_CLIENT_SECRET="<gateway app client secret>"
export LITELLM_MASTER_KEY="sk-<your-master-key>"
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>"

litellm --config config.yaml
```

### 3. 为 MCP 服务器创建密钥

```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key_alias": "my-agent", "object_permission": {"mcp_servers": ["deepwiki"]}}'
```

`key_alias` 就是 Agent 365 在每次评估中记录的 agent id

### 4. 调用 MCP 工具

```bash
export LITELLM_API_KEY="<key from step 3>"
TOKEN=$(az account get-access-token --tenant <tenant_id> --resource api://<gateway_client_id> --query accessToken -o tsv)
curl -X POST http://localhost:4000/mcp-rest/tools/call \
  -H "x-litellm-api-key: Bearer $LITELLM_API_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "deepwiki",
    "name": "read_wiki_structure",
    "arguments": {"repoName": "BerriAI/litellm"}
  }'
```

放行的调用返回工具结果；被阻断的调用返回 HTTP 400

```json
{
  "detail": {
    "error": "Blocked by Microsoft Defender",
    "message": "Invocation of 'read_wiki_structure' is blocked by Microsoft Threat Detection policies configured by your administrator.",
    "tool": "read_wiki_structure",
    "correlation_id": "<id to look the call up on the Microsoft side>",
    "guardrail_name": "agent365-mcp",
    "guardrail_mode": "pre_mcp_call"
  }
}
```

## 日志

每个受防护的工具调用，无论放行、阻断还是被拒，也不论走 `/mcp` 还是 `/mcp-rest/tools/call`，都会在管理界面（Admin UI）的 **Logs** 下生成一行记录（[UI 日志](/docs/proxy/ui_logs)）。该行始终显示防护栏名称、模式和状态。Agent 365 调用耗时也会显示，但 Agent 365 未被调用、未应答（不可达或超时）或返回 5xx、响应体无法解析时除外。状态取值：放行的调用为 `success`；Defender 阻断、调用方被拒或请求被 Agent 365 拒绝为 `guardrail_intervened`；无法询问 Agent 365 或 Entra、调用被限流、返回 5xx 或无法解析的响应、网关自身凭据被拒，或 Defender 未评估为 `guardrail_failed_to_respond`。被拒调用的错误详情中带有完整错误响应体，包括阻断时 Defender 的消息与关联 id

记录行中的防护栏响应，含裁定结果（`Allow`、`Block`、`Rejected`、`Throttled`、`Unavailable`、`Unscanned`）、Defender 状态、关联 id、延迟与失败原因，只有在开启 `store_prompts_in_spend_logs` 后才会保存。未开启时，响应显示为 `REDACTED_BY_LITELM`

```yaml
general_settings:
  store_prompts_in_spend_logs: true
```

## 调用方场景

用户令牌如何进入请求

### A. 使用 Entra JWT 认证的代理上的应用程序

配置 `enable_jwt_auth` 并以 Entra 作为签发方（[OIDC JWT 认证](/docs/proxy/token_auth)）时，应用的 Entra bearer 令牌既是 LiteLLM 凭据，也是 OBO 的主体。无需 `x-litellm-api-key`。令牌必须签发给网关应用（`aud` 为 `api://<gateway_client_id>`，`scp` 含 `access_as_user`）；面向 Microsoft Graph 或其他 API 的令牌通不过 JWT 准入

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL
  enable_jwt_auth: true
  litellm_jwtauth:
    user_id_jwt_field: oid
    user_email_jwt_field: email
    user_id_upsert: true
    team_id_default: entra-users
```

```bash
export JWT_PUBLIC_KEY_URL="https://login.microsoftonline.com/<tenant_id>/discovery/keys"
export JWT_AUDIENCE="api://<gateway_client_id>"
export JWT_ISSUER="https://sts.windows.net/<tenant_id>/"
```

`team_id_default` 是 JWT 调用方继承 MCP 权限的团队。首次调用之前就要创建它并授予相应 MCP 服务器的访问权限，否则每次调用都会得到 HTTP 404 `Team doesn't exist in db`

```bash
curl -X POST http://localhost:4000/team/new \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "entra-users", "team_alias": "entra-users", "object_permission": {"mcp_servers": ["<server_id>"]}}'
```

`<server_id>` 取自 `GET /v1/mcp/server`。如果应用签发的是 v2 令牌，请把 `https://login.microsoftonline.com/<tenant_id>/v2.0` 用作签发方。这类调用方没有虚拟密钥，因此其评估记录不带 agent id

### B. 自行获取令牌的客户端

脚本或使用静态请求头的 MCP 客户端，用 MSAL 或 Azure CLI（已在前置条件第 4 步预先授权）获取一个以网关为受众的令牌，并将其与 LiteLLM 密钥一同发送，与快速上手中的做法完全一致。刷新由客户端自行负责；Entra 访问令牌的有效期约一小时。同样的请求头适用于 `/mcp` 传输方式，也适用于 `claude mcp add ... -H "Authorization: Bearer $TOKEN"`。REST 门面详见 [MCP REST API](/docs/mcp_rest_api)

防护栏不会发送登录质询，因此只带 LiteLLM 密钥的调用会被拒绝，直到客户端自行附上 Entra 令牌。`/mcp-rest/tools/call` 返回 401，`/mcp` 返回 `isError` 工具结果，参见[失败行为](#失败行为)

### 两层授权

哪些密钥、用户和团队能访问哪些服务器与工具，由 LiteLLM 决定（[MCP 权限管理](/docs/mcp_control)）；工具在上游系统内部能做什么，则由上游根据 LiteLLM 出示的凭据决定。使用共享 API 密钥时，上游看到的是一个服务身份；要让上游看到登录用户，请使用 `auth_type: oauth2_token_exchange`（[MCP OBO 认证](/docs/mcp_obo_auth)）。无论哪种方式，防护栏都会评估该调用

## 配置参数

| 参数 | 必填 | 说明 |
|-----------|----------|-------------|
| `tenant_id` | 是 | Entra 租户 id。缺省时回退到 `AGENT365_TENANT_ID` |
| `client_id` | 是 | 网关应用注册的 client id。缺省时回退到 `AGENT365_CLIENT_ID` |
| `client_secret` | 是 | 该应用的 client secret。也接受 `api_key` 作为参数名。缺省时回退到 `AGENT365_CLIENT_SECRET` |
| `timeout` | 否 | 每次令牌交换与评估请求的超时秒数。默认为 10 |
| `unreachable_fallback` | 否 | Agent 365 或 Entra 不可达、Entra 拒绝网关自身凭据，或 Defender 未评估时的处置方式。`fail_closed`（默认）以 HTTP 503 阻断；`fail_open` 放行调用但不扫描，并以 error 级别记录日志。阻断、拒绝、限流和调用方自身的问题始终阻断 |

没有其他可配置的端点。评估请求发往 `https://agent365.svc.cloud.microsoft`；OBO 交换发往 `https://login.microsoftonline.com`，并为 Microsoft 的 Agent Tools 应用换取令牌；评估记录中的 agent id 就是调用方的密钥别名。config.yaml 中旧有的 `api_base`、`resource_app_id` 和 `agent_id` 配置项会被忽略，并在启动时给出警告

## 失败行为

默认情况下防护栏 fail closed（失效即阻断）：无法询问 Agent 365 时，调用被阻断，MCP 服务器不会被联系。防护栏位于每个工具调用的请求路径上，因此更看重可用性而非覆盖面的租户可以通过 `unreachable_fallback: fail_open` 选择放开，此时调用会执行，并被记录为未扫描

下列状态码是 `/mcp-rest/tools/call` 的返回值。在 `/mcp` 传输方式下，每次拒绝都是一个携带 `error` 文本的 `isError` 工具结果，参见[工作原理](#工作原理)

| 情形 | Fail closed | Fail open |
|-----------|-------------|-----------|
| Defender 阻断 | 400 | 400 |
| Agent 365 拒绝请求（408 和 429 以外的 4xx） | 400 | 400 |
| 调用方未携带 Entra 令牌，或令牌被 Entra 拒绝 | 401 | 401 |
| Agent 365 或 Entra 限流（408 或 429） | 503 | 503 |
| Entra 拒绝网关自身凭据 | 503 | 放行，未扫描 |
| Agent 365 或 Entra 不可达、超时、返回 5xx 或响应无法解析 | 503 | 放行，未扫描 |
| Defender 未评估（`Skipped` 或 `FailedOpen`） | 503 | 放行，未扫描 |

`error` 字段可用于区分各类拒绝。Defender 阻断为 `Blocked by Microsoft Defender`，并附带 Defender 消息与关联 id；Agent 365 拒绝为 `Agent 365 rejected the tool evaluation request`；调用方被拒为 `Agent 365 guardrail rejected the tool call`；所有 503 均为 `Agent 365 guardrail could not authorize the tool call`，原因写在 `message` 中

令牌缺失、不是 JWT，或 Entra 对 OBO 交换返回 `invalid_grant`（已过期、受众错误、缺少同意），畸形令牌则返回 `invalid_client` 时，调用方会被拒绝。消息中只给出该错误码，完整的 `AADSTS` 描述在日志行的错误详情里。网关自身凭据被拒时，错误码为 `invalid_client`、`unauthorized_client`、`invalid_scope` 或 `invalid_resource`，503 消息会指明需要检查的配置项。这种情况绝不会是 401，因此客户端不会要求用户重新登录

### 监控 fail-open 调用

使用 `fail_open` 时，每个未扫描放行的调用都会以 error 级别记录日志并附带原因。其日志行的请求状态为 Success、防护栏状态为 `guardrail_failed_to_respond`，对应的 OpenTelemetry 防护栏 span 也带有相同的 `guardrail_status`。Logs 页面的 Status 过滤器只区分 Success 与 Failure，因此请打开 **Guardrails Monitor** 下的防护栏，在其日志列表中选择 **Flagged**，这样能在最近 50 次调用中保留 `guardrail_failed_to_respond` 的记录行（调大 **Sample** 可看到多于 10 条）；如果这里持续出现记录，说明 Agent 365 没有在评估你的工具调用。fail closed 的拒绝和被限流的调用同样会被标记，所以要靠裁定结果（`Unscanned`、`Unavailable` 或 `Throttled`）或请求状态（拒绝为 Failure）来区分。span 中始终带有裁定结果；日志行上则需要开启 `store_prompts_in_spend_logs`

## 会话分组

Agent 365 按 `conversationId` 对评估进行分组。传输方式带有 `Mcp-Session-Id` 时，防护栏会发送它，因此同一个 MCP 会话中的所有调用都归入同一个 Defender 会话。无状态调用（`/mcp-rest/tools/call`，或不带会话的 streamable 请求）使用 LiteLLM 为该调用生成的请求 id，也就是日志行显示的那个 id
