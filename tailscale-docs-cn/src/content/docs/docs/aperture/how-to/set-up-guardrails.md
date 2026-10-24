---
title: "Set up a guardrail"
description: "Use [guardrails][docs-guardrails] to enforce policies on LLM requests before they leave your network. This topic covers setting up a PII-scrubbing guardrail that is designed to detect and redact sensi"
---

Last validated Sep 28, 2026

Use [guardrails][docs-guardrails] to enforce policies on LLM requests before they leave your network. This topic covers setting up a PII-scrubbing guardrail that is designed to detect and redact sensitive data, such as Social Security numbers, in user messages before the request reaches the provider.

> **Note:**
>
> A guardrail's detection and redaction accuracy depends on the endpoint you deploy. Aperture does not guarantee it. Treat a guardrail as one layer of defense, not a guarantee.

## Prerequisites

Before you begin, ensure you have the following:

* A running [Aperture gateway][docs-get-started] accessible from your device.
* A guardrail hook endpoint: an HTTP service that receives request data from Aperture, scans it, and returns an allow, block, or modify decision. The endpoint must accept POST requests and return JSON. For details on the expected request and response format, refer to the [hook response format][docs-configuration-hook-response-format] in the configuration reference.

## Configure the hook endpoint

Define the guardrail in the Aperture configuration so Aperture knows where to send request data for inspection.

1. \[Missing snippet: aperture\_admin\_nav.mdx]
2. Add an entry in the `hooks` section with the endpoint URL and credentials for your guardrail service.

   ```json
   "hooks": {
       "ssn-scrubber": {
           "url": "http://ssn-guard.example.ts.net:8080/scrub",
           "apikey": "<guardrail-api-key>",
           "fail_policy": "fail_closed",
           "timeout": "500ms",
           "preference": 10
       }
   }
   ```

   Replace `http://ssn-guard.example.ts.net:8080/scrub` with the URL of your guardrail service and `<guardrail-api-key>` with its API key.

   * `fail_policy` controls what happens when Aperture cannot reach the endpoint. `fail_closed` blocks the request if the guardrail is unavailable, which is appropriate for PII scrubbing where enforcement is mandatory. Use `fail_open` if you prefer requests to proceed when the guardrail is down.
   * `timeout` sets the maximum time Aperture waits for a response. Keep this short (500ms to 2s) for `pre_request` hooks to limit client-visible latency.
   * `preference` controls execution order when multiple hooks match a request. Higher values run first.

## Wire the hook to requests

Connect the guardrail to incoming requests using a grant with a `send_hooks` entry.

1. In the JSON editor, add a grant with a `send_hooks` entry that references the hook you defined.

   ```json
   "grants": [
       {
           "src": ["*"],
           "app": {
               "tailscale.com/cap/aperture": [
                   {
                       "models": "**"
                   },
                   {
                       "send_hooks": [
                           {
                               "name": "ssn-scrubber",
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

   * `name` references the hook key you defined in the `hooks` section.
   * `events` must include `pre_request` for the guardrail to fire before the request reaches the provider.
   * `send` controls what data Aperture includes in the payload to your hook. `user_message` is the last message the user sent, extracted from the request body regardless of API format. Use it as the scanning surface to detect PII. `request_body` is the full request body. Use it as the modification surface: when the hook returns a `modify` action, the `request_body` in the response replaces the original.

2. Save the configuration.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Verify the guardrail

After configuring the hook, confirm that the guardrail intercepts and processes requests.

1. Send a test request through Aperture that contains a sample SSN, such as `123-45-6789`.
2. Check the response. If your guardrail modifies the request, the LLM should receive the scrubbed content (for example, `XXX-XX-XXXX`) instead of the original.
3. Open `/admin/logs` in the Aperture admin dashboard and select the request on the **Logs** page to view its capture detail. The captured request body should show the modified content, not the original PII. Aperture stores the forwarded (modified) body in the capture record.

If the request passes through without modification, verify that the `name` in `send_hooks` matches the key in your `hooks` section and that the grant's `src` field includes the user who sent the request.

## Variations

The PII-scrubbing example demonstrates a common use case for guardrails, but you can implement different policies by changing the hook logic and response. For example:

### Block requests

Instead of scrubbing PII, your guardrail can block requests entirely. When the hook detects a policy violation, return a block response:

```json
{"action": "block", "status_code": 451, "message": "request contains PII"}
```

The client receives an error response and the request never reaches the provider.

### Strip tool declarations

To prevent specific tools from being available to the LLM, the hook can return a modified `request_body` with those tools removed from the `tools` array. The LLM receives the request without the stripped tools and cannot invoke them.

## Next steps

* Understand how guardrails work in [guardrails][docs-guardrails].
* Review the [hook response format][docs-configuration-hook-response-format] and [hook chains][docs-configuration-hook-chains] in the configuration reference.
* For asynchronous observation and authorization hooks, refer to [integrate Cerbos with Aperture][docs-integrate-cerbos] or [integrate Oso with Aperture][docs-integrate-oso].
* [Integrate Highflame with Aperture][docs-integrate-highflame] for an integration that combines pre-request enforcement with asynchronous observability.

[docs-configuration-hook-chains]: /docs/aperture/configuration#hook-chains

[docs-configuration-hook-response-format]: /docs/aperture/configuration#hook-response-format

[docs-get-started]: /docs/aperture/get-started

[docs-guardrails]: /docs/aperture/guardrails

[docs-integrate-cerbos]: /docs/aperture/integrate/cerbos

[docs-integrate-highflame]: /docs/aperture/integrate/highflame

[docs-integrate-oso]: /docs/aperture/integrate/oso
