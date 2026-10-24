---
title: "Node attributes vs. grant app capabilities"
description: "Understand whether a capability belongs on a device or on a connection, and how node attributes and grant app capabilities differ."
---

Last validated Jun 24, 2026

Node attributes and grant app capabilities both attach additional capabilities to devices through the [tailnet policy file][docs-tailnet-policy-file]. They differ in what the capability attaches to: a node attribute attaches to a device, and a grant app capability attaches to a connection between two devices.

This topic explains that difference and how to decide where a capability belongs. It does not list every available attribute or capability. For those, refer to the [node attributes reference][docs-node-attributes] and the [application capabilities explanation][docs-grants-app-capabilities].

## Node attributes

The [`nodeAttrs`][docs-node-attributes] section of the tailnet policy file applies attributes to devices based on identity. Each entry names a `target` (the devices the attributes apply to, selected by tag, user, group, or `*`) and the attributes to apply. A node attribute has no source and no destination, so the device carries the attribute at all times.

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["funnel"],
  },
],
```

This grants every member's device the ability to use [Tailscale Funnel][docs-funnel]. Funnel is a property of the device: the device can either expose a service to the internet or it cannot, regardless of which other device is involved.

## Grant app capabilities

A [grant][docs-grants] defines which source devices (`src`) can reach which destination devices (`dst`). The [`app` field][docs-grants-app-capabilities] on a grant attaches application capabilities to that connection, so the capability applies only when a device in `src` accesses a device in `dst`.

```json
"grants": [
  {
    "src": ["tag:us-east-vpc"],
    "dst": ["tag:us-east-relays"],
    "app": {
      "tailscale.com/cap/relay": [],
    },
  },
],
```

This lets devices tagged `tag:us-east-vpc` use the devices tagged `tag:us-east-relays` as [peer relays][docs-peer-relay]. The capability describes a relationship between two sets of devices: changing the `src` or the `dst` changes which devices can relay through which.

## Application capabilities in both sections

The `app` map is not unique to grants. Node attributes carry device properties in two forms: the `attr` flags shown above, such as `funnel`, and a structured `app` field. Grants also accept an `app` field. The same application-capability format (`<domainName>/<capabilityName>` mapped to an array of configuration objects) can appear in either `nodeAttrs` or `grants`.

Whether a capability uses the `app` map does not determine where it belongs; placement does. For example, you configure an [app connector][docs-app-connectors] with the `tailscale.com/app-connectors` capability in `nodeAttrs.app`:

```json
"nodeAttrs": [
  {
    "target": ["tag:example-connector"],
    "app": {
      "tailscale.com/app-connectors": [
        {
          "name": "example-app",
          "connectors": ["tag:example-connector"],
          "domains": ["example.com"],
        },
      ],
    },
  },
],
```

An app connector reaches `example.com` on behalf of the tailnet regardless of which device sends traffic to it, so the capability describes the connector device and lives in `nodeAttrs.app`. Peer relay usage describes a relationship between devices, so it lives in `grants[].app`. The `app` map has the same shape in both sections; its placement records whether the capability is a device property or a connection property.

## Choosing between them

Use a node attribute when the capability is true of the device regardless of what it connects to. Use a grant app capability when the capability applies only along a specific source-to-destination path.

| Aspect                | Node attribute                                       | Grant app capability                                                                                                |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Attaches to           | A device                                             | A connection between two devices                                                                                    |
| Policy file section   | `nodeAttrs`                                          | `grants` (the `app` field)                                                                                          |
| Selected by           | Device identity (`target`: tag, user, group, or `*`) | A `src` → `dst` relationship                                                                                        |
| Conditional filtering | None, selected by `target` identity alone            | Scope by [device posture][docs-device-posture] (`srcPosture`) or route through specific devices ([`via`][docs-via]) |
| Scope                 | Applies wherever the device connects                 | Applies only when a `src` device reaches a `dst` device                                                             |
| Examples              | Funnel, app connectors                               | Peer relay usage                                                                                                    |

Placement determines scope, so putting a capability in the wrong section changes which devices have it and when:

* A connection capability written as a node attribute loses its boundary. The attribute applies by identity alone, with no `src` or `dst`, so the device carries the capability toward every destination it reaches rather than only the path you intended.
* A device property written as a grant app capability gains a boundary it should not have. The grant takes effect only when a listed `src` reaches a listed `dst`, so the capability is absent on every other connection, even though the property is meant to be true of the device everywhere.

## Related

* [Node attributes reference][docs-node-attributes]: the full `nodeAttrs` syntax and the available attributes.
* [Application capabilities][docs-grants-app-capabilities]: how the `app` map works and the built-in Tailscale capabilities.
* [Grants][docs-grants]: the access control syntax that scopes capabilities to `src` → `dst` connections.
* [Grants vs. ACLs][docs-grants-vs-acls]: a related comparison of Tailscale's two access control methods.
* [Device provisioning with OAuth apps][docs-device-provisioning]: how custom node attributes are automatically assigned to devices at provision time.

[docs-app-connectors]: /docs/features/app-connectors

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-peer-relay]: /docs/features/peer-relay

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-via]: /docs/features/access-control/grants/grants-via
