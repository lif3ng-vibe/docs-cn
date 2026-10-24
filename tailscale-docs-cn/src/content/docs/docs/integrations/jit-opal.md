---
title: "JIT access with Opal"
description: "Use Tailscale and Opal for on-demand access to your Tailscale network."
---

Last validated Jan 5, 2026

[Opal][xt-opal] is a centralized authorization platform for IT and infrastructure teams to make access
management requests self-service.

On-demand access to Tailscale resources can be provisioned using Opal. This works by adding and
removing members from [SSH access rules][docs-policy-syntax-ssh]
for [tags][docs-tags] in Tailscale [access control policies][docs-access-control].

You can use Opal with [user & group provisioning][docs-user-group-provisioning] to update [SCIM-integrated][ln-what-is-scim] group membership in groups used in
Tailscale access control policies. Likewise, you can use Opal to assign a user to the Tailscale application, with the user synced through SCIM to your Tailscale network.

## Prerequisites

Before you begin this guide, you'll need a tailnet and an Opal account.

* For information about creating a tailnet, refer to the [Tailscale quickstart][docs-install].

* For information about creating an Opal account, refer to the [Opal][xt-opal] documentation.

## Integration

Refer to the full instructions in Opal's [blog post][xt-opal-tailscale] for setting up an integration with Tailscale.

To use Opal with Tailscale, you'll need to:

1. Generate a Tailscale [API access token][docs-api] from the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
2. In Opal, [add Tailscale as a new application][xt-opal-tailscale-create].
   1. Set the **App Admin** to the team that should manage the Tailscale app in Opal.
   2. Enter a **Description** of how you use Tailscale, so colleagues know what they're requesting access to. For example,
      "SSH access to the production network".
   3) Set the **Tailnet name** to be your tailnet ID. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.
   4. Set the **Tailscale API key** to the Tailscale API access token you generated.
3. Determine which Tailscale [tags][docs-tags] should be imported into Opal. This is done by the App Admin. For each
   tag that is selected, Opal will automatically parse the existing [access rules][docs-policy-syntax-acls] and
   [SSH access rules][docs-policy-syntax-ssh] that apply to that tag, and which [groups][docs-policy-syntax-groups] have access to the tagged
   sources using those rules.

Now a user can request access or SSH access to a specific tag in Tailscale, and Opal will update the [tailnet policy file][docs-policy-syntax] to allow the temporary access.

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-api]: /docs/reference/tailscale-api

[docs-install]: /docs/how-to/quickstart

[docs-tags]: /docs/features/tags

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-opal-tailscale-create]: https://app.opal.dev/apps/create/tailscale

[xt-opal-tailscale]: https://www.opal.dev/blog/tailscale

[xt-opal]: https://opal.dev
