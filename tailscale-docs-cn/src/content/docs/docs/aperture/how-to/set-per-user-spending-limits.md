---
title: "Set per-user spending limits"
description: "When multiple people use LLMs through Aperture, a single user can consume a disproportionate share of your AI budget. Per-user spending limits give each person an independent budget that refills autom"
---

Last validated Sep 28, 2026

When multiple people use LLMs through Aperture, a single user can consume a disproportionate share of your AI budget. Per-user spending limits give each person an independent budget that refills automatically, so no one exhausts the team's resources.

Aperture uses quota buckets to enforce spending limits. Each bucket has a capacity (maximum balance), a refill rate, and a behavior when the limit is exceeded. Using the `<user>` template variable in the bucket name creates a separate bucket for each person who sends requests through Aperture.

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration].

## Define a per-user quota bucket

\[Missing snippet: aperture\_admin\_nav.mdx] Add a `quotas` section to your configuration. The following example creates a per-user bucket with a $10 capacity that refills at $5 per day:

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  }
}
```

The `<user>` template expands to each caller's Tailscale login name at request time. For example, when `alice@example.com` sends a request, Aperture charges the bucket `daily:alice@example.com`. When `bob@example.com` sends a request, Aperture charges `daily:bob@example.com`. Each bucket tracks its balance independently.

The `capacity` field sets the maximum balance the bucket can hold. This is also the starting balance. The `rate` field controls how fast the bucket refills. Supported time units are `min`, `hour`, `day`, `week`, and `month` (30 days).

When `on_exceed` is set to `"reject"`, Aperture blocks requests that would bring the bucket below zero and returns HTTP 429 with a `Retry-After` header. `"reject"` is the only supported value for `on_exceed`.

## Attach the quota to a grant

A quota bucket has no effect until a grant references it. Add a `quotas` entry to the capability in your `grants` section that should enforce the limit:

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
            {"bucket": "daily:<user>"}
          ]
        }
      ]
    }
  }
]
```

This grant applies the per-user quota to all models for all users. When a request matches the grant, Aperture checks the user's bucket balance before forwarding the request. After the response completes, Aperture deducts the estimated cost from the bucket.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Scope a quota to specific models

To limit spending on expensive models while leaving others unmetered, create a quota that applies only to specific model patterns:

```json
"quotas": {
  "opus:<user>": {
    "capacity": "$5.00",
    "rate": "$2.50/day",
    "on_exceed": "reject"
  }
},
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "models": "**" },
        {
          "models": "*/claude-opus*",
          "quotas": [
            {"bucket": "opus:<user>"}
          ]
        }
      ]
    }
  }
]
```

In this configuration, requests to Opus models are metered against the `opus:<user>` bucket, while all other models have no spending limit.

For [model aliases][docs-aperture-model-aliases], quota model patterns match the resolved destination model, not the alias name.

## Verify the configuration

After saving the configuration, confirm the quota is active:

1. Send a test request through Aperture.
2. Check the [quota status][docs-monitor-quotas] using the API (`GET /api/quotas`) or the personal **Quotas** page at `/quotas` in the chat portal. The quota bucket for your user should appear with the correct capacity and a balance reduced by the cost of your test request.

If a request exceeds the quota, Aperture returns an error formatted to match the provider's native error format (for example, `rate_limit_error` for Anthropic, `insufficient_quota` for OpenAI). For troubleshooting details, refer to [Troubleshooting Aperture][docs-troubleshooting].

## Next steps

* [Set a team-wide budget][docs-set-team-budget] to add an organization-level spending cap alongside per-user limits.
* [Check and refill budgets][docs-monitor-quotas] to monitor bucket balances and manually add funds.
* Refer to the [quotas configuration reference][docs-aperture-quotas] for the complete field reference and additional examples.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-model-aliases]: /docs/aperture/model-aliases#quotas

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-troubleshooting]: /docs/aperture/troubleshooting
