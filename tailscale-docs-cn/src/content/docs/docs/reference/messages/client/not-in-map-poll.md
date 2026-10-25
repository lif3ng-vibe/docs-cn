---
title: "状态不同步"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jan 5, 2026

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Out of sync
Unable to connect to the Tailscale coordination server to
synchronize the state of your tailnet. Peer reachability
might degrade over time.

## 参考 ID

`not-in-map-poll`

## 为什么会看到这条消息

你的 Tailscale 客户端无法连接到协调服务器（coordination server），该服务器负责在整个 tailnet 范围内同步各设备与节点（对等端）。

出现这个问题的原因可能有：

* 互联网连接存在问题。
* 防火墙限制阻止了与 Tailscale 协调服务器的连接。
* 运行在设备与节点上的 Tailscale 后台服务未能正常运行。
* 设备管控阻止了连接。例如 Apple 设备上的屏幕使用时间等功能。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 通过客户端 UI 重启 Tailscale 客户端，或者在 CLI 中先运行 `tailscale down`、再运行 `tailscale up`。
* 检查你的互联网连接。
* 调整或移除可能阻止连接的设备管控。
* 如果你使用了防火墙，请确认连接 Tailscale 所用的端口和域名未被阻止。

## 更多信息

* 有关与 Tailscale 通信所用的端口和域名，请参阅 [使用 Tailscale 应该打开哪些防火墙端口？][docs-firewall-ports]。
* 有关禁用 Apple 屏幕使用时间功能的信息，请参阅 [macOS 屏幕使用时间与 Tailscale][docs-macos-webfilterproxyd]。

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-macos-webfilterproxyd]: /docs/concepts/macos-webfilterproxyd

[docs-messages]: /docs/reference/messages
