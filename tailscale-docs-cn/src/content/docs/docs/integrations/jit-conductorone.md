---
title: "JIT access with ConductorOne"
description: "Use Tailscale and ConductorOne for on-demand access to your Tailscale network."
---

Last validated Jan 5, 2026

[ConductorOne][xt-conductorone] is a security platform that lets you manage access requests for your Tailscale entitlements.

On-demand access to Tailscale resources can be provisioned using ConductorOne. This works by adding and removing members from [groups][docs-policy-syntax-groups], [access rules][docs-policy-syntax-acls], and [SSH access rules][docs-policy-syntax-ssh] defined in Tailscale [access control policies][docs-access-control].

You can use ConductorOne with [user & group provisioning][docs-user-group-provisioning] to update [SCIM-integrated][ln-what-is-scim] group membership in groups used in
Tailscale access control policies. Likewise, you can use ConductorOne to assign a user to the Tailscale application, with the user synced through SCIM to your Tailscale network.

You can connect multiple tailnets to ConductorOne simultaneously.

## Prerequisites

Before you begin this guide, you'll need a tailnet and a ConductorOne account.

* For information about creating a tailnet, refer to the [Tailscale quickstart][docs-install].

* For information about creating a ConductorOne account, refer to [ConductorOne][xt-conductorone].

## Integration

Review the full instructions in ConductorOne's [blog post][xt-conductorone-least-privilege] for setting up an integration with Tailscale.

To use ConductorOne with Tailscale, you'll need to:

1. Generate a Tailscale [API access token][docs-api] from the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
2. In ConductorOne, select the **Tailscale** integration and then select **Add Connector**.
   1. Choose the option to **Create a new app**.
   2. Set the **Tailscale API key** to the Tailscale API access token you generated.
   3) Set **Tailnet** to your tailnet ID. You can find your tailnet ID in the [General](https://console.tailscale.com/admin/settings/general) page of the admin console.

ConductorOne will automatically identify all the users in the tailnet and parse existing [access rules][docs-policy-syntax-acls] in Tailscale
access control policies, including [SSH access rules][docs-policy-syntax-ssh], as entitlements in ConductorOne. The application owner in ConductorOne can specify for each
entitlement, such as group membership or another SSH access rule, whether to restrict access by time, and whether to
use the default application grant policy.

Now a user can request access to a specific Tailscale entitlement through the **Request access** page of ConductorOne and through Slack. ConductorOne will update the [tailnet policy file][docs-tailnet-policy-file] to allow the temporary access.

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-api]: /docs/reference/tailscale-api

[docs-install]: /docs/how-to/quickstart

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[xt-conductorone-least-privilege]: https://www.conductorone.com/blog/implementing-least-privilege-access-tailscale-conductorone

[xt-conductorone]: https://www.conductorone.com
