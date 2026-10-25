---
title: "Tailscale 的 IPv6 支持"
description: "了解 Tailscale 如何配合 IPv6 工作。"
---

最后验证于 Jan 12, 2026

互联网协议第 6 版（IPv6）定义于 [RFC8200][xt-rfc-8200]，是互联网协议的最新版本，也是 IPv4 的后继者。Tailscale 同时支持 IPv4 和 IPv6，甚至能借助 DERP 服务器促成仅支持 IPv4 的设备与仅支持 IPv6 的设备之间的连接。

## 私有与公共 IPv6 地址

与 IPv4 地址类似，IPv6 地址也分两类：私有 IPv6 地址和公共 IPv6 地址。

私有 IPv6 指 Tailscale 网络（即 [tailnet][docs-tailnet]）内部使用的 IPv6 地址。这些地址不会暴露给公共互联网。Tailscale 从 `fd7a:115c:a1e0::/48` 这一[唯一本地前缀][xt-wiki-unique-local-address]（unique local prefix）中为 tailnet 内的每台设备分配私有 IPv6 地址。该前缀属于 Tailscale [保留 IP 地址][docs-reserved-ip-addresses]的一部分。因此，即使你的互联网服务提供商（ISP）不支持 IPv6，tailnet 内的 IPv6 连接也始终可用。在[用户态网络模式][docs-userspace-networking]下，Tailscale 会模拟 IPv6 支持，确保即使在不原生支持 IPv6 的设备上也能使用 IPv6 功能。

公共 IPv6 指使用互联网服务提供商（ISP）提供的 IPv6 地址在公共互联网上通信。在协商设备间连接时，Tailscale 可以使用设备 ISP 提供的公共 IPv6 地址，但前提是两台设备都拥有公共 IPv6 地址。

> **提示：**
>
> [出口节点][docs-exit-nodes]完全支持 IPv6。这意味着即使你的 ISP 不提供 IPv6 连接，你也可以经由支持 IPv6 的出口节点路由流量。

## IPv4 互操作性

当无法建立直连时，Tailscale 的 [DERP 服务器][docs-derp-servers]可以促成仅支持 IPv6 的设备与仅支持 IPv4 的设备之间的连接。对于直连中缺少 IPv6 地址的一方，Tailscale 默认使用 IPv4 连接。下表展示了两台设备在不同条件下使用的 IP 地址类型。

| **设备 A**    | **设备 B**   | **连接类型**                            |
| :------------ | :----------- | :-------------------------------------- |
| IPv6-only     | IPv4-only    | [中继连接][docs-derp-servers]           |
| IPv4 和 IPv6  | IPv4-only    | IPv4                                    |
| IPv4 和 IPv6  | IPv6-only    | IPv6                                    |
| IPv4-only     | IPv4-only    | IPv4                                    |
| IPv6-only     | IPv6-only    | IPv6                                    |

IPv6 可以提高[网络地址转换（NAT）穿透][bl-how-nat-traversal-works]的效率，甚至完全省去穿透的必要。不过，当两端都没有公共 IPv6 时，Tailscale 在 IPv4 上同样运行良好。

有关 IPv4 和 IPv6 的更多信息，请参阅 [IPv4 与 IPv6 常见问题][docs-ipv4-vs-ipv6]。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-derp-servers]: /docs/reference/derp-servers

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ipv4-vs-ipv6]: /docs/reference/faq/ipv6

[docs-tailnet]: /docs/concepts/tailnet

[docs-userspace-networking]: /docs/concepts/userspace-networking

[xt-rfc-8200]: https://www.rfc-editor.org/rfc/rfc8200.html

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-wiki-unique-local-address]: https://en.wikipedia.org/wiki/Unique_local_address
