---
title: "Set up Vercel AI Gateway"
description: "Configure a Vercel AI Gateway provider in Aperture so your team can access models from multiple LLM providers through a single gateway endpoint. The Aperture preset enables OpenAI Chat Completions, Op"
---

Last validated Sep 29, 2026

Configure a Vercel AI Gateway provider in Aperture so your team can access models from multiple LLM providers through a single gateway endpoint. The Aperture preset enables OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages. Select a model and client back end that support the API you intend to use.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* A [Vercel API token][xt-vercel-tokens].

## Configure the provider

Add Vercel AI Gateway as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "vercel": {
      "baseurl": "https://ai-gateway.vercel.sh",
      "apikey": "<your-vercel-token>",
      "models": [
        "anthropic/claude-sonnet-4.6",
        "openai/gpt-5.4-nano"
      ],
      "cost_basis": "vercel",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true,
        "anthropic_messages": true
      }
    }
  }
}
```

> **Warning:**
>
> Set `baseurl` to `https://ai-gateway.vercel.sh`, without `/v1`. Adding `/v1` produces the incorrect URL `https://ai-gateway.vercel.sh/v1/v1/chat/completions`. Refer to [how Aperture builds upstream URLs][docs-aperture-url-construction] for details.

Model names use a `provider/model` prefix format.

The configuration fields work as follows:

* **`cost_basis`**: Selects the pricing source for token-cost estimates. With `auto_cost_basis` enabled, Aperture uses `vercel` for the official `https://ai-gateway.vercel.sh` host. The example sets it explicitly for the same result. Set it explicitly for a custom gateway host. Costs reported directly by the gateway do not require this field.
* **`openai_chat`**: Enables the chat completions API used by most OpenAI-compatible tools.
* **`openai_responses`**: Enables the Responses API used by tools such as OpenAI Codex.
* **`anthropic_messages`**: Enables the Anthropic Messages API. The selected model must support this API.

Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-vercel-tokens]: https://vercel.com/account/tokens
