---
title: "更新 Tailscale"
description: "我们的团队会定期发布 Tailscale 客户端更新，建议你始终使用最新版本的 Tailscale 客户端。"
---

最后验证于 Dec 4, 2025

我们的团队会定期发布 Tailscale 客户端更新，建议你始终使用最新版本的 Tailscale 客户端。要了解全部最新功能、变更和修复（包括 Tailscale 客户端的发布版本），请参阅我们的 [Changelog][co-changelog-client]（更新日志）页面。

让 Tailscale 客户端保持最新有 3 种方式：

* 自动更新（推荐）
* 手动更新
* MDM 管理的更新

## 检查更新

要查看 Tailscale 网络（即 tailnet）中每台设备上安装的 Tailscale 客户端版本，请打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines)（机器）页面，查看 **版本**（Version）列。灰色箭头表示有常规更新可用，红色箭头表示有安全更新可用，没有箭头表示设备已是最新。

*（图：显示 Tailscale 客户端版本的设备列表。）*

要只显示有更新可用的设备，请选择 **版本**（Version）筛选器，然后选择 [Update available](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available)（有更新可用）。

*（图：按可用更新筛选后的设备列表，显示 Tailscale 客户端版本。）*

## 自动更新

Tailscale 可以在客户端更新发布时自动应用。应用更新所用的机制与客户端初次安装时相同。例如，如果客户端是通过某个 Linux 包管理器安装的，就会用该包管理器来升级已安装的软件包。

自动更新是可选的，单台设备随时可以加入或退出。

> **注意：**
>
> 使用 iOS、macOS（App Store 版）和 Android（Google Play 商店版）的设备默认可能未配置自动更新。建议你在 App Store 和 Google Play 商店中确认此设置已启用，以确保这些设备按照你的 tailnet 设置进行更新。

如果你使用[系统策略][docs-mdm-keys-configure-auto-update]来强制 tailnet 更新，自动更新将按照你设置的系统策略执行。

即使客户端未连接 Tailscale，自动更新也会生效。

### 在 tailnet 中配置自动更新

你必须具有 [Owner、Admin 或 IT admin](/docs/reference/user-roles)（所有者、管理员或 IT 管理员）角色，才能为 tailnet 启用或禁用自动更新。

要为整个 tailnet 启用自动更新，请打开管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management)（设备管理）页面。在 **Auto-update Tailscale** 下，打开 **Auto-update new devices**（自动更新新设备）开关。

*（图：管理控制台中已启用自动更新。）*

在管理控制台中更改自动更新设置不会改变现有设备的 Tailscale 客户端设置。该设置只影响新设备。现有设备的所有者必须手动启用或禁用自动更新。

### 新 tailnet 的自动更新

所有新建的 tailnet 在管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management)（设备管理）页面中默认启用自动更新。当新设备添加到 tailnet 时，Tailscale 客户端默认会被配置为自动更新。

### 现有 tailnet 的自动更新

如果你的 tailnet 创建于 2024 年 2 月之前，你必须在管理控制台的 [Device management](https://console.tailscale.com/admin/settings/device-management)（设备管理）页面中手动启用自动更新，并为每台现有设备分别启用。在管理控制台启用自动更新后，添加到你 tailnet 的新设备默认会被配置为自动更新。

### Docker 容器的自动更新

[Docker][docs-docker] 容器被设计为不可变的，也就是说它们不应随时间变化。因此，我们建议在 Docker [配置][xt-gh-tailscale-docker-examples]中使用 `stable` 标签（`image: tailscale/tailscale:stable`），以确保容器每次部署时都更新到最新稳定版的 Tailscale 客户端。

> **注意：**
>
> Docker 也常使用 `latest` 标签。就 Tailscale 而言，`latest` 和 `stable` 标签效果相同，不过我们建议使用 `stable` 标签。

虽然你可以通过 Tailscale CLI 命令 [`tailscale set --auto-update`][docs-cli-set] 在 Tailscale 容器内启用自动更新，但请注意以下限制：

* 容器内的自动更新在重启后不会保留。因此，每当容器重新部署或重启时，你都必须重新执行该命令。
* 我们建议把版本设置为 `stable`，而不要把 `auto-update` 标志设为开启。这样可以确保每次部署或重启容器时，它都会运行我们最新稳定版的 Tailscale。
* 如果既为容器设置了 `auto-update` 标志，配置中又指定了 `tailscale/tailscale:v1.76.0` 这样的版本，那么重新部署或重启时，Tailscale 客户端会先回退到该指定版本，然后最终更新到最新稳定版。
* 容器内的自动更新会忽略 tailnet 范围的自动更新设置。

### 在设备上启用自动更新

如果之前没有配置过自动更新，或者你需要为某台设备禁用自动更新，可能需要为该设备上的 Tailscale 客户端配置自动更新设置。

以下是在不同平台上更改设备自动更新设置的方法：

#### Windows

选择 Tailscale 托盘图标，在 **偏好设置**（Preferences）菜单下切换 **自动安装更新**（Automatically install updates）。

#### macOS

如果你是从 Mac App Store 安装的 Tailscale，请打开 App Store 应用，在 macOS 菜单栏中选择 **App Store**，选择 **设置**（Settings），然后勾选 **自动更新**（Automatic Updates）复选框。注意，启用此设置会自动更新你所有已安装的应用。

*（图：显示 Tailscale 客户端版本的设备列表。）*

如果你是通过从 `pkgs.tailscale.com` 下载 `.zip` 压缩包安装的 Tailscale，请选择 Tailscale 托盘图标，在 **设置**（Settings）菜单下切换 **自动安装更新**（Automatically install updates）。

#### iOS

iOS 应用的自动更新通过 App Store 设置管理。

#### Android

Android 应用的自动更新通过 Google Play 商店设置管理。

#### Linux

在 CLI 中运行 `tailscale set --auto-update` 启用自动更新，或运行 `tailscale set --auto-update=false` 禁用自动更新。

#### Synology

关于在 DiskStation Manager（DSM）中安排自动更新的说明，请参阅[从任意位置访问 Synology NAS][docs-synology-schedule-updates]。

### 位于多个 tailnet 的设备的自动更新

如果设备启用了自动更新、并且同时属于多个在管理控制台中 **Auto-update new devices** 设置不一致的 tailnet，那么当它连接到启用了自动更新的 tailnet 时，客户端就会更新。

### 自动更新的局限

Synology 以及基于 Arch Linux 的 Linux 发行版目前不支持自动更新。

新版本 Tailscale 发布时，自动更新不会立即进行。我们会先监测稳定性和问题报告几天，然后把该版本开放给自动更新。通常发布后约一周设备才会开始更新，有时会更久。重要的安全更新可能会更快应用。

如果启用了自动更新的设备在发布数周后仍未更新，请[联系支持团队][co-contact-support]。

目前不支持为自动更新指定时间。自动更新会围绕每个节点的活动情况自动安排，以尽量减少干扰。

## 手动更新

以下是在不同平台上手动升级的方法：

#### Windows

下载我们的 [Windows 安装程序][pk-windows-installer]并运行即可升级 Tailscale。这会将你现有的安装更新到最新版本。

你也可以运行 [Tailscale CLI][docs-cli] 命令 [`tailscale update`][docs-cli-update] 来更新 Windows 客户端。

#### macOS

macOS 版 Tailscale 有[多种变体][docs-macos-variants]。

在 macOS 上全新安装时，我们推荐使用[独立版应用][docs-macos-variants-standalone]。你可以在已安装应用的偏好设置（Preferences）页面启用自动更新。

[Mac App Store][xt-apple-macos-store-tailscale] 版应用默认会自动更新。如需手动更新，可以在 App Store 的更新页面进行。

#### iOS

iOS 版 Tailscale 只能[通过 App Store][xt-apple-ios-store-tailscale]获取，默认会自动更新。如需手动更新，可以在 App Store 的更新页面进行。

#### Android

Android 版 Tailscale 只能[通过 Play 商店][xt-google-play-tailscale]获取，默认会自动更新。如需手动更新，可以在 Play 商店的更新页面进行。

#### Linux

如果你使用 Tailscale v1.36 或更高版本，可以通过运行 [Tailscale CLI][docs-cli] 的 [`update`][docs-cli-update] 命令来更新部分 Linux 发行版的客户端。

```shell
tailscale update
```

另外，对于[受支持的 Linux 发行版][docs-install-linux]，你也可以使用安装 Tailscale 时所用包管理器的升级命令来升级 Tailscale 客户端。以下是常见发行版的参考。

对于**所有 Ubuntu 和 Debian 版本**，使用 `apt-get` 升级：

```shell
sudo apt-get update
sudo apt-get install tailscale
```

对于 **CentOS 7** 和 **Amazon Linux 2**，使用 `yum` 升级：

```shell
sudo yum update tailscale
```

对于 **openSUSE Leap 和 openSUSE Tumbleweed**，使用 `zypper` 升级：

```shell
sudo zypper update tailscale
```

对于 **CentOS 8**、**CentOS Stream 9**、**RHEL 8** 和 **Fedora**，使用 `dnf` 升级：

```shell
sudo dnf update tailscale
```

如何启用自动更新，请查阅你所处发行版的包管理器文档。

#### Tailscale 管理控制台

满足以下条件时，可以在管理控制台的 **Machines**（机器）页面使用 [`Last seen`](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available+auto-update%3Aenabled+lastseen%3Aconnected)（最近可见）筛选器来更新设备：

* 设备上已启用[自动更新][ar-auto-updates]
* 设备在线
* 你以 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 身份登录管理控制台

将鼠标悬停在设备上，选择 **开始更新**（Start update）即可开始更新。你也可以将 [`Last seen`](https://console.tailscale.com/admin/machines?q=version%3Aupdate-available+auto-update%3Aenabled+lastseen%3Aconnected) 筛选器设置为 `Last seen: Currently connected`、`Version: Update available` 和 `Auto-update: Enabled`，只显示可以用这种方式更新的设备。如果找不到 **开始更新**（Start update）按钮，说明上述条件中有未满足的。

*（图：Machines 页面显示 Start update 选项。）*

#### Synology

在 Synology 设备上安装和更新 Tailscale 的最佳方式是下载并手动安装适用于 DiskStation Manager（DSM）的 Tailscale 套件。更多信息请参阅[在 DSM 上手动安装 Tailscale][docs-synology-manual]。

## MDM 管理的更新

要使用 MDM 管理已安装的 Tailscale 版本，请参阅你的 MDM 软件文档。你也可以使用 [MDM 策略][docs-mdm-keys-configure-auto-update]配置已安装的 Tailscale 客户端。

[ar-auto-updates]: #自动更新

[co-changelog-client]: https://tailscale.com/changelog#client

[co-contact-support]: https://tailscale.com/contact/support

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-docker]: /docs/features/containers/docker

[docs-install-linux]: /docs/install/linux

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-macos-variants-standalone]: /docs/concepts/macos-variants#standalone-variant

[docs-mdm-keys-configure-auto-update]: /docs/features/tailscale-system-policies#configure-the-auto-update-settings

[docs-synology-manual]: /docs/integrations/synology#install-tailscale-on-dsm-manually

[docs-synology-schedule-updates]: /docs/integrations/synology#schedule-automatic-updates

[xt-apple-ios-store-tailscale]: https://apps.apple.com/app/tailscale/id1470499037

[xt-apple-macos-store-tailscale]: https://apps.apple.com/app/tailscale/id1475387142

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples

[xt-google-play-tailscale]: https://play.google.com/store/apps/details?id=com.tailscale.ipn

[pk-windows-installer]: https://pkgs.tailscale.com/stable/tailscale-setup-full-latest.exe
