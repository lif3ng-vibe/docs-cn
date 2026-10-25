---
title: "安全更新可用"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Aug 1, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Security update available
A security update from version `<current-version>` to `<new-version>` is available.

## 消息 ID

`security-update-available`

## 为什么会看到这条消息

设备可以安装 Tailscale 安全更新，以修复与 Tailscale 客户端相关的已知安全问题。

## 处理方法

我们建议在安全更新发布后尽快安装。

如果你使用的是 macOS、Windows、iOS、Android 或 tvOS，可以通过 UI、设备的应用商店或 [Tailscale Packages - stable 轨道][pk-stable] 页面更新 Tailscale 客户端。

如果你的设备运行在可以使用 [Tailscale CLI][docs-cli] 的平台上（如 Linux、macOS 和 Windows），可以运行 `tailscale update` 进行一次性更新，或运行 `tailscale set --auto-update`，在有新版本发布时自动更新。

## 更多参考

* 有关安装 Tailscale 客户端的信息，请参阅 [安装 Tailscale][docs-installation]。
* 有关更新 Tailscale 客户端的信息，请参阅 [更新 Tailscale][docs-update]。
* 有关保护 Tailscale 客户端和 Tailscale 整体安全的深入指南，请参阅 [保护 tailnet 安全的最佳实践][docs-security-hardening]。

[docs-cli]: /docs/reference/tailscale-cli

[docs-installation]: /docs/install

[docs-messages]: /docs/reference/messages

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-update]: /docs/features/client/update

[pk-stable]: https://pkgs.tailscale.com/stable/
