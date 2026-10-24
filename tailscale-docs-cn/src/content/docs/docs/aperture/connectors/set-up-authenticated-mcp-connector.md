---
title: "Set up an authenticated MCP connector"
description: "Connect Aperture to a remote MCP server that authenticates with a shared, machine-to-machine credential. Aperture stores the credential once and uses it for every authorized request. For an unauthenti"
---

Last validated Sep 28, 2026

Connect Aperture to a remote MCP server that authenticates with a shared, machine-to-machine credential. Aperture stores the credential once and uses it for every authorized request. For an unauthenticated server, refer to [Get started with connectors][docs-connectors-get-started]. For individual user authorization, refer to [Set up a per-user OAuth 2.0 connector][docs-set-up-per-user-oauth2-connector].

## Prerequisites

Before you begin, you need the following:

* Admin access to the Aperture configuration. Refer to [Get started with connectors][docs-connectors-get-started].
* The URL of the MCP server, reachable from the Aperture gateway.
* A credential for the server: either a static token or OAuth 2.0 client credentials (client ID, client secret, and token URL).

## Choose an authentication type

A shared MCP credential supports two authentication types:

* **`bearer_token`**: A static token that Aperture sends as an `Authorization: Bearer` header. Use this when the server issues a long-lived token.
* **`oauth2_client_credentials`**: A machine-to-machine OAuth 2.0 flow. Aperture obtains and auto-refreshes access tokens from the token URL. Use this when the server issues short-lived tokens through a client credentials grant.

Both types share the credential across every user with a matching grant. For credentials scoped to individual users, use the [per-user OAuth 2.0 flow][docs-set-up-per-user-oauth2-connector].

## Add a bearer token connector

Add an entry to `connectors.servers` with `protocol` set to `"mcp"` and an `auth` block of type `bearer_token`. The entry's key is the connector ID, which must start with a letter and contain only letters and digits (no underscores or hyphens), because Aperture uses it to prefix tool names:

```json
{
  "connectors": {
    "servers": {
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token"
        }
      }
    }
  }
}
```

## Add an OAuth 2.0 client credentials connector

For a machine-to-machine OAuth 2.0 flow, use an `auth` block of type `oauth2_client_credentials`. Aperture refreshes the access token automatically:

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "mcp",
        "url": "https://analytics.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

`scopes` is optional. Omit it if the provider does not require scopes for the client-credentials grant.

With the client-credentials grant, Aperture mints an access token on demand. It reruns the grant to get a new token rather than storing a refresh token.

Set `token_url` to the provider's canonical token endpoint. Aperture refuses redirects to protect the client secret. A rejected credential or incorrect token URL leaves the tool list empty without changing the connector's status.

> **Warning:**
>
> The credential on a shared MCP connector is used for every user with a matching grant. There is no per-user isolation. Scope the credential as narrowly as the server lets you.

The `auth` block rejects unknown fields. A typo in a field name (for example, `secert` instead of `secret`) fails validation at load time. Refer to the [connectors reference][docs-connectors-reference] for the required fields of each authentication type.

## Grant access

MCP connectors are deny-by-default. Add a `connectors` grant so users can list and call the server's tools. Refer to [grant access to MCP tools][docs-grant-mcp-tool-access].

## Verify the connection

1. Open **Connectors** in [Chat][docs-aperture-chat-connectors] and select the connector. Its status reflects your access and authorization, not upstream health.
2. If the MCP connector is **Ready**, select **Refresh tools** to contact the upstream and request its current tools.
3. Confirm that **Tools** lists the expected tools. A rejected credential, incorrect token URL, or unreachable server appears as a refresh error rather than changing status.

After the expected tools appear, list them from a client. Run the requests from a device in your tailnet. Aperture identifies the caller from the tailnet connection and needs no separate authorization header.

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

The response contains a `tools` array with entries prefixed by the connector ID (for example, `snowflake_query`).

## Related

* [How connectors work][docs-connectors-how-it-works] - Understand the connector model, authentication, and capability discovery.
* [Connectors reference][docs-connectors-reference] - Authentication types, MCP protocol behavior, and validation rules.

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
