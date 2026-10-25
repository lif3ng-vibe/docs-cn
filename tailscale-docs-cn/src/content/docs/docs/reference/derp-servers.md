---
title: "DERP 服务器"
description: "Tailscale 使用 Designated Encrypted Relay for Packets（DERP）服务器为 tailnet 提供安全、低延迟的连接。自定义选项让你可以优化设备通信与 NAT 穿透。"
---

最后验证于 Jan 21, 2026

[DERP（Designated Encrypted Relay for Packets）服务器][bl-how-tailscale-derp]负责管理设备连接和 [NAT 穿透][bl-how-nat-traversal-works]。它们有两个主要用途：

1. 协商并建立 tailnet 设备之间的连接（直连或中继）。
2. 作为[无法直连][docs-device-connectivity]且没有可用的[对等中继服务器][docs-peer-relays]时的回退选项。

tailnet 设备之间的连接大多数只用 DERP 服务器来建立与另一台 tailnet 设备的直连。但作为最后的手段，当硬 NAT、防火墙或其他原因导致其他连接类型都无法使用时，设备可以通过 DERP 服务器中继来通信。DERP 服务器是双栈的，即同时支持 IPv4 和 [IPv6][docs-ipv6]。因此，它们可以促成仅 IPv4 设备与仅 IPv6 设备之间的连接。

## 使用 DERP 服务器的中继连接

DERP 中继连接是 Tailscale 两种中继连接之一。另一种是[对等中继连接][docs-peer-relays]。对等中继连接使用你的 Tailscale 网络（即 tailnet）中的其他设备而非 DERP 服务器来中继流量。

当[直连][docs-connection-types]无法建立时，Tailscale 会先尝试使用 tailnet 中任何可用的对等中继；如果没有可用的对等中继，再回退到 DERP 服务器。对等中继需要先架设才能使用；更多信息请参阅 [Tailscale Peer Relay][docs-peer-relays]。

对于经 DERP 中继连接传输的所有数据，Tailscale 都使用 [WireGuard][docs-wireguard] 进行[加密][docs-encryption]。由于 Tailscale 私钥从不离开生成它的本地设备，DERP 服务器不可能解密你的流量。DERP 服务器只是把已加密的流量从一台设备原样转发到另一台设备。

## DERP 服务器位置

Tailscale 在多个地理区域都部署了 DERP 服务器，以实现[高可用][docs-high-availability]与低延迟。大多数区域至少有三台 DERP 服务器。

每个 Tailscale 客户端都会从 Tailscale [协调服务器][docs-control-data-planes]接收一份 [DERP 地图](https://login.tailscale.com/derpmap/default)。这份地图描述了客户端可用的所有 DERP 服务器。客户端根据延迟信息选择一台*归属 DERP 服务器（home DERP server）*，并把选择上报给协调服务器。随后，协调服务器会把每个客户端的选择共享给 tailnet 中的其他客户端。

Tailscale 在以下位置运行 DERP 服务器：

* 澳大利亚（悉尼）
* 巴西（圣保罗）
* 加拿大（多伦多）
* 芬兰（赫尔辛基）
* 法国（巴黎）
* 德国（法兰克福、纽伦堡）
* 中国香港（香港）
* 印度（班加罗尔）
* 日本（东京）
* 肯尼亚（内罗毕）
* 荷兰（阿姆斯特丹）
* 波兰（华沙）
* 新加坡（新加坡）
* 南非（约翰内斯堡）
* 西班牙（马德里）
* 阿联酋（迪拜）
* 英国（伦敦）
* 美国（阿什本、芝加哥、达拉斯、丹佛、檀香山、洛杉矶、迈阿密、纽约市、旧金山和西雅图）

Tailscale 客户端会自动选择最近的中继以获得低延迟。Tailscale 会持续扩容，并按需增加更多 DERP 服务器来提供低延迟连接。

在支持 [Tailscale CLI][docs-cli] 的客户端上，你可以使用 [`tailscale netcheck`][docs-cli-netcheck] 命令获取适用于你的 Tailscale 设备的 DERP 服务器列表。

### 自定义 DERP 服务器

在大多数情况下，无需运行[自定义 DERP 服务器][docs-custom-derp-servers]。DERP 服务器只是充当 tailnet 中设备之间的连接纽带（对设备间交换的数据不可见）。

如果你经常遇到 DERP 中继连接且它们满足不了你的性能要求，通常更好的做法是架设[对等中继][docs-peer-relays]而不是自定义 DERP 服务器。对等中继：

* 在你自己的网络或基础设施内运行，比 DERP 服务器延迟更低、性能更好。
* 不产生经 DERP 服务器出站数据传输的额外费用（针对云环境）。
* 免去维护自定义 DERP 服务器的开销与限制。

尽管如此，在少数情况下运行自定义 DERP 服务器可能仍有意义。为此，你需要构建、部署并更新 [`cmd/derper`][xt-github-derper] 二进制文件。更多信息请参阅[自定义 DERP 服务器][docs-custom-derp-servers]文档。

> **警告：**
>
> 运行你自己的 DERP 服务器是一项高级操作，需要你投入大量资源来搭建和维护。此外，运行自定义 DERP 服务器还有以下注意事项：
>
> * 自定义 DERP 服务器不支持设备共享或其他跨 tailnet 功能。
> * 自定义 DERP 服务器与普通 DERP 服务器一样，对设备间交换的数据不可见，因为数据是加密的。因此，DERP 服务器对网络级调试没有帮助。
> * 自定义 DERP 服务器无法受益于 Tailscale 控制平面的某些优化。

### 自定义你的 DERP 地图

你可以自定义 Tailscale 为你的 tailnet 使用的 DERP 地图。做法是向 tailnet 策略文件添加一个 `derpMap` 对象。在 `derpMap` 对象中，你可以将某个 DERP 区域的 `RegionID` 设为 `null` 来显式停用该区域。例如，要停用纽约 DERP 区域（其 `RegionID:1`）的 DERP 服务器，请在 tailnet 策略文件中添加以下内容。

```json
{
  // ... other parts of the tailnet policy file
  "derpMap": {
    "regions": {
      "1": null,
    },
  },
}
```

如果你不知道某个 DERP 区域的 `RegionID`，可以从 `https://controlplane.tailscale.com/derpmap/default` 获取包含区域 ID 的官方 Tailscale DERP 地图。你可以在网页浏览器中访问该 URL，或使用 `curl` 命令。

```shell
curl https://controlplane.tailscale.com/derpmap/default
```

如果你安装了 [`jq`][xt-jq]，可以使用以下命令列出 Tailscale 的默认 DERP 区域及其 ID：

```shell
curl --silent https://controlplane.tailscale.com/derpmap/default | jq -r '.Regions[] | "\(.RegionID) \(.RegionName)"'
```

> **提示：**
>
> 出于合规目的需要将 tailnet 限制为仅使用美国 DERP 服务器的，请联系 Tailscale 销售团队。

## DERP 数据包

DERP 服务器中继两类数据包：DISCO 数据包和加密的 WireGuard 数据包。Tailscale DERP 服务器主要使用 DISCO 协议在两台 tailnet 设备建立直连之前，向 tailnet 设备发送发现消息（DISCO 数据包）。而当两台设备把 DERP 服务器用作回退连接方式时，DERP 服务器则在两台设备之间中继加密的 WireGuard 数据包。

## 可用性与停机

Tailscale 协调服务器为每个客户端维护一份 DERP 地图，并在地图变化时将更新推送给每个客户端。Tailscale 客户端会在本地保存这份可用 DERP 服务器列表。这样，即使[协调服务器宕机][docs-what-happens-if-the-coordination-server-is-down]而 DERP 服务器仍在运行，Tailscale 客户端也仍保有最近已知的 DERP 服务器状态，并能继续连接它们。即使 Tailscale 客户端重启，这份 DERP 服务器列表也会保留。

当 DERP 服务器（或区域）发生中断时，会出现以下情况：

* 如果协调服务器宕机期间新增了一台 DERP 服务器，它不会作为选项通告给 Tailscale 客户端，而会在 Tailscale 客户端下次连接协调服务器时加入。
* 如果某个区域中的一台 DERP 服务器不可达，Tailscale 客户端会选择该区域中的另一台 DERP 服务器。
* 如果整个 DERP 区域不可达，Tailscale 客户端会选择次近的区域。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-derp]: https://tailscale.com/blog/how-tailscale-works#encrypted-tcp-relays-derp

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-netcheck]: /docs/reference/tailscale-cli#netcheck

[docs-connection-types]: /docs/reference/connection-types

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-custom-derp-servers]: /docs/reference/derp-servers/custom-derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-ipv6]: /docs/concepts/ipv6

[docs-peer-relays]: /docs/features/peer-relay

[docs-what-happens-if-the-coordination-server-is-down]: /docs/reference/coordination-server-down

[docs-wireguard]: /docs/concepts/wireguard

[xt-github-derper]: https://github.com/tailscale/tailscale/blob/main/cmd/derper/README.md

[xt-jq]: https://jqlang.github.io/jq/
