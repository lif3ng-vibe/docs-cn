---
title: "Use exit nodes"
description: "[Exit Nodes | Tailscale Explained (video)](https://www.youtube.com/watch?v=Ad7D2pkFNdA)"
---

Last validated Sep 19, 2025

> **Note:**
>
> This topic is a quick guide for configuring exit nodes in a tailnet. For more detailed information, refer to [Exit nodes][docs-exit-nodes].

> **Note:**
>
> The following related video provides additional context and examples.

[Exit Nodes | Tailscale Explained (video)](https://www.youtube.com/watch?v=Ad7D2pkFNdA)

## Advertise a device as an exit node

To use a tailnet device as an exit node, select an OS and complete the steps.

#### Linux

1. [Download and install][docs-install-linux] the Tailscale client.

2. Open a terminal session on the device and enable IP forwarding.

   \[Missing snippet: EnableIPForwarding.mdx]

3. In the terminal session, advertise the device as an exit node.

   ```shell
   sudo tailscale set --advertise-exit-node
   ```

4. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

5. Locate the device in the list. It should display the **Exit Node** badge.

6. Select the  menu, then select **Edit exit node**.

7. Check the **Use as exit node** box, then select **Save**.

#### macOS

1. [Download and install][docs-install-macos] the Tailscale client.
2. Open the Tailscale client installed on the device, select **Exit Node**, then **Run Exit Node**.
3. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the device in the list. It should display the **Exit Node** badge.
4. Select the  menu, then select **Edit exit node**.
5. Check the **Use as exit node** box, then select **Save**.

#### Windows

1. [Download and install][docs-install-windows] the Tailscale client.
2. Open the Tailscale client installed on the device, select **Exit Node**, then **Run as exit node**.
3. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the device in the list. It should display the **Exit Node** badge.
4. Select the  menu, then select **Edit exit node**.
5. Check the **Use as exit node** box, then select **Save**.

#### tvOS

1. [Download and install][docs-install-tvos] the Tailscale client.
2. Open the Tailscale app on your Apple TV, go to the **Exit Node** section, select **None**, then **Run Exit Node**, and confirm the change.
3. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the device in the list. It should display the **Exit Node** badge.
4. Select the  menu, then select **Edit exit node**.
5. Check the **Use as exit node** box, then select **Save**.

#### iOS

1. [Download and install][docs-install-ios] the Tailscale client.
2. Open the Tailscale app on your iPhone, go to the **Exit Node** section, select **Run Exit Node**, and confirm the change.
3. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the device in the list. It should display the **Exit Node** badge.
4. Select the  menu, then select **Edit exit node**.
5. Check the **Use as exit node** box, then select **Save**.

#### Android

1. [Download and install][docs-install-android] the Tailscale client.
2. Open the Tailscale app on the device, tap **Exit Node**, then **Run as exit node**.
3. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the device in the list. It should display the **Exit Node** badge.
4. Select the  menu, then select **Edit exit node**.
5. Check the **Use as exit node** box, then select **Save**.

## Grant access to use an exit node

By default, any user in your tailnet can use a configured exit node. You don't need to add any grants or ACLs.

This changes if you customize your tailnet's [access control policy][docs-acls]. For example, suppose you replace the default policy with one that only lets your developers access a few internal servers:

```json
{
  "grants": [
    {
      "src": ["group:developers"],
      "dst": ["tag:prod"],
      "ip": ["*"]
    }
  ]
}
```

Your developers can still reach the production servers, but they can no longer use an exit node. The policy never grants access to [`autogroup:internet`][docs-grants-allow-exit-nodes], so Tailscale has no permission to route internet traffic through the exit node.

A common point of confusion is to add the exit node device itself as the destination. That only permits connections to the exit node, such as SSH. It does not permit using the device as an internet gateway.

To permit exit node use, add a [grant][docs-grants] or ACL whose `dst` is `autogroup:internet`. This grants permission to route internet traffic through any configured exit node rather than to connect to the exit node device itself.

## Use an exit node

Each device must enable the exit node separately. The instructions for enabling an exit node vary depending on the device's operating system.

#### Android

1. Open the Tailscale app on the Android device and go to the **Exit Node** section.
2. Select the exit node that you want to use. If you want to allow direct access to your local network when routing traffic through an exit node, toggle **Allow LAN access** on.
3. On the app home screen, confirm that the selected device displays in the **Exit Node** section. When an exit node is being used for the device, the section will turn blue.

To stop a device from using an exit node, go to the **Exit Node** section and select **None**.

#### iOS

You can use an exit node from the top of the screen.

Select the exit node that you want to use. To stop using an exit node, disable the one you currently use or select **None** from the **Exit Node** list.

#### Linux

Run `tailscale set` with the `--exit-node=` flag, passing the Tailscale `100.x.y.z` IP address of the exit node.

```shell
sudo tailscale set --exit-node=<exit-node-ip>
```

You can find the IP address for the device from the admin console or by running `tailscale status`.

Alternatively, set `--exit-node-allow-lan-access` to `true` to allow direct access to your local network when routing traffic through an exit node.

```shell
sudo tailscale set --exit-node=<exit-node-ip> --exit-node-allow-lan-access=true
```

To stop using an exit node, run the `--exit-node` flag without passing in an IP address.

```shell
sudo tailscale set --exit-node=
```

#### macOS

You can use an exit node from the menu bar. Open the Tailscale menu and select **Exit Nodes**. (If you are running a Tailscale client version earlier than **v1.60.0**, the menu string to select is **Use exit node**.) Then, select the machine name of the exit node to use.

To allow direct access to your local network when routing traffic through an exit node, select **Allow Local Network Access**.

#### tvOS

To allow your Apple TV to use another device in your tailnet as an exit node, refer to [Install Tailscale on an Apple TV][docs-appletv-use-exit-node].

#### Windows

You can use an exit node from the system tray menu. Select the Tailscale icon, then **Use exit node**. Next, select the machine name of the exit node to use.

If you want to allow direct access to your local network when routing traffic through an exit node, select **Allow local network access**.

You can turn off routing through an exit node by selecting **None** from the **Exit Node** drop-down.

[docs-acls]: /docs/features/access-control/acls

[docs-appletv-use-exit-node]: /docs/install/appletv#use-a-device-exit-node

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-grants-allow-all]: /docs/reference/examples/grants#allow-all

[docs-grants-allow-exit-nodes]: /docs/reference/examples/grants#allow-using-exit-nodes

[docs-install-android]: /docs/install/android

[docs-install-ios]: /docs/install/ios

[docs-install-linux]: /docs/install/linux

[docs-install-macos]: /docs/install/mac

[docs-install-tvos]: /docs/install/appletv#install-tailscale-on-tvos

[docs-install-windows]: /docs/install/windows
