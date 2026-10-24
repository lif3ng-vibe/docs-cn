---
title: "Troubleshoot CGNAT conflicts"
description: "Tailscale assigns each device in your tailnet a unique [100.x.y.z][docs-100.x-addresses] IP address. This is called the carrier grade NAT (CGNAT) address space, reserved by [RFC6598][xt-rfc-6598], *IA"
---

Last validated Mar 16, 2026

Tailscale assigns each device in your tailnet a unique [100.x.y.z][docs-100.x-addresses] IP address. This is called the carrier grade NAT (CGNAT) address space, reserved by [RFC6598][xt-rfc-6598], *IANA-Reserved IPv4 Prefix for Shared Address Space*. CGNAT conflicts can arise, for example, if your internet service provider (ISP), or [other VPN][docs-other-vpns], also uses the `100.64.0.0/10` subnet (from `100.64.0.0` to `100.127.255.255`).

If you are experiencing CGNAT conflicts, you can disable IPv4 in your tailnet. This will cause Tailscale to use IPv6 only. Be aware that disabling IPv4 will prevent you from accessing IPv4-only resources on your network. For example, IPv4-only exit nodes will not be accessible.

## Selectively disable IPv4

To selectively disable IPv4, apply the `disable-ipv4` [node attribute][docs-policy-syntax-nodeattrs] to the targets that require it in your tailnet's access control policies:

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

\[Missing snippet: visual\_policy\_editor.mdx]

## Disable IPv4 tailnet-wide

To disable IPv4 tailnet-wide, apply the `disable-ipv4` [node attribute][docs-policy-syntax-nodeattrs] to all targets in your tailnet's access control policies:

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

\[Missing snippet: visual\_policy\_editor.mdx]

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-other-vpns]: /docs/reference/faq/other-vpns

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[xt-rfc-6598]: https://www.rfc-editor.org/rfc/rfc6598.html
