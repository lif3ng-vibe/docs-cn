---
title: "Tailscale ping 报文类型"
description: "Tailscale CLI 的 ping 命令支持四种类型的 ping 报文。"
---

最后验证于 Jan 13, 2026

标准的 `ping` 命令使用[互联网控制报文协议（ICMP）][xt-rfc-792]的回显请求（echo request）和回显应答（echo reply）报文来测试网络中两台设备之间的连通性。运行标准 ping 命令时，你的系统会：

1. 向目标 IP 地址发送 ICMP 回显请求数据包。
2. 等待目标返回的 ICMP 回显应答数据包。
3. 测量往返时间。
4. 报告丢包统计信息。

标准 `ping` 命令主要测试基础 IP 连通性并测量延迟。许多防火墙和网络配置会拦截 ICMP 流量，这可能导致标准 `ping` 命令失败，即使其他类型的连通性实际存在。

Tailscale ping 命令超越了标准 ICMP ping 的功能。它让你可以使用多种协议测试[连通性][docs-device-connectivity]，从而提供关于 Tailscale 网络（即 [tailnet][docs-tailnet]）的更全面信息，帮助排查 Tailscale 特有的连通性问题。

你可以使用 [Tailscale CLI][docs-cli]（[`tailscale ping`][docs-cli-ping]）发送 Tailscale ping 报文。Tailscale ping 支持四种不同的 ping 报文类型，各自在[诊断网络连通性][docs-troubleshoot-connectivity]时有特定用途。支持的 ping 类型为 DISCO、ICMP、TSMP 和 peer API。

## DISCO

DISCO（discovery，发现）是 Tailscale 用于点对点路径发现和 [NAT 穿透][bl-how-nat-traversal-works]的协议。默认情况下，Tailscale ping 命令使用 DISCO 协议。DISCO ping 报文测试 tailnet 设备之间的直连连通性。

要发送 DISCO ping 报文，请使用不带任何标志的 [`tailscale ping`][docs-cli-ping] 命令。

```shell
tailscale ping device-name
pong from device-name  (100.100.100.123) via DERP(nue) in 20ms
pong from device-name  (100.100.100.123) via 1.2.3.4:56126 in 20ms
```

ping 输出还会显示到达目标设备所经过的路径：起初是一条 [DERP 连接][docs-derp-servers]，随后建立直连或对等中继（peer relay）连接。下面的示例先经过 DERP 连接，再经过[对等中继][docs-peer-relay]连接，最后建立直连：

```shell
tailscale ping device-name
pong from device-name (100.100.100.123) via DERP(iad) in 39ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 35ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 36ms
pong from device-name (100.100.100.123) via peer-relay(198.51.100.167:7777:vni:7) in 35ms
pong from device-name (100.100.100.123) via 203.0.113.5:37597 in 41ms
```

有关 Tailscale 连接类型的更多信息，请参阅 [Tailscale 中的连接类型][docs-connection-types]。

## ICMP

Tailscale ICMP ping 报文通过 Tailscale [加密][docs-encryption]的 WireGuard 连接发送普通 ICMP ping 报文。Tailscale ICMP ping 报文测试 Tailscale 设备之间端到端的 IP 连通性。

要发送 ICMP ping 报文，请在 [`tailscale ping`][docs-cli-ping] 命令中使用 `--icmp` 标志。

```shell
tailscale ping --icmp device-name
pong from device-name (100.100.100.123) via ICMP in 20ms
```

## TSMP（Tailscale 消息协议）

TSMP 是 Tailscale 专有的协议，用于在 ICMP 可能被拦截的情况下测试连通性。Tailscale TSMP ping 报文通过 Tailscale 加密的 [WireGuard][docs-wireguard] 隧道测试端到端 IP 连通性，但会绕过设备操作系统的 IP 协议栈。

要发送 TSMP ping 报文，请在 [`tailscale ping`][docs-cli-ping] 命令中使用 `--tsmp` 标志。

```shell
tailscale ping --tsmp device-name
pong from device-name (100.100.100.123, 12345) via TSMP in 20ms
```

## Peer API

Peer API ping 测试 tailnet 设备之间基于 HTTP 的 peer API 连通性。在排查 [Serve][docs-serve]、[Taildrive][docs-taildrive] 和 [Taildrop][docs-taildrop] 等 Tailscale 功能时非常有用。

要发送 peer API ping 报文，请在 [`tailscale ping`][docs-cli-ping] 命令中使用 `--peerapi` 标志。

```shell
tailscale ping --peerapi device-name
hit peerapi of 100.100.100.123 (device-name.corp.ts.net.) at http://100.100.100.123:12345 in 20ms
```

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[docs-cli]: /docs/reference/tailscale-cli

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-peer-relay]: /docs/features/peer-relay

[docs-serve]: /docs/features/tailscale-serve

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet]: /docs/concepts/tailnet

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-wireguard]: /docs/concepts/wireguard

[xt-rfc-792]: https://www.rfc-editor.org/rfc/rfc792.html
