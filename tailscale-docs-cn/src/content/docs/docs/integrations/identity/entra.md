---
title: "设置 Microsoft Entra ID 以与 Tailscale 配合使用"
description: "**你应该可以直接使用 Microsoft Entra ID 身份登录 Tailscale，无需额外配置**。"
---

最后验证于 Jan 5, 2026

**你应该可以直接使用 Microsoft Entra ID 身份登录 Tailscale，无需额外配置。**

要在 Tailscale 中使用 Microsoft Entra ID（前称 Azure AD）作为你的身份提供方，请在[注册 Tailscale 账户](https://login.tailscale.com/start)时选择 **Sign up with Microsoft**。

*（图：注册 Tailscale 时选择 Microsoft）*

如果你无法使用 Microsoft Entra ID 向 Tailscale 认证，很可能是因为你的管理员禁用了用户对 Microsoft Entra 应用程序的同意授权。要更改此设置，请联系你的管理员。关于此设置的详细信息，参见 [Configure how users consent to applications][xt-entra-configure-consent]。

[xt-entra-configure-consent]: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent
