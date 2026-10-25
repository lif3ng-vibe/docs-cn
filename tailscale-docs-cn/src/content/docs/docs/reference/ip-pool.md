---
title: "IP 地址池"
description: "配置 Tailscale 从特定的 IP 池中分配 IP 地址。"
---

最后验证于 Jan 12, 2026

> **注意**：IP 地址池目前处于 beta 阶段。

默认情况下，Tailscale 会从 100.64.0.0/10 的 [CGNAT 地址段][docs-100.x-addresses]中为 tailnet 内的节点分配 IPv4 地址。
这是一个公共互联网不使用的私有 IP 地址段。

> **注意：**
>
> 以下 IP 地址段[由 Tailscale 保留][docs-reserved-ip-addresses]，不能用于 IP 池：
>
> * 100.100.0.0/24
> * 100.100.100.0/24
> * 100.115.92.0/23

如果企业网络把同一地址段中的一部分用于其他用途，你可以配置 Tailscale 使用 CGNAT 地址段中一个更小的特定子集。

为此，你可以在 tailnet 策略文件中配置一个"IP 池"（IP pool）。
这通过一个指定 `ipPool` 的节点属性（node attribute）来完成：

```json
{
  "grants": ["..."],
  "nodeAttrs": [
    {
      "target": ["autogroup:admin"],
      "ipPool": ["100.81.0.0/16"],
    },
    {
      "target": ["group:dev"],
      "ipPool": ["100.85.0.0/16"],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

设置好这个[节点属性][docs-policy-syntax-nodeattrs]后，你 tailnet 中由管理员管理的所有新节点都将从 `100.81.0.0/16` 地址段中获得 IP，
而由 `group:dev` 成员管理的节点则会从 `100.85.0.0/16` 地址段的子集中获得 IP。

你 tailnet 中的管理员也可以随时更改某个节点的 IPv4 地址。

*（图：IPv4 编辑对话框）*

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses
