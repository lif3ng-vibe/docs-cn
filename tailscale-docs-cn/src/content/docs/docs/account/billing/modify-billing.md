---
title: "Modify your billing information"
description: "Billing information is only required for paid plans such as Standard, Premium, and Enterprise. If you're using the Personal plan, no billing details are needed."
---

Last validated Apr 8, 2026

Billing information is only required for paid plans such as Standard, Premium, and Enterprise. If you're using the Personal plan, no billing details are needed.

> **Note:**
>
> You need to be an [Owner, Admin, or Billing admin](/docs/reference/user-roles) to modify billing information.
>
> If you purchased Tailscale through a partner program such as AWS Marketplace or Azure Marketplace, update your billing details through the AWS or Azure portal. This billing information is managed in their respective partner portal, not the Tailscale admin console.

## Change a payment method

Update the payment method used for your subscription.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select the **Billing details** tab.
3. In the **Payment method** section, select **Edit**.
4. Update your information, and select **Save**.

## Change the billing email address

The billing email determines who receives billing-related communications.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select the **Billing details** tab.
3. In the **Payment email** section, select **Edit**.
4. Update your information, and select **Save**.

Also note the following:

* You can add or modify only one email. To use more than one billing email, contact [Tailscale Support][co-contact-support-billing].
* You can use an email for an individual that isn't a member of your tailnet. For example, you can add `ap@example.com` for an accounts payable.
* The billing email address doesn't change who can modify billing information. Only [Admins](/docs/reference/user-roles) or whoever set up billing can modify billing information.
* If you are paying by credit card subscription and want to change the billing email, update the email for the credit card in the payment method section.

## Change the billing name and address

Update the name and address shown on invoices.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select the **Billing details** tab.
3. In the **Name and address** section, select **Edit**.
4. Update your information, and select **Save**.

Changes apply only to future invoices and do not affect existing invoices.

## Manage tax IDs

Tailscale collects applicable US and Canadian taxes on each invoice if your billing address is in a jurisdiction that requires Tailscale to collect sales tax. This specifically applies to our [paid plans][co-pricing] and paid add-ons, such as [Mullvad exit nodes][docs-mullvad-exit-nodes], and is calculated based on tax ID and billing address.

Sales tax does not apply to organizations that have recorded their tax-exempt status with Tailscale. If your organization is tax-exempt or qualifies for an exemption, contact [Tailscale Support][co-contact-support-billing] to send your information and a copy of your valid tax exemption certificate.

US sales tax applies only to users whose billing address is in a US jurisdiction where taxes are applicable.

Canadian sales tax applies only to users whose billing address is in a Canadian jurisdiction where GST/HST is applicable.

### Add a tax ID number

You can add a maximum of five tax IDs. Once you add a tax ID, it will display on future invoices. Newly added tax IDs cannot be applied to previous invoices.

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select the **Billing details** tab.
3. In the **Tax IDs** section, select **Add**.
4. In the **ID Type** drop-down, select your country and tax type, then select **Save**.
5. In the **ID Type** box, enter the tax ID number, then select **Save**.

### Delete a tax ID number

To delete an existing tax ID number:

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select the **Billing details** tab.
3. In the **Tax IDs** section, locate the tax ID you want to delete, then select **Delete**.
4. Select **Delete** to confirm.

[co-contact-support-billing]: https://tailscale.com/contact/support/?type=billing

[co-pricing]: https://tailscale.com/pricing

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes
