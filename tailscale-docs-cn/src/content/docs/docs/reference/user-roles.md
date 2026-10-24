---
title: "User roles"
description: "Use roles for restricting access to the admin console."
---

Last validated Dec 4, 2025

User roles are Identity & Access Management (IAM) roles used to restrict access to the admin console.

> **Note:** User roles are available for [all plans](https://tailscale.com/pricing).

Some roles are available only for specific plans, which is noted in the role documentation.

To understand and restrict which users and devices can communicate in your tailnet, refer to [access control policies][docs-access-control].

## Managing roles

You can [add][docs-invite-team-members] or [remove][docs-remove-team-members] users and [change their roles][docs-changing-user-roles] in the  [Users](https://console.tailscale.com/admin/users) page of the admin console.

A user cannot modify their own role, except to transfer the Owner role to another user.

## User role categories

To delineate which user roles are available by [pricing plan][co-pricing], roles are categorized as Basic or Advanced.

### Basic roles

Basic roles are available for all pricing plans. The following roles are in the Basic category:

* [Owner][ar-owner]
* [Admin][ar-admin]
* [Member][ar-member]

### Advanced roles

Advanced roles are available for the Standard, Premium, and Enterprise pricing plans. The following roles are in the Advanced category:

* [Billing admin][ar-billing-admin]
* [IT admin][ar-it-admin]
* [Network admin][ar-network-admin]
* [Auditor][ar-auditor]

## Roles

### Owner

An Owner is the owner of the Tailscale account for your organization. This individual can access all information about your Tailscale account, including pricing plan and billing information.

An Owner can transfer their ownership to another user in the [Users](https://console.tailscale.com/admin/users) page of the admin console, subject to [limitations][docs-changing-user-roles-limitations-when-changing-owners]. For an Owner's account to be deleted, the Owner role must first be transferred to another user.

A Tailscale organization must have an Owner. There can only be one Owner.

If you haven't modified this, the Owner is likely the first user who installed Tailscale. You can identify the Owner by their role on the Users tab of the admin console.

> **Note:**
>
> If you don't have access to the admin console to identify the Owner, or have lost access to the Owner account, [contact us][co-contact-support] for help.

### Admin

An Admin is an administrator of the Tailscale account for your organization. They can perform any action in the [admin console](https://console.tailscale.com/admin), including inviting or removing users, modifying access control policies, approving machines, enabling or disabling features, and modifying pricing plan and billing information.

There can be multiple Admins.

### Network admin

> **Note:** This role is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

A Network admin is an administrator of the Tailscale account for your organization, who can only manage your network configuration. They can modify the tailnet policy file, and modify DNS, subnets, and other networking settings. They can read but not modify user and device information (even for their own devices), and general settings. They cannot access or change the pricing plan or billing information.

In a larger organization, use this role for the Networking team, to manage your network topology including DNS and subnets.

### IT admin

> **Note:** This role is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

An IT admin is an administrator of the Tailscale account for your organization, who can only manage users and machines. They can perform actions to remove users, or approve and remove devices, and can modify general settings, like enabling certain features. They can read but not modify network information, such as the tailnet policy file and DNS configurations. They cannot accept subnet router routes. They cannot access or change the pricing plan or billing information.

In a larger organization, use this role for the IT team, to onboard and offboard users and their devices.

> **Note:**
>
> An IT admin can grant all roles, including roles that are more powerful than IT admin. This follows the principle of separation of duties, as *two*
> individuals must work together to elevate their access.

### Billing admin

> **Note:** This role is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

A Billing admin is an administrator of the Tailscale account for your organization, who can only modify pricing plan and billing information. They can read but not modify information in the admin console, such as user and device information, network information, or general settings.

> **Note:**
>
> A Billing admin does not automatically receive [billing emails][docs-billing-information-billing-email].

In a larger organization, use this role for the finance or accounting team.

### Auditor

> **Note:** This role is available for [the Standard, Premium, and Enterprise plans](https://tailscale.com/pricing).

An Auditor is a member of the Tailscale account for your organization. They can read all configurations for your tailnet but not modify any of them.

In a larger organization, use this role for the compliance or audit team.

### Member

A Member is a user of your tailnet. They cannot access the admin console, but can connect to nodes in your tailnet as permitted by [access control policies][docs-access-control].

New users in a tailnet are Members by default.

There can be multiple Members.

> **Note:**
>
> If you are [sharing a node][docs-sharing] with another user, they are a Member for that node only, not the entire tailnet.

## Permission matrix

### Permissions managed by user roles

Permission

Owner

Admin

Network admin

IT admin

Billing admin

Auditor

Member

Can access the admin console
✅
✅
✅
✅
✅
✅
❌

Read tailnet policy file
✅
✅
✅
✅
✅
✅
❌

Write tailnet policy file
✅
✅
✅
❌
❌
❌
❌

Read network configurations
✅
✅
✅
✅
✅
✅
❌

Write network configurations, for example, enable MagicDNS, split DNS, make subnet, or allow a node to be an exit node, enable HTTPS
✅
✅
✅
❌
❌
❌
❌

Read feature configuration
✅
✅
✅
✅
✅
✅
❌

Write feature configuration, for example, enable Taildrop
✅
✅
❌
✅
❌
❌
❌

Configure user & group provisioning
✅
✅
❌
✅
❌
❌
❌

Read machines, for example, read machine names and status
✅
✅
✅
✅
✅
✅
❌

Write machines, for example, approve, rename, and remove machines
✅
✅
❌
✅
❌
❌
❌

Read users and user roles
✅
✅
✅
✅
✅
✅
❌

Write users and user roles, for example, remove users, approve users, make Admin
✅
✅
❌
✅
❌
❌
❌

Can generate auth keys
✅
✅
✅
✅
❌
❌
❌

Can generate API access tokens and OAuth clients
✅
✅
✅
✅
❌
❌
❌

Can share a node
✅
✅
❌
✅
❌
❌
❌

Can accept a shared node
✅
✅
❌
✅
❌
❌
❌

Can use any tag (without being tag owner)
✅
✅
✅
❌
❌
❌
❌

Read configuration audit logs
✅
✅
✅
✅
✅
✅
❌

Use Tailscale SSH Console, if allowed by tailnet policy file
✅
✅
✅
✅
❌
❌
❌

Write webhooks
✅
✅
✅
✅
❌
❌
❌

Write tailnet name
✅
✅
✅
❌
❌
❌
❌

Read payment plan
✅
✅
❌
❌
✅
❌
❌

Write payment plan
✅
✅
❌
❌
✅
❌
❌

Write billing information
✅
✅
❌
❌
✅
❌
❌

### Permissions managed by tailnet policy file

Permissions for communicating within a network, and for running certain commands on devices, are set by the [tailnet policy file][docs-tailnet-policy-file]:

* Access to a machine
* Ability to set a tag ([tag owner][docs-policy-syntax-tag-owners])
* Ability to self-approve a route or exit node ([auto approver][docs-policy-syntax-autoapprovers])

[ar-admin]: #admin

[ar-auditor]: #auditor

[ar-billing-admin]: #billing-admin

[ar-it-admin]: #it-admin

[ar-member]: #member

[ar-network-admin]: #network-admin

[ar-owner]: #owner

[co-contact-support]: https://tailscale.com/contact/support

[co-pricing]: https://tailscale.com/pricing

[docs-access-control]: /docs/features/access-control/acls

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-changing-user-roles-limitations-when-changing-owners]: /docs/features/sharing/how-to/change-role#limitations-when-changing-owner

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-sharing]: /docs/features/sharing

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
