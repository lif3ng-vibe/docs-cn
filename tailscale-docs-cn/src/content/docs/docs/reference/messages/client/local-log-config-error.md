---
title: "Local log misconfiguration"
description: "This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and clien"
---

Last validated Jan 30, 2026

This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Local log misconfiguration
The local log is misconfigured.

## Message ID

`local-log-config-error`

## Why you're seeing this message

The Tailscale client cannot initialize local logging related to [device connectivity][docs-device-connectivity], used to help troubleshoot and debug issues.

This error can display for the following reasons:

* Invalid or unreachable log destination, due to missing write permissions or a read-only filesystem.
* Logging conflicts due to the operating system's logging service being unavailable or misconfigured.

## What to do

Here are some things you can try to resolve this issue:

* Remove any custom logging settings and let the Tailscale client use its default logging behavior.
* Make sure the client has permission to write logs and that the filesystem is writable.
* If logging to a file, confirm the directory exists and is writable. If using system logging, ensure the operating system's logging service is functioning normally.
* Restart the Tailscale client after making changes so logging can start cleanly.

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-messages]: /docs/reference/messages
