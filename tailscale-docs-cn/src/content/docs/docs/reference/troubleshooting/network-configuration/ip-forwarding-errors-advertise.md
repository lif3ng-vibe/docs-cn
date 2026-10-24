---
title: "Troubleshoot IP forwarding issues when advertising subnet routes or exit nodes"
description: "Tailscale's routing features ([subnet routers][docs-subnets] and [exit nodes][docs-exit-nodes]) require IP forwarding to be enabled. If it is not enabled, you may encounter an error when using `--adve"
---

Last validated Mar 16, 2026

Tailscale's routing features ([subnet routers][docs-subnets] and [exit nodes][docs-exit-nodes]) require IP forwarding to be enabled. If it is not enabled, you may encounter an error when using `--advertise-routes` or `--advertise-exit-node`.

For information about how to do this for your Linux device, refer to [Enable IP forwarding][docs-subnets-linux-ip-forwarding].

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets-linux-ip-forwarding]: /docs/features/subnet-routers#enable-ip-forwarding

[docs-subnets]: /docs/features/subnet-routers
