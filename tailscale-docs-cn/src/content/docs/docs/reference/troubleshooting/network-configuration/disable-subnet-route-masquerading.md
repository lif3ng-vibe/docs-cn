---
title: "Disable subnet route masquerading"
description: "Source Network Address Translation (SNAT) affects how source IP addresses appear to devices in different parts of your network. By default, Tailscale performs SNAT on traffic passing through [subnet r"
---

Last validated Mar 25, 2026

Source Network Address Translation (SNAT) affects how source IP addresses appear to devices in different parts of your network. By default, Tailscale performs SNAT on traffic passing through [subnet routers][docs-subnet-routers], but this behavior can be modified when necessary.

You can disable subnet route masquerading with the following command (Linux only):

```shell
tailscale up --snat-subnet-routes=false
```

> **Note:**
>
> SNAT enables transparent communication to the rest of the network by re-writing the source IP address to that of the subnet router. If you disable subnet route masquerading, NAT traffic to local routes that are advertised with `--advertise-routes` will need to have routing manually configured.

For more information, refer to [Disable SNAT][docs-subnet-routers-disable-snat].

[docs-subnet-routers-disable-snat]: /docs/features/subnet-routers#disable-snat

[docs-subnet-routers]: /docs/features/subnet-routers
