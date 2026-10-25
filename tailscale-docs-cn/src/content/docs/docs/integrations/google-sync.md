---
title: "Google Workspace 的用户与组开通"
description: "从 Google Workspace 同步用户与组，以便在 Tailscale 访问控制中使用。"
---

最后验证于 Jul 6, 2026

> **注意：** 此功能适用于 [Standard、Premium 与 Enterprise 套餐](https://tailscale.com/pricing)。

> **注意：**
>
> Tailscale 对从 Google API 收到的信息向任何其他应用的使用与传输，都将遵守 [Google API Services User Data Policy][xt-google-api-scopes]，包括"有限使用"（Limited Use）要求。

Tailscale 支持同步 Google Workspace 的用户与组，以便在 Tailscale [访问控制][docs-access-control]中使用。

* 通过组同步，你可以在 [tailnet 策略文件][docs-tailnet-policy-file]中以人类可读的名称引用 Google 上的组。
* 通过用户同步，你可以为用户开通或停用 Tailscale 访问。相关信息请参阅[使用用户与组开通时的离职处理][docs-offboarding-users-offboarding-scim]。

## 前提条件

* 你需要一个 Google Workspace 账户。
* 你需要一个 Tailscale 网络（即 tailnet）。
* 你 tailnet 的身份提供方（IdP）需要是 Google。

## 设置 Google 用户与组同步

你必须成为 Tailscale 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能完成这些步骤。

1. 打开 Tailscale 的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Google Sync** 部分，选择 **Enable**。
3. 在打开的授权页面中，选择 **Authorize with Google**。
4. 在 **Choose an account** 页面，选择你的 Google Workspace 超级用户账户。
5. 在 **Sign in** 页面，选择 **Continue**。
6. 当提示允许访问你的 tailnet 时，选择 **Allow**。

首次启用 Google Sync 时，除非你显式指定组或选择 **Sync all users** 选项，否则不会添加任何用户或组。

## 同步所有用户

默认情况下，Google Sync 只会添加你选定组中的用户，其中包括选定组下嵌套组的成员。要镜像你所有的 Google Workspace 用户，请启用 **Sync all users** 选项，它会立即开始向你的 tailnet 开通用户。

未启用 **Sync all users** 时，如果用户被移出所有已同步的组，该用户将被暂停（suspend）。如果这不是你想要的行为，请启用 **Sync all users**，或创建一个额外的 Google 组，将所有要同步的用户纳入其中。例如，你可以有一个名为 `all-tailscale-users` 的同步组，包含所有应有 Tailscale 访问权限的用户，然后再用其他组来管理访问控制。

## 管理组

默认情况下，组及其成员不会同步到你的 tailnet，除非你显式选择它们。如果所选组包含嵌套的 Google 组，Tailscale 会为该所选组同步那些嵌套组中的用户。

你必须成为 Tailscale 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能完成这些步骤。

1. 打开管理控制台的 Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Google Sync** 部分，选择  菜单，然后选择 **Manage groups**。

> **注意：**
>
> 如果某个组在 Google Admin Console 中被重命名，引用不会随之改名。你在 Tailscale 访问控制策略中始终使用组的电子邮件地址来引用该组。

## 取消同步未分配的用户

将组及其成员添加到 tailnet 后，如果你想移除先前通过 **Sync all users** 选项添加、但已不属于你所添加组的那些用户，可以使用 **Unsync unassigned users** 选项。

你必须成为 Tailscale 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能完成这些步骤。

1. 打开管理控制台的 Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Google Sync** 部分，选择  菜单，然后选择 **Unsync unassigned users**。

## 强制同步

Google Admin Console 中组内成员与用户的更改每 40 分钟同步到 Tailscale 一次。你也可以强制立即向 Tailscale 同步。

你必须成为 Tailscale 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能完成这些步骤。

1. 打开管理控制台的 Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Google Sync** 部分，选择  菜单，然后选择 **Force sync**。

## 在 tailnet 策略文件中使用组

你可以在 [tailnet 策略文件][docs-tailnet-policy-file]中以人类可读的名称引用来自 Google Workspace 的组。例如：

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

从 Google Workspace 同步的组不会取代 Tailscale 中的[组][docs-policy-syntax-groups]。你可以同时使用 Google Workspace 组同步，并在 tailnet 策略文件中定义组。

## 禁用 Google 用户与组同步

你必须成为 Tailscale 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能完成这些步骤。

1. 打开管理控制台的 Tailscale [User management](https://console.tailscale.com/admin/settings/user-management) 页面。
2. 在 **Google Sync** 部分，选择  菜单，然后选择 **Disable**。
3. 按照提示确认并禁用 Google 用户与组同步。

## 限制

* 可同步的组数量上限为 100 个。
* 在 Google Workspace 中新建组后，必须由 Tailscale 的 [Owner、Admin 或 IT admin][docs-user-roles] 打开 [Google Group Sync](https://console.tailscale.com/admin/settings/user-management) 页面并选择该组，才允许同步该组。
* 与 tailnet 域名不同域的用户会被跳过。
* Google 同步的组不适用于 [Mullvad 出口节点][docs-mullvad-exit-nodes]访问控制策略。

[docs-access-control]: /docs/features/access-control

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-offboarding-users-offboarding-scim]: /docs/features/sharing/how-to/offboard#使用用户与组预配scim时的用户离职处理

[docs-tailnet-policy-file]: /docs/reference/glossary#tailnet-策略文件

[docs-user-roles]: /docs/reference/user-roles

[xt-google-api-scopes]: https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes
