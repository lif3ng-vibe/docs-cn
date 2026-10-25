---
title: "路由流量"
description: "探索 Tailscale 的路由功能，例如子网路由器、出口节点和 MagicDNS。"
---

最后验证于 Sep 29, 2026

使用 Tailscale 的路由功能，控制网络流量如何流入、流出以及在 Tailscale 网络（即 tailnet）内部路由。

## 访问非 Tailscale 设备

如果无法在物理网络中的每台设备上都安装 Tailscale，你可以设置*子网路由器*（subnet router），从 tailnet 访问这些设备。子网路由器会遵循[访问控制策略][docs-access-control]等特性，让你无需在每台设备上安装 Tailscale 客户端，也能轻松将大型网络迁移到 Tailscale。

[**子网路由器**](/docs/features/subnet-routers)——使用子网路由器让本地网络之外的设备访问特定子网内的服务，用 Tailscale 扩展你的私有网络。

## 路由全部互联网流量

在咖啡馆连接不可信的 Wi-Fi，或在海外访问仅限本国使用的在线服务（如网上银行）时，通过*出口节点*（exit node）路由互联网流量会很有用。

出口节点会路由你的**全部**网络流量，这往往不是你想要的。若要将 Tailscale 配置为只路由去往特定子网的流量（更常见的配置），请阅读[从你的网络访问非 Tailscale 设备][ar-non-tailscale-devices]。

[**出口节点（路由全部流量）**](/docs/features/exit-nodes)——让全部互联网流量经由网络中的特定设备路由。

[**Mullvad 出口节点**](/docs/features/exit-nodes/mullvad-exit-nodes)——使用 Mullvad VPN 端点作为你 tailnet 的出口节点。

## 控制对第三方应用的访问

应用连接器（app connector）让你无需终端用户做任何设置，就能控制设备和用户对应用的访问。你可以在整个 tailnet 范围内管理和监控对 SaaS 应用和自托管应用的访问。

[**应用连接器的工作原理**](/docs/features/app-connectors)——使用应用连接器在 tailnet 中路由 SaaS 应用流量。

## 选择 Tailscale 的路由选择方式

部署冗余的子网路由器和应用连接器以实现高可用。使用路由选择（route selection）来决定 Tailscale 如何在它们之间做出选择。

[**设置高可用**](/docs/how-to/set-up-high-availability)——为子网路由器和应用连接器设置高可用（HA）。

[**路由选择**](/docs/features/route-selection)——比较并配置子网路由器、应用连接器和 Tailscale Service 主机的路由选择，包括 MagicRoute 的出口节点推荐。

## 管理 DNS

你可以使用域名系统（DNS）将 Tailscale IP 地址映射为易读易记的名称。例如，你不必记住哪个 IP 地址对应 tailnet 中托管的内部报销服务器，而是可以用 DNS 将该 IP 地址映射为服务器名称，比如 "Expenses"。

[**Tailscale 中的 DNS**](/docs/reference/dns-in-tailscale)——为 DNS 管理（包括自定义 DNS 服务器）优化你的 Tailscale 网络，实现无缝访问和更好的控制。

[ar-non-tailscale-devices]: #访问非-tailscale-设备

[docs-access-control]: /docs/features/access-control
