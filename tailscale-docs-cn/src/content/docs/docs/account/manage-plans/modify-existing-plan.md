---
title: "修改现有套餐"
description: "你可以随时更新 Tailscale 套餐，调整席位数或添加 Mullvad 出口节点等功能。更改立即生效，并根据你的账单周期按比例计费。"
---

最后验证于 Apr 8, 2026

你可以随时更新 Tailscale 套餐，调整席位数或添加 Mullvad 出口节点等功能。更改立即生效，并根据你的账单周期按比例计费。

> **注意：**
>
> 你无法为 Personal 套餐添加席位。如果你想在 tailnet 中拥有超过 6 个免费用户，必须升级套餐。

> **注意：**
>
> 你需要是你 tailnet 的[所有者、管理员或账单管理员](/docs/reference/user-roles)才能修改现有套餐。

## 注意事项

在更新 Tailscale 套餐时，请注意以下几点：

* 功能可用性可能会因你选择的套餐而变化。
* 月度用户数在账单周期结束时计算。
* 费用按你在账单周期内各套餐上使用的时间按比例计算。

有关可用套餐和功能的详细信息，请参阅我们的[定价][co-pricing]页面。

## 添加或移除席位

如果你正在使用付费套餐，并想为 tailnet 添加更多席位：

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Edit amount**。
3. 在 **New total seats** 中，输入你想要的 tailnet 总席位数。
4. 选择 **Continue to payment details**。
5. 核对你的邮箱地址、账单地址和付款方式，然后选择 **Confirm changes**。

这些更改会立即生效，你可以立即开始添加更多用户。

## 添加 Mullvad 出口节点

你可以在 tailnet 中购买 Mullvad VPN 许可证，让设备使用 [Mullvad 出口节点][docs-mullvad-exit-nodes]。Mullvad 许可证按设备而非用户计算。这意味着你可以根据 tailnet 中设备的需求购买任意数量的许可证。

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Purchase Mullvad VPN**。
3. 在 **Mullvad VPN** 区域，选择你想购买的许可证数量。每次必须以 5 个许可证为增量进行选择。
4. 在 **Billing details** 中，如果管理控制台中尚未添加你的邮箱和账单地址，请先添加，然后选择 **Continue to payment details**。
5. 在 **Payment information** 中，如果管理控制台中尚未添加你的信用卡或银行信息，请先添加，然后选择 **Confirm add-on purchase**。

购买确认后，你可以前往管理控制台的 [Configure Mullvad VPN](https://console.tailscale.com/admin/settings/general/mullvad) 页面，指派可以使用 Mullvad 出口节点的设备。

[co-pricing]: https://tailscale.com/pricing

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
