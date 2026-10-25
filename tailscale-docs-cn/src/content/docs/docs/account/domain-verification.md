---
title: "管理域名"
description: "管理与你 tailnet 关联的域名。"
---

最后验证于 May 11, 2026

> **注意：** 域名验证目前处于 beta 阶段。

在你的 Tailscale 网络（即 tailnet）中，某些管理操作要求你连接并验证自己的域名。你的主域名（primary domain）会自动列出，无需验证。

> **注意：**
>
> [Domains](https://console.tailscale.com/admin/settings/domains) 页面不适用于共享域名 tailnet，例如使用 `@gmail.com` 地址的 tailnet，或使用 GitHub 作为身份提供方（IdP）的 tailnet。

## 域名类型

* **Primary**（主域名）：附加到 tailnet 中用户的默认域名。其他组织将不得使用该域名。除非我们的支持团队指示，否则你无需验证此域名。如需更改主域名，请联系 [Tailscale 支持团队][co-contact-support-domainchange]。
* **Legacy**（旧版）：此前通过我们的支持团队设置为域别名、但未主动验证的域名。该域别名仍然生效。
* **Alias**（别名）：已验证并被主动用作[域别名][docs-domain-aliases]的域名。其他组织将不得使用该域名。
* **Claimed**（认领）：已验证但未用作别名的域名。其他组织将不得使用该域名。

## 验证域名

你需要是 tailnet 的[所有者或管理员](/docs/reference/user-roles)才能验证域名。

1. 访问管理控制台的 [Domains](https://console.tailscale.com/admin/settings/domains) 页面。
2. 选择 **Add domain** 按钮，输入你想验证的域名地址。
3. 复制 TXT 记录的 **Name** 和 **Value**。这些不是机密值，你之后可以再次获取。
4. 登录你的域名服务商，使用控制台中显示的 **Name** 和 **Value** 创建一条新的 TXT 记录，并将 TTL 设为 3600。该 Name 是你域名下的一个 `_tailscale-challenge` 子域名（例如 `_tailscale-challenge.example.com`），而不是域名本身。某些 DNS 服务商会自动将你的域名附加到记录名后；对于这些服务商，只需输入 `_tailscale-challenge`。如果该域名注册自常见的域名服务商，我们会提供指向该服务商网站上相关文档的链接。
5. 成功将 TXT 记录添加到域名服务商后，返回 Tailscale 管理控制台并选择 **Close**。

在 Tailscale 成功识别你域名记录中的 TXT 记录之前，你的域名会被标记为 **Pending verification**。Tailscale 会持续检查该域名，但你也可以手动重新检查 TXT 记录。域名服务商传播这些更改可能需要最长几个小时。

域名验证成功后，一封确认邮件会发送给 tailnet 的[安全联系人][docs-contact-preferences-security]。

即使域名已成功验证，也应将 TXT 记录保留在你的域名上。Tailscale 会定期检查该 TXT 记录。

域名验证通过后，你可以将其设置为 tailnet 的[域别名][docs-domain-aliases]。

## 移除域名

> **危险：**
>
> 移除一个已验证的域名后，邮箱地址使用该域名的用户将能够以该地址为主域名创建新的 tailnet。

你需要是 tailnet 的[所有者或管理员](/docs/reference/user-roles)才能移除域名。

1. 访问管理控制台的 [Domains](https://console.tailscale.com/admin/settings/domains) 页面。
2. 找到你想移除的域名，选择  菜单，然后选择 **Remove**。
3. 输入域名以确认，然后选择 **Remove domain**。

[co-contact-support-domainchange]: https://tailscale.com/contact/support/?type=domainchange

[docs-contact-preferences-security]: /docs/reference/contact-preferences#security-issues-email

[docs-domain-aliases]: /docs/account/domain-aliases
