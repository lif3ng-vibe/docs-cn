---
title: "Tailscale 被屏幕使用时间阻止"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Tailscale blocked by Screen Time
The Screen Time feature in macOS is preventing Tailscale from working properly.

## 消息 ID

`macos-screen-time-controlclient`

## 为什么会看到这条消息

如果 macOS 和 iOS 用户启用了屏幕使用时间限制，系统会在受限时段内阻止访问 Tailscale。

## 处理方法

在**系统设置**、**屏幕使用时间**、**内容与隐私**、**网页内容访问**中禁用屏幕使用时间设置。

## 更多参考

* 参阅我们的文档 [macOS 屏幕使用时间与 Tailscale][docs-macos-screen-time]。
* 参阅 Apple 的文档 [在 Mac 上更改屏幕使用时间设置][xt-apple-screen-time]。

[docs-macos-screen-time]: /docs/concepts/macos-webfilterproxyd

[docs-messages]: /docs/reference/messages

[xt-apple-screen-time]: https://support.apple.com/guide/mac-help/change-screen-time-settings-on-mac-mchlca5139d2/mac
