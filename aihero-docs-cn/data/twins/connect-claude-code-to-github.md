---
title: "Connect Claude Code To A GitHub MCP Server"
slug: "connect-claude-code-to-github"
type: "post"
description: "Boost Claude Code with GitHub MCP! Discover how developers can seamlessly modify codebases using this powerful terminal app integration."
tags:
  - set-up-your-agent
  - connect-tools-mcp
updatedAt: "2025-03-13T11:45:07.526Z"
---

Before we get into the abstract details about what MCP is, let's take a look at it working.

I'm a developer and my audience is mostly developers, so let's look at a developer use case.

Let's connect up a GitHub MCP server to Claude Code. Claude Code is a really powerful terminal app for using an LLM to modify a codebase.

I'll walk through the whole demo in the video above, but here are the steps I followed:

1. Install [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview).

2. Get a [GitHub API Key](https://github.com/settings/personal-access-tokens) and copy it into my clipboard.

3. Run this command:

```bash
claude mcp add
```

4. Add `github-server` as the name of the MCP server.

5. Scope it to the project.

6. Add `npx` as the command.

7. Add `-y @modelcontextprotocol/server-github@latest` as the args.

8. Add `GITHUB_PERSONAL_ACCESS_TOKEN=your-token-here` for the env.

9. Your MCP server should now be ready to use.
