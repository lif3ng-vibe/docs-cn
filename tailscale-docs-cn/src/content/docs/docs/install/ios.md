---
title: "Install Tailscale on iOS"
description: "Install the Tailscale client on iOS."
---

Last validated Feb 21, 2025

Tailscale works with iOS 15.0 or later. It supports both iPhone and iPad.

1. Download Tailscale from the [App Store][xt-app-store-tailscale] or scan the QR code on the Tailscale [Download][co-download-ios] page.

2. Launch the app, select **Get Started**, accept the prompts to install a VPN configuration, and allow push notifications. Push notifications serve to alert users that they need to reauthenticate. For example, when keys are about to expire.

3. Select **Log in** and sign up using a [supported SSO identity provider][docs-sso-providers].

## MDM deployments

You can use [configuration profiles and user defaults][docs-ios-mdm] to personalize Tailscale for iOS programmatically. This can help you deploy Tailscale using solutions like MDM.

[co-download-ios]: https://tailscale.com/download/ios

[docs-ios-mdm]: /docs/integrations/mdm/ios

[docs-sso-providers]: /docs/integrations/identity

[xt-app-store-tailscale]: https://apps.apple.com/app/tailscale/id1470499037
