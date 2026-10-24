---
title: "About WireGuard"
description: "Discover how Tailscale builds on WireGuard to offer single sign-on (SSO) and other capabilities."
---

Last validated Jan 5, 2026

[WireGuard][xt-wireguard] is an open source network tunneling protocol for creating [encrypted][docs-encryption] communication channels. It's designed to replace other VPN protocols, such as OpenVPN and IPsec, as a simpler and lighter-weight alternative. The protocol maintains concurrent connections with minimal overhead per session. Independent [cryptographers have reviewed][xt-wireguard-analysis] the WireGuard protocol, and security auditors have examined the code implementation, identifying and allowing for the correction of minor issues. For more about WireGuard's technical details, review their [whitepaper][xt-wireguard-whitepaper].

Tailscale builds on top of WireGuard and adds additional components such as [NAT traversal][bl-how-nat-traversal-works], TCP transport capabilities, and [access control policies][docs-access-control]. Tailscale's implementation differs from standard WireGuard implementations in several ways. For example, where WireGuard provides encrypted tunnels between endpoints, Tailscale constructs a [mesh network][ln-understanding-mesh-vpns] topology with additional network services and authentication mechanisms. Tailscale maintains a fork of the open source [`wireguard-go`][xt-gh-tailscale-wireguard-go] package, which comes with Tailscale clients.

> **Note:**
>
> Tailscale has received reports of technical conflicts when running [Tailscale concurrent with other WireGuard-based VPNs][docs-other-vpns], such as [Mullvad VPN][xt-mullvad]. These conflicts stem from how each implementation handles network interfaces and routing tables, requiring specific configuration for concurrent operation.

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[docs-access-control]: /docs/features/access-control

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-other-vpns]: /docs/reference/faq/other-vpns

[ln-understanding-mesh-vpns]: https://tailscale.com/learn/understanding-mesh-vpns

[xt-gh-tailscale-wireguard-go]: https://github.com/tailscale/wireguard-go

[xt-mullvad]: https://mullvad.net/en

[xt-wireguard-analysis]: https://eprint.iacr.org/2018/080.pdf

[xt-wireguard-whitepaper]: https://www.wireguard.com/papers/wireguard.pdf

[xt-wireguard]: https://www.wireguard.com
