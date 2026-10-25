---
title: "共享信息加载失败"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Oct 15, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

Error: Failed to load sharing information. Please try again later or contact support.

## 为什么会看到这条消息

当你尝试共享 tailnet 中的设备时（在管理控制台的 **Machines** 页面中选择某台设备的 **Share**），可能会显示这条消息。这可能是 Tailscale 控制服务器（control server）出现问题所致。

Tailscale 协调服务器（coordination server）负责设备发现、身份验证、密钥分发、策略执行，以及向 tailnet 中的所有设备分发网络配置。

## 处理方法

你可以尝试以下方法来解决此问题：

* 稍等片刻，然后重试访问 Tailscale 管理控制台。
* 查看 [Tailscale Status][xt-tailscale-status] 页面。如果我们这边有影响任何服务的问题，都会在该页面报告。

## 更多信息

* 有关 Tailscale 协调服务器的信息，请参阅 [控制平面与数据平面][docs-control-data-planes]。
* 有关共享 tailnet 中设备的信息，请参阅 [将你的机器共享给其他用户][docs-sharing]。

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-messages]: /docs/reference/messages

[docs-sharing]: /docs/features/sharing

[xt-tailscale-status]: https://status.tailscale.com/
