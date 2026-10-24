---
title: "Aperture"
description: "Monitor and secure LLM usage with Aperture by Tailscale."
---

Last validated Sep 28, 2026

[Start using Aperture](https://aperture.tailscale.com/)

\[Missing snippet: aperture\_terms.mdx]

Aperture by Tailscale is a centralized AI gateway that secures, monitors, and routes LLM requests across your organization. Aperture uses [Tailscale's identity layer][docs-tailscale-identity] to automatically authenticate users, eliminating the need to distribute shared provider API keys. Configure compatible clients to route requests through your Aperture gateway to upstream LLM providers such as OpenAI, Anthropic, and Google.

Aperture has two web interfaces. Use [Chat][docs-chat] to talk to models, connect your tools, and review your own usage. Administrators use the [admin dashboard][docs-admin-dashboard] to configure the gateway and review organization-wide activity.

## Understand Aperture

Explore the following topics to understand what Aperture does, how it authenticates users, routes requests, and captures telemetry.

[**What is Aperture?**](/docs/aperture/what-is-aperture) — Aperture by Tailscale is an AI agent that works with the machines in your tailnet, backed by a gateway that routes LLM requests through your Tailscale identity.

[**How Aperture works**](/docs/aperture/how-aperture-works) — Understand how Aperture uses Tailscale identity, model-based routing, and telemetry to secure and monitor LLM requests.

## Set up Aperture

Sign up, configure your LLM providers, connect external tools and APIs, and set up your first clients.

[**Get started with Aperture**](/docs/aperture/get-started) — Sign up for Aperture, configure a provider, and send your first request.

[**Aperture CLI**](/docs/aperture/cli) — Use the Aperture CLI to discover, configure, and run coding agents that connect through your Aperture gateway.

[**Connect devices outside your tailnet**](/docs/aperture/connect-outside-tailnet) — Connect devices that are not in your tailnet to your Aperture gateway using an Aperture CLI bridge or ts-unplug.

[**Set up LLM providers**](/docs/aperture/set-up-providers) — Configure upstream LLM providers so Aperture can route requests and inject authentication on behalf of your users.

[**Set up LLM clients**](/docs/aperture/use-your-tools) — Configure LLM clients to route requests through Aperture.

[**Set up the chat UI**](/docs/aperture/how-to/set-up-chat-ui) — Configure models, curate the model picker, and manage access to the Aperture Chat interface.

[**Chat**](/docs/aperture/chat) — Chat with models, use connected tools, and review your own Aperture usage in one web interface.

[**MCP server proxying**](/docs/aperture/mcp-server) — Aggregate tools and resources from remote MCP servers through Aperture with identity-based access control.

[**Connectors**](/docs/aperture/connectors) — Find documentation for Aperture connectors, including setup guides, conceptual explanations, and configuration reference.

## Manage access and spending

Control which users and models are available, set spending limits, and configure Aperture's behavior.

[**Aperture configuration reference**](/docs/aperture/configuration) — Reference for Aperture configuration fields, defaults, and validation errors.

[**Aperture admin dashboard**](/docs/aperture/admin-dashboard) — Use the Aperture admin dashboard to monitor organization-wide activity, manage access and spending, and configure your Aperture gateway.

[**Control AI access**](/docs/aperture/control-access) — Manage who can access Aperture and which models they can use.

[**Manage AI spending**](/docs/aperture/manage-spending) — Set budgets, buy tokens, control per-user spending limits, and monitor quota balances in Aperture.

## Observe, govern, and integrate

Monitor LLM usage across your organization, control how Aperture stores and retains that data, and connect Aperture with external services.

[**Observe and export AI usage**](/docs/aperture/observe-and-export) — Review your own Aperture usage in Chat or use the admin dashboard to inspect and export organization-wide activity.

[**Privacy and data retention**](/docs/aperture/privacy-and-data-retention) — Control how long Aperture retains captured data, where it exports, and where request content leaves Aperture.

[**Integrate with external tools**](/docs/aperture/integrate) — Connect Aperture with authorization engines, log aggregators, and external services.

## Reference and troubleshooting

Supported providers and clients, configuration reference, CLI documentation, and solutions to common issues.

[**Aperture reference**](/docs/aperture/reference) — Reference documentation for Aperture interfaces, configuration, provider compatibility, CLI, and integration recipes.

[**Supported providers and clients**](/docs/aperture/reference/supported-providers-clients) — Compare Aperture provider and client compatibility, API formats, requirements, and setup options.

[**Aperture how-to guides**](/docs/aperture/how-to) — Step-by-step guides for configuring Aperture providers, access controls, spending limits, observability, and integrations.

[**Troubleshooting Aperture**](/docs/aperture/troubleshooting) — Common Aperture by Tailscale error conditions, their causes, and resolution steps.

[docs-chat]: /docs/aperture/chat

[docs-admin-dashboard]: /docs/aperture/admin-dashboard

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
