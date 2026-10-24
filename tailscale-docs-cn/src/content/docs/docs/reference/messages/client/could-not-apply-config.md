---
title: "Could not apply configuration"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Jul 31, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Could not apply configuration
An error occurred applying the Tailscale envknob configuration stored on disk: `<error>`

## Reference ID

`apply-disk-config`

## Why you're seeing this message

A Tailscale envknob is another name for a Tailscale-specific environment variable or parameter used to adjust how the Tailscale client works within the tailnet. These settings start with prefixes, including `TS_`, `PORT`, and `HTTP_PROXY`, and used by the part of Tailscale that runs in the background, called `tailscaled`, also known as the Tailscale daemon.

Here are some reasons why this message might display:

* An envknob is not properly configured.
* The envknob conflicts with other client settings.
* You do not have permission to run the `tailscaled` process on the node or device.
* A configuration file on the disk containing envknobs might be corrupted or unreadable.

## What to do

Here are some things you can try to resolve this issue:

* Restart your Tailscale client using the client UI, or run the CLI commands `tailscale down` followed by `tailscale up`.
* Verify that your envknobs are properly configured and spelled correctly.
* Verify that your envknobs do not conflict with other Tailscale settings such as exit nodes, subnets, or your tailnet policy file.

## Additional information

* For information about the tailnet policy file, refer to [the tailnet policy file documentation][docs-tailnet-policy-file].
* For information about `tailscaled`, refer to [tailscaled daemon][docs-tailscaled].

[docs-messages]: /docs/reference/messages

[docs-tailscaled]: /docs/reference/tailscaled

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file
