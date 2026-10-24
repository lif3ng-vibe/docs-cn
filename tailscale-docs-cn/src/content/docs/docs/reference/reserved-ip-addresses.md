---
title: "Reserved IP addresses"
description: "Review the reserved IP addresses and ranges that Tailscale uses for device addressing and internal services."
---

Last validated Jan 12, 2026

Tailscale assigns each device in your [tailnet][docs-tailnet] a unique [Tailscale IP address][docs-100.x-addresses] from the Carrier-Grade NAT (CGNAT) range defined in [RFC 6598][xt-rfc-6598-cgnat]. This range doesn't conflict with common private network ranges like `10.0.0.0/8` or `192.168.0.0/16`.

Tailscale reserves specific addresses within this range for internal services and device management. This topic helps you understand these reservations when configuring [IP pools][docs-ip-pool], writing [access control policies][docs-policy-syntax], or troubleshooting connectivity.

The following table lists the reserved IP addresses and ranges used by Tailscale:

| Address or range      | Purpose                                                                                                                                                                                             |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `100.64.0.0/10`       | The [CGNAT range][xt-rfc-6598-cgnat] Tailscale uses for [device IP addresses][docs-100.x-addresses] (`100.64.0.0` through `100.127.255.255`).                                                       |
| `100.100.0.0/24`      | Tailscale internal use. Unavailable for [IP pools][docs-ip-pool].                                                                                                                                   |
| `100.100.100.0/24`    | Tailscale internal use. Unavailable for [IP pools][docs-ip-pool].                                                                                                                                   |
| `100.100.100.100`     | [Quad100][docs-what-is-quad100], a device-local service address. Provides a [DNS resolver][docs-magicdns] on port `53` and a [device management interface][docs-device-web-interface] on port `80`. |
| `100.115.92.0/23`     | Tailscale internal use. Unavailable for [IP pools][docs-ip-pool].                                                                                                                                   |
| `fd7a:115c:a1e0::/48` | The [IPv6 unique local address][xt-wiki-unique-local-address] prefix Tailscale uses for [device IPv6 addresses][docs-ipv6].                                                                         |
| `fd7a:115c:a1e0::53`  | IPv6 equivalent of [Quad100][docs-what-is-quad100]. Provides the same DNS resolver and device management services.                                                                                  |
| `100.101.102.103`     | Reserved for the [`tshello`][docs-hello-tsnet] example service.                                                                                                                                     |

## What this means for you

You can use Tailscale IP addresses directly in access control list (ACL) rules and grants. For example, specify a device by its `100.x.y.z` address in the `src` or `dst` fields. Keep in mind:

* Reserved ranges aren't assignable. Tailscale never assigns addresses from the reserved ranges (`100.100.0.0/24`, `100.100.100.0/24`, or `100.115.92.0/23`) to devices, so you don't need to account for them in your policies.

* Quad100 is device-local. Traffic to `100.100.100.100` stays on the local device and doesn't traverse your tailnet. You can't target Quad100 in access control policies.

* IP pools can't overlap reserved ranges. When configuring [IP pools][docs-ip-pool], ensure your ranges don't overlap with reserved addresses.

If you integrate Tailscale with third-party services, verify that your network infrastructure doesn't use the CGNAT range (`100.64.0.0/10`) for other purposes. Some internet service providers (ISPs) use this range, which can cause [CGNAT conflicts][docs-troubleshooting-cgnat].

## Troubleshooting

If you experience connectivity issues related to IP addresses, the following resources can help:

* CGNAT conflicts: If your ISP or another virtual private network (VPN) uses the `100.64.0.0/10` range, you might experience routing conflicts. Refer to [CGNAT conflicts][docs-troubleshooting-cgnat] for solutions, including how to disable IPv4 selectively or tailnet-wide.
* Multiple devices with the same IP: Two devices can have the same Tailscale IP address if you restore one from a backup or clone a file system. Refer to [multiple devices have the same 100.x IP address][docs-troubleshooting-duplicate-ip] to resolve this.
* DNS resolution issues: If [MagicDNS][docs-magicdns] isn't resolving device names, verify that your device can reach the Quad100 DNS resolver at `100.100.100.100:53`. For Linux-specific issues, refer to [configuring Linux DNS][docs-linux-dns].
* Device connectivity: For general connectivity troubleshooting, refer to [troubleshoot device connectivity][docs-troubleshoot-connectivity].

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-device-web-interface]: /docs/features/client/device-web-interface

[docs-hello-tsnet]: /docs/reference/examples/tsnet-hello-world

[docs-ip-pool]: /docs/reference/ip-pool

[docs-ipv6]: /docs/concepts/ipv6

[docs-linux-dns]: /docs/reference/linux-dns

[docs-magicdns]: /docs/features/magicdns

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-troubleshooting-cgnat]: /docs/reference/troubleshooting/network-configuration/cgnat-conflicts

[docs-troubleshooting-duplicate-ip]: /docs/reference/troubleshooting/network-configuration/multiple-devices-same-100-x-ip-address

[docs-what-is-quad100]: /docs/reference/quad100

[xt-rfc-6598-cgnat]: https://www.rfc-editor.org/rfc/rfc6598.html

[xt-wiki-unique-local-address]: https://en.wikipedia.org/wiki/Unique_local_address
