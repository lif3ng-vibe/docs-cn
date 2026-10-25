---
title: "Tailscale 如何分配 IP 地址"
description: "了解 Tailscale 如何基于设备和授权凭证分配稳定的 IP 地址。"
---

最后验证于 Jan 12, 2026

Tailscale 为每个节点（如设备或服务器）提供**稳定的 IP 地址**，让你轻松连接到自己的 Tailscale 网络（即 tailnet）。无论节点在物理世界中移动到哪里，这些地址都保持不变，因此你可以放心共享它们，不必担心地址变化。

默认情况下，每台设备都会获得一个 [`100.x.y.z` 范围][docs-100.x-addresses]内的 IP 地址。该 IP 地址根据设备和授权凭证自动分配。[管理员](/docs/reference/user-roles)之后可以[更改 IP 地址][docs-ip-pool]。

## 查找你的 Tailscale IP 地址

#### Tailscale 管理控制台

使用 Tailscale 管理控制台查看设备的 IP 地址。

你必须是 tailnet 的 [Owner、Admin、Network admin、IT admin、Billing admin 或 Auditor](/docs/reference/user-roles) 才能访问管理控制台。

1. 前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。
2. 找到目标设备对应的行。你可以使用[搜索栏][docs-filter-devices-search-bar]或[筛选器][docs-filter-devices]来查找设备。
3. 在 **Addresses**（地址）列中，选择下拉图标，然后选择设备的 IPv6 地址或 IPv4 地址，将其复制到剪贴板。

#### Linux

在 Tailscale v1.8 及更高版本上，你可以使用 [`tailscale ip`][docs-cli] 命令。使用 `--4` 标志可只返回 IPv4 地址。

```shell
tailscale ip --4
```

在任何版本的 Tailscale 上，你还可以使用系统自带的 `ip` 工具查找 IP 地址：

```shell
ip addr show tailscale0
```

#### Windows

从系统任务栏打开应用菜单，在下拉菜单中查看列出的 IP 地址。

*（图：从 Windows 系统托盘打开 Tailscale 应用菜单，其中 "My address" 和 IP 地址用红色轮廓标出。）*

#### macOS

选择菜单栏中的 Tailscale 图标即可查看 IP 地址。你也可以运行 `ifconfig`，在带有 `100.x.y.z` IP 地址的 `utun` 地址中找到你的 IP 地址。

*（图：从 macOS 菜单栏打开 Tailscale 应用菜单，其中 "This Device" 和 IP 地址用红色轮廓标出。）*

#### iOS

登录到你的网络，查看列表中第一台设备的 IP 地址。你的 iOS 设备总是显示在最上方。

*（图：设备列表，当前 iOS 设备的 IP 地址用红色轮廓标出。）*

#### Android

登录到你的网络，在应用顶部查看列出的 IP 地址。

*（图：设备列表，当前 Android 设备的 IP 地址用红色轮廓标出。）*

## 使用 DNS 将机器名映射到 IP 地址

有关此主题的信息，请参阅 [DNS 在 Tailscale 中的工作原理][docs-dns]。

## 强制更改 IP 地址

只要节点保持注册状态，其 IP 地址就不会改变，除非[管理员](/docs/reference/user-roles)进行更改。

以下情况下，节点重新加入 tailnet 时会获得新的 IP 地址：

* 它被从 tailnet 中移除，即在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中选择 **Remove**（移除）
* IP 范围被重新指定，或使用 [IP pool][docs-ip-pool] 手动更改了单个 IP 地址
* 节点上的 Tailscale 被[重置并重新安装][docs-uninstall]
* 磁盘被清空，节点密钥（node key）丢失

## Tailscale IPv6 本地地址前缀

Tailscale 的 IPv6 地址从 [unique local address][xt-wikipedia-unique-local-address]（唯一本地地址）前缀 `fd7a:115c:a1e0::/48` 中分配。有关 Tailscale 保留的 IPv4 和 IPv6 地址的完整列表，请参阅[保留 IP 地址][docs-reserved-ip-addresses]。

以前，IPv6 地址从 `fd7a:115c:a1e0:ab12::/64` 中分配。

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-cli]: /docs/reference/tailscale-cli

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-ip-pool]: /docs/reference/ip-pool

[docs-uninstall]: /docs/features/client/uninstall

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-wikipedia-unique-local-address]: https://en.wikipedia.org/wiki/Unique_local_address
