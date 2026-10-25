---
title: "安装 Tailscale"
description: "安装和卸载 Tailscale 客户端。"
---

最后验证于 Dec 19, 2025

[下载 Tailscale](https://tailscale.com/download)

新用户可以按照 [Tailscale 快速开始][docs-install] 中的说明创建账户、安装 Tailscale 客户端，并配置一些常用功能。

## 安装与更新说明

以下主题提供针对特定平台的客户端安装与更新说明。

* [在 Linux 上安装][docs-install-linux]
* [在 macOS 上安装][docs-install-mac]
* [在 macOS 上运行 Tailscale 的三种方式][docs-macos-variants]
* [在 Windows 上安装][docs-install-windows]
* [使用 MSI 在 Windows 上安装][docs-install-windows-msi]
* [使用 WSL 2 在 Windows 上安装][docs-install-windows-wsl2]
* [在 Chromebook 上安装][docs-install-chromebook]
* [在 Apple TV 上安装][docs-appletv]
* [在 iOS 上安装][docs-install-ios]
* [在 Android 上安装][docs-install-android]
* [在 Amazon Fire 设备上安装][docs-install-amazon-fire]
* [使用移动设备管理（MDM）和系统策略方案部署并配置 Tailscale][docs-mdm]

## 安装与更新方式

下载、安装和更新 Tailscale 客户端版本有多种方式。

### 手动安装与更新

你可以使用以下任一方法手动安装和更新 Tailscale 客户端：

* **下载页面**：从 Tailscale [下载][co-download]页面安装或更新。
* **客户端用户界面**：从[已安装客户端的用户界面][docs-update-manual]更新（在提供更新选项的平台上），包括 Windows 和 macOS。
* **Tailscale CLI**：在 [Tailscale CLI][docs-cli] 功能可用的平台上（包括 Linux、Windows 和 macOS），使用 [`tailscale update`][docs-cli-update] 命令更新。
* **应用商店**：从我们支持的平台的应用商店安装和更新，例如 Apple App Store、Google Play 和 Amazon Appstore。
* **Packages 站点**：从 [Tailscale Packages][pk-home] 站点安装和更新。你可以根据需要选择 stable（稳定版）、release candidate（候选版）或 unstable（不稳定版）构建通道。更多信息请参阅 [Tailscale 客户端版本与发布通道][docs-versions-tracks]。

更多信息请参阅 [更新 Tailscale][docs-update]。

### 自动更新

你可以使用以下任一方法，配置 Tailscale 客户端自动更新并将更新部署到设备：

* **管理控制台**：在管理控制台中配置[自动更新][docs-update-auto-on-device]。
* **客户端设置**：从客户端的界面设置或设备的应用商店设置中配置[自动更新][docs-update-auto-on-device]。
* **系统策略**：使用 Google Workspace、Jamf、Iru（原 Kandji）或 Microsoft Intune 等 [MDM 解决方案][docs-mdm-keys-auto-update]自动更新设备。

更多信息请参阅 [更新 Tailscale][docs-update]。

## 卸载说明

有关卸载 Tailscale 客户端的信息，请参阅 [卸载 Tailscale][docs-uninstall]。

[co-download]: https://tailscale.com/download

[docs-appletv]: /docs/install/appletv

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-install-amazon-fire]: /docs/install/amazon-fire

[docs-install-android]: /docs/install/android

[docs-install-chromebook]: /docs/install/chromebook

[docs-install-ios]: /docs/install/ios

[docs-install-linux]: /docs/install/linux

[docs-install-mac]: /docs/install/mac

[docs-install-windows-msi]: /docs/install/windows/msi

[docs-install-windows-wsl2]: /docs/install/windows/wsl2

[docs-install-windows]: /docs/install/windows

[docs-install]: /docs/how-to/quickstart

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-mdm-keys-auto-update]: /docs/features/tailscale-system-policies#configure-the-auto-update-settings

[docs-mdm]: /docs/mdm

[docs-uninstall]: /docs/features/client/uninstall

[docs-update-auto-on-device]: /docs/features/client/update#enable-auto-updates-on-devices

[docs-update-manual]: /docs/features/client/update#manual-updates

[docs-update]: /docs/features/client/update

[docs-versions-tracks]: /docs/reference/tailscale-client-versions#client-release-tracks

[pk-home]: https://pkgs.tailscale.com/
