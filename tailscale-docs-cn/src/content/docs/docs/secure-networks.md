---
title: "Secure the network"
description: "Prevent security issues with your Tailscale network."
---

Last validated Jan 5, 2026

Use Tailscale security features to help prevent security issues with your Tailscale network (known as a tailnet).

## Manage access policy

Access control policies let you precisely define permissions for users and devices in your tailnet. Permissions are defined using [tailnet policy file syntax][docs-policy-syntax] and are stored in the [tailnet policy file][docs-terminology-and-concepts-policy].

[**Access control**](/docs/features/access-control) — Understand the options available for access control in Tailscale.

## Manage client access

Tailscale provides features for securely accessing devices in your tailnet, and for managing the Tailscale client application.

### Tailscale SSH

Use Tailscale SSH to let Tailscale manage the authentication and authorization of SSH connections for your tailnet. You can use SSH as you may have done previously, and you can optionally verify high-risk connections by using check mode.

[**Tailscale SSH**](/docs/features/tailscale-ssh) — Use Tailscale SSH to manage the authentication and authorization of SSH connections in your tailnet.

### HTTPS certificates

Connections between tailnet devices are end-to-end encrypted. Items such as browsers and web APIs are not aware of that, however. They can warn users or disable features based on the fact that HTTP URLs to your tailnet services look unencrypted. To provide your servers with TLS certificates, you can enable HTTPS.

[**Enabling HTTPS**](/docs/how-to/set-up-https-certificates) — Configure HTTPS for devices in your Tailscale network.

### Mobile device management

If you are using a mobile device management (MDM) solution, you can apply a set of system policies across devices that are running Tailscale. These system policies can be used to customize the behavior of the Tailscale client to match the policies and use cases of your organization.

[**Customize Tailscale using system policies**](/docs/features/tailscale-system-policies) — A list of configuration keys you can use to customize the Tailscale client using system policies, including MDM.

## Manage tailnet security

Tailscale provides features for helping secure your tailnet, including tailnet configuration.

### Tailnet Lock

Tailnet Lock provides an additional level of security where new nodes added to your tailnet must be signed by a trusted Tailnet Lock key before they are allowed to connect to other nodes. Specifically, Tailnet Lock lets you cryptographically verify the public keys distributed by the Tailscale coordination server before trusting them for network connectivity.

[**Tailnet Lock**](/docs/features/tailnet-lock) — Ensure that no node joins your tailnet unless trusted nodes in your tailnet sign the new node.

### Security

Tailscale provides recommendations for helping to secure your tailnet.

[**Best practices to secure your tailnet**](/docs/reference/best-practices/security) — Discover best practices for keeping your Tailscale network secure.

### Shared responsibility

Securing a virtual private network requires both the provider and the user to share in the burden of responsibility.

[**Shared responsibility model**](/docs/concepts/shared-responsibility) — Understand the responsibilities for protecting your network.

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-terminology-and-concepts-policy]: /docs/reference/glossary#tailnet-policy-file
