---
title: "Configure zero-retention mode"
description: "By default, Aperture captures request and response bodies so you can browse them in the dashboard. This topic uses [retention settings][docs-aperture-retention] to prevent Aperture from storing proxy "
---

Last validated Oct 1, 2026

\[Missing snippet: aperture\_terms.mdx]

By default, Aperture captures request and response bodies so you can browse them in the dashboard. This topic uses [retention settings][docs-aperture-retention] to prevent Aperture from storing proxy capture content. You do not need to change code. The setting does not delete Aperture Chat history or stop most configured hooks from sending content. If you also exclude tool data, tool-call-triggered hooks do not fire.

## Prerequisites

Before you begin, make sure you have the following:

* An [Aperture gateway][docs-aperture-get-started] with at least one provider configured.
* Admin access to the [Aperture configuration][docs-aperture-configuration], including either the **Data Export** settings page at `/admin/settings/database` or the raw configuration editor at `/admin/settings/config`.

The configuration is written in HuJSON, which is JSON that also permits comments and trailing commas. Standard JSON is valid HuJSON.

## How retention works

Aperture removes captured content after its configured retention window. Set these fields in the top-level [`database.retention`][docs-aperture-retention] block:

* `duration` sets the retention window. The special value `"0"` enables zero data retention. For non-zero values, the minimum is one hour and the maximum is 3650 days (10 years).
* `purge` lists which categories of captured data Aperture removes. The name of this configuration field is `purge`, but removing captured content does not delete request metadata or usage metrics.
* `require_export` optionally requires successful S3 export before Aperture removes local captured content.

These settings apply to stored proxy captures. *Captured content* includes request and response bodies, headers, and raw HTTP bytes. *Tool data* includes tool names, parameters, and counts. Aperture keeps request and session metadata and usage metrics (identity, model, token counts, and estimated cost). Capture retention does not delete Aperture Chat conversation history. Guardrails and `entire_request` hooks can still receive the payload fields that their grants allow. If zero retention also excludes tool data, Aperture skips tool extraction, so `tool_call_entire_request` hooks do not fire.

With `duration: "0"` and `require_export: false`, Aperture does not store captured request and response bodies, headers, or raw HTTP bytes, regardless of the `purge` list. This also applies when `database.save_raws` is enabled or a provider response fails JSON parsing. Add `"tools"` to `purge` to omit captured tool data, which might contain sensitive arguments.

With `require_export: true`, Aperture keeps captured content until it exports successfully to S3. A successful export lets Aperture remove local content later, but it does not guarantee immediate deletion. The exported copy remains in S3.

## Step 1: Choose a retention posture

The three fields combine into different behaviors. Choose the row that matches your requirement:

| Goal                                 | `duration` | `purge`                 | `require_export` |
| ------------------------------------ | ---------- | ----------------------- | ---------------- |
| Storage management only              | `"30d"`    | `["captures"]`          | `false`          |
| Storage management, strict           | `"30d"`    | `["captures", "tools"]` | `false`          |
| Never store capture content on disk  | `"0"`      | `["captures", "tools"]` | `false`          |
| Archive to S3, then scrub locally    | `"0"`      | `["captures"]`          | `true`           |
| Keep a 90-day debug window, archived | `"90d"`    | `["captures"]`          | `true`           |

For the strictest capture posture, choose **Never store capture content on disk**. With `duration: "0"`, `purge: ["captures", "tools"]`, and `require_export: false`, Aperture clears captured request and response bodies, headers, raw HTTP bytes, and tool arguments before writing capture records. It keeps request and session metadata. This setting does not delete Chat history or stop configured pre-request guardrails and `entire_request` hooks from receiving content. Tool-call-triggered hooks do not fire because Aperture skips tool extraction.

If you need an off-gateway copy for long-term archiving, choose **Archive to S3, then scrub locally**. Confirm that [S3 export][docs-aperture-export-s3] is configured. A successful export lets Aperture remove the local captured content later, but it does not guarantee immediate deletion.

## Step 2: Back up the current configuration

\[Missing snippet: aperture\_admin\_nav.mdx] Copy the current configuration to a local file before you change anything, so you can revert if needed.

The **Data Export** settings page at `/admin/settings/database` lets you set retention duration, categories of data to remove, and whether export is required. It also shows a live preview of how many stored captures a duration would affect. You can instead edit the `database` block directly in the configuration editor at `/admin/settings/config`. This topic shows the values to use with either method.

## Step 3: Set the never-store configuration

Set the `database` block so its `retention` matches your chosen posture. For the never-store-capture-content posture, use the following:

```json
"database": {
  "retention": {
    "duration": "0",
    "purge": ["captures", "tools"],
    "require_export": false
  }
}
```

If you chose **Archive to S3, then scrub locally**, set `duration` to `"0"`, keep `purge` at `["captures"]`, and set `require_export` to `true`. Configure [S3 export][docs-aperture-export-s3] and verify that it succeeds. With `require_export: true`, Aperture keeps local captured content until export succeeds. Export does not guarantee immediate removal, and the exported copy remains in S3.

## Step 4: Preview the impact before saving

Setting `duration` to `"0"` makes existing captured content eligible for removal under the new policy. Aperture keeps request metadata and usage metrics. Review the impact before saving.

On the **Data Export** settings page, the retention section shows a live preview of how many captures the new duration would affect. Viewing the preview does not save the policy or pause removals under the saved policy. **Delete after** has a 1-hour minimum. To set `"0"`, choose **Zero retention**. Aperture caps a duration above the Tailscale-set maximum, so the preview might reflect a shorter window than you entered. The dashboard asks you to confirm destructive changes. For the changes that require confirmation, refer to [Privacy and data retention][docs-aperture-privacy].

Admins can also retrieve the affected count and the timestamp of the oldest affected capture from the endpoint used by the preview:

```shell
curl "https://<aperture-hostname>/api/retention/impact?duration=0"
```

The response contains `affected_count` and, when available, `oldest_capture`. The endpoint requires admin access and a `duration` query parameter. If the requested duration exceeds the retention limit Tailscale configured for your managed Aperture service, the preview uses that limit so it matches the effective retention policy.

## Step 5: Save and verify

Saving applies the new policy to subsequent requests. Requests already in progress might use the old policy. Aperture removes previously stored captures later, under the new policy. Zero retention alone does not remove content from hook payloads, so check hooks before you send a test request.

To save and verify the policy:

1. Review the `send_hooks` `send` arrays in every grant that can match the test request. Matching grants combine their allowed fields for each hook, so a change to one grant is not enough.
2. If your policy forbids content leaving through hooks, remove `request_body`, `response_body`, `user_message`, and `raw_responses` from each matching hook binding. You can instead set `send: []` in each matching grant, or set `disabled: true` on the top-level hook.
3. Save the hook changes.
4. Save the retention configuration. If you use the raw editor, the save succeeds without a validation error. A common cause of errors is a missing comma in the `database` block.
5. Send a request that contains only non-sensitive test content through the gateway.
6. On the admin dashboard's [**Logs** page][docs-aperture-dashboard-admin-logs] at `/admin/logs`, find the request and open its capture.

Check the result for the posture you saved:

* **Never store capture content on disk** (`duration: "0"`, `require_export: false`): The new request still shows usage metrics, such as the model, token counts, and estimated cost when available. Its capture shows a retention notice instead of request and response bodies and headers. This check does not verify Chat history or hook delivery.
* **Archive to S3, then scrub locally** (`duration: "0"`, `require_export: true`): The new request's capture can show bodies and headers until the export and the later purge finish. [Verify that the expected record was exported][docs-aperture-export-s3-verification], then return to the same capture. A retention notice in place of its bodies and headers shows that Aperture purged this capture locally. An S3 object alone does not prove that it contains this request or that Aperture removed the local content. Until the notice appears, the local scrub is not verified. Because this posture uses `purge: ["captures"]`, Aperture keeps tool data after the scrub.

A request without tool calls cannot test how the never-store posture handles tool data. If your model and client support tool calls, send a separate test request with synthetic, non-sensitive tool arguments. Check that its capture does not contain tool names or parameters. Their absence is consistent with the capture policy, but the dashboard cannot show whether a hook or another data store received them. Review matching hooks before this test as well.

## Troubleshooting

Use these checks when request content or tool parameters remain visible after you change retention settings.

### Content is still visible in the admin dashboard

First, confirm the configuration saved. Reopen the configuration editor at `/admin/settings/config` or the **Data Export** settings page at `/admin/settings/database`. Check that `retention.duration` is `"0"` and that `purge` lists the categories you intended.

Aperture does not remove previously stored captured content as soon as you save. The impact preview shows what the new policy would remove. New requests after the save store no captured body content when `duration: "0"` and `require_export: false`. Use a fresh request rather than an old one to verify the policy.

Aperture stores indexed header values separately, and a capture purge does not remove them. Zero-retention mode stops new header-index writes but does not remove values that are already indexed.

### Tool parameters still appear though bodies are gone

Check that you are viewing a request made after you saved the never-store settings. With `purge: ["captures"]` only, Aperture keeps tool names, parameters, and counts as a separate category. If your policy requires removing them, add `"tools"` to `purge`. For an archived request, wait for its local purge before you check tool data. The archive-to-S3 example does not purge tools.

### Captured content remains in archive-to-S3 mode

When `require_export` is `true`, Aperture removes local captured content only after successfully exporting the capture to S3. If exports fail or S3 is not configured, Aperture keeps captured content past its retention window instead of deleting data that was never archived. Check that [S3 export][docs-aperture-export-s3] is configured and succeeding.

## Security considerations

With `duration: "0"`, `purge: ["captures", "tools"]`, and `require_export: false`, Aperture clears captured prompt and response bodies, headers, raw HTTP bytes, and tool arguments before writing capture records to disk. This reduces captured content at rest but does not mean other gateway data stores are content-free.

Zero capture retention has these boundaries:

* Request and session metadata and usage metrics (identity, model, token counts, and estimated cost) remain available. Zero retention is not a no-logs setting. Unless you add `"tools"` to `purge`, Aperture also keeps captured tool arguments and other tool data.
* Aperture Chat conversation messages remain in a separate store. Proxy capture retention does not delete Chat history.
* Zero retention does not stop most hooks from sending content. Pre-request guardrails can receive prompts without redaction, and post-response `entire_request` hooks can receive prompts or completions. With `duration: "0"`, `require_export: false`, and `purge: ["captures", "tools"]`, Aperture skips tool extraction, so `tool_call_entire_request` hooks do not fire. For hooks that do fire, check `send_hooks` `send` in every matching grant. Fields such as `request_body`, `response_body`, `user_message`, and `raw_responses` can carry content. Matching grants combine allowed fields for each hook. When content must not leave, restrict all matching bindings to metadata, set `send: []` in each binding, or set `disabled: true` on the top-level hook. Aperture omits excluded fields from webhook JSON rather than sending them blank.
* Aperture does not change how the upstream provider handles your content. Tailnet connections use Tailscale encryption, and Aperture reaches upstream providers over TLS. Review each provider's data handling separately.

The archive-to-S3 option keeps a copy of captured content in an external bucket after Aperture removes it locally. Removing local content does not delete S3 objects. Apply the same access control and encryption requirements to the bucket.

## Next steps

* Refer to [Privacy and data retention][docs-aperture-privacy] for an overview of how Aperture stores, retains, and exports captured data.
* Refer to the [`database` configuration reference][docs-aperture-retention] for the complete field reference.
* [Export usage data to S3][docs-aperture-export-s3] to keep a durable, off-gateway archive.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-export-s3-verification]: /docs/aperture/how-to/export-usage-data-to-s3#verify-the-export

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-retention]: /docs/aperture/configuration#database
