---
title: "Set up an HTTP API connector"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

Last validated Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

AI agents often need to call REST APIs, but distributing API keys to every agent runtime increases the risk of credential leakage. HTTP connectors let Aperture act as an authenticated reverse proxy: agents send requests to Aperture, and Aperture forwards them to the upstream API with credentials injected automatically.

## Prerequisites

Before you begin, you must meet the following requirements:

* You have an [Aperture gateway][docs-get-started] with at least one provider configured.
* You have admin access to the [Aperture configuration][docs-aperture-configuration].
* You have an API credential (token, API key, or username/password) for the upstream service.
* You have the base URL of the upstream REST API.
* You are running the test request from a device on the same tailnet as the Aperture gateway. Aperture identifies the caller from their Tailscale identity. Requests without a tailnet identity are rejected.

## Step 1: Choose the upstream base URL

The `url` field is the base URL of the upstream API. Aperture appends the request path from each proxied request to this base, so point the URL at the API root. A trailing slash is optional. Aperture normalizes it.

For example:

* `https://api.github.com` for the GitHub REST API
* `https://your-org.atlassian.net/rest/api/3` for the Jira Cloud REST API
* `https://api.stripe.com/v1` for the Stripe API

> **Note:**
>
> Aperture warns about unsafe connector URLs when you load the configuration and refuses the connection at request time. Saving an unsafe URL through the admin dashboard is rejected as an error. Internal and reserved address ranges are blocked. RFC 1918 private addresses, ULA addresses, and Tailscale CGNAT addresses are permitted, so you can proxy to services in your tailnet or private network.

## Step 2: Configure authentication

Open the admin dashboard and go to **Administration** > **Connectors**. Select **Add connector** > **Custom connector**, then choose **HTTP**. To edit JSON, go to **Administration** > **Configuration**. Each connector entry needs a `protocol` set to `"http"`, a `url`, and an `auth` block that matches your upstream API's authentication scheme.

### Bearer token

Use `bearer_token` when the upstream API expects an `Authorization: Bearer <token>` header. This is the most common pattern for APIs like GitHub and Stripe.

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
          "secret": "<your-github-pat>"
        }
      }
    }
  }
}
```

### API key

Use `api_key` when the upstream API expects a credential as a named header or query parameter. Set `in` to `"header"` or `"query"`, and `name` to the header or parameter name.

```json
{
  "connectors": {
    "servers": {
      "weather": {
        "protocol": "http",
        "url": "https://api.weather.example.com",
        "auth": {
          "type": "api_key",
          "secret": "<your-api-key>",
          "name": "X-API-Key",
          "in": "header"
        }
      }
    }
  }
}
```

### HTTP Basic

Use `basic` when the upstream API uses HTTP Basic authentication. This is common for Atlassian APIs (Jira, Confluence) that use an email address and API token.

```json
{
  "connectors": {
    "servers": {
      "jira": {
        "protocol": "http",
        "url": "https://your-org.atlassian.net/rest/api/3",
        "auth": {
          "type": "basic",
          "username": "api-user@example.com",
          "password": "<your-api-token>"
        }
      }
    }
  }
}
```

### OAuth 2.0 client credentials

Use `oauth2_client_credentials` for machine-to-machine OAuth 2.0 flows. Aperture obtains and auto-refreshes access tokens using the client credentials grant.

```json
{
  "connectors": {
    "servers": {
      "analytics": {
        "protocol": "http",
        "url": "https://analytics.example.com/api",
        "description": "Analytics API (read-only)",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "<your-client-secret>",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  }
}
```

Aperture also supports `oauth2_authorization_code` for per-user consent flows. Refer to the [connectors reference][docs-connectors-reference] for details.

Connector IDs (the map keys like `github`, `weather`, `jira`) must contain only letters and digits and start with a letter. The IDs `tailscale`, `internal`, and `aperture` are reserved.

## Step 3: Set description and context for agent discovery

The `description` and `context` fields help AI models and human operators understand what each HTTP connector does.

* `description` is a short human-readable label that appears in the Aperture admin dashboard.
* `context` provides instructions or metadata to help AI models decide when and how to use the connector. It accepts a plain string or a JSON object.

For granted HTTP connectors, the `aperture_list_connectors` tool returns both fields to users who can call the tool.

```json
{
  "connectors": {
    "servers": {
      "github": {
        "protocol": "http",
        "url": "https://api.github.com",
        "description": "GitHub REST API (read-only)",
        "context": "Use this connector to look up repository metadata, pull request status, and issue details. Do not create or modify resources without explicit user approval.",
        "auth": {
          "type": "bearer_token",
          "secret": "<your-github-pat>"
        }
      }
    }
  }
}
```

> **Warning:**
>
> Do not include secrets, internal URLs, or other sensitive information in `description` or `context`. Users who can call `aperture_list_connectors` can access these fields for their granted HTTP connectors.

## Step 4: Grant users access to the connector

Aperture is deny-by-default. Without a matching `connectors` grant, users receive `403 Forbidden` when calling the proxy endpoint. Add grants in the `grants` section of your configuration.

For HTTP connectors, the `proxy` category controls access to the proxy endpoint at `/v1/connectors/<id>/<path>`. The following grant gives all users proxy access to the `github` connector and access to the built-in Aperture tools including `aperture_list_connectors`, which lets AI models discover available HTTP connectors:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["aperture/**"]},
          {"connectors": ["github/**"]}
        ]
      }
    }
  ]
}
```

The pattern `"github/**"` grants all access to the `github` connector (proxy and any future categories). You can also use the more specific pattern `"github/proxy"` to grant only proxy access.

The `aperture_list_connectors` tool is exposed to models over their MCP connection, so models reach it through MCP rather than the dashboard. When a model calls `aperture_list_connectors`, Aperture returns a structured text response listing each HTTP connector's ID, proxy endpoint, upstream URL, description, and context:

```text
Aperture HTTP API Connectors
============================
The following HTTP APIs are available through authenticated proxy endpoints.
Aperture handles all authentication automatically.

Base URL: https://ai.example.ts.net
Make requests to {Base URL}/v1/connectors/{id}/{path}

Available connectors:

## github
- Endpoint: https://ai.example.ts.net/v1/connectors/github/
- Upstream: https://api.github.com
- Description: GitHub REST API (read-only)
- Context: Use this connector to look up repository metadata and pull request status.
```

## Step 5: Verify the proxy works

After saving the configuration and adding a grant, send a test request through the Aperture gateway. Use this URL pattern:

```text
/v1/connectors/<connector-id>/<path>
```

Aperture appends `<path>` to the connector's base URL and injects the configured credentials automatically. For the GitHub connector configured above:

```shell
curl http://<aperture-hostname>/v1/connectors/github/user
```

Aperture forwards this request to `https://api.github.com/user` with the bearer token injected as an `Authorization` header. The response from the upstream API is returned to the caller.

Query parameters are forwarded as-is. For example, to list open pull requests:

```shell
curl "http://<aperture-hostname>/v1/connectors/github/repos/tailscale/tailscale/pulls?state=open&per_page=5"
```

Aperture forwards the request to `https://api.github.com/repos/tailscale/tailscale/pulls?state=open&per_page=5` with credentials injected.

If you have not yet added a grant (Step 4), this request returns `403 Forbidden`. Add the grant first, then retry. For other errors, refer to [troubleshooting][ar-troubleshooting].

## Security behavior

HTTP connectors apply several security restrictions to limit credential exposure.

**Shared credentials**: The authentication credentials configured on an HTTP connector are shared by all users with a matching `connectors` grant. Users must have a grant matching `"connectorID/proxy"` or a broader pattern like `"connectorID/**"` to access the proxy endpoint. Use the narrowest possible credential scope (ideally read-only) for each connector.

**Allowed HTTP methods**: Aperture accepts GET, HEAD, POST, PUT, PATCH, DELETE, and OPTIONS. Aperture rejects all other methods (including TRACE and CONNECT) with `405 Method Not Allowed`. Aperture blocks TRACE because it reflects request headers, which would expose injected authentication credentials.

**Header stripping**: Aperture strips `Authorization` and `Cookie` headers from client requests before forwarding to the upstream, then injects the correct credentials from the connector's `auth` configuration. Aperture also strips `Set-Cookie` headers from upstream responses and removes standard hop-by-hop headers (`Connection`, `Keep-Alive`, `Proxy-Authenticate`, `Proxy-Authorization`, `Te`, `Trailer`, `Transfer-Encoding`, `Upgrade`) in both directions.

**Redirect blocking**: Aperture blocks all redirects from upstream servers. This reduces the risk of credential exfiltration through redirect chains, where a compromised upstream could redirect to an attacker-controlled URL with the injected credentials.

**Response size limit**: Aperture limits responses to 50 MB and silently truncates responses that exceed this limit. The response still returns `200` with a truncated body rather than an error status, so clients should not rely on `Content-Length` matching the body.

## Troubleshooting

Use the following sections to diagnose common issues with HTTP connectors.

### 405 Method Not Allowed

The request used an HTTP method that Aperture does not permit. HTTP connectors accept GET, HEAD, POST, PUT, PATCH, DELETE, and OPTIONS. If your API client uses TRACE or CONNECT, switch to a supported method.

### 502 Bad Gateway

Aperture could not reach the upstream server. Possible causes:

* The connector's `url` is incorrect or the upstream server is not running.
* DNS cannot resolve the upstream hostname. For tailnet hostnames, verify the device is connected with `tailscale status`.
* The upstream URL uses a restricted internal or reserved address that the safe dialer blocks. RFC 1918 and Tailscale CGNAT addresses are allowed.

### Unexpected 403 or 401 from upstream

Aperture successfully reached the upstream, but the upstream rejected the request. Possible causes:

* The credential in the `auth` block is invalid, expired, or has insufficient permissions.
* The `auth` type does not match what the upstream expects (for example, using `bearer_token` when the API requires `api_key` in a custom header).
* For `basic` auth, confirm the `username` and `password` fields are correct. Atlassian APIs require an API token, not a user password.

### Response truncated

Aperture limits response bodies to 50 MB. If the upstream returns a larger response, the body is silently truncated. Use API parameters (pagination, field selection) to reduce the response size.

### Auth configuration rejected with unknown field error

The `auth` block uses strict field validation. A misspelled field name (for example, `"secert"` instead of `"secret"`) causes the configuration to fail with a JSON decoder error. Double-check field names against the authentication types described in [Step 2: Configure authentication][ar-step-2] or the [connectors reference][docs-connectors-reference].

## Next steps

* Refer to the [connectors reference][docs-connectors-reference] for the complete field reference, including all authentication types and validation rules.
* Refer to the [connectors feature guide][docs-aperture-connectors] for an overview of both MCP and HTTP connectors, including dynamic registration and migration from `mcp.servers`.
* Refer to [control access][docs-control-access] for information about controlling access to Aperture resources with grants.

[ar-step-2]: #step-2-configure-authentication

[ar-troubleshooting]: #troubleshooting

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-control-access]: /docs/aperture/control-access

[docs-get-started]: /docs/aperture/get-started

[docs-web-dashboard]: /docs/aperture/reference/dashboard-admin
