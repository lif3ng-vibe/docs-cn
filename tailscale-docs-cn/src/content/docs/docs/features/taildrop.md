---
title: "Taildrop"
description: "在 Tailscale 网络上的个人设备之间互传文件。"
---

最后验证于 Jan 5, 2026

> **注意：** Taildrop 目前处于 alpha 阶段。

> **注意：** Taildrop 适用于[所有套餐](https://tailscale.com/pricing)。

Taildrop 让你能在 Tailscale 网络（即 tailnet）上的个人设备之间互传文件。

与所有通过 Tailscale 发送的流量一样，Taildrop 会使用可用的最快路径，通过加密的点对点连接传输文件。这使它成为在不经过第三方服务器的情况下发送敏感文件或大文件的理想方案。

> **注意：**
>
> Taildrop 目前处于公开 alpha 阶段，用户界面和功能方面还有许多计划中的改进。要试用 Taildrop，你必须[为你的网络启用 Taildrop][ar-enable-taildrop-for-your-network]。

## 为你的网络启用 Taildrop

由于 Taildrop 是 alpha 功能，你必须先让 tailnet 选择加入该功能才能使用。你可以在管理控制台的 [General](https://console.tailscale.com/admin/settings/general) 设置页面中，开启 **Send Files**（发送文件）功能。

## 客户端设置

除网络附加存储（NAS）设备外，Taildrop 无需任何客户端设置，只需[安装 Tailscale][docs-installation] 即可。

如果你需要为 NAS 设备设置 Taildrop，请参阅[Taildrop 与 NAS 设备][docs-taildrop-nas]。

## 使用 Taildrop 发送文件

你可以用 Taildrop 传输任何类型的文件。

Taildrop 目前仅限在你自己的个人设备之间发送文件。你不能向其他用户的设备发送文件（即使这些用户在同一个 Tailscale 网络中）。

> **注意：**
>
> Taildrop 允许你在已登录你自己账号的设备之间共享文件，即使这些设备使用了访问控制策略来限制访问。你不能使用 Taildrop 向已打标签的节点发送文件，也不能从这些节点接收文件。

此外，Taildrop 要求两台设备都在运行 Tailscale。

#### macOS

首次使用 Taildrop 之前，必须在**系统设置**（System Settings）> **通用**（General）> **登录项与扩展**（Login Items & Extensions）> **共享**（Sharing）中启用它。为 **Tailscale** 开启共享。

*（图：Tailscale 扩展的 macOS 系统设置窗口，已勾选"Sharing"。）*

通过右键菜单中的**共享**（Share）向其他设备发送文件。

*（图：macOS Finder 窗口，打开了一个文件的右键菜单。已选中"Share"菜单项并展开二级菜单，二级菜单中选中了 Tailscale。）*

#### iOS

使用共享菜单向你的其他设备发送文件。选择 Tailscale，然后点按你想发送到的设备。

*（图：一张照片的共享选项示例。应用列表中，Tailscale 选项用红色轮廓标出。）*

> **注意：**
>
> 首次使用 Taildrop 时，**Tailscale** 选项可能隐藏在菜单的**更多**（More）区域中。iOS 会按使用频率对共享应用排序，因此发送过一个文件之后，Tailscale 应该就会显示出来。

#### Windows

右键点击文件，然后从菜单中选择 **Send with Tailscale**（通过 Tailscale 发送），即可向其他设备发送文件。

*（图：Windows 桌面，打开了一个文件的右键菜单，列表中有"Send with Tailscale..."选项。）*

#### Android

使用**共享**（Share）按钮向你的其他设备发送文件。选择 Tailscale，然后点按你想发送到的设备。

*（图：一张照片的共享选项示例。应用列表中列出了 Tailscale 应用。）*

> **注意：**
>
> 首次使用 Taildrop 时，**Tailscale** 选项可能隐藏在 **Share to Apps**（共享到应用）列表的**更多**（More）区域中。Android 会按使用频率对共享应用排序，因此发送过一个文件之后，Tailscale 应该就会显示出来。

#### Linux

你可以使用[命令行界面（CLI）][docs-cli]的 [`tailscale file`][docs-cli-file] 命令发送文件。

```shell
tailscale file cp <files> <name-or-ip>:
```

例如，你可以用以下命令向手机发送一个文本文件：

```shell
tailscale file cp ./my-file.txt my-phone:
```

最后一个参数是目标设备的名称加一个冒号，目的是区分文件名和设备名，并大致沿用 `scp` 的语法。

你可以使用 [`tailscale status`][docs-cli-status] 命令查看其他节点的 IP 地址和名称。

### 恢复中断的传输

如果 Taildrop 文件传输被中断，你可以重试传输，Taildrop 会尝试从中断处继续传输。这在传输大文件时尤其有用。在大多数情况下，传输失败后一小时内都可以恢复。目前，除 macOS 或 iOS 设备作为接收方的情况外，Taildrop 在所有平台上都支持恢复传输。

## 使用 Taildrop 接收文件

#### macOS

在 macOS 上接收的文件会放在 `~/Downloads` 目录中。

#### iOS

在 iOS 上接收文件时会弹出通知。打开该通知即可在"文件" App 中查看这些文件。

#### Windows

如果你运行的是 Tailscale v1.34 或更高版本，在 Windows 上接收的文件会放在 `C:\Users\(username)\Downloads` 目录中。如果运行的是更早的版本，接收的文件会放在 `C:\Users\(username)\Desktop` 目录中。

#### Android

在 Android 上接收文件时会弹出通知。打开该通知即可在"文件" App 的"下载"分区中查看这些文件。

#### Linux

你可以使用[命令行界面（CLI）][docs-cli]的 [`tailscale file`][docs-cli-file] 命令接收文件。

```shell
sudo tailscale file get .
```

其中 `.` 可以是任何你想要将文件复制到的目录。

由于 tailscaled 以 root 身份运行，文件由 root 接收。在当前版本中，root 必须使用 sudo 来取回这些文件。

## 示例：将敏感文档从电脑安全传输到移动设备，方便随时随地访问

想在你的设备之间传输敏感文件（例如医疗或税务文档），往往相当麻烦。基于云的传输或文件存储方案会让你的文档可以通过互联网访问，带来安全和漏洞风险。AirDrop 无需将任何内容上传到互联网，但只能在 Apple 设备之间使用，而且要求设备彼此靠近。

Taildrop 提供了一种在你的任意设备之间共享敏感文件的简便方法。而且无论你的设备在哪里，文件都通过加密的点对点连接发送。因此你可以确信，传输过程中能访问这些文件的只有发送和接收这两台设备。

## 示例：将家人照片从手机发送到电脑

Taildrop 让你可以跨平台共享照片，而无需将照片上传到任何地方。

## 示例：将截图共享到电脑

有没有截过图或录过屏，却发现其实并不需要它们留在截取时所用的设备上？在 Tailscale，我们在开发过程中会对客户端应用截取大量屏幕截图，然后必须把它们传到电脑上，才能上传到 GitHub 或 Figma 等桌面工具。Taildrop 帮你快速传输这些文件，让你可以在发送设备和接收设备之间无缝地来回切换工作。

## 示例：将 Google Photos 相册传输到个人照片服务器

如果你想把照片从 Google Photos 迁移到个人媒体服务器，Taildrop 或许能帮上忙。以下步骤介绍如何将一个相册从 Google Photos 移动到远程个人机器。

**步骤：**

1. 在电脑浏览器中打开 Google Photos 网站，选择一个相册。

2. 在右上角，选择最右侧的菜单项，然后选择 **Download all**（全部下载）。

   *（图：Google Photos 相册示例。最右侧菜单已展开，选中了"Download all"。）*

3. 这样会将相册的 zip 文件下载到你的电脑。如果这台电脑就是照片的最终目的地，那么到此为止即可，无需再使用 Taildrop。

4. 但如果你想把照片传输到远程设备（比如一台专门用作媒体服务器的设备），可以右键点击该 zip 文件，选择通过 Taildrop 共享。

   *（图：相册照片 zip 文件的右键菜单。已选中"Share"菜单项并展开二级菜单，二级菜单中选中了 Tailscale。）*

5. 在 Taildrop 弹窗中选择你的媒体服务器，zip 文件就会被传输到该设备。

   *（图：显示设备列表的弹窗。所选设备上有进度条，表示传输正在进行。）*

   *（图：显示设备列表的弹窗。所选设备上有对勾，表示传输已完成。）*

6. 传输完成后，你可以从原设备上删除该 zip 文件。

[ar-enable-taildrop-for-your-network]: #为你的网络启用-taildrop

[docs-cli-file]: /docs/reference/tailscale-cli#file

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli]: /docs/reference/tailscale-cli

[docs-installation]: /docs/install

[docs-taildrop-nas]: /docs/features/taildrop/how-to/set-up-taildrop-with-nas
