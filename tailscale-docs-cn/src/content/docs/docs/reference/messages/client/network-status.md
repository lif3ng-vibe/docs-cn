---
title: "网络断开"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Aug 1, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Network down
Tailscale cannot connect because the network is down.

## 消息 ID

`network-status`

## 为什么会看到这条消息

这条消息通常在 Tailscale 客户端无法与 Tailscale [协调服务器][docs-control-data-planes] 通信时显示，原因是未检测到终端用户的网络连接。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 通过客户端 UI 重启 Tailscale 客户端，或者在 CLI 中先运行 `tailscale down`、再运行 `tailscale up`。
* 检查你的网络和互联网连接，然后尝试重新连接。
* 查看 [Tailscale Status][xt-tailscale-status] 页面。如果我们这边出现了影响任何服务的问题，都会在那里报告。

## 更多参考

有关解决 Tailscale 常见问题的更多信息，请参阅 [故障排除指南][docs-troubleshooting]。

[docs-control-data-planes]: /docs/concepts/control-data-planes#coordination-server

[docs-messages]: /docs/reference/messages

[docs-troubleshooting]: /docs/reference/troubleshooting

[xt-tailscale-status]: https://status.tailscale.com
