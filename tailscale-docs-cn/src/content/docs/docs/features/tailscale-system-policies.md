---
title: "Customize Tailscale using system policies"
description: "A list of configuration keys you can use to customize the Tailscale client using system policies, including MDM."
---

Last validated Sep 29, 2026

> **Note:** System policies are available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

This page contains a list of policies observed by the Tailscale client. You might find these policies useful if you are a system administrator deploying Tailscale in a corporate environment, using a solution like mobile device management (MDM).

Setting these policies can improve the user experience for your users. For instance, you can hide UI items that might be confusing to less tech-savvy individuals in your organization. You can also enforce settings to improve your security posture.

If you need help using any of the settings listed in this document, or would like to suggest any new policies, contact our support or sales teams.

## Available settings

| Category              | Policy key                                                                           | Supported platforms                             |
| --------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Auto update           | [`ApplyUpdates`](#hide-the-auto-update-settings-macos)                               | macOS (standalone variant only)                 |
| Auto update           | [`CheckUpdates`](#check-for-updates-automatically-windows)                           | Windows                                         |
| Auto update           | [`InstallUpdates`](#install-updates-automatically-windows)                           | Windows                                         |
| Auto update           | [`SUAutomaticallyUpdate`](#install-updates-automatically-macos)                      | macOS (standalone variant only)                 |
| Auto update           | [`SUEnableAutomaticChecks`](#check-for-updates-automatically-macos)                  | macOS (standalone variant only)                 |
| Auto update           | [`UnstableUpdates`](#manage-unstable-versions-availability)                          | macOS (standalone variant only)                 |
| Exit nodes            | [`AdvertiseExitNode`](#advertise-exit-node)                                          | Android, Linux, macOS, tvOS, Windows            |
| Exit nodes            | [`AllowedSuggestedExitNodes`](#suggest-allowed-forced-exit-nodes)                    | iOS, Linux, macOS, Windows                      |
| Exit nodes            | [`ExitNode.AllowOverride`](#set-a-different-exit-node-when-forced)                   | Linux, macOS, Windows                           |
| Exit nodes            | [`ExitNodeAllowLANAccess`](#toggle-local-network-access-when-an-exit-node-is-in-use) | Android, iOS, Linux, macOS, Windows             |
| Exit nodes            | [`ExitNodeID`](#force-an-exit-node-to-always-be-used)                                | Android, iOS, Linux, macOS, Windows             |
| Organization          | [`ManagedByCaption`](#set-an-info-message)                                           | Android, iOS, macOS, Windows                    |
| Organization          | [`ManagedByOrganizationName`](#set-your-organization-name)                           | Android, iOS, macOS, Windows                    |
| Organization          | [`ManagedByURL`](#set-a-support-url)                                                 | Android, iOS, macOS, Windows                    |
| Runtime configuration | [`AllowIncomingConnections`](#set-whether-to-allow-incoming-connections)             | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`AlwaysOn.Enabled`](#set-tailscale-to-always-be-connected)                          | iOS, macOS, Windows                             |
| Runtime configuration | [`AlwaysOn.OverrideWithReason`](#set-a-required-reason-for-disconnection)            | iOS, macOS, Windows                             |
| Runtime configuration | [`AuthBrowser.macos`](#set-a-custom-browser-for-authentication)                      | macOS                                           |
| Runtime configuration | [`AuthKey`](#set-an-auth-key)                                                        | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`DeviceSerialNumber`](#specify-the-device-serial-number)                            | iOS, tvOS                                       |
| Runtime configuration | [`EnableDNSRegistration`](#force-tailscale-ip-registration-in-active-directory)      | Windows                                         |
| Runtime configuration | [`EncryptState`](#encrypt-node-state-file)                                           | Linux, macOS (standalone variant only), Windows |
| Runtime configuration | [`ExcludedPackageNames`](#set-excluded-applications)                                 | Android                                         |
| Runtime configuration | [`ForceEnabled`](#force-tailscale-to-always-be-running)                              | Android, iOS, macOS                             |
| Runtime configuration | [`HideDHCP121Warnings`](#suppress-dhcp-option-121-warnings)                          | macOS                                           |
| Runtime configuration | [`Hostname`](#set-whether-device-hostnames-can-be-modified)                          | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`IncludedPackageNames`](#set-included-applications)                                 | Android                                         |
| Runtime configuration | [`IPAddressCopiedAlertSuppressed`](#suppress-ip-address-copied-notifications)        | macOS                                           |
| Runtime configuration | [`KeyExpirationNotice`](#set-the-key-expiration-notice-period)                       | iOS, macOS, Windows                             |
| Runtime configuration | [`LoginURL`](#set-a-custom-control-server-url)                                       | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`MachineCertificateSubject`](#set-a-machine-certificate-subject)                    | Windows                                         |
| Runtime configuration | [`PostureChecking`](#enable-gathering-device-posture-data)                           | iOS, Linux, macOS, tvOS, Windows                |
| Runtime configuration | [`ReconnectAfter`](#set-a-reconnection-timer)                                        | Android, Linux, macOS, Windows                  |
| Runtime configuration | [`Tailnet`](#set-a-suggested-or-required-tailnet)                                    | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`TailscaleStartOnLogin`](#automatically-start-tailscale-when-the-user-logs-in)      | macOS                                           |
| Runtime configuration | [`UnattendedMode`](#set-unattended-mode)                                             | Windows                                         |
| Runtime configuration | [`UseTailscaleDNSSettings`](#set-whether-the-device-uses-tailscale-dns-settings)     | Android, iOS, Linux, macOS, tvOS, Windows       |
| Runtime configuration | [`UseTailscaleSubnets`](#set-whether-the-device-accepts-tailscale-subnets)           | Android, iOS, Linux, macOS, tvOS, Windows       |
| UI visibility         | [`AdminConsole`](#hide-the-admin-console-menu-item)                                  | Windows                                         |
| UI visibility         | [`AppIntroShown`](#suppress-the-app-window-intro-flow)                               | macOS                                           |
| UI visibility         | [`CLIIntegration`](#hide-the-cli-integration-installer)                              | macOS                                           |
| UI visibility         | [`DisableReauthWindow`](#block-re-authentication-window)                             | macOS                                           |
| UI visibility         | [`ExitNodesPicker`](#hide-the-exit-node-picker)                                      | Android, iOS, macOS, Windows                    |
| UI visibility         | [`HiddenNetworkDevices`](#hide-network-devices)                                      | Android, iOS, macOS                             |
| UI visibility         | [`HideDockIcon`](#hide-the-macos-dock-icon-after-all-windows-close)                  | macOS                                           |
| UI visibility         | [`ManageTailnetLock`](#hide-the-tailnet-lock-settings)                               | Android, iOS, macOS                             |
| UI visibility         | [`NetworkDevices`](#hide-the-network-devices-menu)                                   | Windows                                         |
| UI visibility         | [`OnboardingFlow`](#suppress-the-first-launch-onboarding-flow)                       | Android, macOS, Windows                         |
| UI visibility         | [`PreferencesMenu`](#hide-the-preferences-menu)                                      | Windows                                         |
| UI visibility         | [`ResetToDefaults`](#hide-the-reset-to-defaults-menu-item)                           | macOS                                           |
| UI visibility         | [`RunExitNode`](#hide-the-run-as-exit-node-menu-item)                                | Android, macOS, tvOS, Windows                   |
| UI visibility         | [`StartOnLoginMenuItem`](#hide-the-start-on-login-menu-item)                         | macOS                                           |
| UI visibility         | [`TestMenu`](#hide-the-debug-menu)                                                   | macOS, Windows                                  |
| UI visibility         | [`UpdateMenu`](#hide-the-update-menu)                                                | iOS, macOS (standalone variant only), Windows   |
| UI visibility         | [`VPNOnDemandSettings`](#hide-the-vpn-on-demand-menu-item)                           | iOS, macOS                                      |

## How to apply system policies

> **Note:**
>
> Tailscale v1.78 and later applies system policy updates automatically and does not require you to restart the client. Tailscale v1.76 and earlier requires you to restart the client for system policy changes to take effect.

While many of the configuration keys listed on this page are shared between platforms, different steps are required to configure these policies on each.

### Windows

The Tailscale client for Windows reads and applies system policies stored in the Windows registry. These can be deployed using MDM solutions such as [Microsoft Intune][docs-mdm-microsoft-intune].

For more information, refer to the platform-specific documentation for [Windows][docs-windows-mdm].

### macOS and iOS / tvOS

The Tailscale clients for macOS, iOS, and tvOS read and apply system policies stored in the system user defaults. You can impose these policies by deploying a configuration profile using MDM solutions like [Microsoft Intune][docs-mdm-microsoft-intune], [Iru][docs-mdm-iru] (formerly Kandji), or [SimpleMDM][docs-mdm-simplemdm]. If you are not using server-based MDM, you can also manually install a configuration profile on target devices using Apple Configurator.

For more information, refer to the platform-specific documentation for [macOS][docs-macos-mdm] or [iOS/tvOS][docs-ios-mdm].

### Android

The Tailscale client for Android reads and applies system policies stored in the Android RestrictionsManager. This feature is available in Tailscale 1.66 or later. You can use your favorite MDM solution, such as [Google Workspace][docs-mdm-google-workspace], [Microsoft Intune][docs-mdm-microsoft-intune], or [TinyMDM][docs-mdm-tinymdm], to deploy restrictions.

For more information, refer to the platform-specific documentation for [Android][docs-android-mdm].

### Linux

The Tailscale daemon (`tailscaled`) for Linux reads and applies system policies stored in a JSON (or [HuJSON][xt-hujson]) file, by default located at `/etc/tailscale/syspolicy.json`. This feature is available in Tailscale 1.102 or later. Unlike Windows, macOS, iOS, and Android, Linux does not have a single vendor-provided MDM framework — you can deploy this policy file using whichever configuration management tool you already use, such as Ansible, Puppet, or Chef.

For more information, refer to the platform-specific documentation for [Linux][docs-linux-mdm].

## Review the system policy on a device

You can review the system policies enforced for a client using the Tailscale CLI command [`tailscale syspolicy list`][docs-cli-syspolicy]. The output also includes system policy errors that exist.

```shell
Name                      Origin             Value        Error
----                      ------             -----        -----
AllowIncomingConnections  Platform (Device)  never
Tailnet                   Platform (Device)  example.com
TestMenu                  Platform (Device)  show
```

## Reload the system policy on a device

The Tailscale client automatically applies changes in the policy settings from MDM and Group Policy as soon as the OS notifies the client of the changes. If you configure policy settings using other mechanisms, such as by manually creating Registry values on Windows, you can use the Tailscale CLI command [`tailscale syspolicy reload`][docs-cli-syspolicy] to forcibly reload and reapply the changed policy settings. The output will also display system policy errors that exist.

```shell
Name                      Origin             Value        Error
----                      ------             -----        -----
AdminConsole              Platform (Device)               {unexpected key value type}
AllowIncomingConnections  Platform (Device)  never
Tailnet                   Platform (Device)  example.com
TestMenu                  Platform (Device)  show
```

> **Note:**
>
> Using the Tailscale CLI command [`tailscale syspolicy reload`][docs-cli-syspolicy] does not trigger Group Policy or MDM synchronization. The timing of pushing configured policy settings to managed devices depends on the OS and the MDM solution.

## Available system policies

The following is a list of the system policies observed by the Tailscale clients.

### Configure the auto-update settings

#### Hide the auto-update settings (macOS)

> **Note:**
>
> This system policy exclusively applies to the Standalone variant of Tailscale for macOS. When you download Tailscale from the Mac App Store, this setting is always hidden in Tailscale. Update settings should instead be managed in the Mac App Store.

If you do not want to allow the user to turn the automatic installation of updates on or off, you can use the `ApplyUpdates` policy. When this setting is set to `hide`, the **Automatically install updates** menu item won't be shown to the user, and the user won't be able to configure automatic updates.

* **Supported platforms:** macOS (standalone variant only)

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.52

#### Check for updates automatically (Windows)

The Tailscale client for Windows will periodically check for updates and notify the user that a new version is available. We recommend that you leave this feature on to ensure your users receive any security updates in a timely manner.

However, you might prefer to manually deploy updates and disable notifications of new available versions, or enable auto-updates on all devices. To do so, use the policy with key `CheckUpdates`. The default `user-decides` value will enable update checks, but allow the user to manually disable them. Set this value to `never` to disable automatically checking for updates. Set this value to `always` to disallow users to opt-out of update checks.

* **Supported platforms:** Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56

#### Install updates automatically (Windows)

The Tailscale client for Windows can also install updates automatically. We recommend that you always turn this feature on to ensure your users receive any security updates in a timely manner.

To control auto-updates on all devices you can set the key `InstallUpdates` in your policy. Setting it to `always` enables auto-updates in the client, setting it to `never` disables them. The default value `user-decides` will use the value set in the admin console under **Settings > Device management > Auto-update Tailscale**, and let the user locally override that value in Tailscale app settings.

* **Supported platforms:** Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56

#### Install updates automatically (macOS)

> **Note:**
>
> This system policy exclusively applies to the Standalone variant of Tailscale for macOS. When you download Tailscale from the Mac App Store, the system automatically updates it for you, provided that automatic app updates are enabled.

If you are using the Standalone version of Tailscale for macOS, the client can install updates automatically. This uses the Sparkle framework. We recommend that you always turn this feature on to make sure your users receive any security updates in a timely manner. To do so, use the boolean policy with key `SUAutomaticallyUpdate`. Note, when the policy is set to `true` users may need to confirm the update before it is applied.

However, if you manually manage updates, or prefer your users to be notified to manually update, you can disable the automatic installation. When `SUAutomaticallyUpdate` is set to `false`, the Standalone variant of Tailscale for macOS will require user input before updates are installed.

* **Supported platforms:** macOS (standalone variant only)

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.52

#### Check for updates automatically (macOS)

> **Note:**
>
> This system policy exclusively applies to the Standalone variant of Tailscale for macOS. When you download Tailscale from the Mac App Store, the system automatically updates it for you, provided that automatic app updates are enabled.

If you are using the Standalone version of Tailscale for macOS, the client will periodically check for updates automatically and notify the user that a new version is available. This uses the Sparkle framework. We recommend that you leave this feature on to ensure your users receive any security updates in a timely manner.

However, you might prefer to manually deploy updates and disable notifications of new available versions. To do so, use the boolean policy with key `SUEnableAutomaticChecks`. When it is set to `true`, the Standalone variant of Tailscale for macOS will automatically check for updates. Set this value to `false` to disable automatically checking for updates.

* **Supported platforms:** macOS (standalone variant only)

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.46

#### Manage unstable versions availability

Starting in Tailscale v1.60, the Standalone variant of Tailscale for macOS lets a user opt into receiving unstable releases of the client, with a toggle presented in the **Settings** user interface:

*（图：The macOS client Settings dialog with the About pane opened. Highlighting the 'Update to unstable versions' toggle.）*

You can set a value for the `UnstableUpdates` policy to force a specific value for this setting. For example, setting `UnstableUpdates` to `never` means that your users won't be able to update to unstable versions of the client. You can deploy this policy to prevent non-tech-savvy users from enrolling in pre-release builds of the client, which might be more prone to issues.

* **Supported platforms:** macOS (standalone variant only)

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.60

### Configure the exit node settings

#### Advertise exit node

The `AdvertiseExitNode` policy controls whether the device advertises itself as an exit node for use by other users and their devices.

* **Supported platforms:** Android, Linux, macOS, tvOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56, 1.102 (Linux)

#### Suggest allowed forced exit nodes

The `AllowedSuggestedExitNodes` policy controls which exit nodes Tailscale recommends in its clients and through the [`tailscale exit-node suggest`][docs-cli-exit-node] command. It also limits automatic selection when [`ExitNodeID`][ar-exit-node-force-use] is `auto:any`. Set this policy to a list of exit node IDs. Find each ID on the [Machines](https://console.tailscale.com/admin/machines) page of the admin console or through the [Tailscale API][docs-api].

If `AllowedSuggestedExitNodes` is unset, then all exit nodes are allowed. If `AllowedSuggestedExitNodes` is set but empty (contains no exit node IDs), then no exit nodes are allowed.

Other exit nodes not specified by this policy are allowed to be used, but they won't be recommended.

* **Supported platforms:** iOS, Linux, macOS, Windows

* **Possible values:** Not set, an empty set, or a list of strings of exit node device IDs

* **Added in Tailscale versions:** 1.70, 1.102 (Linux)

#### Toggle Local Network Access when an exit node is in use

The **Allow Local Network Access** menu item lets your users control whether they can still access devices on the local network while using an exit node. If you prefer to control this setting on behalf of your users, the `ExitNodeAllowLANAccess` policy can be used to do so. For more information about this feature, refer to the [Exit Nodes topic][docs-exit-nodes-use-exit-node].

* **Supported platforms:** Android, iOS, Linux, macOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56, 1.66 (Android), 1.102 (Linux)

#### Force an exit node to always be used

The `ExitNodeID` policy forces the Tailscale client to always use the given exit node. This can be useful if you prefer to route all internet traffic through a node for inspection or logging purposes. Users won't be able to disable or choose another exit node when this policy is active. A message will be displayed in the client UI informing users about this restriction.

The value for this key should be the ID of an exit node device, or `auto:any`.

If you specify the ID of an exit node device, that device will serve as the mandated exit node for your tailnet. You can find the ID for any device in your tailnet by looking at the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, or by using the [Tailscale API][docs-api].

Set `ExitNodeID` to `auto:any` to require an exit node that Tailscale selects automatically. To limit the choices, set [`AllowedSuggestedExitNodes`][ar-exit-node-allowed] to a list of permitted exit nodes.

If you use this policy but want to let users select a different exit node, you can include the `ExitNode.AllowOverride` system policy as well.

Note that if a forced exit node goes offline, internet connectivity will be unavailable on client devices until the exit node comes back online. The same is true if you specify `auto:any` and all of your exit nodes go offline.

Also note that if a client device is unable to reach a specified exit node, internet connectivity will be unavailable. This scenario can occur when there is a captive portal (such as when needing to authenticate to Tailscale), or when the client is unable to reach the Tailscale coordination server.

* **Supported platforms:** Android, iOS, Linux, macOS, Windows

* **Possible values:** String, either an exit node ID or auto:any

* **Added in Tailscale versions:** 1.56, 1.66 (Android), 1.70.0 for auto:any, 1.102 (Linux)

*（图：The macOS client menu with 'Using Exit Node'. The exit node menu has disabled options.）*

#### Set a different exit node when forced

The `ExitNode.AllowOverride` system policy lets users select a different exit node when the`ExitNodeID=auto:any` system policy is enabled, requiring the use of an exit node.

* **Supported platforms:** Linux, macOS, Windows

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.88, 1.102 (Linux)

### Show contact information for your organization

#### Set an info message

Use the `ManagedByCaption` policy to specify a caption to be displayed in the **Managed By** section in the Tailscale client. Use this string value to provide your users with information on how to reach support resources for Tailscale in your organization.

* **Supported platforms:** Android, iOS, macOS, Windows

* **Possible values:** any String

* **Added in Tailscale versions:** 1.52, 1.62 (Windows), 1.66 (Android)

#### Set your organization name

Use the `ManagedByOrganizationName` policy to specify the name of the organization managing Tailscale, for instance *"XYZ Corp, Inc."*.

The value will be displayed in the Tailscale client, so that users can reach your internal support resources.

* **Supported platforms:** Android, iOS, macOS, Windows

* **Possible values:** any String

* **Added in Tailscale versions:** 1.52, 1.62 (Windows), 1.66 (Android)

#### Set a support URL

Use the `ManagedByURL` policy to specify a URL pointing to a help desk webpage, or other helpful resources for users in the organization. Selecting the **Support** button in the Tailscale UI will open this webpage.

* **Supported platforms:** Android, iOS, macOS, Windows

* **Possible values:** a valid URL

* **Added in Tailscale versions:** 1.52, 1.62 (Windows), 1.66 (Android)

### Other settings

#### Set whether to allow incoming connections

The `AllowIncomingConnections` policy decides whether Tailscale should allow incoming connections to the device (also known as "shields up"). This blocks any incoming connections over Tailscale by overriding the [access control policies][docs-access-control] to deny access to the device.

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56, 1.66 (Android), 1.102 (Linux)

#### Set Tailscale to always be connected

The `AlwaysOn.Enabled` system policy prevents users from disconnecting from the tailnet or exiting the client. When you enable this policy, you can also enable the [`AlwaysOn.OverrideWithReason`][ar-disconnect-reason] policy to require a reason for disconnecting, and then use the [`ReconnectAfter`][ar-reconnect-timer] system policy to set a timer that defines how long the client can stay disconnected from the tailnet.

> **Warning:**
>
> Tailscale deprecated the `ForceEnabled` system policy in version 1.84. It will continue to work, however, we recommend using the [`AlwaysOn.Enabled`][ar-always-connected] system policy instead.

* **Supported platforms:** iOS, macOS, Windows

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.84

#### Set a required reason for disconnection

The `AlwaysOn.OverrideWithReason` system policy requires users to submit a reason when disconnecting the Tailscale client. This system policy is only available if [`AlwaysOn.Enabled`][ar-always-connected] is also enabled. User-provided reasons display in the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.

On Windows and macOS, a user can provide a reason in one of the following ways:

* Enter the reason in a dialog that appears in the client UI when attempting to disconnect from the tailnet or exit the client.
* Use the CLI command [`tailscale down --reason "<description>"`][docs-cli-down], providing the description in quotes. For example, `tailscale down --reason "DNS issues"`.

On iOS, a user can provide a reason from the dialog box that displays in the client UI. The CLI command method is not supported.

* **Supported platforms:** iOS, macOS, Windows

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.84

#### Set an auth key

The `AuthKey` system policy lets you specify an [auth key][docs-auth-keys] to authenticate managed devices without user interaction. All clients automatically try to use the auth key when launched unless the client is already logged in to Tailscale.

> **Danger:**
>
> Storing authentication keys within an MDM solution poses a significant security risk. If the MDM becomes compromised, the attacker could access the auth keys and use them to authenticate with their target's network. Only consider this option after carefully reviewing the organization's security posture. For example, ensure you configure the auth keys specifically for the [tags][docs-tags] of the device and that [access control policies][docs-access-control] only grant necessary access between the tailnet and the tagged device.
>
> If you suspect an auth key has been compromised, [revoke the auth key][docs-auth-keys-revoke].

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** A Tailscale auth key. We recommend you use a one-off auth key.

* **Added in Tailscale versions:** 1.74, 1.102 (Linux)

#### Specify the device serial number

On iOS and tvOS, third-party apps like Tailscale cannot access the device serial number unless an MDM solution is configured to provide Tailscale with it. The `DeviceSerialNumber` policy can be set to a string value to provide Tailscale with the serial number of the device. When [posture checking is enabled][ar-posture-checking] on these two platforms and `DeviceSerialNumber` is non-empty, the serial number will be reported to the coordination server and will appear in the admin console.

* **Supported platforms:** iOS, tvOS

* **Possible values:** a String containing the device serial number

* **Added in Tailscale versions:** 1.70

#### Set excluded applications

The `ExcludedPackageNames` system policy lets you specify a comma-separated list of Android package names that will be excluded from routing and DNS using Tailscale, even when Tailscale is connected. For more information, refer to the [app-based split tunneling][docs-android-app-split-tunneling] topic.

This policy is only supported on Android.

* **Supported platforms:** Android

* **Possible values:** String (a comma-separated list of application package names, such as com.google.android.apps.maps,com.google.android.calendar)

* **Added in Tailscale versions:** 1.70

#### Force Tailscale IP registration in Active Directory

The `EnableDNSRegistration` system policy enforces DNS registration and dynamic DNS updates for the Tailscale interface in Active Directory. This policy also prevents Tailscale from modifying the settings configured in the network adapter's properties or by other means.

This policy is only supported on Windows.

* **Supported platforms:** Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.84

#### Force Tailscale to always be running

> **Warning:**
>
> Tailscale deprecated the `ForceEnabled` system policy in version 1.84. It will continue to work, however, we recommend using the [`AlwaysOn.Enabled`][ar-always-connected] system policy instead.

When set to true, the `ForceEnabled` boolean policy instructs Tailscale to always be connected and actively monitor the tunnel state for disconnections. The **Disconnect** toggle will be disabled, to prevent users from disabling the VPN themselves. An attempt to disconnect will present a banner informing the user the organization's policy prevents Tailscale from being disconnected. If the client detects the VPN tunnel is down because the Tailscale VPN process was terminated, Tailscale will automatically restart it and reconnect.

This policy should always be used together with an always-on VPN configuration profile (available on supervised iOS devices). You might also want to set `VPNOnDemandSettings` to `hide`, to prevent the user from interacting with your on-demand VPN configuration.

* **Supported platforms:** Android, iOS, macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.52

#### Suppress DHCP Option 121 warnings

DHCP Option 121 lets a DHCP server on a LAN advertise routing rules for a given CIDR range without user input. While this feature is used on a very small number of networks to deploy routing rules to clients, it can also be misused by an attacker in a privileged position on the LAN to mislead clients into routing traffic meant for the Tailscale interface outside of the Tailscale tunnel. This malicious use of DHCP 121 is also known as the [TunnelVision][bl-tunnelvision] vulnerability (CVE-2024-3661).

By default, Tailscale v1.68 and later detect when DHCP Option 121 is being used, and the client will display a warning to the user in the UI when usage of this option is detected. You may set the `HideDHCP121Warnings` system policy to `true` to hide such warnings if you have a legitimate need to use Option 121.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.68

#### Set included applications

The `IncludedPackageNames` system policy lets you specify a comma-separated list of Android package names that will be forced to use Tailscale for routing and DNS whenever Tailscale is connected. Other apps will ignore Tailscale whenever a value is defined for this policy. For more information, refer to the [app-based split tunneling][docs-android-app-split-tunneling] topic.

This policy is only supported on Android.

* **Supported platforms:** Android

* **Possible values:** String (a comma-separated list of application package names, such as com.google.android.apps.maps,com.google.android.calendar)

* **Added in Tailscale versions:** 1.70

#### Suppress IP Address Copied notifications

When you use the Tailscale menu bar item to copy to the Clipboard the IP address of a device, a notification displaying the IP address is presented. The `IPAddressCopiedAlertSuppressed` policy can be used to suppress this **Copied IP address to clipboard** notification.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.50

#### Set the key expiration notice period

The `KeyExpirationNotice` policy controls how long before key expiry should a notice be displayed. The default is 24 hours.

* **Supported platforms:** iOS, macOS, Windows

* **Possible values:** Go-style Duration, for example, 24h or 5h25m30s

* **Added in Tailscale versions:** 1.50 (Windows), 1.58 (macOS, iOS)

#### Set a custom browser for authentication

The `AuthBrowser.macos` policy controls the browser used to open authentication URLs. The value should be set to the bundle identifier of the preferred browser. If the specified bundle is not present, the user's default system browser will be used.

* **Supported platforms:** macOS

* **Possible values:** A String value such as com.apple.Safari

* **Added in Tailscale versions:** 1.94

#### Set a custom control server URL

The `LoginURL` policy can be used to specify a custom control server URL. This should not be changed unless you are not using the standard Tailscale server. Use this policy if you're deploying your own server, such as Headscale.

\- The now-deprecated key `ControlURL` was used in early versions of Tailscale for macOS and iOS

#### Set a machine certificate subject

The `MachineCertificateSubject` policy enables signed registration requests with an externally-provisioned machine certificate. This policy is only applicable to particular enterprise customers and they receive further documentation on how to correctly configure this option.

* **Supported platforms:** Windows

* **Possible values:** consult customer-specific documentation

* **Added in Tailscale versions:** 1.52

#### Enable gathering device posture data

The `PostureChecking` policy enables gathering of [device posture][docs-device-posture] data.

* **Supported platforms:** iOS, Linux, macOS, tvOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.52, 1.102 (Linux)

#### Set a reconnection timer

The `ReconnectAfter` system policy lets your organization set a timer that indicates how long the client can remain disconnected from the tailnet. You can use this with or without the [`AlwaysOn.Enabled`][ar-always-connected] policy.

* **Supported platforms:** Android, Linux, macOS, Windows

* **Possible values:** Refer to https\://pkg.go.dev/time#ParseDuration for information about the supported duration strings.

* **Added in Tailscale versions:** 1.84, 1.86 (macOS), 1.102 (Linux)

#### Set a suggested or required tailnet

The `Tailnet` policy lets the organization specify one or more tailnets to suggest or require during device registration. Set the policy value to a comma-separated list of [tailnet IDs][docs-tailnet-name-tailnet-id] or organization IDs such as `T123456CNTRL,o123456CNTRL` or `required:T123456CNTRL,o123456CNTRL`. A tailnet ID will suggest or restrict logging in to a specific tailnet. An organization ID will suggest or restrict logging to any tailnet in that organization.

Users will be guided to the correct IdP and tailnet based on the policy. If the policy value is prefixed with `required:`, Tailscale requires one of those values and won't allow devices to be registered in any other tailnet.

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** String (a comma-separated list of tailnet IDs or organization IDs)

* **Added in Tailscale versions:** 1.52, 1.66 (Android), 1.102 (Linux)

#### Suppress the first launch onboarding flow

The `OnboardingFlow` policy lets you disable the client onboarding flow that appears when you start Tailscale on a device for the first time. You might disable it if end-users are already familiar with the product and can get started on their own. On macOS, you would typically set up the VPN configuration automatically using a configuration profile when disabling the onboarding flow.

> **Warning:**
>
> Tailscale deprecated the `TailscaleOnboardingSeen` system policy in version 1.86. It will continue to work, but we recommend using the `OnboardingFlow` system policy instead.

* **Supported platforms:** Android, macOS, Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.86

#### Suppress the app window intro flow

The `AppIntroShown` policy lets you disable the "Welcome to the Tailscale app" modal window introduction that appears when you log in to Tailscale on a device for the first time. You might disable it if end-users are already familiar with the product and can get started on their own.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.96

#### Automatically start Tailscale when the user logs in

The first time the application is opened on a Mac, Tailscale installs a macOS login helper. This lets Tailscale start automatically when the user logs into their account. The `TailscaleStartOnLogin` boolean policy controls whether the login helper should start Tailscale at login time.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.46

#### Set unattended mode

The `UnattendedMode` policy sets the **Unattended Mode** option.

* **Supported platforms:** Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.52

#### Set whether the device uses Tailscale DNS settings

The `UseTailscaleDNSSettings` policy instructs Tailscale whether to apply its DNS configuration when the tunnel is connected. This policy is the equivalent to [`tailscale set --accept-dns`][docs-cli-set] and lets administrators override the DNS preference chosen by the user when necessary.

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56, 1.66 (Android), 1.102 (Linux)

#### Set whether the device accepts Tailscale subnets

The `UseTailscaleSubnets` policy instructs Tailscale whether to accept subnets advertised by other nodes in your tailnet. This is the equivalent of [`tailscale set --accept-routes`][docs-cli-set]. If this is off, the device won't reach other devices behind a subnet router. When no value is specified for this policy, Tailscale defaults to `true` on Windows, macOS, Android, and iOS and `false` on Linux/BSD.

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** always, never, user-decides

* **Added in Tailscale versions:** 1.56, 1.66 (Android), 1.102 (Linux)

#### Set whether device hostnames can be modified

The `Hostname` policy lets IT administrators override the hostname configured in the operating system and reported to the coordination server. This can be particularly useful on mobile devices, where the hostname provided by the operating system usually only contains the device's manufacturer name and model.

* **Supported platforms:** Android, iOS, Linux, macOS, tvOS, Windows

* **Possible values:** A String value such as user-macbook-pro

* **Added in Tailscale versions:** 1.80, 1.102 (Linux)

#### Encrypt node state file

The `EncryptState` policy instructs Tailscale to only store the node state file in encrypted format on disk. The node state file contains credentials, like the [node and machine keys][bl-key-management], that could be copied to a different device if stored unencrypted.

> **Note:**
>
> Android, iOS, macOS (App Store variant), and tvOS always store the state file encrypted regardless of this policy. This policy only affects the behavior on Windows and macOS (Standalone variant).

* **Supported platforms:** Linux, macOS (standalone variant only), Windows

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.86, 1.102 (Linux)

### Change the visibility of UI items

#### Hide the Admin Console menu item

The `AdminConsole` policy can be used to show or hide the **Admin Console** item in the Tailscale menu.

* **Supported platforms:** Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the CLI integration installer

The `CLIIntegration` policy can be used to show or hide the **CLI Integration** item in the Tailscale settings page.

When this policy is set to `hide`, the following message will be displayed if the user attempts to use the app settings to install the Tailscale CLI helper in `/usr/local/bin/tailscale`:

* This Tailscale install is managed by your organization. Contact your administrator to get started with the Tailscale CLI.

- **Supported platforms:** macOS

- **Possible values:** show, hide

- **Added in Tailscale versions:** 1.68

#### Block re-authentication window

The `DisableReauthWindow` policy lets you suppress Tailscale's native notifications for user re-authentication. You might disable it if you do not want Tailscale to directly notify users that their key has expired. When disabled, Tailscale will attempt to send a macOS system notification when the key is expired.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.104

#### Hide the exit node picker

The `ExitNodesPicker` policy can be used to show or hide all UI items to choose an exit node in the Tailscale client.

* **Supported platforms:** Android, iOS, macOS, Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50, 1.66 (Android)

#### Hide network devices

The `HiddenNetworkDevices` policy can be used to hide one or more categories of network devices normally displayed in the Tailscale client. Administrators can choose to hide:

* devices owned by the current user
* devices owned by other users
* tagged devices

If all three options are chosen, the **Network Devices** menu item disappears entirely and users aren't able to discover any device in the tailnet.

* **Supported platforms:** Android, iOS, macOS

* **Possible values:** String Array. Use one or more of: current-user, other-users, tagged-devices.

* **Added in Tailscale versions:** 1.52, 1.66 (Android)

#### Hide the Tailnet Lock settings

The `ManageTailnetLock` policy can be used to show or hide the **Manage Tailnet Lock** menu item.

* **Supported platforms:** Android, iOS, macOS

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50, 1.66 (Android)

#### Hide the Network Devices menu

The `NetworkDevices` policy can be used to show or hide the **Network Devices** menu item from the Tailscale client.

* **Supported platforms:** Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the Preferences Menu

The `PreferencesMenu` policy can be used to show or hide the **Preferences** menu item from the Tailscale client.

* **Supported platforms:** Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the Reset To Defaults menu item

The `ResetToDefaults` policy can be used to show or hide the **Reset to Defaults** menu item in the Tailscale client.

* **Supported platforms:** macOS

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the Run as Exit Node menu item

The `RunExitNode` policy can be used to show or hide the **Run as Exit Node** menu item.

* **Supported platforms:** Android, macOS, tvOS, Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50, 1.66 (Android)

#### Hide the Start on Login menu item

The `StartOnLoginMenuItem` policy can be used to show or hide the **Start on Login** menu item.

* **Supported platforms:** macOS

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the debug menu

The `TestMenu` policy can be used to show or hide the [debug menu][docs-troubleshooting-debug] in the Tailscale client. On macOS, this system policy will also hide any information displayed when holding down the Option key while selecting the Tailscale menu bar item.

* **Supported platforms:** macOS, Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50

#### Hide the update menu

The `UpdateMenu` policy can be used to show or hide the **Update Tailscale** menu option on Windows, and **Update Available** options on macOS and iOS.

* **Supported platforms:** iOS, macOS (standalone variant only), Windows

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.50 (Windows), 1.56 (macOS \[Standalone variant only], iOS)

#### Hide the VPN On Demand menu item

The `VPNOnDemandSettings` policy can be used to show or hide the **VPN On Demand** menu item. You might want to use this setting if you're deploying your own VPN configuration profile for Tailscale, and you don't want your users to interact with the on-demand VPN configuration you set up for them.

* **Supported platforms:** iOS, macOS

* **Possible values:** show, hide

* **Added in Tailscale versions:** 1.52

#### Hide the macOS dock icon after all windows close

The Tailscale dock icon on macOS appears whenever an application window exists. By default, Tailscale leaves an icon in the dock to support quickly reopening the main application window. The `HideDockIcon` policy can be set to `true` to prevent this behavior and hide the dock icon after all windows close.

* **Supported platforms:** macOS

* **Possible values:** Boolean

* **Added in Tailscale versions:** 1.94

[ar-always-connected]: #set-tailscale-to-always-be-connected

[ar-disconnect-reason]: #set-a-required-reason-for-disconnection

[ar-exit-node-allowed]: #suggest-allowed-forced-exit-nodes

[ar-exit-node-force-use]: #force-an-exit-node-to-always-be-used

[ar-posture-checking]: #enable-gathering-device-posture-data

[ar-reconnect-timer]: #set-a-reconnection-timer

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
