---
title: "已达到使用上限"
description: "本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，"
---

最后验证于 Jul 31, 2025

本主题解释可能出现在 Tailscale 管理控制台中的消息，以及你可以采取的应对措施。有关 Tailscale 管理控制台和客户端中当前已收录的消息列表，请参阅主 [消息][docs-messages] 主题。

## 管理控制台中显示的消息

Reached use limit

## 为什么会看到这条消息

出现此问题的原因可能有：

* 你尝试添加的用户数超出了当前套餐允许的数量。这种情况在 Personal 套餐的 tailnet 中最常见。Personal 套餐提供 6 个免费用户名额。
* 你的账户在套餐变更后未正确更新。例如，从 Personal 套餐升级到 Standard 套餐时。
* 你组织的策略中可能存在限制或阻止访问 tailnet 的使用条款。

## 处理方法

你可以尝试以下方法来解决此问题：

* 如果你的 tailnet 使用的是 Personal 套餐，可以升级套餐以容纳更多用户。也可以移除不需要的用户，再添加新用户。
* 如果你是在 Standard、Premium 或 Enterprise 套餐的 tailnet 上看到这条消息，那么你的账户很可能存在配置问题，因为这些套餐没有用户数量限制。要解决此问题，请联系 [Tailscale 支持][co-support]。
* 联系你的 IT 管理员，确认你的自定义/私有域名是否存在与 Tailscale 身份验证相关的限制。

## 更多信息

* 有关我们提供的套餐的信息，请参阅 [定价][co-pricing] 页面。
* 有关升级的信息，请参阅 [升级你的套餐][docs-plan-upgrade]。

[co-pricing]: https://tailscale.com/pricing

[co-support]: https://tailscale.com/support

[docs-plan-upgrade]: /docs/account/manage-plans/upgrade-plan

[docs-messages]: /docs/reference/messages
