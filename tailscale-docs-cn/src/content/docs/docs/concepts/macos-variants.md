---
title: "Three ways to run Tailscale on macOS"
description: "Explore three ways to run Tailscale on macOS so you can choose the right approach for your situation."
---

Last validated Jan 5, 2026

> **Note:**
>
> The current version of the Tailscale client requires macOS Monterey 12.0 or later.

The best way to install Tailscale on macOS is to download and install our application from our package server.

[Download Tailscale](https://pkgs.tailscale.com/stable/Tailscale-latest-macos.pkg)

However, there are three ways (variants) to run Tailscale on macOS. You can choose the method that best fits your needs.

* Download and install our Standalone variant of the application directly [from Tailscale's package server][pk-stable-macos] (recommended).
* Install Tailscale from [the Mac App Store][xt-app-store-link].
* Download and install the open source `tailscale` + `tailscaled` CLI-only distribution from our [GitHub repository][xt-gh-tailscale-tailscaled-macos].

All three variants share the same core functionality for connecting your macOS device to Tailscale. However, there are subtle differences in the way that the variants are packaged and how they interact with macOS. You should choose the variant that best fits your use case.

We recommend downloading and installing the Standalone variant Tailscale app directly from our package server, as this variant offers more features, is not subject to limitations imposed on apps distributed through the App Store, and provides more control over the deployment of updates.

> **Note:**
>
> The following related video provides additional context and examples.

[Tailscale macOS Quickstart (video)](https://www.youtube.com/watch?v=vkZwu7I4tcY)

## What are the differences?

### Standalone variant

We always recommend installing the [Standalone variant][pk-stable-macos] of the Tailscale application on macOS.

In macOS Catalina 10.15, Apple added support for the [system extensions][xt-apple-system-extensions]
approach to implement VPNs. System extensions offer a more secure alternative to the legacy Kernel Extensions technology
previously used by many security and networking tools on older macOS versions. These extensions run with root privileges
but remain within a sandbox, ensuring that Tailscale operates isolated from the macOS kernel. A key advantage of system extensions
is their ability to be distributed outside of the Mac App Store. This lets us offer a version of Tailscale that doesn't require
an Apple ID for installation — you can open our `.pkg` installer to begin using Tailscale.

With the Standalone variant of our app, security updates are promptly distributed since they don't need to undergo Apple's App Store review process.
Additionally, Tailscale can detect third-party tools interfering with the VPN tunnel and notify you when conflicts are detected.

### Mac App Store variant

To be in the Mac App Store, applications are required by Apple to run in the [macOS App Sandbox][xt-apple-macos-sandbox],
isolating the app from the rest of the system. When running in a sandbox, VPN applications need to be a [Network Extension][xt-apple-network-extensions]
to implement VPNs or VPN-like functionality. The Network Extension system does not work for applications distributed outside of the Mac App
Store.

The main advantage of installing Tailscale through the Mac App Store is that it is very easy to get started. However, because both the Tailscale app and its Network Extension are sandboxed and running as the local user, there are a number of limitations.
For instance, a very common issue is that the Screen Time web filter can conflict with the Tailscale version distributed on the App Store.

### Open source `tailscaled` variant

It is possible to run the [open source Tailscale code (tailscaled)][xt-gh-tailscale-tailscaled-macos] on macOS.
This uses the kernel [`utun` interface][xt-wikipedia-tuntap],
rather than the Network Extension or System Extension frameworks. However, this variant does not include a graphical user interface (GUI); all functionality must be managed from the command line. Additionally when using the open source `tailscaled` variant, you won't be able to manage Tailscale from the VPN settings on macOS.

`tailscaled` on macOS is only recommended for unattended installs managed by
experienced macOS system administrators.

## Which should I choose?

Always start by downloading and installing our [Standalone variant macOS app][pk-stable-macos]. Install Tailscale from the Mac App Store only if you are unable to install the Standalone variant, or
if you're deploying Tailscale in an environment where relying on the Mac App Store for install and updates is essential.

> **Note:**
>
> Do not install the Mac App Store variant and the Standalone variant on the same machine. Having both variants running simultaneously can prevent the Tailscale extension from launching. To safely switch between macOS variants, delete the `Tailscale.app` currently installed, empty the Trash, and reboot your Mac before attempting to install a different variant.

### Comparison table

This table presents the major differences in functionality between the three variants:

App StoreNetwork Extension
StandaloneSystem Extension
tailscaledutun interface

Available
yes
yes
yes

GUI
yes
yes
no

CLI
yes
yes
yes

Minimum macOS
macOS Monterey 12.0
macOS Monterey 12.0
macOS Monterey 12.0

Requires Apple ID
yes
no
no

Run before login
no; sandboxed
no
yes

Keychain used
user
none; files on disk
none; files on disk

Sandboxed
yes
system ext only
no

Auto-updates
yes; managed by the App Store
yes; managed in-app (Sparkle)
no

Open Source
no
no
yes

MagicDNS
yes
yes
yes

Taildrop
yes
yes
incomplete

Funnel
no
no
yes

Exit nodes
yes
yes
partial; can advertise as exit node but cannot use them

MDM support
yes
yes
no

Can be a Tailscale SSH server
no
no
yes

Can be a Tailscale SSH client
yes
yes
yes

Supports `tailscale ssh` CLI command
no, must use the regular `ssh` command
yes
yes

Supports services collection
no
yes
yes

Compatible with Screen Time web filter
no
yes
yes

Can generate configuration reports for support
limited
yes
no

## Automating App Store installs

To automate installs of the Mac App Store version of Tailscale, the
[`mas-cli` tool][xt-gh-mas-cli] lets you run:

```shell
mas install 1475387142
```

## Troubleshooting

To review common macOS issues and suggestions to help resolve them, refer to the [Troubleshooting guide][docs-troubleshooting-apple].

[docs-troubleshooting-apple]: /docs/reference/troubleshooting/apple

[pk-stable-macos]: https://pkgs.tailscale.com/stable/#macos

[xt-app-store-link]: https://apps.apple.com/app/tailscale/id1475387142

[xt-apple-macos-sandbox]: https://developer.apple.com/library/archive/documentation/Security/Conceptual/AppSandboxDesignGuide/AboutAppSandbox/AboutAppSandbox.html

[xt-apple-network-extensions]: https://developer.apple.com/documentation/networkextension

[xt-apple-system-extensions]: https://developer.apple.com/system-extensions

[xt-gh-mas-cli]: https://github.com/mas-cli/mas

[xt-gh-tailscale-tailscaled-macos]: https://github.com/tailscale/tailscale/wiki/Tailscaled-on-macOS

[xt-wikipedia-tuntap]: https://en.wikipedia.org/wiki/TUN/TAP
