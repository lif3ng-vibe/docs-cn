---
title: "Set up the chat UI"
description: "Aperture Chat is available to authorized users at `/` and `/chat` by default."
---

Last validated Sep 29, 2026

Aperture Chat is available to authorized users at `/` and `/chat` by default.

To make chat usable, configure:

* **Models**: Give users a `models` grant for at least one model whose provider declares a chat-compatible API.
* **(Optional) Curation**: Narrow and label the models that appear in the chat model picker.

Without a `models` grant, the portal loads but the model picker is empty. You can also make matching non-admin users API-only by disabling portal access.

## Prerequisites

Before you begin, make sure you have the following:

* An [Aperture gateway][docs-get-started] with at least one configured provider.
* [Admin access][docs-set-up-admin-access] to the Aperture admin dashboard.
* Users who can already [reach the Aperture gateway][docs-grant-model-access] over your tailnet.

## Step 1: Grant model access

Grant users access to at least one model whose provider supports a chat-compatible API.

Grants live under the `tailscale.com/cap/aperture` capability. \[Missing snippet: aperture\_admin\_nav.mdx] Add a grant:

```json
{
  "src": ["alice@example.com", "group:ai-users"],
  "app": {
    "tailscale.com/cap/aperture": [
      { "role": "user" },
      { "models": "anthropic/**" }
    ]
  }
}
```

The `models` glob specifies which models the user can access. For the full pattern syntax, refer to [grant access to models][docs-grant-model-access].

To make matching non-admin users API-only, add `enable_portal` set to `false` to their grant. This disables the entire user portal, including chat. Admins always retain portal access. If any matching grant explicitly sets `enable_portal` to `true`, portal access remains enabled even when another matching grant sets it to `false`.

Group matching requires [visible groups][docs-visible-groups] enabled for the Aperture gateway.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Step 2: Configure a chat-compatible provider

A model appears in the chat UI only if its provider declares a chat API in its `compatibility` block. Configure at least one provider with one of the following flags:

| Compatibility flag        | Routes to                                 |
| :------------------------ | :---------------------------------------- |
| `anthropic_messages`      | Anthropic Messages API                    |
| `openai_chat`             | OpenAI Chat Completions                   |
| `openai_responses`        | OpenAI Responses API                      |
| `gemini_generate_content` | Gemini                                    |
| `google_generate_content` | Gemini Enterprise Agent Platform (Gemini) |

The following example configures an Anthropic provider for the chat UI:

```json
{
  "providers": {
    "anthropic": {
      "name": "Anthropic",
      "baseurl": "https://api.anthropic.com",
      "apikey": "<your-anthropic-key>",
      "authorization": "x-api-key",
      "models": ["claude-opus-5-5", "claude-sonnet-5-5"],
      "compatibility": { "anthropic_messages": true }
    }
  }
}
```

Chat requests come from the Aperture gateway and have no client credential to forward. A provider in [passthrough mode][docs-use-passthrough-mode] without a fallback `apikey` is passthrough-only. Its models do not appear in chat. Configure a fallback `apikey` to make them available.

For setup instructions, refer to [Set up LLM providers][docs-set-up-providers]. To compare APIs and requirements, refer to [Supported providers and clients][docs-provider-compatibility].

## (Optional) Step 3: Curate the model picker

By default, the model picker lists every chat-compatible model the user has access to through a grant. To narrow the list or relabel models, set the top-level `chat_models` list in your Aperture configuration. If the list is non-empty, a model must match one of its entries to appear in the picker.

```json
{
  "chat_models": [
    { "model": "anthropic/**", "display_name": "Claude", "priority": 100 },
    { "model": "openai/**", "title_gen": true },
    { "model": "*/internal-*", "hidden": true }
  ]
}
```

Each entry takes a `model` glob in `provider/model` format and these optional fields:

* `display_name`: Label shown in the model picker instead of the model ID.
* `priority`: Sort order in the picker. Higher values appear first.
* `title_gen`: Use this model to generate conversation titles.
* `summarize`: Use this model to summarize chain-of-thought segments.
* `hidden`: Exclude matching models from the picker while keeping them eligible for `title_gen` and `summarize`. Use this to reserve a model for background tasks without offering it for responses.

`chat_models` is a curation list only. It does not grant access: a model appears in the picker only if the user's `models` grant covers it. You can also edit this list from **Administration** > **Chat** > **Models** at `/admin/settings/chat` in the Aperture admin dashboard.

Model aliases do not add entries to the picker. Use `provider/model` IDs or patterns in `chat_models`, not alias names. Refer to [Model aliases][docs-model-aliases] for picker limitations and name collision risks.

## Verify access

After you configure access, providers, and curation, verify that the chat UI works:

1. Have a granted user open `/` or `/chat` on the Aperture gateway. The model picker should list the curated models.
2. Send a test message and confirm a response.

If the model picker is empty, check that the user's `models` grant covers a model whose provider declares a chat `compatibility` flag.

If a user cannot open the chat UI, confirm their grant does not set `enable_portal` to `false`. Refer to [Troubleshooting Aperture][docs-troubleshooting] for help diagnosing access issues.

## Monitor chat usage

The Aperture admin dashboard includes an admin-only **Chat Activity** page at `/admin/adoption/chat-activity`.

## Next steps

* [Grant access to models][docs-grant-model-access] to refine which models each user or group can reach.
* [Set per-user spending limits][docs-set-per-user-spending-limits] to manage costs.
* Refer to the [Aperture admin dashboard reference][docs-admin-console] for details on admin-only pages.
* Refer to [model and reasoning selection][docs-chat-models] for model-picker behavior.

[docs-admin-console]: /docs/aperture/reference/dashboard-admin

[docs-chat-models]: /docs/aperture/reference/chat#model-and-reasoning-selection

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-visible-groups]: /docs/aperture/visible-groups
