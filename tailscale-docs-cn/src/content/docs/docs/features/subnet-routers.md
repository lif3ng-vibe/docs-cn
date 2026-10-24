---
title: "Subnet routers"
description: "Use subnet routers to give devices outside your local network access to services within specific subnets. Extend your private network with Tailscale."
---

Last validated Sep 29, 2026

> **Note:** Subnet routers are available for [all plans](https://tailscale.com/pricing).

Subnet routers let you extend your Tailscale network (known as a tailnet) to include devices that don't or can't run the Tailscale client. They act as gateways between your tailnet and physical subnets, enabling secure access to legacy devices, entire networks, or services without installing Tailscale everywhere. This capability maintains Tailscale's security model while providing flexibility for complex network environments.

> **Note:**
>
> The following related video provides additional context and examples.

[Subnet Routers | Tailscale Explained (video)](https://www.youtube.com/watch?v=UmVMaymH1-s)

## Why it matters

When designing a secure network, installing the Tailscale client directly on each device provides the best security and performance through end-to-end [encryption][docs-encryption]. However, network administrators frequently encounter situations where direct installation isn't feasible. Devices like printers often lack the capability to run Tailscale, and in large environments such as [AWS VPCs][docs-install-aws] or legacy networks undergoing gradual modernization, installing clients on every endpoint becomes impractical.

Subnet routers bridge this gap by functioning as gateways that relay traffic between your tailnet and conventional subnet-based networks. They maintain Tailscale's security model by respecting [access control policies][docs-access-control] while extending connectivity to non-Tailscale devices. This approach offers a practical balance between security and connectivity requirements.

An important consideration for organizations is that devices behind subnet routers don't count toward your [pricing plan's device limit][co-pricing]. Nevertheless, when possible, installing Tailscale directly on devices remains preferable for optimal performance, security, and configuration simplicity.

## Benefits

The subnet router approach provides several important advantages for network administrators and organizations. Each benefit addresses specific challenges in modern network environments.

* **Connect legacy devices**—include devices that can't run the Tailscale client in your Tailscale network.
* **Integrate entire networks**—connect large networks, such as AWS VPCs, without installing Tailscale on each device.
* **Gradual deployment**—phase in Tailscale adoption by connecting existing network segments through subnet routers.
* **Maintain access control**—subnet routers respect Tailscale's access control policies, maintaining security across your network.

## Use cases

Subnet routers solve practical problems in various network environments by extending Tailscale's secure connectivity model. These use cases represent common deployment scenarios where subnet routers provide substantial value.

* **Managed service access**—securely connect to cloud-managed services like Amazon RDS or Google Cloud SQL without exposing them to the public internet.
* **Cloud network integration**—seamlessly connect cloud VPCs or other cloud network segments to your Tailscale network.
* **Device connectivity**—make devices like printers or cameras accessible to remote Tailscale users without needing to install the Tailscale client.

## How subnet routers work

Subnet routers function as networking bridges that connect separate network environments under a unified access model. They operate at the network layer to facilitate communication between your Tailscale network and traditional subnet-based networks.

A subnet router connects subnets, which are parts of a larger network. In Tailscale, a subnet router is a device in your tailnet that you use as a gateway to advertise routes to other devices. This lets devices connect to your tailnet without installing the Tailscale client.

Any device that uses the subnet router as a gateway is considered *behind* the subnet router. Subnet routers use Source Network Address Translation (SNAT) by default. When SNAT is enabled, traffic from a device behind a subnet router appears to come from the router itself, not the original device. If preserving the original source IP address is important for your use case, you can [disable SNAT][ar-disable-snat] to maintain the original device's IP address in the traffic packets.

> **Note:**
>
> ### Subnet routers and exit nodes
>
> Subnet routers and exit nodes serve different purposes in the Tailscale ecosystem, though they both involve routing traffic. Understanding the distinction helps you deploy the right solution for your networking needs.
>
> Exit nodes route outbound internet traffic from your tailnet devices, effectively functioning as VPN servers. When you connect to an exit node, your internet traffic appears to come from the exit node's location. This is useful for accessing geo-restricted content or improving privacy. In contrast, subnet routers provide access to specific private subnets. They enable tailnet devices to reach non-Tailscale devices within those subnets, but don't affect internet traffic routing. If you need to access private networks like office LANs or cloud VPCs, subnet routers are the appropriate solution.

## Set up a subnet router

Setting up a subnet router involves installing Tailscale on a device that will act as the gateway, configuring it to advertise routes, and ensuring proper access controls. This process requires administrative access to both the subnet router device and your Tailscale network.

You can use almost any device that runs the Tailscale client as a subnet router. To configure a device to run as a subnet router, use the instructions below or refer to the [quickstart guide][docs-quick-start-subnets].

1. [Install the Tailscale client][ar-install-tailscale-client].
2. [Connect to Tailscale as a subnet router][ar-connect].
3. [Enable subnet routes from the admin console][ar-enable-subnet-routes].
4. [Add access rules for advertised subnet routes][ar-add-access-rules].
5. [Verify your connection][ar-verify-connection].
6. [Use your subnet routes from other devices][ar-use-subnet-routes].

### Install the Tailscale client

The first step in creating a subnet router is installing the Tailscale client on the device that will serve as your gateway. Installation procedures vary by platform, but the process is straightforward across supported operating systems.

#### Linux

[Download and install Tailscale][co-download-linux] onto the device you plan to use as a subnet router.

#### macOS

[Download and install Tailscale][co-download-mac] onto the device you plan to use as a subnet router. Each of the [three macOS variants][docs-macos-variants] supports running as a subnet router.

#### tvOS

[Download and install Tailscale][docs-appletv-install-tailscale-on-tvos] onto the Apple TV you plan to use as a subnet router.

#### Windows

[Download and install Tailscale][co-download-mac] onto the device you plan to use as a subnet router.

#### Android

[Download and install Tailscale][co-download-android] onto the device you plan to use as a subnet router.

### Connect to Tailscale as a subnet router

After installing Tailscale, you need to configure the device to function as a subnet router by enabling IP forwarding and advertising the subnet routes you want to make available. These steps transform a standard Tailscale node into a gateway for other networks.

#### Linux

To use a Linux device as a subnet router, you need to complete two essential configurations: enabling IP forwarding and advertising subnet routes. Linux devices make particularly good subnet routers due to their stability and networking capabilities.

1. Enable IP forwarding.
2. Advertise subnet routes.

#### Enable IP forwarding

> **Tip:**
>
> When enabling IP forwarding, ensure your firewall denies traffic forwarding by default. This is the default setting for standard firewalls like `ufw` and `firewalld`. Blocking traffic forwarding by default prevents unintended routing of traffic.

IP forwarding is required to use a Linux device as a subnet router. This kernel setting lets the system forward network packets between interfaces, essentially functioning as a router. The process for enabling IP forwarding varies between Linux distributions. However, the following instructions work in most cases.

If your Linux system has a `/etc/sysctl.d` directory, use:

```shell
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

Otherwise, use:

```shell
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf
```

> **Warning:**
>
> If your Linux node uses `firewalld`, you might need to allow masquerading due to a [known issue][xt-gh-tailscale-issue-3416]. As a workaround, you can allow masquerading with this command:
>
> ```shell
> firewall-cmd --permanent --add-masquerade
> ```

#### Advertise subnet routes

After you enable IP forwarding, run `tailscale set` with the `--advertise-routes` flag. It accepts a comma-separated list of subnet routes.

```shell
sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

Make sure to replace the subnets in the example above with the correct ones for your network. All platforms except Apple TV support both IPv4 and IPv6 subnets. Apple TV only supports IPv4 subnets.

If the device is authenticated by a user who can advertise the specified route in [`autoApprovers`][docs-policy-syntax-autoapprovers], the subnet router's routes will automatically be approved. You can also advertise any subset of the routes allowed by `autoApprovers` in the tailnet policy file. If you'd like to expose default routes (`0.0.0.0/0` and `::/0`), consider using [exit nodes][docs-exit-nodes] instead.

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-exit-nodes]: /docs/features/exit-nodes

#### macOS

When using macOS as a subnet router, the setup process is simplified because IP forwarding is automatically enabled when you advertise routes. Simply configure which subnet routes to advertise, and macOS handles the underlying networking requirements.

> **Note:**
>
> If you are using the Mac App Store variant or Standalone variant, enabling command line interface (CLI) integration is a prerequisite for this section. Refer to the [CLI topic][docs-cli-macos] for instructions on installing the `tailscale` command in your `$PATH` environment variable.
>
> If you don't want to install the command, you can always execute commands (like `up` and `status`) by appending them to your Tailscale app location, like so:
>
> ```shell
> /Applications/Tailscale.app/Contents/MacOS/Tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
> ```

After you enable IP forwarding, run `tailscale set` with the `--advertise-routes` flag. It accepts a comma-separated list of subnet routes.

```shell
sudo tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

Make sure to replace the subnets in the example above with the correct ones for your network. All platforms except Apple TV support both IPv4 and IPv6 subnets. Apple TV only supports IPv4 subnets.

If the device is authenticated by a user who can advertise the specified route in [`autoApprovers`][docs-policy-syntax-autoapprovers], the subnet router's routes will automatically be approved. You can also advertise any subset of the routes allowed by `autoApprovers` in the tailnet policy file. If you'd like to expose default routes (`0.0.0.0/0` and `::/0`), consider using [exit nodes][docs-exit-nodes] instead.

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-exit-nodes]: /docs/features/exit-nodes

#### tvOS

Apple TV devices can function as subnet routers, bringing Tailscale connectivity to networks where traditional computers might not be appropriate. The setup process is tailored to the tvOS environment and interface.

To use your Apple TV as a subnet router in your tailnet, refer to [Install Tailscale on an Apple TV][docs-appletv-advertise-subnet-router].

#### Windows

Windows systems can function effectively as subnet routers with proper configuration. Before advertising routes, you must enable IP forwarding to allow Windows to route packets between networks.

After you enable IP forwarding, run `tailscale set` with the `--advertise-routes` flag. It accepts a comma-separated list of subnet routes.

```powershell
tailscale set --advertise-routes=192.0.2.0/24,198.51.100.0/24
```

Make sure to replace the subnets in the example above with the correct ones for your network. All platforms except Apple TV support both IPv4 and IPv6 subnets. Apple TV only supports IPv4 subnets.

If the device is authenticated by a user who can advertise the specified route in [`autoApprovers`][docs-policy-syntax-autoapprovers], the subnet router's routes will automatically be approved. You can also advertise any subset of the routes allowed by `autoApprovers` in the tailnet policy file. If you'd like to expose default routes (`0.0.0.0/0` and `::/0`), consider using [exit nodes][docs-exit-nodes] instead.

#### Android

> **Warning:**
>
> Running a subnet router on a mobile phone significantly impacts battery life. This feature is primarily intended for Android TV devices or any Android device that is expected to remain connected to power.

1. Open the Tailscale app and select the avatar menu.
2. In **Settings**, select **Subnet routing**, then **Add route**.
3. Enter the combined IP address and subnet mask (CIDR) for your network. For example `192.168.1.0/24`.
4. Select **OK**.
5. In the **Exit Node** section of the app, set the **Allow LAN access** toggle according to your preference.

   * Android as a subnet router but not an exit node, set the toggle to off.
   * Android as a subnet router and an exit node, set the toggle to on.

### Enable subnet routes from the admin console

The admin console provides a centralized interface for approving and managing subnet routes advertised by your devices. This step ensures that the routes you've configured on your subnet router become active in your tailnet.

> **Tip:**
>
> You can skip this step if you use [`autoApprovers`][docs-policy-syntax-autoapprovers].

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Locate the **Subnets** badge in the devices list or use the  [`property:subnet`](https://console.tailscale.com/admin/machines?q=property%3Asubnet) filter to list all devices advertising subnet routes.
3. Select a device with the `subnet` property, then go to the **Subnets** section.
4. Select **Edit**. This opens the **Edit subnet routes**.
5. Select the routes to approve, then select **Save**.

You can disable [key expiry][docs-key-expiry] on your server to avoid having to periodically reauthenticate. If you use [tags][docs-tags], [key expiry is disabled by default][docs-tags-key-expiry].

### Add access rules for the advertised subnet routes

Access controls determine which devices and users can access resources through your subnet router. Properly configured access rules are essential for maintaining security while enabling the connectivity you need.

> **Note:**
>
> Access rules control which traffic is permitted, while route approval controls which routes are injected into client routing tables. These are separate mechanisms. For a complete explanation, refer to the [route injection reference][docs-route-injection].

> **Tip:**
>
> You can skip this step if you already have rules that allow access to your advertised subnet routes.

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console to update your [tailnet policy file][docs-acls].
2. Create an [access rule][docs-policy-syntax-acls] that lets access to the advertised subnet.

The following example tailnet policy configuration ensures members of `group:dev` can access devices in the subnets `192.0.2.0/24`, `198.51.100.0/24` and `2001:db8::/32`, and ensures the subnet `192.0.2.0/24` can access the subnet `198.51.100.0/24` and vice versa, *if [subnet route masquerading][docs-troubleshooting-disable-route-masquerading] is disabled*.

```json
{
  "groups": {
    "group:dev": ["alice@example.com", "bob@example.com"]
  },
  "grants": [
    {
      "src": ["group:dev","192.0.2.0/24", "198.51.100.0/24"],
      "dst": ["192.0.2.0/24", "198.51.100.0/24", "2001:db8::/32"],
      "ip": ["*:*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Verify your connection

Verification ensures that your subnet router is properly configured and functioning as expected. This step confirms that your tailnet devices can communicate with the subnet router before attempting to access resources behind it.

Check that you can ping the Tailscale IP address of your new subnet routers from a tailnet device (such as a Linux, macOS, or Windows device). You can find the Tailscale IP in the [admin console](https://console.tailscale.com/admin) or by running the following command on the subnet router.

```shell
tailscale ip -4
```

### Use your subnet routes from other devices

Once your subnet router is configured and verified, you need to ensure that other devices in your tailnet can discover and use the new routes. This process varies slightly by operating system.

Android, iOS, macOS, tvOS, and Windows automatically pick up your new subnet routes.

By default, Linux devices only discover [Tailscale IP addresses][docs-100.x-addresses]. To enable automatic discovery of new subnet routes on Linux devices, use the `--accept-routes` flag:

```shell
sudo tailscale set --accept-routes
```

## Update subnet routes

Network requirements evolve over time, and you may need to modify the subnet routes advertised by your subnet router. This process involves updating the route advertisements and ensuring that the changes are properly approved and accessible.

To update subnet routes:

1. [Connect to Tailscale as a subnet router][ar-connect].
2. [Enable subnet routes from the admin console][ar-enable-subnet-routes].
3. [Add access rules for advertised subnet routes][ar-add-access-rules].
4. [Verify your connection][ar-verify-connection].
5. [Use your subnet routes from other devices][ar-use-subnet-routes].

You can exclude any routes to prevent the subnet router from advertising them.

## Use advanced subnet routing

After you set up a subnet router, you might consider:

* [Route DNS lookups to an internal DNS server][ar-route-dns-lookups-to-an-internal-dns-server].
* [Set up high availability for subnet routers][ar-set-up-high-availability].
* [Use overlapping routes with different prefix lengths][ar-use-overlapping-routes] for granular routing control.
* Connect two or more subnets using [site-to-site][docs-site-to-site] networking.
* [Disable source NAT (SNAT)][ar-disable-snat].

### Route DNS lookups to an internal DNS server

DNS configuration lets your tailnet resolve names both for Tailscale devices and for resources on the advertised subnets. This capability enables seamless name resolution across your hybrid network environment.

You can add [Tailscale IP addresses to public DNS records][docs-dns] because Tailscale IP addresses are only accessible to authenticated users of your network. You can use an internal DNS server on your subnet by configuring split DNS in the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

### Set up high availability

For critical environments, redundant subnet routers provide reliability by ensuring continued connectivity even if individual subnet router devices fail. This approach is essential for production networks where continuous availability is required.

You can set up high availability to ensure your network is connectable even if one subnet router goes offline. For more information, refer to our topic on [high availability failover][docs-high-availability].

> **Warning:**
>
> When setting up subnet routers for high availability (HA), be careful with the `--accept-routes` flag. This applies to active-passive failover when routers advertise the same routes, and to regional routing with in-region failover when they do so in the same region. If you enable `--accept-routes` on those routers, a standby router can accept its own advertised routes from the primary router.
>
> This leads to an inefficient routing path. If both subnet routers advertise and accept `192.168.1.0/24`, the standby router will send all `192.168.1.0/24` traffic through the primary router, even though it is directly connected to that network.
>
> For most HA subnet router setups, use the `--advertise-routes` flag alone. Avoid using `--accept-routes` unless you specifically need that routing behavior.

### Use overlapping routes with different prefix lengths

Tailscale supports advertising overlapping subnet routes with different prefix lengths from multiple subnet routers. When traffic is sent to a destination IP address, Tailscale uses longest prefix matching (LPM) to select the most specific route available.

For example, if you configure:

* Subnet router A advertising `10.0.0.0/16`
* Subnet router B advertising `10.0.0.0/24`

Traffic is routed based on the most specific match:

* `10.0.0.1` routes through subnet router B (matched by the more specific `/24` route)
* `10.0.1.1` routes through subnet router A (only matched by the `/16` route)

This capability is useful for scenarios where you need granular control over routing within a larger address space, such as:

* Directing specific subnets through dedicated routers for performance
* Applying different security policies to specific subnets
* Gradually migrating subnets to new infrastructure

> **Warning:**
>
> Tailscale does not fall back to a less-specific route when the subnet router for a more-specific route goes offline. In the example above, if subnet router B (advertising `10.0.0.0/24`) becomes unavailable, Tailscale drops traffic to `10.0.0.1` rather than falling back to subnet router A's `10.0.0.0/16` route.
>
> Tailscale treats each advertised prefix independently using static route selection, not dynamic routing. An offline router cannot withdraw its route advertisement, so clients continue to prefer the more-specific prefix even when no healthy router serves it.
>
> To avoid this, configure all subnet routers that advertise a broader prefix to also advertise the more-specific prefix. For example, have subnet router A advertise both `10.0.0.0/16` and `10.0.0.0/24`. This ensures the more-specific prefix has multiple candidate routers and can fail over if one goes offline.
>
> For more information about this behavior and additional workarounds, refer to [overlapping subnet route failover][docs-troubleshooting-overlapping-route-failover].

### Disable SNAT

Source Network Address Translation (SNAT) affects how source IP addresses appear to devices in different parts of your network. By default, Tailscale performs SNAT on traffic passing through subnet routers, but this behavior can be modified when necessary.

By default, when you advertise subnet routes, Tailscale uses source network address translation (SNAT) (also called masquerading). You can disable SNAT by using the `--snat-subnet-routes=false` flag (Linux only) with the [`tailscale up`][docs-tailscale-up] command. Disabling SNAT preserves the source IP addresses of the hosts behind the subnet router.

```shell
tailscale up --snat-subnet-routes=false
```

> **Warning:**
>
> The `--snat-subnet-routes` flag only works with Linux subnet routers.

When you disable source NAT on a subnet router, devices behind it can access the Tailscale IP addresses of devices they connect to but don't automatically know how to route traffic back to those Tailscale IP addresses. To fix this, you must add a return route that tells the devices to send all Tailscale traffic through your subnet router. You can configure this route in one of three places:

* On the device's operating system
* In your VPC settings
* Through your DHCP server

The route should include:

* Network: `100.64.0.0/10` (the Tailscale IP address range, which includes [reserved IP addresses][docs-reserved-ip-addresses])
* Next hop or gateway: The LAN IP address of your subnet router

> **Warning:**
>
> [Currently][xt-gh-tailscale-issue-18725] setting `--snat-subnet-routes=false` on a node that's acting as both a subnet router and exit node can result in upstream drops. The recommended workaround for this is to separate the role of the subnet router and the exit node between two nodes if the subnet router must have SNAT disabled.

## Caveats

### Expired device keys

\[Missing snippet: expired\_device\_keys\_fail\_close.mdx]

[ar-add-access-rules]: #add-access-rules-for-the-advertised-subnet-routes

[ar-connect]: #connect-to-tailscale-as-a-subnet-router

[ar-disable-snat]: #disable-snat

[ar-enable-subnet-routes]: #enable-subnet-routes-from-the-admin-console

[ar-install-tailscale-client]: #install-the-tailscale-client

[ar-route-dns-lookups-to-an-internal-dns-server]: #route-dns-lookups-to-an-internal-dns-server

[ar-set-up-high-availability]: #set-up-high-availability

[ar-use-overlapping-routes]: #use-overlapping-routes-with-different-prefix-lengths

[ar-use-subnet-routes]: #use-your-subnet-routes-from-other-devices

[ar-verify-connection]: #verify-your-connection

[co-download-android]: https://tailscale.com/download/android

[co-download-linux]: https://tailscale.com/download/linux

[co-download-mac]: https://tailscale.com/download/mac

[co-pricing]: https://tailscale.com/pricing

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-acls]: /docs/features/access-control/acls

[docs-appletv-advertise-subnet-router]: /docs/install/appletv#advertise-apple-tv-as-a-subnet-router

[docs-appletv-install-tailscale-on-tvos]: /docs/install/appletv#install-tailscale-on-tvos

[docs-cli-macos]: /docs/reference/tailscale-cli?tab=macos

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-install-aws]: /docs/install/cloud/aws

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-quick-start-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-site-to-site]: /docs/features/site-to-site

[docs-tags-key-expiry]: /docs/features/tags#key-expiry

[docs-tags]: /docs/features/tags

[docs-tailscale-up]: /docs/reference/tailscale-cli/up

[docs-troubleshooting-disable-route-masquerading]: /docs/reference/troubleshooting/network-configuration/disable-subnet-route-masquerading

[docs-troubleshooting-overlapping-route-failover]: /docs/reference/troubleshooting/network-configuration/overlapping-subnet-route-failover

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[docs-route-injection]: /docs/reference/route-injection

[xt-gh-tailscale-issue-3416]: https://github.com/tailscale/tailscale/issues/3416

[xt-gh-tailscale-issue-18725]: https://github.com/tailscale/tailscale/issues/18725
