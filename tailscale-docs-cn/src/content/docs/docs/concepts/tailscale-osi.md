---
title: "Tailscale 与 OSI 模型"
description: "了解 Tailscale 与 OSI 模型各层的对应关系。"
---

最后验证于 Jan 5, 2026

[OSI（开放式系统互联）模型][xt-osi]是一个理论框架，用于帮助描述网络通信的工作方式。它把通信过程划分为七个层级，每层都有自己的特点，并与紧邻的上下层交互。下表对每一层做了概括。

| #  | **层**                                   | **说明**                                                                                                                                                                                                                                                            |
| :- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7  | [应用层][ar-application-layer]   | 应用层提供网络服务与协议，让应用能够与其他应用交换数据。它是离最终用户最近的层。                                                                                                      |
| 6  | [表示层][ar-presentation-layer] | 表示层涵盖与数据编码、格式化、压缩、解压，以及应用层与网络之间数据转换相关的内容。                                                                        |
| 5  | [会话层][ar-session-layer]           | 会话层涵盖与应用之间会话或连接相关的内容，包括建立、维持和终止会话，以及会话恢复和错误处理。                                         |
| 4  | [传输层][ar-transport-layer]       | 传输层通过差错校验和流量控制确保数据完整传输，涉及的协议有 TCP 和 UDP。                                                                                                                                      |
| 3  | [网络层][ar-network-layer]           | 网络层负责数据包路由和 IP 地址（IPv4 与 IPv6）管理，以实现网络之间的数据传输。                                                                                                                                      |
| 2  | [数据链路层][ar-data-link-layer]       | 数据链路层管理数据封装（称为成帧）、两个直连设备之间的数据传输，以及差错检测与纠正。它包含两个主要子层：逻辑链路控制（LLC）层和媒体访问控制（MAC）层。 |
| 1  | [物理层][ar-physical-layer]         | 物理层涉及设备之间的物理连接，包括网线、交换机和其他网络接口卡（NIC）。                                                                                                                                 |

OSI 模型是理解和讨论网络架构的宝贵工具，但它很少与现实世界的实现完全吻合，在考虑 Tailscale 这类现代组网技术时尤其如此。

Tailscale 主要是一个网络层解决方案，既为特定应用提供直接支持，也提供一个可供其他应用使用的通用网络层。它通过借助 [WireGuard][docs-wireguard]——一个以高效和简洁著称的现代虚拟专用网络（VPN）协议——来实现这一功能。

Tailscale 借助的 WireGuard 协议从网络层起步。但由于它是一个抽象了数据链路层和物理层的虚拟接口，可以把它看作在用一个完整 OSI 模型（从物理层到应用层）的虚拟实例。这种抽象造成了网络层套嵌在其他网络层之中运行的局面。因此，在 WireGuard 和 Tailscale 的语境下，物理层和数据链路层的归类存在模糊之处。

Tailscale 和 WireGuard 主要工作在网络层（而非数据链路层），一个重要影响是：某些网络操作的表现可能与传统局域网（LAN）不同，例如向其他设备广播或多播。因此，一些为 LAN 环境设计的协议，在 Tailscale 网络（称为 [tailnet][docs-tailnet]）上使用时可能出现意外行为。

虽然 OSI 模型为讨论 Tailscale 和 WireGuard 这类网络技术提供了宝贵框架，但必须认识到它的局限，以及这些现代方案会如何偏离传统模型、或使其更加复杂。在实现、设计或[排查][docs-device-connectivity]运行于 tailnet 之上的系统时，理解这些细微差别至关重要。

以下各节介绍 Tailscale 及其底层技术与 OSI 模型各层的关系。

## 应用层

Tailscale 提供应用所依赖的网络服务，并提供多种运行在应用层的功能。

运行在应用层的 Tailscale 功能包括 [MagicDNS][docs-magicdns]、[Tailscale SSH][docs-tailscale-ssh]、[Taildrop][docs-taildrop]、[Taildrive][docs-taildrive]、[Web 界面][docs-web-interface]、[Tailscale CLI][docs-cli]、[Tailscale API][docs-api]、[日志与监控][docs-log-mesh-traffic]、[Tailscale Serve][docs-serve]和 [Tailscale Funnel][docs-funnel]。

## 表示层

表示层负责数据编码、压缩和[加密][docs-encryption]。Tailscale 使用 WireGuard 对 tailnet 设备之间的数据包以及基础设施数据包（例如发往控制服务器的数据包）进行加密。例如，使用 [disco 协议][xt-disco]进行点对点 NAT 穿透和中继操作的连接都是加密的。Tailscale 还使用 [Noise 协议][xt-noise]的内部实现对发往控制平面的通信进行加密。

## 会话层

在会话层，Tailscale 为子网路由以及基于 DERP 中继服务器的 NAT 穿透等功能实现连接跟踪和会话管理。

Tailscale 还通过简化设备之间的连接过程、处理 tailnet 设备之间的自动对等连接、维持设备间的持久连接，间接影响会话层。

运行在会话层的 Tailscale 功能包括 [DERP 服务器][docs-derp]、[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]、[应用连接器][docs-app-connectors]、[MagicDNS][docs-magicdns]和 [NAT 穿透][bl-nat-traversal]。

## 传输层

Tailscale 在传输层使用 WireGuard 协议在设备之间建立安全的加密隧道。WireGuard 的密码学算法提供强加密，确保通过 tailnet 传输的数据安全且完整。Tailscale 负责这些安全连接的建立、维护和拆除，即使在可能不可靠的网络上也能提供可靠的数据传输。

运行在传输层的 Tailscale 功能包括 [DERP 服务器][docs-derp]、[访问控制][docs-access-control]（[授权][docs-grants]和 [ACL][docs-acls]）、[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]、[应用连接器][docs-app-connectors]、[MagicDNS][docs-magicdns]和 [NAT 穿透][bl-nat-traversal]。

## 网络层

在网络层，Tailscale 负责 IP 地址管理和数据包路由。Tailscale 为 tailnet 中的每台设备分配唯一的 [Tailscale IP 地址][docs-tailscale-ip-addresses]，并构建一个虚拟专用网络（VPN），确保数据包到达 tailnet 内的正确目的地。

运行在网络层的 Tailscale 功能包括数据包路由、[IP 地址分配][docs-ip-addresses]、IPv4 与 [IPv6][docs-ipv6] 支持、[拆分隧道][docs-other-vpns]、[协调服务器][docs-coordination-server]、[访问控制][docs-access-control]（[授权][docs-grants]和 [ACL][docs-acls]）、[子网路由器][docs-subnets]、[出口节点][docs-exit-nodes]和 [NAT 穿透][bl-nat-traversal]。

## 数据链路层

在设备上安装 Tailscale 客户端时，Tailscale 会创建一个处理数据链路层流量的 [TUN/TAP][xt-tap-tun] 虚拟网络接口。

需要注意的是，Tailscale 有意将大多数数据链路层问题抽象掉。它的设计重点是[无论底层物理层或数据链路层基础设施如何][bl-how-tailscale-works]，都能提供网络层连接。借助这一抽象，Tailscale 可以在广泛的底层网络基础设施上提供一致的网络能力，而无需直接管理每台设备上数据链路层的具体细节。

## 物理层

Tailscale 依赖物理层，但不直接操作物理层的信号或数据包。不过，Tailscale 会以特定方式感知物理层。例如，Tailscale 能区分 Wi-Fi 连接和蜂窝网络连接的差异。

[ar-application-layer]: #应用层

[ar-data-link-layer]: #数据链路层

[ar-network-layer]: #网络层

[ar-physical-layer]: #物理层

[ar-presentation-layer]: #表示层

[ar-session-layer]: #会话层

[ar-transport-layer]: #传输层

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[bl-nat-traversal]: https://tailscale.com/blog/how-nat-traversal-works

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-app-connectors]: /docs/features/app-connectors

[docs-cli]: /docs/reference/tailscale-cli

[docs-coordination-server]: /docs/reference/glossary#coordination-server

[docs-derp]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants]: /docs/features/access-control/grants

[docs-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-ipv6]: /docs/concepts/ipv6

[docs-log-mesh-traffic]: /docs/features/logging

[docs-magicdns]: /docs/features/magicdns

[docs-other-vpns]: /docs/reference/faq/other-vpns

[docs-serve]: /docs/features/tailscale-serve

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-web-interface]: /docs/features/client/device-web-interface

[docs-wireguard]: /docs/concepts/wireguard

[xt-disco]: https://github.com/tailscale/tailscale/blob/main/disco/disco.go

[xt-noise]: http://www.noiseprotocol.org/noise.html

[xt-osi]: https://en.wikipedia.org/wiki/OSI_model

[xt-tap-tun]: https://en.wikipedia.org/wiki/TUN/TAP
