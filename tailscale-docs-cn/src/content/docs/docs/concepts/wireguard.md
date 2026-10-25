---
title: "关于 WireGuard"
description: "了解 Tailscale 如何在 WireGuard 之上构建，以提供单点登录（SSO）等能力。"
---

最后验证于 Jan 5, 2026

[WireGuard][xt-wireguard] 是一个开源网络隧道协议，用于创建[加密][docs-encryption]的通信通道。它被设计为更简单、更轻量的替代方案，用以取代 OpenVPN 和 IPsec 等其他 VPN 协议。该协议以每会话极小的开销维持并发连接。独立[密码学家已对 WireGuard 协议进行过审查][xt-wireguard-analysis]，安全审计人员也检查过其代码实现，发现并得以修复了一些小问题。更多关于 WireGuard 的技术细节，请查阅其[白皮书][xt-wireguard-whitepaper]。

Tailscale 构建在 WireGuard 之上，添加了 [NAT 穿透][bl-how-nat-traversal-works]、TCP 传输能力和[访问控制策略][docs-access-control]等额外组件。Tailscale 的实现与标准 WireGuard 实现有几处不同。例如，WireGuard 在端点之间提供加密隧道，而 Tailscale 构建的是 [mesh 网络][ln-understanding-mesh-vpns]拓扑，并附带额外的网络服务和身份验证机制。Tailscale 维护着开源 [`wireguard-go`][xt-gh-tailscale-wireguard-go] 包的一个分支，Tailscale 客户端即随附该实现。

> **注意：**
>
> 有用户报告，在[与其他基于 WireGuard 的 VPN][docs-other-vpns]（例如 [Mullvad VPN][xt-mullvad]）同时运行 Tailscale 时会出现技术冲突。这些冲突源于各实现对网络接口和路由表的处理方式不同，若要并行运行需要进行特定配置。

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[docs-access-control]: /docs/features/access-control

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-other-vpns]: /docs/reference/faq/other-vpns

[ln-understanding-mesh-vpns]: https://tailscale.com/learn/understanding-mesh-vpns

[xt-gh-tailscale-wireguard-go]: https://github.com/tailscale/wireguard-go

[xt-mullvad]: https://mullvad.net/en

[xt-wireguard-analysis]: https://eprint.iacr.org/2018/080.pdf

[xt-wireguard-whitepaper]: https://www.wireguard.com/papers/wireguard.pdf

[xt-wireguard]: https://www.wireguard.com
