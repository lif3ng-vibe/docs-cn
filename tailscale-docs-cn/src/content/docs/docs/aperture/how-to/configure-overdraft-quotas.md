---
title: "Configure overdraft quotas"
description: "By default, Aperture charges every [quota bucket][docs-aperture-quotas] that matches a request in parallel: if a request costs $1 and three buckets match, each bucket drops by $1. Overdrafts add a seq"
---

Last validated Sep 29, 2026

By default, Aperture charges every [quota bucket][docs-aperture-quotas] that matches a request in parallel: if a request costs $1 and three buckets match, each bucket drops by $1. Overdrafts add a sequential dimension. Instead of debiting every matching bucket at once, an overdraft chain spends a primary bucket first and borrows from the next bucket in the chain only when the primary runs out.

Use overdrafts when most users should share one allocation but some users need extra headroom. You can give everyone a base quota, then let a group or an individual borrow from an additional bucket, without redefining the base quota for everyone.

## How overdrafts work

A request draws from the buckets in a chain in order:

1. It spends the primary bucket first.
2. When the primary bucket cannot cover the full cost, it takes what remains there and borrows the rest from the next overdraft bucket.
3. It keeps borrowing from the remaining overdraft buckets in the configured order.
4. It is rejected only after the entire chain cannot cover the cost.

A single request can split across buckets. If the primary bucket has $0.50 remaining and a request costs $2.00, Aperture debits $0.50 from the primary bucket and borrows $1.50 from the next overdraft bucket. The last bucket in a chain can go negative to cover a request. When it does, the chain stays blocked until a refill brings the combined balance back above zero.

Overdrafts change only what happens within a single chain. Buckets that a request matches through separate quota entries are still charged in parallel.

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration].
* At least two [quota buckets][docs-aperture-quotas] defined: a primary bucket and one or more buckets to use as overflow.

## Step 1: Define the quota buckets

\[Missing snippet: aperture\_admin\_nav.mdx] Define the buckets in the `quotas` section. An overflow bucket is an ordinary quota definition. Nothing in the definition marks it as an overdraft. The following example defines a per-user daily bucket and a shared engineering pool:

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  },
  "eng-team-pool": {
    "capacity": "$200.00",
    "rate": "$200.00/week",
    "on_exceed": "reject"
  }
}
```

## Step 2: Add overdrafts to a grant

Overdrafts live on the grant assignment, not on the bucket definition. You can add them either in the Aperture admin dashboard or by editing the configuration file directly.

### Use the Aperture admin dashboard

\[Missing snippet: aperture\_admin\_nav.mdx] Open the grant you want to change, or create a new one. Each quota bucket in the grant has an **Add overdraft bucket** control. Select an overflow bucket from the list of your defined quotas, then add more buckets to extend the chain. Drag the buckets to set the order Aperture draws from them, from first to last. The visual editor only lets you choose buckets that already exist and prevents a chain from including its own primary bucket or a duplicate.

### Edit the configuration file

Add an `overdrafts` list to a quota entry in a grant. The list names the buckets to fall back to, in order:

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [{"bucket": "daily:<user>"}]
        }
      ]
    }
  },
  {
    "src": ["group:eng"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>", "overdrafts": ["eng-team-pool"]}
          ]
        }
      ]
    }
  }
]
```

In this configuration, every user draws from their own `daily:<user>` bucket. Members of `group:eng` additionally overflow into `eng-team-pool` once their daily bucket runs out. The same bucket can be a primary quota for one set of users and an overdraft for another, because the role comes from the assignment, not the definition.

You can combine parallel quotas and sequential overdrafts in the same grant: list several `quotas` entries to charge buckets in parallel, and give any entry an `overdrafts` list to make that bucket fall back sequentially.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Step 3: Layer grants for exceptions (optional)

Overdrafts let you grant a higher limit to specific users without touching the base policy. Layer grants from broad to narrow:

* A broad grant applies a standard quota to every user.
* A narrower grant adds an overdraft for a group that needs more capacity.
* An even narrower grant adds another overdraft for an individual.

Aperture merges the grants that apply to a user into one effective configuration, so the user inherits the standard policy plus any fallback capacity that applies to them.

### How grants merge

Within a single grant, Aperture uses overdraft buckets in the order you list them.

When several grants contribute overdrafts for the same primary bucket, Aperture combines their lists. It preserves the order defined within each grant unless the grants specify conflicting orders.

Aperture builds the combined list one bucket at a time. It adds a bucket only after any buckets that must precede it. When more than one bucket can come next, Aperture selects the one it encountered first across the grants rather than sorting alphabetically.

If grants specify conflicting orders, Aperture saves the configuration and issues a warning. For example, one grant might list `pool-a` before `pool-b`, while another lists `pool-b` before `pool-a`. If the conflict prevents Aperture from completing the ordered list, it keeps the buckets it has already placed and appends the remaining buckets in the order it first encountered them across the grants.

If buckets must run in a specific sequence, list them together in one grant and keep that order consistent in any other grants that include them. To resolve a warning, correct the conflicting orders or define the sequence in one grant and remove the conflicting order from the others.

## Step 4: Verify and troubleshoot

After saving the configuration, confirm the chain behaves as expected:

1. Send test requests as a user whose grant includes overdrafts until the primary bucket is exhausted, then confirm that later requests keep succeeding and draw from the overflow bucket.
2. Check bucket balances using the [quota status][docs-monitor-quotas] in the chat portal at `/quotas` or through `GET /api/quotas`. Buckets that are used only as overflow targets appear in a separate section from primary buckets.

When a user reports running out of credit, inspect the quotas and overdrafts that actually apply to that user. At `/admin/dashboard`, an admin can select a user and review their effective configuration, or call `GET /api/quotas?login_name=<user>`. Use it to answer questions such as:

* Did the user receive only the base grant, or also the narrower grant that adds the fallback bucket?
* Which overdraft buckets apply, and in what order?
* Did the last bucket in the chain have enough balance to cover the request?

If a request exhausts the entire chain, Aperture rejects it with HTTP 429 and a body such as `Aperture quota exceeded: daily:<user>`, formatted to match the provider's native error format (for example, `rate_limit_error` for Anthropic, `insufficient_quota` for OpenAI). For more troubleshooting details, refer to [Troubleshooting Aperture][docs-troubleshooting].

## Next steps

* [Set per-user spending limits][docs-set-per-user] to define the primary buckets an overdraft chain builds on.
* [Check and refill budgets][docs-monitor-quotas] to monitor bucket balances and manually add funds.
* Refer to the [quotas configuration reference][docs-aperture-quotas] for the complete field reference and additional examples.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-per-user]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-troubleshooting]: /docs/aperture/troubleshooting
