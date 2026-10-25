---
title: "设置 Google 以与 Tailscale 配合使用"
description: "**你应该可以直接使用 Google 身份登录 Tailscale，无需额外配置。**"
---

最后验证于 Nov 12, 2025

**你应该可以直接使用 Google 身份登录 Tailscale，无需额外配置。**

要在 Tailscale 中使用 Google 作为你的身份提供方，请在[注册 Tailscale 账户](https://login.tailscale.com/start)时选择 **Sign up with Google**。

*（图：注册 Tailscale 时选择 Google）*

## 将 Tailscale 加入第三方应用白名单

某些情况下，你的域管理员可能[限制了未经批准的第三方应用添加到你的域名][xt-google-restrict-apps]。如果你尝试用 Google 登录 Tailscale 时收到错误消息 `Error 400: admin_policy_enforced`，说明 Tailscale 在你的域名中被阻止了。

如果你是该域名的 Google Workspace 管理员，请按照 [Google 关于管理应用访问权限的说明][xt-google-manage-apps]将 Tailscale 加入白名单：

1. 登录 [Google 管理控制台][xt-google-login]。
2. 从首页前往 **Security > API controls**。
3. 在 **App access control** 下，选择 **Manage third-party app access**。
4. 搜索并在列表中找到 Tailscale 应用。选择 **Add a filter**，在 **App name** 字段中输入"Tailscale"，然后选择 **Apply**。
   * Tailscale 应用的 `client_id` 是 `674241127656-lmq9su4p8ni1tcpuh6eqidoornqtvmvi.apps.googleusercontent.com`
   * Tailscale 用于 Google 群组同步的 `client_id` 是 `923467998409-avhhsu3j9043drh8s798htd48jo27ki8.apps.googleusercontent.com`。只有在你使用跨域身份管理系统（SCIM）将 Google 群组同步到 Tailscale 时才需要它。
   * Tailscale Android 认证器的 `client_id` 是 `744055068597-ppu003h5o04mln2dlou55msf9t4mup3c.apps.googleusercontent.com`
5. 勾选 Tailscale 的复选框，然后选择 **Change access**。
6. 选择 **Limited** 或 **Trusted** 选项以允许访问。
7. 选择 **Change**。

[xt-google-login]: https://admin.google.com

[xt-google-manage-apps]: https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data#trustorlimit

[xt-google-restrict-apps]: https://support.google.com/a/answer/7281227
