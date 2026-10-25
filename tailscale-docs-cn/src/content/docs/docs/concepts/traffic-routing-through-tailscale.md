---
title: "我的流量会经过你们的服务器吗？"
description: "了解 Tailscale 如何做出路由决策，以及你的流量何时会经过我们的 DERP 服务器。"
---

最后验证于 Jan 5, 2026

不会。

Tailscale 会沿尽可能短的路径路由流量。在大多数情况下，这是一条点对点的直连。

当无法建立直连时，设备会借助一个或多个地理上[分布式的中继服务器][bl-how-tailscale-derp]（称为 DERP）来反弹流量进行通信。经由我们中继服务器反弹的流量是加密的，从安全性上看，与你的网络数据包从 A 点到 B 点途中本来就要经过的十几个跳点并无区别。

[bl-how-tailscale-derp]: https://tailscale.com/blog/how-tailscale-works#encrypted-tcp-relays-derp
