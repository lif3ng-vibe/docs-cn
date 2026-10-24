---
title: "Downgrade your plan"
description: "Use the steps in this section if you are downgrading your paid plan to a different paid plan or the free Personal plan. For information about current Tailscale plans and features, refer to our [Pricin"
---

Last validated Apr 8, 2026

Use the steps in this section if you are downgrading your paid plan to a different paid plan or the free Personal plan. For information about current Tailscale plans and features, refer to our [Pricing][co-pricing] page.

> **Note:**
>
> You need to be an [Owner, Admin, or Billing admin](/docs/reference/user-roles) for your tailnet to downgrade a plan.

> **Note:**
>
> To downgrade to the Personal plan, your tailnet cannot exceed six users. If your tailnet has more than six users, you will need to remove users before downgrading. The Personal plan is not intended for commercial use.

## Considerations

When downgrading your Tailscale plan, consider the following:

* Downgrades take effect at the end of your current billing period. You keep access to your current plan and its features until then, and are not charged a prorated amount.
* Feature availability may change once the downgrade takes effect, depending on the plan you select.
* Monthly users are calculated at the end of the billing cycle.
* You can cancel a scheduled downgrade at any time before it takes effect.

For in-depth details about available plans and features, refer to our [Pricing][co-pricing] page.

## Downgrade a plan

To downgrade your plan:

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. Select **Switch plan**.
3. For the plan you wish to use, select **Downgrade**. Note that not all plans are available for all accounts.
4. If you are downgrading to another paid plan, verify your **Billing email**, **Billing address**, and **Payment method**. Edit these if necessary.
5. Select **Confirm downgrade**.

After you confirm, the downgrade is scheduled and will apply automatically when your current billing period ends. The [Billing](https://console.tailscale.com/admin/settings/billing) page will show a **Scheduled changes** banner with the date the change takes effect. Until that date, your plan, seats, and add-ons remain unchanged.

> **Note:**
>
> If you do not have the option to downgrade a tailnet to the Personal plan, the likeliest reason is that the tailnet is considered commercial and is currently on a paid plan.

## Cancel your subscription

Canceling your paid subscription downgrades your tailnet to the free Personal plan. As with any downgrade, the change takes effect at the end of your current billing period. You keep your paid plan and its features until then.

> **Note:**
>
> The Personal plan is limited to six users and is not intended for commercial use. If your tailnet has more than six users, you'll need to delete or suspend users before you can cancel. Refer to [Deleting and suspending users][docs-remove-team-members] for details.

To cancel your subscription:

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. In the **Your plan** section, select the  menu, then select **Cancel subscription**.
3. Review the details of the Personal plan and the features you'll lose access to, then confirm the cancellation.

Your tailnet stays on its current plan until the end of the billing period, then automatically moves to the Personal plan. A **Scheduled changes** banner appears on the billing page with the effective date. If you change your mind before then, follow [Cancel a scheduled downgrade][ar-cancel-scheduled-downgrade] to keep your current subscription.

> **Note:**
>
> If you already have a scheduled plan downgrade, **Cancel subscription** is disabled. Cancel the scheduled change first (check below), then start the cancellation.

## Cancel a scheduled downgrade

If you change your mind before the downgrade takes effect, you can cancel it:

1. Go to the [Billing](https://console.tailscale.com/admin/settings/billing) page of the admin console.
2. In the **Scheduled changes** banner, select **Cancel scheduled change**.
3. If more than one change is scheduled, for example, a plan downgrade along with an add-on removal, you can cancel individual changes or select **Cancel all scheduled changes**.

Your subscription then continues on its current plan with no further action needed.

[ar-cancel-scheduled-downgrade]: #cancel-a-scheduled-downgrade

[co-pricing]: https://tailscale.com/pricing

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members
