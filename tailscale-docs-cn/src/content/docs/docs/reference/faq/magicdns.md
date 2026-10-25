---
title: "为什么 MagicDNS 在端口 443 上获取记录？"
description: "当你使用流行的 DNS 提供商时，Tailscale 会透明地将你升级到 [DNS over HTTPS][xt-wikipedia-doh]（DoH），让你的 DNS 查询与 DNS 服务器之间端到端加密。"
---

最后验证于 Sep 18, 2025

当你使用流行的 DNS 提供商时，Tailscale 会透明地将你升级到 [DNS over HTTPS][xt-wikipedia-doh]（DoH），让你的 DNS 查询与 DNS 服务器之间端到端加密。

传统上，DNS 以明文形式通过 UDP 端口 53 进行。这让同一家咖啡店或同一网络里技术门槛很低的攻击者也能嗅探你的 DNS 流量，从而发现你正在连接哪些网站。DNS over HTTPS 改变了这一点：所有 DNS 请求都经由 HTTPS 发出，并使用 TLS 进行[加密][docs-encryption]。

有了这一功能，应用程序将向虚拟 IP 地址 `100.100.100.100` 上的本地 MagicDNS 服务器发起 DNS 查询，而不是向操作系统层面的 DNS 服务器查询。随后 MagicDNS 会透明地把所有 DNS 查询升级为 DoH。这让旧式环境和应用免费获得端到端加密的 DNS 查询。

如果你使用管理控制台 [DNS](https://console.tailscale.com/admin/dns) 页面中列出的任何默认名称服务器，Tailscale 会在可能时自动使用 DoH。使用 [NextDNS][docs-nextdns] 时，它只接受 DoH 连接，这意味着所有查询都会与你的 DNS 服务器端到端加密。

你的出站连接监控软件需要相应调整以适应这一行为。它可能表现为一条连向端口 443（标准 HTTPS 端口）的意外 TCP 连接。

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-nextdns]: /docs/integrations/nextdns

[xt-wikipedia-doh]: https://en.wikipedia.org/wiki/DNS_over_HTTPS
