---
title: "使用 Windows RDP 访问远程桌面"
description: "使用远程桌面和 Tailscale 从任何地方安全地访问 Windows PC。在私有 tailnet 上连接设备，无需端口转发或公网 IP。"
---

最后验证于 Dec 15, 2025

有时你需要从另一个位置访问远程 Windows PC。你可能正在远程办公，需要连回办公室的电脑；也可能需要帮别人排查 PC 问题，却无法到场。

[Windows 远程桌面协议（RDP）][xt-ms-rdp-explained]让你可以连接到远程 Windows PC 并像坐在它面前一样使用它。通常，配置 Windows RDP 需要在网络上暴露端口并配置防火墙规则，才能通过互联网安全连接。这些步骤可能很复杂，并带来潜在的安全风险。

使用 Tailscale，你的设备会自动加入一个安全加密的网络，彼此可以直接互访，无需手动端口转发或公网 IP。通过你的 Tailscale 网络（称为 tailnet）建立连接后，你就可以像设备处于同一局域网一样访问远程 Windows PC。

## 前提条件

要跟着本指南操作，你需要：

* 一台运行 Windows Professional、Enterprise、Education 版本或 Windows Server 版本的计算机。这就是你将远程连接的 Windows PC。
* 另一台用于加入 tailnet 并连接远程 Windows PC 的计算机。它不必运行 Windows，但必须能够使用兼容的远程桌面应用来连接远程 Windows PC。
* 一个使用[单点登录（SSO）身份提供方][docs-sso-providers]（例如 Apple、Google 或 Microsoft）的电子邮件账户。

## 第 1 步：安装 Tailscale 并创建你的 tailnet

> **提示：**
>
> 在第一台设备上安装 Tailscale 并完成认证，即会自动创建你的 tailnet。

要通过 RDP 连接到远程 Windows PC，你至少需要在两台设备上安装 Tailscale 客户端：一台是你想要访问的远程 Windows PC，另一台是你用来连接的设备。

为你的设备[下载][co-download] Tailscale 客户端并安装。启动应用后，使用现有的身份提供方（例如 Apple、Google 或 Microsoft）登录。选择 Personal 选项，然后按照剩余提示完成流程。此时你的 tailnet 已配置完毕，可以使用了。

*（图：选择 tailnet 类型。）*

前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，确认你的设备已连接到你的 tailnet。管理控制台让你可以管理 tailnet 的用户、设备和权限。

*（图：管理控制台的 Machines 页面。）*

现在，在你的其他设备上下载并安装 Tailscale 客户端。对于加入 tailnet 的每台设备，都通过网页浏览器使用你的身份提供方登录。确认屏幕显示后，验证该设备已出现在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面中。

## 第 2 步：（可选）管理密钥过期

tailnet 中的设备会通过设备密钥过期机制定期重新认证以保障安全，即在设定的期限过后要求重新认证。对于应当持续保持连接的设备（例如服务器、Raspberry Pi、媒体中心、智能家居中枢、Docker 主机和 NAS 设备），你可以禁用密钥过期，避免不必要的中断。

要禁用某台设备的密钥过期，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，选择该设备旁边的图标，然后选择 **Disable key expiry**（禁用密钥过期）。

> **警告：**
>
> 禁用密钥过期会降低安全性，如果设备或密钥遭到入侵，可能会暴露你的网络。只对受信任的设备这样做，并且在设备丢失或更换时立即撤销密钥。更多信息请参阅[密钥过期][docs-key-expiry]。

接下来，你将在远程 Windows PC 上配置 Windows RDP。

## 第 3 步：配置 Windows RDP

配置 Windows RDP 的步骤因 Windows 版本而异。本文以 Windows 11 Pro 上的 Windows RDP 设置为例进行说明。要在非 Windows 11 Pro 的 PC 上配置 Windows RDP，请参阅 [Enable Remote Desktop on your PC][xt-ms-rdp-setup]。

要启用 Windows RDP，前往 **Settings**（设置）、**System**（系统），然后选择 **Remote Desktop**（远程桌面）。接着将 **Remote Desktop** 切换为 **On**（开），并选择 **Confirm**（确认）。

如果你希望在远程 Windows PC 上访问多个账户，请在 **Remote Desktop**（远程桌面）主页面中选择 **Remote Desktop users**（远程桌面用户）。选择 **Add**（添加）、**Advanced**（高级）、**Find Now**（立即查找），选中你要添加的用户，然后选择 **OK**（确定）。随后在 **Remote Desktop users**（远程桌面用户）主对话框中，选择 **OK** 确认。

如果你希望远程 Windows PC 在重启后仍可访问，可以启用[无人值守模式（Unattended mode）][docs-run-unattended]。否则，每次重启后都需要用户登录设备，无论是本人到场还是通过其他方式。

#### Tailscale UI

选择 Windows 系统托盘中的 Tailscale 图标，然后依次选择 **Preferences**（偏好设置）和 **Run Unattended**（以无人值守模式运行）。然后选择 **Yes**（是）确认。

#### Tailscale CLI

在 Windows 上打开命令提示符或 PowerShell 工具，运行：

```shell
tailscale up --unattended
```

#### 系统策略

如果你的组织使用移动设备管理（MDM）等系统策略，可以配置 `UnattendedMode` 策略。更多信息请参阅[设置无人值守模式][docs-mdm-keys-unattended]。

接下来，你将在用来连接远程 Windows PC 的设备上安装软件。

## 第 4 步：在其他设备上安装 RDP 应用

要从 tailnet 中的另一台设备连接远程 Windows PC，你需要在发起连接的设备上安装一个应用。以下是已知受支持的平台及各平台的推荐应用：

| 平台 | 推荐应用                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------- |
| macOS    | [Windows App][xt-app-macos]                                                                               |
| Windows  | 使用内置的 Desktop Connection 应用                                                                         |
| Linux    | [FreeRDP][xt-app-linux-freerdp]、[Remmina][xt-app-linux-remmina]、[GNOME Connections][xt-app-linux-gnome] |
| iOS      | [Windows App Mobile][xt-app-ios]                                                                          |
| Android  | [Windows App][xt-app-android]                                                                             |

关于受支持平台以及安装和配置说明的更多信息，请参阅 [Get started with Windows App to connect to devices and apps][xt-ms-rdp-apps]。

接下来，你将连接到远程 Windows PC。

## 第 5 步：配置并连接 Windows RDP

要通过 tailnet 连接到远程 Windows PC，首先要找到它的 Tailscale IP 地址。为此，前往管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面，找到该设备并复制其 `100.x.x.x` 地址。你也可以使用该 PC 的 tailnet 主机名或 [MagicDNS][docs-magic-dns] 名称。现在，你可以使用以下任一方法配置应用并连接到远程 Windows PC：

#### macOS

要在 macOS 上添加远程 Windows PC，打开 Windows App 并选择 **+** 图标。在 **PC name**（PC 名称）字段中，输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称，将 **Credentials**（凭据）字段设为 **Ask when required**（需要时询问），然后选择 **Add**（添加）。新建的连接会显示在 Windows App 中。

要连接到远程 Windows PC，右键点击你创建的连接并选择 **Connect**（连接）。如有必要，输入远程 Windows PC 的凭据，然后选择 **Continue**（继续）。

#### Windows

打开 **Remote Desktop Connection**（远程桌面连接）应用。它是 Windows 内置的，因此无需下载第三方应用。在 **Computer**（计算机）字段中，输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称。如有必要，输入远程 Windows PC 的凭据，然后选择 **OK**（确定）。

#### Linux（FreeRDP）

要使用 FreeRDP 连接到远程 Windows PC，请运行以下命令，并将占位符替换为该远程 Windows PC 的实际信息。

```shell
xfreerdp /u:<username> /p:<password> /v:<hostaddress>
```

#### Linux（Remmina）

要使用 Remmina 连接到远程 Windows PC，请使用 RDP 协议创建一个新连接。输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称，以及你的 Windows 用户名和密码。按需启用剪贴板共享或全屏等选项，然后选择 **Connect**（连接）。

#### Linux（GNOME）

要使用 GNOME Connections 连接到远程 Windows PC，打开应用并选择 **+** 图标，然后选择 **Connect to a remote desktop**（连接到远程桌面）。在地址栏中输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称，然后选择 **RDP** 作为连接类型。出现提示时，输入远程 Windows PC 的用户名和密码，并选择 **Connect**（连接）。

#### iOS

要在 iOS 上添加远程 Windows PC，打开 Windows App 并选择 **+** 图标。在 **PC name**（PC 名称）字段中，输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称，将 **Credentials**（凭据）字段设为 **Ask when required**（需要时询问），然后选择 **Add**（添加）。新建的连接会显示在 Windows App 中。

要连接到远程 Windows PC，点按你创建的连接并选择 **Connect**（连接）。如有必要，输入远程 Windows PC 的凭据，然后选择 **Continue**（继续）。

#### Android

要在 Android 上添加远程 Windows PC，打开 Windows App 并选择 **PC connection**（PC 连接）。在 **PC Name**（PC 名称）字段中，输入远程 Windows PC 的 Tailscale IP 或 MagicDNS 名称，然后选择 **Save**（保存）。

要从 Android 连接到远程 Windows PC，点按你创建的连接。如有必要，输入远程 Windows PC 的凭据，然后选择 **Continue**（继续）。

> **提示：**
>
> 使用上述任何应用时，可能会显示一条警告消息，提示你要连接的计算机可能不受信任。如果这是你拥有并信任的计算机，可以放心忽略该消息。如果不确定，请咨询你的 IT 管理员。

> **提示：**
>
> 如果你从 Windows 域连接远程 Windows PC 时遇到问题，请参阅我们故障排除内容中的 [Windows][docs-troubleshooting-windows] 部分。

现在，你可以通过 tailnet 远程、安全地访问 Windows PC，就像亲临其前一样。

## 结语

在本指南中，你配置了 Windows RDP 与 Tailscale，在设备之间建立了安全私密的连接。借助你的 tailnet，你可以连接远程 Windows PC，而无需暴露端口或管理网络配置。这一设置让你的远程会话保持加密且可靠，无论身在何处都能直接访问你的桌面环境。

## 进一步探索

* [邀请其他用户][docs-invite-any-user]加入你的 tailnet，让他们路由自己设备的流量。
* 使用 [Raspberry Pi][docs-pi-hole]、[Control D][docs-control-d] 或 [NextDNS][docs-nextdns] 为你的 tailnet 配置广告拦截。
* 将 tailnet 中的一台设备配置为[路由你的 tailnet 流量][docs-exit-nodes]，无论身在何处都能安全浏览。
* 将 tailnet 中的一台设备配置为[子网路由器][docs-subnets]，远程访问未安装 Tailscale 的家庭网络设备，例如打印机或智能家居设备。

[co-download]: https://tailscale.com/download

[docs-control-d]: /docs/integrations/control-d

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magic-dns]: /docs/features/magicdns

[docs-mdm-keys-unattended]: /docs/features/tailscale-system-policies#设置无人值守模式

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-troubleshooting-windows]: /docs/reference/troubleshooting/windows

[xt-app-android]: https://play.google.com/store/apps/details?id=com.microsoft.rdc.androidx

[xt-app-ios]: https://apps.apple.com/app/windows-app-mobile/id714464092

[xt-app-linux-freerdp]: https://www.freerdp.com/

[xt-app-linux-gnome]: https://apps.gnome.org/Connections/

[xt-app-linux-remmina]: https://remmina.org/

[xt-app-macos]: https://apps.apple.com/app/windows-app/id1295203466

[xt-ms-rdp-apps]: https://learn.microsoft.com/en-us/windows-app/get-started-connect-devices-desktops-apps

[xt-ms-rdp-explained]: https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/understanding-remote-desktop-protocol

[xt-ms-rdp-setup]: https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/remotepc/remote-desktop-allow-access
