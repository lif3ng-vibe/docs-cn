---
title: "连接类型"
description: "了解 Tailscale 如何使用直连或中继连接设备。"
---

最后验证于 Jun 1, 2026

Tailscale 使用三种连接类型在 Tailscale 网络（称为 [tailnet][docs-tailnet]）内[连接设备][docs-connect-to-devices]：

* **直连**（direct connections）：设备通过 UDP 直接互发数据包。
* **DERP 中继连接**：设备经由 [DERP 服务器][docs-derp-servers]发送数据包。
* **Tailscale Peer Relay 连接**：设备经由同一 tailnet 中充当中继的另一台设备发送数据包。

三种方式都通过 [WireGuard][docs-wireguard] 进行端到端[加密][docs-encryption]。它们之间的主要差别是性能而非安全性。直连通常提供最低的延迟和最高的吞吐量，而中继连接是直连无法建立时的回退方案。

## Tailscale 如何建立连接

在典型场景中，tailnet 内的两台设备在协商[彼此之间的连接][docs-device-connectivity]时会遵循一个标准流程。

下面的示例场景展示了连接到同一 tailnet 的两台设备（`device-a` 和 `device-b`）之间的这一事件序列。由于两台设备都已连接到 tailnet，它们各自都有一条到最近 DERP 服务器的连接，以帮助它们协商并建立与其他 tailnet 设备的连接。

1. `device-a` 发起与 `device-b` 的连接。
2. `device-a` 连接到 `device-b` 已在使用的 DERP 服务器。
3. `device-a` 通过 DERP 服务器向 `device-b` 发送连接请求。
4. 两台设备通过各自连接的 DERP 服务器交换直连细节。
   1. `device-a` 发送对直连细节的请求。
   2. `device-b` 以其直连细节作出响应。
5. 两台设备执行 NAT 穿透。它们尝试多种 NAT 穿透策略，在彼此之间建立直连的 UDP 隧道。
   1. 如果 NAT 穿透成功，`device-a` 与 `device-b` 建立直连（点对点）连接。它们无需再经第三方设备（如 DERP 服务器或对等中继服务器）中继数据包。
   2. 如果无法建立直连，两台设备会尝试使用 Tailscale Peer Relay 服务器连接。为此，tailnet 必须至少有一台 `device-a` 和 `device-b` 都能访问的对等中继设备。
   3. 如果没有可用的对等中继，两台设备将保持经由 DERP 服务器在彼此之间中继数据包的连接。
6. Tailscale 会定期重新检查是否可以建立直连或对等中继连接。

所有连接起初都经由 DERP 服务器中继，随后 Tailscale 会尝试将其升级为直连。如果失败，Tailscale 会尝试通过对等中继建立连接。如果仍然失败，连接就继续保持经由 DERP 服务器中继。

## 直连

直连是两台 tailnet 设备之间的点对点连接，设备可以通过 UDP 直接互发数据包。在大多数情况下，直连优于中继连接，因为它提供更高的吞吐量和更低的延迟。

Tailscale 能否建立直连，取决于它的 [NAT 穿透逻辑][bl-how-nat-traversal-works]以及设备的网络配置。在大多数环境中，Tailscale 都能成功建立直连，但某些网络配置（硬 NAT）会阻止直连，迫使 Tailscale 改用中继连接。

## 中继连接

中继连接是两台设备之间经由中间主机中继、而非在设备之间直接建立的连接。Tailscale 使用两种中继连接：

* DERP 中继连接：使用 Tailscale 的 DERP 服务器作为中继。
* Tailscale Peer Relay 连接：使用同一 tailnet 中的另一台设备作为中继。

### DERP 连接

Tailscale 运营着遍布全球的 [DERP 服务器][docs-derp-servers]集群。这些服务器主要用于：

* 帮助设备相互发现并协商连接细节。
* 协助在连接类型之间切换（例如从中继切换为直连）。
* 在无法直连时提供回退连接。

任何能对任意主机发起 HTTPS 连接的设备，都可以使用 DERP 中继建立隧道。DERP 服务器可靠，但服务质量（[QoS][xt-fortinet-docs-qos]）特性有限，因此通常比直连慢，且最大吞吐量可能更低。

正因如此，在可以直连的情况下却使用中继连接，是造成[性能问题][docs-troubleshoot-connectivity]的最常见原因之一。

### 对等中继连接

当两台设备之间无法直连时，对等中继连接使用 [Tailscale Peer Relay][docs-peer-relays]，让流量经由同一 tailnet 中的另一台设备中继。

对等中继连接通常比 DERP 连接更快，因为它避免了流量绕行地理位置遥远的 DERP 服务器所带来的额外延迟。不过，由于流量必须多经过一跳，它的延迟仍高于完全直连。

## 判断你的连接类型

你可以在设备间通信后，通过查看 [`tailscale status`][docs-cli-status] 或 [`tailscale ping`][docs-cli-ping] 的输出，判断当前使用的是哪种连接类型。

### 使用 `tailscale status`

运行 [`tailscale status`][docs-cli-status]，查看对端设备的连接信息。

* 如果输出包含 "`direct`"，则连接为直连。
* 如果输出包含 "`relay`"，则连接经由 DERP 服务器中继。
* 如果输出包含 "`peer-relay`"，则连接经由对等中继设备中继。

以下输出是直连的示例：

```
100.113.160.82 device-a tagged-devices linux active; offers exit node; direct 140.82.13.138:41641
```

以下输出是经由 DERP 服务器中继连接的示例：

```
100.104.93.78 localhost-0 user@ android active; relay "tor"
```

### 使用 `tailscale ping`

你也可以使用 [`tailscale ping`][docs-cli-ping] 判断能否从当前设备直连 tailnet 中的另一台设备。

#### 直连示例

以下输出展示 `your-device` 直连 `another-device` 的示例：

```
> user@your-device:~$ tailscale ping another-device
pong from another-device (100.113.160.82) via DERP(nyc) in 130ms
pong from another-device (100.113.160.82) via DERP(nyc) in 37ms
pong from another-device (100.113.160.82) via DERP(nyc) in 50ms
pong from another-device (100.113.160.82) via DERP(nyc) in 38ms
pong from another-device (100.113.160.82) via 140.82.13.138:41641 in 35ms
```

这里，前几个数据包经由最近的 DERP 服务器发送，同时 Tailscale 在协商直连。直连建立后，后续数据包直接发往目标。

#### 对等中继连接示例

以下输出展示 `your-device` 经对等中继服务器连接 `another-device` 的示例：

```
> user@your-device:~$ tailscale ping another-device
pong from another-device (100.97.143.93) via DERP(lax) in 40ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 4ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 5ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 3ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 4ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 5ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 4ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 4ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 3ms
pong from another-device (100.97.143.93) via peer-relay(192.168.64.2:7777:vni:1) in 4ms
direct connection not established
```

#### DERP 中继连接示例

以下输出展示 `your-device` 以 DERP 服务器为中继连接 `another-device` 的示例：

```
> user@your-device:~$ tailscale ping another-device
pong from another-device (100.104.93.78) via DERP(tor) in 53ms
pong from another-device (100.104.93.78) via DERP(tor) in 196ms
pong from another-device (100.104.93.78) via DERP(tor) in 50ms
pong from another-device (100.104.93.78) via DERP(tor) in 214ms
pong from another-device (100.104.93.78) via DERP(tor) in 273ms
pong from another-device (100.104.93.78) via DERP(tor) in 274ms
pong from another-device (100.104.93.78) via DERP(tor) in 282ms
pong from another-device (100.104.93.78) via DERP(tor) in 273ms
pong from another-device (100.104.93.78) via DERP(tor) in 76ms
pong from another-device (100.104.93.78) via DERP(tor) in 152ms
direct connection not established
```

## 为什么 Tailscale 并不总能使用直连

Tailscale 并不总能在设备之间建立直连。而且当网络状况变化、直连不再可行时，现有直连也可能回退为中继连接。阻止直连的最常见情形包括 UDP 数据包被阻断以及硬 NAT 场景。

### UDP 数据包被阻断

要建立直连，设备必须能够收发 UDP 数据包。如果网络中的某些因素阻断了直接的 UDP 连接，设备便无法建立直连，但仍可使用 [Tailscale Peer Relay 服务器][docs-peer-relays]或 DERP 服务器进行中继连接。

在这种情况下，若要避免中继连接，请与你的网络或服务提供商合作，放行出站及返回的 UDP 流量。

### 硬 NAT

[硬 NAT][docs-hard-nat] 场景会让直连变得困难，有时甚至不可能。硬 NAT 指设备位于具有两个破坏点对点连接特性的网关之后的网络场景：每个出站连接都有各自的端口映射，且只接受来自该特定目的地的应答；每个连接使用不同的外部端口，外部设备无法预测。如果两台设备都位于硬 NAT 之后，Tailscale 就无法建立直连。

不过，即使设备位于硬 NAT 之后，你仍可以采取措施提高建立直连的可能性。

#### 家庭与小型办公网络

许多路由器上都有可以调整的设置，让直连更容易实现。例如，你可以在路由器上启用 NAT-PMP 或 UPnP 端口映射，给 Tailscale 提供更可预测、可达的端口。这有助于静态端口映射保持端口号可预测。可预测的端口号让 Tailscale 更容易可靠地穿过防火墙建立直连。

默认情况下，只要在设备的公网 IP 上开放 UDP 端口 `41641`，就能尽可能保证来自任何对端设备的直连。你可以通过向 [`tailscaled`][docs-tailscaled] 传入 `--port=<number>` 来更改该端口号。在 Linux 上，可以在 `/etc/defaults/tailscaled` 中设置。

#### 云平台与 NAT 网关

许多云平台（例如 [AWS][docs-aws-reference-architecture]）使用的 NAT 网关行为可能类似硬 NAT。当设备位于这些网关之后时，往往只能建立中继连接。

要提高直连的可能性，你可以：

* 为你的 Tailscale 设备暴露公网 IP 地址（动态或静态）。
* 确保 UDP 端口 `41641` 未被阻断。

如果无法进行这些更改，你可以架设一台 [Tailscale Peer Relay][docs-peer-relays] 服务器来中继设备之间的通信。对等中继服务器通常比 DERP 服务器更快，并且运行在你自己的基础设施内（因此无需穿越网关或将流量传出外网）。

#### 出口节点与 Terraform

对于[出口节点][docs-exit-nodes]这类刻意经 NAT 网关出站的设备，你可以使用 Tailscale 的 Terraform 模板来：

* 让入站流量经由公共接口路由。
* 让出站流量经由 NAT 网关路由。

如需协助部署此方案，请通过 `se@tailscale.com` 联系 Tailscale 解决方案工程团队。这样出站流量就能拥有可预测的公网 IP 地址，而入站流量则与出口节点建立直连。这一模式同样适用于其他 Tailscale 连接器，包括子网路由器和应用连接器。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-aws-reference-architecture]: /docs/reference/reference-architectures/aws

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-connect-to-devices]: /docs/how-to/connect-to-devices

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-hard-nat]: /docs/reference/device-connectivity#硬-nat

[docs-peer-relays]: /docs/features/peer-relay

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscaled]: /docs/reference/tailscaled

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-wireguard]: /docs/concepts/wireguard

[xt-fortinet-docs-qos]: https://www.fortinet.com/resources/cyberglossary/qos-quality-of-service
