---
title: "Offboarding users"
description: "User offboarding occurs when you want to delete, suspend, or deactivate users in your environment. While the steps for [deleting or suspending users][docs-remove-team-members] in Tailscale is always t"
---

Last validated Jan 5, 2026

User offboarding occurs when you want to delete, suspend, or deactivate users in your environment. While the steps for [deleting or suspending users][docs-remove-team-members] in Tailscale is always the same, the specific actions you need to take will depend whether or not you use System for Cross-domain Identity Management (SCIM). For non-SCIM setups, you must manually suspend users in Tailscale. When using SCIM, users are automatically suspended in Tailscale.

## Offboarding for non-SCIM environments

The following guidelines explain offboarding users when using an identity provider without user & group provisioning (that is, without SCIM).

1. Disable or suspend the user in your environment, such as Google.

2. [Suspend the user][docs-remove-team-members-suspending-users] in Tailscale. This lets you [manage resources][docs-remove-team-members-resources] before deleting a user.

   * The user will not be able to connect to the tailnet, add devices, or access the admin console. Their API keys and auth keys will also stop working. For more information about user resources for suspended or deleted users, refer to [Managing user resources][docs-remove-team-members-resources].
   * The user suspension can be verified in the [Users](https://console.tailscale.com/admin/users) page of the Tailscale admin console.
   * Suspending a user can be ideal if they are temporarily away and you'll want to re-activate them at a later date.

3. Re-assign necessary devices to other users, and verify that API keys and auth keys that you need to retain still work. At this point, you can restore the suspended user in Tailscale if necessary.

4. [Delete the user][docs-remove-team-members-deleting-users].

## Offboarding when using user & group provisioning (SCIM)

The following guidelines explain offboarding users with [user & group provisioning][docs-user-group-provisioning], which uses SCIM.

1. If using Okta, deactivate the user in Okta. If using Microsoft Entra ID, delete the user in Microsoft Entra ID.

   This will automatically [suspend the user][docs-remove-team-members-suspending-users] in Tailscale.

   * The user will not be able to connect to the tailnet, add devices, or access the admin console. Their API keys and auth keys will also stop working. For more information about user resources for suspended or deleted users, refer to [Managing user resources][docs-remove-team-members-resources].
   * The user suspension can be verified in the [Users](https://console.tailscale.com/admin/users) page of the Tailscale admin console.
   * Suspending a user can be ideal if they are temporarily away and you'll want to re-activate them at a later date.

2. Re-assign necessary devices to other users, and verify that API keys and auth keys that you need to retain still work. At this point, you can restore the suspended user in Tailscale if necessary.

We recommend you use SCIM to automatically deprovision users as part of offboarding. You can also optionally [delete][docs-remove-team-members-deleting-users] the suspended users from the tailnet. There is no need to delete those users for security reasons, as they cannot log in. There is no reason to delete those users for billing reasons, as you are not charged for inactive users.

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-resources]: /docs/features/sharing/how-to/remove-team-members#managing-user-resources

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
