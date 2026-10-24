---
title: "Install Tailscale on Amazon Fire devices"
description: "Install Tailscale on your Amazon Fire devices, including Amazon Fire TV and Amazon Fire Tablets."
---

Last validated Oct 6, 2026

Tailscale works with Amazon Fire TV devices that run certain versions of Fire OS. However, Tailscale is not available in the Amazon Appstore. Instead, you can download and install Tailscale directly from the package server.

> **Note:**
>
> Tailscale is not available on devices that run Fire OS versions 5 or 6, or on devices that run Vega OS.

If you previously downloaded Tailscale from the Amazon Appstore, you can continue to use it on your Fire TV device but you won't be able to apply updates. To be able to apply updates, uninstall Tailscale from your device and then use the following steps to reinstall it.

1. [Download][pk-stable-android] Tailscale from the package server and install it on your Amazon Fire device. Make sure you download the Universal Android application package (APK).

   > **Note:**
   >
   > This APK does not install updates automatically. You will need to manually install new updates when they become available.

2. Launch the Tailscale app and select **OK** in the **Connection request** window. Then select **Get Started**, and accept the prompts to install a VPN configuration.

3. Select **Log in** and sign in using your [SSO identity provider][docs-sso-providers]. If you are using a Fire TV device, a QR code will display. Use your phone to scan QR code for authorizing the Amazon Fire device to your tailnet.

> **Note:**
>
> If [device approval][docs-device-approval] is enabled, the Amazon Fire device will not be accessible in the tailnet until an administrator approves the device.

## Supported hardware

Tailscale can be installed on Amazon Fire TV devices that run Fire OS, except for Fire OS versions 5 or 6. It is not supported on Vega OS in any way, including on devices such as the Fire TV Stick 4k Select.

For a complete list of devices that run Fire OS, refer to [Fire OS versions][xt-amazon-fire-os].

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-sso-providers]: /docs/integrations/identity

[pk-stable-android]: https://pkgs.tailscale.com/stable/#android

[xt-amazon-fire-os]: https://developer.amazon.com/docs/fire-tv/fire-os-overview.html#fire-os-versions
