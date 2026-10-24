---
title: "How Tailscale assigns IP addresses"
description: "Understand how Tailscale assigns stable IP addresses based on the device and authorization credentials."
---

Last validated Jan 12, 2026

Tailscale makes it easy to connect to your Tailscale network (known as a tailnet) by providing you with a **stable IP address** for each node such as a device or a server. These addresses stay the same, no matter where nodes move to in the physical world, which means you can share them without worrying about them changing.

By default, every device receives an IP address in the [`100.x.y.z` range][docs-100.x-addresses]. This IP address is auto-assigned based on the device and authorization credentials. [Admins](/docs/reference/user-roles) can change the [IP address][docs-ip-pool] later.

## Finding your Tailscale IP address

#### Tailscale admin console

View the IP address for a device with the Tailscale admin console.

You must be an [Owner, Admin, Network admin, IT admin, Billing admin, or Auditor](/docs/reference/user-roles) of a tailnet to access the admin console.

1. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Find the row corresponding to the device you are interested in. You can use the [search bar][docs-filter-devices-search-bar] or [filters][docs-filter-devices] to find a device.
3. Under the **Addresses** column, select the dropdown icon and then select either the device's IPv6 address or IPv4 address to copy it to your clipboard.

#### Linux

On Tailscale v1.8 or later you can use the [`tailscale ip`][docs-cli] command. Use the `--4` flag to only return an IPv4 address.

```shell
tailscale ip --4
```

On any version of Tailscale, you can also find the IP address by using the system `ip` utility:

```shell
ip addr show tailscale0
```

#### Windows

Open the app menu from the system task bar and look for the IP address listed in the dropdown.

*（图：The Tailscale application menu opened from the Windows system tray with 'My address' and an IP address indicated with a red outline.）*

#### macOS

Select the Tailscale icon in the menu bar to view the IP address. You can also locate your IP address by running `ifconfig` and searching for a `utun` address with a listed `100.x.y.z` IP address.

*（图：The Tailscale application menu opened from the macOS menu bar with 'This Device' and an IP address indicated with a red outline.）*

#### iOS

Log in to your network and look at the IP address for the first device in the list. Your iOS device will always display at the top.

*（图：The device list with the current iOS device's IP address indicated with a red outline.）*

#### Android

Log in to your network and look for the IP address listed at the top of the app.

*（图：The device list with the current Android device's IP address indicated with a red outline.）*

## Mapping machine names to IP addresses using DNS

For information on this topic, refer to [How DNS works in Tailscale][docs-dns].

## Forcing an IP address to change

A node's IP address will not change for as long as the node remains registered unless an [Admin](/docs/reference/user-roles) changes it.

A node gets a new IP address when it rejoins a tailnet if:

* It is removed from the tailnet, by selecting **Remove** in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console
* The IP range is specified, or an individual IP address is manually changed using [IP pool][docs-ip-pool]
* Tailscale is [reset and reinstalled][docs-uninstall] on the node
* The disk is wiped, and the node key is lost

## Tailscale IPv6 local address prefix

Tailscale IPv6 addresses are assigned from the [unique local address][xt-wikipedia-unique-local-address] prefix of `fd7a:115c:a1e0::/48`. For a complete list of IPv4 and IPv6 addresses that Tailscale reserves, refer to [reserved IP addresses][docs-reserved-ip-addresses].

Previously IPv6 addresses were assigned from `fd7a:115c:a1e0:ab12::/64`.

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-cli]: /docs/reference/tailscale-cli

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter

[docs-ip-pool]: /docs/reference/ip-pool

[docs-uninstall]: /docs/features/client/uninstall

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses

[xt-wikipedia-unique-local-address]: https://en.wikipedia.org/wiki/Unique_local_address
