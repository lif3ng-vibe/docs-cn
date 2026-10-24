---
title: "Centralize LLM access and spending"
description: "When developers and AI coding agents each use their own LLM API keys, organizations lose visibility into who is using which models, how much they are spending, and what data they are sending to provid"
---

Last validated Sep 28, 2026

> **Note:**
>
> Featured reference:
>
> [**Aperture**](/docs/aperture) — Monitor and secure LLM usage with Aperture by Tailscale.

When developers and AI coding agents each use their own LLM API keys, organizations lose visibility into who is using which models, how much they are spending, and what data they are sending to providers. Keys get shared across teams, embedded in CI/CD pipelines, and stored on developer laptops where they are difficult to rotate or revoke.

[Aperture by Tailscale][docs-aperture] acts as a centralized gateway between your LLM clients and upstream providers. You store API keys in one place, grant model access per user or team, and get per-user usage tracking and full request and response logging without changing how developers use their tools.

## Create your Aperture gateway

1. Sign up at [`aperture.tailscale.com`][xt-aperture-signup] and follow the guided setup. After setup completes, Aperture appears as a device named `ai` in your tailnet.

   For detailed setup instructions, refer to [get started with Aperture][docs-aperture-get-started].

2. Open the Aperture admin dashboard at `http://ai/admin/settings/providers`.

3. Add your LLM provider API keys so Aperture can forward requests on behalf of your users.

   The following example configures Aperture with both OpenAI and Anthropic providers:

   ```json
   {
   "providers": {
       "openai": {
       "baseurl": "https://api.openai.com",
       "apikey": "YOUR_OPENAI_KEY",
       "models": ["gpt-5.5", "gpt-5.4-mini"],
       "compatibility": { "openai_chat": true }
       },
       "anthropic": {
       "baseurl": "https://api.anthropic.com",
       "apikey": "YOUR_ANTHROPIC_KEY",
       "authorization": "x-api-key",
       "models": ["claude-sonnet-5-5", "claude-opus-5-5"],
       "compatibility": { "anthropic_messages": true }
       }
   }
   }
   ```

   Developers never access or handle provider credentials. When a client sends a request specifying a model name, Aperture routes it to the correct provider and injects authentication automatically.

   To have each client forward its own credential instead of a shared key, for example to use subscription plans such as Claude Pro or ChatGPT Plus, configure the provider in [passthrough mode][docs-use-passthrough-mode]. Aperture does not hold or manage the subscription itself.

   For the full list of supported providers and configuration options, refer to the [Aperture configuration reference][docs-aperture-configuration] and [Supported providers and clients][docs-aperture-provider-compatibility].

## Grant users access to models

Aperture is deny-by-default: no user can access any model until you explicitly grant access. Use the `grants` section to control which users or groups can access which models.

Configure grants in the Aperture admin dashboard or in your [tailnet policy file][docs-tailnet-policy-file].

> **Note:**
>
> To use groups (for example, `group:ml-engineers`) in Aperture grants, configure [visible groups][docs-visible-groups] in your tailnet policy file so the Aperture gateway can resolve group memberships.

The following example uses the tailnet policy file to grant your ML engineering team access to all models and give admins full control:

```json
"grants": [
  {
    "src": ["group:ml-engineers"],
    "dst": ["tag:aperture"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        { "models": "**" }
      ]
    }
  },
  {
    "src": ["autogroup:admin"],
    "dst": ["tag:aperture"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "admin" },
        { "models": "**" }
      ]
    }
  }
]
```

You can restrict access to specific models by replacing `"**"` with a model name pattern in `provider/model` format. For example, `"models": "anthropic/claude-*"` grants access to all Anthropic Claude models but no others.

For step-by-step instructions on granting access, refer to [grant model access][docs-aperture-grant-model-access].

## Configure AI tools and CI/CD pipelines

Point each LLM client at Aperture instead of the provider directly. Aperture identifies requests by [Tailscale device identity][docs-tailscale-identity], not by API key, so clients use a placeholder key value.

\[Missing snippet: aperture\_tls\_warning.mdx]

### Claude Code

Create or edit `~/.claude/settings.json`:

```json
{
  "apiKeyHelper": "echo '-'",
  "env": {
    "ANTHROPIC_BASE_URL": "http://ai"
  }
}
```

The `apiKeyHelper` returns a placeholder because Aperture injects credentials automatically. For additional configuration options (Bedrock, Gemini Enterprise Agent Platform), refer to [use Claude Code with Aperture][docs-aperture-use-claude-code].

### CI/CD pipelines

For CI/CD environments such as GitHub Actions, set environment variables in your workflow:

```yaml
env:
  ANTHROPIC_BASE_URL: http://ai
  ANTHROPIC_API_KEY: "-"
```

The CI runner must be in the tailnet for this to work. Use the [Tailscale GitHub Action][docs-tailscale-github-action] to connect runners as ephemeral nodes, or [connect from outside the tailnet][docs-aperture-without-tailnet] for environments where installing Tailscale is not possible. For non-interactive CI jobs, `ts-unplug` gives you a fixed local port that scripts can use as a base URL.

### Other LLM clients

Any LLM client that supports a custom base URL can use Aperture. Set the base URL to `http://ai` and use a placeholder API key. For configuration guides for other tools, refer to [set up LLM clients][docs-aperture-use-your-tools].

## Monitor usage and review logs

After traffic flows through Aperture, open the admin dashboard at `http://ai/admin/` to:

* Track per-user token usage and cost across all models and providers.
* Review session logs with request and response details.
* Review tool calls made by AI agents to understand what actions agents take on behalf of users.

Aperture attributes each request to the Tailscale identity of the user or device that sent it, giving you real-time visibility into how your organization uses LLMs.

For details on the dashboard and available metrics, refer to the [Aperture admin dashboard reference][docs-aperture-dashboard-admin].

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-aperture-use-claude-code]: /docs/aperture/how-to/use-claude-code

[docs-aperture-use-your-tools]: /docs/aperture/use-your-tools

[docs-aperture-without-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture]: /docs/aperture

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-github-action]: /docs/integrations/github/github-action

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-aperture-signup]: https://aperture.tailscale.com

[docs-visible-groups]: /docs/aperture/visible-groups
