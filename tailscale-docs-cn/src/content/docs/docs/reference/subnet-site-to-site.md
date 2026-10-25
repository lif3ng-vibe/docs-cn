---
title: "用 Tailscale 和 WireGuard 取代站点到站点 VPN"
description: "使用 Tailscale 搭建站点到站点 VPN，在本地网络之间转发网络流量。"
---

最后验证于 Sep 4, 2024

站点到站点 VPN（虚拟专用网络）会在两个或多个本地网络之间透明地转发网络流量。其中某个网络上的设备或虚拟机可以访问所有其他子网上的服务，而无需在设备本身上安装任何软件。

站点到站点 VPN 的常见使用场景包括：

* 把物理办公室连接到云端。
* 跨区域连接 VPC（虚拟私有云）。
* 在不同云服务商之间互连（例如 Google 与 AWS 之间）。
* 与外部供应商、合作伙伴或承包商共享服务器或 API。

常见的站点到站点 VPN 提供商和平台包括 Amazon Web Services（AWS）VPN、Google Cloud Platform（GCP）VPN、Cisco 或 Palo Alto Networks 硬件，以及配置了 IPsec 的 Linux 设备。

## 用 Tailscale 和 WireGuard 搭建站点到站点 VPN

通过将 Tailscale 与 [WireGuard][docs-wireguard] 结合使用，你可以用一个安全、高性能的网状网络取代所有这些传统的站点到站点配置。这一组合可提供值得信赖的安全水平。

开始时，先在每个位置配置一台 [Tailscale 子网路由器][docs-subnets]。创建多站点网状网络所需的全部密钥管理和路由工作，Tailscale 都会自动处理。

[docs-subnets]: /docs/features/subnet-routers

[docs-wireguard]: /docs/concepts/wireguard
