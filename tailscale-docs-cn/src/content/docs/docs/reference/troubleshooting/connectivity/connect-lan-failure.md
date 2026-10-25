---
title: "无法连接到局域网"
description: "按照以下说明排查无法连接到局域网（LAN）中另一设备的原因。"
---

最后验证于 Nov 14, 2025

按照以下说明排查无法连接到局域网（LAN）中另一设备的原因。

1. **确保没有传统网络问题干扰本地连接**。

   同一局域网内的设备无法互连的原因有很多。例如，防火墙规则、IP 地址冲突、网络配置错误以及 DHCP 错误都可能阻止局域网设备之间的连接。

   要单独测试本地连接，请先断开 Tailscale 连接，然后再次尝试连接局域网设备。

2. **检查能否使用设备的 [Tailscale IP 地址][docs-tailscale-ip-addresses]进行连接（而非其私有 IP 地址）**。

   如果设备运行了 Tailscale，并且你有一个通告局域网网段的[子网路由器（subnet router）][docs-subnets]，那么你的设备与其他局域网设备之间就有两条路径可以互通。Tailscale 通常会配置路由表以优先使用子网路由器（如果启用了接受子网路由）。

   Tailscale 客户端会丢弃源 IP 地址出乎意料的数据包（在本例中，即设备的局域网 IP 地址，而非设备的 [Tailscale IP 地址][docs-tailscale-ip-addresses]）。如果子网路由器运行 Linux 且禁用了 SNAT（其他操作系统上无法禁用），就可能导致这种情况：你的设备发起的连接尝试成功到达了局域网设备，但对方无法作出响应。

   如果你不希望某台设备使用子网路由，可以在 [`tailscale up`][docs-cli-up] 或 [`tailscale set`][docs-cli-set] 命令中传入 `--accept-routes=false` 来禁用，或者在 Tailscale 客户端中关闭 subnets 选项（如果适用）。

   更多信息请参阅[子网路由重叠时的局域网流量优先级][docs-troubleshooting-lan-priority]。

3. **确保设备没有使用会阻止其连接本地设备的出口节点配置**。

   如果设备使用了[出口节点（exit node）][docs-exit-nodes]，它可能无法访问局域网设备的私有 IP，因为在使用出口节点时局域网默认被视为不受信任。你可以通过以下任一方法解决：

   1. 在 [`tailscale up`][docs-cli-up] 或 [`tailscale set`][docs-cli-set] 命令中传入 `--exit-node-allow-lan-access=true`。
   2. 在 Tailscale 客户端中启用 **Exit Node LAN access** 选项（如果适用）。这样设备就可以直接发送局域网连接。

   > **警告：**
   >
   > 只有在你信任本地网络时才启用局域网访问。例如，你可能信任家庭网络，但不会信任咖啡店的公共 Wi-Fi。

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-up]: /docs/reference/tailscale-cli/up

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-troubleshooting-lan-priority]: /docs/reference/troubleshooting/network-configuration/lan-traffic-overlapping-subnets
