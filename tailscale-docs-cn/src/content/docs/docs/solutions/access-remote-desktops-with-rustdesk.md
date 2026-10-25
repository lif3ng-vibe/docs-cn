---
title: "使用 RustDesk 访问远程桌面"
description: "使用 RustDesk 和 Tailscale 搭建安全的远程桌面访问，让设备通过你的私有 tailnet 直接互连，无需服务器。"
---

最后验证于 Dec 15, 2025

有时你可能需要在自己无法坐在电脑前的情况下访问一台计算机的桌面。你可能正在外地出差，需要家里台式机上的一个文件；也可能想远程帮家人修理笔记本电脑。

[RustDesk][xt-rustdesk]让你可以远程连接到另一台设备的桌面。通常，RustDesk 需要一台服务器作为中介，帮助设备彼此发现并传递连接。你可以使用 RustDesk 的公共服务器，也可以在家中自建一台，但运行自己的服务器需要额外的配置。

Tailscale 让你彻底不必使用 RustDesk 服务器。在设备上安装 Tailscale 后，它们可以像处于同一个家庭网络一样直接发现并连接彼此。这让你无需依赖外部服务器或自行运维服务器就能使用 RustDesk。你的连接保持私密与安全，而且不需要额外的基础设施就能获得远程访问能力。

## 前提条件

要跟着本指南操作，你需要：

* 一台用于登录并创建 Tailscale 网络（称为 tailnet）的设备（例如手机或笔记本电脑），以及至少两台用于安装 Tailscale 客户端和 RustDesk 的设备。Tailscale 可运行于大多数操作系统，包括 Linux、Windows、macOS、iOS 和 Android。
* 一个使用[单点登录（SSO）身份提供方][docs-sso-providers]（例如 Apple、Google 或 Microsoft）的电子邮件账户。

## 第 1 步：创建你的 tailnet

要创建 tailnet，在一台设备（例如手机或笔记本电脑）上[下载][co-download]并安装客户端，然后使用你现有的身份提供方登录。选择 **Personal**（个人）选项，并按照剩余提示完成流程。此时你的个人 tailnet 已配置完毕，可以使用了。

*（图：选择 tailnet 类型。）*

接着前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认你的设备已连接到你的 tailnet。管理控制台是你可以管理 tailnet 用户、设备和权限的地方。

*（图：管理控制台的 Machines 页面。）*

接下来，你将在自己的设备上安装 Tailscale 客户端。

## 第 2 步：在你的设备上安装 Tailscale

要安装 Tailscale 客户端，前往 [Downloads][co-download] 页面，下载适配你操作系统的客户端并安装。对于加入的每台设备，你都需要通过网页浏览器使用现有的身份提供方登录。确认屏幕显示后，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，验证该设备已连接到你的 tailnet。

tailnet 中的设备会通过设备密钥过期机制定期重新认证以保障安全，即在设定的期限过后要求重新认证。对于应当持续保持连接的设备（例如服务器、Raspberry Pi、媒体中心、智能家居中枢、Docker 主机和 NAS 设备），你可以禁用密钥过期，避免不必要的中断。

要禁用某台设备的密钥过期，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择该设备旁边的图标，然后选择 **Disable key expiry**（禁用密钥过期）。

> **警告：**
>
> 禁用密钥过期会降低安全性，如果设备或密钥遭到入侵，可能会暴露你的网络。只对受信任的设备这样做，并且在设备丢失或更换时立即撤销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

接下来，你将在自己的设备上安装 RustDesk。

## 第 3 步：在你的设备上安装并配置 RustDesk

要在你的设备上安装 RustDesk，前往 [RustDesk][xt-rustdesk] 网站，然后选择 **Download**（下载）。页面会跳转到最新可用下载列表。找到适配你设备的文件，下载并安装。

要配置 RustDesk 应用，打开应用，进入 **Security**（安全）部分并启用 **Direct IP access**（直接 IP 访问）。此时，你需要决定是依赖默认的一次性密码，还是设置一个固定密码。一次性密码虽然可用，但对于无头（headless）或无人值守设备来说可能不太方便，例如没有显示器的机器，或者现场没有人可以提供密码的设备。设置固定密码能确保你每次都能用同一个密码连接。

> **提示：**
>
> RustDesk 客户端中的设置名称因操作系统而异。更多信息请参阅官方 [RustDesk 文档][xt-rustdesk-docs]。

接下来，你将使用 RustDesk 连接到另一台设备的桌面。

## 第 4 步：通过 tailnet 使用 RustDesk 连接设备

通过 tailnet 使用 RustDesk 连接设备时，你必须获取远程设备的 tailnet IP 地址和 RustDesk 密码。

要确定远程设备的 Tailscale IP 地址，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，找到该设备，并复制其 `100.x.x.x` 地址。

根据你用来连接另一台桌面的操作系统，参照以下说明操作。

#### macOS

要连接远程设备，在 **Control Remote Desktop**（控制远程桌面）框中粘贴你要连接的设备的 `100.x.x.x` Tailscale IP 地址，然后选择 **Connect**（连接）。出现提示时，输入密码。

如果你之前连接过且密码未变，则无需重新输入密码。

#### Windows

要连接远程设备，在 **Control Remote Desktop**（控制远程桌面）框中粘贴你要连接的设备的 `100.x.x.x` tailnet 地址，然后选择 **Connect**（连接）。出现提示时，输入密码。

如果你之前连接过且密码未变，则无需重新输入密码。

#### Linux

要连接远程设备，在 **Control Remote Desktop**（控制远程桌面）框中粘贴你要连接的设备的 `100.x.x.x` Tailscale IP 地址，然后选择 **Connect**（连接）。出现提示时，输入密码。

如果你之前连接过且密码未变，则无需重新输入密码。

#### iOS

要连接远程设备，在 **Remote ID**（远程 ID）框中粘贴你要连接的设备的 `100.x.x.x` tailnet 地址，然后选择箭头图标。出现提示时，输入密码。

如果你之前连接过且密码未变，则无需重新输入密码。

#### Android

要连接远程设备，在 **Remote ID**（远程 ID）框中粘贴你要连接的设备的 `100.x.x.x` tailnet 地址，然后选择箭头图标。出现提示时，输入密码。

如果你之前连接过且密码未变，则无需重新输入密码。

现在，你可以通过 tailnet 远程、安全地访问一台桌面，就像亲临其前一样。

## 结语

在本指南中，你将 RustDesk 与 Tailscale 结合配置，获得了一种安全且无需服务器的方式，可以从任何地方访问你的设备。通过搭建个人 tailnet、在设备上安装 Tailscale 并启用 RustDesk 的直接 IP 访问，你可以使用私有的 tailnet 地址直接连接，无需依赖公共服务器，也不必自行运维服务器。这种方式不仅减少了配置开销，还能确保连接保持私密，让远程桌面访问更可靠、更易管理。

## 进一步探索

* 参阅 [RustDesk 文档][xt-rustdesk-docs]来配置和使用 RustDesk 客户端。
* [邀请其他用户][docs-invite-any-user]加入你的 tailnet。
* 使用 [Raspberry Pi][docs-pi-hole]、[Control D][docs-control-d] 或 [NextDNS][docs-nextdns] 为你的 tailnet 配置广告拦截。
* 将 tailnet 中的一台设备配置为[路由你的 tailnet 流量][docs-exit-nodes]，无论身在何处都能安全浏览。
* 将 tailnet 中的一台设备配置为[子网路由器][docs-subnets]，远程访问未安装 Tailscale 的家庭网络设备，例如打印机或智能家居设备。

[co-download]: https://tailscale.com/download

[docs-control-d]: /docs/integrations/control-d

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[xt-rustdesk-docs]: https://rustdesk.com/docs

[xt-rustdesk]: https://rustdesk.com/
