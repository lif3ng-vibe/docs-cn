---
title: "你的第一个三智能体会话"
description: "从空应用到三个智能体并行运行，不超过五分钟。"
source: "https://www.onorca.dev/docs/first-session"
---

# 你的第一个三智能体会话

从空应用到三个智能体并行运行，不超过五分钟。

这是全部文档中最重要的一页。读完时，你将拥有三个智能体，以三种不同思路并行处理同一个任务，并交付一个 PR。

完整走查——分屏窗格中运行三个智能体，每个对应一个 worktree

## 1. 添加仓库

点击侧边栏上的 **Add Repo**，把 Orca 指向一个本地检出。Orca 会读取仓库的 git 状态，并把你的默认分支选为**基准引用（base ref）**——所有新 worktree 都从这个引用分叉。

之后你可以在仓库设置中更改基准引用。

## 2. 创建 worktree

点击仓库名旁边的 **+**。输入一个任务名（"fix-login-race" 就很好——留空的话，Orca 会用一种海洋生物的名字命名）。

一键工作区启动器——选择一个智能体，或打开一个空终端。默认项可在 Settings 中自定义。

启动器会预先选中你的**默认智能体**（可在 [Settings → Agents](/settings) 配置）；如果你想从零开始，也可以选择空终端。置顶的 worktree 在侧边栏中更加醒目，让那些你真正常住的 worktree 始终可见。

选择一个**起始引用（start-from ref）**。大多数时候就是你的基准引用（`origin/main`），但你也可以从任意分支或提交开始。

Orca 会在其托管目录下创建一个真实的 git worktree，检出该分支并打开它。

## 3. 选择智能体

在新 worktree 中，终端会带一个**智能体组合框（combobox）**打开。选择 Claude Code、Codex、Cursor CLI 或任何[受支持的智能体](/agents/supported)。Orca 会以正确的工作目录启动该智能体的 CLI，并转发你的订阅凭据。

## 4. 让三个智能体竞速完成同一任务

现在把第 2–3 步再重复两次。你就有了三个 worktree：

- `fix-login-race` → Claude Code
- `fix-login-race-2` → Codex
- `fix-login-race-3` → Cursor CLI

把同一个提示词粘贴到每一个里。三个分支。三份 diff。同一条提示词。让它们干活吧。

## 5. 分屏，以便同时盯着它们

把一个 worktree 的标签页拖到窗格的右侧或底部边缘即可分屏。你可以同时观察三个智能体。参见[标签页、窗格与分屏](/model/tabs-panes-splits)。

## 6. 选出胜者，审查 diff，交付

智能体安定下来后，打开每个 worktree 的 diff 视图。用[标注 AI Diff](/review/annotate-ai-diff) 留下行内评论，并把它们发回给最接近目标的那个智能体。

直接在 Orca 中提交与推送——参见[在 Orca 中提交与推送](/review/commit-push)。另外两个 worktree 可以一键删除；它们的分支也随之而去。

> **就是这样** 这套流程——添加 → worktree → 智能体 → 分屏 → diff → 交付——就是 Orca 的全部。文档中的其他每一页，都是对其中某一步的深入展开。
