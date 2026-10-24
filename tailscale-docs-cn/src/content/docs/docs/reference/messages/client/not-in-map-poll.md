---
title: "Out of sync"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Jan 5, 2026

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Out of sync
Unable to connect to the Tailscale coordination server to
synchronize the state of your tailnet. Peer reachability
might degrade over time.

## Reference ID

`not-in-map-poll`

## Why you're seeing this message

Your Tailscale client cannot connect to the coordination server that synchronizes devices and nodes (peers) across your tailnet.

This issue can occur for the following reasons:

* Internet connectivity issues.
* Firewall restrictions are blocking the connection to the Tailscale coordination server.
* The Tailscale background service, which runs on devices and nodes, is not running correctly.
* Device controls are preventing connectivity. This may include features such as Screen Time on Apple devices.

## What to do

Here are some things you can try to resolve this issue:

* Restart your Tailscale client using the client UI, or run the CLI commands `tailscale down` followed by `tailscale up`.
* Check your internet connection.
* Adjust or remove controls of devices that might prevent connectivity.
* If you are using a firewall, verify that the ports and domains used for connecting to Tailscale are not blocked.

## Additional information

* For information about the ports and domain names used to communicate with Tailscale, refer to [What firewall ports should I open to use Tailscale?][docs-firewall-ports].
* For information about disabling Apple's Screen Time feature, refer to [macOS Screen Time and Tailscale][docs-macos-webfilterproxyd].

[docs-firewall-ports]: /docs/reference/faq/firewall-ports

[docs-macos-webfilterproxyd]: /docs/concepts/macos-webfilterproxyd

[docs-messages]: /docs/reference/messages
