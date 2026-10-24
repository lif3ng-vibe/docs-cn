---
title: "Buy tokens through Aperture"
description: "Buy tokens through Aperture for model usage, or continue using your own supported providers."
---

Last validated Sep 28, 2026

Use Aperture to buy tokens for model usage.

Each user starts with $1 in tokens. You can also use Aperture with any supported provider instead of buying tokens. Chat starts with `openai/gpt-5.6-luna` enabled by default. After your first successful token purchase, Aperture unlocks more models for your gateway.

## Prerequisites

* You have an Aperture gateway.
* You have admin access to the Aperture gateway's **Billing** page at `/admin/settings/billing`.
* You can complete the payment flow.

## Limitations

* The minimum token purchase is **$10**.
* The maximum token purchase is **$25**.
* Available models depend on whether you have completed your first token purchase.
* Aperture accepts payments from the US, CA, EU member states, GB, CH, NO, AU, NZ, SG, TW, and JP.

## Buy tokens

In the Aperture admin dashboard, open **Administration** > **Billing** (`/admin/settings/billing`).

1. Under **Purchase credits**, enter the amount in **Credit amount**.
2. Select **Purchase**.
3. Complete the payment flow.

After payment succeeds, your balance and **Credit history** update in Aperture.

## Track usage and balance

Aperture deducts tokens from your balance based on the cost of your model usage.

Use **Billing** to view your current balance and **Credit history**, including starter tokens, purchases, automatic reloads, and receipts when available.

To review model usage and estimated spending, open **Usage & Adoption** > **Usage Overview** at `/admin/adoption`.

## Configure auto top-up

Auto top-up adds tokens automatically when your balance reaches or falls below the threshold you choose. The **Billing** page calls this **Automatic reload**.

1. Open **Administration** > **Billing**.
2. Under **Automatic reload**, set **Trigger at or below** to the balance threshold.
3. Set **Reload amount** to the amount to add when your balance reaches that threshold.
4. Set **30-day reload limit** to the maximum amount to spend on automatic reloads in 30 days. A value of zero disables automatic reload.
5. Select **Save automatic reload**.

After a completed token purchase, eligible accounts can use a saved payment method for future automatic reloads. Removing that payment method disables automatic reload.

## FAQ

Find answers about model availability, low balances, and billing support.

### Why is only one model available?

New Aperture gateways begin with one model enabled so you can start chatting immediately.

### When do more models unlock?

More models become available after your first successful token purchase.

### What happens when my balance gets low?

If you have configured auto top-up, Aperture can add tokens automatically when your balance reaches or falls below your chosen threshold. Otherwise, buy tokens from the **Billing** page.

### How can I get help?

Contact Tailscale support for help with billing, payments, or your Aperture balance.
