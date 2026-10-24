---
title: "Encrypted connection failed"
description: "This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and clien"
---

Last validated Jan 30, 2026

This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Encrypted connection failed
Tailscale could not establish an encrypted connection with `<connection target>`.

## Message ID

`tls-connection-failed`

## Why you're seeing this message

This message means the Tailscale client was unable to establish a secure, encrypted connection with another Tailscale component, such as a peer or the [control plane][docs-control-data-planes]. Tailscale requires [encryption][docs-encryption] for all connections, and this error occurs when the cryptographic handshake fails to complete. As a result, the connection fails because Tailscale cannot guarantee secure communication.

## What to do

Here are some things you can try to resolve this issue:

* Verify that both devices [have working internet connectivity][docs-connect-internet-failure] and that the Tailscale client is installed.
* Restart the Tailscale clients to refresh the connection.
* Update the Tailscale clients to the latest version.
* Switch networks to rule out ISP or network-level filtering issues.
* Verify that firewalls or security software are not blocking UDP traffic. Tailscale prefers encrypted peer connections.
* Verify the system clock is accurate. Out-of-sync time can cause cryptographic handshakes to fail.
* Verify there's no deep packet inspection, TLS interception, or VPN software interfering with encrypted traffic.

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-connect-internet-failure]: /docs/reference/troubleshooting/connectivity/connect-internet-failure

[docs-messages]: /docs/reference/messages
