---
title: "Client-side netmap caching"
description: "Client-side network map caching, or \"netmap caching,\" lets nodes start or resume communication with peers when they temporarily cannot reach the Tailscale control plane, which provides the network sta"
---

Last validated Sep 1, 2026

> **Note:**
>
> Client-side netmap caching is available for Tailscale clients version 1.104 and later.

Client-side network map caching, or "netmap caching," lets nodes start or resume communication with peers when they temporarily cannot reach the Tailscale control plane, which provides the network state and peer information nodes need to connect. This scenario can occur for various reasons, including control plane downtime or an intermediary network explicitly blocking the control plane servers.

Network map caching can also reduce startup and profile-switching time.

> **Warning:**
>
> Client-side netmap caching does not guarantee that nodes can communicate using a cached network state. It is not intended for long-term operation without access to the control plane because the cached state can become stale or invalid over time.

## Cache life cycle

A network map informs a node of its peers and how to connect to them. Without client-side netmap caching, clients can only get a netmap directly from the control plane. If the control plane is unreachable, an offline client is unable to connect to other nodes in the tailnet.

* **Cache initialization**: When client-side netmap caching is first enabled, the client initializes the cache with the current network map from the control plane.
* **Cache loading**: When the client starts up or switches profiles, it loads an available cached network map and transitions immediately into a running state.
* **Cache refresh**: After starting up from a cached network map, the client continues trying to contact to the control plane. Once reconnected, it updates the cache whenever the network map changes.
* **Cache validity**: Cache validity is affected by node key expiry. If the node key for a peer expires, that key is no longer valid and the client will be unable to communicate with that peer. If the key for the node itself expires, it will no longer be able to communicate with other nodes in the tailnet, even if their cached keys are valid. Expired keys must be updated from the control plane for communication to resume.
* **Cache reset**: There are two common scenarios where a cached netmap is cleared:
  * Deleting the user profile from the client.
  * Logging out of the tailnet.

## Enable client-side netmap caching

> **Warning:**
>
> During the trial phase, client-side netmap caching is opt-in. Nodes use the feature only when they are granted the `cache-network-maps` node attribute.

To enable client-side netmap caching, grant the [`cache-network-maps` node attribute][docs-policy-file-attr] to the applicable nodes in your [tailnet policy file][docs-tailnet-policy-file].

The following example enables netmap caching for all nodes managed by tailnet members (`autogroup:member`) and all tagged nodes (`autogroup:tagged`):

```json
"nodeAttrs": [
    {
       "target": ["autogroup:member", "autogroup:tagged"],
       "attr":   ["cache-network-maps"],
    },
],
```

> **Note:**
>
> Client-side netmap caching is not supported for all node types. Refer to [node type limitations][ar-node-type-limitations] for more information.

### Verify client-side netmap caching is enabled

Use the following command to verify that the `client-network-maps` node attribute is present:

```shell
tailscale status --json | jq '.Self.CapMap|has("cache-network-maps")'
```

Refer to the [Tailscale CLI reference][docs-tailscale-cli-status] for more information about this command.

## Disable client-side netmap caching

> **Warning:**
>
> After the trial phase, client-side netmap caching will become the default behavior and you will have the option to disable client-side caching with a new node attribute.
>
> It is not necessary to apply this new node attribute during the trial phase. This section is provided in advance to inform on upcoming planned changes in functionality.

Modify your [tailnet policy file][docs-tailnet-policy-file] to disable client-side netmap caching with [`disable-cache-network-maps` node attribute][docs-policy-file-attr].

The following rule targets all nodes tagged `uncached`.

```json
"nodeAttrs": [
    {
       "target": ["tag:uncached"],
       "attr":   ["disable-cache-network-maps"],
    },
],
```

> **Note:**
>
> If both `cache-network-maps` and `disable-cache-network-maps` are set, the disable attribute takes precedence.

### Verify client-side netmap caching is disabled

Use the following command to verify that the `cache-network-maps` node attribute is absent:

```shell
tailscale status --json | jq '.Self.CapMap|has("cache-network-maps")'
```

Refer to the [Tailscale CLI reference][docs-tailscale-cli-status] for more information about this command.

## Considerations

> **Note:**
>
> Client-side netmap caching is not supported for all node types. Refer to [node type limitations][ar-node-type-limitations] for more information.

Consider disabling netmap caching on durable connectors that do not frequently shut down or restart, to reduce disk activity and storage. These include app connectors, exit nodes, and subnet routers.

Also consider disabling netmap caching on small or embedded devices with expensive or limited storage, to avoid wear loading and write bandwidth concerns.

## Limitations

Client-side network map caching has the following limitations:

* Mobile clients are not yet supported.

### Node type limitations

Regardless of what the policy document says, client-side netmap caching is not available for:

* [ephemeral nodes][docs-ephemeral-nodes]

### New peers limitation

A client operating from a cached state cannot establish connections to new peers that join the tailnet after the cache was created, until the cache is updated from the control plane. Clients without control connectivity will have no information about newer nodes.

[ar-node-type-limitations]: #node-type-limitations

[docs-app-connectors]: /docs/features/app-connectors

[docs-custom-derps]: /docs/reference/derp-servers/custom-derp-servers

[docs-derps]: /docs/reference/derp-servers

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-peer-relays]: /docs/features/peer-relay

[docs-policy-file-attr]: /docs/reference/syntax/policy-file#attr

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status
