---
title: "Tailscale PAM connectors overview"
description: "A Tailscale PAM connector lets you establish a session between your network clients and your [services][docs-pam-services], such as SSH, a database, and Kubernetes. To use a connector, you set up and "
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

A Tailscale PAM connector lets you establish a session between your network clients and your [services][docs-pam-services], such as SSH, a database, and Kubernetes. To use a connector, you set up and run the Tailscale connector service on a device that will act as the connector. That service includes both the Tailscale connectivity components and the Tailscale PAM connector function. The Tailscale connectivity components use WireGuard for creating identity-aware [encrypted][docs-encryption] communication channels. The Tailscale PAM connector provides application-aware privileged access to your services. For information about setting up a connector, refer to [Install a Tailscale PAM connector][docs-pam-connectors-install].

Where you run a connector depends on how you can and want to connect to the target services you wish to expose over Tailscale. The connector must be able to reach your target resources through the network, or through the use of external tools as is the case with AWS Session Manager targets.

How many connectors you run depends on how many disjoint networks you have with resources that you wish to expose over Tailscale. Assuming you have *N* networks, each with resources that can only be accessed by other machines in the same network, you will need *N* connectors - one in each network. If you have a large number of networks but all resources in these networks are accessible through the internet, you might need only one connector.

For high availability services, you can run more than one connector per network pointed at the same target services.

To minimize the damage of a single connector device being compromised, you can segment your targets across multiple connectors.

## Connector token

A connector token is a credential used to authenticate a connector against the Tailscale control plane. Each token is always associated with only one connector.

While there can be multiple connector tokens active at the same time, a connector can only have one active connection at a time. Attempting to connect a connector that is already connected will result in the second connection being rejected with an error message mentioning that the connector is already connected.

Multiple active tokens for the same connector enable safer token rotations, with minimal downtime, for a given connector.

## Service

A [service][docs-pam-services] represents a resource in your tailnet that has been associated with a given connector. For example, SSH, a database, Kubernetes, and others.

## Connector logs

**Connector logs** are logs for connector events occurring locally. The following are examples of events that will emit a log entry:

* Errors and failures to operate.
* Service updates received, such as configuration changes and new or removed services.

> **Note:**
>
> In the case of a failure to authenticate a connector against Tailscale, the log will not be found in the Tailscale PAM logs. The reason for this is because a successful authentication is a prerequisite for a connector to upload its logs to Tailscale PAM.

[docs-pam-connectors-install]: /docs/privileged-access-management/connectors/install

[docs-pam-services]: /docs/privileged-access-management/services

[docs-encryption]: /docs/concepts/tailscale-encryption
