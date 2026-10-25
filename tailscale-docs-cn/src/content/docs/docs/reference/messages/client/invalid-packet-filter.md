---
title: "无效的数据包过滤器"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Aug 1, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Invalid packet filter
The coordination server sent an invalid packet filter permitting traffic to unlocked nodes; rejecting all packets for safety

## 参考 ID

`invalid-packet-filter`

## 为什么会看到这条消息

协调服务器（coordination server）负责设备发现、身份验证、密钥分发、策略执行，以及向 tailnet 中的所有设备分发网络配置。

当协调服务器下发的数据包过滤器配置被客户端判定为无效或不安全时，就会显示这条消息。

可能显示这条消息的原因有：

* tailnet 策略文件可能存在问题，例如端口、协议字符串、CIDR 细节等取值无效。
* 同一个 tailnet 策略文件标签同时分配给了 Tailscale Funnel 和某个现有的应用连接器（app connector）。
* 报告这个错误的操作系统可能启用了系统级数据包过滤器，与 Tailscale 客户端的数据包过滤冲突。这类平台包括 BSD 变体、启用了数据包过滤（pf）防火墙的 macOS，以及使用 iptables 或 nftables 的 Linux。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 通过客户端 UI 重启 Tailscale 客户端，或者在 CLI 中先运行 `tailscale down`、再运行 `tailscale up`。
* 检查你的互联网连接。
* 等待几分钟，然后重启 Tailscale 客户端。
* 确认 tailnet 策略文件中没有无效规则，且 Tailscale Funnel 与应用连接器没有被分配相同的标签。
* 检查你的防火墙规则。

## 更多信息

* 有关在 Tailscale 中使用防火墙的信息，请参阅 [将 Tailscale 与你的防火墙配合使用][docs-firewalls]。
* 有关 tailnet 策略文件的用法与语法，请参阅 [tailnet 策略文件语法参考][docs-policy-syntax]。
* 有关协调服务器中断的信息，请参阅 [协调服务器宕机会怎样？][docs-coordination server-down]。
* 有关 Tailscale 协调服务器的信息，请参阅 [控制平面与数据平面][docs-control-data-planes]。

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-coordination server-down]: /docs/reference/coordination-server-down

[docs-firewalls]: /docs/integrations/firewalls

[docs-messages]: /docs/reference/messages

[docs-policy-syntax]: /docs/reference/syntax/policy-file
