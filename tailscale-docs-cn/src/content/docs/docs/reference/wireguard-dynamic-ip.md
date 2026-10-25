---
title: "动态 IP 地址下的 WireGuard VPN"
description: "WireGuard VPN 如何应对动态 IP 地址。"
---

最后验证于 Dec 10, 2024

标准 [WireGuard][xt-wireguard] 实现需要修改配置，包括在 VPN 客户端中设置指向 WireGuard 服务器的静态 IP 地址，并可能需要在防火墙上开放端口。这在动态网络环境中会造成若干技术限制。例如，如果 WireGuard 服务器使用动态 IP 地址，那么每次 IP 地址变化时你都必须重启 VPN 客户端，因为 WireGuard 客户端只在启动时解析一次 IP 地址。

使用 Tailscale 可以避免这些限制。Tailscale 会自动以优化的[网状（mesh）][ln-understanding-mesh-vpns]拓扑配置 WireGuard，从而无需使用静态 IP 地址或在防火墙上开放端口。在 Tailscale 网络（即 tailnet）中，你可以放心使用动态 IP 地址，无需担心它们发生变化。[了解 Tailscale 的工作原理][bl-how-tailscale-works]。

[下载 Tailscale](https://tailscale.com/download)

[bl-how-tailscale-works]: https://tailscale.com/blog/how-nat-traversal-works

[ln-understanding-mesh-vpns]: https://tailscale.com/learn/understanding-mesh-vpns

[xt-wireguard]: https://www.wireguard.com
