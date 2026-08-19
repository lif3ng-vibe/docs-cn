---
title: "让三个智能体竞跑同一个任务"
description: "让三个智能体竞跑同一个任务——Orca 文档。"
source: "https://www.onorca.dev/docs/recipes/parallel-agents"
---

# 让三个智能体竞跑同一个任务

把同一个任务并行交给多个智能体是 Orca 的杀手锏。同一段提示词、三个分支，选出胜出的那个。

## 步骤

1. 从同一个起始引用（start-from ref）创建三个 worktree。命名为 `fix-bug`、`fix-bug-2`、`fix-bug-3`。
2. 在每个 worktree 里启动不同的智能体——Claude Code、Codex、Cursor CLI。
3. 把同一段提示词粘贴到全部三个。
4. 分屏窗格，看着它们干活——把标签页拖到边缘。
5. 完成后逐个评审 diff。在胜者上使用 [标注 AI Diff](/review/annotate-ai-diff)。
6. 从胜出的 worktree 提交、推送、打开 PR。
7. 删掉两个落选者——一次点击即可移除 worktree 和分支。

## 原理

不同智能体会犯不同的错误。并行跑同一个任务比顺序重试更省，而且分歧本身就是信号。三个智能体一致的地方，答案多半是对的；它们分歧的地方，就是难点所在。
