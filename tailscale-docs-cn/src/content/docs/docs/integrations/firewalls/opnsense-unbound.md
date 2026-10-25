---
title: "OPNsense 中的 Unbound DNS"
description: "[OPNsense][xt-opnsense] 是一个基于 FreeBSD 构建的开源路由器与防火墙平台。Tailscale 可以[安装在 OPNsense 平台上][docs-install-opnsense]，让它加入你基于 WireGuard 的网状网络。"
---

最后验证于 May 6, 2025

[OPNsense][xt-opnsense] 是一个基于 FreeBSD 构建的开源路由器与防火墙平台。Tailscale 可以[安装在 OPNsense 平台上][docs-install-opnsense]，让它加入你基于 WireGuard 的网状网络。

## Unbound DNS 配置

OPNsense 通常配置了本地 Unbound DNS 服务器，用于自身的域名查询，并向局域网（LAN）客户端提供递归 DNS 服务。目前 Tailscale 的 DNS 设置尚未针对 Unbound DNS 实现；
相反，100.100.100.100 这个 DNS 服务器会被写入
`/etc/resolv.conf`。这实际上会禁用 Unbound。

或许更好的做法是不使用 Tailscale 的 DNS 设置：
`tailscale set --accept-dns=false`。
这样反而可以把 Unbound 配置成能够解析 MagicDNS 名称。
运行在 `tailscaled` 进程内的小巧的 100.100.100.100 DNS 服务器
始终会应答专门发给它的查询。

在 **System > Settings > General** 中，为 tailnet 的 [MagicDNS 名称][docs-magicdns]添加一个搜索域，例如 `tails-scales.ts.net` 或 `tail0123456.ts.net`。

*（图：在 OPNsense 的 Settings : General : DNS search domain 中设置 tails-scales.ts.net）*

在 **Services > Unbound DNS > Query Forwarding** 中，为该 [MagicDNS 名称][docs-magicdns]添加一条指向 100.100.100.100 的条目。

*（图：将 Services : Unbound DNS : Query Forwarding 设置为把 tails-scales.ts.net 发往 100.100.100.100）*

[docs-install-opnsense]: /docs/install/opnsense

[docs-magicdns]: /docs/features/magicdns

[xt-opnsense]: https://opnsense.org
