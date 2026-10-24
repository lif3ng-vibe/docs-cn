---
title: "Aperture admin dashboard"
description: "Use the Aperture admin dashboard to monitor organization-wide activity, manage access and spending, and configure your Aperture gateway."
---

Last validated Sep 28, 2026

Use the Aperture admin dashboard to monitor organization-wide AI activity, investigate requests, manage access and spending, and configure your gateway.

\[Missing snippet: aperture\_open\_dashboard.mdx]

## Access the admin dashboard

You need the Aperture admin role to use the admin dashboard. Other users use [Chat][docs-chat] for conversations and their own activity.

New Aperture gateways initially grant admin access to everyone. Restrict the role before your team starts using Aperture. For instructions, refer to [Set up admin access][docs-set-up-admin-access].

## Explore admin capabilities

Use the admin dashboard to:

* **Monitor adoption and spending.** Compare usage by user, model, or agent, and review quota balances.
* **Investigate requests.** Inspect retained captures and tool activity, and review administrative events in audit logs.
* **Manage access and budgets.** Configure grants, providers, connectors, and spending limits.
* **Configure the gateway.** Use visual editors for common settings or edit the complete [Aperture configuration][docs-aperture-configuration] as HuJSON.

For page controls and configuration save behavior, refer to the [admin dashboard reference][docs-aperture-admin-dashboard-reference].

## Next steps

* [Grant access to models][docs-grant-model-access].
* [Set per-user spending limits][docs-set-per-user-spending-limits].
* [Set a team budget][docs-set-team-budget].
* [Grant connector access by label][docs-grant-connector-access].
* [Grant access to MCP tools][docs-grant-mcp-tool-access].
* [Filter logs by request or response header][docs-filter-logs-by-header].
* [Export usage data to S3][docs-export-usage-data].
* [Configure zero-retention mode][docs-configure-zero-retention].

[docs-aperture-admin-dashboard-reference]: /docs/aperture/reference/dashboard-admin

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-chat]: /docs/aperture/chat

[docs-configure-zero-retention]: /docs/aperture/how-to/configure-zero-retention

[docs-export-usage-data]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-grant-connector-access]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access
