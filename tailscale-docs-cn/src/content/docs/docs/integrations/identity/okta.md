---
title: "设置 Okta 以与 Tailscale 配合使用"
description: "要为你的域名激活 Okta，请按照以下说明操作。"
---

最后验证于 Jan 5, 2026

要为你的域名激活 Okta，请按照以下说明操作。

## 目录

* [支持的功能][ar-features]
* [要求][ar-requirements]
* [配置步骤][ar-steps]
* [注意事项][ar-notes]
* [Okta 发起的登录][ar-workaround]

## 支持的功能

* 由 Okta 发起的单点登录（OpenID Connect）

## 要求

* 从 [Okta Integration Network][xt-okta-integrations] 安装 Tailscale 应用。

## 配置步骤

1. 在 Okta 管理页面中，选择 Tailscale 应用程序，然后选择 **Sign On** 标签页。
   1. 复制 Client ID 和 Client secret 的值。
   2. 复制 OpenID Provider Metadata 中发布的 issuer。通常这就是 Okta 的 URL。要找到该 URL，请选择 **OpenID Provider Metadata**，找到包含 `"issuer:"` 的一行，然后复制该行列出的 URL（不带引号）。例如，它看起来类似于 `https://dev-123456.okta.com`。
2. 将你的 Tailscale 身份提供方切换为 Okta。具体做法参见[更换身份提供方][docs-switch-idp]。注意，用于登录 Tailscale 的域名应与分配到此应用的用户的电子邮件地址相匹配。
3. 为用户和/或群组授予 Tailscale 应用的访问权限：

   *（图：为用户和/或群组分配访问权限。）*

注意，如果你对已激活 Okta 的域名进行更改，或将现有 tailnet 从其他身份提供方迁移到 Okta，则不会发送自定义链接——激活会在无需此步骤的情况下完成。

如果你的组织定义了[自定义访问策略][xt-okta-create-access-policies]，请验证 Tailscale 应用已被授权使用 `openid`、`email` 和 `profile` [作用域][xt-okta-create-scopes]。

## 注意事项

激活后，欢迎查看我们的[入门指南][docs-install]。

关于在 Okta 中预配置用户和群组的信息，参见 [Okta 中的用户与群组预配置][docs-sso-okta-scim]。

## Okta 发起的登录

Tailscale 目前不兼容由身份提供方发起的登录，只提供服务提供方发起的登录。这意味着用户必须从 Tailscale 的登录页面发起认证，而不能从其 Okta 实例内部发起。作为变通方案，希望从 Okta 实例发起登录的用户可以按以下步骤创建一个 Tailscale Login 书签小组件（chiclet）：

1. 在 Okta 中打开 Tailscale 应用，选择 **General** 标签页，然后选择 **Edit**。
2. 勾选 **Do not display application icon to users** 并保存。
3. 打开 [Okta Integration Network][xt-okta-integrations]，搜索 **Bookmark App** 并选中它，然后选择 **Add integration**。
4. 将应用标签名称填写为 **Tailscale Login**，并将 URL 设置为 `https://login.tailscale.com`。
5. 保持 **Application Visibility** 设置不勾选，然后选择 **Done**。
6. 选择 **Applications**，将新的书签应用分配给 Tailscale 用户。

[ar-features]: #支持的功能

[ar-notes]: #注意事项

[ar-requirements]: #要求

[ar-steps]: #配置步骤

[ar-workaround]: #okta-发起的登录

[docs-install]: /docs/how-to/quickstart

[docs-sso-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider

[xt-okta-create-access-policies]: https://developer.okta.com/docs/guides/customize-authz-server/create-access-policies

[xt-okta-create-scopes]: https://developer.okta.com/docs/guides/customize-authz-server/create-scopes

[xt-okta-integrations]: https://www.okta.com/integrations
