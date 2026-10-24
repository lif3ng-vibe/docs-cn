---
title: "Tailscale on Azure Marketplace"
description: "You can set up Tailscale billing through the Microsoft Azure Marketplace."
---

Last validated Dec 20, 2024

You can set up Tailscale billing through the Microsoft Azure Marketplace.

## Prerequisites

* You must have an Azure account.
* Your Azure Account ID must have a Billing ID with an active billing profile aligned to it.

## Purchase Tailscale on Azure Marketplace

To set up billing for Tailscale from the Azure Marketplace:

1. Go to the [**Tailscale Plans + Pricing**][xt-azure-marketplace-tailscale] page in Azure Marketplace.
2. Find the plan you want to buy and select **Get it now**.
3. Respond to the prompts, read the policies, and accept the agreement if you agree.

## Manage billing information and invoices

If you purchased Tailscale through the Azure Marketplace, manage your billing details and get invoices through the [Azure portal][xt-azure-portal]. This billing information is managed in the Azure portal, not the Tailscale admin console.

## Cancel your Tailscale subscription on Azure Marketplace

> **Note:**
>
> Canceling your Tailscale billing subscription on Azure Marketplace does not delete your Tailscale network (known as a tailnet). For information about deleting your tailnet, refer to [Delete your tailnet][docs-delete-tailnet].

To remove your billing subscription from Azure Marketplace:

1. Go to the [**SaaS**][xt-azure-marketplace-saas] page in the [Azure portal][xt-azure-portal].
2. Select the name of your Tailscale subscription and select **Delete**. You specified the name when you made your subscription.
3. If you also want to delete your Tailscale network, refer to [Delete your tailnet][docs-delete-tailnet].

## Considerations

If you would like to discuss Tailscale custom pricing or a private offer by using the Microsoft Azure Marketplace, email `partnerships@tailscale.com`.

[docs-delete-tailnet]: /docs/account/delete-tailnet

[xt-azure-marketplace-saas]: https://portal.azure.com/#view/HubsExtension/BrowseResourceBlade/resourceType/Microsoft.SaaS%2Fresources

[xt-azure-marketplace-tailscale]: https://azuremarketplace.microsoft.com/en/marketplace/apps/tailscale1616171838087.tailscale_flat_rate_pricing?tab=PlansAndPrice

[xt-azure-portal]: https://portal.azure.com/
