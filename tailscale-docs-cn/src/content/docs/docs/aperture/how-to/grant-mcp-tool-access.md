---
title: "Grant access to MCP tools"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

Last validated Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

[Connectors][docs-aperture-connectors] let users access MCP tools, resources, templates, and HTTP endpoints through the Aperture gateway. Access is deny-by-default. Configure grants for the capabilities each user or group needs.

Connector grants use the same structure as [model access grants][docs-grant-model-access], with the `connectors` field for connector capabilities.

## Prerequisites

Before you begin, make sure you have the following:

* An [Aperture gateway][docs-get-started] with at least one [configured connector][docs-aperture-connectors-config].
* [Admin access][docs-set-up-admin-access] to the Aperture admin dashboard.
* Users who already have a `role` grant and network access to the Aperture gateway. If not, complete [Grant access to models][docs-grant-model-access] first.

## Configure connector access grants

Add the `connectors` field to your grants to control which connector capabilities users can access. The `connectors` field accepts an array of fully qualified name (FQN) glob patterns in `"connectorID/category/resource"` format.

\[Missing snippet: aperture\_admin\_nav.mdx] Add `connectors` entries to the `tailscale.com/cap/aperture` capability array.

The following example grants users in `group:ai-users` access to all capabilities from the built-in Aperture connector, all capabilities from a GitHub connector, and all tools from `local`, an example MCP connector you define in your [`connectors.servers`][docs-aperture-connectors-config] configuration:

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" },
          { "connectors": ["aperture/**", "github/**", "local/tools/*"] }
        ]
      }
    }
  ]
}
```

Matching `group:` sources, like `group:ai-users` in the example above, requires [visible groups][docs-visible-groups] enabled for the Aperture gateway.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### Connector capability fields

Each capability entry under `tailscale.com/cap/aperture` can include the `connectors` field:

| Field        | Format             | Description                                                                          |
| :----------- | :----------------- | :----------------------------------------------------------------------------------- |
| `connectors` | Array of FQN globs | Grant access to connector capabilities by `"connectorID/category/resource"` pattern. |

The following grant categories are available:

| Category    | Applies to      | Description                            | Example                |
| :---------- | :-------------- | :------------------------------------- | :--------------------- |
| `tools`     | MCP connectors  | MCP tools                              | `"local/tools/search"` |
| `resources` | MCP connectors  | MCP resources                          | `"local/resources/*"`  |
| `templates` | MCP connectors  | MCP resource templates                 | `"local/templates/*"`  |
| `proxy`     | HTTP connectors | Proxy access to `/v1/connectors/<id>/` | `"github/proxy"`       |

A `proxy` grant authorizes the connector's entire `/v1/connectors/<id>/` path. It has no per-path granularity.

Patterns use the same glob syntax as model grants: `*` matches a single path segment and also matches any characters within a segment (for example, `get_*` matches tool names that start with `get_`), and `**` matches zero or more segments.

A malformed pattern, such as one with more than two slashes or with an unrecognized category segment, is silently dropped rather than reported as an error. A typo in a grant pattern grants nothing, so confirm each pattern matches an existing connector capability.

> **Note:**
>
> The deprecated `mcp_tools`, `mcp_resources`, and `mcp_templates` grant fields continue to work. New configurations should use the `connectors` field instead.

### Pattern examples

The following examples show how to use FQN patterns to grant access to specific connector capabilities:

| Pattern            | Matches                                                                                 |
| :----------------- | :-------------------------------------------------------------------------------------- |
| `"local/tools/*"`  | All MCP tools from `local` connector                                                    |
| `"local/**"`       | All capabilities from `local`                                                           |
| `"github/proxy"`   | Proxy access to `github` HTTP connector                                                 |
| `"github/**"`      | All access to `github` connector                                                        |
| `"aperture/**"`    | Built-in Aperture system connector, by ID                                               |
| `"*/tools/search"` | The `search` tool from any connector                                                    |
| `"**"`             | All capabilities from all connectors                                                    |
| `"label:system"`   | Every connector labeled `system`, which by default is the built-in `aperture` connector |

An FQN pattern always includes at least the connector ID. To grant access to everything a connector exposes, use `"connectorID/**"`.

### Grant access by label

Alongside FQN patterns, the `connectors` field accepts `label:<name>` patterns. Labels are flat strings you set on a connector, so one pattern can cover a group of connectors that changes over time without a policy edit:

```json
{ "connectors": ["label:sales"] }
```

A label pattern behaves differently from an FQN pattern in two ways. Matching is exact rather than glob-based, the same as `tag:` and `group:` elsewhere in Tailscale grants, so `label:team.*` matches nothing. And a matching label grants the entire connector at every category and resource, including `proxy`, so labels cannot express tool-level access. Keep FQN patterns for a single tool or a read-only slice, and use labels for connector-level policy.

Because grants are additive, a label only ever adds access. Labeling a connector `restricted` does not gate it, and a user holding `"**"` still reaches it. For the label grammar, the reserved `system` label, and the full task, refer to [Grant connector access by label][docs-grant-connector-access-by-label].

### What denial looks like

When a user lacks a matching grant, Aperture hides the capability rather than exposing it. Tools and resources the user cannot access do not appear in the tool or resource list, and a direct call to an unauthorized tool returns an "unknown tool" error (or "unknown resource" for a resource). A request to an unauthorized HTTP connector proxy path returns `403 access denied`.

If a capability is missing or a request is denied unexpectedly, check for a missing or misspelled grant pattern.

## Built-in connectors

Aperture includes a built-in `aperture` system connector. It exposes a `list_connectors` tool (surfaced to models as `aperture_list_connectors`) for discovering the HTTP API connectors available through Aperture. This tool is registered only when at least one HTTP connector is configured.

New Aperture gateways already grant this connector. The default configuration includes the following grant, which matches the `system` label on the built-in `aperture` connector:

```json
{ "connectors": ["label:system"] }
```

System connectors are not special-cased in the authorization path, so removing that grant makes the `aperture` tools unreachable. You can also target the connector by ID, which is the only way to reach a single system tool:

```json
{ "connectors": ["aperture/**"] }
{ "connectors": ["aperture/tools/list_connectors"] }
```

The `aperture` connector ID is reserved and cannot be used for custom connectors, and so is the `system` label.

Aperture also supplies the tools for the `Tailnet` and `TailnetSSH` connectors. Those are `connectors.servers` entries rather than system connectors, so the `system` label never matches them and you grant them by ID, such as `{"connectors": ["TailnetSSH/tools/list_machines"]}`. Refer to [Built-in connectors][docs-connectors-built-in].

> **Note:**
>
> Connector access follows a three-layer authorization model:
>
> 1. **Configuration**: The connector must be declared in your [`connectors.servers`][docs-aperture-connectors-config] configuration.
> 2. **Grants**: The user needs a matching `connectors` grant pattern. Grants define the ceiling of what a user can access.
> 3. **Credentials**: For connectors using per-user OAuth, the user must complete the OAuth authorization flow before accessing the connector.

## Next steps

* [Grant connector access by label][docs-grant-connector-access-by-label] to group connectors and grant a whole group in one pattern.
* Learn about [connectors][docs-aperture-connectors] and how to configure them.
* [Grant access to models][docs-grant-model-access] to manage which LLM models users can access.
* Refer to the [grants configuration reference][docs-aperture-grants] for the full grants syntax.
* [Set per-user spending limits][docs-set-per-user-spending-limits] to manage costs across models and tools.

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-connectors-built-in]: /docs/aperture/connectors/built-in-connectors

[docs-get-started]: /docs/aperture/get-started

[docs-grant-connector-access-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-visible-groups]: /docs/aperture/visible-groups
