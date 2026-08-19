---
title: "在 Orca 中使用 Claude Code"
description: "Claude Code 作为 Orca 的一等终端智能体运行——账号感知的会话启动、用量追踪与账号热切换。"
source: "https://www.onorca.dev/docs/agents/claude-code"
---

# 在 Orca 中使用 Claude Code

Claude Code 是 Anthropic 的智能体 CLI。Orca 将其作为一等终端智能体运行，提供账号感知的会话启动、用量追踪和账号热切换。

## 安装

1. 安装 Claude Code（`npm i -g @anthropic-ai/claude-code`，或按 Anthropic 文档操作）。
2. 在任意终端登录一次。
3. Orca 会自动识别 `~/.claude`——无需额外配置。

## 启动

在任意 worktree 中打开一个终端，在智能体下拉框中选择 **Claude Code**。Orca 会以该 worktree 为工作目录启动它，并装上一个状态行钩子，发出 Orca 用于渲染状态圆点的 OSC 标题事件。

## 用量与限流

Orca 读取本地 `~/.claude` 的用量状态，在状态栏显示当前用量以及距离限流的接近程度。参见[用量与限流追踪](/agents/usage-tracking)。

## 账号热切换

Orca 支持多个 Claude 账号，并可一键在它们之间切换，与 Codex 的流程一致。即使有正在运行的 Claude 会话，切换账号也能进行——Orca 会用一道护栏挡住进行中的切换，避免触发重叠的身份验证刷新。参见[热切换 Codex 账号](/agents/codex-hot-swap)——Claude 的流程与之完全同形。

## 子智能体与团队

后台子智能体和 Agent Teams 队友可以在 worktree 智能体列表和[智能体仪表盘](/model/agents-sessions#智能体仪表盘)中，以主智能体下方可展开的子行形式显示。选中某个子行会聚焦主终端。

## 钩子与记忆

Claude Code 支持按仓库配置的钩子和记忆文件。Orca 在[智能体钩子与记忆](/agents/hooks-memory)中呈现这些能力。
