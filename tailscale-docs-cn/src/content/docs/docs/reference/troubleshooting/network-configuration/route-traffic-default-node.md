---
title: "Troubleshoot routing all traffic through a default route"
description: "On Tailscale, you can define an [exit node][docs-exit-nodes], which automatically configures default routes on your behalf."
---

Last validated Mar 16, 2026

On Tailscale, you can define an [exit node][docs-exit-nodes], which automatically configures default routes on your behalf.

If you want to force your traffic through a particular IP (to handle an IP blocklist or IP allowlist) you can also route only a subset of your traffic using subnets. For more information, refer to [Connecting to external services with IP blocklists using Tailscale][docs-ip-blocklist-relays].

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-blocklist-relays]: /docs/concepts/ip-blocklist-relays
