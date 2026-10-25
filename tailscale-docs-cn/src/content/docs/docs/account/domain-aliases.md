---
title: "域别名"
description: "了解域别名对 tailnet 的工作方式，以及它们会在哪些方面影响 Tailscale 的行为。"
---

最后验证于 May 11, 2026

创建 Tailscale 网络（即 tailnet）时，第一个用户的电子邮箱地址的域名会被设为主域名（primary domain）。例如，如果 `bob@example.com` 创建了一个 tailnet，该 tailnet 的域名就是 `example.com`。如果你的身份提供方（IdP）中有用户的邮箱地址使用其他域名（例如 `example.io`），你可以在 tailnet 中创建一个域别名（domain alias），让这些用户也能登录该 tailnet。一旦创建了域别名，组织之外的其他 tailnet 就无法使用该域名进行身份验证。

> **注意：**
>
> 只能为用户使用自定义域（如 `example.com`）下账户登录的 tailnet 创建域别名。共享域名 tailnet（例如使用 `@gmail.com` 地址创建的）无法设置域别名。使用 GitHub 作为身份提供方的 tailnet 也无法使用域别名。

*（图：示意图，展示一家公司拥有两个域名下的用户 example.com 和 example.io，其中 example.com 为主域名；只有将 example.io 添加为域别名后，example.io 域名下的用户才能通过 tailnet 的身份验证。）*

## 创建域别名

你需要是 tailnet 的[所有者或管理员](/docs/reference/user-roles)才能创建域别名。

1. 打开 [Domains](https://console.tailscale.com/admin/settings/domains) 页面。
2. [验证][docs-domain-verification]你想添加为域别名的域名。
3. 域名成功验证后，选择  菜单，然后选择 **Set as domain alias**。
4. 确认你要启用该域别名。

## 移除域别名

你需要是 tailnet 的[所有者或管理员](/docs/reference/user-roles)才能移除域别名。

1. 打开 [Domains](https://console.tailscale.com/admin/settings/domains) 页面。
2. 找到你想移除的域别名，选择  菜单，然后选择 **Remove domain alias**。
3. 如果有用户与该别名关联，可选择勾选复选框，将这些用户也从 tailnet 中删除。如果你选择不删除这些用户，该域名下的现有用户仍能登录该 tailnet，但原别名域名下的新用户将无法登录。
4. 输入域名以确认，然后选择 **Remove alias**。

## 处理旧版域别名

如果你此前是通过直接联系我们的支持团队配置的域别名，该别名会显示在 [Domains](https://console.tailscale.com/admin/settings/domains) 页面上，并带有 **Legacy** 标识。虽然它不被视为已主动验证，但该域别名仍然生效。你可以选择  菜单并选择 **Verify** 来更新此域别名的验证。

你也可以在 [Domains](https://console.tailscale.com/admin/settings/domains) 页面上移除旧版域别名。此选项的行为与移除已主动验证域名的域别名相同。

## 限制

* 只能为使用自定义域的 tailnet 创建域别名。
* 使用 GitHub 作为身份提供方的 tailnet 不能创建域别名。

[docs-domain-verification]: /docs/account/domain-verification
