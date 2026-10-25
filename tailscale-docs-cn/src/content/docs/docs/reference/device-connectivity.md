---
title: "设备连接"
description: "了解 Tailscale 设备之间的连接。"
---

最后验证于 Jan 7, 2026

Tailscale 网络（即 tailnet）内的设备可以通过三种[连接类型][docs-types-of-connections]之一进行通信：

* 直连
* 使用 [Tailscale Peer Relay 服务器][docs-peer-relays]的中继连接
* 使用 [DERP 中继服务器][docs-derp-relay-servers]的中继连接

直连性能最好，因为设备无需中介即可直接互连，但直连并非总能建立。当直连不可行时，Tailscale 会自动改用中继连接，确保你的设备无论处于何种网络环境都能连接。如果有对等中继服务器可用，会优先使用，因为它通常比 DERP 服务器性能更好。如果没有对等中继，连接会回退到 DERP 中继连接。

连接双方的网络状况与网络地址转换（NAT）类型，决定了 Tailscale 采用直连还是中继连接。你可以用 [`tailscale status`][docs-tailscale-status] 命令判断设备正在使用的连接类型。

## NAT 类型

NAT 是一种常用方法，把私有 IP 地址空间映射到一个可公开访问的 IP 地址之后，以应对 IPv4 地址枯竭的影响。[Tailscale 会自动替你穿透 NAT][bl-how-nat-traversal-works]，确保设备间的连接不受 [NAT 带来的种种复杂问题][xt-rfc-3027-nat-complications]阻碍。

连接中每台设备的 NAT 配置决定了 Tailscale 使用直连还是中继连接。每台设备都处于以下场景之一：[无 NAT][ar-no-nat]、[简单 NAT（easy NAT）][ar-easy-nat]或[硬 NAT][ar-hard-nat]。

> **注意：**
>
> **IPv6 与 NAT**
>
> NAT 最常用于出站 IPv4 地址受限的环境。IPv6 的可用地址要多得多，因此使用 NAT 来节省对外地址是可选的（不过，在 IPv6 上使用 NAT 也有[其他原因][xt-rfc-4380-ipv6-nat]）。因此，使用 IPv6 地址的设备被视为[简单 NAT][ar-easy-nat]，因为它们在几乎所有情况下都能建立直连。

### 无 NAT

在无 NAT 场景中，tailnet 设备不在 NAT 设备之后，拥有可公开访问的 IP 地址。

### 简单 NAT

简单 NAT 指限制较少的 NAT 配置，从互联网访问 NAT 设备之后的设备更为容易。简单 NAT 配置的例子包括[完全锥形 NAT（full cone NAT）][xt-rfc-3489-full-cone-nat]、支持端口映射协议（如 [UPnP][xt-wikipedia-uPNP]、[PCP][xt-wikipedia-PCP] 或 [NAT-PMP][xt-wikipedia-NAT-PMP]）、支持[发夹连接（hair pinning）][xt-rfc-5128-hairpinning]，以及一致的端口映射。

### 硬 NAT

硬 NAT 指限制严格的网络地址转换配置，优先考虑安全性，但使从互联网访问 NAT 之后的设备变得困难。在硬 NAT 场景中：

1. tailnet 设备在 NAT 设备之后拥有一个私有地址。
2. 当 tailnet 设备发起连接时，NAT 设备会采用各种防护技术，可能包括：

   * 使用复杂的端口分配策略。
   * 禁用端口映射协议（如 [UPnP][xt-wikipedia-uPNP]）。
   * 对空闲连接设置较短的超时时间。

这些措施增强了安全性，但也会让建立和维持连接变得更复杂，对入站流量尤其如此。

这种配置会影响 tailnet 设备之间的通信方式，在复杂网络环境中尤其明显。

> **注意：**
>
> **防火墙与 NAT**
>
> 阻断入站 UDP 连接的有状态防火墙并不属于 NAT。但是，如果你的设备拥有公网 IP 地址，却位于一台阻断了 [`tailscaled`][docs-tailscaled] 所监听端口入站 UDP 连接的防火墙之后，那么该设备的行为方式与简单 NAT 设备相同。
>
> 有关 Tailscale 如何处理防火墙的更多信息，请阅读 [NAT 穿透是如何工作的][bl-how-nat-traversal-works]。

## 连接矩阵

连接双方共同决定 Tailscale 使用直连还是中继连接。下表列出了各种 NAT 类型组合及预期的连接类型。

客户端 A 的 NAT 类型
客户端 B 的 NAT 类型
预期连接

无 NAT
无 NAT
直连

无 NAT
简单 NAT
直连

无 NAT
硬 NAT
直连

简单 NAT
简单 NAT
直连

简单 NAT
硬 NAT
中继

硬 NAT
硬 NAT
中继

满足以下任一条件时，Tailscale 会使用中继连接：

* 两台设备都是硬 NAT 配置。
* 一台设备是硬 NAT 配置，另一台是简单 NAT 配置。

默认情况下，中继连接使用 DERP 服务器。不过，如果你在 tailnet 中架设了 [Tailscale Peer Relay 服务器][docs-peer-relays]，中继连接会优先使用对等中继。对等中继是你自己基础设施的一部分，通常比 DERP 服务器性能更好。

## 用 `netcheck` 排查问题

如果设备使用的是中继连接而非直连，你可以用 [`tailscale netcheck`][docs-tailscale-netcheck] 命令排查原因。分步排查说明请参阅[设备连接问题排查][docs-troubleshoot-connectivity]。

`tailscale netcheck` 命令返回设备当前网络连接的信息。这些信息来自 [STUN][docs-what-is-stun] 和设备上运行的 Tailscale 客户端，可以帮助你排查连接问题。例如，你可以利用 `tailscale netcheck` 的输出排查客户端为何使用 DERP 中继服务器而不是直连。

`tailscale netcheck` 的输出包含以下字段：

* [UDP][ar-udp]
* [IPv4][ar-ipv4]
* [IPv6][ar-ipv6]
* [映射因目标 IP 地址而异][ar-mapping-varies-by-destination-ip-address]
* [端口映射][ar-port-mapping]

### UDP

`UDP` 字段表示设备能否发送出站 UDP 数据包。

| **取值** | **含义** | **解读** |
| -------- | -------- | -------- |
| True | [STUN][docs-what-is-stun] 服务器已收到出站 UDP 数据包。 | 设备具备出站连接能力，这对建立直连至关重要。 |
| False | [STUN][docs-what-is-stun] 服务器未收到出站 UDP 数据包。 | 设备没有出站 UDP 连接，很可能没有使用直连。 |

### IPv4

`IPv4` 字段显示设备的公网 IPv4 地址和端口号。

| **取值** | **含义** | **解读** |
| -------- | -------- | -------- |
| Yes, `<IPv4 address>` | 设备拥有有效的 IPv4 地址和端口号。 | 设备具备出站连接能力，这对直连至关重要。 |
| No | 设备没有 IPv4 地址。 | 如果没有 IPv4 地址，设备就没有网络连接。 |

### IPv6

`IPv6` 字段显示设备是否支持 IPv6；如果支持，还会包含设备的公网 IPv6 地址和端口号。

| **取值** | **含义** | **解读** |
| -------- | -------- | -------- |
| Yes, `<IPv6 address>` | 设备拥有 IPv6 地址和端口号。 | 设备具备出站连接能力，这对建立直连至关重要。 |
| No | 设备没有 IPv6 地址，且操作系统不支持 IPv6。 | 设备不支持 IPv6，是否有使用 IPv4 的出站连接则视情况而定。 |
| No, but OS has support | 设备没有 IPv6 地址，但操作系统支持 IPv6。 | 设备要么没有出站连接能力，要么正在使用 IPv4。它仍可以通过其他设备的 [tailnet IPv6 地址][docs-tailnet-ipv6]访问它们。 |

### 映射因目标 IP 地址而异

`MappingVariesByDestIP` 字段表示设备的 IP 地址在不同的 [DERP][docs-derp-relay-servers] 中继服务器之间是否不同。这是判断设备为何没有使用直连的最重要字段。

| **取值** | **含义** | **解读** |
| -------- | -------- | -------- |
| True | 设备的 IP 地址与端口号组合在不同的 DERP 中继服务器之间有所不同。 | 如果两台 DERP 中继服务器返回不同的结果，说明设备位于会随机选择 IP 地址与端口号组合的[**硬 NAT**][ar-hard-nat]之后。硬 NAT 使 Tailscale 难以建立直连，因此设备很可能正在使用 DERP 中继服务器。 |
| False | 设备的 IP 地址与端口号组合在所有 DERP 中继服务器上都相同。 | 如果所有 DERP 中继服务器返回相同的结果，说明设备要么没有 NAT，要么位于[**简单 NAT**][ar-easy-nat]之后。设备很可能使用直连。 |

Tailscale 发起连接时，会联系多台 DERP 中继服务器以获取出站 IP 地址与端口组合。每台 DERP 中继服务器都会把该信息报告给 Tailscale。

如果出站 IP 地址在不同 DERP 服务器之间不同，说明设备位于会因目标不同而改变 IP 地址的 NAT 之后。这有时被称为[硬 NAT][ar-hard-nat]。

如果出站 IP 地址在各 DERP 服务器之间相同，说明设备位于[简单 NAT][ar-easy-nat]或[无 NAT][ar-no-nat]之后。

简单 NAT 与无 NAT 很难区分。在设备没有 NAT 的情况下，设备本身拥有的公网 IP 地址与其报告给 STUN 服务器的一致，且端口可预测。在许多场景中，这意味着公共网络接口直接连接在安装了 Tailscale 的客户端上。不过，这并不总是意味着操作系统中能直接看到该 IP 地址。在某些场景（例如 AWS EC2）中，公网 IP 地址并不直接出现在操作系统中，而是直接绑定在主机上。

### 端口映射

`PortMapping` 字段表示当前设备支持哪些端口映射协议。如果设备使用以下任一端口映射协议，通常被视为[**简单 NAT**][ar-easy-nat]。

| **取值** | **含义** |
| -------- | -------- |
| UPnP | 当前设备支持使用 [UPnP][xt-wikipedia-uPNP] 进行端口映射。 |
| NAT-PMP | 当前设备支持使用 [NAT-PMP][xt-wikipedia-NAT-PMP] 进行端口映射。 |
| PCP | 当前设备支持使用 [PCP][xt-wikipedia-PCP] 进行端口映射。 |
| False | 当前设备不支持这三种端口映射服务中的任何一种。 |

如果该值为 false，设备很可能无法使用直连。

UPnP、NAT-PMP 和 PCP 都是让 NAT 之后的设备开放外部端口以协助直连的机制，彼此各不相同。

如果 `PortMapping` 字段为 false，设备就无法在 NAT 设备之后开放外部端口，这会使建立直连变得困难，并很可能形成[硬 NAT][ar-hard-nat]的情况。

如果设备支持这三种端口映射协议中的任何一种，即使 IP 地址在不同 DERP 中继服务器之间不同（即 [`MappingVariesByDestIP`][ar-mapping-varies-by-destination-ip-address] 为 true），它也可能可以使用直连。

[ar-easy-nat]: #简单-nat

[ar-hard-nat]: #硬-nat

[ar-ipv4]: #ipv4

[ar-ipv6]: #ipv6

[ar-mapping-varies-by-destination-ip-address]: #映射因目标-ip-地址而异

[ar-no-nat]: #无-nat

[ar-port-mapping]: #端口映射

[ar-udp]: #udp

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-derp-relay-servers]: /docs/reference/derp-servers

[docs-peer-relays]: /docs/features/peer-relay

[docs-tailnet-ipv6]: /docs/concepts/ipv6

[docs-tailscale-netcheck]: /docs/reference/tailscale-cli#netcheck

[docs-tailscale-status]: /docs/reference/tailscale-cli#status

[docs-tailscaled]: /docs/reference/tailscaled

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-types-of-connections]: /docs/reference/connection-types

[docs-what-is-stun]: /docs/reference/stun-protocol

[xt-rfc-3489-full-cone-nat]: https://www.rfc-editor.org/rfc/rfc3489.html#section-5

[xt-rfc-5128-hairpinning]: https://www.rfc-editor.org/rfc/rfc5128.html#section-5.4

[xt-rfc-4380-ipv6-nat]: https://www.rfc-editor.org/rfc/rfc4380.html

[xt-rfc-3027-nat-complications]: https://www.rfc-editor.org/rfc/rfc3027.html

[xt-wikipedia-NAT-PMP]: https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol

[xt-wikipedia-PCP]: https://en.wikipedia.org/wiki/Port_Control_Protocol

[xt-wikipedia-uPNP]: https://en.wikipedia.org/wiki/Universal_Plug_and_Play
