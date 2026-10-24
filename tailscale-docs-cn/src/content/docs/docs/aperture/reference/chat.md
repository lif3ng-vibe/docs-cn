---
title: "Aperture Chat interface reference"
description: "The Aperture Chat interface combines conversations with tools for reviewing your own activity and connecting other clients. For a capability overview, refer to [Chat][docs-chat]. For organization-wide"
---

Last validated Sep 28, 2026

The Aperture Chat interface combines conversations with tools for reviewing your own activity and connecting other clients. For a capability overview, refer to [Chat][docs-chat]. For organization-wide analytics and configuration, use the separate [admin dashboard][docs-admin-dashboard].

## Open Chat

Open your Aperture hostname or `/chat` on that hostname. You must be authenticated and have portal access. Portal access is available by default, but an administrator can disable it for API-only users. Your grants separately control access to models and connectors.

The sidebar provides **New chat**, **Projects**, your conversation history, and the personal pages described below. **Skills** appears when a personal library is available for your account. **Quotas** appears when quota buckets apply to you.

Administrators also find **Admin console** in the sidebar footer. This opens `/admin/` in a new tab. Non-admin users cannot use the admin dashboard.

## Start a conversation

1. Select **New chat**.
2. Open the model selector next to the send button and choose a model. Use search to find a model in a long list.
3. If the model supports reasoning effort, select the effort you want in the same selector.
4. Optionally attach files or open **Tools** to choose capabilities for the conversation.
5. Enter your message and send it.

While the assistant generates a response, the send control becomes a stop control. Select it to stop generation. Conversations appear in the sidebar so you can return to them later.

### Model and reasoning selection

The composer shows models that your administrator offers for chat and your grants allow. The **Models** directory can include models that are available through other clients but are not offered in the chat selector.

Reasoning choices depend on the selected model. A higher effort asks a supported model to spend more reasoning on a response. If you attach an image to a model that does not support images, the composer prevents sending and asks you to change the model or remove the attachment.

Administrators curate the selector in **Administration** > **Chat** > **Models** in the admin dashboard. Curation does not grant access to a model.

### Tools

Open **Tools** in the composer to choose capabilities and connector tools. Availability depends on the gateway, your grants, your authorizations, and any project restrictions.

* **Web** provides web tools when available.
* **Code Sandbox** lets the assistant run code and work with files when available. If it is unavailable, the menu directs you to contact support.
* **Location** lets you share your location through your browser's permission controls.
* Connector entries let you choose tools from services you can access. Open an entry to review and select individual tools.

When the **Tool search** setting is available, **On** loads tools when needed. **Off** loads all tools, which can require conversation compaction more often.

Selecting a tool does not grant access to it. To authorize a connector, use the [Connectors][ar-connectors] page. Project restrictions can prevent you from enabling a tool in a project conversation.

### Attachments and output files

Select **Attach files** in the composer to add files. Supported attachment handling depends on the file type and the available tools:

* Files sent to the model have a 25 MiB per-file limit.
* Files handled only by the code sandbox have a 500 MiB per-file limit.
* A conversation can have up to 20 attachments.

Select an output file to open the file viewer. The viewer supports text, code, images, Markdown, HTML, SVG, and PDF. Download files you want to keep outside the conversation.

## Projects

**Projects** (`/projects`) groups conversations with shared instructions and tool restrictions. Select a project to review its chats, edit its instructions, or start a conversation in that project.

Project instructions apply to conversations in the project and have a 16 KiB (16,384-byte) limit. Tool restrictions narrow the tools available in those conversations. They do not grant access to otherwise unavailable connectors or tools.

When node selection is available, assigned tailnet nodes guide which machines chat tries first. Assignment does not grant Tailscale SSH access or restrict chat to those nodes. Your tailnet's Tailscale SSH policy remains authoritative.

For creation, conversation organization, instructions, and node selection procedures, refer to [Chat projects][docs-projects].

## Models

**Models** (`/models`) is the directory of models available to you through Aperture. Use it to review model identifiers, capabilities, context limits, and pricing where that information is available.

Use the model identifier when configuring an API client or agent. If a model you expect is missing, ask an administrator to check its provider configuration and your grants. The directory does not let ordinary users change providers or grant themselves model access.

## Connectors

**Connectors** (`/connectors`) lists the services your grants let you use. Aperture omits configured connectors that your grants deny instead of showing them as inaccessible.

Use the page to find connectors that are ready to use, connect an account, or reconnect an expired or unusable authorization. Select a connector to review its details and MCP tools, where applicable.

A **Ready** status describes your access and authorization. It is not an upstream health check. For a ready MCP connector, **Refresh tools** contacts the upstream service to request the current tool list. A refresh error does not by itself change the connector's authorization status.

For status descriptions and authorization steps, refer to [Use a connector][docs-use-connector]. Administrators configure connectors separately in **Administration** > **Connectors** in the admin dashboard.

## Skills

**Skills** (`/skills`) is your personal library of reusable instructions and supporting files. It appears only when the library is available for your account.

Use the library to search for skills, import a skill, or inspect its instructions and files. Aperture stages edits as a draft. Select **Save changes** to validate the skill and update your personal library. This does not make the skill public.

Select **Use in chat** from a skill to start a conversation with it, or select a skill from the composer's skill suggestions. Review imported instructions and files before using them, especially when the conversation has tools that can change external systems.

## Sessions

**Sessions** (`/sessions`) shows your LLM request sessions through Aperture, including traffic from coding agents. It is not the same as the chat conversation list in the sidebar.

Select a session to inspect its request timeline. Select a request to inspect available details such as its model, token usage, timing, headers, and captured payloads. Request and response bodies are available only when captured and retained under the gateway's retention policy.

Use this view to investigate your own requests. Administrators use **Security** > **Logs** in the admin dashboard for organization-wide request inspection.

## Usage

**Usage** (`/usage`) shows your personal token usage and estimated costs across requests routed through Aperture.

Choose a time range, switch between cost and token views, and group the breakdown by model or agent. The page includes token totals and request counts. Costs are estimates based on the pricing information available to Aperture, not a provider invoice.

For organization-wide comparisons, administrators use **Usage & Adoption** in the admin dashboard. The personal **Usage** page does not expose other users' activity.

## Quotas

**Quotas** (`/quotas`) shows the spending limits that apply to your available models. The sidebar entry is hidden when no quota buckets apply.

Review balances and refill information to understand when you can continue using a model. The page identifies low balances, use of backup funds, and models blocked by exhausted quotas. Use **Refresh quotas** to update the view.

Non-admin users can inspect their limits but cannot refill or change them. Administrators can adjust balances, control refills, and manage other users' limits in the admin dashboard. For the available actions, refer to [Check and refill budgets][docs-budgets].

## Agents

**Agents** (`/agents`) provides setup instructions for supported clients, using your Aperture gateway URL and configured providers. Select the client you want to connect and follow its displayed instructions.

If no compatible provider is configured, the page explains that an administrator needs to add one. This is a setup page, not a scheduler or an interface for running agents in the browser.

For command-line setup, refer to the [Aperture CLI][docs-cli] and [Use your tools][docs-use-tools].

## Share a conversation

Conversation sharing creates a read-only snapshot of the selected conversation branch. Recipients need the link, authenticated access to the gateway, and portal access. The link does not make the conversation publicly accessible on the internet.

> **Warning:**
>
> A shared snapshot includes thinking, tool results, and attachments in the shared conversation path. Review that content before sharing. Recipients can learn information returned by your tools even if they do not have access to the underlying service.

1. In the conversation header, select **Share** > **Share link**.
2. Select **Create link**.
3. Copy the link and send it only to the intended recipients.

New messages are not automatically added to an existing shared snapshot. Select **Shared** > **Manage share link**, then **Share new messages** to update it to the current conversation branch. Select **Unshare** to revoke the link. Revoking access does not remove copies a recipient already saved.

## Feedback

Open **Feedback** (`/feedback`) to send feedback about Aperture. For access problems, missing models, or unavailable connectors, contact your gateway administrator.

## Related

* [Chat overview][docs-chat]
* [Set up the chat UI][docs-chat-setup]
* [Admin dashboard reference][docs-admin-dashboard]
* [Privacy and data retention][docs-privacy]

[ar-connectors]: #connectors

[docs-admin-dashboard]: /docs/aperture/reference/dashboard-admin

[docs-budgets]: /docs/aperture/how-to/check-and-refill-budgets

[docs-chat]: /docs/aperture/chat

[docs-chat-setup]: /docs/aperture/how-to/set-up-chat-ui

[docs-cli]: /docs/aperture/cli

[docs-privacy]: /docs/aperture/privacy-and-data-retention

[docs-projects]: /docs/aperture/chat/projects

[docs-use-connector]: /docs/aperture/connectors/use-a-connector

[docs-use-tools]: /docs/aperture/use-your-tools
