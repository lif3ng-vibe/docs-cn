---
title: "检测到登录名变更"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

**HTTP status:** `Error 409`

Account login name change detected (from `username1@example.com` to `username2@example.com`). Please contact support for more information.

## 为什么会看到这条消息

这条消息通常表示使用公共/共享域名的账户邮箱地址发生了变更。例如，把你的 Gmail 账户改成另一个 `@gmail.com` 地址。Tailscale 会检测到这种不匹配并阻止对 tailnet 的访问，以防止未经授权的使用，并将该账户锁定在管理控制台之外。

已用旧邮箱地址连接到 tailnet 的设备仍可继续工作，但你无法执行需要管理控制台身份验证的管理操作。

## 处理方法

你可以尝试以下方法来解决此问题：

* 在你的身份提供方设置中，把该账户的邮箱改回原始邮箱地址。
* 如果无法把邮箱地址改回原始地址，唯一的办法就是新建一个 tailnet。对于使用公共/共享域名的账户，我们无法将你现有的 tailnet 与变更后的邮箱地址关联起来。

## 更多信息

有关新建 tailnet 的信息，请参阅 [Tailscale 快速开始][docs-quickstart]。

[docs-messages]: /docs/reference/messages

[docs-quickstart]: /docs/how-to/quickstart
