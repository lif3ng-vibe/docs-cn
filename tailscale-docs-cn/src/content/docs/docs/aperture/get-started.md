---
title: "Get started with Aperture"
description: "Sign up for Aperture, configure a provider, and send your first request."
---

Last validated Sep 29, 2026

[Start using Aperture](https://aperture.tailscale.com/)

> **Note:**
>
> You can purchase tokens directly within Aperture. To use your own API keys with Aperture on a plan other than the personal Tailscale plan, [contact sales][co-contact-sales].

Sign up for Aperture, configure an LLM provider, and send a test request. To learn what Aperture does, refer to [What is Aperture?][docs-what-is-aperture].

## Prerequisites

Before you begin, confirm you have the following:

* **An API key from an LLM provider's developer platform.** Aperture supports OpenAI, Anthropic, Google Gemini, OpenRouter, Amazon Bedrock, the Gemini Enterprise Agent Platform, and [OpenAI-compatible providers][docs-use-openai-compatible-provider]. Refer to [Supported providers and clients][docs-provider-compatibility] for API formats and setup requirements. Get an API key from the provider's developer portal (for example, the [Anthropic Console][xt-anthropic-console], [OpenAI Platform][xt-openai-platform], or [Google AI Studio][xt-google-ai-studio]).

  > **Note:**
  >
  > You can also use a subscription plan through [passthrough mode][docs-use-passthrough-mode]. Plans such as Claude Pro, ChatGPT Plus, or Gemini Advanced provide OAuth tokens rather than developer API keys. Aperture forwards the client's `Authorization` or `x-api-key` header. If the client sends neither header, Aperture uses the configured provider key.

* **A device connected to your tailnet.** Aperture listens at `http://<aperture-hostname>` in your [tailnet][docs-tailnet]. Your device must be running Tailscale and connected to the same tailnet as your Aperture gateway. If you need to connect a device that is not in the tailnet, refer to [connect devices outside your tailnet][docs-connect-outside-tailnet].

## Step 1: Sign up for Aperture

1. Visit [`aperture.tailscale.com`][xt-aperture-signup] and complete the sign-up form. If you don't have a Tailscale account, the sign-up process creates a free one for you.
2. Open `http://<aperture-hostname>/` and confirm that the Aperture web portal loads. If you are an Aperture admin, you can open the admin dashboard at `http://<aperture-hostname>/admin/`.

## Step 2: Configure an LLM provider

Adding a provider is an admin task. You can use either the visual **Providers** page or the JSON **Configuration** editor.

**Visual editor**: \[Missing snippet: aperture\_admin\_nav.mdx] Fill in the provider name, base URL, API key, and model list through the form interface.

**JSON editor**: \[Missing snippet: aperture\_admin\_nav.mdx] Paste or write the configuration directly. The following example configures Anthropic with two Claude models:

```json
{
  "providers": {
    "anthropic": {
      "baseurl": "https://api.anthropic.com",
      "apikey": "<anthropic-api-key>",
      "models": [
        "claude-sonnet-5-5",
        "claude-opus-5-5"
      ],
      "authorization": "x-api-key",
      "compatibility": {
        "anthropic_messages": true
      }
    }
  }
}
```

For provider-specific instructions, refer to [Set up LLM providers][docs-set-up-providers]. For all available settings, refer to the [configuration reference][docs-aperture-configuration].

> **Note:**
>
> The [default configuration][docs-aperture-default-configuration] includes subscription passthrough providers rather than shared API keys. To use your own API key, configure a provider as shown above.

## Step 3: Send a test request

The examples below use a shared provider key configured in the gateway. The Anthropic example matches step 2. To use an OpenAI example, configure a provider that supports its API format and model.

For a passthrough provider without a fallback key, you must also send provider credentials. Follow the [passthrough setup instructions][docs-use-passthrough-mode] for the required `Authorization` or `x-api-key` header.

**Anthropic API format**:

```shell
curl -s http://<aperture-hostname>/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 25,
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

**OpenAI Chat Completions API format**:

```shell
curl -s http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "respond with: hello"}]
  }'
```

**OpenAI Responses API format**:

```shell
curl -s http://<aperture-hostname>/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": [{"role": "user", "content": "respond with: hello"}]
  }'
```

If the request succeeds, Aperture is routing to your provider. Open **Sessions** at `http://<aperture-hostname>/sessions` to find the request in your personal history. Aperture admins can also inspect it on the [**Logs** page of the admin dashboard][docs-admin-logs].

> **Note:**
>
> If your device is not in the tailnet, [connect through an Aperture CLI bridge or `ts-unplug`][docs-connect-outside-tailnet] and replace `http://<aperture-hostname>` with `http://localhost:<port-number>` in the examples above.

## Next steps

After the test request succeeds:

* [Grant users access to models][docs-grant-model-access] so team members can send requests through Aperture.
* [Set up LLM clients][docs-use-your-tools] to route traffic from tools such as Claude Code or Codex through Aperture.
* [Use Aperture Chat][docs-chat] to let users talk to models directly from their browser.
* [Set spending limits][docs-manage-spending] to control costs across your organization.
* [Connect devices outside your tailnet][docs-connect-outside-tailnet] if team members need access from devices that aren't in the tailnet.
* [Proxy MCP servers and HTTP APIs][docs-aperture-connectors] to give AI agents authenticated access to external tools through Aperture.

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-default-configuration]: /docs/aperture/configuration#default-configuration

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-manage-spending]: /docs/aperture/manage-spending

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailnet]: /docs/concepts/tailnet

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-use-openai-compatible-provider]: /docs/aperture/how-to/use-openai-compatible-provider

[docs-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-chat]: /docs/aperture/reference/chat

[docs-what-is-aperture]: /docs/aperture/what-is-aperture

[xt-anthropic-console]: https://console.anthropic.com

[xt-aperture-signup]: https://aperture.tailscale.com

[xt-google-ai-studio]: https://aistudio.google.com

[xt-openai-platform]: https://platform.openai.com

[docs-use-openai]: /docs/aperture/how-to/use-openai
