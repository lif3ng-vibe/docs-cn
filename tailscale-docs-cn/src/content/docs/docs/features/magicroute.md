---
title: "MagicRoute"
description: "使用 MagicRoute 在符合条件的子网路由器、应用连接器和 Tailscale Service 主机之间进行选择。"
---

最后验证于 Oct 7, 2026

> **注意：**MagicRoute 目前处于 beta 阶段。

> **注意：**MagicRoute [面向 Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

MagicRoute 是一个 tailnet 级的[路由选择选项][docs-route-selection]，它使用优先级评分为每个客户端在符合条件的子网路由器、应用连接器和 Tailscale Service 主机之间做出选择。它还会在受支持的客户端上改变[推荐出口节点][docs-recommended-exit-nodes]的算法。符合区域路由条件的 Premium 和 Enterprise tailnet 可以选择加入该 beta。

## 使用场景

当同一个目标存在多个符合条件的资源时，可以使用 MagicRoute：

* **子网路由器**：在宣告相同已批准路由前缀的路由器之间做出选择，例如位于不同接入点的路由器。
* **应用连接器**：在为相同应用配置的连接器之间做出选择，包括 DNS 结果依赖位置的应用。
* **Tailscale Service 主机**：在某个 Service 的主机之间做出选择，包括 [Kubernetes 多集群 ingress][docs-multi-cluster-ingress]的后端。

有关同样适用于区域路由的示例，参见[路由选择使用场景][docs-route-selection-use-cases]。

## 工作原理

MagicRoute 使用地理位置提示等信号为每个客户端为符合条件的候选资源评分。与区域路由不同，它不会按 DERP 区域对候选资源分组，并且支持[自定义 DERP 服务器][docs-custom-derp]。选择是按客户端进行的，而不是按连接。

切换到 MagicRoute 会把现有 Tailscale Service 主机的选择方法从 DERP 区域分组或主备切换（active-passive failover）改为优先级评分。你不需要重新创建 Service 或 Kubernetes `Ingress` 资源。主机设置参见 [Tailscale Services][docs-tailscale-services]。

MagicRoute 还会在运行 Tailscale v1.86.0 或更高版本的客户端上使用优先级评分来生成出口节点推荐。更早的客户端保持现有的推荐行为。它不会改变推荐出口节点对你的 tailnet 是否可用，也不会覆盖用户手动选择的出口节点。用户可以[一次性采纳推荐或自动跟踪推荐][docs-recommended-exit-nodes]。

## 前提条件

选择 MagicRoute 之前，请确保你的 tailnet 和资源满足以下要求：

* 你的 tailnet 为 Premium 或 Enterprise 套餐，符合区域路由条件，并且拥有 MagicRoute beta 的访问权限。现有的区域路由客户必须主动选择加入。
* 你需要具有 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 身份才能更改路由选择选项。
* 对于子网路由器和应用连接器，[部署冗余连接器][docs-ha]。按需批准子网路由并配置应用。对于 Service，配置并批准 [Service 主机][docs-tailscale-services]。
* 要使用 MagicRoute 的出口节点推荐，客户端需运行 Tailscale v1.86.0 或更高版本。服务器端在子网路由器、应用连接器和 Service 主机之间的选择适用于所有客户端版本。

## 开始使用

使用现有的路由选择流程来更改 tailnet 级选项。从其他选项切换时，你无需重新配置符合条件的资源。

1. 搭建你希望 MagicRoute 参与选择的子网路由器、应用连接器或 Tailscale Service 主机。视情况批准它们宣告的路由或 Service 主机。
2. [在管理控制台或通过 tailnet 设置 API 选择 MagicRoute][docs-route-selection-configure]。更改会为该 tailnet 保存。按照所链接的流程读回已保存的选项。
3. [从你的客户端检查路由][docs-route-selection-verify]。仅凭已保存的设置，并不能证明某个特定请求使用了某个特定资源。

## 限制

MagicRoute 不保证流量均等、基于容量的均衡，也不保证总是选择地理上最近或最快的连接器或 Service 主机。有关路由资格、最长前缀匹配以及不存在跨前缀故障转移的说明，参见[路由选择][docs-route-selection-prefix-matching]。

要报告 beta 的问题，[联系 Tailscale 支持][co-support]。

[co-support]: https://tailscale.com/contact/support

[docs-custom-derp]: /docs/reference/derp-servers/custom-derp-servers

[docs-ha]: /docs/how-to/set-up-high-availability

[docs-multi-cluster-ingress]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-recommended-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-route-selection-configure]: /docs/features/route-selection#change-the-route-selection-option

[docs-route-selection-prefix-matching]: /docs/features/route-selection#route-eligibility-and-prefix-matching

[docs-route-selection-use-cases]: /docs/features/route-selection#route-selection-use-cases

[docs-route-selection-verify]: /docs/features/route-selection#verify-route-selection

[docs-route-selection]: /docs/features/route-selection

[docs-tailscale-services]: /docs/features/tailscale-services
