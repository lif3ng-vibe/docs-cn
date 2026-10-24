---
title: "Modify an existing plan"
description: "You can update your Tailscale plan at any time to adjust the number of seats or add features like Mullvad exit nodes. Changes take effect immediately and are prorated based on your billing cycle."
---

Last validated Apr 8, 2026

You can update your Tailscale plan at any time to adjust the number of seats or add features like Mullvad exit nodes. Changes take effect immediately and are prorated based on your billing cycle.

> **Note:**
>
> You cannot add seats to the Personal plan. If you want more than the six free users in your tailnet, you must upgrade your plan.

> **Note:**
>
> You need to be an [Owner, Admin, or Billing admin](/docs/reference/user-roles) for your tailnet to modify your existing plan.

## Considerations

When updating your Tailscale plan consider the following:

* Feature availability may change depending on the plan you select.
* Monthly user counts are calculated at the end of the billing cycle.
* Charges are prorated based on time spent on each plan during the billing period.

For in-depth details about available plans and features, refer to our [Pricing][co-pricing] page.

## Add or remove seats

If you are on a paid plan and want to add more seats for your tailnet:

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select **Edit amount**.
3. In **New total seats**, enter the total amount of seats that you want for your tailnet.
4. Select **Continue to payment details**.
5. Verify your email address, billing address, and payment method, then select **Confirm changes**.

These changes are instant and you can begin adding more users immediately.

## Add Mullvad exit nodes

You can purchase licenses for Mullvad VPN in your tailnet to let devices use [Mullvad exit nodes][docs-mullvad-exit-nodes]. Mullvad licensing is based on devices and not users. This means you can purchase as many licenses as you need for the devices in your tailnet.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select **Purchase Mullvad VPN**.
3. In the **Mullvad VPN** section, select the number of licenses that you want to purchase. You must choose increments of five licenses at a time.
4. In **Billing details**, add your email and billing address if it's not already added in the admin console, then select **Continue to payment details**.
5. In **Payment information**, add your credit card or banking information if it's not already added in the admin console, then select **Confirm add-on purchase**.

After your purchase is confirmed, you can go to the [Configure Mullvad VPN](https://console.tailscale.com/admin/settings/general/mullvad) page of the admin console and assign the devices that can use Mullvad exit nodes.

[co-pricing]: https://tailscale.com/pricing

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
