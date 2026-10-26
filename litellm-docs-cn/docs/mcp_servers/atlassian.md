import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Atlassian MCP 服务器

> 通过 LiteLLM MCP 网关接入 Atlassian 托管的远程 MCP（Model Context Protocol）服务器，操作 Jira 问题、Confluence 页面和 Compass 组件。

服务器由 Atlassian 托管并负责更新，你无需自己部署或运行任何东西。LiteLLM 则补充了集中式认证、按密钥和团队的访问控制、每次工具调用的成本追踪（cost tracking），以及贯穿你所接入的每一台 MCP 服务器的统一审计记录。

## 何时使用此服务器

- 让智能体（agent）在不离开对话的情况下分诊、提交或更新 Jira 问题
- 把 Confluence 页面拉进来充当上下文，或者把结论写回成一个新页面
- 通过 Compass 组件追查所有权与依赖关系

## 主要特性

- 一台服务器覆盖 Jira、Jira Service Management、Confluence、Bitbucket 和 Compass，一次注册即可全部触达
- 由 Atlassian 通过 Streamable HTTP 托管；仅支持 Cloud 版，不支持 Server 或 Data Center 版
- 支持动态客户端注册，OAuth 客户端由 LiteLLM 协商完成，没有任何需要管理的 client ID 或 secret

Atlassian 以 **Rovo MCP Server** 的名义提供这台服务器，在 Atlassian 文档中搜索这个名字即可。

## 认证

- **方式**：基于用户 token 的 OAuth 2.1，遵循每个调用者在 Atlassian 中已有的权限。用户打不开的 Jira 项目或 Confluence 空间，智能体同样无法访问。
- **Atlassian 应用**：无需创建。Atlassian 支持[动态客户端注册（dynamic client registration）](https://datatracker.ietf.org/doc/html/rfc7591)，服务器对所有 Atlassian Cloud 客户开放，无需单独注册。
- **替代方案**：Atlassian 还提供 API token 认证，需要组织管理员先在 Atlassian Administration 中启用。两种方式的工具覆盖范围不同，如果缺少你预期的产品，请查阅 Atlassian 的受支持工具页面。

## 端点

**远程 MCP 服务器**：

```
https://mcp.atlassian.com/v1/mcp/authv2
```

Atlassian 文档中为手动配置的客户端指定的是 `authv2`，LiteLLM 正属于这一类。旧地址 `https://mcp.atlassian.com/v1/mcp` 仍然有效，Atlassian 的一键安装器也仍在分发它，所以你可能会在既有配置里见到它；新配置请优先使用 `authv2`。

***

## 通过 LiteLLM MCP 网关连接

:::warning[不要填写客户端凭证]
不要在这台服务器上设置 `client_id`、`client_secret` 或 `token_url`。一旦设置，它就会切换成所有调用者共享的机器对机器（machine-to-machine）身份，Jira 上的变更会被记到一个服务账号头上，而不是真正提出请求的那个人。Atlassian 的动态注册让这些字段完全没有必要。
:::

### 第 1 步：在 LiteLLM 中注册服务器

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

进入 **MCP 服务器**页面，点击 **+ 新增 MCP 服务器**，然后设置：

| 字段 | 值 |
|---|---|
| **服务器名称** | `atlassian_mcp` |
| **传输协议** | HTTP |
| **服务器 URL** | `https://mcp.atlassian.com/v1/mcp/authv2` |
| **认证方式** | OAuth |
| **OAuth 流程类型** | Interactive (PKCE) |
| **Client ID / Client Secret** | 留空 |

点击 **创建 MCP 服务器**，然后打开该服务器的 **MCP 工具**标签页确认连接。首次列出工具时，会引导你完成 Atlassian 登录和站点选择。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  atlassian_mcp:
    url: "https://mcp.atlassian.com/v1/mcp/authv2"
    transport: "http"
    description: "Jira, Confluence, and Compass"
    auth_type: oauth2
    oauth2_flow: authorization_code
```

`oauth2_flow: authorization_code` 表示选择按用户的交互式流程，此项必填；`auth_type: oauth2` 的服务器如果缺少它，代理会拒绝启动。持久化保存 MCP 服务器还需要 `store_model_in_db: true`，详见[前置条件](../mcp.md#前提条件)。

</TabItem>
</Tabs>

### 第 2 步：设置代理的对外 origin

如果 LiteLLM 部署在终结 TLS 的 ingress 之后，请把 `PROXY_BASE_URL` 设置为用户在地址栏里看到的 origin，这样 OAuth 回调才能通过校验：

```bash
PROXY_BASE_URL=https://llm.example.com
```

两者不一致时，点击 **连接** 会得到 `400 Bad Request` 和 `{"detail":"invalid_request"}`。完整规则见[反向代理与 ingress 配置](../mcp_oauth.md#reverse-proxy-and-ingress-configuration)。

### 第 3 步：从智能体发起连接

网关在 `http://localhost:4000/{server_name}/mcp` 上对外提供每台服务器，因此 `atlassian_mcp` 可以通过 `http://localhost:4000/atlassian_mcp/mcp` 访问。

<Tabs>
<TabItem value="cursor" label="Claude Desktop / Cursor">

```json title="Claude Desktop / Cursor" showLineNumbers
{
  "mcpServers": {
    "atlassian": {
      "url": "http://localhost:4000/atlassian_mcp/mcp",
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
claude mcp add --transport http atlassian http://localhost:4000/atlassian_mcp/mcp \
  --header "x-litellm-api-key: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

首次调用会打开浏览器完成授权并选择站点。LiteLLM 会保存该用户的 token 并在之后自动刷新，因此后续会话无需再次提示即可连接。

***

## 提供的工具

:::info
Atlassian 在运行时通过 `tools/list` 发布工具定义，名称和字段可能随时变动、恕不另行通知。LiteLLM 管理界面（Admin UI）中的 **MCP 工具**标签页是你的站点实际暴露了哪些工具的权威来源；它会列出当前可用的工具，还允许你用测试参数调用某个工具。上游细节请参阅 Atlassian 的 [MCP 服务器文档](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/)。
:::

| 产品 | 能力 |
|---|---|
| Jira | 问题搜索、问题创建与更新、批量创建问题 |
| Confluence | 页面读取与摘要、页面创建、空间导航 |
| Compass | 组件创建、从 CSV 或 JSON 批量导入组件与自定义字段、依赖关系查询 |
| Jira Service Management | 请求与队列访问 |
| Bitbucket | 仓库与拉取请求访问 |
| 跨产品 | 跨产品关联条目，例如把工单附到页面上，或者查找与某个 Compass 组件关联的文档 |

LiteLLM 会在工具名前面加上服务器名作为前缀，因此名为 `getJiraIssue` 的工具会以 `atlassian_mcp-getJiraIssue` 的形式暴露给模型；参见[工具命名](../mcp_rest_api.md#工具命名)。这台服务器的工具面很大，建议启用 [MCP 工具搜索](../mcp_tool_search.md)和[语义过滤](../mcp_semantic_filter.md)，把模型的工具列表压到足够小才真正可用。

### 已知限制

该服务器目前处于 beta 阶段，Atlassian 会按套餐施加各自的每小时请求配额。批量操作受速率和格式限制，部分自定义 Jira 字段可能需要手动配置，某些客户端的支持也不完整。一个会话绑定一个站点，授权时选错站点的用户只能断开并重新连接服务器，无法原地切换。

***

:::info[限制谁可以使用]
用 `object_permission` 按密钥或按团队授予该服务器的访问权限，并用 `mcp_rpm_limit` 限制每台服务器的调用量，两者都在 [MCP 权限管理](../mcp_control.md)中有说明。在这台服务器上，按密钥设置上限比在多数服务器上更要紧：Atlassian 的 beta 配额是整个站点共享的，一个失控的智能体就可能把它耗尽。
:::

:::warning[把 LiteLLM 密钥放在 `x-litellm-api-key` 中]
交互式 OAuth 需要把 `Authorization` 头留给上游 token。如果客户端以 `Authorization: Bearer sk-...` 的形式发送 LiteLLM API 密钥，OAuth 流程根本不会运行，LiteLLM 会把你的 LiteLLM 密钥转发给 Atlassian，然后被拒绝。排查时，加上 `x-litellm-mcp-debug: true` 并读取响应头：对 `https://mcp.atlassian.com/v1/mcp/authv2` 的健康调用会返回 `x-mcp-debug-auth-resolution: oauth2-passthrough`，`SAME_AS_LITELLM_KEY` 正对应本条情形，而 `m2m-client-credentials` 表示已设置客户端凭证、所有调用者共享同一身份。参见 [OAuth 调试](../mcp_oauth.md#oauth-调试)和 [MCP 故障排查指南](../mcp_troubleshoot.md)。
:::
