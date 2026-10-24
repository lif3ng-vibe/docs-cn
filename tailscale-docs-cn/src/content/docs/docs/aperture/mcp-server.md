---
title: "MCP server proxying"
description: "Aggregate tools and resources from remote MCP servers through Aperture with identity-based access control."
---

Last validated Aug 14, 2026

Aperture can aggregate tools and resources from multiple remote [Model Context Protocol][xt-mcp-spec] (MCP) servers and expose them to AI agents through a single `/v1/mcp` endpoint. This lets you centralize MCP tool management behind your Aperture proxy with the same identity-based access control used for LLM providers. This page covers MCP protocol connectors specifically. For HTTP API connectors, refer to the [connectors feature guide][docs-aperture-connectors].

Aperture acts as an MCP server when communicating with AI agent clients and as an MCP client when communicating with remote MCP servers. Clients connect to Aperture's `/v1/mcp` endpoint and access an aggregated list of all tools and resources from every configured remote server.

## Use cases

MCP server proxying addresses the following use cases:

* **Centralized tool access**: Aggregate tools from multiple MCP servers behind a single endpoint. AI agents connect to one URL instead of managing connections to each server individually.
* **Identity-based access control**: Control which users can access which MCP tools and resources using the same Tailscale identity and grants system used for LLM providers.
* **Dynamic tool discovery**: Register and unregister MCP servers at runtime. When a server comes online, its tools become available automatically. When it goes offline, Aperture removes its tools.
* **Protocol compatibility**: Connect MCP servers that use different protocol versions. Aperture auto-detects whether each server supports Streamable HTTP or legacy SSE and handles the translation.

## Key MCP concepts

The [Model Context Protocol][xt-mcp-spec] defines a standard way for AI agents to discover and use external capabilities. The following concepts are relevant to configuring MCP in Aperture:

* **Tools**: Functions that LLMs can discover and call, such as searching a database or running a command.
* **Resources**: Contextual data identified by URI that LLMs can read, such as file contents or API responses.
* **Streamable HTTP**: The current MCP transport protocol that uses a single HTTP endpoint for bidirectional communication.
* **Legacy SSE**: The deprecated MCP transport that uses Server-Sent Events. Aperture supports both transports for backward compatibility.

## Prerequisites

Before you can use MCP server proxying, you need the following:

* Aperture enabled for your [tailnet][docs-tailnet]. Refer to [get started with Aperture][docs-aperture-get-started] if you have not set this up.
* At least one MCP server accessible from the Aperture host over your tailnet.
* The URL of each MCP server's endpoint (for example, `http://mcp-server.example.ts.net:8080/v1/mcp`).

> **Note:**
>
> The `connectors` configuration section is always available. The `connectors` feature flag is deprecated, so do not add it to a new configuration. The legacy `mcp.servers` syntax also remains available.

## Get started

To configure MCP server proxying in Aperture, add remote servers, grant users access to MCP tools, and connect an MCP client.

### Step 1: Configure MCP servers

\[Missing snippet: aperture\_admin\_nav.mdx] Add a `connectors` section to your configuration with one or more remote servers. Each connector can include optional `description` and `context` fields. `description` is a human-readable label shown in the UI. `context` accepts a plain string or JSON. For granted HTTP connectors, Aperture surfaces both fields to models through `aperture_list_connectors`.

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "description": "Internal analytics MCP server",
        "context": "Use this connector to query product analytics data. Returns JSON with metrics for DAU, MAU, and revenue."
      }
    }
  }
}
```

> **Warning:**
>
> For granted HTTP connectors, `description` and `context` are returned by `aperture_list_connectors` to users who can invoke that tool. They are not automatically included in MCP tool discovery. Do not include secrets or sensitive information.

Each key in the `servers` map is a server ID that Aperture uses as a name prefix. For a connector named `docs`:

* Tools from the `docs` server are prefixed with `docs_` (for example, a tool named `search` becomes `docs_search`).
* Resources use a hyphen instead of an underscore (for example, `docs-files://readme.md`).

Name prefixing prevents collisions when multiple servers expose tools with the same name. Clients receive the prefixed names and Aperture automatically strips the prefix when forwarding calls to the remote server.

#### Legacy syntax

The `mcp.servers` syntax is deprecated. New configurations should use the `connectors` syntax shown above. Refer to the [connectors feature guide][docs-aperture-connectors] for migration details.

```json
{
  "mcp": {
    "servers": {
      "docs": {
        "url": "http://docs.example.ts.net:8185/v1/mcp"
      },
      "remote": {
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      }
    }
  }
}
```

> **Tip:**
>
> The Aperture host uses its tailnet HTTP client for connections to remote MCP servers, so you can use tailnet hostnames (for example, `http://mcp-server.example.ts.net:8080/v1/mcp`) without additional network configuration.

### Step 2: Grant access to MCP tools

Aperture is deny-by-default. Without MCP grants, users cannot access any MCP capabilities. Add MCP grants in the `grants` section of your configuration.

MCP grants use the `connectors` field with `"connectorID/category/resource"` FQN glob patterns, or with `label:<name>` patterns that match connectors by label. The following example grants all users the built-in Aperture tools through the `system` label, which is the grant a new Aperture gateway ships with, plus all tools from the `docs` connector:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["label:system"]},
          {"connectors": ["docs/tools/*"]}
        ]
      }
    }
  ]
}
```

You can use `*` to match any characters within a single path segment (it does not cross `/`) and `**` to match zero or more segments. For example:

* `"docs/tools/search"` matches the `search` tool from the `docs` connector.
* `"docs/tools/*"` matches all tools from the `docs` connector.
* `"docs/**"` matches all capabilities (tools, resources, templates) from the `docs` connector.
* `"**"` matches all capabilities from all connectors.

A `label:<name>` pattern is matched exactly instead of expanded as a glob, and it grants every category and resource of each connector carrying the label. Use labels for connector-level policy and FQN patterns for tool-level access. Refer to [Grant connector access by label][docs-grant-by-label].

Aperture checks grants when clients list available tools and resources, and enforces them at invocation time. Users can only access the items their grants permit.

> **Note:**
>
> The deprecated `mcp_tools` and `mcp_resources` grant fields continue to work for backward compatibility with the `"server/item"` pattern syntax. New configurations should use the `connectors` field.

Refer to the [grants configuration reference][docs-aperture-grants] for the full grants syntax, or follow the [grant access to MCP tools][docs-grant-mcp-tool-access] guide for a step-by-step walkthrough.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### Step 3: Connect an MCP client

Configure your MCP client (the AI agent host) to use the Aperture URL as the MCP server endpoint. For example, in an MCP client configuration file:

```json
{
  "mcpServers": {
    "aperture": {
      "url": "http://<aperture-hostname>/v1/mcp"
    }
  }
}
```

Replace `<aperture-hostname>` with the [MagicDNS][docs-magicdns] name of your Aperture gateway.

Aperture automatically detects whether the client uses Streamable HTTP (the current MCP protocol) or legacy SSE and responds with the appropriate transport.

### Step 4: Verify the connection

Connect your MCP client to `http://<aperture-hostname>/v1/mcp` and list available tools. The tool list should include prefixed names from all configured servers (for example, `docs_search`, `remote_get_user`).

## Built-in tools

Aperture provides the following built-in tools under the `aperture` connector prefix:

* The `aperture` system connector is always present, but subject to a matching `connectors` grant like any other connector. Being a system connector confers no default access in the authorization path. It exposes the `aperture_list_connectors` tool, which you can grant with the FQN `aperture/tools/list_connectors`. That tool returns a list of all HTTP API connectors available through Aperture. Agents call it to discover available authenticated API proxies. Aperture registers it only when at least one HTTP connector is configured.
* `aperture_web_search` and `aperture_web_fetch` are available when the Aperture operator configures EXA with `LLM_PROXY_EXA_API_KEY` or the `-exa-api-key` command-line flag. The deprecated `web_tools` feature flag is not required.

The built-in `aperture` system connector carries the `system` label automatically. The default configuration on a new Aperture gateway grants `label:system` to all users. The configured [`Tailnet` and `TailnetSSH` connectors][docs-connectors-built-in] never receive this label, so grant them by ID.

The grant makes the `aperture` connector reachable. If you remove it, the connector falls under deny-by-default like any other connector. The web tools carry the same `aperture` prefix and use the same grants. However, Aperture registers them only when EXA is configured, so a grant alone does not make them appear.

To grant all `aperture` system tools, use `"connectors": ["label:system"]` or `"connectors": ["aperture/**"]`. To target the tool category, use `"connectors": ["aperture/tools/*"]`. To grant only the web search tool, use `"connectors": ["aperture/tools/web_search"]`.

## Common scenarios

The following sections describe common tasks related to MCP server proxying.

### Enable dynamic registration

Dynamic registration lets MCP servers register themselves with Aperture at runtime instead of being configured statically. Set `accept_registrations` to `true` in the `mcp` section.

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {}
  }
}
```

When dynamic registration is enabled, remote servers register by sending a POST request to `/v1/mcp/register` with a JSON body containing their URL:

```shell
curl -X POST http://<aperture-hostname>/v1/mcp/register \
  -H "Content-Type: application/json" \
  -d '{"url": "http://my-mcp-server:8080/v1/mcp"}'
```

Aperture validates the registering server before it responds with HTTP 200. Each dynamically registered server receives a sequential ID such as `auto1` or `auto2`, and its tools use that prefix, for example `auto1_search`.

> **Warning:**
>
> The registration endpoint requires Tailscale authentication, the same as all other Aperture endpoints. The registering server must be accessible through the tailnet.
>
> The registering server must keep the HTTP connection to `/v1/mcp/register` open. When the server closes the connection, Aperture automatically unregisters all of its tools and resources.

You can combine static servers and dynamic registration in the same configuration. Static servers are always available, while dynamically registered servers come and go as they connect and disconnect.

### Connect with per-user OAuth authorization

The `oauth2_authorization_code` auth type enables per-user OAuth flows. Each user completes their own authorization and Aperture manages tokens per-user.

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "your-client-id",
          "auth_url": "https://login.salesforce.com/services/oauth2/authorize",
          "token_url": "https://login.salesforce.com/services/oauth2/token",
          "scopes": ["mcp_api", "refresh_token"]
        }
      }
    }
  }
}
```

Per-user OAuth uses lazy population: tools do not appear until the user completes the OAuth flow.

The `client_secret` field is optional and not required for PKCE-only flows. Use `auth_params` to pass extra parameters to both the OAuth authorization and token requests, such as `"access_type": "offline"` to get refresh tokens.

For MCP servers that support dynamic client registration, use the [`oauth2_dcr`][docs-connectors-reference-dcr] auth type instead. Aperture discovers the authorization server and registers a client at runtime, so you supply only the server `url` with no `client_id`, `auth_url`, or `token_url`.

## HTTP API connectors

Aperture can also proxy HTTP API requests through connectors with `protocol: "http"`. These connectors act as authenticated reverse proxies that inject credentials into outgoing requests.

HTTP connectors are accessed through `/v1/connectors/<id>/<path>` rather than `/v1/mcp`. Agents discover available HTTP connectors by calling the `aperture_list_connectors` tool exposed by the `aperture` system connector.

```json
{
  "connectors": {
    "servers": {
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "auth": {
          "type": "bearer_token",
          "secret": "github_pat_example"
        }
      }
    }
  }
}
```

Refer to the [connectors feature guide][docs-aperture-connectors] for full documentation on HTTP API connectors, including supported auth types and access control.

## MCP configuration reference

Refer to the [Aperture configuration reference][docs-aperture-mcp-config] for the full `mcp` configuration syntax. The following sections describe how Aperture handles transport detection and server availability.

* For connectors configuration, including HTTP API connectors and auth types, refer to the [connectors feature guide][docs-aperture-connectors] and the [connectors configuration reference][docs-aperture-connectors-config].

### Transport auto-detection

Aperture automatically detects whether each remote MCP server supports Streamable HTTP (the current protocol) or legacy SSE. When connecting to a remote server, Aperture tries Streamable HTTP first and falls back to SSE if the server does not support it. Remote servers can be upgraded to a later protocol version without restarting Aperture.

The same auto-detection applies to clients connecting to Aperture's `/v1/mcp` endpoint. Aperture serves both Streamable HTTP and legacy SSE clients.

### Capability updates

Aperture periodically checks configured remote MCP servers for capability changes. When a server adds or removes tools or resources, Aperture updates the capabilities available to connected clients.

If a remote server becomes unavailable, its tools and resources remain unavailable until the server recovers. Aperture makes them available again after recovery.

Servers using `oauth2_authorization_code` authentication load capabilities for each user when they start a session. Users can request current capabilities with `PUT /api/connectors/<id>/capabilities`. This request contacts the upstream server and can return connection errors.

## Limitations

MCP server proxying has the following limitations:

* **Capability updates are not immediate**: Aperture periodically detects capability changes from remote servers. There can be a short delay before added or removed tools become available to clients. Connectors using `oauth2_authorization_code` load capabilities for each user when they start a session or request a capability refresh.
* **Grant enforcement**: Aperture enforces grants at both listing and invocation time. Users can access only the tools and resources their grants permit, and Aperture rejects `tools/call` and `resources/read` requests that do not match a grant with an "unknown tool" or "unknown resource" error.

## Troubleshooting

Use the following sections to diagnose and resolve common issues with MCP server configuration.

### MCP tools do not appear

If tools from a configured MCP server are not visible:

1. Verify the URL in your configuration is correct and the MCP server is running.
2. Check that the MCP server is reachable from the Aperture host. Test with `curl -v <your-mcp-server-url>` from the Aperture host.
3. Verify your grants include `connectors` patterns (or the deprecated `mcp_tools` patterns) that match the server and tool names. Without grants, users cannot access any MCP tools.

### Connection refused or host not found

These errors indicate the MCP server URL is unreachable.

* **Connection refused**: The server is not running or is not listening on the configured port.
* **Host not found**: The hostname cannot be resolved. For tailnet hostnames, verify the MCP server device is connected to the tailnet and check with `tailscale status`.

### Tools appear and then disappear

If tools are briefly visible and then become unavailable, the remote MCP server is likely crashing or restarting. Aperture automatically unregisters tools when a remote server becomes unreachable and re-registers them when the server recovers.

### Dynamic registration fails

If remote servers cannot register dynamically:

1. Verify `accept_registrations` is set to `true` in your `mcp` configuration.
2. Make sure the remote server sends a valid POST request to `/v1/mcp/register` with a JSON body containing `{"url": "<mcp-server-url>"}`.
3. The remote server must keep the HTTP connection open after registration. If the connection closes, Aperture unregisters the server's tools immediately.

### Tool calls time out

If tool calls fail with timeout errors, the remote MCP server is taking too long to respond. Aperture retries tool calls once on connection errors. Check the remote server's performance and make sure it can respond within a reasonable time.

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-mcp-config]: /docs/aperture/configuration#mcp

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-magicdns]: /docs/features/magicdns

[docs-tailnet]: /docs/concepts/tailnet

[xt-mcp-spec]: https://modelcontextprotocol.io/specification
