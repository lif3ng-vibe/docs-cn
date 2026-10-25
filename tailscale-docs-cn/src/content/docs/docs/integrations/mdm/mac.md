---
title: "使用 MDM 在 macOS 上部署 Tailscale"
description: "本页包含一些技术信息，供正在企业环境中使用 [Microsoft Intune][docs-mdm-microsoft-intune]、[Jamf Pro][docs-mdm-jamf]、[JumpCloud][docs-mdm-jumpcloud]、[Iru][docs-mdm-iru]（原 Kandji）或 [SimpleMDM][docs-mdm-simplemdm] 等 MDM 解决方案为 macOS 部署 Tailscale 的系统管理员参考。"
---

最后验证于 Jan 5, 2026

如果你是一名系统管理员，正在企业环境中使用 [Microsoft Intune][docs-mdm-microsoft-intune]、[Jamf Pro][docs-mdm-jamf]、[JumpCloud][docs-mdm-jumpcloud]、[Iru][docs-mdm-iru]（原 Kandji）或 [SimpleMDM][docs-mdm-simplemdm] 等 MDM 解决方案为 macOS 部署 Tailscale，本页包含的技术信息可能会对你有帮助。

我们一直在为系统管理员提供更多以编程方式管理 Tailscale 部署的选项。如果你正在部署 Tailscale，并且觉得本页目前缺少某个你需要的特定配置选项，请联系 Tailscale 支持团队。

> **注意：**
>
> 本页列出的示例使用 Mac App Store 版 Tailscale 的 bundle identifier `io.tailscale.ipn.macos`。如果你配置的是应用的独立（Standalone）版，请将其替换为 `io.tailscale.ipn.macsys` 这个 bundle identifier。
>
> 如果你想为 iOS 和 tvOS 版 Tailscale 客户端配置系统策略，请参阅[专门的主题][docs-ios-mdm]。

## 配置描述文件

如果你在使用 MDM 为 macOS 部署 Tailscale，可以使用配置描述文件（configuration profile）来自动完成设置流程中的部分步骤，减少用户被弹窗反复打扰。你还可以使用配置描述文件来强制执行特定的系统策略，或设置自动更新。

### 在配置描述文件中部署系统策略

配置描述文件可用于为 Tailscale 指定用户默认值（user defaults）。Tailscale 客户端每次启动时都会读取其用户默认值，并应用在其中找到的系统策略。通过 MDM 解决方案部署包含用户默认值的配置描述文件，可以代替用户配置 Tailscale 客户端的特定设置，让设置过程更加简单。

请参阅我们的[系统策略完整列表][docs-mdm-keys]，了解所有可配置的设置。

以下是一个配置描述文件示例，用于设置 [**ManagedByOrganizationName**][docs-mdm-keys-org-name] 和 [**IPAddressCopiedAlertSuppressed**][docs-mdm-keys-suppress-address-copy] 系统策略的值：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>PayloadDisplayName</key>
        <string>Tailscale: System Policy Configuration Profile</string>
        <key>PayloadType</key>
        <string>Configuration</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>io.tailscale.ipn.macos.mdm.797d4461-837c-4f5a-b18e-7e300b057018</string>
        <key>PayloadUUID</key>
        <string>0f451881-7ac4-4171-80ed-b55251053231</string>
        <key>PayloadContent</key>
        <array>
            <dict>
                <key>PayloadDisplayName</key>
                <string>System Policies</string>
                <key>PayloadType</key>
                <string>io.tailscale.ipn.macos</string>
                <key>PayloadVersion</key>
                <integer>1</integer>
                <key>PayloadIdentifier</key>
                <string>io.tailscale.ipn.macos.f4806335-6703-4680-8f41-f40e6f281c71</string>
                <key>PayloadUUID</key>
                <string>3e44f9b0-d309-48d3-b055-6dc683d438c8</string>
                <key>ManagedByOrganizationName</key>
                <string>Tailscale, Inc.</string>
                <key>IPAddressCopiedAlertSuppressed</key>
                <true/>
            </dict>
        </array>
    </dict>
</plist>
```

上述配置描述文件等效于下面两组 `defaults` CLI 工具命令。

对于 [Mac App Store][docs-mac-variants-app-store] 版，使用 bundle identifier。

```shell
defaults write io.tailscale.ipn.macos ManagedByOrganizationName "Tailscale, Inc."
defaults write io.tailscale.ipn.macos IPAddressCopiedAlertSuppressed -bool true
```

对于[独立（Standalone）][docs-mac-variants-standalone]版，请指定明确的属性列表（`.plist`）路径。

```shell
defaults write ~/Library/Preferences/io.tailscale.ipn.macsys.plist ManagedByOrganizationName "Tailscale, Inc."
defaults write ~/Library/Preferences/io.tailscale.ipn.macsys.plist IPAddressCopiedAlertSuppressed -bool true
```

可以使用这种直接写入应用偏好设置的技术来测试各种 MDM 配置的效果，而无需搭建完整的 MDM 环境。某些设置在客户端和网络扩展重启之后才会生效。

如果你使用这种技术测试 MDM 配置，必须在搭建完整的 MDM 环境之前将它们清除。

```shell
defaults delete ~/Library/Preferences/io.tailscale.ipn.macsys.plist ManagedByOrganizationName
defaults delete ~/Library/Preferences/io.tailscale.ipn.macsys.plist IPAddressCopiedAlertSuppressed
```

安装上述配置描述文件或运行上述命令后，应用菜单中会显示 **Managed by Tailscale, Inc.**（由 Tailscale, Inc. 管理），并且当 IP 地址被复制到剪贴板时不再显示通知横幅。

请参阅[系统策略列表][docs-mdm-keys]，了解你可以代替用户配置的其他值。

#### 使用 Tailscale 描述文件清单

Tailscale 为客户端的两种变体都维护了配置描述文件清单（profile manifest）：

* [Mac App Store][xt-gh-profile-creator-manage] 版清单
* [独立（Standalone）][xt-gh-profile-creator-prefs]版清单

描述文件清单包含对所有可用系统策略及其可能取值的机器可读描述。[iMazing Profile Editor][xt-imazing] 或 [ProfileCreator][xt-gh-profile-creator] 等应用会自动获取这些清单，并为你提供一个对用户友好的图形界面来创建配置描述文件。

要开始使用，请下载 iMazing Profile Editor 或 ProfileCreator。两种 Tailscale 变体都会出现在侧边栏的可配置应用列表中，如下方截图所示。

*（图：iMazing Profile Editor 正在配置 Tailscale 系统策略。）*

### 自动允许推送通知

Tailscale for macOS 有时会使用系统通知来告知用户。例如，以下情况下你会收到通知：

* 设备密钥即将过期
* 通过 Taildrop 收到了文件
* IP 地址被复制到剪贴板

以下是一个配置描述文件 payload 示例，用于自动允许 Tailscale 发送通知。

> **注意：**
>
> 如果你正在为独立（Standalone）版 Tailscale for macOS 创建配置描述文件，请确保将 bundle identifier `io.tailscale.ipn.macos` 替换为 `io.tailscale.ipn.macsys`。

```xml
<dict>
  <key>NotificationSettings</key>
  <array>
    <dict>
      <key>AlertType</key>
      <integer>1</integer>
      <key>BadgesEnabled</key>
      <true/>
      <key>BundleIdentifier</key>
      <string>io.tailscale.ipn.macos</string>
      <key>CriticalAlertEnabled</key>
      <true/>
      <key>NotificationsEnabled</key>
      <true/>
      <key>ShowInNotificationCenter</key>
      <true/>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>Allow Tailscale Notifications</string>
  <key>PayloadIdentifier</key>
  <string>b3dc3535-1b06-4f2d-a684-4518a6589dff</string>
  <key>PayloadOrganization</key>
  <string>Tailscale Inc.</string>
  <key>PayloadType</key>
  <string>com.apple.notificationsettings</string>
  <key>PayloadUUID</key>
  <string>056ec734-91b7-45a3-8787-98ebf2e84024</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
```

### 安装 Tailscale VPN 配置

Tailscale 应用在 Mac 上首次启动时，会安装一个 NetworkExtension VPN 配置。你可以提供一个配置描述文件，在应用启动*之前*就配置好该 VPN 配置，从而跳过这一步。首次启动时，Tailscale 应用会检测到已存在的配置并跳过安装步骤。

以下是一个有效的 `.mobileconfig` 属性列表（`.plist`）文件，可用于建立这样的 VPN 配置。

> **注意：**
>
> 如果你正在为独立（Standalone）版 Tailscale for macOS 创建配置描述文件，请确保将 `io.tailscale.ipn.macos` 替换为 `io.tailscale.ipn.macsys`，并将 `io.tailscale.ipn.macos.network-extension` 替换为 `io.tailscale.ipn.macsys.network-extension`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>Tailscale VPN Configuration Profile</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>com.your-company-name.tailscale.797d4461-837c-4f5a-b18e-7e300a057018</string>
  <key>PayloadUUID</key>
  <string>0f451881-7ac4-4171-80fd-b55251053231</string>
  <key>PayloadContent</key>
  <array>
        <dict>
        <key>PayloadDisplayName</key>
        <string>Tailscale VPN Configuration</string>
        <key>PayloadType</key>
        <string>com.apple.vpn.managed</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>com.your-company-name.tailscale-tunnel</string>
        <key>PayloadUUID</key>
        <string>7ec957e2-b165-4d1f-9946-3a7a16ae0f9b</string>
        <key>UserDefinedName</key>
        <string>Tailscale MobileConfig</string>
        <key>VPNType</key>
        <string>VPN</string>
        <key>VPNSubType</key>
        <string>io.tailscale.ipn.macos</string>
        <key>VPN</key>
         <dict>
            <key>RemoteAddress</key>
            <string>Tailscale Mesh</string>
            <key>AuthenticationMethod</key>
            <string>Password</string>
            <key>ProviderBundleIdentifier</key>
            <string>io.tailscale.ipn.macos.network-extension</string>
        </dict>
    </dict>
  </array>
</dict>
</plist>
```

### 自动批准 Tailscale 系统扩展

> **注意：**
>
> 本节仅适用于独立（Standalone）版 Tailscale for macOS。Mac App Store 中分发的 Tailscale 变体不使用系统扩展，只需安装 VPN 配置即可。

上一节介绍了如何创建配置描述文件来预装 Tailscale VPN 配置。但是，独立（Standalone）版 Tailscale 首次启动时，应用还会尝试安装一个系统扩展。默认情况下，macOS 会阻止此操作，并要求用户在"系统设置"应用中手动批准 Tailscale：

*（图：macOS 中的"System Extension Blocked"（系统扩展被阻止）警告。有两个按钮："OK"和"Open System Settings"。）*

你可以通过向配置描述文件添加系统扩展策略来默认允许该系统扩展。首先要将配置描述文件 payload 的作用范围设置为 `System`，因为系统扩展会影响 Mac 上的所有用户。在配置文件的顶层添加以下内容：

```xml
<key>PayloadScope</key>
<string>System</string>
```

然后，在配置文件的 `PayloadContent` 数组内添加该系统扩展策略：

```xml
<dict>
  <key>PayloadUUID</key>
  <string>1d08bf7d-7898-43b3-88e3-76cfb74a7c33</string>
  <key>PayloadType</key>
  <string>com.apple.system-extension-policy</string>
  <key>PayloadOrganization</key>
  <string>Tailscale</string>
  <key>PayloadIdentifier</key>
  <string>8a790b57-16da-4371-8baf-d6f65e7b50ee</string>
  <key>PayloadDisplayName</key>
  <string>Allows system extensions signed by Tailscale to run without user approval.</string>
  <key>PayloadDescription</key>
  <string/>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadEnabled</key>
  <true/>
  <key>AllowedTeamIdentifiers</key>
  <array>
    <string>W5364U7YZB</string>
  </array>
</dict>
```

macOS 强制要求具有系统作用范围的 payload 只能由 MDM 服务器部署。这意味着用户无法自行安装你刚创建的配置描述文件——你的组织需要通过 MDM 服务器推送它。

### 使用 MDM 部署 VPN On Demand 配置

> **注意：**
>
> 这是一种高级部署选项。配置不当的 VPN On Demand 设置可能会阻止你的用户连接到其 tailnet。部署 VPN On Demand 规则时请务必谨慎，尤其是在你使用任何规则在特定网络上断开 VPN 的情况下。
>
> 部署带 VPN On Demand 规则的受管 VPN 配置时必须多加小心。受管的 VPN On Demand 规则会阻止 Tailscale 客户端安装和管理自己的规则，从而影响 `AlwaysOn` 策略的行为。客户端会自动创建规则，以便在系统重置和重启后自动重启 VPN，并管理 `AlwaysOn` 及相关 MDM 策略的行为。
>
> 如果你希望获得 `AlwaysOn` 的行为，请考虑使用 `AlwaysOn.Enabled`、`AlwaysOn.OverrideWithReason` 和 `RestartAfter` [策略][docs-mdm-keys]，而不是设置 VPN On Demand 规则。Tailscale 客户端会利用这些策略自动启用 VPN On Demand 规则，确保 VPN 保持活跃。`AlwaysOn.OverrideWithReason` 可以设置为允许用户临时禁用 Tailscale，以绕开诸如网络阻止出口节点、Tailscale 控制平面或某些强制门户（captive portal）的情况。`RestartAfter` 可以设置为确保客户端在设定的时间后自动重启。

如果你正在部署自己的 VPN 配置（按照[安装 Tailscale VPN 配置][ar-install-the-tailscale-vpn-configuration]中的步骤），Apple 配置描述文件让你能够向用户部署预定义的 VPN On Demand 配置。它会根据你配置的规则自动连接或断开 Tailscale。有关此功能的更多信息，请参阅 [VPN On Demand][docs-ios-vpn-on-demand]。

通过配置描述文件为 Tailscale 配置 VPN On Demand 分为两个独立的步骤。首先，你需要部署两个系统策略键。然后，在 VPN 配置描述文件的 VPN payload 中使用 `OnDemandRules` 键来定义规则。规则可用于实现如下效果：

* 检测 iOS/macOS 设备何时连接到你的企业 Wi-Fi 网络，此时无需连接 Tailscale。
* 检测何时在使用陌生的 Wi-Fi 网络，此时应建立 Tailscale 隧道。

#### 配置所需的系统策略键

在向 VPN 配置描述文件添加 `OnDemandRules` 对象之前，先在你用于配置 Tailscale 的配置描述文件中部署以下两个系统策略：

1. `VPNOnDemandIsUserConfigured`=`true`
2. `VPNOnDemandSettings`=`hide`

这两个策略组合起来，会指示 Tailscale 不要修改按需（on demand）配置以确保客户端自动重启，并对用户隐藏 VPN On Demand 配置界面。

例如，部署以下配置描述文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>PayloadDisplayName</key>
        <string>Tailscale: System Policy Configuration Profile</string>
        <key>PayloadType</key>
        <string>Configuration</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>io.tailscale.ipn.macos.mdm.797d4461-837c-4f5a-b18e-7e300b057018</string>
        <key>PayloadUUID</key>
        <string>0f451881-7ac4-4171-80ed-b55251053231</string>
        <key>PayloadContent</key>
        <array>
            <dict>
                <key>PayloadDisplayName</key>
                <string>System Policies</string>
                <key>PayloadType</key>
                <string>io.tailscale.ipn.macos</string>
                <key>PayloadVersion</key>
                <integer>1</integer>
                <key>PayloadIdentifier</key>
                <string>io.tailscale.ipn.macos.f4806335-6703-4680-8f41-f40e6f281c71</string>
                <key>PayloadUUID</key>
                <string>3e44f9b0-d309-48d3-b055-6dc683d438c8</string>
                <key>ManagedByOrganizationName</key>
                <string>Tail and Scales, Inc.</string>
                <key>VPNOnDemandIsUserConfigured</key>
                <true/>
                <key>VPNOnDemandSettings</key>
                <string>hide</string>
            </dict>
        </array>
    </dict>
</plist>
```

#### 配置 OnDemandRules 字典

部署上述两个系统策略后，你就可以在 VPN 配置上配置 `OnDemandRules` 字典。关于可以配置的适当规则，请参阅 [Apple 配置描述文件参考][xt-apple-mobileconfig-reference]。

作为常见配置的一个示例，此描述文件会在任何 Wi-Fi 或蜂窝网络上自动连接 Tailscale，但在匹配 `TailAndScales` SSID 的任何 Wi-Fi 网络上断开连接：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>Tailscale VPN Configuration Profile</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>com.your-company-name.tailscale.797d4461-837c-4f5a-b18e-7e300a057018</string>
  <key>PayloadUUID</key>
  <string>0f451881-7ac4-4171-80fd-b55251053231</string>
  <key>PayloadContent</key>
  <array>
        <dict>
        <key>PayloadDisplayName</key>
        <string>Tailscale VPN Configuration</string>
        <key>PayloadType</key>
        <string>com.apple.vpn.managed</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>PayloadIdentifier</key>
        <string>com.your-company-name.tailscale-tunnel</string>
        <key>PayloadUUID</key>
        <string>7ec957e2-b165-4d1f-9946-3a7a16ae0f9b</string>
        <key>UserDefinedName</key>
        <string>Tailscale MobileConfig</string>
        <key>VPNType</key>
        <string>VPN</string>
        <key>VPNSubType</key>
        <string>io.tailscale.ipn.macos</string>
        <key>VPN</key>
         <dict>
            <key>RemoteAddress</key>
            <string>Tailscale Mesh</string>
            <key>AuthenticationMethod</key>
            <string>Password</string>
            <key>ProviderBundleIdentifier</key>
            <string>io.tailscale.ipn.macos.network-extension</string>
            <!-- Instruct the system to enable VPN On Demand -->
            <key>OnDemandEnabled</key>
            <integer>1</integer>
            <!-- The actual on-demand configuration rules: -->
            <key>OnDemandRules</key>
            <array>
              <!-- Disconnect on the 'TailAndScales' Wi-Fi network... -->
              <dict>
                <key>InterfaceTypeMatch</key>
                <string>WiFi</string>
                <key>SSIDMatch</key>
                <string>TailAndScales</string>
                <key>Action</key>
                <string>Disconnect</string>
              </dict>
              <!-- ... but connect on any other Wi-Fi... -->
              <dict>
                <key>InterfaceTypeMatch</key>
                <string>WiFi</string>
                <key>Action</key>
                <string>Connect</string>
              </dict>
              <!-- ... or any Cellular network. -->
              <dict>
                <key>InterfaceTypeMatch</key>
                <string>Cellular</string>
                <key>Action</key>
                <string>Connect</string>
              </dict>
            </array>
        </dict>
    </dict>
  </array>
</dict>
</plist>
```

#### MDM 初始部署

如果你在同时部署 Tailscale `.pkg` 安装包和一组配置描述文件时遇到问题，请确保你的 MDM 解决方案按照以下规则进行配置：

1. MDM 解决方案应在成功运行 `.pkg` 安装包并部署配置描述文件后重启 Mac。重启 Mac 可确保所有缓存得到更新，避免首次启动时出错。
2. 如果无法在部署流程中重启 Mac，MDM 解决方案应在部署 VPN 配置描述文件之前运行 `.pkg` 安装包并清除 LaunchServices 缓存。请参阅下一节。

##### macOS NetworkExtension 框架 bug 的解决方法

macOS 上长期存在的 bug 可能会在 VPN 应用与 VPN 配置描述文件同时部署时引发问题。如果 VPN 配置描述文件在应用完全安装并在 LaunchServices 数据库（用于跟踪 macOS 上已安装的应用和扩展）中注册之前就被应用，就会出现这些问题。

具体来说，如果 VPN 配置描述文件在应用完全安装之前就已部署，那么当 Tailscale GUI 请求系统启动 VPN 网络扩展，或 [VPN On Demand][docs-ios-vpn-on-demand] 规则被触发时，macOS 可能无法启动该 VPN 网络扩展。`nesessionmanager` 进程可能会向系统日志输出以下错误之一：

* `The VPN app used by the VPN configuration is not installed`
* `status changed to disconnected, last stop reason Plugin was disabled`

重启 Mac 通常可以解决所有此类问题，因此我们建议在部署 Tailscale 后重启 Mac。

如果你无法重启受管的 Mac（例如，因为你希望通过 **Jamf Self-Service** 应用提供一个安装 Tailscale 的按钮），并且观察到了上述症状，请将 MDM 解决方案配置为在触发安装程序时执行以下操作：

1. 部署 `.pkg` 安装包，并确保安装程序已运行完毕。
2. 运行安装程序后，在 Mac 上运行一个清除 LaunchServices 缓存的 shell 脚本（加入一些延时以避免出现时序问题）：

```bash
#!/bin/bash

echo "Tailscale was installed, sleeping for 10 seconds before clearing the LaunchServices cache" | logger
sleep 10
echo "Clearing the LaunchServices cache" | logger
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
  -kill -r -domain local -domain system -domain user
echo "LaunchServices cache cleared successfully, sleeping another 10 seconds"  | logger
sleep 10
```

将 MDM 配置为仅在执行完该 shell 脚本之后才部署 VPN 配置描述文件。这样，macOS 应该就能让网络扩展正常启动。

#### 基于 MDM 的升级

升级之前安装的独立（Standalone）版 Tailscale 客户端时，关键是在升级前正确停止 Tailscale。虽然 `.pkg` 安装包会尝试通过 AppleScript 完成此操作，但如果你正在使用 `AlwaysOn` 策略，或者你构建了自己的自定义安装包，就需要格外小心。你的预安装脚本应运行以下命令：

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale down-for-update
```

这可以确保系统扩展处于能够正常升级的状态。`down-for-update` 命令专门用于覆盖 `AlwaysOn` 策略，且必须由管理员运行。如果配置了 `AlwaysOn.Enabled`，则无法使用通常的 `tailscale down` 命令。

在你的安装后脚本中，以下命令会重启 Tailscale 客户端和系统扩展。

```shell
#重启 GUI
/Applications/Tailscale.app/Contents/MacOS/Tailscale rungui

#如需要则重启 Tailscale
/Applications/Tailscale.app/Contents/MacOS/Tailscale up
```

`rungui` 和 `down-for-update` CLI 命令只有在通过 macOS `.app` 包运行时才受支持。

[ar-install-the-tailscale-vpn-configuration]: #安装-tailscale-vpn-配置

[docs-ios-mdm]: /docs/integrations/mdm/ios

[docs-ios-vpn-on-demand]: /docs/features/client/ios-vpn-on-demand

[docs-mac-variants-app-store]: /docs/concepts/macos-variants#mac-app-store-变体

[docs-mac-variants-standalone]: /docs/concepts/macos-variants#standalone-变体

[docs-mdm-iru]: /docs/integrations/mdm/iru

[docs-mdm-jamf]: /docs/integrations/mdm/jamf

[docs-mdm-jumpcloud]: /docs/integrations/mdm/jumpcloud

[docs-mdm-keys-org-name]: /docs/features/tailscale-system-policies#设置组织名称

[docs-mdm-keys-suppress-address-copy]: /docs/features/tailscale-system-policies#抑制-ip-地址复制通知

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[docs-mdm-simplemdm]: /docs/integrations/mdm/simplemdm

[xt-apple-mobileconfig-reference]: https://developer.apple.com/business/documentation/Configuration-Profile-Reference.pdf

[xt-gh-profile-creator-manage]: https://github.com/ProfileCreator/ProfileManifests/blob/master/Manifests/ManagedPreferencesApplications/io.tailscale.ipn.macos.plist

[xt-gh-profile-creator-prefs]: https://github.com/ProfileCreator/ProfileManifests/blob/master/Manifests/ManagedPreferencesApplications/io.tailscale.ipn.macsys.plist

[xt-gh-profile-creator]: https://github.com/ProfileCreator/ProfileCreator

[xt-imazing]: https://imazing.com/profile-editor
