---
title: "Using OPNsense with Tailscale"
description: "Set up a Tailscale VPN on OPNsense. Get secure communication across your devices without the need for complex configuration."
---

Last validated Dec 4, 2025

[OPNsense][xt-opnsense] is an open source router and firewall platform built using FreeBSD. Tailscale can be installed on an OPNsense platform, joining it to your WireGuard-based mesh network.

> **Note:**
>
> OPNsense is a community supported platform for Tailscale.
>
> As of OPNsense v24.711, an `os-tailscale` community plugin is available.
>
> It can be installed through the GUI. **System** > **Firmware** > **Plugins**. Check the box **Show community plugins**.
>
> This plugin does not require any of the following command-line steps.

## Installation

Connect to the console of OPNsense using SSH or another preferred method. Select option `8) Shell` and ensure you are the root user.

First we must download the ports tree. More information about this can be found in the OPNsense [documentation][xt-opnsense-included], and the FreeBSD ports [documentation][xt-freebsd-install].

```shell
# opnsense-code ports
Updating OPNsense repository catalogue...
...
Cloning into '/usr/ports'...
...
Your branch is up to date with 'origin/master'.
```

Make sure to run `opnsense-code ports` again even if you have done so previously, to update the ports tree to current versions. The version of Tailscale in the FreeBSD ports is periodically updated for new releases. More information on updates can be found below.

Once the ports tree is downloaded, execute the following steps as root to install Tailscale.

```shell
# cd /usr/ports/security/tailscale
# make install
```

Once installed, start and enable the `tailscaled` daemon and verify that Tailscale is working properly with `tailscale version`.

```shell
# service tailscaled enable
# service tailscaled start
# tailscale version
root@opnsense:~ # tailscale version
1.56.1
  go version: go1.21.5
```

## Connect

To add the OPNsense machine as a node in your tailnet run the following command as root:

```shell
# tailscale up
To authenticate, visit:
    https://tailscale.com/a/abc123abc123
```

You'll be asked to authenticate to Tailscale in your browser. This is an appropriate time to specify other useful options such as [subnet-routes][docs-subnets], [exit nodes][docs-exit-nodes], and so on.

Once started, Tailscale should appear in the list of interfaces in the OPNsense UI. It can be used in firewall rules and other OPNsense functions.

*（图：The OPNsense UI with the TLSCL interface enabled.）*

## Configure firewall rules

After Tailscale connects, its interface appears in the OPNsense interface list, but OPNsense does not assign it automatically. Until you assign the interface and add a firewall rule, the default firewall policy blocks incoming Tailscale traffic to the OPNsense host, including ping, SSH, and web UI access. To confirm this, go to **Firewall** > **Log Files** > **Live View** and look for traffic on the `tailscale0` interface that is blocked by the default deny policy.

To permit tailnet traffic to reach the OPNsense host, assign the interface and add a firewall rule.

1. Go to **Interfaces** > **Assignments**.
2. In the **New interface** section, select `tailscale0` from the device drop-down menu, then select **+** to add it.
3. Select the new interface to edit it. Select **Enable interface**, enter a description such as `tailscale`, then select **Save**.
4. Select **Apply changes**.
5. Go to **Firewall** > **Rules** and select the Tailscale interface.
6. Select **Add** to create a rule. Set **Action** to **Pass**, enter a description, then select **Save**.
7. Select **Apply changes**.

After you apply the rule, devices in your tailnet can reach the OPNsense host over Tailscale.

> **Note:**
>
> A pass rule that matches all traffic lets any device in your tailnet reach the OPNsense host. To restrict access, create a **Firewall** > **Aliases** entry containing the Tailscale IP addresses of the devices that require access, then use that alias as the rule source.

## Update Tailscale

To update Tailscale perform the following steps as the root user:

```shell
# opnsense-code ports
# cd /usr/ports/security/tailscale
# make deinstall
# make clean
# make install
# service tailscaled restart
```

This might take a few minutes depending on the strength of the CPU in use. Verify Tailscale updated using `tailscale version`. Sometimes it is necessary to restart the tailscaled service with `service tailscaled restart`.

## Direct Connections for LAN Clients

As a router/firewall, OPNsense may also be providing internet connectivity for LAN devices which themselves have a Tailscale client installed. The NAT implementation in OPNsense is an [Endpoint-Dependent Mapping, or "hard" NAT][bl-how-nat-traversal-works], which means that LAN devices have difficulty making direct connections and often resort to [DERP Relays][docs-derp-servers].

There are a few options in which OPNsense can enable devices on the LAN to make direct connections to remote Tailscale nodes. Static NAT port mapping and NAT-PMP.

## Static NAT port mapping

By default, OPNsense software rewrites the source port on all outgoing connections to enhance security and prevent direct exposure of internal port numbers.

Static port mapping in OPNsense involves creating a fixed association between a specific external port number and an internal IP address and port, allowing incoming traffic to be directed to the correct destination within the local network.

Go to **Firewall > NAT**, **Outbound** tab. Select **Hybrid Outbound NAT rule generation**. Select **Save**. Select **↑ Add** to create a new NAT rule to the top of the list.

Configure the rule to match UDP traffic as shown below. Note, for each rule, select the appropriate **Address Family** (IP version), **IPv4** for one and **IPv6** for the other.

*（图：Example Static NAT port mapping configuration in Firewall : NAT : Outbound）*

Check **Static Port** in the **Translation** section of the page. Select **Save**. Select **Apply Changes**.

In your ACLs, set [randomizeClientPort][docs-policy-syntax-network-policy-options].

```json
{
  // Other configurations
  "randomizeClientPort": true
}
```

From the command line, use `tailscale ping node` to verify the connection path between two nodes. Also useful in this scenario is `tailscale netcheck`.

## NAT-PMP

NAT-PMP is a protocol by which LAN clients can ask the firewall to temporarily create port mappings.

Enable the UPnP service and **Allow NAT-PMP Port Mapping** in **Services** > **Universal Plug and Play**. Only NAT-PMP is needed for Tailscale's use, but enabling UPnP can be helpful for other applications like gaming consoles.

*（图：Enabling Allow NAT-PMP Port Mapping in Services : Universal Plug and Play : Settings）*

## Further reading

Setting up [subnet routing][docs-subnets] or acting as an [exit node][docs-exit-nodes] may be of interest for a router using OPNsense.

## Special thanks

Special thanks to GitHub user [@newmy-de][xt-gh-newmy-de] who helped us provide these installation instructions.

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-policy-syntax-network-policy-options]: /docs/reference/syntax/policy-file#network-policy-options

[docs-derp-servers]: /docs/reference/derp-servers

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-subnets]: /docs/features/subnet-routers

[xt-freebsd-install]: https://docs.freebsd.org/en/books/handbook/ports

[xt-gh-newmy-de]: https://github.com/newmy-de

[xt-opnsense-included]: https://docs.opnsense.org/manual/software_included.html

[xt-opnsense]: https://opnsense.org
