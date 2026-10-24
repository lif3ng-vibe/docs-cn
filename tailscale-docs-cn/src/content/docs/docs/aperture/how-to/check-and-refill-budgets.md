---
title: "Check and refill budgets"
description: "After you configure [per-user spending limits][docs-aperture-set-per-user-spending-limits] or a [team-wide budget][docs-aperture-set-team-budget], you can check how budgets are being consumed and manu"
---

Last validated Sep 28, 2026

After you configure [per-user spending limits][docs-aperture-set-per-user-spending-limits] or a [team-wide budget][docs-aperture-set-team-budget], you can check how budgets are being consumed and manually refill depleted buckets.

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-aperture-get-started] with quotas configured. Refer to the [quotas configuration reference][docs-aperture-quotas] for details.
* Network access to the Aperture gateway URL (default: `http://ai`).
* [Admin access][docs-aperture-set-up-admin-access] to inspect organization-wide quota data or refill buckets. Users can check their own quota status in the chat portal.

## Check quota status in the web interfaces

Users can open `/quotas` in the [Aperture chat portal][docs-aperture-chat] to view their personal quota buckets, balances, refill status, and affected models.

Admins can inspect organization-wide quota coverage at `/admin/quotas`. To inspect or adjust the buckets for a specific user, open `/admin/dashboard` and select the user.

## Refill a quota bucket in the admin dashboard

1. Open `/admin/quotas`.
2. Select the user whose quota you want to change.
3. Locate the quota bucket and select **Adjust balance**.
4. Select **Add funds**, enter the amount to add, then select **Add**.

To replace the current balance instead, select **Set balance**, enter the new balance, then select **Set**.

## Check quota status using the API

Admins can query the `GET /api/quotas` endpoint to retrieve the current status of all quota buckets:

```shell
curl http://ai/api/quotas
```

The response includes each bucket's name, current balance, capacity, and refill rate.

## Refill a quota bucket

Admins can manually add funds to a depleted bucket using the `POST /api/quotas/refill` endpoint:

```shell
curl -X POST http://ai/api/quotas/refill \
  -H "Content-Type: application/json" \
  -d '{"bucket": "daily:alice@example.com", "amount": "$5.00"}'
```

Replace the `bucket` value with the name of the bucket to refill. The `amount` value adds to the current balance up to the bucket's configured `capacity`. Aperture does not allow the balance to exceed `capacity`.

> **Note:**
>
> Only users with [admin access][docs-aperture-set-up-admin-access] can refill quota buckets.

## Next steps

* [Set per-user spending limits][docs-aperture-set-per-user-spending-limits] if you have not configured individual budgets yet.
* [Set a team-wide budget][docs-aperture-set-team-budget] to cap total organizational spending.
* [Export usage data to S3][docs-aperture-export-s3] for long-term cost analysis and reporting.

[docs-aperture-chat]: /docs/aperture/reference/chat

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-aperture-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-aperture-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-aperture-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access
