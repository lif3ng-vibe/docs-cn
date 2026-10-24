---
title: "Troubleshoot AWS access to Google with advertised routes"
description: "Only part of the `172.0.0.0/8` range is private. The rest is public address space and Google has IP addresses in that range for some of its data centers."
---

Last validated Mar 20, 2026

Only part of the `172.0.0.0/8` range is private. The rest is public address space and Google has IP addresses in that range for some of its data centers.

You can safely advertise the `172.16.0.0/12` range instead:

```shell
tailscale set --advertise-routes=172.16.0.0/12
```
