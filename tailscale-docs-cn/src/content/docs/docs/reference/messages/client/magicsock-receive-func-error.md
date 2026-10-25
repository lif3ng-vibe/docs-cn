---
title: "MagicSock 函数未运行"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

MagicSock function not running
The MagicSock function `<function-name>` is not running. You might experience connectivity issues.

## 消息 ID

`magicsock-receive-func-error`

## 为什么会看到这条消息

MagicSock 是 Tailscale 的一个网络层，负责发现和选择网络路径，并处理 tailnet 中的数据包传输。安装 Tailscale 客户端后，它会作为后台服务运行。出现这个错误通常是因为该服务的某个函数失败了。与 MagicSock 相关的函数包括：创建新连接、发现、网络映射更新、加密密钥更新，以及在 UDP 与 DERP 中继服务器之间切换。

可能显示这条消息的原因有：

* Tailscale 客户端安装存在问题。
* 在点对点 UDP 连接与 DERP 服务器中继连接之间切换时出现问题。
* 你所在网络的防火墙正在阻止 UDP 端口，或以其他方式阻止连接。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 重启 Tailscale 客户端。
* 如果你使用了防火墙，请确认连接 Tailscale 所用的端口和域名未被阻止。
* 如果 Tailscale 客户端不是最新版本，请更新它。
* 重新安装 Tailscale 客户端。
* 生成 bug 报告并发送给 Tailscale 支持。

## 更多参考

* 有关与 Tailscale 通信所用的端口和域名，请参阅 [使用 Tailscale 应该打开哪些防火墙端口？][docs-firewall-ports]。
* 有关更新 Tailscale 客户端的信息，请参阅 [更新 Tailscale][docs-update]。
* 有关如何生成 bug 报告并发送给 Tailscale 支持的信息，请参阅 [生成 bug 报告][docs-bug-report]。
* 有关 UDP 与 DERP 中继服务器连接的工作原理，请参阅 [连接类型][docs-connection-types]。

[docs-bug-report]: /docs/account/bug-report

[docs-connection-types]: /docs/reference/connection-types

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-messages]: /docs/reference/messages

[docs-update]: /docs/features/client/update
