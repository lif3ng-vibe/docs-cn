---
title: "添加经验证的连接器"
description: "Aperture 维护着一个包含预配置默认值的经验证连接器注册表。在连接器选择器中选择一个提供商，即可预填其可用字段，例如 URL、OAuth 端点和作用域。"
---

最后验证于 Sep 28, 2026

Aperture 维护着一个包含预配置默认值的经验证连接器（verified connector）注册表。在连接器选择器中选择一个提供商，即可预填其可用字段，例如 URL、OAuth 端点和作用域。如果提供商要求，再提供 OAuth 客户端凭证。

以下步骤以 Salesforce、Atlassian 和 Slack 为例，适用于选择器中的任何提供商。最新列表可打开选择器查看，或参阅[连接器参考][docs-connectors-reference]。

大多数经验证连接器使用[按用户 OAuth 2.0 授权码流程][docs-set-up-per-user-oauth2-connector]，因此在你配置好连接器后，每个用户需要单独授权。

> **注意：**
>
> 部分经验证连接器（例如 Atlassian）改用[动态客户端注册（`oauth2_dcr`）][docs-connectors-reference-dcr]。Aperture 会自动向提供商注册 OAuth 客户端，因此这类连接器无需创建 OAuth 应用，也无需提供客户端凭证。对 DCR 连接器，跳过第 1 步和第 2 步中的凭证字段即可：连接器只需要注册表中的 URL。每个用户仍然需要单独授权。

## 前提条件

开始之前，你需要：

* Aperture 配置的管理员访问权限。参阅[连接器入门][docs-connectors-get-started]。
* 如果所选连接器需要手动创建 OAuth 应用，你需要有在提供商的开发者或管理控制台创建应用的权限。使用 `oauth2_dcr` 的连接器不需要此权限。

## 第 1 步：在提供商处创建 OAuth 应用

先在提供商处配置 OAuth 应用。提供商与 Aperture 两侧的值不匹配是连接失败最常见的原因。

\[Missing snippet: aperture\_google\_workspace\_dpp\_note.mdx]

1. 在提供商的开发者或管理控制台创建一个 OAuth 应用。
2. 把 `https://<aperture-hostname>/aperture/auth/<connector-id>/callback` 注册为重定向 URI。在第 2 步中，Aperture 默认把连接器 ID 设为提供商名称，例如 `Salesforce`。这里请使用相同的 ID。如果想先用自定义 ID，请先完成第 2 步再注册回调 URL。
3. 为应用授予你的用户所需的作用域。选择器会把每个提供商的默认作用域预填为可编辑的标签（chip），你可以增删。
4. 记下客户端 ID。如果应用使用了客户端密钥（client secret），也一并记下。下一步要在 Aperture 中填入这些值。

## 第 2 步：从选择器添加连接器

添加并配置连接器：

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. 选择 **Add connector**，并从列表中选择一个经验证的提供商。要配置注册表中没有的提供商，选择 **Custom connector**。Aperture 会预填该提供商可用的字段，并把连接器 ID 设为提供商名称。动态客户端注册类连接器（包括 Atlassian、Notion 和 Linear）不会预填授权 URL 和 token URL。
3. 确认或编辑连接器 ID，然后输入你的客户端 ID；如果你的 OAuth 应用使用了客户端密钥，也一并输入。仅用 PKCE 的应用可以省略密钥。连接器 ID 必须与你在回调 URL 中使用的值一致。
4. 选择授权码型经验证提供商时，Aperture 会预填该提供商刷新 token 所需的 `auth_params`（例如 Google 的 `{"access_type": "offline", "prompt": "consent"}`）。通常无需修改。`auth_params` 详情参阅[连接器参考][docs-connectors-reference]。
5. 保存连接器。

运行时 Aperture 使用的是保存的配置，而不是注册表默认值。默认 URL 和作用域参阅[连接器参考][docs-connectors-reference]。

## 第 3 步：授予访问权限

与所有连接器一样，经验证连接器默认拒绝访问。添加一条 `connectors` 授权，用户才能使用该连接器的工具。参阅[授予 MCP 工具访问权限][docs-grant-mcp-tool-access]。

## 第 4 步：让用户完成授权

打开 [Aperture Chat 门户][docs-aperture-chat-connectors]中的 **Connectors**，确认目标用户可以看到该连接器。

告诉你的用户[如何使用连接器][docs-connectors-use]：打开 Chat 的 **Connectors**，选择该连接器，选择 **Connect** 完成授权流程。

## 相关内容

* [设置按用户 OAuth 2.0 连接器][docs-set-up-per-user-oauth2-connector] —— 配置使用相同按用户 OAuth 流程的自定义连接器。
* [连接器参考][docs-connectors-reference] —— 经验证连接器注册表、认证类型和字段定义。

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#动态客户端注册oauth2_dcr

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#连接器connectors
