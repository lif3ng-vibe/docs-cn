---
title: "Tailscale encryption"
description: "Review how Tailscale uses encryption."
---

Last validated Jan 7, 2026

[Tailscale's architecture][bl-how-tailscale-works] provides end-to-end encryption for all network communications, whether devices [connect directly][docs-connection-types-direct-connections] or through a [relayed connection][docs-connection-types-relayed-connections]⎯regardless of whether they're on the same local network or across the globe. The architecture uses multiple layers of encryption across the control plane and data plane to secure device connections throughout your Tailscale network (known as a [tailnet][docs-tailnet]).

The following sections explain Tailscale's use of encryption across the [control and data planes][ar-control-and-data-planes], [during NAT traversal operations][ar-device-discovery-and-nat-traversal], and throughout the [Tailscale ecosystem][ar-encryption-across-tailscale].

> **Note:**
>
> The information here represents the current implementation state as of **December 2024** and should not be interpreted as a commitment to maintain these exact mechanisms indefinitely. The cryptographic landscape continues to evolve, and Tailscale's implementations will likely adapt to incorporate new developments and address emerging security requirements.

## Control and data planes

The control and data planes are fundamental network components that work together to manage and execute network operations. Each plane has a distinct division of responsibilities to minimize the impact of security breaches and facilitate independent scalability. The [control plane][ar-control-plane] manages how data flows, which includes policy management, routing, resource management, and signaling (session management). The [data plane][ar-data-plane] executes instructions from the control plane. These include packet forwarding, packet processing, and traffic management. In effect, the control plane makes the decisions, and the data plane executes those decisions.

> **Tip:**
>
> [Explore the control plane, data plane, and the coordination server][docs-control-data-planes].

### Control plane

In Tailscale, the control plane performs many tasks, including device coordination, authentication, access control interpretation, and packet filter computation.

Control plane communication, which includes key exchange and coordinating device connections, employs a custom [Noise IK][xt-noise-ik]-based protocol with [X25519][xt-rfc-7748-x25519] as described in [RFC7748][xt-rfc-7748]. While it can operate directly over plain TCP in environments that allow it, it also supports being wrapped in TLS when necessary for compatibility or additional security requirements.

### Data plane

Tailscale's data plane uses [WireGuard][docs-wireguard] as its primary mechanism to encrypt communication between Tailscale devices. For more about WireGuard's cryptographic design, refer to the [WireGuard white paper][xt-wireguard-whitepaper].

Tailnet devices start out using a [DERP server][docs-derp-servers] to establish a connection, then transition to a direct connection if possible. If a direct connection isn't possible, devices fall back to a relayed connection using DERP servers. DERP servers never access your unencrypted data; they only handle WireGuard packets that are already encrypted.

The connection between devices and DERP servers are authenticated using a [NaCl box][xt-nacl-box] construction on top of TLS to verify that clients own their claimed WireGuard keys. This ensures only devices with the correct private key can establish a connection with the DERP server.

## Device discovery and NAT traversal

[Tailscale's NAT traversal engine][bl-how-nat-traversal-works] implements a custom UDP protocol for path discovery, using NaCl box for authenticated encryption. This protocol operates separately from the main WireGuard data plane, and can only influence the efficiency of connections, not the security of the data they carry.

## Encryption across Tailscale

Tailscale also uses encryption for authentication, [secure node state storage][ar-secure-node-state-storage], [certificates][ar-device-certificates], and features like the [logging system][ar-log-system] and [Tailnet Lock][ar-tailnet-lock].

### Secure node state storage

Tailscale devices can be configured to [secure node state storage][docs-secure-node-state-storage] by using encryption.

### Device TLS certificates

Tailscale assists you with provisioning [TLS certificates][docs-device-certs] from [Let's Encrypt][xt-lets-encrypt] using hostnames within your [tailnet's MagicDNS domain][docs-tailnet-name-tailnet-dns-name]. These certificates ensure only authorized devices in your tailnet can present valid service identities for MagicDNS hostnames.

For example, a service advertising itself at `app.example-tailnet.ts.net` can only present a valid TLS certificate if it's an authorized device in your tailnet.

### Tailnet Lock

The [Tailnet Lock][docs-tailnet-lock] feature uses ED25519 signatures for authentication. While this feature doesn't involve encryption directly, it ensures that only devices authorized by designated approvers (which are not under Tailscale's control) can communicate with devices in your tailnet.

### Log system

All Tailscale [log data][docs-log-mesh-traffic] is sent over TLS without additional authentication or encryption.

## TLS and cryptography

Tailscale's [TLS (Transport Layer Security)][xt-transport-layer-security] implementation builds upon the Go [`crypto/tls`][xt-go-crypto-tls] package, requiring a minimum of TLS 1.2 while supporting TLS 1.3. The system uses the default cipher suite selection from the Go implementation, which includes ECDHE for [forward secrecy][xt-perfect-forward-secrecy] and AEAD schemes. The AEAD implementation can dynamically choose between AES-128-GCM or ChaCha20-Poly1305 based on the availability of hardware acceleration for AES operations.

## Compliance

Tailscale's cryptographic implementations are not [FIPS][xt-federal-information-processing-standards] compliant, and several of the primitive choices (including Curve25519, [XSalsa20][xt-salsa20], ChaCha20-Poly1305, and the Noise and WireGuard protocols) cannot be made compliant under current FIPS standards. While these implementations have been reviewed by cryptographers and are considered secure⎯in many cases, providing superior security to FIPS-approved alternatives⎯this might be a consideration for organizations requiring FIPS compliance. For more information, refer to [Tailscale FedRAMP and FIPS-140 considerations][docs-tailscale-fedramp-fips140].

[ar-control-and-data-planes]: #control-and-data-planes

[ar-control-plane]: #control-plane

[ar-data-plane]: #data-plane

[ar-device-certificates]: #device-tls-certificates

[ar-device-discovery-and-nat-traversal]: #device-discovery-and-nat-traversal

[ar-encryption-across-tailscale]: #encryption-across-tailscale

[ar-log-system]: #log-system

[ar-secure-node-state-storage]: #secure-node-state-storage

[ar-tailnet-lock]: #tailnet-lock

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[bl-how-tailscale-works]: https://tailscale.com/blog/how-tailscale-works

[docs-connection-types-direct-connections]: /docs/reference/connection-types#direct-connections

[docs-connection-types-relayed-connections]: /docs/reference/connection-types#relayed-connections

[docs-control-data-planes]: /docs/concepts/control-data-planes

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-certs]: /docs/how-to/set-up-https-certificates#provision-tls-certificates-for-your-devices

[docs-log-mesh-traffic]: /docs/features/logging

[docs-secure-node-state-storage]: /docs/features/secure-node-state-storage

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name-tailnet-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-fedramp-fips140]: /docs/reference/tailscale-fedramp-fips140

[docs-wireguard]: /docs/concepts/wireguard

[xt-federal-information-processing-standards]: https://en.wikipedia.org/wiki/Federal_Information_Processing_Standards

[xt-go-crypto-tls]: https://pkg.go.dev/crypto/tls

[xt-lets-encrypt]: https://letsencrypt.org/

[xt-nacl-box]: https://pkg.go.dev/golang.org/x/crypto/nacl/box

[xt-noise-ik]: https://noiseexplorer.com/patterns/IK/

[xt-perfect-forward-secrecy]: https://www.eff.org/deeplinks/2013/08/pushing-perfect-forward-secrecy-important-web-privacy-protection

[xt-rfc-7748]: https://www.rfc-editor.org/rfc/rfc7748.html

[xt-salsa20]: https://en.wikipedia.org/wiki/Salsa20

[xt-transport-layer-security]: https://en.wikipedia.org/wiki/Transport_Layer_Security

[xt-wireguard-whitepaper]: https://www.wireguard.com/papers/wireguard.pdf

[xt-rfc-7748-x25519]: https://www.rfc-editor.org/rfc/rfc7748.html#section-5
