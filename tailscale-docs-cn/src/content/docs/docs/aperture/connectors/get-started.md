---
title: "连接器入门"
description: "添加你的第一个 Aperture 连接器，授予其能力访问权限，并从客户端验证连接。有关连接器工作原理的背景，参阅[连接器的工作原理][docs-connectors-how-it-works]。"
---

最后验证于 Sep 28, 2026

添加你的第一个 Aperture 连接器，授予其能力访问权限，并从客户端验证连接。连接器工作原理的背景参阅[连接器的工作原理][docs-connectors-how-it-works]。完整的字段定义参阅[连接器参考][docs-connectors-reference]。

## 前提条件

开始之前，你需要：

* 你的 [tailnet][docs-tailnet] 已启用 Aperture。如果尚未设置，参阅 [Aperture 入门][docs-aperture-get-started]。
* 编辑 Aperture 配置中 `connectors` 和 `grants` 段的管理员权限。
* 至少一个上游服务（例如 MCP 服务器或 HTTP API）的 URL，且可从 Aperture 网关访问。

## 第 1 步：添加连接器

> **注意：**
>
> 使用 `oauth2_authorization_code` 或 `oauth2_client_credentials` 的连接器需要一个上游 OAuth 应用。授权码型客户端可以使用 PKCE 而不用客户端密钥，而 client credentials 型连接器需要客户端密钥。在 MCP 服务器或 API 提供商处：
>
> * 无论哪种方式，都要创建 OAuth 应用，并记下客户端 ID 和 token URL。client credentials 方式还要记下所需的客户端密钥；authorization code 方式仅当应用使用了客户端密钥时才需要记。
> * 对 `oauth2_authorization_code`，注册 Aperture 的回调 URL（`https://<aperture-hostname>/aperture/auth/<connector-id>/callback`），并记下授权 URL 和用户授权作用域。

连接器位于 Aperture 配置的 `connectors` 段。\[Missing snippet: aperture\_admin\_nav.mdx] 该页面是可视化编辑器，也承载连接器选择器。若要以 JSON 编辑 `connectors` 段，使用 **Administration** > **Configuration** 页面。

有两种添加连接器的方式：

* **从经验证注册表**：连接器选择器内置了 Salesforce、Atlassian、Slack、GitHub、Notion 和 Linear 等常见提供商的预配置默认值。打开选择器查看最新列表。选择某个提供商即可预填其配置。部分连接器需要 OAuth 客户端凭证，但使用 [`oauth2_dcr`][docs-connectors-reference-dcr] 的连接器（包括 Atlassian、Notion 和 Linear）不需要，因为 Aperture 会自动注册 OAuth 客户端。更多信息参阅[添加经验证的连接器][docs-connectors-add-verified]。
* **自定义配置**：添加一个含一个或多个服务器条目的 `connectors` 段。每个条目需要 `protocol`（`"mcp"` 或 `"http"`）和 `url`。

以下示例添加一个无认证的 MCP 服务器和一个带认证的 HTTP API：

```json
{
  "connectors": {
    "servers": {
      "docs": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8185/v1/mcp"
      },
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "auth": {
          "type": "bearer_token",
          "secret": "github_pat_example"
        }
      }
    }
  }
}
```

`servers` 映射中的每个键都是一个连接器 ID，Aperture 用它作为名称前缀。连接器 ID 只能包含字母和数字，并以字母开头。`tailscale`、`internal` 和 `aperture` 是保留 ID。完整的 ID 规则和认证类型参阅[连接器参考][docs-connectors-reference]。

Aperture 支持 `bearer_token`、`api_key`、`basic`、`oauth2_client_credentials`、`oauth2_authorization_code` 和 `oauth2_dcr` 认证。各类型的字段参阅[连接器参考][docs-connectors-reference]。

> **提示：**
>
> Aperture 网关使用其 tailnet HTTP 客户端建立连接，因此可以直接使用 [MagicDNS][docs-magicdns] 主机名（例如 `http://mcp-server.example.ts.net:8080/v1/mcp`），无需额外的网络配置。

## 第 2 步：授予访问权限

除非有授权匹配请求，否则 Aperture 拒绝连接器访问。在配置的 `grants` 段中添加授权。\[Missing snippet: aperture\_admin\_nav.mdx] 可使用可视化授权编辑器，或在 **Administration** > **Configuration** 页面上以 JSON 编辑同一批授权。

要以编程方式修改配置，参阅[授权配置参考][docs-aperture-grants]。

以下示例授予所有连接器的全部能力，包括 Aperture 的内置工具：

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["**"]}
        ]
      }
    }
  ]
}
```

连接器授权使用 `connectors` 字段配合 `"connectorID/category/resource"` glob 模式。有效类别是 `tools`、`resources`、`templates` 和 `proxy`。MCP 和 HTTP 连接器都需要授权。完整语法参阅[授权配置参考][docs-aperture-grants]。

> **警告：**
>
> `"**"` 授权会覆盖你以后添加的每一个连接器，包括敏感连接器。只在验证第一个连接器时使用它。

标签是编写连接器授权的另一种方式。标签是你在连接器上设置的扁平字符串，一条 `label:<name>` 模式即可授予携带该标签的每个连接器。一旦拥有多个连接器，就用标签分组取代宽泛授权。参阅[按标签授予连接器访问权限][docs-grant-connector-access-by-label]。

## 第 3 步：验证连接

先在 Chat 中验证连接器，再验证客户端访问。

### 检查连接器状态

1. 打开 [Aperture Chat 门户][docs-aperture-chat-connectors]中的 **Connectors**。
2. 选择该连接器。
3. 确认它出现在 **Ready to use** 下并显示 **Ready**。
4. 对 MCP，确认 **Tools** 中包含预期的工具。

**Ready** 描述的是访问与授权状态，不代表上游可达。选择 **Refresh tools** 可联系上游并获取当前工具。

### 诊断未就绪的连接器

* **Connect to use** 配 **Connect** 表示需要授权。
* **Needs reconnect** 配 **Reconnect** 表示已保存的授权无法使用。
* **Temporarily unavailable** 表示 Aperture 无法读取凭证状态。刷新后重试。

对非管理员而言，被授权拒绝的已配置连接器会被直接省略，直接访问详情页也会与不存在的连接器一样显示未找到状态。请回到[第 2 步][ar-step-2-grant-access]，而不要去找 **No access**。

如果 **Refresh tools** 返回 `502 upstream error`，请确认 URL 正确且可从 Aperture 网关访问。

### 从客户端验证访问

连接器显示 **Ready** 后，从客户端验证访问。在 tailnet 中身份拥有[第 2 步][ar-step-2-grant-access]授权的设备上运行以下命令。Aperture 按调用者的 tailnet 身份对每个请求授权，`<aperture-hostname>` 是 Aperture 网关的 MagicDNS 名称。

对 MCP 连接器，把你的 MCP 客户端指向 Aperture URL 并列出可用工具。

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

响应包含一个 `tools` 数组，其中是你所配置连接器带前缀的条目（例如 `docs_search`）。

对 HTTP 连接器，通过 Aperture 代理路径发送请求：

```shell
curl http://<aperture-hostname>/v1/connectors/github/user
```

Aperture 会把请求转发到 `https://api.github.com/user`，并自动注入配置的 bearer token。

## 后续步骤

* [设置 HTTP API 连接器][docs-set-up-http-api-connector]，把请求代理到上游 REST API 并自动认证。
* [设置按用户 OAuth 2.0 连接器][docs-set-up-per-user-oauth2-connector]，把智能体连接到需要每个用户单独授权的服务。
* 配置完成后，以最终用户身份[使用连接器][docs-connectors-use]完成授权并调用其工具。
* [按标签授予连接器访问权限][docs-grant-connector-access-by-label]，用标签分组的连接器取代宽泛的 `"**"` 授权。

[ar-step-2-grant-access]: #第-2-步授予访问权限

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-add-verified]: /docs/aperture/connectors/add-verified-connector

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#动态客户端注册oauth2_dcr

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-magicdns]: /docs/features/magicdns

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#连接器connectors

[docs-set-up-http-api-connector]: /docs/aperture/how-to/set-up-http-api-connector

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-tailnet]: /docs/concepts/tailnet
