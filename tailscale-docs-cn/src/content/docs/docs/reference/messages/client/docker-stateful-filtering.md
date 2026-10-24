---
title: "Docker with stateful filtering"
description: "This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client,"
---

Last validated Dec 29, 2025

This topic explains a message that may appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Docker with stateful filtering
Stateful filtering is enabled and Docker was detected; this may prevent Docker containers on this host from resolving DNS and connecting to Tailscale nodes.

## Reference ID

`docker-stateful-filtering`

## Why you're seeing this message

Stateful filtering occurs when a firewall tracks active connections and only lets traffic that is part of an established, approved connection. For example, the firewall permits a response because a node or device sent a request. When you configure Docker with its own firewall rules, such as iptables, they can conflict with the firewall or routing rules set by Tailscale, which may lead to connectivity issues or warnings like this message.

## What to do

Here are some things you can try to resolve this issue:

* Disable Docker's iptables management, using the command `sudo dockerd --iptables=false`.
* Use Tailscale Serve or Tailscale Funnel to expose services securely without relying on Docker port mappings.
* Use the Tailscale CLI command `tailscale set --stateful-filtering=false` option to prevent dropping of inbound packets with another node's destination IP.
* Use the Tailscale CLI command `tailscale up --netfilter-mode=off` in advanced setups where you're manually managing all iptables rules. Refer to [netfilter modes][docs-netfilter-mode] for more information.
* Add custom iptables rules that allow Tailscale traffic, especially `ESTABLISHED` and `RELATED` connection states.
* Verify routing and NAT behavior with tools like `iptables -L -v` and `tailscale netcheck`.

## Additional information

* For information about configuring firewall rules in Docker, refer to [Packet filtering and firewalls][xt-docker-firewall-config].
* For information about setting up Tailscale Serve, refer to [Tailscale Serve][docs-serve].
* For information about setting up Tailscale Funnel, refer to [Tailscale Funnel][docs-funnel].
* For information about Tailscale commands, refer to [Tailscale CLI][docs-cli].

[docs-cli]: /docs/reference/tailscale-cli

[docs-funnel]: /docs/features/tailscale-funnel

[docs-messages]: /docs/reference/messages

[docs-netfilter-mode]: /docs/reference/netfilter-modes

[docs-serve]: /docs/features/tailscale-serve

[xt-docker-firewall-config]: https://docs.docker.com/engine/network/packet-filtering-firewalls/
