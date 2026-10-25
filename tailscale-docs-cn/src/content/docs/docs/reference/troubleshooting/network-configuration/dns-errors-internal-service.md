---
title: "排查内部服务的 DNS 错误"
description: "一些 DNS 服务器具有名为 DNS 重绑定保护的功能。它可以防范[某一类安全问题][xt-wikipedia-dns-rebinding]，但可能会影响你访问内部服务的能力。"
---

最后验证于 Mar 16, 2026

一些 DNS 服务器具有名为 DNS 重绑定保护（DNS rebinding protection）的功能。它可以防范[某一类安全问题][xt-wikipedia-dns-rebinding]，但可能会影响你访问内部服务的能力，尤其是那些托管在使用[私有 IP 地址][xt-rfc-1918]的子网路由器后面的服务。一些 DNS 服务器可能还会将此策略应用于 [Tailscale IP 地址][docs-tailscale-ip-addresses]范围（即 [RFC6598][xt-rfc-6598] 中定义的地址）。

> **注意：**
>
> 此问题可能影响家用路由器（例如 [Google Wi-Fi][xt-google-support-9144137]）、企业 DNS 服务器以及互联网服务提供商（ISP）的 DNS 服务器。

排查指引请参阅[内部服务的 DNS 问题与 DNS 重绑定保护][docs-dns-rebinding]。

[docs-dns-rebinding]: /docs/reference/faq/dns-rebinding

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-google-support-9144137]: https://support.google.com/googlenest/answer/9144137

[xt-rfc-1918]: https://www.rfc-editor.org/rfc/rfc1918.html

[xt-rfc-6598]: https://www.rfc-editor.org/rfc/rfc6598.html

[xt-wikipedia-dns-rebinding]: https://en.wikipedia.org/wiki/DNS_rebinding
