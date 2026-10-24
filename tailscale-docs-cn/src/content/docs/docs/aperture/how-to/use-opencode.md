---
title: "Use OpenCode with Aperture"
description: "Configure [OpenCode][xt-opencode] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging."
---

Last validated Sep 28, 2026

Configure [OpenCode][xt-opencode] to send requests through [Aperture by Tailscale][docs-aperture] so your organization gets centralized API key management, usage tracking, and session logging.

> **Note:**
>
> The [Aperture CLI][docs-aperture-cli] can set up this connection for you automatically. It writes the OpenCode configuration and launches it, so you can skip the manual steps below.

## Prerequisites

Before you begin, you need:

* An Aperture gateway with at least one configured AI provider (such as Anthropic or OpenAI), accessible from your device. Refer to [get started with Aperture][docs-get-started] if you have not set this up.
* The Aperture gateway URL accessible from your device. Use `http://`, not `https://`.
* [OpenCode][xt-opencode] installed on your device.

\[Missing snippet: aperture\_tls\_warning.mdx]

\[Missing snippet: aperture\_any\_provider.mdx]

## Configure OpenCode

OpenCode requires two configuration changes: set the base URL to point at Aperture, and provide a placeholder API key for each provider.

### Set the base URL

Point OpenCode at your Aperture gateway by setting the base URL for each provider in the OpenCode configuration file.

1. Open or create the OpenCode configuration file. The file is usually named `opencode.json` and located in your home directory or the directory where you run OpenCode. Refer to the [OpenCode configuration documentation][xt-opencode-config] for details.

2. Add the following configuration to set Aperture as the base URL for your providers:

   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "provider": {
       "anthropic": {
         "options": {
           "baseURL": "http://<aperture-hostname>/v1"
         }
       },
       "openai": {
         "options": {
           "baseURL": "http://<aperture-hostname>/v1"
         }
       }
     }
   }
   ```

   Replace `<aperture-hostname>` with your Aperture gateway hostname. If you [connect from outside your tailnet][docs-connect-outside-tailnet], use `http://localhost:<port-number>` instead.

   Include only the providers you have configured in Aperture. For example, if you only have Anthropic configured, omit the `openai` block.

3. Save the file.

### Configure authentication

OpenCode requires an authentication entry for each provider. Set a placeholder value for each provider you configured.

> **Note:**
>
> Aperture identifies users through Tailscale identity and injects the real API credentials when forwarding requests. The placeholder value is never sent to the provider.

1. Open or create the OpenCode authentication file.

2. Add the following placeholder keys:

   ```json
   {
     "anthropic": {
       "type": "api",
       "key": "-"
     },
     "openai": {
       "type": "api",
       "key": "-"
     }
   }
   ```

   The dash character (`-`) satisfies OpenCode's authentication check.

3. Save the file.

Alternatively, enter the placeholder key interactively by running `/connect` inside OpenCode and selecting **Manually enter an API Key** for each provider.

## Verify the connection

1. Send a test message in OpenCode.
2. Open Chat on your Aperture gateway and select **Sessions** in the sidebar. Confirm that your test request appears. If your account has no portal access, ask an administrator to check **Security** > **Logs**.

If the request does not appear, refer to the [Aperture troubleshooting guide][docs-aperture-troubleshooting].

\[Missing snippet: aperture\_connect\_next\_steps.mdx]

[docs-aperture-cli]: /docs/aperture/cli

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-aperture]: /docs/aperture

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-get-started]: /docs/aperture/get-started

[xt-opencode-config]: https://opencode.ai/docs/config/

[xt-opencode]: https://opencode.ai
