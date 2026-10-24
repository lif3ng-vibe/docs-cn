---
title: "Network down"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Aug 1, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Network down
Tailscale cannot connect because the network is down.

## Message ID

`network-status`

## Why you're seeing this message

This message typically displays when the Tailscale client cannot communicate with the Tailscale [coordination server][docs-control-data-planes] because a network connection is not detected for the end-user.

## What to do

Here are some things you can try to resolve this issue:

* Restart your Tailscale client using the client UI, or run the CLI commands `tailscale down` followed by `tailscale up`.
* Check your network and internet connectivity and try reconnecting.
* Check the [Tailscale Status][xt-tailscale-status] page. If there is an issue on our end that impacts any of our services, it will be reported here.

## Additional reference

For more information about resolving general issues related to Tailscale, refer to [Troubleshooting guide][docs-troubleshooting].

[docs-control-data-planes]: /docs/concepts/control-data-planes#coordination-server

[docs-messages]: /docs/reference/messages

[docs-troubleshooting]: /docs/reference/troubleshooting

[xt-tailscale-status]: https://status.tailscale.com
