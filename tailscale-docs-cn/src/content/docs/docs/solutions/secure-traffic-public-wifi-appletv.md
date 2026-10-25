---
title: "使用 Apple TV 保护公共 Wi-Fi 上的互联网流量"
description: "把 Tailscale 流量经由你的 Apple TV 路由，实现安全私密的浏览，并访问受地区限制的内容。"
---

最后验证于 Dec 15, 2025

当你在酒店、机场或咖啡馆等场所连接公共 Wi-Fi 时，你的互联网活动会暴露给同一公共网络上的其他人。当你查看电子邮件、登录银行账户、使用云服务或进行任何涉及个人信息的活动时，这种暴露会让你的隐私面临风险。

把你的互联网流量经由 Apple TV 路由，就能保护这些活动。你的设备会与 Apple TV 建立安全加密的连接，Apple TV 再用你的家庭网络把流量发送到互联网。这一过程让你的浏览保持私密，即使你正使用陌生或不安全的网络。我们也把这种流量路由方式称为[出口节点][docs-exit-nodes]。

除了提升隐私，经由 Apple TV 路由流量还有助于基于位置的访问。某些网站和流媒体平台只允许来自你所在国家或地区的连接。通过 Apple TV 发送流量，这些服务会把它识别为来自你的家庭网络，从而可能解锁受地区限制的内容。

使用 Apple TV 路由 Tailscale 网络（称为 tailnet）流量的好处包括：

* 使用你可能已经拥有的设备，无需额外硬件或网络配置。
* Apple TV 通常始终开机并连接家庭互联网，是你外出时可靠的流量路由选择。
* Tailscale 的 Personal 套餐免费，支持最多 6 个用户、不限数量的用户设备和 50 台打了标签的设备。
* Apple TV 版 Tailscale 应用免费，可在 Apple App Store 获取。

## 前提条件

要跟着本指南操作，你需要：

* 一台用于登录并创建 tailnet 的设备（例如手机或笔记本电脑）。Tailscale 可运行于大多数操作系统，包括 Linux、Windows、macOS、iOS 和 Android。
* 一个使用[单点登录（SSO）身份提供方][docs-sso-providers]（例如 Apple、Google 或 Microsoft）的电子邮件账户。
* 一台运行 tvOS 17 或更高版本的 Apple TV HD 或 Apple TV 4K。

## 第 1 步：创建你的 tailnet

要创建自己的 tailnet，在一台设备（例如手机或笔记本电脑）上[下载][co-download]并安装客户端，然后使用你现有的身份提供方登录。选择 **Personal**（个人）选项，并按照剩余提示完成流程。此时你的个人 tailnet 已配置完毕，可以使用了。

*（图：选择创建 tailnet 的使用场景。）*

接着前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认设备已连接到你的 tailnet。管理控制台是你可以管理 tailnet 用户、设备和权限的地方。

*（图：选择创建 tailnet 的使用场景。）*

接下来，你将在 Apple TV 上配置 Tailscale。

## 第 2 步：在 Apple TV 上安装并配置 Tailscale 以路由流量

要在 Apple TV 上安装 Tailscale，打开 App Store，搜索 Tailscale 应用并下载。安装后打开应用，按照提示操作并授予所有请求的权限。

启动应用并选择 **Connect**（连接），把 Apple TV 加入你的 tailnet。屏幕上会出现一个二维码。你可以用手机扫描它，或在另一台设备的浏览器中输入提供的 URL。这一步会让你登录，并授权 Apple TV 加入你的 tailnet。要确认连接，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在设备列表中找到 Apple TV。

现在打开 Apple TV 上的 Tailscale 应用，进入 **Exit Node**（出口节点）部分。选择 **Run as Exit Node**（作为出口节点运行）。然后，在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中找到列表里的 Apple TV，选择按钮，选择 **Set up exit node**（设置出口节点），并把 **Use as exit node**（用作出口节点）开关打开以启用它。tailnet 中的其他设备现在可以把流量路由经过你的 Apple TV 了。

tailnet 中的设备会通过设备密钥过期机制定期重新认证以保障安全，即在设定的期限过后要求重新认证。对于应当持续保持连接的设备（例如服务器、Raspberry Pi、媒体中心、智能家居中枢、Docker 主机和 NAS 设备），你可以禁用密钥过期，避免不必要的中断。

要禁用某台设备的密钥过期，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择该设备旁边的图标，然后选择 **Disable key expiry**（禁用密钥过期）。

> **警告：**
>
> 禁用密钥过期会降低安全性，如果设备或密钥遭到入侵，可能会暴露你的网络。只对受信任的设备这样做，并且在设备丢失或更换时立即撤销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

接下来，你将配置各设备使用 Apple TV 路由流量。

## 第 3 步：配置设备使用 Apple TV 路由流量

要把某台设备配置为经由你的 Apple TV 路由流量，打开该设备上的 Tailscale 应用，进入 **Exit Nodes**（出口节点）部分，选择那台 Apple TV。启用出口节点的方法因设备操作系统而异。

#### Android

1. 在 Android 设备上打开 Tailscale 应用，进入 **Exit Node**（出口节点）部分。
2. 选择你想使用的出口节点。如果你希望在流量经由出口节点路由时仍可直接访问本地网络，请打开 **Allow LAN access**（允许访问局域网）。
3. 在应用主屏幕上，确认所选设备显示在 **Exit Node** 部分中。当出口节点正在被该设备使用时，该部分会变为蓝色。

要让设备停止使用出口节点，前往 **Exit Node** 部分并选择 **None**（无）。

#### iOS

你可以从屏幕顶部使用出口节点。

选择你想使用的出口节点。要停止使用出口节点，禁用当前使用的那个，或在 **Exit Node** 列表中选择 **None**。

#### Linux

运行 `tailscale set` 并带上 `--exit-node=` 标志，传入出口节点的 [Tailscale IP 地址][docs-tailscale-ip-addresses]。

```shell
sudo tailscale set --exit-node=<exit-node-ip>
```

你可以在管理控制台中找到该设备的 IP 地址，也可以运行 `tailscale status` 查看。

或者，把 `--exit-node-allow-lan-access` 设为 `true`，在流量经由出口节点路由时允许直接访问本地网络。

```shell
sudo tailscale set --exit-node=<exit-node-ip> --exit-node-allow-lan-access=true
```

要停止使用出口节点，运行 `--exit-node` 标志但不传入 IP 地址。

```shell
sudo tailscale set --exit-node=
```

#### macOS

你可以从菜单栏使用出口节点。打开 Tailscale 菜单并选择 **Exit Nodes**（出口节点）。（如果你运行的 Tailscale 客户端版本早于 **v1.60.0**，要选择的菜单项是 **Use exit node**。）然后，选择要使用的出口节点的机器名。

要在流量经由出口节点路由时允许直接访问本地网络，请选择 **Allow Local Network Access**（允许访问本地网络）。

#### tvOS

要让你的 Apple TV 使用 tailnet 中的另一台设备作为出口节点，请参阅[在 Apple TV 上安装 Tailscale][docs-appletv-use-exit-node]。

#### Windows

你可以从系统托盘菜单使用出口节点。选择 Tailscale 图标并选择 **Use exit node**（使用出口节点）。然后，选择要使用的出口节点的机器名。

如果你希望在流量经由出口节点路由时允许直接访问本地网络，请选择 **Allow local network access**（允许访问本地网络）。

现在，该设备的互联网流量将安全地经由 Apple TV 的网络连接路由。

## 结语

在本指南中，你把 Apple TV 配置为 tailnet 的安全路由点。这一设置为你提供了一种随时可用的流量保护方式，无论你连着公共 Wi-Fi、身在旅途还是远程办公。通过家庭网络发送流量，你保持了一条受信任的连接，并能访问特定地区的内容。

## 进一步探索

* 向你的 tailnet[添加更多设备][docs-device-add]。
* [邀请其他用户][docs-invite-any-user]加入你的 tailnet，让他们路由自己设备的流量。
* 在 iOS 和 macOS 设备上配置 [VPN On Demand][docs-vpn-on-demand]，在你离开家时自动启用经由 Apple TV 的流量路由。
* 在 iOS 和 macOS 设备上配置[快捷指令][docs-shortcuts]，一键启用或禁用经由 Apple TV 的路由。
* 将你的 Apple TV 配置为[子网路由器][docs-appletv-subnet]，让你能远程访问未安装 Tailscale 的家庭网络设备，例如打印机或智能家居设备。
* 更多信息和故障排除技巧，请参阅[在 Apple TV 上安装 Tailscale][docs-apple-tv]。

[co-download]: https://tailscale.com/download

[docs-apple-tv]: /docs/install/appletv

[docs-appletv-subnet]: /docs/install/appletv#将-apple-tv-宣告为子网路由器

[docs-appletv-use-exit-node]: /docs/install/appletv#使用设备出口节点

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-shortcuts]: /docs/features/mac-ios-shortcuts#出口节点

[docs-sso-providers]: /docs/integrations/identity

[docs-tailscale-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-vpn-on-demand]: /docs/features/client/ios-vpn-on-demand
