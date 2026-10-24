---
title: "Declarative node sharing"
description: "Define sharing relationships and grant access to resources across trusted tailnets using policy."
---

Last validated Aug 26, 2026

> **Note:** Declarative node sharing is currently in alpha.

Declarative node sharing lets you give users and devices across multiple trusted tailnets access to resources in your tailnet, including monitoring systems, build servers, or development environments. You can do this by defining sharing relationships in the [tailnet policy file][docs-tailnet-policy-file].

You can use declarative node sharing when your organization operates multiple trusted tailnets and needs to provide access between them. For example:

* **Share centralized infrastructure**: Give users in separate tailnets access to shared infrastructure or applications, such as monitoring or development resources.
* **Connect business units or acquired organizations**: Share selected resources between tailnets operated by different teams, subsidiaries, or acquired companies while keeping each tailnet independently administered.
* **Support machine-to-machine access**: Let tagged devices in one tailnet access resources in another tailnet through policy.

Unlike [link-based node sharing][docs-sharing], which shares individual nodes with individual users, declarative node sharing works at the policy level. Administrators use policy to control which resources they share across tailnet boundaries, without managing each node share individually.

> **Warning:**
>
> Declarative node sharing assumes, but does not establish, a trust relationship between the administrators of both tailnets. Do not use it to share resources with unknown or untrusted tailnets.
>
> If you only need to share an individual machine with a specific user outside your tailnet, use [link-based node sharing][docs-sharing] instead.

## How it works

Declarative node sharing uses a double opt-in model: an administrator configures each tailnet's policy file, and access takes effect only once both sides are in place.

Each tailnet has a distinct role:

* The receiving tailnet controls which of its local groups and [tags][docs-tags] an external tailnet is allowed to reference.
* The sharing tailnet writes [grants][docs-grants] that give those external groups or tags access to specific local resources.

## Before you begin

Complete the following before you configure declarative node sharing:

* Exchange tailnet IDs with the administrator of the other tailnet. You can retrieve a tailnet ID from the [General](https://console.tailscale.com/admin/settings/general) page of the admin console, in the **Unique IDs** section.
* Agree on which groups and tags in the receiving tailnet will receive access, and confirm they are defined in that tailnet's policy file. Declarative sharing can reference only groups and tags defined in the policy file. Note that synced groups such as SCIM or Google groups are not supported.

## Access declarative node sharing

To use declarative node sharing, update the tailnet policy file in the admin console.

1. Open the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
2. Go to **Feature previews**.
3. Next to **Declarative Node Sharing**, select **Manage in policy**.
4. Continue with the guidance below to update the tailnet policy file.

## Configure declarative node sharing

Both tailnets must update their tailnet policy files.

### Configure the receiving tailnet

In the receiving tailnet, first define the sharing tailnet in the `externalTailnets` section of its policy, then explicitly allow that tailnet to reference selected local groups or tags.

For example:

```json
{
  "externalTailnets": {
    "<tailnet-alias>": {
      "externalID": "<sharing-tailnet-id>",
      "allowIncomingConnections": false,
      "allowExternalReferencesTo": [
        "group:<group-name>"
      ]
    }
  },

  "groups": {
    "group:<group-name>": [
      "<user-1>",
      "<user-2>"
    ]
  }
}
```

`allowExternalReferencesTo` controls the list of local groups or tags the external tailnet can reference in its policy.

### Configure the sharing tailnet

In the sharing tailnet, define the receiving tailnet in its own `externalTailnets` section:

```json
{
  "externalTailnets": {
    "<tailnet-alias>": {
      "externalID": "<receiving-tailnet-id>",
      "allowIncomingConnections": true,
    }
  }
}
```

`allowIncomingConnections` must be set to `true`, indicating that the sharing tailnet accepts incoming traffic from this tailnet.
The sharing tailnet can then create a grant that specifies which groups/tags in the external tailnet can access a local resource.

For example:

```json
{
  "grants": [
    {
      "src": [
        "group://<tailnet-alias>/<group-name>"
      ],
      "dst": [
        "<resource>"
      ],
      "ip": [
        "*"
      ]
    }
  ]
}
```

External groups use the following syntax:

```
group://<tailnet-alias>/<group-name>
```

External tagged devices use:

```
tag://<tailnet-alias>/<tag-name>
```

Use the external group or tag as the `src` of the grant. The `dst` specifies the resource in the sharing tailnet that it can access.
If a group or tag is referenced that the receiving tailnet has not included in its `allowExternalReferencesTo` list, the grant rule will be ignored.

## Connect to a shared resource

After both tailnets have updated their tailnet policy files, permitted users and devices can connect directly to the shared resource. Use either:

* The resource's Tailscale IP address.
* Its fully qualified [MagicDNS][docs-magicdns] name, such as `machine.example.ts.net`.

You must use the fully qualified MagicDNS name when you connect across tailnets. A short MagicDNS name such as `machine` is not sufficient.

There is no individual invitation or share-acceptance step.

## Declarative sharing versus link-based node sharing

Declarative node sharing is designed for ongoing sharing relationships between trusted tailnets. Administrators define access through policy, and both tailnets explicitly opt in to the relationship.

Link-based node sharing is designed for sharing an individual machine with an individual Tailscale user outside your tailnet. The administrator creates a share and the recipient accepts it.

You can continue to use both methods. Declarative sharing does not change or replace existing link-based shares.

## Limitations

* [Tailnet services][docs-tailnet-services] and [exit nodes][docs-exit-nodes] are not currently supported to be shared.
* Nodes shared using declarative node sharing do not advertise subnets from [subnet routers][docs-subnet-routers] to the other tailnet.

### Usage limitations

The following usage limits apply while declarative node sharing is in alpha:

* You can share with up to three other tailnets. Your policy's `externalTailnets` section can include up to three tailnet definitions.
* Each tailnet can have up to 500 nodes. Sharing grants between tailnets where at least one tailnet exceeds 500 nodes will be dropped.

[ar-sharing-limitations]: #limitations

[docs-grants]: /docs/reference/syntax/grants

[docs-magicdns]: /docs/features/magicdns

[docs-sharing]: /docs/features/sharing#share-using-a-link

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-services]: /docs/features/tailscale-services

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-exit-nodes]: /docs/features/exit-nodes
