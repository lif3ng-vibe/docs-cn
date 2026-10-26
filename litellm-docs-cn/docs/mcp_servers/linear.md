import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linear MCP 服务器

> 通过 LiteLLM MCP 网关接入 Linear 托管的远程 MCP（Model Context Protocol）服务器，处理 issue、项目、周期与评论。

服务器由 Linear 集中托管和运维，你无需自行部署或运行任何东西。LiteLLM 在此之上提供集中认证、按密钥和团队的访问控制、每次工具调用的成本追踪，以及覆盖所有已接入 MCP 服务器的统一审计记录。

## 何时使用该服务器

- 让 agent 在讨论工作的地方直接创建、分类或更新 issue
- 在规划或估算之前，拉取最新的周期和项目状态作为上下文
- 把编码 agent 正在实现的工单交给它，再让它以评论形式汇报进展

## 核心特性

- 提供专门的只读端点，可以只把 Linear 上下文交出去，而不授予创建或编辑任何内容的权限
- 由 Linear 通过 Streamable HTTP 托管；较旧的 SSE 端点仅作为已弃用的后备保留
- OAuth 支持动态客户端注册；另提供 API 密钥方式，供无人在场登录的后端 agent 使用

## 认证

- **方式**：使用用户令牌的 OAuth 2.1，遵循每个调用者已有的 Linear 权限。Linear 支持[动态客户端注册](https://datatracker.ietf.org/doc/html/rfc7591)，因此没有需要管理的客户端 ID 或密钥。
- **替代方式**：以 bearer 令牌形式发送 Linear API 密钥。这是单一共享身份而非按用户区分，只适合只读上下文来源和无人值守的后端 agent。

## 端点

**远程 MCP 服务器**：

```
https://mcp.linear.app/mcp
```

**只读**：

```
https://mcp.linear.app/mcp/readonly
```

对于不支持 Streamable HTTP 的客户端，Linear 还提供 `https://mcp.linear.app/sse` 作为已弃用的后备。新的接入请一律使用 `/mcp` 端点。

***

## 通过 LiteLLM MCP 网关连接

:::warning[不要填客户端凭证]
不要在 OAuth 服务器上设置 `client_id`、`client_secret` 或 `token_url`。一旦设置，身份就会变成所有调用者共享的机器对机器（machine-to-machine）身份，issue 将由同一个服务账号提交，而不是以提出请求者的名义。Linear 的动态注册让这些字段变得多余。如果你确实想要共享身份，请使用下方的 API 密钥标签页，那条路径会显式声明共享身份。
:::

### 步骤 1：在 LiteLLM 中注册服务器

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

进入 **MCP Servers** 页面，点击 **+ Add New MCP Server**，然后设置：

| 字段 | 取值 |
|---|---|
| **Server Name** | `linear_mcp` |
| **Transport** | HTTP |
| **Server URL** | `https://mcp.linear.app/mcp` |
| **Authentication** | OAuth |
| **OAuth flow type** | Interactive (PKCE) |
| **Client ID / Client Secret** | 留空 |

点击 **Create MCP Server**，然后打开该服务器的 **MCP Tools** 标签页确认连接。首次拉取工具列表时，会带你走一遍 Linear 登录流程。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  linear_mcp:
    url: "https://mcp.linear.app/mcp"
    transport: "http"
    description: "Linear issues, projects, and cycles"
    auth_type: oauth2
    oauth2_flow: authorization_code
```

`oauth2_flow: authorization_code` 用于选择按用户的交互式授权流程，且为必填项；`auth_type: oauth2` 的服务器若缺少这一项，代理会拒绝启动。要把 MCP 服务器保存进数据库，还需要设置 `store_model_in_db: true`，详见[前置条件](../mcp.md#前提条件)。

</TabItem>
<TabItem value="api-key" label="config.yaml（API 密钥）">

如果是共享的只读上下文来源，或是无人在场完成浏览器登录的后端 agent，请改用 Linear API 密钥认证。在 Linear 的 **Settings > Security & access > Personal API keys** 中创建密钥，仅启用 Read 权限，然后搭配只读端点：

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  linear_readonly:
    url: "https://mcp.linear.app/mcp/readonly"
    transport: "http"
    description: "Linear, read-only"
    auth_type: bearer_token
    auth_value: os.environ/LINEAR_API_KEY
```

所有调用者都共享这一身份，工具调用会记在密钥所有者名下，而不是最终用户名下。凡是面向用户的场景或涉及写入的场景，都优先选择 OAuth。

</TabItem>
</Tabs>

### 步骤 2：设置代理的对外 origin

如果 LiteLLM 部署在终结 TLS 的 ingress 之后，请把 `PROXY_BASE_URL` 设置为用户在地址栏看到的 origin，这样 OAuth 回调才能通过校验：

```bash
PROXY_BASE_URL=https://llm.example.com
```

若不一致，点击 **Connect** 时会返回 `400 Bad Request`，内容为 `{"detail":"invalid_request"}`。完整规则见[反向代理与 ingress 配置](../mcp_oauth.md#reverse-proxy-and-ingress-configuration)。

### 步骤 3：从 agent 端连接

网关会把每台服务器挂在 `http://localhost:4000/{server_name}/mcp` 路径下，因此 `linear_mcp` 可通过 `http://localhost:4000/linear_mcp/mcp` 访问。

<Tabs>
<TabItem value="cursor" label="Claude Desktop / Cursor">

```json title="Claude Desktop / Cursor" showLineNumbers
{
  "mcpServers": {
    "linear": {
      "url": "http://localhost:4000/linear_mcp/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"
      }
    }
  }
}
```

</TabItem>
<TabItem value="claude-code" label="Claude Code">

```bash showLineNumbers
claude mcp add --transport http linear http://localhost:4000/linear_mcp/mcp \
  --header "x-litellm-api-key: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

首次调用会打开浏览器进行 Linear 登录。LiteLLM 会保存该用户的令牌并在之后自动刷新，因此后续会话无需再次提示即可连接。

***

## 提供的工具

:::info
Linear 在运行时通过 `tools/list` 发布工具定义，名称和字段可能随时变化，恕不另行通知。你的工作区实际暴露了哪些内容，以 LiteLLM 管理界面（Admin UI）中的 **MCP Tools** 标签页为准；它会列出当前可用的工具，并支持传入测试参数直接调用。上游细节参见 Linear 的 [MCP 文档](https://linear.app/docs/mcp)。
:::

| 类别 | 工具 |
|---|---|
| issue | `get_issue`, `list_issues`, `create_issue`, `update_issue`, `list_my_issues` |
| issue 元数据 | `list_issue_statuses`, `get_issue_status`, `list_issue_labels` |
| 项目 | `list_projects`, `get_project`, `create_project`, `update_project` |
| 评论 | `list_comments`, `create_comment` |
| 文档 | `get_document`, `list_documents` |
| 周期 | `list_cycles` |
| 团队 | `list_teams` |

可写操作仅限 issue、项目和评论；文档、周期、团队、状态和标签均为只读。LiteLLM 会给工具名加上服务器名前缀，因此 `create_issue` 暴露给模型时是 `linear_mcp-create_issue`；参见[工具命名](../mcp_rest_api.md#工具命名)。

### 只读不写

要只授予读权限，只读端点是最干净的方式，也应作为默认选择。在标准端点上，同样可以在授权确认时拒绝写 scope，或在配置中排除写工具。请先对照实际拉取到的工具列表确认名称，因为 `disallowed_tools` 里已经与真实工具对不上的条目会静默失效，对应的工具仍然可以被调用：

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  linear_mcp:
    url: "https://mcp.linear.app/mcp"
    transport: "http"
    auth_type: oauth2
    oauth2_flow: authorization_code
    disallowed_tools: ["create_issue", "update_issue", "create_project", "update_project", "create_comment"]
```

***

:::info[限制谁可以使用]
用 `object_permission` 按密钥或按团队为该服务器授权，并用 `mcp_rpm_limit` 限制每台服务器的调用频次，两者均见 [MCP 权限管理](../mcp_control.md)。
:::

:::warning[把 LiteLLM 密钥放进 `x-litellm-api-key`]
交互式 OAuth 需要把 `Authorization` 请求头留给上游令牌。如果客户端把 LiteLLM API 密钥作为 `Authorization: Bearer sk-...` 发送，OAuth 流程不会执行，LiteLLM 会把你的 LiteLLM 密钥转发给 Linear，并被对方拒绝。排查方法：加上 `x-litellm-mcp-debug: true` 并查看响应头，`SAME_AS_LITELLM_KEY` 表示命中上述情况，`m2m-client-credentials` 表示已设置客户端凭证、所有调用者共享同一个身份。参见 [OAuth 调试](../mcp_oauth.md#oauth-调试)和 [MCP 故障排查指南](../mcp_troubleshoot.md)。
:::

已授权的会话会绑定到一个 Linear 工作区，仅重新连接并不会切换工作区；需要第二个工作区的用户必须把它注册为单独的 MCP 服务器条目。
