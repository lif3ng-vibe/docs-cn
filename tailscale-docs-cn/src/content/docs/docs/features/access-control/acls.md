---
title: "Manage permissions using ACLs"
description: "Tailscale's [access control][docs-access-control] methodology follows the [least privilege][ln-least-privilege] and [zero trust][docs-zero-trust] principles. There are two ways to define access contro"
---

Last validated Jan 5, 2026

\[Missing snippet: acls\_legacy\_note.mdx]

> **Note:**
>
> ACLs are available on all plans, but certain functionality might be restricted on some plans.

Tailscale's [access control][docs-access-control] methodology follows the [least privilege][ln-least-privilege] and [zero trust][docs-zero-trust] principles. There are two ways to define access controls for your tailnet: access control lists (ACLs) and grants. Both methods follow a deny-by-default principle and are defined in the [tailnet policy file][docs-tailnet-policy-file] using a [declarative huJSON syntax][docs-policy-syntax].

> **Note:**
>
> The following related video provides additional context and examples.

[Tailscale ACLs Explained (video)](https://www.youtube.com/watch?v=Jn8_Sh4r8d4)

ACLs represent the traditional [network layer][xt-wiki-network-layer] approach to managing access within your tailnet, where you define [a set of devices or users][docs-targets] who can access ports on other devices. Each ACL you create must define a source and a destination. They let you precisely define access controls for users and devices on your Tailscale network (known as a tailnet).

```json
{
  "acls": [
    {
      "action": "accept",
      "src": [ <list-of-sources> ], // These sources (devices or users)
      "dst": [ <destination>:<port> ], // can access these destination devices on their defined ports
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

When you first create your tailnet, the [default tailnet policy file][docs-acl-samples-allow-all] enables communication between all devices within the tailnet. You can modify your policy file (including [editing ACLs][ar-edit-acls]) to fit your needs.

ACLs are deny-by-default, directional, locally enforced, and don't affect local network traffic.

* **Deny-by-default**. Using a default deny policy prevents communication between devices without explicit access to each other. However, in the absence of an `acls` section in the tailnet policy file, Tailscale applies the [default allow all policy][docs-acl-samples-allow-all].
* **Directional**. Allowing a source to connect to a destination doesn't mean the destination can connect to the source (unless a policy explicitly enables it).
* **Locally enforced**. A device enforces incoming connections based on the access rules distributed to all devices in your tailnet. Rule enforcement happens on each device directly, without further involvement from Tailscale's coordination server.
* ACLs do not affect what a device can or cannot access on its local network.

For more information about Tailscale's approach to access control, refer to [RBAC like it was meant to be][bl-rbac-meant-to-be].

> **Warning:**
>
> If you don't define any access control policies, Tailscale applies the [default allow all ACL policy][docs-acl-samples-allow-all]. To deny all traffic, use an [empty object for the `acls` section][docs-acl-samples-deny-all] in your tailnet policy file.

## Edit ACLs

You can edit your tailnet's access rules by using the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console, [GitOps for Tailscale ACLs][docs-gitops-acls], or the [Tailscale API][docs-api]. Refer to [Editing ACLs][docs-edit-policies] for more information.

Refer to [tailnet policy file syntax][docs-policy-syntax] to create access control policies or the [sample ACLs][docs-acl-samples] for examples of common policies.

## Availability by plan

ACLs are available on all plans, but certain functionality might be restricted on some plans.

Availability

On all plans

On the Premium and Enterprise plans

Access rules for...

Any
Tailscale IP
Subnet CIDR Range
Autogroups
Groups
Users
Tags
Hosts
IP sets

Access rules specifying...

Ports
Protocols

ACL sections for...

acl

groups

hosts

tests

tagOwners

autoApprovers

nodeAttrs

postures with default device posture attributes only

ipsets

acl

groups

hosts

tests

tagOwners

autoApprovers

postures with default, custom, and third-party attributes

ipsets

[ar-edit-acls]: #edit-acls

[bl-rbac-meant-to-be]: https://tailscale.com/blog/rbac-like-it-was-meant-to-be

[docs-access-control]: /docs/features/access-control

[docs-edit-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-acl-samples]: /docs/reference/examples/acls

[docs-acl-samples-allow-all]: /docs/reference/examples/acls#allow-all-default-acl

[docs-acl-samples-deny-all]: /docs/reference/examples/acls#deny-all

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-gitops-acls]: /docs/gitops

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-wiki-network-layer]: https://en.wikipedia.org/wiki/Network_layer
