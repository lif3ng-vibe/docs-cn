---
title: 快速开始
description: 几秒钟内上手 CodeGraph。
---

几秒钟内上手 CodeGraph。

## 1. 安装 CLI

不需要 Node.js——一条命令即可为你的操作系统抓取对应的构建：

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex
```

已经装了 Node？`npm i -g @colbymchenry/codegraph` 在任何版本上都能用。CodeGraph 自带运行时——无需编译、没有原生构建，在任何环境下表现一致。安装器会把 `codegraph` 放上你的 `PATH`，但不会修改当前 shell——进行下一步之前，请先打开一个新终端。

## 2. 接入你的智能体

```bash
codegraph install
```

自动检测并配置 Claude Code、Cursor、Codex CLI、opencode、Hermes Agent、Gemini CLI、Antigravity IDE 和 Kiro——把 CodeGraph MCP 服务器逐一接入。这一步只负责连接你的智能体，**不会**索引任何代码。（快捷方式：`npx @colbymchenry/codegraph` 一步完成下载并运行安装器。）

## 3. 初始化每个项目

```bash
cd your-project
codegraph init
```

`codegraph init` 会创建本地 `.codegraph/` 目录，并在同一步完成全量图谱的构建——一条命令，就此搞定。只要存在 `.codegraph/` 目录，你的智能体就会自动使用 CodeGraph 工具。

接下来：构建[你的第一个图谱](/getting-started/your-first-graph/)，或查看完整的[安装](/getting-started/installation/)选项。
