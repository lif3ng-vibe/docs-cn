---
title: "Install Tailscale on a Chromebook"
description: "Install the Tailscale client on a Chromebook."
---

Last validated Aug 22, 2025

You can install Tailscale on a Chromebook from the Google Play Store. It runs as an Android app on ChromeOS.

> **Note:**
>
> Some policies might prevent you from installing Android apps on a Chromebook. If your device is on a network that prevents installing Android apps, there is currently no alternative to install Tailscale.

1. From the **Launcher**, open **Play Store**.
2. Locate the Tailscale application and select **Install**.
3. Open the Tailscale app and select **Get Started**. When the **Connect request** dialog displays, select **OK**.
4. Select **Log in** and sign in using your [SSO identity provider][docs-sso-providers].
5. When the **Notifications** dialog displays, select **Continue**.
6. When the **Allow Tailscale to send you notifications?** dialog displays, choose whether you want the client to display notifications.

## MDM deployments

If you want to deploy Android in an environment using an MDM solution, refer to [Deploy Tailscale on Android using MDM][docs-android-mdm].

[docs-android-mdm]: /docs/integrations/mdm/android

[docs-sso-providers]: /docs/integrations/identity
