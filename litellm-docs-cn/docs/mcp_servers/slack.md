import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Slack MCP 服务器

> 通过 LiteLLM MCP 网关接入 Slack 托管的 MCP（Model Context Protocol）服务器，实现工作区搜索、频道读取和消息发送。

服务器由 Slack 托管和维护，你无需自行部署或运行任何东西。LiteLLM 在此之上提供集中认证、按密钥和团队的访问控制、逐次工具调用的成本追踪，以及覆盖你所暴露的所有 MCP 服务器的一份审计记录。

## 适用场景

- 给智能体（agent）提供工作区上下文：某个频道里定了什么、谁说的、什么时候说的
- 让智能体把进展、摘要或告警直接发进 Slack，而不只是在对话里汇报
- 回答之前，先在消息、文件和 Canvas 中做一轮检索

## 核心特性

- 可用的工具取决于你授予的 OAuth 作用域（scope），只读上线和全读写上线用的是同一个服务器，差别只在授权范围
- 由 Slack 通过 Streamable HTTP 托管；没有本地进程，也没有需要轮换的机器人令牌
- 按用户认证，每次工具调用都以当前登录者的身份执行，且只能看到该用户本来就有权限查看的 Slack 内容

## 身份验证

- **方式**：使用用户令牌的 OAuth 2.1。Slack 不支持动态客户端注册，所以你需要自己创建一个 Slack 应用，并把它的客户端凭据交给 LiteLLM。
- **Slack 应用**：在 [api.slack.com/apps](https://api.slack.com/apps) 创建一个。你需要设置重定向 URL、添加用户令牌作用域，并打开 Model Context Protocol 开关。Slack 只允许内部应用和目录发布型应用启用 MCP，所以你在自己工作区里建的应用就符合条件。

## 端点

**远程 MCP 服务器**：

```
https://mcp.slack.com/mcp
```

***

## 通过 LiteLLM MCP 网关连接

:::info
Slack 属于需要显式提供客户端凭据的那类服务器。LiteLLM 通常会通过动态注册替你完成 OAuth 客户端配置，[Atlassian](./atlassian.md) 和 [Linear](./linear.md) 服务器就是这样，但 Slack 要求你自建应用。
:::

### 步骤 1：创建 Slack OAuth 应用

1. 打开 [api.slack.com/apps](https://api.slack.com/apps)，点击 **创建新应用**（Create New App），再选 **从零开始**（From scratch），然后选择允许智能体访问的工作区。
2. 打开 **OAuth 与权限**（OAuth & Permissions）。
3. 在 **重定向 URL**（Redirect URLs）下添加 `{PROXY_BASE_URL}/callback`，然后点击 **保存 URL**（Save URLs）：

   ```
   https://llm.example.com/callback
   ```

4. 把 `https://llm.example.com` 替换成用户在地址栏里看到的源地址。LiteLLM 会把这个值作为 `redirect_uri` 发给上游，一旦不匹配，授权流程会在 Slack 的同意页面上失败。如果 LiteLLM 部署在入口网关之后，参见[反向代理与入口配置](../mcp_oauth.md#reverse-proxy-and-ingress-configuration)。
5. 在 **用户令牌作用域**（User Token Scopes）下，按照[提供的工具](#各能力对应的-oauth-作用域)一节中的表格，添加你所需能力对应的作用域。大规模上线时先只开只读，再给你信任的团队逐步补上写入作用域。
6. 从 **基本信息**（Basic Information）中复制 **客户端 ID**（Client ID）和 **客户端密钥**（Client Secret）。

### 步骤 2：启用 MCP（Agents & AI Apps）

:::warning
MCP 端点藏在 **智能体与 AI 应用**（Agents & AI Apps）下面，是每个应用独立的一个开关。如果不开它，OAuth 照样成功，但工具列表会返回空或 403，看起来像是 LiteLLM 的权限问题，其实不是。
:::

1. 在应用设置中打开 **智能体与 AI 应用**。
2. 启用 **Model Context Protocol**。
3. 把应用安装（或重新安装）到工作区，让新作用域生效。

### 步骤 3：在 LiteLLM 中注册服务器

<Tabs>
<TabItem value="ui" label="LiteLLM UI">

进入 **MCP 服务器**（MCP Servers）页面，点击 **添加新 MCP 服务器**（+ Add New MCP Server），然后设置：

| 字段 | 值 |
|---|---|
| **服务器名称**（Server Name） | `slack_mcp` |
| **传输协议**（Transport） | HTTP |
| **服务器 URL** | `https://mcp.slack.com/mcp` |
| **身份验证**（Authentication） | OAuth |
| **OAuth 流程类型**（OAuth flow type） | Interactive (PKCE) |
| **客户端 ID / 客户端密钥**（Client ID / Client Secret） | 来自步骤 1 |

点击 **创建 MCP 服务器**（Create MCP Server），然后打开该服务器的 **MCP 工具**（MCP Tools）标签页，确认 LiteLLM 能列出 Slack 的工具。第一次列出工具时就会触发浏览器登录。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  slack_mcp:
    url: "https://mcp.slack.com/mcp"
    transport: "http"
    description: "Slack workspace search, channels, and messaging"
    auth_type: oauth2
    oauth2_flow: authorization_code
    client_id: os.environ/SLACK_OAUTH_CLIENT_ID
    client_secret: os.environ/SLACK_OAUTH_CLIENT_SECRET
```

`oauth2_flow: authorization_code` 选择的是交互式按用户流程，此项必填；`auth_type: oauth2` 的服务器如果漏掉它，代理会拒绝启动。把 MCP 服务器存入数据库还需要 `store_model_in_db: true`，见[前置条件](../mcp.md#前提条件)。

</TabItem>
</Tabs>

### 步骤 4：从智能体连接

网关把每个服务器挂在 `http://localhost:4000/{server_name}/mcp` 路径下，所以 `slack_mcp` 的地址就是 `http://localhost:4000/slack_mcp/mcp`。

<Tabs>
<TabItem value="cursor" label="Claude Desktop / Cursor">

```json title="Claude Desktop / Cursor" showLineNumbers
{
  "mcpServers": {
    "slack": {
      "url": "http://localhost:4000/slack_mcp/mcp",
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
claude mcp add --transport http slack http://localhost:4000/slack_mcp/mcp \
  --header "x-litellm-api-key: Bearer $LITELLM_API_KEY"
```

</TabItem>
</Tabs>

首次调用会打开浏览器进行 Slack 登录。LiteLLM 会保存该用户的令牌并在此后自动刷新，因此后续会话无需再次确认即可连接。

***

## 提供的工具

:::info
Slack 在运行时通过 `tools/list` 发布工具定义，名称和字段可能随时变化，恕不另行通知。LiteLLM 管理界面中的 **MCP 工具** 标签页是工作区实际暴露了哪些工具的权威依据：它列出当前可用的工具，还能让你带上测试参数调用某一项。上游细节见 Slack 的 [Slack MCP 服务器概览](https://docs.slack.dev/ai/slack-mcp-server)。
:::

| 类别 | 工具 |
|---|---|
| 搜索 | `search_public`, `search_public_and_private`, `search_channels`, `search_users` |
| 读取 | `read_channel`, `read_thread`, `read_user_profile` |
| 消息 | `send_message`, `send_message_draft`, `schedule_message` |
| Canvas | `create_canvas`, `read_canvas`, `update_canvas` |

Canvas 相关工具需要付费版 Slack 套餐。LiteLLM 会给工具名加上服务器名前缀，所以 `search_public` 暴露给模型时叫 `slack_mcp-search_public`；见[工具命名](../mcp_rest_api.md#工具命名)。

### 各能力对应的 OAuth 作用域

| 能力 | 用户令牌作用域（示例） |
|---|---|
| 搜索消息和文件 | `search:read` |
| 读取公开频道 | `channels:read`, `channels:history` |
| 读取私有频道 | `groups:read`, `groups:history` |
| 读取私信 | `im:history` |
| 发送消息 | `chat:write` |
| 解析用户资料 | `users:read` |
| 读取文件 | `files:read` |

完整列表见 Slack 的 [OAuth 作用域](https://api.slack.com/scopes)文档。速率限制按工具单独生效，档位与对应的 Web API 方法一致，并与你在 LiteLLM 中配置的限制叠加。

***

:::info[限制使用范围]
用 `object_permission` 按密钥或按团队授予对该服务器的访问权，用 `mcp_rpm_limit` 为每台服务器设置调用频次上限，两者都在 [MCP 权限管理](../mcp_control.md)中有说明。给使用方授予能满足需要的最窄作用域集合；只需总结频道内容的密钥用不着 `chat:write`。
:::

:::warning[把 LiteLLM 密钥放进 `x-litellm-api-key`]
交互式 OAuth 需要把 `Authorization` 请求头空出来，让给上游令牌。如果客户端把 LiteLLM API 密钥放进 `Authorization: Bearer sk-...`，OAuth 流程根本不会运行，LiteLLM 会把你的 LiteLLM 密钥原样转发给 Slack，结果被 Slack 拒收。排查时可以加上 `x-litellm-mcp-debug: true` 并查看响应头：出现 `SAME_AS_LITELLM_KEY` 即命中这种情况；出现 `m2m-client-credentials` 则说明设置了 `token_url`，所有调用方共享同一个身份。见 [OAuth 调试](../mcp_oauth.md#oauth-调试)和 [MCP 故障排查指南](../mcp_troubleshoot.md)。
:::
