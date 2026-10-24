---
title: "Install Tailscale on Android"
description: "Install the Tailscale client on Android devices."
---

Last validated Jan 5, 2026

The Tailscale client works with Android 8.0 or later on devices such as phones, tablets, and Android TV. If you want to install the Tailscale client on ChromeOS, refer to [Install Tailscale on a Chromebook][docs-install-chromebook].

## Use a single sign-on account

You can use this method if you are installing the Tailscale client on an Android phone or Android tablet.

1. Download Tailscale from the [Google Play Store][xt-google-play-tailscale] or go to the Tailscale [Download][co-download-android] page.

2. Launch the app and select **Get Started**, accept the prompts to install a VPN configuration, and allow push notifications. Push notifications serve to alert users that they need to reauthenticate. For example, when keys are about to expire.

3. Tap **Sign in with Google** to use your system Google account, or **Sign in with other** to use any other [supported SSO identity provider][docs-sso-providers].

## Use a QR code

You can use this method if you are installing the Tailscale client on an Android phone, Android tablet, or Android TV. For more information, refer to [Add a device using a QR code][docs-device-add-qr-code].

## Use a generated code

You can use this method if you are installing the Tailscale client on Android TV. It generates an alphanumeric code that you can add in the Tailscale admin console for automatic authentication.

1. Download Tailscale from the [Google Play Store][xt-google-play-tailscale].
   1. Launch the Tailscale app and select **Log in**.
   2. Record the code that is displayed below the QR code.
2. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
   1. Select **Add device**, then **Client device**.
   2. Select **Android** then the **Input code** tab, and enter the code you recorded.
   3. Select **Submit**.

## MDM deployments

You can use [app restrictions][docs-android-mdm] to personalize Tailscale for Android programmatically. This can help you deploy Tailscale within an organization using solutions like MDM.

[co-download-android]: https://tailscale.com/download/android

[docs-android-mdm]: /docs/integrations/mdm/android

[docs-device-add-qr-code]: /docs/features/access-control/device-management/how-to/set-up-qr-code

[docs-install-chromebook]: /docs/install/chromebook

[docs-sso-providers]: /docs/integrations/identity

[xt-google-play-tailscale]: https://play.google.com/store/apps/details?id=com.tailscale.ipn
