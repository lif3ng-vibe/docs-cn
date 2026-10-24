---
title: "Admin console session timeout"
description: "Explore idle session timeout in the Tailscale admin console."
---

Last validated Jan 5, 2026

> **Note:** Admin console session timeout is available for [all plans](https://tailscale.com/pricing).

By default, Tailscale [admin console](https://console.tailscale.com/admin) sessions [expire 30 days after][docs-session-expiry] the initial login. [Owners and Admins][docs-roles] can configure the session timeout to change the period of inactivity that must occur before Tailscale expires a session for members of your tailnet. This setting applies to all members of your tailnet, including [Owners and Admins][docs-roles].

> **Note:**
>
> Admin console session timeout does not affect user [node key expiry][docs-key-expiry].

## Enable session timeout

1. Open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. Select a timeout value in **Set an inactivity period** under **Admin Console Session Timeout**.

The timeout can be set to between 5 minutes and 30 days. Only Owners, Admins, and IT Admins of the tailnet can configure the timeout.

## Disable session timeout

1. Open the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. Select **Edit** under **Admin Console Session Timeout**.
3. Select **Disable**.

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-roles]: /docs/reference/user-roles#roles

[docs-session-expiry]: /docs/reference/admin-console-session-expiry
