---
title: "Targets and selectors"
description: "Understand Tailscale targets, the identifiers you use to identify users, devices, or subnets in the tailnet policy file."
---

Last validated Jan 5, 2026

A target (or selector) is an identifier you use to identify users, devices, or subnets in the [tailnet policy file][docs-tailnet-policy-file]. In most cases, you'll use targets to select the source or destination of an [access control][docs-access-control] policy. Targets can select one or many devices, users, or [network segments][docs-subnets]. For example, `tag:sql-server` is a target you can use to select all devices [tagged][docs-tags] with `sql-server`, and `192.0.2.23` is a target that only selects the device using the IP address `192.0.2.23`.

Use the page as a reference for the various [types of targets][ar-types], when you can use them, and their [restrictions][ar-restrictions].

## Types

There are three primary types of targets: [autogroups][ar-autogroups], [explicit selectors][ar-explicit-selectors], and [custom selectors][ar-custom-targets].

### Autogroups

An [autogroup][docs-autogroups] is a type of built-in target that automatically groups devices, users, or IP addresses based on specific criteria. They let you select dynamic sets of users, devices, or routes that might be challenging or even impossible to select by other means. For example, `autogroup:member` is an autogroup that includes all members of your tailnet.

| **Autogroup**                                    | **Description**                                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`autogroup:danger-all`][ar-autogroupdanger-all] | Includes all devices, even those outside your tailnet. Use this target with caution—it could expose your tailnet to security risks or unexpected behavior. |
| [`autogroup:internet`][ar-autogroupinternet]     | Includes all public IP addresses.                                                                                                                          |
| [`autogroup:self`][ar-autogroupself]             | Includes all devices owned by the same user. This is a special autogroup that you can use to allow devices owned by the same user to access one another.   |
| [`autogroup:shared`][ar-autogroupshared]         | Includes all devices that belong to users who have accepted a [sharing][docs-sharing] invitation to your tailnet.                                          |
| [`autogroup:tagged`][ar-autogrouptagged]         | Includes all devices that have at least one tag.                                                                                                           |
| [`autogroup:member`][ar-autogrouprole]           | Includes all members of the tailnet.                                                                                                                       |
| [`autogroup:owner`][ar-autogrouprole]            | Includes all members in the tailnet with the Owner role.                                                                                                   |
| [`autogroup:admin`][ar-autogrouprole]            | Includes all members in the tailnet with the Admin role.                                                                                                   |
| [`autogroup:it-admin`][ar-autogrouprole]         | Includes all members in the tailnet with the IT admin role.                                                                                                |
| [`autogroup:billing-admin`][ar-autogrouprole]    | Includes all members in the tailnet with the Billing admin role.                                                                                           |
| [`autogroup:network-admin`][ar-autogrouprole]    | Includes all members in the tailnet with the Network admin role.                                                                                           |
| [`autogroup:auditor`][ar-autogrouprole]          | Includes all members in the tailnet with the Auditor role.                                                                                                 |

Review the following tables to understand where and how you can use each autogroup.

#### `autogroup:danger-all`

`autogroup:danger-all` is a special (and dangerous) autogroup that includes all devices, even those outside your tailnet.

> **Danger:**
>
> Tailscale does not recommend using this autogroup because it exposes your tailnet to unnecessary security risks. It's only available for backward compatibility reasons.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes         |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | No          |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | No          |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### `autogroup:internet`

`autogroup:internet` is an autogroup that includes all public IP addresses.

> **Note:**
>
> **Technical definition**: `autogroup:internet` is defined as `0.0.0.0/0` and `2000::/3`, excluding the following address ranges:
>
> **Private**:
>
> * `10.0.0.0/8`
> * `172.16.0.0/12`
> * `192.168.0.0/16`
>
> **Tailscale (CGNAT)**:
>
> * `100.64.0.0/10`
>
> **Link-local**:
>
> * `169.254.0.0/16`

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | No          |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### `autogroup:self`

`autogroup:self` is an autogroup that includes all devices owned by the same user. You can use this autogroup to allow devices owned by the same user to access one another.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed**                   |
| ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No                            |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | [Restricted][ar-restrictions] |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | No                            |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | [Restricted][ar-restrictions] |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No                            |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No                            |
| Group ([`group`][docs-acl-groups])                                                                    | No                            |
| IP set ([`ipset`][docs-ipsets])                                                                       | No                            |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No                            |
| Via (`via`)Route filtering in grants                                                                  | No                            |

#### `autogroup:shared`

`autogroup:shared` is an autogroup that includes all devices that belong to users who have accepted a [sharing][docs-sharing] invitation to your tailnet.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes         |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | No          |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | No          |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### `autogroup:tagged`

`autogroup:tagged` is an autogroup that includes all devices that have at least one tag.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed**                   |
| ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | [Restricted][ar-restrictions] |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | Yes                           |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes                           |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes                           |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | Yes                           |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | Yes                           |
| Group ([`group`][docs-acl-groups])                                                                    | No                            |
| IP set ([`ipset`][docs-ipsets])                                                                       | No                            |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | Yes                           |
| Via (`via`)Route filtering in grants                                                                  | No                            |

#### `autogroup:<role>`

`autogroup:<role>` is an autogroup that includes all members in the tailnet with a specific [role](/docs/reference/user-roles).

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed**                                          |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | [Restricted][ar-restrictions] for `autogroup:member` |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No                                                   |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes                                                  |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes                                                  |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | Yes                                                  |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | Yes                                                  |
| Group ([`group`][docs-acl-groups])                                                                    | No                                                   |
| IP set ([`ipset`][docs-ipsets])                                                                       | No                                                   |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | Yes                                                  |
| Via (`via`)Route filtering in grants                                                                  | No                                                   |

### Synced groups

Synced groups are collections of users and devices [provisioned][docs-user-group-provisioning] from an identity provider such as [Google Workspace][docs-sso-google-sync], [Okta][docs-sso-okta-sync], or [Microsoft Active Directory][docs-sso-entra-sync].

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                | **Allowed** |
| ----------------------------------------------------------- | ----------- |
| Access control source (`src`)Includes grants and ACLs.      | Yes         |
| Access control destination (`dst`)Includes grants and ACLs. | Yes         |
| Tag owner (`tagOwners`)                                     | Yes         |
| Node attribute target (`nodeAttr`)                          | Yes         |
| Auto approver (`autoApprover`)                              | Yes         |
| IP sets (`ipsets`)                                          | No          |
| Via (`via`)Route filtering in grants                        | No          |

### Other built-in targets

The following table documents unusual [autogroups][ar-autogroups] and other built-in targets.

| **Target**             | **Description**                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localpart:*@<domain>` | Includes all members with email addresses in the specified `<domain>`. It's only valid as an [SSH source][docs-acl-ssh].                                                                                                          |
| `autogroup:nonroot`    | This is a special [autogroup][ar-autogroups] that applies to SSH users. You can only use it to specify that a user can log in as any user except root. It's not allowed in the source (`src`) or destination (`dst`) definitions. |

### Explicit selector

An explicit selector is a target not created by a [group][ar-groups], [tag][ar-tags], or [IP set][ar-ipsets].

| **Target**                              | **Description**                                                             | **Example**                                           |
| --------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| [IP address][ar-ip-address]             | Select a device by its IP address.                                          | `192.0.2.2`                                           |
| [Host alias][ar-host-alias]             | Select a device by user-defined [host alias][docs-acl-hosts].               | `host:sql-server-1`                                   |
| [IP address range][ar-ip-address-range] | Select an explicit range of IP addresses.                                   | `198.51.100.5-198.51.100.10`                          |
| CIDR                                    | Select a range of IP addresses by the CIDR address.                         | `203.0.113.0/24`                                      |
| [User][ar-user]                         | Select a specific user by their email address, Passkey, or GitHub username. | `user@company.com`, `user@passkey`, `username@github` |
| [Tailscale Service][ar-service]         | Select a specific Tailscale Service by its name.                            | `svc:web-server`                                      |

Review the following sections to understand where and how you can use explicit selectors.

#### IP address

You can use an IP address to select a specific device in your tailnet. For example, `192.0.2.2`.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes         |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | Yes         |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### Host alias

You can use a host alias to select a device by its user-defined alias. For example, `host:sql-server-1`.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes         |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | Yes         |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### IP address range

You can use an IP address range to select a range of IP addresses. For example, `192.0.2.4-192.0.2.12`.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | No          |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | No          |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### User

You can reference a specific a user by their email address, Passkey, or GitHub username (depending on how they authenticated their Tailscale account). For example, `alice@example.com`, `alice@github` or `alice@passkey`.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | Yes         |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | Yes         |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | Yes         |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | No          |
| Via (`via`)Route filtering in grants                                                                  | No          |

#### Service

You can reference a specific [Tailscale Service][docs-tailscale-services] by its name. For example, `svc:web-server` or `svc:printer`.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                                                                          | **Allowed** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                                                                    | No          |
| SSH destination ([`dst`][docs-acl-ssh])                                                               | No          |
| Access control source (`src`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls].      | No          |
| Access control destination (`dst`)Includes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs])                                              | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])                                                         | No          |
| Group ([`group`][docs-acl-groups])                                                                    | No          |
| IP set ([`ipset`][docs-ipsets])                                                                       | No          |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers])                                              | Yes         |
| Via (`via`)Route filtering in grants                                                                  | No          |

### Custom targets

A custom target is a selection of one or more users, devices, or IP addresses that you create using an explicit selector, [group][ar-groups], [tag][ar-tags], or [IP set][ar-ipsets].

#### Groups

[Groups][docs-grants] are selections of users or devices. You can use groups to create custom collections of users or devices to target in policies. For example, you might have a `prod` group that includes all devices in your production environment. Review the following table to understand where and how you can use groups.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                             | **Allowed**                   |
| -------------------------------------------------------- | ----------------------------- |
| SSH source ([`src`][docs-acl-ssh])                       | [Restricted][ar-restrictions] |
| SSH destination ([`dst`][docs-acl-ssh])                  | No                            |
| Access control source (`src`)                            | Yes                           |
| Access control destination (`dst`)                       | Yes                           |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs]) | Yes                           |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])            | Yes                           |
| Group ([`group`][docs-acl-groups])                       | No                            |
| IP set ([`ipset`][docs-ipsets])                          | No                            |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers]) | Yes                           |
| Via (`via`)Route filtering in grants                     | No                            |

#### Tags

[Tags][docs-tags] are named annotations for non-user devices. You can use tags to create identities for non-user devices, such as those hosting a service or application. For example, you might have a `sql` tag that you apply to all devices running a SQL server.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                             | **Allowed**                   |
| -------------------------------------------------------- | ----------------------------- |
| SSH source ([`src`][docs-acl-ssh])                       | [Restricted][ar-restrictions] |
| SSH destination ([`dst`][docs-acl-ssh])                  | Yes                           |
| Access control source (`src`)                            | Yes                           |
| Access control destination (`dst`)                       | Yes                           |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs]) | Yes                           |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])            | Yes                           |
| Group ([`group`][docs-acl-groups])                       | No                            |
| IP set ([`ipset`][docs-ipsets])                          | No                            |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers]) | Yes                           |
| Via (`via`)Route filtering in grants                     | Yes                           |

#### IP sets

[IP sets][docs-ipsets] are collections of IP addresses. You can use IP sets to create custom selections of IP addresses.

Review the following table to understand where and how you can this selector. The **Location** column indicates the location in tailnet policy file and the **Allowed** column indicates whether you can use the target in that location.

| **Location**                                             | **Allowed** |
| -------------------------------------------------------- | ----------- |
| SSH source ([`src`][docs-acl-ssh])                       | No          |
| SSH destination ([`dst`][docs-acl-ssh])                  | No          |
| Access control source (`src`)                            | Yes         |
| Access control destination (`dst`)                       | Yes         |
| Node attribute target ([`nodeAttr`][docs-acl-nodeattrs]) | No          |
| Tag owner ([`tagOwner`][docs-acl-tag-owners])            | No          |
| Group ([`group`][docs-acl-groups])                       | No          |
| IP set ([`ipset`][docs-ipsets])                          | Yes         |
| Auto approver ([`autoApprover`][docs-acl-autoapprovers]) | No          |
| Via (`via`)Route filtering in grants                     | No          |

## Wildcard selectors

The wildcard selector (`*`) lets you match multiple targets using a single pattern. In the tailnet policy file, the exact behavior of wildcard selectors depends on the context in which you use them. For example, when you use a wildcard selector in the `src` or `dst` fields, it matches all Tailscale IP addresses and all approved subnet routes in the tailnet. However, when you use a wildcard selector in the `ip` field of a grant, it matches all ports and protocols for the targets in the `dst` field.

Review the following table to understand how wildcard selectors work in different scenarios.

| Feature                                                                                    | Context                               | Wildcard behavior                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access control policiesIncludes [grants][docs-grants] and [ACLs][docs-policy-syntax-acls]. | The `src` or `dst` fields             | The `*` wildcard selector expands to all Tailscale IP addresses and all IP addresses from approved subnet routes. Approved subnet routes include all the IP addresses that subnet routers advertise and approve. The devices at these IP addresses typically don't have Tailscale IP addresses because they don't connect to the tailnet directly (a subnet router connects them). |
| Access control policiesIncludes [grants][docs-grants].                                     | The `ip` field                        | Matches all protocols (TCP, UDP, and ICMP) and ports on the destination.                                                                                                                                                                                                                                                                                                           |
| Synced autogroups                                                                          | Selecting users in a synced autogroup | Wildcard selectors have special considerations. Although the expressions use the wildcard `*` selector (for example, `user:*@example.com`), it does not support arbitrary wildcards. For example, `user:b*b@example.com` will not match `bob@example.com`.                                                                                                                         |
| Tailscale SSH                                                                              | The `acceptEnv` field                 | Can contain the `*` and `?` wildcard selectors. `*` matches zero or more characters. `?` matches a single character.                                                                                                                                                                                                                                                               |
| General tests                                                                              | The `src`, `accept`, or `deny` fields | Wildcard selectors are not allowed. They must refer to specific entities. For example, you can't use `tags:*` as the destination in an `accept` rule.                                                                                                                                                                                                                              |

> **Note:**
>
> **App connectors and wildcards** You can use wildcard selectors in app connector domain configurations (such as `*.example.com`), but the behavior is non-inclusive of the parent domain.

## Restrictions

Some targets have specific restrictions for security purposes. Review the following restrictions to understand where and how you can use each target.

* User-authenticated devices can only SSH to other devices they own or devices authenticated with a tag.
* Devices with a tag-based identity can only SSH into other tagged devices; they cannot SSH into devices with a user-based identity.
* The [`autogroup:self`][ar-autogroupself] selector as a destination requires specific source types: individual users, groups, or role-based autogroups (such as `autogroup:member`, `autogroup:admin`, `autogroup:owner`, and so on).

[ar-autogroupdanger-all]: #autogroupdanger-all

[ar-autogroupinternet]: #autogroupinternet

[ar-autogrouprole]: #autogrouprole

[ar-autogroups]: #autogroups

[ar-autogroupself]: #autogroupself

[ar-autogroupshared]: #autogroupshared

[ar-autogrouptagged]: #autogrouptagged

[ar-custom-targets]: #custom-targets

[ar-explicit-selectors]: #explicit-selector

[ar-groups]: #groups

[ar-host-alias]: #host-alias

[ar-ip-address-range]: #ip-address-range

[ar-ip-address]: #ip-address

[ar-ipsets]: #ip-sets

[ar-restrictions]: #restrictions

[ar-service]: #service

[ar-tags]: #tags

[ar-types]: #types

[ar-user]: #user

[docs-access-control]: /docs/features/access-control

[docs-acl-autoapprovers]: /docs/reference/syntax/policy-file#auto-approvers

[docs-acl-groups]: /docs/reference/syntax/policy-file#groups

[docs-acl-hosts]: /docs/reference/syntax/policy-file#hosts

[docs-acl-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-acl-ssh]: /docs/reference/syntax/policy-file#ssh

[docs-acl-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-autogroups]: /docs/reference/syntax/policy-file#autogroups

[docs-grants]: /docs/features/access-control/grants

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-sharing]: /docs/features/sharing

[docs-sso-entra-sync]: /docs/integrations/identity/entra/entra-id-scim

[docs-sso-google-sync]: /docs/integrations/google-sync

[docs-sso-okta-sync]: /docs/integrations/identity/okta/okta-scim

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
