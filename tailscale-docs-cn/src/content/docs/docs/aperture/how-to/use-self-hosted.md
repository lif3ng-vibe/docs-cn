---
title: "Set up a self-hosted provider"
description: "Configure a self-hosted LLM server as a provider in Aperture so your team can access private models through your tailnet. This setup uses the OpenAI-compatible Chat Completions API. Aperture supports "
---

Last validated Sep 29, 2026

Configure a self-hosted LLM server as a provider in Aperture so your team can access private models through your tailnet. This setup uses the OpenAI-compatible Chat Completions API. Aperture supports both `/v1/chat/completions` and `/chat/completions` paths. Common servers include llama.cpp, vLLM, and Ollama. Verify that your server supports the API features your client requires. For cloud-hosted providers, refer to [set up an OpenAI-compatible provider][docs-use-openai-compatible-provider].

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An Aperture gateway accessible from your device. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* A self-hosted LLM server reachable from the Aperture gateway, either on the gateway itself or over your tailnet.

## Configure the provider

Add your self-hosted server as a provider in your [Aperture configuration][docs-aperture-configuration]:

```json
{
  "providers": {
    "private": {
      "baseurl": "http://<self-hosted-server>:8080",
      "models": ["qwen3-coder:30b", "llama3.1:70b"]
    }
  }
}
```

Replace `<self-hosted-server>` with the hostname or Tailscale IP address of your server. The example uses Ollama model tags and assumes your server already serves those models. To find the correct model names for your server, query its model list endpoint, typically `GET /v1/models`, and use the `id` field from the response. Adding a model to Aperture does not install it on your server.

In `baseurl`, `localhost` refers to the Aperture gateway, not your device. Use it only for a server reachable on the gateway itself. For a server on another device, use its tailnet hostname or Tailscale IP address.

> **Note:**
>
> Aperture appends the full incoming request path to `baseurl`. For `/v1/chat/completions` requests, omit a final `/v1` from `baseurl` to avoid a doubled `/v1/v1` path. Keep any earlier path prefix. Clients that send `/chat/completions` might need `/v1` in `baseurl` instead. Refer to [how Aperture builds upstream URLs][docs-aperture-url-construction] for details.

Self-hosted providers use `openai_chat` compatibility and `bearer` authorization by default. Servers with an OpenAI-compatible Chat Completions API need no additional flags. For other API formats, set the matching [compatibility flags][docs-provider-compatibility].

If your server does not require authentication, omit the `apikey` field. If your server requires a key, add `"apikey": "<your-key>"` to the provider block.

## Verify the provider

\[Missing snippet: aperture\_verify\_provider.mdx]

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider
