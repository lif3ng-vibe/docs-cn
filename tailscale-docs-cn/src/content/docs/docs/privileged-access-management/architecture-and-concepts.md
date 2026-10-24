---
title: "Tailscale PAM architecture and core concepts"
description: "Get an overview of the Tailscale PAM architecture and core concepts."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

Designed for high availability and low latency, Tailscale PAM is part of the Tailscale platform, combining secure application access with Tailscale's globally distributed networking infrastructure. This gives you fast, secure access to resources in your Tailscale network from anywhere, without adding operational overhead.

The following sections describe the architecture and core concepts for Tailscale PAM.

## Services

Tailscale PAM services represent the resources in your Tailscale network that you make available to users. These can be any service that you need to securely expose, such as:

* HTTP/HTTPS
* SSH
* Databases, such as:
  * Amazon RDS
  * Elasticsearch
  * Google Cloud SQL
  * Microsoft SQL Server
  * MongoDB
  * MySQL
  * PostgreSQL
  * Snowflake
* Kubernetes
* Remote Desktop Protocol (RDP)
* Virtual Network Computing (VNC)
* Any TCP port

Tailscale PAM securely proxies user sessions to these PAM services and provides additional capabilities like credential injection and session recording/playback.

## Policies

Policies are key to managing access to your services. By default, no one has access to your services unless you explicitly grant it. Unlike traditional firewalls, which restrict access based on IP address and port number, Tailscale PAM lets you control access with more granular conditions such as:

* **Who**: The identity of the user.
* **To what**: The specific PAM services.
* **From what**: Device posture or MDM requirements.
* **When**: Always or by request.
* **Where**: IP addresses or countries.

This fine-grained control ensures that only authorized users can access your services under specific conditions.

Policies are managed in the [tailnet policy file][docs-tailnet-policy-file], which you can access in the [Access controls](https://console.tailscale.com/admin/acls) page of the Tailscale admin console.

## Sessions

A session represents the connection between a user and a service. This lets you track who accessed what resource, when, and from where. Each session log include details such as:

* User single sign-on identity.
* IP address.
* Geolocation.
* Device information.
* Connection time and duration.

Additionally, Tailscale PAM provides session recording, which means you can replay sessions for services like SSH, databases, Kubernetes, and HTTP/HTTPS, to review precisely what happened during a session. This is particularly useful for security audits or troubleshooting.

## Connectors

A Tailscale PAM connector acts as a bridge between your infrastructure and the Tailscale platform, serving as an [identity-aware][docs-tailscale-identity] application proxy. It handles critical functions like:

* **Session termination**: Securely terminates all client sessions.
* **Policy enforcement**: Evaluates policies in real-time to control access.
* **Session recording**: Captures session data for auditing and replay (SSH, database, HTTP/HTTPS).
* **Secrets injection**: Seamlessly injects credentials and authentication tokens.

A connector is deployed inside your infrastructure, ensuring that sensitive traffic remains private. Connections between clients and the connector are fully encrypted, meaning Tailscale PAM never sees your traffic. This gives you full control over your security while benefiting from the platform's ease of use.

## Tunnels

Tunnels are secure, encrypted connections between a Tailscale PAM connector and a user's device, enabling seamless access to private resources. Tunnels provide the following functions:

* **Encryption**: Tunnels use [WireGuard][xt-wireguard], a modern, high-performance VPN protocol, to create end-to-end encryption.
* **Automated management**: The Tailscale PAM platform automatically manages tunnel creation and orchestration, requiring no manual setup from the user.
* **Seamless connectivity**: Whether connecting to SSH, databases, Kubernetes, or internal web applications, tunnels provide secure, low-latency access without exposing services to the internet.

## Users, group, and identity providers

Tailscale PAM uses [Tailscale identity][docs-tailscale-identity] as the source of truth. The users and groups in your tailnet are synchronized with Tailscale PAM automatically.

### How Tailscale roles map to Tailscale PAM roles

During synchronization, each user's [Tailscale role][docs-user-roles] determines the Tailscale PAM role they receive. Tailscale PAM has three roles: **Admin**, **Read Only**, and **Client Access Only**. Tailscale roles map to Tailscale PAM roles as follows:

| Tailscale role                                 | Tailscale PAM role |
| ---------------------------------------------- | ------------------ |
| [Owner][docs-user-roles-owner]                 | Admin              |
| [Admin][docs-user-roles-admin]                 | Admin              |
| [Member][docs-user-roles-member]               | Client Access Only |
| [Billing admin][docs-user-roles-billing-admin] | Client Access Only |
| [IT admin][docs-user-roles-it-admin]           | Admin              |
| [Network admin][docs-user-roles-network-admin] | Read Only          |
| [Auditor][docs-user-roles-auditor]             | Read Only          |

Because a user's Tailscale PAM role is derived from their Tailscale role, changing that role in the Tailscale admin console updates their Tailscale PAM role automatically.

### Tailscale PAM roles

The following provides information about the Tailscale PAM roles:

* **Admin**: This role grants full privileges for Tailscale PAM management, including user, group, and service account management as well as the ability to modify all configuration and settings.
* **Client Access Only**: This role has no privileges for Tailscale PAM management. Assign this role to users who will only be clients of services in your tailnet. Access to services is managed through the tailnet policy file. Adding a user with this role to your tailnet is not enough to grant the user access to a service as a client. A user or service account must be referenced in a grant attached to the desired service for them to have access to the service.
* **Read Only**: This role has read privileges for the Tailscale PAM configuration, but no write privileges.

## Tailscale client

The [Tailscale client][co-download] offers a modern graphical user interface (GUI) for end-users, streamlining the process of connecting to services and discovering available services. In a single action, users can securely access any service for which they have permission, including servers, databases, web applications, desktops, and Kubernetes clusters.

## Browser client

The Tailscale PAM [Border0 web client](https://my.tailscale.com) provides users with secure access to services without installing the native Tailscale client on their desktop. The browser client is built on [WebAssembly][xt-webassembly] (Wasm). This clientless browser access provides quick and seamless access to your services.

The key benefits of the browser client include:

* **No installation required**: Access your resources directly from the browser.
* **User-friendly resource discovery**: A visual and intuitive interface helps users determine what they have access to.
* **Web-based access to critical services**: Use SSH, databases (MySQL/Postgres), and even RDP directly in the browser.
* **End-to-end encryption**: With Wasm-powered VPN technology, the browser client runs entirely in the browser, ensuring that connections remain fully encrypted and secure.

Users can connect to their infrastructure instantly, without requiring complex setup.

[co-download]: https://tailscale.com/download

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-user-roles-admin]: /docs/reference/user-roles#admin

[docs-user-roles-auditor]: /docs/reference/user-roles#auditor

[docs-user-roles-billing-admin]: /docs/reference/user-roles#billing-admin

[docs-user-roles-it-admin]: /docs/reference/user-roles#it-admin

[docs-user-roles-member]: /docs/reference/user-roles#member

[docs-user-roles-network-admin]: /docs/reference/user-roles#network-admin

[docs-user-roles-owner]: /docs/reference/user-roles#owner

[docs-user-roles]: /docs/reference/user-roles

[xt-webassembly]: https://webassembly.org

[xt-wireguard]: https://wireguard.com
