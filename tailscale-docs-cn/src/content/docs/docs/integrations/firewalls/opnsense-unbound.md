---
title: "Unbound DNS in OPNsense"
description: "[OPNsense][xt-opnsense] is an open source router and firewall platform built using FreeBSD. Tailscale can be [installed on an OPNsense platform][docs-install-opnsense], joining it to your WireGuard-ba"
---

Last validated May 6, 2025

[OPNsense][xt-opnsense] is an open source router and firewall platform built using
FreeBSD. Tailscale can be [installed on an OPNsense platform][docs-install-opnsense],
joining it to your WireGuard-based mesh network.

## Unbound DNS configuration

OPNsense is often configured with a local Unbound DNS server to use for
its own lookups and to provide as a recursive DNS service to LAN clients.
Tailscale DNS settings are not currently implemented for Unbound DNS;
instead, the 100.100.100.100 DNS server will be written to
`/etc/resolv.conf`. This will effectively disable Unbound.

It may be preferable to not use the Tailscale DNS settings:
`tailscale set --accept-dns=false`.
Instead, Unbound can be configured to be able to resolve MagicDNS names.
The tiny 100.100.100.100 DNS server running within the `tailscaled` process
will always answer queries specifically sent to it.

In **System > Settings > General**, add a search domain for the [MagicDNS name][docs-magicdns]
of the tailnet such as `tails-scales.ts.net` or `tail0123456.ts.net`.

*（图：Set tails-scales.ts.net in the OPNsense Settings : General : DNS search domain）*

In **Services > Unbound DNS > Query Forwarding**, add an entry for the [MagicDNS name][docs-magicdns]
directed to 100.100.100.100.

*（图：Set Services : Unbound DNS : Query Forwarding to send tails-scales.ts.net to 100.100.100.100）*

[docs-install-opnsense]: /docs/install/opnsense

[docs-magicdns]: /docs/features/magicdns

[xt-opnsense]: https://opnsense.org
