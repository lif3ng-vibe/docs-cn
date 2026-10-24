---
title: "IP pool"
description: "Configure Tailscale to assign IP addresses from a specific IP pool."
---

Last validated Jan 12, 2026

> **Note:** IP pool is currently in beta.

By default, Tailscale assigns IPv4 addresses to nodes in your tailnet
from the 100.64.0.0/10 [CGNAT range][docs-100.x-addresses].
This is a private IP range not used on the public internet.

> **Note:**
>
> The following IP ranges are [reserved by Tailscale][docs-reserved-ip-addresses], and cannot be used in IP pools:
>
> * 100.100.0.0/24
> * 100.100.100.0/24
> * 100.115.92.0/23

For corporate networks that use parts of the same range for other
purposes, you can configure Tailscale to use a specific smaller
subset of the CGNAT range.

To do this, you can configure an "IP pool" in your tailnet policy file.
This is done using a node attribute that specifies an `ipPool`:

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

With this [node attribute][docs-policy-syntax-nodeattrs] set, all new nodes managed by admins in your tailnet will be assigned an IP
from the range: `100.81.0.0/16`, whereas nodes managed by members of `group:dev` will be assigned an IP from a subset
from the range: `100.85.0.0/16`.

You can also change the IPv4 address of a node at any time by an admin in your tailnet.

*（图：IPv4 Edit Dialog）*

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-reserved-ip-addresses]: /docs/reference/reserved-ip-addresses
