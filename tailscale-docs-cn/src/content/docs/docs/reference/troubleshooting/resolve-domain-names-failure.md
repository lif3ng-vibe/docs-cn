---
title: "无法解析域名"
description: "无法解析域名说明 DNS 存在问题。不过，这可能与本地、网络或 Tailscale 的 DNS 配置有关。请按照以下说明排查设备无法解析域名的原因。"
---

最后验证于 Jan 23, 2026

无法解析域名说明 DNS 存在问题。不过，这可能与本地、网络或 Tailscale 的 DNS 配置有关。请按照以下说明排查设备无法解析域名的原因。

1. **[测试设备的本地 DNS 配置][docs-test-dns]，确保你能解析域名**。还应检查设备的 DNS 配置设置中是否存在无效选项。这些设置的位置因操作系统而异。

   测试完 DNS 配置后，断开 Tailscale，然后重试连接，以检查问题是否与 Tailscale 有关。

   如果设备使用企业或互联网服务提供商（ISP）的 DNS 服务器，那么在解析私有 IP 地址时，可能会遇到名为 [DNS 重绑定保护][docs-dns-rebinding] 的功能导致的问题。你可以借助 Tailscale DNS 设置和 [MagicDNS][docs-magicdns] 来[绕过][docs-dns-rebinding-workarounds]这些问题。

2. **检查网络的 DNS 设置**。

   确保上游或网络的 DNS 配置设置有效。例如，确保其中没有错误的 IP 地址、拼写错误或语法错误。

   如果设备位于本地部署环境，你可以在默认网关（路由器）或防火墙上找到这些设置。如果设备是云主机或虚拟机（VM），你可以从云服务提供商（例如 Amazon Web Services、Google Cloud 或 Microsoft Azure）处访问这些设置。

3. **检查 Tailscale 的 DNS 设置**。

   你可以在 Tailscale 客户端中查看设备是否使用 [Tailscale 的 DNS 设置][docs-dns]。

   如果客户端已设置为使用 Tailscale 的 DNS 设置，请在管理控制台的 [DNS](https://console.tailscale.com/admin/dns) 页面核对这些设置。确保设备有权访问所配置的[名称服务器][docs-nameservers]。例如，访问控制策略可能阻止了它的访问，或者要求设备经由子网路由器访问名称服务器。

[docs-dns-rebinding-workarounds]: /docs/reference/faq/dns-rebinding#使用-tailscale-时可考虑的解决方法

[docs-dns-rebinding]: /docs/reference/faq/dns-rebinding

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-magicdns]: /docs/features/magicdns

[docs-nameservers]: /docs/reference/dns-in-tailscale#nameservers

[docs-test-dns]: /docs/reference/dns-in-tailscale#test-dns-configurations
