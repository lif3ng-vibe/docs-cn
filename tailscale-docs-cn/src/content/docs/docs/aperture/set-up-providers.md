---
title: "Set up LLM providers"
description: "Configure upstream LLM providers so Aperture can route requests and inject authentication on behalf of your users."
---

Last validated Sep 29, 2026

Choose a provider guide below to configure its API endpoint, credentials, and models in your [Aperture configuration][docs-aperture-configuration]. Compare API formats and requirements in [Supported providers and clients][docs-provider-compatibility] before [setting up a client][docs-use-your-tools].

To forward clients' own provider credentials, follow [Set up passthrough mode][docs-use-passthrough-mode]. You can also configure a shared key as a fallback.

Use [model aliases][docs-model-aliases] to keep client model names stable when you change the destination provider or model.

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

[**Set up passthrough mode**](/docs/aperture/how-to/use-passthrough-mode) — Configure an Aperture provider to forward each client's own credential, including subscription OAuth tokens, to the upstream provider instead of injecting a shared API key.

[**Model aliases**](/docs/aperture/model-aliases) — Configure model aliases, choose destinations, and apply grants, quotas, and hooks.

[**Set up OpenAI**](/docs/aperture/how-to/use-openai) — Configure an OpenAI provider in Aperture so your team can access GPT models.

[**Set up Anthropic**](/docs/aperture/how-to/use-anthropic) — Configure an Anthropic provider in Aperture so your team can access Claude models.

[**Set up Google Gemini**](/docs/aperture/how-to/use-google-gemini) — Configure a Google Gemini provider in Aperture so your team can access Gemini models using the direct Gemini API.

[**Set up Gemini Enterprise Agent Platform**](/docs/aperture/how-to/use-gemini-enterprise-agent-platform) — Configure a Gemini Enterprise Agent Platform provider in Aperture with a GCP service account and key file so your team can access Gemini and Claude models through Aperture.

[**Set up Amazon Bedrock**](/docs/aperture/how-to/use-amazon-bedrock) — Configure an Amazon Bedrock provider in Aperture so your team can access foundation models through AWS.

[**Set up Microsoft Foundry**](/docs/aperture/how-to/use-microsoft-foundry) — Configure Microsoft Foundry providers in Aperture so your team can access OpenAI GPT and Anthropic Claude models deployed in Foundry.

[**Set up OpenRouter**](/docs/aperture/how-to/use-openrouter) — Configure an OpenRouter provider in Aperture so your team can access models from multiple providers through a single aggregator.

[**Set up Vercel AI Gateway**](/docs/aperture/how-to/use-vercel) — Configure a Vercel AI Gateway provider in Aperture so your team can access models from multiple LLM providers.

[**Set up a self-hosted provider**](/docs/aperture/how-to/use-self-hosted) — Configure a self-hosted LLM server as a provider in Aperture so your team can access private models through your tailnet.

[**Set up an OpenAI-compatible provider**](/docs/aperture/how-to/use-openai-compatible-provider) — Configure an OpenAI-compatible provider in Aperture, including API formats, authorization, and cost estimation.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools
