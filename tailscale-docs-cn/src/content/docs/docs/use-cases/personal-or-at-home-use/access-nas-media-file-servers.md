---
title: "远程访问 NAS、媒体服务器或文件共享"
description: "从网络之外访问家里的 NAS、媒体库或文件共享，通常意味着要开放防火墙端口或运行传统 VPN。Tailscale 会在你的设备之间创建加密的点对点连"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**连接网络附加存储**（NAS）](/docs/integrations/nas)——在受支持的网络附加存储（NAS）设备上安装 Tailscale 客户端。

从网络之外访问家里的 NAS、媒体库或文件共享，通常意味着要开放防火墙端口或运行传统 VPN。Tailscale 会在你的设备之间创建加密的点对点连接，让你从任何地方都能访问这些服务，而不必把它们暴露到互联网上。

## 在服务器上安装 Tailscale 客户端

在存放文件或媒体的设备上安装 Tailscale 客户端，将其接入你的 Tailscale 网络（即 tailnet）。如果你还没有 tailnet，认证时会自动创建一个。

#### NAS 设备

Tailscale 在主流 NAS 平台上都有原生软件包。安装后，用你的身份提供方（IdP）登录即可加入 tailnet。

* **Synology**：从套件中心（Package Center）安装。参阅 [Tailscale on Synology][docs-synology]。
* **QNAP**：从 App Center 安装。参阅 [Tailscale on QNAP][docs-qnap]。
* **Unraid**：从 Community Applications 插件安装。参阅 [Tailscale on Unraid][docs-unraid]。
* **TrueNAS Community**：从 Apps 目录安装。参阅 [Tailscale on TrueNAS][docs-truenas]。

#### Windows

1. [下载并安装 Tailscale 客户端][docs-install-windows]，然后登录。
2. 共享你想访问的文件夹：右键点击文件夹，打开**属性 > 共享**，并配置共享。
3. 记下该机器的 Tailscale 主机名或 IP 地址，之后你要从其他设备用它来连接。

#### macOS

1. [下载并安装][docs-install-macos] Tailscale 客户端，然后登录。
2. 启用文件共享：打开**系统设置 > 通用 > 共享**，然后打开**文件共享**，添加你想共享的文件夹。
3. 记下该机器的 Tailscale 主机名或 IP 地址，之后你要从其他设备用它来连接。

#### Linux

1. 安装 Tailscale 客户端：

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. 完成认证并连接到你的 tailnet：

   ```bash
   sudo tailscale up
   ```

3. 设置你的文件共享服务，例如用于 SMB 共享的 Samba，或用于媒体的 JellyFin、Emby、Plex。网络访问由 Tailscale 负责，因此只有 tailnet 成员才能访问你的服务。

## 在你的设备上安装 Tailscale 客户端

在你将要用来连接的每台设备上下载并安装 Tailscale 客户端，然后用同一账号登录。

#### Windows

[下载并安装][docs-install-windows] Tailscale 客户端，然后登录。Tailscale 会出现在系统托盘中，你的 tailnet 设备立刻就能通过主机名或 Tailscale IP 访问。

#### macOS

[下载并安装][docs-install-macos] Tailscale 客户端，然后登录。Tailscale 的菜单栏图标会显示你的连接状态，并列出你的 tailnet 设备。

#### iOS / iPadOS

[下载并安装][docs-install-ios] Tailscale 客户端，然后登录。Tailscale 以 VPN 描述文件的形式运行，让设备上的所有应用都能访问你的 tailnet。

#### Android

[下载并安装][docs-install-android] Tailscale 客户端，然后登录。连接建立后，设备上的所有应用都能访问 tailnet 服务。

#### Linux

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

运行 `tailscale ip` 确认分配给你的 Tailscale IP 地址，验证连接。

## 访问你的文件和服务

你用来连接的设备必须[安装 Tailscale 并登录][docs-install]到与服务器相同的 tailnet。如果已启用 [MagicDNS][docs-magicdns]，使用服务器的 Tailscale 主机名；否则可在管理控制台的[机器](https://console.tailscale.com/admin/machines)页面找到它的 Tailscale IP 地址。

#### Windows

文件访问：打开**文件资源管理器**，在地址栏输入 `\\hostname` 或 `\\100.x.y.z`。要映射一个持久驱动器，右键点击**此电脑 > 映射网络驱动器**，输入路径并选择登录时重新连接。

JellyFin 和 Emby：访问 `http://hostname:8096` 或 `http://100.x.y.z:8096`。Plex：访问 `http://hostname:32400` 或 `http://100.x.y.z:32400`。

#### macOS

文件访问：打开**访达**（Finder），选择**前往 > 连接服务器**，输入 `smb://hostname` 或 `smb://100.x.y.z`，在提示时输入你的凭证。共享会作为网络驱动器挂载到访达中。

JellyFin 和 Emby：访问 `http://hostname:8096` 或 `http://100.x.y.z:8096`。Plex：访问 `http://hostname:32400` 或 `http://100.x.y.z:32400`。

#### iOS / iPadOS

文件访问：打开**文件**（Files）应用，点按 **…**，选择**连接服务器**，输入 `smb://hostname` 或 `smb://100.x.y.z` 并登录。共享会显示在侧边栏的**网络**（Network）下方。

JellyFin 或 Emby：用 `http://hostname:8096` 或 `http://100.x.y.z:8096` 添加你的服务器。Plex：用 `http://hostname:32400` 或 `http://100.x.y.z:32400` 添加你的服务器。

#### Android

文件访问：使用 [Files by Google][xt-files-by-google] 或其他支持 SMB 的文件管理器，如 [Solid Explorer][xt-solid-explorer] 或 [MiXplorer][xt-mixplorer]。用 `smb://hostname` 或 `smb://100.x.y.z` 添加网络连接。

JellyFin 或 Emby：用 `http://hostname:8096` 或 `http://100.x.y.z:8096` 添加你的服务器。Plex：用 `http://hostname:32400` 或 `http://100.x.y.z:32400` 添加你的服务器。

#### Linux

从命令行挂载 SMB 共享：

```bash
sudo mount -t cifs //hostname/sharename /mnt/myshare -o username=<user>
```

如果未启用 MagicDNS，把 `hostname` 替换为服务器的 Tailscale IP 地址。

JellyFin 和 Emby：在浏览器中打开 `http://hostname:8096` 或 `http://100.x.y.z:8096`。Plex：打开 `http://hostname:32400` 或 `http://100.x.y.z:32400`。

## 延伸探索

* 启用 [MagicDNS][docs-magicdns]，在整个 tailnet 中使用友好主机名而不是 IP 地址。
* 使用 [Taildrive][docs-taildrive] 直接访问 tailnet 内的共享文件夹，无需配置 SMB。
* 试试 [Taildrop][docs-taildrop]，在任意 tailnet 设备之间以点对点方式发送文件。
* 使用 [Tailscale Serve][docs-serve] 把本地服务展现给 tailnet 中的其他设备。
* [邀请用户][docs-invite-users]加入你的 tailnet，访问你共享的文件和媒体。
* 使用 [tailnet 策略文件][docs-policy-file]限制哪些 tailnet 设备和用户可以访问你的服务器。

[docs-install]: /docs/install

[docs-install-android]: /docs/install/android

[docs-install-ios]: /docs/install/ios

[docs-install-macos]: /docs/install/mac

[docs-install-windows]: /docs/install/windows

[docs-invite-users]: /docs/features/sharing/how-to/invite-users

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-qnap]: /docs/integrations/qnap

[docs-serve]: /docs/features/tailscale-serve

[docs-synology]: /docs/integrations/synology

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-truenas]: /docs/integrations/truenas

[docs-unraid]: /docs/integrations/unraid

[xt-files-by-google]: https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.files

[xt-mixplorer]: https://play.google.com/store/apps/details?id=com.mixplorer.silver

[xt-solid-explorer]: https://play.google.com/store/apps/details?id=pl.solidexplorer2
