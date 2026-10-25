---
title: "邀请团队成员加入你的 tailnet"
description: "如果你的 Tailscale 网络（tailnet）使用自定义域名，你可以同时向一个或多个邮箱地址发送团队邀请。"
---

最后验证于 Jan 5, 2026

如果你的 Tailscale 网络（tailnet）使用自定义域名，你可以同时向一个或多个邮箱地址发送团队邀请。

你的 Tailscale 账单会包含加入你 tailnet 并在其中传输数据的受邀用户，也包括在其他 tailnet 中属于付费用户的受邀用户。Tailscale 会为每个 tailnet 上的每个用户计费。

> **注意：** [所有套餐](https://tailscale.com/pricing)都可以使用团队邀请。

> **注意：**
>
> Tailscale 用户账户不得共享或由多人使用。

> **注意：**
>
> 未使用的邀请会在最后一次发送欢迎邀请 90 天后过期。

## 前提条件

* 你需要是 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能发送邀请。
* 你的 tailnet 必须使用自定义域名。如果你的 tailnet 使用共享域名（例如 `example@gmail.com`），可以改为[使用 URL 链接发送邀请][docs-invite-any-user]。
* 你的自定义域名必须使用以下身份提供方之一：
  * [受支持的身份提供方][docs-sso-providers]。
  * [自定义 OIDC 提供方][docs-custom-provider]。

## 发送团队邀请

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。

2. 选择 **Send welcome email**。

3. 为每个你想添加到 tailnet 的用户添加其邮箱地址。邀请中的所有邮箱地址都必须与 tailnet 的自定义域名匹配。

   *（图：邀请团队弹窗。）*

   多个邮箱地址必须以逗号分隔，逗号后可以有空格。可接受的格式为：

   `user1@example.com,user2@example.com,user3@example.com`

   `user1@example.com, user2@example.com, user3@example.com`

4. 选择要在邀请中为每个用户自动分配的[用户角色][docs-roles]。单次邀请中所有邮箱地址只能分配同一个角色。

   *（图：带角色选择的邀请团队弹窗。）*

5. 选择 **Send emails**。

## 接受团队邀请

用户会收到一封电子邮件，邀请他们通过[下载 Tailscale 客户端][co-download]并使用身份提供方或 [passkey][docs-passkey] 登录，来加入你所在组织的 tailnet。

## 批准团队邀请

如果你的 tailnet 启用了[用户审批][docs-user-approval]，你必须先批准受邀用户，他们才能加入 tailnet。

## 查看团队邀请

要查看所有当前邀请，使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器。

## 重新发送团队邀请

重新发送邀请的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 在搜索栏输入对方邮箱地址，或使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器，找到受邀用户。
3. 选择该用户名旁边的菜单，然后选择 **Resend user invite**。

   *（图：受邀用户的用户操作选项。）*

## 删除团队邀请

如果你不小心分享了用户邀请，或因其他原因想撤销它，可以删除邀请。

删除邀请的步骤：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 在搜索栏输入对方邮箱地址，或使用 [`status:invited`](https://console.tailscale.com/admin/users?q=status%3Ainvited) 筛选器，找到受邀用户。
3. 选择该用户名旁边的菜单，然后选择 **Delete user invite**。

   *（图：受邀用户的用户操作选项。）*

## 监控团队邀请

你可以在管理控制台的 [Configuration logs](https://console.tailscale.com/admin/logs) 页面跟踪用户邀请活动。

## 限制

* 你只能邀请同一域名下的用户。
* GitHub 用户账户没有邮箱地址，因此无法向 GitHub 账户发送邀请。
* 单个团队邀请只能为受邀用户授予一个角色。

[co-download]: https://tailscale.com/download

[docs-custom-provider]: /docs/integrations/identity/custom-oidc

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-passkey]: /docs/integrations/identity/passkeys

[docs-roles]: /docs/reference/user-roles

[docs-sso-providers]: /docs/integrations/identity

[docs-user-approval]: /docs/features/access-control/user-approval
