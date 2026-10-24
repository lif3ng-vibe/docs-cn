---
title: "Set up passthrough mode"
description: "Configure a provider in passthrough mode so Aperture forwards each client's own credential to the upstream provider instead of injecting one shared API key. Clients keep using their existing API keys "
---

Last validated Sep 28, 2026

Configure a provider in passthrough mode so Aperture forwards each client's own credential to the upstream provider instead of injecting one shared API key. Clients keep using their existing API keys or subscription OAuth tokens, such as a Claude Pro or Max account, which lets you route existing tools through Aperture without re-issuing keys.

\[Missing snippet: aperture\_any\_provider.mdx]

For step-by-step setup of a specific subscription account, refer to:

* [Route a Claude subscription through Aperture][docs-claude-subscriptions] to use a Claude Pro or Max account with Claude Code.
* [Route a ChatGPT subscription through Aperture][docs-codex-subscriptions] to use a ChatGPT Plus, Pro, or Team account with the Codex CLI.

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-get-started] accessible from your device, and admin access to edit its configuration.
* A grant that permits the provider's models for your Tailscale identity. Aperture lists and routes only the models you are granted.
* An account with the upstream provider. For example, [Anthropic][xt-anthropic-api-keys] and a valid credential, either yours or one that each client supplies.

## How passthrough mode works

A provider's `auth_mode` field controls only how Aperture authenticates the outbound request to the upstream provider. It does not affect routing or model selection. It takes one of four values:

* `"passthrough"`: forward the client's own `Authorization` or `x-api-key` header to the upstream unchanged, and fall back to the configured `apikey` only when the client sends no credential.
* Empty or omitted (default), or `"override"`: inject the provider's configured `apikey` on every request. `"override"` is the explicit form and requires a key.
* `"none"`: strip all upstream credentials, for providers that need none.

A passthrough provider with no configured `apikey` is passthrough-only. It works solely from client-supplied credentials. Aperture's chat UI hides a passthrough-only provider's models, because chat requests originate on the server and carry no client credential. Configure a fallback `apikey` if you want the model available in the chat UI.

## Configure the provider

Define the provider in your Aperture configuration with `auth_mode` set to `passthrough`.

1. \[Missing snippet: aperture\_admin\_nav.mdx]

2. Add a provider under the `providers` map, replacing the placeholders with your values. This example serves an Anthropic-compatible provider:

   ```json
   "providers": {
     "anthropic-passthrough": {
       "baseurl": "https://api.anthropic.com",
       "authorization": "x-api-key",
       "auth_mode": "passthrough",
       "apikey": "<fallback-api-key>",
       "models": ["claude-opus-5-5"],
       "compatibility": {
         "anthropic_messages": true
       }
     }
   }
   ```

   * Set `authorization` to match the header the upstream expects. `x-api-key` for Anthropic, `bearer` for OpenAI-style providers. Refer to the [authorization types reference][docs-provider-compatibility] for the full list.
   * Keep `apikey` to give the provider a fallback credential for requests that arrive without one and to make its models appear in the chat UI. Remove it to make the provider passthrough-only. Set this key in the Configuration editor, because the provider form hides the API Key field once you select passthrough mode.

   \[Missing snippet: aperture\_model\_wildcards\_note.mdx]

3. Save the configuration. Aperture hot-reloads it, so no restart is required. Aperture rejects an invalid provider definition, such as a missing `baseurl` or an unrecognized `auth_mode`, so a successful save confirms the block passed validation. A provider with an empty `models` list saves but serves no models.

## Verify the provider

Query the models endpoint from a tailnet-connected machine:

```shell
curl -s http://<aperture-hostname>/v1/models
```

The output includes an entry whose `id` is the bare model name (for example, `claude-opus-5-5`), with the provider in `metadata.provider.id`. To route to this specific provider in a request, prefix the model name with the provider ID: `anthropic-passthrough/claude-opus-5-5`.

A passthrough-only provider's models still appear here even though they are hidden from the chat UI. If a model is missing, the most common cause is that your Tailscale identity has no grant for it, not that the provider failed to register.

## Send a request as a client

Point a client at Aperture as its base URL and let it send its own credential. The example uses Claude Code, but any SDK that lets you override the base URL works the same way. Refer to [Set up LLM clients][docs-use-your-tools] for client setup.

* If the client authenticates with an OAuth subscription token, such as Claude Code signed in to a Claude subscription, set only the base URL. Setting `ANTHROPIC_API_KEY` makes the client send that key instead of its OAuth token.

  ```shell
  export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
  # Do not set ANTHROPIC_API_KEY so the OAuth token passes through.
  ```

* If the client uses a personal API key, set both the base URL and the key.

  ```shell
  export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
  export ANTHROPIC_API_KEY="<client-api-key>"
  ```

Send a request, using the provider-prefixed model name to route to this provider. With a raw API call the request looks like this:

```shell
curl -s http://<aperture-hostname>/v1/messages \
  -H "x-api-key: <client-api-key>" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "anthropic-passthrough/claude-opus-5-5",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "Say hello."}]
  }'
```

Aperture forwards the `x-api-key` header unchanged, strips the provider prefix from the model name, and returns the provider's response. A normal completion means passthrough is working. To confirm the client credential was used rather than the fallback, send a request with a deliberately invalid `x-api-key`. The upstream rejects it, which proves Aperture forwarded the client key instead of substituting the fallback.

## Troubleshooting

Work through the checks below if a request does not behave as expected.

### A model does not appear in the chat UI

This is expected for a passthrough-only provider. On the **Models** tab, the provider's test button is disabled with a tooltip noting that no API key is configured. To make the model usable in the chat UI, add a fallback `apikey` and save the configuration again. The model is still reachable from external clients that bring their own credential. Confirm that with the models endpoint.

### A model does not appear in the models endpoint

The models endpoint lists only the models your Tailscale identity is granted. If a freshly added provider's models are missing, confirm a grant covers the model, then query again. Also confirm the provider is not `disabled`.

### Requests fail with a 401 or authentication error

Start with the client. Confirm it sends an `Authorization` or `x-api-key` header and that the credential is valid directly against the provider, because passthrough forwards exactly what the client sends. Next, confirm the provider's `authorization` field matches the header style the upstream expects. If the client sends no credential, confirm a fallback `apikey` is configured.

### A request reaches the wrong provider or the model is not found

Use the provider-prefixed model name, `anthropic-passthrough/claude-opus-5-5`, to target this provider deterministically. Without the prefix, Aperture selects among all providers that serve the bare model name. Confirm the provider's `compatibility` block enables the API protocol your client uses, such as `anthropic_messages` for `/v1/messages`.

## Security considerations

In passthrough mode, each client authenticates to the upstream with its own credential, so the provider sees per-user identity and Aperture does not hold a shared key on every client's behalf. This narrows the blast radius of a leaked key and keeps users' OAuth tokens and personal keys under their own control. Aperture still authenticates every client by Tailscale identity before forwarding anything.

Keep these limits in mind:

* A configured fallback `apikey` is a shared secret stored in the configuration. Any client that sends no credential uses it, so scope it accordingly or omit it.
* Aperture forwards client credentials to the `baseurl` you configure. Set it to the genuine provider endpoint and nothing else.
* Only inference traffic routes through Aperture. Requests the client SDK sends directly to the provider, such as OAuth login, token refresh, and billing endpoints, do not pass through Aperture.
* When you need a single audited, centrally rotated credential rather than per-user keys, use `auth_mode: "override"` with a managed key instead of passthrough.

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-claude-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/claude-subscriptions

[docs-codex-subscriptions]: /docs/aperture/how-to/use-passthrough-mode/codex-subscriptions

[docs-get-started]: /docs/aperture/get-started

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#authorization-types

[docs-use-your-tools]: /docs/aperture/use-your-tools

[xt-anthropic-api-keys]: https://console.anthropic.com/settings/keys
