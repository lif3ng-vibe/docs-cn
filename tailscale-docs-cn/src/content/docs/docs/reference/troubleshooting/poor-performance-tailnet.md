---
title: "tailnet 设备之间性能不佳"
description: "Tailscale 网络（即 tailnet）中两台设备之间出现性能问题，最常见的原因是 Tailscale 无法在两台设备之间建立直连。"
---

最后验证于 Jan 5, 2026

Tailscale 网络（即 tailnet）中两台设备之间出现性能问题，最常见的原因是 Tailscale 无法在两台设备之间建立直连。发生这种情况时，Tailscale 会通过 [DERP][docs-derp] 中继服务器连接两台设备。DERP 中继服务器是 Tailscale 绕过 [NAT 穿透难题][bl-nat-traversal]、让原本无法连接的设备得以相连的方式。然而，使用 DERP 中继服务器会带来额外延迟，因为设备之间收发的数据包要先经过 DERP 服务器才能到达目的地。DERP 服务器还会限制吞吐量，以确保所有使用该服务器的用户之间公平。

请按以下步骤排查 tailnet 设备相互连接时出现网络性能问题的原因。

1. **收集两台设备之间连接的基本信息**。

   你可以使用 [`tailscale ping`][docs-cli-ping] 命令收集两台 tailnet 设备之间连接的网络信息。输出会显示有用的信息，例如能否建立连接、以毫秒计的延迟以及所使用的 DERP 服务器。

   输出还会表明两台设备之间连接的其他信息。所有 tailnet 连接起初都使用中继连接，然后转为直连（如果可行）。不过，建立直连可能耗时较长，或者设备可能建立了直连随后又回退到中继连接。

2. **确定每台设备使用的连接类型**。

   你可以使用 [`tailscale status`][docs-cli-status] 命令确定两台 tailnet 设备之间的[连接类型][docs-connection-types]。运行该命令会列出当前设备与 tailnet 中其他设备之间的所有连接及其连接类型。

   如果当前设备只使用中继连接，则它很可能无法建立直连。如果当前设备同时使用直连和中继连接，则说明 NAT 穿透问题很可能源自另一台设备。

3. **获取每台设备网络状况的报告**。

   你可以使用 [`tailscale netcheck`][docs-cli-netcheck] 命令了解设备的网络状况。该命令的输出包含有用的信息，例如设备是否支持 UDP 或端口映射，以及距离最近的 DERP 服务器的延迟信息。更多内容及输出解读帮助请参阅[使用 `netcheck` 排查问题][docs-troubleshooting-netcheck]。

   如果两台设备都使用直连，而你通过 `tailscale ping`、`tailscale status` 或 `tailscale netcheck` 命令都没有发现问题，那么问题可能出在[互联网连接][docs-poor-performance-internet]上。

[bl-nat-traversal]: https://tailscale.com/blog/how-nat-traversal-works

[docs-cli-netcheck]: /docs/reference/tailscale-cli#netcheck

[docs-cli-ping]: /docs/reference/tailscale-cli#ping

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-connection-types]: /docs/reference/connection-types

[docs-derp]: /docs/reference/derp-servers

[docs-poor-performance-internet]: /docs/reference/troubleshooting/poor-performance-internet

[docs-troubleshooting-netcheck]: /docs/reference/device-connectivity#troubleshooting-with-netcheck
