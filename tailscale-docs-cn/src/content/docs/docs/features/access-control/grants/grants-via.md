---
title: "Route filtering with Via"
description: "Via introduces routing awareness to [grants][docs-grants] by letting you include a `via` field to specify *how* Tailscale can route the destination (`dst`) from the source (`src`)."
---

Last validated Jan 5, 2026

Via introduces routing awareness to [grants][docs-grants] by letting you include a `via` field to specify *how* Tailscale can route the destination (`dst`) from the source (`src`).

You can use the [`via` syntax][ar-syntax] to define the [exit nodes][docs-exit-nodes], [subnet routers][docs-subnets], or [app connectors][docs-app-connectors] a source can access when they use a specific destination. For example, you can create a grant that forces traffic through a specific exit node when it goes from the engineering team group to the GitHub app connector.

Using the `via` field in grants lets you do things like:

* Route traffic to an enterprise application through a specific exit node.
* Route traffic from devices through different exit nodes based on whether they meet device posture criteria.
* Route traffic from specific users through a subnet router.

> **Note:**
>
> You can omit the `via` field (or set it to `[]` or `null`) when you create a grant to allow any group of devices to access a resource (through any exit node, subnet router, or app connector).

## Limitations

* You can only use [tags][docs-tags] within the `via` field.
* For [failover and regional routing reasons][docs-high-availability], you can only use accessible routers as `via` candidates. The routers accessible to users depends on applicable [access policies][docs-acls].

## Syntax

Via is an extension of the grant syntax. It adds a single field, `via`, that you can use to specify how the source routes to the destination. The following example shows how to use the `via` field.

```json
"grants": [
  {
    "src": ["<source>"],
    "dst": ["<destination>"],
    "via": ["tag:<tag-name>"],
    "ip": ["*"]
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

This example ensures traffic from `<source>` to `<destination>` goes through a device with the tag `<tag-name>`.

## Examples

The following examples illustrate using the `via` field in grants for common use cases.

* [Route traffic based on device posture rules][ar-routers-to-device-postures].
* [Route users through exit nodes based on location][ar-exit-nodes-to-users].
* [Route users through app connectors][ar-app-connectors-to-users].

### Route traffic based on device posture rules

You can use the `via` field to segment access to resources through different [routers based on device posture][docs-block-unencrypted-laptops-database-access] management rules.

The following example demonstrates a scenario in which the engineering team group can access a `192.0.2.0/24` using any available router if they comply with the `latestMac` posture (which ensures they are running the latest stable version of the Tailscale client for macOS). Anyone else (`autogroup:member`) can access `192.0.2.0/24` using the designated office router (`tag:office-router`).

```json
"postures": {
  "posture:latestMac": [
    "node:os == 'macos'",
    "node:osVersion == '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
  ]
},
"grants": [
  {
    "src": ["group:eng"],
    "srcPosture": ["posture:latestMac"],
    "dst": ["192.0.2.0/24"],
    "ip": ["*"],
  },
  {
    "src": ["autogroup:member"],
    "dst": ["192.0.2.0/24"],
    "via": ["tag:office-router"],
    "ip": ["*"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Route users through exit nodes based on location

You can use the `via` field to segment different [exit nodes][docs-exit-nodes] to different users.

The following example demonstrates a scenario where users can access internet resources through an exit node based on the user's home office location.

Users in the Toronto (`group:tor`) and Seattle (`group:sea`) offices can access internet resources using exit nodes near their home offices (or directly from their device when exit nodes are not selected). Users on the engineering team (`group:eng`) can access internet resources using any exit node in the tailnet (or directly from their device when exit nodes are not selected).

```json
"grants": [
  {
    "src": ["group:tor"],
    "dst": ["autogroup:internet"],
    "via": ["tag:exit-node-tor"],
    "ip": ["*"],
  },
  {
    "src": ["group:sea"],
    "dst": ["autogroup:internet"],
    "via": ["tag:exit-node-sea"],
    "ip": ["*"],
  },
  {
    "src": ["group:eng"],
    "dst": ["autogroup:internet"],
    "ip": ["*"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Route users through app connectors

You can use the `via` field to segment different [app connectors][docs-app-connectors] to different users.

The following example demonstrates a scenario in which users in the group `group:github-users` can access GitHub through an app connector tagged `tag:github-appconnector` while users in the group `group:salesforce-users` can access Salesforce through an app connector tagged `tag:salesforce-appconnector`.

```json
"grants": [
  {
    "src": ["group:github-users"],
    "dst": ["autogroup:internet"],
    "ip":  ["*"],
    "via": ["tag:github-appconnector"],
  },
  {
    "src": ["group:salesforce-users"],
    "dst": ["autogroup:internet"],
    "ip":  ["*"],
    "via": ["tag:salesforce-appconnector"],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

[ar-app-connectors-to-users]: #route-users-through-app-connectors

[ar-exit-nodes-to-users]: #route-users-through-exit-nodes-based-on-location

[ar-routers-to-device-postures]: #route-traffic-based-on-device-posture-rules

[ar-syntax]: #syntax

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-block-unencrypted-laptops-database-access]: /docs/solutions/protect-postgresql-unencrypted-macbooks

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-high-availability]: /docs/how-to/set-up-high-availability

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags
