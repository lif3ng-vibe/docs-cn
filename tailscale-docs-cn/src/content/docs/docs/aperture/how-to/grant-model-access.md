---
title: "Grant access to models"
description: "Aperture denies model requests that do not match a grant. However, a new Aperture gateway's default configuration grants all users access to all models. First, allow network access to Aperture through"
---

Last validated Oct 1, 2026

Aperture denies model requests that do not match a grant. However, a new Aperture gateway's default configuration grants all users access to all models. First, allow network access to Aperture through your tailnet. Then narrow or replace the default grant to control which models each user or group can use.

For details about how Aperture uses Tailscale identity for authentication and access control, refer to [How Aperture works][docs-how-aperture-works]. For deny-by-default access and grant precedence, refer to [how Aperture grants work][docs-how-grants-work].

## Prerequisites

Before you begin, you need:

* An [Aperture gateway][docs-get-started] with at least one configured provider.
* [Admin access][docs-set-up-admin-access] to the Aperture admin dashboard.
* Access to the Tailscale admin console.

## Step 1: Allow network access to the Aperture gateway

Your tailnet access control rules must allow users to reach the Aperture gateway before they can access models.

1. Sign in to the Tailscale admin console.
2. Go to the [Access controls](https://console.tailscale.com/admin/acls/file) page.
3. Confirm that your access control rules allow users to connect to the Aperture gateway.

The following tailnet policy file example permits all users in `group:ai-users` to connect to the Aperture gateway with the hostname `ai`:

```json
{
  "groups": {
    "group:ai-users": [
      "dave@example.com",
      "alice@example.com"
    ]
  },
  "hosts": {
    "ai": "<aperture-ip-address>"
  },
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["ai"],
      "ip": ["tcp:80", "tcp:443", "icmp:*"]
    }
  ]
}
```

Replace `<aperture-ip-address>` with the Tailscale IP address of your Aperture gateway.

> **Tip:**
>
> You can also use [Tailscale tags][docs-tags] to manage access to the Aperture gateway. Assign a tag such as `tag:ai` to the Aperture gateway. Use that tag as the `dst` in your grant rule. For details about specifying the Aperture gateway in tailnet policy file grants, refer to [Grants versus tailnet policy file grants][docs-aperture-vs-tailnet-grants].

## Step 2: Configure grants to control model access

After users can reach the Aperture gateway, configure grants to define which models they can access. You can define these grants in the Aperture configuration or in the tailnet policy file. Aperture combines matching grants from both sources.

\[Missing snippet: aperture\_admin\_nav.mdx]

At `/admin/settings/grants`, use the visual grant editor, or edit the same grants as JSON at `/admin/settings/config`, on the **Administration** > **Configuration** page.

To change the configuration programmatically, refer to the [grants configuration reference][docs-aperture-grants].

The following example grants all users standard user access and lets them use all Anthropic models:

```json
{
  "grants": [
    {
      "src": ["*"],
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

To restrict access, replace `"*"` with any of these identity types:

* Individual login names, such as `"alice@example.com"`.
* Tailscale or SCIM groups, such as `"group:ai-users"`.
* Tags, such as `"tag:ci"`.

Use a tag to grant access to non-user devices such as CI runners or services. For group matching, enable [visible groups][docs-visible-groups] for the Aperture gateway.

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

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

Use these fields in capability entries under `tailscale.com/cap/aperture`:

* **`role`**: Set to `"user"` for standard API access or `"admin"` for administrative access. The `admin` role grants access to the admin dashboard. Portal access is available by default and is controlled separately with `enable_portal`.

* **`models`**: Optional. A glob pattern in `provider/model` format that specifies which models the user can access. For example, `"anthropic/**"` matches all Anthropic models, and `"**"` matches all models from all providers. An entry with no `models` field is floating: it applies regardless of model but grants no model access on its own.

  For a [model alias][docs-model-aliases], grant access to its destination. For example, if `team-chat` maps to `openai/gpt-5.4-mini`, the pattern must match `openai/gpt-5.4-mini`, not `team-chat`.

* **`enable_portal`**: Optional. Portal access is available by default. Set it to `false` to opt matched non-admin users out, or `true` to override a broader opt-out. Admins always retain portal access. The legacy `enable_chat_ui` field has the same effect.

* **`connectors`**: Optional. An array of FQN globs that grant access to MCP tools, resources, and HTTP connector proxies. Because Aperture is deny-by-default, users have no connector access until an entry matches. Refer to [grant MCP tool access][docs-grant-mcp-tool-access] for details.

### Model pattern examples

The following examples show how to use patterns to grant access to specific models:

| Pattern              | Matches                                             |
| :------------------- | :-------------------------------------------------- |
| `"**"`               | All models from all providers                       |
| `"anthropic/**"`     | All Anthropic models                                |
| `"openai/gpt-5.5"`   | Exactly `openai/gpt-5.5`                            |
| `"*/claude-sonnet*"` | Any `claude-sonnet*` model from any single provider |

### Grant access to tagged devices

Use a grant to give a CI runner or another tagged device access to models without giving access to every user. Find the device on the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and note its tags. Then choose a `src` value for the grant:

* To match any device carrying one tag, use `"src": ["tag:ci-runner"]`. A device with additional tags still matches this grant.
* To match only devices with an exact set of tags, use the synthetic login name for that tag set. To build it, sort the tags alphabetically and join them with commas, with no spaces. For example, a device with `tag:prod` and `tag:api` has the synthetic login name `tag:api,tag:prod`, so use `"src": ["tag:api,tag:prod"]`. This value matches every device with the same tag set, not one specific device. If the device's tags change, update the grant.

Add a `role` and a matching `models` capability, as shown in the earlier examples. Use `"src": ["*"]` only to give model access to everyone who can reach the gateway, including tagged devices. Do not use it to discover a device's tags.

## Verify access

After configuring grants, verify that users can access the expected models.

1. Connect a test device to your tailnet.

2. Send a request to Aperture with `curl` or any HTTP client. Use a model ID that matches a configured provider and your `models` grant. Specify either the bare model name, for example, `claude-sonnet-5-5`, or the full `provider/model` form:

   ```shell
   curl -s http://<aperture-hostname>/v1/messages \
     -H "Content-Type: application/json" \
     -d '{
       "model": "claude-sonnet-5-5",
       "max_tokens": 25,
       "messages": [{"role": "user", "content": "respond with: hello"}]
     }'
   ```

3. Confirm that the request returns a successful response, which means the grant is working.

If the request fails, use the status code to identify the cause:

* **HTTP 403**: The user has no `role` grant. Add a `{ "role": "user" }` entry.
* **HTTP 404**: The user has a role, but either no `models` grant matches the requested model or no provider has that model configured. Check the `models` pattern and confirm the model ID matches a configured provider.

Refer to [Troubleshooting Aperture][docs-troubleshooting] for help diagnosing access issues.

## Next steps

* [Grant access to connectors][docs-grant-mcp-tool-access] to control which MCP tools, resources, and HTTP APIs users can access.
* [Set per-user spending limits][docs-set-per-user-spending-limits] to manage costs.
* [Set up the chat UI][docs-set-up-chat-ui] to let users talk to models directly from their browser.
* [Set up LLM clients][docs-use-your-tools] to connect through Aperture.

[docs-aperture-grants]: /docs/aperture/configuration#grants

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-get-started]: /docs/aperture/get-started

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-how-aperture-works]: /docs/aperture/how-aperture-works

[docs-how-grants-work]: /docs/aperture/how-grants-work

[docs-model-aliases]: /docs/aperture/model-aliases

[docs-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-set-up-chat-ui]: /docs/aperture/how-to/set-up-chat-ui

[docs-tags]: /docs/features/tags

[docs-troubleshooting]: /docs/aperture/troubleshooting

[docs-use-your-tools]: /docs/aperture/use-your-tools

[docs-visible-groups]: /docs/aperture/visible-groups
