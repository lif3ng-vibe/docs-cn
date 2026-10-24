---
title: "Route a ChatGPT subscription through Aperture"
description: "In [passthrough mode][docs-use-passthrough-mode], Aperture forwards each client's own credential to the upstream provider instead of injecting a shared API key. This guide uses passthrough to route a "
---

Last validated Sep 28, 2026

In [passthrough mode][docs-use-passthrough-mode], Aperture forwards each client's own credential to the upstream provider instead of injecting a shared API key. This guide uses passthrough to route a ChatGPT subscription: the Codex CLI signs in to the subscription and holds an OAuth token, and Aperture forwards that token to the ChatGPT backend unchanged.

A ChatGPT subscription and an OpenAI platform API key are separate systems that use different endpoints and credentials:

| Endpoint                        | Credential                                   | Billing                                            |
| ------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `chatgpt.com/backend-api/codex` | ChatGPT OAuth token                          | ChatGPT subscription (Plus, Pro, Team, Enterprise) |
| `api.openai.com/v1`             | API key with the `api.responses.write` scope | Platform API credits                               |

The ChatGPT backend does not accept API keys, and the platform API does not accept ChatGPT OAuth tokens. This guide covers the subscription (OAuth) path. To route platform API keys instead, refer to [use Codex with Aperture][docs-use-codex]. If you have both kinds of user, configure a separate provider for each.

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-get-started] accessible from your device, and admin access to edit its configuration.
* A grant that permits the Codex models for the Tailscale identities that will use them. Aperture lists and routes only granted models.
* A ChatGPT subscription for each user, and the [Codex CLI][xt-codex] installed and able to sign in to that subscription.

## Configure the Codex provider

Define a provider whose `baseurl` is the ChatGPT backend, with `auth_mode` set to `passthrough`.

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Add a provider under the `providers` map, replacing the placeholders with your values:

   ```json
   "providers": {
     "codex-oauth": {
       "baseurl": "https://chatgpt.com/backend-api/codex",
       "authorization": "bearer",
       "auth_mode": "passthrough",
       "models": ["gpt-6.1-sol"],
       "compatibility": {
         "openai_chat": true,
         "openai_responses": true
       }
     }
   }
   ```

   * `authorization` is `bearer`: the ChatGPT backend expects the OAuth token in the `Authorization` header.
   * `baseurl` is the ChatGPT backend, not `api.openai.com`. The two endpoints accept different credentials.
   * No `apikey` is configured, so the provider is passthrough-only and works solely from each client's subscription token.

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. Save the configuration. Aperture hot-reloads it, so no restart is required. A successful save confirms the block passed validation.

## Configure the Codex CLI

Point Codex at Aperture with a custom model provider, and let it send its subscription OAuth token.

\[Missing snippet: aperture\_tls\_warning.mdx]

1. Sign in to your ChatGPT subscription in Codex.
2. Create or edit `~/.codex/config.toml`:

   ```toml
   model = "gpt-6.1-sol"
   model_provider = "aperture"

   [model_providers.aperture]
   name = "Aperture"
   base_url = "http://<aperture-hostname>/codex"
   wire_api = "responses"
   requires_openai_auth = true
   ```

   * `requires_openai_auth = true` tells Codex to send its ChatGPT OAuth token for subscription access. Omit it and supply `env_key` only for the platform API key path.
   * Codex appends `/responses` to `base_url`, so requests arrive at Aperture as `/codex/responses`. Aperture strips the `/codex` prefix before proxying to `chatgpt.com/backend-api/codex/responses`.

> **Warning:**
>
> `requires_openai_auth = true` with a `base_url` that points at the platform API does not work. The ChatGPT OAuth token lacks the `api.responses.write` scope the platform API requires. Use the subscription endpoint for OAuth tokens and the platform endpoint for API keys.

## Verify the connection

1. Send a test message in Codex.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If a request fails with a 401, confirm Codex is signed in to the subscription and that `requires_openai_auth = true` is set. If the request never reaches Aperture, confirm `base_url` includes the `/codex` path segment. For more checks, refer to the [passthrough troubleshooting steps][docs-use-passthrough-mode].

## What routes through Aperture

Only inference traffic (`/responses`) routes through Aperture. Codex sends OAuth login and token refresh directly to the provider, bypassing the Aperture `base_url`. Aperture never sees the subscription's login or refresh, only the inference requests it authenticates by Tailscale identity and forwards.

## Next steps

After you configure and check the provider, complete the applicable tasks:

* [Grant model access][docs-grant-model-access] to control which users can access the passthrough provider.
* [Set up LLM clients][docs-use-your-tools] to connect other clients that can send their own ChatGPT credentials.

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-use-codex]: /docs/aperture/how-to/use-codex

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-codex]: https://github.com/openai/codex
