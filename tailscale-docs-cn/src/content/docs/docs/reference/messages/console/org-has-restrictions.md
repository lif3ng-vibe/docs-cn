---
title: "Your organization has restricted members from joining external tailnets"
description: "This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and "
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale admin console and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the admin console

**HTTP status:** `Error 403`

Your organization has restricted members from joining external tailnets

## Why you're seeing this message

This error message displays when your tailnet uses a private/owned domain and the administrator is preventing users from joining other (external) tailnets.

## What to do

Here are some things you can try to resolve this issue:

* Use a different email address to join an external tailnet.
* Contact your IT administrator to request permission to join an external tailnet using your organization email address.

## Additional information

* For information about enabling and disabling access to external tailnets, refer to [Invite any user to your tailnet][docs-invite-any-user].

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user#enable-or-disable-joining-external-tailnets

[docs-messages]: /docs/reference/messages
