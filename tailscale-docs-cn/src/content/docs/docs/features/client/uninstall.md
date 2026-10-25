---
title: "卸载 Tailscale"
description: "本文介绍如何从设备上卸载 Tailscale，或为调试目的彻底重置 Tailscale。"
---

最后验证于 Jul 22, 2026

本文介绍如何从设备上卸载 Tailscale，或为调试目的彻底重置 Tailscale。

#### Windows

Windows 版 Tailscale 可以像任何 Windows 应用一样，通过 Windows 控制面板卸载。依次进入 **设置**（Settings）> **应用**（Apps），找到 **Tailscale**，然后点击 **卸载**（Uninstall）按钮。

如果你想彻底删除 Tailscale（移除所有状态和本地信息），还可以删除以下路径下的文件：

```powershell
C:\ProgramData\Tailscale
C:\Users\%USERNAME%\AppData\Local\Tailscale
C:\Windows\System32\config\systemprofile\AppData\Local\Tailscale
```

`System32` 下的路径只在旧版本的 Tailscale 客户端中使用过，你的系统上可能不存在。

卸载 Tailscale 后，如果日后在这台设备上重新安装 Tailscale，它将获得一个[新的 IP 地址][docs-ip-and-dns-addresses]。

#### macOS（App Store）

Tailscale 是标准的 Mac App Store 应用。要卸载它，请[像删除其他 Mac 应用一样删除它][xt-apple-docs-mac-uninstall]。

如果你想彻底删除 Tailscale（移除所有状态和本地信息），还可以执行以下步骤：

1. 如果指定路径下存在以下文件，请将其删除。其中一些可能归 root 用户所有，删除时可能需要在终端中使用 `sudo rm -rf <path>`。

   ```shell
   ~/Library/Application Scripts/*.io.tailscale.ipn.macos
   ~/Library/Application Scripts/io.tailscale.ipn.macos
   ~/Library/Application Scripts/io.tailscale.ipn.macos.login-item-helper
   ~/Library/Application Scripts/io.tailscale.ipn.macos.share-extension
   ~/Library/Caches/io.tailscale.ipn.macos
   ~/Library/Containers/io.tailscale.ipn.macos
   ~/Library/Containers/io.tailscale.ipn.macos.login-item-helper
   ~/Library/Containers/io.tailscale.ipn.macos.network-extension
   ~/Library/Containers/io.tailscale.ipn.macos.share-extension
   ~/Library/Containers/Tailscale
   ~/Library/Group Containers/*.io.tailscale.ipn.macos
   ~/Library/HTTPStorages/io.tailscale.ipn.macos
   ~/Library/Preferences/io.tailscale.ipn.macos.plist
   ~/Library/Tailscale
   ```

2. 如果 Tailscale VPN 配置仍然存在，请将其移除。

   **macOS Ventura 13.0 或更高版本**：打开 **系统设置**（System Settings）> **网络**（Network）> **VPN**。在服务列表中查找 **Tailscale Tunnel**。如果有，选中它并点击带圈 **i** 图标，然后点击 **移除配置**（Remove Configuration）按钮。记得应用更改。

   **更早的 macOS 版本**：打开 **系统偏好设置**（System Preferences）> **网络**（Network）。在服务列表中查找 **Tailscale Tunnel**。如果有，选中它并点击底部的 **-** 按钮将其移除。记得应用更改。

3. 打开 **钥匙串访问**（Keychain Access），搜索 `tailscale`，删除找到的所有条目，包括 `tailscale-machinekey`、`tailscale-logdata` 和 `tailscale-preferences`。

完成这些步骤后，如果日后在这台设备上重新安装 Tailscale，它将获得一个[新的 IP 地址][docs-ip-and-dns-addresses]。

#### macOS（独立版）

要卸载[独立版（Standalone）][docs-macos-variants] Tailscale，请将其图标拖到废纸篓，并确认 macOS 同时移除了系统扩展。

如果你想彻底删除 Tailscale（移除所有状态和本地信息），还可以执行以下步骤：

1. 如果 Tailscale VPN 配置仍然存在，请将其移除。

   **macOS Ventura 13.0 或更高版本**：打开 **系统设置**（System Settings）> **网络**（Network）> **VPN**。在服务列表中查找 **Tailscale**。如果有，选中它并点击带圈 **i** 图标，然后点击 **移除配置**（Remove Configuration）按钮。记得应用更改。

   **更早的 macOS 版本**：打开 **系统偏好设置**（System Preferences）> **网络**（Network）。在服务列表中查找 **Tailscale Tunnel**。如果有，选中它并点击底部的 **-** 按钮将其移除。记得应用更改。

2. 如果指定路径下存在以下文件，请将其删除。其中一些可能归 root 用户所有，删除时可能需要在终端中使用 `sudo rm -rf <path>`。

   ```shell
   ~/Library/Application Scripts/*.io.tailscale.ipn.macsys
   ~/Library/Application Scripts/io.tailscale.ipn.macsys
   ~/Library/Application Scripts/io.tailscale.ipn.macsys.login-item-helper
   ~/Library/Application Scripts/io.tailscale.ipn.macsys.share-extension
   ~/Library/Caches/io.tailscale.ipn.macsys
   ~/Library/Containers/io.tailscale.ipn.macsys
   ~/Library/Containers/io.tailscale.ipn.macsys.login-item-helper
   ~/Library/Containers/io.tailscale.ipn.macsys.share-extension
   ~/Library/Containers/Tailscale
   ~/Library/Group Containers/*.io.tailscale.ipn.macsys
   ~/Library/HTTPStorages/io.tailscale.ipn.macsys
   ~/Library/Preferences/io.tailscale.ipn.macsys.plist
   /Library/Tailscale
   ```

   另外，如果安装了 [Homebrew][xt-homebrew]，你也可以运行以下命令自动完成这些文件的删除，该命令会执行 [Tailscale cask][xt-homebrew-tailscale-cask] 中定义的卸载步骤。

   ```shell
   brew uninstall --cask --zap --force tailscale
   ```

3. 打开 **钥匙串访问**（Keychain Access），搜索 `tailscale`，删除找到的所有条目，包括 `tailscale-machinekey`、`tailscale-logdata` 和 `tailscale-preferences`。

完成这些步骤后，如果日后在这台设备上重新安装 Tailscale，它将获得一个[新的 IP 地址][docs-ip-and-dns-addresses]。

#### iOS

像卸载任何 iOS 应用一样卸载 Tailscale：在 iOS 主屏幕上长按其图标，然后点按出现的 **X** 按钮。无需其他步骤。

#### tvOS

像卸载任何 tvOS 应用一样卸载 Tailscale：在 Apple TV 主屏幕上长按其图标，然后选择 **删除 Tailscale**（Delete Tailscale）。无需其他步骤。

#### Android

像卸载任何 Android 应用一样卸载 Tailscale 即可。无需其他步骤。

#### Linux

使用你当初安装二进制包时所用的包管理器的卸载命令来卸载 Tailscale：

对于所有 **Ubuntu 和 Debian 版本**，使用 apt-get 卸载：

```shell
sudo apt-get remove tailscale
```

对于 **CentOS 7 和 Amazon Linux 2**，使用 yum 卸载：

```shell
sudo yum remove tailscale
```

对于 **openSUSE Leap 15.1、15.2 和 openSUSE Tumbleweed**，使用 `zypper` 卸载：

```shell
sudo zypper rm tailscale
```

对于 **CentOS 8、CentOS Stream 9、RHEL 8 和 Fedora**，使用 `dnf` 卸载：

```shell
sudo dnf remove tailscale
```

## 彻底删除 Tailscale

如果你想彻底删除 Tailscale 并移除所有状态和本地信息，还可以删除以下文件：

```shell
/var/lib/tailscale/tailscaled.state
```

卸载 Tailscale 后，如果日后在这台设备上重新安装 Tailscale，它将获得一个[新的 IP 地址][docs-ip-and-dns-addresses]。

#### Synology

1. 从 Synology 套件中心卸载 Tailscale。
2. 在 Tailscale 管理控制台中删除 Synology 节点。
3. 删除以下路径下的文件：
   ```
   /var/packages/Tailscale/var/*
   /var/packages/Tailscale/etc/*
   ```

卸载 Tailscale 后，如果日后在这台设备上重新安装 Tailscale，它将获得一个[新的 IP 地址][docs-ip-and-dns-addresses]。

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-macos-variants]: /docs/concepts/macos-variants

[xt-apple-docs-mac-uninstall]: https://support.apple.com/102610

[xt-homebrew-tailscale-cask]: https://github.com/Homebrew/homebrew-cask/blob/master/Casks/t/tailscale-app.rb

[xt-homebrew]: https://brew.sh
