---
title: "排查 CGNAT 冲突"
description: "Tailscale 会为 tailnet 中的每台设备分配一个唯一的 [100.x.y.z][docs-100.x-addresses] IP 地址。这被称为运营商级 NAT（CGNAT）地址空间，由 [RFC6598][xt-rfc-6598] 预留，*IANA"
---

最后验证于 Mar 16, 2026

Tailscale 会为 tailnet 中的每台设备分配一个唯一的 [100.x.y.z][docs-100.x-addresses] IP 地址。这被称为运营商级 NAT（CGNAT）地址空间，由 [RFC6598][xt-rfc-6598] 预留，即 *IANA 保留的共享地址空间 IPv4 前缀*。例如，如果你的互联网服务提供商（ISP）或[其他 VPN][docs-other-vpns]也使用了 `100.64.0.0/10` 子网（从 `100.64.0.0` 到 `100.127.255.255`），就可能产生 CGNAT 冲突。

如果你遇到了 CGNAT 冲突，可以在你的 tailnet 中禁用 IPv4。这会使 Tailscale 仅使用 IPv6。请注意，禁用 IPv4 后你将无法访问网络中的纯 IPv4 资源。例如，纯 IPv4 的出口节点将无法访问。

## 选择性禁用 IPv4

要有选择地禁用 IPv4，请在你 tailnet 的访问控制策略中，向需要禁用的目标应用 `disable-ipv4` [节点属性][docs-policy-syntax-nodeattrs]：

```json
{
  "nodeAttrs": [
	{
	  "target": ["tag:lab-foo"],
	  "attr":   ["disable-ipv4"],
	},
  ]
}
```

\[缺失片段：visual\_policy\_editor.mdx]

## 在整个 tailnet 范围禁用 IPv4

要在整个 tailnet 范围内禁用 IPv4，请在你 tailnet 的访问控制策略中，向所有目标应用 `disable-ipv4` [节点属性][docs-policy-syntax-nodeattrs]：

```json
{
  "nodeAttrs": [
	{
	  "target": ["*"],
	  "attr":   ["disable-ipv4"],
	},
  ]
}
```

\[缺失片段：visual\_policy\_editor.mdx]

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-other-vpns]: /docs/reference/faq/other-vpns

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[xt-rfc-6598]: https://www.rfc-editor.org/rfc/rfc6598.html
