---
title: "Mandatory exit nodes"
description: "You can mandate always-on [exit nodes][docs-exit-nodes] using mobile device management (MDM) tools. To do so, specify a single exit node to use as the always-on exit node, or use [auto exit nodes][doc"
---

Last validated Sep 29, 2026

> **Note:**
>
> Mandatory exit nodes are available for [Premium and Enterprise plans][co-pricing], or customers who have purchased the [Mullvad][docs-mullvad-exit-nodes] add-on.

> **Note:**
>
> Mandatory exit nodes require that the Tailscale client run Tailscale v1.69.3 or later.

You can mandate always-on [exit nodes][docs-exit-nodes] using mobile device management (MDM) tools. To do so, specify a single exit node to use as the always-on exit node, or use [auto exit nodes][docs-auto-exit-nodes] across your entire fleet of devices.

Mandating exit nodes requires an [MDM solution][docs-mdm] to set the relevant [system policies][docs-mdm-keys]. This can be useful in hybrid or remote working environments where employees must route network traffic through corporate or branch offices.

To enable a single exit node in an always-on fashion, configure the [`ExitNodeID`][docs-mdm-keys-exitnodeid] policy to that of the mandatory exit node.

Set the [`ExitNodeID`][docs-mdm-keys-exitnodeid] policy to `auto:any` to require an automatically selected exit node. To limit the choices, set [`AllowedSuggestedExitNodes`][docs-mdm-keys-allowedsuggestedexitnodes] to a list of permitted exit nodes. If this policy is unset, Tailscale can select any exit node. If it is set but empty, Tailscale cannot select any exit node.

> **Note:**
>
> Mandating exit nodes in an always-on fashion can cause service disruptions when exit nodes lose connectivity or during captive portal workflows (such as when needing to authenticate to Tailscale). Use caution if combining mandatory exit nodes with a policy that prevents disconnecting the Tailscale client.

[co-pricing]: https://tailscale.com/pricing

[docs-auto-exit-nodes]: /docs/features/exit-nodes/auto-exit-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-mdm-keys-allowedsuggestedexitnodes]: /docs/features/tailscale-system-policies#suggest-allowed-forced-exit-nodes

[docs-mdm-keys-exitnodeid]: /docs/features/tailscale-system-policies#force-an-exit-node-to-always-be-used

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm]: /docs/mdm

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
