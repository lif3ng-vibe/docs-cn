---
title: "Terminology and concepts"
description: "Review Tailscale terminology and concepts."
---

Last validated Jan 12, 2026

## Access control lists

An [access control list][docs-acls] (ACL) manages system access using rules in the [tailnet policy file][ar-tailnet-policy-file]. You can use ACLs to filter traffic and enhance security by managing who and what can use which resources.

## tags

A [tag][docs-tags] lets you assign an [identity][ar-identity-provider] (that's separate from human users) to [devices][ar-device]. You can use tags in your [access rules][docs-acls] to restrict access.

## admin console

The admin console is the central location to manage your Tailscale network (known as a [tailnet][ar-tailnet]). You can manage devices on your network, users and their permissions, and settings such as key expiry. The admin console also informs you if an update to the Tailscale client is available for your device. When you make changes from the admin console, the [coordination server][docs-coordination-server] updates the changes to your tailnet immediately.

You can access the admin console at [admin console](https://console.tailscale.com/admin).

## API

API is an acronym for application programming interface. APIs define a set of rules to interact with an application or service programmatically. The [Tailscale API][co-api] lets you manage your Tailscale account and tailnet.

## CLI

CLI is an acronym for command line interface. The Tailscale [CLI][docs-cli] includes a robust set of commands with functionality that GUI applications might not have. The Tailscale CLI is installed automatically when you install Tailscale on Linux, macOS, or Windows.

## Client

The Tailscale client is a software application that runs on a device so the device can join and participate in a [tailnet][ar-tailnet]. The client uses the [WireGuard][ar-wireguard] protocol to create encrypted peer-to-peer connections. The client is available for multiple operating systems. Much of the client code is [open source][co-open-source].

## Coordination server

A [coordination server][docs-coordination-server] is a central server that maintains a connection to all devices in your [Tailscale network][ar-tailnet]. It manages [encryption][docs-encryption] keys, network changes, access policy changes, and maintains a connection to all devices in your Tailscale network. The coordination server is part of the [control plane][docs-control-plane], not the [data plane][docs-data-plane]. It avoids being a performance bottleneck by not relaying traffic between devices.

## Device

A device is anything other than a user. It can be physical or virtual and sends, receives, or processes data on your Tailscale network.

## Device key

A device key is a unique public and private key pair for a specific [device][ar-device]. More than one user can use a device key, but each device can only have one device key. The combination of a specific user with a device key represents a unique device.

## Firewall

A firewall limits what network traffic can pass between two points. Firewalls can be hardware-based or software-based. Tailscale includes a built-in firewall, defined by the domain's [access rules][docs-acls].

## Full tunnel

With a traditional virtual private network (VPN), full tunnel describes a configuration where all traffic from a client is sent through the VPN, including internet-bound traffic. With Tailscale, you can route all internet-bound traffic by setting a device on your network as an [exit node][docs-exit-nodes]. If your clients are configured to use an exit node and also have routes or connectivity to other Tailscale [devices][ar-device], [subnet routers][docs-subnets], or [app connectors][docs-app-connectors], then Tailscale will still operate as a [split tunnel][ar-split-tunnel] VPN, routing traffic directly to each endpoint without routing traffic through the exit node first.

## Identity Provider

An identity provider is a method for users to authenticate to a [tailnet][docs-tailnet]. Examples of [identity providers][docs-sso-providers] include Google, Okta, and Microsoft. Tailscale is not an identity provider but relies other identity providers for authentication.

## Key expiry

Key expiry is the end of the validity period for a cryptographic key. An expired key can no longer encrypt or decrypt data, nor authenticate a device to a Tailscale network.

Using Tailscale means you never have to manage [encryption][docs-encryption] keys directly. Tailscale automatically expires keys and requires them to be regenerated at regular intervals. You can disable key expiry for long-lived devices from the admin console.

## MagicDNS

[MagicDNS][docs-magicdns] automatically registers memorable hostnames for devices in your Tailscale network. It also extends and improves DNS functionality.

## NAT traversal

NAT is an acronym for [network address translation][xt-wikipedia-nat]. [NAT traversal][bl-how-nat-traversal-works] is a way to connect devices across the internet through barriers such as firewalls. Most internet devices can't talk to each other because of firewalls and devices that do network address translation. [NAT traversal works][bl-how-tailscale-control-plane] around these barriers, allowing [data to traverse the network][ar-nat-traversal].

## Network topology

A network topology is an arrangement of devices in a network. It shows the connections between them. Examples of network topologies include star, bus, hub-and-spoke, mesh, and hybrid.

Traditional virtual private networks (VPNs) use a [hub-and-spoke topology][bl-tailscale-how-hub-spoke]. Each device communicates with another in this setup by sending all traffic through a central gateway device. Tailscale operates as a [mesh topology][bl-how-tailscale-mesh-networks] where each device can talk directly to others using [NAT traversal][ar-nat-traversal].

## Node

A node is a combination of a user and a [device][ar-device].

## Overlay network

An overlay network is a virtual network built on top of the [underlay][ar-underlay-network] network, where nodes communicate using logical addresses and encrypted tunnels independent of the underlay's addressing or topology. Tailscale forms an overlay network (the [tailnet][ar-tailnet]) that gives each node a stable identity and IP address, regardless of how the underlay changes.

## Peer

A peer is another [node][ar-node] that your device is trying to talk to. A peer might or might not be in the same domain.

## Relay

A relay is an intermediary server that passes data between two or more devices in a network. Tailscale uses a special type of globally distributed relay server called [Designated Encrypted Relay for Packets (DERP)][docs-derp-servers]. DERP relay servers function as a fallback to connect devices when NAT traversal fails.

## Split tunnel

Split tunnel, as opposed to [full tunnel][ar-full-tunnel], describes a VPN configuration where only some traffic (specific IP ranges, domains, or subnets) is sent through the VPN, while all other traffic goes directly to the internet by using the device's local internet gateway. In Tailscale, this means only traffic destined for other Tailscale [devices][ar-device], [subnet routers][docs-subnets], or [app connectors][docs-app-connectors] uses the tailnet, leaving general internet traffic untouched.

## SSO

SSO is an acronym for [single sign-on][docs-sso-providers]. Single sign-on lets users log in to one site using the identity of another.

## Tailnet

A [tailnet][docs-tailnet] is another term for a Tailscale network, which is an interconnected collection of users, devices, and resources. The network has a [control plane][docs-control-plane] and a [data plane][docs-data-plane] that work in unison to manage access and send data between devices.

There are personal and organization tailnets. A personal tailnet is a shared domain single-user tailnet (like `gmail.com`). An organization tailnet is a custom domain tailnet (like `example.com`),

## Tailnet policy file

The tailnet policy file stores your Tailscale network's access rules, along with other tailnet configuration items. It uses [human JSON (HuJSON)][xt-gh-tailscale-hujson] and conforms to the [Tailscale policy syntax][docs-policy-syntax].

## Tailscalar

A Tailscalar is a Tailscale employee.

## Tailscale IP address

A [Tailscale IP address][ar-tailscale-ip-address] is a [unique IP address][docs-ip-and-dns-addresses] assigned to each device in your Tailscale network. It's always in the form `100.x.y.z` (for example, `100.100.123.123`). It stays the same even when switching between your home internet connection, cellular networks, or coffee shop Wi-Fi networks.

## Tunnel

In networking, a tunnel is an encapsulated connection between one or more points in a network. It lets users, devices, or resources communicate securely over a public data network.

## Underlay network

An underlay network is the physical or existing IP network over which Tailscale runs, such as your home Wi-Fi, office LAN, or your cloud or data center's internet connection. Tailscale uses this underlay for actual packet transport, creating an [overlay network][ar-overlay-network] on top of the underlay that handles encryption, NAT traversal, access controls, and many more features.

## WireGuard

[WireGuard][xt-wireguard] is the underlying cryptographic protocol that Tailscale uses.

[ar-device]: #device

[ar-full-tunnel]: #full-tunnel

[ar-identity-provider]: #identity-provider

[ar-nat-traversal]: #nat-traversal

[ar-node]: #node

[ar-overlay-network]: #overlay-network

[ar-tailnet-policy-file]: #tailnet-policy-file

[ar-tailnet]: #tailnet

[ar-tailscale-ip-address]: #tailscale-ip-address

[ar-split-tunnel]: #split-tunnel

[ar-underlay-network]: #underlay-network

[ar-wireguard]: #wireguard

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-control-plane]: https://tailscale.com/blog/how-tailscale-works#the-control-plane-key-exchange-and-coordination

[bl-how-tailscale-mesh-networks]: https://tailscale.com/blog/how-tailscale-works#mesh-networks

[bl-tailscale-how-hub-spoke]: https://tailscale.com/blog/how-tailscale-works#hub-and-spoke-networks

[co-api]: https://tailscale.com/api

[co-open-source]: https://tailscale.com/opensource

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors/how-to/setup

[docs-cli]: /docs/reference/tailscale-cli

[docs-control-plane]: /docs/concepts/control-data-planes#control-plane

[docs-coordination-server]: /docs/concepts/control-data-planes#coordination-server

[docs-data-plane]: /docs/concepts/control-data-planes#data-plane

[docs-derp-servers]: /docs/reference/derp-servers

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-magicdns]: /docs/features/magicdns

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet]: /docs/concepts/tailnet

[xt-gh-tailscale-hujson]: https://github.com/tailscale/hujson

[xt-wikipedia-nat]: https://en.wikipedia.org/wiki/Network_address_translation

[xt-wireguard]: https://www.wireguard.com
