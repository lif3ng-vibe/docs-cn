---
title: "用 MSI 在 Windows 上安装 Tailscale"
description: "本主题介绍如何使用 Windows 安装程序（MSI）包安装 Tailscale。如果你想使用 Tailscale `.exe` 安装程序，请参阅[在 Windows 上安装 Tailscale][docs-install-windows]。"
---

最后验证于 Jan 5, 2026

> **注意：**
>
> 当前可供[下载](https://tailscale.com/download/windows)的 Tailscale 客户端要求 Windows 10 或更高版本，或 Windows Server 2016 或更高版本。

本主题介绍如何使用 Windows 安装程序（MSI）包安装 Tailscale。如果你想使用 Tailscale `.exe` 安装程序，请参阅[在 Windows 上安装 Tailscale][docs-install-windows]。

## 安装步骤

1. 从 [Tailscale Packages][pk-stable-windows] 页面下载最新的 `.msi` 文件。你需要根据 CPU 架构选择版本。如果你的架构基于 `ARM64`，请使用 `x86` 版本。

2. 运行安装程序。你可以双击下载的文件，也可以使用 [`msiexec`][xt-microsoft-msiexec] 命令：

   `msiexec /i <path_to_tailscale_msi.msi>`

   （可选）把 `msiexec` 的日志信息写入文件。日志文件所在的文件夹必须已经存在。

   `msiexec /L <path_to_log.log> /i <path_to_tailscale_msi.msi>`

3. 安装完成后，留意系统托盘中新出现的 Tailscale 图标。如果看不到它，请选择向上箭头，在系统托盘溢出区域中找到它。

4. 选择 Tailscale 图标，查看配置选项和状态消息。

5. 在你的账户下方，选择**登录**（Log in）以打开浏览器窗口，并使用[你的 SSO 身份提供方][docs-sso-providers]进行认证。

## 卸载步骤

用户可以通过 Windows 控制面板[卸载 Tailscale][docs-uninstall]。

出于系统管理或调试目的，也可以使用 `msiexec` 卸载。如果使用 `msiexec` 卸载，必须使用与安装客户端时相同的 `.msi` 文件。

```
msiexec /x <path_to_tailscale_msi.msi>
```

你也可以使用 `/L` 选项把 `msiexec` 的日志信息写入文件。

```
msiexec /L <path_to_log.log> /x <path_to_tailscale_msi.msi>
```

## 属性

使用 `msiexec` 命令行工具时，你可以设置若干 MSI 属性来控制用户使用 Tailscale 客户端的体验。例如，以下安装命令会隐藏 Tailscale 客户端中的**网络设备**（Network Devices）菜单项：

```
msiexec TS_NETWORKDEVICES="hide" /i tailscale-setup-1.22.0-amd64.msi
```

Tailscale MSI 属性一经设置，会存储在 `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Tailscale` 注册表键中。所有 Tailscale MSI 属性的[注册表值类型][xt-ms-windows-registry-values]均为 `REG_SZ`。

以下属性可用于 MSI。

### INSTALLDIR

指定安装目录在磁盘上的路径。安装路径默认为 `C:\Program Files\Tailscale`。

### TS\_ADMINCONSOLE

控制**管理控制台**（Admin Console）菜单的可见性

* 注册表名：`AdminConsole`
* 可能的取值："show"、"hide"

### TS\_ADVERTISEEXITNODE

控制[作为出口节点运行][docs-exit-nodes]（Run As Exit Nodes）选项的配置方式

* 注册表名：`AdvertiseExitNode`
* 可能的取值："always"、"never"、"user-decides"

### TS\_ALLOWINCOMINGCONNECTIONS

控制**偏好设置**（Preferences）> **允许传入连接**（Allow Incoming Connections）菜单项

* 注册表名：`AllowIncomingConnections`
* 可能的取值："always"、"never"、"user-decides"

### TS\_CHECKUPDATES

该策略目前不会改变 Windows 上的行为。它对应 `tailscale set --update-check`，但 Windows 客户端目前不会读取它，因为它总是检查更新。

* 注册表名：`CheckUpdates`
* 可能的取值："always"、"never"、"user-decides"

### TS\_ENABLEDNS

控制隧道连接后是否应用其 DNS 配置

* 注册表名：`UseTailscaleDNSSettings`
* 可能的取值："always"、"never"、"user-decides"

### TS\_ENABLESUBNETS

控制是否接受 tailnet 中其他节点宣告的子网

* 注册表名：`UseTailscaleSubnets`
* 可能的取值："always"、"never"、"user-decides"

### TS\_EXITNODEMENU

控制**出口节点**（Exit Nodes）菜单的可见性

* 注册表名：`ExitNodesPicker`
* 可能的取值："show"、"hide"

### TS\_FLUSHDNSONSESSIONUNLOCK

启用额外的 DNS 缓存刷新，用于调试目的。仅应在 Tailscale 支持团队建议时启用。

* 注册表名：`FlushDNSOnSessionUnlock`
* 可能的取值："1"、"0"

### TS\_INSTALLUPDATES

控制**自动安装更新**（Automatically Install Updates）的配置方式

* 注册表名：`InstallUpdates`
* 可能的取值："always"、"never"、"user-decides"

### TS\_KEYEXPIRATIONNOTICE

启用一条警告消息，它会在登录实际过期前的一段时间内显示。默认为 24 小时。

* 注册表名：`KeyExpirationNotice`
* 可能的取值：可被 Go 的 [`time.ParseDuration` 函数][xt-go-time-parseduration]解析的字符串。例如 "12h"。

### TS\_LOGINURL

控制强制使用特定的 Tailscale 协调服务器（coordination server）。更多信息请参阅[设置自定义控制服务器 URL][docs-mdm-keys-custom-control-server]。

* 注册表名：`LoginURL`
* 可能的取值：协调服务器的 URL

### TS\_NETWORKDEVICES

控制**网络设备**（Network Devices）菜单的可见性

* 注册表名：`NetworkDevices`
* 可能的取值："show"、"hide"

### TS\_NOLAUNCH

控制是否在安装过程中启动 Tailscale 客户端。该属性仅在静默安装时生效。

* 注册表名：不适用——不会向注册表保存任何值。
* 可能的取值：任意字符串。将其设为非空字符串，可阻止 Tailscale GUI 客户端在安装过程中启动。

### TS\_ONBOARDING\_FLOW

控制引导流程（onboarding flow）的可见性

* 注册表名：`OnboardingFlow`
* 可能的取值："show"、"hide"

### TS\_PREFERENCESMENU

控制**偏好设置**（Preferences）菜单的可见性

* 注册表名：`PreferencesMenu`
* 可能的取值："show"、"hide"

### TS\_TESTMENU

控制用户能否在打开 Tailscale 菜单时按住 `CTRL` 或 `SHIFT` 调出调试菜单。

* 注册表名：`TestMenu`
* 可能的取值："show"、"hide"

### TS\_UNATTENDEDMODE

控制**偏好设置**（Preferences）> **无人值守运行**（Run Unattended）菜单项

* 注册表名：`UnattendedMode`
* 可能的取值："always"、"never"、"user-decides"

### TS\_UPDATEMENU

控制**更新 Tailscale**（Update Tailscale）菜单项的可见性。

* 注册表名：`UpdateMenu`
* 可能的取值："show"、"hide"

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-install-windows]: /docs/install/windows

[docs-mdm-keys-custom-control-server]: /docs/features/tailscale-system-policies#设置自定义控制服务器-url

[docs-sso-providers]: /docs/integrations/identity

[docs-uninstall]: /docs/features/client/uninstall

[pk-stable-windows]: https://pkgs.tailscale.com/stable/#windows

[xt-go-time-parseduration]: https://pkg.go.dev/time#ParseDuration

[xt-microsoft-msiexec]: https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/msiexec

[xt-ms-windows-registry-values]: https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry-value-types
