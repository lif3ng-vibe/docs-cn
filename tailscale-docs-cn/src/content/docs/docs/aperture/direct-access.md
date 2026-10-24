---
title: "Direct provider access"
description: "Direct provider access adds a `/direct` endpoint that forwards a request to a configured provider's own API and returns the provider's response largely as sent. Aperture authenticates the caller throu"
---

Last validated Sep 28, 2026

Direct provider access adds a `/direct` endpoint that forwards a request to a configured provider's own API and returns the provider's response largely as sent. Aperture authenticates the caller through [Tailscale identity][docs-tailscale-identity] and injects the provider credential from your configuration, so clients reach provider endpoints without holding a provider API key.

Aperture's standard endpoints normalize every request into the chat completions and messages APIs. That covers text generation, but it means Aperture can only route models that speak those APIs. Models in other modalities, such as embedding, image, audio, and video models, do not fit the chat request shape and cannot be routed through the standard endpoints at all.

Direct provider access is how you reach them. Because `/direct` passes the request through to the provider's own API, any model the provider exposes becomes reachable, regardless of modality. The same endpoint also covers the non-inference parts of a provider's surface, such as model listings, file uploads, and batch jobs.

A request sent to `/direct` also skips model routing, quotas, hooks, and usage accounting. Review the [limitations][ar-limitations] before you route production traffic through it.

The endpoint, the grant syntax, and this page can change while the feature is in private alpha. Refer to this page after an Aperture upgrade instead of relying on a cached copy of these steps.

## Prerequisites

Before you set up direct provider access, you need the following:

* The [admin role][docs-set-up-admin-access] in Aperture, which is required to change feature flags, edit grants, and review the direct access logs.
* At least one [configured provider][docs-set-up-providers] with working credentials.
* Network access to the Aperture gateway from the client that sends requests.

## Get started

Setting up direct provider access takes four steps: enable the feature flag, grant direct path access to an identity, send a request, and confirm the request in the logs.

### Step 1: Enable the direct access API flag

Until you enable the `direct_access_api` flag, `/direct` returns `501 Not Implemented`. To enable it, add it to the [`flags`][docs-aperture-flags] section of your Aperture configuration:

```json
{
  "flags": {
    "direct_access_api": {
      "value": true
    }
  }
}
```

### Step 2: Grant direct path access

Aperture is deny-by-default, and the `direct_paths` capability is separate from `models`. A user with full model access still receives `403 Forbidden` from `/direct` until a grant lists a matching direct path.

Add a `direct_paths` entry to a grant in the [`grants`][docs-aperture-grants] section. Each entry pairs an HTTP method selector with a `provider/path` glob:

```json
{
  "grants": [
    {
      "src": ["alice@example.com"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "direct_paths": ["POST openai/v1/embeddings"] }
        ]
      }
    }
  ]
}
```

This grant lets `alice@example.com` call the embeddings endpoint on the provider configured under the `openai` key, and nothing else. That account cannot reach image generation, file uploads, or any other path on that provider without a further entry. Start narrow. For the full pattern syntax, refer to [direct path grant syntax][ar-direct-path-grant-syntax].

### Step 3: Send a request

Send the request to `/direct/{provider}/{path}`, where `{provider}` is the key of a provider in your `providers` configuration and `{path}` is the path on that provider's API. The client sends no provider credential because Aperture attaches the configured one:

```shell
curl http://<aperture-hostname>/direct/openai/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model": "text-embedding-3-small", "input": "the quick brown fox"}'
```

The response is the provider's own embeddings payload, which no standard Aperture endpoint can produce because embedding models do not use the chat completions API. The model does not need to appear in the provider's `models` list.

Aperture identifies the caller from the Tailscale connection, matches the method and path against the caller's `direct_paths` grants, then forwards the request to the provider's base URL. The provider's response body and status code return to the client as sent, apart from the header adjustments described in [request routing and responses][ar-request-routing-and-responses].

### Step 4: Review the direct access logs

Requests that match a grant are logged, including those the provider rejects. Requests that Aperture itself refuses are not. A `501` from a disabled flag and a `403` from the absence of a matching grant do not appear in the log. To review the log:

\[Missing snippet: aperture\_admin\_nav.mdx]

The log explorer shows one row per request with the time, level, calling identity and tags, provider, status code, method, path, duration, and bytes transferred. Select a time window, then filter with a Go regular expression to narrow results. The default time window covers the last three hours. You can search requests from up to seven days ago.

This page is admin-only, and it appears in the sidebar only while the `direct_access_api` flag is enabled.

## Direct path grant syntax

Each entry in `direct_paths` is a method selector and a path glob, separated by whitespace:

```text
METHOD[,METHOD...] PROVIDER/PATH
```

The method selector is either `*`, which matches every method, or a comma-separated list of uppercase HTTP methods drawn from `CONNECT`, `DELETE`, `GET`, `HEAD`, `OPTIONS`, `PATCH`, `POST`, `PUT`, and `TRACE`. The selector is required, so a pattern with no method does not validate.

The path glob is matched against `provider/path`, relative to `/direct`. It uses the same matching as `models` patterns:

| Wildcard             | Matches                                        |
| -------------------- | ---------------------------------------------- |
| `*`                  | Exactly one path segment                       |
| `**`                 | Zero or more path segments                     |
| `*` within a segment | Any sequence of characters inside that segment |

The following table shows representative patterns:

| Pattern                             | Effect                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `POST openai/v1/embeddings`         | Embedding models on one provider                                           |
| `POST openai/v1/images/generations` | Image models on one provider                                               |
| `POST */v1/embeddings`              | Embedding models on every configured provider                              |
| `GET openai/v1/models`              | A single read-only endpoint on one provider                                |
| `GET,POST anthropic/v1/**`          | Read and write access to every path under `v1` on one provider             |
| `* */**`                            | Every method, provider, and path. Equivalent to unrestricted direct access |

A pattern must include a provider segment and at least one path segment. It cannot contain a query string, a fragment, a leading or trailing slash, or an empty segment. Aperture reports invalid patterns as configuration warnings and blocks saves through the admin dashboard or API.

Grants are additive. A caller's effective direct access is the union of every `direct_paths` entry across every grant whose `src` matches their identity, which follows the model described in [how Aperture grants work][docs-how-grants-work].

## Request routing and responses

Aperture strips the `/direct/{provider}` prefix and joins the remaining path to the provider's configured base URL. Percent-encoded characters are preserved, so a path segment containing `%2F` reaches the provider unchanged. Query strings pass through untouched.

Authentication follows the provider's configured `authorization` and `apikey` settings, identical to a request sent to Aperture's standard endpoints. A provider set to `passthrough` auth mode still accepts a client-supplied credential.

Forwarding is a byte-for-byte passthrough with one exception. Aperture removes `Access-Control-*` headers from the provider's response, so a browser client does not receive the provider's CORS headers.

The endpoint returns the following Aperture-generated responses:

| Status                | Condition                                                                  |
| --------------------- | -------------------------------------------------------------------------- |
| `501 Not Implemented` | The `direct_access_api` flag is disabled                                   |
| `403 Forbidden`       | No `direct_paths` entry in the caller's grants matches the method and path |
| `404 Not Found`       | The provider ID is not present in the `providers` configuration            |
| `502 Bad Gateway`     | Aperture could not reach the provider                                      |

Any other status comes from the provider.

## Limitations

Direct provider access has the following limitations:

* **No inference processing.** Requests skip model routing, guardrails, hooks, and request and response capture. Model-scoped grants and grant-level `add_headers` entries do not apply. Provider-level `add_headers` still apply.
* **No usage or cost accounting.** Direct requests do not consume quotas, do not appear in spending reports, and produce no token or cost records. The provider still bills for the work, so spend on embedding and image models reached through `/direct` is invisible to Aperture. A caller with a `direct_paths` grant can also reach a provider's chat endpoints without any budget enforcement.
* **Observability is limited to metadata.** The direct access log records the identity, provider, method, path, status, duration, byte count, and user agent. It does not record request or response bodies, and it does not emit metrics. Requests that Aperture denies are not recorded at all, so the log is not a source for auditing rejected access attempts.
* **Grant patterns match paths only.** A `direct_paths` pattern cannot constrain query parameters, headers, or request bodies. Narrow access by method and path, and treat write methods accordingly.
* **The flag is gateway-wide.** Enabling `direct_access_api` activates `/direct` for every identity whose grants carry `direct_paths`. Scope access through grants, not through the flag.
* **Logs require the admin role.** Non-admin callers receive `403 Forbidden` from the log API, and the sidebar entry is hidden for them.

## Related

The following topics cover the configuration sections and concepts that direct provider access depends on:

* [Aperture configuration][docs-aperture-configuration]: The full configuration reference, including the `grants` and `flags` sections.
* [How Aperture grants work][docs-how-grants-work]: The grants model, including deny-by-default access and precedence.
* [Set up providers][docs-set-up-providers]: Configure the providers that `/direct` forwards to.
* [Observe and export][docs-aperture-observe]: Aperture's logging, reporting, and export options for routed requests.

[ar-direct-path-grant-syntax]: #direct-path-grant-syntax

[ar-limitations]: #limitations

[ar-request-routing-and-responses]: #request-routing-and-responses

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-flags]: /docs/aperture/configuration#flags

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-observe]: /docs/aperture/observe-and-export

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-providers]: /docs/aperture/set-up-providers

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
