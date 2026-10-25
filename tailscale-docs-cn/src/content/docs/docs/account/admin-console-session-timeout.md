---
title: "管理控制台会话超时"
description: "了解 Tailscale 管理控制台中的空闲会话超时。"
---

最后验证于 Jan 5, 2026

> **注意：** 管理控制台会话超时功能适用于[所有套餐](https://tailscale.com/pricing)。

默认情况下，Tailscale [管理控制台](https://console.tailscale.com/admin)会话会在初次登录 [30 天后过期][docs-session-expiry]。tailnet 的[所有者和管理员][docs-roles]可以配置会话超时，更改 Tailscale 为 tailnet 成员使会话过期之前所要求的非活动时长。此设置适用于 tailnet 的所有成员，包括[所有者和管理员][docs-roles]。

> **注意：**
>
> 管理控制台会话超时不影响用户的[节点密钥过期][docs-key-expiry]（node key expiry）。

## 启用会话超时

1. 打开管理控制台的[用户管理](https://console.tailscale.com/admin/settings/user-management)页面。
2. 在 **Admin Console Session Timeout** 下的 **Set an inactivity period** 中选择一个超时值。

超时值可设置为 5 分钟到 30 天之间。只有 tailnet 的所有者、管理员和 IT 管理员可以配置该超时。

## 禁用会话超时

1. 打开管理控制台的[用户管理](https://console.tailscale.com/admin/settings/user-management)页面。
2. 在 **Admin Console Session Timeout** 下选择 **Edit**。
3. 选择 **Disable**。

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-roles]: /docs/reference/user-roles#roles

[docs-session-expiry]: /docs/reference/admin-console-session-expiry
