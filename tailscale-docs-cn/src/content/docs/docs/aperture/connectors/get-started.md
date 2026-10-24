---
title: "Get started with connectors"
description: "Add your first Aperture connector, grant access to its capabilities, and verify the connection from a client. For background on how connectors work, refer to [How connectors work][docs-connectors-how-"
---

Last validated Sep 28, 2026

Add your first Aperture connector, grant access to its capabilities, and verify the connection from a client. For background on how connectors work, refer to [How connectors work][docs-connectors-how-it-works]. For complete field definitions, refer to the [connectors reference][docs-connectors-reference].

## Prerequisites

Before you begin, you need the following:

* Aperture enabled for your [tailnet][docs-tailnet]. Refer to [Get started with Aperture][docs-aperture-get-started] if you have not set this up.
* Admin access to edit the `connectors` and `grants` sections of the Aperture configuration.
* The URL of at least one upstream service such as an MCP server or HTTP API, reachable from the Aperture gateway.

## Step 1: Add a connector

> **Note:**
>
> Connectors that use `oauth2_authorization_code` or `oauth2_client_credentials` require an upstream OAuth application. Authorization-code clients can use PKCE without a client secret, while client-credentials connectors require a client secret. On the MCP server or API provider:
>
> * For either method, create the OAuth application and note the client ID and token URL. For client credentials, also note the required client secret. For authorization code, note the client secret only if the application uses one.
> * For `oauth2_authorization_code`, register Aperture's callback URL (`https://<aperture-hostname>/aperture/auth/<connector-id>/callback`) and note the authorization URL and user authorization scopes.

Connectors live in the `connectors` section of the Aperture configuration. \[Missing snippet: aperture\_admin\_nav.mdx] That page is the visual editor and holds the connector picker. To edit the `connectors` section as JSON instead, use the **Administration** > **Configuration** page.

You can add connectors in two ways:

* **From the verified registry**: The connector picker includes pre-configured defaults for common providers such as Salesforce, Atlassian, Slack, GitHub, Notion, and Linear. Open the picker for the current list. Selecting a provider pre-fills its configuration. Some require OAuth client credentials, but connectors using [`oauth2_dcr`][docs-connectors-reference-dcr], including Atlassian, Notion, and Linear, do not because Aperture registers the OAuth client automatically. For more information, refer to [Add a verified connector][docs-connectors-add-verified].
* **Custom configuration**: Add a `connectors` section with one or more server entries. Each entry needs a `protocol` (`"mcp"` or `"http"`) and a `url`.

The following example adds an unauthenticated MCP server and an authenticated HTTP API:

```json
{
  "connectors": {
    "servers": {
      "docs": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8185/v1/mcp"
      },
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

Each key in the `servers` map is a connector ID that Aperture uses as a name prefix. Connector IDs must contain only letters and digits, starting with a letter. The IDs `tailscale`, `internal`, and `aperture` are reserved. Refer to the [connectors reference][docs-connectors-reference] for the full ID rules and authentication types.

Aperture supports `bearer_token`, `api_key`, `basic`, `oauth2_client_credentials`, `oauth2_authorization_code`, and `oauth2_dcr` authentication. Refer to the [connectors reference][docs-connectors-reference] for each type's fields.

> **Tip:**
>
> The Aperture gateway uses its tailnet HTTP client for connections, so you can use [MagicDNS][docs-magicdns] hostnames (for example, `http://mcp-server.example.ts.net:8080/v1/mcp`) without additional network configuration.

## Step 2: Grant access

Aperture denies connector access unless a grant matches the request. Add grants in the `grants` section of your configuration. \[Missing snippet: aperture\_admin\_nav.mdx] Use the visual grant editor, or edit the same grants as JSON on the **Administration** > **Configuration** page.

To change the configuration programmatically, refer to the [grants configuration reference][docs-aperture-grants].

The following example grants every capability from every connector, including Aperture's built-in tools:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["**"]}
        ]
      }
    }
  ]
}
```

Connector grants use the `connectors` field with `"connectorID/category/resource"` glob patterns. The valid categories are `tools`, `resources`, `templates`, and `proxy`. Both MCP and HTTP connectors require grants. Refer to the [grants configuration reference][docs-aperture-grants] for the full syntax.

> **Warning:**
>
> A `"**"` grant reaches every connector you add later, including sensitive ones. Use it only while you verify your first connector.

Labels are another way to write a connector grant. A label is a flat string you set on a connector, and one `label:<name>` pattern grants every connector carrying that label. Once you have more than one connector, replace the broad grant with labeled groups. Refer to [Grant connector access by label][docs-grant-connector-access-by-label].

## Step 3: Verify the connection

Verify the connector in Chat first, then verify client access.

### Check the connector status

1. Open **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors].
2. Select the connector.
3. Confirm it appears under **Ready to use** and shows **Ready**.
4. For MCP, confirm **Tools** contains the expected tools.

**Ready** describes access and authorization, not upstream reachability. Select **Refresh tools** to contact the upstream and request current tools.

### Diagnose a connector that is not ready

* **Connect to use** with **Connect** means authorization is required.
* **Needs reconnect** with **Reconnect** means saved authorization is unusable.
* **Temporarily unavailable** means Aperture could not read credential state. Reload and retry.

For non-admins, grant-denied configured connectors are omitted. Direct detail access uses the same not-found state as a nonexistent connector. Revisit [Step 2][ar-step-2-grant-access] rather than looking for **No access**.

If **Refresh tools** returns `502 upstream error`, confirm the URL is correct and reachable from the Aperture gateway.

### Verify access from a client

Once the connector shows **Ready**, verify access from a client. Run these commands from a device in your tailnet whose identity has the grants from [Step 2][ar-step-2-grant-access]. Aperture authorizes each request from the caller's tailnet identity, and `<aperture-hostname>` is the Aperture gateway's MagicDNS name.

For MCP connectors, point your MCP client at the Aperture URL and list available tools.

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

The response contains a `tools` array with prefixed entries from your configured connectors (for example, `docs_search`).

For HTTP connectors, send a request through the Aperture proxy path:

```shell
curl http://<aperture-hostname>/v1/connectors/github/user
```

Aperture forwards the request to `https://api.github.com/user` and injects the configured bearer token automatically.

## Next steps

* [Set up an HTTP API connector][docs-set-up-http-api-connector] to proxy requests to an upstream REST API with automatic authentication.
* [Set up a per-user OAuth 2.0 connector][docs-set-up-per-user-oauth2-connector] to connect agents to services that require individual user authorization.
* [Use a connector][docs-connectors-use] once it is configured, to authorize and call its tools as an end-user.
* [Grant connector access by label][docs-grant-connector-access-by-label] to replace a broad `"**"` grant with labeled groups of connectors.

[ar-step-2-grant-access]: #step-2-grant-access

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-add-verified]: /docs/aperture/connectors/add-verified-connector

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-magicdns]: /docs/features/magicdns

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-set-up-http-api-connector]: /docs/aperture/how-to/set-up-http-api-connector

[docs-set-up-per-user-oauth2-connector]: /docs/aperture/how-to/set-up-per-user-oauth2-connector

[docs-tailnet]: /docs/concepts/tailnet
