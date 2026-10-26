import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Microsoft 365 MCP 服务器

> 通过 Microsoft Graph 访问 Outlook 邮件与日历、OneDrive 与 SharePoint 文件以及 Teams，每一次工具调用都以当前登录用户自己的 Entra ID 账户身份运行。

Microsoft Graph 是 Microsoft 365 背后的 API，开源的 [ms-365-mcp-server](https://github.com/Softeria/ms-365-mcp-server) 通过 MCP（Model Context Protocol）把它暴露出来。这台服务器以 Streamable HTTP 方式运行在代理旁边，自己不给任何人做登录，而是拿请求里附带的 Bearer 令牌去调用 Graph；令牌由 LiteLLM 提供：它为每个用户执行 Entra ID 登录，把拿到的 Graph 令牌与对应的 LiteLLM 用户绑定存储，并在每次工具调用时附上。整个过程不涉及共享邮箱凭据，也不涉及租户级应用机密。LiteLLM 在此之上提供集中式认证、按密钥和团队的访问控制、按工具调用的成本追踪，以及覆盖所有已接入 MCP 服务器的统一审计记录。

这台服务器只负责把 MCP 调用翻译成 Graph 调用。登录、同意授权、令牌存储和刷新都发生在 LiteLLM 与 Entra ID 之间，因此换掉服务器不会改变用户的认证方式：任何拿到 `Authorization: Bearer` 令牌就用它调用 Graph 的 MCP 服务器，都能配合同样的 LiteLLM 配置工作，只需换一个 `url`。

## 何时使用此服务器

- 让智能体直接使用用户本人的收件箱和日历：收到了什么、订了哪些会、谁有空，而不必依赖共享服务邮箱
- 在回答前先从 SharePoint 和 OneDrive 拉取文档作为检索步骤，且范围仅限这个人本来就有权打开的内容
- 在同一个服务器上读写 Teams 聊天和频道、管理 Planner 与 To Do 任务、查询 Excel 表格和 OneNote 页面

## 核心特性

- 通过 Entra ID 实现按用户认证：每位调用者只需在浏览器里同意授权一次，之后每次工具调用都携带其委托的 Graph 权限，智能体能看到的内容与用户本人完全一致
- 工具面取决于应用注册上配置的委托权限，只读部署和完整读写部署用同一个服务器，只是权限范围（scope）不同
- 覆盖邮件、日历、联系人、OneDrive、SharePoint、Teams、Planner、To Do、OneNote、Excel、用户和群组的 300 多个工具，另有 `search-query` 和 `graph-batch` 兜底 Graph 的其余能力
- 以 Streamable HTTP 自托管运行，Graph 流量始终留在你的网络内

## 身份验证

- **方法**：对接 Microsoft Entra ID 的 OAuth 2.0 授权码加 PKCE 流程。Entra 不支持动态客户端注册，所以你需要自己注册一个应用，并把它的 client ID 和 secret 提供给 LiteLLM。随后 LiteLLM 会为该服务器发布 OAuth 发现文档，把 MCP 客户端指向它自己挡在 Entra 之前的登录端点（即下文的 `per_server_oauth_discovery: true`）。
- **应用注册**：在 [Microsoft Entra 管理中心](https://entra.microsoft.com)的 **App registrations** 下创建一个。接下来要添加 Web 重定向 URI、一个客户端机密，以及 Microsoft Graph 的委托权限。
- **同意授权**：每个用户在首次登录时批准这些委托权限。如果租户限制用户自行同意，则需要管理员在应用注册的 **API permissions** 页面统一授予一次。

### 通过 Okta 或其他身份提供商单点登录

Microsoft Graph 只接受 Entra ID 签发的访问令牌，因此无论是 Okta 令牌还是 LiteLLM 单点登录（SSO）的凭据，都顶替不了 Graph 令牌，LiteLLM 也不会在两者之间做转换。能沿用下来的是登录这件事本身。当你的 Microsoft 365 租户把身份验证联合到 Okta 或其他身份提供商时，LiteLLM 发起的 Entra 登录会像其他 Microsoft 365 登录一样重定向过去，用户看到的是自己熟悉的 SSO 页面，返回之后 Entra 再签发 Graph 令牌。每个用户只需这样做一次，之后由 LiteLLM 负责刷新令牌。

这种部署里还会遇到另外三种 LiteLLM 认证模式，但没有一种能取代上面的流程。[On-behalf-of 令牌交换](../mcp_obo_auth.md)交换的是客户端已经出示给 LiteLLM 的 Entra ID 令牌，因此只适用于用户用 Entra ID 令牌而非 Okta 登录 LiteLLM 的场景。[ID-JAG](../mcp_id_jag.md) 从 Okta 授权服务器获取令牌，而 Graph 并不信任它。[OAuth 透传](../mcp_oauth_passthrough.md)原样转发客户端的 Bearer 令牌、不做任何交换，客户端仍然得自己去拿 Graph 令牌。

## 端点

**自托管 MCP 服务器**（组织模式，Streamable HTTP，端口 3000）：

```bash
npx -y @softeria/ms-365-mcp-server --http 3000 --org-mode
```

服务器随后监听在 `http://localhost:3000/mcp`。`--http` 让它改为接受每个请求附带的 Bearer 令牌（也就是 LiteLLM 转发来的那个），而不是自己发起登录；它只检查令牌存在且未过期，其余校验都交给 Graph。`--org-mode` 启用工作与学校相关的工具（Teams、SharePoint、共享邮箱）及其权限。加上 `--read-only` 可以去掉所有写工具，或用 `--enabled-tools <regex>` 只暴露一部分工具。生产环境请固定版本（`@softeria/ms-365-mcp-server@<version>`），因为工具列表会随版本变化。该端口应只允许代理访问。

***

## 通过 LiteLLM MCP 网关连接

:::info
Microsoft 365 属于需要显式提供客户端凭据的那类服务器。LiteLLM 通常通过动态注册完成 OAuth 客户端配置，[Atlassian](./atlassian.md) 和 [Linear](./linear.md) 服务器就是这样，但 Entra ID 要求使用你自己的应用注册，和 [Slack](./slack.md) 一样。
:::

### 第 1 步：注册 Entra ID 应用

1. 在 [Microsoft Entra 管理中心](https://entra.microsoft.com)打开 **App registrations**，点击 **New registration**。
2. 起个名字（例如 `LiteLLM MCP gateway - Microsoft 365`），并保持 **Accounts in this organizational directory only**，除非需要允许其他租户的用户登录。
3. 在 **Redirect URI** 下选择 **Web** 平台，填入 `{PROXY_BASE_URL}/callback`：

   ```
   https://llm.example.com/callback
   ```

4. 把 `https://llm.example.com` 换成用户在地址栏里看到的 origin。LiteLLM 发给 Entra 的 `redirect_uri` 就是这个值，两边不一致时，流程会在 Microsoft 登录页以 `AADSTS50011` 失败。如果 LiteLLM 部署在入口（ingress）后面，参见[反向代理与入口配置](../mcp_oauth.md#reverse-proxy-and-ingress-configuration)。
5. 在 **Certificates & secrets** 下创建客户端机密，并立即复制它的 **Value**，因为这个值只显示一次。
6. 在 **API permissions** 下点击 **Add a permission**，选择 **Microsoft Graph**，再选 **Delegated permissions**，按需添加权限范围，对应[提供的工具](#提供的工具)一节的表格。只读部署需要 `openid`、`offline_access`、`User.Read`、`Mail.Read`、`Calendars.Read`、`Files.Read.All` 和 `Sites.Read.All`。`offline_access` 是 LiteLLM 能刷新令牌的关键，务必保留。
7. 如果租户禁止用户自行同意授权，点击 **Grant admin consent**。
8. 在 **Overview** 页复制 **Application (client) ID** 和 **Directory (tenant) ID**。

### 第 2 步：运行 Graph MCP 服务器

把服务器启动在代理所在主机上，或者一台只有代理能访问的机器上。`--http` 让它使用 LiteLLM 转发来的令牌，而不是自己弹出登录，`--org-mode` 打开工作与学校相关工具：

```bash
npx -y @softeria/ms-365-mcp-server --http 3000 --org-mode
```

### 第 3 步：在 LiteLLM 中注册该服务器

<Tabs>
<TabItem value="config" label="config.yaml">

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  microsoft_365:
    url: "http://localhost:3000/mcp"
    transport: "http"
    description: "Outlook mail and calendar, OneDrive and SharePoint files, and Teams through Microsoft Graph"
    auth_type: oauth2
    oauth2_flow: authorization_code
    per_server_oauth_discovery: true
    client_id: os.environ/M365_ENTRA_CLIENT_ID
    client_secret: os.environ/M365_ENTRA_CLIENT_SECRET
    authorization_url: "https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/authorize"
    token_url: "https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token"
    scopes:
      - openid
      - offline_access
      - User.Read
      - Mail.Read
      - Calendars.Read
      - Files.Read.All
      - Sites.Read.All
```

`oauth2_flow: authorization_code` 选择的是交互式按用户流程，为必填项；`auth_type: oauth2` 的服务器如果缺了这一项，代理会拒绝启动。`per_server_oauth_discovery: true` 让 LiteLLM 自己为 `/microsoft_365/mcp` 发布 OAuth 发现文档，用自家的 `/microsoft_365/authorize` 和 `/microsoft_365/token` 端点挡在上面那些 Entra URL 之前。不开启的话，该服务器的受保护资源元数据会把 MCP 客户端引向网关共享的 `/mcp` 授权服务器，用户会被带去登录 LiteLLM 而不是 Entra，浏览器最终停在 "The connection cannot continue" 页面，Graph 令牌也就永远存不下来。存储 MCP 服务器还需要 `store_model_in_db: true`，见[前置条件](../mcp.md#前提条件)。

</TabItem>
<TabItem value="ui" label="LiteLLM UI">

进入 **MCP Servers** 页，点击 **+ Add New MCP Server**，然后逐项设置：

| 字段 | 值 |
|---|---|
| **Server Name** | `microsoft_365` |
| **Transport** | HTTP |
| **Server URL** | `http://localhost:3000/mcp` |
| **Authentication** | OAuth |
| **OAuth flow type** | Interactive (PKCE) |
| **Client ID / Client Secret** | 来自第 1 步 |
| **Authorization URL** | `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/authorize` |
| **Token URL** | `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token` |
| **Scopes** | 第 1 步中配置的委托权限 |

点击 **Create MCP Server**。表单里暂时还没有 `per_server_oauth_discovery` 字段，需要通过管理 API 开启，`server_id` 用服务器页面上显示的那个：

```bash showLineNumbers
curl -X PUT http://localhost:4000/v1/mcp/server \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"server_id": "<server_id>", "per_server_oauth_discovery": true}'
```

然后打开该服务器的 **MCP Tools** 标签页，确认 LiteLLM 能列出 Graph 工具。首次列取会触发浏览器登录。

</TabItem>
</Tabs>

### 第 4 步：设置代理的对外 origin

LiteLLM 用自己的对外 origin 拼出发给 Entra 的 `redirect_uri`。把 `PROXY_BASE_URL` 设成第 1 步里注册的那个 origin，保证两者一致：

```bash
export PROXY_BASE_URL=https://llm.example.com
```

### 第 5 步：让用户有权访问该服务器

LiteLLM 会把每个 Entra 令牌存储到密钥背后的那个 LiteLLM 用户名下，因此该密钥或其所属团队需要在 `object_permission.mcp_servers` 里配好这台服务器，且密钥背后必须有对应用户。缺少这一步的密钥虽然能完成登录，却没地方保存令牌，于是下次会话要重新登录，代理日志里会出现 `OAuth credential storage not authorized`。参见 [MCP 权限管理](../mcp_control.md)。通过 SSO 登录 LiteLLM 的用户已经有对应的 LiteLLM 用户，只要把这台服务器授予其身份提供商组映射到的团队即可。

### 第 6 步：从智能体连接

网关把每台服务器挂在 `http://localhost:4000/{server_name}/mcp` 下，因此 `microsoft_365` 可以通过 `http://localhost:4000/microsoft_365/mcp` 访问。

<Tabs>
<TabItem value="claude-code" label="Claude Code">

```bash showLineNumbers
claude mcp add --transport http microsoft_365 http://localhost:4000/microsoft_365/mcp \
  --header "x-litellm-api-key: Bearer $LITELLM_API_KEY"
```

在 Claude Code 里执行 `/mcp` 就能看到这台服务器并启动 Entra 登录。Claude Code 会缓存它向网关注册的 OAuth 客户端，因此如果你是在添加服务器之后才开启 `per_server_oauth_discovery`，需要把服务器移除后重新添加。

通过 SSO 登录 LiteLLM 的用户没有可粘贴的 `sk-` 密钥。执行 `lite login`（[CLI 身份验证](../proxy/cli_sso.md)）之后，可以让 Claude Code 用 `headersHelper` 自行获取请求头；它是一条命令，输出为 JSON 格式的请求头：

```json title=".mcp.json" showLineNumbers
{
  "mcpServers": {
    "microsoft_365": {
      "type": "http",
      "url": "http://localhost:4000/microsoft_365/mcp",
      "headersHelper": "printf '{\"x-litellm-api-key\": \"Bearer %s\"}' \"$(lite auth print-token)\""
    }
  }
}
```

随后的 Microsoft 登录会存储到 SSO 创建的那个 LiteLLM 用户名下，因此同一个人在不同密钥和会话之间共用同一份 Graph 令牌。

</TabItem>
<TabItem value="claude-desktop" label="Claude Desktop">

使用第三方推理的 Claude Desktop 在 **Configure Third-Party Inference** > **Connectors** 下添加 MCP 服务器，导出后对应一个 `managedMcpServers` 条目。把它指向按服务器区分的路径，并设置 `"oauth": true`，这样当 LiteLLM 返回 401 时，Claude Desktop 会自己发起 Microsoft 登录：

```json title="managedMcpServers" showLineNumbers
[
  {
    "name": "microsoft_365",
    "transport": "http",
    "url": "http://localhost:4000/mcp/microsoft_365",
    "headers": {"x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"},
    "oauth": true
  }
]
```

整支团队通过 SSO 登录的部署请把 `headers` 换成 `headersHelper`，详见 [Claude Desktop (Cowork)](../tutorials/claude_desktop_cowork.md#mcp-servers-through-the-litellm-mcp-gateway)。Claude Desktop 内置的 Microsoft 365 连接器是直连 Microsoft 的，完全不经过 LiteLLM，享受不到上面的任何访问控制或日志；请改用这里的 `url` 条目。

</TabItem>
<TabItem value="cursor" label="Cursor">

```json title="Cursor" showLineNumbers
{
  "mcpServers": {
    "microsoft_365": {
      "url": "http://localhost:4000/microsoft_365/mcp",
      "headers": {
        "x-litellm-api-key": "Bearer sk-<your-litellm-api-key>"
      }
    }
  }
}
```

</TabItem>
</Tabs>

第一次调用会打开浏览器进入 Microsoft 登录页，随后是同意授权页面，列出第 1 步里配置的那些委托权限。LiteLLM 会保存该用户的令牌并负责后续刷新，之后的会话无需再提示即可连接。`GET /v1/mcp/server/{server_id}/oauth-user-credential/status` 可以查看调用用户是否有已存的令牌以及过期时间，`DELETE /v1/mcp/server/{server_id}/oauth-user-credential` 则用于吊销。


***

## 提供的工具

:::info
该服务器在运行时通过 `tools/list` 发布工具定义，名称和字段会随版本变化（0.155.0 版在组织模式下列出 337 个工具）。你的租户实际暴露了哪些能力，以 LiteLLM UI 里的 **MCP Tools** 标签页为准；它会列出实时工具，还允许你带测试参数调用。`npx -y @softeria/ms-365-mcp-server --list-permissions --org-mode` 会打印完整工具列表背后的 Graph 权限集合，加上 `--read-only` 则打印只读集合。
:::

| 领域 | 工具（部分示例） | 委托权限 |
|---|---|---|
| 邮件 | `list-mail-messages`, `get-mail-message`, `list-mail-folders`, `list-mail-folder-messages`, `send-mail`, `forward-mail-message` | 读取需 `Mail.Read`，写入需 `Mail.ReadWrite` 和 `Mail.Send` |
| 日历 | `list-calendars`, `get-calendar-view`, `list-calendar-events`, `find-meeting-times`, `create-calendar-event` | 读取需 `Calendars.Read`，写入需 `Calendars.ReadWrite` |
| OneDrive | `list-drives`, `get-drive-root-item`, `list-folder-files`, `get-drive-item`, `upload-file-content`, `create-drive-item-share-link` | 读取需 `Files.Read.All`，写入需 `Files.ReadWrite` |
| SharePoint | `search-sharepoint-sites`, `get-sharepoint-site`, `list-sharepoint-site-drives`, `list-sharepoint-site-items`, `list-sharepoint-site-lists`, `get-sharepoint-site-list` | 读取需 `Sites.Read.All`，写入需 `Sites.ReadWrite.All` |
| Teams | `list-joined-teams`, `list-team-channels`, `list-channel-messages`, `list-chats`, `list-chat-messages`, `send-channel-message`, `send-chat-message` | 读取需 `Team.ReadBasic.All`、`Channel.ReadBasic.All`、`ChannelMessage.Read.All`、`Chat.Read`；写入需 `ChannelMessage.Send`、`Chat.ReadWrite` |
| Planner 与 To Do | `list-planner-tasks`, `list-todo-task-lists`, `list-todo-tasks`, `create-planner-task`, `create-todo-task` | 读取需 `Tasks.Read`，写入需 `Tasks.ReadWrite` |
| OneNote 与 Excel | `list-onenote-notebooks`, `list-onenote-pages`, `get-onenote-page-content`, `list-excel-worksheets`, `list-excel-tables`, `get-excel-range` | 读取需 `Notes.Read` 和 `Files.Read.All`，写入需 `Notes.ReadWrite` 和 `Files.ReadWrite` |
| 人员与目录 | `get-current-user`, `list-users`, `get-user-manager`, `list-outlook-contacts`, `list-groups`, `list-group-members` | `User.Read`, `User.Read.All`, `Contacts.Read`, `Group.Read.All`, `GroupMember.Read.All` |
| 跨服务 | `search-query`（跨邮件、文件、站点和人员进行 Graph 搜索）、`graph-batch`（一次往返完成多个 Graph 调用） | 取决于所搜索或批处理的资源需要什么 |

每个工具到达智能体时都叫 `microsoft_365-<tool>`（见[工具命名](../mcp_rest_api.md#工具命名)）。三百个工具远超大多数智能体单个上下文的承载量，所以建议搭配 [Tool Search](../mcp_tool_search.md) 或 [Semantic Filter](../mcp_semantic_filter.md) 使用，或者用 `--enabled-tools` 精简启动该服务器。

### 已知限制

这台服务器会拿它收到的任何未过期 Bearer 令牌去调用 Graph，还对外提供自己的登录端点，因此必须保证它只能经代理访问。OneDrive 从未开通的用户（还没在网页版打开过 OneDrive 或 Office）调用 OneDrive 工具会得到 `itemNotFound`；SharePoint 文档库不受影响。`search-query` 和 `search-sharepoint-sites` 使用 Graph 搜索（KQL）语法，单独一个 `*` 会被拒绝。用户同意授权之后再往应用注册里加权限，需要重新走一次同意：先用 `DELETE /v1/mcp/server/{server_id}/oauth-user-credential` 吊销已存凭据，再重新登录。Entra 访问令牌的有效期约一小时；LiteLLM 靠 `offline_access` 的刷新令牌来续期，漏掉这个 scope 就意味着每小时都要重新登录一次。

***

:::info[限制谁可以使用]
可以用 `object_permission` 按密钥或按团队授予这台服务器，并用 `mcp_rpm_limit` 给每台服务器的调用量设上限，两者都见 [MCP 权限管理](../mcp_control.md)。Graph 自带按用户的限流，所以失控的智能体先拖慢的是该用户自己的 Outlook 和 Teams 客户端，而不是别人的。
:::

:::warning[把 LiteLLM 密钥放进 `x-litellm-api-key`]
交互式 OAuth 需要把 `Authorization` 头留给上游令牌。如果客户端把 LiteLLM API 密钥放在 `Authorization: Bearer sk-...` 里发送，OAuth 流程就不会执行，LiteLLM 会把你的 LiteLLM 密钥转发给 Graph 服务器，再被传给 Microsoft，最终被 Graph 以 `InvalidAuthenticationToken` 拒绝。参见 [OAuth 调试](../mcp_oauth.md#oauth-调试)和 [MCP 故障排查指南](../mcp_troubleshoot.md)。
:::
