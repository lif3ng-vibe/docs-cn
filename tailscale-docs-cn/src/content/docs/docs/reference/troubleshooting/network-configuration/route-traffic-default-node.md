---
title: "排查通过默认路由转发全部流量的问题"
description: "在 Tailscale 上，你可以定义[出口节点][docs-exit-nodes]，它会代你自动配置默认路由。"
---

最后验证于 Mar 16, 2026

在 Tailscale 上，你可以定义[出口节点][docs-exit-nodes]，它会代你自动配置默认路由。

如果你想让流量经由某个特定 IP（以应对 IP 黑名单或 IP 白名单），也可以使用子网只路由一部分流量。更多信息请参阅[使用 Tailscale 结合 IP 黑名单连接外部服务][docs-ip-blocklist-relays]。

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-blocklist-relays]: /docs/concepts/ip-blocklist-relays
