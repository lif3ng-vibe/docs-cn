---
title: "Provider configuration"
description: "Reference for Aperture provider compatibility flags, authorization, credential sources, custom headers, and cost estimates."
---

Last validated Sep 29, 2026

Use this reference for provider compatibility flags, authorization, and cost estimates in Aperture.

For provider API formats, setup links, and requirements, refer to the [provider matrix][docs-provider-matrix] in Supported providers and clients.

For client API formats and setup requirements, refer to [clients and agent harnesses][docs-client-matrix].

For compatibility restrictions and generic integrations, refer to [limitations][docs-compatibility-limitations] and [other providers and clients][docs-other-integrations].

## Compatibility flags

The `compatibility` object in a provider configuration specifies which API formats the provider supports. These flags determine which endpoints Aperture exposes for the provider's models.

| Flag                      | Type    | Default                               | Description                                                                                    |
| ------------------------- | ------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `openai_chat`             | boolean | `true` unless another flag is enabled | Supports `/v1/chat/completions`. Set explicitly to retain or disable it alongside other flags. |
| `openai_responses`        | boolean | `false`                               | Supports `/v1/responses`                                                                       |
| `anthropic_messages`      | boolean | `false`                               | Supports `/v1/messages`                                                                        |
| `gemini_generate_content` | boolean | `false`                               | Supports the direct Gemini API (`generativelanguage.googleapis.com`)                           |
| `bedrock_model_invoke`    | boolean | `false`                               | Supports Amazon Bedrock InvokeModel. Request format depends on the model family.               |
| `google_generate_content` | boolean | `false`                               | Supports Gemini Enterprise Agent Platform Gemini format (`aiplatform.googleapis.com`)          |
| `google_raw_predict`      | boolean | `false`                               | Supports Gemini Enterprise Agent Platform raw predict for Anthropic models                     |
| `bedrock_converse`        | boolean | `false`                               | Supports Amazon Bedrock Converse API format                                                    |

Enable a flag for each API format your provider supports. For example, a Gemini Enterprise Agent Platform provider can use separate flags for Gemini and Anthropic models.

If you enable another flag and omit `openai_chat`, Aperture disables Chat Completions. Set `"openai_chat": true` to keep it enabled, or `"openai_chat": false` to disable it explicitly.

## Additional provider fields

Providers also support the optional fields below. Refer to the [Aperture configuration reference][docs-aperture-configuration] for all provider fields.

| Field         | Type    | Default | Description                                                                                                                                            |
| ------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `description` | string  | `""`    | Human-readable description of the provider.                                                                                                            |
| `preference`  | integer | `0`     | Routing priority. Higher values are preferred when multiple providers serve the same model.                                                            |
| `disabled`    | boolean | `false` | Excludes the provider from routing and the `/v1/models` endpoint. Use this field to temporarily disable a provider without removing its configuration. |

## Authorization types

The `authorization` field selects the upstream header format. Anthropic uses `x-api-key`, and direct Google Gemini uses `x-goog-api-key`. The other named providers in the [provider matrix][docs-provider-matrix] use `bearer`, which is also the default for generic and self-hosted providers.

| Value                  | Header format                        | Used by                     |
| ---------------------- | ------------------------------------ | --------------------------- |
| `bearer`               | `Authorization: Bearer <key>`        | OpenAI and most providers   |
| `x-api-key`            | `x-api-key: <key>`                   | Anthropic                   |
| `x-goog-api-key`       | `x-goog-api-key: <key>`              | Google Gemini               |
| `hec`                  | `Authorization: Splunk <key>`        | Splunk HTTP Event Collector |
| `cf-aig-authorization` | `cf-aig-authorization: Bearer <key>` | Cloudflare AI Gateway       |

\[Missing snippet: aperture\_provider\_auth\_note.mdx]

### Credential source

The `auth_mode` field selects whether Aperture uses the configured `apikey` or the client's credential. It is independent of `authorization`, which sets the header format.

| Value          | Behavior                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `""` (default) | Inject the configured `apikey` on every request.                                                                                                                         |
| `override`     | Explicit form of the default. Inject the configured `apikey`. Requires a non-empty `apikey`, or the configuration fails to save.                                         |
| `passthrough`  | Forward the client's own `Authorization` or `x-api-key` header to the upstream unchanged. Fall back to the configured `apikey` only when the client sends no credential. |
| `none`         | Strip all upstream credentials, for providers that need none.                                                                                                            |

A `passthrough` provider without an `apikey` is passthrough-only. Its models appear in `/v1/models`, but not in built-in chat. Chat requests have no client credential to forward. For setup instructions, including subscription-plan OAuth tokens, refer to [set up passthrough mode][docs-use-passthrough-mode].

### Custom headers

Some providers require additional headers beyond the standard `authorization` field. Use `add_headers` on the provider to include custom headers in every request Aperture sends to that provider. Each entry is a string in `"Header-Name: value"` format:

```json
{
  "providers": {
    "example-provider": {
      "baseurl": "https://api.example.com",
      "apikey": "<your-key>",
      "authorization": "bearer",
      "models": ["model-name"],
      "add_headers": [
        "Custom-Header: value"
      ]
    }
  }
}
```

## Cost basis

Aperture estimates the dollar cost of each LLM request. It uses these estimates for quota deductions, hook metadata, and per-model pricing on the [**Models** page][docs-chat-models] in Chat.

Aperture auto-infers pricing in two steps. It first checks the `baseurl` host against known gateway hosts. `openrouter.ai` maps to `openrouter`, and `ai-gateway.vercel.sh` maps to `vercel`. If the host does not match, Aperture falls back to the provider's `compatibility` flags. For example, `anthropic_messages` maps to Anthropic pricing.

Set `cost_basis` explicitly for a regional price source, such as `bedrock-eu` or `azure-eu`, or for a custom gateway host.

Use `vertex` for Gemini Enterprise Agent Platform and `azure` for both Microsoft Foundry provider types. Generic and self-hosted providers have no dedicated pricing source. With default Chat Completions compatibility, they fall back to `openai`. Use a [model cost map][ar-model-cost-map] when their model names are absent from that pricing source.

| `cost_basis` value | Pricing source                                |
| ------------------ | --------------------------------------------- |
| `anthropic`        | Anthropic API list prices                     |
| `openai`           | OpenAI API list prices                        |
| `google`           | Google Gemini API list prices                 |
| `bedrock`          | AWS Bedrock pricing (US rates, default)       |
| `bedrock-us`       | AWS Bedrock US-region pricing                 |
| `bedrock-eu`       | AWS Bedrock EU-region pricing                 |
| `bedrock-ap`       | AWS Bedrock AP-region pricing (uses US rates) |
| `vertex`           | Gemini Enterprise Agent Platform pricing      |
| `azure`            | Azure OpenAI standard pricing                 |
| `azure-eu`         | Azure OpenAI EU-region pricing                |
| `openrouter`       | OpenRouter pricing                            |
| `vercel`           | Vercel AI Gateway pricing                     |

To disable auto-inference globally, set `auto_cost_basis` to `false` at the top level of the configuration.

```json
{
  "auto_cost_basis": false,
  "providers": {
    "anthropic": {
      "cost_basis": "anthropic"
    }
  }
}
```

When `auto_cost_basis` is `false`, Aperture estimates token costs only for providers with an explicit `cost_basis`. Costs reported directly by the upstream gateway remain available.

### Model cost map

If a model is missing from the pricing database, use `model_cost_map` to map its name to a known model:

```json
{
  "providers": {
    "anthropic": {
      "cost_basis": "anthropic",
      "model_cost_map": [
        {"match": "custom-opus-*", "as": "claude-opus-4-8"},
        {"match": "claude-*-preview*", "as": "claude-sonnet-4-6", "adjustment": 1.1}
      ]
    }
  }
}
```

This example prices hypothetical `custom-opus-*` models with the `claude-opus-4-8` pricing entry. It prices preview models with the `claude-sonnet-4-6` pricing entry and a 10% markup. These are illustrative estimates, not a claim that the models have equivalent prices. Choose a pricing target and adjustment appropriate for your upstream model.

Each entry accepts the following fields:

| Field        | Type   | Default    | Description                                                                                                                                                        |
| ------------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `match`      | string | (required) | Glob pattern against the model name. Uses Go's `path.Match` syntax, where `*` matches any sequence of non-separator characters and `?` matches a single character. |
| `as`         | string | (required) | Replacement model name for the pricing lookup.                                                                                                                     |
| `adjustment` | float  | `1.0`      | Price multiplier. A value of `1.5` marks up 50%.                                                                                                                   |

Aperture uses the first matching entry.

## Related

* For the complete configuration schema, refer to the [Aperture configuration reference][docs-aperture-configuration].
* For step-by-step provider setup instructions, refer to the [set up LLM providers][docs-set-up-providers] guides.
* For instructions on configuring coding agents to connect through Aperture, refer to the [set up LLM clients][docs-use-your-tools] guides.
* For automated client configuration, refer to the [Aperture CLI][docs-cli].
* For connection and request failures, refer to [Troubleshooting Aperture][docs-troubleshooting].

[ar-model-cost-map]: #model-cost-map

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-cli]: /docs/aperture/cli

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-chat-models]: /docs/aperture/reference/chat#models

[docs-client-matrix]: /docs/aperture/reference/supported-providers-clients#clients-and-agent-harnesses

[docs-compatibility-limitations]: /docs/aperture/reference/supported-providers-clients#limitations

[docs-other-integrations]: /docs/aperture/reference/supported-providers-clients#other-providers-and-clients

[docs-provider-matrix]: /docs/aperture/reference/supported-providers-clients#provider-matrix
