---
title: "设置按用户 OAuth 2.0 连接器"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

最后验证于 Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

Google Workspace、Atlassian、Salesforce 等一些外部服务要求每个用户单独授权，Aperture 才能代表他们执行操作。Aperture 的 `oauth2_authorization_code` 认证类型通过带 Proof Key for Code Exchange（PKCE）（S256）的 OAuth 2.0 授权码流程来处理这一点。令牌按用户存储，凭证不会在用户之间共享。

## 前提条件

开始之前，你必须满足以下要求：

* 你有一台 [Aperture 网关][docs-get-started]，且至少配置了一个提供商。
* 拥有 Aperture 管理仪表板的[管理员权限][docs-set-up-admin-access]。
* 你在外部提供商（Google、Salesforce 等）拥有支持 OAuth 2.0 的账户，且有权限注册 OAuth 应用。
* 你有要连接的远程服务的 Model Context Protocol（MCP）服务器 URL。

## 步骤 1：在提供商处注册 OAuth 应用

在你的外部提供商处创建一个 OAuth 2.0 应用。注册时配置以下内容：

1. 把重定向 URI 设置为：

   ```text
   https://<aperture-hostname>/aperture/auth/<connector-id>/callback
   ```

   把 `<aperture-hostname>` 替换为你的 Aperture 网关的 Tailscale 主机名，`<connector-id>` 替换为你计划在 Aperture 配置中使用的连接器 ID（例如 `google` 或 `salesforce`）。连接器 ID 必须以字母开头，且只能包含字母和数字（匹配 `[a-zA-Z][a-zA-Z0-9]*`）。不允许使用连字符和下划线。

2. 如果提供商要求显式开启，请启用使用 S256 挑战方法的 PKCE。Aperture 在授权码流程中使用 PKCE（S256）。

3. 记录提供商应用设置中的以下值：
   * Client ID
   * Client secret（如果提供商签发；仅用 PKCE 的公共客户端不需要）
   * Authorization URL
   * Token URL
   * 所需的 scope

下表列出了常见提供商的授权 URL 与令牌 URL，以及所需的 `auth_params`：

| 提供商 | 认证 URL | 令牌 URL | 必需的 `auth_params` | 获取刷新令牌所需的 scope | 说明 |
| ------ | -------- | -------- | -------------------- | ------------------------ | ---- |
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `https://oauth2.googleapis.com/token` | `{"access_type": "offline", "prompt": "consent"}` | （在 `auth_params` 中设置） | 没有 `access_type: offline`，Google 不会签发刷新令牌。 |
| Salesforce | `https://login.salesforce.com/services/oauth2/authorize` | `https://login.salesforce.com/services/oauth2/token` | 无需设置 | `refresh_token` | 参阅下面的示例。也可以使用组织专属域名（`https://<org>.my.salesforce.com`）。 |

> **注意：**
>
> 本指南介绍 `oauth2_authorization_code` 流程，即你自己注册 OAuth 应用的方式。支持动态客户端注册的 MCP 服务器（如 Atlassian）则使用 [`oauth2_dcr`][docs-connectors-reference-dcr] 认证类型：Aperture 会在运行时发现授权服务器并注册客户端，因此你无需配置授权 URL 和令牌 URL。配置方法参阅[连接器参考][docs-connectors-reference-dcr]。

## 步骤 2：在 Aperture 中配置连接器

\[Missing snippet: aperture\_admin\_nav.mdx] 使用 `oauth2_authorization_code` 认证类型添加一个连接器条目。

下面的示例配置一个 Google Workspace 连接器：

```json
{
  "connectors": {
    "servers": {
      "google": {
        "protocol": "mcp",
        "url": "https://mcp.google.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<your-client-id>",
          "client_secret": "<your-client-secret>",
          "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
          "token_url": "https://oauth2.googleapis.com/token",
          "scopes": ["https://www.googleapis.com/auth/spreadsheets.readonly"],
          "auth_params": {"access_type": "offline", "prompt": "consent"}
        }
      }
    }
  }
}
```

> **警告：**
>
> 许多提供商在签发刷新令牌之前要求特定的 scope 或 `auth_params` 值。对 Google 来说，省略 `access_type: offline` 意味着提供商不会签发刷新令牌。另一些提供商则要求特定 scope：例如 Salesforce 需要 `refresh_token`。请查阅你的提供商的文档。设置不正确时，连接器起初看似正常，但在第一个访问令牌过期后（通常是一小时）就会静默失效。

`client_secret` 字段是可选的。如果提供商支持仅用 PKCE 的公共客户端、不签发 client secret，你可以省略该字段。

下面的示例配置一个 Salesforce 连接器：

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<your-salesforce-client-id>",
          "client_secret": "<your-salesforce-client-secret>",
          "auth_url": "https://login.salesforce.com/services/oauth2/authorize",
          "token_url": "https://login.salesforce.com/services/oauth2/token",
          "scopes": ["mcp_api", "refresh_token"]
        }
      }
    }
  }
}
```

## 步骤 3：向用户授予连接器工具的访问权

Aperture 默认拒绝所有请求。没有授权时，用户无法访问任何连接器工具，即使已完成授权也是如此。请在配置的 `grants` 段中添加授权。

下面的示例向所有用户授予对 `google` 连接器全部工具与资源的访问权，外加内置 Aperture 工具的访问权：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["aperture/**"]},
          {"connectors": ["google/**"]}
        ]
      }
    }
  ]
}
```

连接器授权使用 `connectors` 字段和 `"connectorID/category/resource"` 形式的 FQN glob 模式。例如，`"google/tools/*"` 授予对 `google` 连接器所有工具的访问权，而 `"google/**"` 授予对所有能力（工具、资源、模板）的访问权。

配置授权的详细说明参阅[授予 MCP 工具访问权][docs-grant-mcp-tool-access]。

## 步骤 4：引导用户完成授权流程

每个用户都必须单独完成一次授权流程才能使用连接器。授权必须由同一个 Tailscale 用户发起并完成，管理员不能代替其他用户操作。

流程如下：

1. 在 [Aperture Chat 门户][docs-aperture-chat-connectors]中打开 **Connectors**。
2. 在 **Connect to use** 下找到该连接器并选择 **Connect**。
3. 登录外部提供商并同意授权。
4. 回到连接器详情页，确认显示 **Connected.** 和 **Ready**。

> **警告：**
>
> 待完成的授权流程会在 15 分钟后过期。如果流程在完成前过期，请重新选择 **Connect** 发起新的流程。

## 步骤 5：确认工具已出现

完成授权后，在连接器详情页选择 **Refresh tools**，确认预期工具出现在 **Tools** 下方。要直接验证 `/v1/mcp`，请以已完成授权且获授权的用户身份发送 `tools/list`。

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

响应中应包含以连接器 ID 为前缀的工具（例如 `google_search`、`google_query`）。

## 检查或重置用户的授权

用户在 Chat 的 **Connectors** 中检查并管理自己的授权：

| 区块或状态 | 含义 | 操作 |
| ---------- | ---- | ---- |
| **Ready to use** 和 **Ready** | 你拥有访问权以及所需的授权。此项检查不测试上游健康状况。 | 选择该连接器查看其工具。 |
| **Connect to use** 和 **Connect** 按钮 | 你拥有访问权，但尚未对这个按用户连接器完成授权。 | 选择 **Connect** 并完成同意流程。 |
| **Needs reconnect** 和 **Reconnect** 按钮 | 已保存的授权不再可用。 | 如有需要先修正 OAuth 配置，然后选择 **Reconnect**。 |
| **Temporarily unavailable** | Aperture 无法读取你的凭证状态。 | 刷新页面后重试。 |

Aperture 会省略你的授权所拒绝的已配置连接器，不会在 Chat 中显示 **No access**。

要清除已存储的凭证并重置授权，请在连接器详情页选择 **Disconnect**，然后选择 **Connect** 重新授权。

## 故障排查

使用以下小节诊断并解决按用户 OAuth 2.0 连接器的常见问题。

### 授权流程过期

待完成的授权流程会在 15 分钟后过期。授权链接过期后，让用户在 Chat 的 **Connectors** 中重新选择 **Connect**。

### 工具在一段时间不活动后停止工作

如果按用户连接器的工具在一段时间不活动后停止工作，刷新令牌很可能已过期或被提供商撤销。Aperture 会提前 60 秒把令牌视为已过期，并在下一次请求时刷新；刷新失败时，Aperture 会删除已存储的凭证。受影响的用户必须在 Chat 的 **Connectors** 中选择 **Reconnect** 重新授权。

### 缺少刷新令牌设置导致令牌静默过期

如果提供商不签发刷新令牌，连接器起初能正常工作，但在访问令牌过期后（通常是一小时）就会失效。每个提供商的要求不同：

* Google 要求 `auth_params` 包含 `{"access_type": "offline", "prompt": "consent"}`。启用刷新令牌的正是 `access_type: offline` 这个值；`prompt: consent` 确保后续授权时会重新签发刷新令牌。
* Salesforce 要求 `refresh_token` scope。

把所需的设置加入配置，并让受影响的用户选择 **Reconnect** 重新授权。**Needs reconnect** 状态表示已保存的授权不再可用，缺少刷新令牌是可能原因之一。

### auth 配置因未知字段错误被拒

`auth` 块使用严格的字段校验。字段名拼错（例如把 `"secret"` 写成 `"secert"`）会导致配置加载失败，报 JSON 解码错误。请对照[连接器参考][docs-connectors-reference]仔细核对字段名。

### 回调显示 "authorization failed"

如果提供商重定向到了回调 URL，但用户看到 "authorization failed"（授权失败）页面：

1. 确认在提供商处注册的重定向 URI 与 `https://<aperture-hostname>/aperture/auth/<connector-id>/callback` 完全一致。
2. 确认 `state` 参数在重定向过程中未被修改。代理或浏览器扩展改动查询参数时可能出现这种情况。
3. 确认完成流程的用户正是发起流程的同一个 Tailscale 用户。如果由其他用户打开授权 URL，回调会失败。

## 后续步骤

* 所有连接器类型与常见场景的总览参阅[连接器功能指南][docs-aperture-connectors]。
* 完整字段参考与所有认证类型参阅[连接器参考][docs-connectors-reference]。
* 使用单一共享凭证（而非按用户授权）的连接器，参阅[设置已认证的 MCP 连接器][docs-set-up-authenticated-mcp-connector]。
* MCP 授权的详细说明参阅[授予 MCP 工具访问权][docs-grant-mcp-tool-access]。

[ar-step-2-configure]: #步骤-2在-aperture-中配置连接器

[ar-step-3-grant-access]: #步骤-3向用户授予连接器工具的访问权

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-authenticated-mcp-connector]: /docs/aperture/connectors/set-up-authenticated-mcp-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
