---
title: "Your account is not an administrator"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

Your account is not an administrator for the `<user@example.com>` network. You can access this network using the Tailscale app, but you're not allowed to manage network settings.

## Why you're seeing this message

This error message displays when a user without permission attempts to access the Tailscale admin console. Typically, the only user type without access to the admin console is the Member role.

## What to do

Here are some things you can try to resolve this issue:

* Change the user role from Member to the necessary role they need for the tailnet. A user with the Owner, Admin, or IT admin role has the necessary permissions to change user roles.
* If you require admin console access and are unable to contact a member who does have access, contact [Tailscale Support][co-support]. You will be required to provide the text record (TXT record) for your domain as proof of domain ownership and administrative authority for the tailnet.

## Additional information

* For information about user types and access, refer to [User roles][docs-user-roles].
* For information about changing a user's role, refer to [Changing user roles][docs-changing-user-roles].

[co-support]: https://tailscale.com/support

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-messages]: /docs/reference/messages

[docs-user-roles]: /docs/reference/user-roles
