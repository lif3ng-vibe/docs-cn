---
title: "联系人偏好设置"
description: "为账户变更、配置问题、安全问题和账单设置联系人。"
---

最后验证于 Jan 5, 2026

当我们发现影响你的 tailnet 的问题且掌握你的联系信息时，会主动与你联系。例如，如果某个安全问题影响了你的 tailnet，而我们留有你的安全联系人邮箱，我们会给你发送邮件。

如果你拥有具备相应访问权限的[用户角色][docs-user-roles]，可以在管理控制台的 [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) 页面添加、查看和更新账户变更、配置问题和安全问题联系人。更新账单联系人的信息，请参阅[账单邮箱][docs-billing-information-billing-email]。

你无法禁用或退订账户变更、配置问题、安全问题或账单邮件。这些邮件通知的是事务性事件，并非营销邮件。

> **注意：**
>
> 如果你使用 GitHub 作为身份提供方，那么除非你在联系人偏好设置中添加了邮箱地址，否则我们没有可用的联系邮箱。

## 联系人邮件的类型

联系人邮件类型包括账户变更、配置问题、安全问题和账单。只有订阅了 [Tailscale 付费套餐][co-pricing]，账单邮件才会启用。

如果某类联系人未设置邮箱，Tailscale 默认将邮件发送到 tailnet 所有者的地址。

### 账户变更邮件

Tailscale 使用账户变更邮件通知你账户的变动。例如，新功能访问请求的批准，或速率限制的变更。

### 配置问题邮件

如果你的 tailnet 配置存在问题，Tailscale 会使用配置问题邮件发出通知。例如，你的 [tailnet 策略文件][docs-acls]存在配置错误。

### 安全问题邮件

Tailscale 使用安全问题邮件通知影响你 tailnet 的安全问题。例如，当某个问题影响到你、我们需要通过邮件发送[安全公告][co-security-bulletins]时。

### 账单邮件

Tailscale 使用账单邮件向你发送发票及其他账单相关邮件。如果你没有订阅 [Tailscale 付费套餐][co-pricing]，你的 tailnet 就不存在账单邮件。

## 设置账户变更邮件

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能更新账户邮箱。

1. 在管理控制台中打开 [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) 页面。

2. 在 **Account changes** 文本框中输入一个邮箱地址。

3. 选择 **Save**。

   新邮箱地址会收到一个验证 URL。

4. 打开验证 URL 以确认该邮箱地址。如果邮箱地址未通过验证，Tailscale 会将新的账户变更邮件发送到上一个已验证的账户邮箱（如果此前没有已验证的账户变更邮箱，则发送到 tailnet 所有者邮箱）。

新邮箱地址通过验证后，Tailscale 之后的账户变更邮件都会使用它。

## 设置配置问题邮件

你需要是 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能更新支持邮箱。

1. 在管理控制台中打开 [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) 页面。

2. 在 **Configuration issues** 文本框中输入一个邮箱地址。

3. 选择 **Save**。

   新邮箱地址会收到一个验证 URL。

4. 打开验证 URL 以确认该邮箱地址。如果邮箱地址未通过验证，Tailscale 会将新的配置问题邮件发送到上一个已验证的配置问题邮箱（如果此前没有已验证的配置问题邮箱，则发送到 tailnet 所有者邮箱）。

新邮箱地址通过验证后，Tailscale 之后的支持问题邮件都会使用它发送。

## 设置安全问题邮件

你需要是 tailnet 的 [Owner 或 Admin](/docs/reference/user-roles) 才能更新安全邮箱。

1. 在管理控制台中打开 [Contact preferences](https://console.tailscale.com/admin/settings/contact-preferences) 页面。

2. 在 **Security issues** 文本框中输入一个邮箱地址。

3. 选择 **Save**。

   新邮箱地址会收到一个验证 URL。

4. 打开验证 URL 以确认该邮箱地址。如果邮箱地址未通过验证，Tailscale 会将新的安全问题邮件发送到上一个已验证的安全问题邮箱（如果此前没有已验证的安全问题邮箱，则发送到 tailnet 所有者邮箱）。

新邮箱地址通过验证后，Tailscale 之后的安全问题邮件都会使用它发送。

## 设置账单邮箱

关于更新账单联系人偏好的信息，请参阅[账单邮箱][docs-billing-information-billing-email]。

## 联系人偏好更新与验证的审计日志

在[配置审计日志][docs-audit-logging]中，只要联系人偏好发生变更，Tailscale 就会在审计日志中记录一个操作，包括更新与验证。日志条目会显示谁执行了操作以及操作发生的时间。对于联系人偏好更新，日志条目还会显示邮箱地址的新值和旧值。

## 限制

* 账户变更、配置问题、安全问题和账单联系人可以各不相同，但每类联系人只能设置一个邮箱。如果希望通知多名用户，可以考虑使用邮件组。例如，安全问题通知使用 `security@example.com` 而不是 `alice@example.com`。
* 账户变更、配置问题和安全问题邮件无法禁用或退订。这些是事务性邮件，即使你退订了营销邮件，它们也始终会发送。同样，如果你按发票付款，账单通知也无法禁用或退订。

[co-pricing]: https://tailscale.com/pricing

[co-security-bulletins]: https://tailscale.com/security-bulletins

[docs-acls]: /docs/features/access-control/acls

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-billing-information-billing-email]: /docs/account/billing/modify-billing#change-the-billing-email-address

[docs-user-roles]: /docs/reference/user-roles
