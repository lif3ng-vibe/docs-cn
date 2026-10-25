---
title: "使用 Raspberry Pi 从任何地方拦截所有设备上的广告"
description: "用 Raspberry Pi 搭配 Pi-hole 拦截广告，以经济高效的方式提升隐私、安全性和浏览性能。"
---

最后验证于 Dec 15, 2025

在线广告会拖慢浏览速度、损害隐私并带来安全风险。它们可能在未经同意的情况下跟踪你的活动、携带恶意代码，而且许多广告凭借大图片、动画和视频消耗额外的流量和电量。广告还会以弹窗和自动播放内容打断你的体验。拦截广告有助于阻止跟踪器、加快浏览速度、节省流量，并让网站更清爽、更易用。

拦截网络内设备广告的一种方法，是在 Raspberry Pi 设备上安装 [Pi-hole][xt-pi-hole] 软件。Pi-hole 充当你网络的 DNS 服务器，在发往广告和跟踪服务器的请求到达设备之前将其过滤，从而为整个网络提供防护，设备本身无需安装额外软件。

将 Pi-hole 与 Tailscale 结合，可以把同样的防护扩展到家庭网络之外。Tailscale 创建一个安全私密的网络，让你在任何地方都能远程使用 Pi-hole DNS 服务器，无论在家中、连着公共 Wi-Fi 还是旅途中，都能获得一致的广告拦截与隐私保护。

使用 Raspberry Pi 和 Pi-hole 搭配 Tailscale 网络（称为 tailnet）拦截广告的好处包括：

* 无论在家还是在外，你的设备都能拦截广告。
* Raspberry Pi 是经济实惠的硬件方案。
* Raspberry Pi 功耗极低，可以一直开机并保持连接。
* Pi-hole 是免费的开源软件。
* Tailscale 的 Personal 套餐免费，支持最多 6 个用户、不限数量的用户设备和 50 台打了标签的设备。

> **提示：**
>
> 本文介绍的是如何将 Pi-hole 配置为 tailnet 中拦截广告的 DNS 服务器；你也可以将路由器的 DNS 设置指向 Raspberry Pi，让整个网络都使用 Pi-hole 广告拦截。

## 前提条件

要跟着本指南操作，你需要：

* 一台用于登录并创建 tailnet 的设备（例如手机或笔记本电脑）。Tailscale 可运行于大多数操作系统，包括 Linux、Windows、macOS、iOS 和 Android。
* 一个使用[单点登录（SSO）身份提供方][docs-sso-providers]（例如 Apple、Google 或 Microsoft）的电子邮件账户。
* 一台 Raspberry Pi Model B 或更新型号，至少有 2 GB 可用空间和 512 MB 内存。
* 你的 Raspberry Pi 上已安装 Raspberry Pi OS（最新版本）。
* 能访问 Raspberry Pi OS 的命令行界面（CLI）。如果你想使用 Raspberry Pi OS 桌面，可以使用 Terminal 应用。如果你想从网络中的另一台计算机访问 Raspberry Pi，则需要通过计算机上的终端客户端或命令提示符访问 CLI。

## 第 1 步：安装并配置 Pi-hole

要从 Raspberry Pi OS 桌面直接安装 Pi-hole，打开 Terminal 应用。如果你想从网络中的另一台计算机访问 Raspberry Pi，可以通过终端客户端或命令提示符执行 `ssh <username>@<ip-address>` 命令来访问 CLI，其中 `<username>` 是用户名，`<ip-address>` 是 Raspberry Pi 的本地 IP 地址。

确保你的 Raspberry Pi 软件包是最新的：

```shell
sudo apt update
sudo apt upgrade -y
```

现在下载并安装 Pi-hole：

```shell
curl -sSL https://install.pi-hole.net | bash
```

> **警告：**
>
> 攻击者可以滥用 `curl` 配合 `| bash` 的方式。安装前请先审阅此脚本包含的代码。你可以用网页浏览器访问 `https://install.pi-hole.net` URL 来查看。你也可以改用[其他方法][xt-pi-hole-install]安装 Pi-hole。

终端会话中会显示一个安装器，你可以在其中配置 Pi-hole 的基本设置。完成 Pi-hole 的初始设置，并进入 Pi-hole 的网页管理界面。

* 选择 **OK**（确定）继续。
* 在 **Static IP Address**（静态 IP 地址）部分，选择 **Yes**（是）以沿用 Raspberry Pi 当前的 IP 地址，然后选择 **Continue**（继续）。这能确保 Raspberry Pi 始终使用同一地址，设备可以稳定可靠地访问 Pi-hole DNS 服务器。你也可以选择 **Skip**（跳过），然后在路由器的 DHCP 设置中为 Raspberry Pi 配置静态 IP 地址。
* 在 **Select Upstream DNS Provider**（选择上游 DNS 提供方）部分，选择一个常见 DNS 提供方，然后选择 **OK**。Pi-hole 只拦截其设置中已配置站点列表里的广告。如果 Pi-hole 无法识别某个站点，就会把请求转发给你在此处指定的 DNS 服务器。
* 在 **Blocklists**（拦截列表）部分，选择 **Yes** 以使用 [Steven Black unified host list][xt-github-stevenblack]。这是一个由社区维护的可靠拦截列表，将众多广告、跟踪器和恶意软件列表合并为一份单一列表，提供广泛防护。
* 在 **Web Admin Interface**（网页管理界面）部分，选择 **Yes** 安装这个让你管理所有 Pi-hole 设置的图形界面。
* 在 **Web Server**（网页服务器）部分，选择 **Yes**，因为使用网页管理界面必须有它。
* 在 **Enable Query Logging**（启用查询日志）部分，选择是否让 Pi-hole 记录你的设备发出的每一条 DNS 请求。你可以利用这些信息调整 Pi-hole 设置，以满足自己的需求。
* 在 **Select a privacy mode for FTL**（为 FTL 选择隐私模式）部分，选择 Pi-hole 日志收集的详细程度，然后选择 **Continue**（继续）。安装器会返回命令行。

在访问 Pi-hole 网页管理界面之前，先把 Pi-hole 密码从默认值（空白）改掉。

如果你使用的是 Pi-hole v6，使用以下命令，然后输入并再次输入你的新密码：

```shell
pihole setpassword
```

> **注意：**
>
> 如果你使用的是 Pi-hole v5，请使用以下命令，然后输入并再次输入你的新密码：
>
> ```shell
> pihole -a -p
> ```

初始设置完成后，前往 `http://<raspberry-pi>/admin`（其中 `<raspberry-pi>` 是 Raspberry Pi 的 IP 地址），并输入新密码。

设备连接到 tailnet 时，除了原有的本地 IP 地址（例如 `eth0` 接口上的 `192.168.x.x`），还会在 `tailscale0` 接口上分配到一个 `100.x.x.x` IP 地址。因此你需要配置 Pi-hole 监听 Tailscale 接口。

在 Pi-hole 网页管理界面中，前往 **Settings**（设置），然后 **DNS**，在右上角将 **Basic**（基础）按钮切换为 **Expert**（专家）以显示高级设置。在 **Interface settings**（接口设置）部分，勾选 **Permit all origins**（允许所有来源）。

> **警告：**
>
> 如果你启用 **Permit all origins**，请确保：
>
> * 你的 Raspberry Pi 位于防火墙之后。
> * 你用强密码保护 Pi-hole 网页管理界面，以降低安全风险。

接下来，你将创建自己的个人 tailnet。

## 第 2 步：创建你的 tailnet

要创建 tailnet，在一台设备（例如手机或笔记本电脑）上[下载][co-download]并安装客户端，然后使用你现有的身份提供方登录。选择 **Personal**（个人）选项，并按照剩余提示完成流程。此时你的个人 tailnet 已配置完毕，可以使用了。

*（图：选择 tailnet 类型。）*

接着前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认设备已连接到你的 tailnet。管理控制台是你可以管理 tailnet 用户、设备和权限的地方。

*（图：管理控制台的 Machines 页面。）*

接下来，你将在 Raspberry Pi 上安装并配置 Tailscale。

## 第 3 步：在 Raspberry Pi 上安装 Tailscale

要安装 Tailscale 客户端，打开一个终端会话（如果上一节的会话还开着，也可以继续使用它）。然后使用以下命令下载并安装 Tailscale 软件包：

```shell
curl -fsSL https://tailscale.com/install.sh | sh
```

现在启用 Tailscale 客户端，并指示 Raspberry Pi 不要自动采用 tailnet 的 DNS 设置，因为 Raspberry Pi 本身就是 DNS 服务器。

```shell
sudo tailscale up --accept-dns=false
```

第一次运行 [`tailscale up`][docs-cli-up] 命令时，终端里会显示一个 URL。把该 URL 粘贴到网页浏览器中，并使用创建 tailnet 时所用的同一电子邮箱地址登录。你可以在任何设备上完成这一步，例如手机或笔记本电脑。登录后，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，在列表中找到 Raspberry Pi，确认它已加入你的 tailnet。

tailnet 中的设备会通过设备密钥过期机制定期重新认证以保障安全，即在设定的期限过后要求重新认证。对于应当持续保持连接的设备（例如服务器、Raspberry Pi、媒体中心、智能家居中枢、Docker 主机和 NAS 设备），你可以禁用密钥过期，避免不必要的中断。

要禁用某台设备的密钥过期，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择该设备旁边的图标，然后选择 **Disable key expiry**（禁用密钥过期）。

> **警告：**
>
> 禁用密钥过期会降低安全性，如果设备或密钥遭到入侵，可能会暴露你的网络。只对受信任的设备这样做，并且在设备丢失或更换时立即撤销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

接下来，你将配置 tailnet 的 DNS 设置，使其指向 Raspberry Pi。

## 第 4 步：将 Raspberry Pi 设为 tailnet 的 DNS 服务器

要将 Raspberry Pi 配置为 tailnet 的 DNS 服务器，前往管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面，在 **Nameservers**（名称服务器）部分选择 **Add nameserver**（添加名称服务器），然后选择 **Custom**（自定义）。接着输入 Raspberry Pi 的 IP 地址，选择 **Save**（保存），并启用 **Override DNS servers**（覆盖 DNS 服务器）开关。

*（图：在管理控制台中配置自定义 DNS 服务器。）*

你的设备连接到 tailnet 时，会使用 Raspberry Pi 作为 DNS 服务器来拦截大部分广告。未连接 tailnet 时，则使用本地网络上设置的 DNS 服务器，例如你的家用路由器。

要验证你的设备正在使用 Pi-hole 拦截广告，可以访问一个你确定含广告的网站，大多数站点上的广告都不会再显示。你也可以尝试关闭 Tailscale 客户端让广告重新出现，再重新启用 Tailscale 客户端。

你还可以将路由器的 DNS 设置指向 Raspberry Pi，让整个网络都使用 Pi-hole 广告拦截。

## 结语

在本指南中，你用 Pi-hole 搭建了一台 Raspberry Pi，并使用 Tailscale 将其接入你的 tailnet。这一配置为你提供了一种常驻的广告拦截与跟踪器阻止方案，无论在家中、连着公共 Wi-Fi 还是旅途中都能生效。通过将 DNS 请求经由你的 Pi-hole 路由，你在所有设备上都能获得更清爽、更快速、更私密的浏览体验，无论身在何处。

Pi-hole 应用高度可配置，请务必浏览各项设置，选择最适合你需求的配置。更多信息请参阅官方 [Pi-hole 文档][xt-pi-hole-docs]。

## 进一步探索

* 向你的 tailnet[添加更多设备][docs-device-add]。
* [邀请其他用户][docs-invite-any-user]加入你的 tailnet，让他们路由自己设备的流量。
* 将你的 Raspberry Pi 配置为[路由你的 tailnet 流量][docs-exit-nodes]，无论身在何处都能安全浏览。
* 将你的 Raspberry Pi 配置为[子网路由器][docs-subnets]，让你能远程访问未安装 Tailscale 的家庭网络设备，例如打印机或智能家居设备。
* 使用 [Control D][docs-control-d] 或 [NextDNS][docs-nextdns] 作为 tailnet 广告拦截的替代方案。

[co-download]: https://tailscale.com/download

[docs-cli-up]: /docs/reference/tailscale-cli/up

[docs-control-d]: /docs/integrations/control-d

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-nextdns]: /docs/integrations/nextdns

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[xt-github-stevenblack]: https://github.com/StevenBlack/hosts

[xt-pi-hole-docs]: https://docs.pi-hole.net/main/

[xt-pi-hole-install]: https://docs.pi-hole.net/main/basic-install/

[xt-pi-hole]: https://pi-hole.net
