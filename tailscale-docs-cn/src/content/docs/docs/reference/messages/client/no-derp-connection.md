---
title: "中继服务器不可用"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Relay server unavailable
Tailscale could not connect to the `<derp-server>` relay server. Your internet connection might be down, or the server might be temporarily unavailable.

## 参考 ID

`no-derp-connection`

## 为什么会看到这条消息

这条消息表示 Tailscale 客户端无法连接到某个特定的 DERP（Designated Encrypted Routing Protocol）中继服务器。当点对点直连不可行时，Tailscale 会把 DERP 作为路由流量的回退方式。消息中提到的 DERP 服务器通常是在地理位置上离你最近的那台。出现这个问题时，Tailscale 客户端可能会尝试连接次近的 DERP 服务器。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 通过客户端 UI 重启 Tailscale 客户端，或者在 CLI 中先运行 `tailscale down`、再运行 `tailscale up`。
* 检查你的互联网连接。
* 如果你使用了防火墙，请确认连接 Tailscale 所用的端口和域名未被阻止。

## 更多信息

* 有关与 Tailscale 通信所用的端口和域名，请参阅 [使用 Tailscale 应该打开哪些防火墙端口？][docs-firewall-ports]。
* 有关 Designated Encrypted Routing Protocol 的信息，请参阅 [DERP 服务器][docs-derp-server]。

[docs-derp-server]: /docs/reference/derp-servers

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-messages]: /docs/reference/messages
