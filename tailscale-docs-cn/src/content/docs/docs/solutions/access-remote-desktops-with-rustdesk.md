---
title: "Access remote desktops using RustDesk"
description: "Set up secure remote desktop access using RustDesk and Tailscale for connecting devices directly over your private tailnet, no servers needed."
---

Last validated Dec 15, 2025

Sometimes you might need to access a computer desktop when you're not able to physically sit in front of it. You might be traveling and need a file on your home desktop, or you might want to help a family member fix their laptop from far away.

[RustDesk][xt-rustdesk] lets you remotely connect to another device's desktop. Typically, RustDesk needs a server in the middle to help devices find each other and pass along the connection. You can use RustDesk's public servers or set up your own at home, but running your own server requires additional setup.

Tailscale removes the need to use a RustDesk server entirely. When you install Tailscale on your devices, they can find and connect to each other directly as if they were on the same home network. This lets you use RustDesk without relying on external servers or managing your own. Your connections stay private and secure, and you have remote access without needing extra infrastructure.

## Prerequisites

To follow this guide, you need:

* A device, such as a phone or laptop, to log in and create the Tailscale network (known as a tailnet), and at least two devices for installing both the Tailscale client and RustDesk. Tailscale runs on most operating systems, including Linux, Windows, macOS, iOS, and Android.
* An email account that uses a [single sign-on (SSO) identity provider][docs-sso-providers], such as Apple, Google, or Microsoft.

## Step 1: Create your tailnet

To create a tailnet, [download][co-download] and install the client on a device such as a phone or laptop, and log in using your existing identity provider. Choose the **Personal** option and follow the remaining instructions to complete the process. Your personal tailnet is now configured and ready to use.

*（图：Select a type of tailnet.）*

Now go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and confirm your device connects to your tailnet. The admin console is where you can manage the users, devices, and permissions for your tailnet.

*（图：Machines page of the admin console.）*

Next, you'll install the Tailscale client on your devices.

## Step 2: Install Tailscale on your devices

To install the Tailscale client, go to the [Downloads][co-download] page, download the client for your OS, and install. For each device you add, you'll need to log in using your existing identity provider from a web browser. When the confirmation screen displays, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, and verify the device connected to your tailnet.

Devices in a tailnet periodically re-authenticate to stay secure through device key expiry, which requires re-authentication after a set period. For devices that should remain continuously connected, such as servers, Raspberry Pis, media centers, smart home hubs, Docker hosts, and NAS devices, you can disable key expiry to avoid any unnecessary disruptions.

To disable key expiry for a device, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the  icon next to the device, then select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry reduces security and can expose your network if the device or key is compromised. Only do this for trusted devices and revoke the key immediately if the device is lost or replaced. For more information, refer to [Key expiry][docs-key-expiry].

Next, you'll install RustDesk on your devices.

## Step 3: Install and configure RustDesk on your devices

To install RustDesk on your devices, go to the [RustDesk][xt-rustdesk] site, then select **Download**. This redirects you to the latest available downloads page. Locate the file for your device, download, and install.

To configure the RustDesk application, open the app, go to the **Security** section and enable **Direct IP access**. At this point, you need to decide whether to rely on the default one-time password or set a permanent password. The one-time password works, but it can be inconvenient for headless or unattended devices, such as machines without a monitor or where no one is at the device to provide it. Setting a permanent password ensures you can connect every time using the same one.

> **Tip:**
>
> The names of settings in the RustDesk client vary across different operating systems. For more information, refer to the official [RustDesk documentation][xt-rustdesk-docs].

Next, you'll use RustDesk to connect to another device's desktop.

## Step 4: Connect to a device using RustDesk over your tailnet

When connecting to a device using RustDesk over your tailnet, you must obtain the tailnet IP address and the RustDesk password for the remote device.

To identify the Tailscale IP address for the remote device, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, locate the device, and copy the `100.x.x.x` address for the device.

Use the following instructions for the operating system you are using to connect to another desktop.

#### macOS

To connect to a remote device, go to the **Control Remote Desktop** box, paste the `100.x.x.x` Tailscale IP address for the device you want to connect to, then select **Connect**. When prompted, enter the password.

If you've previously connected and the password has not changed, you don't need to re-enter the password.

#### Windows

To connect to a remote device, go to the **Control Remote Desktop** box, paste the `100.x.x.x` tailnet address for the device you want to connect to, then select **Connect**. When prompted, enter the password.

If you've previously connected and the password has not changed, you don't need to re-enter the password.

#### Linux

To connect to a remote device, go to the **Control Remote Desktop** box, paste the `100.x.x.x` Tailscale IP address for the device you want to connect to, then select **Connect**. When prompted, enter the password.

If you've previously connected and the password has not changed, you don't need to re-enter the password.

#### iOS

To connect to a remote device, go to the **Remote ID** box, paste the `100.x.x.x` tailnet address for the device you want to connect to, then select the arrow icon. When prompted, enter the password.

If you've previously connected and the password has not changed, you don't need to re-enter the password.

#### Android

To connect to a remote device, go to the **Remote ID** box, paste the `100.x.x.x` tailnet address for the device you want to connect to, then select the arrow icon. When prompted, enter the password.

If you've previously connected and the password has not changed, you don't need to re-enter the password.

Now you can remotely and securely access a desktop over your tailnet, as if you were in physically front of it.

## Conclusion

In this guide, you configured RustDesk with Tailscale, providing a secure and server-free way to reach your devices from anywhere. By setting up a personal tailnet, installing Tailscale on your devices, and enabling RustDesk's direct IP access, you can connect directly using private tailnet addresses without relying on public servers or running your own. This approach not only reduces setup overhead but also ensures your connections stay private, making remote desktop access more reliable and easier to manage.

## Further exploration

* Refer to the [RustDesk documentation][xt-rustdesk-docs] to configure and use the RustDesk client.
* [Invite other users][docs-invite-any-user] to your tailnet.
* Configure ad blocking for your tailnet using [Raspberry Pi][docs-pi-hole], [Control D][docs-control-d], or [NextDNS][docs-nextdns].
* Configure a device in your tailnet to [route your tailnet traffic][docs-exit-nodes] for secure browsing wherever you are.
* Configure a device in your tailnet as a [subnet router][docs-subnets] to remotely access home network devices that don't have Tailscale installed, such as printers or smart home devices.

[co-download]: https://tailscale.com/download

[docs-control-d]: /docs/integrations/control-d

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[xt-rustdesk-docs]: https://rustdesk.com/docs

[xt-rustdesk]: https://rustdesk.com/
