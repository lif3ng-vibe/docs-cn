---
title: "Privacy and data retention"
description: "Control how long Aperture retains captured data, where it exports, and where request content leaves Aperture."
---

Last validated Oct 1, 2026

\[Missing snippet: aperture\_terms.mdx]

Aperture captures request and response bodies, headers, and tool use data for LLM requests, alongside usage metrics such as token counts, model, and estimated cost. This topic covers controls for stored proxy captures and for destinations that can receive request content. Capture retention keeps request and session metadata and usage metrics for reporting. It does not delete Aperture Chat conversations, which Aperture stores separately. Most configured hooks can still receive content under zero retention. If you also exclude tool data, Aperture skips tool extraction, so tool-call-triggered hooks do not fire.

## Control retention

Configure how long Aperture keeps captured request and response content before deleting it. You can also enable zero retention (`duration: "0"`, `require_export: false`) so that Aperture does not store captured bodies and headers. Aperture still keeps captured tool data unless you add `"tools"` to `purge`. Compare the [retention posture options][docs-retention-postures] to choose between timed removal, never storing capture content, and archiving before local removal. For the retention fields, refer to the [`database` configuration reference][docs-retention].

### Preview a retention change

On the admin **Data Export** settings page, the preview shows how many capture payloads Aperture would delete under a proposed policy. Admins can use the [impact endpoint][docs-zero-retention-impact] to check the timestamp of the oldest affected capture. The dashboard does not show that timestamp. Viewing the preview does not save your change or pause background removals under the saved policy. When the policy takes effect, Aperture removes captured request and response bodies and headers, plus tool use data if you select it. It keeps capture metadata records, session summaries, and usage metrics.

The **Delete after** control has a minimum of 1 hour. Shorter values leave the preview blank. To remove content without a retention window, choose **Zero retention** instead. Aperture caps durations above the maximum Tailscale permits for your gateway, so the preview can reflect a shorter window than you entered.

Before you save, the dashboard asks you to confirm a proposed policy that does any of the following:

* Marks more captures for removal than the saved policy.
* Switches to zero retention.
* Starts removing tool use data.
* Stops requiring S3 export, when S3 export is configured.

Review the affected count before you confirm. To check the oldest affected timestamp, use the impact endpoint.

### Understand capture redaction

By default, Aperture replaces provider-encrypted thinking-block signatures, web search encrypted content, citation indices, and encrypted response items with placeholders in parsed request and response captures. Set `database.keep_encrypted_blobs` to `true` to keep these fields in captures until the retention policy removes their captured content. The placeholder replacement does not apply to retained raw HTTP bodies. Those bodies can contain the original encrypted values when `database.save_raws` is enabled or response JSON parsing fails. The replacement also does not scrub prompt text or personally identifiable information (PII). With zero retention, Aperture does not store captured bodies regardless of these settings.

Before storing captured request and response headers, Aperture redacts `Authorization`, `X-Api-Key`, `X-Goog-Api-Key`, and `Cf-Aig-Authorization`. It also redacts header names configured in provider or grant `add_headers`. Header-name matching ignores case. Aperture keeps each header name. It changes a value that begins with `Bearer` and a space to `Bearer (redacted)`, and it changes other redacted values to `(redacted)`. Aperture omits headers with no values from stored maps.

Captured request headers reflect outbound traffic after Aperture adds gateway-configured headers. Other headers, including `Cookie`, `Set-Cookie`, `User-Agent`, and client-supplied custom headers not configured as sensitive, remain in plaintext in local captures until Aperture removes them. They remain in previously exported S3 objects until you remove those objects separately. Treat captures and exports as sensitive data. For raw-body controls, refer to the [`database` configuration reference][docs-retention].

[**Configure zero-retention mode**](/docs/aperture/how-to/configure-zero-retention) — Configure Aperture to not store captured prompt and response content on disk, and learn which Chat and hook data the setting does not cover.

## Export and archive usage data

Export captured usage data to S3-compatible storage for long-term archiving. You can require successful export before Aperture removes local captured content. Until a capture exports successfully, Aperture keeps it, even past its retention window. A successful export lets Aperture remove local content later but does not guarantee immediate removal. Future exports exclude captured content Aperture has already removed, including headers. Removing local content does not delete objects previously exported to S3. Aperture keeps request metadata, metrics, and session summaries.

[**Export usage data to S3**](/docs/aperture/how-to/export-usage-data-to-s3) — Configure Aperture to export LLM usage data to an Amazon S3 bucket for analysis, archiving, and long-term retention.

[**Observe and export AI usage**](/docs/aperture/observe-and-export) — Review your own Aperture usage in Chat or use the admin dashboard to inspect and export organization-wide activity.

## Where request content goes

Requests that Aperture forwards to a model go to the configured provider. Your configuration can add the following destinations:

* [Guardrails][docs-guardrails] receive selected request fields before the model provider does. They can inspect, modify, or block a request.
* [Connectors][docs-connectors] proxy calls to configured MCP servers and HTTP APIs.
* [Integration hooks][docs-integrate] send selected fields to configured webhook endpoints.

Check where each endpoint is hosted before you enable it.

Zero capture retention does not stop most hooks from sending content. Pre-request guardrails can receive prompts without redaction. Post-response `entire_request` hooks can receive prompts or completions when matching grants allow fields such as `request_body`, `response_body`, `user_message`, or `raw_responses`. With zero retention (`duration: "0"`, `require_export: false`) and `purge: ["captures", "tools"]`, Aperture skips tool extraction, so `tool_call_entire_request` hooks do not fire. To prevent content from leaving through a hook that fires, disable the hook, or restrict `send_hooks` `send` to metadata in every matching grant. Aperture omits excluded fields from webhook JSON rather than sending them blank.

[docs-connectors]: /docs/aperture/connectors

[docs-guardrails]: /docs/aperture/guardrails

[docs-integrate]: /docs/aperture/integrate

[docs-retention-postures]: /docs/aperture/how-to/configure-zero-retention#step-1-choose-a-retention-posture

[docs-retention]: /docs/aperture/configuration#database

[docs-zero-retention-impact]: /docs/aperture/how-to/configure-zero-retention#step-4-preview-the-impact-before-saving
