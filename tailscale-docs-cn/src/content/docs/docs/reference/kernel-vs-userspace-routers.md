---
title: "内核与 netstack 子网路由及出口节点"
description: "了解内核模式与用户态模式，以及子网路由器和出口节点如何使用它们。"
---

最后验证于 Jan 5, 2026

Tailscale 可以用以下两种不同模式之一充当子网路由器或出口节点：

1. **内核模式**（Linux 上的 root）
2. **用户态模式**（所有非 Linux 设备，以及 Linux 上的非 root 用户）

## 内核模式

在内核模式下，由操作系统本身转发数据包。来自对端的加密 WireGuard UDP 数据包进入内核，由内核转交给 Tailscale 解密；Tailscale 再把解密后的数据包交回内核，转发给相应的目标。

这是 Linux 上的默认运行模式，也是 Tailscale 最早支持的模式。

在这种模式下，Tailscale 不会改写经过它的 IP 数据包。TCP 流从源端出发，经过 Tailscale 子网路由器或出口节点，一路端到端到达最终目的地。所有 IP 协议都受支持。

## 用户态（netstack）模式

Tailscale 也可以在用户态运行子网路由器和出口节点，而不由内核转发数据包。这发生在以下任一情况：

1. `tailscaled` 以 `--tun=userspace-networking` 运行（以普通非 root 用户运行时使用）
2. Tailscale 运行在 Linux 以外的操作系统上，例如 FreeBSD、macOS 或 Windows。这是在这些操作系统上运行子网路由器和出口节点的唯一方式。

在用户态模式下，Tailscale 使用
[gVisor][xt-gh-gvisor] 的
[`netstack`][xt-gh-netstack] 库，在[用户态实现网络功能][xt-gvisor-net-security]。

在这种模式下，Tailscale 会终结来自源端 Tailscale 对端的 TCP 和 UDP 连接，并从子网路由器向目标发起新的出站连接，再把两者拼接起来。

对于 ICMP ping，Tailscale 守护进程的处理方式与其转发 TCP 和 UDP 流量的方式类似。当 Tailscale 子网路由器或出口节点收到 ICMP ping 请求时，它会向目标发出自己的 ping 请求（必要时运行 `ping` 命令），如果自身发出的请求成功，就应答原始请求。这会增加少量表观 ping 延迟；之所以支持它，主要是让人们可以用熟悉的工具测试连通性。

在用户态模式下，其他 ICMP 流量不会经 Tailscale 转发。同样，TCP 或 UDP 之外的任何 IP 协议（例如 SCTP）在用户态模式下都不受支持。

## 性能

内核模式与用户态模式在 CPU 和内存特性上有所不同。

一般来说，负载繁重的子网路由器应使用内核模式（目前因此仅限 Linux）。所谓"繁重"，是用户数、流数量、带宽等因素的综合。

对于用户较少或带宽较低的场景，用户态模式应当绰绰有余。尽管 Tailscale 的用户态子网路由不如 Linux 内核优化得充分，但它能避免一些陷入内核的上下文切换，多少有所弥补。

无论如何，如果你观察到 `tailscaled` 占用的 CPU 或内存超出预期，可以考虑改用内核模式的子网路由器。

## 总结

| 特性                       | 内核模式                | 用户态模式                  |
| -------------------------- | ----------------------- | --------------------------- |
| 路由类型                   | 第 3 层（IP）           | 第 4 层（UDP、TCP）         |
| ICMP 支持                  | 全部                    | 仅 ping（重建）             |
| TCP 端到端                 | 是                      | 否（重建）                  |
| UDP 端到端                 | 是                      | 否（重建）                  |
| SCTP 及其他支持            | 是（所有 IP 协议）      | 否（仅 TCP、UDP）           |
| 性能                       | 最佳                    | 可接受                      |
| 成熟度                     | 稳定                    | 较新（就 Tailscale 而言）   |

[xt-gh-gvisor]: https://github.com/google/gvisor

[xt-gh-netstack]: https://github.com/inetaf/netstack

[xt-gvisor-net-security]: https://gvisor.dev/blog/2020/04/02/gvisor-networking-security
