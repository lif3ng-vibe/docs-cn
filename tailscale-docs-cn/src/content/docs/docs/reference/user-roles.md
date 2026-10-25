---
title: "用户角色"
description: "使用角色来限制对管理控制台的访问。"
---

最后验证于 Dec 4, 2025

用户角色是用于限制管理控制台访问权限的身份与访问管理（IAM）角色。

> **注意：** 用户角色适用于[所有套餐](https://tailscale.com/pricing)。

部分角色仅适用于特定套餐，相应说明见角色文档。

要了解并限制哪些用户和设备可以在 tailnet 中通信，请参阅[访问控制策略][docs-access-control]。

## 管理角色

你可以在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面[添加][docs-invite-team-members]或[移除][docs-remove-team-members]用户，以及[更改他们的角色][docs-changing-user-roles]。

用户不能修改自己的角色，例外是把 Owner 角色转移给另一个用户。

## 用户角色类别

为了区分各[付费套餐][co-pricing]可用的用户角色，角色分为基础（Basic）和高级（Advanced）两类。

### 基础角色

基础角色适用于所有付费套餐。以下角色属于基础类别：

* [Owner（所有者）][ar-owner]
* [Admin（管理员）][ar-admin]
* [Member（成员）][ar-member]

### 高级角色

高级角色适用于 Standard、Premium 和 Enterprise 付费套餐。以下角色属于高级类别：

* [Billing admin（账单管理员）][ar-billing-admin]
* [IT admin（IT 管理员）][ar-it-admin]
* [Network admin（网络管理员）][ar-network-admin]
* [Auditor（审计员）][ar-auditor]

## 角色

### Owner（所有者）

Owner 是你的组织的 Tailscale 账户的所有者。此人可以访问有关你的 Tailscale 账户的所有信息，包括付费套餐和账单信息。

Owner 可以在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面把自己的所有者身份转移给另一个用户，但须遵守相关[限制][docs-changing-user-roles-limitations-when-changing-owners]。要删除 Owner 的账户，必须先把 Owner 角色转移给另一个用户。

每个 Tailscale 组织必须有一个 Owner，且只能有一个。

如果没有修改过，Owner 很可能是第一个安装 Tailscale 的用户。你可以在管理控制台的 Users 标签页中通过角色识别 Owner。

> **注意：**
>
> 如果你无法访问管理控制台来确认 Owner，或已丢失 Owner 账户的访问权限，请[联系我们][co-contact-support]寻求帮助。

### Admin（管理员）

Admin 是你的组织的 Tailscale 账户的管理员。他们可以在[管理控制台](https://console.tailscale.com/admin)中执行任何操作，包括邀请或移除用户、修改访问控制策略、批准机器、启用或禁用功能，以及修改付费套餐和账单信息。

可以有多个 Admin。

### Network admin（网络管理员）

> **注意：** 此角色适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

Network admin 是你的组织的 Tailscale 账户的管理员，但只能管理网络配置。他们可以修改 tailnet 策略文件，以及修改 DNS、子网和其他网络设置。他们可以查看但不能修改用户和设备信息（即使是对自己的设备）以及常规设置。他们无法访问或更改付费套餐和账单信息。

在较大的组织中，可将此角色分配给网络团队，用于管理包括 DNS 和子网在内的网络拓扑。

### IT admin（IT 管理员）

> **注意：** 此角色适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

IT admin 是你的组织的 Tailscale 账户的管理员，但只能管理用户和机器。他们可以执行移除用户、批准和移除设备等操作，并可以修改常规设置，例如启用某些功能。他们可以查看但不能修改网络信息，例如 tailnet 策略文件和 DNS 配置。他们不能接受子网路由器的路由。他们无法访问或更改付费套餐和账单信息。

在较大的组织中，可将此角色分配给 IT 团队，负责用户及其设备的接入与移除。

> **注意：**
>
> IT admin 可以授予所有角色，包括权限高于 IT admin 的角色。这符合职责分离原则，因为必须由*两个*人协同操作才能提升访问权限。

### Billing admin（账单管理员）

> **注意：** 此角色适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

Billing admin 是你的组织的 Tailscale 账户的管理员，但只能修改付费套餐和账单信息。他们可以查看但不能修改管理控制台中的其他信息，例如用户和设备信息、网络信息或常规设置。

> **注意：**
>
> Billing admin 不会自动接收[账单邮件][docs-billing-information-billing-email]。

在较大的组织中，可将此角色分配给财务或会计团队。

### Auditor（审计员）

> **注意：** 此角色适用于 [Standard、Premium 和 Enterprise 套餐](https://tailscale.com/pricing)。

Auditor 是你的组织的 Tailscale 账户的成员。他们可以读取 tailnet 的所有配置，但不能修改任何配置。

在较大的组织中，可将此角色分配给合规或审计团队。

### Member（成员）

Member 是你的 tailnet 的用户。他们无法访问管理控制台，但可以按照[访问控制策略][docs-access-control]的许可连接 tailnet 中的节点。

tailnet 中的新用户默认是 Member。

可以有多个 Member。

> **注意：**
>
> 如果你与其他用户[共享某个节点][docs-sharing]，那么对方只是该节点的 Member，而不是整个 tailnet 的 Member。

## 权限矩阵

### 由用户角色管理的权限

权限

Owner

Admin

Network admin

IT admin

Billing admin

Auditor

Member

可以访问管理控制台
✅
✅
✅
✅
✅
✅
❌

读取 tailnet 策略文件
✅
✅
✅
✅
✅
✅
❌

写入 tailnet 策略文件
✅
✅
✅
❌
❌
❌
❌

读取网络配置
✅
✅
✅
✅
✅
✅
❌

写入网络配置，例如启用 MagicDNS、拆分 DNS（split DNS）、创建子网、允许节点成为出口节点、启用 HTTPS
✅
✅
✅
❌
❌
❌
❌

读取功能配置
✅
✅
✅
✅
✅
✅
❌

写入功能配置，例如启用 Taildrop
✅
✅
❌
✅
❌
❌
❌

配置用户与组开通（provisioning）
✅
✅
❌
✅
❌
❌
❌

读取机器，例如读取机器名称和状态
✅
✅
✅
✅
✅
✅
❌

写入机器，例如批准、重命名和移除机器
✅
✅
❌
✅
❌
❌
❌

读取用户和用户角色
✅
✅
✅
✅
✅
✅
❌

写入用户和用户角色，例如移除用户、批准用户、设为 Admin
✅
✅
❌
✅
❌
❌
❌

可以生成认证密钥（auth key）
✅
✅
✅
✅
❌
❌
❌

可以生成 API 访问令牌和 OAuth 客户端
✅
✅
✅
✅
❌
❌
❌

可以共享节点
✅
✅
❌
✅
❌
❌
❌

可以接受共享的节点
✅
✅
❌
✅
❌
❌
❌

可以使用任意标签（无需是标签所有者）
✅
✅
✅
❌
❌
❌
❌

读取配置审计日志
✅
✅
✅
✅
✅
✅
❌

使用 Tailscale SSH 控制台（如果 tailnet 策略文件允许）
✅
✅
✅
✅
❌
❌
❌

写入 webhook
✅
✅
✅
✅
❌
❌
❌

写入 tailnet 名称
✅
✅
✅
❌
❌
❌
❌

读取付费套餐
✅
✅
❌
❌
✅
❌
❌

写入付费套餐
✅
✅
❌
❌
✅
❌
❌

写入账单信息
✅
✅
❌
❌
✅
❌
❌

### 由 tailnet 策略文件管理的权限

网络内通信的权限，以及在设备上运行某些命令的权限，由 [tailnet 策略文件][docs-tailnet-policy-file]设定：

* 访问某台机器
* 设置标签的能力（[标签所有者][docs-policy-syntax-tag-owners]）
* 自行批准路由或出口节点的能力（[自动审批者][docs-policy-syntax-autoapprovers]）

[ar-admin]: #admin管理员

[ar-auditor]: #auditor审计员

[ar-billing-admin]: #billing-admin账单管理员

[ar-it-admin]: #it-adminit-管理员

[ar-member]: #member成员

[ar-network-admin]: #network-admin网络管理员

[ar-owner]: #owner所有者

[co-contact-support]: https://tailscale.com/contact/support

[co-pricing]: https://tailscale.com/pricing

[docs-access-control]: /docs/features/access-control/acls

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#自动批准autoapprovers

[docs-policy-syntax-tag-owners]: /docs/reference/syntax/policy-file#标签所有者

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-changing-user-roles-limitations-when-changing-owners]: /docs/features/sharing/how-to/change-role#更改-owner-的限制

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-sharing]: /docs/features/sharing

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
