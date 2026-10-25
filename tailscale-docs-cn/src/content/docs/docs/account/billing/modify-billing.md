---
title: "修改你的账单信息"
description: "账单信息仅 Standard、Premium 和 Enterprise 等付费套餐需要。如果你使用的是 Personal 套餐，则无需账单明细。"
---

最后验证于 Apr 8, 2026

账单信息仅 Standard、Premium 和 Enterprise 等付费套餐需要。如果你使用的是 Personal 套餐，则无需账单明细。

> **注意：**
>
> 你需要是[所有者、管理员或账单管理员](/docs/reference/user-roles)才能修改账单信息。
>
> 如果你通过 AWS Marketplace 或 Azure Marketplace 等合作伙伴计划购买了 Tailscale，请通过 AWS 或 Azure 门户更新账单明细。这些账单信息在其各自的合作伙伴门户中管理，而不是在 Tailscale 管理控制台中。

## 更改付款方式

更新订阅所用的付款方式。

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Billing details** 标签页。
3. 在 **Payment method** 区域，选择 **Edit**。
4. 更新你的信息，然后选择 **Save**。

## 更改账单邮箱地址

账单邮箱决定谁来接收与账单相关的邮件。

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Billing details** 标签页。
3. 在 **Payment email** 区域，选择 **Edit**。
4. 更新你的信息，然后选择 **Save**。

另请注意以下几点：

* 你只能添加或修改一个邮箱。如需使用多个账单邮箱，请联系 [Tailscale 支持团队][co-contact-support-billing]。
* 你可以使用不属于你的 tailnet 成员的个人邮箱。例如，你可以为应付账款添加 `ap@example.com`。
* 账单邮箱地址不会改变谁有权修改账单信息。只有[管理员](/docs/reference/user-roles)或最初设置账单的人才能修改账单信息。
* 如果你使用信用卡订阅付款并想更改账单邮箱，请在付款方式区域更新该信用卡对应的邮箱。

## 更改账单姓名和地址

更新发票上显示的姓名和地址。

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Billing details** 标签页。
3. 在 **Name and address** 区域，选择 **Edit**。
4. 更新你的信息，然后选择 **Save**。

更改仅对之后的发票生效，不影响已有发票。

## 管理税务 ID

如果你的账单地址所在的司法管辖区要求 Tailscale 代收销售税，Tailscale 会在每张发票上代收适用的美国和加拿大税款。此规则特别适用于我们的[付费套餐][co-pricing]和付费附加项（例如 [Mullvad 出口节点][docs-mullvad-exit-nodes]），并根据税务 ID 和账单地址计算。

已向 Tailscale 登记免税身份的组织不适用销售税。如果你的组织免税或符合豁免条件，请联系 [Tailscale 支持团队][co-contact-support-billing]，提交你的信息和有效的免税证明副本。

美国销售税仅适用于账单地址位于适用税收的美国司法管辖区的用户。

加拿大销售税仅适用于账单地址位于适用 GST/HST 的加拿大司法管辖区的用户。

### 添加税务 ID 号码

你最多可以添加五个税务 ID。添加税务 ID 后，它会显示在之后的发票上。新添加的税务 ID 无法应用于之前的发票。

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Billing details** 标签页。
3. 在 **Tax IDs** 区域，选择 **Add**。
4. 在 **ID Type** 下拉框中选择你的国家和税务类型，然后选择 **Save**。
5. 在 **ID Type** 输入框中输入税务 ID 号码，然后选择 **Save**。

### 删除税务 ID 号码

要删除已有的税务 ID 号码：

1. 前往管理控制台的 [Billing](https://console.tailscale.com/admin/settings/billing) 页面。
2. 选择 **Billing details** 标签页。
3. 在 **Tax IDs** 区域找到你想删除的税务 ID，然后选择 **Delete**。
4. 选择 **Delete** 确认。

[co-contact-support-billing]: https://tailscale.com/contact/support/?type=billing

[co-pricing]: https://tailscale.com/pricing

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
