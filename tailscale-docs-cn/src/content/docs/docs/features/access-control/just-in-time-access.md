---
title: "Just-in-time access"
description: "Tailscale provides several ways for you to provide just-in-time (JIT) access to resources in your Tailscale network (known as a tailnet). For example, you can provide an appropriate level of access to"
---

Last validated May 2, 2025

Tailscale provides several ways for you to provide just-in-time (JIT) access to resources in your Tailscale network (known as a tailnet). For example, you can provide an appropriate level of access to an engineer for a limited amount of time so they can perform maintenance on a server.

JIT access works in conjunction with access control policies to determine access for users and devices in your tailnet. You manage access control policies in the [tailnet policy file][docs-tailnet-policy-file]. For JIT access, you use automation to provide access to someone for a limited time, allowing them to perform a task. There are a few ways to achieve this.

## Provide just-in-time access

Tailscale lets you manage JIT access to network resources based on device posture attributes, which are key-value pairs of data attached to devices that can be used as part of the tailnet policy file.

[**Use device posture for just-in-time access**](/docs/features/tailscale-accessbot-jit) — Use device posture for just-in-time access to resources in your tailnet.

Tailscale partners with other companies for JIT access workflow integrations.

[**Third-party integrations for JIT access**](/docs/integrations/jit-access) — Use third-party integrations for just-in-time access, also known as on-demand access, to your Tailscale network.

The Tailscale API lets you manage tailnet policy files, including for JIT access. For details, refer to the [Policy File][co-api-policy-file] section in the Tailscale API documentation.

[**Tailscale API**](/docs/reference/tailscale-api) — Explore the Tailscale application programming interface (API).

Tailscale lets you manage access to network resources based on [group membership][docs-user-group-provisioning-sync] by syncing groups from SCIM-integrated identity providers to Tailscale.

[**Supported SSO identity providers**](/docs/integrations/identity) — Tailscale works on top of the IdP or SSO provider you already use. Leverage the capabilities of these providers for secure access, including passkeys, 2FA, and MFA.

[co-api-policy-file]: https://tailscale.com/api#tag/policyfile

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning-sync]: /docs/features/user-group-provisioning#syncing-group-membership
