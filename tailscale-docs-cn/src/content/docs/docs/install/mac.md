---
title: "Install Tailscale on macOS"
description: "Install the Tailscale client on macOS."
---

Last validated Jan 5, 2026

> **Note:**
>
> The current version of the Tailscale client requires macOS Monterey 12.0 or later.

1. Download and install the Tailscale client using one of the following options:

   * [Standalone variant][pk-stable-macos] from Tailscale's package server (recommended).
   * [Mac App Store][xt-apple-tailscale-macos] variant. The Tailscale client is free to download, but downloading any app from the Mac App Store may require an Apple ID with a valid credit card attached.
   * [Our open source][xt-gh-tailscale-macos] variant from our GitHub repository.

2. Follow the Tailscale onboarding flow, which will guide you to install the Tailscale VPN configuration.

3. Sign up with [your SSO identity provider][docs-sso-providers].

For more information about the different variant options, refer to [Three ways to run Tailscale on macOS][docs-macos-variants].

## MDM deployments

You can use [configuration profiles and user defaults][docs-macos-mdm] to personalize your setup of Tailscale for macOS programmatically. This can help you deploy Tailscale using solutions like MDM.

## Troubleshooting

For common macOS issues and suggestions to help resolve them, refer to the [Troubleshooting guide][docs-troubleshooting-apple].

[docs-macos-mdm]: /docs/integrations/mdm/mac

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-sso-providers]: /docs/integrations/identity

[docs-troubleshooting-apple]: /docs/reference/troubleshooting/apple

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-apple-tailscale-macos]: https://apps.apple.com/app/tailscale/id1475387142

[xt-gh-tailscale-macos]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS
