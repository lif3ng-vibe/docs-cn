---
title: "Multiple users with login"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

**HTTP status:** `Error 409`

Multiple users with login `<user@example.com>`, please contact support to login

## Why you're seeing this message

This issue can occur for the following reasons:

* The email address belongs to a different tailnet.
* Changes were made to your identity provider (IdP) that affect the user ID associated with the email address used for authentication.

## What to do

Here are some things you can try to resolve this issue:

* Make sure you're using the email address associated with the tailnet you're trying to log in to. If you have access to multiple tailnets, the wrong email address might have been used.
* Contact your IT administrator to determine if any changes were made to your account, such as updates to your user account. If this has occurred, you or your IT administrator may be required to contact [Tailscale Support][co-support] for additional steps.

[co-support]: https://tailscale.com/support

[docs-messages]: /docs/reference/messages
