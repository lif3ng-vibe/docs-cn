---
title: "Set a team-wide budget"
description: "Per-user spending limits prevent individual overuse, but they do not cap total organizational spend. A team-wide budget creates a single shared quota bucket that all users draw from, so your organizat"
---

Last validated Sep 28, 2026

Per-user spending limits prevent individual overuse, but they do not cap total organizational spend. A team-wide budget creates a single shared quota bucket that all users draw from, so your organization's aggregate AI costs stay within a defined ceiling.

You can use a team-wide budget on its own or combine it with [per-user spending limits][docs-set-per-user-limits] for layered cost control. When a grant references multiple quota buckets, all buckets must have a positive balance for a request to proceed.

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration].

## Define a shared quota bucket

\[Missing snippet: aperture\_admin\_nav.mdx] Add a shared bucket to the `quotas` section of your configuration. A shared bucket uses a fixed name without template variables, so all requests draw from the same balance:

```json
"quotas": {
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject"
  }
}
```

This creates a single bucket called `team-monthly` with a $500 capacity that refills at $500 per month (30 days). Every request that references this bucket deducts from the same balance regardless of which user sent the request.

The `capacity` field sets the maximum balance the bucket can hold. This is also the starting balance. The `rate` field controls the refill speed. Supported time units are `min`, `hour`, `day`, `week`, and `month` (30 days). When `on_exceed` is `"reject"`, Aperture blocks requests that would bring the bucket below zero and returns HTTP 429 with a `Retry-After` header.

`"reject"` is the only supported value for `on_exceed`.

## Attach the budget to a grant

Add the shared bucket to the `quotas` array in your grant. The following example applies the team budget to all users and all models:

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "team-monthly"}
          ]
        }
      ]
    }
  }
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Combine with per-user limits

To enforce both a per-user daily limit and a team-wide monthly cap, define both buckets and reference them in the same grant:

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  },
  "team-monthly": {
    "capacity": "$500.00",
    "rate": "$500.00/month",
    "on_exceed": "reject"
  }
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>"},
            {"bucket": "team-monthly"}
          ]
        }
      ]
    }
  }
]
```

When a grant references multiple quota buckets, Aperture checks all of them before forwarding the request. If any single bucket is exhausted, Aperture rejects the request even if the other buckets have remaining balance. After the response completes, Aperture deducts the estimated cost from every referenced bucket.

## Verify the configuration

After saving the configuration, confirm the budget is active:

1. Send a test request through Aperture.
2. Check the [quota status][docs-monitor-quotas] using the API (`GET /api/quotas`) or the personal **Quotas** page at `/quotas` in the chat portal. The `team-monthly` bucket should appear with the correct capacity and a balance reduced by the cost of your test request.

## Next steps

* [Set per-user spending limits][docs-set-per-user-limits] to prevent individual users from consuming a disproportionate share of the team budget.
* [Check and refill budgets][docs-monitor-quotas] to monitor the team bucket balance and manually add funds if needed.
* Refer to the [quotas configuration reference][docs-aperture-quotas] for the complete field reference and additional examples.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-per-user-limits]: /docs/aperture/how-to/set-per-user-spending-limits
