---
title: "Troubleshoot overlapping subnet route failover"
description: "When multiple subnet routers advertise overlapping routes with different prefix lengths (for example, `10.0.0.0/16` and `10.0.0.0/24`), Tailscale uses [longest prefix matching][docs-subnets-overlappin"
---

Last validated Oct 7, 2026

When multiple subnet routers advertise overlapping routes with different prefix lengths (for example, `10.0.0.0/16` and `10.0.0.0/24`), Tailscale uses [longest prefix matching][docs-subnets-overlapping-routes] to select the most specific route. However, if the subnet router advertising the more-specific route goes offline, Tailscale does not automatically fall back to the less-specific route. Tailscale drops traffic to the more-specific prefix instead.

This behavior differs from dynamic routing protocols like OSPF or BGP, where a router going offline causes route withdrawal and automatic fallback. Tailscale evaluates each advertised prefix independently. When multiple routers advertise the same prefix, Tailscale removes offline routers from consideration and fails over to a healthy one. However, this failover does not cross prefix boundaries. If all routers for a more-specific prefix go offline, Tailscale does not promote a less-specific prefix as a substitute. Refer to [avoid black holes with overlapping routes][ar-avoid-blackholes] for how to ensure a prefix has multiple candidate routers.

Tailscale enforces access control policies through routing, so automatically redirecting traffic to a different subnet router advertising a broader prefix could send traffic to an unintended or unauthorized destination. For example, if an exit node advertises `0.0.0.0/0` and a subnet router advertises a specific LAN prefix, you would not want LAN traffic to egress through the exit node if the subnet router goes down.

## Avoid black holes with overlapping routes

To prevent black holes when using overlapping routes, configure all subnet routers that advertise a broader prefix to also advertise the more-specific prefix. This ensures the more-specific prefix has multiple candidate routers.

For example, instead of:

* Subnet router A advertising `10.0.0.0/16`.
* Subnet router B advertising `10.0.0.0/24`.

Configure:

* Subnet router A advertising `10.0.0.0/16` and `10.0.0.0/24`.
* Subnet router B advertising `10.0.0.0/24`.

With this configuration, both subnet routers are candidates for the `/24` prefix, and Tailscale can fail over between them if one goes offline. Subnet router A continues to serve the `/16` route for addresses outside the `/24` range.

The tailnet's [route selection option][docs-route-selection] determines which eligible subnet router handles each client's traffic. It does not change the exact-prefix requirement for failover.

You cannot designate a preferred subnet router for a route. The [`via` field in grants][docs-via] limits which subnet routers are eligible for traffic, but does not set a preference order. A router excluded by `via` is unavailable as a fallback for that traffic.

For setup instructions, refer to [Set up high availability][docs-high-availability].

[ar-avoid-blackholes]: #avoid-black-holes-with-overlapping-routes

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-route-selection]: /docs/features/route-selection

[docs-subnets-overlapping-routes]: /docs/features/subnet-routers#use-overlapping-routes-with-different-prefix-lengths

[docs-via]: /docs/features/access-control/grants/grants-via
