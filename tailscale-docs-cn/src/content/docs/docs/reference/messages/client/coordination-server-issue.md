---
title: "协调服务器报告问题"
description: "本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Aug 1, 2025

本主题解释可能出现在 Tailscale 客户端中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 客户端中显示的消息

Coordination server reports an issue
The coordination server is reporting a health issue: `<reported-issue>`

## 参考 ID

`control-health`

## 为什么会看到这条消息

协调服务器（coordination server）负责设备发现、身份验证、密钥分发、策略执行，以及向 tailnet 中的所有设备分发网络配置。

当协调服务器不可达时，可能会显示这条消息。造成这种情况的原因有多种，包括：

* 我们这边出现了问题。
* 路由器、防火墙或网络配置最近被更新，导致连接问题。
* 你最近被分配了新的公网 IP 地址，客户端正在尝试重新建立与协调服务器的连接。

## 处理方法

你可以尝试以下方法来解决这个问题：

* 通过客户端 UI 重启 Tailscale 客户端，或者在 CLI 中先运行 `tailscale down`、再运行 `tailscale up`。
* 检查你的互联网连接。
* 等待几分钟，然后重启 Tailscale 客户端。
* 检查你的防火墙规则。
* 查看 [Tailscale Status][xt-tailscale-status] 页面。如果我们这边出现了影响任何服务的问题，都会在那里报告。

## 更多信息

* 有关协调服务器中断的信息，请参阅 [协调服务器宕机会怎样？][docs-coordination server-down]。
* 有关 Tailscale 协调服务器的信息，请参阅 [控制平面与数据平面][docs-control-data-planes]。
* 有关在 Tailscale 中使用防火墙的信息，请参阅 [将 Tailscale 与你的防火墙配合使用][docs-firewalls]。

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-coordination server-down]: /docs/reference/coordination-server-down

[docs-firewalls]: /docs/integrations/firewalls

[docs-messages]: /docs/reference/messages

[xt-tailscale-status]: https://status.tailscale.com
