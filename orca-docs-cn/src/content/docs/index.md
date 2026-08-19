---
title: "Orca 是什么？"
description: "60 秒介绍：Orca 适合谁、什么时候该用它。"
source: "https://www.onorca.dev/docs"
---

Orca 是一个桌面 IDE，用于并行运行多个 AI 编码智能体。每个任务都有自己独立的 git worktree（工作树）、自己的智能体终端和自己的浏览器标签页——你可以把工作分发给 Claude Code、Codex、Cursor CLI 等多个智能体，而不必来回 stash、折腾分支，也不会打断心流。

Orca 主窗口：worktree 侧边栏、带智能体终端和 diff 视图的分屏窗格

## 何时使用 Orca

- 你想让三个智能体并行用不同思路修同一个 bug，然后择优采纳。
- 你想在交付前认真审查 AI 生成的 diff。
- 你已经为 Claude Code、Codex 或 Cursor CLI 付费，想在一个地方编排它们。
- 你想让智能体远程运行——通过 SSH、在自托管的 Orca 服务器上、或在按需 VM 里——同时不放弃自己的 IDE。

## 适合谁

Orca 为那些以写代码为生、想把 AI 当作杠杆而非替代品的人而设计。它默认你会读 diff、在意提交记录、保持 worktree 整洁。如果你在找的是无代码工具，Orca 不是。

## Orca 不是什么

- **不是一个模型。** Orca 运行的是你已经在用的智能体——带上你自己的 Claude、Codex 或 OpenCode 订阅。
- **不是 git 的替代品。** 每个 worktree 都是一个真实的 git worktree。你随时可以 `cd` 进去用原生 git。
- **不是托管 VPS 产品。** Orca 默认运行在你的桌面上。远程算力使用的是你自己掌控的机器和云账号——[SSH 主机](/ssh)、[自托管 Orca 服务器](/remote-servers)或[云 VM / 每工作区环境](/ways-to-run#4-云-vm每工作区环境)。

> **下一步** 前往[安装](/install)，然后跟着[你的第一个三智能体会话](/first-session)走一遍——这是全部文档中最重要的一页。当你准备把智能体搬离笔记本时，从 [Orca 的运行方式](/ways-to-run)开始。
