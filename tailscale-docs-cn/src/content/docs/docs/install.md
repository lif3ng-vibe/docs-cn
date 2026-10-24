---
title: "Install Tailscale"
description: "Install and uninstall the Tailscale client."
---

Last validated Dec 19, 2025

[Download Tailscale](https://tailscale.com/download)

New users can follow the instructions in [Tailscale quickstart][docs-install] to create an account, install the Tailscale client, and configure some commonly used features.

## Install and update instructions

The following topics provide platform-specific client update and installation instructions.

* [Install on Linux][docs-install-linux]
* [Install on macOS][docs-install-mac]
* [Three ways to run Tailscale on macOS][docs-macos-variants]
* [Install on Windows][docs-install-windows]
* [Install on Windows with MSI][docs-install-windows-msi]
* [Install on Windows with WSL 2][docs-install-windows-wsl2]
* [Install on a Chromebook][docs-install-chromebook]
* [Install on an Apple TV][docs-appletv]
* [Install on iOS][docs-install-ios]
* [Install on Android][docs-install-android]
* [Install on Amazon Fire devices][docs-install-amazon-fire]
* [Deploy and configure Tailscale with mobile device management (MDM) and system policy solutions][docs-mdm]

## Install and update options

There are multiple ways to download, install, and update versions of the Tailscale client.

### Manual installs and updates

You can manually install and update your Tailscale clients using one of the following methods:

* **Download page**: Install or update from the Tailscale [Download][co-download] page.
* **Client user interface**: Update from the [user interface of an installed client][docs-update-manual] where an update option is available, including Windows and macOS.
* **Tailscale CLI**: Update using the [`tailscale update`][docs-cli-update] command where [Tailscale CLI][docs-cli] functionality is available, including Linux, Windows, and macOS.
* **App stores**: Install and update from app stores for the platforms that we support, such as Apple App Store, Google Play, and Amazon Appstore.
* **Packages site**: Install and update from the [Tailscale Packages][pk-home] site. This lets you choose the stable, release candidate, or unstable build track to suit your needs. For more information, refer to [Tailscale client versions and release tracks][docs-versions-tracks].

For more information, refer to [Update Tailscale][docs-update].

### Auto updates

You can configure your Tailscale clients to automatically update and deploy updates to devices using one of the following methods:

* **Admin console**: Configure [automatic updates][docs-update-auto-on-device] from the admin console.
* **Client settings**: Configure [automatic updates][docs-update-auto-on-device] from the UI settings of a client or device app store settings.
* **System policies**: Use an [MDM solution][docs-mdm-keys-auto-update] such as Google Workspace, Jamf, Iru (formerly Kandji), or Microsoft Intune to automatically update devices.

For more information, refer to [Update Tailscale][docs-update].

## Uninstall instructions

For information about uninstalling the Tailscale client, refer to [Uninstall Tailscale][docs-uninstall].

[co-download]: https://tailscale.com/download

[docs-appletv]: /docs/install/appletv

[docs-cli-update]: /docs/reference/tailscale-cli#update

[docs-cli]: /docs/reference/tailscale-cli

[docs-install-amazon-fire]: /docs/install/amazon-fire

[docs-install-android]: /docs/install/android

[docs-install-chromebook]: /docs/install/chromebook

[docs-install-ios]: /docs/install/ios

[docs-install-linux]: /docs/install/linux

[docs-install-mac]: /docs/install/mac

[docs-install-windows-msi]: /docs/install/windows/msi

[docs-install-windows-wsl2]: /docs/install/windows/wsl2

[docs-install-windows]: /docs/install/windows

[docs-install]: /docs/how-to/quickstart

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-mdm-keys-auto-update]: /docs/features/tailscale-system-policies#configure-the-auto-update-settings

[docs-mdm]: /docs/mdm

[docs-uninstall]: /docs/features/client/uninstall

[docs-update-auto-on-device]: /docs/features/client/update#enable-auto-updates-on-devices

[docs-update-manual]: /docs/features/client/update#manual-updates

[docs-update]: /docs/features/client/update

[docs-versions-tracks]: /docs/reference/tailscale-client-versions#client-release-tracks

[pk-home]: https://pkgs.tailscale.com/
