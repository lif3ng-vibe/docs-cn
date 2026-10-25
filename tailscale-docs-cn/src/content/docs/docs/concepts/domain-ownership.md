---
title: "域名所有权"
description: "了解你的 tailnet 如何与你的域名绑定。"
---

最后验证于 May 11, 2026

当你创建 Tailscale 网络（即 tailnet）时，你的用户域名会成为 [Tailscale 身份][docs-tailscale-identity]的一部分。

**本主题中的指南同样适用于基于 GitHub 组织和 GitHub 个人账户的 Tailscale 账户，以及基于电子邮件/用户身份的单用户 tailnet。**

> **注意：**
>
> 请确保你始终保有对域名的控制权，以防 tailnet 被恶意接管。

## 你的域名如何被使用

在使用[自定义 OIDC 身份提供方][docs-sso-custom-oidc]注册、启用[域名别名][docs-domain-aliases]，或就某些问题向我们的支持团队寻求帮助时，Tailscale 要求你证明对该用户域名的所有权和控制权。根据你的请求，我们会要求你执行以下操作之一：

* 通过设置 DNS TXT 记录[验证你对域名的所有权][docs-domain-verification]。
* 回复发送到 `*@example.com` 邮箱地址的确认邮件。例如，当 tailnet 的另一位用户请求在 tailnet 中执行某项操作时，Tailscale 支持团队发送给该 tailnet 所有者管理员的邮件。
* 配置 WebFinger 端点。

验证 [GitHub 组织][xt-gh-account-types]时，tailnet 的所有者还必须是该 GitHub 组织的管理员。

tailnet 创建后，你的域名会一直与该 tailnet 关联，在 tailnet 存续期间，你需要持续保有对该域名的控制和使用。

## 降低 tailnet 被恶意接管的风险

为减轻恶意行为者夺取你域名控制权带来的影响，你可以为 tailnet 启用以下几项设置：

* 启用[设备审批][docs-device-approval]，让管理员在新设备加入 tailnet 前进行审核和批准。
* 启用[用户审批][docs-user-approval]，让管理员在新用户加入 tailnet 前进行审核和批准。
* 使用 [Tailnet Lock][docs-tailnet-lock]，确保任何设备都必须由 tailnet 中已有的受信任设备签名，才能加入你的 tailnet。

有关保护 tailnet 安全的一般指南，请参阅[保护 tailnet 安全的最佳实践][docs-security-hardening]。

## 如果你不再使用该域名

如果你需要更改域名，或放弃旧域名并启用新域名，请[联系支持团队][co-contact-support-domainchange]，我们会为你重命名 tailnet。

如果你删除了域名，tailnet 不会被自动删除。若想删除 tailnet，你需要显式[删除 tailnet][docs-delete-tailnet]。

[co-contact-support-domainchange]: https://tailscale.com/contact/support/?type=domainchange

[docs-delete-tailnet]: /docs/account/delete-tailnet

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-domain-aliases]: /docs/account/domain-aliases

[docs-domain-verification]: /docs/account/domain-verification

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-approval]: /docs/features/access-control/user-approval

[xt-gh-account-types]: https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts#organization-accounts
