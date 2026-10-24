---
title: "Use OpenAI-compatible tools with Aperture"
description: "Configure OpenAI-compatible LLM clients to send requests through [Aperture by Tailscale][docs-aperture]. This guide describes the generic setup for clients with a configurable API base URL and an Open"
---

Last validated Sep 29, 2026

Configure OpenAI-compatible LLM clients to send requests through [Aperture by Tailscale][docs-aperture]. This guide describes the generic setup for clients with a configurable API base URL and an OpenAI-compatible API back end. Roo Code, Cline, and custom applications are examples of this path, not individually verified integrations.

For client-specific instructions, refer to the guides for [Claude Code][docs-use-claude-code], [Codex][docs-use-codex], and [OpenCode][docs-use-opencode].

> **Note:**
>
> Gemini CLI uses native Google Gemini APIs, not the OpenAI-compatible setup in this guide. Follow the [Gemini CLI setup][docs-aperture-cli] for its Google back ends and gateway URL requirements.

## Prerequisites

Before you begin, you need:

* An Aperture gateway with a provider that supports your client's API format and model. OpenAI Chat Completions and Responses are separate formats. Refer to [get started with Aperture][docs-get-started] for setup instructions.
* Permission to use the model.
* The Aperture gateway URL accessible from your device. Use `http://`, not `https://`.

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## Configure the client

In your LLM client's settings, set the API base URL to your Aperture gateway and configure credentials for the provider's authentication mode:

* **API Base URL**: `http://<aperture-hostname>/v1`
* **API Key**: For a shared-key provider, leave empty or use a placeholder. In passthrough mode, supply provider credentials or leave empty to use a configured fallback key. Refer to [passthrough setup][docs-passthrough] for the required credentials.

The exact setting names vary by client. Look for fields labeled "API Base URL," "Base URL," "API Endpoint," or similar.

## Custom applications

You can use any HTTP client that sends a [supported provider API format][docs-provider-compatibility]. This Chat Completions example uses a shared-key provider. For a passthrough provider without a fallback key, add the authentication header required by its [passthrough setup][docs-passthrough].

```shell
curl -s http://<aperture-hostname>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Aperture routes the request using the model name, API format, provider configuration, and user permissions.

## Verify the connection

1. Send a test request using your configured tool.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If the request does not appear, refer to the [Aperture troubleshooting guide][docs-aperture-troubleshooting].

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli#gemini-cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-passthrough]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-opencode]: /docs/aperture/how-to/use-opencode
