---
title: "支持的 SSO 身份提供方"
description: "Tailscale 可基于你现有的 IdP 或 SSO 提供方运行。借助这些提供方的能力实现安全访问，包括 passkey、2FA 和 MFA。"
---

最后验证于 Jan 5, 2026

Tailscale 可基于你已在使用的身份提供方（IdP）或单点登录（SSO）提供方运行。

## 设置身份提供方

首次使用 Tailscale 激活你的域名时，必须选择要使用的身份提供方。

你需要是 tailnet 的[所有者（Owner）](/docs/reference/user-roles)才能设置身份提供方。

### 原生支持的身份提供方

Tailscale 原生支持以下身份提供方：

* [Apple][docs-sso-apple]
* [Google][docs-sso-google]，包括 Gmail 和 Google Workspace（G Suite）
* [GitHub][docs-sso-github]
* [Microsoft][docs-sso-microsoft]，包括 Microsoft 账户、Office365、Active Directory 和 Microsoft Entra ID
* [Okta][docs-sso-okta]
* [OneLogin][docs-sso-onelogin]

### 支持的自定义身份提供方

除原生支持的身份提供方外，Tailscale 还支持你使用[自定义 OpenID Connect（OIDC）提供方][docs-sso-custom-oidc]进行认证。Tailscale 已成功测试过的自定义身份提供方列表，参见[其他提供方配置][docs-sso-custom-oidc-additional-config]。

### 对 passkey 的支持

Tailscale 支持对你有权加入的任何 tailnet 使用 [passkey][docs-passkeys] 认证。

### 使用电子邮件地址注册

Tailscale 不支持使用电子邮件地址注册。按设计，Tailscale 本身不是身份提供方——不存在 Tailscale 密码。

身份提供方为处理身份与认证构建了健壮的基础设施，而这两者是安全中核心且复杂的部分。Tailscale 将用户认证委托给身份提供方，正是借助它们的专业能力，让 Tailscale 可以专注于安全网络等领域。

使用身份提供方不仅比电子邮件加密码更安全，还让我们能够自动[轮换连接加密密钥][bl-rotate-ssh-keys]、遵循你的团队设定的[安全策略][docs-acls]（例如多因素认证 MFA）等等。

关于 Tailscale 为什么不做身份提供方的更多信息，参见博客文章 [Tailscale doesn't want your password][bl-passkeys] 和 [SSO tax, cut][bl-sso-tax-cut]。

### 对 MFA 的支持

Tailscale 支持双因素认证和多因素认证。

Tailscale 自身不处理认证。你可以在你的单点登录身份提供方中[启用 MFA 功能][docs-multifactor-auth]，它们将应用于你的所有应用，包括 Tailscale。

## 更换身份提供方

关于更换身份提供方的信息，参见[更换身份提供方][docs-switch-idp]。

> **注意：**
>
> 遗憾的是，你无法将 tailnet 迁移到 GitHub 或 Apple 作为身份提供方，也无法从它们迁出。

## Tailscale 会从身份提供方获取哪些信息

Tailscale 使用 OpenID Connect（OIDC）进行认证。

Tailscale 只请求正常运行所需的最小访问权限。向 Tailscale 认证时，你必须共享用户的电子邮件和姓名信息。某些提供方还会共享用户照片；这种情况下，Tailscale 只存储照片 URL，而不存储照片本身。

Tailscale 仅使用你所在组织的团队成员关系来确保用户可以加入其组织的 tailnet。使用 GitHub 身份提供方时，Tailscale 只请求获取团队成员关系所需的最小权限集合，其中包括对你仓库和项目看板的访问权限。Tailscale 不会使用你仓库或项目看板中的任何内容。

Tailscale 只请求运行所需的最小权限范围（scope），关于我们如何使用你的数据，详见我们的[隐私政策][co-privacy-policy]。

[bl-passkeys]: https://tailscale.com/blog/passkeys

[bl-rotate-ssh-keys]: https://tailscale.com/blog/rotate-ssh-keys

[bl-sso-tax-cut]: https://tailscale.com/blog/sso-tax-cut

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-acls]: /docs/features/access-control/acls

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-passkeys]: /docs/integrations/identity/passkeys

[docs-sso-apple]: /docs/integrations/identity/apple-sso

[docs-sso-custom-oidc-additional-config]: /docs/integrations/identity/custom-oidc#其他提供方配置

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-github]: /docs/integrations/identity/github

[docs-sso-google]: /docs/integrations/identity/google-sso

[docs-sso-microsoft]: /docs/integrations/identity/entra

[docs-sso-okta]: /docs/integrations/identity/okta

[docs-sso-onelogin]: /docs/integrations/identity/onelogin

[docs-switch-idp]: /docs/integrations/identity/switch-identity-provider
