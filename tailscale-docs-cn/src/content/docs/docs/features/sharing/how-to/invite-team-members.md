---
title: "Invite team members to your tailnet"
description: "If your Tailscale network (tailnet) uses a custom domain, you can send a team invite to one or more email addresses simultaneously."
---

Last validated Jan 5, 2026

If your Tailscale network (tailnet) uses a custom domain, you can send a team invite to one or more email addresses simultaneously.

Your Tailscale billing includes invited users who join and transfer data in your tailnet. This includes invited users who are paid users in other tailnets. Tailscale bills for every user on every tailnet.

> **Note:** Team invites are available for [all plans](https://tailscale.com/pricing).

> **Note:**
>
> A Tailscale user account may not be shared or used by multiple individuals.

> **Note:**
>
> Unused invites expire 90 days after the last welcome invite was sent.

## Prerequisites

* You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) to send invites.
* Your tailnet must use a custom domain. If your tailnet uses shared domains (such as `example@gmail.com`) you can [send invites using a URL link][docs-invite-any-user] instead.
* Your custom domain must use one of the following identity providers:
  * A [supported identity provider][docs-sso-providers].
  * A [custom OIDC provider][docs-custom-provider].

## Send a team invite

1. Open the [Users](https://console.tailscale.com/admin/users) page of the admin console.

2. Select **Send welcome email**.

3. Add the email address for each user that you want to add to the tailnet. Any email address in an invite must match the custom domain name for your tailnet.

   *（图：Invite team popup window.）*

   Multiple email addresses must be comma-separated with an optional space after each comma. The acceptable formats are:

   `user1@example.com,user2@example.com,user3@example.com`

   `user1@example.com, user2@example.com, user3@example.com`

4. Select the [user role][docs-roles] you want to automatically assign for each user in the invite. Only one role can be assigned for all email addresses in a single invite.

   *（图：Invite team popup window with roles.）*

5. Select **Send emails**.

## Accept a team invite

Users will receive an email inviting them to join your organization's tailnet by [downloading the Tailscale client][co-download] and signing in with an identity provider or a [passkey][docs-passkey].

## Approve a team invite

If your tailnet has [user approval][docs-user-approval] enabled, you must approve invited users before they can join the tailnet.

## Review team invites

To review all current invites, use the [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) filter.

## Resend a team invite

To resend an invite:

1. Open the [Users](https://console.tailscale.com/admin/users) page of the admin console.
2. Locate the invited user by typing their email address in the search bar or using the [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) filter.
3. Select the  menu next to the user's name, then select **Resend user invite**.

   *（图：The user options for invited users.）*

## Delete a team invite

You can delete invites if you accidentally share a user invite or want to revoke it for another reason.

To delete an invite:

1. Open the [Users](https://console.tailscale.com/admin/users) page of the admin console.
2. Locate the invited user by either typing their email address in the search bar or using the [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) filter.
3. Select the  menu next to the user's name, then select **Delete user invite**.

   *（图：The user options for invited users.）*

## Monitor team invites

You can track user invite activity in the [Configuration logs](https://console.tailscale.com/admin/logs) page of the admin console.

## Limitations

* You can only invite users in the same domain.
* GitHub user accounts don't have email addresses, so you cannot send an invite to GitHub accounts.
* A single team invite can only grant the invited users one role.

[co-download]: https://tailscale.com/download

[docs-custom-provider]: /docs/integrations/identity/custom-oidc

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-passkey]: /docs/integrations/identity/passkeys

[docs-roles]: /docs/reference/user-roles

[docs-sso-providers]: /docs/integrations/identity

[docs-user-approval]: /docs/features/access-control/user-approval
