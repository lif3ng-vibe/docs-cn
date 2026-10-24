---
title: "Integrate Highflame with Aperture"
description: "[Highflame][xt-highflame] is a security and observability platform for AI workloads. By connecting Aperture to Highflame, you can enforce request policies before data reaches the provider and observe "
---

Last validated Jul 2, 2026

[Highflame][xt-highflame] is a security and observability platform for AI workloads. By connecting Aperture to Highflame, you can enforce request policies before data reaches the provider and observe completed requests for auditing and threat detection.

Aperture sends data to Highflame using the [hooks system][docs-configuration-hooks]. You configure a hook endpoint for your Highflame deployment and a grant that specifies which requests trigger the hook and what data to include.

> **Note:**
>
> Highflame supports both synchronous hooks (`pre_request`) for enforcement and asynchronous hooks (`tool_call_entire_request` / `entire_request`) for observability, through the same endpoint and API key. You can use one or both modes depending on your requirements. For a standalone pre-request guardrail without Highflame, refer to [guardrails][docs-guardrails].

## Prerequisites

Before you begin, you need the following:

* A running [Aperture gateway][docs-get-started] accessible from your device.
* A [Highflame][xt-highflame] account with an API key. You can generate an API key from the [Highflame console][xt-highflame-console].

## Configure the Highflame hook

Configure a hook in Aperture that points to your Highflame endpoint. This hook sends request data to Highflame for enforcement or observation.

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. Add a `highflame` entry in the `hooks` section with your Highflame endpoint URL and API key.

   ```json
   "hooks": {
       "highflame": {
           "url": "<highflame-endpoint-url>",
           "apikey": "<highflame-api-key>",
           "timeout": "1s",
           "fail_policy": "fail_closed"
       }
   }
   ```

   Replace `<highflame-endpoint-url>` with the URL of your Highflame endpoint and `<highflame-api-key>` with the API key from your Highflame console.

   * `timeout` sets the maximum time Aperture waits for a response. For `pre_request` hooks, keep this short (500ms to 2s) to limit client-visible latency. Asynchronous hooks are not latency-sensitive, but a timeout prevents stalled connections.
   * `fail_policy` controls what happens when Aperture cannot reach the endpoint. `fail_closed` blocks the request if Highflame is unavailable, which is appropriate when using Highflame for enforcement. Use `fail_open` if requests should proceed when Highflame is down, or if you use Highflame only for asynchronous observability.

After adding the hook, continue in the JSON editor to connect it to incoming requests using a grant.

## Wire the hook to a grant

Connect the Highflame hook to incoming requests using a grant with a `send_hooks` entry. Highflame supports three modes depending on whether you need enforcement, observability, or both.

### Synchronous enforcement (pre\_request)

Use `pre_request` to have Highflame inspect requests before they reach the provider. Highflame returns `allow` or `block` (never `modify`) for each request.

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["pre_request"],
                            "send": ["request_body", "user_message"]
                        }
                    ]
                }
            ]
        }
    }
]
```

The `send` array controls what data Aperture includes in the hook payload. `request_body` is the full request body, and `user_message` is the last message the user sent.

### Asynchronous observability (tool\_call\_entire\_request)

Use `tool_call_entire_request` or `entire_request` to send completed request data to Highflame for auditing and threat detection after the response completes. Asynchronous hooks do not block or modify requests.

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["tool_call_entire_request"],
                            "send": ["tools", "user_message", "request_body", "response_body"]
                        }
                    ]
                }
            ]
        }
    }
]
```

The asynchronous hook includes additional data: `tools` contains tool declarations from the request, and `response_body` is the full response from the provider. Use `tool_call_entire_request` to send data only for requests that include tool calls, or `entire_request` to send data for all requests.

### Combined enforcement and observability

To use both modes, include two `send_hooks` entries in the same grant. Both reference the same `highflame` hook definition.

```json
"grants": [
    {
        "src": ["*"],
        "app": {
            "tailscale.com/cap/aperture": [
                {
                    "send_hooks": [
                        {
                            "name": "highflame",
                            "events": ["pre_request"],
                            "send": ["request_body", "user_message"]
                        },
                        {
                            "name": "highflame",
                            "events": ["tool_call_entire_request"],
                            "send": ["tools", "user_message", "request_body", "response_body"]
                        }
                    ]
                }
            ]
        }
    }
]
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

After adding the grant, save the configuration.

\[Missing snippet: aperture\_hooks\_config\_ref.mdx]

## Verify the integration

After you configure the Highflame hook, verify that Aperture sends data to Highflame and that Highflame processes it correctly.

1. Send a request through Aperture that matches your grant conditions. If you use `tool_call_entire_request`, the request must include a tool call to trigger the hook.
2. If using `pre_request` mode, confirm the request is allowed or blocked as expected based on your Highflame policies.
3. Open the [Highflame console][xt-highflame-console] and confirm the request data appears in the dashboard.
4. If using asynchronous mode, verify that completed request data (including tool calls, if applicable) appears after the response completes.

\[Missing snippet: aperture\_verify\_hook\_wiring.mdx]

## Troubleshooting

| Symptom                                       | Cause                                                                             | Fix                                                                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Request passes through without being blocked  | Hook uses `entire_request` or `tool_call_entire_request` instead of `pre_request` | Asynchronous hooks cannot block requests. Switch to `pre_request` for enforcement.                                              |
| Highflame returns a timeout error             | `timeout` value is too short for your network path                                | Increase the `timeout` value in the hook definition. For `pre_request` hooks, keep it under 2s to limit client-visible latency. |
| Request blocked when Highflame is unreachable | `fail_policy` is set to `fail_closed`                                             | Change to `fail_open` if requests should proceed when Highflame is unavailable. Keep `fail_closed` if enforcement is mandatory. |
| Asynchronous data missing tool call details   | `send` array does not include `tools` or `response_body`                          | Add the required fields to the `send` array in your grant's `send_hooks` entry.                                                 |
| API key rejected by Highflame                 | API key expired or belongs to a different environment                             | Generate a new API key from the [Highflame console][xt-highflame-console] and update the `apikey` field in the hook definition. |

## Security considerations

When you connect Aperture to Highflame, request content, including user messages, tool calls, and response bodies, leaves Aperture and is sent to the Highflame endpoint. Consider the following:

* **Content exposure.** The `send` array in your grant controls what data Highflame receives. Include only the data types Highflame needs for your use case. For enforcement-only setups, `request_body` and `user_message` are sufficient.
* **API key handling.** Store the Highflame API key securely. Aperture stores the key in its configuration and sends it as a header with each hook request. Rotate keys periodically from the [Highflame console][xt-highflame-console].
* **Network path.** Hook requests travel over your tailnet. Ensure the Highflame endpoint is accessible from your Aperture gateway and that no intermediate services log or cache the request payload.
* **Data scope.** Use the `src` field in your grants to limit which users' requests Aperture sends to Highflame. Avoid sending data for users who are not subject to your enforcement or observability policies.
* **Local retention.** What Aperture sends to Highflame is separate from what it retains on disk. If you require that Aperture never store prompt or response content on disk, refer to [Configure zero-retention mode][docs-aperture-zero-retention] and [Privacy and data retention][docs-aperture-privacy].
* **Third-party handling.** Highflame is a third-party service. When Aperture forwards request data to it, Highflame's use of that data is governed by your agreement with Highflame, not your agreement with Tailscale.

## Next steps

\[Missing snippet: aperture\_hooks\_next\_steps.mdx]

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-configuration-hooks]: /docs/aperture/configuration#hooks

[docs-get-started]: /docs/aperture/get-started

[docs-guardrails]: /docs/aperture/guardrails

[xt-highflame-console]: https://console.highflame.com/

[xt-highflame]: https://www.highflame.com/
