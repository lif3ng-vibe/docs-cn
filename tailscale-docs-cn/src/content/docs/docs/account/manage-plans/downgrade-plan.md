---
title: "降级你的套餐"
description: "如果你要将付费套餐降级为其他付费套餐或免费的 Personal 套餐，请使用本节中的步骤。有关 Tailscale 当前套餐和功能的信息，请参阅我们的定价"
---

最后验证于 Apr 8, 2026

如果你要将付费套餐降级为其他付费套餐或免费的 Personal 套餐，请使用本节中的步骤。有关 Tailscale 当前套餐和功能的信息，请参阅我们的[定价][co-pricing]页面。

> **注意：**
>
> 你需要是你 tailnet 的[所有者、管理员或账单管理员](/docs/reference/user-roles)才能降级套餐。

> **注意：**
>
> 要降级到 Personal 套餐，你的 tailnet 不能超过 6 个用户。如果你的 tailnet 用户超过 6 个，你需要先移除用户再降级。Personal 套餐不适用于商业用途。

## 注意事项

在降级 Tailscale 套餐时，请注意以下几点：

* 降级将在你当前账单周期结束时生效。在此之前你仍可使用当前套餐及其功能，且不会按比例收取差额。
* 降级生效后，功能可用性可能会发生变化，具体取决于你选择的套餐。
* 月度用户数在账单周期结束时计算。
* 你可以在已计划的降级生效前随时取消。

有关可用套餐和功能的详细信息，请参阅我们的[定价][co-pricing]页面。

## 降级套餐

要降级你的套餐：

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Switch plan**。
3. 对于你想使用的套餐，选择 **Downgrade**。请注意，并非所有套餐对所有账户都可用。
4. 如果你降级到其他付费套餐，请核对 **Billing email**、**Billing address** 和 **Payment method**，必要时进行修改。
5. 选择 **Confirm downgrade**。

确认后，降级会被排期，并在你当前账单周期结束时自动生效。[Billing](https://console.tailscale.com/admin/settings/billing) 页面会显示一个 **Scheduled changes** 横幅，注明更改生效的日期。在该日期之前，你的套餐、席位和附加项保持不变。

> **注意：**
>
> 如果你没有将 tailnet 降级到 Personal 套餐的选项，最可能的原因是该 tailnet 被视为商业用途，目前处于付费套餐上。

## 取消你的订阅

取消你的付费订阅会将 tailnet 降级为免费的 Personal 套餐。与任何降级一样，该更改在当前账单周期结束时生效。在此之前你仍保留付费套餐及其功能。

> **注意：**
>
> Personal 套餐限制为 6 个用户，且不适用于商业用途。如果你的 tailnet 用户超过 6 个，你需要先删除或停用用户才能取消。详情请参阅[删除和停用用户][docs-remove-team-members]。

要取消你的订阅：

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 在 **Your plan** 区域，选择  菜单，然后选择 **Cancel subscription**。
3. 查看 Personal 套餐的详情以及你将失去的功能，然后确认取消。

你的 tailnet 在账单周期结束前保持在当前套餐，之后自动转为 Personal 套餐。账单页面上会出现一个 **Scheduled changes** 横幅，注明生效日期。如果你在此之前改变主意，按照[取消已计划的降级][ar-cancel-scheduled-downgrade]操作即可保留当前订阅。

> **注意：**
>
> 如果你已有排期中的套餐降级，**Cancel subscription** 会被禁用。请先取消已排期的更改（见下文），再开始取消操作。

## 取消已计划的降级

如果你在降级生效前改变主意，可以取消它：

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 在 **Scheduled changes** 横幅中，选择 **Cancel scheduled change**。
3. 如果排期中有多个更改，例如套餐降级加附加项移除，你可以取消单个更改，或选择 **Cancel all scheduled changes**。

之后你的订阅将继续保持在当前套餐上，无需进一步操作。

[ar-cancel-scheduled-downgrade]: #取消已计划的降级

[co-pricing]: https://tailscale.com/pricing

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members
