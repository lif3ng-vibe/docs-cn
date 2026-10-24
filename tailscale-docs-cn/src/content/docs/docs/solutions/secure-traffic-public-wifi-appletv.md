---
title: "Secure your internet traffic on public Wi-Fi using an Apple TV"
description: "Route Tailscale traffic through your Apple TV for secure, private browsing and access to region-locked content."
---

Last validated Dec 15, 2025

When you connect to public Wi-Fi in places like hotels, airports, or cafés, your internet activity gets exposed to others on the same public network. This exposure can put your privacy at risk when you check email, log in to bank accounts, use cloud services, or engage in any other activity involving your personal information.

By routing your internet traffic through your Apple TV, you protect that activity. Your device creates a secure, encrypted connection to your Apple TV, which then sends your traffic to the internet using your home network. This process keeps your browsing private, even while you use unfamiliar or unsecured networks. We also refer to this type of traffic routing as an [exit node][docs-exit-nodes].

In addition to improving privacy, routing traffic through your Apple TV can help with location-based access. Some websites and streaming platforms only allow connections from your home country or region. By sending traffic through the Apple TV, those services identify it as coming from your home network, which can allow access to region-locked content.

The benefits of routing your Tailscale network (known as a tailnet) traffic using an Apple TV include:

* Use a device you may already own. No need for extra hardware or network configuration.
* Apple TVs are typically always on and connected to your home internet, making them a reliable option for routing traffic when you're away.
* Tailscale is free with the Personal plan that supports up to 6 users, unlimited user devices, and 50 tagged devices.
* The Tailscale app for Apple TV is free and available in the Apple App Store.

## Prerequisites

To follow this guide, you need:

* A device such as a phone or laptop to log in and create the tailnet. Tailscale runs on most operating systems, including Linux, Windows, macOS, iOS, and Android.
* An email account that uses a [single sign-on (SSO) identity provider][docs-sso-providers], such as Apple, Google, or Microsoft.
* An Apple TV HD or Apple TV 4K running tvOS version 17 or later.

## Step 1: Create your tailnet

To create your own tailnet, [download][co-download] and install the client on a device such as a phone or laptop, and log in using your existing identity provider. Choose the **Personal** option and follow the remaining instructions to complete the process. Your personal tailnet is now configured and ready to use.

*（图：Choosing use case for tailnet creation.）*

Now go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, confirming it's connected to your tailnet. The admin console is where you can manage the users, devices, and permissions for your tailnet.

*（图：Choosing use case for tailnet creation.）*

Next you'll configure Tailscale on your Apple TV.

## Step 2: Install and configure Tailscale on your Apple TV to route traffic

To install Tailscale on your Apple TV, open the App Store, search for the Tailscale app, and download it. Once installed, open the app, follow the prompts, and grant any requested permissions.

Launch the app and select **Connect** to add the Apple TV to your tailnet. A QR code will appear on screen. You can scan it with your phone or enter the provided URL into a browser on another device. This step signs you in and authorizes the Apple TV to join your tailnet. To confirm the connection, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and look for the Apple TV in the device list.

Now open the Tailscale app on the Apple TV and go to the **Exit Node** section. Select **Run as Exit Node**. Then, in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, find the Apple TV in the list, select the  button, choose **Set up exit node**, and toggle **Use as exit node** to enable it. Other devices in your tailnet can now route their traffic through your Apple TV.

Devices in a tailnet periodically re-authenticate to stay secure through device key expiry, which requires re-authentication after a set period. For devices that should remain continuously connected, such as servers, Raspberry Pis, media centers, smart home hubs, Docker hosts, and NAS devices, you can disable key expiry to avoid any unnecessary disruptions.

To disable key expiry for a device, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the  icon next to the device, then select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry reduces security and can expose your network if the device or key is compromised. Only do this for trusted devices and revoke the key immediately if the device is lost or replaced. For more information, refer to [Key expiry][docs-key-expiry].

Next you'll configure devices to use the Apple TV to route traffic.

## Step 3: Configure devices to use Apple TV for traffic routing

To configure a device to route its traffic through your Apple TV, open the Tailscale app on a device, go to the **Exit Nodes** section, and select the Apple TV. The instructions for enabling an exit node vary depending on the device's operating system.

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

Now the device's internet traffic will be securely routed through the Apple TV's network connection.

## Conclusion

In this guide, you configured your Apple TV as a secure routing point for your tailnet. This setup gives you an always-available way to protect your network traffic, whether you're on public Wi-Fi, traveling, or working remotely. By sending traffic through your home network, you maintain a trusted connection and can access region-specific content.

## Further exploration

* [Add additional devices][docs-device-add] to your tailnet.
* [Invite other users][docs-invite-any-user] to your tailnet to let them route their device traffic.
* Configure [VPN On Demand][docs-vpn-on-demand] on iOS and macOS devices to automatically enable traffic routing to your Apple TV when you leave your home.
* Configure [shortcuts][docs-shortcuts] on iOS and macOS devices to enable or disable routing through your Apple TV.
* Configure your Apple TV as a [subnet router][docs-appletv-subnet] to let you remotely access home network devices that don't have Tailscale installed, such as printers or smart home devices.
* Refer to [Install Tailscale on an Apple TV][docs-apple-tv] for more information and troubleshooting tips.

[co-download]: https://tailscale.com/download

[docs-apple-tv]: /docs/install/appletv

[docs-appletv-subnet]: /docs/install/appletv#advertise-apple-tv-as-a-subnet-router

[docs-appletv-use-exit-node]: /docs/install/appletv#use-a-device-exit-node

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-shortcuts]: /docs/features/mac-ios-shortcuts#exit-nodes

[docs-sso-providers]: /docs/integrations/identity

[docs-tailscale-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-vpn-on-demand]: /docs/features/client/ios-vpn-on-demand
