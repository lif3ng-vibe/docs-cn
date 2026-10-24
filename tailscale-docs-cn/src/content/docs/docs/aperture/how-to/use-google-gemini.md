---
title: "Set up Google Gemini"
description: "Configure a Google Gemini provider in Aperture so your team can access Gemini models through your tailnet. This topic covers the direct Gemini API with API key authentication. The Gemini Enterprise Ag"
---

Last validated Sep 28, 2026

Configure a Google Gemini provider in Aperture so your team can access Gemini models through your tailnet. This topic covers the direct Gemini API with API key authentication. The Gemini Enterprise Agent Platform uses service account authentication and separate endpoint formats for Gemini and Anthropic models.

> **Note:**
>
> For the Gemini Enterprise Agent Platform with service account authentication (which also supports Anthropic models), refer to [set up a Gemini Enterprise Agent Platform provider][docs-use-geap].

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* A [Google AI Studio API key][xt-google-ai-studio].

## Configure the provider

Add Google Gemini as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "gemini": {
      "baseurl": "https://generativelanguage.googleapis.com",
      "apikey": "<your-gemini-key>",
      "authorization": "x-goog-api-key",
      "models": ["gemini-3.8-flash", "gemini-2.5-pro"],
      "name": "Google Gemini",
      "compatibility": {
        "gemini_generate_content": true
      }
    }
  }
}
```

The `authorization` field controls how Aperture sends the API key. The `x-goog-api-key` value sends the key in a `x-goog-api-key` header, which the direct Gemini API requires. The `gemini_generate_content` flag configures Aperture to use the Gemini API format instead of the default OpenAI chat completions format.

For available model IDs and aliases, refer to the [Google AI documentation][xt-google-models]. Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-geap]: /docs/aperture/how-to/use-gemini-enterprise-agent-platform

[xt-google-ai-studio]: https://aistudio.google.com/apikey

[xt-google-models]: https://ai.google.dev/gemini-api/docs/models
