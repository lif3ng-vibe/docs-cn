---
title: "在不安装 Tailscale 的情况下连接"
description: "安全地连接未安装 Tailscale 的设备。"
---

最后验证于 Aug 1, 2025

在大多数情况下，我们建议直接在你想连接的设备上[安装 Tailscale][co-download]。它开箱即用，而且设备在不同网络之间迁移时无需任何配置。

不过，有时你可能不想或无法直接安装 Tailscale：

* 从大量现有网络逐步迁移到 Tailscale
* 从云提供商自有的虚拟私有云（VPC）产品逐步迁移到 Tailscale
* 连接无法安装软件的设备（例如游戏主机、智能家电、IoT 设备）
* 连接运行不受支持操作系统的设备

在这些情况下，你可以运行一台称为[子网路由器][docs-subnets]的设备，在你的 Tailscale 网络与这些设备之间中继流量。

**更多信息，请阅读我们关于[子网路由器 →][docs-subnets] 的主题**。

[co-download]: https://tailscale.com/download

[docs-subnets]: /docs/features/subnet-routers
