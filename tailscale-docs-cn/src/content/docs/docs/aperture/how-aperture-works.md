---
title: "How Aperture works"
description: "Understand how Aperture uses Tailscale identity, model-based routing, and telemetry to secure and monitor LLM requests."
---

Last validated Oct 1, 2026

Aperture routes the AI requests that clients send through its gateway, which gives organizations visibility into that traffic. This topic explains the four core mechanisms: identity and authentication, request routing by model, telemetry capture, and session tracking. Together, these enable auditing, cost awareness, and operational insight while letting teams safely adopt LLM clients.

\[Missing snippet: aperture\_openai\_compatible\_provider.mdx]

## Identity and authentication

Traditional API proxies require clients to authenticate with tokens or API keys. You can eliminate this step by using [Tailscale's identity layer][docs-tailscale-identity].

Every connection to a tailnet carries cryptographic proof of identity. When a request arrives at Aperture, the proxy queries Tailscale with the remote IP address. Tailscale responds with the user's login name (for example, `alice@example.com`), a persistent device identifier, and any tags assigned to that device.

This identity is trustworthy because it comes from Tailscale's control plane, not from the client. A user cannot forge their identity without compromising Tailscale's key exchange.

The identity flows through the entire system. Every metric record includes the login name and device ID. Users access only their own sessions and usage in the web portal. Admins can filter organization-wide views by user in the admin dashboard. Access control uses roles assigned through grants, keyed on Tailscale identity.

Clients [connecting from outside the tailnet][docs-aperture-connect-outside-tailnet] also authenticate through Tailscale identity. Each Aperture CLI bridge or `ts-unplug` instance joins the tailnet as its own device, so Aperture identifies requests by that device's login name. If each person runs their own instance, Aperture attributes activity to individual users. If multiple people share a single instance, all activity appears under the same identity.

### Tagged device identity

When a [tagged Tailscale device][docs-tags] connects to Aperture, it does not have a user account associated with it. Instead, Aperture creates a synthetic identity from the device's tags.

Aperture sorts the device's tags alphabetically and joins them with commas to create a stable login name. For example, a device with the tags `tag:prod` and `tag:api` appears as `tag:api,tag:prod` in usage views, logs, and session tracking.

If a device has no user profile and no tags, identity resolution fails, and the device is denied access.

To give tagged devices model access, a grant can match every device with a particular tag. It can also match every device with an exact tag set by using the synthetic login name. For `src` examples and configuration steps, refer to [Grant access to tagged devices][docs-aperture-grant-model-access].

If all sessions from tagged nodes appear to come from the same user, refer to [all sessions appear to come from the same user][docs-aperture-incorrect-user-identity] in the troubleshooting guide.

## Request routing by model

When a request arrives, Aperture extracts the model name from the request body (for example, `claude-sonnet-5-5` or `gpt-5.5`). If the name matches a configured [model alias][docs-aperture-model-aliases], Aperture resolves it to a concrete destination before checking access and selecting a provider. The gateway checks the user's access and selects a provider that serves the model and supports the incoming API format. It forwards the request with the credentials selected by the provider's authentication configuration.

From the client's perspective, the proxy appears as if it were the LLM provider itself. Clients connect to the proxy URL and send standard API requests. The proxy handles the routing transparently.

Both legs of the connection are encrypted: clients reach Aperture over the tailnet using Tailscale encryption, and Aperture connects to upstream providers over TLS.

The following table summarizes API formats and example endpoints. For provider and client inventories and setup paths, refer to [Supported providers and clients][docs-aperture-provider-compatibility]. For compatibility flags, refer to [Provider configuration][docs-provider-flags].

| Format                           | Endpoint                                                                               | Example providers                                   |
| :------------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| OpenAI Chat Completions          | `POST /v1/chat/completions`                                                            | OpenAI, OpenRouter, and OpenAI-compatible providers |
| OpenAI Responses                 | `POST /v1/responses`                                                                   | OpenAI                                              |
| Anthropic Messages               | `POST /v1/messages`                                                                    | Anthropic                                           |
| Gemini                           | `POST /v1beta/models/{model}:generateContent`                                          | Google                                              |
| Amazon Bedrock                   | `POST /bedrock/model/{model}/invoke`                                                   | Amazon Bedrock                                      |
| Gemini Enterprise Agent Platform | `POST /v1/projects/{project}/locations/{region}/publishers/{publisher}/models/{model}` | Gemini Enterprise Agent Platform                    |

## Telemetry capture

The capture system records everything needed to reconstruct and analyze each LLM interaction:

* **Request data**: HTTP method, path, full body, and headers. In stored captures, Aperture redacts the values of standard upstream authentication headers and of headers that providers or grants add through `add_headers`. Other headers, including client-supplied custom headers, remain in plaintext in local captures until Aperture removes the captured content. They also remain in S3 objects that Aperture exported earlier until you remove those objects.
* **Response data**: Status code, headers, and full response body.
* **Extracted metrics**: Token counts by type (input, output, cached, and reasoning), model name, request duration, and tool use count.
* **Session context**: Session ID linking related requests with supported providers and agents such as Claude Code and Codex.

The proxy processes telemetry asynchronously after the response completes, so clients receive responses without significant delay.

You can configure how long Aperture keeps captured content. With zero retention (`duration: "0"`, `require_export: false`), Aperture does not store captured request and response bodies, headers, or raw HTTP bytes. Usage metrics remain available. Capture retention does not delete Aperture Chat conversation history, and it does not stop most configured hooks from sending content. If you combine zero retention with `purge: ["captures", "tools"]`, Aperture skips tool extraction, so tool-call-triggered hooks do not fire. For the controls and instructions, refer to [Privacy and data retention][docs-aperture-privacy].

The proxy handles two technical challenges transparently:

* **Compression**: The proxy decompresses response bodies that arrive compressed (`gzip`, `deflate`, or Brotli) before storing them.
* **Streaming**: For streaming responses (Server-Sent Events), the proxy reconstructs a complete response object from the event stream for consistent metric extraction.

## Session tracking

A single coding task or conversation typically involves many LLM requests. A developer using Claude Code can generate 50 or more requests while debugging one issue. Without grouping, these appear as 50 unrelated events. With session tracking, they form a coherent unit you can analyze as a whole.

Aperture identifies sessions using client-supplied identifiers or, when possible, a fingerprint of conversation content. The following table shows common cases:

| Client type    | Identification method                                                           |
| :------------- | :------------------------------------------------------------------------------ |
| Claude Code    | Session ID included in each request body                                        |
| OpenAI Codex   | Session ID sent as HTTP header                                                  |
| OpenAI Chat    | Fingerprint generated from conversation content                                 |
| Other requests | A new random ID for each request, so each request appears as a separate session |

When Aperture can identify related requests, it groups them into a session. Users review their own sessions on the [**Sessions** page][docs-aperture-chat-sessions] in Chat. Admins review sessions across the organization on the admin dashboard's [**Logs** page][docs-aperture-dashboard-admin-logs]. Grouping requests by session helps you trace a task and compare costs across conversations. Aperture cannot group requests that have a random fallback ID.

## Outbound integrations

Beyond routing LLM requests, Aperture proxies connections to external MCP servers and HTTP APIs through connectors. This extends the gateway model from inbound AI traffic to outbound tool and service access.

Connectors support two protocols. With the `mcp` protocol, Aperture acts as an MCP server to clients and as an MCP client to remote MCP servers. Clients discover available tools through Aperture's MCP tool list without needing direct access to the remote server. With the `http` protocol, Aperture functions as an authenticated reverse proxy to REST APIs, forwarding requests and injecting the required credentials.

Authentication follows the same centralized model as LLM providers. An administrator configures credentials for each connector once in the Aperture configuration. When a user or agent makes a request through a connector, Aperture injects the appropriate authentication headers automatically. For most connectors, individual users do not need separate credentials configured in their local tools. Connectors using per-user OAuth 2.0 (`oauth2_authorization_code`) require each user to complete a one-time authorization flow through the Aperture UI, but the resulting tokens are managed by Aperture, not the user's local tools.

For detailed setup instructions, refer to the [connectors feature guide][docs-aperture-connectors] for HTTP API proxying and [MCP server proxying][docs-aperture-mcp-server] for MCP-specific configuration.

## Next steps

* [Get started with Aperture][docs-aperture-get-started]: sign up, configure providers, and connect your first LLM client.
* [Control AI access][docs-aperture-control-access]: set up grants that define which models each user can access.
* [How Aperture grants work][docs-aperture-how-grants-work]: understand deny-by-default access, additive grants, and how Aperture resolves precedence.
* [Observe and export AI usage][docs-aperture-observe-and-export]: access dashboards and export usage data.
* [Set up connectors][docs-aperture-connectors]: configure outbound integrations with MCP servers and HTTP APIs.
* [Privacy and data retention][docs-aperture-privacy]: choose what the gateway stores and review where request content can go.

[docs-aperture-chat-sessions]: /docs/aperture/reference/chat#sessions

[docs-aperture-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-control-access]: /docs/aperture/control-access

[docs-aperture-dashboard-admin-logs]: /docs/aperture/reference/dashboard-admin#logs

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grant-model-access]: /docs/aperture/how-to/grant-model-access#grant-access-to-tagged-devices

[docs-aperture-how-grants-work]: /docs/aperture/how-grants-work

[docs-aperture-incorrect-user-identity]: /docs/aperture/troubleshooting#all-sessions-appear-to-come-from-the-same-user

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-model-aliases]: /docs/aperture/model-aliases#how-aliases-resolve

[docs-aperture-observe-and-export]: /docs/aperture/observe-and-export

[docs-aperture-privacy]: /docs/aperture/privacy-and-data-retention

[docs-aperture-provider-compatibility]: /docs/aperture/reference/supported-providers-clients

[docs-provider-flags]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-tags]: /docs/features/tags

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
