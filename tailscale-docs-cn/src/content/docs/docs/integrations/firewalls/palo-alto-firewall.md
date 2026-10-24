---
title: "Using Tailscale with your Palo Alto Networks firewall"
description: "Tailscale tries to connect your nodes directly peer-to-peer, and does so nearly all the time. Where this is not possible, Tailscale will use [DERP relay servers][docs-derp-servers] to forward traffic "
---

Last validated Sep 30, 2025

## Types of connections

Tailscale tries to connect your nodes directly peer-to-peer, and does so nearly all the time. Where this is not possible, Tailscale will use [DERP relay servers][docs-derp-servers] to forward traffic from one node to another. For more information about relays including how to determine whether relays are being used, refer to [Using Tailscale with your firewall][docs-firewalls].

The default NAT translation type in [Palo Alto Networks][xt-paloaltonetworks] firewall products uses a random source port in every connection, and makes finding a direct connection more challenging. Connections involving a Palo Alto Networks firewall using the default NAT type will be able to establish a direct connection only if the other end of the connection uses a predictable port number.

## PAN-OS 11.1.x and later: Persistent Dynamic IP and Port

> **Note:**
>
> Ensure stability and performance by referring to the list of preferred releases for PAN-OS.

PAN-OS 11.1.1 contains the translation type for NAT policies, [Persistent Dynamic IP and Port][xt-paloalto-pdipp]. In this translation type, once a client has sent a packet with a particular source port, the same NAT translated port number will be used for all destinations. This lets Tailscale to predict the port number and establish a direct connection.

To use this translation type, go to **NAT Policy Rule**, select the **Translated Packet** tab, then select the **Translation Type** option **Persistent Dynamic IP and Port**.

*（图：Palo Alto Networks interface for 'NAT Policy Rule'. The 'Translated Packet' tab is displayed. 'Translation Type' is set to 'Persistent Dynamic IP and Port'.）*

### Selective use of Persistent Dynamic IP and Port

To incorporate Persistent Dynamic IP and Port into an existing set of NAT Policies, it may not be desirable to change all connections to use it. Use of persistent translation can be made conditional for just Tailscale's direct connectivity by configuring a Service for UDP source port 41641. We recommend setting the timeout to four minutes, more closely aligning with the idle timeout for direct connections.

*（图：Palo Alto Networks interface for a new 'Service'. 'Name' is set to 'Tailscale Direct Connections'. 'Summary' is set to 'WireGuard packets sent by Tailscale clients'. 'Protocol' is set to 'UDP'. A 'Destination Port' is set. 'Source Port' is set to '41641'. 'UDP Timeout' is set to '240'.）*

The Service is added as a match criteria in the **NAT Policy Rule**, **Original Packet** tab.

*（图：Palo Alto Networks interface for 'NAT Policy Rule'. The 'Original Packet' tab is displayed. For the 'Destination Zone', the 'Service' is set to the Service that was created earlier.）*

For this to work, the `randomizeClientPort` setting described in [Using Tailscale with your firewall][docs-firewalls], must not be used. Packets will be matched only if they use the default port 41641.

## Earlier PAN-OS releases: Static IP

With older PAN-OS releases and the Dynamic IP and Port translation type, every UDP stream will translate to a random UDP port. Opening a specific port will not allow traffic through, and Tailscale cannot predict what port number to try for a direct connection.

With older PAN-OS releases it is possible to use the Static IP NAT Policy to enable one device within the protected zone to make direct connections. One might choose a subnet router or other high-traffic node to optimize. In the PAN-OS software create a NAT policy rule with **Translation Type** set to **Static IP**, instead of the default setting **Dynamic IP And Port**. This helps Tailscale figure out how to get packets through the NAT and establish direct connections.

*（图：Older Palo Alto Networks interface for 'NAT Policy Rule'. The 'Translated Packet' tab is displayed. 'Transition Type' is set to 'Static IP'.）*

[docs-derp-servers]: /docs/reference/derp-servers

[docs-firewalls]: /docs/integrations/firewalls

[xt-paloalto-pdipp]: https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-new-features/networking-features/persistent-nat-for-dipp

[xt-paloaltonetworks]: https://www.paloaltonetworks.com
