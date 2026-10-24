---
title: "Set up an OpenAI-compatible provider"
description: "Configure an OpenAI-compatible provider in Aperture with the `/v1/chat/completions` API. Providers such as Groq, Together AI, Fireworks, Mistral, DeepSeek, and Perplexity expose OpenAI-compatible APIs"
---

Last validated Sep 29, 2026

Configure an OpenAI-compatible provider in Aperture with the `/v1/chat/completions` API. Providers such as Groq, Together AI, Fireworks, Mistral, DeepSeek, and Perplexity expose OpenAI-compatible APIs. They are examples of this generic setup path, not individually verified integrations.

\[Missing snippet: aperture\_any\_provider.mdx]

Tailscale does not test or guarantee compatibility with every OpenAI-compatible provider. Verify your provider's API requirements before configuring it. For servers such as llama.cpp, vLLM, or Ollama, refer to [set up a self-hosted provider][docs-use-self-hosted].

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* An API key from your provider's developer console or dashboard.
* The provider's API base URL, including any required path prefix.

## Configure the provider

Add your provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "<provider-name>": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["<model-id-1>", "<model-id-2>"]
    }
  }
}
```

Replace the example values:

* `<provider-name>`: A short identifier, such as `groq` or `together`.
* `<your-provider-key>`: Your provider's API key.
* `baseurl`: The provider URL prefix before the incoming `/v1/...` path.
* `models`: The model IDs your provider supports. Find them in the provider's documentation or its `/v1/models` endpoint.

The default configuration uses `openai_chat` compatibility and `bearer` authorization. Change these settings if your provider requires a different API or authorization format.

> **Warning:**
>
> If the provider's API base URL ends in `/v1`, remove only that suffix. Keep any earlier path segments. For example, use `https://api.example.com/openai` for an API base URL of `https://api.example.com/openai/v1`. Aperture appends the full incoming path, such as `/v1/chat/completions`, to `baseurl`. Keeping the final `/v1` produces a doubled path. Refer to [how Aperture builds upstream URLs][docs-aperture-url-construction] for details.

### Providers that also support the Responses API

If your provider supports the OpenAI Responses API (`/v1/responses`) in addition to chat completions, enable both compatibility flags explicitly:

```json
{
  "providers": {
    "custom": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["model-name"],
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

If you enable another flag and omit `openai_chat`, Aperture disables Chat Completions. Set `"openai_chat": true` to keep it enabled alongside Responses, or `"openai_chat": false` to disable it explicitly.

### Non-standard authorization

Most OpenAI-compatible providers use `bearer` authorization, which is the default. If your provider requires a different authorization header, set the `authorization` field. Refer to the [authorization types reference][docs-provider-compatibility] for the supported authorization types.

### Cost estimation

Aperture infers the [pricing source][docs-provider-compatibility-cost-basis] from the provider's `baseurl` host, then falls back to compatibility flags. With default Chat Completions compatibility, an unrecognized host uses `openai` pricing. Set `cost_basis` explicitly to use a different pricing source.

If your provider's model names are absent from that pricing source, use `model_cost_map` to map them to known models for cost estimation:

```json
{
  "providers": {
    "<provider-name>": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-provider-key>",
      "models": ["<model-id>"],
      "model_cost_map": [
        {"match": "<model-id>", "as": "<known-model-id>"}
      ]
    }
  }
}
```

Refer to the [model cost map][docs-provider-compatibility-model-cost-map] reference for the full syntax.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#authorization-types

[docs-provider-compatibility-cost-basis]: /docs/aperture/provider-compatibility#cost-basis

[docs-provider-compatibility-model-cost-map]: /docs/aperture/provider-compatibility#model-cost-map

[docs-use-self-hosted]: /docs/aperture/how-to/use-self-hosted
