---
title: "Login name change detected"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

**HTTP status:** `Error 409`

Account login name change detected (from `username1@example.com` to `username2@example.com`). Please contact support for more information.

## Why you're seeing this message

This message typically indicates that an account's email address using a public/shared domain has changed. For example, modifying your Gmail account to use a different `@gmail.com` address. Tailscale will detect a mismatch and block access to the tailnet to prevent unauthorized use, locking the account out of the admin console.

Devices already connected to the tailnet with the old email address will continue to work, however, you cannot take administrative actions that require admin console authentication.

## What to do

Here are some things you can try to resolve this issue:

* Change the email for the account back to the original email address in your provider's settings.
* If you are unable to change the email address back to the original one, the only other option is to create a new tailnet. We cannot correlate your existing tailnet with the changed email address for an account using a public/shared domain name.

## Additional information

For information about creating a new tailnet, refer to [Tailscale quickstart][docs-quickstart].

[docs-messages]: /docs/reference/messages

[docs-quickstart]: /docs/how-to/quickstart
