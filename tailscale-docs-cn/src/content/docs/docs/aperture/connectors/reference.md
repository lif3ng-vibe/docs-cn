---
title: "Aperture connectors reference"
description: "The `connectors` section of the [Aperture configuration][docs-aperture-configuration] configures outbound integrations with external services. Connectors support two protocols:"
---

Last validated Oct 1, 2026

The `connectors` section of the [Aperture configuration][docs-aperture-configuration] configures outbound integrations with external services. Connectors support two protocols:

* **MCP** (`"protocol": "mcp"`): Aperture connects to remote [Model Context Protocol][xt-mcp-spec] servers, aggregates their tools and resources, and exposes them through the `/v1/mcp` endpoint.
* **HTTP** (`"protocol": "http"`): Aperture acts as an authenticated reverse proxy, forwarding requests to upstream HTTP APIs with credentials injected automatically.

Connectors replace the deprecated `mcp.servers` syntax and add support for authenticated connections and multiple protocols.

For setup and verification steps, refer to [Get started with connectors][docs-connectors-get-started].

## `connectors` fields

The `connectors` section accepts the following top-level fields:

| Field           | Type | Default | Description                                                                                                                                                                                                                                      |
| --------------- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `servers`       | map  | `{}`    | Map of connector ID to server configuration. The map key is the connector ID, which becomes the name prefix for tools (`connectorID_toolname`), resources (`connectorID-uri`), and resource templates (`connectorID-uriTemplate`).               |
| `system_labels` | map  | `{}`    | Map of system connector ID to a list of labels, replacing that connector's default labels. Keys must name a known system connector (currently `aperture`). Any other key is a load-time error. Refer to [connector labels][ar-connector-labels]. |

## `servers` fields

Each entry in the `servers` map accepts the following fields:

| Field         | Type             | Required | Default      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ---------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol`    | string           | Yes      | N/A          | How Aperture communicates with the upstream. One of `"mcp"` or `"http"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `url`         | string           | No       | N/A          | Endpoint URL of the upstream server. A missing `url` produces a load-time warning rather than a fatal error, so Aperture still loads the configuration. The dashboard's connector save path, however, rejects it as an error.                                                                                                                                                                                                                                                                                                               |
| `provider`    | string           | No       | `"Custom"`   | Provider identifier. Set automatically when using a verified connector from the registry (for example, `"Salesforce"`, `"Atlassian"`, `"Slack"`). Custom connectors use the default value `"Custom"`. Controls whether the connector appears in the "verified" or "custom" category in the UI. If set manually, `provider` must exactly match a verified connector ID from the registry or be `"Custom"`. Any other value is a load-time error. Verified provider IDs are case-sensitive (for example, `"Salesforce"`, not `"salesforce"`). |
| `description` | string           | No       | unset (`""`) | Human-readable label displayed in the Aperture UI. For granted HTTP connectors, `aperture_list_connectors` also returns it to permitted users. When empty, the field is omitted from the stored configuration.                                                                                                                                                                                                                                                                                                                              |
| `context`     | string or JSON   | No       | N/A          | Prompt or context information for a connector. Accepts a plain string or arbitrary JSON object. For granted HTTP connectors, `aperture_list_connectors` returns it to permitted users.                                                                                                                                                                                                                                                                                                                                                      |
| `labels`      | array of strings | No       | `[]`         | Flat labels that group the connector for access control. A grant pattern of `label:<name>` matches every connector carrying that label. Each label must match `[a-zA-Z0-9][a-zA-Z0-9._-]*`. The label `system` is reserved. Refer to [connector labels][ar-connector-labels].                                                                                                                                                                                                                                                               |
| `auth`        | object           | No       | N/A          | Authentication configuration. Dispatched by the `type` field.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Example with both protocols:

```json
{
  "connectors": {
    "servers": {
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
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

In this example, `github` is a custom HTTP connector (its `provider` is unset, so it defaults to `"Custom"`). It is distinct from the verified `GitHub` MCP connector in the registry, which uses the case-sensitive provider ID `"GitHub"`.

## Connector ID rules

Connector IDs must match the pattern `[a-zA-Z][a-zA-Z0-9]*` (letters and digits only, starting with a letter). Connector IDs cannot contain underscores or hyphens because the MCP wire format reserves these as separators: underscores separate the connector ID from the tool name (`snowflake_query`), and hyphens separate the connector ID from resource URIs (`snowflake-resource://...`).

Valid IDs: `github`, `snowflake`, `analyticsV2`. Invalid IDs: `my-mcp` (hyphen), `github_api` (underscore), `2fast` (starts with digit).

The IDs `tailscale`, `internal`, and `aperture` are reserved and cannot be used as connector IDs. The `aperture` ID is used by the built-in system connector and produces a distinct error message from `tailscale` and `internal` (refer to [validation errors][ar-validation-errors]).

## Connector labels

Labels are flat strings that group connectors for access control. Set the `labels` field on any connector, then grant access to the group with a `label:<name>` pattern in the `connectors` field of a grant:

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "labels": ["sales", "restricted"]
      }
    }
  }
}
```

Each label must match `[a-zA-Z0-9][a-zA-Z0-9._-]*`. A label starts with a letter or digit and contains only letters, digits, dots, underscores, and hyphens. Slashes are rejected to avoid ambiguity with slash-separated FQN patterns. Because dots and hyphens are legal, labels can be namespaced (`team.eng`), but Aperture neither requires nor interprets that convention.

Beyond that grammar, labels are free text. Aperture defines no vocabulary and attaches no meaning to a label's value. The dashboard suggests labels already in use on other connectors so an Aperture gateway converges on one vocabulary rather than accumulating near-duplicates. Common schemes classify a connector by data sensitivity (`public`, `private`, `restricted`), by team ownership (`eng`, `sales`), or by provenance (`system`).

Label matching has two characteristics that differ from FQN patterns:

* **Exact match, no globs.** A `label:<name>` pattern is compared literally against a connector's labels, the same way `tag:` and `group:` behave in Tailscale grants. Wildcard forms such as `label:team.*` match nothing.
* **Whole-connector access.** A matching label grants every category and resource the connector exposes, including HTTP `proxy` access. Labels have no per-tool granularity. For tool-level or resource-level access, use an FQN pattern that names the connector ID.

> **Warning:**
>
> Labels widen access and never restrict it. Grants are additive and allow-only, so labeling a connector `restricted` documents intent without enforcing it: a user holding `{"connectors": ["**"]}` still reaches that connector. To limit a sensitive connector, remove the broad wildcard grants that reach it and grant it narrowly by label or by connector ID.

### The reserved `system` label

Aperture applies the `system` label to the built-in `aperture` system connector automatically. The shipped default configuration grants `label:system`, so this connector works on a new Aperture gateway without configuration. The configured [`Tailnet` and `TailnetSSH` connectors][docs-connectors-built-in] never receive the label, because they are entries under `connectors.servers`. Because the default grant reaches every user, `system` is reserved under `connectors.servers`:

* The dashboard and the connector API reject `system` when you save a connector.
* A configuration that already carries the label loads with a warning, and Aperture strips the label before evaluating any grant. An upgraded gateway still boots, and the label never reaches grant evaluation.

The label remains valid under `connectors.system_labels`, which exists to assign labels to built-in connectors. `system_labels` replaces a built-in connector's default labels rather than adding to them, so omitting `system` from the list stops the default `label:system` grant from matching that connector:

```json
{
  "connectors": {
    "system_labels": {
      "aperture": ["system", "public"]
    }
  }
}
```

For step-by-step instructions, refer to [Grant connector access by label][docs-grant-connector-access-by-label].

## System connectors

Aperture includes built-in system connectors that appear independently of the `connectors.servers` configuration. System connectors appear in the `GET /api/connectors` response with `category: "system"`.

The `aperture` connector's `list_connectors` tool is registered only when at least one HTTP connector is configured. With no HTTP connectors, the connector still appears in the listing, but the tool is absent from `tools/list`.

| ID         | Provider | Protocol | Tools             | Labels   | Description                                               |
| ---------- | -------- | -------- | ----------------- | -------- | --------------------------------------------------------- |
| `aperture` | Aperture | MCP      | `list_connectors` | `system` | Lists all HTTP API connectors available through Aperture. |

The `aperture` system connector helps AI models discover available HTTP connectors and construct requests to `/v1/connectors/<id>/<path>`. The `aperture` ID is reserved and cannot be used as a custom connector ID.

The `system` label states provenance only. Aperture ships no sensitivity labels on built-in connectors, because how sensitive a connector is depends on the deployment rather than on the connector. Override the defaults with [`connectors.system_labels`][ar-the-reserved-system-label]. `system_labels` keys must name a connector in this table, and any other key is a load-time error.

Aperture ships two further built-in connectors, `Tailnet` and `TailnetSSH`, whose tools it supplies rather than proxying. Those are `connectors.servers` entries with a reserved `provider` value rather than rows in this table, so they take a configuration key you choose and are granted by ID. Refer to [Built-in connectors][docs-connectors-built-in].

## Verified connectors registry

Aperture maintains a registry of verified connectors with pre-configured defaults for known providers. The registry is accessible through `GET /api/connectors-registry` and is used by the dashboard's connector picker to pre-fill configuration fields.

Each registry entry carries the fields that apply to its authentication type. Authorization-code entries can include `auth_url`, `token_url`, `scopes`, and `auth_params`. Dynamic client registration entries do not define authorization or token URLs. The following row illustrates an authorization-code entry:

| Provider | Protocol | Auth type                   | URL                         | Scopes                                                                                |
| -------- | -------- | --------------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| Slack    | MCP      | `oauth2_authorization_code` | `https://mcp.slack.com/mcp` | `channels:read`, `channels:history`, `users:read`, `search:read.public`, `chat:write` |

Aperture ships more than a dozen verified connectors. Field values (including `auth_url`, `token_url`, `scopes`, and `auth_params`) change as providers update their endpoints, so query `GET /api/connectors-registry` for the authoritative current list rather than copying values from this page.

Verified connector defaults are starting points. Once an admin saves a connector, the stored configuration values are the authoritative source of truth. The registry values are not enforced at runtime.

The verified registry supplies presets to **Add connector** in the admin dashboard. The admin page presents configured connectors in one searchable list. Unconfigured catalog and built-in entries appear under **Available to add** in Chat. Admins can select **Configure**. Ordinary configuration opens `/admin/settings/connectors`.

## Connector categories

Each connector belongs to one of three categories based on its origin:

| Category   | Description                                                                         | Example                                      |
| ---------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| `system`   | Built-in connectors provided by Aperture. Always present.                           | `aperture`                                   |
| `custom`   | Connectors configured by an admin with `provider: "Custom"` or no `provider` field. | `github`, `weather`                          |
| `verified` | Connectors whose `provider` is set to any value other than `Custom`.                | `salesforce` (with `provider: "Salesforce"`) |

## Connector statuses

The connector list includes a `status` field for each connector that is visible to the caller. Admins can get the list from `GET /api/connectors`. Other users get it through the **Connectors** page in Aperture Chat, which applies the same visibility and status rules. Only admins can call the connector management REST endpoints.

The following table lists each API status, how Aperture Chat displays it, and how to resolve it:

| API status       | Chat display                                                              | Meaning                                                                                                                                                          | Resolution                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `ready`          | **Ready**, under **Ready to use**                                         | The caller has access and is authorized. This does not confirm that the upstream is reachable, that the tool list is current, or that a live tool call succeeds. | If the tool list is missing or outdated, select **Refresh tools**. To confirm that the connector works, call a permitted tool or proxy path. |
| `needs_auth`     | **Connect**, under **Connect to use**, with no status badge               | The caller has a grant but has not authorized this per-user OAuth connector.                                                                                     | Select **Connect**.                                                                                                                          |
| `misconfigured`  | **Needs reconnect** with **Reconnect**                                    | Authorization needs renewal. The access token expired without a refresh token, or the provider rejected a token refresh and requires new consent.                | Select **Reconnect**. If the problem recurs after token expiry, check the provider's offline-access configuration.                           |
| `unavailable`    | **Temporarily unavailable**                                               | Aperture could not read the caller's credential state.                                                                                                           | Reload or retry later. Reconnecting is not necessary.                                                                                        |
| `no_access`      | Hidden                                                                    | The caller has no matching `connectors` grant.                                                                                                                   | An admin adds a matching grant.                                                                                                              |
| `not_configured` | **Available to add** for admins, **Requires admin setup** for other users | A built-in connector has no configured instance. The API returns it as a setup placeholder.                                                                      | An admin selects **Configure**.                                                                                                              |

If the provider does not issue a refresh token, a new authorization reports `ready` until its access token expires.

The `no_access` status follows these rules:

* For non-admin callers, the list omits configured connectors that have no matching grant.
* Admins receive those configured connectors as `no_access`.
* Built-in system connectors appear in the list for every caller, with `no_access` if the caller has no grant.
* Aperture Chat hides `no_access` entries, including for admins. The exception is the built-in `aperture` system connector: Chat still lists it when **Web** or **Code Sandbox** is available.
* If a non-admin opens a configured connector in Aperture Chat without a grant, Aperture returns `404 Not Found` and does not reveal that the connector exists.
* A non-admin request to any `/api/connectors` REST endpoint returns `403 Forbidden` before Aperture looks up the connector.

If a configured connector is missing from a user's list, check that user's connector grants.

Status describes caller access and authorization, not upstream health. The connector detail page shows cached capabilities and does not contact the upstream. A `ready` per-user connector can show an empty tool list if the first [capability discovery][ar-capability-population] did not complete. A later request or **Refresh tools** can discover the tools. **Refresh tools** contacts the upstream and can return a connection error. A populated tool list does not prove that a live tool call succeeds.

## Authentication

The `auth` object's `type` field selects the authentication scheme. The following table describes the available auth types:

| Type                        | Required fields                           | Description                                                                                                                                                                                                                                               |
| --------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bearer_token`              | `secret`                                  | Static `Authorization: Bearer <secret>` header.                                                                                                                                                                                                           |
| `api_key`                   | `secret`, `name`, `in`                    | Credential injected as a named header or query parameter. `in` must be `"header"` or `"query"`.                                                                                                                                                           |
| `basic`                     | `username`, `password`                    | HTTP Basic authentication.                                                                                                                                                                                                                                |
| `oauth2_client_credentials` | `client_id`, `client_secret`, `token_url` | Machine-to-machine OAuth 2.0 token. Auto-refreshed. Optional `scopes` array.                                                                                                                                                                              |
| `oauth2_authorization_code` | `client_id`, `auth_url`, `token_url`      | Per-user OAuth 2.0 consent flow. Optional `client_secret` (not required for PKCE-only), `scopes`, and `auth_params`.                                                                                                                                      |
| `oauth2_dcr`                | `url`                                     | Per-user OAuth 2.0 consent flow using [dynamic client registration][ar-dcr]. Aperture discovers the authorization server and registers a client at runtime, so no `client_id`, `auth_url`, or `token_url` is needed. Optional `scopes` and `auth_params`. |

### API key

```json
{
  "connectors": {
    "servers": {
      "weather": {
        "protocol": "http",
        "url": "https://api.weather.example.com",
        "auth": {
          "type": "api_key",
          "secret": "wk-example-key",
          "name": "X-API-Key",
          "in": "header"
        }
      }
    }
  }
}
```

The `in` field must be `"header"` or `"query"`. When set to `"header"`, Aperture injects the credential as a request header with the name specified in `name`. When set to `"query"`, Aperture appends it as a URL query parameter.

### Per-user OAuth 2.0 authorization code flow

When a connector uses `oauth2_authorization_code`, each user must complete an individual consent flow. Aperture uses PKCE with the S256 challenge method. Each user gets an isolated MCP client session, so backends that tie session state to a bearer token cannot mix up cross-user state.

#### Initiating the flow

The connect and disconnect endpoints apply only to connectors that use a per-user interactive OAuth flow (`oauth2_authorization_code` or [`oauth2_dcr`][ar-dcr]). Other connectors return a "not found" error.

Users start authorization in Aperture Chat. They open **Connectors**, find the connector under **Connect to use**, and select **Connect**. An admin can also start authorization with a `POST` request:

```
POST /api/connectors/<id>/connect
```

Aperture returns a JSON response containing the provider's authorization URL:

```json
{"auth_url": "https://provider.example.com/oauth2/authorize?client_id=...&code_challenge=..."}
```

The user opens this URL in a browser to complete consent. The provider sends the user back to Aperture through `/aperture/auth/<id>/callback`. Aperture then redirects the browser to the connector detail page, which shows **Connected.** When you create the OAuth application, register `https://<aperture-hostname>/aperture/auth/<id>/callback` with the provider.

Pending authorization flows expire after 15 minutes. If the user does not complete consent in that time, Aperture rejects the flow. Select **Connect** again to start a new flow.

#### Token lifecycle

Aperture stores tokens per user. It treats an access token as expired 60 seconds before its actual expiry.

* A connector without a refresh token stays `ready` while its access token is usable. When that token expires, the connector reports `misconfigured`, and Chat shows **Needs reconnect**.
* A connector also reports `misconfigured` if the provider rejects a token refresh and requires new consent.
* A temporary refresh failure, such as a timeout or a server error, does not change the status. Aperture retries the refresh on the next request.

To renew authorization, users select **Reconnect** in Aperture Chat. Admins can also use the connector management REST endpoints.

#### Capability population

For per-user OAuth connectors (`oauth2_authorization_code` and `oauth2_dcr`), Aperture tries to fetch tools with the user's credentials after consent. It does this before it redirects the user to Aperture Chat. If the fetch times out or fails, the connector can be `ready` with an empty tool list. A later request can then populate that user's catalog. One user's consent or tool list does not populate the catalog of another user.

The connector detail page shows the capabilities available to the user. Select **Refresh tools** if tools are missing or outdated. Refresh contacts the upstream and can fail if the upstream is unreachable.

#### `auth_params`

The `auth_params` field appends custom parameters to both the authorization URL and the token exchange request body. Some providers require specific parameters to issue refresh tokens:

* **Google**: `{"access_type": "offline", "prompt": "consent"}`. Without `access_type: offline`, Google does not issue a refresh token.

\[Missing snippet: aperture\_google\_workspace\_dpp\_note.mdx]

```json
{
  "connectors": {
    "servers": {
      "google": {
        "protocol": "mcp",
        "url": "https://mcp.google.example.com/v1/mcp",
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "example-client-id",
          "client_secret": "example-client-secret",
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

The `auth` block rejects unknown fields. A typo in a field name (for example, `"secert"` instead of `"secret"`) produces a validation error at load time.

### Dynamic client registration (oauth2\_dcr)

`oauth2_dcr` is a per-user OAuth 2.0 flow for MCP servers that support dynamic client registration ([RFC 7591][xt-rfc-7591]). Instead of registering an OAuth application yourself and supplying a `client_id`, `auth_url`, and `token_url`, Aperture discovers the authorization server from the connector's `url` ([RFC 9728][xt-rfc-9728] protected-resource metadata, then [RFC 8414][xt-rfc-8414] authorization-server metadata) and registers a client at runtime.

The only required field is `url`, the MCP server's resource URL. Optional `scopes` and `auth_params` are supported. Because nothing is registered at the provider ahead of time, a DCR connector has no client ID or secret.

A DCR connector uses the same per-user [connect flow][ar-connect-flow], [token lifecycle][ar-token-lifecycle], and [capability population][ar-capability-population] as `oauth2_authorization_code`, with one difference: every `oauth2_dcr` connector authorizes through a single shared callback, `https://<aperture-hostname>/aperture/auth/dcr/callback`, rather than a per-connector callback.

```json
{
  "connectors": {
    "servers": {
      "atlassian": {
        "protocol": "mcp",
        "url": "https://mcp.atlassian.com/v1/mcp/authv2",
        "auth": {
          "type": "oauth2_dcr",
          "url": "https://mcp.atlassian.com/v1/mcp/authv2"
        }
      }
    }
  }
}
```

### Bearer token

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

### OAuth 2.0 client credentials

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

## MCP connectors

When `protocol` is `"mcp"`, Aperture connects to remote MCP servers, aggregates their tools and resources, and exposes them through the `/v1/mcp` endpoint.

### Name prefixing

Each key in the `servers` map is a connector ID that Aperture uses as a name prefix:

* Aperture prefixes tools with the connector ID and an underscore. For example, a tool named `search` on the `docs` connector becomes `docs_search`.
* Resources use a hyphen instead of an underscore. For example, `docs-files://readme.md`.

Name prefixing prevents collisions when multiple servers expose tools with the same name. Clients receive the prefixed names and Aperture automatically strips the prefix when forwarding calls to the remote server.

### Transport auto-detection

Aperture automatically detects whether each remote MCP server supports Streamable HTTP (the current protocol) or legacy SSE. When connecting to a remote server, Aperture tries Streamable HTTP first and falls back to SSE if the server does not support it. You can upgrade remote servers to a later protocol version without restarting Aperture.

The same auto-detection applies to clients connecting to Aperture's `/v1/mcp` endpoint. Aperture serves both Streamable HTTP and legacy SSE clients.

### Capability updates

Aperture polls each MCP connector that does not use per-user credentials every few seconds. When a server adds or removes tools or resources, Aperture updates the capabilities available to connected clients.

If Aperture cannot connect to a remote server, it removes that server's tools from `/v1/mcp` until the server recovers. If Aperture connects but cannot list the server's capabilities, it keeps the capabilities from the last successful check. In both cases, Aperture Chat can still show the last cached tool list, so a listed tool does not guarantee that a live call succeeds.

> **Note:**
>
> Per-user OAuth connectors do not use this periodic check. They load capabilities with each user's credentials after consent or on a later request. To request current capabilities, select **Refresh tools** in Aperture Chat. Refresh contacts the upstream server. It can return a connection error while the status stays **Ready**.

### System connectors

Aperture includes a built-in `aperture` system connector that exposes the `list_connectors` tool. This tool lists all HTTP API connectors available through Aperture, helping AI models discover which APIs they can access and how to call them. To grant access, use `"label:system"`, which matches the built-in `aperture` connector, or an FQN pattern such as `"aperture/**"` or `"aperture/tools/*"`.

The `aperture` system connector always appears in `GET /api/connectors`. Its `aperture_list_connectors` MCP tool is available when at least one HTTP connector is configured.

On the `/v1/mcp` endpoint, this tool appears with the connector-ID prefix as `aperture_list_connectors`, consistent with the name-prefixing rule. Grants reference the unprefixed tool name (for example, `"aperture/tools/list_connectors"`).

System connectors require grants like custom and verified connectors. Without a matching `connectors` grant, users cannot access the `aperture` connector's tools. The default configuration grants `label:system` to every user. Removing that grant makes the built-in tools unavailable.

> **Tip:**
>
> The Aperture host uses its tailnet HTTP client for connections to remote MCP servers, so you can use tailnet hostnames (for example, `http://mcp-server.example.ts.net:8080/v1/mcp`) without additional network configuration.

## HTTP connectors

When `protocol` is `"http"`, Aperture acts as an authenticated reverse proxy. Aperture forwards requests sent to `/v1/connectors/<id>/<path>` to the connector's upstream URL and injects credentials automatically. When at least one HTTP connector is configured, Aperture registers an `aperture_list_connectors` MCP tool so that AI models can discover available HTTP connectors.

> **Warning:**
>
> The authentication credentials configured on an HTTP connector are shared by all users with a matching `connectors` grant. Users must have a grant matching `"connectorID/proxy"` or a broader pattern like `"connectorID/**"` to access the proxy endpoint. Use the narrowest possible credential scope, preferably read-only. Do not put sensitive information in `description` or `context`. The `aperture_list_connectors` tool returns these fields to users who can call it.

### Allowed HTTP methods

HTTP connectors accept the following request methods: `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`. Aperture rejects all other methods, including `TRACE` and `CONNECT`, with `405 Method Not Allowed`. Aperture blocks `TRACE` because it reflects request headers, which would expose injected authentication credentials.

### Request and response handling

Aperture modifies requests and responses passing through the HTTP connector proxy:

* **Request headers**: Aperture strips `Authorization` and `Cookie` headers from client requests before forwarding to the upstream. This prevents clients from injecting credentials that could leak to the upstream server. Aperture injects the correct credentials separately based on the connector's `auth` configuration.
* **Response headers**: Aperture strips `Set-Cookie` headers from upstream responses, preventing the upstream from setting cookies on Aperture's origin.
* **Hop-by-hop headers**: Standard hop-by-hop headers (`Connection`, `Keep-Alive`, `Proxy-Authenticate`, `Proxy-Authorization`, `Te`, `Trailer`, `Transfer-Encoding`, `Upgrade`) are stripped in both directions per HTTP specification.
* **Request body**: Forwarded as-is with no size limit.
* **Response body**: Limited to 50 MB. Responses exceeding this limit are truncated.

### Security behavior

HTTP connectors enforce the following security restrictions:

* **URL restrictions**: Connector URLs are validated against a safe dialer that blocks internal and reserved address ranges. RFC 1918 (private), ULA, and Tailscale CGNAT addresses are permitted.
* **Redirect blocking**: HTTP connectors block all redirects from upstream servers to prevent credential exfiltration through redirect chains.
* **Credential injection**: Aperture injects credentials on every proxied request based on the connector's `auth` configuration. Client-supplied `Authorization` headers are always replaced.

## Dynamic registration

> **Note:**
>
> Dynamic registration is configured only through the legacy `mcp` section and has no `connectors` equivalent. The behavior described here applies to the `mcp` section.

Dynamic registration lets MCP servers register themselves with Aperture at runtime instead of through static configuration. Set `accept_registrations` to `true` in the `mcp` section of your configuration. This field requires the `mcp` section and has no equivalent in `connectors`.

```json
{
  "mcp": {
    "accept_registrations": true,
    "servers": {}
  }
}
```

Remote servers register by sending a `POST` request to `/v1/mcp/register` with a JSON body containing their URL:

```shell
curl -X POST http://<aperture-hostname>/v1/mcp/register \
  -H "Content-Type: application/json" \
  -d '{"url": "http://my-mcp-server:8080/v1/mcp"}'
```

Aperture validates the registering server before it responds with `200 OK`. Each dynamically registered server receives a sequential ID such as `auto1` or `auto2`, and Aperture prefixes its tools accordingly, for example `auto1_search`.

> **Warning:**
>
> The registration endpoint requires Tailscale authentication, the same as all other Aperture endpoints. The registering server must be accessible through the tailnet.
>
> The registering server must keep the HTTP connection to `/v1/mcp/register` open. When the server closes the connection, Aperture automatically unregisters all of its tools and resources.

You can combine static connectors and dynamic registration in the same configuration. Static connectors are always available, while dynamically registered servers come and go as they connect and disconnect.

### `mcp` fields

| Field                  | Type    | Default | Description                                                                                                                                                                                                                                                                         |
| ---------------------- | ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accept_registrations` | boolean | `false` | Allow backends to register dynamically through `POST /v1/mcp/register`. Backends send `{"url": "http://..."}` in a `POST` request and keep the connection open. Aperture unregisters their tools when the connection closes. This field has no `connectors` equivalent.             |
| `servers`              | map     | `{}`    | Map of server ID to server configuration. Deprecated: use `connectors.servers` instead. The map key is the server ID, which becomes the name prefix for tools (`serverID_toolname`), resources (`serverID-uri`), and resource templates (`serverID-uriTemplate`) from that backend. |

## Grants for connector resources

Aperture is deny-by-default. Without grants, users cannot access any connector capabilities. This applies to both MCP and HTTP connectors. Add grants in the `grants` section of the Aperture configuration.

Connector grants use the `connectors` field with `"connectorID/category/resource"` FQN glob patterns, or with `label:<name>` patterns that match by [label][ar-connector-labels]. The following example grants all users the built-in Aperture tools through the `system` label, all tools from the `docs` connector, and proxy access to the `github` HTTP connector:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["label:system"]},
          {"connectors": ["docs/tools/*"]},
          {"connectors": ["github/proxy"]}
        ]
      }
    }
  ]
}
```

The `connectors` field accepts an array of FQN glob strings and `label:<name>` strings. Each FQN pattern has up to three segments: `connectorID/category/resource`.

### Grant categories

| Category    | Applies to      | Description                                     | Example               |
| :---------- | :-------------- | :---------------------------------------------- | :-------------------- |
| `tools`     | MCP connectors  | MCP tools exposed by the connector              | `"docs/tools/search"` |
| `resources` | MCP connectors  | MCP resources exposed by the connector          | `"docs/resources/*"`  |
| `templates` | MCP connectors  | MCP resource templates exposed by the connector | `"docs/templates/*"`  |
| `proxy`     | HTTP connectors | Proxy access to the HTTP connector endpoint     | `"github/proxy"`      |

### Grant patterns

You can use `*` to match any characters within a segment and `**` to match across segments:

* `"docs/tools/search"`: the `search` tool from the `docs` connector.
* `"docs/tools/*"`: all tools from the `docs` connector.
* `"docs/**"`: all capabilities from the `docs` connector (tools, resources, templates).
* `"github/proxy"`: proxy access to the `github` HTTP connector.
* `"github/**"`: every category and resource under `github`, including proxy access and any future categories. Use `"github/proxy"` when only HTTP proxy access is needed.
* `"**"`: all capabilities from all connectors.
* `"label:system"`: every connector labeled `system`. By default, this is the built-in `aperture` system connector. This pattern is in the shipped default configuration.
* `"label:team.eng"`: every connector labeled `team.eng`, at every category and resource.

A top-level pattern like `"connectorID/*"` is automatically expanded to `"connectorID/**"`, so it covers all categories and sub-resources.

A `label:<name>` pattern is matched exactly rather than expanded as a glob, and a match grants the whole connector. Refer to [connector labels][ar-connector-labels] for the label grammar and matching rules.

Aperture checks grants when clients list available tools and resources. Users can access only the items their grants permit. Aperture also enforces grants at invocation time: when a client calls a tool, reads a resource, or sends a proxy request, Aperture checks the session's grants before dispatching the request. If no grant matches, Aperture rejects the call with a "forbidden" or "unknown tool" error.

> **Note:**
>
> The deprecated `mcp_tools`, `mcp_resources`, and `mcp_templates` grant fields continue to work for backward compatibility with the `"server/item"` pattern syntax. New configurations should use the `connectors` field, which supports all connector types including HTTP proxy access.
>
> Resource grants are now matched against the resource's name, not its URI. Legacy `mcp_resources` patterns written against resource URIs no longer match. Rewrite them against the resource name using `connectors` with the `resources` category.

Refer to the [grants configuration reference][docs-aperture-grants] for the full grants syntax.

## Migration from `mcp.servers`

The `connectors` section replaces the deprecated `mcp.servers` syntax. At load time, Aperture automatically folds legacy `mcp.servers` entries into `connectors.servers` with `protocol: "mcp"` and no authentication. Both sections can coexist during migration, but connector IDs must be unique across both. Aperture rejects duplicate IDs at load time.

Legacy `mcp.servers` entries that use connector IDs not conforming to the `[a-zA-Z][a-zA-Z0-9]*` pattern generate a warning but are still accepted for backward compatibility. New entries in the `connectors` section must conform to the ID rules.

Consider the following `mcp.servers` entry:

```json
"mcp": { "servers": { "docs": { "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

The equivalent `connectors` entry is:

```json
"connectors": { "servers": { "docs": { "protocol": "mcp", "url": "http://mcp-server.example.ts.net:8185/v1/mcp" } } }
```

The `mcp` section is retained for backward compatibility and for the `accept_registrations` field, which has no `connectors` equivalent.

## Validation errors

Aperture validates connector configuration at load time. The following table describes connector-specific validation messages:

| Condition                                            | Message                                                                                                                                                                  | Severity |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| Connector missing `protocol`                         | `connectors.servers.{id}: protocol is required (e.g. "mcp" or "http")`                                                                                                   | Error    |
| Unsupported connector protocol                       | `connectors.servers.{id}: unsupported protocol "{value}" (supported: "mcp", "http")`                                                                                     | Error    |
| Invalid connector ID                                 | `connectors.servers.{id}: invalid ID "{id}"; connector IDs must match [a-zA-Z][a-zA-Z0-9]* (letters and digits only, starting with a letter; no hyphens or underscores)` | Error    |
| Reserved connector ID (`tailscale`, `internal`)      | `connectors.servers.{id}: "{id}" is a reserved identifier`                                                                                                               | Error    |
| Reserved system connector ID (`aperture`)            | `connectors.servers.{id}: "{id}" is a reserved system connector identifier`                                                                                              | Error    |
| Connector sets an unknown provider                   | `connectors.servers.{id}: unknown provider "{value}"; use a verified ID or omit for custom connectors`                                                                   | Error    |
| Connector missing URL                                | `connectors.servers.{id}: URL is required`                                                                                                                               | Warning  |
| Connector URL uses restricted address                | `connectors.servers.{id}: URL {details}`                                                                                                                                 | Warning  |
| Connector auth validation failure                    | `connectors.servers.{id}.auth: {details}`                                                                                                                                | Error    |
| Invalid connector label                              | `connectors.servers.{id}.labels: invalid label "{label}"; labels must match [a-zA-Z0-9][a-zA-Z0-9._-]* (no slashes)`                                                     | Error    |
| Reserved label on a user connector                   | `connectors.servers.{id}.labels: removed reserved label "system"`                                                                                                        | Warning  |
| Unknown system connector in `system_labels`          | `connectors.system_labels.{id}: unknown system connector ID`                                                                                                             | Error    |
| Duplicate connector ID across `mcp` and `connectors` | `config: server ID "{id}" is defined in both 'mcp.servers' and 'connectors.servers'; IDs must be unique across both sections`                                            | Error    |

Refer to the [Aperture configuration reference][docs-aperture-configuration] for the full validation table.

## Admin REST API endpoints

The following endpoints manage connectors at runtime. They require Tailscale authentication and admin permissions. Other callers receive `403 Forbidden`. Users who are not admins list connectors, review and refresh tools, connect, and disconnect in Aperture Chat. The REST endpoints apply the admin caller's own grants and credentials.

| Method | Path                                | Description                                                                                                              | Access                    |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `GET`  | `/api/connectors`                   | List visible connectors (system, custom, verified) with status for the current user.                                     | Admin                     |
| `GET`  | `/api/connectors/<id>/capabilities` | Get cached MCP capabilities (tools, resources, templates) for a connector. A per-user cache miss can return empty lists. | Admin and connector grant |
| `PUT`  | `/api/connectors/<id>/capabilities` | Force-refresh capabilities from the upstream MCP server. Upstream errors can fail the request.                           | Admin and connector grant |
| `POST` | `/api/connectors/<id>/connect`      | Start a per-user OAuth flow. Returns `{"auth_url": "..."}`.                                                              | Admin and connector grant |
| `POST` | `/api/connectors/<id>/disconnect`   | Forget the current user's OAuth token for a connector.                                                                   | Admin and connector grant |
| `GET`  | `/api/connectors-registry`          | List the verified connectors registry (pre-configured providers).                                                        | Admin                     |

The HTTP connector proxy endpoint uses `/v1/connectors` rather than the admin REST API:

| Method        | Path                         | Description                                        | Access                             |
| ------------- | ---------------------------- | -------------------------------------------------- | ---------------------------------- |
| Any supported | `/v1/connectors/<id>/<path>` | Reverse proxy to an HTTP connector's upstream URL. | Requires `connectorID/proxy` grant |

## Full annotated example

The following example shows a complete connector configuration with both MCP and HTTP protocols, authentication, grants, and dynamic registration:

```json
{
  // Outbound integrations (MCP servers and HTTP APIs)
  "connectors": {
    "servers": {
      // Unauthenticated MCP server in your tailnet
      "tailnetMCP": {
        "protocol": "mcp",
        "url": "http://mcp-server.example.ts.net:8080/v1/mcp"
      },
      // MCP server with bearer token auth, grouped by label
      "snowflake": {
        "protocol": "mcp",
        "url": "https://mcp.example.com/v1/mcp",
        "labels": ["analytics", "restricted"],
        "auth": {
          "type": "bearer_token",
          "secret": "sk-example-token"
        }
      },
      // HTTP API proxy with OAuth 2.0 client credentials
      "analytics": {
        "protocol": "http",
        "url": "https://analytics.example.com/api",
        "description": "Analytics API (read-only)",
        "auth": {
          "type": "oauth2_client_credentials",
          "client_id": "aperture-analytics",
          "client_secret": "secret-example",
          "token_url": "https://auth.example.com/oauth2/token",
          "scopes": ["read:data"]
        }
      }
    }
  },

  // Dynamic MCP registration (accept_registrations has no connectors equivalent)
  "mcp": {
    "accept_registrations": true
  },

  // Grant all users the built-in Aperture tools (the shipped default) and,
  // separately, everything the analytics team needs by label
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"role": "user"},
          {"connectors": ["label:system"]}
        ]
      }
    },
    {
      "src": ["group:analytics"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["label:analytics"]}
        ]
      }
    }
  ]
}
```

## Troubleshooting

Connector problems fall into two flows with different causes and fixes: an admin setting up and configuring a connector, and a user authorizing and using a connector's tools. Use the section that matches your role.

The connector list and **Ready** status do not probe upstream health. **Refresh tools** is the explicit upstream capability check.

### For admins setting up connectors

These issues affect connector configuration and reachability. Admins manage and verify configuration and grants under **Administration** > **Connectors**.

#### Missing Chat connectors or tools

If a configured connector does not appear in Chat, it may be grant-denied and omitted. Admins verify connector configuration and grants under **Administration** > **Connectors**.

For missing MCP tools, the admin verifies the upstream URL, authentication configuration, and capability filters. A granted user then opens the connector detail page in Chat and selects **Refresh tools**. If refresh returns an error, verify reachability from the Aperture gateway and confirm credential validity.

#### Connection refused or host not found

These errors indicate the connector URL is unreachable from the Aperture gateway.

* **Connection refused**: The server is not running or is not listening on the configured port.
* **Host not found**: DNS cannot resolve the hostname. For tailnet hostnames, verify the device is connected to the tailnet and check with `tailscale status`.

#### Auth configuration rejected with unknown field error

The `auth` block uses strict field validation. If a field name is misspelled (for example, `"secert"` instead of `"secret"`), the configuration fails to load with a JSON decoder error. Double-check field names against the auth types table above.

#### Dynamic registration fails

If remote servers cannot register dynamically:

1. Verify `accept_registrations` is set to `true` in the `mcp` section of your configuration (this field is not available in the `connectors` section).
2. Make sure the remote server sends a valid `POST` request to `/v1/mcp/register` with a JSON body containing `{"url": "<mcp-server-url>"}`.
3. The remote server must keep the HTTP connection open after registration. If the connection closes, Aperture unregisters the server's tools immediately.

### For users authorizing and using connectors

These issues affect authorizing a connector and calling its tools. Users can check status, refresh tools, and reconnect in Aperture Chat. If a refresh or tool call still fails after authorization, an admin might need to check the upstream service or the connector configuration.

#### Authorizing and reconnecting

* **Connect**: Each user must authorize a per-user OAuth connector individually. Select **Connect** and complete the provider's consent flow. If tools are still missing after the connector is **Ready**, select **Refresh tools**. Discovery can fail while the upstream is unreachable.
* **Needs reconnect**: The access token expired without a refresh token, or a token-refresh failure requires new consent. Select **Reconnect**. If the problem recurs after token expiry, ask your admin to check the provider's offline-access configuration.
* **Temporarily unavailable**: Aperture could not read the credential state. Reload the page. Reconnecting is not necessary.
* **Reset authorization**: To clear your per-user authorization, select **Disconnect**. Then select **Connect** to authorize again.

#### Tools stop working after previously working

If a connector is **Ready** but its tools fail, check for temporary provider downtime, timeouts, or rate limits. Do not disconnect a valid authorization only because a tool call fails.

#### Tool calls time out

If tool calls fail with timeout errors, the remote MCP server is not responding quickly enough. After a connection error, Aperture reconnects to the remote server and retries the tool call one time. If timeouts continue, ask your admin to check the remote server's performance and logs.

[ar-capability-population]: #capability-population

[ar-connect-flow]: #initiating-the-flow

[ar-connector-labels]: #connector-labels

[ar-dcr]: #dynamic-client-registration-oauth2_dcr

[ar-the-reserved-system-label]: #the-reserved-system-label

[ar-token-lifecycle]: #token-lifecycle

[ar-validation-errors]: #validation-errors

[docs-aperture-admin-connectors]: /docs/aperture/reference/dashboard-admin#connectors

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[xt-mcp-spec]: https://modelcontextprotocol.io/specification

[xt-rfc-7591]: https://www.rfc-editor.org/rfc/rfc7591

[xt-rfc-8414]: https://www.rfc-editor.org/rfc/rfc8414

[xt-rfc-9728]: https://www.rfc-editor.org/rfc/rfc9728
