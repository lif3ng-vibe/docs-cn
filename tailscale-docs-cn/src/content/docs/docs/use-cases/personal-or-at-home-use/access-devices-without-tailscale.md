---
title: "Remotely access devices that can't run Tailscale"
description: "Many home network devices, including IP cameras, smart home hubs, printers, and network switches, can't run Tailscale directly. Subnet routing lets any device with Tailscale installed act as a gateway"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Subnet routers**](/docs/features/subnet-routers) — Use subnet routers to give devices outside your local network access to services within specific subnets. Extend your private network with Tailscale.

Many home network devices, including IP cameras, smart home hubs, printers, and network switches, can't run Tailscale directly. Subnet routing lets any device with Tailscale installed act as a gateway for its local network, giving you remote access to everything on that subnet without installing anything on each individual device.

## Set up a subnet router

A subnet router is any device on your local network that runs Tailscale and advertises the local subnet to your Tailscale network (known as a tailnet). Installing the Tailscale client on the device connects it to your tailnet. Once it's in place, any device in your tailnet can reach every IP address on that subnet. If you don't already have a tailnet, one will be created automatically when you authenticate.

#### Linux

1. Install the Tailscale client:

   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Enable IP forwarding:

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

3. Authenticate and advertise your local subnet. Replace `192.168.1.0/24` with your actual subnet:

   ```bash
   sudo tailscale up --advertise-routes=192.168.1.0/24
   ```

#### Windows

1. [Download and install the Tailscale client][docs-install-windows], then sign in with your identity provider.

2. Open a PowerShell prompt as Administrator and advertise your local subnet. Replace `192.168.1.0/24` with your actual subnet:

   ```powershell
   tailscale up --advertise-routes=192.168.1.0/24
   ```

#### macOS

1. [Download and install the Tailscale client][docs-install-macos], then sign in.

2. Enable IP forwarding:

   ```bash
   sudo sysctl -w net.inet.ip.forwarding=1
   ```

3. Advertise your local subnet. Replace `192.168.1.0/24` with your actual subnet:

   ```bash
   sudo tailscale up --advertise-routes=192.168.1.0/24
   ```

#### Apple TV

1. Install [Tailscale from the App Store][docs-install-appletv] on your Apple TV and sign in.

2. Open the Tailscale app, go to **Settings**, and enable **Subnet router**.

3. Enter your local subnet, for example `192.168.1.0/24`, and save.

## Approve the subnet routes

Advertised routes must be approved in the admin console before other tailnet devices can use them.

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Find the subnet router machine, select the  button, then select **Set up subnet router**.
3. Enable the routes you want to approve and select **Save**.

## Access your devices

The device you're connecting from needs [the Tailscale client installed][docs-install] and signed in to the same tailnet as your subnet router. From there, you can reach any device on the advertised subnet by its local IP address, with no Tailscale installation required on the target device. For example, use `http://192.168.1.50` for a camera or `192.168.1.100` for a printer.

On Linux, run `sudo tailscale up --accept-routes` when connecting. On Windows, macOS, and Apple TV, subnet routes are accepted automatically once approved.

## Further exploration

* Read the [subnet routers][docs-subnet-routers] documentation for the full reference on advertised routes, route approval, and advanced configuration.
* Enable [MagicDNS][docs-magicdns] to use friendly hostnames for tailnet devices. You can also add [DNS records][docs-dns] for specific subnet devices to give them names reachable from your tailnet.
* Use the [tailnet policy file][docs-policy-file] to restrict which tailnet devices can reach the advertised subnet.
* Use an [exit node][docs-exit-node] to route all internet traffic from a device through your home network.
* Try [Taildrop][docs-taildrop] to send files peer-to-peer between any tailnet devices.

[docs-dns]: /docs/features/tailnet-policy-file/extra-dns-records

[docs-exit-node]: /docs/features/exit-nodes

[docs-install]: /docs/install

[docs-install-appletv]: /docs/install/appletv

[docs-install-macos]: /docs/install/mac

[docs-install-windows]: /docs/install/windows

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-taildrop]: /docs/features/taildrop
