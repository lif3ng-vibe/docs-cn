import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';

# MCP 概览

LiteLLM 代理服务器（Proxy）提供一个 MCP（Model Context Protocol）网关，让你通过一个固定端点使用所有 MCP 工具，并按密钥、团队控制 MCP 访问权限。

<Image
  img={require('../img/mcp_2.png')}
  style={{width: '100%', display: 'block', margin: '2rem auto'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>LiteLLM MCP 架构：在所有 LiteLLM 支持的模型上使用 MCP 工具</p>

## 概览
| 功能 | 说明 |
|---------|-------------|
| MCP 操作 | • 列出工具<br/>• 调用工具<br/>• 提示词（Prompts）<br/>• 资源（Resources） |
| 直接 REST API | [`/mcp-rest/tools/list` 与 `/mcp-rest/tools/call`](./mcp_rest_api.md)——用 curl 直接调用工具，无需 LLM |
| 支持的 MCP 传输方式 | • Streamable HTTP<br/>• SSE<br/>• 标准输入/输出（stdio） |
| LiteLLM 权限管理 | • 按密钥<br/>• 按团队<br/>• 按组织 |

:::warning[MCP 协议更新]
网关会在 `initialize` 阶段协商协议版本，参见[已测试的版本与能力限制](./mcp_config_reference#protocol-version)。<br/>
LiteLLM 通过在工具名前加上所属 MCP 服务器的名称来区分多个 MCP 服务器，因此新建服务器必须使用符合 SEP-986 的名称，不合规的名称将无法再添加。仍不符合 SEP-986 的现有服务器目前只会触发警告，但 MCP 侧后续上线时可能彻底封禁这些名称。建议在 MCP 强制执行导致旧名称不可用之前，主动更新遗留的服务器名称。
:::

想知道该用哪个端点、哪种传输方式、哪种认证模式，请参阅这份一站式决策参考：[MCP 配置参考](./mcp_config_reference)

## 添加你的 MCP

### 前提条件

要把 MCP 服务器存入数据库，需要先启用数据库存储：

**环境变量**：
```bash
export STORE_MODEL_IN_DB=True
```

**或在 config.yaml 中**：
```yaml
general_settings:
  store_model_in_db: true
```

#### 细粒度的数据库存储控制

默认情况下，`store_model_in_db` 为 `true` 时，所有对象类型（模型、MCP、防护栏（guardrails）、向量存储等）都会存入数据库。若只想存储特定对象类型，可使用 `supported_db_objects` 设置。

**示例：只在数据库中存储 MCP 服务器**

```yaml title="config.yaml" showLineNumbers
general_settings:
  store_model_in_db: true
  supported_db_objects: ["mcp"]  # Only store MCP servers in DB

model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: sk-xxxxxxx
```

**查看所有可用对象类型**：[Config Settings - supported_db_objects](./proxy/config_settings.md#general_settings-参考)

如果未设置 `supported_db_objects`，则所有对象类型都会从数据库加载（默认行为）。

配置完成后若遇到连接问题，可从 MCP 故障排查指南中的[五分钟快速定位](./mcp_troubleshoot.md#locate-the-error-source)和[症状矩阵](./mcp_troubleshoot.md#症状矩阵)入手。

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

在 LiteLLM 管理界面（Admin UI）中，进入 "MCP Servers" 页面并点击 "Add New MCP Server"。

在表单中填写你的 MCP 服务器 URL，并选择要使用的传输方式。

LiteLLM 支持以下 MCP 传输方式：
- Streamable HTTP
- SSE (Server-Sent Events)
- 标准输入/输出（stdio）

<Image
  img={require('../img/add_mcp.png')}
  dark={require('../img/add_mcp_dark.png')}
  alt="添加新 MCP 服务器表单，使用 Streamable HTTP 服务器"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>
<br/>

### 添加 HTTP MCP 服务器

这段视频演示如何在 LiteLLM 管理界面中添加并使用 HTTP MCP 服务器，并在 Cursor IDE 中使用它。

<iframe width="840" height="500" src="https://www.loom.com/embed/e2aebce78e8d46beafeb4bacdde31f14" frameBorder="0" allowFullScreen></iframe>

<br/>
<br/>

### 添加 SSE MCP 服务器

这段视频演示如何在 LiteLLM 管理界面中添加并使用 SSE MCP 服务器，并在 Cursor IDE 中使用它。

<iframe width="840" height="500" src="https://www.loom.com/embed/07e04e27f5e74475b9cf8ef8247d2c3e" frameBorder="0" allowFullScreen></iframe>

<br/>
<br/>

### 添加 STDIO MCP 服务器

:::warning stdio 默认关闭

除非代理启动时的环境变量中带有 `LITELLM_ENABLE_MCP_STDIO=true`，否则 stdio MCP 服务器一律禁用。禁用期间：UI 中 stdio 传输方式会置灰，创建或更新 stdio 服务器会报错，已有的 stdio 服务器仍会显示在列表中但永远不会启动：其工具不会出现在工具列表中，直接调用工具返回 `403`，健康检查也会将其标记为不健康

该开关只从代理进程自身的环境变量读取，写在 config.yaml 的 `environment_variables` 下或存入数据库都无效

:::

**正在升级且已有 stdio 服务器**？请在代理的环境变量中加入 `LITELLM_ENABLE_MCP_STDIO=true` 并重启。在此之前，代理会记录一条警告，点名列出它不会启动的每一台 stdio 服务器

对于 stdio MCP 服务器，传输类型选择 "Standard Input/Output (stdio)"，并以 JSON 格式提供 stdio 配置：

<Image
  img={require('../img/add_stdio_mcp.png')}
  dark={require('../img/add_stdio_mcp_dark.png')}
  alt="MCP 服务器的 stdio 配置"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

<br/>
<br/>

### OAuth 配置与覆盖项

LiteLLM 默认会尝试 [OAuth 2.0 授权服务器发现](https://datatracker.ietf.org/doc/html/rfc8414)。在 UI 中创建 MCP 服务器并把 `Authentication` 设为 `OAuth` 时，LiteLLM 会自动定位提供商元数据、动态注册客户端，并完成基于 PKCE 的授权，无需你提供任何额外信息。

**需要时自定义 OAuth 流程**：

<Image
  img={require('../img/mcp_oauth.png')}
  dark={require('../img/mcp_oauth_dark.png')}
  alt="MCP 服务器的 OAuth 认证设置"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

- **显式提供客户端凭据**：如果 MCP 提供商不支持动态客户端注册，或你想自行管理客户端，请填写 `client_id`、`client_secret` 和所需的 `scopes`。
- **覆盖发现 URL**：在某些环境下，LiteLLM 可能无法访问提供商的元数据端点。此时可用可选的 `authorization_url`、`token_url` 和 `registration_url` 字段，让 LiteLLM 直接指向正确的端点。

<br/>

### AWS SigV4 认证

对于托管在 [AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/latest/userguide/agentcore.html) 上的 MCP 服务器，认证类型选择 **AWS SigV4**。LiteLLM 会使用你的 AWS 凭据，按 [Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) 规范为每个出站 MCP 请求签名。

<Image
  img={require('../img/mcp_aws_sigv4_ui.png')}
  dark={require('../img/mcp_aws_sigv4_ui_dark.png')}
  alt="MCP 服务器的 AWS SigV4 认证设置"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

填写 AWS 区域、服务名（默认 `bedrock-agentcore`），也可选择填写 AWS 访问密钥和私钥。若省略凭据，LiteLLM 会回退到 boto3 凭据链（IAM 角色、环境变量等）。

[**查看完整的 SigV4 配置指南**](./mcp_aws_sigv4.md)

<br/>

### 静态请求头

有时你的 MCP 服务器要求每个请求都携带特定请求头，可能是 API 密钥，也可能是服务器约定的自定义请求头。此时无需配置认证，直接设置即可。

<Image
  img={require('../img/static_headers.png')}
  dark={require('../img/static_headers_dark.png')}
  alt="MCP 服务器权限设置中的静态请求头"
  style={{width: '80%', display: 'block', margin: '0'}}
/>

这些请求头会随发往该服务器的每个请求一起发送，就这么简单。


**适用场景**：
- 服务器需要的自定义请求头不属于标准认证模式
- 你想完全掌控实际发送哪些请求头
- 你正在调试，需要在不改动认证配置的情况下快速添加请求头

### 服务器变量

把凭据保存在服务器端，然后在静态请求头或认证配置中通过 `${VAR_NAME}` 引用（例如 `${DB_PROTOCOL}://${CORP_USERNAME}:${CORP_PASSWORD}@${DB_HOSTNAME}`）。每个变量的作用域可设为 **实例级**（Instance，共享）或 **用户级**（Per-user，每个用户提供自己的凭据）。

<iframe width="840" height="500" src="https://www.loom.com/embed/12878e2be19140069170c3a270b50d1c" frameBorder="0" allowFullScreen></iframe>

**适用场景**：
- 每个用户需要使用自己的静态凭据连接
- 你想在多个用户间复用某些共享信息（例如数据库 URL）

</TabItem>
<TabItem value="config" label="config.yaml">

直接在 `config.yaml` 文件中添加你的 MCP 服务器：

```yaml title="config.yaml" showLineNumbers
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: sk-xxxxxxx

litellm_settings:
  # MCP Aliases - Map aliases to server names for easier tool access
  mcp_aliases:
    "github": "github_mcp_server"
    "zapier": "zapier_mcp_server"
    "deepwiki": "deepwiki_mcp_server"

mcp_servers:
  # HTTP Streamable Server
  deepwiki_mcp:
    url: "https://mcp.deepwiki.com/mcp"
  # SSE Server
  zapier_mcp:
    url: "https://actions.zapier.com/mcp/sk-akxxxxx/sse"
  
  # Standard Input/Output (stdio) Server - CircleCI Example
  # Requires LITELLM_ENABLE_MCP_STDIO=true in the proxy's environment
  circleci_mcp:
    transport: "stdio"
    command: "npx"
    args: ["-y", "@circleci/mcp-server-circleci"]
    env:
      CIRCLECI_TOKEN: "your-circleci-token"
      CIRCLECI_BASE_URL: "https://circleci.com"
  
  # Full configuration with all optional fields
  my_http_server:
    url: "https://my-mcp-server.com/mcp"
    transport: "http"
    description: "My custom MCP server"
    auth_type: "api_key"
    auth_value: "abc123"
```

**配置选项**：
- **服务器名称（Server Name）**：为 MCP 服务器取任意描述性名称（如 `zapier_mcp`、`deepwiki_mcp`、`circleci_mcp`）
- **server_id**：可选的服务器稳定 ID。参见[固定 `server_id`](#固定-server_id)
- **别名（Alias）**：该名称会按服务器名预填（空格替换为 "_"），也可手动编辑，作为工具名中的前缀
- **URL**：MCP 服务器的端点 URL（HTTP/SSE 传输必填）
- **传输方式（Transport）**：在 `config.yaml` 中默认为 `http`；管理 API 的请求模型默认为 `sse`，添加或更新服务器时请显式指定。参见[传输方式默认值](./mcp_config_reference#transport-matrix)
  - `sse`：SSE（Server-Sent Events）传输
  - `http`：Streamable HTTP 传输
  - `stdio`：标准输入/输出传输
- **命令（Command）**：stdio 传输要执行的命令（stdio 必填）
- **allow_all_keys**：设为 `true` 时，服务器对所有 LiteLLM API 密钥可用，即使密钥/团队的 MCP 权限未列出该服务器。
- **参数（Args）**：传给命令的参数数组（stdio 可选）
- **环境变量（Env）**：为 stdio 进程设置的环境变量（stdio 可选）
- **描述（Description）**：服务器的可选描述
- **认证类型（Auth Type）**：可选的认证类型。支持的取值：

  如何选型、凭据如何填写、上游请求示例，参见 [MCP 非 OAuth 认证](./mcp_authentication.md)。

  | 取值 | 发送的请求头（托管 SSE/HTTP 传输） |
  |-------|-------------|
  | `none` | 不添加认证请求头 |
  | `api_key` | `X-API-Key: <auth_value>` |
  | `bearer_token` | `Authorization: Bearer <auth_value>` |
  | `basic` | `Authorization: Basic <base64(auth_value)>`；`auth_value` 按原始 `username:password` 填写 |
  | `authorization` | `Authorization: <auth_value>`（原样发送，不加前缀） |
  | `token` | `Authorization: token <auth_value>`（GitHub 风格） |
  | `oauth2` | `Authorization: Bearer <resolved_token>`——PKCE 或 M2M `client_credentials`。参见 [MCP OAuth](./mcp_oauth.md) |
  | `oauth2_token_exchange` | `Authorization: Bearer <exchanged_token>`——RFC 8693 On-Behalf-Of。参见 [MCP OBO 认证](./mcp_obo_auth.md) |
  | `oauth2_id_jag` | `Authorization: Bearer <access_token>`——身份断言授权许可（Identity Assertion Authorization Grant，两段式）。参见 [MCP ID-JAG 认证](./mcp_id_jag.md) |
  | `true_passthrough` | 客户端的上游 `Authorization` 原样透传。参见 [MCP OAuth 透传](./mcp_oauth_passthrough.md) |
  | `oauth_delegate` | 经 LiteLLM 准入后，使用客户端另行提供的上游 Bearer。参见 [MCP OAuth 透传](./mcp_oauth_passthrough.md) |
  | `aws_sigv4` | 按请求进行 AWS SigV4 签名。参见 [MCP AWS SigV4](./mcp_aws_sigv4.md) |

  上表中的请求头是默认值。若要把解析出的令牌放到 `Authorization` 以外的请求头发送，可在服务器上设置 `upstream_token_header`；位于 API 网关之后的 MCP 服务器通常需要这样做。参见 [MCP OAuth](./mcp_oauth.md#在其他请求头中携带令牌)

  注意：上表的请求头描述的是托管 SSE/HTTP 传输路径。走 OpenAPI 工具路径时，`auth_type: api_key` 发送的是 `Authorization: ApiKey <value>` 而非 `X-API-Key`；已弃用的 `x-mcp-auth` 广播请求头同样使用 `ApiKey` 形式。

- **额外请求头（Extra Headers）**：可选，需要从客户端转发给 MCP 服务器的额外请求头名称列表
- **静态请求头（Static Headers）**：可选，以键值对形式附加到发往 MCP 服务器的每个请求。

`auth_type: oauth2` 时必须提供 `oauth2_flow`：服务身份用 `client_credentials`，逐用户登录用 `authorization_code`。缺失或非法的 flow 会阻止代理启动。参见 [MCP OAuth](./mcp_oauth#配置参考)

各种认证类型的示例：

```yaml title="MCP auth examples (config.yaml)" showLineNumbers
mcp_servers:
  api_key_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "api_key"
    auth_value: "abc123"        # headers={"X-API-Key": "abc123"}

  # OAuth 2.0 client credentials (machine-to-machine)
  oauth2_example:
    url: "https://my-mcp-server.com/mcp"
    transport: "http"
    auth_type: "oauth2"
    oauth2_flow: "client_credentials"
    token_url: "https://my-mcp-server.com/oauth/token"
    client_id: os.environ/OAUTH_CLIENT_ID
    client_secret: os.environ/OAUTH_CLIENT_SECRET
    scopes: ["tool.read", "tool.write"] # optional override

  bearer_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "bearer_token"
    auth_value: "abc123"        # headers={"Authorization": "Bearer abc123"}

  basic_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "basic"
    auth_value: "user:pass"  # headers={"Authorization": "Basic dXNlcjpwYXNz"}

  custom_auth_example:
    url: "https://my-mcp-server.com/mcp"
    auth_type: "authorization"
    auth_value: "Token example123"  # headers={"Authorization": "Token example123"}

  # AWS SigV4 for Bedrock AgentCore MCP servers
  agentcore_mcp:
    url: "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations"
    transport: "http"
    auth_type: "aws_sigv4"
    aws_role_name: os.environ/AWS_ROLE_ARN          # optional — IAM role to assume
    aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID  # optional — falls back to IAM role
    aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY
    aws_region_name: us-east-1
    aws_service_name: bedrock-agentcore

  # Example with extra headers forwarding
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: "bearer_token"
    auth_value: "ghp_example_token"
    extra_headers: ["custom_key", "x-custom-header"]  # These headers will be forwarded from client

  # Example with static headers
  my_mcp_server:
    url: "https://my-mcp-server.com/mcp"
    static_headers: # These headers will be requested to the MCP server
      X-API-Key: "abc123"
      X-Custom-Header: "some-value"
```

### 固定 server_id

config 中服务器的 id 由其名称和连接设置推导而来。一旦修改这些设置，id 随之改变，已有的密钥或团队权限便不再匹配。

设置 `server_id` 即可在服务器配置变化时保持 id 不变：

```yaml
mcp_servers:
  internal_docs:
    server_id: "internal-docs"
    url: "https://docs.internal.example/mcp"
    transport: "http"
```

如果该服务器已配置权限，请先通过 `GET /v1/mcp/server` 或管理界面（Admin UI）获取它当前的 id，再把该值原样设为 `server_id`：

```bash
curl -s http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

`server_id` 必须是非空字符串。config 条目之间不能复用 id，也不能与其他条目的名称或别名重复。与数据库服务器的冲突只会记录警告：id 相同时以数据库服务器为准，config 中同 id 的服务器不可访问；若与数据库服务器的名称或别名相同，则按该名称授予的权限会落到 config 服务器上。

如果启用了 `LITELLM_USE_SHORT_MCP_TOOL_PREFIX`，id 变化还会连带改变服务器的工具前缀。通过 UI 或 `/v1/mcp/server` 添加的服务器本就拥有稳定 id。

### MCP 实战演练

- **Strands（STDIO）**：[观看教程](https://screen.studio/share/ruv4D73F)

> 从 UI 中添加

```json title="strands-mcp" showLineNumbers
{
  "mcpServers": {
    "strands-agents": {
      "command": "uvx",
      "args": ["strands-agents-mcp-server"],
      "env": {
        "FASTMCP_LOG_LEVEL": "INFO"
      },
      "disabled": false,
      "autoApprove": ["search_docs", "fetch_doc"]
    }
  }
}
```

> config.yml

```yaml title="config.yml – strands MCP" showLineNumbers
mcp_servers:
  strands_mcp:
    transport: "stdio"
    command: "uvx"
    args: ["strands-agents-mcp-server"]
    env:
      FASTMCP_LOG_LEVEL: "INFO"
```


### MCP 别名

你可以在 `litellm_settings` 段为 MCP 服务器定义别名，从而：

1. **用友好名称映射服务器名**：使用更短、更好记的别名
2. **覆盖服务器别名**：若服务器未定义别名，系统会采用 `mcp_aliases` 中第一个匹配的别名
3. **保证唯一性**：每台服务器只使用第一个别名，避免冲突

**示例**：
```yaml
litellm_settings:
  mcp_aliases:
    "github": "github_mcp_server"      # Maps "github" alias to "github_mcp_server"
    "zapier": "zapier_mcp_server"      # Maps "zapier" alias to "zapier_mcp_server"
    "docs": "deepwiki_mcp_server"      # Maps "docs" alias to "deepwiki_mcp_server"
    "github_alt": "github_mcp_server"  # This will be ignored since "github" already maps to this server
```

**优势**：
- **简化工具访问**：用 `github_create_issue` 代替 `github_mcp_server_create_issue`
- **命名一致**：在整个组织内统一别名规范
- **便于迁移**：更换服务器名称也不会破坏既有的工具引用

</TabItem>
</Tabs>


## 将 OpenAPI 规范转换为 MCP 服务器

LiteLLM 可以把 OpenAPI 规范转换为 MCP 服务器，无需编写自定义服务器代码，即可将任意 REST API 暴露为 MCP 工具。

完整的配置方法、使用示例，以及如何覆盖工具名称与描述，见 **[从 OpenAPI 规范生成 MCP 指南](./mcp_openapi.md)**

## MCP OAuth

LiteLLM 为 MCP 服务器提供 OAuth 2.0 支持：既有面向用户客户端的交互式（PKCE）流程，也有供后端服务使用的机器对机器（M2M）`client_credentials` 流程。

配置说明、时序图和测试服务器见 **[MCP OAuth 指南](./mcp_oauth.md)**

<details>
<summary>OAuth 详细参考（点击展开）</summary>

LiteLLM v1.77.6 为 MCP 服务器加入了对 OAuth 2.0 客户端凭据（Client Credentials）的支持。

你可以在 `config.yaml` 中配置，也可以直接在 LiteLLM 管理界面（Admin UI）操作（MCP Servers → Authentication → OAuth）。每个 `auth_type: oauth2` 服务器都必须通过 `oauth2_flow` 声明流程：交互式浏览器登录（如下所示）用 `authorization_code`，机器对机器令牌用 `client_credentials`。

```yaml
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

**参与方**

- **客户端**：具备 MCP 能力的 AI 代理（如 Claude Code、Cursor 或其他 IDE/代理），代表用户发起 OAuth 发现、授权与工具调用。
- **LiteLLM Proxy**：居中处理所有 OAuth 发现、注册、令牌交换与 MCP 流量，同时保护已存储的凭据。
- **授权服务器**：通过动态客户端注册、PKCE 授权和令牌端点签发 OAuth 2.0 令牌。
- **MCP 服务器（资源服务器）**：受保护的 MCP 端点，接收 LiteLLM 发出的已认证 JSON-RPC 请求。
- **用户代理（浏览器）**：仅在授权环节短暂介入，便于最终用户确认授权。

**流程步骤**

1. **资源发现**：客户端从 LiteLLM 的 `.well-known/oauth-protected-resource` 端点获取 MCP 资源元数据，了解作用域与能力。
2. **授权服务器发现**：客户端通过 LiteLLM 的 `.well-known/oauth-authorization-server` 端点获取 OAuth 服务器元数据（令牌端点、授权端点、支持的 PKCE 方法）。
3. **动态客户端注册**：客户端经 LiteLLM 注册，由 LiteLLM 把请求转发给授权服务器（RFC 7591）。若提供商不支持动态注册，可预先在 LiteLLM 中存好 `client_id`/`client_secret`（如 GitHub MCP），流程照常进行。
4. **用户授权**：客户端拉起浏览器会话（附带 code challenge 与资源提示）。用户确认授权后，授权服务器将授权码经 LiteLLM 送回客户端。
5. **令牌交换**：客户端携带授权码、code verifier 与资源调用 LiteLLM；LiteLLM 与授权服务器完成交换，并返回签发的访问/刷新令牌。
6. **MCP 调用**：拿到有效令牌后，客户端向 LiteLLM 发送 MCP JSON-RPC 请求（附 LiteLLM API 密钥）；LiteLLM 转发给 MCP 服务器，并把工具响应回传。

更多参考见官方 [MCP 授权流程](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#authorization-flow-steps)。

</details>


## 向 MCP 服务器转发自定义请求头

LiteLLM 支持通过 `extra_headers` 配置参数，把额外的自定义请求头从 MCP 客户端转发到后端 MCP 服务器，方便你传递 MCP 服务器所需的自定义认证令牌、API 密钥或其他请求头。

**配置**


<Tabs>
<TabItem value="config" label="config.yaml">
在 MCP 服务器配置中设置 `extra_headers`，指定需要转发的请求头名称：

```yaml title="config.yaml with extra_headers" showLineNumbers
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: "bearer_token"
    auth_value: "ghp_default_token"
    extra_headers: ["custom_key", "x-custom-header", "Authorization"]
    description: "GitHub MCP server with custom header forwarding"
```
</TabItem>
<TabItem value="clientside" label="客户端动态设置">

当你想让用户访问[一组 MCP 服务器](/docs/mcp#控制终端用户对-mcp-的访问)时，采用这种方式。

**格式**：`x-mcp-{server_alias}-{header_name}: value`

这样即可为不同的 MCP 服务器使用不同的认证。


**示例**：
- `x-mcp-github-authorization: Bearer ghp_xxxxxxxxx`——GitHub MCP 服务器，Bearer 令牌
- `x-mcp-zapier-x-api-key: sk-xxxxxxxxx`——Zapier MCP 服务器，API 密钥
- `x-mcp-deepwiki-authorization: Basic base64_encoded_creds`——DeepWiki MCP 服务器，Basic 认证

如果访问组内所有服务器共用同一凭据，只需以 `x-mcp-{access_group}-{header_name}` 发送一次，LiteLLM 会转发给 `access_groups` 含有该组的每台服务器。针对具体服务器的 `x-mcp-{server_alias}-{header_name}` 对该服务器仍然优先，组外的服务器则永远收不到该组凭据。若一台服务器同时属于多个组、而各组携带的凭据不同，LiteLLM 一个都不会转发。

```python title="Python Client with Server-Specific Auth" showLineNumbers
from fastmcp import Client
import asyncio

# Standard MCP configuration with multiple servers
config = {
    "mcpServers": {
        "mcp_group": {
            "url": "http://localhost:4000/mcp/",
            "headers": {
                "x-mcp-servers": "dev_group", # assume this gives access to github, zapier and deepwiki
                "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
                "x-mcp-github-authorization": "Bearer gho_token", 
                "x-mcp-zapier-x-api-key": "sk-xxxxxxxxx",
                "x-mcp-deepwiki-authorization": "Basic base64_encoded_creds",
                "custom_key": "value"
            }
        }
    }
}

# Create a client that connects to all servers
client = Client(config)


async def main():
    async with client:
        tools = await client.list_tools()
        print(f"Available tools: {tools}")

        # call mcp 
        await client.call_tool(
            name="github_mcp-search_issues",
            arguments={'query': 'created:>2024-01-01', 'sort': 'created', 'order': 'desc', 'perPage': 30}
        )

if __name__ == "__main__":
    asyncio.run(main())

```



**优势**：
- **按服务器认证**：每台 MCP 服务器可使用不同的认证方式
- **更安全**：无需在所有服务器间共享同一个认证令牌
- **请求头名称灵活**：支持多种认证请求头类型（authorization、x-api-key 等）
- **边界清晰**：每台服务器的认证一目了然



</TabItem>
</Tabs>


#### 客户端用法

从 MCP 客户端连接时，请附带与 `extra_headers` 配置相匹配的自定义请求头：

<Tabs>
<TabItem value="fastmcp" label="Python FastMCP">

```python title="FastMCP Client with Custom Headers" showLineNumbers
from fastmcp import Client
import asyncio

# MCP client configuration with custom headers
config = {
    "mcpServers": {
        "github": {
            "url": "http://localhost:4000/github_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
                "Authorization": "Bearer gho_token", 
                "custom_key": "custom_value",
                "x-custom-header": "additional_data"
            }
        }
    }
}

# Create a client that connects to the server
client = Client(config)

async def main():
    async with client:
        # List available tools
        tools = await client.list_tools()
        print(f"Available tools: {tools}")
        
        # Call a tool if available
        if tools:
            result = await client.call_tool(tools[0].name, {})
            print(f"Tool result: {result}")

# Run the client
asyncio.run(main())
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

```json title="Cursor MCP Configuration with Custom Headers" showLineNumbers
{
  "mcpServers": {
    "GitHub": {
      "url": "http://localhost:4000/github_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
        "Authorization": "Bearer $GITHUB_TOKEN",
        "custom_key": "custom_value",
        "x-custom-header": "additional_data"
      }
    }
  }
}
```

</TabItem>

<TabItem value="http" label="HTTP 客户端">

```bash title="cURL with Custom Headers" showLineNumbers
curl --location 'http://localhost:4000/github_mcp/mcp' \
--header 'Content-Type: application/json' \
--header "x-litellm-api-key: Bearer $LITELLM_API_KEY" \
--header 'Authorization: Bearer gho_token' \
--header 'custom_key: custom_value' \
--header 'x-custom-header: additional_data' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
}'
```

</TabItem>
</Tabs>

#### 工作原理

1. **配置**：在 MCP 服务器配置中定义 `extra_headers`，列出想要转发的请求头名称
2. **客户端请求头**：在 MCP 客户端请求中带上对应的请求头
3. **请求头转发**：LiteLLM 会自动把匹配的请求头转发给后端 MCP 服务器
4. **认证**：后端 MCP 服务器会同时收到已配置的认证头和这些自定义请求头


### 将请求头传入 STDIO 环境变量

如果你的 stdio MCP 服务器需要每个请求各自的凭证，可以把客户端请求中的 HTTP 请求头直接映射到所启动 stdio 进程的环境变量里。在 env 值中用 `${X-HEADER_NAME}` 语法引用请求头名称，LiteLLM 会从进来的请求中读取该请求头，并在启动命令前设置好对应的环境变量。

```json title="Forward X-GITHUB_PERSONAL_ACCESS_TOKEN header to stdio env" showLineNumbers
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${X-GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

在这个例子中，当客户端带着 `X-GITHUB_PERSONAL_ACCESS_TOKEN` 请求头发起请求时，代理会把该值以 `GITHUB_PERSONAL_ACCESS_TOKEN` 环境变量的形式传给 stdio 进程。

## 控制终端用户对 MCP 的访问

控制 AI 应用的终端用户（例如内部聊天界面的用户）可以访问哪些 MCP 服务器。在 `x-litellm-end-user-id` 请求头中传入客户 ID，即可：
- 执行对象权限（限制他们能访问哪些 MCP 服务器）
- 应用客户专属预算
- 按客户追踪花费

**FastMCP 客户端示例：**

```python title="Track customer spend with x-litellm-end-user-id" showLineNumbers
from fastmcp import Client
import asyncio

# MCP client configuration with customer tracking
config = {
    "mcpServers": {
        "github": {
            "url": "http://localhost:4000/github_mcp/mcp",
            "headers": {
                "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
                "x-litellm-end-user-id": "customer_123",  # 👈 CUSTOMER ID
                "Authorization": "Bearer gho_token"
            }
        }
    }
}

client = Client(config)

async def main():
    async with client:
        # All MCP calls will be tracked under customer_123
        tools = await client.list_tools()
        result = await client.call_tool(tools[0].name, {})
        print(f"Tool result: {result}")

asyncio.run(main())
```

**Cursor IDE 示例：**

```json title="Cursor config with customer tracking" showLineNumbers
{
  "mcpServers": {
    "GitHub": {
      "url": "http://localhost:4000/github_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
        "x-litellm-end-user-id": "customer_123"
      }
    }
  }
}
```

**实际效果：**
- 客户专属的对象权限会被强制执行（只能访问被允许的 MCP 服务器）
- 应用客户预算
- 所有工具调用都记在 `customer_123` 名下

[进一步了解客户管理 →](./proxy/customers)

## 调用代理的 /v1/responses 端点

调用 LiteLLM 代理的 `/v1/responses` 端点来使用 MCP 工具时，如果要使用全部已授权的服务器，把 `server_url` 设为 `"litellm_proxy"`；如果只指定 tools 数组中的某一台服务器，则用 `litellm_proxy/mcp/<server_alias>`。这样代理就会使用它已配置的 MCP 服务器。

:::important[不要填代理的完整 URL]
请求本来就是要发给代理的，这时写 `server_url: "https://your-proxy.com/mcp"` 是错误的。请使用[文档约定的专用写法](./mcp_config_reference#endpoint-matrix)来路由到已配置的 MCP 服务器。直连的 MCP 客户端才使用网络 URL。
:::

```bash title="Correct: Using litellm_proxy" showLineNumbers
curl --location 'https://your-proxy.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never"
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

### 向 MCP 服务器发送自定义请求头

要把自定义请求头（如 API 密钥、认证令牌）传给特定的 MCP 服务器，两种方式任选：

**方式一：请求头**：在请求头中加入 `x-mcp-{server_alias}-{header_name}`，代理会把它们转发给对应的 MCP 服务器。

```bash
# 向 "weather2" MCP 服务器发送 Authorization 请求头
--header 'x-mcp-weather2-authorization: Bearer your-token'

# 向 "github" MCP 服务器发送自定义请求头
--header 'x-mcp-github-x-api-key: your-api-key'
```

**方式二：工具配置中的请求头**：在工具定义里加一个 `headers` 对象，它会与请求头合并。

```json
{
    "type": "mcp",
    "server_label": "litellm",
    "server_url": "litellm_proxy",
    "require_approval": "never",
    "headers": {
        "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
        "x-mcp-servers": "Zapier_MCP,dev-group",
        "x-mcp-weather2-authorization": "Bearer your-weather-api-token"
    }
}
```

## 在客户端凭证模式下使用 MCP

如果你想把客户端侧的认证令牌先交给 LiteLLM，再由它传给你的 MCP 完成认证，就使用这种方式。


### 新版服务器专属认证头（推荐）

可以用 `x-mcp-{server_alias}-{header_name}` 格式的服务器专属请求头来指定 MCP 认证令牌，这样就能为不同的 MCP 服务器使用不同的认证。

**优点：**
- **服务器专属认证**：每台 MCP 服务器可以使用不同的认证方式
- **安全性更好**：不必在所有服务器间共用同一个认证令牌
- **请求头名称灵活**：支持多种认证头类型（authorization、x-api-key 等）
- **边界清晰**：每台服务器的认证一目了然

### 访问组级认证头

当访问组内的服务器共用同一套凭证时，只需传一次 `x-mcp-{access_group}-{header_name}`，不必逐台重复。凡是 `access_groups` 包含该组的服务器，LiteLLM 都会把它作为默认凭证。服务器专属的 `x-mcp-{server_alias}-{header_name}` 请求头对该服务器优先生效；组外的服务器永远收不到它；如果某台服务器同时属于多个组且各组凭证不同，则一个都不转发。服务器别名与访问组名共享 `x-mcp-` 请求头命名空间，因此别名恰好等于某个组名的服务器仍会把 `x-mcp-{alias}-*` 当作自己的凭证；请避免用服务器并不归属的访问组给它命名。

```bash title="cURL Example with Group-Level Auth" showLineNumbers
curl -X POST http://localhost:4000/mcp/dev_group \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-litellm-api-key: Bearer $LITELLM_API_KEY" \
  -H "x-mcp-dev_group-authorization: Bearer SHARED_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

### 客户端认证 {#legacy-auth-header-deprecated}

请用 `x-mcp-{server_alias}-{header_name}` 取代已弃用的广播式请求头，详见[旧版兼容性](./mcp_config_reference#deprecated-x-mcp-auth)。下面的客户端示例均使用带作用域的凭证

<Tabs>
<TabItem value="openai" label="OpenAI API">

#### 通过 OpenAI Responses API 以服务器专属认证连接

直接调用 OpenAI 时，请使用公网可访问的 LiteLLM MCP URL，并附上网关密钥和带作用域的上游请求头：

```bash title="cURL Example with Server-Specific Auth" showLineNumbers
curl --location 'https://api.openai.com/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $OPENAI_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "https://your-litellm-proxy.example.com/mcp",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
                "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

</TabItem>

<TabItem value="litellm" label="LiteLLM 代理">

#### 通过 LiteLLM 代理 Responses API 以服务器专属认证连接

通过 LiteLLM 代理发起 LLM API 请求、打到 `/v1/responses` 端点并使用服务器专属认证时，采用这种方式：

```bash title="cURL Example with Server-Specific Auth" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/responses' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
    "model": "{{openai_large}}",
    "tools": [
        {
            "type": "mcp",
            "server_label": "litellm",
            "server_url": "litellm_proxy",
            "require_approval": "never",
            "headers": {
                "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
                "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
                "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
            }
        }
    ],
    "input": "Run available tools",
    "tool_choice": "required"
}'
```

</TabItem>

<TabItem value="cursor" label="Cursor IDE">

#### 通过 Cursor IDE 以服务器专属认证连接

在 Cursor IDE 中通过 LiteLLM MCP 直接使用工具，并配置服务器专属认证：

**设置步骤：**

1. **打开 Cursor 设置**：按 `⇧+⌘+J`（Mac）或 `Ctrl+Shift+J`（Windows/Linux）
2. **进入 MCP 工具**：切换到 "MCP Tools" 标签页，点击 "New MCP Server"
3. **添加配置**：复制粘贴下面的 JSON 配置，再用 `Cmd+S` 或 `Ctrl+S` 保存

```json title="Cursor MCP Configuration with Server-Specific Auth" showLineNumbers
{
  "mcpServers": {
    "LiteLLM": {
      "url": "http://localhost:4000/mcp/",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>",
        "x-mcp-github-authorization": "Bearer $GITHUB_TOKEN",
        "x-mcp-zapier-x-api-key": "$ZAPIER_API_KEY"
      }
    }
  }
}
```

</TabItem>

<TabItem value="http" label="Streamable HTTP">

#### 通过 Streamable HTTP 传输以服务器专属认证连接

使用 HTTP 传输并以服务器专属认证连接到 LiteLLM MCP：

**服务器 URL：**
```text showLineNumbers
http://localhost:4000/mcp/
```

**请求头：**
```text showLineNumbers
x-litellm-api-key: Bearer YOUR_LITELLM_API_KEY
x-mcp-github-authorization: Bearer YOUR_GITHUB_TOKEN
x-mcp-zapier-x-api-key: YOUR_ZAPIER_API_KEY
```

</TabItem>

<TabItem value="fastmcp" label="Python FastMCP">

#### 通过 Python FastMCP 客户端以服务器专属认证连接

使用 Python FastMCP 客户端，以服务器专属认证连接到你的 LiteLLM MCP 服务器：

```python title="Python FastMCP Example with Server-Specific Auth" showLineNumbers
import asyncio
import json

from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

# Create the transport with your LiteLLM MCP server URL and server-specific auth headers
server_url = "http://localhost:4000/mcp/"
transport = StreamableHttpTransport(
    server_url,
    headers={
        "x-litellm-api-key": "Bearer YOUR_LITELLM_API_KEY",
        "x-mcp-github-authorization": "Bearer YOUR_GITHUB_TOKEN",
        "x-mcp-zapier-x-api-key": "YOUR_ZAPIER_API_KEY"
    }
)

# Initialize the client with the transport
client = Client(transport=transport)


async def main():
    # Connection is established here
    print("Connecting to LiteLLM MCP server with server-specific authentication...")
    async with client:
        print(f"Client connected: {client.is_connected()}")

        # Make MCP calls within the context
        print("Fetching available tools...")
        tools = await client.list_tools()

        print(f"Available tools: {json.dumps([t.name for t in tools], indent=2)}")
        
        # Example: Call a tool (replace 'tool_name' with an actual tool name)
        if tools:
            tool_name = tools[0].name
            print(f"Calling tool: {tool_name}")
            
            # Call the tool with appropriate arguments
            result = await client.call_tool(tool_name, arguments={})
            print(f"Tool result: {result}")


# Run the example
if __name__ == "__main__":
    asyncio.run(main())
```

</TabItem>
</Tabs>

### 自定义 MCP 认证头名称

已有部署可以重命名这个已弃用的广播式请求头，详见[旧版请求头的集中参考](./mcp_config_reference#deprecated-x-mcp-auth)；新接入的方案建议直接使用服务器专属请求头

## 配合 `/chat/completions` 使用 MCP 工具

:::tip[适用于所有提供商]
这套流程**不绑定具体提供商**：同一个 MCP 工具定义对 LiteLLM 背后的 _每一个_ LLM 后端（OpenAI、Azure OpenAI、Anthropic、Amazon Bedrock、Vertex、自托管部署等）都适用。
:::

LiteLLM 代理在经典的 `/v1/chat/completions` 端点上同样支持感知 MCP 的工具调用。把 MCP 工具定义直接放进 `tools` 数组，LiteLLM 就会拉取 MCP 服务器的工具并转换成兼容 OpenAI 的函数调用。当 `require_approval` 设为 `"never"` 时，代理会自动执行返回的工具调用，把结果回灌给模型后再返回助手回复。

```bash title="Chat Completions with MCP Tools" showLineNumbers
curl --location '<your-litellm-proxy-base-url>/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $LITELLM_API_KEY" \
--data '{
  "model": "{{openai_small}}",
  "messages": [
    {"role": "user", "content": "Summarize the latest open PR."}
  ],
  "tools": [
    {
      "type": "mcp",
      "server_url": "litellm_proxy/mcp/github_mcp",
      "server_label": "github_mcp",
      "require_approval": "never"
    }
  ]
}'
```

如果省略 `require_approval` 或设成 `"never"` 以外的任何值，MCP 工具调用会返回给客户端，由你审核并手动执行，与 OpenAI 上游行为一致。


## LiteLLM 代理 MCP 网关导览
LiteLLM 提供了一个 MCP 网关，管理员可以把所有 MCP 服务器都接入 LiteLLM。通过 LiteLLM 代理使用 MCP 的主要好处是：

1. 所有 MCP 工具共用一个固定端点
2. 按 Key、团队或用户管理 MCP 权限

这段视频演示了如何把一台 MCP 服务器接入 LiteLLM 代理、使用它并配置访问控制。

<iframe width="840" height="500" src="https://www.loom.com/embed/f7aa8d217879430987f3e64291757bfc" frameBorder="0" allowFullScreen></iframe>

## LiteLLM Python SDK MCP 桥接

LiteLLM Python SDK 充当 MCP 桥接层，让所有 LiteLLM 支持的模型都能使用 MCP 工具。围绕 MCP 的使用，LiteLLM 提供以下功能

- **列出**可用的 MCP 工具：OpenAI 客户端可以查看所有可用的 MCP 工具
  - `litellm.experimental_mcp_client.load_mcp_tools`：列出所有可用的 MCP 工具
- **调用** MCP 工具：OpenAI 客户端可以调用 MCP 工具
  - `litellm.experimental_mcp_client.call_openai_tool`：在 MCP 服务器上调用一个 OpenAI 工具


### 1. 列出可用的 MCP 工具

本例使用 `litellm.experimental_mcp_client.load_mcp_tools` 在任意 MCP 服务器上列出所有可用的 MCP 工具。该方法有两种用法：

- `format="mcp"`：（默认）返回 MCP 工具
  - 返回类型：`mcp.types.Tool`
- `format="openai"`：返回转换成 OpenAI API 兼容格式的 MCP 工具，可直接配合 OpenAI 端点使用。
  - 返回类型：`openai.types.chat.ChatCompletionToolParam`

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python title="MCP Client List Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
import litellm
from litellm import experimental_mcp_client


server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = await litellm.acompletion(
            model="{{openai_large}}",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print("LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str))
```

</TabItem>

<TabItem value="openai" label="OpenAI SDK + LiteLLM 代理">

本例演示如何把 OpenAI SDK 指向 LiteLLM 代理来调用 MCP 工具。关键区别在于：这里的 LLM API 请求由 OpenAI SDK 发出

```python title="MCP Client List Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
from openai import OpenAI
from litellm import experimental_mcp_client

server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools using litellm mcp client
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        # Use OpenAI SDK pointed to LiteLLM proxy
        client = OpenAI(
            api_key="your-api-key",  # Your LiteLLM proxy API key
            base_url="http://localhost:4000"  # Your LiteLLM proxy URL
        )

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = client.chat.completions.create(
            model="{{openai_large}}",
            messages=messages,
            tools=tools
        )
        print("LLM RESPONSE: ", llm_response)
```
</TabItem>
</Tabs>


### 2. 列出并调用 MCP 工具

本例将使用：
- `litellm.experimental_mcp_client.load_mcp_tools`：在任意 MCP 服务器上列出所有可用的 MCP 工具
- `litellm.experimental_mcp_client.call_openai_tool`：在 MCP 服务器上调用一个 OpenAI 工具

第一次 LLM 响应会返回一组 OpenAI 工具。我们取其中的第一个工具调用，传给 `litellm.experimental_mcp_client.call_openai_tool`，在 MCP 服务器上执行该工具。

#### `litellm.experimental_mcp_client.call_openai_tool` 的工作原理

- 接收 LLM 响应中的 OpenAI 工具调用
- 把 OpenAI 工具调用转换成 MCP 工具
- 在 MCP 服务器上调用该 MCP 工具
- 返回 MCP 工具调用的结果

<Tabs>
<TabItem value="sdk" label="LiteLLM Python SDK">

```python title="MCP Client List and Call Tools" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
import litellm
from litellm import experimental_mcp_client


server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = await litellm.acompletion(
            model="{{openai_large}}",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print("LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str))

        openai_tool = llm_response["choices"][0]["message"]["tool_calls"][0]
        # Call the tool using MCP client
        call_result = await experimental_mcp_client.call_openai_tool(
            session=session,
            openai_tool=openai_tool,
        )
        print("MCP TOOL CALL RESULT: ", call_result)

        # send the tool result to the LLM
        messages.append(llm_response["choices"][0]["message"])
        messages.append(
            {
                "role": "tool",
                "content": str(call_result.content[0].text),
                "tool_call_id": openai_tool["id"],
            }
        )
        print("final messages with tool result: ", messages)
        llm_response = await litellm.acompletion(
            model="{{openai_large}}",
            api_key=os.getenv("OPENAI_API_KEY"),
            messages=messages,
            tools=tools,
        )
        print(
            "FINAL LLM RESPONSE: ", json.dumps(llm_response, indent=4, default=str)
        )
```

</TabItem>
<TabItem value="proxy" label="OpenAI SDK + LiteLLM 代理">

本例演示如何把 OpenAI SDK 指向 LiteLLM 代理来调用 MCP 工具。关键区别在于：这里的 LLM API 请求由 OpenAI SDK 发出

```python title="MCP Client with OpenAI SDK" showLineNumbers
# Create server parameters for stdio connection
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import os
from openai import OpenAI
from litellm import experimental_mcp_client

server_params = StdioServerParameters(
    command="python3",
    # Make sure to update to the full absolute path to your mcp_server.py file
    args=["./mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        # Initialize the connection
        await session.initialize()

        # Get tools using litellm mcp client
        tools = await experimental_mcp_client.load_mcp_tools(session=session, format="openai")
        print("MCP TOOLS: ", tools)

        # Use OpenAI SDK pointed to LiteLLM proxy
        client = OpenAI(
            api_key="your-api-key",  # Your LiteLLM proxy API key
            base_url="http://localhost:4000"  # Your LiteLLM proxy URL
        )

        messages = [{"role": "user", "content": "what's (3 + 5)"}]
        llm_response = client.chat.completions.create(
            model="{{openai_large}}",
            messages=messages,
            tools=tools
        )
        print("LLM RESPONSE: ", llm_response)

        # Get the first tool call
        tool_call = llm_response.choices[0].message.tool_calls[0]
        
        # Call the tool using MCP client
        call_result = await experimental_mcp_client.call_openai_tool(
            session=session,
            openai_tool=tool_call.model_dump(),
        )
        print("MCP TOOL CALL RESULT: ", call_result)

        # Send the tool result back to the LLM
        messages.append(llm_response.choices[0].message.model_dump())
        messages.append({
            "role": "tool",
            "content": str(call_result.content[0].text),
            "tool_call_id": tool_call.id,
        })

        final_response = client.chat.completions.create(
            model="{{openai_large}}",
            messages=messages,
            tools=tools
        )
        print("FINAL RESPONSE: ", final_response)
```

</TabItem>
</Tabs>

## 常见问题（FAQ）

**问：如何在 LiteLLM 背后的 MCP 服务器上使用 OAuth2 client_credentials**（机器对机器）？

LiteLLM 为 `client_credentials` 授权类型提供自动的令牌管理。在 MCP 服务器配置里填好 `client_id`、`client_secret` 和 `token_url`，LiteLLM 就会自动获取、缓存并刷新令牌。配置方法见 [MCP OAuth M2M 指南](./mcp_oauth.md#机器对机器m2m认证)。

**问：从 LiteLLM 管理界面获取的 OAuth 令牌存在哪里**？

管理界面只在 `sessionStorage` 里保存临时状态，供 OAuth 重定向流程走完；令牌不会持久化到服务器或数据库中。

**问：遇到 MCP 连接报错，应该先查什么**？

从 MCP 故障排查指南的[五分钟快速定位](./mcp_troubleshoot.md#locate-the-error-source)入手：一条 curl 就能隔离出故障层（客户端 → LiteLLM 还是 LiteLLM → MCP），[症状矩阵](./mcp_troubleshoot.md#症状矩阵)则把每种状态码和症状对应到解法。如果需要进一步上报，请先收集[支持信息包](./mcp_troubleshoot.md#support-bundle)。
