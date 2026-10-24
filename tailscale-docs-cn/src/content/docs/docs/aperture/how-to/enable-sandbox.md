---
title: "Enable the chat sandbox"
description: "The chat sandbox gives the Aperture assistant access to an isolated Linux environment where it can execute commands, read and edit files, and share downloadable output with users during a conversation"
---

Last validated Sep 28, 2026

> **Note:** Aperture chat sandbox is currently in alpha.

\[Missing snippet: contact\_account\_manager.mdx]

The chat sandbox gives the Aperture assistant access to an isolated Linux environment where it can execute commands, read and edit files, and share downloadable output with users during a conversation.

## Prerequisites

Before you begin, confirm the following:

* You have admin access to edit the Aperture configuration. Refer to [set up admin access][docs-set-up-admin-access].
* Users who need sandbox access can reach the chat interface, which is available by default. Refer to [control model access][docs-grant-model-access].

> **Note:**
>
> Tailscale manages sandbox availability for your Aperture gateway. You do not configure or operate sandbox infrastructure. For more about the feature, refer to [Aperture chat sandbox][docs-chat-sandbox].

## Request the chat sandbox for your Aperture gateway

Tailscale enables the chat sandbox for your gateway. There is nothing to add to your Aperture configuration.

To request the sandbox, [complete the request form][xt-sandbox-request]. You can also contact your Tailscale account manager or email `aperture@tailscale.com`.

> **Note:**
>
> The chat sandbox gives the chat assistant its sandbox tools. It is unrelated to the `sandboxes` configuration block, which controls the separate workstation provisioning feature.

## Restrict portal access (optional)

The user portal is available by default, so authorized users can reach chat and its sandbox tools without an extra portal grant. To make matching non-admin users API-only, set `enable_portal` to `false`:

```json
{
  "grants": [
    {
      "src": ["group:contractors"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "enable_portal": false }
        ]
      }
    }
  ]
}
```

This disables the entire user portal for matching non-admin users, including chat and sandbox access. It is not a sandbox-only grant. Admins always retain portal access. An explicit `enable_portal: true` in any matching grant overrides a matching `false`.

## Verify the sandbox is working

After Tailscale enables the sandbox for your gateway:

1. Open `/` or `/chat` on the Aperture gateway.
2. Start a new conversation.
3. Open **Tools** and confirm **Code Sandbox** is available and selected.
4. Ask the assistant to run a command, such as "What is the output of `echo hello`?"
5. Confirm the assistant runs the command and returns the result.

If **Code Sandbox** shows **Contact support**, contact your Tailscale account manager or email `aperture@tailscale.com`.

## What changes when sandbox is enabled

The assistant can run commands, read and search files, create and edit files, and present output files for viewing or download. Users can select **Code Sandbox** for a conversation unless a user or project tool policy disables it.

## Next steps

* [Manage sandbox operations][docs-manage-sandbox] for monitoring and other operational tasks.
* [Sandbox reference][docs-sandbox-reference] for tool parameters, size limits, timeouts, and error messages.
* [Troubleshoot sandbox issues][docs-troubleshoot-sandbox] for diagnosing common problems.
* Refer to [Aperture configuration][docs-configuration] for the full configuration reference, including feature flags and grant capabilities.
* [Control model access][docs-grant-model-access] to configure which models are available in the chat interface.
* [Set up admin access][docs-set-up-admin-access] to manage who can change gateway settings.
* [Chat reference][docs-chat-reference] for user portal tools and settings.

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-configuration]: /docs/aperture/configuration

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-troubleshoot-sandbox]: /docs/aperture/troubleshooting/sandbox

[xt-sandbox-request]: https://forms.gle/stYHtWNM274fvGMH8

[docs-chat-reference]: /docs/aperture/reference/chat
