---
title: "Observe and export AI usage"
description: "Review your own Aperture usage in Chat or use the admin dashboard to inspect and export organization-wide activity."
---

Last validated Sep 28, 2026

Aperture records token counts, model names, sessions, and tool use for LLM requests. Use **Usage** and **Sessions** in [Chat][docs-chat] to review your own activity. Admins use the [admin dashboard][docs-admin-dashboard] to review organization-wide usage, inspect logs, and export data.

For details about captures and sessions, refer to [How Aperture works][docs-aperture-how-aperture-works].

You can also connect Aperture with external services such as log aggregators and authorization engines. Refer to [Integrate with external tools][docs-aperture-integrate] for available integrations.

## Retention

Admins control how long Aperture keeps captured request and response bodies. With zero data retention, Aperture never writes these bodies to disk. Aperture keeps usage metrics regardless of the retention setting. Refer to [Privacy and data retention][docs-aperture-privacy] for setup instructions.

> **Note:**
>
> **Connector observability.** MCP tool calls that an LLM initializes appear in captures as part of the LLM request and response bodies (the `tool_use` and `tool_result` content blocks). Users can inspect their own retained captures in **Sessions**. Administrators can inspect them in **Security** > **Logs** in the admin dashboard.
>
> HTTP connector proxy requests (traffic to `/v1/connectors/{id}/`) do **not** appear in captures or usage telemetry. Aperture does not record connector requests, errors, latency, tokens, or cost. Refer to [Connectors][docs-aperture-connectors] for more information on configuring MCP and HTTP connectors.

[**Aperture Chat interface reference**](/docs/aperture/reference/chat) — Reference for the Aperture Chat composer, projects, connectors, skills, personal sessions, usage, and quotas.

[**Aperture admin dashboard reference**](/docs/aperture/reference/dashboard-admin) — Reference for the pages, controls, and configuration editors available in the Aperture admin dashboard.

[**Export usage data to S3**](/docs/aperture/how-to/export-usage-data-to-s3) — Configure Aperture to export LLM usage data to an Amazon S3 bucket for analysis, archiving, and long-term retention.

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-aperture-integrate]: /docs/aperture/integrate

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-chat]: /docs/aperture/reference/chat#usage

[docs-admin-dashboard]: /docs/aperture/admin-dashboard
