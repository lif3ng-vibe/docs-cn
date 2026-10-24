---
title: "Tailscale PAM connectors"
description: "Find documentation for Border connectors, including setup guides, conceptual explanations, and configuration reference."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

Tailscale PAM integrates VPN and Privileged Access Management (PAM) capabilities, providing a secure, identity-aware way to access private resources in your Tailscale network (known as a tailnet). At the core of this architecture is the connector, which plays a critical role in securing and managing access. You use connectors to connect your [services][docs-pam-services] to an origin.

The connector's key functions include:

* An application-aware identity proxy for PAM, enabling granular, identity-aware access to private resources. It establishes a session between your tailnet clients and your tailnet services like SSH, a database, and Kubernetes.
* A VPN gateway, ensuring secure access without exposing resources to the internet.
* A protocol-aware service, supporting session recording, policy validation, and secrets management.

Use the following guides to understand Tailscale PAM connectors and configure a connector to provide identity-aware access to resources in your tailnet.

[**Tailscale PAM connectors overview**](/docs/privileged-access-management/connectors/overview) — Understand how Tailscale PAM connectors enable privileged access to resources in your Tailscale network.

[**Install a Tailscale PAM connector**](/docs/privileged-access-management/connectors/install) — Set up a Tailscale PAM connector to provide users with privileged access to resources in your Tailscale network.

[**Install a Tailscale PAM connector with Ansible**](/docs/privileged-access-management/connectors/install-ansible) — Use Ansible to install and configure a Tailscale PAM connector on one or more hosts.

[**Tailscale PAM connector high availability**](/docs/privileged-access-management/connectors/high-availability) — Understand when to deploy highly available connectors to account for a single connector failure when connecting your users to your services.

[**Troubleshooting Tailscale PAM**](/docs/privileged-access-management/reference/troubleshooting) — Common Tailscale PAM connector error conditions, their causes, and resolution steps.

[docs-pam-services]: /docs/privileged-access-management/services
