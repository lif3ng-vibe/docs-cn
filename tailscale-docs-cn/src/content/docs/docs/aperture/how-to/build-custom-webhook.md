---
title: "Build a custom webhook"
description: "Aperture can send real-time event data to external services through webhooks to feed LLM usage data into your own audit logs, cost dashboards, security tools, or policy engines. For each request that "
---

Last validated Sep 29, 2026

Aperture can send real-time event data to external services through webhooks to feed LLM usage data into your own audit logs, cost dashboards, security tools, or policy engines. For each request that matches a [grant][docs-aperture-configuration] (an access rule that controls who can use which models), Aperture POSTs a JSON payload containing the metadata and data types you select.

## Prerequisites

Before you begin, make sure you have the following:

* An [Aperture gateway][docs-aperture-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration].
* An HTTP or HTTPS endpoint that accepts POST requests with JSON payloads.

## Define a hook endpoint

\[Missing snippet: aperture\_admin\_nav.mdx] Add a `hooks` section to your configuration. Each hook has a unique key and specifies the endpoint URL:

```json
"hooks": {
  "my-webhook": {
    "url": "https://example.com/aperture-events",
    "apikey": "<api-key>"
  }
}
```

If your endpoint uses a non-Bearer authentication scheme, set the `authorization` field:

```json
"hooks": {
  "my-webhook": {
    "url": "https://example.com/aperture-events",
    "apikey": "<api-key>",
    "authorization": "x-api-key",
    "timeout": "10s"
  }
}
```

The `authorization` field supports `bearer` (default), `x-api-key`, `x-goog-api-key`, `hec`, and `cf-aig-authorization`. The `timeout` field accepts Go duration strings such as `5s`, `30s`, or `1m` and defaults to `5s`.

> **Warning:**
>
> A hook defined in the `hooks` section has no effect until a grant references it.

## Trigger the hook from a grant

Add a `send_hooks` entry to a capability (a set of permissions such as allowed models) in your `grants` section. This controls which requests trigger the hook and what data Aperture includes in the payload:

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "send_hooks": [
            {
              "name": "my-webhook",
              "events": ["entire_request"],
              "send": ["estimated_cost"]
            }
          ]
        }
      ]
    }
  }
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### Select hook events

The `events` array specifies when Aperture calls the hook:

| Event                      | Description                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pre_request`              | Fires before the provider call. Synchronous: Aperture waits for the hook response. The hook can allow, block, or modify the request. |
| `entire_request`           | Fires for every completed request.                                                                                                   |
| `tool_call_entire_request` | Fires once after the response completes if any message in the response contained tool calls.                                         |

> **Note:**
>
> The `pre_request` event is a synchronous guardrail. Unlike `entire_request` and `tool_call_entire_request`, which fire asynchronously after a request completes, `pre_request` blocks until the hook responds and can allow, block, or modify the request. For details, refer to [guardrails][docs-aperture-guardrails].

### Select data types

The `send` array specifies which data to include in the POST payload:

| Type             | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `tools`          | Array of tool calls extracted from the response.                     |
| `request_body`   | The original request body sent to the LLM.                           |
| `user_message`   | The user's message from the request.                                 |
| `response_body`  | The reconstructed response body JSON.                                |
| `raw_responses`  | Array of raw SSE messages (for streaming) or single response object. |
| `estimated_cost` | Dollar cost estimate, pricing basis, and token usage breakdown.      |
| `grants`         | Non-Aperture app capabilities from the user's grants.                |
| `quotas`         | Current state of all quota buckets that applied to this request.     |

## Review the payload format

Every hook call includes a `metadata` object with request context, regardless of what you specify in `send`:

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "user_agent": "curl/8.0",
    "url": "/v1/chat/completions",
    "model": "gpt-5.5",
    "provider": "openai",
    "tailnet_name": "example.com",
    "stable_node_id": "n12345",
    "request_id": "abc123",
    "session_id": "oacc_1a2b3c4d5e6f7890"
  }
}
```

When you include data types in the `send` array, Aperture adds them to the payload alongside `metadata`. For example, with `"send": ["tools", "estimated_cost"]`, the payload includes a pricing lookup key in `cost_basis`. The dollar amount and token counts below illustrate the payload structure, not a price quote:

```json
{
  "metadata": {
    "login_name": "alice@example.com",
    "...": "..."
  },
  "estimated_cost": {
    "dollars": 0.0342,
    "cost_basis": "anthropic/claude-sonnet-4-6",
    "usage": {
      "input_tokens": 1500,
      "output_tokens": 800,
      "cached_tokens": 200,
      "reasoning_tokens": 0
    }
  },
  "tool_calls": [...]
}
```

## Verify the webhook

After saving the configuration, send a test LLM request through Aperture and check that your endpoint receives the POST payload. If the webhook does not fire:

1. Confirm the hook name in `send_hooks` matches the key in the `hooks` section.
2. Confirm the grant's `src` and `models` patterns match your test request.

To temporarily disable a hook without removing it from the configuration, set `"disabled": true` in the hook definition.

## Next steps

Explore related integrations and configuration options:

* Browse [Aperture recipes][docs-aperture-recipes] for integration examples, or contribute your own integration guide.
* [Export usage data to S3][docs-aperture-export-s3] for long-term storage of session logs.
* [Integrate Cerbos with Aperture][docs-aperture-integrate-cerbos], [Integrate Highflame with Aperture][docs-aperture-integrate-highflame], or [Integrate Oso with Aperture][docs-aperture-integrate-oso] for policy engine integrations that use hooks.
* Refer to the [hooks configuration reference][docs-aperture-hooks] for the complete field reference and additional examples.
* [Reduce Aperture token costs with tsheadroom][docs-reduce-token-costs] for an end-to-end example that ships a `pre_request` hook as a tailnet service.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-guardrails]: /docs/aperture/guardrails

[docs-aperture-hooks]: /docs/aperture/configuration#hooks

[docs-aperture-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-aperture-integrate-highflame]: /docs/aperture/integrate/highflame

[docs-aperture-integrate-oso]: /docs/aperture/integrate/oso

[docs-aperture-recipes]: /docs/aperture/reference/recipes

[docs-reduce-token-costs]: /docs/solutions/reduce-aperture-token-costs-with-tsheadroom
