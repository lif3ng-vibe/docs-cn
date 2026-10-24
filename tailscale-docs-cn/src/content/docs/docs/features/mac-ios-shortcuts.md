---
title: "macOS and iOS shortcuts"
description: "Understand how Tailscale works with the Shortcuts app, allowing you to automate tasks."
---

Last validated Jan 5, 2026

Tailscale works with the Shortcuts app on macOS and iOS to provide several built-in shortcut actions, allowing you to automate tasks. For example, you can create shortcuts to connect your device to a tailnet, use an exit node, or switch user accounts.

You can combine the Tailscale actions with other available actions to customize tasks, such as automatically connecting to your tailnet if your device is not on your home Wi-Fi. Depending on how you set up your shortcuts, you access shortcuts in the Shortcuts app, the menu bar, in Spotlight, and other places.

> **Note:**
>
> For general information about macOS and iOS shortcuts, refer to Apple's [Shortcuts User Guide for Mac][xt-mac-shortcuts] and [Shortcuts User Guide for iOS][xt-ios-shortcuts].

## Prerequisites

To use Tailscale with the Shortcuts app, you must meet the following requirements:

* Tailscale version 1.36 or later
* macOS Monterey 12.0 or later
* iOS 15.0 or later

## Available actions

The Tailscale client offers actions for interacting with accounts, devices, exit nodes, and your tailnet.

### Accounts

The following Tailscale actions let you manage your Tailscale accounts:

* [Find Accounts][ar-find-accounts]
* [Switch Accounts][ar-switch-accounts]

#### Find Accounts

Retrieve accounts signed into the Tailscale client that match the provided criteria. You can filter accounts by **Display Name** or **Login Name**. You can also specify the sort by, sort order, and limit of the results.

#### Switch Accounts

[Switch Tailscale user accounts][docs-fast-user-switching]. You can optionally specify the account username to which to switch. If you don't specify an account username, the action will ask you to select one when it runs.

### Devices

The following Tailscale actions let you manage devices:

* [Find Devices][ar-find-devices]
* [Ping Devices][ar-ping-devices]
* [Send File][ar-send-files]

#### Find Devices

Retrieve all devices in your tailnet that match the provided criteria. You can filter devices by **Name** or connection status (**Is Online** or **Is Offline**). You can also specify the sort by, sort order, and limit of the results.

#### Ping Devices

Send a [ping][docs-tailscale-ping] to a device in your tailnet and retrieve the ping result. You can ping a device by its device name, [Tailscale IP address][docs-tailscale-ip-addresses], [MagicDNS][docs-magicdns] name, device ID, IPv4 address, or IPv6 address.

#### Send File

Use [Taildrop][docs-taildrop] to send one or more files to a device in your tailnet. You specify the files to send and the device to which to send the files.

### Exit nodes

> **Note:**
>
> You must already have an exit node in your tailnet before using it from a macOS or iOS shortcut.
>
> Exit node actions are sensitive actions because an exit node affects all network traffic on your device. On iOS, you must unlock your device before using an exit node action.

The following Tailscale actions let you manage [exit nodes][docs-exit-nodes]:

* [Use Exit Node][ar-use-exit-node]
* [Stop Using Exit Node][ar-stop-using-exit-node]

#### Use Exit Node

Set your device to use an exit node by its [name][docs-machine-names] or [Tailscale IP address][docs-tailscale-ip-addresses].

#### Stop Using Exit Node

Set your device to stop using an exit node.

### Tailnet management

The following Tailscale actions let you manage your tailnet:

* [Connect][ar-connect]
* [Disconnect][ar-disconnect]
* [Get Status][ar-get-status]
* [Set Tailscale DNS][ar-set-tailscale-dns]
* [Toggle][ar-toggle]

#### Connect

Connect your device to your tailnet.

#### Disconnect

Disconnect your device from your tailnet.

#### Get Status

Retrieve status information about the Tailscale client. It returns the following values:

* **Connected** (`boolean`): Whether the device is connected to a tailnet.
* **Account Name** (`string`): The Tailscale username (such as `alice@example.com`).
* **Using Exit Node** (`boolean`): Whether the device currently uses an exit node.
* **Exit Node Name** (`string`): The name of the exit node.

#### Set Tailscale DNS

Modify whether your device uses [Tailscale DNS][docs-dns]. You can use this action to:

* Turn on Tailscale DNS.
* Turn off Tailscale DNS.
* Toggle using Tailscale DNS (the result varies depending on the status when the action runs).

#### Toggle

Toggle the connection status of your device. You can use this action to connect to or disconnect from your tailnet. After the action runs, it returns either **Yes** or **No** to indicate whether the device is connected (Yes) or disconnected (No).

## Examples

### Switch accounts

This example shows how to create a [macOS shortcut][xt-mac-shortcuts] that switches between Tailscale accounts. The example uses the [Get Status][ar-get-status] and the [Switch Account][ar-switch-accounts] actions.

1. In the **Shortcuts** app, select **File** and then select **New Shortcut**.
2. Select **Shortcut Name** and provide a name, such as **Switch Tailscale user**.
3. In the right-hand panel, select **Apps**.
4. Search for or scroll to the **Tailscale** app and select it.
5. Drag the **Get Status** action to the shortcut editor.
6. In the right-hand panel, search for the **If** action, and drag the **If** action to the shortcut editor and place it below the **Get status** statement. You can also find the **If** action by selecting **Categories**, **Scripting**, and then **Control Flow**.
7. For the **If** statement, select **Status** and choose the Tailscale **Account Name** variable.
8. Select **Condition**, select **Is**, and then select **Text**. Enter a user account, such as `alice@example.com`.
9. From the right-hand panel, drag the **Switch Account** action to the shortcut editor, and place it below the **If** statement but above the **Otherwise** statement.
10. For the **Switch account to** statement, select **account name**. For the value, use a different user account, such as `alice@gmail.com`.
11. From the right-hand panel, drag another **Switch Account** action to the shortcut editor, and place it below the **Otherwise** statement but above the **End if** statement.
12. Edit this **Switch account to** statement to use the original user account value, `alice@example.com`.
13. Test your shortcut by selecting the **Run** icon at the top of the shortcut editor.

You can access and run the shortcut you created in the Shortcuts app **All Shortcuts** folder. You can also add the shortcut to the **Menu Bar** folder, which makes the shortcut appear in the macOS taskbar.

### Connect to your tailnet

This example shows how to create an [iOS shortcut][xt-ios-shortcuts] that automatically connects your device to your tailnet when your devices joins a specific Wi-Fi network. The example uses the [Connect][ar-connect] action.

In this example, the Wi-Fi network name is *PangoLAN*.

1. Launch the **Shortcuts app**, then select **Automation**.
2. Select the **＋**, then select **Create Personal Automation**.
3. From the **Wi-Fi** category, choose the "PangoLAN" network.
4. Select **Next**.
5. Select **Add Action**.
6. From the **Tailscale** app group, select the **Connect** action.
7. Select **Next**.
8. Select **Done**.

[ar-connect]: #connect

[ar-disconnect]: #disconnect

[ar-find-accounts]: #find-accounts

[ar-find-devices]: #find-devices

[ar-get-status]: #get-status

[ar-ping-devices]: #ping-devices

[ar-send-files]: #send-file

[ar-set-tailscale-dns]: #set-tailscale-dns

[ar-stop-using-exit-node]: #stop-using-exit-node

[ar-switch-accounts]: #switch-accounts

[ar-toggle]: #toggle

[ar-use-exit-node]: #use-exit-node

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-fast-user-switching]: /docs/features/client/fast-user-switching

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-taildrop]: /docs/features/taildrop

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ping]: /docs/reference/tailscale-cli#ping

[xt-ios-shortcuts]: https://support.apple.com/guide/shortcuts/welcome/ios

[xt-mac-shortcuts]: https://support.apple.com/guide/shortcuts-mac/welcome/mac
