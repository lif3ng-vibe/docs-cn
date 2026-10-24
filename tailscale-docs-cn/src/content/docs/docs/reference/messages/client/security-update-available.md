---
title: "Security update available"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Aug 1, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Security update available
A security update from version `<current-version>` to `<new-version>` is available.

## Message ID

`security-update-available`

## Why you're seeing this message

Tailscale security updates are available for the device to patch a known security issue related to the Tailscale client.

## What to do

We recommend installing all security updates as soon as they are available.

If you are using macOS, Windows, iOS, Android, or tvOS, you can update your Tailscale client from the UI, the device's app store, or the [Tailscale Packages - stable track][pk-stable] page.

If your device is running on a platform that can use the [Tailscale CLI][docs-cli] such as Linux, macOS, and Windows, you can run `tailscale update` for a one-time update, or `tailscale set --auto-update` to automatically update the OS as new versions become available.

## Additional reference

* For information about installing the Tailscale client, refer to [Install Tailscale][docs-installation].
* For information about updating the Tailscale client, refer to [Update Tailscale][docs-update].
* For in-depth guidance on securing Tailscale clients and Tailscale in general, refer to [Best practices to secure your tailnet][docs-security-hardening].

[docs-cli]: /docs/reference/tailscale-cli

[docs-installation]: /docs/install

[docs-messages]: /docs/reference/messages

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-update]: /docs/features/client/update

[pk-stable]: https://pkgs.tailscale.com/stable/
