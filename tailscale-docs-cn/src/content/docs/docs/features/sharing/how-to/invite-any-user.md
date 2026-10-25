---
title: "邀请任意用户加入你的 tailnet"
description: "你可以以生成的 URL 形式，向任何你想让其加入 Tailscale 网络（tailnet）的用户发送一次性邀请。一次性用户邀请适合把朋友、家人或承包商等用户添加到个人 tailnet 或组织 tailnet 中进行认证。"
---

最后验证于 Jan 5, 2026

你可以以生成的 URL 形式，向任何你想让其加入 Tailscale 网络（tailnet）的用户发送一次性邀请。一次性用户邀请适合把朋友、家人或承包商等用户添加到个人 tailnet 或组织 tailnet 中进行身份认证。

你的 Tailscale 账单会包含加入你 tailnet 并在其中传输数据的受邀用户，也包括在其他 tailnet 中属于付费用户的受邀用户。Tailscale 会为每个 tailnet 上的[每个活跃用户计费][docs-billing-information]。

> **注意：** [所有套餐](https://tailscale.com/pricing)都可以向 tailnet 邀请任意用户。

> **注意：**
>
> Tailscale 用户账户不得共享或由多人使用。

> **注意：**
>
> 未使用的邀请 30 天后过期。

## 发送邀请电子邮件

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能通过电子邮件发送邀请。

通过电子邮件发送邀请的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 选择 **Invite external users**。
3. 为每个你想邀请加入 tailnet 的用户添加其邮箱地址。
4. 选择要在邀请中为每个用户自动分配的用户角色。单次邀请中所有邮箱地址只能分配同一个角色。
5. 选择 **Invite**，向列出的每个邮箱地址发送电子邮件邀请。

## 发送邀请链接

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能发送邀请链接。

发送邀请链接的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 选择 **Invite external users**。
3. 选择 **Copy invite link** 标签页。
4. 选择你想分配给邀请链接的[用户角色][docs-user-roles]。
5. 选择 **Generate & copy invite link**，把邀请 URL 复制到剪贴板。
6. 把该 URL 链接发送给你想邀请加入 tailnet 的用户。

## 启用或禁用加入外部 tailnet

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能启用或禁用加入外部 tailnet。

你可以允许或阻止你 tailnet 中的用户加入其他（外部）tailnet。默认情况下，tailnet 只允许 Admin 用户接受加入外部 tailnet 的邀请。
启用加入外部 tailnet 的步骤：

1. 打开管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Join external tailnets** 部分，选择允许加入外部 tailnet 的用户角色。

禁用加入外部 tailnet 的步骤：

1. 打开管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Join external tailnets** 部分选择 **Deny**。

加入和离开外部 tailnet 的事件会出现在[配置审计日志][docs-audit-logging-events]中。

## 接受邀请

接受邀请的步骤：

1. 把邀请中的 URL 复制粘贴到浏览器。
2. 使用你的身份提供方（IdP）或 [passkey][docs-passkeys] 登录 Tailscale。
3. [下载][co-download] Tailscale 客户端。

## 离开 tailnet

加入了多个外部 tailnet 的用户，可以使用 **Leave tailnet** 选项离开后加入的 tailnet。该选项只显示用户后加入的 tailnet，并且只对组织 tailnet 可用。

如果你有权访问管理控制台：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 找到你的账户。
3. 选择该菜单。
4. 选择 **Leave tailnet**。

如果你无权访问管理控制台：

1. 前往 Tailscale [管理控制台](https://console.tailscale.com/admin)。
2. 在右上角选择该菜单。
3. 选择 **Leave tailnet**。

*（图：离开 tailnet）*

## 批准邀请

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能批准受邀用户。

如果你的 tailnet 启用了[用户审批][docs-user-approval]，你必须先批准受邀用户，他们才能加入 tailnet。

## 查看邀请

你需要是 [Owner（所有者）、Admin（管理员）、IT admin（IT 管理员）、Network admin（网络管理员）或 Billing admin（账单管理员）](/docs/reference/user-roles)，才能查看邀请。

要查看所有当前邀请，使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器。

## 重新发送邀请

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能重新发送邀请。

重新发送邀请的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 在搜索栏输入对方邮箱地址，或使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器，找到受邀用户。
3. 选择该用户名旁边的菜单，然后选择 **Resend user invite** 或 **Copy invite link**。

## 删除邀请

你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能撤销邀请。

如果你不小心分享了用户邀请，或因其他原因想撤销它，可以删除邀请。

删除邀请的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 在搜索栏输入对方邮箱地址，或使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器，找到受邀用户。
3. 选择该用户名旁边的菜单，然后选择 **Delete invite**。

## 监控邀请

你需要是 [Owner（所有者）、Admin（管理员）、IT admin（IT 管理员）、Network admin（网络管理员）或 Billing admin（账单管理员）](/docs/reference/user-roles)，才能查看配置审计日志。

你可以在管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面跟踪用户邀请活动。

[co-download]: https://tailscale.com/download

[docs-audit-logging-events]: /docs/features/logging/audit-logging#events

[docs-billing-information]: /docs/account/billing/modify-billing

[docs-passkeys]: /docs/integrations/identity/passkeys

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-user-roles]: /docs/reference/user-roles
