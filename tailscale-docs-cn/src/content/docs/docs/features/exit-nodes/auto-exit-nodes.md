---
title: "Recommended exit nodes"
description: "A recommended exit node (also called a suggested exit node) is an [exit node][docs-exit-node] or [Mullvad exit node][docs-mullvad-exit-node] that Tailscale recommends based on client information such "
---

Last validated Oct 7, 2026

> **Note:**
>
> Recommended exit nodes are available for [Standard, Premium, and Enterprise plans][co-pricing], or customers who have purchased the [Mullvad][docs-mullvad-exit-node] add-on.

A recommended exit node (also called a suggested exit node) is an [exit node][docs-exit-node] or [Mullvad exit node][docs-mullvad-exit-node] that Tailscale recommends based on client information such as location and latency. A recommendation does not change a manually selected exit node. You can select a recommendation once or configure your client to automatically track recommendations. A [system policy][docs-mandatory-exit-nodes] can require automatic selection, but is not required for you to enable it.

## How it works

Tailscale prefers non-Mullvad exit nodes when selecting a recommended exit node. If the tailnet has any standard exit nodes available, Tailscale recommends them first. If no standard exit nodes are available, Tailscale recommends an available Mullvad exit node if one exists.

The selection logic varies between standard and Mullvad exit nodes. Tailscale uses latency and performance information to select a recommended standard exit node. Because Tailscale doesn't have performance information for Mullvad exit nodes, it selects one to recommend based on location.

### MagicRoute for exit nodes

When your tailnet opts in to the MagicRoute beta, clients running Tailscale v1.86.0 or later can use its priority scoring for exit node recommendations. Older clients keep their existing recommendation behavior. Refer to [MagicRoute][docs-magicroute] for details and limitations.

MagicRoute requires a Premium or Enterprise tailnet eligible for route selection. You can use recommended exit nodes without MagicRoute.

## Use a suggested exit node

You can use a recommended exit node from the [Tailscale CLI][docs-tailscale-cli] or the Tailscale client.

#### Tailscale CLI

To select a suggested exit node once using the Tailscale CLI:

1. Use the following command to view the recommended exit node:

   ```shell
   tailscale exit-node suggest
   ```

   The command returns the ID of the suggested exit node.

   ```
   Suggested exit node: <ID>.
   To accept this suggestion, use `tailscale set --exit-node=<ID>`.
   ```

2. Run `tailscale set` with the `--exit-node=<ID>` flag to use the suggested exit node.

   ```shell
   tailscale set --exit-node=<ID>
   ```

To automatically track recommendations instead, run:

```shell
tailscale set --exit-node=auto:any
```

Your client automatically switches to the suggested exit node when available exit nodes or network conditions change. For details, refer to [`tailscale set`][docs-tailscale-cli-set].

#### Tailscale client

To use the suggested exit node using the Tailscale client, select **Recommended** from the **Exit Nodes** menu.

## Force use of an exit node

You can force devices to use an exit node based on system policies, which you can deploy using mobile device management (MDM) solutions. For details, refer to [Mandatory exit nodes][docs-mandatory-exit-nodes].

[co-pricing]: https://tailscale.com/pricing

[docs-exit-node]: /docs/features/exit-nodes

[docs-magicroute]: /docs/features/magicroute

[docs-mandatory-exit-nodes]: /docs/features/exit-nodes/mandatory-exit-nodes

[docs-mullvad-exit-node]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-tailscale-cli]: /docs/reference/tailscale-cli

[docs-tailscale-cli-set]: /docs/reference/tailscale-cli#set
