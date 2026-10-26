# MCP 非 OAuth 认证

本页介绍不经 OAuth 流程的上游 MCP 认证，包括无认证、固定凭据和 AWS SigV4。OAuth 配置请参阅 [MCP OAuth](./mcp_oauth.md)、[MCP OAuth 透传](./mcp_oauth_passthrough.md) 或 [MCP On-Behalf-Of 认证](./mcp_obo_auth.md)。

对一次 MCP 请求，LiteLLM 要处理两段彼此独立的认证：

- **客户端到 LiteLLM**：MCP 客户端证明自己有权使用 LiteLLM 网关（gateway），通常凭一把 LiteLLM API 密钥。
- **LiteLLM 到上游 MCP 服务器**：LiteLLM 按所选服务器配置的 `auth_type` 向上游完成认证。

MCP 服务器上的 `auth_type` 控制的是第二段。用于网关准入的 LiteLLM API 密钥不会被复制给上游服务器。如果希望共享服务器的单个用户或服务账号密钥改用各自的上游凭据，而不是服务器上存储的那一份，请参阅[按用户与按密钥的上游凭据](./mcp_per_user_auth.md)。

:::note[传输范围]

本页的报文示例针对使用 SSE 或 Streamable HTTP 的远程 MCP 服务器。[OpenAPI 生成的 MCP 工具](./mcp_openapi.md)有单独的认证头处理逻辑。

:::

## 选择非 OAuth 认证类型

若要使用固定的非 OAuth 凭据，请根据上游服务器要求的请求头选择对应的类型：

| `auth_type` | 需要提供 | 发往上游的默认凭据 | 使用场景 |
|---|---|---|---|
| `none` | 无 | 不携带凭据 | 上游允许匿名请求，或依赖网络层访问控制 |
| `api_key` | API 密钥值 | `X-API-Key: <auth_value>` | 上游要求 `X-API-Key` 请求头 |
| `bearer_token` | 仅令牌 | `Authorization: Bearer <auth_value>` | 固定的 bearer 令牌、个人访问令牌或服务令牌 |
| `basic` | 原始 `username:password` | `Authorization: Basic <base64(username:password)>` | HTTP Basic 认证 |
| `token` | 仅令牌 | `Authorization: token <auth_value>` | 上游明确使用 GitHub 风格的 `token` 方案 |
| `authorization` | 完整请求头值（含方案前缀） | `Authorization: <auth_value>` | 自定义授权方案；可在 config 和 API 中使用 |
| `aws_sigv4` | AWS 凭据或 IAM 角色 | 为每个请求新生成的 AWS SigV4 签名 | AWS Bedrock AgentCore MCP 服务器 |

## 客户端发送的内容

静态上游凭据存储在 MCP 服务器的配置里。客户端在每次工具请求时不需要发送上游的用户名、密码或 API 密钥。

例如，无论上游服务器用的是 `none`、`basic` 还是 `api_key`，客户端发出的请求都可以完全相同：

```http title="客户端到 LiteLLM"
POST /inventory/mcp HTTP/1.1
Host: litellm.example.com
x-litellm-api-key: Bearer sk-litellm
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

LiteLLM 先认证客户端，再选中 `inventory` 这个 MCP 服务器，并依据该服务器的 `auth_type` 构造上游请求。后续各节将展示最终发往上游的凭据。

`true_passthrough` 和 `oauth_delegate` 例外：这两种类型的上游令牌由客户端提供。参见 [MCP OAuth 透传](./mcp_oauth_passthrough.md)。

## 非 OAuth 认证类型

### 无认证（none）

`auth_type: none` 表示认证解析器（auth resolver）不提供任何上游凭据。

- **行为**：LiteLLM 不会为该类型添加 `Authorization`、`X-API-Key` 或其他任何凭据请求头。
- **适用场景**：上游 MCP 端点不需要应用层凭据，常见例子是公开的 MCP 服务器，或由网络策略保护的私有端点。
- **不适用场景**：上游要求 Basic 认证、API 密钥、bearer 令牌或调用方自有令牌时。

```yaml title="config.yaml"
mcp_servers:
  public_inventory:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "none"
```

上游请求中不含 LiteLLM 添加的任何认证凭据：

```http title="LiteLLM 到上游"
POST /mcp HTTP/1.1
Host: mcp.example.com
Content-Type: application/json
```

:::warning[不要把凭据写进 URL]

当 `auth_type` 为 `none` 时，`https://username:password@mcp.example.com/mcp` 这类 URL 会被拒绝。LiteLLM 不会从 URL 的 userinfo 部分推断 Basic 认证。请移除 URL 中的凭据，改为配置 [`auth_type: basic`](#basic-认证)。

:::

### Basic 认证

`auth_type: basic` 会把原始用户名和密码转换成标准的 HTTP Basic 请求头。

- **认证值**：填写 `username:password`。不要自行做 base64 编码，也不要加 `Basic` 前缀。
- **行为**：LiteLLM 对完整值做 base64 编码、加上 `Basic` 方案，并在每次上游请求中发送同一份服务凭据。
- **适用场景**：上游文档要求 HTTP Basic 认证。

```yaml title="config.yaml"
mcp_servers:
  inventory:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "basic"
    auth_value: os.environ/MCP_BASIC_AUTH # value: username:password
```

若 `MCP_BASIC_AUTH=username:password`，LiteLLM 会发送：

```http title="LiteLLM 到上游"
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

用户名和密码应放在 `auth_value` 里，而不是写进服务器 URL。

### API 密钥

`auth_type: api_key` 会在 `X-API-Key` 中发送一个固定密钥。

- **认证值**：只填密钥值本身。
- **行为**：LiteLLM 在每次上游请求中发送同一个密钥。
- **适用场景**：上游文档要求 `X-API-Key`。

```yaml title="config.yaml"
mcp_servers:
  inventory:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "api_key"
    auth_value: os.environ/INVENTORY_API_KEY
```

```http title="LiteLLM 到上游"
X-API-Key: <INVENTORY_API_KEY>
```

如果上游要求的请求头名称不同，可使用 [`static_headers`](#自定义与转发头) 或设置 `upstream_token_header`。

### Bearer 令牌

`auth_type: bearer_token` 会为固定令牌加上 `Bearer` 方案。

- **认证值**：只填令牌本身，不要加 `Bearer` 前缀。
- **行为**：LiteLLM 在每次上游请求中发送 `Authorization: Bearer <token>`。
- **适用场景**：上游接受固定 bearer 令牌，例如服务令牌或个人访问令牌。如果令牌需要签发、刷新、交换，或由调用方提供，请参阅 [MCP OAuth](./mcp_oauth.md)。

```yaml title="config.yaml"
mcp_servers:
  inventory:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "bearer_token"
    auth_value: os.environ/INVENTORY_TOKEN
```

```http title="LiteLLM 到上游"
Authorization: Bearer <INVENTORY_TOKEN>
```

### Token 认证

`auth_type: token` 使用小写的 `token` 授权方案。

- **认证值**：只填令牌本身，不要加 `token` 前缀。
- **行为**：LiteLLM 发送 `Authorization: token <token>`。
- **适用场景**：上游文档明确声明使用该方案时。标准 bearer 认证请使用 `bearer_token`。

```yaml title="config.yaml"
mcp_servers:
  legacy_service:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "token"
    auth_value: os.environ/LEGACY_SERVICE_TOKEN
```

```http title="LiteLLM 到上游"
Authorization: token <LEGACY_SERVICE_TOKEN>
```

### Authorization 认证

`auth_type: authorization` 会把认证值原样放入 `Authorization` 请求头。

- **认证值**：填写完整值，包括方案或前缀。
- **行为**：LiteLLM 不添加、不删除、也不修改方案。
- **适用场景**：上游使用的授权方案不在其他静态类型覆盖范围内。该取值在 `config.yaml` 和服务器 API 中均受支持，但目前尚未出现在管理界面（Admin UI）的选项列表里。

```yaml title="config.yaml"
mcp_servers:
  custom_scheme:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "authorization"
    auth_value: os.environ/CUSTOM_AUTH_HEADER # value: Custom <token>
```

```http title="LiteLLM 到上游"
Authorization: Custom <CUSTOM_AUTH_TOKEN>
```

### AWS SigV4

`auth_type: aws_sigv4` 不附加固定令牌，而是用 AWS Signature Version 4 为每个请求签名。

- **行为**：LiteLLM 对每个请求做哈希并签名，然后添加 AWS 要求的 `Authorization`、`x-amz-date` 及临时凭据等请求头。
- **适用场景**：上游是 AWS Bedrock AgentCore MCP 服务器。
- **凭据来源**：可使用显式配置的 AWS 凭据、boto3 凭据链，或 LiteLLM 可代入（assume）的 IAM 角色。

```yaml title="config.yaml"
mcp_servers:
  agentcore:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN
    aws_region_name: "us-east-1"
    aws_service_name: "bedrock-agentcore"
```

配置方法与故障排查见 [MCP AWS SigV4 认证](./mcp_aws_sigv4.md)。

## 自定义与转发头

有些上游要求自定义的请求头名称，或同时要求多个固定请求头。以下配置与 `auth_type` 相互独立：

- **`static_headers`**：LiteLLM 会把配置的值加到每个上游请求上。适合放置自定义静态凭据、租户标识或辅助网关凭据。
- **`extra_headers`**：LiteLLM 只把当前客户端请求中指定名称的请求头复制到上游。适合传递客户端自有的请求级上下文。

```yaml title="config.yaml"
mcp_servers:
  custom_headers:
    url: "https://mcp.example.com/mcp"
    transport: "http"
    auth_type: "none"
    static_headers:
      X-Custom-Auth: os.environ/MCP_CUSTOM_AUTH
    extra_headers:
      - X-Tenant-ID
```

在上面的示例里，`none` 解析器仍然不提供任何凭据。`X-Custom-Auth` 之所以存在，是因为它在 `static_headers` 中被单独声明。

如果 `Authorization` 里是调用方自有的 OAuth bearer 令牌，请使用 `true_passthrough` 或 `oauth_delegate`，不要把它当作普通的附加请求头处理。
