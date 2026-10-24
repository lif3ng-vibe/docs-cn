---
title: "Built-in connectors"
description: "Aperture includes two connectors whose tools ship with the product instead of coming from an upstream MCP server: **Tailnet** and **Tailscale SSH**. Both act upon your tailnet through Tailscale itself"
---

Last validated Sep 29, 2026

> **Note:** Built-in Tailnet connectors are currently in alpha.

Aperture includes two connectors whose tools ship with the product instead of coming from an upstream MCP server: **Tailnet** and **Tailscale SSH**. Both act upon your tailnet through Tailscale itself, so they need no external MCP server or third-party credential.

This topic is for Aperture admins setting up these connectors and granting access to users.

Use these connectors for the following jobs:

* Join a new application, service, or machine to the user's tailnet.
* Discover the tailnet machines that have [Tailscale SSH][docs-tailscale-ssh] enabled.
* Run a shell command on one of those machines.

An admin must set up each connector before users can use it. Unconfigured built-in connectors appear under **Available to add** in Chat **Connectors**. Only admins can access **Configure**. Guided setup creates the connector and grants the admin who performs setup access. Access for every other user or group remains deny-by-default.

Tailscale SSH setup takes about a minute. Tailnet setup takes about ten minutes because you create a Tailscale OAuth app first.

## Prerequisites

Before you begin, you need the following:

* The [admin role][docs-set-up-admin-access] in Aperture, to set up a connector and edit grants.
* For the tailnet connector, permission to create a Tailscale OAuth app in your tailnet, which requires the [Owner](/docs/reference/user-roles) or [Admin](/docs/reference/user-roles) role in that tailnet, plus a Tailscale API access token.
* For the Tailscale SSH connector, target machines with Tailscale SSH enabled. Your tailnet policy must let the Aperture node connect to them.

## How built-in connectors differ from other connectors

Before configuration, Tailnet and Tailscale SSH appear under **Available to add**. After configuration, a granted user sees them under **Ready to use** and can review their tools. Aperture supplies these tools. Their tool sets can change with Aperture releases.

Both connectors differ from system connectors:

* The `system` label and built-in connectors are separate concepts. Both guided setups assign `restricted`, which grants nothing on its own. The shipped default configuration grants `label:system`, which reaches only the built-in `aperture` connector. Tailnet and Tailscale SSH do not receive that label, and you cannot give it to them: Aperture strips the reserved `system` label from every `connectors.servers` entry and reports a warning that blocks the save. Grant these connectors by ID instead. Refer to [the reserved `system` label][docs-connectors-reference-labels].

## Where to define grants

The grant examples in this topic show a single `connectors` capability entry. Add each one to a grant whose `src` names the users or groups that need the connector, in one of the following two places:

* Add the grant in the Aperture gateway configuration. \[Missing snippet: aperture\_admin\_nav.mdx] Use the visual grant editor, or edit the same `grants` array as JSON on **Administration** > **Configuration**.
* Add the grant in the tailnet policy file. Add it to the `grants` array of the tailnet the Aperture gateway belongs to.

The following example shows a complete Aperture configuration grant that gives the `ai-users` group every tool from the tailnet connector:

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "connectors": ["Tailnet/**"] }
        ]
      }
    }
  ]
}
```

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

Guided setup adds a `<connector-id>/**` grant for the admin who performs setup. Add grants manually for every other user or group. Chat omits configured connectors denied by grants.

The first segment of a `connectors` pattern is the connector ID, the key under `connectors.servers`, not the `provider` value. Guided setup uses `Tailnet` and `TailnetSSH` as the IDs. If you choose a different ID, use it in your grants. IDs must start with a letter and contain only letters and digits.

The `provider` value is fixed and case-sensitive: exactly `Tailnet` or `TailnetSSH`. Aperture rejects any other value as an unknown provider.

## Tailnet connector

The tailnet connector returns a single-use auth key that an agent can use to join one new node to the user's tailnet on their behalf.

The connector provides one tool:

| Tool             | Client-facing name       | What it does                                                                                                   |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `provision_node` | `Tailnet_provision_node` | Starts a one-time browser authorization, then returns a single-use Tailscale auth key after the user approves. |

Use this connector for workflows where an agent brings a new application or service into the tailnet. The agent holds no long-lived shared credential. Instead, it presents an authorization link for a person to approve, and only after that approval does Aperture return a single-use auth key.

### Step 1: Set up the connector

Use guided setup to create the Tailscale OAuth app with the scope and node attributes that `provision_node` requires, then save the connector configuration.

To set up the connector:

1. Open Chat **Connectors**.
2. Expand **Available to add**.

1) Select **Configure** next to **Tailnet**. The **Configure Tailnet** section opens on the connector details page.

1. Generate a Tailscale API access token with admin scope from the **Keys** page of the [Tailscale admin console][docs-api-access-tokens].
2. In your terminal, export the token as `TS_API_TOKEN`.
3. Copy the command from the panel's **Terminal** block and run it in the same terminal session to create the OAuth app.
4. Paste the `clientSecret` from the response into **Client secret**.
5. Select **Configure**.

For example, in Bash or Zsh, the following command prompts for the API access token without displaying it and exports it for the command you copy from the panel:

```shell
printf "Paste your Tailscale API access token: " \
  && read -rs TS_API_TOKEN \
  && export TS_API_TOKEN \
  && echo
```

The panel's command includes the callback URL for your Aperture gateway. Use that command rather than substituting a different hostname or connector ID.

By default, provisioned devices carry the `custom:createdByAperture` and `custom:createdByAI` node attributes, which identify them as Aperture-created and AI-created. Reference these attributes in [device posture][docs-device-posture] conditions and [grants][docs-node-attributes] to gate access based on how a device joined. Refer to [Device provisioning with OAuth apps][docs-device-provisioning] for the full OAuth app reference.

> **Note:**
>
> The client secret is required. Aperture reads the client ID out of it, so Aperture rejects a secret in any form other than `tskey-app-<id>-<secret>`.

### Step 2: Grant access

Guided setup grants access to the admin who performs setup. Add a `connectors` grant for other users who need the tool, in one of the locations described in [Where to define grants][ar-where-to-define-grants]. To grant the provisioning tool by itself:

```json
{ "connectors": ["Tailnet/tools/provision_node"] }
```

To grant every tool from the connector:

```json
{ "connectors": ["Tailnet/**"] }
```

Refer to [Grant access to MCP tools][docs-grant-mcp-tool-access] for the full pattern syntax.

### Authorization flow

This connector does not use the **Connect** button. Authorization starts from the tool and runs one time per provisioned node:

1. The agent calls `Tailnet_provision_node` with no arguments.
2. Aperture returns an authorization link. The agent presents it in chat as a clickable link labeled "Authorize deploying the application to my tailnet", and never pastes the raw URL.
3. The user opens the link and approves the request.
4. The agent calls the tool again.
5. Aperture returns the single-use auth key.

The link opens Tailscale's OAuth consent screen. By approving, the user lets the agent collect a single-use, short-lived auth key and use it to connect one device to the tailnet on their behalf. After approving, the user sees a confirmation page and can close the tab.

Tailscale binds the auth key to the identity of the user who authorizes its creation. The agent uses that key to connect a device with the user's identity, not to create a new Tailscale identity.

The provisioned device does not appear in the Aperture admin dashboard. It joins the tailnet and appears on the [Machines](https://console.tailscale.com/admin/machines) page of the Tailscale admin console. By default, it carries the `custom:createdByAperture` and `custom:createdByAI` node attributes.

The user must approve the authorization link within 15 minutes, and the agent must collect the key within 10 minutes after approval. Aperture discards the pending flow or the uncollected key after those windows, and the agent starts over with a new call. If authorization fails or times out, refer to [OAuth 2.0 authorization fails][docs-troubleshooting-oauth].

Aperture authorizes each call rather than each user, so the connector reports **Ready** in Chat **Connectors** once it is configured and granted. **Ready** means the connector is usable, not that any node is authorized: every provisioned node still needs its own approval. Aperture stores no credential to connect or disconnect.

### Tailnet configuration reference

Guided setup writes the following configuration to `connectors.servers`, which you can review on **Administration** > **Configuration**. Use it to audit an existing entry. The `Tailnet` key is the connector ID your grants must reference.

```json
{
  "connectors": {
    "servers": {
      "Tailnet": {
        "provider": "Tailnet",
        "protocol": "mcp",
        "url": "https://api.tailscale.com",
        "labels": ["restricted"],
        "auth": {
          "type": "oauth2_authorization_code",
          "client_id": "<oauth-client-id>",
          "client_secret": "<oauth-client-secret>",
          "auth_url": "https://login.tailscale.com/a/oauth_authorize",
          "token_url": "https://api.tailscale.com/api/v2/oauth/token",
          "scopes": ["auth_keys:create:once"],
          "auth_params": {
            "node_attributes": "{\"custom:createdByAperture\":true,\"custom:createdByAI\":true}"
          }
        }
      }
    }
  }
}
```

`auth.type` must be `oauth2_authorization_code`. Any other auth type produces the load-time error `connectors.servers.<id>: built-in provider "Tailnet" requires auth type "oauth2_authorization_code"`.

The `custom:createdByAperture` and `custom:createdByAI` node attributes are defaults, not fixed requirements. To use different custom attributes, edit `auth.auth_params.node_attributes` in the connector's HuJSON configuration. Update the OAuth app's `allowedNodeAttributes` allowlist to permit the attributes you configure.

The `node_attributes` value must stay within the OAuth app's `allowedNodeAttributes` allowlist. Aperture sends it on the token exchange, so an attribute the app does not allow fails the exchange rather than the save.

Guided setup labels both connectors `restricted`. The label records intent and [enforces nothing on its own][docs-connectors-labels]. Restriction comes from narrow grants.

## Tailscale SSH connector

The Tailscale SSH connector discovers SSH-enabled machines in the tailnet and runs one shell command on a chosen machine.

The connector provides two tools:

| Tool            | Client-facing name         | What it does                                                                           |
| --------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `list_machines` | `TailnetSSH_list_machines` | Lists the tailnet machines that have Tailscale SSH enabled, with status, OS, and tags. |
| `run_command`   | `TailnetSSH_run_command`   | Runs one shell command on one listed machine over Tailscale SSH.                       |

This connector holds no credential of its own. It connects as the Aperture node, so your tailnet's Tailscale SSH policy determines what it reaches.

### Step 1: Set up the connector

To set up the connector:

1. Open Chat **Connectors**.
2. Expand **Available to add**.
3. Select **Configure** for **Tailscale SSH**.

This connector has no configuration fields. Setup writes the connector configuration, then adds a `TailnetSSH/**` grant for the admin who performs it. Aperture appends that grant to the configuration grant policy whose only `src` entry is that admin account's login name, or adds a policy for them if none exists.

### Step 2: Grant access

Setup grants the connector only to the admin who ran it. Add a `connectors` grant for every other user who needs the tools, in one of the locations described in [Where to define grants][ar-where-to-define-grants]. Use one of the following patterns:

| Pattern                            | Grants                  |
| ---------------------------------- | ----------------------- |
| `"TailnetSSH/tools/list_machines"` | Machine discovery alone |
| `"TailnetSSH/tools/run_command"`   | Command execution alone |
| `"TailnetSSH/**"`                  | The whole connector     |

For example:

```json
{ "connectors": ["TailnetSSH/tools/list_machines"] }
```

This connector runs commands on reachable tailnet machines, so grant it narrowly. A user with a broad `"**"` grant reaches it regardless of the connector's label.

### Call the connector tools

To test the connector after setup, call its tools in the following order:

1. Call `TailnetSSH_list_machines` to discover eligible targets.
2. Take a machine name from the **Machine** column of the result.
3. Call `TailnetSSH_run_command` with `machine` and `command`.

`run_command` also accepts two optional fields:

| Field     | Default | Description                                                                                                                                               |
| --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`    | `root`  | The remote user to connect as. Your Tailscale SSH policy determines whether this user has permission.                                                     |
| `timeout` | `300`   | Command timeout in seconds. The maximum is 600. Aperture clamps longer values. On timeout, Aperture stops the command and returns the output it produced. |

Aperture resolves the `machine` value against the network map. A full MagicDNS name or an exact hostname wins over a short name. If a short name matches more than one machine, the tool asks for the full name instead. Matching ignores case.

A machine on the list has Tailscale SSH enabled. That does not mean the Aperture node can run commands on it. Your tailnet's Tailscale SSH policy decides access when `run_command` connects, so a listed machine can still refuse.

### Behavior and limits

The following behaviors apply to every `run_command` call:

* Each call opens a fresh SSH session. Working directory, environment variables, and shell state do not carry over, so combine steps into one command, such as `cd /srv && ./deploy.sh`.
* A job that runs in the background ends when the call returns, unless the command detaches it, such as `nohup cmd >/tmp/out 2>&1 &`.
* Aperture gives the connection 30 seconds to establish, separate from the command timeout.
* Aperture returns `stdout` and `stderr` together with the exit code.
* The tool result reports a non-zero exit code instead of failing the call.
* Aperture truncates output at about 1 MiB. Filter large output on the remote machine.
* Aperture verifies the machine's SSH host key against the tailnet network map on every call, so there is no trust-on-first-use window and no host-key approval prompt.
* The machine list reflects the tailnet at the moment of the call. Aperture does not cache it.
* Machine names, OS values, and tags come from other tailnet members. Aperture marks them as data rather than instructions when it hands them to the model.
* Each call writes one audit log line with the connector ID, calling user, machine, remote user, full command, and exit code. Aperture does not log command output.

### Tailscale SSH configuration reference

Setup writes the following configuration. This connector has no `auth` block, because it connects as the Aperture node.

```json
{
  "connectors": {
    "servers": {
      "TailnetSSH": {
        "provider": "TailnetSSH",
        "protocol": "mcp",
        "url": "https://api.tailscale.com",
        "labels": ["restricted"]
      }
    }
  }
}
```

The `url` value is a placeholder for this built-in connector, not an upstream MCP endpoint.

## Verify a built-in connector

To confirm a built-in connector works:

1. Open Chat **Connectors**.
2. Under **Ready to use**, confirm the connector shows **Ready**.
3. Select the connector to review the detail tool list.
4. Confirm the users who need it have a matching `connectors` grant.
5. Call a tool from a client through Aperture's [MCP endpoint][docs-aperture-mcp-server], then compare the result with the following.

**Ready** describes access and authorization. It does not prove that a node is authorized or that an upstream service is healthy.

A successful `TailnetSSH_list_machines` call returns a count summary, notes about authorization and data handling, and a table:

```text
Tailnet machines with Tailscale SSH enabled: 2 total, 1 online, 1 offline.

| Machine | Status | OS | Tags |
| --- | --- | --- | --- |
| build-1.tail0abc.ts.net | offline (last seen 2026-08-12) | linux | tag:ci |
| web-1.tail0abc.ts.net | online | linux | - |
```

A tailnet with no SSH-enabled machines returns `No tailnet machines have Tailscale SSH enabled.` instead.

A successful `TailnetSSH_run_command` call returns a header line followed by the combined output, or `(no output)` when the command produced none:

```text
Ran on web-1.tail0abc.ts.net (user root), exit code 0:

Linux web-1 6.8.0-40-generic x86_64
```

## Related

* [Get started with connectors][docs-connectors-get-started] - Add and grant your first connector.
* [How connectors work][docs-connectors-how-it-works] - The connector model, grants, and capability behavior.
* [Aperture connectors reference][docs-connectors-reference] - Connector field definitions and API behavior.
* [Grant access to MCP tools][docs-grant-mcp-tool-access] - Connector grant patterns.
* [Aperture grants vs. tailnet policy file grants][docs-aperture-vs-tailnet-grants] - Choose where to define grants and convert between the two forms.
* [Tailscale SSH][docs-tailscale-ssh] - Enable Tailscale SSH and write access rules for it.
* [Device provisioning with OAuth apps][docs-device-provisioning] - The OAuth app and authorization code flow the tailnet connector uses.
* [Aperture Chat reference][docs-aperture-chat-connectors] - Where to find connectors in Aperture and provisioned devices in the Tailscale admin console.

[ar-where-to-define-grants]: #where-to-define-grants

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-aperture-mcp-server]: /docs/aperture/mcp-server

[docs-aperture-vs-tailnet-grants]: /docs/aperture/reference/aperture-vs-tailnet-grants

[docs-api-access-tokens]: /docs/reference/tailscale-api

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-labels]: /docs/aperture/connectors/reference#connector-labels

[docs-connectors-reference-labels]: /docs/aperture/connectors/reference#the-reserved-system-label

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-device-posture]: /docs/features/device-posture

[docs-device-provisioning]: /docs/features/oauth-apps/device-provisioning

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-node-attributes]: /docs/reference/syntax/policy-file#nodeattrs

[docs-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-troubleshooting-oauth]: /docs/aperture/troubleshooting#oauth-20-authorization-fails
