---
title: "什么是 STUN？"
description: "了解 STUN 协议以及 Tailscale 如何使用它。"
---

最后验证于 Aug 6, 2025

STUN 让设备能够确定自己的公网 IP 地址以及它所处的 [NAT 类型][docs-nat-types]，这对于在不同私有网络中的设备之间建立直接通信至关重要。STUN 采用客户端-服务器架构模型：STUN 客户端向 STUN 服务器发送请求，服务器则以客户端的公网 IP 地址和端口号作为响应。

Tailscale 使用 STUN（session traversal utilities for NAT，NAT 会话穿越工具）让位于 NAT 防火墙或路由器后面的设备之间能够直接通信。设备上运行的 Tailscale 客户端充当 STUN 客户端，[DERP][docs-derp-relay-servers] 中继服务器则充当 STUN 服务器。

Tailscale 客户端会向所有 DERP 中继服务器发送 STUN 请求，DERP 中继服务器会记录下它收到请求时来源的公网 IP 和端口。Tailscale 利用这些信息确定如何穿越客户端所在的 NAT。你可以使用 [`tailscale netcheck`][docs-tailscale-netcheck] 命令获取这些信息。

想更深入地了解 Tailscale 连接的工作原理，请阅读 [Tailscale 的工作方式][bl-how-tailscale-works]。

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-derp-relay-servers]: /docs/reference/derp-servers

[docs-nat-types]: /docs/reference/device-connectivity#nat-types

[docs-tailscale-netcheck]: /docs/reference/tailscale-cli#netcheck
