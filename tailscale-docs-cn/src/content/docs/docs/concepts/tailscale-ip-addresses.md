---
title: "这些 100.x.y.z 地址是什么？"
description: "Tailscale 使用运营商级 NAT（CGNAT）范围内的 100.x.y.z IP 地址，为私有网络中的设备提供稳定、私密的连接。"
---

最后验证于 Jan 12, 2026

Tailscale 会为 Tailscale 网络（称为 [tailnet][docs-tailnet]）中的每台设备自动分配一个唯一的 IP 地址。这个 IP 地址称为 Tailscale IP 地址，来自 [RFC6598][xt-rfc-6598-cgnat] 定义的共享地址空间，即运营商级 NAT（Carrier-Grade NAT，CGNAT）。

无论设备位于何处，Tailscale IP 地址都保持不变。即使设备切换网络连接——例如从 Wi-Fi 切换到蜂窝网络——它的 Tailscale IP 地址也保持不变。此外，每台 tailnet 设备都可以在本地访问一个名为 [Quad100（`100.100.100.100`）][docs-what-is-quad100]的私有服务 IP 地址。Tailscale 还为内部服务保留了特定的地址范围，详情请参阅[保留 IP 地址][docs-reserved-ip-addresses]。

CGNAT 范围内的 IP 地址是 `100.64.0.0/10` 子网（`100.64.0.0` 至 `100.127.255.255`）中的[特殊用途][xt-rfc-5735-special-use] IPv4 地址。它们与其他特殊用途 IP 地址（例如私有 IP 地址）类似；与私有 IP 地址的不同之处在于，它们保留给互联网服务提供商（ISP）的网络和路由设备使用，而不是留给私有网络。

Tailscale 使用 CGNAT 范围内的 IP 地址，原因如下：

* 它们不会与私有网络常用子网（例如 `10.0.0.0/8` 和 `192.168.0.0/16`）的 IP 地址冲突。不过，当 Tailscale 与[使用相同地址空间的其他 VPN][docs-other-vpns]一起使用时，可能会发生冲突。
* 它们用于在到达公共互联网前还需要额外 NAT 的中间流量，这正是 [Tailscale 使用这些地址的方式][bl-how-tailscale-works]。
* 它们保留给互联网服务提供商而非私有网络。从定位上说，[Tailscale][docs-what-is-tailscale] 是一个在普通互联网之上构建共享网络的服务提供商。Tailscale IP 地址不会暴露给公共互联网。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-other-vpns]: /docs/reference/faq/other-vpns

[docs-tailnet]: /docs/concepts/tailnet

[docs-what-is-quad100]: /docs/reference/quad100

[docs-what-is-tailscale]: /docs/concepts/what-is-tailscale

[xt-rfc-5735-special-use]: https://www.rfc-editor.org/rfc/rfc5735.html

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-rfc-6598-cgnat]: https://www.rfc-editor.org/rfc/rfc6598.html
