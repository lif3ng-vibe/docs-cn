---
title: "What is Aperture?"
description: "Aperture by Tailscale is an AI agent that works with the machines in your tailnet, backed by a gateway that routes LLM requests through your Tailscale identity."
---

Last validated Sep 29, 2026

Aperture by Tailscale is an AI agent that works with the machines in your [tailnet][docs-tailnet]. In [Aperture Chat][docs-aperture-chat], you start a task, connect your machines to it, and the agent runs commands on them using your access.

Your files stay on the machines. The agent operates on them in place. It does not copy them to a hosted workspace.

The agent reaches an LLM through Aperture's gateway, a reverse proxy that sits between LLM clients and providers. The gateway holds the provider API keys and adds them to each request, so you do not supply your own key, and it records who made the request. Coding assistants, automated agents, and CI jobs can send their LLM traffic through the same gateway.

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

Organizations adopting AI across development, automation, and internal tools face new challenges around security, visibility, and control. API keys are often scattered across developer devices, continuous integration/continuous delivery (CI/CD) systems, and automated agents, increasing the risk of leaks and making credentials difficult to rotate or audit. Teams lack clear insight into who is using which models, how frequently, and at what cost. This makes it difficult for security, platform, and compliance teams to support AI use across every developer, agent, and pipeline without slowing delivery down.

After reading this topic, you'll understand how the Aperture agent works with your machines, how Tailscale identity lets it act as you without distributing API keys, and what visibility Aperture gives you into LLM usage.

## How the agent uses your identity

Tailscale authenticates a device when it joins the [tailnet][docs-tailnet], and Aperture reads that identity through [Tailscale's identity layer][docs-tailscale-identity]. Users do not log in to Aperture separately or hold API keys.

When you connect a machine to a task, the agent runs commands on it with your access. Its privileges on that machine matches yours. A machine is part of a task only after you connect it. The agent will not access a machine you have not connected to. Aperture records the commands the agent runs and attributes them to you for review.

## How the gateway handles LLM requests

Requests from the agent and from other LLM clients pass through the gateway before reaching a provider such as OpenAI, Anthropic, or Google, and responses pass back through it. At this point Aperture adds the provider key, routes the request by model name, records usage and cost, and applies [guardrails][docs-aperture-guardrails].

Clients connect to the Aperture gateway and request a model. Aperture selects a provider that supports both the model and the request's API format. The user must have permission to access the model. Refer to [Supported providers and clients][docs-aperture-provider-compatibility] for setup requirements.

## What Aperture provides

Because agent commands and LLM requests carry your identity and pass through Aperture, you get visibility and control that are hard to achieve when clients connect directly to providers.

* **Centralized API key management.** API keys stay in the [server configuration][docs-aperture-configuration], never on developer devices. Aperture injects the appropriate key for each request. When a key needs rotation, you update it in one place.

* **Aperture Chat.** [Aperture Chat][docs-aperture-chat] is a browser agent available at `/` or `/chat`. Connect machines from your tailnet to a task, and the agent runs commands on them with your access. You can also talk to models, connect your tools, and review your own activity. You do not need a separate client.

* **Usage visibility and cost tracking.** Aperture records the user, model, and token counts for each request. Users review their own [usage][docs-aperture-chat-usage]. Admins review [organization-wide usage][docs-aperture-admin-usage], [export data][docs-aperture-export-s3], and [set spending limits][docs-aperture-manage-spending].

* **Adoption analytics.** The admin dashboard's [**Usage Overview** page][docs-aperture-admin-usage] shows active users and usage patterns across the organization, including which teams use which tools and how often.

* **Request and response capture.** Aperture stores full request and response bodies for review. The capture system preserves headers, payloads, and tool use data. Configure a [retention policy][docs-aperture-retention] to control how long Aperture keeps capture data, and [export logs and events][docs-aperture-export-s3] to your SIEM (security information and event management) system for durable storage and review. For strict data-handling requirements, enable [zero data retention][docs-aperture-privacy] so Aperture never writes prompt or response content to disk.

* **Guardrails.** [Guardrails][docs-aperture-guardrails] inspect, modify, or block requests at the gateway level before they leave your network. Use cases include scrubbing personally identifiable information (PII) from prompts, restricting tool declarations, and enforcing content policies.

* **Session debugging.** Users can inspect their own [sessions and request captures][docs-aperture-chat-sessions]. Admins can use the admin dashboard's [**Logs** page][docs-aperture-admin-logs] to inspect sessions across the organization and review full request and response data.

* **Outbound integrations.** Aperture can proxy connections to external [MCP servers][docs-aperture-mcp-server] and HTTP APIs through [connectors][docs-aperture-connectors]. Connectors centralize authentication for external services, so individual users do not need separate API keys or OAuth tokens configured in their local tools. AI agents discover available connectors through the MCP tool list.

* **Approved device provisioning.** Through the [built-in tailnet connector][docs-aperture-built-in-connectors], an agent can connect a device to your tailnet on your behalf after you approve creation of a single-use, short-lived auth key. Tailscale binds the key to your user identity. By default, the device carries node attributes that identify it as Aperture-created (`custom:createdByAperture`) and AI-created (`custom:createdByAI`).

## Limitations

Consider the following limitations before deployment. Tailscale is actively developing Aperture, so this list updates frequently.

* **Tailscale requirement**

  The Aperture server runs in a tailnet. Clients can connect from inside the tailnet or [from outside it][docs-aperture-connect-outside-tailnet] using an Aperture CLI bridge or [`ts-unplug`][xt-gh-ts-plug]. Both paths provide Tailscale-based identity. Aperture does not support direct public internet access.

* **Provider support**

  Metrics extraction relies on parsing provider response formats. Aperture handles OpenAI, Anthropic, Gemini, and OpenAI-compatible APIs. Refer to [Supported providers and clients][docs-aperture-provider-compatibility] for API formats and setup requirements. New providers or format changes might require updates.

* **Quota capacity reductions**

  Aperture persists quota bucket balances. When you reduce a bucket's capacity, Aperture caps the existing balance at the new value. The excess is not recoverable. Aperture removes buckets whose quota definitions you delete from the configuration. For details, refer to [bucket lifecycle][docs-aperture-bucket-lifecycle].

* **Subscription plan authentication**

  By default, Aperture authenticates with LLM providers using API keys from provider developer platforms, such as the [Anthropic Console][xt-anthropic-console], [OpenAI Platform][xt-openai-platform], or [Google AI Studio][xt-google-ai-studio]. Aperture centrally manages those keys for shared use. Consumer and business subscription plans such as [Claude Pro or Claude Max][xt-anthropic-plans], [ChatGPT Plus, Pro, or Team][xt-openai-plans], or [Gemini Advanced][xt-gemini-plans] provide OAuth tokens rather than these API keys, so they don't fit the default centralized model. To use a subscription plan, configure a provider in [passthrough mode][docs-use-passthrough-mode]. Aperture preserves a client-supplied `Authorization` or `x-api-key` header. If the client sends neither header, Aperture uses the configured provider key.

## FAQ

**What happens if a user tries to connect from outside the tailnet?**

Users outside the tailnet can [connect through an Aperture CLI bridge or `ts-unplug`][docs-aperture-connect-outside-tailnet]. Both create a lightweight tailnet node and proxy local traffic to Aperture. Without one of them, the connection fails at the network level because Aperture listens on Tailscale interfaces.

**What happens when I add a new LLM provider to the configuration?**

Clients can use a new provider's models if their API formats match and the user has permission to access the model. Changing the model name does not make incompatible APIs work together. Refer to [Supported providers and clients][docs-aperture-provider-compatibility] for requirements.

**What happens if a streaming response is interrupted mid-stream?**

The proxy captures whatever data arrived before the interruption. Metrics extraction might fail or report partial data, but the proxy stores the partial capture for debugging.

**Do clients need API keys to use Aperture?**

For a shared-key provider, no. Aperture identifies users through Tailscale and adds the configured provider key. Some clients still require a placeholder API key. With [passthrough mode][docs-use-passthrough-mode], clients can send their own provider credentials. They must do so if the provider has no fallback key.

**Can I use my Claude Max, ChatGPT Plus, or other subscription plan with Aperture?**

Yes, through passthrough mode. Subscription plans provide OAuth tokens rather than developer-platform API keys, so they don't fit Aperture's default model of centrally managed keys. Configure the provider with `auth_mode: "passthrough"`, and Aperture preserves a client-supplied `Authorization` or `x-api-key` header. If the client sends neither header, Aperture uses the configured provider key. Refer to [Subscription plan authentication][ar-limitations] for the trade-offs, and [Set up passthrough mode][docs-use-passthrough-mode] for the steps.

**Can I use Aperture with providers not listed in the documentation?**

You can configure providers that expose an OpenAI-compatible `/v1/chat/completions` endpoint, such as Groq, Together AI, Fireworks, Mistral, DeepSeek, and Perplexity. These are examples of the generic configuration path, not individually verified integrations. Tailscale does not test or guarantee compatibility with every OpenAI-compatible provider. Refer to [set up an OpenAI-compatible provider][docs-use-openai-compatible-provider] for the configuration steps.

**Can I use Aperture with self-hosted LLMs?**

Yes, you can proxy self-hosted LLMs with Aperture without exposing the endpoints to the public internet.
Refer to [set up a self-hosted provider][docs-use-self-hosted] for servers reachable from the Aperture gateway, either locally or over your tailnet.

**Can I use Aperture in CI/CD environments, such as GitHub Actions?**

Yes, as long as you can run Tailscale. Aperture works in common containerized environments such as GitHub Actions without needing to expose either the agent or the gateway to the public internet.

**Can I use Aperture with several tailnets?**

Yes, you can [connect to Aperture from another tailnet][docs-aperture-connect-outside-tailnet] using an Aperture CLI bridge or [`ts-unplug`][xt-gh-ts-plug]. You can also use either method to connect from environments that aren't in a tailnet at all.

**Can I use Aperture to connect AI agents to external APIs and MCP servers?**

Yes. Aperture supports [connectors][docs-aperture-connectors] that proxy connections to remote MCP servers and HTTP APIs. Aperture injects authentication automatically, so agents access external services without managing individual credentials. Refer to [MCP server proxying][docs-aperture-mcp-server] for MCP-specific setup and the [connectors][docs-aperture-connectors] topic for HTTP API proxying.

## Related resources

* [How Aperture works][docs-aperture-how-aperture-works]: a deeper look at request routing, telemetry capture, and session tracking.
* [Get started with Aperture][docs-aperture-get-started]: sign up, configure providers, and connect your first LLM client.
* [Supported providers and clients][docs-aperture-provider-compatibility]: provider and client inventories, API formats, and setup requirements.
* [Connect from outside the tailnet][docs-aperture-connect-outside-tailnet]: use an Aperture CLI bridge or `ts-unplug` to connect clients that aren't in the tailnet.

[ar-limitations]: #limitations

[docs-aperture-bucket-lifecycle]: /docs/aperture/configuration#bucket-lifecycle

[docs-aperture-built-in-connectors]: /docs/aperture/connectors/built-in-connectors

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-admin-usage]: /docs/aperture/reference/dashboard-admin#usage-overview

[docs-aperture-chat]: /docs/aperture/reference/chat

[docs-aperture-chat-sessions]: /docs/aperture/reference/chat#sessions

[docs-aperture-chat-usage]: /docs/aperture/reference/chat#usage

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-guardrails]: /docs/aperture/guardrails

[docs-aperture-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-aperture-manage-spending]: /docs/aperture/manage-spending

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-retention]: /docs/aperture/configuration#database

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-use-self-hosted]: /docs/aperture/how-to/use-self-hosted

[xt-anthropic-console]: https://console.anthropic.com

[xt-anthropic-plans]: https://claude.com/pricing

[xt-gemini-plans]: https://gemini.google.com

[xt-gh-ts-plug]: https://github.com/tailscale/ts-plug

[xt-google-ai-studio]: https://aistudio.google.com

[xt-openai-plans]: https://openai.com/chatgpt/pricing

[xt-openai-platform]: https://platform.openai.com
