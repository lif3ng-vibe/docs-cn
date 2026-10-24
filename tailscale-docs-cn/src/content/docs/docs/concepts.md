---
title: "Technical overviews"
description: "Get in-depth technical details about Tailscale."
---

Last validated Feb 13, 2025

This section contains in-depth topics about networking and security in a Tailscale network (known as a tailnet).

## Networking and device connectivity

Tailscale modernizes your network through underlying technology to securely connect users, services, and devices.

[**VPN from the couch to the office and HQ**](/docs/concepts/all-your-offices) — Tailscale's encryption, low latency, easy configuration, and robust access controls like SSO and MFA make it an ideal modern office VPN solution for remote and distributed workforces.

[**Corporate VPN, explained**](/docs/concepts/corporate-vpn) — Secure your corporate VPN with direct device-to-device encryption, seamless identity provider integration, and flexible access controls.

[**Deprecate complex physical network (wired and Wi-Fi) security schemes**](/docs/concepts/deprecated-physical-security) — Use Tailscale to move off of complex physical networks.

[**Transparently interconnect microservices between data centers and pods**](/docs/concepts/interconnect-microservices) — Use Tailscale to transparently interconnect microservices between data centers and pods.

[**Deploy internal apps anywhere, without changing firewall settings**](/docs/concepts/internal-apps-anywhere) — Deploying servers without modifying firewall settings using Tailscale.

[**Connect to your corporate laptop no matter where you left it**](/docs/concepts/laptop-anywhere) — Connect to your corporate laptop no matter where it is.

[**Connect to colleagues' local servers from anywhere**](/docs/concepts/local-team-server) — Discover how Tailscale helps you to securely connect to colleagues and servers.

[**How Tailscale assigns IP addresses**](/docs/concepts/ip-and-dns-addresses) — Understand how Tailscale assigns stable IP addresses based on the device and authorization credentials.

[**Device connectivity**](/docs/reference/device-connectivity) — Understand connectivity between Tailscale devices.

[**DERP servers**](/docs/reference/derp-servers) — Tailscale uses Designated Encrypted Relay for Packets (DERP) servers for secure, low-latency connections in your tailnet. Customization options let you optimize device communication and NAT traversal.

[**Client-side netmap caching**](/docs/reference/client-side-netmap-caching) — Use client-side netmap caching for continuous connectivity with peers in scenarios when the control plane is temporarily unavailable.

[**CGNAT interoperability**](/docs/reference/cgnat-interoperability) — Disable the CGNAT drop rule to use Tailscale alongside networks that consume CGNAT address space.

[**IPv4 vs. IPv6 FAQ**](/docs/reference/faq/ipv6) — Answers to common questions around IPv6.

[**Add multifactor authentication to any legacy service**](/docs/reference/multifactor-auth) — Explore how Tailscale integrates with SSO providers for authentication, including for 2FA/MFA.

[**Replace site-to-site VPNs with Tailscale and WireGuard**](/docs/reference/subnet-site-to-site) — Use Tailscale for site-to-site VPN to forward network traffic between local networks.

[**WireGuard VPN with a dynamic IP address**](/docs/reference/wireguard-dynamic-ip) — How WireGuard VPN works with dynamic IP addresses.

## Security, authentication, and encryption

Tailscale enforces secure authorization and encryption for tailnet traffic based on identity.

[**Protect your SSH servers using Tailscale**](/docs/reference/ssh-over-tailscale) — Understand how Tailscale works well with SSH clients and SSH servers, improving security and offering a better user experience.

[**Node keys**](/docs/concepts/node-keys) — How Tailscale uses node keys as the mechanism for which machines can join a tailnet.

[**Tailscale encryption**](/docs/concepts/tailscale-encryption) — Review how Tailscale uses encryption.

[**Tailscale identity**](/docs/concepts/tailscale-identity) — Understand how identity is established and used in Tailscale.
