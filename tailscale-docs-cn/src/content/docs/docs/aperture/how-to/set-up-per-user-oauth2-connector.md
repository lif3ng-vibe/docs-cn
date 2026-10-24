---
title: "Set up a per-user OAuth 2.0 connector"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

Last validated Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

Some external services, such as Google Workspace, Atlassian, and Salesforce, require each user to authorize individually before Aperture can act on their behalf. Aperture's `oauth2_authorization_code` auth type handles this by running an OAuth 2.0 authorization code flow with Proof Key for Code Exchange (PKCE) (S256). Tokens are stored per-user so that credentials are not shared across users.

## Prerequisites

Before you begin, you must meet the following requirements:

* You have an [Aperture gateway][docs-get-started] with at least one provider configured.
* [Admin access][docs-set-up-admin-access] to the Aperture admin dashboard.
* You have an OAuth 2.0-capable account at the external provider (Google, Salesforce, or similar) with permission to register an OAuth application.
* You have the Model Context Protocol (MCP) server URL for the remote service you want to connect.

## Step 1: Register an OAuth application at the provider

Create an OAuth 2.0 application at your external provider. During registration, configure the following:

1. Set the redirect URI to:

   ```text
   https://<aperture-hostname>/aperture/auth/<connector-id>/callback
   ```

   Replace `<aperture-hostname>` with your Aperture gateway's Tailscale hostname and `<connector-id>` with the connector ID you plan to use in your Aperture configuration (for example, `google` or `salesforce`). Connector IDs must start with a letter and contain only letters and digits (matching `[a-zA-Z][a-zA-Z0-9]*`). Hyphens and underscores are not allowed.

2. Enable PKCE with the S256 challenge method if the provider requires explicit opt-in. Aperture uses PKCE (S256) for authorization code flows.

3. Record the following values from the provider's application settings:
   * Client ID
   * Client secret (if issued, not required for PKCE-only public clients)
   * Authorization URL
   * Token URL
   * Required scopes

The following table lists the authorization and token URLs for common providers, along with any required `auth_params`:

| Provider   | Auth URL                                                 | Token URL                                            | Required `auth_params`                            | Required scopes for refresh tokens | Notes                                                                                                     |
| ---------- | -------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Google     | `https://accounts.google.com/o/oauth2/v2/auth`           | `https://oauth2.googleapis.com/token`                | `{"access_type": "offline", "prompt": "consent"}` | (set in `auth_params`)             | Without `access_type: offline`, Google does not issue a refresh token.                                    |
| Salesforce | `https://login.salesforce.com/services/oauth2/authorize` | `https://login.salesforce.com/services/oauth2/token` | None required                                     | `refresh_token`                    | Refer to the example below. You can also use the org-specific domain (`https://<org>.my.salesforce.com`). |

> **Note:**
>
> This guide covers the `oauth2_authorization_code` flow, where you register an OAuth application yourself. MCP servers that support dynamic client registration, such as Atlassian, use the [`oauth2_dcr`][docs-connectors-reference-dcr] auth type instead: Aperture discovers the authorization server and registers a client at runtime, so you do not configure authorization and token URLs. Refer to the [connectors reference][docs-connectors-reference-dcr] to configure one.

## Step 2: Configure the connector in Aperture

\[Missing snippet: aperture\_admin\_nav.mdx] Add a connector entry using the `oauth2_authorization_code` auth type.

The following example configures a Google Workspace connector:

```json
{
  "connectors": {
    "servers": {
      "google": {
        "protocol": "mcp",
        "url": "https://mcp.google.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<your-client-id>",
          "client_secret": "<your-client-secret>",
          "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
          "token_url": "https://oauth2.googleapis.com/token",
          "scopes": ["https://www.googleapis.com/auth/spreadsheets.readonly"],
          "auth_params": {"access_type": "offline", "prompt": "consent"}
        }
      }
    }
  }
}
```

> **Warning:**
>
> Many providers require a specific scope or `auth_params` value before they issue a refresh token. For Google, omitting `access_type: offline` means the provider does not issue a refresh token. Other providers require a scope instead: for example, Salesforce needs `refresh_token`. Check your provider's documentation. Without the correct setting, the connector appears to work initially, but silently stops working after the first access token expires (typically one hour).

The `client_secret` field is optional. If the provider supports PKCE-only public clients and does not issue a client secret, you can omit this field.

The following example configures a Salesforce connector:

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<your-salesforce-client-id>",
          "client_secret": "<your-salesforce-client-secret>",
          "auth_url": "https://login.salesforce.com/services/oauth2/authorize",
          "token_url": "https://login.salesforce.com/services/oauth2/token",
          "scopes": ["mcp_api", "refresh_token"]
        }
      }
    }
  }
}
```

## Step 3: Grant users access to the connector's tools

Aperture is deny-by-default. Without grants, users cannot access any connector tools, even after authorizing. Add grants in the `grants` section of your configuration.

The following example grants all users access to all tools and resources from the `google` connector, plus access to the built-in Aperture tools:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["aperture/**"]},
          {"connectors": ["google/**"]}
        ]
      }
    }
  ]
}
```

Connector grants use the `connectors` field with `"connectorID/category/resource"` FQN glob patterns. For example, `"google/tools/*"` grants access to all tools from the `google` connector, while `"google/**"` grants access to all capabilities (tools, resources, templates).

Refer to [grant access to MCP tools][docs-grant-mcp-tool-access] for detailed instructions on configuring grants.

## Step 4: Walk users through the authorization flow

Each user must complete an individual authorization flow before they can use the connector. The same Tailscale user must both start and complete authorization, and an admin cannot act for another user.

The flow works as follows:

1. Open **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors].
2. Under **Connect to use**, find the connector and select **Connect**.
3. Sign in to the external provider and grant consent.
4. Return to the connector detail page and confirm **Connected.** and **Ready**.

> **Warning:**
>
> Pending authorization flows expire after 15 minutes. If a flow expires before completion, select **Connect** again to start a new flow.

## Step 5: Verify tools appear

After authorization, select **Refresh tools** on the connector detail page and confirm that the expected tools appear under **Tools**. To verify `/v1/mcp` directly, send `tools/list` as the authorized, granted user.

\[Missing snippet: aperture\_mcp\_list\_tools.mdx]

The response should include tools prefixed with the connector ID (for example, `google_search`, `google_query`).

## Check or reset a user's authorization

Users check and manage their own authorization in Chat **Connectors**:

| Section or status                      | Meaning                                                                             | Action                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Ready to use** and **Ready**         | You have access and any required authorization. This does not test upstream health. | Select the connector to review its tools.                             |
| **Connect to use** with **Connect**    | You have access but have not authorized this per-user connector.                    | Select **Connect** and complete consent.                              |
| **Needs reconnect** with **Reconnect** | The saved authorization is no longer usable.                                        | Correct the OAuth configuration if needed, then select **Reconnect**. |
| **Temporarily unavailable**            | Aperture could not read your credential state.                                      | Reload the page and try again.                                        |

Aperture omits configured connectors that your grants deny. It does not show **No access** in Chat.

To clear a stored credential and reset authorization, select **Disconnect** on the connector detail page, then select **Connect** to re-authorize.

## Troubleshooting

Use the following sections to diagnose and resolve common issues with per-user OAuth 2.0 connectors.

### Authorization flow expires

Pending authorization flows expire after 15 minutes. If an authorization link expires, have the user select **Connect** again in Chat **Connectors**.

### Tools stop working after a period of inactivity

If tools from a per-user connector stop working after a period of inactivity, the refresh token has likely expired or been revoked by the provider. Aperture treats tokens as expired 60 seconds early and refreshes them on the next request, but when a refresh fails, Aperture deletes the stored credential. The affected user must select **Reconnect** in Chat **Connectors** to re-authorize.

### Missing refresh-token setting causes silent token expiry

If a provider does not issue a refresh token, the connector works initially but stops working after the access token expires (typically one hour). Each provider has its own requirement:

* Google requires `auth_params` with `{"access_type": "offline", "prompt": "consent"}`. The `access_type: offline` value is what enables refresh tokens. `prompt: consent` ensures a refresh token is re-issued on subsequent authorizations.
* Salesforce requires the `refresh_token` scope.

Add the required setting to your configuration and have affected users select **Reconnect** to re-authorize. A **Needs reconnect** status means the saved authorization is no longer usable. A missing refresh token is one possible cause.

### Auth configuration rejected with unknown field error

The `auth` block uses strict field validation. If a field name is misspelled (for example, `"secert"` instead of `"secret"`), the configuration fails to load with a JSON decoder error. Double-check field names against the [connectors reference][docs-connectors-reference].

### Callback shows "authorization failed"

If the provider redirects to the callback URL but the user sees an "authorization failed" page:

1. Verify that the redirect URI registered at the provider exactly matches `https://<aperture-hostname>/aperture/auth/<connector-id>/callback`.
2. Confirm the `state` parameter was not modified during the redirect. This can occur if a proxy or browser extension alters query parameters.
3. Confirm that the same Tailscale user who started the flow is the one completing it. If a different user opens the authorization URL, the callback fails.

## Next steps

* Refer to the [connectors feature guide][docs-aperture-connectors] for an overview of all connector types and common scenarios.
* Refer to the [connectors reference][docs-connectors-reference] for the complete field reference and all authentication types.
* For connectors that use a single shared credential instead of per-user authorization, refer to [set up an authenticated MCP connector][docs-set-up-authenticated-mcp-connector].
* Refer to [grant access to MCP tools][docs-grant-mcp-tool-access] for detailed instructions on MCP grants.

[ar-step-2-configure]: #step-2-configure-the-connector-in-aperture

[ar-step-3-grant-access]: #step-3-grant-users-access-to-the-connectors-tools

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-connectors-reference-dcr]: /docs/aperture/connectors/reference#dynamic-client-registration-oauth2_dcr

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-authenticated-mcp-connector]: /docs/aperture/connectors/set-up-authenticated-mcp-connector

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
