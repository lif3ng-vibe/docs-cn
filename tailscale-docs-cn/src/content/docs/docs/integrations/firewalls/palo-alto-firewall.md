---
title: "将 Tailscale 与你的 Palo Alto Networks 防火墙配合使用"
description: "Tailscale 会尝试将你的节点直接点对点连接，而且几乎总能做到。在无法直连时，Tailscale 会使用 [DERP 中继服务器][docs-derp-servers]转发流量。"
---

最后验证于 Sep 30, 2025

## 连接类型

Tailscale 会尝试将你的节点直接点对点连接，而且几乎总能做到。在无法直连时，Tailscale 会使用 [DERP 中继服务器][docs-derp-servers]将流量从一个节点转发到另一个节点。有关中继的更多信息（包括如何判断是否正在使用中继），请参阅[将 Tailscale 与你的防火墙配合使用][docs-firewalls]。

[Palo Alto Networks][xt-paloaltonetworks] 防火墙产品的默认 NAT 转换类型在每次连接中都使用随机源端口，这让寻找直连变得更加困难。涉及使用默认 NAT 类型的 Palo Alto Networks 防火墙的连接，只有在连接的另一端使用可预测的端口号时才能建立直连。

## PAN-OS 11.1.x 及更高版本：Persistent Dynamic IP and Port

> **注意：**
>
> 请参阅 PAN-OS 的首选发布版本列表，以确保稳定性与性能。

PAN-OS 11.1.1 包含用于 NAT 策略的转换类型 [Persistent Dynamic IP and Port][xt-paloalto-pdipp]。在这种转换类型下，一旦客户端用某个特定源端口发送了数据包，同一个 NAT 转换后的端口号就会被用于所有目的地。这使 Tailscale 能够预测端口号并建立直连。

要使用这种转换类型，请前往 **NAT Policy Rule**，选择 **Translated Packet** 标签页，然后将 **Translation Type** 选项选为 **Persistent Dynamic IP and Port**。

*（图：Palo Alto Networks 的 'NAT Policy Rule' 界面。显示 'Translated Packet' 标签页。'Translation Type' 设为 'Persistent Dynamic IP and Port'。）*

### 选择性使用 Persistent Dynamic IP and Port

要将 Persistent Dynamic IP and Port 纳入一组现有的 NAT 策略，把所有连接都改为使用它可能并不合适。可以通过为 UDP 源端口 41641 配置一个服务（Service），让持久转换只针对 Tailscale 的直连流量生效。我们建议将超时时间设置为四分钟，以更贴近直连的空闲超时。

*（图：Palo Alto Networks 新建 'Service' 的界面。'Name' 设为 'Tailscale Direct Connections'。'Summary' 设为 'WireGuard packets sent by Tailscale clients'。'Protocol' 设为 'UDP'。设置了 'Destination Port'。'Source Port' 设为 '41641'。'UDP Timeout' 设为 '240'。）*

该服务会作为匹配条件添加到 **NAT Policy Rule** 的 **Original Packet** 标签页中。

*（图：Palo Alto Networks 的 'NAT Policy Rule' 界面。显示 'Original Packet' 标签页。对于 'Destination Zone'，'Service' 设为先前创建的服务。）*

要使其生效，不得使用[将 Tailscale 与你的防火墙配合使用][docs-firewalls]中介绍的 `randomizeClientPort` 设置。只有使用默认端口 41641 的数据包才会被匹配。

## 更早的 PAN-OS 版本：Static IP

在更早的 PAN-OS 版本与 Dynamic IP and Port 转换类型下，每条 UDP 流都会转换到一个随机的 UDP 端口。打开特定端口无法让流量通过，而且 Tailscale 无法预测直连应尝试哪个端口号。

在更早的 PAN-OS 版本上，可以使用 Static IP NAT 策略，让受保护区域中的一台设备建立直连。你可以选择子网路由器或其他高流量节点进行优化。在 PAN-OS 软件中创建一条 NAT 策略规则，将 **Translation Type** 设为 **Static IP**，而不是默认设置 **Dynamic IP And Port**。这能帮助 Tailscale 找出让数据包穿过 NAT 并建立直连的方法。

*（图：较旧版 Palo Alto Networks 的 'NAT Policy Rule' 界面。显示 'Translated Packet' 标签页。'Transition Type' 设为 'Static IP'。）*

[docs-derp-servers]: /docs/reference/derp-servers

[docs-firewalls]: /docs/integrations/firewalls

[xt-paloalto-pdipp]: https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-new-features/networking-features/persistent-nat-for-dipp

[xt-paloaltonetworks]: https://www.paloaltonetworks.com
