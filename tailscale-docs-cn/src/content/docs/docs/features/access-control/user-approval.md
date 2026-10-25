---
title: "用户审批"
description: "用户审批功能让 Tailscale 网络管理员可以在新用户加入 Tailscale 网络（即 tailnet）之前进行审核与批准。"
---

最后验证于 Sep 25, 2025

用户审批功能让 Tailscale 网络管理员可以在新用户加入 Tailscale 网络（即 tailnet）之前进行审核与批准。

> **注意：** 此功能适用于[所有套餐](https://tailscale.com/pricing)。

启用用户审批后，新用户首次登录 tailnet 时，其状态会被设为"待审批"。在未获批准的状态下，用户可以将设备连接到 Tailscale 协调服务器（coordination server），但无法连接 tailnet 中的其他设备。tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 可以查看用户信息，将用户状态设为已批准，或移除该用户。

> **注意：**
>
> 对于 2025 年 5 月 22 日及以后创建的 tailnet，用户审批默认启用。对于在此之前创建的 tailnet，用户审批默认关闭。

## 为你的网络启用用户审批

你需要成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能启用用户审批。

要启用用户审批，请打开管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面，并启用 **User Approval**。

启用此设置后，访问你的网络的新用户在获得批准之前，无法与其他设备收发流量。新用户登录时，其设备会以 **User needs approval** 徽标显示在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。你可以[使用筛选器](https://console.tailscale.com/admin/machines/?q=disabled%3Auser-needs-approval)找出所有带有 **User needs approval** 徽标的机器。

## 批准待审批用户

你需要成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能批准用户。

要批准用户，请打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。列表顶部会显示带有 **Needs approval** 徽标的用户。你可以按用户名查找该用户，也可以使用 [`status:needsapproval`](https://console.tailscale.com/admin/users?q=status%3Aneedsapproval) 筛选器。

在决定是否批准之前，你可以查看该用户的详细信息。你还可以更改要分配给该用户的角色。例如，Admin 可以在批准用户之前，把待审批用户的角色从 Member 改为 IT admin。

准备好批准该用户时，选择菜单并选择 **Approve**，允许该用户连接到你的网络。

批准后，用户将立即能够连接。

## 移除待审批用户

你需要成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能移除状态为待审批的用户。

要移除用户，请打开管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面。列表顶部会显示带有 **Needs approval** 徽标的用户。你可以按用户名查找该用户，也可以使用 [`status:needsapproval`](https://console.tailscale.com/admin/users?q=status%3Aneedsapproval) 筛选器。

对于要移除的用户，选择其菜单并选择 **Remove**。

注意，移除待审批用户并不能阻止他们再次尝试登录（再次进入待审批状态）。

## 为你的网络禁用用户审批

你需要成为 tailnet 的 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 才能禁用用户审批。

要禁用用户审批，请打开管理控制台的 [User management](https://console.tailscale.com/admin/settings/user-management) 页面，并关闭 **User Approval**。

## 对其他功能的影响

如果你为 tailnet 启用了[用户与组预配置][docs-user-group-provisioning]，就无法启用用户审批，因为两者不能同时启用。如果先启用了用户审批、之后又启用用户与组预配置，用户审批功能将被禁用——你需要手动批准或移除状态仍为待审批的用户。

## 限制

tailnet 只能在用户审批和[用户与组预配置][docs-user-group-provisioning]之间二选一启用，不能同时启用两者。

[docs-user-group-provisioning]: /docs/features/user-group-provisioning
