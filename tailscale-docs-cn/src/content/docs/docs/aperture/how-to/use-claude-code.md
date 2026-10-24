---
title: "Use Claude Code with Aperture"
description: "Configure [Claude Code][xt-claude-code] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging."
---

Last validated Sep 28, 2026

Configure [Claude Code][xt-claude-code] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging.

> **Note:**
>
> The [Aperture CLI][docs-aperture-cli] can set up this connection for you automatically. It sets the environment variables Claude Code requires and launches it, so you can skip the manual steps below.

## Prerequisites

Before you begin, you need:

* An Aperture gateway with at least one configured AI provider (such as Anthropic), accessible from your device. Refer to [get started with Aperture][docs-get-started] if you have not set this up.
* The Aperture gateway URL accessible from your device. Use `http://`, not `https://`.
* [Claude Code][xt-claude-code] installed on your device.

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## Configure Claude Code

To configure Claude Code to use Aperture, create or edit the global Claude Code settings file (`~/.claude/settings.json`) and set `ANTHROPIC_BASE_URL` to your Aperture URL:

```json
{
  "apiKeyHelper": "echo '-'",
  "env": {
    "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
  }
}
```

The `apiKeyHelper` setting returns a placeholder value because Aperture injects credentials automatically. You do not need to configure an API key on the client.

> **Note:**
>
> To route a Claude subscription account such as Claude Pro or Max through Aperture, the upstream Anthropic provider must use passthrough mode so Aperture forwards Claude Code's own OAuth token to Anthropic. In this case, set only `ANTHROPIC_BASE_URL` and do not set `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`. Setting either makes Claude Code send that value instead of its OAuth token, which suppresses the credential you want to pass through. For more information, refer to [Set up passthrough mode][docs-use-passthrough-mode].

> **Tip:**
>
> You can also configure Claude Code using an environment variable instead of a settings file. Set the following environment variable:
>
> ```shell
> export ANTHROPIC_BASE_URL="http://<aperture-hostname>"
> ```

> **Warning:**
>
> Claude Code v1.x requires additional configuration because the `apiKeyHelper` setting does not exist in earlier versions. You must provide a placeholder authentication token and explicitly specify the model.
>
> ```json
> {
>   "model": "claude-sonnet-5-5",
>   "env": {
>     "ANTHROPIC_AUTH_TOKEN": "bearer-managed",
>     "ANTHROPIC_BASE_URL": "http://<aperture-hostname>"
>   }
> }
> ```

### Claude Code with Amazon Bedrock

If your Aperture gateway routes through Amazon Bedrock, use the following `settings.json` configuration instead of the default Anthropic configuration shown above:

```json
{
  "env": {
    "ANTHROPIC_MODEL": "us.anthropic.claude-sonnet-4-6",
    "ANTHROPIC_BEDROCK_BASE_URL": "http://<aperture-hostname>/bedrock",
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "CLAUDE_CODE_SKIP_BEDROCK_AUTH": "1"
  }
}
```

If you use Claude Code in VS Code with Bedrock, also add `"claudeCode.disableLoginPrompt": true` to your VS Code user settings JSON (open the **Command Palette** and select **Preferences: Open User Settings (JSON)**).

### Claude Code with the Gemini Enterprise Agent Platform

If your Aperture gateway routes through the Gemini Enterprise Agent Platform, use the following `settings.json` configuration instead of the default Anthropic configuration. Replace `<project-id>` with your Google Cloud project ID. Claude Code still names these environment variables after the platform's earlier name, Vertex AI.

```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-sonnet-4-6",
    "CLOUD_ML_REGION": "global",
    "ANTHROPIC_VERTEX_PROJECT_ID": "<project-id>",
    "CLAUDE_CODE_USE_VERTEX": "1",
    "CLAUDE_CODE_SKIP_VERTEX_AUTH": "1",
    "ANTHROPIC_VERTEX_BASE_URL": "http://<aperture-hostname>/v1"
  }
}
```

If you use Claude Code in VS Code with the Gemini Enterprise Agent Platform, also add `"claudeCode.disableLoginPrompt": true` to your VS Code user settings JSON (open the **Command Palette** and select **Preferences: Open User Settings (JSON)**).

## Verify the connection

To verify that Claude Code routes requests through Aperture:

1. Send a test message in Claude Code.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If the request does not appear, refer to the [Aperture troubleshooting topic][docs-aperture-troubleshooting].

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-get-started]: /docs/aperture/get-started

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[xt-claude-code]: https://docs.anthropic.com/en/docs/claude-code
