---
title: "User & group provisioning for Microsoft Entra ID"
description: "Tailscale supports System for Cross-domain Identity Management (SCIM) to integrate with Microsoft Entra ID (previously known as Azure AD)."
---

Last validated Jul 6, 2026

> **Note:** This feature is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

Tailscale supports System for Cross-domain Identity Management (SCIM) to integrate with Microsoft Entra ID (previously known as Azure AD).

* With group sync, you can refer to a group from Microsoft Entra ID in your tailnet policy file, with a human-readable name.
  * You can also refer to a group from Microsoft Entra ID in your tailnet policy file using the `externalGroupId`.

* With user sync, you can quickly onboard and offboard users to Tailscale. For related information, refer to [Offboarding when using user & group provisioning][docs-offboarding-users-offboarding-scim].
  * When a user is deleted in Microsoft Entra ID, [they are first 'soft' deleted][xt-entra-incremental-cycles], which [suspends][docs-remove-team-members-suspending-users] the user in Tailscale. The user is then 'hard' deleted approximately 30 days later in Microsoft Entra ID, which causes them to be [deleted][docs-remove-team-members-deleting-users] in Tailscale.
  * When a user is disabled in Microsoft Entra ID, they are suspended in Tailscale.

This topic shows you how to set up Microsoft Entra ID as a SCIM-integrated identity provider for Tailscale. You can also refer to the
Microsoft tutorial [Configure Tailscale for automatic user provisioning][xt-entra-tailscale-provisioning].

## Features

The following provisioning features are supported:

* **Create users** in Tailscale from Microsoft Entra ID
* **Update user attributes** in Tailscale from Microsoft Entra ID
* **Delete users** in Microsoft Entra ID to first suspend them in Tailscale; after approximately 30 days they are automatically deleted in Tailscale
* **Disable users** in Microsoft Entra ID to suspend them in Tailscale
* **Group push** from Microsoft Entra ID to Tailscale

## Requirements

* You need a Microsoft Entra ID subscription.
* You need a tailnet.
* Your tailnet's identity provider needs to be Microsoft Entra ID. If your tailnet is not
  using Microsoft Entra ID and you want to use it, [contact support][co-contact-support-sso] to
  migrate from your current identity provider to Microsoft Entra ID.

## Step-by-Step Configuration Instructions

### Enable Provisioning

#### In Tailscale

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) in Tailscale to complete these
steps.

**Generate a SCIM API key**

1. In the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console, under **SCIM Provisioning**, select **Enable Provisioning**.

2. Copy the generated key to the clipboard.

   *（图：Generate SCIM API key）*

3. Save the key information in a secure spot. You will need to use it when you configure Microsoft Entra ID. Note that Tailscale-generated SCIM API keys are case-sensitive.

#### In Microsoft Entra ID

You need to have an admin role for the Microsoft Azure portal to complete these steps.

1. Log in to the [Microsoft Azure portal][xt-azure-login].

2. Select **Microsoft Entra ID**.

3. Under **Manage** in the left-hand navigation, select **Enterprise applications**.

4. Select **New application**.

5. In the **Browse Microsoft Entra Gallery** page, search for **Tailscale** and then select **Tailscale**.

6. Select **Sign up for Tailscale**.

   You will be redirected to sign up for Tailscale. If you already have a Tailscale account, proceed
   to the next step. Otherwise, follow the prompts to sign up for Tailscale.

7. In the application **Overview** page, under **Manage** in the left-hand navigation, select **Provisioning**.

8. Select **Get started**.

9. Set **Provisioning Mode** to **Automatic**.

10. Under **Admin Credentials**, for **Tenant URL**, enter
    `https://controlplane.tailscale.com/scim/v2/?aadOptscim062020`.

    Note that the trailing parameter, `?aadOptscim062020`, is required. For
    information about this parameter, refer to the Microsoft Entra ID topic
    [Flags to alter the SCIM behavior][xt-entra-add-scim-flags].

11. For **Secret Token**, enter the SCIM API key that you generated in the Tailscale admin console.

    *（图：Provide credentials to Microsoft Entra ID）*

12. Select **Test Connection**.

    A popup will display a message about whether the supplied credentials
    are authorized to enable provisioning.

13. In the **Settings** section, ensure **Send an email notification when
    an error occurs** is checked, and provide an email to use for the
    notification.

14. In the **Settings** section, under **Scope**, choose to sync all users and groups, or only users and groups that are assigned the application. If you choose to only sync users and groups that are assigned the application, you will need to [assign these][xt-entra-assign-access] under the **Users and groups** section in the left-hand navigation.

15. Ensure that **Provisioning Status** is set to **On**.

    *（图：Provision Microsoft Entra ID）*

16. Select **Save**.

17. Return to the application's **Provisioning** page. In the top menu, select **Start Provisioning**.

If you encounter issues after provisioning, open the application's **Overview** page and then select
**Restart Provisioning**.

#### Restricting access to the Tailscale application

By default all users in the Entra directory service will be allowed to access the Tailscale app.
To control which users are allowed to access Tailscale, go to **Enterprise Applications** >
**Tailscale** > **Properties** and set **Assignment Required?** to Yes.

*（图：Assignment Required?）*

When this setting is enabled, only users who are assigned to the Tailscale application will be
able to access it.

#### Supported attribute mappings

Tailscale supports SCIM attributes from the core ["User"][xt-rfc-7643-4.1] and ["Group" SCIM resources][xt-rfc-7643-4.2]. Tailscale only uses the following attributes for Tailscale's functionality; other attributes are stored without being used:

| Attribute           | SCIM attribute type | Use in Tailscale |
| ------------------- | ------------------- | ---------------- |
| `externalId`        | Common              | Required         |
| `userName`          | Core user           | Required         |
| `emails`            | Core user           | Optional         |
| `name.givenName`    | Core user           | Optional         |
| `name.familyName`   | Core user           | Optional         |
| `name.formatted`    | Core user           | Optional         |
| `displayName`       | Core user           | Optional         |
| `active`            | Core user           | Optional         |
| `preferredLanguage` | Core user           | Optional         |

`userName` must map to the email used by the user to sign in to the tailnet.

`photos` are not an attribute that can be synced, but are populated for users on login.

Tailscale does not support the SCIM [Enterprise User Schema Extension][xt-rfc-7643-4.3]. If any additional user attribute from these extensions is specified, the request will fail.

### Referring to Microsoft Entra ID groups in your tailnet policy file

You can refer to a group from Microsoft Entra ID in your tailnet policy file using either the human-readable name or the Microsoft Entra ID group ID. For example:

```json
{
  "grants": [
    {
      "src": ["group:groupname@example.com"],
      "dst": ["*"],
      "ip": ["*"]
    },
    {
      "src": ["group:all employees@example.com"],
      "dst": ["autogroup:self"],
      "ip": ["*"]
    },
    {
      "src": ["group:3ac067a2-f424-87b0-14a3-926482d83980@example.com"],
      "dst": ["tag:logging"],
      "ip": ["*"]
    }
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

When a Microsoft Entra ID group contains [nested groups][xt-entra-nested-groups], Tailscale includes members from those nested groups up to 5 subgroup levels deep when the group is used in access controls. Members beyond 5 levels of nesting are not included.

#### Updating Microsoft Entra ID Group Names

If you are using the group name (not the group ID) in your tailnet policy file, and you change the name of your group in Microsoft Entra ID, the Tailscale access rules for that group will no longer apply. Tailscale will fail closed, and you will receive an error message in the
admin console.

If you modified the name of the group, update the group in the tailnet policy file to the new group name. You can also revert the
name change in Microsoft Entra ID if this was unintentional.

If you are using the group ID in your tailnet policy file, renaming the group will not affect the Tailscale access rules for that group.

### Disable Provisioning

You need to have an admin role for the Microsoft Azure portal to complete these steps.

#### In Microsoft Entra ID

1. Log in to the [Microsoft Azure portal][xt-azure-login].
2. Select **Microsoft Entra ID**.
3. Under **Manage** in the left-hand navigation, select **Enterprise applications**.
4. Search for the **Tailscale** application and select it.
5. Under **Manage**, select **Properties**.
6. Select **Delete** and then select **Yes**.

#### In Tailscale

1. In the [User management](https://console.tailscale.com/admin/settings/user-management) page of the admin console, under **SCIM Provisioning**, select **Disable provisioning**, and then select **Disable provisioning** to confirm.

2. In the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console, update your rules to no
   longer reference any group which is no longer pushed.

3. If you no longer want to keep the SCIM API key that you used for Microsoft Entra ID, [revoke the key][docs-auth-keys-revoke].

### Known Limitations

* Microsoft Entra ID syncs with Tailscale every 40 minutes. This is a [limitation from Microsoft Entra ID][xt-entra-sync-time] and you cannot change this interval. To force the sync of a user, for example, as part of offboarding, use Microsoft Entra ID [on-demand provisioning][xt-entra-on-demand]. This should sync the user in less than 30 seconds.
* Microsoft Entra ID takes approximately 30 days from 'soft' deletion to 'hard' deletion of a user. You cannot change this interval.
* Microsoft Entra ID [doesn't automatically restore the dynamic membership group][xt-entra-deprovisioning] entries when a user goes from 'soft' deleted to active. If this causes issues, you can **Restart provisioning** from Entra ID's app provisioning page to force a refresh.
* Tailscale does not support the SCIM [Enterprise User Schema Extension][xt-rfc-7643-4.3]. If any additional user attribute from these extensions is specified, the request will fail.
* Tailscale groups are parsed lowercased in the tailnet policy file, so any casing in Microsoft Entra ID is ignored.
* Groups from Microsoft Entra ID cannot contain the `@` symbol.
* If you are referring to the group name in your tailnet policy file, and the name of your group changes, the access control policy for that group will no longer apply and Tailscale will fail closed. If instead, you use the group ID in your tailnet policy file, renaming the group will not affect the Tailscale access rules for that group.
* Groups unlinked in Microsoft Entra ID that are retained in Tailscale are not synced to Tailscale.
* You cannot use group sync to assign Tailscale admins or other [user roles][docs-user-roles].

[co-contact-support-sso]: https://tailscale.com/contact/support/?type=sso

[docs-auth-keys-revoke]: /docs/features/access-control/auth-keys#revoke-an-auth-key

[docs-offboarding-users-offboarding-scim]: /docs/features/sharing/how-to/offboard#offboarding-when-using-user--group-provisioning-scim

[docs-remove-team-members-deleting-users]: /docs/features/sharing/how-to/remove-team-members#deleting-users

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-user-roles]: /docs/reference/user-roles

[xt-azure-login]: https://portal.azure.com

[xt-entra-add-scim-flags]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/application-provisioning-config-problem-scim-compatibility#flags-to-alter-the-scim-behavior

[xt-entra-assign-access]: https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/assign-user-or-group-access-portal?pivots=portal

[xt-entra-deprovisioning]: https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works#deprovisioning

[xt-entra-incremental-cycles]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/how-provisioning-works#incremental-cycles

[xt-entra-nested-groups]: https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-groups#add-a-group-to-another-group

[xt-entra-on-demand]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/provision-on-demand

[xt-entra-sync-time]: https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/application-provisioning-when-will-provisioning-finish-specific-user#how-long-will-it-take-to-provision-users

[xt-entra-tailscale-provisioning]: https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/tailscale-provisioning-tutorial

[xt-rfc-7643-4.1]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.1

[xt-rfc-7643-4.2]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.2

[xt-rfc-7643-4.3]: https://www.rfc-editor.org/rfc/rfc7643.html#section-4.3
