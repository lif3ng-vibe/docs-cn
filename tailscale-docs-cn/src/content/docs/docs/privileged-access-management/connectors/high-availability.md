---
title: "Tailscale PAM connector high availability"
description: "The Tailscale PAM provisioning system is designed with redundancy and high availability in mind."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

The Tailscale PAM provisioning system is designed with redundancy and high availability in mind.

[Connectors][docs-pam-connectors] and [services][docs-pam-services] have a many-to-many relationship. A single connector can provide access to multiple services. A single service can be served by multiple connectors. We recommend configuring at least two connectors for every production service. Multiple connectors provide high availability by allowing the service to remain accessible if a connector or its host becomes unavailable.

You can deploy connectors in different availability zones, cloud compute regions, or even cloud compute provider infrastructures. For example, you could have one cloud region that has three connectors that service ten services. Use your availability requirements to decide where and how many connectors you should deploy.

## What happens when a connector fails?

All client devices are peered with all *relevant* connectors at all times, even if no traffic is being sent to them. When a connector is shut down or when the Tailscale control plane detects that it is offline, all client devices will be signalled regarding the event. If your services are served by another connector that is available, the clients will automatically use that connector.

## What happens to existing connections when a connector goes down?

For services such as SSH, database, HTTP/HTTPS, or TCP servers, your current session ends, but a reconnect (or automatic reconnect, depending on the client) transparently uses the next available connector.

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-services]: /docs/privileged-access-management/services
