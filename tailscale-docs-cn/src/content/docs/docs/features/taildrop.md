---
title: "Taildrop"
description: "Send files between your personal devices on a Tailscale network."
---

Last validated Jan 5, 2026

> **Note:** Taildrop is currently in alpha.

> **Note:** Taildrop is available for [all plans](https://tailscale.com/pricing).

Taildrop lets you send files between your personal devices on a Tailscale network (known as a tailnet).

Like all traffic sent over Tailscale, Taildrop transfers files over encrypted peer-to-peer connections, using the fastest available path. This makes it a great solution for sending sensitive or large files without third-party servers in the middle.

> **Note:**
>
> Taildrop is in public alpha, with many planned improvements to the user interface and capabilities. To try Taildrop, you must [opt-in for your network][ar-enable-taildrop-for-your-network].

## Enable Taildrop for your network

Because Taildrop is an alpha feature, you must opt-in your tailnet to the feature to use it. You can do so from the [General](https://console.tailscale.com/admin/settings/general) settings page of the admin console, by turning on the **Send Files** feature.

## Client setup

Except for network access storage (NAS) devices, Taildrop does not require client setup other than [installing Tailscale][docs-installation].

If you need to set up Taildrop for a NAS device, refer to [Taildrop with NAS devices][docs-taildrop-nas].

## Send files with Taildrop

You can transfer any kind of file with Taildrop.

Taildrop is currently limited to sending files between your own personal devices. You cannot send files to devices owned by other users (even users on the same Tailscale network).

> **Note:**
>
> Taildrop permits you to share files between devices that you are logged in to, even if access control policies are used to restrict access to the devices. You cannot use Taildrop to send files to and from nodes you have tagged.

Taildrop also requires both devices to be running Tailscale.

#### macOS

Before using Taildrop for the first time, it must be enabled in **System Settings** > **General** > **Login Items & Extensions** > **Sharing**. Enable sharing for **Tailscale**.

*（图：The macOS System Settings window for the Tailscale extension with 'Sharing' checked.）*

Send files to other devices by using the right-click **Share** menu.

*（图：A macOS Finder window with a file's context menu open. The 'Share' menu option is selected and opening a second menu. Tailscale is selected in the second menu.）*

#### iOS

Send files to your other devices using the Share menu. Choose Tailscale and tap the device you'd like to send files to.

*（图：An example of the share options for a photo. In the list of applications, the Tailscale option is indicated with a red outline.）*

> **Note:**
>
> The first time you use Taildrop, the **Tailscale** option may be hidden in the **More** section of the menu. iOS sorts Share apps by frequency of use, and so Tailscale should be visible once you've sent a file.

#### Windows

Send files to other devices by right-clicking on the files and choosing **Send with Tailscale** from the menu.

*（图：A Windows desktop with a file's context menu open. The 'Send with Tailscale...' option is listed.）*

#### Android

Send files to your other devices using the **Share** button. Choose Tailscale and tap the device you'd like to send files to.

*（图：An example of the share options for a photo. In the list of applications, the Tailscale application is listed.）*

> **Note:**
>
> The first time you use Taildrop, the **Tailscale** option may be hidden in the **More** section of the **Share to Apps** list. Android sorts Share apps by frequency of use, and so Tailscale should be visible once you've sent a file.

#### Linux

You can send files using the [`tailscale file`][docs-cli-file] command of the [command-line interface (CLI)][docs-cli].

```shell
tailscale file cp <files> <name-or-ip>:
```

For example, you can send a text file to your phone with the command:

```shell
tailscale file cp ./my-file.txt my-phone:
```

The last argument is the name of the destination followed by a colon, intended to disambiguate filenames from device names, and to roughly match the `scp` syntax.

You can find the IP addresses and names of your other nodes using the [`tailscale status`][docs-cli-status] command.

### Resume interrupted transfers

If your Taildrop file transfer is interrupted, you can retry the transfer and Taildrop will attempt to resume the transmission where it left off. This is especially useful when transferring large files. In most cases, a transfer can be resumed for up to an hour after it failed. For now, Taildrop can resume transfers on all platforms except when a macOS or iOS device is receiving the file.

## Receive files with Taildrop

#### macOS

Files received on macOS will be placed in the `~/Downloads` directory.

#### iOS

Files received on iOS will pop up a notification. Opening this notification will show the files in Files.app.

#### Windows

Files received on Windows will be placed in the `C:\Users\(username)\Downloads` directory if you are running
Tailscale v1.34 or later. If you are running an earlier version, files received will be placed in the `C:\Users\(username)\Desktop` directory.

#### Android

Files received on Android will pop up a notification. Opening this notification will show the files in the Downloads section of the Files app.

#### Linux

You can receive files using the [`tailscale file`][docs-cli-file] command of the [command-line interface (CLI)][docs-cli].

```shell
sudo tailscale file get .
```

Where `.` can be any directory you'd like to copy files to.

Because tailscaled runs as root, files are received by root. In the current version, root has to retrieve the files using sudo.

## Example: Securely transfer sensitive documents from your computer to mobile device for easier on-the-go access

Finding a way to transfer sensitive files (such as medical or tax documents) between your devices can be fairly involved. Cloud-based transfer or file storage solutions carry the security and vulnerability risks of having your documents accessible over the internet. Airdrop works without needing to upload anything to the internet, but only between Apple devices and only when they're close to one another.

Taildrop provides an easy way to share your sensitive files between any of your devices. And no matter where your devices are, the files are sent over encrypted peer-to-peer connections. So, you're guaranteed the only machines that will ever have access to the files during the transfer are the sending and receiving devices.

## Example: Send family photos from your phone to your computer

Taildrop lets you share your photos cross-platform without needing to upload them anywhere.

## Example: Share screenshots to your computer

Ever take screenshots or screen recordings but don't actually need them on the device you captured them on? Here at Tailscale we take a lot of screenshots of our client apps during the development process that we then have to transfer to our computers so we can upload them to a desktop tool such as GitHub or Figma. Taildrop helps you quickly transfer these, so you can seamlessly switch back and forth between working on the sending and receiving devices.

## Example: Transfer Google Photos albums to a personal photos server

If you're looking to transfer your photos out of Google Photos and to a personal media server, Taildrop may be able to help you out. The steps below describe how to move an album from Google Photos to a remote personal machine.

**Steps:**

1. From your computer's browser, go to the Google Photos website and select an album.

2. In the top right corner, select the rightmost menu item and choose **Download all**.

   *（图：Example of a Google Photos album. The rightmost menu is open and 'Download all' is selected.）*

3. This will download a zip file of the album to your computer. If this computer is the end destination that you want your photos on, you can stop here, no need to Taildrop.

4. But if you want to transfer your photos to a remote device (maybe a device you've dedicated as a media server), you can right-click on the zip file and choose to share with Taildrop.

   *（图：Context menu for a zip file of album photos. The 'Share' menu option is selected and opening a second menu. Tailscale is selected in the second menu.）*

5. From the Taildrop modal, select your media server and the zip file will be transferred to that device.

   *（图：The modal window with a list of devices. The selected device has a progress bar to indicate the transfer is in progress.）*

   *（图：The modal window with a list of devices. The selected device has a checkmark to indicate the transfer is complete.）*

6. After the transfer completes, you can delete the zip file from your original device.

[ar-enable-taildrop-for-your-network]: #enable-taildrop-for-your-network

[docs-cli-file]: /docs/reference/tailscale-cli#file

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli]: /docs/reference/tailscale-cli

[docs-installation]: /docs/install

[docs-taildrop-nas]: /docs/features/taildrop/how-to/set-up-taildrop-with-nas
