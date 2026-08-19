---
title: "智能体钩子与记忆"
description: "Orca 读取并遵循 Claude Code 与 Codex 既有的钩子和记忆约定，并为适合 IDE 场景的部分提供 UI。"
source: "https://www.onorca.dev/docs/agents/hooks-memory"
---

# 智能体钩子与记忆

Orca 与 Claude Code、Codex 既有的智能体钩子和记忆约定相处融洽——它读取这些约定、遵循这些约定，并为其中适合 IDE 场景的部分提供 UI。

## 按仓库配置的钩子

Orca 会读取各仓库的 `.claude/` 和 `.codex/` 配置。当 Orca 在该仓库的某个 worktree 中启动智能体时，你已有的钩子照常运行。

## worktree 设置钩子

可配置在 worktree 创建后自动运行的命令——例如 `pnpm install`、`direnv allow`，或一个恢复 `.env` 文件的脚本。在 [Settings → Repository → Hooks](/settings)（设置 → 仓库 → 钩子）中设置。

## 记忆文件

Claude 的 `CLAUDE.md` 和 Codex 的 `AGENTS.md`（位于仓库根目录或嵌套位置）保持原样——它们属于智能体。Orca 会像对待其他文件一样把它们呈现在文件浏览器中，方便你就地编辑。

## 智能体状态钩子

**Settings → Agents → Agent status hooks**（设置 → 智能体 → 智能体状态钩子）控制由 Orca 托管的那些把 working / waiting / done 状态上报到 UI 的钩子。关闭该设置会移除这些托管钩子并不再重装；重新开启则会恢复它们，**无需重启 Orca**（在 Windows 上，WSL 钩子 relay 也遵循同一实时开关）。CLI 等价命令：`orca agent hooks status|on|off --json`。

## 在重启后存活

钩子端点会写入磁盘（POSIX 上是 `{userData}/agent-hooks/endpoint.env`，Windows 上是 `endpoint.cmd`），并在每次钩子调用时重新加载，因此长生命周期的智能体会话即使在应用重启后仍能连到存活的 Orca 服务器——不会再有比上一个会话活得还久的 PTY 向已失效的端口发 POST。

> **提示**：Orca CLI 暴露了一个带注释的 worktree 状态字段，智能体可以自行更新。参见 [worktree 检查点](/cli/worktree-checkpoints)。
