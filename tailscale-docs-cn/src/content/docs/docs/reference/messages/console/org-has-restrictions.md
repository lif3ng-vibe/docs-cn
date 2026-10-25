---
title: "你的组织已限制成员加入外部 tailnet"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

**HTTP status:** `Error 403`

Your organization has restricted members from joining external tailnets

## 为什么会看到这条消息

当你的 tailnet 使用私有/自有域名，且管理员禁止用户加入其他（外部）tailnet 时，就会显示这条错误消息。

## 处理方法

你可以尝试以下方法来解决此问题：

* 改用其他邮箱地址来加入外部 tailnet。
* 联系你的 IT 管理员，申请使用组织邮箱地址加入外部 tailnet 的权限。

## 更多信息

* 有关启用和停用外部 tailnet 访问权限的信息，请参阅 [邀请任意用户加入你的 tailnet][docs-invite-any-user]。

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user#启用或禁用加入外部-tailnet

[docs-messages]: /docs/reference/messages
