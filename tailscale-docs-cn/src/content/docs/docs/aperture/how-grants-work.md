---
title: "How Aperture grants work"
description: "Understand the Aperture grants model, including deny-by-default access, additive allow-only rules, capability matching, and how Aperture resolves precedence when multiple grants apply."
---

Last validated Sep 29, 2026

Aperture uses *grants* to control access to models and MCP capabilities. For setup instructions, refer to [Next steps][ar-next-steps].

## The grants model

Aperture grants build on the [Tailscale grants framework][docs-tailscale-grants] and share two properties:

* **Deny-by-default.** Network access to the Aperture gateway does not grant access to models or MCP capabilities. Users need a matching grant for each capability.
* **Additive and allow-only.** Each grant only *adds* access. There is no deny rule. A user's effective access combines the access from every grant whose `src` matches their identity. To remove access, narrow or remove the grants that provide it. You cannot subtract access with another rule.

If you are coming from the tailnet policy file, this is the key difference: there is no `deny` in grants. You express policy entirely through what you allow.

## Anatomy of a grant

A grant pairs a set of identities with a set of capabilities:

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

* **`src`** lists who the grant applies to. Entries can be individual users (`"alice@example.com"`), SCIM groups by email, Tailscale groups (`"group:ai-users"`), or tags (`"tag:ci"`). Use a tag to grant access to non-user devices, such as a CI runner or service, that connect to Aperture. Matching a `group:` entry requires [visible groups][ar-groups-in-grants].
* **`app["tailscale.com/cap/aperture"]`** is an array of capability objects describing what the matched identities can do. Common capabilities include `role` for the user's permission level, `models` for glob patterns over `provider/model` names, and the MCP fields `mcp_tools`, `mcp_resources`, and `mcp_templates`. Operational fields such as custom headers, quotas, hooks, and CORS settings also belong here.

For the complete list of capability fields and their syntax, refer to the [grants configuration reference][docs-aperture-grants].

## Aperture grant fields

An Aperture configuration grant uses two fields:

* **`src`** works the same as in a network grant. It accepts users, SCIM groups, Tailscale groups, and tags. Matching is exact, so globs such as `tag:prod-*` do not match.
* **`app["tailscale.com/cap/aperture"]`** holds a fixed set of Aperture-defined fields, not free-form application capabilities. The resource fields `models`, `connectors`, and the `mcp_*` fields take glob patterns over slash-separated names. In these patterns, `*` matches one segment and `**` matches zero or more. `role` takes the exact string `"user"` or `"admin"`. This field controls access, so most of an Aperture grant lives here.

The `connectors` field also accepts `label:<name>`, which matches every connector carrying that [label][docs-aperture-connectors-labels]. Like `tag:` and `group:` in `src`, label matching is exact and does not expand wildcards.

A matching label grants access to the whole connector. Because grants are additive, a label pattern widens access and never restricts it. A sensitivity label such as `restricted` therefore records intent but does not restrict access. Refer to [Grant connector access by label][docs-grant-by-label].

New Aperture gateways rely on this form. The shipped configuration grants all users access to all models and grants `label:system` for the built-in `aperture` system connector. Aperture denies requests that do not match these or other grants. Narrow or remove the shipped grants to restrict access.

The `dst` and `ip` fields are omitted because the destination is always the Aperture device. They apply only when you define the same grant in the tailnet policy file. For that comparison and the conversion steps, refer to [Aperture grants vs. tailnet policy file grants][docs-aperture-vs-tailnet-grants].

## How Aperture evaluates a request

Aperture resolves access at request time using the connecting user's Tailscale identity:

1. **Identify the user.** Aperture authenticates every connection through [Tailscale identity][docs-tailscale-identity], so there is no separate login step.
2. **Collect matching grants.** Aperture gathers every grant whose `src` matches the user's login, email, or group membership.
3. **Merge capabilities.** The capabilities from all matching grants combine into the user's effective access.
4. **Check the requested action.** Aperture matches models against the merged `models` patterns and MCP items against the `mcp_*` patterns. For a [model alias][docs-model-aliases], it matches the resolved destination, not the alias name. It then applies the precedence rules below.
5. **Allow or deny.** If a capability grants the requested access, the request proceeds. If nothing matches, Aperture denies the request, consistent with deny-by-default.

## Precedence and conflicts

Because grants are additive, multiple grants commonly apply to the same user. Two resolution rules determine the outcome when they overlap:

* **Roles: the highest permission wins.** If matching grants assign both admin and user roles, the user receives admin-level permissions.
* **Model patterns: the most specific glob wins.** When several `models` patterns match the destination model, Aperture uses the most specific one. For an alias, Aperture checks the resolved destination. For example, `"anthropic/claude-opus-5-5"` beats `"anthropic/**"`, which beats `"**"`. When two patterns are equally specific, the entry that appears earlier in the configuration wins.

These rules choose which matching entry takes effect within the combined access. They do not subtract access.

## Groups in grants

To use `group:` identifiers in a grant's `src`, the Aperture gateway needs group membership information. Tailscale does not send this information by default. Enable [visible groups][docs-visible-groups] by adding the `tailscale.com/visible-groups` node attribute to the Aperture device in your tailnet policy file. Aperture then checks group membership when a user makes a request.

## Next steps

* [Grant access to models][docs-grant-model-access]: Configure grants that control which models each user or group can use.
* [Grant access to MCP tools][docs-grant-mcp-tool-access]: Extend grants to MCP tools, resources, and templates.
* [Grant connector access by label][docs-grant-by-label]: Group connectors with labels and grant a whole group in one pattern.
* [Set up admin access][docs-set-up-admin-access]: Grant access to the admin dashboard and configuration.
* [How Aperture works][docs-how-aperture-works]: Understand how identity, routing, and telemetry fit together.

[ar-groups-in-grants]: #groups-in-grants

[ar-next-steps]: #next-steps

[docs-aperture-connectors-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-grant-by-label]: /docs/aperture/how-to/grant-connector-access-by-label

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailscale-grants]: /docs/features/access-control/grants/grants-app-capabilities

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-visible-groups]: /docs/aperture/visible-groups
