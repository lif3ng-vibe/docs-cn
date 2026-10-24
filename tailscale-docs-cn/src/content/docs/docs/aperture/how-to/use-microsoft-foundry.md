---
title: "Set up Microsoft Foundry"
description: "Configure Microsoft Foundry in Aperture so your team can access OpenAI GPT and Anthropic Claude models deployed in Foundry through your tailnet. Foundry serves OpenAI models through an OpenAI-compatib"
---

Last validated Sep 30, 2026

Configure Microsoft Foundry in Aperture so your team can access OpenAI GPT and Anthropic Claude models deployed in Foundry through your tailnet. Foundry serves OpenAI models through an OpenAI-compatible `/openai` endpoint and Anthropic models through an Anthropic-compatible `/anthropic` endpoint. Because each endpoint uses a different API format, you configure each as its own provider in Aperture. The model names must match your Foundry deployment names.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* A [Microsoft Foundry][xt-foundry-portal] resource and project with at least one model deployment.
* A [Foundry API key][xt-foundry-keys] for your resource.

## Configure the providers

Add Microsoft Foundry to your [Aperture configuration][docs-aperture-configuration]. Aperture's Foundry integration supports OpenAI GPT models and Anthropic Claude models, served through separate endpoints. Configure each endpoint as its own provider entry. Find your resource, project, and deployment names in the [Foundry portal][xt-foundry-portal]. Use the exact deployment names in each provider's `models` list.

The examples assume that each deployment has the same name as its model ID. Replace the `models` entries if your deployments use different names.

### OpenAI GPT models

Configure Foundry's `/openai` endpoint to serve GPT models:

```json
{
  "providers": {
    "microsoft-foundry-openai": {
      "baseurl": "https://<your-resource>.services.ai.azure.com/api/projects/<your-project>/openai/",
      "apikey": "<your-foundry-api-key>",
      "name": "Microsoft Foundry (OpenAI)",
      "models": ["gpt-5.5", "gpt-5.4-mini"],
      "cost_basis": "azure",
      "compatibility": {
        "openai_chat": true,
        "openai_responses": true
      }
    }
  }
}
```

The configuration fields work as follows:

* **`baseurl`** intentionally ends with `/openai/`. Unlike most providers, where you supply only the API root, Foundry serves its OpenAI-compatible API under a project-scoped path. Aperture appends the incoming request path to this base, producing upstream URLs like `https://<your-resource>.services.ai.azure.com/api/projects/<your-project>/openai/v1/chat/completions`. Keep the trailing slash and do not strip the path segments.
* **`openai_responses`** enables the Responses API, which tools like OpenAI Codex use. When you include a `compatibility` block, set both flags explicitly. Without a compatibility block, Aperture enables only `openai_chat` by default.
* **`cost_basis`** is set to `azure` so Aperture prices requests using Azure OpenAI list prices instead of standard OpenAI prices. Use `azure-eu` for EU-region pricing. Set this field explicitly, because Aperture would otherwise infer `openai` pricing from the compatibility flags.

### Anthropic Claude models

Configure Foundry's `/anthropic` endpoint to serve Claude models as a second provider entry:

```json
{
  "providers": {
    "microsoft-foundry-anthropic": {
      "baseurl": "https://<your-resource>.services.ai.azure.com/anthropic/",
      "apikey": "<your-foundry-api-key>",
      "authorization": "x-api-key",
      "name": "Microsoft Foundry (Anthropic)",
      "models": ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-4-5"],
      "cost_basis": "azure",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

This entry differs from the OpenAI provider as follows:

* **`baseurl`** uses the resource-scoped `/anthropic/` endpoint, without `/api/projects/<your-project>`. Aperture appends `/v1/messages`, producing `https://<your-resource>.services.ai.azure.com/anthropic/v1/messages`. Keep the `/anthropic/` path in the base URL.
* **`authorization`** is set to `x-api-key` to send your Foundry API key in the required header. Foundry's Claude endpoint uses bearer authorization for Microsoft Entra ID tokens, not resource API keys. Refer to [Claude in Microsoft Foundry authentication][xt-foundry-anthropic-auth] for details.
* **`anthropic_messages`** tells Aperture to use the Anthropic Messages API format (`/v1/messages`) instead of the OpenAI chat completions format.

Refer to the [compatibility flags reference][docs-provider-compatibility] for the full list of flags.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[xt-foundry-anthropic-auth]: https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry#authentication

[xt-foundry-keys]: https://learn.microsoft.com/azure/ai-foundry/

[xt-foundry-portal]: https://ai.azure.com
