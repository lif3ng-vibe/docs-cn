---
title: "多个用户使用同一登录名"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

**HTTP status:** `Error 409`

Multiple users with login `<user@example.com>`, please contact support to login

## 为什么会看到这条消息

出现此问题的原因可能有：

* 该邮箱地址属于另一个 tailnet。
* 你的身份提供方（IdP）发生了变更，影响了与用于身份验证的邮箱地址关联的用户 ID。

## 处理方法

你可以尝试以下方法来解决此问题：

* 确认你使用的邮箱地址与你要登录的 tailnet 相关联。如果你可以访问多个 tailnet，可能是用错了邮箱地址。
* 联系你的 IT 管理员，确认你的账户是否有变更，例如用户账户被更新。如果确实发生了变更，你可能需要联系 [Tailscale 支持][co-support]（或由你的 IT 管理员联系），以获取后续处理步骤。

[co-support]: https://tailscale.com/support

[docs-messages]: /docs/reference/messages
