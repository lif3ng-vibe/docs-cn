import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP 零信任认证（JWT 签名器）

![零信任 MCP 网关](/img/mcp_zero_trust_gateway.png)

MCP（Model Context Protocol）服务器本身没有内置手段验证请求是否真的经过了 LiteLLM。缺少这道防护栏（guardrail）时，任何能直接访问你 MCP 服务器的客户端都能调用工具，完全绕过你的访问控制。

`MCPJWTSigner` 解决了这个问题。它用短时效的 RS256 JWT 为每个出站工具调用签名，你的 MCP 服务器再用 LiteLLM 的公钥校验签名。未经过 LiteLLM 的请求拿不到有效签名，会被直接拒绝。

---

## 基础配置

在配置中加入这个防护栏，并把 MCP 服务器指向 LiteLLM 的 JWKS 端点（endpoint）。此后每次工具调用都会自动附带签好名的 JWT，客户端侧无需任何改动。

```yaml title="config.yaml"
mcp_servers:
  - server_name: weather
    url: http://localhost:8000/mcp
    transport: http

guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"  # defaults to request base URL
      audience: "mcp"                            # default: "mcp"
      ttl_seconds: 300                           # default: 300
```

**自带签名密钥**。生产环境建议这样做，因为自动生成的密钥会在重启后丢失。

```bash
export MCP_JWT_SIGNING_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
# or point to a file
export MCP_JWT_SIGNING_KEY="file:///secrets/mcp-signing-key.pem"
```

**用 [FastMCP](https://gofastmcp.com) 构建一个经过验证的 MCP 服务器**：

```python title="weather_server.py"
from fastmcp import FastMCP, Context
from fastmcp.server.auth.providers.jwt import JWTVerifier

auth = JWTVerifier(
    jwks_uri="https://my-litellm.example.com/.well-known/jwks.json",
    issuer="https://my-litellm.example.com",
    audience="mcp",
    algorithm="RS256",
)

mcp = FastMCP("weather-server", auth=auth)

@mcp.tool()
async def get_weather(city: str, ctx: Context) -> str:
    caller = ctx.client_id  # JWT `sub` — the verified user identity
    return f"Weather in {city}: sunny, 72°F (requested by {caller})"

if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
```

FastMCP 会自动获取 JWKS，并在签名密钥变化时重新获取。

LiteLLM 发布了 OIDC 发现（discovery）信息，MCP 服务器无需任何手工配置就能找到密钥：

```
GET /.well-known/openid-configuration  →  { "jwks_uri": "https://<litellm>/.well-known/jwks.json" }
GET /.well-known/jwks.json             →  { "keys": [{ "kty": "RSA", "alg": "RS256", ... }] }
```

> **只有确实需要以下能力时才继续往下读**：把企业 IdP 的身份写入 JWT、对调用方强制校验特定 claims（声明）、添加自定义元数据、使用 AWS Bedrock AgentCore Gateway，或排查 JWT 被拒问题。

---

## 将 IdP 身份写入 MCP JWT

默认情况下，出站 JWT 的 `sub` 是 LiteLLM 内部的 `user_id`。如果你的用户是通过 Okta、Azure AD 或其他 IdP 认证的，MCP 服务器看到的将是一个 LiteLLM 内部 ID，而不是用户的邮箱或员工 ID。

采用验证加重签（verify+re-sign）模式后，LiteLLM 会先校验传入的 IdP 令牌，再用其中的真实身份 claims 构建出站 JWT。MCP 服务器由此拿到用户的真实身份，且无需直接信任原始 IdP。

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"

      # Validate the incoming Bearer token against the IdP
      access_token_discovery_uri: "https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration"
      verify_issuer: "https://login.microsoftonline.com/{tenant}/v2.0"
      verify_audience: "api://my-app"

      # Which claim to use for `sub` in the outbound JWT — first non-empty value wins
      end_user_claim_sources:
        - "token:sub"       # from the verified incoming JWT
        - "token:email"     # fallback to email
        - "litellm:user_id" # last resort: LiteLLM's internal user_id
```

如果传入的令牌是**不透明令牌**（opaque）而非 JWT（有些 IdP 签发这种令牌），就需要补一个内省（introspection）端点。LiteLLM 会把令牌 POST 到该端点（RFC 7662），并使用返回的 claims：

```yaml
      token_introspection_endpoint: "https://idp.example.com/oauth2/introspect"
```

**`end_user_claim_sources` 支持的取值**：

| 取值 | 解析结果 |
|--------|-------------|
| `token:<claim>` | 已验证传入 JWT 中的任意 claim（如 `token:sub`、`token:email`、`token:oid`） |
| `litellm:user_id` | LiteLLM 内部的用户 ID |
| `litellm:email` | LiteLLM 认证上下文中的用户邮箱 |
| `litellm:end_user_id` | 单独设置时的终端用户 ID |
| `litellm:team_id` | LiteLLM 认证上下文中的团队 ID |

---

## 拦截缺少必需属性的调用方

有些 MCP 服务器会暴露敏感操作，只应让经过验证的员工触达，服务账号和外部 API 密钥都不应访问。你可以在 LiteLLM 这一层强制执行这条规则，让 MCP 服务器根本收不到这类请求。

只要传入令牌缺少所列 claim 中的任何一项，`required_claims` 就会以 `403` 拒绝请求。`optional_claims` 则转发那些有用但非必需的 claims。

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      access_token_discovery_uri: "https://idp.example.com/.well-known/openid-configuration"

      # Service accounts without `employee_id` are blocked before the tool runs
      required_claims:
        - "sub"
        - "employee_id"

      # Forward these into the outbound JWT when present — skipped silently if absent
      optional_claims:
        - "groups"
        - "department"
```

**被拦截时客户端看到的响应**：
```text
HTTP 403
{ "error": "MCPJWTSigner: incoming token is missing required claims: ['employee_id']. Configure the IdP to include these claims." }
```

---

## 为每个 JWT 添加自定义元数据

你的 MCP 服务器可能需要一些 LiteLLM 原生不携带的上下文：请求由哪个部署发出、租户 ID、环境标签等。利用 claim 操作即可向出站 JWT 注入、覆盖或删除 claims。

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      # add: insert only when the key is not already in the JWT
      add_claims:
        deployment_id: "prod-us-east-1"
        tenant_id: "acme-corp"

      # set: always override — even if the claim came from the incoming token
      set_claims:
        env: "production"

      # remove: strip claims the MCP server shouldn't see
      remove_claims:
        - "nbf"   # some validators reject nbf; remove it if yours does
```

操作按顺序执行：`add_claims` → `set_claims` → `remove_claims`。`set_claims` 总是覆盖 `add_claims`；`remove_claims` 优先级最高。

---

## AWS Bedrock AgentCore Gateway

Bedrock AgentCore Gateway 使用两个独立的 JWT：一个用于传输层连接认证，另一个用于工具调用授权。二者需要不同的 `aud` 取值和 TTL，单个 JWT 无法同时满足。

LiteLLM 可以在一次 hook 中同时签发这两个 JWT，并注入到不同的请求头：

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      issuer: "https://my-litellm.example.com"
      audience: "mcp-resource"   # for the MCP resource layer
      ttl_seconds: 300

      # Second JWT for the transport channel — same sub/act/scope, different aud + TTL
      channel_token_audience: "bedrock-agentcore-gateway"
      channel_token_ttl: 60      # transport tokens should be short-lived
```

LiteLLM 会在每次工具调用时注入两个请求头：
- `Authorization: Bearer <resource-token>`——audience 为 `mcp-resource`，TTL 300 秒
- `x-mcp-channel-token: Bearer <channel-token>`——audience 为 `bedrock-agentcore-gateway`，TTL 60 秒

两个令牌都用同一把 LiteLLM 密钥签名，因此你的 MCP 服务器只需信任一个 JWKS 端点。

---

## 控制 JWT 中的 scope

默认情况下，LiteLLM 会按请求生成最小权限的 scope：
- 工具调用 → `mcp:tools/call mcp:tools/{name}:call`
- 列出工具 → `mcp:tools/call mcp:tools/list`

如果你的 MCP 服务器自行执行 scope 校验、且要求特定格式，可以设置 `allowed_scopes` 来完全取代自动生成：

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true

      allowed_scopes:
        - "mcp:tools/call"
        - "mcp:tools/list"
        - "mcp:admin"
```

无论调用哪个工具，每个 JWT 携带的都是这几个 scope。

---

## 排查 JWT 被拒问题

MCP 服务器一直返回 401，而你拿不准 JWT 里到底是什么。启用 `debug_headers` 后，LiteLLM 会添加 `x-litellm-mcp-debug` 响应头，其中包含签名时使用的关键 claims：

```yaml title="config.yaml"
guardrails:
  - guardrail_name: mcp-jwt-signer
    litellm_params:
      guardrail: mcp_jwt_signer
      mode: pre_mcp_call
      default_on: true
      debug_headers: true
```

响应头：
```
x-litellm-mcp-debug: v=1; kid=a3f1b2c4d5e6f708; sub=alice@corp.com; iss=https://my-litellm.example.com; exp=1712345678; scope=mcp:tools/call mcp:tools/get_weather:call
```

检查 `kid` 是否与 MCP 服务器从 JWKS 拿到的一致，`iss`/`aud` 是否与服务器预期相符，以及 `exp` 是否尚未过期。生产环境请关闭该选项，因为这个响应头会泄露 claim 元数据。

---

## JWT claims 参考

| Claim | 取值 |
|-------|-------|
| `iss` | `issuer` 配置值（或请求的 base URL） |
| `aud` | `audience` 配置值（默认 `"mcp"`） |
| `sub` | 通过 `end_user_claim_sources` 解析（默认：`user_id` → api-key 哈希 → `"litellm-proxy"`） |
| `act.sub` | `team_id` → `org_id` → `"litellm-proxy"`（RFC 8693 委派） |
| `email` | LiteLLM 认证上下文中的 `user_email`（若存在） |
| `scope` | 每次工具调用自动生成；设置了 `allowed_scopes` 时则用后者 |
| `iat`, `exp`, `nbf` | 标准时间 claims（RFC 7519） |

---

## 已知限制

- **基于 OpenAPI 的 MCP 服务器**（设置了 `spec_path`）不支持 JWT 注入，LiteLLM 会记录一条警告并跳过该请求头。要获得完整的 JWT 注入，请使用 SSE/HTTP 传输的服务器。
- 密钥对**默认仅存于内存**，除非设置了 `MCP_JWT_SIGNING_KEY`，否则每次重启都会轮换。FastMCP 的 `JWTVerifier` 通过 JWKS key ID 匹配来透明处理密钥轮换。

---

## 相关阅读

- [MCP Guardrails](./mcp_guardrail)——MCP 调用的 PII（个人身份信息）脱敏与拦截
- [MCP OAuth](./mcp_oauth)——通过上游 OAuth2 访问 MCP 服务器
- [MCP AWS SigV4](./mcp_aws_sigv4)——向 MCP 服务器发送 AWS 签名请求
