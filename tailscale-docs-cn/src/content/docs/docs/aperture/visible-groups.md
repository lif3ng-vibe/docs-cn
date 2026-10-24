---
title: "Visible groups for Aperture"
description: "Use Tailscale groups and SCIM groups to control access to Aperture models and admin roles."
---

Last validated Sep 28, 2026

Visible groups let Aperture resolve Tailscale group memberships so you can use `group:` identifiers in [grant `src` fields][docs-aperture-grants]. Without visible groups, Aperture can only match individual login names (`alice@example.com`) and tagged devices (`tag:ci-runner`). With visible groups enabled, you can grant model access or admin roles to entire teams.

Aperture supports two kinds of groups:

* **Tailscale groups**: defined in your [tailnet policy file][docs-tailnet-policy-file] (for example, `group:engineering`).
* **SCIM groups**: [synchronized from your identity provider][docs-user-group-provisioning] (for example, `group:sales@example.com` or matched by email like `engineering@example.com`).

## How it works

By default, the Tailscale control plane does not send group membership information to devices. To make groups available to Aperture, you add a `tailscale.com/visible-groups` [node attribute][docs-node-attributes] to your tailnet policy file targeting the Aperture device. After it's configured, the Aperture device receives group membership data for connecting users, and Aperture can evaluate `group:` entries in grant `src` fields.

For a detailed explanation of how visible groups work at the Tailscale platform level, refer to [group visibility on Tailscale clients][docs-group-visibility-clients].

## Prerequisites

Before you begin, ensure you have the following:

* An [Aperture gateway][docs-get-started] with at least one configured provider.
* Permission to edit your [tailnet policy file][docs-tailnet-policy-file]. You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles).
* (Optional) [SCIM groups][docs-user-group-provisioning] configured if you want to match identity provider groups.

## Configure the node attribute

Add a `tailscale.com/visible-groups` [node attribute][docs-node-attributes] to your tailnet policy file. This tells the control plane which groups are visible to the Aperture device.

1. Go to the [Access controls](https://console.tailscale.com/admin/acls/file) page of the admin console.
2. Add a `nodeAttrs` entry that targets your Aperture device and specifies which groups to expose.

```json
"nodeAttrs": [
  {
    "target": ["tag:aperture"],
    "app": {
      "tailscale.com/visible-groups": [
        {
          "groups": ["*"]
        }
      ]
    }
  }
]
```

The `"groups": ["*"]` wildcard makes all groups visible to the Aperture device. To restrict visibility to specific groups, list them explicitly:

```json
"groups": [
  "group:engineering",
  "group:ai-users",
  "group:sales@example.com"
]
```

> **Note:**
>
> The tailnet policy file validation does not check whether the groups you list exist in your tailnet.

## Use groups in Aperture grants

After configuring the node attribute, you can use `group:` identifiers in grant `src` fields. Aperture evaluates group membership at request time using the identity of the connecting user.

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

### Grant model access to a group

The following example grants members of `group:ai-users` access to all Anthropic models:

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

### Grant admin access to a group

The following example grants admin access to members of `group:aperture-admins` and standard user access to members of `group:ai-users`:

```json
{
  "grants": [
    {
      "src": ["group:aperture-admins"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "admin" }
        ]
      }
    },
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" }
        ]
      }
    }
  ]
}
```

If a user matches both grants, the admin role takes precedence.

### Match SCIM groups

You can match SCIM groups using either the `group:` prefix or the group email directly:

* `"group:sales@example.com"`: matches members of the SCIM group with that email.
* `"sales@example.com"`: also matches SCIM group members by email.

Both formats work in grant `src` fields.

## Verify group visibility

Open the admin dashboard's [**Quota Usage** page][docs-admin-quota-usage]. Confirm that group members have the quotas granted to their groups.

## Next steps

* [Grant model access][docs-grant-model-access]: configure which models users and groups can access.
* [Set up admin access][docs-set-up-admin-access]: assign admin roles using groups.
* [Aperture configuration reference][docs-aperture-configuration]: full syntax for grants including `src` match patterns.
* [Group visibility on Tailscale clients][docs-group-visibility-clients]: platform-level details on how visible groups work.

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-get-started]: /docs/aperture/get-started

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-group-visibility-clients]: /docs/features/group-visibility-clients

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-admin-quota-usage]: /docs/aperture/reference/dashboard-admin#quota-usage
