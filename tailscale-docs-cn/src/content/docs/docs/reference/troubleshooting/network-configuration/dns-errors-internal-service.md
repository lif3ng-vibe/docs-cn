---
title: "Troubleshoot DNS errors for internal services"
description: "Some DNS servers have a feature called DNS rebinding protection. This can prevent a [particular type of security issue][xt-wikipedia-dns-rebinding] but can impact the ability to access your internal s"
---

Last validated Mar 16, 2026

Some DNS servers have a feature called DNS rebinding protection. This can prevent a [particular type of security issue][xt-wikipedia-dns-rebinding] but can impact the ability to access your internal services, particularly those hosted behind a subnet router using [private IP addresses][xt-rfc-1918]. Some DNS servers might also apply this policy to the [Tailscale IP address][docs-tailscale-ip-addresses] range (addresses defined in [RFC6598][xt-rfc-6598]).

> **Note:**
>
> This issue can affect home routers (for example, [Google Wi-Fi][xt-google-support-9144137]), corporate DNS servers, and internet service provider (ISP) DNS servers.

For troubleshooting guidance, refer to [DNS problems with internal services and DNS rebinding protection][docs-dns-rebinding].

[docs-dns-rebinding]: /docs/reference/faq/dns-rebinding

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-google-support-9144137]: https://support.google.com/googlenest/answer/9144137

[xt-rfc-1918]: https://www.rfc-editor.org/rfc/rfc1918.html

[xt-rfc-6598]: https://www.rfc-editor.org/rfc/rfc6598.html

[xt-wikipedia-dns-rebinding]: https://en.wikipedia.org/wiki/DNS_rebinding
