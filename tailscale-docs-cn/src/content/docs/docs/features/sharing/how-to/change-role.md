---
title: "Changing user roles"
description: "You can change the [roles][docs-user-roles] users in your network have to restrict access to the admin console. (To restrict which users and devices can communicate in your tailnet, refer to [access c"
---

Last validated Jan 5, 2026

You can change the [roles][docs-user-roles] users in your network have to restrict access to the admin console. (To restrict which users and devices can communicate in your tailnet, refer to [access control policies][docs-access-control].)

To remove or suspend users, refer to [Removing and suspending users][docs-remove-team-members].

## Change a user's role

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to change a user's role.

You can change a user's role from the [admin console](https://console.tailscale.com/admin):

1. Open the [Users](https://console.tailscale.com/admin/users) page of the admin console.
2. Find the row corresponding to the user you are interested in.
3. Select the  menu at the far right, then select the **Edit role** option.
4. Select the role you want the user to have, then select **Save**:

   *（图：Select a role for the user.）*

> **Note:**
>
> A user cannot change their own role.

## Change Owner

You need to be the [Owner](/docs/reference/user-roles) of a tailnet to change the Owner.

You can change a user's role from the [admin console](https://console.tailscale.com/admin):

1. Open the [Users](https://console.tailscale.com/admin/users) page of the admin console.
2. Find the row corresponding to the user you are interested in.
3. Select the  menu at the far right, then select the **Edit role** option.
4. Select **Owner**, then select **Save**.

   *（图：Reassign the Owner role to a user.）*

### Limitations when changing Owner

* If your tailnet uses a shared domain name (such as `gmail.com`), you cannot change ownership of the tailnet.
* If your tailnet uses a custom domain name, you can change the owner only to a user on that same domain.

[docs-access-control]: /docs/features/access-control

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-roles]: /docs/reference/user-roles
