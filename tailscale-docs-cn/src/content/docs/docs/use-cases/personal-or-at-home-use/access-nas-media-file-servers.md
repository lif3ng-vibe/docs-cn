---
title: "Access NAS, media servers, or file shares remotely"
description: "Accessing your home NAS, media library, or file share from outside your network normally means opening firewall ports or running a traditional VPN. Tailscale creates an encrypted, peer-to-peer connect"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Connect to network attached storage (NAS)**](/docs/integrations/nas) — Install the Tailscale client on supported network-attached storage (NAS) devices.

Accessing your home NAS, media library, or file share from outside your network normally means opening firewall ports or running a traditional VPN. Tailscale creates an encrypted, peer-to-peer connection between your devices so you can reach those services from anywhere, without exposing them to the internet.

## Install the Tailscale client on your server

Install the Tailscale client on the device that hosts your files or media to connect it to your Tailscale network (known as a tailnet). If you don't already have a tailnet, one will be created automatically when you authenticate.

#### NAS devices

Tailscale is available as a native package on popular NAS platforms. After installing, sign in with your identity provider to join your tailnet.

* **Synology**: Install from Package Center. Refer to [Tailscale on Synology][docs-synology].
* **QNAP**: Install from App Center. Refer to [Tailscale on QNAP][docs-qnap].
* **Unraid**: Install from the Community Applications plugin. Refer to [Tailscale on Unraid][docs-unraid].
* **TrueNAS Community**: Install from the Apps catalog. Refer to [Tailscale on TrueNAS][docs-truenas].

#### Windows

1. [Download and install the Tailscale client][docs-install-windows], then sign in.
2. Share the folders you want to access: right-click the folder, open **Properties > Sharing**, and configure sharing.
3. Note the machine's Tailscale hostname or IP address. You'll use this to connect from other devices.

#### macOS

1. [Download and install][docs-install-macos] the Tailscale client, then sign in.
2. Enable File Sharing: open **System Settings > General > Sharing**, then turn on **File Sharing**. Add the folders you want to share.
3. Note the machine's Tailscale hostname or IP address. You'll use this to connect from other devices.

#### Linux

1. Install the Tailscale client:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Authenticate and connect to your tailnet:

   ```bash
   sudo tailscale up
   ```

3. Set up your file-sharing service, such as Samba for SMB shares or JellyFin, Emby, or Plex for media. Tailscale handles network access, so only tailnet members can reach your services.

## Install the Tailscale client on your devices

Download and install the Tailscale client on every device you'll be connecting from, then sign in with the same account.

#### Windows

[Download and install][docs-install-windows] the Tailscale client, then sign in. Tailscale appears in the system tray and your tailnet devices are immediately reachable by hostname or Tailscale IP.

#### macOS

[Download and install][docs-install-macos] the Tailscale client, then sign in. The Tailscale menu bar icon confirms your connection status and shows your tailnet devices.

#### iOS / iPadOS

[Download and install][docs-install-ios] the Tailscale client, then sign in. Tailscale runs as a VPN profile, giving all apps on your device access to your tailnet.

#### Android

[Download and install][docs-install-android] the Tailscale client, then sign in. All apps on your device can reach tailnet services once connected.

#### Linux

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Run `tailscale ip` to confirm your assigned Tailscale IP address and verify the connection.

## Access your files and services

The device you're connecting from must have [Tailscale installed and signed in][docs-install] to the same tailnet as your server. Use the server's Tailscale hostname if [MagicDNS][docs-magicdns] is enabled, or find its Tailscale IP address on the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

#### Windows

For file access, open **File Explorer** and enter `\\hostname` or `\\100.x.y.z` in the address bar. To map a persistent drive, right-click **This PC > Map network drive**, enter the path, and choose to reconnect at sign-in.

For JellyFin and Emby, go to `http://hostname:8096` or `http://100.x.y.z:8096`. For Plex, go to `http://hostname:32400` or `http://100.x.y.z:32400`.

#### macOS

For file access, go to **Finder**, choose **Go > Connect to Server** and enter `smb://hostname` or `smb://100.x.y.z`. Enter your credentials when prompted. The share mounts as a network drive in Finder.

For JellyFin and Emby, go to `http://hostname:8096` or `http://100.x.y.z:8096`. For Plex, go to `http://hostname:32400` or `http://100.x.y.z:32400`.

#### iOS / iPadOS

For file access, open the **Files** app, tap **…**, and select **Connect to Server**. Enter `smb://hostname` or `smb://100.x.y.z` and sign in. The share appears under **Network** in the sidebar.

For JellyFin or Emby, add your server using `http://hostname:8096` or `http://100.x.y.z:8096`. For Plex, add your server using `http://hostname:32400` or `http://100.x.y.z:32400`.

#### Android

For file access, use [Files by Google][xt-files-by-google] or another SMB-capable file manager such as [Solid Explorer][xt-solid-explorer] or [MiXplorer][xt-mixplorer]. Add a network connection using `smb://hostname` or `smb://100.x.y.z`.

For JellyFin or Emby, add your server using `http://hostname:8096` or `http://100.x.y.z:8096`. For Plex, add your server using `http://hostname:32400` or `http://100.x.y.z:32400`.

#### Linux

Mount an SMB share from the command line:

```bash
sudo mount -t cifs //hostname/sharename /mnt/myshare -o username=<user>
```

Replace `hostname` with the server's Tailscale IP address if MagicDNS is not enabled.

For JellyFin and Emby, open `http://hostname:8096` or `http://100.x.y.z:8096` in a browser. For Plex, open `http://hostname:32400` or `http://100.x.y.z:32400`.

## Further exploration

* Enable [MagicDNS][docs-magicdns] to use friendly hostnames instead of IP addresses across your tailnet.
* Use [Taildrive][docs-taildrive] to access shared folders directly across your tailnet without configuring SMB.
* Try [Taildrop][docs-taildrop] to send files peer-to-peer between any tailnet devices.
* Use [Tailscale Serve][docs-serve] to expose a local service to other devices in your tailnet.
* [Invite users][docs-invite-users] to join your tailnet and access your shared files and media.
* Use the [tailnet policy file][docs-policy-file] to restrict which tailnet devices and users can reach your server.

[docs-install]: /docs/install

[docs-install-android]: /docs/install/android

[docs-install-ios]: /docs/install/ios

[docs-install-macos]: /docs/install/mac

[docs-install-windows]: /docs/install/windows

[docs-invite-users]: /docs/features/sharing/how-to/invite-users

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-qnap]: /docs/integrations/qnap

[docs-serve]: /docs/features/tailscale-serve

[docs-synology]: /docs/integrations/synology

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-truenas]: /docs/integrations/truenas

[docs-unraid]: /docs/integrations/unraid

[xt-files-by-google]: https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.files

[xt-mixplorer]: https://play.google.com/store/apps/details?id=com.mixplorer.silver

[xt-solid-explorer]: https://play.google.com/store/apps/details?id=pl.solidexplorer2
