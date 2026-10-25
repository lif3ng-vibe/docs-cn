---
title: "使用 MDM 在 iOS/tvOS 上部署 Tailscale"
description: "本页包含一些技术信息，供正在企业环境中使用 [Microsoft Intune][docs-mdm-microsoft-intune]、[Jamf Pro][docs-mdm-jamf]、[Iru][docs-mdm-iru]（原 Kandji）或 [SimpleMDM][docs-mdm-simplemdm] 等 MDM 解决方案为 iPhone、iPad、Vision Pro 或 Apple TV 部署 Tailscale 的系统管理员参考。"
---

最后验证于 Jan 5, 2026

如果你是一名系统管理员，正在企业环境中使用 [Microsoft Intune][docs-mdm-microsoft-intune]、[Jamf Pro][docs-mdm-jamf]、[Iru][docs-mdm-iru]（原 Kandji）或 [SimpleMDM][docs-mdm-simplemdm] 等 MDM 解决方案，为 iPhone、iPad、Vision Pro 或 Apple TV 部署 Tailscale，本页包含的技术信息可能会对你有帮助。

我们一直在为系统管理员提供更多以编程方式管理 Tailscale 部署的选项。如果你正在上述设备上部署 Tailscale，并且觉得本页目前缺少某个你需要的特定配置选项，请联系我们的支持团队。

> **注意：**
>
> 如果你想为 macOS 版 Tailscale 客户端配置系统策略，请参阅[专门的主题][docs-macos-mdm]。

## 配置描述文件

如果你在使用 MDM 为 iOS/tvOS 部署 Tailscale，可以使用配置描述文件（configuration profile）来自动完成应用引导流程中的部分步骤，减少用户被弹窗反复打扰。

### 自动允许推送通知

> **注意：**
>
> tvOS 版 Tailscale 应用不使用通知，因为 Apple TV 不允许第三方应用发送通知。

> **注意：**
>
> 与本页的其他配置描述文件不同，通知设置只能部署到受监管（supervised）的 iOS 设备。

Tailscale for iOS 有时会使用系统通知来告知用户。例如，以下情况下你会收到通知：

* 设备密钥即将过期
* 通过 Taildrop 收到了文件

以下是一个配置描述文件 payload 示例，用于在 iOS 上自动允许 Tailscale 发送通知。

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
      <string>io.tailscale.ipn.ios</string>
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
  <string>b3dc3535-1b06-4f2d-a684-4518a6589dfe</string>
  <key>PayloadOrganization</key>
  <string>Tailscale Inc.</string>
  <key>PayloadType</key>
  <string>com.apple.notificationsettings</string>
  <key>PayloadUUID</key>
  <string>056ec734-91b7-45a3-8787-98ebf2e84025</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
```

### 安装 Tailscale VPN 配置

Tailscale 应用在 iOS/tvOS 设备上首次启动时，会安装一个 NetworkExtension VPN 配置。你可以提供一个配置描述文件，在应用启动*之前*就配置好该 VPN 配置，从而跳过这一步。首次启动时，Tailscale 应用会检测到已存在的配置并跳过安装步骤。

以下是一个有效的 `.mobileconfig` 属性列表文件，可用于建立这样的 VPN 配置。

> **注意：**
>
> 为 tvOS 版 Tailscale 创建配置描述文件时，请将 `ProviderBundleIdentifier` 字段中的值 `io.tailscale.ipn.ios.network-extension` 替换为 `io.tailscale.ipn.ios.network-extension-tvos`。`VPNSubType` 字段保持不变（我们的 tvOS 应用与 iOS 应用使用相同的 bundle identifier）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>Tailscale iOS VPN Configuration Profile</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>com.your-company-name.tailscale.797d4461-837c-4f5a-b18e-7e300a057020</string>
  <key>PayloadUUID</key>
  <string>0f451881-7ac4-4171-80fd-b55251053233</string>
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
        <string>7ec957e2-b165-4d1f-9946-3a7a16ae0f9c</string>
        <key>UserDefinedName</key>
        <string>Tailscale MobileConfig</string>
        <key>VPNType</key>
        <string>VPN</string>
        <key>VPNSubType</key>
        <string>io.tailscale.ipn.ios</string>
        <key>VPN</key>
         <dict>
            <key>RemoteAddress</key>
            <string>Tailscale Mesh</string>
            <key>AuthenticationMethod</key>
            <string>Password</string>
            <key>ProviderBundleIdentifier</key>
            <string>io.tailscale.ipn.ios.network-extension</string>
        </dict>
    </dict>
  </array>
</dict>
</plist>
```

### 使用 AppConfig 部署系统策略

> **注意：**
>
> 只有当 Tailscale 应用是通过 MDM 解决方案安装/管理时，系统策略才能部署到 iOS 和 tvOS 版 Tailscale 应用。这是 iOS/tvOS 施加的限制。在这些平台上，你无法通过手动安装 `.mobileconfig` 配置描述文件的方式部署策略。

如果你正在使用 MDM 解决方案部署 iOS/tvOS 应用，可以使用 AppConfig 为 Tailscale 指定系统策略。Tailscale 客户端每次启动时都会读取这些策略并应用。通过 MDM 解决方案部署 AppConfig，可以代替用户配置 Tailscale 客户端的特定设置，让设置过程更加简单。

请参阅[系统策略完整列表][docs-mdm-keys]，了解所有可配置的设置。

要进行配置，请在你的 MDM 解决方案的管理控制台中找到 Tailscale 应用，然后进入该应用的 **托管配置**（Managed Configuration）或 **AppConfig** 设置。具体措辞取决于你使用的 MDM 解决方案。

以下是一个 AppConfig XML 示例，用于设置 [**ManagedByOrganizationName**][docs-mdm-keys-org-name] 系统策略的值：

```xml
<dict>
<key>ManagedByOrganizationName</key>
<string>Tailscale, Inc.</string>
</dict>
```

部署上述 AppConfig 后，iOS 应用的设置界面中会显示 **由 Tailscale, Inc. 管理**（Managed by Tailscale, Inc.）。

请注意，**ManagedByOrganizationName** 系统策略目前在 Apple TV 上尚不可用，也不会产生任何用户可见的变化。

请参阅[系统策略列表][docs-mdm-keys]，了解你可以代替用户配置的其他值。

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-mdm-iru]: /docs/integrations/mdm/iru

[docs-mdm-jamf]: /docs/integrations/mdm/jamf

[docs-mdm-keys-org-name]: /docs/features/tailscale-system-policies#set-your-organization-name

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[docs-mdm-simplemdm]: /docs/integrations/mdm/simplemdm
