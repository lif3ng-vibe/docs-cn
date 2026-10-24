---
title: "Route a Claude subscription through Aperture"
description: "In [passthrough mode][docs-use-passthrough-mode], Aperture forwards each client's own credential to the upstream provider instead of injecting a shared API key. This guide uses passthrough to route a "
---

Last validated Sep 28, 2026

In [passthrough mode][docs-use-passthrough-mode], Aperture forwards each client's own credential to the upstream provider instead of injecting a shared API key. This guide uses passthrough to route a Claude Pro or Max subscription: Claude Code signs in to the subscription and holds an OAuth token, and Aperture forwards that token to Anthropic unchanged. Each user authenticates to Anthropic as themselves, and you get Aperture's identity, logging, and policy enforcement without re-issuing keys.

This guide covers the end-to-end setup: the Anthropic provider on the Aperture side, and Claude Code on the client side. For the full passthrough mechanism and `auth_mode` reference, refer to [set up passthrough mode][docs-use-passthrough-mode].

\[Missing snippet: aperture\_any\_provider.mdx]

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-get-started] accessible from your device, and admin access to edit its configuration.
* A grant that permits the Anthropic models for the Tailscale identities that will use them. Aperture lists and routes only granted models.
* A Claude Pro or Max subscription for each user, and [Claude Code][xt-claude-code] installed and able to sign in to that subscription.

## Configure the Anthropic provider

Define an Anthropic provider with `auth_mode` set to `passthrough` so Aperture forwards the client's OAuth token.

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Add a provider under the `providers` map, replacing the placeholders with your values:

   ```json
   "providers": {
     "anthropic-passthrough": {
       "baseurl": "https://api.anthropic.com",
       "authorization": "x-api-key",
       "auth_mode": "passthrough",
       "models": ["claude-opus-5-5"],
       "compatibility": {
         "anthropic_messages": true
       }
     }
   }
   ```

   * `authorization` is `x-api-key` for Anthropic. Aperture forwards whichever credential the client sends, including a `Bearer` OAuth token.
   * No `apikey` is configured, so this provider is passthrough-only: it works solely from each client's subscription token. Add a fallback `apikey` if you also want these models to work in the chat UI, which sends server-side requests that carry no client credential.

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. Save the configuration. Aperture hot-reloads it, so no restart is required. A successful save confirms the block passed validation.

## Sign in Claude Code with the subscription

Point Claude Code at Aperture and select the configured model. Let Claude Code send its subscription OAuth token without overriding its credentials.

\[Missing snippet: aperture\_tls\_warning.mdx]

1. Sign in to your Claude subscription in Claude Code using `claude` then `/login`, or the IDE sign-in flow.
2. Create or edit `~/.claude/settings.json` and set the Aperture URL and model:

   ```json
   {
     "model": "claude-opus-5-5",
     "env": {
       "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
     }
   }
   ```

   Do not set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`. Setting either makes Claude Code send that value instead of its OAuth token, which suppresses the credential you want to pass through.

> **Tip:**
>
> You can set the base URL and model with environment variables instead of the settings file:
>
> ```shell
> export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
> export ANTHROPIC_MODEL="claude-opus-5-5"
> # Do not set ANTHROPIC_API_KEY so the OAuth token passes through.
> ```

## Verify the connection

1. Send a test message in Claude Code.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If a request fails with a `401` error, confirm Claude Code is signed in to the subscription and that no API key or auth token is set on the client. If the request never reaches Aperture, confirm `ANTHROPIC_BASE_URL` points at the Aperture gateway. For more checks, refer to the [passthrough troubleshooting steps][docs-use-passthrough-mode].

## What routes through Aperture

Only inference requests (`/v1/messages`) route through Aperture. Claude Code sends OAuth sign-in and token refresh requests directly to `api.anthropic.com`, bypassing `ANTHROPIC_BASE_URL`. Aperture never handles authentication or token refresh. It only authenticates inference requests by Tailscale identity before forwarding them to Anthropic.

## Next steps

After you configure and check the provider, complete the applicable tasks:

* [Grant model access][docs-grant-model-access] to control which users can access the passthrough provider.
* [Set up LLM clients][docs-use-your-tools] to connect other clients that can send their own Anthropic credentials.
* [Set up the chat UI][docs-set-up-chat-ui] only if you add a fallback `apikey`. A passthrough-only provider cannot serve requests from Aperture chat.

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code
