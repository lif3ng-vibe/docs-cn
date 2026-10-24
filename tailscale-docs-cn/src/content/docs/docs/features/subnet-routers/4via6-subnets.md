---
title: "4via6 subnet routers"
description: "Separate virtual private clouds (VPCs) can use identical IPv4 address ranges. If a subnet router in each VPC advertises the same range, Tailscale treats them as [overlapping subnet routers][docs-high-"
---

Last validated Oct 5, 2026

Separate virtual private clouds (VPCs) can use identical IPv4 address ranges. If a subnet router in each VPC advertises the same range, Tailscale treats them as [overlapping subnet routers][docs-high-availability]. Traffic to `10.0.0.5` goes to that address behind whichever subnet router Tailscale selects. The IPv4 address alone does not identify the intended VPC.

The 4via6 ("4 via 6") feature gives each overlapping subnet a unique IPv6 address. Tailscale uses this address to route traffic to the correct device.

> **Note:** This feature is available for [all plans](https://tailscale.com/pricing).

This feature is useful when:

* A network contains subnets with overlapping IP or CIDR ranges
* Cloud resources or SaaS apps are rolled out to a network that contains subnets with overlapping IP or CIDR ranges
* A partner or contractor network contains subnets with IP or CIDR ranges that overlap those of an organization that would like to share access

## How it works

When you use this feature, your subnet router advertises an IPv6 subnet (using a Tailscale-specific address) that maps to the desired IPv4 subnet. Devices connecting to the IPv6 subnet router will have the IPv6 packets rewritten by Tailscale for IPv4, so the IPv4 addresses do not need to be changed.

The Tailscale-specific IPv6 subnet address is of the form:

`fd7a:115c:a1e0:b1a:0:XXXX:YYYY:YYYY`

where:

* `fd7a:115c:a1e0:b1a` is the 64-bit fixed prefix used for Tailscale 4via6-routed packets.
* `0:XXXX` is the 32-bit translator identifier. The site ID is the location that the IPv6 packets should arrive at before being translated to IPv4. Only the lower 16 bits may be used to specify a site ID—allowed values are 0 to 65535 inclusive. You choose which site IDs to assign to your subnet routes. For example, you might want to use `1` for your first subnet route, so the translator identifier would be `0:1`. A site ID of `0` is valid, but note the resulting IPv6 address, while allowed, would have an empty string for the translator identifier: fd7a:115c:a1e0:b1a::YYYY:YYYY.
* `YYYY:YYYY` is the IPv4 address represented as 16 bit hex numbers.

For example, this would be the IPv6 subnet route for a site with ID `7` and IPv4 subnet address range `10.1.1.0/24` (which is represented as `a01:100/120` in 16 bit hex):

*（图：fd7a:115c:a1e0:b1a:7:a01:100/120 where 'fd7a:115c:a1e0:b1a' is the 64-bit fixed prefix used for Tailscale 4via6-routed packets, '7' is the site ID, and 'a01:100/120' is the IPv4 range represented in 16 bit hex）*

Tailscale uses the IPv6 subnet address to route your tailnet traffic to the appropriate IPv4 destination.

The [Tailscale CLI][docs-cli] provides the `tailscale debug via` command to help you create the IPv6 subnet route.

> **Note:**
>
> Tailscale versions before v1.58 can advertise only 4via6 addresses with site IDs from 0 to 255. They can access 4via6 subnets with larger site IDs but cannot advertise them.

## Setting up overlapping subnet routers

To set up a 4via6 subnet router, generate an IPv6 subnet route for each overlapping IPv4 subnet, then advertise that route from the subnet router.

### Step 1: Generate the IPv6 subnet route

Generate the IPv6 subnet route for your IPv4 subnet by running the Tailscale CLI command `tailscale debug via` with arguments for the site ID and IPv4 route. This example generates the IPv6 subnet route for a subnet with site ID `7` and IPv4 route `10.1.1.0/24`.

```shell
tailscale debug via 7 10.1.1.0/24
```

The resulting IPv6 subnet route is:

`fd7a:115c:a1e0:b1a:0:7:a01:100/120`

### Step 2: Advertise the IPv6 subnet route

Follow the steps for [setting up a subnet router][docs-subnets-setup-subnet-router]. However, when you advertise the route, use the IPv6 route that you created in Step 1 above. For example:

```shell
# Update to use the values for your subnet
tailscale set --advertise-routes=fd7a:115c:a1e0:b1a:0:7:a01:100/120
```

Now a device in your tailnet can connect to distinct overlapping subnets with the same IPv4 addresses.

You can advertise both IPv4 and IPv6 subnet routes in the same subnet router.

Note that if you expose the same IPv6 routes (that is, the same IPv4 routes with the same site ID) from multiple subnet routers, you are using [high availability][docs-high-availability].

## MagicDNS name for the IPv4 subnet devices

If you have enabled [MagicDNS][docs-magicdns], you can use an automatically-created MagicDNS name to access devices in the overlapped subnets that you advertised. This name is of the form:

`Q-R-S-T-via-X`

where:

* `Q-R-S-T` is the IPv4 address of the device
* `X` is the site ID of the subnet router used when you created the [Tailscale-specific IPv6 address][ar-4via6-address-format]

For example, if IP address `10.1.1.16` is in the subnet you advertised by using `10.1.1.0/24` with site ID of 7, you can access it from your tailnet with the name `10-1-1-16-via-7`.

## High availability with 4via6 subnet routers

4via6 subnet routers support [high availability][docs-high-availability]. For example, suppose two VPCs use `172.16.0.0/16`. Configure a 4via6 subnet router in each VPC. Use site ID 1 for the first VPC and site ID 2 for the second.

To add failover for the first VPC, configure another 4via6 subnet router attached to that VPC. Use the same site ID 1 and `172.16.0.0/16` route. With the default [active-passive failover][docs-route-selection] option, Tailscale uses one subnet router as the primary and the other as a standby.

For failover in the second VPC, add another 4via6 subnet router there with site ID 2 and the same route.

## Access control rules

When writing [access control][docs-access-control] rules targeting resources behind a 4via6 subnet router, use the IPv6 CIDR or address as the destination, not the IPv4 address.

Use `tailscale debug via` to get the IPv6 CIDR.

## Limitations

* A 4via6 subnet router requires Tailscale v1.24 or later. Other Tailscale clients that use the 4via6 subnet router to reach the remote devices can use older releases.
* For security, upgrade 4via6 subnet routers to Tailscale v1.102.3 or later. Refer to [TS-2026-011][co-security-ts-2026-011] for details.
* Currently, only the IPv6 subnet address is shown in the admin console, not the IPv4 address that it maps to.
* A tailnet can have a maximum of 65,536 site IDs. For each site ID, you can have any number of IPv4 CIDRs mapped.

[ar-4via6-address-format]: #4via6-address-format

[co-security-ts-2026-011]: https://tailscale.com/security-bulletins#ts-2026-011

[docs-access-control]: /docs/features/access-control

[docs-cli]: /docs/reference/tailscale-cli

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-magicdns]: /docs/features/magicdns

[docs-route-selection]: /docs/features/route-selection#active-passive-failover

[docs-subnets-setup-subnet-router]: /docs/features/subnet-routers#set-up-a-subnet-router
