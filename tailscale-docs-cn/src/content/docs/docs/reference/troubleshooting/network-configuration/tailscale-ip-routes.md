---
title: "IP routes installed by Tailscale"
description: "Starting with Tailscale v0.99, to prevent routing loops in [subnet routers][docs-subnets], Tailscale routes moved into a separate routing table. The legacy `netstat` tool doesn't display the Tailscale"
---

Last validated Mar 25, 2026

Starting with Tailscale v0.99, to prevent routing loops in [subnet routers][docs-subnets], Tailscale routes moved into a separate routing table. The legacy `netstat` tool doesn't display the Tailscale routes.

To review routes installed by Tailscale, use the following command:

```shell
ip route show table 52
```

If you want to show the Tailscale routes alongside any other routing tables on your device, use the following command:

```shell
ip route show table all
```

[docs-subnets]: /docs/features/subnet-routers
