---
title: "OAuth on Tailscale"
description: "Authorize tools and integrations to act upon your tailnet through OAuth."
---

Last validated Jun 30, 2026

Tailscale supports OAuth for tools and integrations that act upon your tailnet. Two mechanisms are available, and they differ in the identity that resulting actions carry:

* [OAuth clients][docs-oauth-clients] use the client credentials flow. They create tag-owned resources tied to a service identity, and are suited to automation that runs without a person present.
* [OAuth apps][docs-oauth-apps] use the authorization code flow. A user completes a consent screen, and the resulting authorization carries that individual user's identity.

Explore the following topics to work with OAuth on Tailscale:

[**OAuth clients**](/docs/features/oauth-clients) — Use OAuth clients to provide ongoing access to the Tailscale API.

[**OAuth apps**](/docs/features/oauth-apps) — Build internal tools that act on behalf of individual users through a standard OAuth 2.0 authorization code flow, so each action carries the consenting user's identity.

[**Device provisioning with OAuth apps**](/docs/features/oauth-apps/device-provisioning) — Build internal tools that provision tailnet devices on behalf of individual users with a standard OAuth authorization code flow, so each device carries the consenting user's identity.

[docs-oauth-apps]: /docs/features/oauth-apps

[docs-oauth-clients]: /docs/features/oauth-clients
