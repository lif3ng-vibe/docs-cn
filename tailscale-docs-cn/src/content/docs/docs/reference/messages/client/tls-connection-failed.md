---
title: "加密连接失败"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jan 30, 2026

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Encrypted connection failed
Tailscale could not establish an encrypted connection with `<connection target>`.

## 消息 ID

`tls-connection-failed`

## 为什么会看到这条消息

这条消息表示 Tailscale 客户端无法与另一个 Tailscale 组件（例如对等端或[控制平面][docs-control-data-planes]）建立安全的加密连接。Tailscale 要求所有连接都[加密][docs-encryption]，当加密握手未能完成时就会出现这个错误。由于 Tailscale 无法保证通信安全，连接因此失败。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 确认两台设备都[具备可用的互联网连接][docs-connect-internet-failure]，并且已安装 Tailscale 客户端。
* 重启 Tailscale 客户端以刷新连接。
* 将 Tailscale 客户端更新到最新版本。
* 切换网络，以排除 ISP 或网络级过滤问题。
* 确认防火墙或安全软件没有阻止 UDP 流量。Tailscale 优先使用加密的对等连接。
* 确认系统时钟准确，时钟不同步会导致加密握手失败。
* 确认没有深度包检测、TLS 拦截或 VPN 软件干扰加密流量。

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-connect-internet-failure]: /docs/reference/troubleshooting/connectivity/connect-internet-failure

[docs-messages]: /docs/reference/messages
