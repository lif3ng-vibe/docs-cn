---
title: "Tailscale blocked by Screen Time"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Tailscale blocked by Screen Time
The Screen Time feature in macOS is preventing Tailscale from working properly.

## Message ID

`macos-screen-time-controlclient`

## Why you're seeing this message

If macOS and iOS users enable Screen Time restrictions, the system will block access to Tailscale during the restricted time period.

## What to do

Disable the Screen Time setting in **System Settings**, **Screen Time**, **Content & Privacy**, **Access to Web Content**.

## Additional reference

* Refer to our documentation [macOS Screen Time and Tailscale][docs-macos-screen-time].
* Refer to Apple's documentation [Change Screen Time settings on Mac][xt-apple-screen-time].

[docs-macos-screen-time]: /docs/concepts/macos-webfilterproxyd

[docs-messages]: /docs/reference/messages

[xt-apple-screen-time]: https://support.apple.com/guide/mac-help/change-screen-time-settings-on-mac-mchlca5139d2/mac
