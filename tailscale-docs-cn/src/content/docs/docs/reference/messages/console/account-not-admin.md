---
title: "你的账户不是管理员"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

Your account is not an administrator for the `<user@example.com>` network. You can access this network using the Tailscale app, but you're not allowed to manage network settings.

## 为什么会看到这条消息

当没有权限的用户尝试访问 Tailscale 管理控制台时，就会显示这条错误消息。通常，唯一无法访问管理控制台的用户类型是 Member（成员）角色。

## 处理方法

你可以尝试以下方法来解决此问题：

* 将该用户的角色从 Member 改为其在 tailnet 中所需的角色。拥有 Owner、Admin 或 IT admin 角色的用户具有更改用户角色所需的权限。
* 如果你需要访问管理控制台，却无法联系到拥有访问权限的成员，请联系 [Tailscale 支持][co-support]。你需要提供域名的文本记录（TXT record），以证明你对该域名的所有权以及对 tailnet 的管理权限。

## 更多信息

* 有关用户类型和访问权限的信息，请参阅 [用户角色][docs-user-roles]。
* 有关更改用户角色的信息，请参阅 [更改用户角色][docs-changing-user-roles]。

[co-support]: https://tailscale.com/support

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-messages]: /docs/reference/messages

[docs-user-roles]: /docs/reference/user-roles
