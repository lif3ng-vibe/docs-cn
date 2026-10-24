---
title: "Set up OpenAI"
description: "Configure an OpenAI provider in Aperture so your team can access GPT models through your tailnet. OpenAI is the default provider type in Aperture. When no compatibility block is specified, Aperture en"
---

Last validated Sep 28, 2026

Configure an OpenAI provider in Aperture so your team can access GPT models through your tailnet. OpenAI is the default provider type in Aperture. When no compatibility block is specified, Aperture enables `openai_chat` automatically, but does not enable `openai_responses` unless you set it explicitly.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* An [OpenAI API key][xt-openai-api-keys].

## Configure the provider

Add OpenAI as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "openai": {
      "baseurl": "https://api.openai.com",
      "apikey": "<your-openai-key>",
      "models": ["gpt-5.5", "gpt-5.4-mini", "gpt-5.3-codex"],
      "name": "OpenAI",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

The `openai_responses` flag enables the Responses API, which tools like OpenAI Codex use. When you include a `compatibility` block, set both flags explicitly. Without a compatibility block, Aperture enables only `openai_chat` by default. Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

By default, Aperture injects the configured `apikey` on every request to OpenAI. To instead forward each client's own credential to OpenAI, set `auth_mode: "passthrough"` on the provider. The client then supplies its own API key, which Aperture forwards to OpenAI unchanged. Refer to [Set up passthrough mode][docs-use-passthrough-mode] for the full configuration.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-openai-api-keys]: https://platform.openai.com/api-keys
