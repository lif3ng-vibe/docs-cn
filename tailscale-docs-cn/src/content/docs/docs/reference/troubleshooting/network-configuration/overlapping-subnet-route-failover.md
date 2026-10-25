---
title: "排查子网路由重叠时的故障转移问题"
description: "当多台子网路由器通告前缀长度不同的重叠路由（例如 `10.0.0.0/16` 和 `10.0.0.0/24`）时，Tailscale 会使用[最长前缀匹配][docs-subnets-overlapping-routes]来选择最具体的路由。"
---

最后验证于 Oct 7, 2026

当多台子网路由器通告前缀长度不同的重叠路由（例如 `10.0.0.0/16` 和 `10.0.0.0/24`）时，Tailscale 会使用[最长前缀匹配][docs-subnets-overlapping-routes]来选择最具体的路由。然而，如果通告更具体路由的那台子网路由器离线，Tailscale 不会自动回退到不那么具体的路由，而是丢弃发往更具体前缀的流量。

这一行为不同于 OSPF 或 BGP 等动态路由协议——在那些协议中，路由器离线会导致路由撤销和自动回退。Tailscale 会独立评估每个通告的前缀。当多台路由器通告同一前缀时，Tailscale 会将离线路由器排除在外，并故障转移到健康的路由器。但这种故障转移不会跨越前缀边界。如果某个更具体前缀的所有路由器都离线了，Tailscale 不会将不那么具体的前缀提升为替代。关于如何确保某个前缀拥有多台候选路由器，请参阅[避免重叠路由造成黑洞][ar-avoid-blackholes]。

Tailscale 通过路由来实施访问控制策略，因此把流量自动重定向到另一台通告更宽前缀的子网路由器，可能会把流量发往意料之外或未经授权的目的地。例如，如果出口节点通告 `0.0.0.0/0`，而子网路由器通告一个具体的 LAN 前缀，那么在子网路由器宕机时，你不会希望 LAN 流量从出口节点出去。

## 避免重叠路由造成黑洞

为防止重叠路由造成黑洞，请配置所有通告更宽前缀的子网路由器，使其同时通告更具体的前缀。这样能确保更具体的前缀拥有多台候选路由器。

例如，不要这样：

* 子网路由器 A 通告 `10.0.0.0/16`。
* 子网路由器 B 通告 `10.0.0.0/24`。

而应配置为：

* 子网路由器 A 通告 `10.0.0.0/16` 和 `10.0.0.0/24`。
* 子网路由器 B 通告 `10.0.0.0/24`。

采用此配置后，两台子网路由器都是 `/24` 前缀的候选，若其中一台离线，Tailscale 可以在它们之间故障转移。子网路由器 A 会继续为 `/24` 范围之外的地址提供 `/16` 路由。

tailnet 的[路由选择][docs-route-selection]选项决定由哪台符合条件的子网路由器处理每个客户端的流量，但它不会改变故障转移所要求的精确前缀匹配。

你无法为某条路由指定首选子网路由器。[授权中的 `via` 字段][docs-via]限定哪些子网路由器有资格承接流量，但不设置优先顺序。被 `via` 排除的路由器无法作为该流量的后备。

设置说明请参阅[设置高可用][docs-high-availability]。

[ar-avoid-blackholes]: #避免重叠路由造成黑洞

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-route-selection]: /docs/features/route-selection

[docs-subnets-overlapping-routes]: /docs/features/subnet-routers#use-overlapping-routes-with-different-prefix-lengths

[docs-via]: /docs/features/access-control/grants/grants-via
