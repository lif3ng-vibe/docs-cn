---
title: 集成
description: 受支持的智能体，以及手动 MCP 配置。
---

交互式安装器会自动检测并配置每一个受支持的智能体——把 CodeGraph MCP 服务器接入其中。对于使用指令文件的智能体，它还会写入一小段由标记围起来的 CodeGraph 区块（`CLAUDE.md`、`AGENTS.md` 或 `GEMINI.md`），让子智能体和不通过 MCP 接入的智能体外壳知晓 `codegraph explore` 命令；`codegraph uninstall` 可将其移除。

## 受支持的智能体

- **Claude Code**
- **Cursor**
- **Codex CLI**
- **opencode**
- **Hermes Agent**
- **Gemini CLI**
- **Antigravity IDE**
- **Kiro**

运行 `npx @colbymchenry/codegraph` 并选择你的智能体；非交互式标志见[安装](/getting-started/installation/)。

## 手动配置

如果你更愿意自己接入，可以全局安装：

```bash
npm install -g @colbymchenry/codegraph
```

将 MCP 服务器添加到 `~/.claude.json`：

```json
{
  "mcpServers": {
    "codegraph": {
      "type": "stdio",
      "command": "codegraph",
      "args": ["serve", "--mcp"]
    }
  }
}
```

（可选）在 `~/.claude/settings.json` 中为 CodeGraph 的工具设置自动放行：

```json
{
  "permissions": {
    "allow": [
      "mcp__codegraph__*"
    ]
  }
}
```

一条通配符就能自动批准每一个 CodeGraph 工具。服务器默认只列出一个工具——`codegraph_explore`——但如果你通过 `CODEGRAPH_MCP_TOOLS` 环境变量重新启用其他工具，它们同样已获准，不会再弹确认。

:::tip
Cursor 启动 MCP 子进程时所用的工作目录是错的。安装器会替你注入 `--path` 参数解决这一问题；如果你手动接入 Cursor，请显式传入项目路径。
:::
