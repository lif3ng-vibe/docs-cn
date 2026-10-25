---
title: "通过 Aperture 购买 token"
description: "通过 Aperture 为模型使用购买 token，或继续使用你自己支持的服务提供商。"
---

最后验证于 Sep 28, 2026

可以通过 Aperture 购买模型使用所需的 token。

每位用户起始赠送 $1 的 token。你也可以不购买 token，改为将 Aperture 与任何受支持的服务提供商搭配使用。Chat 默认启用 `openai/gpt-5.6-luna`。首次成功购买 token 后，Aperture 会为你的网关解锁更多模型。

## 前提条件

* 你已有一个 Aperture 网关。
* 你对 Aperture 网关位于 `/admin/settings/billing` 的 **Billing** 页面拥有管理员访问权限。
* 你能够完成支付流程。

## 限制

* 单次 token 最低购买额为 **$10**。
* 单次 token 最高购买额为 **$25**。
* 可用模型取决于你是否已完成首次 token 购买。
* Aperture 接受来自美国、加拿大、欧盟成员国、英国、瑞士、挪威、澳大利亚、新西兰、新加坡、中国台湾和日本的付款。

## 购买 token

在 Aperture 管理仪表板中，打开 **Administration** > **Billing**（`/admin/settings/billing`）。

1. 在 **Purchase credits** 区域，在 **Credit amount** 中输入金额。
2. 选择 **Purchase**。
3. 完成支付流程。

支付成功后，Aperture 中的余额和 **Credit history** 会随之更新。

## 跟踪用量与余额

Aperture 会根据你的模型使用成本从余额中扣除 token。

通过 **Billing** 页面查看当前余额和 **Credit history**，包括初始赠送 token、购买记录、自动充值记录以及（如可用）收据。

要查看模型用量和预估支出，请打开位于 `/admin/adoption` 的 **Usage & Adoption** > **Usage Overview**。

## 配置自动充值

自动充值会在你的余额达到或低于所选阈值时自动添加 token。**Billing** 页面将此功能称为 **Automatic reload**。

1. 打开 **Administration** > **Billing**。
2. 在 **Automatic reload** 区域，将 **Trigger at or below** 设置为余额阈值。
3. 将 **Reload amount** 设置为余额达到该阈值时要添加的金额。
4. 将 **30-day reload limit** 设置为 30 天内自动充值可支出的最高金额。设为 0 将禁用自动充值。
5. 选择 **Save automatic reload**。

完成一次 token 购买后，符合条件的账户可以使用已保存的付款方式进行后续自动充值。移除该付款方式会禁用自动充值。

## 常见问题

在此查找关于模型可用性、余额不足和账单支持的解答。

### 为什么只有一个模型可用？

新建的 Aperture 网关默认只启用一个模型，让你可以立即开始对话。

### 更多模型何时解锁？

首次成功购买 token 后即可使用更多模型。

### 余额不足时会发生什么？

如果你已配置自动充值，当余额达到或低于所选阈值时，Aperture 会自动添加 token。否则，请在 **Billing** 页面购买 token。

### 如何获取帮助？

如需账单、付款或 Aperture 余额方面的帮助，请联系 Tailscale 支持团队。
