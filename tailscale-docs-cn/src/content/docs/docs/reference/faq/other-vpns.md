---
title: "可以与其他 VPN 一起使用 Tailscale 吗？"
description: "从理论上讲，可以同时使用 Tailscale 和其他虚拟专用网络（VPN）。默认情况下，Tailscale 只路由你互联网流量中的一小部分（使用 [Tailscale IP 地址][docs-100.x-addresses]）"
---

最后验证于 Jan 12, 2026

从理论上讲，可以同时使用 Tailscale 和其他虚拟专用网络（VPN）。默认情况下，Tailscale 只路由你互联网流量中的一小部分（使用 [Tailscale IP 地址][docs-100.x-addresses]），其余流量留给其他 VPN 处理。然而在大多数情况下，不借助[解决方法][ar-workarounds]就无法让 Tailscale 与其他 VPN 共存。原因通常是激进的防火墙规则、设备限制或 IP 地址冲突。

* **激进防火墙规则**：大多数 VPN 会设置激进的防火墙规则，确保所有网络流量都经过它们。这可能导致另一个 VPN 丢弃所有 Tailscale 流量——而只有 Tailscale 知道如何路由这些流量。不使用激进防火墙规则的 VPN 或许能与 Tailscale 并存。
* **设备限制**：并非所有设备都支持同时使用多个 VPN。例如，iOS 和 Android 强制一次只能运行一个 VPN。因此在这些平台上无法同时启用多个活动的 VPN。
* **IP 地址冲突**：如果另一个 VPN 使用的 IP 地址来自 Tailscale 所用的运营商级 NAT（CGNAT）范围（`100.64.0.0` 到 `100.127.255.255`），它们将与 `100.x.y.z` 的 Tailscale IP 地址冲突。有关 Tailscale IP 编址的更多信息，参阅[保留 IP 地址][docs-reserved-ip-addresses]。

## 解决方法

> **注意：**
>
> 在尝试解决方法之前，先确认 [Mullvad 出口节点（beta）][docs-mullvad-exit-nodes]之类的功能是否已能满足你的需求。

如果你必须让 Tailscale 与另一个 VPN 同时运行并遇到不兼容，也许可以通过[用户态网络][ar-userspace-networking]模式或[分流隧道][ar-split-tunnels]等解决方法化解。

### 用户态网络

Tailscale 可以在内核网络模式或[用户态网络模式][docs-userspace-networking]下运行。在默认的内核网络模式下，Tailscale 会创建网络接口、修改防火墙规则，并为你的设备分配 [Tailscale IP 地址][docs-100.x-addresses]。内核网络模式可能与使用相同地址空间的其他 VPN 冲突。

你可以改为配置 Tailscale 使用用户态网络模式，以绕开与 [Tailscale IP 地址][docs-100.x-addresses]的冲突。在用户态网络模式下，Tailscale 会暴露一个 SOCKS5 代理，让你连出至你的 Tailscale 网络（即 tailnet）。Tailscale 随后把任何入站连接代理到 localhost 地址（`127.0.0.1`）上的相同端口。

> **警告：**
>
> 当 Tailscale 以用户态网络模式运行时，标准 `ping` 命令对 tailnet 目标无效。请改用 [`tailscale ping`][docs-cli-ping]。

### 分流隧道

分流隧道（split tunnel，或称[受限名称服务器][docs-restricted-nameservers]）是一种 DNS 配置，会根据查询目标以不同方式解析 DNS 查询。例如，分流隧道配置可能把针对公共 IP 地址的 DNS 查询发给一个名称服务器，而把针对私有 IP 地址的查询发给另一个。

一些 VPN 提供商允许你使用分流隧道 DNS 配置来绕行特定应用或地址范围的流量。如果另一个 VPN 支持分流隧道 DNS，你可以添加配置，把 Tailscale IP 地址与流量其余部分分开处理。Tailscale IP 地址使用的子网是 `100.64.0.0/10` 和 `fd7a:115c:a1e0::/48`。

如果你的 tailnet 中使用了[子网路由][docs-subnets]，请务必把它们也加入分流隧道配置。

> **警告：**
>
> 分流隧道解决方法对使用[出口节点][docs-exit-nodes]的设备无效。这是因为使用出口节点时，Tailscale 的行为更像传统 VPN，会设置自己的激进防火墙规则，把所有流量路由到你的出口节点。出口节点一次只支持一个 VPN。

[ar-workarounds]: #解决方法

[docs-restricted-nameservers]: /docs/reference/dns-in-tailscale#restricted-nameservers

[ar-userspace-networking]: #用户态网络

[ar-split-tunnels]: #分流隧道

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[docs-userspace-networking]: /docs/concepts/userspace-networking
