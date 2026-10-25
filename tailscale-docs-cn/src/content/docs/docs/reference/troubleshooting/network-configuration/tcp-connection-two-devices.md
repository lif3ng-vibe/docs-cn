---
title: "排查两台设备之间的 TCP 连接问题"
description: "如果你的设备在管理控制台中可见，且没有[访问规则][docs-policy-syntax]阻止设备之间的连接，请用 Tailscale 的三种 `ping` 检查连接状况。"
---

最后验证于 Mar 16, 2026

如果你的设备在管理控制台中可见，且没有[访问规则][docs-policy-syntax]阻止设备之间的连接，请用 Tailscale 的三种 `ping` 检查连接状况：

* `ping 100.x.x.x` 让操作系统跨 tailnet 发送 ICMP ping。
* `tailscale ping 100.x.x.x` 测试两端的 `tailscaled` 进程能否通信，以及以何种方式通信（直连还是中继）。
* `tailscale ping --tsmp 100.x.x.x` 发送一个比 `tailscale ping` 更深入一层的数据包，同样经过 WireGuard 层，但不经过主机的网络栈。

数据包大小限制也可能在某些类型的网络上引发连接问题。

Tailscale 使用的最大传输单元（MTU）为 `1280`。如果设备上存在可能发送更大数据包的其他网络接口，这些数据包可能会被静默丢弃。可以使用 `tcpdump` 来验证这一点。

要解决此问题，可以将 LAN 层的 MTU 设为更低的值，或者使用 MSS（最大段长）钳制。

[docs-policy-syntax]: /docs/reference/syntax/policy-file
