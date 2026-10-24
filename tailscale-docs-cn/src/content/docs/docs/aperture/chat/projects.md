---
title: "Chat projects"
description: "Aperture chat projects organize conversations around a shared purpose. Set instructions once for every conversation in a project. You can also restrict which tools those conversations can use."
---

Last validated Sep 29, 2026

Aperture chat projects organize conversations around a shared purpose. Set instructions once for every conversation in a project. You can also restrict which tools those conversations can use.

Projects are personal. Other users in your tailnet cannot view or access them.

## What you can do with projects

* **Group conversations** by topic, client, or workflow.
* **Write reusable instructions** for every conversation in the project.
* **Restrict tool access** for project conversations.
* **Assign tailnet nodes** to guide which machines conversations try first.
* **Pin projects** to the sidebar for quick access.

## Create a project

You can create a project in two ways:

* **From the Projects page**: Open the **Projects** page from the sidebar and select **New project**. Enter a name and select **Create**.
* **From the new chat composer**: Open the project picker in the composer and type a name. If no existing project matches, select the **Create project** row that appears.

Project names can be up to 120 characters.

## Write project instructions

Each project has an instructions field where you describe what the project is about and how you want answers written. Instructions appear in an always-open text area on the project page.

To write or edit instructions:

1. Open **Projects** from the sidebar, then select the project.
2. Type your instructions in the text area.
3. Select **Save instructions**.

Changes take effect on the next message in any conversation in the project, including existing conversations.

### How instructions reach the model

Aperture appends project instructions to the system prompt without additional wrapping or formatting. Instructions guide responses. They do not grant access to models or tools.

## Manage conversations in a project

A conversation belongs to one project at a time. Adding a conversation to a project removes it from any previous project. Conversations in a project also appear in your main **Chats** list.

### Add a conversation

You can add conversations to a project in several ways:

* **From the new chat composer**: Open the project picker and select the project. The current conversation moves to that project.
* **From the conversation actions menu**: Open the actions menu for a conversation and select the project.
* **From the project page**: Select **Add existing chat** and choose conversations to add.
* **In bulk from recent chats**: Select multiple conversations in your recent chats list, then add them to a project.

### Remove a conversation

To remove a conversation from a project, select **Remove from project** in the conversation actions menu or project picker.

Removing a conversation from a project does not delete the conversation. It remains in your **Chats** list.

### Start a new chat in a project

Select **New chat** on the project page. The new conversation belongs to the project from the first message, so project instructions apply from the start.

## Customize tool access

By default, conversations in a project can use all available tools. You can restrict tool access to a specific set.

To customize which tools are available in a project:

1. Open **Projects** from the sidebar, then select the project.
2. In **Tools**, select **Customize**.
3. Turn off the tools you want to disable for this project.

Individual conversations within the project can use fewer tools than the project enables, but they cannot enable tools the project disables.

To restore all available tools, select **Reset**.

## Assign tailnet nodes

Assign tailnet nodes to guide which machines chat tries first for tasks such as running commands or reading system state. Chat can use another visible node when your request calls for it. Assignment does not grant Tailscale SSH access or restrict chat to the assigned nodes. Your tailnet's Tailscale SSH policy remains authoritative.

To list available nodes, you need access to the Tailscale SSH connector. The node list contains machines visible to your Aperture gateway.

1. Open **Projects** from the sidebar, then select the project.
2. Select **Add node** in the project's node section.
3. Search by node name or tag.
4. Select a node to assign it to the project.

Changes save automatically. To remove an assignment, select the remove button next to the node.

If no nodes are available and none are assigned, the node section is hidden.

## Pin a project

Select **Pin project** next to the project name to pin it to the sidebar. Pinned projects appear in **Pinned**, above recent chats. Expand a project to display its conversations. It expands automatically when you open one of its conversations.

## Search for projects

You can find projects from two places:

* **Global search**: Press `CMD+K` (or `CTRL+K`) to open the search dialog. Projects appear first (up to three results), followed by conversations. Search matches against project names.
* **Projects page**: The search field on the **Projects** page filters your project list. This search shows only projects, with no result limit.

## Delete a project

To delete a project:

1. Open **Projects** from the sidebar, then select the project.
2. Open the project actions menu and select **Delete project**.
3. If the project contains conversations, choose whether to delete them too:
   * To keep them, leave the **Also delete the … chats in this project** checkbox cleared. The conversations remain in **Chats**.
   * To delete them, select the checkbox and type the project name to confirm. This permanently deletes the conversations and cannot be undone.
4. Select **Delete project**, or **Delete project and … chats** if you selected the checkbox. The checkbox and button show the number of chats affected.

## Limits

| Limit                      | Value                    |
| -------------------------- | ------------------------ |
| Project name length        | 120 characters (display) |
| Instructions size          | 16 KiB (16,384 bytes)    |
| Projects per conversation  | 1                        |
| Assigned nodes per project | 25                       |

## Related

* [Chat projects reference][docs-chat-projects] for project behavior and limits.
* [Chat connectors reference][docs-chat-connectors] for connector access in chat.
* [Chat sandbox][docs-chat-sandbox] to run code in an isolated environment during a conversation.

[docs-chat-connectors]: /docs/aperture/reference/chat#connectors

[docs-chat-projects]: /docs/aperture/reference/chat#projects

[docs-chat-sandbox]: /docs/aperture/chat-sandbox
