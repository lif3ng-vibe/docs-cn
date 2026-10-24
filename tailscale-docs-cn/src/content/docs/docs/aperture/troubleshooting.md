---
title: "Troubleshooting Aperture"
description: "Common Aperture by Tailscale error conditions, their causes, and resolution steps."
---

Last validated Sep 29, 2026

Use the following sections to diagnose and resolve common issues with [Aperture by Tailscale][docs-aperture].

| Symptom                                                                     | Likely cause                                              |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| [Cannot connect using hostname][ar-cannot-connect-hostname]                 | MagicDNS disabled, wrong URL                              |
| [HTTP 403 error][ar-http-403]                                               | Missing role grant                                        |
| [Device becomes unreachable][ar-device-unreachable]                         | Key expiry                                                |
| [HTTP 429 errors][ar-http-429]                                              | Quota misconfiguration                                    |
| [Mullvad exit nodes][ar-mullvad-collision]                                  | Mullvad IP collision                                      |
| [All sessions from same user][ar-same-user-sessions]                        | Tag-based identity                                        |
| [HTTPS connection issues][ar-https-issues]                                  | URL scheme or hostname does not match client requirements |
| [Client connection issues][ar-client-connection]                            | Wrong base URL or missing auth                            |
| [HTTP 405 error][ar-http-405]                                               | Double `/v1` in base URL                                  |
| [HTTP 404 on `/v1/responses` or `/v1/messages`][ar-http-404-compat]         | Missing compatibility flag                                |
| [Web portal access issues][ar-portal-access]                                | Portal access disabled or no chat-compatible model        |
| [Connector validation errors][ar-connector-validation]                      | Invalid ID, missing protocol, or auth misconfiguration    |
| [OAuth 2.0 authorization fails][ar-oauth-auth-fails]                        | Wrong `auth_url`, callback mismatch, or expired flow      |
| [HTTP connector returns unexpected errors][ar-http-connector-errors]        | 502 from upstream, 405 for unsupported methods            |
| [HTTP connector returns 403 Forbidden][ar-http-connector-403]               | Missing `connectors` grant for proxy access               |
| [Tools from per-user OAuth connector do not appear][ar-oauth-tools-missing] | Lazy population: user must authorize first                |
| [Refresh token failure][ar-refresh-token-failure]                           | Stored credential expired, user must re-authorize         |

## Client connection issues

If your client cannot connect or you cannot find its requests in Aperture:

* Confirm the base URL in your client configuration matches your Aperture hostname. For most tools, the URL is `http://<aperture-hostname>` or `http://<aperture-hostname>/v1`.
* Confirm your client has a valid authentication entry. Most tools require a placeholder API key (such as `-`) even though Aperture injects the real credentials.
* Verify your device can reach Aperture by opening its hostname in a browser. If portal access is disabled for your account, ask an administrator to verify connectivity.
* If you [connect from outside your tailnet][docs-connect-outside-tailnet], confirm the Aperture CLI bridge or `ts-unplug` proxy is running and use `http://localhost:<port-number>` instead of `http://<aperture-hostname>`.

Retry the request and look for it on your [**Sessions** page][docs-chat-sessions]. Admins can also check the [**Logs** page][docs-admin-logs]. If the request appears, the connection works.

For client-specific settings, refer to [Set up LLM clients][docs-use-your-tools]. The [Aperture CLI][docs-cli] handles base URLs and authentication automatically.

## All sessions appear to come from the same user

If you use tag-based identities to authenticate user devices, all LLM sessions from those devices appear to come from the same user. Tailscale tags do not provide per-user identity. They are intended for service account or server device authentication, not individual user authentication. For example, you might use a tag identity for a fleet of PostgreSQL database servers. Refer to the [tags topic][docs-tags] for more information.

To resolve this issue, make sure that users connect to Aperture from devices associated with their individual Tailscale accounts. After switching to individual accounts, verify that new sessions on the admin dashboard's **Logs** page display distinct user names. For details on how Aperture resolves identity for tagged nodes, refer to the [tagged device identity topic][docs-aperture-tagged-identity].

## HTTPS connection issues

Use the URL scheme required by your client. Most Aperture clients use `http://<aperture-hostname>` over Tailscale's encrypted network. Claude Desktop requires the gateway's `https://` URL and rejects HTTP. Check the client-specific setup instructions rather than changing every client to HTTP. The [Aperture CLI][docs-cli] configures the appropriate URL for supported clients.

If the hostname does not resolve, MagicDNS might be disabled. Refer to [cannot connect to Aperture using hostname][ar-cannot-connect-hostname].

## Cannot connect to Aperture using hostname

If you cannot connect to Aperture using its short hostname (for example, `http://<aperture-hostname>`), [MagicDNS][docs-magicdns] might be disabled in your tailnet. Aperture relies on MagicDNS to resolve its hostname. When MagicDNS is off, the hostname does not resolve, and connection attempts fail.

Do not use `tailscale ping` to diagnose this issue. `tailscale ping` succeeds even when MagicDNS is disabled because it routes traffic through DERP relay using the Tailscale IP address directly. Instead, run `tailscale dns status` to verify that MagicDNS is active, or check the [DNS](https://console.tailscale.com/admin/dns) settings page of the Tailscale admin console.

You can also run `nslookup <hostname>.<tailnet>.ts.net` to test resolution directly. Replace `<hostname>` with your Aperture hostname. The default is `ai`, but you might use a custom name. If the generated client configurations show a placeholder URL such as `http://your-aperture-host`, MagicDNS is likely not enabled.

To resolve this issue, enable MagicDNS in the Tailscale admin console under [DNS](https://console.tailscale.com/admin/dns) settings. Refer to the [MagicDNS topic][docs-magicdns] for setup instructions. Alternatively, bypass hostname resolution by using the Tailscale IP address directly (for example, `http://<tailscale-ip>/` instead of `http://<aperture-hostname>/`). You can find the Aperture device's IP address on the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

## HTTP 403 access denied error

An HTTP 403 error with the message `access denied: no role granted` indicates a missing or misconfigured grant. Aperture uses two independent layers of access control. You must configure both:

1. **tailnet access control rule**: A rule in the tailnet policy file that permits network connections to the Aperture device. Without this rule, the connection fails before reaching Aperture.
2. **Aperture grant**: A grant in the [Aperture configuration][docs-aperture-configuration] that assigns a user or group a role. Without a role grant, Aperture returns HTTP 403.

If a user has a role but lacks access to the requested model, Aperture returns HTTP 404. For a [model alias][docs-model-aliases], check access to its destination, not the alias name.

Common causes of this 403 error are a missing role grant or an incorrect `src` pattern. The `src` field requires an exact match. For tagged devices, it must match the exact comma-joined tag string that Aperture generates. Refer to the [tagged device identity topic][docs-aperture-tagged-identity] for details.

For grant configuration steps, refer to [grant access to models][docs-grant-model-access] and [set up admin access][docs-set-up-admin-access].

Use the [Preview rules](https://console.tailscale.com/admin/acls/preview) in the Tailscale admin console to check that the user's device can reach the Aperture gateway. Then check that the Aperture configuration includes a grant with a `src` pattern matching the connecting user or tag. If the 403 errors are intermittent and correlate with VPN use, refer to [intermittent failures with Mullvad exit nodes][ar-mullvad-collision] for a related cause.

## Web portal access issues

Check portal access separately from model access:

* **Cannot open the web portal**: The web portal is available by default, so a grant that sets `enable_portal` to `false` (or legacy configurations using `enable_chat_ui: false`) is the usual cause. Confirm no grant disables it for the user.
* **Chat picker is empty**: The user can open the web portal but has no chat-compatible model. Confirm the user's `models` grant covers at least one model whose provider declares a chat-compatible `compatibility` flag (`anthropic_messages`, `openai_chat`, `openai_responses`, `gemini_generate_content`, or `google_generate_content`).
* **A granted, chat-compatible model is missing**: The model's provider is likely configured in [passthrough mode][docs-use-passthrough-mode] with no fallback `apikey`. A passthrough-only provider serves only requests that carry a client credential, so Aperture hides its models from the portal's chat interface even though they still appear in the `/v1/models` endpoint. To make the model available in chat, configure a fallback `apikey` for the provider.
* **Expected models are missing**: If you curate the picker with `chat_models`, only models matching a non-`hidden` entry appear. Confirm the model matches an entry.

For setup steps, refer to [set up the chat UI][docs-set-up-chat-ui].

## Aperture device becomes unreachable

If your Aperture gateway becomes unreachable, check whether its device is expired or missing on the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console.

Aperture displays a warning banner in the admin dashboard when a node key is within 7 days of expiring. This banner is visible only to admin users.

If the device has expired or was deleted, contact [Tailscale support][co-contact-support] to restore gateway access. To prevent key expiry, disable it for the Aperture device from the [Machines](https://console.tailscale.com/admin/machines) page. Refer to the [key expiry documentation][docs-key-expiry] for more information.

## HTTP 429 rate limit errors

If you receive an HTTP 429 rate limit error when you expect to have access, a quota in the Aperture configuration is likely misconfigured. If Aperture cannot parse a quota configuration, it rejects all requests matching that quota with a 429 error. Common causes include a typo in the quota bucket name, an invalid quota value, or a quota limit set to zero.

Check the Aperture configuration for misspelled quota bucket names and invalid values, then correct them. Refer to the [quota configuration topic][docs-aperture-quotas] for the expected syntax. If you do not need custom quotas, remove the quota field entirely to use the default settings. For steps to check and refill budgets, refer to [check and refill budgets][docs-monitor-quota-balances].

## Intermittent failures with Mullvad exit nodes

If you experience intermittent 403 errors or connection failures when accessing Aperture while a Mullvad exit node is active, the cause is an IP address range collision. Tailscale assigns device addresses from the CGNAT range `100.64.0.0/10`, and Mullvad also uses addresses in this range. When a Mullvad exit node is active, traffic destined for Tailscale addresses can be misrouted through Mullvad, causing grant evaluation failures that are indistinguishable from [grant permission issues][ar-http-403].

To confirm this is the cause, disconnect from the Mullvad exit node and retry the connection. If the errors stop, use [Tailscale exit nodes][docs-exit-nodes] instead, or exclude the Tailscale interface from Mullvad's routing configuration if your Mullvad client supports split tunneling.

## HTTP 405 error from upstream provider

If every request returns HTTP 405 Method Not Allowed from the upstream provider, the provider's `baseurl` likely includes a path segment, typically `/v1`, that duplicates a segment in the request path. Aperture appends the full incoming request path to `baseurl`, so a `baseurl` like `https://ai-gateway.vercel.sh/v1` produces an upstream URL of `https://ai-gateway.vercel.sh/v1/v1/chat/completions`.

To resolve this issue, remove the path segment from `baseurl`. For cloud providers, `baseurl` should be the API root without `/v1`. For example, use `https://api.openai.com` instead of `https://api.openai.com/v1`. Refer to the [provider matrix][docs-provider-compatibility] for the correct `baseurl` for each provider. For details on how Aperture constructs upstream URLs, refer to [how Aperture builds upstream URLs][docs-aperture-url-construction].

## HTTP 404 on /v1/responses or /v1/messages

If requests to `/v1/responses` or `/v1/messages` return HTTP 404 but `/v1/chat/completions` works, the provider's `compatibility` block does not include the corresponding flag. When `compatibility` is omitted entirely, only `openai_chat` is enabled by default. The `openai_responses` and `anthropic_messages` flags must be set explicitly.

To resolve this issue, add the appropriate flag to the provider's `compatibility` block:

```json
{
  "compatibility": {
    "openai_chat": true,
    "openai_responses": true,
    "anthropic_messages": true
  }
}
```

Set `openai_responses` to `true` to enable the `/v1/responses` endpoint, or `anthropic_messages` to `true` to enable `/v1/messages`. Refer to the [compatibility flags topic][docs-provider-compatibility-flags] for the full list of flags.

## Connector validation errors

If Aperture rejects a configuration save with a connector-related error, check the connector definition. The following table lists common validation errors and their causes.

| Error                | Cause                                                                                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invalid connector ID | The `id` field must match the pattern `[a-zA-Z][a-zA-Z0-9]*`. IDs must start with a letter and contain only letters and digits.                                                                                                        |
| Protocol required    | Each connector must specify `"protocol": "mcp"` or `"protocol": "http"`.                                                                                                                                                               |
| Reserved ID          | The IDs `tailscale` and `internal` are reserved, as are the IDs of Aperture's built-in system connectors (currently `aperture`). You cannot use these for user-defined connectors.                                                     |
| Duplicate ID         | A connector ID must be unique across both `mcp.servers` and `connectors.servers`. If the same ID appears in both sections, validation fails.                                                                                           |
| Missing auth fields  | A `bearer_token` auth block requires a `secret` field. An `oauth2_authorization_code` auth block requires `client_id`, `auth_url`, and `token_url`. The `client_secret` field is optional (not required for PKCE-only public clients). |

To resolve these errors, correct the connector definition in your configuration and save again. Refer to the [connectors configuration reference][docs-aperture-connectors-config] for the full schema.

## OAuth 2.0 authorization fails

If an OAuth 2.0 authorization flow fails during the consent screen, callback, or token exchange, the connector's `oauth2_authorization_code` configuration is incorrect or the flow has expired. The following symptoms indicate the specific failure:

| Symptom                                                                   | Cause                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization fails after the consent screen has been open too long       | The authorization flow was not completed within 15 minutes. The user must start the flow again.                                       |
| Authorization is rejected because it was not started by the current user  | The user completing the callback is not the same user who initiated the flow.                                                         |
| Authorization is rejected because the application identity does not match | The `client_id` returned in the callback does not match the connector's configured `client_id`.                                       |
| Authorization fails at the final token exchange step                      | The token exchange with the OAuth 2.0 provider failed. Check that `client_id`, `client_secret`, and `token_url` are correct.          |
| The callback is rejected because a required parameter is missing          | A required parameter is missing from the callback URL. This usually indicates a misconfigured redirect URI at the OAuth 2.0 provider. |

Common causes include:

* An incorrect `auth_url` that points to the wrong provider endpoint.
* A callback URL that does not match the OAuth 2.0 provider's registered redirect URIs.
* Missing `auth_params` required by the provider. For example, Google requires `"access_type": "offline"` to issue a refresh token.

## HTTP connector returns unexpected errors

If an HTTP connector returns errors unrelated to your application logic, the issue is likely in how Aperture proxies the requests. The following table lists common error responses and their causes.

| Response                            | Cause                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 502 Bad Gateway                     | The upstream server returned an error or is unreachable. Verify that the connector's `url` is correct and the upstream server is running. |
| 502 Bad Gateway (malformed request) | The request to the upstream server could not be constructed. Check that the connector's `url` is a valid URL.                             |
| 405 Method Not Allowed              | The HTTP method is not supported. Aperture blocks `TRACE` requests and can block other methods depending on the connector configuration.  |
| 404 Not Found                       | The connector ID in the request path does not match any configured connector.                                                             |

Aperture strips the `Authorization`, `Cookie`, and `Set-Cookie` headers from proxied HTTP connector requests and responses for security. If the upstream server requires authentication, configure it through the connector's `auth` block rather than passing headers directly.

Aperture enforces a 50 MB response body limit for HTTP connector responses. Responses exceeding this limit are truncated.

## HTTP connector returns 403 Forbidden

If an HTTP connector returns 403 Forbidden, the connecting user does not have a `connectors` grant that permits access to the connector's proxy endpoint. Aperture requires a grant with a pattern matching `<connector-id>/proxy` or a broader pattern like `<connector-id>/**`.

To resolve this issue, add a `connectors` grant to the user's Aperture grant configuration:

```json
{
  "grants": [
    {
      "src": ["autogroup:members"],
      "app": {
        "tailscale.com/cap/aperture": [
          {"connectors": ["github/proxy"]}
        ]
      }
    }
  ]
}
```

Replace `github` with the connector ID and adjust the `src` pattern to match the appropriate users or groups. Refer to the [connectors feature guide][docs-aperture-connectors] for details on grant patterns.

## Tools from per-user OAuth connector do not appear

If a connector uses `oauth2_authorization_code` or `oauth2_dcr` authentication and its tools do not appear for a user, the user checks the connector on the **Connectors** page in Aperture Chat:

* **Connect**: The user has not authorized the connector. Each user must authorize the connector individually, because the credentials are per-user, not shared. The user selects **Connect** and completes consent.
* **Ready**: The user has authorized the connector, but tool discovery did not complete. Aperture tries to discover tools after consent, and discovery can fail if the upstream is slow or unreachable. The user opens the connector's detail page and selects **Refresh tools**. If the refresh fails, check that Aperture can reach the upstream server.

For the user's steps, refer to [Use a connector][docs-connectors-use].

## Refresh token failure

If a previously working per-user OAuth connector shows **Needs reconnect**, its stored authorization is no longer usable. This happens in two cases:

* The access token expired, and the OAuth 2.0 provider did not issue a refresh token.
* The provider rejected a token refresh and requires new consent.

Common causes include the OAuth 2.0 provider revoking the refresh token due to inactivity, the user revoking access from the provider's account settings, or the provider's refresh token lifetime expiring. A temporary refresh failure, such as a timeout, does not change the connector's status.

For Google OAuth 2.0 connectors, make sure that `auth_params` includes `"access_type": "offline"` to request a refresh token during authorization. Without this parameter, Google issues only a short-lived access token.

To resolve this issue, the user selects **Reconnect** in Aperture Chat and completes consent again. Refer to [Reconnect when tools stop working][docs-connectors-use-reconnect].

## Related

These references provide more detail about the interfaces and settings used in troubleshooting:

* [Aperture by Tailscale documentation][docs-aperture]
* [Aperture configuration reference][docs-aperture-configuration]
* [Supported providers and clients][docs-provider-compatibility]
* [Connectors feature guide][docs-aperture-connectors]
* [Connectors configuration reference][docs-aperture-connectors-config]
* [Chat interface reference][docs-chat]
* [Admin dashboard reference][docs-admin-console]

## Get help

If the issue persists after following the troubleshooting steps, contact [Tailscale support][co-contact-support]. Include the relevant configuration with secrets redacted, error messages, and the steps you have tried.

[ar-cannot-connect-hostname]: #cannot-connect-to-aperture-using-hostname

[ar-client-connection]: #client-connection-issues

[ar-connector-validation]: #connector-validation-errors

[ar-device-unreachable]: #aperture-device-becomes-unreachable

[ar-http-403]: #http-403-access-denied-error

[ar-http-404-compat]: #http-404-on-v1responses-or-v1messages

[ar-http-405]: #http-405-error-from-upstream-provider

[ar-http-429]: #http-429-rate-limit-errors

[ar-http-connector-403]: #http-connector-returns-403-forbidden

[ar-http-connector-errors]: #http-connector-returns-unexpected-errors

[ar-https-issues]: #https-connection-issues

[ar-mullvad-collision]: #intermittent-failures-with-mullvad-exit-nodes

[ar-oauth-auth-fails]: #oauth-20-authorization-fails

[ar-oauth-tools-missing]: #tools-from-per-user-oauth-connector-do-not-appear

[ar-portal-access]: #web-portal-access-issues

[ar-refresh-token-failure]: #refresh-token-failure

[ar-same-user-sessions]: #all-sessions-appear-to-come-from-the-same-user

[co-contact-support]: https://tailscale.com/contact/support

[docs-admin-console]: /docs/aperture/reference/dashboard-admin

[docs-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-aperture-tagged-identity]: /docs/aperture/how-aperture-works#tagged-device-identity

[docs-aperture-url-construction]: /docs/aperture/configuration#how-aperture-builds-upstream-urls

[docs-aperture]: /docs/aperture

[docs-chat-sessions]: /docs/aperture/reference/chat#sessions

[docs-chat]: /docs/aperture/reference/chat

[docs-cli]: /docs/aperture/cli

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-connectors-use-reconnect]: /docs/aperture/connectors/use-a-connector#reconnect-when-tools-stop-working

[docs-connectors-use]: /docs/aperture/connectors/use-a-connector

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-magicdns]: /docs/features/magicdns

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-monitor-quota-balances]: /docs/aperture/how-to/check-and-refill-budgets

[docs-provider-compatibility-flags]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-provider-compatibility]: /docs/aperture/reference/supported-providers-clients#provider-matrix

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-tags]: /docs/features/tags

[docs-use-passthrough-mode]: /docs/aperture/how-to/use-passthrough-mode

[docs-use-your-tools]: /docs/aperture/use-your-tools
