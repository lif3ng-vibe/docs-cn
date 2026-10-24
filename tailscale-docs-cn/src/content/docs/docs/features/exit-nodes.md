---
title: "Exit nodes (route all traffic)"
description: "Route all internet traffic through a specific device on your network."
---

Last validated Dec 15, 2025

> **Note:** Exit nodes are available for [all plans](https://tailscale.com/pricing).

By default, Tailscale acts as an overlay network: it only routes traffic between devices running Tailscale, but doesn't touch your public internet traffic, such as when you visit Google or Twitter. The overlay network configuration is ideal for most people who need secure communication between sensitive devices (such as company servers or home computers), but don't need extra layers of [encryption][docs-encryption] or latency for their public internet connection.

*（图：A diagram showing four devices in a Tailscale overlay network. A laptop is making a direct connection to google.com.）*

However, there might be times when you want Tailscale to route your public internet traffic. For example, you might want to route all your public internet traffic if:

* You're in a coffee shop with untrusted Wi-Fi.
* You're traveling overseas and need access to an online service (such as banking) only available in your home country.

*（图：A diagram showing four devices in a Tailscale overlay network where one is highlighted in blue and designated as an exit node. The laptop makes its connection to google.com through the Desktop device designated as an exit node.）*

You can route all your public internet traffic by setting a device on your network as an exit node, then configuring other devices to send traffic through it. When you route all traffic through an exit node, you're effectively using [default routes][xt-wikipedia-default-route] (`0.0.0.0/0`, `::/0`), similar to how you would if you were using a typical VPN.

> **Note:**
>
> The following related video provides additional context and examples.

[Exit Nodes | Tailscale Explained (video)](https://www.youtube.com/watch?v=Ad7D2pkFNdA)

## Benefits

* **Secure all traffic**: Exit nodes secure all traffic, including traffic to internet sites and applications.
* **Scale globally**: Deploy exit nodes around the globe to meet your scale and geographical needs.
* **Increase visibility**: [Destination logging][ar-destination-logging] provides increased visibility of traffic across the tailnet and forensic analysis during security incidents.

## Use cases

* **Traveling workforce**: Ensure all internet traffic is secured for your traveling workforce regardless of the physical network they're using.
* **Testing from different locations**: Test your applications from different locations by deploying and selecting exit nodes around the globe.
* **Meet compliance needs**: If you have regulatory or compliance needs that require your workforce to use a VPN, exit nodes can help.

## How it works

The exit node feature lets you route all traffic through a specific device on your Tailscale network (known as a tailnet). The device routing your traffic is called an **exit node**. There are many ways to use exit nodes in a tailnet. For example, you can:

* Route all non-Tailscale traffic through an exit node.
* Use [suggested exit nodes][docs-suggested-exit-nodes] to [automatically use the best exit node][docs-auto-exit-nodes] based on client information, such as location and latency.
* [Force devices to use an exit node][docs-mandatory-exit-nodes] based on system policies, which you can deploy using mobile device management (MDM) solutions.

For security purposes, you must opt in to exit node functionality. For example:

* Every device must explicitly opt in to using an exit node.
* A device must advertise itself as an exit node.
* An [Owner, Admin, or Network admin](/docs/reference/user-roles) must allow a device to be an exit node for the tailnet.

> **Tip:**
>
> By default, exit nodes capture all your network traffic that isn't already directed to a subnet router or app connector. You can also route specific network traffic using [subnet routers][docs-subnets] or [app connectors][docs-app-connectors]. On Android devices, you can also use [app-based split tunneling][docs-android-app-split-tunneling].

### Local network access

By default, the device connecting to an exit node won't have access to its local network. If you want to allow the device access to its local network when routing traffic through an exit node, enable exit node local network access.

You can enable the **Allow Local Network Access** setting from the **Exit Nodes** section of your Tailscale client. You can also enable this setting by passing `--exit-node-allow-lan-access` to [`tailscale up`][docs-tailscale-up] or [`tailscale set`][docs-tailscale-set].

## Get started

> **Note:**
>
> Refer to the [Use exit nodes][docs-quick-start-exit-nodes] quickstart guide for basic instructions on how to configure and use exit nodes.

To get started with exit nodes:

1. Understand the [prerequisites][ar-prerequisites].
2. [Configure a device to act as an exit node][ar-configure-exit-node].
3. [Allow the exit node from the admin console][ar-allow-exit-node].
4. [Configure other devices to use the exit node][ar-use-exit-node].

### Prerequisites

Before you can configure an exit node, you must:

* [Set up a Tailscale network (known as a tailnet)][docs-install].
* Ensure both the exit node and devices using the exit node run **Tailscale v1.20 or later**.
* Ensure the exit node is a Linux, macOS, Windows, Android, iOS, or tvOS device.
* Ensure you allow (intended) users to use the exit node.

### Configure an exit node

Use the following steps to configure an exit node:

1. [Install the Tailscale client][ar-install-tailscale].
2. [Advertise the device as an exit node][ar-advertise-exit-node].
3. [Allow the exit node][ar-allow-exit-node].
4. [Grant access to use the exit node][ar-grant-access].
5. [Use the exit node][ar-use-exit-node].

You can also [get a suggested exit node][docs-get-suggested-exit-node].

#### Install the Tailscale client

#### Android

[Download and install Tailscale][co-download-android] onto the Android device you plan to use as an exit node.

#### iOS

[Download and install Tailscale][co-download-ios] onto the iOS device you plan to use as an exit node.

#### Linux

[Download and install Tailscale][co-download-linux] onto the Linux device you plan to use as an exit node.

#### macOS

[Download and install Tailscale][co-download-mac] onto the macOS device you plan to use as an exit node. Each of the [three macOS variants][docs-macos-variants] supports running an exit node.

#### tvOS

[Download and install Tailscale][docs-appletv-install-tailscale-on-tvos] onto the Apple TV you plan to use as an exit node.

#### Windows

[Download and install Tailscale][co-download-windows] onto the Windows device you plan to use as an exit node.

#### Advertise a device as an exit node

#### Android

Open the Tailscale client on the Android device, go to **Exit Node** and select **Run as exit node**.

#### iOS

Open the Tailscale client on the iOS device, go to **Exit Node** and select **Run as Exit Node**.

#### Linux

> **Warning:**
>
> You must enable IP forwarding to advertise a Linux device as an exit node.
>
> \[Missing snippet: EnableIPForwarding.mdx]
>
> If your Linux node uses `firewalld`, you might need to allow masquerading as a workaround due to a [known issue][xt-gh-tailscale-issue-3416]. You can allow masquerading with the following command:
>
> ```shell
> firewall-cmd --permanent --add-masquerade
> ```
>
> Other Linux distributions might require different steps.
>
> When you enable IP forwarding, ensure your firewall denies traffic forwarding by default. Many Linux firewalls (like `ufw` and `firewalld`) use this configuration by default to prevent routing unintended traffic.

From the device you plan to use as an exit node, use the `--advertise-exit-node` flag when you run [`tailscale set`][docs-tailscale-set] or [`tailscale up`][docs-tailscale-up]:

```shell
sudo tailscale set --advertise-exit-node
```

If you pass the `--advertise-exit-node` flag to the `tailscale set` command, you must run `tailscale up` afterward.

```shell
sudo tailscale set --advertise-exit-node
sudo tailscale up
```

#### macOS

> **Note:**
>
> There are [three ways to run Tailscale on macOS][docs-macos-variants]. This document only applies to the macOS App Store and Standalone (GUI) versions. If you use `tailscaled` on macOS, use the Linux instructions.

From the Tailscale client installed on the device you plan to use as an exit node, select **Exit Node** > **Run Exit Node**.

#### tvOS

To use your Apple TV as an exit node, refer to [Install Tailscale on an Apple TV][docs-appletv-advertise-exit-node].

#### Windows

From the Tailscale client installed on the device you plan to use as an exit node, select **Exit node** > **Run exit node**.

### Allow the exit node from the admin console

You must be an [Admin](/docs/reference/user-roles) to allow a device to be an exit node.

> **Note:**
>
> If the device is authenticated by a user who can approve exit nodes in [`autoApprovers`][docs-policy-syntax-autoapprovers], the exit node will automatically be approved.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the exit node.
2. Locate the **Exit Node** badge in the machines list or use the [`property:exit-node`](https://console.tailscale.com/admin/machines?q=property%3Aexit-node) filter to list all devices advertised as exit nodes.

From the  menu of the exit node, select **Edit exit node**, then **Use as exit node**.

### Grant access to use the exit node

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

### Use the exit node

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

Run `tailscale set` with the `--exit-node=` flag, passing the [Tailscale IP address][docs-tailscale-ip-addresses] of the exit node.

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

You can use an exit node from the system tray menu. Select the Tailscale icon and select **Use exit node**. Then, select the machine name of the exit node to use.

If you want to allow direct access to your local network when routing traffic through an exit node, select **Allow local network access**.

> **Note:**
>
> The option to use an exit node only displays if there's an available exit node in your tailnet.

You can verify that your traffic is routed by another device by checking your public IP address [using online tools][xt-whatismyip]. The exit node's public address displays rather than your local device's IP address.

You can turn off routing through an exit node by selecting **None** from the **Exit Node** drop-down.

## Destination logging in network flow logs

> **Note:** Destination logging is available for [the Premium and Enterprise plans](https://tailscale.com/pricing).

> **Note:**
>
> Destination logging requires a sales contract to enable. Contact [Tailscale Sales](https://tailscale.com/contact/sales) for details.

By default, destination logging is disabled for traffic flowing through an exit node across all tailnets, for privacy, abuse, and security purposes. Tailnets on the Enterprise plan can, however, enable destination logging across the tailnet for increased visibility of traffic across the tailnet and forensic analysis during security incidents. Destinations are logged in [Network flow logs][docs-network-flow-logs].

> **Note:**
>
> You must enable [log streaming][docs-log-streaming] before using exit node destination logging.

To enable destination logging for exit nodes:

1. Open the [Logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Network flow logs**.
3. Select the **Logging Actions** menu, then select **Enable exit node destination logging**.

To disable destination logging for exit nodes:

1. Open the [Logs](https://console.tailscale.com/admin/logs) page of the admin console.
2. Select **Network flow logs**.
3. Select the **Logging Actions** menu, then select **Disable exit node destination logging**.

## Caveats

#### Android

Tailscale support for running exit nodes on Android is still undergoing optimization. Make sure you plug the device into a power source if you plan to use it as an exit node for an extended time. Android exit nodes are limited to [userspace routing][docs-kernel-vs-userspace-routers].

> **Note:**
>
> Running an exit node on an Android device is not performant—it may be too slow for most cases.

### Userspace

On Android, the exit node is implemented in userspace, which differs from the default Linux exit node implementation and is not as mature or fully optimized. For details, refer to [Kernel vs. netstack subnet routing and exit nodes][docs-kernel-vs-userspace-routers].

#### Linux

There is a known issue related to using Google Cloud Platform with Linux VM exit nodes. For more information including a workaround, refer to [Google Cloud Platform reference architecture][docs-gcp-reference-architecture].

### Port forwarding

To use a Linux device as an exit node, you must enable port forwarding.

\[Missing snippet: EnableIPForwarding.mdx]

#### macOS

Tailscale support for running exit nodes on macOS is new and still undergoing optimization. macOS exit nodes are limited to userspace routing and require you to prevent your device from sleeping to maintain a connection.

### Userspace

On macOS, the exit node is implemented in userspace, which differs from the default Linux exit node implementation and is not as mature or fully optimized. For details, refer to [Kernel vs. netstack subnet routing & exit nodes][docs-kernel-vs-userspace-routers].

### Sleeping

When running an exit node, you [currently][xt-gh-tailscale-issue-3574] must prevent the computer from going to sleep if you want the exit node to remain available.

In macOS System Preferences, under **Energy Saver**, select **Prevent computer from sleeping automatically when the display is off**.

#### tvOS

### Sleeping

The most common reason your Apple TV cannot be accessed when asleep is that it's not configured as a home hub. Typically, during the initial setup of an Apple TV, it is automatically set as a home hub. However, this feature can become disabled if you move your Apple TV to a different physical location or make significant configuration changes to your network. For more information, refer to [Install Tailscale on an Apple TV][docs-appletv-troubleshooting].

#### Windows

Tailscale support for running exit nodes on Windows is new and still undergoing optimization. Windows exit nodes are limited to userspace routing, require DNS in a system thread, and require you to prevent your device from sleeping to maintain a connection.

### Userspace

On Windows, the exit node is implemented in userspace, which differs from the default Linux exit node implementation. For details, refer to [Kernel vs. netstack subnet routing & exit nodes][docs-kernel-vs-userspace-routers].

### DNS

When Tailscale operates as an exit node, it runs a DNS server for peers behind the exit node to use as their DNS server.

Tailscale's DNS server implementation on Windows [currently][xt-gh-tailscale-issue-3588] occupies a system thread (and thus system memory) for each ongoing DNS query. High numbers of concurrent queries might cause problems for heavily used exit nodes.

### Sleeping

When running an exit node, consider enabling ["Run Unattended"][docs-run-unattended] so Tailscale continues to run even after you log out (or the machine reboots, such as for Windows updates).

You also [currently][xt-gh-tailscale-issue-3574] need to prevent the computer from sleeping if you want the exit node to remain available.

### Expired device keys

\[Missing snippet: expired\_device\_keys\_fail\_close.mdx]

[ar-advertise-exit-node]: #advertise-a-device-as-an-exit-node

[ar-allow-exit-node]: #allow-the-exit-node-from-the-admin-console

[ar-configure-exit-node]: #configure-an-exit-node

[ar-destination-logging]: #destination-logging-in-network-flow-logs

[ar-grant-access]: #grant-access-to-use-the-exit-node

[ar-install-tailscale]: #install-the-tailscale-client

[ar-prerequisites]: #prerequisites

[ar-use-exit-node]: #use-the-exit-node

[co-download-android]: https://tailscale.com/download/android

[co-download-ios]: https://tailscale.com/download/ios

[co-download-linux]: https://tailscale.com/download/linux

[co-download-mac]: https://tailscale.com/download/mac

[co-download-windows]: https://tailscale.com/download/windows

[docs-acls]: /docs/features/access-control/acls

[docs-android-app-split-tunneling]: /docs/features/client/android-app-split-tunneling

[docs-app-connectors]: /docs/features/app-connectors

[docs-appletv-advertise-exit-node]: /docs/install/appletv#advertise-apple-tv-as-an-exit-node

[docs-appletv-install-tailscale-on-tvos]: /docs/install/appletv#install-tailscale-on-tvos

[docs-appletv-troubleshooting]: /docs/install/appletv#troubleshooting

[docs-appletv-use-exit-node]: /docs/install/appletv#use-a-device-exit-node

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-gcp-reference-architecture]: /docs/reference/reference-architectures/gcp#linux-vms-using-exit-nodes

[docs-get-suggested-exit-node]: /docs/features/exit-nodes/auto-exit-nodes#use-a-suggested-exit-node

[docs-grants]: /docs/features/access-control/grants

[docs-grants-allow-all]: /docs/reference/examples/grants#allow-all

[docs-grants-allow-exit-nodes]: /docs/reference/examples/grants#allow-using-exit-nodes

[docs-install]: /docs/how-to/quickstart

[docs-kernel-vs-userspace-routers]: /docs/reference/kernel-vs-userspace-routers

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-mandatory-exit-nodes]: /docs/features/exit-nodes/mandatory-exit-nodes

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-quick-start-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-run-unattended]: /docs/how-to/run-unattended

[docs-subnets]: /docs/features/subnet-routers

[docs-suggested-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-tailscale-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-tailscale-set]: /docs/reference/tailscale-cli#set

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[xt-gh-tailscale-issue-3416]: https://github.com/tailscale/tailscale/issues/3416

[xt-gh-tailscale-issue-3574]: https://github.com/tailscale/tailscale/issues/3574

[xt-gh-tailscale-issue-3588]: https://github.com/tailscale/tailscale/issues/3588

[xt-whatismyip]: https://www.whatismyip.com

[xt-wikipedia-default-route]: https://en.wikipedia.org/wiki/Default_route
