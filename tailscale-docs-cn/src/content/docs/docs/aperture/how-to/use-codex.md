---
title: "Use Codex with Aperture"
description: "Configure [Codex][xt-codex] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging."
---

Last validated Sep 28, 2026

Configure [Codex][xt-codex] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging.

> **Note:**
>
> The [Aperture CLI][docs-aperture-cli] can set up this connection for you automatically. It writes the Codex configuration and launches it, so you can skip the manual steps below.

## Prerequisites

Before you begin, you need:

* An Aperture gateway with at least one configured OpenAI-compatible provider, accessible from your device. Refer to [get started with Aperture][docs-get-started] if you have not set this up.
* The Aperture gateway URL accessible from your device. Use `http://`, not `https://`.
* [Codex][xt-codex] installed on your device.

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## Configure Codex

To configure Codex to use Aperture, create or edit the Codex configuration file (`~/.codex/config.toml`) to use the Aperture URL as the `base_url` and set the model to a Codex-compatible model:

```toml
model = "gpt-5.3-codex"
model_provider = "llm-ai-ts-net"
model_reasoning_effort = "high"

[model_providers.llm-ai-ts-net]
name = "Tailscale AI Gateway"
base_url = "http://<aperture-hostname>/v1" # Required: Aperture URL

# Required for Codex models
wire_api = "responses"
```

The `wire_api = "responses"` setting configures Codex to use the OpenAI Responses API format. You do not need to configure an API key because Aperture injects credentials automatically.

> **Note:**
>
> To forward each client's own credential instead of injecting a shared key, set the upstream provider to passthrough mode. Aperture then forwards the credential the client sends. A personal OpenAI platform API key uses the `api.openai.com` endpoint, while a ChatGPT subscription account such as Plus, Pro, or Team uses the ChatGPT backend endpoint and a different configuration. For more information, refer to [Set up passthrough mode][docs-use-passthrough-mode] and [Route a ChatGPT subscription through Aperture][docs-codex-subscriptions].

## Verify the connection

1. Send a test message in Codex.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If the request does not appear, refer to the [Aperture troubleshooting guide][docs-aperture-troubleshooting].

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-codex-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/codex-subscriptions

[docs-get-started]: /docs/aperture/get-started

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-codex]: https://github.com/openai/codex
