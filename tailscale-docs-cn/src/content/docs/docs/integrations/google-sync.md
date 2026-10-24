---
title: "User & group provisioning for Google Workspace"
description: "Sync users and groups from Google Workspace to use in Tailscale access controls."
---

Last validated Jul 6, 2026

> **Note:** This feature is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

> **Note:**
>
> Tailscale's use and transfer of information received from Google APIs to any other app will adhere to [Google API Services User Data Policy][xt-google-api-scopes] including the Limited Use requirements.

Tailscale supports synchronizing Google Workspace users and groups for use in Tailscale [access controls][docs-access-control].

* With group sync, you can refer to a group from Google in your [tailnet policy file][docs-tailnet-policy-file], with a human-readable name.
* With user sync, you can onboard and offboard users to Tailscale. For related information, refer to [Offboarding when using user & group provisioning][docs-offboarding-users-offboarding-scim].

## Prerequisites

* You need a Google Workspace account.
* You need a Tailscale network (known as a tailnet).
* Your tailnet's identity provider needs to be Google.

## Set up Google User & Group sync

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these steps.

1. Open the Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) page.
2. In the **Google Sync** section, select **Enable**.
3. In the authorization page that opens, select **Authorize with Google**.
4. In the **Choose an account** page, select your Google Workspace super user account.
5. In the **Sign in** page, select **Continue**.
6. When prompted to allow access to your tailnet, select **Allow**.

When you enable Google Sync for the very first time, no users or groups will be added unless you specify
groups explicitly or select the **Sync all users** option.

## Sync all users

By default, Google Sync only adds users from groups you selected. This includes users who are members of nested groups under a selected group. To mirror all of your Google Workspace users, enable the **Sync all users** option, which immediately starts provisioning users to your tailnet.

When **Sync all users** is not enabled, users will be suspended if they are removed from all synced groups. If this is not the desired behavior, enable **Sync all users** or create an additional Google group that includes all the users to sync. For example, you may have a synced group named `all-tailscale-users` that contains all users that should have Tailscale access, and then use other groups to manage access control.

## Manage groups

By default, a group and its members do not sync into your tailnet unless you explicitly select it. If a selected group contains nested Google Groups, Tailscale syncs the users from those nested groups for the selected group.

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these steps.

1. Open the Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. In the **Google Sync** section, select the  menu and then select **Manage groups**.

> **Note:**
>
> If a group is renamed in Google Admin Console, the reference does not rename. You will always use the group email to reference the group in your Tailscale access control policies.

## Unsync unassigned users

After adding groups and their members to your tailnet, if you want to remove the users whom you previously added using the **Sync all users** option who are not part of the groups you added, you can use the option **Unsync unassigned users**.

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these steps.

1. Open the Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. In the **Google Sync** section, select the  menu and then select **Unsync unassigned users**.

## Force a sync

Changes to group membership and users within the Google Admin Console are synced to Tailscale every 40 minutes. You can also force a sync to Tailscale.

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these steps.

1. Open the Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. In the **Google Sync** section, select the  menu and then select **Force sync**.

## Use groups in your tailnet policy file

You can refer to a group from Google Workspace in your [tailnet policy file][docs-tailnet-policy-file] file, with a human-readable name. For example:

```json
{
  "grants": [
    {
      "src": ["group:admins@example.com"],
      "dst": ["*"],
      "ip": ["*"]
    },
    {
      "src": ["group:employees@example.com"],
      "dst": ["autogroup:self"],
      "ip": ["*"]
    },
    {
      "src": ["group:engineering@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

Groups synced from Google Workspace do not replace [groups][docs-policy-syntax-groups] in Tailscale. You can use Google Workspace group sync and also define groups in the tailnet policy file.

## Disable Google User & Group sync

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these steps.

1. Open the Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console.
2. In the **Google Sync** section, select the  menu and then select **Disable**.
3. Follow the prompts to confirm and disable Google User & Group sync.

## Limitations

* The maximum number of groups that can be synced is 100.
* After a new group is created in Google Workspace, a Tailscale [Owner, Admin, or IT admin][docs-user-roles] must open the [Google Group Sync](https://console.tailscale.com/admin/settings/user-management) page and select the group to allow syncing of the group.
* Users that do not share the same domain as the tailnet's domain are skipped.
* Google-synced groups don't work with [Mullvad exit node][docs-mullvad-exit-nodes] access control policies.

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-offboarding-users-offboarding-scim]: /docs/features/sharing/how-to/offboard#offboarding-when-using-user--group-provisioning-scim

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-policy-file

[docs-user-roles]: /docs/reference/user-roles

[xt-google-api-scopes]: https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes
