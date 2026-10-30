---
title: "Anthropic's new Model Context Protocol In 2 Minutes"
slug: "anthropics-new-model-context-protocol-in-2-minutes~hc0tx"
type: "post"
description: "Connect AI assistants to data systems seamlessly using JSON-RPC, with TypeScript and Python SDKs."
updatedAt: "2024-11-25T19:29:39.269Z"
---

Anthropic have [released a new open standard](https://www.anthropic.com/news/model-context-protocol) for connecting "AI assistants to the systems where data lives".

It's a JSON-RPC-based protocol that lets an LLM (in this case, Claude) communicate with a long-running server. Claude can request what different tools are available to use, and then call them.

There's a TypeScript and Python SDK, meaning you can easily create your own MCP servers to connect to your own data sources, or perform custom actions.