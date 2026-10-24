---
title: "Uninstall Tailscale"
description: "Here's how to uninstall Tailscale from your device, or completely reset Tailscale for debugging purposes."
---

Last validated Jul 22, 2026

Here's how to uninstall Tailscale from your device, or completely reset Tailscale for debugging purposes.

#### Windows

Tailscale for Windows can be uninstalled like any Windows app, by using the Windows Control Panel. Go to **Settings** > **Apps**, find **Tailscale**, and press the **Uninstall** button.

If you want to completely delete Tailscale, removing any state or local information, you can also remove the files at the following paths:

```powershell
C:\ProgramData\Tailscale
C:\Users\%USERNAME%\AppData\Local\Tailscale
C:\Windows\System32\config\systemprofile\AppData\Local\Tailscale
```

The path under `System32` was only used in older versions of the Tailscale client and may not be present on your system.

After uninstalling Tailscale, if you install Tailscale on a device again at a later time, it will have a [new IP address][docs-ip-and-dns-addresses].

#### macOS (App Store)

Tailscale is a standard Mac App Store app. To uninstall it, [delete it like any other Mac app][xt-apple-docs-mac-uninstall].

If you want to completely delete Tailscale, removing any state or local information, you can also take the following steps:

1. Remove the following files if they exist in the specified paths. As some of these may be owned by the root user, deleting them may require using `sudo rm -rf <path>` in the Terminal.

   ```shell
   ~/Library/Application Scripts/*.io.tailscale.ipn.macos
   ~/Library/Application Scripts/io.tailscale.ipn.macos
   ~/Library/Application Scripts/io.tailscale.ipn.macos.login-item-helper
   ~/Library/Application Scripts/io.tailscale.ipn.macos.share-extension
   ~/Library/Caches/io.tailscale.ipn.macos
   ~/Library/Containers/io.tailscale.ipn.macos
   ~/Library/Containers/io.tailscale.ipn.macos.login-item-helper
   ~/Library/Containers/io.tailscale.ipn.macos.network-extension
   ~/Library/Containers/io.tailscale.ipn.macos.share-extension
   ~/Library/Containers/Tailscale
   ~/Library/Group Containers/*.io.tailscale.ipn.macos
   ~/Library/HTTPStorages/io.tailscale.ipn.macos
   ~/Library/Preferences/io.tailscale.ipn.macos.plist
   ~/Library/Tailscale
   ```

2. Remove the Tailscale VPN configuration if it still exists.

   **macOS Ventura 13.0 or later**: Open **System Settings** > **Network** > **VPN**. Look for **Tailscale Tunnel** in the list of services. If it's there, select the circled **i** and then select the **Remove Configuration** button. Be sure to apply your changes.

   **Previous macOS versions**: Open **System Preferences** > **Network**. Look for **Tailscale Tunnel** in the list of services. If it's there, remove it by selecting it and pressing the **-** button at the bottom. Be sure to apply your changes.

3. Open **Keychain Access** and search for `tailscale`, and delete any entries you find. This includes `tailscale-machinekey`, `tailscale-logdata` and `tailscale-preferences`.

After taking these steps, if you install Tailscale on this device again at a later time, it will have a [new IP address][docs-ip-and-dns-addresses].

#### macOS (Standalone)

To uninstall the [Standalone variant][docs-macos-variants] of Tailscale, drag its icon to the Trash and confirm that macOS also removes the system extension.

If you want to completely delete Tailscale, removing any state or local information, you can also take the following steps:

1. Remove the Tailscale VPN configuration if it still exists.

   **macOS Ventura 13.0 or later**: Open **System Settings** > **Network** > **VPN**. Look for **Tailscale** in the list of services. If it's there, select the circled **i** and then select the **Remove Configuration** button. Be sure to apply your changes.

   **Previous macOS versions**: Open **System Preferences** > **Network**. Look for **Tailscale Tunnel** in the list of services. If it's there, remove it by selecting it and pressing the **-** button at the bottom. Be sure to apply your changes.

2. Remove the following files if they exist in the specified paths. As some of these may be owned by the root user, deleting them may require using `sudo rm -rf <path>` in the Terminal.

   ```shell
   ~/Library/Application Scripts/*.io.tailscale.ipn.macsys
   ~/Library/Application Scripts/io.tailscale.ipn.macsys
   ~/Library/Application Scripts/io.tailscale.ipn.macsys.login-item-helper
   ~/Library/Application Scripts/io.tailscale.ipn.macsys.share-extension
   ~/Library/Caches/io.tailscale.ipn.macsys
   ~/Library/Containers/io.tailscale.ipn.macsys
   ~/Library/Containers/io.tailscale.ipn.macsys.login-item-helper
   ~/Library/Containers/io.tailscale.ipn.macsys.share-extension
   ~/Library/Containers/Tailscale
   ~/Library/Group Containers/*.io.tailscale.ipn.macsys
   ~/Library/HTTPStorages/io.tailscale.ipn.macsys
   ~/Library/Preferences/io.tailscale.ipn.macsys.plist
   /Library/Tailscale
   ```

   Alternatively, if [Homebrew][xt-homebrew] is installed, you may automate the files deletion by running this command which will perform the uninstall steps defined in the [Tailscale cask][xt-homebrew-tailscale-cask].

   ```shell
   brew uninstall --cask --zap --force tailscale
   ```

3. Open **Keychain Access**, search for `tailscale`, and delete any entries you find. This includes `tailscale-machinekey`, `tailscale-logdata` and `tailscale-preferences`.

After taking these steps, if you install Tailscale on this device again at a later time, it will have a [new IP address][docs-ip-and-dns-addresses].

#### iOS

Uninstall Tailscale as you would any iOS app by long pressing its icon in the iOS home screen and tapping the **X** button that appears. No extra steps are needed.

#### tvOS

Uninstall Tailscale as you would any tvOS app by long pressing its icon in the Apple TV home screen, and selecting **Delete Tailscale**. No extra steps are needed.

#### Android

Uninstall Tailscale as you would any Android app. No extra steps are needed.

#### Linux

Uninstall Tailscale by using the uninstall command of the package manager you used to install the binary in the first place:

For all **Ubuntu and Debian versions**, uninstall using apt-get:

```shell
sudo apt-get remove tailscale
```

For **CentOS 7 and Amazon Linux 2**, uninstall using yum:

```shell
sudo yum remove tailscale
```

For **openSUSE Leap 15.1, 15.2, and openSUSE Tumbleweed**, uninstall using `zypper`:

```shell
sudo zypper rm tailscale
```

For **CentOS 8, CentOS Stream 9, RHEL 8, and Fedora**, uninstall using `dnf`:

```shell
sudo dnf remove tailscale
```

## Completely delete Tailscale

If you want to completely delete Tailscale and remove all state and local information, you can also remove the file at:

```shell
/var/lib/tailscale/tailscaled.state
```

After uninstalling Tailscale, if you install Tailscale on a device again at a later time, it will have a [new IP address][docs-ip-and-dns-addresses].

#### Synology

1. Uninstall Tailscale from Synology package center.
2. Delete Synology node from Tailscale admin console.
3. Remove the files at the following paths:
   ```
   /var/packages/Tailscale/var/*
   /var/packages/Tailscale/etc/*
   ```

After uninstalling Tailscale, if you install Tailscale on a device again at a later time, it will have a [new IP address][docs-ip-and-dns-addresses].

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-macos-variants]: /docs/concepts/macos-variants

[xt-apple-docs-mac-uninstall]: https://support.apple.com/102610

[xt-homebrew-tailscale-cask]: https://github.com/Homebrew/homebrew-cask/blob/master/Casks/t/tailscale-app.rb

[xt-homebrew]: https://brew.sh
