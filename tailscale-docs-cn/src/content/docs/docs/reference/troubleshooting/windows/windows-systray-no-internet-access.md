---
title: "Troubleshoot system tray shows no internet access"
description: "When hovering over the internet icon in the Windows system tray, the `Tailscale No internet access` status will display if the Windows client is not connected to an [exit node][docs-exit-nodes]. This "
---

Last validated Feb 18, 2026

When hovering over the internet icon in the Windows system tray, the `Tailscale No internet access` status will display if the Windows client is not connected to an [exit node][docs-exit-nodes]. This can be ignored and will have no negative impact on your connectivity to your tailnet.

The reason this happens is Windows sends active probes in the form of HTTP requests through all the available interfaces. Since no response is received over the Tailscale client unless an exit node is used, it reports no internet.

The `Tailscale Internet access` status will display when the Windows client is connected to an exit node.

[docs-exit-nodes]: /docs/features/exit-nodes
