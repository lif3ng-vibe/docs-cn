---
title: "Aperture how-to guides"
description: "Step-by-step guides for configuring Aperture providers, access controls, spending limits, observability, and integrations."
---

Last validated Sep 28, 2026

* [Build a custom webhook](/docs/aperture/how-to/build-custom-webhook) — Create a custom webhook integration to send Aperture event data to your own services.

* [Check and refill budgets](/docs/aperture/how-to/check-and-refill-budgets) — Check personal and organization quota status, and manually refill balances as an Aperture admin.

* [Configure overdraft quotas](/docs/aperture/how-to/configure-overdraft-quotas) — Chain Aperture quota buckets so requests borrow from additional buckets when a primary bucket is exhausted.

* [Configure zero-retention mode](/docs/aperture/how-to/configure-zero-retention) — Configure Aperture to not store captured prompt and response content on disk, and learn which Chat and hook data the setting does not cover.

* [Enable the chat sandbox](/docs/aperture/how-to/enable-sandbox) — Enable the sandbox feature so the Aperture assistant can run code, edit files, and produce downloadable artifacts in conversations.

* [Export usage data to S3](/docs/aperture/how-to/export-usage-data-to-s3) — Configure Aperture to export LLM usage data to an Amazon S3 bucket for analysis, archiving, and long-term retention.

* [Filter logs by header](/docs/aperture/how-to/filter-logs-by-header) — Index request and response headers in Aperture so you can filter by header presence or value on supported Aperture admin dashboard pages.

* [Grant access to MCP tools](/docs/aperture/how-to/grant-mcp-tool-access) — Configure Aperture grants to control which connector capabilities users can access, including MCP tools, resources, templates, and HTTP proxy access.

* [Grant access to models](/docs/aperture/how-to/grant-model-access) — Configure Aperture grants to control which models each user or group can access.

* [Grant connector access by label](/docs/aperture/how-to/grant-connector-access-by-label) — Label Aperture connectors and grant access by label so a single grant covers every connector in a group instead of naming each connector ID.

* [Manage sandbox operations](/docs/aperture/how-to/manage-sandbox) — Monitor sandbox health and understand the security properties of the Aperture chat sandbox.

* [Set a team-wide budget](/docs/aperture/how-to/set-team-budget) — Configure a shared quota bucket in Aperture to cap total AI spending across your organization.

* [Set per-user spending limits](/docs/aperture/how-to/set-per-user-spending-limits) — Configure quota buckets in Aperture to set spending limits for individual users.

* [Set up a guardrail](/docs/aperture/how-to/set-up-guardrails) — Configure a pre-request hook to inspect, modify, or block LLM requests before they reach the provider.

* [Set up a per-user OAuth 2.0 connector](/docs/aperture/how-to/set-up-per-user-oauth2-connector) — Connect Aperture to an external service that requires individual user consent using the OAuth 2.0 authorization code flow.

* [Set up a self-hosted provider](/docs/aperture/how-to/use-self-hosted) — Configure a self-hosted LLM server as a provider in Aperture so your team can access private models through your tailnet.

* [Set up admin access](/docs/aperture/how-to/set-up-admin-access) — Configure administrator roles for managing Aperture settings and accessing all user data.

* [Set up Amazon Bedrock](/docs/aperture/how-to/use-amazon-bedrock) — Configure an Amazon Bedrock provider in Aperture so your team can access foundation models through AWS.

* [Set up an HTTP API connector](/docs/aperture/how-to/set-up-http-api-connector) — Configure Aperture to proxy requests to an upstream REST API with automatic credential injection.

* [Set up an OpenAI-compatible provider](/docs/aperture/how-to/use-openai-compatible-provider) — Configure an OpenAI-compatible provider in Aperture, including API formats, authorization, and cost estimation.

* [Set up Anthropic](/docs/aperture/how-to/use-anthropic) — Configure an Anthropic provider in Aperture so your team can access Claude models.

* [Set up Gemini Enterprise Agent Platform](/docs/aperture/how-to/use-gemini-enterprise-agent-platform) — Configure a Gemini Enterprise Agent Platform provider in Aperture with a GCP service account and key file so your team can access Gemini and Claude models through Aperture.

* [Set up Google Gemini](/docs/aperture/how-to/use-google-gemini) — Configure a Google Gemini provider in Aperture so your team can access Gemini models using the direct Gemini API.

* [Set up Microsoft Foundry](/docs/aperture/how-to/use-microsoft-foundry) — Configure Microsoft Foundry providers in Aperture so your team can access OpenAI GPT and Anthropic Claude models deployed in Foundry.

* [Set up OpenAI](/docs/aperture/how-to/use-openai) — Configure an OpenAI provider in Aperture so your team can access GPT models.

* [Set up OpenRouter](/docs/aperture/how-to/use-openrouter) — Configure an OpenRouter provider in Aperture so your team can access models from multiple providers through a single aggregator.

* [Set up passthrough mode](/docs/aperture/how-to/use-passthrough-mode) — Configure an Aperture provider to forward each client's own credential, including subscription OAuth tokens, to the upstream provider instead of injecting a shared API key.

* [Set up the chat UI](/docs/aperture/how-to/set-up-chat-ui) — Configure models, curate the model picker, and manage access to the Aperture Chat interface.

* [Set up Vercel AI Gateway](/docs/aperture/how-to/use-vercel) — Configure a Vercel AI Gateway provider in Aperture so your team can access models from multiple LLM providers.

* [Use Claude Code Action with Aperture](/docs/aperture/how-to/use-claude-code-action) — Configure the Claude Code GitHub Action to route requests through Aperture so CI runners authenticate with Tailscale identity instead of individual API keys.

* [Use Claude Code with Aperture](/docs/aperture/how-to/use-claude-code) — Configure Claude Code to route requests through your Aperture gateway.

* [Use Claude Desktop with Aperture](/docs/aperture/how-to/use-claude-desktop) — Configure the Claude Desktop app to route Anthropic Messages model inference through your Aperture gateway.

* [Use Codex with Aperture](/docs/aperture/how-to/use-codex) — Configure OpenAI Codex to route requests through your Aperture gateway.

* [Use OpenAI-compatible tools with Aperture](/docs/aperture/how-to/use-openai-compatible-tools) — Configure Roo Code, Cline, and other clients that use OpenAI-compatible APIs to route requests through Aperture.

* [Use OpenCode with Aperture](/docs/aperture/how-to/use-opencode) — Configure OpenCode to route requests through your Aperture gateway.
