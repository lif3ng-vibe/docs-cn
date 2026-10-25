---
title: "删除你的 tailnet"
description: "使用管理控制台删除你的 Tailscale 网络。"
---

最后验证于 Oct 28, 2025

如果你决定不再继续使用自己的 tailnet（Tailscale 网络），可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面将其删除。你必须是一个 tailnet 的[所有者](/docs/reference/user-roles)才能删除它。

1. 打开管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面。
2. 选择 **Delete tailnet**。
3. 按步骤确认你要删除自己的 tailnet。
4. 选择 **Delete** 确认。

当你删除 tailnet 时，我们会从协调服务器（coordination server）的数据库中永久删除你的 tailnet 的所有节点与用户数据及元数据。某些数据可能仍暂时存在于临时存储中，例如诊断日志和备份，它们通常会在 60 天内自动轮换清除。

Tailscale 几乎不收集或存储个人信息，只保留运营产品所需的元数据，例如你的电子邮箱地址、全名、外部账户资料的链接，以及 NAT 穿透所需的部分 IP 地址，并遵守我们的[隐私政策][co-privacy-policy]。

> **注意：**
>
> 删除 tailnet 时，任何有效订阅都会立即取消。

## 取消订阅 Tailscale 邮件列表

从 Tailscale 删除你的数据并不会自动取消你对任何邮件列表的订阅。要取消订阅，你需要使用任意一封 Tailscale 邮件底部的邮件偏好设置链接自行退订。

## 重新开始使用 Tailscale

如果你在删除 tailnet 后想重新开始使用 Tailscale，可以使用同一账户通过你偏好的身份提供方（IdP）登录。登录 Tailscale 后，如果系统发现没有 tailnet 存在，会自动创建一个新的 tailnet。**如果你不希望自动重新创建 tailnet，请不要登录 Tailscale**。

> **注意：**
>
> 如果你删除了用于[通行密钥（passkey）认证][docs-passkeys]的用户账户，那么即使你删除了 tailnet 并创建了另一个 tailnet，该账户也无法在 Tailscale 中再次使用。

[co-privacy-policy]: https://tailscale.com/privacy-policy

[docs-passkeys]: /docs/integrations/identity/passkeys
