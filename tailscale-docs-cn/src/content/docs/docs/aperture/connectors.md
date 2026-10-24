---
title: "Connectors"
description: "Find documentation for Aperture connectors, including setup guides, conceptual explanations, and configuration reference."
---

Last validated Sep 28, 2026

Connectors let Aperture reach external [MCP][xt-mcp-spec] servers and HTTP APIs through a single authenticated gateway. Aperture handles credentials, request proxying, and access control, so agents do not need separate service connections. Connectors complement [providers][docs-aperture-set-up-providers]: providers route model requests, and connectors route tool calls and API requests.

The MCP servers and HTTP APIs you connect to are third-party services. When Aperture forwards requests and credentials to them, their handling of that data is governed by your agreement with each service, not your agreement with Tailscale.

## Set up connectors

[**Get started with connectors**](/docs/aperture/connectors/get-started) — Add a connector, grant access, and verify the connection in Aperture.

[**Add a verified connector**](/docs/aperture/connectors/add-verified-connector) — Configure a verified connector such as Salesforce or Slack from the Aperture connector picker, supplying OAuth client credentials when required.

[**Set up an authenticated MCP connector**](/docs/aperture/connectors/set-up-authenticated-mcp-connector) — Connect Aperture to an MCP server that requires authentication using a shared bearer token or OAuth 2.0 client credentials.

[**Set up an HTTP API connector**](/docs/aperture/how-to/set-up-http-api-connector) — Configure Aperture to proxy requests to an upstream REST API with automatic credential injection.

[**Set up a per-user OAuth 2.0 connector**](/docs/aperture/how-to/set-up-per-user-oauth2-connector) — Connect Aperture to an external service that requires individual user consent using the OAuth 2.0 authorization code flow.

[**Grant access to MCP tools**](/docs/aperture/how-to/grant-mcp-tool-access) — Configure Aperture grants to control which connector capabilities users can access, including MCP tools, resources, templates, and HTTP proxy access.

[**Grant connector access by label**](/docs/aperture/how-to/grant-connector-access-by-label) — Label Aperture connectors and grant access by label so a single grant covers every connector in a group instead of naming each connector ID.

[**Built-in connectors**](/docs/aperture/connectors/built-in-connectors) — Set up the built-in Aperture connectors that provision tailnet nodes and run shell commands over Tailscale SSH.

## Use connectors

[**Use a connector**](/docs/aperture/connectors/use-a-connector) — Authorize a connector, discover and call its tools, and reconnect when access expires.

## Understand connectors

[**How connectors work**](/docs/aperture/connectors/how-connectors-work) — Understand built-in, verified, and custom Aperture connectors, how they relate to providers, and how authentication and access control apply.

[**Kinds of connector**](/docs/aperture/connectors/kinds-of-connector) — Aperture has five kinds of tool integration. They differ by who runs the tool and who can reach it, which determines their configuration, grants, and failure behavior.

## Reference

[**Aperture connectors reference**](/docs/aperture/connectors/reference) — Complete reference for Aperture connectors, including field definitions, authentication types, MCP and HTTP protocol behavior, grants, dynamic registration through the legacy MCP section, and migration from the deprecated MCP servers syntax.

[docs-aperture-set-up-providers]: /docs/aperture/set-up-providers

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
