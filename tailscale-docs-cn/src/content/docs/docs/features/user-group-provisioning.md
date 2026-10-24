---
title: "User & group provisioning"
description: "Learn about the System for Cross-domain Identity Management (SCIM) identity providers that Tailscale supports."
---

Last validated Dec 8, 2025

> **Note:** This feature is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

Tailscale supports [System for Cross-domain Identity Management][ln-what-is-scim] (SCIM) to integrate with several identity providers, as described in the following topics:

* [User & group provisioning for Google Workspace][docs-sso-google-sync]
* [User & group provisioning for Microsoft Entra ID][docs-sso-entra-id-scim]
* [User & group provisioning for Okta][docs-sso-okta-scim]

## Impact of enabling SCIM in a tailnet that already has users

When you enable SCIM, if you already had any users from your identity provider using Tailscale, the users stay in Tailscale. You can review these users when you enable SCIM in your identity provider, such as Okta or Microsoft Entra ID, and decide what action to take for them.

## SSO and SCIM considerations

If you are *using the same app for single sign-on (SSO) and SCIM* (that is, you're not using a custom Microsoft Entra ID app), users can sign up for Tailscale only if they are allowed to by the identity provider (if they have the app assigned).

If you are using different apps for SSO and SCIM, we recommend you use
[user approval][docs-user-approval] to restrict which users are authorized to join your tailnet.

## Inviting users

* You can still [invite users][docs-invite-team-members] from other domains and identity providers. You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) to invite users.

## Syncing a user suspension

When syncing a user suspension:

* For Okta, if you deactivate a user in Okta they are suspended in Tailscale. If you suspend a user in Okta, nothing happens in Tailscale—only deactivation.
* For Microsoft Entra ID, if you delete (soft delete) the user in Microsoft Entra ID they are suspended in Tailscale.
* For Google Workspace, if you suspend a user, they are suspended in Tailscale.

## Syncing a user deletion

When syncing a user deletion:

* For Okta, you cannot sync deletions from Okta to Tailscale.

* For Microsoft Entra ID, when you delete a user, they are first soft deleted (suspended in Tailscale), then 30 days later they are hard deleted (deleted in Tailscale).

* For Google Workspace, if you delete a user, they are suspended in Tailscale. When you recreate a previously deleted user in Google Workspace, Tailscale treats them as a new user.

You can also manually delete users from your tailnet, including users created prior to enabling provisioning, synced users who have been suspended in Tailscale, and users from other domains. You cannot manually delete users who are being synced, as they will get recreated at the next sync.

## Syncing group membership

Tailscale syncs group membership from SCIM-integrated identity providers to Tailscale. You can use the same
human-readable group names you have in a SCIM-integrated identity provider to refer to groups in your
[access control policies][docs-access-control]. For example, if Alice and Bob are in the "security-team" group in a SCIM-integrated
identity provider, then the [access rule][docs-policy-syntax-acls] can refer to the "security-team" group:

```json
{
  "grants": [
    {
      "src": ["group:security-team@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ],
  "tagOwners": {
    "tag:logging": ["group:security-team@example.com"]
  }
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

When someone's role changes, instead of updating their permissions in every application you manage, you
can instead make a single change in the SCIM-integrated identity provider, to update what applications
they should have access to, and with which permissions.

> **Note:**
>
> Synced groups cannot be used to assign [user roles][docs-user-roles].

## Known Limitations

* A user suspended in a SCIM-integrated identity provider will remain logged into Tailscale, and maintain access to all of their nodes and permissions granted by access control policies. They will only lose access as their device keys expire and they are blocked from re-authenticating new sessions with the SCIM-integrated identity provider. Instead, disable the user in the SCIM-integrated identity provider to suspend them in Tailscale.
* For additional limitations, refer to the specific topics for each identity provider.

[ln-what-is-scim]: https://tailscale.com/learn/what-is-scim

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-access-control]: /docs/features/access-control/acls

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-sso-entra-id-scim]: /docs/integrations/identity/entra/entra-id-scim

[docs-sso-google-sync]: /docs/integrations/google-sync

[docs-sso-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-roles]: /docs/reference/user-roles
