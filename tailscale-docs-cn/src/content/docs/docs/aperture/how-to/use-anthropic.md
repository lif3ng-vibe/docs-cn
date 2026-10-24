---
title: "Set up Anthropic"
description: "Configure an Anthropic provider in Aperture so your team can access Claude models through your tailnet. Anthropic uses the `x-api-key` authorization type and the `anthropic_messages` compatibility fla"
---

Last validated Sep 28, 2026

Configure an Anthropic provider in Aperture so your team can access Claude models through your tailnet. Anthropic uses the `x-api-key` authorization type and the `anthropic_messages` compatibility flag, which differ from the defaults.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* An [Anthropic API key][xt-anthropic-api-keys].

## Configure the provider

Add Anthropic as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<your-anthropic-key>",
      "authorization": "x-api-key",
      "models": ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-4-5-20251001"],
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

The `authorization` field is set to `x-api-key` because Anthropic uses the `x-api-key` header instead of a bearer token. The `anthropic_messages` flag tells Aperture to use the Anthropic message format instead of the default OpenAI chat completions format. Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

By default, Aperture injects the configured `apikey` on every request to Anthropic. To forward each client's own credential to Anthropic instead, set `auth_mode: "passthrough"` on the provider. The client then supplies its own credential, which can be a personal API key or a subscription OAuth token, such as a Claude Pro or Max account. Refer to [Set up passthrough mode][docs-use-passthrough-mode] for the full configuration.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-anthropic-api-keys]: https://console.anthropic.com/settings/keys
