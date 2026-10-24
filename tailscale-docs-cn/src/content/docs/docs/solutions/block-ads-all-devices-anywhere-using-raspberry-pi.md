---
title: "Block ads on all your devices from anywhere using a Raspberry Pi"
description: "Increase privacy, security, and browsing performance in a cost-effective way by using a Raspberry Pi with Pi-hole to block ads."
---

Last validated Dec 15, 2025

Online ads slow down browsing, reduce privacy, and create security risks. They can track activity without consent, carry malicious code, and many consume extra data and battery life with large images, animations, and videos. Ads can also interrupt the experience with pop-ups and auto-playing content. Blocking ads can help stop trackers, speed up browsing, save data, and make websites cleaner and easier to use.

One method to block ads on devices in a network is to install [Pi-hole][xt-pi-hole] software on a Raspberry Pi device. Pi-hole acts as your network's DNS server and filters requests to ad and tracking servers before they reach devices, providing protection across the network without requiring additional software on the devices themselves.

Combining Pi-hole with Tailscale provides the same protection beyond a home network. Tailscale creates a secure, private network that lets users remotely use the Pi-hole DNS server anywhere, enabling consistent ad blocking and privacy benefits at home, on public Wi-Fi, or while traveling.

The benefits of blocking ads using a Raspberry Pi and Pi-hole with a Tailscale network (known as a tailnet) include:

* Ad blocking on your devices, whether you're at home or away.
* A Raspberry Pi is a cost-effective hardware solution.
* A Raspberry Pi consumes very little power, so you can always leave it on and connected.
* Pi-hole is a free and open source software.
* Tailscale is free with the Personal plan that supports up to 6 users, unlimited user devices, and 50 tagged devices.

> **Tip:**
>
> While the instructions in this topic describe how to configure Pi-hole as the DNS server for blocking ads in your tailnet, you can also configure your router's DNS settings to point to the Raspberry Pi to use Pi-hole ad blocking across your entire network.

## Prerequisites

To follow this guide, you need:

* A device, such as a phone or laptop, to log in and create the tailnet. Tailscale runs on most operating systems, including Linux, Windows, macOS, iOS, and Android.
* An email account that uses a [single sign-on (SSO) identity provider][docs-sso-providers], such as Apple, Google, or Microsoft.
* A Raspberry Pi Model B or later, with a minimum of 2 GB of free space and 512 MB of RAM.
* Raspberry Pi OS (latest version) installed on your Raspberry Pi.
* Access to the Raspberry Pi OS command line interface (CLI). If you want to use the Raspberry Pi OS desktop, you can use the Terminal application. If you want to access the Raspberry Pi from another computer in your network, you'll need access to the CLI using a terminal client or command prompt on your computer.

## Step 1: Install and configure Pi-hole

To install Pi-hole directly from the Raspberry Pi OS desktop, open the Terminal application. If you want to access the Raspberry Pi from another computer in your network, you can access the CLI from a terminal client or command prompt using the command `ssh <username>@<ip-address>`, where `<username>` is the user name and `<ip-address>` is the local IP address for the Raspberry Pi.

Make sure your Raspberry Pi software packages are up to date:

```shell
sudo apt update
sudo apt upgrade -y
```

Now download and install Pi-hole:

```shell
curl -sSL https://install.pi-hole.net | bash
```

> **Warning:**
>
> Attackers can exploit `curl` with `| bash`. Review the code contained in this script before installing. You can do so by visiting the `https://install.pi-hole.net` URL from a web browser. Alternatively, you can install Pi-hole using [another method][xt-pi-hole-install].

An installer displays in the terminal session, where you can configure the basic Pi-hole settings. Configure the initial setup for Pi-hole and access the Pi-hole web admin interface.

* Select **OK** to proceed.
* In the **Static IP Address** section, select **Yes** to use the current IP address for the Raspberry Pi, and select **Continue**. This ensures the Raspberry Pi always has the same address and devices can reach the Pi-hole DNS server consistently and reliably. Alternatively, you can select **Skip** and configure a static IP address for the Raspberry Pi in your router's DHCP settings.
* In the **Select Upstream DNS Provider** section, select a common DNS provider, then select **OK**. Pi-hole only blocks ads for the lists of sites that are configured in its settings. If Pi-hole does not recognize the site, it passes the request to the DNS server that you specify here.
* In the **Blocklists** section, select **Yes** to use the [Steven Black unified host list][xt-github-stevenblack]. This is a reliable and community-maintained block list that combines many ad, tracker, and malware lists into one single list for broad protection.
* In the **Web Admin Interface** section, select **Yes** to install the GUI interface that lets you manage all the Pi-hole settings.
* In the **Web Server** section, select **Yes**, as this is necessary to use the web admin interface.
* In the **Enable Query Logging** section, select whether you want Pi-hole to record every DNS request your devices make. You can use this information to modify the settings in Pi-hole to suit your needs.
* In the **Select a privacy mode for FTL**, select the level of detail that Pi-hole logs collect, then select **Continue**. The installer returns you to the command line.

Before you access the Pi-hole web admin interface, change your Pi-hole password from the default, which is blank.

If you are using Pi-hole v6, use the following command, then enter and re-enter your new password:

```shell
pihole setpassword
```

> **Note:**
>
> If you are using Pi-hole v5, use the following command. then enter and re-enter your new password:
>
> ```shell
> pihole -a -p
> ```

After the initial setup is complete, go to `http://<raspberry-pi>/admin`, where `<raspberry-pi>` is the IP address for the Raspberry Pi and enter the new password.

When a device connects to a tailnet, it's assigned a `100.x.x.x` IP address on the `tailscale0` interface, in addition to the existing local IP address, such as `192.168.x.x` on interface `eth0`. So you need to configure Pi-hole to listen on the Tailscale interface.

In the Pi-hole web admin interface, go to **Settings**, then **DNS**, and in the upper right-hand corner, toggle the **Basic** button to **Expert** to display advanced settings. Within the **Interface settings** section, check the **Permit all origins** box.

> **Warning:**
>
> If you enable **Permit all origins**, ensure:
>
> * Your Raspberry Pi is behind a firewall.
> * You secure the Pi-hole web admin interface with a strong password to reduce security risks.

Next, you'll create your personal tailnet.

## Step 2: Create your tailnet

To create a tailnet, [download][co-download] and install the client on a device such as a phone or laptop, and log in using your existing identity provider. Choose the **Personal** option and follow the remaining instructions to complete the process. Your personal tailnet is now configured and ready to use.

*（图：Select a type of tailnet.）*

Now go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console to confirming it's connected to your tailnet. The admin console is where you can manage the users, devices, and permissions for your tailnet.

*（图：Machines page of the admin console.）*

Next, you'll install and configure Tailscale on your Raspberry Pi.

## Step 3: Install Tailscale on your Raspberry Pi

To install the Tailscale client, open a terminal session or use the same one from the previous section if it's still open. Then use the following command to download and install the Tailscale package:

```shell
curl -fsSL https://tailscale.com/install.sh | sh
```

Now enable the Tailscale client and instruct the Raspberry Pi not to automatically use the DNS settings for your tailnet, since the Raspberry Pi is the DNS server.

```shell
sudo tailscale up --accept-dns=false
```

When you run the [`tailscale up`][docs-cli-up] command for the first time, a URL displays in the terminal. Paste the URL into a web browser and log in with the same email address you used to set up your tailnet. You can do this from any device you want, such as a phone or a laptop. Once logged in, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and locate the Raspberry Pi in the list to confirm that it's added to your tailnet.

Devices in a tailnet periodically re-authenticate to stay secure through device key expiry, which requires re-authentication after a set period. For devices that should remain continuously connected, such as servers, Raspberry Pis, media centers, smart home hubs, Docker hosts, and NAS devices, you can disable key expiry to avoid any unnecessary disruptions.

To disable key expiry for a device, go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select the  icon next to the device, then select **Disable key expiry**.

> **Warning:**
>
> Disabling key expiry reduces security and can expose your network if the device or key is compromised. Only do this for trusted devices and revoke the key immediately if the device is lost or replaced. For more information, refer to [Key expiry][docs-key-expiry].

Next, you'll configure your tailnet DNS settings to point to the Raspberry Pi.

## Step 4: Set Raspberry Pi as the DNS server for your tailnet

To configure the Raspberry Pi as the DNS server for your tailnet, go to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console, and in the **Nameservers** section, select **Add nameserver**, then **Custom**. Then enter the IP address for the Raspberry Pi, select **Save**, and enable the **Override DNS servers** toggle.

*（图：Configure a custom DNS server in the admin console.）*

When your devices connect to the tailnet, they use the Raspberry Pi as the DNS server to block most ads. When they're not connected to the tailnet, they use the DNS server set up on the local network, such as your home router.

To verify that your device is using Pi-hole for ad blocking, visit a website that you know contains ads, and they will not display for most sites. You can also try turning the Tailscale client off to make the ads re-appear, then re-enable the Tailscale client.

You can also configure your router's DNS settings to point to the Raspberry Pi to use Pi-hole ad blocking across your entire network.

## Conclusion

In this guide, you set up a Raspberry Pi with Pi-hole and connected it to your tailnet using Tailscale. This configuration gives you an always-on way to block ads and stop trackers, whether you're at home, on public Wi-Fi, or traveling. By routing DNS requests through your Pi-hole, you maintain a cleaner, faster, and more private browsing experience across all your devices, wherever you are.

The Pi-hole application is highly configurable, so be sure to browse the settings and choose what's best suited for your needs. For information, refer to the official [Pi-hole documentation][xt-pi-hole-docs].

## Further exploration

* [Add additional devices][docs-device-add] to your tailnet.
* [Invite other users][docs-invite-any-user] to your tailnet to let them route their device traffic.
* Configure your Raspberry Pi to [route your tailnet traffic][docs-exit-nodes] for secure browsing wherever you are.
* Configure your Raspberry Pi as a [subnet router][docs-subnets] to let you remotely access home network devices that don't have Tailscale installed, such as printers or smart home devices.
* Use [Control D][docs-control-d] or [NextDNS][docs-nextdns] as an alternative for ad blocking in your tailnet.

[co-download]: https://tailscale.com/download

[docs-cli-up]: /docs/reference/tailscale-cli/up

[docs-control-d]: /docs/integrations/control-d

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-nextdns]: /docs/integrations/nextdns

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers/how-to/setup

[xt-github-stevenblack]: https://github.com/StevenBlack/hosts

[xt-pi-hole-docs]: https://docs.pi-hole.net/main/

[xt-pi-hole-install]: https://docs.pi-hole.net/main/basic-install/

[xt-pi-hole]: https://pi-hole.net
