---
title: "Tailscale and the OSI model"
description: "Review how Tailscale relates to the OSI model layers."
---

Last validated Jan 5, 2026

The [OSI (Open Systems Interconnection) model][xt-osi] is a theoretical framework designed to help describe how network communications function. It divides the process into seven hierarchical layers, each with specific characteristics and interactions with the layers directly above and below it. The following table summarizes each of these layers.

| #  | **Layer**                                   | **Description**                                                                                                                                                                                                                                                            |
| :- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7  | [Application layer][ar-application-layer]   | The application layer provides network services and protocols that enable applications to exchange data with other applications. It's the closest layer to end-users.                                                                                                      |
| 6  | [Presentation layer][ar-presentation-layer] | The presentation layer is a category that represents anything related to data encoding, formatting, compression, decompression, and translating data between the application layer and the network.                                                                        |
| 5  | [Session layer][ar-session-layer]           | The session layer is a category that involves anything related to sessions or connections between applications. This includes establishing, maintaining, and terminating sessions, as well as session recovery and error handling.                                         |
| 4  | [Transport layer][ar-transport-layer]       | The transport layer ensures complete data transfer with error checking and data flow control. It involves protocols like TCP and UDP.                                                                                                                                      |
| 3  | [Network layer][ar-network-layer]           | The network layer handles routing packets and managing IP addresses (IPv4 and IPv6) to facilitate data transmission between networks.                                                                                                                                      |
| 2  | [Data link layer][ar-data-link-layer]       | The data link layer manages data encapsulation (called framing), data transfer between two directly connected devices, and error detection and correction. It involves two main sub-layers: the logical link control (LLC) layer and the media access control (MAC) layer. |
| 1  | [Physical layer][ar-physical-layer]         | The physical layer involves the physical connection between devices, including cables, switches, and other network interface cards (NICs).                                                                                                                                 |

While the OSI model is a valuable tool for understanding and discussing network architectures, it rarely perfectly aligns with real-world implementations, especially when considering modern networking technologies like Tailscale.

Tailscale is primarily a network layer solution providing direct support for specific applications and a generic network layer that other applications can use. It achieves this functionality by leveraging [WireGuard][docs-wireguard], a modern virtual private network (VPN) protocol known for its efficiency and simplicity.

Tailscale leverages the WireGuard protocol, which begins at the network layer. But because it's a virtual interface that abstracts the data link and physical layers, it can be thought of as using a virtual instance of the complete OSI model, from physical to application. This abstraction creates a situation where network layers operate within other network layers. Consequently, there's ambiguity around categorizing the physical and data link layers in the context of WireGuard and Tailscale.

A significant implication of Tailscale and WireGuard operating primarily at the network layer (rather than the data link layer) is that certain network operations might behave differently than on a traditional local area network (LAN), such as broadcasting or multicasting to other devices. As a result, some protocols designed for LAN environments might behave unexpectedly when used over a Tailscale network (known as a [tailnet][docs-tailnet]).

While the OSI model provides a valuable framework for discussing network technologies like Tailscale and WireGuard, it's essential to recognize its limitations and how these modern solutions can deviate from or complicate the traditional model. Understanding these nuances is crucial to understand when implementing, designing, or [troubleshooting][docs-device-connectivity] systems that operate over a tailnet.

The following sections provide information about how Tailscale and its underlying technologies relate to the layers of the OSI model.

## Application layer

Tailscale provides network services that applications rely on and offers various features that operate at the application layer.

Tailscale features that operate at the application layer include [MagicDNS][docs-magicdns], [Tailscale SSH][docs-tailscale-ssh], [Taildrop][docs-taildrop], [Taildrive][docs-taildrive], the [web interface][docs-web-interface], the [Tailscale CLI][docs-cli], the [Tailscale API][docs-api], [logging and monitoring][docs-log-mesh-traffic], [Tailscale Serve][docs-serve], and [Tailscale Funnel][docs-funnel].

## Presentation layer

The presentation layer handles data encoding, compression, and [encryption][docs-encryption]. Tailscale encrypts packets between tailnet devices using WireGuard and infrastructure packets (such as those to the control server). For example, connections using the [disco protocol][xt-disco] for peer-to-peer NAT traversal and relay operations are encrypted. Tailscale also encrypts communication to the control plane using an internal implementation of the [Noise protocol][xt-noise].

## Session layer

At the session layer, Tailscale implements connection tracking and session management for features like subnet routing and NAT traversal using the DERP relay servers.

Tailscale also indirectly influences it by simplifying the connection process between devices, handling automatic peering between tailnet devices, and maintaining persistent connections between devices.

Tailscale features that operate at the session layer include [DERP servers][docs-derp], [subnet routers][docs-subnets], [exit nodes][docs-exit-nodes], [app connectors][docs-app-connectors], [MagicDNS][docs-magicdns], and [NAT traversal][bl-nat-traversal].

## Transport layer

Tailscale employs the WireGuard protocol at the transport layer to establish secure, encrypted tunnels between devices. WireGuard's cryptographic algorithm provides robust encryption, ensuring that data transmitted over the tailnet is secure and maintains its integrity. Tailscale manages the establishment, maintenance, and teardown of these secure connections, providing reliable data transmission even over potentially unreliable networks.

Tailscale features that operate at the transport layer include [DERP servers][docs-derp], [access control][docs-access-control] ([grants][docs-grants] and [ACLs][docs-acls]), [subnet routers][docs-subnets], [exit nodes][docs-exit-nodes], [app connectors][docs-app-connectors], [MagicDNS][docs-magicdns], and [NAT traversal][bl-nat-traversal].

## Network layer

At the network layer, Tailscale handles IP address management and packet routing. Tailscale assigns a unique [Tailscale IP address][docs-tailscale-ip-addresses] to each device in a tailnet and creates a virtual private network (VPN), ensuring that data packets arrive at the correct destination within the tailnet.

Tailscale features that operate at the network layer include packet routing, [IP address assignment][docs-ip-addresses], IPv4 and [IPv6][docs-ipv6] support, [split tunneling][docs-other-vpns], the [coordination server][docs-coordination-server], [access control][docs-access-control] ([grants][docs-grants] and [ACLs][docs-acls]), [subnet routers][docs-subnets], [exit nodes][docs-exit-nodes], and [NAT traversal][bl-nat-traversal].

## Data link layer

When you install the Tailscale client to a device, Tailscale creates a [TUN/TAP][xt-tap-tun] virtual network interface that handles data link layer traffic.

It's important to note that Tailscale intentionally abstracts away most data link layer concerns. Its design focuses on providing network layer connectivity [regardless of the underlying physical or data link layer infrastructure][bl-how-tailscale-works]. This abstraction lets Tailscale provide consistent networking capabilities across a wide range of underlying network infrastructures without directly managing the specifics of the data link layer on each device.

## Physical layer

Tailscale relies on but does not directly operate on packets or signaling at the physical layer. However, Tailscale is aware of the physical layer in specific ways. For example, Tailscale knows about the differences between Wi-Fi and cellular connections.

[ar-application-layer]: #application-layer

[ar-data-link-layer]: #data-link-layer

[ar-network-layer]: #network-layer

[ar-physical-layer]: #physical-layer

[ar-presentation-layer]: #presentation-layer

[ar-session-layer]: #session-layer

[ar-transport-layer]: #transport-layer

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[bl-nat-traversal]: https://tailscale.com/blog/how-nat-traversal-works

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-app-connectors]: /docs/features/app-connectors

[docs-cli]: /docs/reference/tailscale-cli

[docs-coordination-server]: /docs/reference/glossary#coordination-server

[docs-derp]: /docs/reference/derp-servers

[docs-device-connectivity]: /docs/reference/device-connectivity

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants]: /docs/features/access-control/grants

[docs-ip-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-ipv6]: /docs/concepts/ipv6

[docs-log-mesh-traffic]: /docs/features/logging

[docs-magicdns]: /docs/features/magicdns

[docs-other-vpns]: /docs/reference/faq/other-vpns

[docs-serve]: /docs/features/tailscale-serve

[docs-subnets]: /docs/features/subnet-routers

[docs-taildrive]: /docs/features/taildrive

[docs-taildrop]: /docs/features/taildrop

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-web-interface]: /docs/features/client/device-web-interface

[docs-wireguard]: /docs/concepts/wireguard

[xt-disco]: https://github.com/tailscale/tailscale/blob/main/disco/disco.go

[xt-noise]: http://www.noiseprotocol.org/noise.html

[xt-osi]: https://en.wikipedia.org/wiki/OSI_model

[xt-tap-tun]: https://en.wikipedia.org/wiki/TUN/TAP
