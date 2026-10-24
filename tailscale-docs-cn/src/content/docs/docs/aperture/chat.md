---
title: "Chat"
description: "Chat with models, use connected tools, and review your own Aperture usage in one web interface."
---

Last validated Sep 28, 2026

Aperture Chat is the web interface for everyone who has access to your Aperture gateway. Use it to talk to models, work with connected tools, and review your own sessions, usage, and spending limits. You do not need to install a separate chat client.

Administrators use a separate [admin dashboard][docs-admin-dashboard] to configure the gateway and review organization-wide activity.

## Access Chat

Open your Aperture hostname in a browser, or go directly to `/chat`. Connect to your tailnet or use an access method your administrator provides.

Chat is available to authenticated users by default. Administrators can disable portal access for API-only users. Access to the interface does not grant access to models or connectors. Your grants determine which models and tools you can use.

If you are an administrator, select **Admin console** in the sidebar footer to open the admin dashboard. Select **Chat** in the admin dashboard to return to Chat.

## Work with models and tools

Work with the models and connected services your administrator makes available. Give a conversation context with attachments, or use tools to retrieve information and take actions in connected services.

Organize related conversations into **Projects** with shared instructions and tool restrictions. When available for your account, use **Skills** to reuse instructions and supporting files across conversations.

For exact controls and workflows, refer to the [Chat interface reference][docs-chat-reference].

## Review your activity

Use **Sessions** to investigate your requests, including traffic from coding agents. Review token usage and estimated costs in **Usage**, and check applicable spending limits in **Quotas**.

To use Aperture with another client, find model identifiers in **Models** and client setup instructions in **Agents**. Authorize services that require your account in **Connectors**.

These are personal views. Organization-wide analytics, configuration, and security logs require access to the admin dashboard.

## Learn more

[**Aperture Chat interface reference**](/docs/aperture/reference/chat) — Reference for the Aperture Chat composer, projects, connectors, skills, personal sessions, usage, and quotas.

[**Chat projects**](/docs/aperture/chat/projects) — Group conversations, set reusable instructions, and control tool access with chat projects.

[**Set up the chat UI**](/docs/aperture/how-to/set-up-chat-ui) — Configure models, curate the model picker, and manage access to the Aperture Chat interface.

[docs-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-chat-reference]: /docs/aperture/reference/chat
