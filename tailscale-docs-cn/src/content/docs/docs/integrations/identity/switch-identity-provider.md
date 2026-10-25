---
title: "更换身份提供方"
description: "你可以使用 Tailscale 管理控制台为以下身份提供方（IdP）执行更换："
---

最后验证于 Oct 14, 2026

你可以使用 Tailscale 管理控制台为以下身份提供方（IdP）执行更换：

* [Google Workspace（G Suite）][docs-sso-google]
* [Microsoft][docs-sso-microsoft]，包括 Microsoft 账户、Office 365、Active Directory，以及使用自定义域名时的 Microsoft Entra ID
* [Okta][docs-sso-okta]
* [OneLogin][docs-sso-onelogin]
* [OpenID Connect][docs-custom-oidc]（OIDC）

对于其他身份提供方，当你需要更换 IdP 时，请联系 [Tailscale 支持团队][co-contact-support-sso]。

## 更换为其他身份提供方

你需要是[所有者（Owner）](/docs/reference/user-roles)才能为你的 tailnet 更换身份提供方。

要更换到其他 IdP：

1. 打开 Tailscale 管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面。

2. 在 **Identity Provider** 区域，选择菜单，然后选择 **Switch identity provider**。

3. 选择你想为 tailnet 使用的 IdP。

4. 向新 IdP 进行认证。此步骤因你选择的 IdP 而异。

   #### Google

   1. 在 **Authenticate** 区域，选择 **Sign in to Google**。
   2. 使用你用于 Tailscale 的电子邮件登录。

   #### Microsoft

   1. 在 **Authenticate** 区域，选择 **Sign in to Microsoft**。
   2. 使用你用于 Tailscale 的电子邮件登录。

   > **注意：**
   >
   > 如果你使用的是 Microsoft 365 Government Community Cloud（GCC）High 账户，请联系 [Tailscale 支持团队][co-contact-support-sso]来更换你的身份提供方。

   #### Okta 或 OneLogin

   1. 在 **Authenticate** 区域，输入以下项的值：

      * SSO issuer
      * Client ID
      * Client secret

      你可以从你的身份提供方获取这些信息。

   2. 选择 **Authenticate**。

   #### OIDC

   1. 在 **Authenticate** 区域，输入以下项的值：

      * Client ID
      * Client secret

      [WebFinger][docs-webfinger] URL 已预先填好，并且必须能在显示的 URL 处访问。你可以从你的身份提供方获取 Client ID 和 Client secret 信息。

   2. （可选）为此提供方配置自定义 OIDC prompts。

   3. 选择 **Authenticate**。

5. 选择 **Switch identity provider**。

你选择的身份提供方现在已可使用。

## 限制

* 更换 IdP 时，除非联系 [Tailscale 支持团队][co-contact-support-sso]，否则你无法同时更改 tailnet 的主域名。例如，你无法将 IdP 从以 `example.com` 为主域名的 Entra ID 更换为以 `example.org` 为主域名的 Okta。
* 如果你使用的是共享域名 tailnet（例如用 Gmail 地址创建的 tailnet），除非联系 [Tailscale 支持团队][co-contact-support-sso]，否则无法更换 IdP。

[co-contact-support-sso]: https://tailscale.com/contact/support/?type=sso

[docs-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-google]: /docs/integrations/identity/google-sso

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-webfinger]: /docs/integrations/identity/custom-oidc#webfinger-设置
