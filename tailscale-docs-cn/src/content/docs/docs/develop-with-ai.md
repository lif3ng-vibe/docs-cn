---
title: "用 AI 开发"
description: "为 AI 编码智能体和聊天助手提供准确的 Tailscale 信息。"
---

最后验证于 Jul 28, 2026

大语言模型的训练数据是公共文本的某个快照，因此它们回答 Tailscale 问题时，依据的只是训练数据里收录的文档、论坛帖子和博客文章。这些内容会过时，而 Tailscale 的配置语法也在不断变化。为此，Tailscale 提供了四种让模型获取最新信息的途径：面向编码智能体的 skill、用于搜索文档的 MCP 服务器、内置于本文档站的助手，以及每个文档页面的 Markdown 版本。

## 面向编码智能体的 Tailscale skill

Tailscale skill 为编码智能体提供 Tailscale 参考资料，让它们能够配置你的 [tailnet][docs-tailnet]，并构建使用 Tailscale 的应用。你只需安装一次，之后每当请求涉及 Tailscale，智能体就会调用它。它遵循 Agent Skills 标准，因此可与 Claude Code、Cursor、OpenCode、OpenAI Codex、Pi 以及其他支持该标准的智能体配合使用。安装说明和受支持智能体的完整列表，请参阅 [面向编码智能体的 Tailscale skill][docs-tailscale-skill]。

## 文档的 MCP 服务器

Tailscale 在 `https://tailscale.mcp.kapa.ai/` 发布了一个远程 [Model Context Protocol][xt-mcp]（MCP）服务器。在聊天助手或编码智能体中把它添加为自定义连接器或远程 MCP 服务器，模型就会获得一个工具，用于搜索 Tailscale 文档并返回与问题匹配的段落，以及每个段落的来源 URL。

带图形界面的客户端可以直接在连接器设置中填入该 URL。读取 JSON 配置文件的客户端则需要添加如下条目：

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

确切的语法和文件位置因客户端而异，有些客户端使用的配置格式也不相同。请参阅你所使用客户端的文档：

* [Claude Code][xt-claude-code-mcp]
* [Claude Desktop][xt-claude-connectors]，它将其称为自定义连接器
* [Cursor][xt-cursor-mcp]
* [OpenAI Codex][xt-codex-mcp]
* [Visual Studio Code][xt-vscode-mcp]

任何其他支持远程 MCP 服务器的客户端都可以按同样方式连接。通用做法请参阅 [Model Context Protocol 文档][xt-mcp]。

首次连接时，你的客户端会打开一个浏览器窗口来请求授权。完成提示操作后，该客户端的连接会一直保持。

MCP 服务器和 Tailscale skill 覆盖的需求不同，因此两者可以同时安装。skill 为智能体提供打包好的 Tailscale 指南，并带入每个请求；MCP 服务器则让智能体能够按需搜索最新发布的文档，当问题超出 skill 的覆盖范围、或智能体需要某个具体主题的原文时，这就很有用。

## 向 AI 提问

本文档站的每个页面都带有 **Ask AI** 助手，它基于 Tailscale 文档和"开始使用"视频播放列表，用自然语言回答问题。当你不想离开正在阅读的页面、又想得到某个具体问题的答案，或者想找出哪个主题涵盖了你所需的内容时，可以使用它。

回答会注明所引用的主题。当你需要完整流程或确切语法时，请顺着引用查看对应主题。

## 文档页面的 Markdown 版本

每个文档主题还会以 Markdown 格式发布，你可以把它粘贴到任何聊天助手中，作为回答问题的上下文。每个主题的标题下方有两个页面操作：

* **Copy as Markdown**（复制为 Markdown）：把该主题的 Markdown 源码复制到你的剪贴板。
* **View as Markdown**（查看为 Markdown）：在新标签页中打开该 Markdown 源码。

你也可以在任何文档 URL 末尾加上 `.md` 来获取同样的 Markdown。例如，`https://tailscale.com/docs/features/exit-nodes.md` 会返回出口节点主题的 Markdown 源码。

把某个主题粘贴到聊天中，模型就能拿到该页面的最新文本，当你需要一个基于特定流程的答案时这很有用。如果工作横跨多个主题，请改为安装 [Tailscale skill][docs-tailscale-skill]。

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-skill]: /docs/features/tailscale-skill

[xt-claude-code-mcp]: https://code.claude.com/docs/en/mcp

[xt-claude-connectors]: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp

[xt-codex-mcp]: https://learn.chatgpt.com/docs/extend/mcp

[xt-cursor-mcp]: https://cursor.com/docs/mcp

[xt-mcp]: https://modelcontextprotocol.io/docs/getting-started/intro

[xt-vscode-mcp]: https://code.visualstudio.com/docs/agent-customization/mcp-servers
