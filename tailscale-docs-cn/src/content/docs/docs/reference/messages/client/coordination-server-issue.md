---
title: "Coordination server reports an issue"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Aug 1, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Coordination server reports an issue
The coordination server is reporting a health issue: `<reported-issue>`

## Reference ID

`control-health`

## Why you're seeing this message

The coordination server is responsible for device discovery, authentication, key distribution, policy enforcement, and distributing network configurations to all devices in your tailnet.

This message may appear when the coordination server is not reachable. There are multiple reasons why this can happen, including the following:

* There is an issue on our end.
* A router, firewall, or network configuration was recently updated, causing connectivity issues.
* You were recently assigned a new public IP address and the client is attempting to re-establishing a connection to the coordination server.

## What to do

Here are some things you can try to resolve this issue:

* Restart your Tailscale client using the client UI, or run the CLI commands `tailscale down` followed by `tailscale up`.
* Check your internet connection.
* Wait a few minutes and restart the Tailscale client.
* Check your firewall rules.
* Check the [Tailscale Status][xt-tailscale-status] page. If there is an issue on our end that impacts any of our services, it will be reported here.

## Additional information

* For information about coordination server outages, refer to [What happens if the coordination server is down?][docs-coordination server-down].
* For information about the Tailscale coordination server, refer to [Control and data planes][docs-control-data-planes].
* For information about using firewalls with Tailscale, refer to [Using Tailscale with your firewall][docs-firewalls].

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-coordination server-down]: /docs/reference/coordination-server-down

[docs-firewalls]: /docs/integrations/firewalls

[docs-messages]: /docs/reference/messages

[xt-tailscale-status]: https://status.tailscale.com
