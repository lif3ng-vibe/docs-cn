---
title: "目标与选择器"
description: "了解 Tailscale 目标（target），即你在 tailnet 策略文件中用来标识用户、设备或子网的标识符。"
---

最后验证于 Jan 5, 2026

目标（target，或称选择器）是你在 [tailnet 策略文件][docs-tailnet-policy-file]中用来标识用户、设备或子网的标识符。在大多数情况下，你会用目标来指定[访问控制][docs-access-control]策略的源或目标。目标可以选择一台或多台设备、一个或多个用户，以及[网段][docs-subnets]。例如，`tag:sql-server` 是一个目标，可用于选择所有打了 `sql-server` [标签][docs-tags]的设备；而 `192.0.2.23` 则是一个只选择使用 IP 地址 `192.0.2.23` 的那台设备的目标。

请将本页作为各类[目标类型][ar-types]、其适用场景及其[限制][ar-restrictions]的参考。

## 类型

目标主要有三类：[autogroup][ar-autogroups]、[显式选择器][ar-explicit-selectors]和[自定义目标][ar-custom-targets]。

### autogroup

[autogroup][docs-autogroups] 是一种内置目标，它会根据特定条件自动对设备、用户或 IP 地址分组。借助 autogroup，你可以选中那些用其他方式很难甚至无法选中的动态用户、设备或路由集合。例如，`autogroup:member` 是一个包含你 tailnet 中所有成员的 autogroup。

| **Autogroup**                                    | **说明**                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`autogroup:danger-all`][ar-autogroupdanger-all] | 包括所有设备，甚至包括你 tailnet 之外的设备。使用此目标务必谨慎——它可能使你的 tailnet 面临安全风险或出现意外行为。                                           |
| [`autogroup:internet`][ar-autogroupinternet]     | 包括所有公共 IP 地址。                                                                                                                                      |
| [`autogroup:self`][ar-autogroupself]             | 包括同一用户拥有的所有设备。这是一个特殊的 autogroup，可用于允许同一用户拥有的设备互相访问。                                                                |
| [`autogroup:shared`][ar-autogroupshared]         | 包括所有属于已接受你 tailnet [共享][docs-sharing]邀请的用户的设备。                                                                                          |
| [`autogroup:tagged`][ar-autogrouptagged]         | 包括所有至少拥有一个标签（tag）的设备。                                                                                                                      |
| [`autogroup:member`][ar-autogrouprole]           | 包括 tailnet 的所有成员。                                                                                                                                    |
| [`autogroup:owner`][ar-autogrouprole]            | 包括 tailnet 中具有 Owner 角色的所有成员。                                                                                                                  |
| [`autogroup:admin`][ar-autogrouprole]            | 包括 tailnet 中具有 Admin 角色的所有成员。                                                                                                                  |
| [`autogroup:it-admin`][ar-autogrouprole]         | 包括 tailnet 中具有 IT admin 角色的所有成员。                                                                                                                |
| [`autogroup:billing-admin`][ar-autogrouprole]    | 包括 tailnet 中具有 Billing admin 角色的所有成员。                                                                                                          |
| [`autogroup:network-admin`][ar-autogrouprole]    | 包括 tailnet 中具有 Network admin 角色的所有成员。                                                                                                          |
| [`autogroup:auditor`][ar-autogrouprole]          | 包括 tailnet 中具有 Auditor 角色的所有成员。                                                                                                                |

请查阅下表，了解每个 autogroup 可以在哪些位置、以何种方式使用。

#### `autogroup:danger-all`

`autogroup:danger-all` 是一个特殊（且危险）的 autogroup，它包括所有设备，甚至包括你 tailnet 之外的设备。

> **危险：**
>
> Tailscale 不建议使用此 autogroup，因为它会使你的 tailnet 暴露在不必要的安全风险之下。它仅出于向后兼容的原因而保留。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 否          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### `autogroup:internet`

`autogroup:internet` 是一个包括所有公共 IP 地址的 autogroup。

> **注意：**
>
> **技术定义**：`autogroup:internet` 定义为 `0.0.0.0/0` 和 `2000::/3`，但排除以下地址范围：
>
> **私有（Private）**：
>
> * `10.0.0.0/8`
> * `172.16.0.0/12`
> * `192.168.0.0/16`
>
> **Tailscale（CGNAT）**：
>
> * `100.64.0.0/10`
>
> **链路本地（link-local）**：
>
> * `169.254.0.0/16`

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 否          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### `autogroup:self`

`autogroup:self` 是一个包括同一用户拥有的所有设备的 autogroup。你可以使用此 autogroup 来允许同一用户拥有的设备互相访问。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许**                  |
| ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否                            |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | [受限][ar-restrictions]       |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 否                            |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | [受限][ar-restrictions]       |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否                            |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否                            |
| 组（[`group`][docs-acl-groups]）                                                                      | 否                            |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否                            |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否                            |
| Via（`via`），授权中的路由过滤                                                                        | 否                            |

#### `autogroup:shared`

`autogroup:shared` 是一个包括所有属于已接受你 tailnet [共享][docs-sharing]邀请的用户的设备的 autogroup。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 否          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### `autogroup:tagged`

`autogroup:tagged` 是一个包括所有至少拥有一个标签的设备的 autogroup。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许**                  |
| ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | [受限][ar-restrictions]       |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 是                            |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是                            |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是                            |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 是                            |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 是                            |
| 组（[`group`][docs-acl-groups]）                                                                      | 否                            |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否                            |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 是                            |
| Via（`via`），授权中的路由过滤                                                                        | 否                            |

#### `autogroup:<role>`

`autogroup:<role>` 是一个包括 tailnet 中具有特定[角色](/docs/reference/user-roles)的所有成员的 autogroup。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许**                                         |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | `autogroup:member` 为[受限][ar-restrictions]         |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否                                                   |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是                                                   |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是                                                   |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 是                                                   |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 是                                                   |
| 组（[`group`][docs-acl-groups]）                                                                      | 否                                                   |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否                                                   |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 是                                                   |
| Via（`via`），授权中的路由过滤                                                                        | 否                                                   |

### 同步组

同步组（synced group）是从[Google Workspace][docs-sso-google-sync]、[Okta][docs-sso-okta-sync]或 [Microsoft Active Directory][docs-sso-entra-sync]等身份提供方（IdP）[预置][docs-user-group-provisioning]而来的用户和设备集合。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                    | **是否允许** |
| ----------------------------------------------------------- | ----------- |
| 访问控制源（`src`），包括授权（grant）与 ACL。              | 是          |
| 访问控制目标（`dst`），包括授权（grant）与 ACL。            | 是          |
| 标签所有者（`tagOwners`）                                   | 是          |
| 节点属性目标（`nodeAttr`）                                  | 是          |
| 自动批准者（`autoApprover`）                                | 是          |
| IP 集合（`ipsets`）                                         | 否          |
| Via（`via`），授权中的路由过滤                              | 否          |

### 其他内置目标

下表记录了不常见的 [autogroup][ar-autogroups] 及其他内置目标。

| **目标**               | **说明**                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `localpart:*@<domain>` | 包括所有电子邮件地址位于指定 `<domain>` 的成员。它只能用作 [SSH 源][docs-acl-ssh]。                                                                                                                                              |
| `autogroup:nonroot`    | 这是一个适用于 SSH 用户的特殊 [autogroup][ar-autogroups]。你只能用它来指定某用户可以以除 root 之外的任何用户身份登录。它不允许出现在源（`src`）或目标（`dst`）定义中。                                                            |

### 显式选择器

显式选择器（explicit selector）是并非由[组][ar-groups]、[标签][ar-tags]或 [IP 集合][ar-ipsets]创建的目标。

| **目标**                                | **说明**                                                                    | **示例**                                              |
| --------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| [IP 地址][ar-ip-address]                | 按 IP 地址选择设备。                                                        | `192.0.2.2`                                           |
| [主机别名][ar-host-alias]               | 按用户定义的[主机别名][docs-acl-hosts]选择设备。                            | `host:sql-server-1`                                   |
| [IP 地址范围][ar-ip-address-range]      | 选择一个显式的 IP 地址范围。                                                | `198.51.100.5-198.51.100.10`                          |
| CIDR                                    | 按 CIDR 地址选择一段 IP 地址范围。                                          | `203.0.113.0/24`                                      |
| [用户][ar-user]                         | 按电子邮件地址、Passkey 或 GitHub 用户名选择特定用户。                      | `user@company.com`、`user@passkey`、`username@github` |
| [Tailscale Service][ar-service]         | 按名称选择特定的 Tailscale Service。                                        | `svc:web-server`                                      |

请查阅以下小节，了解显式选择器可以在哪些位置、以何种方式使用。

#### IP 地址

你可以使用 IP 地址来选择 tailnet 中的特定设备，例如 `192.0.2.2`。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 是          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### 主机别名

你可以使用主机别名，按用户定义的别名来选择设备，例如 `host:sql-server-1`。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 是          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### IP 地址范围

你可以使用 IP 地址范围来选择一段 IP 地址，例如 `192.0.2.4-192.0.2.12`。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 否          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 否          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### 用户

你可以通过电子邮件地址、Passkey 或 GitHub 用户名来引用特定用户（取决于其 Tailscale 账户的认证方式），例如 `alice@example.com`、`alice@github` 或 `alice@passkey`。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 是          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 是          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 是          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 否          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

#### Service

你可以按名称引用特定的 [Tailscale Service][docs-tailscale-services]，例如 `svc:web-server` 或 `svc:printer`。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                                                              | **是否允许** |
| ----------------------------------------------------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                                                                       | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                                                                     | 否          |
| 访问控制源（`src`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。               | 否          |
| 访问控制目标（`dst`），包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。             | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）                                                      | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）                                                       | 否          |
| 组（[`group`][docs-acl-groups]）                                                                      | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                                                                     | 否          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）                                                | 是          |
| Via（`via`），授权中的路由过滤                                                                        | 否          |

### 自定义目标

自定义目标（custom target）是你使用显式选择器、[组][ar-groups]、[标签][ar-tags]或 [IP 集合][ar-ipsets]创建的、由一个或多个用户、设备或 IP 地址组成的选择。

#### 组

[组][docs-grants]是用户或设备的选择集合。你可以使用组来创建自定义的用户或设备集合，以便在策略中作为目标。例如，你可以建一个 `prod` 组，包含生产环境中的所有设备。请查阅下表，了解组可以在哪些位置、以何种方式使用。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                 | **是否允许**                  |
| -------------------------------------------------------- | ----------------------------- |
| SSH 源（[`src`][docs-acl-ssh]）                          | [受限][ar-restrictions]       |
| SSH 目标（[`dst`][docs-acl-ssh]）                        | 否                            |
| 访问控制源（`src`）                                      | 是                            |
| 访问控制目标（`dst`）                                    | 是                            |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）         | 是                            |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）          | 是                            |
| 组（[`group`][docs-acl-groups]）                         | 否                            |
| IP 集合（[`ipset`][docs-ipsets]）                        | 否                            |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）   | 是                            |
| Via（`via`），授权中的路由过滤                           | 否                            |

#### 标签

[标签][docs-tags]是给非用户设备起的命名注记。你可以用标签为非用户设备创建身份，例如托管服务或应用的设备。例如，你可以建一个 `sql` 标签，应用到所有运行 SQL 服务器的设备上。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                 | **是否允许**                  |
| -------------------------------------------------------- | ----------------------------- |
| SSH 源（[`src`][docs-acl-ssh]）                          | [受限][ar-restrictions]       |
| SSH 目标（[`dst`][docs-acl-ssh]）                        | 是                            |
| 访问控制源（`src`）                                      | 是                            |
| 访问控制目标（`dst`）                                    | 是                            |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）         | 是                            |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）          | 是                            |
| 组（[`group`][docs-acl-groups]）                         | 否                            |
| IP 集合（[`ipset`][docs-ipsets]）                        | 否                            |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）   | 是                            |
| Via（`via`），授权中的路由过滤                           | 是                            |

#### IP 集合

[IP 集合][docs-ipsets]是 IP 地址的集合。你可以使用 IP 集合来创建自定义的 IP 地址选择。

请查阅下表，了解此选择器可以在哪些位置、以何种方式使用。**位置**列表示 tailnet 策略文件中的位置，**是否允许**列表示你能否在该位置使用此目标。

| **位置**                                                 | **是否允许** |
| -------------------------------------------------------- | ----------- |
| SSH 源（[`src`][docs-acl-ssh]）                          | 否          |
| SSH 目标（[`dst`][docs-acl-ssh]）                        | 否          |
| 访问控制源（`src`）                                      | 是          |
| 访问控制目标（`dst`）                                    | 是          |
| 节点属性目标（[`nodeAttr`][docs-acl-nodeattrs]）         | 否          |
| 标签所有者（[`tagOwner`][docs-acl-tag-owners]）          | 否          |
| 组（[`group`][docs-acl-groups]）                         | 否          |
| IP 集合（[`ipset`][docs-ipsets]）                        | 是          |
| 自动批准者（[`autoApprover`][docs-acl-autoapprovers]）   | 否          |
| Via（`via`），授权中的路由过滤                           | 否          |

## 通配符选择器

通配符选择器（`*`）让你能用单个模式匹配多个目标。在 tailnet 策略文件中，通配符选择器的确切行为取决于你使用它的上下文。例如，在 `src` 或 `dst` 字段中使用通配符选择器时，它会匹配 tailnet 中的所有 Tailscale IP 地址以及所有已批准的子网路由；而在授权（grant）的 `ip` 字段中使用时，它会匹配 `dst` 字段中目标的所有端口和协议。

请查阅下表，了解通配符选择器在不同场景中的工作方式。

| 功能                                                                                       | 上下文                                | 通配符行为                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 访问控制策略，包括[授权（grant）][docs-grants]与 [ACL][docs-policy-syntax-acls]。          | `src` 或 `dst` 字段                   | `*` 通配符选择器会展开为所有 Tailscale IP 地址以及来自已批准子网路由的所有 IP 地址。已批准的子网路由包括子网路由器通告并获批准的所有 IP 地址。这些 IP 地址上的设备通常没有 Tailscale IP 地址，因为它们不直接连接 tailnet（而是由子网路由器代为连接）。                                                                  |
| 访问控制策略，包括[授权（grant）][docs-grants]。                                           | `ip` 字段                             | 匹配目标上的所有协议（TCP、UDP 和 ICMP）及端口。                                                                                                                                                                                                                                                                     |
| 同步 autogroup                                                                             | 在同步 autogroup 中选择用户           | 通配符选择器有特殊限制。虽然表达式使用通配符 `*` 选择器（例如 `user:*@example.com`），但它不支持任意通配符。例如，`user:b*b@example.com` 不会匹配 `bob@example.com`。                                                                                                                                                  |
| Tailscale SSH                                                                              | `acceptEnv` 字段                      | 可以包含 `*` 和 `?` 通配符选择器。`*` 匹配零个或多个字符，`?` 匹配单个字符。                                                                                                                                                                                                                                          |
| 常规测试                                                                                   | `src`、`accept` 或 `deny` 字段        | 不允许使用通配符选择器，必须引用具体实体。例如，在 `accept` 规则中不能把 `tags:*` 用作目标。                                                                                                                                                                                                                          |

> **注意：**
>
> **应用连接器与通配符**：你可以在应用连接器（app connector）的域名配置中使用通配符选择器（例如 `*.example.com`），但其行为不包含父域本身。

## 限制

出于安全考虑，某些目标有特定的限制。请查阅以下限制说明，了解每个目标可以在哪些位置、以何种方式使用。

* 经用户认证的设备只能 SSH 到它们自己拥有的设备，或通过标签认证的设备。
* 以标签为身份的设备只能 SSH 到其他打了标签的设备，不能 SSH 到以用户为身份的设备。
* [`autogroup:self`][ar-autogroupself] 选择器作为目标（destination）时要求特定的源类型：个人用户、组，或基于角色的 autogroup（例如 `autogroup:member`、`autogroup:admin`、`autogroup:owner` 等）。

[ar-autogroupdanger-all]: #autogroupdanger-all

[ar-autogroupinternet]: #autogroupinternet

[ar-autogrouprole]: #autogrouprole

[ar-autogroups]: #autogroup

[ar-autogroupself]: #autogroupself

[ar-autogroupshared]: #autogroupshared

[ar-autogrouptagged]: #autogrouptagged

[ar-custom-targets]: #自定义目标

[ar-explicit-selectors]: #显式选择器

[ar-groups]: #组

[ar-host-alias]: #主机别名

[ar-ip-address-range]: #ip-地址范围

[ar-ip-address]: #ip-地址

[ar-ipsets]: #ip-集合

[ar-restrictions]: #限制

[ar-service]: #service

[ar-tags]: #标签

[ar-types]: #类型

[ar-user]: #用户

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
