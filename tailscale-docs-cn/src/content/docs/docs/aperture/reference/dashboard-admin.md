---
title: "Aperture admin dashboard reference"
description: "Admin dashboard routes start with `/admin/`. Non-admin users use the separate Chat interface and its user-scoped pages."
---

Last validated Oct 1, 2026

\[Missing snippet: aperture\_open\_dashboard.mdx]

Admin dashboard routes start with `/admin/`. Non-admin users use the separate Chat interface and its user-scoped pages.

The sidebar groups admin pages under **Usage & Adoption**, **Security**, **Administration**, and **Reference**. Select **Chat** to open Chat in a new browser tab, or **Feedback** to send feedback.

To search the admin pages available to you, press Command+K on macOS or Ctrl+K on other platforms.

For a capability overview and access requirements, refer to [Aperture admin dashboard][docs-aperture-admin-dashboard].

## Usage & Adoption

Use these pages to review adoption, token usage, estimated costs, and quota balances across your organization.

### Usage Overview

Route: `/admin/adoption`

The **Usage Overview** page summarizes organization-wide token usage, estimated cost, and active users. It includes:

* Summary cards for active users, total tokens, and input, output, cached, and reasoning tokens. Estimated cost appears when cost data is available.
* A daily chart that switches between token usage and estimated cost when cost data is available.
* A sortable, paginated user table. Select a user to open their **User Dashboard**.
* A column selector for per-token-type columns.
* A CSV download for the current filters.

Filter by user, model, agent, status code, date range, or an indexed request or response header. Header filters are available after an administrator configures them on the **Reporting** page.

### User Activity

Route: `/admin/adoption/user-activity`

The **User Activity** page charts active users over time. Use the date filter and choose **Day**, **Week**, **Month**, or **4/7 DAU**. Select a range on the chart to update the date filter.

**4/7 DAU** counts users active on at least four of the preceding seven days.

### Model Activity

Route: `/admin/adoption/model-activity`

The **Model Activity** page breaks usage down by model. It provides:

* A stacked chart that switches between tokens and estimated cost when cost data is available.
* A sortable, paginated table with input, output, cached, reasoning, and total tokens, request count, average cost per million tokens, and cost when available.
* Filters for user, model, agent, status code, date range, and configured request or response headers.

### Agent Activity

Route: `/admin/adoption/agent-activity`

The **Agent Activity** page uses the same chart, table, and filters as **Model Activity**, but groups usage by agent. The agent identifies the client or harness that submitted the request.

### Chat Activity

Route: `/admin/adoption/chat-activity`

The **Chat Activity** page reports activity from the Chat interface. Use its date filter to review:

* Assistant turns over time, grouped by model or outcome.
* Assistant outcomes, including completed, error, canceled, refusal, truncated, context exceeded, and loop limit.
* Conversation, active-user, message, error, turn, token, and cost summaries.
* Frequent errors and model-specific error information.
* Per-user conversation, message, assistant-turn, error, and recent-activity totals.

### Connector Activity

Route: `/admin/adoption/connector-activity`

The **Connector Activity** page appears only when connector reporting is enabled for the gateway. Use its date filter to review:

* Total, MCP, HTTP, and OAuth connector counts.
* Authorized users and new authorizations over time.
* The distribution of authentication types.
* Sortable connector and user tables, including the latest authorization time.

This page reports connector adoption and authorization. It does not report upstream connector health.

### User Dashboard

Route: `/admin/dashboard` or `/admin/dashboard/<login-name>`

Use the **User Dashboard** to inspect one user's usage, quotas, and sessions:

1. Select a login name from the user picker.
2. Choose the reporting period with the date filter.
3. Review total requests, token categories, and estimated cost when available.
4. Review the user's quota cards. Use **Adjust balance** to **Add funds** or **Set balance**. Use **Pause refill** or **Resume refill** to control automatic refills.
5. Review the sortable **Metrics by Model** table.
6. Review **Recent Sessions** and filter them by model, agent, status code, configured header, or starred status.

### Quota Usage

Route: `/admin/quotas`

Use the **Quota Usage** page to check how quota buckets apply to a user's models:

1. Select a login name from the user picker.
2. Review quota warnings, remaining balances, model coverage, and overdraft relationships.
3. Use **Adjust balance** to **Add funds** or **Set balance**. Use **Pause refill** or **Resume refill** to control automatic refills.

For budget procedures, refer to [Check and refill budgets][docs-check-refill-budgets], [Set per-user spending limits][docs-set-per-user-spending-limits], and [Configure overdraft quotas][docs-configure-overdraft-quotas].

## Security

Use these pages to inspect captured requests, tool invocations, and administrative activity.

### Logs

Route: `/admin/logs`

The **Logs** page groups captured requests into sessions. Opening it from the sidebar selects a 7-day date range. Select a session to list its requests. Then select a request to inspect captured bodies, headers, and tool use.

Filter sessions by user, model, agent, status code, date range, starred status, or an indexed request or response header. Header filters can match a header's presence, a substring, or an exact value. For setup instructions, refer to [Filter logs by request or response header][docs-filter-logs-by-header].

Captured bodies depend on the gateway's retention settings. With zero capture retention, captures show no request and response bodies or headers. Aperture redacts them at write time or removes them in a later local purge. Tool details remain unless the retention policy purges tools. Request metadata and usage metrics remain available. For details, refer to [Privacy and data retention][docs-privacy-retention].

### Tool Use

Route: `/admin/tool-use`

The **Tool Use** page charts tool invocations over time and provides a sortable, paginated table. Opening it from the sidebar selects a 7-day date range. Filter by user, model, agent, tool name, date range, starred status, or a configured request or response header.

### Audit Logs

Route: `/admin/audits`

The **Audit Logs** page records administrative and sensitive data-access events, including configuration changes, quota operations, and access to captures, metrics, exports, or session data.

The table includes time, actor, action, subject, resource, and method. Filter events by these fields or use the column selector to show or hide columns. Expand an event to review its details. Configuration changes show a diff.

## Administration

The configuration editors in this group edit the [Aperture configuration][docs-aperture-configuration]. Visual forms save when you submit them, and immediate-save toggles save when you change them. Editors with a save button, such as **System prompt**, save only when you select that button. The **Configuration** page saves typed HuJSON only when you select **Save**.

If the **Configuration** editor has valid unsaved changes, a visual save includes those changes. If it has invalid HuJSON, Aperture blocks visual saves until you correct the syntax.

### Models

Route: `/admin/models`

The **Models** page groups available models by provider. Each provider group shows its configured display name, description, and priority if nonzero. Models are sorted by ID and show supported model details. If the provider supports testing, use a model's test control to send a request.

Use **Providers** to change the underlying provider or model list. Use **Chat** > **Models** to decide which granted models appear in Chat.

### Providers

Route: `/admin/settings/providers`

Use the **Providers** page to add, edit, and remove upstream model providers. **Quick Setup** starts with a provider preset. Each provider defines a base URL, authentication, and available models. Optional settings control its display name, description, preference, and compatibility.

For provider-specific procedures, refer to [Set up providers][docs-set-up-providers] and the [provider compatibility reference][docs-provider-compatibility].

### Grants

Route: `/admin/settings/grants`

The **Grants** page controls who can administer Aperture or use models, connector capabilities, reporting headers, and quota buckets. Each grant assigns one or more permissions to a source: a user, group, or `*`.

For supported patterns and access behavior, refer to [How grants work][docs-how-grants-work], [Grant access to models][docs-grant-model-access], [Grant connector access by label][docs-grant-connector-access], and [Grant access to MCP tools][docs-grant-mcp-tool-access].

### Connectors

Route: `/admin/settings/connectors`

The admin **Connectors** page defines the connector servers available through the gateway. The separate **Connectors** page in Chat lets users authorize connectors that their grants allow.

Use **Add connector** to choose a verified provider or configure a custom connector. Each connector defines a protocol, URL, and authentication. Optional settings include labels, context, visible capabilities, and caller identity forwarding.

For connector concepts and procedures, refer to [Get started with Aperture connectors][docs-connectors-get-started]. Use the [connector configuration reference][docs-connectors-reference] for all supported fields.

### Hooks

Route: `/admin/settings/hooks`

The **Hooks** page configures request hooks.

To add a hook, enter its **Hook ID** and **URL**. Optional settings include **API Key**, **Authorization**, **Timeout**, and **Disabled**. For hook events and fields, refer to the [hooks configuration reference][docs-aperture-hooks].

### Quota Configuration

Route: `/admin/settings/quotas`

The **Quota Configuration** page defines quota buckets. Its sidebar badge shows the bucket count and warns when no grant references a bucket.

Each quota has an identifier, monetary capacity, refill rate and period, and **On Exceed** behavior. Assign the quota to a grant to apply it. For ordered fallback buckets, refer to [Configure overdraft quotas][docs-configure-overdraft-quotas].

### Data Export

Route: `/admin/settings/database`

The **Data Export** page controls capture storage and retention:

* **Save raw bodies** controls `database.save_raws`. When this setting is on, Aperture saves the original HTTP request and response bytes from before JSON parsing, alongside parsed captures, for debugging. To access retained raw bodies, use S3 exports. Dashboard capture and **Logs** views do not show them.
* **Keep encrypted blobs** preserves large encrypted content blocks that Aperture otherwise removes from stored bodies.
* Retention controls let you keep captures forever, keep them for a set duration, or not retain them. Other controls let you purge tool content. When an S3 exporter is configured, you can also require export before deletion.
* **S3 Export** shows whether an S3-compatible export is configured and its bucket. Configure the exporter on the **Configuration** page.

For setup, refer to [Export usage data to S3][docs-export-s3] and [Configure zero-retention mode][docs-zero-retention]. For privacy controls, refer to [Privacy and data retention][docs-privacy-retention].

### Reporting

Route: `/admin/settings/reporting`

Use the **Reporting** page to configure indexed request and response headers for dashboard filtering:

* **Stored filterable headers** lists the headers Aperture indexes. Add valid HTTP header names and remove headers that should no longer be indexed.
* **Header filter grants** assigns one or more indexed headers, or `*`, to a source. You can edit or remove existing assignments. Admins also need an explicit header-filter grant.
* Backfill status shows the progress of indexing existing captured data.

The visual editor manages header names and their grants. Use **Configuration** for other header settings, including value redaction. For setup instructions, refer to [Filter logs by request or response header][docs-filter-logs-by-header].

### Billing

Route: `/admin/settings/billing`

The **Billing** page appears when Aperture billing is available for the gateway. It provides:

* **Current balance** and the 30-day purchase limit.
* A payment method for automatic reloads when the account is eligible.
* **Purchase credits**, with a **Credit amount** field and **Purchase** action.
* **Automatic reload**, with **Trigger at or below**, **Reload amount**, **30-day reload limit**, **Used in the past 30 days**, and **Save automatic reload**.
* **Credit history** for starter credits, purchases, and automatic reloads, including status and receipts when available.

To disable automatic reload, set **30-day reload limit** to zero or remove the payment method.

### Chat

Route: `/admin/settings/chat`

The **Chat** page configures the models and system prompt used by the Chat interface.

#### Models

The **Models** tab controls which models appear in the Chat model selector. It does not grant access. Each user sees only models on this list that their grants allow.

Each entry selects a model or pattern. It can also specify a display name, context window, maximum output, and roles: **Responses**, **Title generation**, or **Summarization**. Drag entries to set their order. Removing a model from this list does not change grants or access outside Chat.

#### System prompt

Route: `/admin/settings/chat/prompt`

Use the **System prompt** tab to choose the prompt sent with every Chat conversation:

* **Default** includes identity, user context, and short behavioral guidance.
* **Minimal** includes identity, user context, and tool-environment facts without behavioral guidance.
* **Custom** lets you edit and validate a prompt template that starts from the default.

Select **Save changes** to apply the selected mode or custom template. **Reset to default** changes the text in the editor but does not save it. Aperture-managed tool instructions remain included when the corresponding tools are available.

For initial Chat setup, refer to [Set up the Chat UI][docs-set-up-chat].

### Feature Flags

Route: `/admin/settings/feature-flags`

Use **Feature Flags** to enable or disable available features. Changing a visible toggle saves the configuration immediately.

### Configuration

Route: `/admin/settings/config`

The **Configuration** page is a HuJSON editor for the complete [Aperture configuration][docs-aperture-configuration]. HuJSON supports comments and trailing commas.

Edits stay in the browser until you select **Save**. Aperture checks HuJSON syntax as you type and displays errors. Saving sends the complete configuration for server validation.

If another administrator has saved a newer version, select **Refresh** to load it. Then apply your change again.

A configuration change cannot remove your own admin access. To transfer administration, grant another user admin access while keeping your own. Then have that administrator remove your role.

## Reference

This group provides integration information and an interactive API reference. The available pages depend on your account.

### Integrations

Route: `/admin/settings/integrations`

The **Integrations** page appears when the integrations catalog is available for the account. Browse integrations and open their setup information. For supported integration guides, refer to [Integrate with external tools][docs-integrate].

### API Docs

Route: `/admin/settings/api`

The **API Docs** page is an interactive OpenAPI reference for the Aperture API. Browse operations, authentication requirements, request fields, response fields, and errors. Select **Test Request** to open the request client. Then select **Send Request** to send a request from the browser.

## Related

For access requirements, configuration details, and procedures, refer to these topics:

* [Aperture admin dashboard][docs-aperture-admin-dashboard]
* [Aperture configuration reference][docs-aperture-configuration]
* [Aperture how-to guides][docs-aperture-how-to]
* [Aperture Chat reference][docs-aperture-chat-reference]

[docs-aperture-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-aperture-chat-reference]: /docs/aperture/reference/chat

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-hooks]: /docs/aperture/configuration#hooks

[docs-aperture-how-to]: /docs/aperture/how-to

[docs-check-refill-budgets]: /docs/aperture/how-to/check-and-refill-budgets

[docs-configure-overdraft-quotas]: /docs/aperture/how-to/configure-overdraft-quotas

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-filter-logs-by-header]: /docs/aperture/how-to/filter-logs-by-header

[docs-grant-connector-access]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-integrate]: /docs/aperture/integrate

[docs-privacy-retention]: /docs/aperture/privacy-and-data-retention

[docs-provider-compatibility]: /docs/aperture/provider-compatibility

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-chat]: /docs/aperture/how-to/set-up-chat-ui

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-zero-retention]: /docs/aperture/how-to/configure-zero-retention
