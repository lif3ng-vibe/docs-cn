---
title: "Using VPN On Demand for iOS and macOS"
description: "VPN On Demand is a feature that VPN providers on iOS and macOS can adopt to automate the establishment of a VPN connection. When VPN On Demand is used, your device can automatically start or stop the "
---

Last validated Jan 5, 2026

> **Note:**
>
> VPN On Demand is currently only available in the iOS and macOS versions of the Tailscale client.
>
> Tailscale 1.48 for iOS was the first version of the Tailscale client to support this feature. Support for macOS was added in Tailscale 1.60.

VPN On Demand is a feature that VPN providers on iOS and macOS can adopt to automate the establishment of a VPN connection. When VPN On Demand is used, your device can automatically start or stop the Tailscale VPN tunnel based on a number of criteria.

For instance, you can create a VPN On Demand configuration that will connect Tailscale when your iPhone leaves your Wi-Fi network, and disconnect once you're back under Wi-Fi coverage.

*（图：The VPN On Demand settings in iOS. 'Connect automatically on' for 'Wi-Fi' selecting 'Only On'.）*

> **Note:**
>
> The Tailscale client automatically configures a broad VPN On Demand policy while Tailscale is enabled to ensure that the VPN remains active in the event of a system restart, auto-update, crash or other event that might disable the VPN. This automatically generated configuration is removed when the user disables Tailscale. Creating customized VPN On Demand rules disables this behavior in favor of the user's preferred configuration.

## Setting up VPN On Demand

To set up VPN On Demand:

#### iOS

1. Open the Tailscale app on your iOS device.
2. After logging in, open the settings by tapping on your profile picture on the top right.
3. Tap on **VPN On Demand**. If this item is not visible, your system administrator might have hidden the VPN On Demand settings, or you might be running an older version of the Tailscale client. You should update to a newer version from the App Store.
4. You can now enable VPN On Demand and set up your rule set based on the instructions below.

#### macOS

1. Select the Tailscale menu bar icon on your Mac, and then choose **Settings…**.
2. **VPN On Demand** will appear as one of the items. Select **Manage…** to bring up the On Demand settings sheet. If this item is not visible, your system administrator might have hidden the VPN On Demand settings, or you might be running an older version of the Tailscale client. You should update to a newer version from the App Store.
3. You can now enable VPN On Demand and set up your rule set based on the instructions below.

### Choosing your connection rules

Connection rules are available for the Wi-Fi, Cellular, and Ethernet interfaces on your device.

For Wi-Fi interfaces, you can choose from one of the following options:

* **Always**: Tailscale will always connect when a Wi-Fi connection is active.
* **Only On**: Tailscale will always connect when a Wi-Fi connection is active, provided that the current Wi-Fi network is included in the configuration. If the current Wi-Fi network is not in the list of included networks, Tailscale will disconnect.
* **Except On**: Tailscale will always connect when a Wi-Fi connection is active, however it will disconnect if the current Wi-Fi network is included in the list of excepted networks.
* **Never**: Tailscale will always disconnect when a Wi-Fi connection is active.
* **Do Nothing**: Tailscale won't automatically connect or disconnect, allowing you to manually manage the state of the VPN.

For Cellular and Ethernet interfaces, you can choose from one of the following options:

* **Always**: Tailscale will always connect when a cellular data or Ethernet connection is established.
* **Never**: Tailscale will always disconnect when a cellular data or Ethernet connection is established.
* **Do Nothing**: Tailscale won't automatically connect or disconnect, allowing you to manually manage the state of the VPN.

### Using MagicDNS hostname matching

You can also use VPN On Demand to automatically connect Tailscale when iOS or macOS detect a connection to a hostname that ends in `*.ts.net`. This feature is available only when you have set the connection rule for an interface to **Do Nothing**. When any other rule is active, MagicDNS matching will not be available.

## Limitations

VPN On Demand rules can determine whether the Tailscale app is allowed to establish a VPN on your device, and if your rules are not set up correctly, they can prevent Tailscale from connecting.

For instance, if your rules are set to **Never** for an interface, iOS/macOS will disconnect Tailscale. If you attempt to reconnect manually, iOS/macOS will immediately disconnect the VPN again. To get out of this state, you must adjust your connection rules to allow the connection, or disable VPN On Demand entirely.

If you are experiencing any problem or have an enhancement request, [file a GitHub issue][xt-gh-tailscale-issues].

### Using other VPNs

On both iOS and macOS, you can only have one VPN app with On Demand enabled at any given time. If you connect to any other VPN while On Demand is enabled for Tailscale, iOS/macOS will disable it for Tailscale until you manually connect Tailscale again. For more information about using other VPNs together with Tailscale, refer to [this entry][docs-other-vpns].

### Enterprise MDM deployments

VPN On Demand can be applied with a managed VPN profile, but doing so has some consequences. When a managed VPN profile is installed, neither the user nor the Tailscale client are able to change the VPN On Demand settings, which may be undesirable in a situation where the user wishes to disable Tailscale. For example, if an exit node is also forced by policy, and the user is on a network that is blocking the exit node IP, or to action a captive portal page.

For [managed deployments][docs-mdm-mac-vpn], we recommend that the `AlwaysOn.Enabled`, `AlwaysOn.OverrideWithReason`, and `ReconnectAfter` MDM polices be used instead of a managed VPN Profile. This will allow the Tailscale client to set temporary VPN On Demand polices that accomplish the task of ensuring the VPN remains active, while allowing the user to temporarily disable it if needed.

You cannot combine these Tailscale policies with a managed VPN profile.

[docs-mdm-mac-vpn]: /docs/integrations/mdm/mac#deploy-a-vpn-on-demand-configuration-using-mdm

[docs-other-vpns]: /docs/reference/faq/other-vpns

[xt-gh-tailscale-issues]: https://github.com/tailscale/tailscale/issues
