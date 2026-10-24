---
title: "Access Oracle Cloud VMs privately using Tailscale"
description: "Oracle Cloud provides Linux virtual machines, notably featuring the ARM CPU architecture. We can use Tailscale to securely access Oracle virtual machines."
---

Last validated Jan 5, 2026

Oracle Cloud provides Linux virtual machines, notably featuring the ARM CPU architecture.
We can use Tailscale to securely access Oracle virtual machines.

## Prerequisites

Before you begin this guide, you'll need a Tailscale network set up and configured with at
least one existing device. Read our [getting started guide][docs-install]
if you need help with this.

## Step 1: Set up the Tailscale client for the VM

First, [create a Virtual Machine in the OCN Console][xt-oracle-instances-create].

SSH to the system and follow the steps to
[install Tailscale on Oracle Linux][docs-install-linux].

## Step 2: Allow UDP port 41641

If at least one side of a tunnel has "easy NAT," where Tailscale can determine the UDP port
number on the far side of the NAT device, then it will make
[direct connections to minimize latency.][bl-how-tailscale-works]
We ensure that OCN nodes can make direct connections by allowing UDP port 41641 to ingress
through the firewall.

In the [Networking tab][xt-oracle-vcns] select **Virtual Cloud Networks**
select the specific VCN the VM has been created on.

*（图：Virtual Cloud Networks list）*

Select **Security Lists** in the left hand column, and the security list in use (probably
a Default).

*（图：Security lists）*

Add a Stateless ingress rule for 0.0.0.0/0 UDP port 41641.

*（图：Adding an Ingress Rule）*

## Step 3: Advertise routes from the VM

For the benefit of the *other* nodes in the tailnet we'll set up
[split DNS][docs-dns-using-settings] to allow
use of the same DNS names as are used inside of Oracle Cloud. The DNS server provided by Oracle
is 169.254.169.254, and supports hostnames of the form `instance.subnet01234567.vcn01234567.oraclevcn.com`.

We'll have our VM advertise routes for both the subnet it sits on as well as the Oracle DNS
server. For example, if the subnet address range is 10.0.0.0/24, the command would be:

```shell
tailscale set --advertise-routes=10.0.0.0/24,169.254.169.254/32 --accept-dns=false
```

> **Note:**
>
> For Oracle Cloud VMs it is generally best to let Oracle handle the DNS configuration,
> not have Tailscale override it, so we added `--accept-dns=false`.

## Step 4: Add Oracle DNS for your tailnet

In the [DNS](https://console.tailscale.com/admin/dns) page of the admin console we add a nameserver
restricted to the `oraclevcn.com` domain, pointing to the Oracle DNS server which we
made available through our VM.

*（图：Adding a Split DNS resolver for oraclevcn.com）*

Now the same hostnames which work between nodes running within Oracle Cloud will also be available
to all nodes on our tailnet.

## Step 5: Remove public SSH access

As we can now SSH to the system over the private Tailscale network, there is no reason to leave
the SSH port open on a public IP address. In the Network > Security List the SSH rule can be
removed.

*（图：Disable public SSH port.）*

## Troubleshooting

For troubleshooting information, refer to [Troubleshoot Linux cloud devices][docs-troubleshooting-oracle-cloud].

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-dns-using-settings]: /docs/reference/dns-in-tailscale#tailscale-dns-settings

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-troubleshooting-oracle-cloud]: /docs/reference/troubleshooting/cloud/oracle-cloud

[xt-oracle-instances-create]: https://cloud.oracle.com/compute/instances/create

[xt-oracle-vcns]: https://cloud.oracle.com/networking/vcns
