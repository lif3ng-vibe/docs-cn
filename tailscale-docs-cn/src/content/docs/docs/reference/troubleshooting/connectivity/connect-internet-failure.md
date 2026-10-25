---
title: "无法连接到互联网"
description: "按照以下步骤排查设备无法连接到公共互联网的原因。"
---

最后验证于 Dec 10, 2025

按照以下步骤排查设备无法连接到公共互联网的原因。

> **提示：**
>
> 在检查其他任何事项之前，先确保两台设备都没有出现[基础网络连通性问题][docs-basic-network-troubleshooting]。

1. **确保设备可以访问互联网**。

   你可以尝试在浏览器中打开 [`https://tailscale.com`][co-tailscale] 之类的网站，或者使用终端应用 ping 一个知名 IP 地址（例如 Google 的 DNS 服务器之一 `8.8.8.8`）来验证。

   如果你能 ping 通某个 IP 地址，却无法在浏览器中打开 URL，那么设备很可能是[无法解析域名][docs-resolve-domain-names-failure]。

2. **检查是否存在强制门户**。

   Tailscale 能够[检测强制门户][docs-captive-portal]。不过，如果你没有收到强制门户提醒，但仍然怀疑设备可能遇到了强制门户，可以在浏览器中打开 [`http://neverssl.com`][xt-neverssl]。如果存在强制门户，这应该会将其显示出来。

   如果你遇到了强制门户（并且你信任该网络）：先断开 Tailscale 连接，登录强制门户，然后重新连接 Tailscale。

3. **确保你没有使用与 Tailscale 占用相同 CGNAT IP 地址段的服务**。

   由于 Tailscale 使用 [CGNAT][xt-wiki-cgnat] IP 地址段作为 [Tailscale IP 地址][docs-tailscale-ip-addresses]，你在访问该地址段内其他非 Tailscale 的 IP 地址时可能会遇到问题。

   要解决此类问题，你可以[更新 tailnet 策略文件以禁用 IPv4][docs-disable-ipv4]，或者使用自定义的 [IP 池][docs-ip-pool]。

4. **检查是否存在其他可能阻止连接的 Tailscale 配置**。

   例如，如果设备使用了出口节点，请确保该出口节点在线，并且有权访问你要访问的资源。又比如，确保没有访问控制策略阻止出口节点到达目的地。

5. **断开其他虚拟专用网络（VPN）软件**。

   虽然 Tailscale 不会刻意与其他 VPN 冲突，但在所有环境中都避免冲突是很困难的。许多 VPN 程序还会试图阻止其他软件（例如 Tailscale）更改网络配置。

6. **断开 Tailscale 连接**。

   如果问题仍然存在，请继续排查[基础网络连通性问题（Tailscale 之外）][docs-basic-network-troubleshooting]。

[co-tailscale]: https://tailscale.com

[docs-basic-network-troubleshooting]: /docs/reference/troubleshooting/basic-network-troubleshooting

[docs-captive-portal]: /docs/integrations/captive-portals

[docs-disable-ipv4]: /docs/reference/syntax/policy-file#disableipv4

[docs-ip-pool]: /docs/reference/ip-pool

[docs-resolve-domain-names-failure]: /docs/reference/troubleshooting/resolve-domain-names-failure

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-neverssl]: http://neverssl.com

[xt-wiki-cgnat]: https://en.wikipedia.org/wiki/Carrier-grade_NAT
