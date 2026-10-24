---
title: "Set up OpenRouter"
description: "Configure an OpenRouter provider in Aperture so your team can access models from multiple LLM providers through a single API. OpenRouter aggregates models from providers like Google, Meta, and others,"
---

Last validated Sep 28, 2026

Configure an OpenRouter provider in Aperture so your team can access models from multiple LLM providers through a single API. OpenRouter aggregates models from providers like Google, Meta, and others, including open-source models.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* An [OpenRouter API key][xt-openrouter-keys].

## Configure the provider

Add OpenRouter as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "openrouter": {
      "baseurl": "https://openrouter.ai/api/",
      "apikey": "<your-openrouter-key>",
      "models": [
        "qwen/qwen3.8-flash",
        "google/gemini-3.8-flash",
        "x-ai/grok-4.7"
      ],
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true,
        "anthropic_messages": true
      }
    }
  }
}
```

OpenRouter uses `bearer` authorization. The configuration enables OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages, matching the Aperture OpenRouter preset. Select a client back end and an OpenRouter model that support the API you intend to use. Enabling a flag does not make every model available through every API.

Model names on OpenRouter use a `provider/model` prefix format. Browse the [OpenRouter model directory][xt-openrouter-models] to find available model names. Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-openrouter-keys]: https://openrouter.ai/settings/keys

[xt-openrouter-models]: https://openrouter.ai/models
