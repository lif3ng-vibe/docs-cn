---
title: "更改用户角色"
description: "你可以更改网络中用户的角色，以限制其对管理控制台的访问。（要限制 tailnet 中哪些用户和设备可以相互通信，请参阅访问控制策略。）"
---

最后验证于 Jan 5, 2026

你可以更改网络中用户的[角色][docs-user-roles]（role），以限制其对管理控制台的访问。（要限制 tailnet 中哪些用户和设备可以相互通信，请参阅[访问控制策略][docs-access-control]。）

要移除或停用用户，请参阅[移除与停用用户][docs-remove-team-members]。

## 更改用户的角色

你需要是 tailnet 的 [Owner（所有者）、Admin（管理员）或 IT admin（IT 管理员）](/docs/reference/user-roles)，才能更改用户的角色。

你可以在[管理控制台](https://console.tailscale.com/admin)中更改用户的角色：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 找到目标用户所在的行。
3. 选择最右侧的菜单，然后选择 **Edit role** 选项。
4. 选择你想赋予该用户的角色，然后选择 **Save**：

   *（图：为用户选择一个角色。）*

> **注意：**
>
> 用户不能更改自己的角色。

## 更改 Owner

你需要是 tailnet 的 [Owner（所有者）](/docs/reference/user-roles)，才能更改 Owner。

你可以在[管理控制台](https://console.tailscale.com/admin)中更改用户的角色：

1. 打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。
2. 找到目标用户所在的行。
3. 选择最右侧的菜单，然后选择 **Edit role** 选项。
4. 选择 **Owner**，然后选择 **Save**。

   *（图：将 Owner 角色重新指派给某个用户。）*

### 更改 Owner 的限制

* 如果你的 tailnet 使用共享域名（例如 `gmail.com`），你无法更改 tailnet 的所有者。
* 如果你的 tailnet 使用自定义域名，你只能把所有者更改为同一域名下的用户。

[docs-access-control]: /docs/features/access-control

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-user-roles]: /docs/reference/user-roles
