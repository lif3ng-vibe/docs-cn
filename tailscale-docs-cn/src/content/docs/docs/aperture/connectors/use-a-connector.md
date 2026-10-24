---
title: "Use a connector"
description: "Use built-in connectors, or connectors that an admin has configured, to let your agents call tools and query APIs. To configure connectors and grant access as an admin, refer to [Get started with conn"
---

Last validated Oct 1, 2026

Use built-in connectors, or connectors that an admin has configured, to let your agents call tools and query APIs. To configure connectors and grant access as an admin, refer to [Get started with connectors][docs-connectors-get-started].

## Prerequisites

An admin has configured the connector and granted you access to the tools or proxy path that you need. Built-in connector tools also require matching grants.

Aperture Chat hides configured connectors that your grants deny, even if you are an admin. A denied connector's detail URL shows the same not-found state as a connector that does not exist. If an expected connector or tool is missing, ask your admin to [check your connector and tool grants][docs-grant-mcp-tool-access].

## Check a connector's status

Open **Connectors** in the [Aperture Chat portal][docs-aperture-chat-connectors]. Each connector's section, status badge, or action button shows what to do next. The built-in `aperture` system connector appears first in the list.

The following table describes each section and status:

| Section or status                      | Meaning                                                                                                                                                | Action                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| **Ready to use** and **Ready**         | You have access and any required authorization. **Ready** does not confirm that the upstream service is reachable.                                     | Select the connector to review its tools.      |
| **Connect to use** with **Connect**    | You have access but have not authorized this per-user connector. Chat shows no status badge.                                                           | Select **Connect** and complete consent.       |
| **Needs reconnect** with **Reconnect** | Your authorization needs renewal. The access token expired without a refresh token, or the provider rejected a token refresh and requires new consent. | Select **Reconnect**.                          |
| **Temporarily unavailable**            | Aperture could not read your credential state.                                                                                                         | Reload the page. You do not need to reconnect. |

Chat does not show a **No access** status. It hides connectors that your grants deny.

If the provider does not issue a refresh token, a new authorization stays **Ready** until its access token expires.

## Authorize a per-user connector

Each user must authorize a per-user OAuth connector individually. This includes connectors that use dynamic client registration. Use Aperture Chat to connect, reconnect, or disconnect.

To authorize a per-user connector:

1. Open **Connectors** in Aperture Chat.
2. Under **Connect to use**, select **Connect**.
3. Sign in to the provider and grant consent.
4. On the connector detail page, confirm that the status is **Ready**.

Aperture tries to discover your tools before it returns you to the detail page. If the upstream service is slow or unreachable, the tools might not appear immediately.

A pending authorization expires after 15 minutes. If it expires, select **Connect** again.

## Review or refresh MCP tools

Select a **Ready** MCP connector to review its **Tools**. The detail page groups tools under **Interactive tools**, **Read-only tools**, and **Write/Delete tools** when present. Select **Refresh tools** to request the current tools from the upstream service. If the refresh fails, Chat shows **Couldn't refresh tools.** and the status stays **Ready**. Status describes access and authorization, not upstream health.

## Discover and call tools

After you have access to a connector and complete any required authorization, your agent reaches its capabilities through Aperture. You can list and call only the tools that your grants permit.

Send these requests from a device in your tailnet. Aperture identifies you from the Tailscale connection, so no API token is required.

* **MCP tools in chat or agent clients**: After you authorize, Aperture discovers tools with your credentials. Your agent can call the tools that your grants permit. If tools are missing, [refresh the MCP tools][ar-review-or-refresh-mcp-tools].

* **MCP tools in a custom MCP client**: Point your MCP client at the Aperture `/v1/mcp` endpoint. In the following commands, set `APERTURE_HOST` to your Aperture gateway's [MagicDNS name][docs-magicdns-access], such as the hostname in your browser's address bar when you open Aperture Chat.

  \[Missing snippet: aperture\_mcp\_list\_tools.mdx]

  Aperture adds the connector ID and an underscore to the start of each tool name from a verified or custom connector. For example, Aperture exposes a `search` tool from a connector with ID `github` as `github_search`. Each upstream server defines its own tool arguments, so use the `inputSchema` that `tools/list` returns when you call a tool.

* **HTTP APIs**: Send requests to `/v1/connectors/<id>/<path>`. Aperture injects the connector's credentials automatically. To find the HTTP connectors that you can reach, call the built-in `aperture_list_connectors` tool. This tool is available only if at least one HTTP connector exists and your grants permit `aperture/tools/list_connectors`.

  For example, if your admin configured an HTTP connector with ID `github` and upstream URL `https://api.github.com`, this request gets the authenticated GitHub account from `/user`:

  ```shell
  curl -i http://<aperture-hostname>/v1/connectors/github/user
  ```

  If the credential is valid and you have a `github/proxy` grant, GitHub returns `200 OK` and account JSON with a `login` field. If Aperture returns `403 Forbidden`, refer to [HTTP connector returns 403 Forbidden][docs-troubleshooting-http-403]. For a different API, replace `github` with its connector ID and `user` with the API path.

## Reconnect when tools stop working

If a connector shows **Ready** but tool calls fail, read the error before you reconnect. Provider downtime, network timeouts, and rate limits can cause failures while your authorization is still valid. Retry temporary failures later. If the tool list is missing or outdated, [refresh the MCP tools][ar-review-or-refresh-mcp-tools].

If the provider revokes or expires your refresh token, the connector changes to **Needs reconnect**. To renew your authorization:

1. Open **Connectors** in Aperture Chat.
2. Select the connector.
3. Select **Reconnect**.
4. Complete the provider's consent flow.

If the problem recurs after the access token expires, ask your admin to check the provider's offline-access settings. If your admin changes the connector's scopes or other OAuth settings, your existing authorization keeps its old settings. To authorize with the new settings, select **Disconnect**, then select **Connect**.

**Disconnect** clears your stored authorization and cached tool list for this connector. It does not affect other users. To use the connector again, select **Connect** and complete consent. Do not disconnect only because a tool call failed while the connector is **Ready**.

## Related

* [Get started with connectors][docs-connectors-get-started] to configure a connector and grant access.
* [How connectors work][docs-connectors-how-it-works] to understand the connector model, authentication, and access control.
* [Connectors reference][docs-connectors-reference] for connector statuses, authentication types, and protocol behavior.
* [Grant access to MCP tools][docs-grant-mcp-tool-access] to grant users access to connectors and tools.

[ar-review-or-refresh-mcp-tools]: #review-or-refresh-mcp-tools

[docs-aperture-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-connectors-get-started]: /docs/aperture/connectors/get-started

[docs-connectors-how-it-works]: /docs/aperture/connectors/how-connectors-work

[docs-connectors-reference]: /docs/aperture/connectors/reference

[docs-grant-mcp-tool-access]: /docs/aperture/how-to/grant-mcp-tool-access

[docs-magicdns-access]: /docs/features/magicdns#accessing-devices-over-magicdns

[docs-troubleshooting-http-403]: /docs/aperture/troubleshooting#http-connector-returns-403-forbidden
