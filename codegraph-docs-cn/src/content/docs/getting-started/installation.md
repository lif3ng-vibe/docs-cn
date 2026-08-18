---
title: 安装
description: 安装 CodeGraph 并配置你的 AI 编码智能体。
---

## 1. 运行安装器

```bash
npx @colbymchenry/codegraph
```

安装器会：

- 询问要配置哪些智能体——从 **Claude Code**、**Cursor**、**Codex CLI**、**opencode**、**Hermes Agent**、**Gemini CLI**、**Antigravity IDE** 和 **Kiro** 中自动检测已安装者。
- 提示是否把 `codegraph` 安装到你的 `PATH`（以便智能体能够启动 MCP 服务器）。
- 询问配置作用于你的所有项目，还是仅当前项目。
- 为每个选定的智能体写入 MCP 服务器配置，并在其指令文件（`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`）中写入一小段由标记围起来的 CodeGraph 区块。Cursor 和 Kiro 只写入 MCP 配置。这些内容都可由 `codegraph uninstall` 干净移除。
- 当 Claude Code 是目标之一时，配置自动放行（auto-allow）权限。

安装器**只负责接通你的智能体——它不会索引你的代码。**安装完成后，请自行运行 `codegraph init` 为每个项目构建图谱（见下面第 3 步）。

## 非交互式（脚本 / CI）

```bash
codegraph install --yes                              # auto-detect agents, install global
codegraph install --target=cursor,claude --yes       # explicit target list
codegraph install --target=auto --location=local     # detected agents, project-local
codegraph install --print-config codex               # print snippet, no file writes
```

| 标志 | 取值 | 默认行为 |
|---|---|---|
| `--target` | `auto`、`all`、`none` 或逗号分隔列表（`claude,cursor,…`） | 询问 |
| `--location` | `global`、`local` | 询问 |
| `--yes` | （布尔值） | 每一步都询问 |
| `--no-permissions` | （布尔值）跳过 Claude 自动放行列表 | 权限默认开启 |
| `--print-config <id>` | 打印指定智能体的配置片段后退出 | — |

## 2. 重启你的智能体

重启你的智能体（Claude Code / Cursor / Codex CLI / opencode / Hermes Agent / Gemini CLI / Antigravity IDE / Kiro），让 MCP 服务器加载生效。

## 3. 初始化项目

```bash
cd your-project
codegraph init
```

`codegraph init` 会创建本地 `.codegraph/` 目录，并在同一步完成全量图谱的构建——一条命令搞定。全局执行一次 `codegraph install` 即可覆盖所有项目；而 `codegraph init` 需要每个项目各运行一次。

## 支持的平台

每个发布版本都为三大桌面操作系统提供自包含的构建（内置 Node 运行时——无需编译），x64 和 arm64 架构均有覆盖：

| 平台 | 架构 | 安装方式 |
|---|---|---|
| Windows | x64, arm64 | PowerShell 安装脚本或 npm |
| macOS | x64, arm64 | shell 安装脚本或 npm |
| Linux | x64, arm64 | shell 安装脚本或 npm |

## 卸载

改变主意了？一条命令即可把 CodeGraph 从它配置过的每个智能体中移除：

```bash
codegraph uninstall
```

这条命令会逆向执行安装器的操作——从每个已配置的智能体中剥离 CodeGraph 的 MCP 服务器配置、指令区块和权限。项目的索引（`.codegraph/`）不受影响；如需移除，请在各项目内运行 `codegraph uninit`。可用 `--target` 指定从哪些智能体移除，或用 `--yes` 非交互式执行。
