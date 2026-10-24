---
title: "Troubleshoot sandbox issues"
description: "Use this topic to troubleshoot sandbox tools, storage, and file downloads."
---

Last validated Sep 28, 2026

> **Note:** Aperture chat sandbox is currently in alpha.

\[Missing snippet: contact\_account\_manager.mdx]

Use this topic to troubleshoot sandbox tools, storage, and file downloads.

## Sandbox tools do not appear in conversations

Open **Tools** in a conversation and check **Code Sandbox**:

1. If **Code Sandbox** shows **Contact support**, sandbox service is unavailable for that gateway. Contact your Tailscale account manager or email `aperture@tailscale.com`.
2. If **Code Sandbox** is available but not selected, select it for the conversation.
3. If the conversation belongs to a project, check whether the project's tool policy disables the sandbox.
4. Confirm the user has portal access. Portal access is available by default, but `enable_portal: false` makes matching non-admin users API-only. Admins always retain portal access, and an explicit `enable_portal: true` in any matching grant overrides a matching `false`.

## Tool calls fail with connection errors

The assistant tries to use a sandbox tool but the tool call fails with an error such as `exec failed:` followed by a connection-related message.

1. Retry the request.
2. Start a new conversation to determine whether the failure is limited to one conversation.
3. If the errors persist across conversations, contact your Tailscale account manager or email `aperture@tailscale.com` with the approximate time and error message.

## Storage limit exceeded

Storage errors can come from saved-file quotas or sandbox execution capacity.

### Upload or saved-file quota

An upload fails with HTTP 429 and one of these messages:

* `Conversation storage limit reached. You can contact support to request a limit increase.` Start a new conversation with fewer files or contact support.
* `Storage limit reached. Try again later or contact support.` A rolling user or gateway quota is reached. Wait before retrying. Starting another conversation does not reset these quotas.

On gateways where these quotas apply, saved uploads and generated outputs share a 500 MiB conversation limit. New file storage also has rolling 24-hour limits of 1 GiB per user and 10 GiB per gateway.

A command can succeed without saving its output if the output exceeds a quota. The file might be unavailable for download. For a conversation quota, rerun the task in a new conversation with fewer files. For a rolling user or gateway quota, wait before retrying or contact support.

### Sandbox execution capacity

Sandbox commands or file mutations fail with the message:

> This conversation's attached files exceed the sandbox capacity (5 GiB combined). Archive or remove some files and try again.

The files made available to sandbox commands exceed the separate 5 GiB execution capacity. This is not the saved-file quota described earlier.

To resolve this, start a new conversation. To reduce storage use, keep intermediate work in the scratch directory and place only final deliverables in the output directory. Scratch files might disappear between later turns.

## File downloads fail

Clicking a download link for a sandbox-generated file returns an error. The following table lists common HTTP status codes and their causes.

| Status code | Cause                                                                                | Resolution                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 401         | The user is not authenticated.                                                       | Verify the request comes through the tailnet with valid Tailscale authentication.                                           |
| 403         | The user does not have portal access.                                                | Check matching `enable_portal` grants. Portal access is on by default for non-admin users, and admins always retain access. |
| 404         | The conversation or file does not exist, or the user is not authorized to access it. | Verify the conversation and file. Only an authorized conversation owner can download the file.                              |
| 502         | The sandbox service returned an upstream error.                                      | Retry the download. If it keeps failing, contact your Tailscale account manager or email `aperture@tailscale.com`.          |
| 503         | Sandbox storage is unavailable for the gateway.                                      | Contact your Tailscale account manager or email `aperture@tailscale.com`.                                                   |

> **Note:**
>
> Aperture returns 404 when a conversation does not exist or the requesting user is not its owner. This prevents disclosure of other users' conversations.

> **Note:**
>
> Aperture checks portal access before looking up a file. Non-admin users without portal access receive 403. Admins always retain portal access.

## Command output is truncated

The assistant's command output ends with a truncation notice such as `... output truncated (exceeded 1 MiB) ...` or `... output truncated ...`.

Sandbox tools limit the output they return to the assistant:

* `aperture_bash` output: 1 MiB (1,048,576 bytes)
* `aperture_read_file`, `aperture_list_files`, and `aperture_grep` output: 16,000 bytes

For large output, ask the assistant to redirect command output to a file, search for relevant lines, and read bounded sections.

## Verify sandbox health

To check that commands and file downloads work:

1. Start a new conversation in `/` or `/chat`.
2. Open **Tools** and confirm **Code Sandbox** is available and selected.
3. Ask the assistant, "What is the output of `echo hello`?"
4. Confirm the assistant runs the command and returns `hello`.
5. Ask the assistant to create and present a file.
6. Confirm a file card appears and the file downloads.

If **Code Sandbox** shows **Contact support**, contact your Tailscale account manager or email `aperture@tailscale.com`.

## Related

* [Aperture chat sandbox][docs-chat-sandbox] for a conceptual overview of the feature.
* [Sandbox reference][docs-sandbox-reference] for tool parameters, size limits, timeouts, and error messages.
* [Manage sandbox operations][docs-manage-sandbox] for monitoring and other operational tasks.
* [Aperture configuration reference][docs-aperture-configuration]
* [Troubleshoot Aperture][docs-troubleshooting]

[ar-connection-errors]: #tool-calls-fail-with-connection-errors

[ar-file-downloads-fail]: #file-downloads-fail

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-enable-sandbox]: /docs/aperture/how-to/enable-sandbox

[docs-manage-sandbox]: /docs/aperture/how-to/manage-sandbox

[docs-sandbox-reference]: /docs/aperture/reference/sandbox

[docs-troubleshooting]: /docs/aperture/troubleshooting
