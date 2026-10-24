---
title: "Record SSH sessions for compliance and audit"
description: "[Tailscale SSH][docs-tailscale-ssh] routes SSH connections through your tailnet without opening firewall ports. Session recording captures those connections as auditable logs so you can review exactly"
---

Last validated May 18, 2026

> **Note:**
>
> Featured reference:
>
> [**Tailscale SSH session recording**](/docs/features/tailscale-ssh/tailscale-ssh-session-recording) — Use Tailscale SSH session recording to collect end-to-end encrypted recordings of Tailscale SSH sessions.

[Tailscale SSH][docs-tailscale-ssh] routes SSH connections through your tailnet without opening firewall ports. Session recording captures those connections as auditable logs so you can review exactly what happened during any SSH session. You can require recording as a condition of access, blocking sessions if the recorder is unavailable.

## Enable Tailscale SSH on your servers

Install the Tailscale client on each server you want to record and enable its built-in SSH server.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh
```

Repeat this on every server you want to record. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and assign a tag to these servers so you can target them as a group in the policy file. For the full list of `tailscale up` flags, refer to the [`tailscale up`][docs-cli-up] CLI reference.

## Deploy a session recorder

A session recorder is a dedicated Tailscale node that receives and stores session data. Recordings are saved as `.cast` files in `asciinema` format, which you can replay or export for audit review.

Install the Tailscale client on the host you'll use as your recorder and authenticate:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:recorder
```

Then start `tsrecorder` with a storage destination:

```bash
tsrecorder --dst s3://your-bucket/sessions
```

For local storage, replace the S3 URL with a local path such as `/var/lib/tsrecorder/sessions`. S3-compatible storage is recommended for compliance environments where long-term retention and centralized access matter.

## Configure recording in the policy file

Open the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console and add an SSH rule that targets your servers and routes sessions through the recorder node.

```json
"ssh": [
  {
    "action": "accept",
    "src": ["autogroup:member"],
    "dst": ["tag:server"],
    "users": ["autogroup:nonroot", "root"],
    "recorder": ["tag:recorder"],
    "enforceRecorder": true
  }
]
```

Setting `enforceRecorder` to `true` blocks SSH access if the recorder is unreachable. This is the recommended setting for compliance environments where an unrecorded session is not acceptable.

## Connect to your servers

Connect to a tagged server using any standard SSH client. Tailscale routes the connection and notifies the connecting user that the session is being recorded.

```bash
ssh user@hostname
```

Use the server's [MagicDNS][docs-magicdns] hostname or its Tailscale IP address. After the session ends, confirm recordings are being captured by checking the recorder's storage destination.

## Review recorded sessions

Recordings are stored as `.cast` files in `asciinema` format at the destination you configured. Each file captures the full terminal output of a single session, including timing data, so replays are accurate to the original.

To replay a session on any machine with `asciinema` installed:

```bash
asciinema play /path/to/session.cast
```

For S3-backed storage, download the file first or point `asciinema` at a local copy. You can also use `tsrecorder` to list and replay sessions directly from the recorder node. For long-term audit retention, `.cast` files can be archived, parsed as JSON, or ingested into a SIEM or log aggregation tool.

## Further exploration

* Read the [Tailscale SSH session recording][docs-session-recording] reference for the full details on recorder configuration, storage options, and file format.
* Follow the [Send session recordings to S3][docs-session-recording-s3] guide to set up durable, cloud-backed recording storage.
* Review the [Tailscale SSH][docs-tailscale-ssh] documentation for the full set of SSH rule options, including check conditions and user mappings.
* Use the [tailnet policy file][docs-policy-file] to layer additional access controls, such as limiting SSH access to specific source devices or groups.
* Review [configuration audit logging][docs-audit-logs] to track policy file changes alongside your session recordings.
* Use [log streaming][docs-log-streaming] to forward Tailscale logs to a SIEM or log aggregation platform for centralized audit workflows.

[docs-audit-logs]: /docs/features/logging/audit-logging

[docs-cli-up]: /docs/reference/tailscale-cli/up

[docs-log-streaming]: /docs/features/logging/log-streaming

[docs-magicdns]: /docs/features/magicdns

[docs-policy-file]: /docs/features/tailnet-policy-file

[docs-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-session-recording-s3]: /docs/features/tailscale-ssh/how-to/session-recording-s3

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
