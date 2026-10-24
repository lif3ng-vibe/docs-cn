---
title: "Develop with AI"
description: "Give AI coding agents and chat assistants accurate Tailscale information."
---

Last validated Jul 28, 2026

Large language models are trained on a snapshot of public text, so they answer Tailscale questions from whatever documentation, forum posts, and blog articles were included in their training data. That material ages, and Tailscale configuration syntax changes. Tailscale provides four ways to give a model current information instead: a skill for coding agents, an MCP server that searches the documentation, an assistant built into this documentation site, and a Markdown version of every documentation page.

## Tailscale skill for coding agents

The Tailscale skill supplies coding agents with Tailscale reference material so they can configure your [tailnet][docs-tailnet] and build applications that use Tailscale. You install it once, and the agent draws on it when a request involves Tailscale. It follows the Agent Skills standard, so it works with Claude Code, Cursor, OpenCode, OpenAI Codex, Pi, and other agents that support the standard. For installation instructions and the full list of supported agents, refer to [Tailscale skill for coding agents][docs-tailscale-skill].

## MCP server for the documentation

Tailscale publishes a remote [Model Context Protocol][xt-mcp] (MCP) server at `https://tailscale.mcp.kapa.ai/`. Add it as a custom connector or a remote MCP server in a chat assistant or a coding agent, and the model gains a tool that searches the Tailscale documentation and returns the passages that match a question, along with the source URL for each passage.

Clients with a graphical interface accept the URL directly in their connector settings. Clients that read a JSON configuration file take an entry like this one:

```json
{
  "mcpServers": {
    "tailscale-docs": {
      "type": "http",
      "url": "https://tailscale.mcp.kapa.ai/"
    }
  }
}
```

The exact syntax and file location vary by client, and some clients use a different configuration format. Refer to the documentation for the client you use:

* [Claude Code][xt-claude-code-mcp]
* [Claude Desktop][xt-claude-connectors], which calls them custom connectors
* [Cursor][xt-cursor-mcp]
* [OpenAI Codex][xt-codex-mcp]
* [Visual Studio Code][xt-vscode-mcp]

Any other client that supports remote MCP servers connects the same way. For the general model, refer to the [Model Context Protocol documentation][xt-mcp].

The first time you connect, your client opens a browser window to authorize access. Complete the prompt, and the connection persists for that client.

The MCP server and the Tailscale skill cover different needs, so you can install both. The skill gives an agent packaged Tailscale guidance that it carries into every request. The MCP server lets the agent search current published documentation on demand, which helps when a question falls outside what the skill covers or when the agent needs the text of one specific topic.

## Ask AI

Every page on this documentation site includes an **Ask AI** assistant that answers questions in natural language using the Tailscale documentation and the Get started video playlist. Use it when you want an answer to a specific question without leaving the page you are reading, and to find which topic covers what you need.

Answers cite the topics they draw from. Follow the citations when you need the full procedure or the exact syntax.

## Markdown versions of documentation pages

Every documentation topic is also published as Markdown, which you can paste into any chat assistant as context for a question. Two page actions appear below the title of each topic:

* **Copy as Markdown** copies the Markdown source of the topic to your clipboard.
* **View as Markdown** opens the Markdown source in a new tab.

You can also add `.md` to the end of any documentation URL to get the same Markdown. For example, `https://tailscale.com/docs/features/exit-nodes.md` returns the Markdown source of the exit nodes topic.

Pasting a topic into a chat gives the model the current text of that page, which is useful when you need an answer grounded in one specific procedure. For work that spans several topics, install the [Tailscale skill][docs-tailscale-skill] instead.

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-skill]: /docs/features/tailscale-skill

[xt-claude-code-mcp]: https://code.claude.com/docs/en/mcp

[xt-claude-connectors]: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp

[xt-codex-mcp]: https://learn.chatgpt.com/docs/extend/mcp

[xt-cursor-mcp]: https://cursor.com/docs/mcp

[xt-mcp]: https://modelcontextprotocol.io/docs/getting-started/intro

[xt-vscode-mcp]: https://code.visualstudio.com/docs/agent-customization/mcp-servers
