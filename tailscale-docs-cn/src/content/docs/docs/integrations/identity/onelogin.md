---
title: "设置 OneLogin 以与 Tailscale 配合使用"
description: "要为你的域名启用 OneLogin 认证，请按照以下步骤操作。"
---

最后验证于 Jul 8, 2024

要为你的域名启用 OneLogin 认证，请按照以下步骤操作。

1. 在 OneLogin 控制面板中，前往 *Applications*。

   * 选择 **Add App**

2. 搜索"OIDC"，然后选择 **OpenID Connect (OIDC)**。

3. 将 *Display Name* 设置为"Tailscale"。

   * 选择 **Save**

4. 在 *Configuration* 下：

   * 在 *Redirect URIs* 中添加：`https://login.tailscale.com/a/oauth_response`
   * 选择 **Save**

5. 在 *SSO* 下：

   * 将 *Refresh Token Minutes* 设置为 **40320**（4 周）
   * 选择 **Save**

6. 将你的 Tailscale 身份提供方切换为 OneLogin。具体做法参见[更换身份提供方][docs-switch-idp]。

7. 确保所有你希望能够登录的用户都已在 OneLogin 中启用 Tailscale 应用。

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider
