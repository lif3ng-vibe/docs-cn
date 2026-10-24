---
title: "Access Hetzner Servers privately using Tailscale"
description: "Hetzner provides Linux virtual machines from several data centers in Europe. We can use Tailscale to securely access these servers."
---

Last validated Jan 5, 2026

Hetzner provides Linux virtual machines from several data centers in Europe.
We can use Tailscale to securely access these servers.

## Prerequisites

Before you begin this guide, you'll need a Tailscale network set up and configured with at
least one existing device. Read our [getting started guide][docs-install]
if you need help with this.

## Step 1: Set up the Tailscale client for the VM

First, [create a Virtual Machine in the Hetzner Cloud Console][xt-hetzner-run].

SSH to the system and install the Tailscale client:

```shell
# curl -fsSL https://tailscale.com/install.sh | sh
# tailscale up
```

In the next step we'll remove SSH access from the public IP address, so:

1. Find the Tailscale IP address using [`tailscale ip`][docs-cli-ip].
2. Exit from the SSH session to the public IP address.
3. Make a new SSH session to the Tailscale IP address.

## Step 2: Allow UDP port 41641

If at least one side of a tunnel has "easy NAT," where Tailscale can determine the UDP port
number on the far side of the NAT device, then it will make
[direct connections to minimize latency.][bl-how-tailscale-works]
We ensure that Hetzner nodes can make direct connections by allowing UDP port 41641 to ingress
through the firewall.

In the [Firewall tab of the Hetzner Cloud Console][xt-hetzner-run] select
the **Create Firewall** button. Delete the SSH and ICMP rules and add a rule allowing UDP
port 41641.

*（图：Firewall rule for UDP port 41641）*

If you want to allow direct connection *between* Hetzner VMs, also add an outbound firewall rule
allowing UDP port 3478.

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-cli-ip]: /docs/reference/tailscale-cli#ip

[docs-install]: /docs/how-to/quickstart

[xt-hetzner-run]: https://console.hetzner.cloud
