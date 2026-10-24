---
title: "Kinds of connector"
description: "Aperture tools come from different sources. Some ship with the gateway, some require configuration, and some forward calls to an upstream service. Two properties distinguish them: who runs the tool an"
---

Last validated Sep 28, 2026

Aperture tools come from different sources. Some ship with the gateway, some require configuration, and some forward calls to an upstream service. Two properties distinguish them: who runs the tool and who can reach it.

For field definitions, refer to the [connectors reference][docs-connectors-reference]. For the connector model, refer to [How connectors work][docs-connectors-how-it-works].

## Execution and reachability

Each tool in Aperture falls on two axes:

1. **Execution**: Aperture runs the tool itself, or Aperture forwards the call to an upstream service.
2. **Reachability**: The tool is available to chat only, or to both chat and agents connected to the gateway.

Execution determines dependencies. Built-in tools do not require an upstream MCP server, but node provisioning, Tailscale SSH, and web tools still depend on network access to their respective services. Forwarded tools also depend on the upstream connector service.

Reachability determines whether grants apply. Tools that agents can reach pass through the grant system. Chat-only capabilities do not.

## Connector types

| Kind                     | Execution | Reachability    | Requires configuration | Governed by grants |
| ------------------------ | --------- | --------------- | ---------------------- | ------------------ |
| Chat-only tools          | Aperture  | Chat            | No                     | No                 |
| The `aperture` connector | Aperture  | Chat and agents | No                     | Yes                |
| Built-in connectors      | Aperture  | Chat and agents | Yes                    | Yes                |
| Verified connectors      | Upstream  | Chat and agents | Yes                    | Yes                |
| Custom connectors        | Upstream  | Chat and agents | Yes                    | Yes                |

The last three require a configuration entry. The first two ship with the gateway.

### Chat-only tools

The chat sandbox and location are capabilities of the chat interface rather than connectors. They have no entry in your configuration, no upstream URL, and no connector ID. An agent that connects to `/v1/mcp` never receives them in a tool listing, so no grant pattern reaches them or excludes them.

Availability depends on whether Tailscale has enabled the capability for your gateway, the user's conversation settings, and any user or project tool policy. Connector grants do not control these capabilities.

Location goes further than the sandbox: it registers no tool at all. Chat reads the user's coordinates from the request and places them in the system prompt, so the model has the information without any tool call.

For what the sandbox does, refer to the [chat sandbox feature guide][docs-chat-sandbox].

### The `aperture` connector

The built-in `aperture` connector sits across the usual boundary. Aperture runs its tools, as it does for a chat-only capability, and the connector still appears in the connector listing, agents still receive its tools, and grants still govern it. It has no entry in your configuration because it ships with every gateway.

Its tools include `aperture_list_connectors`, which lets a model discover the HTTP connectors it can reach. The web tools `aperture_web_search` and `aperture_web_fetch` appear when web search is available for the gateway. Contact Tailscale if you need help with availability.

This connector carries the `system` label, and the shipped default configuration grants `label:system`. That grant is why the built-in tools work on a new gateway, and it gives you a working example of label-based access. The authorization path contains no exception for it.

### Built-in connectors

A built-in connector runs inside Aperture as the `aperture` connector does, but it requires an entry in your configuration before it does anything. The tailnet connector provisions nodes in your tailnet, and the Tailscale SSH connector lists tailnet machines and runs commands on them.

These connectors run tools in Aperture rather than forwarding calls to an upstream MCP server. Their configuration still requires a `url`. The raw proxy path `/v1/connectors/<id>/<path>` returns a 404 because these connectors do not provide an HTTP proxy.

Because they need configuration, a built-in connector is subject to grants and appears in the connector listing with a status, the same way a connector that points at an outside service does. Access control works the same for both. The source of the tools is what differs.

### Verified connectors

A verified connector points at an outside service, and Aperture forwards each call to it. Its provider appears in Aperture's registry, which supplies a starting configuration: the protocol, the authentication type, the authorization and token endpoints, and the scopes.

The registry saves you from finding those values yourself, and does nothing at run time. Once an admin saves the connector, Aperture reads only the stored configuration, so a registry value that changes at the provider leaves your gateway alone.

### Custom connectors

A custom connector is a verified connector without the preset. You supply the URL, the protocol, the authentication scheme, and the credentials. Aperture treats it identically at run time.

Custom does not mean an upstream on your own tailnet, despite the common assumption. The distinction is registry presence, and a custom connector can point at any address Aperture can reach. The `send_caller_identity` field does require a tailnet upstream. It forwards the caller's Tailscale identity to the upstream and is rejected unless the URL is a MagicDNS name or a Tailscale IP address.

## Behavioral differences by type

**Grants**: A grant of `"**"` covers every tool from every connector, including built-in connectors, but not chat-only capabilities. To control the sandbox, use conversation settings and tool policies described in [Chat-only tools][ar-chat-only-tools].

**Credentials**: Authentication depends on the connector. Tailnet node provisioning requires a Tailscale OAuth client secret. Tailscale SSH uses the gateway's Tailscale identity rather than a connector credential. For credential configuration, refer to the [connectors reference][docs-connectors-reference].

## Capability updates

The capabilities of verified and custom MCP connectors can change when their upstream servers change. Aperture polls connectors that do not use per-user credentials for these changes. For a per-user connector, open its Chat detail page and select **Refresh tools** to request the current tool list with your credentials. Built-in connector tool sets change with Aperture releases.

A connector can remain **Ready** while an upstream request or refresh fails. **Ready** describes access and authorization, not upstream health.

## API categories

The connector listing in the API includes a `category` field with the value `system`, `verified`, or `custom`. These three values do not map one-to-one to the five connector types:

* Chat-only capabilities are absent from the listing, so they have no category.
* Built-in connectors are reported as `system`, together with the always-present `aperture` connector, even though they require configuration.
* `verified` and `custom` match the kinds described above.

The registry's category metadata classifies providers, while the current admin connector settings page presents a searchable connector list. To predict connector behavior, use the execution and reachability properties described in [Connector types][ar-connector-types]. For the field definition, refer to the [connectors reference][docs-connectors-reference].

## Examples

**A colleague adds a tool to an MCP server in your tailnet. When can an agent call it?** Aperture keeps shared-credential connector capabilities current. For a per-user connector, open its Chat detail page and select **Refresh tools** to request the current tool list. A built-in connector tool, by contrast, arrives only in an Aperture release.

**A user has a `"**"` grant but the chat sandbox is unavailable. Where do you look?** Check whether **Code Sandbox** is selected and whether a user or project tool policy disables it. If the capability is unavailable for the gateway, contact Tailscale.

**An upstream MCP server returns errors. Which tools are affected?** Tools from that server fail independently of tools from other connectors. Built-in tools can still fail if their own dependencies, such as Tailscale APIs or SSH destinations, are unavailable.

**You want Tailscale SSH available to one team only. What do you change?** Grant that team access to the connector. The tailnet's SSH policy separately controls which machines the gateway can access.

## Related

* [How connectors work][docs-connectors-how-it-works] for the connector model, the MCP and HTTP protocols, authentication, and access control.
* [Connectors reference][docs-connectors-reference] for field definitions, authentication types, and the `category` field.
* [How grants work][docs-how-grants-work] for the grant syntax that governs four of the five kinds.
* [Add a verified connector][docs-connectors-add-verified] to configure a connector from the registry.
* [Chat sandbox][docs-chat-sandbox] for what the chat-only sandbox capability does.

[ar-chat-only-tools]: #chat-only-tools

[ar-connector-types]: #connector-types

[docs-chat-sandbox]: /docs/aperture/chat-sandbox

[docs-connectors-add-verified]: /docs/aperture/connectors/add-verified-connector

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-how-grants-work]: /docs/aperture/how-grants-work
