---
title: "Device connectivity"
description: "Understand connectivity between Tailscale devices."
---

Last validated Jan 7, 2026

Devices within a Tailscale network (known as a tailnet) can communicate using one of three [types of connections][docs-types-of-connections]:

* Direct connections
* Relayed connections using [Tailscale Peer Relay servers][docs-peer-relays]
* Relayed connections using [DERP relay servers][docs-derp-relay-servers]

Direct connections provide the best performance because devices connect directly to each other without an intermediary, but a direct connection isn't always possible. When a direct connection isn't possible, Tailscale automatically uses a relayed connection to ensure your devices can connect regardless of the network environment. Peer relay servers are used first if available because they usually offer better performance than DERP servers. If a peer relay isn't available, connections fall back to a DERP relay connection.

The network conditions and network address translation (NAT) types of both sides of a connection determine if Tailscale uses a direct or relayed connection. You can determine the connection type a device is using with the [`tailscale status`][docs-tailscale-status] command.

## NAT types

NAT is a common method of mapping a private IP address space behind a publicly accessible IP address to deal with the effects of IPv4 address exhaustion. [Tailscale automatically traverses NAT][bl-how-nat-traversal-works] on your behalf to ensure connections between devices aren't hindered by the [complications caused by NAT][xt-rfc-3027-nat-complications].

The NAT configuration of each device in a connection determines whether Tailscale uses a direct or relayed connection. Each device is in one of the following scenarios: [no NAT][ar-no-nat], [easy NAT][ar-easy-nat], or [hard NAT][ar-hard-nat]

> **Note:**
>
> **IPv6 and NAT**
>
> NAT is most commonly employed in environments where outbound IPv4 addresses are limited. IPv6 has many more available addresses, so using NAT to preserve public-facing addresses is optional (however, there are [other reasons][xt-rfc-4380-ipv6-nat] to use NAT with IPv6). As a result, devices using IPv6 addresses are considered [easy NAT][ar-easy-nat] because they create direct connections in almost every situation.

### No NAT

In a no NAT scenario, the tailnet device isn't behind a NAT device and has a publicly accessible IP address.

### Easy NAT

Easy NAT describes a less restrictive NAT configuration that makes it easier to access devices behind the NAT device from the internet. Some examples of easy NAT configurations include [full cone NAT][xt-rfc-3489-full-cone-nat], support for port mapping protocols (such as [UPnP][xt-wikipedia-uPNP], [PCP][xt-wikipedia-PCP], or [NAT-PMP][xt-wikipedia-NAT-PMP]), support for [hair pinning][xt-rfc-5128-hairpinning], and consistent port mapping.

### Hard NAT

Hard NAT refers to a restrictive network address translation configuration that prioritizes security but makes it challenging to access devices behind the NAT from the internet. In a hard NAT scenario:

1. The tailnet device has a private address behind a NAT device.
2. When the tailnet device starts a connection, the NAT device employs various protective techniques, which might include:

   * Using complex port allocation strategies.
   * Disabling port mapping protocols (such as [UPnP][xt-wikipedia-uPNP]).
   * Implementing short timeout periods for idle connections.

These measures enhance security but can complicate establishing and maintaining connections, especially for incoming traffic.

This configuration affects how tailnet devices communicate, particularly in complex network environments.

> **Note:**
>
> **Firewalls and NAT**
>
> Stateful firewalls that block inbound UDP connections are not NAT. But, if your device has a public IP address but is behind a firewall that blocks inbound UDP connections on the port [`tailscaled`][docs-tailscaled] listens on, that device operates in the same manner as an easy NAT device.
>
> For more information on how Tailscale handles firewalls, read [How NAT traversal works][bl-how-nat-traversal-works].

## Connectivity matrix

Both sides of a connection determine if Tailscale uses a direct or relayed connection. The following table shows the possible combinations of NAT types and the expected connection type.

Client A NAT type
Client B NAT type
Expected connection

No NAT
No NAT
Direct

No NAT
Easy NAT
Direct

No NAT
Hard NAT
Direct

Easy NAT
Easy NAT
Direct

Easy NAT
Hard NAT
Relayed

Hard NAT
Hard NAT
Relayed

Tailscale uses a relayed connection if one of the following is true:

* Both devices have a hard NAT configuration.
* One device has a hard NAT configuration and the other has an easy NAT configuration.

By default, relayed connections use a DERP server. However, if you set up a [Tailscale Peer Relay server][docs-peer-relays] in your tailnet, relayed connections use the peer relay first. Peer relays exist as part of your own infrastructure and often offer better performance than DERP servers.

## Troubleshooting with `netcheck`

If a device uses a relayed connection instead of a direct connection, you can troubleshoot why using the [`tailscale netcheck`][docs-tailscale-netcheck] command. For step-by-step troubleshooting instructions, refer to [troubleshooting device connectivity][docs-troubleshoot-connectivity].

The `tailscale netcheck` command returns information about a device's current network connection. The information comes from [STUN][docs-what-is-stun] and the Tailscale client running on the device and can help you troubleshoot connectivity issues. For example, you can use the `tailscale netcheck` output to troubleshoot why a client might use a DERP relay server instead of a direct connection.

The `tailscale netcheck` output includes the following fields:

* [UDP][ar-udp]
* [IPv4][ar-ipv4]
* [IPv6][ar-ipv6]
* [Mapping varies by destination IP address][ar-mapping-varies-by-destination-ip-address]
* [Port mapping][ar-port-mapping]

### UDP

The `UDP` field indicates whether the device can send outbound UDP packets.

| **Value** | **Meaning**                                                                  | **Interpretation**                                                                          |
| --------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| True      | The [STUN][docs-what-is-stun] servers have received outbound UDP packets.    | The device has outbound connectivity, which is critical for getting direct connections.     |
| False     | The [STUN][docs-what-is-stun] servers haven't received outbound UDP packets. | The device doesn't have outbound UDP connections and likely isn't using direct connections. |

### IPv4

The `IPv4` field shows the device's public IPv4 address and port number.

| **Value**             | **Meaning**                                          | **Interpretation**                                                             |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| Yes, `<IPv4 address>` | The device has a valid IPv4 address and port number. | The device has outbound connectivity, which is crucial for direct connections. |
| No                    | The device doesn't have an IPv4 address.             | If there's no IPv4 address, the device doesn't have network connectivity.      |

### IPv6

The `IPv6` field shows whether the device supports IPv6. It includes the device's public IPv6 address and port number if it does.

| **Value**              | **Meaning**                                                                             | **Interpretation**                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yes, `<IPv6 address>`  | The device has an IPv6 address and port number.                                         | The device has outbound connectivity, which is critical for getting direct connections.                                                                         |
| No                     | The device doesn't have an IPv6 address, and the operating system doesn't support IPv6. | The device doesn't have IPv6 support and might or might not have outbound connectivity using IPv4.                                                              |
| No, but OS has support | The device doesn't have an IPv6 address, but the operating system supports IPv6.        | The device either doesn't have outbound connectivity or is using IPv4. It can still access other devices using their [tailnet IPv6 address][docs-tailnet-ipv6]. |

### Mapping varies by destination IP address

The `MappingVariesByDestIP` field states whether the device's IP address differs between [DERP][docs-derp-relay-servers] relay servers. It's the most important field to determine why a device isn't using direct connections.

| **Value** | **Meaning**                                                                                 | **Interpretation**                                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| True      | The device's IP address and port number combination varies between DERP relay servers.      | If two DERP relay servers return different results, it indicates that the device is behind a [**hard NAT**][ar-hard-nat] that randomly selects the port IP address and port number combination. Hard NAT makes it difficult for Tailscale to enable direct connections, so the device is likely using a DERP relay server. |
| False     | The device's IP address and port number combination are the same across DERP relay servers. | If all DERP relay servers return the same result, it indicates that the device either has no NAT or is behind an [**easy NAT**][ar-easy-nat]. The device is likely to use direct connections.                                                                                                                              |

When Tailscale starts a connection, it contacts multiple DERP relay servers to obtain the outbound IP address and port combination. Each DERP relay server reports this information back to Tailscale.

If the outbound IP address varies between DERP servers, it indicates that the device is behind a NAT that varies the IP addresses between destinations. This is sometimes referred to as [hard NAT][ar-hard-nat].

If the outbound IP address is the same between DERP servers, it indicates that the device is behind an [easy NAT][ar-easy-nat] or [no NAT][ar-no-nat].

It's difficult to distinguish between an easy NAT and no NAT. In the cases where a device has no NAT, the device itself has the same public IP address that it reported to the STUN servers, as well as predictable ports. In many scenarios, this means the public interface is directly attached to the client on which Tailscale is installed. However, this doesn't always mean the IP address is available locally in the operating system. In some scenarios (such as with AWS EC2), the public IP address is not available directly in the operating system but is attached directly to the host.

### Port mapping

The `PortMapping` field indicates which port mapping protocols the current device supports. If a device is using any of the following port mapping protocols, it is generally considered to be [**easy NAT**][ar-easy-nat].

| **Value** | **Meaning**                                                                     |
| --------- | ------------------------------------------------------------------------------- |
| UPnP      | The current device supports port mapping using [UPnP][xt-wikipedia-uPNP].       |
| NAT-PMP   | The current device supports port mapping using [NAT-PMP][xt-wikipedia-NAT-PMP]. |
| PCP       | The current device supports port mapping using [PCP][xt-wikipedia-PCP].         |
| False     | The current device doesn't support any of the three port mapping services.      |

The device likely cannot use direct connections if the value is false.

UPnP, NAT-PMP, and PCP are all different mechanisms that allow a device behind a NAT to open external ports to help with direct connections.

If the `PortMapping` field is false, the device cannot open external ports behind the NAT device, which makes creating direct connections difficult and likely leads to a [hard NAT][ar-hard-nat] circumstance.

If the device supports any of the three port mapping protocols, it might be able to use direct connections, even if the IP address varies between DERP relay servers (that is, [`MappingVariesByDestIP`][ar-mapping-varies-by-destination-ip-address] is true).

[ar-easy-nat]: #easy-nat

[ar-hard-nat]: #hard-nat

[ar-ipv4]: #ipv4

[ar-ipv6]: #ipv6

[ar-mapping-varies-by-destination-ip-address]: #mapping-varies-by-destination-ip-address

[ar-no-nat]: #no-nat

[ar-port-mapping]: #port-mapping

[ar-udp]: #udp

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[docs-derp-relay-servers]: /docs/reference/derp-servers

[docs-peer-relays]: /docs/features/peer-relay

[docs-tailnet-ipv6]: /docs/concepts/ipv6

[docs-tailscale-netcheck]: /docs/reference/tailscale-cli#netcheck

[docs-tailscale-status]: /docs/reference/tailscale-cli#status

[docs-tailscaled]: /docs/reference/tailscaled

[docs-troubleshoot-connectivity]: /docs/reference/troubleshooting/connectivity

[docs-types-of-connections]: /docs/reference/connection-types

[docs-what-is-stun]: /docs/reference/stun-protocol

[xt-rfc-3489-full-cone-nat]: https://www.rfc-editor.org/rfc/rfc3489.html#section-5

[xt-rfc-5128-hairpinning]: https://www.rfc-editor.org/rfc/rfc5128.html#section-5.4

[xt-rfc-4380-ipv6-nat]: https://www.rfc-editor.org/rfc/rfc4380.html

[xt-rfc-3027-nat-complications]: https://www.rfc-editor.org/rfc/rfc3027.html

[xt-wikipedia-NAT-PMP]: https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol

[xt-wikipedia-PCP]: https://en.wikipedia.org/wiki/Port_Control_Protocol

[xt-wikipedia-uPNP]: https://en.wikipedia.org/wiki/Universal_Plug_and_Play
