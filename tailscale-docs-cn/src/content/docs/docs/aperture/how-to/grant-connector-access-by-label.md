---
title: "Grant connector access by label"
description: "\\[Missing snippet: aperture\\_mcp\\_grant\\_deprecation\\_note.mdx]"
---

Last validated Sep 28, 2026

\[Missing snippet: aperture\_mcp\_grant\_deprecation\_note.mdx]

A label is a flat string you attach to a [connector][docs-aperture-connectors]. A grant pattern of `label:<name>` matches every connector carrying that label, so one grant covers a whole group of connectors and keeps working as you add more. Labels complement the fully qualified name (FQN) patterns described in [Grant access to MCP tools][docs-grant-mcp-tool-access]: FQN patterns target one connector, and labels target a set.

Every new Aperture gateway starts with a label grant already in place. The default configuration grants `label:system`, which is how the built-in Aperture tools reach users without any setup. That grant is also the working example you can copy: the pattern that carries the built-in tools is the same pattern you use for your own connectors.

Labels do not change how any existing configuration behaves. Grants that name connector IDs continue to work exactly as before, and an unlabeled connector is reachable only through its ID.

## Prerequisites

Before you begin, make sure you have the following:

* An [Aperture gateway][docs-get-started] with at least one [configured connector][docs-aperture-connectors-config].
* [Admin access][docs-set-up-admin-access] to the Aperture admin dashboard.
* Users who already have a `role` grant and network access to the Aperture gateway. If not, complete [Grant access to models][docs-grant-model-access] first.

## Step 1: Label your connectors

Decide what the labels represent before you apply them, because a grant is only as clear as the label it names. Aperture reserves no vocabulary other than `system` and validates only the characters you use, so the scheme is yours to choose. Three schemes cover most Aperture gateways:

| Purpose                                | Examples                                                                    |
| :------------------------------------- | :-------------------------------------------------------------------------- |
| How sensitive the connector's data is  | `public`, `private`, `restricted`                                           |
| Which team owns or needs the connector | `eng`, `marketing`, `sales`                                                 |
| Where the connector came from          | `system`, applied automatically to the built-in `aperture` system connector |

To label a connector in the dashboard:

\[Missing snippet: aperture\_admin\_nav.mdx]

1. Select the connector you want to label, then edit it.
2. In the **Labels** field, enter a label and press Enter. Repeat for each label. A connector can carry as many labels as you need.
3. Save the connector.

The **Labels** field suggests labels already in use on other connectors. Choosing a suggestion instead of typing a near-duplicate keeps the gateway on one vocabulary, which matters because a grant matches a label exactly. The connector list shows a **Labels** column, so you can review the whole vocabulary at a glance.

You can also set labels directly in the configuration with the `labels` field:

```json
{
  "connectors": {
    "servers": {
      "salesforce": {
        "protocol": "mcp",
        "url": "https://api.salesforce.com/platform/mcp/v1/platform/sobject-all",
        "labels": ["sales", "restricted"]
      },
      "analytics": {
        "protocol": "mcp",
        "url": "http://mcp-analytics.example.ts.net:8080/v1/mcp",
        "labels": ["eng", "restricted"]
      }
    }
  }
}
```

Each label must match `[a-zA-Z0-9][a-zA-Z0-9._-]*`. A label starts with a letter or digit and contains only letters, digits, dots, underscores, and hyphens. Slashes are rejected because they would be ambiguous with the slash-separated FQN patterns. Dots and hyphens are legal, so you can namespace a label as `team.eng` when a flat vocabulary would collide, but a namespace convention is never required.

## Step 2: Grant access by label

Add `label:<name>` patterns to the `connectors` field of a grant. The following example gives the sales team every connector labeled `sales`, and gives everyone the built-in tools through the default `label:system` grant:

```json
{
  "grants": [
    {
      "src": ["*"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user", "models": "**" },
          { "connectors": ["label:system"] }
        ]
      }
    },
    {
      "src": ["group:sales"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "connectors": ["label:sales", "docs/tools/*"] }
        ]
      }
    }
  ]
}
```

Matching `group:` sources, like `group:sales` in the example above, requires [visible groups][docs-visible-groups] enabled for the Aperture gateway.

Two properties of label patterns determine what a grant actually covers:

* **A label match is exact, not a glob.** Unlike FQN patterns, `label:` patterns do not accept `*` or `**`. The pattern `label:team.*` matches nothing, and so does any other wildcard form. This mirrors how `tag:` and `group:` behave in Tailscale grants.
* **A label match covers the entire connector.** When a label matches, the user reaches every category and every resource that connector exposes: tools, resources, templates, and HTTP proxy access. Labels have no per-tool granularity. To grant a single tool or a read-only slice, use an FQN pattern that names the connector ID, such as `"salesforce/tools/get_*"`.

You can mix both pattern styles in one `connectors` array, as the `group:sales` grant above does.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## Step 3: Verify access

Confirm the labels first, then confirm the access they produce.

1. As an admin, open **Administration** > **Connectors** and verify labels in the **Labels** column.
2. Sign in as a matching user and open **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors]. The connector appears when the grant permits access. Aperture omits denied configured connectors, and Chat does not list labels or show **No access**.
3. List tools through the MCP endpoint from a device whose tailnet identity matches the grant.

   \[Missing snippet: aperture\_mcp\_list\_tools.mdx]

   The response contains the connector's prefixed tools, for example `salesforce_query`.

If the tools do not appear, the label in the grant and the label on the connector differ. Because matching is exact, `label:Sales` does not match a connector labeled `sales`, and a trailing space or a typo grants nothing rather than reporting an error. Compare the two strings character for character.

## Labels widen access, never restrict it

Aperture grants are additive and allow-only, and label grants are no exception. A label grant adds access to the connectors that carry the label. No label subtracts access, and no label acts as a gate.

This matters most for sensitivity vocabularies. Labeling a connector `restricted` documents the intent, but it does not enforce it. A user holding `{"connectors": ["**"]}` still reaches that connector, because the broad pattern already grants it. To genuinely limit a sensitive connector, remove the broad wildcard grants that reach it and grant it narrowly by label or by connector ID instead.

For the full model behind additive grants and how Aperture resolves overlapping ones, refer to [How Aperture grants work][docs-how-grants-work].

## The reserved system label

Aperture applies the `system` label to the built-in `aperture` system connector automatically. This is what the default `label:system` grant matches. Configured `tailnet` and `tailnet_ssh` connectors do not automatically receive the label. The label states provenance only. Aperture ships no sensitivity labels because connector sensitivity depends on your deployment.

Because the shipped default configuration grants `label:system` to every user, the label is reserved and you cannot apply it to your own connectors:

* The dashboard rejects `system` in the **Labels** field while you type it, and the API rejects it on save.
* A configuration that already carries the label on a connector under `connectors.servers` still loads, with a warning, and Aperture strips the label before it evaluates any grant. A hand-edited or upgraded gateway keeps working, and the label never widens access to a connector you did not intend to share.

The label remains valid under `connectors.system_labels`, which exists to relabel built-in connectors:

```json
{
  "connectors": {
    "system_labels": {
      "aperture": ["system", "public"]
    }
  }
}
```

> **Warning:**
>
> `system_labels` replaces a built-in connector's labels rather than adding to them. If you omit `system` from the list, the default `label:system` grant no longer matches that connector, and its built-in tools become unreachable until you grant them another way.

## Next steps

* [Grant access to MCP tools][docs-grant-mcp-tool-access] to target individual tools, resources, templates, and proxy paths by connector ID.
* Refer to the [connectors reference][docs-connectors-reference] for the `labels` field, the `system_labels` field, and the full grant pattern list.
* [How connectors work][docs-connectors-how-it-works] explains the access control model that labels participate in.
* [Set up admin access][docs-set-up-admin-access] to control who can edit connectors and their labels.

[docs-aperture-connectors-config]: /docs/aperture/configuration#connectors

[docs-aperture-connectors]: /docs/aperture/connectors

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-visible-groups]: /docs/aperture/visible-groups

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors
