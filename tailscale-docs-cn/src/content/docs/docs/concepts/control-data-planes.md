---
title: "Control and data planes"
description: "Understand the control plane and data planes in Tailscale."
---

Last validated Jan 5, 2026

Modern networks separate their operations into two distinct planes that work together: the [control plane][ar-control-plane] and the [data plane][ar-data-plane]. These planes maintain constant communication, and the separation helps organize network operations and makes networks more manageable, efficient, and reliable.

In a Tailscale network (known as a [tailnet][docs-tailnet]), the control plane operates through the Tailscale [coordination service][ar-coordination-server], while the data plane runs on each tailnet device.

## Control plane

The control plane is a vital part of a network that manages how data flows through the [data plane][ar-data-plane]. You can think of the control plane as an air traffic controller; it oversees the entire network and makes high-level decisions. It performs many tasks, including identity management, network configuration, connection coordination, and policy management.

* Authentication and identity functions of the control plane include validating device identities, maintaining [access control][docs-access-control] policies, tracking device registration and removal, and managing device authorization states.
* Network setup and maintenance functions of the control plane include distributing subnet routes, configuring DNS settings, managing [IP address assignments][docs-ip-and-dns-addresses], and updating network configurations.
* Connection coordination functions of the control plane include managing [NAT traversal][bl-how-nat-traversal-works], peer discovery, distributing device information, selecting optimal [DERP][docs-derp-servers] regions, and maintaining device state information.
* Policy management functions of the control plane include enforcing [access control][docs-access-control] policies, managing [subnet routing][docs-subnets] rules, implementing [exit node][docs-exit-nodes] configurations, and managing permissions.

### Coordination service

The Tailscale coordination service manages [control plane][ar-control-plane] operations and maintains a connection to all tailnet devices. It handles essential functions including device discovery, authentication, [key distribution][bl-tailscale-key-management], and policy enforcement. It also distributes routing configurations and access control policies to Tailscale clients on tailnet devices, which convert these high-level instructions into the lowest-level configuration the [data plane][ar-data-plane] can execute.

Additionally, the coordination service enables NAT traversal by managing endpoint information between devices and selecting optimal [DERP][docs-derp-servers] regions when [direct connections][docs-connection-types] aren't possible.

> **Note:**
>
> If the [coordination service becomes unavailable][docs-offline-coordination-server], tailnet devices can still communicate with pre-established connections and use cached network policies. However, they won't be able to establish new connections, alter their keys, or retrieve network policy updates until the coordination service comes back online. This is because Tailscale doesn't route any traffic through the coordination service, device keys are stored locally, and network policies are cached locally.

#### Device discovery and NAT traversal

One of the core functions of the coordination service is to maintain a registry of all devices in a tailnet. It also collects and manages device information, such as IP addresses, Tailscale client versions, public keys, location, and operating systems. The coordination service uses this information to populate device data on the Tailscale admin console, select [DERP servers][docs-derp-servers], apply [device posture][docs-device-posture] policies, and facilitate connections.

#### State, policies, and configurations

The Tailscale coordination service collects and distributes this device and network information across the tailnet. This information includes:

* Device metadata, such as [IP addresses][docs-ip-and-dns-addresses], Tailscale client versions, operating systems, and geographic location.
* Device public keys and certificates.
* Network configurations, such as [DNS][docs-dns] name servers and preferred DERP servers.
* Policies, such as access control policies, [device posture][docs-device-posture] policies, and other security policies.

Keeping this information on the coordination service helps ensure things like facilitating [NAT traversal][bl-how-nat-traversal-works] through DERP servers, keeping configurations in sync across the tailnet, ensuring enforcement of access control policies, and surfacing data on the admin console.

#### Authentication, authorization, and key distribution

While a traditional implementation of a centralized coordination service might manage authentication, Tailscale's coordination service does not handle user authentication. Authentication is outsourced to an [OAuth 2.0][docs-oauth-clients], [OpenID Connect][docs-sso-custom-oidc], or [identity provider][docs-sso-providers], which lets you maintain user accounts through an existing provider such as GitHub or Google. The coordination service does, however, manage authentication tokens and their lifecycles and enforce [access control][docs-access-control] policies.

All device public keys are stored on the coordination service. The coordination service only permits devices to access the public keys of devices and resources they're allowed to access. As a result, devices in a tailnet aren't aware of other devices unless you grant them access.

## Data plane

The data plane operates on individual devices within your tailnet, handling the actual movement of encrypted data between devices using the [WireGuard][docs-wireguard] protocol.

The data plane manages packet [encryption][docs-encryption], applies routing rules from the [control plane][ar-control-plane], and handles packet forwarding. It also establishes connections, continuously monitors connection health, manages bandwidth usage, and implements failover mechanisms when network conditions change.

* Device-to-device communication functions of the data plane include establishing WireGuard tunnels, encrypting and decrypting traffic, managing direct connections between devices, implementing UDP-based communication, and handling connection migration.
* Packet management functions of the data plane include forwarding encrypted packets between devices, applying routing rules to traffic, implementing packet filtering based on access control policies, managing packet queuing and prioritization, and handling packet fragmentation and reassembly.

[ar-control-plane]: #control-plane

[ar-coordination-server]: #coordination-server

[ar-data-plane]: #data-plane

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-tailscale-works

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-connection-types]: /docs/reference/connection-types

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-offline-coordination-server]: /docs/reference/coordination-server-down

[docs-sso-custom-oidc]: /docs/integrations/identity/custom-oidc

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tailnet]: /docs/concepts/tailnet

[docs-wireguard]: /docs/concepts/wireguard
