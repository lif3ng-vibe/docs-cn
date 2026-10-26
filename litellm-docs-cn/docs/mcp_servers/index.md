# MCP 服务器的使用

> 通过 LiteLLM MCP 网关连接热门第三方 MCP（Model Context Protocol）服务器的配置指南。

每篇指南都会介绍该服务器的端点、LiteLLM 所需的认证方式、如何注册，以及如何从 agent 调用它的工具。无论出自哪家厂商，网关对所有服务器一视同仁：所有客户端共用同一个端点，权限按密钥、团队和组织划分，每次工具调用都有成本追踪（cost tracking），审计记录也集中在一条链路上。

关于共用的端点、传输与认证规则，参见 [MCP 配置参考](../mcp_config_reference)。

## 服务器

| 服务器 | 端点 | 认证 | 覆盖功能 |
|---|---|---|---|
| [Slack](./slack.md) | `https://mcp.slack.com/mcp` | OAuth 2.1，使用你自己的 Slack 应用 | 搜索、频道与话题串读取、发消息、Canvas |
| [Atlassian](./atlassian.md) | `https://mcp.atlassian.com/v1/mcp/authv2` | OAuth 2.1，动态注册 | Jira、Confluence、Compass、Jira Service Management、Bitbucket |
| [Linear](./linear.md) | `https://mcp.linear.app/mcp` | OAuth 2.1，动态注册 | 事项、项目、周期、文档、评论 |
| [Microsoft 365](./microsoft_365.md) | 自托管 `http://localhost:3000/mcp`（[ms-365-mcp-server](https://github.com/Softeria/ms-365-mcp-server)） | OAuth 2.0，使用你自己的 Entra ID 应用 | Outlook 邮件与日历、OneDrive、SharePoint、Teams、Planner、To Do、OneNote、Excel |

其他任何远程 MCP 服务器都是同样的套路：把 `url` 指向它的端点，再从 [MCP 概览](../mcp.md) 中的认证表里选出匹配的 `auth_type`。

## 这些指南的前提

Slack、Atlassian 和 Linear 由各自厂商托管，走 Streamable HTTP，因此无需自己安装或运行任何东西。Microsoft 365 是一个开源服务器，需要你在代理（proxy）旁边自行运行，其指南会专门说明这一点。这四个服务器都通过交互式 OAuth 按用户认证，也就是说每个调用者都要通过浏览器登录一次，工具调用携带的是该用户本人的权限，而非共享的服务身份。存储 MCP 服务器需要在代理上开启 `store_model_in_db: true`，参见 [前提条件](../mcp.md#前提条件)。

```yaml title="config.yaml" showLineNumbers
general_settings:
  store_model_in_db: true
```

:::warning[将 LiteLLM 密钥放入 `x-litellm-api-key`]
交互式 OAuth 需要把 `Authorization` 头留给上游令牌使用。如果客户端以 `Authorization: Bearer sk-...` 的形式发送 LiteLLM API 密钥，OAuth 流程就不会触发，代理会把你的 LiteLLM 密钥直接转发给上游服务器，进而被拒绝。这是这四个服务器上最常见的故障。参见 [OAuth 调试](../mcp_oauth.md#oauth-调试)。
:::

## 相关页面

客户端侧的用法见 [使用你的 MCP](../mcp_usage.md)，按密钥和团队的访问控制见 [MCP 权限管理](../mcp_control.md)，OAuth 流程见 [MCP OAuth](../mcp_oauth.md)，每个工具的花费见 [MCP 成本追踪](../mcp_cost.md)，连接类故障见 [MCP 故障排查指南](../mcp_troubleshoot.md)。
