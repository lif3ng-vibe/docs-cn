---
title: "Control AI access"
description: "Manage who can access Aperture and which models they can use."
---

Last validated Jul 30, 2026

Aperture uses [Tailscale's identity layer][docs-tailscale-identity] to automatically authenticate users. Control which users can reach the Aperture gateway through tailnet access control rules, then use [Aperture grants][docs-aperture-grants] to define which models each user or group can access. To reference Tailscale groups in grants, enable [visible groups][docs-visible-groups]. Aperture is deny-by-default: without grants, users can connect but cannot access any models.

Grants also govern access to MCP tools, resources, and connectors. Aperture uses a three-layer authorization model -- configuration defines what is available, grants control who can access it, and credentials handle upstream authentication -- that applies uniformly to models and connectors. For details on granting MCP and connector access, refer to [grant access to MCP tools][docs-grant-mcp-tool-access] and [connectors][docs-aperture-connectors].

Connector grants can name a connector by ID or match a group of connectors by label. Deny-by-default extends to Aperture's own built-in tools, which reach users through a `label:system` grant in the default configuration rather than through an exception. To group your own connectors the same way, refer to [grant connector access by label][docs-grant-by-label].

For background on how identity works, refer to [how Aperture works][docs-how-aperture-works]. To understand the grants model itself, including deny-by-default access and precedence, refer to [how Aperture grants work][docs-how-grants-work].

[**How Aperture grants work**](/docs/aperture/how-grants-work) — Understand the Aperture grants model, including deny-by-default access, additive allow-only rules, capability matching, and how Aperture resolves precedence when multiple grants apply.

[**Grant access to models**](/docs/aperture/how-to/grant-model-access) — Configure Aperture grants to control which models each user or group can access.

[**Grant access to MCP tools**](/docs/aperture/how-to/grant-mcp-tool-access) — Configure Aperture grants to control which connector capabilities users can access, including MCP tools, resources, templates, and HTTP proxy access.

[**Grant connector access by label**](/docs/aperture/how-to/grant-connector-access-by-label) — Label Aperture connectors and grant access by label so a single grant covers every connector in a group instead of naming each connector ID.

[**MCP server proxying**](/docs/aperture/mcp-server) — Aggregate tools and resources from remote MCP servers through Aperture with identity-based access control.

[**Set up admin access**](/docs/aperture/how-to/set-up-admin-access) — Configure administrator roles for managing Aperture settings and accessing all user data.

[**Visible groups for Aperture**](/docs/aperture/visible-groups) — Use Tailscale groups and SCIM groups to control access to Aperture models and admin roles.

Use guardrails to enforce policies on individual requests, such as scrubbing PII or blocking requests that violate your policies.

[**Guardrails**](/docs/aperture/guardrails) — Inspect, modify, or block LLM requests before they reach the provider.

[**Set up a guardrail**](/docs/aperture/how-to/set-up-guardrails) — Configure a pre-request hook to inspect, modify, or block LLM requests before they reach the provider.

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-visible-groups]: /docs/aperture/visible-groups
