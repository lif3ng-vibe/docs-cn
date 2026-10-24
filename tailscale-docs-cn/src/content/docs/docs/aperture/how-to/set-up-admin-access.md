---
title: "Set up admin access"
description: "New Aperture gateways grant admin access to everyone by default. Before your team starts using Aperture, restrict admin access to specific users so that only designated administrators can edit setting"
---

Last validated Sep 28, 2026

New Aperture gateways grant admin access to everyone by default. Before your team starts using Aperture, restrict admin access to specific users so that only designated administrators can edit settings and view data for all users.

Admins can:

* Edit the [Aperture configuration][docs-aperture-configuration] from the **Administration** pages of the Aperture admin dashboard.
* View session logs and organization-wide usage data for all users.
* Access all quota buckets and refill them through the API.
* Access the `/metrics` Prometheus endpoint (when `read_metrics` is granted).

Authenticated tailnet users can use the chat portal by default and view their personal sessions, usage, and quotas at `/sessions`, `/usage`, and `/quotas`. They cannot open the admin dashboard or view organization-wide data. A matching grant can opt a non-admin user out of the portal with `enable_portal: false`, while an explicit `enable_portal: true` wins over a broader opt-out. Admins always retain portal access.

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-get-started] with at least one configured provider.
* Access to the Aperture admin dashboard at `/admin/`.
* Your Tailscale login name (for example, `alice@example.com`).

## Restrict admin access

The [default configuration][docs-default-config] grants everyone the admin role using `"src": ["*"]`. Replace this with explicit admin grants for specific users.

> **Warning:**
>
> Do not remove the wildcard admin grant until you have added an explicit admin grant for yourself. Aperture prevents saves through the admin dashboard and configuration APIs that would remove the saving user's admin access.

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. Find the grant with `{ "role": "admin" }` and `"src": ["*"]`.
3. Replace `"*"` with the Tailscale login names of your administrators.

The following example grants admin access to two specific users:

```json
{
  "grants": [
    {
      "src": ["alice@example.com", "bob@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" }
        ]
      }
    },
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" }
        ]
      }
    }
  ]
}
```

This configuration gives `alice@example.com` and `bob@example.com` admin access, while all other users get standard user access. Admin access takes precedence when a user matches both grants, so Alice and Bob receive admin-level permissions.

### Use Tailscale groups

For organizations that manage access through Tailscale groups, you can assign admin roles using groups in the Aperture configuration. This approach lets you manage admin membership centrally through your Tailscale group definitions. Group matching requires [visible groups][docs-visible-groups] enabled for the Aperture gateway.

```json
{
  "grants": [
    {
      "src": ["group:aperture-admins"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" }
        ]
      }
    },
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" }
        ]
      }
    }
  ]
}
```

If multiple grants match a user, the admin role takes precedence. Refer to the [grants configuration reference][docs-aperture-grants] for the full syntax.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Verify admin access

After restricting admin access, verify the configuration is correct:

1. Open `/admin/settings/config`, the **Administration** > **Configuration** page. If you can view and edit the configuration, your admin access is working.
2. Sign in as a non-admin user and confirm that opening `/admin/` redirects to `/chat` when portal access is enabled. If a matching grant sets `enable_portal: false` and no matching grant explicitly sets `enable_portal: true`, the request returns an access-denied page instead.

## Next steps

* [Grant access to models][docs-grant-model-access] to define which models each user or group can use.
* [Set up the chat UI][docs-set-up-chat-ui] to let users talk to models directly from their browser.
* [Set per-user spending limits][docs-set-per-user-spending-limits] to manage costs.
* Refer to the [Aperture admin dashboard reference][docs-web-dashboard] for details on each admin-accessible page.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-default-config]: /docs/aperture/configuration#default-configuration

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-visible-groups]: /docs/aperture/visible-groups

[docs-web-dashboard]: /docs/aperture/reference/dashboard-admin
