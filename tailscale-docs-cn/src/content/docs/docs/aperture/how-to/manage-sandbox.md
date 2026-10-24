---
title: "Manage sandbox operations"
description: "The [chat sandbox][docs-chat-sandbox] gives each conversation an isolated environment where the assistant can run code, create files, and produce downloadable artifacts. Tailscale manages sandbox avai"
---

Last validated Sep 28, 2026

> **Note:** Aperture chat sandbox is currently in alpha.

\[Missing snippet: contact\_account\_manager.mdx]

The [chat sandbox][docs-chat-sandbox] gives each conversation an isolated environment where the assistant can run code, create files, and produce downloadable artifacts. Tailscale manages sandbox availability for your Aperture gateway. You do not configure or operate its infrastructure.

## Availability and support

Tailscale enables the chat sandbox for your gateway. There is nothing to add to your Aperture configuration. To request access, refer to [enable the chat sandbox][docs-enable-sandbox].

If the sandbox stops responding, returns repeated errors, or reports unexpected storage usage, refer to [troubleshoot sandbox issues][docs-troubleshoot-sandbox]. Contact your Tailscale account manager or email `aperture@tailscale.com` if failures persist across conversations.

## Security considerations

Each conversation gets its own isolated sandbox. The following properties apply:

* Conversations cannot access each other's files or state.
* File downloads require conversation ownership. Users can download files only from their own conversations.
* Outbound access is limited to approved package registries and source hosts. Sandbox code cannot reach your tailnet or Aperture internal systems.
* HTML previews cannot load external resources or reach parent-page cookies, storage, or DOM.

> **Warning:**
>
> Restricted outbound access reduces, but does not eliminate, the risk of data leaving the sandbox. Some approved hosts can receive arbitrary content. Avoid placing highly sensitive data in a sandbox conversation.

## Operational parameters reference

| Parameter                               | Value   | Description                                                                                                                                                             |
| --------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload size limit, model-readable files | 25 MiB  | Maximum size of a single image, PDF, text, or office document upload. These files are sent to the model with the message.                                               |
| Upload size limit, other files          | 500 MiB | Maximum size of a single upload the model cannot read, such as video, audio, an archive, or an unrecognized binary. These files are available to sandbox commands only. |
| Attachments per conversation            | 20      | Cumulative limit on uploaded files in one conversation, not per message                                                                                                 |
| Sandbox execution capacity              | 5 GiB   | Combined uploads and outputs available to sandbox commands                                                                                                              |

Separate storage quotas can reject uploads or prevent generated files from being saved at lower limits. Refer to [size limits and quotas][docs-sandbox-limits] for the conversation, user, and gateway limits.

## Related

* [Aperture chat sandbox][docs-chat-sandbox] for a conceptual overview of the feature.
* [Enable the chat sandbox][docs-enable-sandbox] for step-by-step setup instructions.
* [Sandbox reference][docs-sandbox-reference] for tool parameters, size limits, timeouts, and error messages.
* [Troubleshoot sandbox issues][docs-troubleshoot-sandbox] for diagnosing common problems.

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-enable-sandbox]: /docs/aperture/how-to/enable-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-troubleshoot-sandbox]: /docs/aperture/troubleshooting/sandbox

[docs-sandbox-limits]: /docs/aperture/reference/sandbox#size-limits-and-quotas
