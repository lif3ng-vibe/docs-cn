---
title: "内部服务的 DNS 问题与 DNS 重绑定防护"
description: "某些 DNS 服务器具有一项名为 DNS 重绑定防护（DNS rebinding protection）的功能。它可以防范[某一类安全问题][xt-wikipedia-dns-rebinding]，但可能会影响你访问内部服务的能力"
---

最后验证于 Apr 1, 2025

某些 DNS 服务器具有一项名为 DNS 重绑定防护（DNS rebinding protection）的功能。它可以防范[某一类安全问题][xt-wikipedia-dns-rebinding]，但可能会影响你访问内部服务的能力，尤其是那些经由子网路由器托管在[私有 IP 地址][xt-rfc-1918]后面的服务。一些 DNS 服务器还可能对 [Tailscale IP 地址][docs-tailscale-ip-addresses]段（在 [RFC6598][xt-rfc-6598] 中定义的地址）应用同样的策略。

> **注意：**
>
> 这个问题可能影响家用路由器（例如 [Google Wi-Fi][xt-google-dns-rebinding]）、企业 DNS 服务器以及互联网服务提供商（ISP）的 DNS 服务器。

## DNS 重绑定防护是如何工作的？

启用了 DNS 重绑定防护的 DNS 服务器会拦截包含私有 IP 地址的 DNS 响应。在公共互联网上，这不会造成任何问题，因为公共网站不使用私有 IP 地址。但在访问私有网络中的设备时，如果这些设备的 DNS 名称对公共 DNS 服务器可见，就会出问题——因为这类 DNS 响应有时会被拦截。

## DNS 重绑定防护如何影响 Tailscale？

通过 Tailscale 访问内部服务时，使用 DNS 名称可能更方便。例如，假设有一个内部仪表盘位于 `dashboard.internal.example.com`，使用地址 `10.0.0.1`。`10.0.0.1` 是私有 IP 地址，无法从公共互联网访问。如果这个 IP 地址通过[子网路由器][docs-subnets]共享给了你的 tailnet，那么 tailnet 成员就可以轻松地通过名称访问这个仪表盘。

遗憾的是，如果 tailnet 中的某个人试图从家里加载 `dashboard.internal.example.com`，而其家用路由器或 ISP 启用了 DNS 重绑定防护，这个内部仪表盘将无法访问。

[MagicDNS][docs-magicdns] 不受 DNS 重绑定防护的影响，因为它完全在 Tailscale 客户端内部工作，不涉及外部 DNS 服务器。

## 使用 Tailscale 时可考虑的解决方法

你可以通过以下任意方式绕开 DNS 重绑定防护带来的问题。但请记住，DNS 重绑定防护是一项安全功能。在完全禁用它之前，建议先咨询负责网络安全的人。使用 Tailscale DNS 配置的解决方法，或只对特定域名调整 DNS 重绑定防护，是最安全的两种选择。

1. 使用 [Tailscale DNS 配置][docs-dns-using-settings]配置受限的名称服务器（也称为 split DNS），把仅针对你内部服务域名的 DNS 请求发送到你控制的 DNS 服务器。

   在上面的例子中，把 `internal.example.com` 配置为使用内部 DNS 服务器（直接使用 tailnet 内的 `100.x.y.z` 地址，或经由使用 `10.a.b.c` 地址的子网路由器）可能是一种合理的做法。这也让他人更难探测你的网络中使用了哪些名称（这不一定能提升安全性，但也不太可能损害安全性）。

   如果你不希望在内部 DNS 服务器上托管该域名，则可以把 `internal.example.com` 配置为使用公共 DNS 服务器，例如 Google Public DNS、Cloudflare Public DNS 或 Quad9。

2. 配置有问题的 DNS 服务器，使其不对特定域名（例如 `internal.example.com`）执行 DNS 重绑定防护。你需要查阅路由器或 DNS 服务器的说明，确认是否可以把某些域名排除在 DNS 重绑定防护之外。

3. 完全禁用 DNS 重绑定防护。你需要查阅路由器或 DNS 服务器的说明来了解所需步骤。

4. 将设备重新配置为使用不含 DNS 重绑定防护的公共 DNS 服务，例如 Google Public DNS、Cloudflare Public DNS 或 Quad9。

5. 使用 [Tailscale DNS 配置][docs-dns-using-settings]并启用**覆盖 DNS 服务器**选项，把所有 DNS 查询（[MagicDNS][docs-magicdns] 或已配置使用特定名称服务器的域名除外）发送到不含 DNS 重绑定防护的公共 DNS 服务。这与上一个选项类似，但作用于整个 tailnet。

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-magicdns]: /docs/features/magicdns

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-google-dns-rebinding]: https://support.google.com/googlenest/answer/9144137

[xt-rfc-6598]: https://www.rfc-editor.org/rfc/rfc6598.html

[xt-rfc-1918]: https://www.rfc-editor.org/rfc/rfc1918.html

[xt-wikipedia-dns-rebinding]: https://en.wikipedia.org/wiki/DNS_rebinding
