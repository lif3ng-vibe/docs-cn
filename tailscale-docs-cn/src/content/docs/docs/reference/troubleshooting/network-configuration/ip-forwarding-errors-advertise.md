---
title: "排查通告子网路由或出口节点时的 IP 转发问题"
description: "Tailscale 的路由功能（[子网路由器][docs-subnets]和[出口节点][docs-exit-nodes]）要求启用 IP 转发。如果未启用，你在使用 `--advertise-routes` 或 `--advertise-exit-node` 时可能会遇到错误。"
---

最后验证于 Mar 16, 2026

Tailscale 的路由功能（[子网路由器][docs-subnets]和[出口节点][docs-exit-nodes]）要求启用 IP 转发。如果未启用，你在使用 `--advertise-routes` 或 `--advertise-exit-node` 时可能会遇到错误。

有关如何在你的 Linux 设备上进行设置的说明，请参阅[启用 IP 转发][docs-subnets-linux-ip-forwarding]。

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets-linux-ip-forwarding]: /docs/features/subnet-routers#enable-ip-forwarding

[docs-subnets]: /docs/features/subnet-routers
