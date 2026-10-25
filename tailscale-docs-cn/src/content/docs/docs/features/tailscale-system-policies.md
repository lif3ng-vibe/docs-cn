---
title: "使用系统策略自定义 Tailscale"
description: "可用于通过系统策略（包括 MDM）自定义 Tailscale 客户端的配置键列表。"
---

最后验证于 Sep 29, 2026

> **注意：** 系统策略适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

本页列出了 Tailscale 客户端会读取的各项策略。如果你是使用移动设备管理（MDM）等方案在企业环境中部署 Tailscale 的系统管理员，这些策略可能会对你有所帮助。

设置这些策略可以改善用户的使用体验。例如，你可以隐藏可能让组织中不太懂技术的成员感到困惑的 UI 项，也可以强制执行某些设置以提升安全态势。

如果你在使用本文档列出的任何设置时需要帮助，或想建议新的策略，请联系我们的支持或销售团队。

## 可用设置

| 类别         | 策略键                                                                               | 支持的平台                                      |
| ------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 自动更新     | [`ApplyUpdates`](#隐藏自动更新设置macos)                                             | macOS（仅 Standalone 变体）                     |
| 自动更新     | [`CheckUpdates`](#自动检查更新windows)                                               | Windows                                         |
| 自动更新     | [`InstallUpdates`](#自动安装更新windows)                                             | Windows                                         |
| 自动更新     | [`SUAutomaticallyUpdate`](#自动安装更新macos)                                        | macOS（仅 Standalone 变体）                     |
| 自动更新     | [`SUEnableAutomaticChecks`](#自动检查更新macos)                                      | macOS（仅 Standalone 变体）                     |
| 自动更新     | [`UnstableUpdates`](#管理不稳定版本的可用性)                                         | macOS（仅 Standalone 变体）                     |
| 出口节点     | [`AdvertiseExitNode`](#通告出口节点)                                                 | Android、Linux、macOS、tvOS、Windows            |
| 出口节点     | [`AllowedSuggestedExitNodes`](#建议允许的强制出口节点)                               | iOS、Linux、macOS、Windows                      |
| 出口节点     | [`ExitNode.AllowOverride`](#强制时设置不同的出口节点)                                | Linux、macOS、Windows                           |
| 出口节点     | [`ExitNodeAllowLANAccess`](#使用出口节点时切换本地网络访问)                          | Android、iOS、Linux、macOS、Windows             |
| 出口节点     | [`ExitNodeID`](#强制始终使用某个出口节点)                                            | Android、iOS、Linux、macOS、Windows             |
| 组织         | [`ManagedByCaption`](#设置信息消息)                                                  | Android、iOS、macOS、Windows                    |
| 组织         | [`ManagedByOrganizationName`](#设置组织名称)                                         | Android、iOS、macOS、Windows                    |
| 组织         | [`ManagedByURL`](#设置支持-url)                                                      | Android、iOS、macOS、Windows                    |
| 运行时配置   | [`AllowIncomingConnections`](#设置是否允许传入连接)                                  | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`AlwaysOn.Enabled`](#设置-tailscale-始终保持连接)                                   | iOS、macOS、Windows                             |
| 运行时配置   | [`AlwaysOn.OverrideWithReason`](#设置断开连接的必填原因)                             | iOS、macOS、Windows                             |
| 运行时配置   | [`AuthBrowser.macos`](#设置用于身份验证的自定义浏览器)                               | macOS                                           |
| 运行时配置   | [`AuthKey`](#设置认证密钥)                                                           | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`DeviceSerialNumber`](#指定设备序列号)                                              | iOS、tvOS                                       |
| 运行时配置   | [`EnableDNSRegistration`](#在-active-directory-中强制注册-tailscale-ip)              | Windows                                         |
| 运行时配置   | [`EncryptState`](#加密节点状态文件)                                                  | Linux、macOS（仅 Standalone 变体）、Windows     |
| 运行时配置   | [`ExcludedPackageNames`](#设置排除的应用)                                            | Android                                         |
| 运行时配置   | [`ForceEnabled`](#强制-tailscale-始终运行)                                           | Android、iOS、macOS                             |
| 运行时配置   | [`HideDHCP121Warnings`](#抑制-dhcp-选项-121-警告)                                    | macOS                                           |
| 运行时配置   | [`Hostname`](#设置是否可以修改设备主机名)                                            | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`IncludedPackageNames`](#设置包含的应用)                                            | Android                                         |
| 运行时配置   | [`IPAddressCopiedAlertSuppressed`](#抑制-ip-地址复制通知)                            | macOS                                           |
| 运行时配置   | [`KeyExpirationNotice`](#设置密钥过期提醒期限)                                       | iOS、macOS、Windows                             |
| 运行时配置   | [`LoginURL`](#设置自定义控制服务器-url)                                              | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`MachineCertificateSubject`](#设置机器证书主题)                                     | Windows                                         |
| 运行时配置   | [`PostureChecking`](#启用设备态势数据收集)                                           | iOS、Linux、macOS、tvOS、Windows                |
| 运行时配置   | [`ReconnectAfter`](#设置重新连接计时器)                                              | Android、Linux、macOS、Windows                  |
| 运行时配置   | [`Tailnet`](#设置建议或强制的-tailnet)                                               | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`TailscaleStartOnLogin`](#用户登录时自动启动-tailscale)                             | macOS                                           |
| 运行时配置   | [`UnattendedMode`](#设置无人值守模式)                                                | Windows                                         |
| 运行时配置   | [`UseTailscaleDNSSettings`](#设置设备是否使用-tailscale-dns-设置)                    | Android、iOS、Linux、macOS、tvOS、Windows       |
| 运行时配置   | [`UseTailscaleSubnets`](#设置设备是否接受-tailscale-子网)                            | Android、iOS、Linux、macOS、tvOS、Windows       |
| UI 可见性    | [`AdminConsole`](#隐藏管理控制台菜单项)                                              | Windows                                         |
| UI 可见性    | [`AppIntroShown`](#抑制应用窗口介绍流程)                                             | macOS                                           |
| UI 可见性    | [`CLIIntegration`](#隐藏-cli-集成安装器)                                             | macOS                                           |
| UI 可见性    | [`DisableReauthWindow`](#阻止重新身份验证窗口)                                       | macOS                                           |
| UI 可见性    | [`ExitNodesPicker`](#隐藏出口节点选择器)                                             | Android、iOS、macOS、Windows                    |
| UI 可见性    | [`HiddenNetworkDevices`](#隐藏网络设备)                                              | Android、iOS、macOS                             |
| UI 可见性    | [`HideDockIcon`](#所有窗口关闭后隐藏-macos-dock-图标)                                | macOS                                           |
| UI 可见性    | [`ManageTailnetLock`](#隐藏-tailnet-lock-设置)                                       | Android、iOS、macOS                             |
| UI 可见性    | [`NetworkDevices`](#隐藏网络设备菜单)                                                | Windows                                         |
| UI 可见性    | [`OnboardingFlow`](#抑制首次启动引导流程)                                            | Android、macOS、Windows                         |
| UI 可见性    | [`PreferencesMenu`](#隐藏偏好设置菜单)                                               | Windows                                         |
| UI 可见性    | [`ResetToDefaults`](#隐藏恢复默认设置菜单项)                                         | macOS                                           |
| UI 可见性    | [`RunExitNode`](#隐藏以出口节点运行菜单项)                                           | Android、macOS、tvOS、Windows                   |
| UI 可见性    | [`StartOnLoginMenuItem`](#隐藏登录时启动菜单项)                                      | macOS                                           |
| UI 可见性    | [`TestMenu`](#隐藏调试菜单)                                                          | macOS、Windows                                  |
| UI 可见性    | [`UpdateMenu`](#隐藏更新菜单)                                                        | iOS、macOS（仅 Standalone 变体）、Windows       |
| UI 可见性    | [`VPNOnDemandSettings`](#隐藏-vpn-按需连接菜单项)                                    | iOS、macOS                                      |

## 如何应用系统策略

> **注意：**
>
> Tailscale v1.78 及更高版本会自动应用系统策略更新，无需重启客户端。Tailscale v1.76 及更早版本需要重启客户端，系统策略的更改才会生效。

虽然本页列出的许多配置键在各平台之间是通用的，但在每个平台上配置这些策略所需的步骤各不相同。

### Windows

Windows 版 Tailscale 客户端会读取并应用存储在 Windows 注册表中的系统策略。这些策略可以使用 [Microsoft Intune][docs-mdm-microsoft-intune] 等 MDM 解决方案部署。

更多信息请参阅 [Windows][docs-windows-mdm] 的平台专属文档。

### macOS 与 iOS / tvOS

macOS、iOS 和 tvOS 版 Tailscale 客户端会读取并应用存储在系统用户默认值中的系统策略。你可以通过 [Microsoft Intune][docs-mdm-microsoft-intune]、[Iru][docs-mdm-iru]（前身为 Kandji）或 [SimpleMDM][docs-mdm-simplemdm] 等 MDM 解决方案部署配置描述文件来实施这些策略。如果你没有使用基于服务器的 MDM，也可以使用 Apple Configurator 在目标设备上手动安装配置描述文件。

更多信息请参阅 [macOS][docs-macos-mdm] 或 [iOS/tvOS][docs-ios-mdm] 的平台专属文档。

### Android

Android 版 Tailscale 客户端会读取并应用存储在 Android RestrictionsManager 中的系统策略。此功能在 Tailscale 1.66 或更高版本中可用。你可以使用你喜欢的 MDM 解决方案（例如 [Google Workspace][docs-mdm-google-workspace]、[Microsoft Intune][docs-mdm-microsoft-intune] 或 [TinyMDM][docs-mdm-tinymdm]）来部署限制。

更多信息请参阅 [Android][docs-android-mdm] 的平台专属文档。

### Linux

Linux 的 Tailscale 守护进程（`tailscaled`）会读取并应用存储在 JSON（或 [HuJSON][xt-hujson]）文件中的系统策略，该文件默认位于 `/etc/tailscale/syspolicy.json`。此功能在 Tailscale 1.102 或更高版本中可用。与 Windows、macOS、iOS 和 Android 不同，Linux 没有统一的厂商提供的 MDM 框架——你可以使用已有的任意配置管理工具（例如 Ansible、Puppet 或 Chef）来部署此策略文件。

更多信息请参阅 [Linux][docs-linux-mdm] 的平台专属文档。

## 查看设备上的系统策略

你可以使用 Tailscale CLI 命令 [`tailscale syspolicy list`][docs-cli-syspolicy] 查看对客户端强制执行的系统策略。输出中还会包含已存在的系统策略错误。

```shell
Name                      Origin             Value        Error
----                      ------             -----        -----
AllowIncomingConnections  Platform (Device)  never
Tailnet                   Platform (Device)  example.com
TestMenu                  Platform (Device)  show
```

## 重新加载设备上的系统策略

只要操作系统通知客户端策略设置发生变化，Tailscale 客户端就会自动应用来自 MDM 和组策略的更改。如果你使用其他机制配置策略设置（例如在 Windows 上手动创建注册表值），可以使用 Tailscale CLI 命令 [`tailscale syspolicy reload`][docs-cli-syspolicy] 强制重新加载并重新应用已更改的策略设置。输出中同样会显示已存在的系统策略错误。

```shell
Name                      Origin             Value        Error
----                      ------             -----        -----
AdminConsole              Platform (Device)               {unexpected key value type}
AllowIncomingConnections  Platform (Device)  never
Tailnet                   Platform (Device)  example.com
TestMenu                  Platform (Device)  show
```

> **注意：**
>
> 使用 Tailscale CLI 命令 [`tailscale syspolicy reload`][docs-cli-syspolicy] 不会触发组策略或 MDM 同步。将配置的策略设置推送到受管设备的时机取决于操作系统和 MDM 解决方案。

## 可用的系统策略

以下是 Tailscale 客户端会读取的系统策略列表。

### 配置自动更新设置

#### 隐藏自动更新设置（macOS）

> **注意：**
>
> 此系统策略仅适用于 macOS 版 Tailscale 的 Standalone 变体。从 Mac App Store 下载 Tailscale 时，此设置在 Tailscale 中始终隐藏。更新设置应改为在 Mac App Store 中管理。

如果你不想让用户自行开关更新的自动安装，可以使用 `ApplyUpdates` 策略。将此设置设为 `hide` 后，用户将看不到"自动安装更新"菜单项，也无法配置自动更新。

* **支持的平台：** macOS（仅 Standalone 变体）

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.52

#### 自动检查更新（Windows）

Windows 版 Tailscale 客户端会定期检查更新，并在有新版本可用时通知用户。我们建议保持此功能开启，以确保你的用户能及时获得安全更新。

不过，你可能更希望手动部署更新、禁用新版本通知，或在所有设备上启用自动更新。为此，请使用键为 `CheckUpdates` 的策略。默认值 `user-decides` 会启用更新检查，但允许用户手动禁用。将此值设为 `never` 可禁用自动检查更新。将此值设为 `always` 可禁止用户退出更新检查。

* **支持的平台：** Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56

#### 自动安装更新（Windows）

Windows 版 Tailscale 客户端还可以自动安装更新。我们建议始终开启此功能，以确保你的用户能及时获得安全更新。

要在所有设备上控制自动更新，你可以在策略中设置 `InstallUpdates` 键。设为 `always` 会在客户端中启用自动更新，设为 `never` 则禁用。默认值 `user-decides` 会使用管理控制台中 **Settings > Device management > Auto-update Tailscale** 下设置的值，并允许用户在 Tailscale 应用设置中本地覆盖该值。

* **支持的平台：** Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56

#### 自动安装更新（macOS）

> **注意：**
>
> 此系统策略仅适用于 macOS 版 Tailscale 的 Standalone 变体。从 Mac App Store 下载 Tailscale 时，只要开启了应用的自动更新，系统就会自动为你更新。

如果你使用的是 macOS 版 Tailscale 的 Standalone 版本，客户端可以自动安装更新。这使用的是 Sparkle 框架。我们建议始终开启此功能，以确保你的用户能及时获得安全更新。为此，请使用键为 `SUAutomaticallyUpdate` 的布尔策略。注意，当该策略设为 `true` 时，用户可能需要在更新应用前进行确认。

不过，如果你手动管理更新，或希望用户收到手动更新的提醒，可以禁用自动安装。当 `SUAutomaticallyUpdate` 设为 `false` 时，macOS 版 Tailscale 的 Standalone 变体会在安装更新前要求用户确认。

* **支持的平台：** macOS（仅 Standalone 变体）

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.52

#### 自动检查更新（macOS）

> **注意：**
>
> 此系统策略仅适用于 macOS 版 Tailscale 的 Standalone 变体。从 Mac App Store 下载 Tailscale 时，只要开启了应用的自动更新，系统就会自动为你更新。

如果你使用的是 macOS 版 Tailscale 的 Standalone 版本，客户端会定期自动检查更新，并在有新版本可用时通知用户。这使用的是 Sparkle 框架。我们建议保持此功能开启，以确保你的用户能及时获得安全更新。

不过，你可能更希望手动部署更新并禁用新版本通知。为此，请使用键为 `SUEnableAutomaticChecks` 的布尔策略。设为 `true` 时，macOS 版 Tailscale 的 Standalone 变体会自动检查更新。将此值设为 `false` 可禁用自动检查更新。

* **支持的平台：** macOS（仅 Standalone 变体）

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.46

#### 管理不稳定版本的可用性

从 Tailscale v1.60 开始，macOS 版 Tailscale 的 Standalone 变体允许用户选择接收客户端的不稳定版本，**设置**界面中会有相应的开关：

*（图：macOS 客户端设置对话框，打开了 About 面板，突出显示"Update to unstable versions"开关。）*

你可以为 `UnstableUpdates` 策略设置一个值来强制指定此设置。例如，将 `UnstableUpdates` 设为 `never` 意味着你的用户将无法更新到客户端的不稳定版本。你可以部署此策略，防止不太懂技术的用户加入可能更容易出问题的客户端预发布版本。

* **支持的平台：** macOS（仅 Standalone 变体）

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.60

### 配置出口节点设置

#### 通告出口节点

`AdvertiseExitNode` 策略控制设备是否将自身通告为出口节点，供其他用户及其设备使用。

* **支持的平台：** Android、Linux、macOS、tvOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56、1.102（Linux）

#### 建议允许的强制出口节点

`AllowedSuggestedExitNodes` 策略控制 Tailscale 在客户端中以及通过 [`tailscale exit-node suggest`][docs-cli-exit-node] 命令推荐哪些出口节点。当 [`ExitNodeID`][ar-exit-node-force-use] 为 `auto:any` 时，它还会限制自动选择的范围。将此策略设置为出口节点 ID 的列表。每个 ID 都可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面或通过 [Tailscale API][docs-api] 找到。

如果未设置 `AllowedSuggestedExitNodes`，则允许所有出口节点。如果设置了 `AllowedSuggestedExitNodes` 但为空（不包含任何出口节点 ID），则不允许任何出口节点。

此策略未指定的其他出口节点仍然可以使用，但不会被推荐。

* **支持的平台：** iOS、Linux、macOS、Windows

* **可选值：** 未设置、空集合，或由出口节点设备 ID 字符串组成的列表

* **加入的 Tailscale 版本：** 1.70、1.102（Linux）

#### 使用出口节点时切换本地网络访问

**允许本地网络访问**菜单项让你的用户可以控制在使用的出口节点期间，是否仍能访问本地网络上的设备。如果你希望代用户控制此设置，可以使用 `ExitNodeAllowLANAccess` 策略。有关此功能的更多信息，请参阅[出口节点主题][docs-exit-nodes-use-exit-node]。

* **支持的平台：** Android、iOS、Linux、macOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56、1.66（Android）、1.102（Linux）

#### 强制始终使用某个出口节点

`ExitNodeID` 策略强制 Tailscale 客户端始终使用指定的出口节点。如果你希望将所有互联网流量路由经过某个节点以进行检查或日志记录，这会很有用。此策略生效时，用户将无法禁用或选择其他出口节点。客户端 UI 中会显示一条消息，告知用户这一限制。

此键的值应为某台出口节点设备的 ID，或 `auto:any`。

如果你指定了某台出口节点设备的 ID，该设备将作为你 tailnet 的强制出口节点。你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面或通过 [Tailscale API][docs-api] 找到 tailnet 中任何设备的 ID。

将 `ExitNodeID` 设为 `auto:any` 可要求使用由 Tailscale 自动选择的出口节点。要限制可选范围，可将 [`AllowedSuggestedExitNodes`][ar-exit-node-allowed] 设置为允许的出口节点列表。

如果你使用此策略但又想让用户选择其他出口节点，可以同时加入 `ExitNode.AllowOverride` 系统策略。

请注意，如果被强制使用的出口节点离线，客户端设备将无法访问互联网，直到该出口节点恢复在线。如果你指定 `auto:any` 且所有出口节点都离线，情况也是如此。

另请注意，如果客户端设备无法连接到指定的出口节点，互联网连接将不可用。当存在强制门户（例如需要向 Tailscale 进行身份验证）或客户端无法连接到 Tailscale 协调服务器时，就可能出现这种情况。

* **支持的平台：** Android、iOS、Linux、macOS、Windows

* **可选值：** 字符串，出口节点 ID 或 auto:any

* **加入的 Tailscale 版本：** 1.56、1.66（Android）、1.70.0（auto:any）、1.102（Linux）

*（图：macOS 客户端菜单，显示"Using Exit Node"。出口节点菜单中的选项已禁用。）*

#### 强制时设置不同的出口节点

`ExitNode.AllowOverride` 系统策略允许用户在启用了要求使用出口节点的 `ExitNodeID=auto:any` 系统策略时，选择其他出口节点。

* **支持的平台：** Linux、macOS、Windows

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.88、1.102（Linux）

### 显示组织的联系信息

#### 设置信息消息

使用 `ManagedByCaption` 策略指定一条显示在 Tailscale 客户端 **Managed By** 区域的说明文字。你可以使用这个字符串值，向用户提供如何联系你组织内 Tailscale 支持资源的信息。

* **支持的平台：** Android、iOS、macOS、Windows

* **可选值：** 任意字符串

* **加入的 Tailscale 版本：** 1.52、1.62（Windows）、1.66（Android）

#### 设置组织名称

使用 `ManagedByOrganizationName` 策略指定管理 Tailscale 的组织名称，例如 *"XYZ Corp, Inc."*。

该值会显示在 Tailscale 客户端中，方便用户联系你的内部支持资源。

* **支持的平台：** Android、iOS、macOS、Windows

* **可选值：** 任意字符串

* **加入的 Tailscale 版本：** 1.52、1.62（Windows）、1.66（Android）

#### 设置支持 URL

使用 `ManagedByURL` 策略指定一个指向服务台网页或组织内其他用户帮助资源的 URL。在 Tailscale UI 中选择 **Support** 按钮时会打开该网页。

* **支持的平台：** Android、iOS、macOS、Windows

* **可选值：** 有效 URL

* **加入的 Tailscale 版本：** 1.52、1.62（Windows）、1.66（Android）

### 其他设置

#### 设置是否允许传入连接

`AllowIncomingConnections` 策略决定 Tailscale 是否应允许指向该设备的传入连接（也称为"shields up"）。它会覆盖[访问控制策略][docs-access-control]以拒绝对该设备的访问，从而阻止所有通过 Tailscale 的传入连接。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56、1.66（Android）、1.102（Linux）

#### 设置 Tailscale 始终保持连接

`AlwaysOn.Enabled` 系统策略阻止用户断开与 tailnet 的连接或退出客户端。启用此策略后，你还可以启用 [`AlwaysOn.OverrideWithReason`][ar-disconnect-reason] 策略来要求提供断开连接的原因，并使用 [`ReconnectAfter`][ar-reconnect-timer] 系统策略设置一个计时器，定义客户端可以与 tailnet 保持断开的时长。

> **警告：**
>
> Tailscale 在 1.84 版本中弃用了 `ForceEnabled` 系统策略。它仍可继续工作，但我们建议改用 [`AlwaysOn.Enabled`][ar-always-connected] 系统策略。

* **支持的平台：** iOS、macOS、Windows

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.84

#### 设置断开连接的必填原因

`AlwaysOn.OverrideWithReason` 系统策略要求用户在断开 Tailscale 客户端时提交原因。此系统策略仅在 [`AlwaysOn.Enabled`][ar-always-connected] 也被启用时可用。用户提供的原因会显示在管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面中。

在 Windows 和 macOS 上，用户可以通过以下方式之一提供原因：

* 在尝试断开 tailnet 或退出客户端时，在客户端 UI 弹出的对话框中输入原因。
* 使用 CLI 命令 [`tailscale down --reason "<description>"`][docs-cli-down]，并在引号中提供描述。例如 `tailscale down --reason "DNS issues"`。

在 iOS 上，用户可以在客户端 UI 显示的对话框中提供原因。不支持 CLI 命令方式。

* **支持的平台：** iOS、macOS、Windows

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.84

#### 设置认证密钥

`AuthKey` 系统策略允许你指定一个[认证密钥][docs-auth-keys]，无需用户交互即可对受管设备进行身份验证。所有客户端在启动时都会自动尝试使用该认证密钥，除非客户端已经登录 Tailscale。

> **危险：**
>
> 将认证密钥存储在 MDM 解决方案中存在重大安全风险。如果 MDM 被攻破，攻击者就可以获取这些认证密钥，并用它们接入目标网络。请仔细评估组织的安全态势后再考虑此选项。例如，确保为设备的[标签][docs-tags]专门配置认证密钥，并确保[访问控制策略][docs-access-control]只在 tailnet 与带标签设备之间授予必要的访问权限。
>
> 如果你怀疑某个认证密钥已泄露，请[撤销该认证密钥][docs-auth-keys-revoke]。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** Tailscale 认证密钥。建议使用一次性认证密钥。

* **加入的 Tailscale 版本：** 1.74、1.102（Linux）

#### 指定设备序列号

在 iOS 和 tvOS 上，像 Tailscale 这样的第三方应用无法访问设备序列号，除非 MDM 解决方案配置为向 Tailscale 提供该信息。可以将 `DeviceSerialNumber` 策略设置为一个字符串值，向 Tailscale 提供设备的序列号。当这两个平台上[启用了态势检查][ar-posture-checking]且 `DeviceSerialNumber` 非空时，序列号会上报给协调服务器，并显示在管理控制台中。

* **支持的平台：** iOS、tvOS

* **可选值：** 包含设备序列号的字符串

* **加入的 Tailscale 版本：** 1.70

#### 设置排除的应用

`ExcludedPackageNames` 系统策略允许你指定一个以逗号分隔的 Android 软件包名称列表，这些应用将被排除在 Tailscale 的路由和 DNS 之外，即使 Tailscale 已连接。更多信息请参阅[基于应用的拆分隧道][docs-android-app-split-tunneling]主题。

此策略仅在 Android 上受支持。

* **支持的平台：** Android

* **可选值：** 字符串（以逗号分隔的应用软件包名称列表，例如 com.google.android.apps.maps,com.google.android.calendar）

* **加入的 Tailscale 版本：** 1.70

#### 在 Active Directory 中强制注册 Tailscale IP

`EnableDNSRegistration` 系统策略为 Active Directory 中的 Tailscale 接口强制执行 DNS 注册和动态 DNS 更新。此策略还会阻止 Tailscale 修改在网络适配器属性中或通过其他方式配置的设置。

此策略仅在 Windows 上受支持。

* **支持的平台：** Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.84

#### 强制 Tailscale 始终运行

> **警告：**
>
> Tailscale 在 1.84 版本中弃用了 `ForceEnabled` 系统策略。它仍可继续工作，但我们建议改用 [`AlwaysOn.Enabled`][ar-always-connected] 系统策略。

设置为 true 时，`ForceEnabled` 布尔策略指示 Tailscale 始终保持连接，并主动监控隧道状态以发现断开。**断开连接**开关将被禁用，以防止用户自行关闭 VPN。尝试断开时会显示一条横幅，告知用户组织策略禁止断开 Tailscale。如果客户端检测到因 Tailscale VPN 进程被终止而导致 VPN 隧道断开，Tailscale 会自动重启并重新连接。

此策略应始终与始终开启的 VPN 配置描述文件（在受监管的 iOS 设备上可用）配合使用。你可能还想将 `VPNOnDemandSettings` 设为 `hide`，以防止用户与你配置的按需 VPN 设置交互。

* **支持的平台：** Android、iOS、macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.52

#### 抑制 DHCP 选项 121 警告

DHCP 选项 121 允许局域网上的 DHCP 服务器在无需用户输入的情况下通告给定 CIDR 范围的路由规则。虽然只有极少数网络使用此功能向客户端部署路由规则，但它也可能被局域网中处于特权位置的攻击者滥用，误导客户端将本应送往 Tailscale 接口的流量路由到 Tailscale 隧道之外。这种对 DHCP 121 的恶意利用也被称为 [TunnelVision][bl-tunnelvision] 漏洞（CVE-2024-3661）。

默认情况下，Tailscale v1.68 及更高版本会检测 DHCP 选项 121 的使用，并在检测到使用该选项时在 UI 中向用户显示警告。如果你确有使用选项 121 的正当需求，可以将 `HideDHCP121Warnings` 系统策略设为 `true` 来隐藏此类警告。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.68

#### 设置包含的应用

`IncludedPackageNames` 系统策略允许你指定一个以逗号分隔的 Android 软件包名称列表，只要 Tailscale 已连接，这些应用就会被强制使用 Tailscale 进行路由和 DNS。定义了此策略的值后，其他应用都会忽略 Tailscale。更多信息请参阅[基于应用的拆分隧道][docs-android-app-split-tunneling]主题。

此策略仅在 Android 上受支持。

* **支持的平台：** Android

* **可选值：** 字符串（以逗号分隔的应用软件包名称列表，例如 com.google.android.apps.maps,com.google.android.calendar）

* **加入的 Tailscale 版本：** 1.70

#### 抑制 IP 地址复制通知

当你使用 Tailscale 菜单栏图标将设备的 IP 地址复制到剪贴板时，会显示一条包含该 IP 地址的通知。可以使用 `IPAddressCopiedAlertSuppressed` 策略来抑制这条**已将 IP 地址复制到剪贴板**通知。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.50

#### 设置密钥过期提醒期限

`KeyExpirationNotice` 策略控制密钥过期前多久显示提醒。默认为 24 小时。

* **支持的平台：** iOS、macOS、Windows

* **可选值：** Go 风格的时长，例如 24h 或 5h25m30s

* **加入的 Tailscale 版本：** 1.50（Windows）、1.58（macOS、iOS）

#### 设置用于身份验证的自定义浏览器

`AuthBrowser.macos` 策略控制用于打开身份验证 URL 的浏览器。该值应设置为首选浏览器的 bundle identifier。如果指定的应用包不存在，将使用用户的系统默认浏览器。

* **支持的平台：** macOS

* **可选值：** 字符串值，例如 com.apple.Safari

* **加入的 Tailscale 版本：** 1.94

#### 设置自定义控制服务器 URL

`LoginURL` 策略可用于指定自定义控制服务器 URL。除非你没有使用标准的 Tailscale 服务器，否则不应更改此设置。如果你部署的是自己的服务器（例如 Headscale），请使用此策略。

\- 现已弃用的键 `ControlURL` 曾在 macOS 和 iOS 版 Tailscale 的早期版本中使用

#### 设置机器证书主题

`MachineCertificateSubject` 策略支持使用外部预配的机器证书进行签名注册请求。此策略仅适用于特定的企业客户，这些客户会收到关于如何正确配置此选项的进一步文档。

* **支持的平台：** Windows

* **可选值：** 请查阅客户专属文档

* **加入的 Tailscale 版本：** 1.52

#### 启用设备态势数据收集

`PostureChecking` 策略用于启用[设备态势][docs-device-posture]数据的收集。

* **支持的平台：** iOS、Linux、macOS、tvOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.52、1.102（Linux）

#### 设置重新连接计时器

`ReconnectAfter` 系统策略允许你的组织设置一个计时器，指示客户端可以与 tailnet 保持断开的时长。你可以单独使用它，也可以与 [`AlwaysOn.Enabled`][ar-always-connected] 策略配合使用。

* **支持的平台：** Android、Linux、macOS、Windows

* **可选值：** 有关支持的时长字符串，请参阅 https\://pkg.go.dev/time#ParseDuration。

* **加入的 Tailscale 版本：** 1.84、1.86（macOS）、1.102（Linux）

#### 设置建议或强制的 tailnet

`Tailnet` 策略允许组织指定一个或多个 tailnet，在设备注册时予以建议或强制要求。将策略值设置为以逗号分隔的 [tailnet ID][docs-tailnet-name-tailnet-id] 或组织 ID 列表，例如 `T123456CNTRL,o123456CNTRL` 或 `required:T123456CNTRL,o123456CNTRL`。tailnet ID 会建议或限制登录到特定的 tailnet。组织 ID 会建议或限制登录到该组织下的任何 tailnet。

系统会根据策略引导用户前往正确的 IdP 和 tailnet。如果策略值带有 `required:` 前缀，Tailscale 将要求使用其中之一的值，不允许设备注册到任何其他 tailnet。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** 字符串（以逗号分隔的 tailnet ID 或组织 ID 列表）

* **加入的 Tailscale 版本：** 1.52、1.66（Android）、1.102（Linux）

#### 抑制首次启动引导流程

`OnboardingFlow` 策略允许你禁用首次在设备上启动 Tailscale 时出现的客户端引导流程。如果最终用户已经熟悉该产品、可以自行上手，你可以禁用它。在 macOS 上禁用引导流程时，通常会改用配置描述文件自动完成 VPN 配置。

> **警告：**
>
> Tailscale 在 1.86 版本中弃用了 `TailscaleOnboardingSeen` 系统策略。它仍可继续工作，但我们建议改用 `OnboardingFlow` 系统策略。

* **支持的平台：** Android、macOS、Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.86

#### 抑制应用窗口介绍流程

`AppIntroShown` 策略允许你禁用首次在设备上登录 Tailscale 时出现的"欢迎使用 Tailscale 应用"模态窗口介绍。如果最终用户已经熟悉该产品、可以自行上手，你可以禁用它。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.96

#### 用户登录时自动启动 Tailscale

在 Mac 上首次打开该应用时，Tailscale 会安装一个 macOS 登录助手。这使 Tailscale 可以在用户登录其账户时自动启动。`TailscaleStartOnLogin` 布尔策略控制登录助手是否应在登录时启动 Tailscale。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.46

#### 设置无人值守模式

`UnattendedMode` 策略用于设置**无人值守模式**选项。

* **支持的平台：** Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.52

#### 设置设备是否使用 Tailscale DNS 设置

`UseTailscaleDNSSettings` 策略指示 Tailscale 在隧道连接时是否应用其 DNS 配置。此策略等效于 [`tailscale set --accept-dns`][docs-cli-set]，让管理员可以在必要时覆盖用户选择的 DNS 偏好。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56、1.66（Android）、1.102（Linux）

#### 设置设备是否接受 Tailscale 子网

`UseTailscaleSubnets` 策略指示 Tailscale 是否接受 tailnet 中其他节点通告的子网。这等效于 [`tailscale set --accept-routes`][docs-cli-set]。如果关闭此选项，设备将无法访问子网路由器背后的其他设备。当此策略未指定值时，Tailscale 在 Windows、macOS、Android 和 iOS 上默认为 `true`，在 Linux/BSD 上默认为 `false`。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** always、never、user-decides

* **加入的 Tailscale 版本：** 1.56、1.66（Android）、1.102（Linux）

#### 设置是否可以修改设备主机名

`Hostname` 策略允许 IT 管理员覆盖操作系统中配置并上报给协调服务器的主机名。这在移动设备上尤其有用，因为操作系统提供的主机名通常只包含设备制造商名称和型号。

* **支持的平台：** Android、iOS、Linux、macOS、tvOS、Windows

* **可选值：** 字符串值，例如 user-macbook-pro

* **加入的 Tailscale 版本：** 1.80、1.102（Linux）

#### 加密节点状态文件

`EncryptState` 策略指示 Tailscale 在磁盘上仅以加密格式存储节点状态文件。节点状态文件包含[节点密钥和机器密钥][bl-key-management]等凭证，如果以未加密形式存储，可能会被复制到其他设备上。

> **注意：**
>
> 无论此策略如何设置，Android、iOS、macOS（App Store 变体）和 tvOS 始终以加密方式存储状态文件。此策略仅影响 Windows 和 macOS（Standalone 变体）上的行为。

* **支持的平台：** Linux、macOS（仅 Standalone 变体）、Windows

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.86、1.102（Linux）

### 更改 UI 项的可见性

#### 隐藏管理控制台菜单项

`AdminConsole` 策略可用于显示或隐藏 Tailscale 菜单中的 **Admin Console** 项。

* **支持的平台：** Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏 CLI 集成安装器

`CLIIntegration` 策略可用于显示或隐藏 Tailscale 设置页面中的 **CLI Integration** 项。

当此策略设为 `hide` 时，如果用户尝试通过应用设置将 Tailscale CLI 助手安装到 `/usr/local/bin/tailscale`，将显示以下消息：

* 此 Tailscale 安装由你的组织管理。请联系管理员以开始使用 Tailscale CLI。

- **支持的平台：** macOS

- **可选值：** show、hide

- **加入的 Tailscale 版本：** 1.68

#### 阻止重新身份验证窗口

`DisableReauthWindow` 策略允许你抑制 Tailscale 原生的用户重新身份验证通知。如果你不希望 Tailscale 直接通知用户其密钥已过期，可以禁用它。禁用后，当密钥过期时，Tailscale 会尝试发送一条 macOS 系统通知。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.104

#### 隐藏出口节点选择器

`ExitNodesPicker` 策略可用于显示或隐藏 Tailscale 客户端中用于选择出口节点的所有 UI 项。

* **支持的平台：** Android、iOS、macOS、Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50、1.66（Android）

#### 隐藏网络设备

`HiddenNetworkDevices` 策略可用于隐藏 Tailscale 客户端中通常显示的一类或多类网络设备。管理员可以选择隐藏：

* 当前用户拥有的设备
* 其他用户拥有的设备
* 带标签的设备

如果三个选项全部选择，**Network Devices** 菜单项将完全消失，用户将无法发现 tailnet 中的任何设备。

* **支持的平台：** Android、iOS、macOS

* **可选值：** 字符串数组。使用以下一项或多项：current-user、other-users、tagged-devices。

* **加入的 Tailscale 版本：** 1.52、1.66（Android）

#### 隐藏 Tailnet Lock 设置

`ManageTailnetLock` 策略可用于显示或隐藏 **Manage Tailnet Lock** 菜单项。

* **支持的平台：** Android、iOS、macOS

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50、1.66（Android）

#### 隐藏网络设备菜单

`NetworkDevices` 策略可用于显示或隐藏 Tailscale 客户端中的 **Network Devices** 菜单项。

* **支持的平台：** Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏偏好设置菜单

`PreferencesMenu` 策略可用于显示或隐藏 Tailscale 客户端中的 **Preferences** 菜单项。

* **支持的平台：** Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏恢复默认设置菜单项

`ResetToDefaults` 策略可用于显示或隐藏 Tailscale 客户端中的 **Reset to Defaults** 菜单项。

* **支持的平台：** macOS

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏以出口节点运行菜单项

`RunExitNode` 策略可用于显示或隐藏 **Run as Exit Node** 菜单项。

* **支持的平台：** Android、macOS、tvOS、Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50、1.66（Android）

#### 隐藏登录时启动菜单项

`StartOnLoginMenuItem` 策略可用于显示或隐藏 **Start on Login** 菜单项。

* **支持的平台：** macOS

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏调试菜单

`TestMenu` 策略可用于显示或隐藏 Tailscale 客户端中的[调试菜单][docs-troubleshooting-debug]。在 macOS 上，此系统策略还会隐藏按住 Option 键并选择 Tailscale 菜单栏图标时显示的所有信息。

* **支持的平台：** macOS、Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50

#### 隐藏更新菜单

`UpdateMenu` 策略可用于显示或隐藏 Windows 上的 **Update Tailscale** 菜单选项，以及 macOS 和 iOS 上的 **Update Available** 选项。

* **支持的平台：** iOS、macOS（仅 Standalone 变体）、Windows

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.50（Windows）、1.56（macOS \[仅 Standalone 变体]、iOS）

#### 隐藏 VPN 按需连接菜单项

`VPNOnDemandSettings` 策略可用于显示或隐藏 **VPN On Demand** 菜单项。如果你正在为 Tailscale 部署自己的 VPN 配置描述文件，且不希望用户与你为其设置的按需 VPN 配置交互，可以使用此设置。

* **支持的平台：** iOS、macOS

* **可选值：** show、hide

* **加入的 Tailscale 版本：** 1.52

#### 所有窗口关闭后隐藏 macOS Dock 图标

macOS 上的 Tailscale Dock 图标在存在应用窗口时显示。默认情况下，Tailscale 会在 Dock 中保留一个图标，以便快速重新打开主应用窗口。可以将 `HideDockIcon` 策略设为 `true` 来阻止此行为，在所有窗口关闭后隐藏 Dock 图标。

* **支持的平台：** macOS

* **可选值：** 布尔值

* **加入的 Tailscale 版本：** 1.94

[ar-always-connected]: #设置-tailscale-始终保持连接

[ar-disconnect-reason]: #设置断开连接的必填原因

[ar-exit-node-allowed]: #建议允许的强制出口节点

[ar-exit-node-force-use]: #强制始终使用某个出口节点

[ar-posture-checking]: #启用设备态势数据收集

[ar-reconnect-timer]: #设置重新连接计时器

[bl-key-management]: https://tailscale.com/blog/tailscale-key-management

[bl-tunnelvision]: https://tailscale.com/blog/tunnelvision-analysis

[docs-access-control]: /docs/features/access-control

[docs-android-app-split-tunneling]: /docs/features/client/android-app-split-tunneling

[docs-android-mdm]: /docs/integrations/mdm/android

[docs-api]: /docs/reference/tailscale-api

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cli-down]: /docs/reference/tailscale-cli#down

[docs-cli-exit-node]: /docs/reference/tailscale-cli#exit-node

[docs-cli-set]: /docs/reference/tailscale-cli#set

[docs-cli-syspolicy]: /docs/reference/tailscale-cli#syspolicy

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes-use-exit-node]: /docs/features/exit-nodes#use-the-exit-node

[docs-ios-mdm]: /docs/integrations/mdm/ios

[docs-linux-mdm]: /docs/integrations/mdm/linux

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-google-workspace]: /docs/integrations/mdm/google-workspace

[docs-mdm-iru]: /docs/integrations/mdm/iru

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[docs-mdm-simplemdm]: /docs/integrations/mdm/simplemdm

[docs-mdm-tinymdm]: /docs/integrations/mdm/tinymdm

[docs-tags]: /docs/features/tags

[docs-tailnet-name-tailnet-id]: /docs/concepts/tailnet-name#tailnet-id

[docs-troubleshooting-debug]: /docs/reference/debug-menu

[docs-windows-mdm]: /docs/integrations/mdm/windows-mdm

[xt-hujson]: https://github.com/tailscale/hujson
