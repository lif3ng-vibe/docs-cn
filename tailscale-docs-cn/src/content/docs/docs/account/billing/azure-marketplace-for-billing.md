---
title: "Azure Marketplace 上的 Tailscale"
description: "你可以通过 Microsoft Azure Marketplace 设置 Tailscale 账单。"
---

最后验证于 Dec 20, 2024

你可以通过 Microsoft Azure Marketplace 设置 Tailscale 账单。

## 前提条件

* 你必须拥有一个 Azure 账户。
* 你的 Azure 账户 ID 必须关联一个带有生效计费配置文件的 Billing ID。

## 在 Azure Marketplace 上购买 Tailscale

要从 Azure Marketplace 为 Tailscale 设置账单：

1. 前往 Azure Marketplace 中的 [**Tailscale Plans + Pricing**][xt-azure-marketplace-tailscale] 页面。
2. 找到你想购买的套餐，选择 **Get it now**。
3. 按提示操作，阅读相关政策，如果你同意该协议则予以接受。

## 管理账单信息和发票

如果你是通过 Azure Marketplace 购买的 Tailscale，请通过 [Azure 门户][xt-azure-portal]管理账单明细并获取发票。这些账单信息在 Azure 门户中管理，而不是在 Tailscale 管理控制台中。

## 在 Azure Marketplace 上取消你的 Tailscale 订阅

> **注意：**
>
> 在 Azure Marketplace 上取消你的 Tailscale 账单订阅并不会删除你的 Tailscale 网络（即 tailnet）。有关删除 tailnet 的信息，请参阅[删除你的 tailnet][docs-delete-tailnet]。

要从 Azure Marketplace 移除你的账单订阅：

1. 前往 [Azure 门户][xt-azure-portal]中的 [**SaaS**][xt-azure-marketplace-saas] 页面。
2. 选择你的 Tailscale 订阅的名称，然后选择 **Delete**。该名称是你在创建订阅时自行指定的。
3. 如果你还想删除自己的 Tailscale 网络，请参阅[删除你的 tailnet][docs-delete-tailnet]。

## 注意事项

如果你想通过 Microsoft Azure Marketplace 洽谈 Tailscale 定制定价或私有要约（private offer），请发送邮件至 `partnerships@tailscale.com`。

[docs-delete-tailnet]: /docs/account/delete-tailnet

[xt-azure-marketplace-saas]: https://portal.azure.com/#view/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.SaaS%2Fresources

[xt-azure-marketplace-tailscale]: https://azuremarketplace.microsoft.com/en/marketplace/apps/tailscale1616171838087.tailscale_flat_rate_pricing?tab=PlansAndPrice

[xt-azure-portal]: https://portal.azure.com/
