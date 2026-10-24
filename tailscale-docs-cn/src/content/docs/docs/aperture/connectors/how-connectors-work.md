---
title: "How connectors work"
description: "Connectors let agents call tools and query APIs through Aperture. Connectors differ in where their tools run:"
---

Last validated Oct 1, 2026

Connectors let agents call tools and query APIs through Aperture. Connectors differ in where their tools run:

* Built-in connectors run their tools inside Aperture.
* Verified and custom connectors send calls to an upstream MCP server or HTTP API. Aperture can inject configured credentials into each call.

Connector grants control access to every kind. For more about each kind, refer to [Kinds of connector][docs-connectors-kinds]. For field definitions, refer to the [connectors reference][docs-connectors-reference].

## Connectors and providers

Aperture routes two kinds of agent traffic:

* [Providers][docs-aperture-set-up-providers] route LLM requests to upstream model APIs.
* Connectors give agents access to tools and APIs. They forward requests to an upstream service or run a built-in tool inside Aperture.

A connector never serves model completions, and a provider never exposes tools. Together, they give Aperture visibility into model and tool usage through one gateway. To let an agent call a tool or query an API, use a connector.

## Two protocols

Each verified or custom connector uses one of two protocols. The protocol sets how Aperture communicates with the upstream service and how agents reach the connector.

* **MCP connectors**: Point at remote [Model Context Protocol][xt-mcp-spec] servers. Aperture aggregates their tools and resources behind the `/v1/mcp` endpoint. An agent discovers and calls tools through Aperture without knowing which backend serves each tool.
* **HTTP connectors**: Turn Aperture into an authenticated reverse proxy. An agent sends a request to `/v1/connectors/<id>/<path>`, and Aperture forwards it to the upstream API with credentials injected automatically.

You can mix both protocols in one configuration. MCP tools surface through `/v1/mcp`, and HTTP APIs surface through their proxy paths. When at least one HTTP connector exists, Aperture also exposes a built-in tool that lets models discover the available HTTP connectors.

### Name prefixing

Each connector ID becomes a name prefix, which prevents collisions when two servers expose a tool with the same name. Tools take the ID and an underscore (`docs_search`). Resources and resource templates take the ID and a hyphen (`docs-files://readme.md`). Aperture strips the prefix when it forwards a call to the upstream. This is why connector IDs allow only letters and digits: underscores and hyphens are reserved as separators in the prefixed names exposed to agents.

## The authentication model

Verified and custom connectors centralize credentials. You store API keys and tokens in the Aperture configuration instead of giving them to every agent runtime. Aperture injects the correct credential on each outbound request, so you rotate a credential in one place.

These connectors support several authentication schemes, including static tokens, API keys, HTTP basic, and two OAuth 2.0 flows. The distinction that shapes behavior most is shared versus per-user credentials:

* **Shared credentials** such as static tokens, API keys, basic, and OAuth 2.0 client credentials authenticate Aperture itself to the upstream. Every user with a matching grant uses the same credential. Scope these narrowly, ideally read-only.
* **Per-user credentials** such as an OAuth 2.0 authorization code require each user to complete an individual consent flow. Aperture gives each user an isolated session and stores their tokens separately, so backends that tie state to a token do not mix users' sessions.

Per-user connectors do not expose tools to a user until that user completes OAuth authorization. For how Aperture discovers tools after authorization, refer to [Capability discovery and updates][ar-capability-discovery-and-updates].

Some tools ask a user to authorize a specific action when an agent calls them, instead of requiring authorization for the whole connector up front. The built-in [`Tailnet` connector][docs-connectors-built-in] works this way. It uses the OAuth 2.0 authorization code type, but its tool is available with a grant alone, and the **Connect** button does not apply. The first call returns an authorization link, and a call after the user approves returns the result. Refer to its [authorization flow][docs-connectors-built-in-auth-flow]. For authentication requirements, scheme-specific fields, and provider-specific configuration parameters, refer to the [connectors reference][docs-connectors-reference].

## Capability discovery and updates

Aperture shows each user the MCP tools, resources, and templates that their grants permit.

For a verified or custom MCP connector without per-user credentials, Aperture polls the upstream every few seconds. When the upstream adds or removes a tool, Aperture updates the registered capabilities. If the upstream becomes unreachable, Aperture removes its tools from `/v1/mcp` until the upstream recovers. Aperture Chat can still show the last cached tool list. A listed tool does not guarantee that a live call succeeds.

Built-in connector tools run inside Aperture, so Aperture does not poll them.

Per-user OAuth connectors do not use background polling. Aperture discovers and caches a separate tool catalog for each user with that user's credentials:

* After consent, Aperture tries to discover tools before it redirects the user to Aperture Chat. If the upstream is slow or unreachable, the tools might not appear immediately.
* If that first discovery does not complete, a later request from the user can discover the tools.
* One user's catalog does not populate another user's tools.

A connector's detail page shows cached capabilities and does not contact the upstream. To get upstream tool changes, open the connector's detail page under **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors] and select **Refresh tools**. Discovery and refresh contact the upstream, so either can fail if the upstream is unreachable. A failed refresh reports an upstream error but does not change **Ready**. Connector status describes access and authorization, not upstream health. Neither discovery nor refresh requires an Aperture restart.

## Access control

Aperture is deny-by-default for connectors, the same as for the rest of the gateway. Without a matching grant, a user sees no connector capabilities. Grants use `"connectorID/category/resource"` glob patterns, where the category is `tools`, `resources`, `templates`, or `proxy`. Aperture checks grants both when a client lists capabilities and when it invokes one, so a user can list and call only what their grants permit. Being a built-in system connector confers no special access in the authorization path. The grant system governs it like any other, which is why the built-in tools arrive through a grant in the default configuration rather than through an exception in the code.

The `proxy` category governs the raw proxy path `/v1/connectors/<id>/...`. An MCP connector is also reachable through that path, and on it Aperture applies only the connector-level `proxy` grant, not the per-tool and per-resource filtering it applies on `/v1/mcp`.

### Labels group connectors for grants

An FQN pattern names one connector, so a policy expressed only in FQN patterns grows by one entry for every connector you add. Labels solve that. A label is a flat string on a connector, and a grant pattern of `label:<name>` matches every connector carrying it. Label a set of connectors `sales`, grant `label:sales` once, and a connector added to that set later is covered without a policy change.

Two rules follow from how Aperture evaluates a label. Matching is exact rather than glob-based, the same as `tag:` and `group:` in Tailscale grants, so `label:team.*` matches nothing. And a matching label grants the whole connector at every category and resource, so labels express connector-level policy while FQN patterns remain the way to reach a single tool.

Labels are also where a new Aperture gateway starts. The built-in `aperture` system connector carries the `system` label automatically. The shipped default configuration grants `label:system`, so the configuration includes a working label-based access example. The configured [`Tailnet` and `TailnetSSH` connectors][docs-connectors-built-in] do not receive this label, and cannot: Aperture strips the reserved `system` label from every `connectors.servers` entry. Grant those connectors by ID. Admins manage and review connector labels under **Administration** > **Connectors**. The personal Chat portal does not list connector labels.

Labels can only widen access. Grants are additive and allow-only, so a label adds the connectors it matches to a user's access and never subtracts anything. A sensitivity label such as `restricted` records intent but enforces nothing on its own: a user with a broad `"**"` grant still reaches a connector labeled `restricted`. Use narrow grants to restrict access. For the label grammar and the reserved `system` label, refer to the [connectors reference][docs-connectors-reference-labels], and for the task itself, refer to [Grant connector access by label][docs-grant-connector-access-by-label].

## How HTTP connectors limit credential exposure

Because an HTTP connector forwards arbitrary client requests to an upstream with injected credentials, Aperture constrains the proxy to reduce the risk of credential leakage:

* It strips client-supplied `Authorization` and `Cookie` headers before forwarding, then injects the connector's own credentials.
* It strips `Set-Cookie` headers from upstream responses.
* It blocks all upstream redirects, which reduces the risk of credential exfiltration through redirect chains.
* It accepts only standard request methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`), rejecting methods such as `TRACE` that would echo the injected credentials back to the client.

These rules mean an HTTP connector behaves like a narrow, credential-injecting gateway rather than a general-purpose proxy. The upstream service's handling of forwarded requests is governed by your agreement with that service.

This shapes how failures surface. When an upstream is unreachable or errors at the connection level, Aperture returns `502 Bad Gateway`. A request that uses a disallowed method returns `405 Method Not Allowed`. Large responses are capped at a size limit and truncated, so a response that gets cut off may have exceeded that limit.

## Related

* [Use a connector][docs-connectors-use] to authorize a connector, call its tools, or query its API.
* [Get started with connectors][docs-connectors-get-started] to add a connector and grant access as an admin.
* [Kinds of connector][docs-connectors-kinds] to learn which connectors Aperture runs itself and which ones forward calls.
* [Grant connector access by label][docs-grant-connector-access-by-label] to group connectors and grant a set at once.
* [Connectors reference][docs-connectors-reference] for field definitions, authentication types, and validation rules.

[ar-capability-discovery-and-updates]: #capability-discovery-and-updates

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-built-in-auth-flow]: /docs/aperture/connectors/built-in-connectors#authorization-flow

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-kinds]: /docs/aperture/connectors/kinds-of-connector

[docs-connectors-reference-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
