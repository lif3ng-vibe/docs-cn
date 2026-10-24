---
title: "Automate employee onboarding and offboarding"
description: "When employees join or leave your organization, their access to network resources needs to reflect their current role and status. System for Cross-domain Identity Management (SCIM) lets you automate t"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**User & group provisioning**](/docs/features/user-group-provisioning) — Learn about the System for Cross-domain Identity Management (SCIM) identity providers that Tailscale supports.

When employees join or leave your organization, their access to network resources needs to reflect their current role and status. System for Cross-domain Identity Management (SCIM) lets you automate this by connecting Tailscale to your identity provider. If your identity provider doesn't support SCIM, you can manage access manually through the admin console.

## Automate with SCIM

[SCIM integrations][docs-user-group-provisioning] let Tailscale sync user accounts and group memberships directly from your identity provider. When you add or remove someone in your identity provider, Tailscale reflects that change automatically.

To get started, open the [User management](https://console.tailscale.com/admin/settings/user-management) page in the admin console to enable user and group provisioning. Refer to the guide for your identity provider:

* [Okta][docs-okta-scim]
* [Microsoft Entra ID][docs-entra-scim]
* [Google][docs-google-sso]

**Onboarding:** Add the employee to the appropriate groups in your identity provider. SCIM syncs the membership to Tailscale, provisioning the user and granting access.

**Offboarding:** Deactivate or delete the user in your identity provider, not through the Tailscale admin console. SCIM syncs the change, revoking access immediately.

## Manage access manually

If your identity provider doesn't support SCIM, open the [Users](https://console.tailscale.com/admin/users) page in the admin console to invite and remove users.

**Onboarding:** [Invite the team member to your tailnet][docs-how-to-invite-team-members] and assign them to the appropriate groups in your tailnet policy file so they have access to the right resources on day one.

**Offboarding:** [Suspend or delete the user][docs-how-to-remove-team-members] from the admin console. Suspending preserves their device history; deleting removes them permanently.

> **Tip:**
>
> Suspending a user before deleting gives you time to review their device access and transfer ownership of any shared resources.

[docs-entra-scim]: /docs/integrations/identity/entra/entra-id-scim

[docs-google-sso]: /docs/integrations/identity/google-sso

[docs-okta-scim]: /docs/integrations/identity/okta/okta-scim

[docs-how-to-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-how-to-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
