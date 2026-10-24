---
title: "Access control"
description: "Understand the options available for access control in Tailscale."
---

Last validated May 29, 2025

Tailscale's approach to access control embodies the principles of [least privilege][ln-principle-of-least-privilege] and [zero trust security][docs-zero-trust]. By default, all connections between devices in your Tailscale network (known as a [tailnet][docs-tailnet]) are denied unless explicitly permitted through your [tailnet policy file][docs-tailnet-policy-file]. This ensures that only authorized users and devices can communicate with each other, with precise controls over what specific resources they can access.

There are two primary methods for creating access control policies: [Grants][docs-grants] and [access control lists (ACLs)][docs-acls]. Grants are the recommended method and offer more functionality. However, ACLs will always be supported. Refer to [Grants vs. ACLs][docs-grants-vs-acls].

Access control in Tailscale uses various [targets and selectors][docs-targets] to identify resources, which are also defined in the tailnet policy file. These include autogroups, custom groups, tags, IP addresses, and individual users, and let you create flexible policies that adapt to your organization's structure.

Explore the following resources for more information:

* [Tailnet policy file][docs-tailnet-policy-file]
* [Policy syntax][docs-policy-syntax]
* [Targets and selectors][docs-targets]
* [Grants vs. ACLs][docs-grants-vs-acls]

## Grants

Grants represent Tailscale's modern approach to access control, providing a unified syntax for managing permissions across both network and application layers. Each grant defines which sources can access which destinations, along with the specific capabilities they're allowed to use at both the network and application levels.

Explore the grants documentation:

* [Grants overview][docs-grants]
* [Grant syntax reference][docs-grants-syntax]
* [Application capabilities][docs-grants-app-capabilities]
* [Troubleshooting grants][docs-grants-troubleshooting]
* [Example grants][docs-grant-samples]

## Access control lists (ACLs)

> **Note:**
>
> Tailscale recommends [migrating to grants][docs-grants-migration].

Access control lists ([ACLs][docs-acls]) represent Tailscale's original approach to network layer security. The recommended approach is to use grants. However, Tailscale will always support ACLs.

Explore the ACLs documentation:

* [ACLs overview][docs-acls]
* [ACL syntax reference][docs-policy-syntax]
* [Example ACL policies][docs-acl-samples]

## Tailscale SSH

Tailscale SSH integrates with the access control system to provide secure SSH access between devices in your tailnet. Instead of managing SSH keys, Tailscale SSH leverages your tailnet's identity system to authenticate and authorize connections based on the rules defined in your tailnet policy file.

[Explore Tailscale SSH][docs-tailscale-ssh].

[docs-acl-samples]: /docs/reference/examples/acls

[docs-acls]: /docs/features/access-control/acls

[docs-grant-samples]: /docs/reference/examples/grants

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-migration]: /docs/reference/migrate-acls-grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants-troubleshooting]: /docs/reference/troubleshooting/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets]: /docs/reference/targets-and-selectors

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege
