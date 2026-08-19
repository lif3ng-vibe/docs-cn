---
title: "在 Orca 中使用 Cursor CLI"
description: "Cursor CLI 以一等支持运行——下拉框启动、完整 OSC 状态检测、退出后的重启微标。"
source: "https://www.onorca.dev/docs/agents/cursor-cli"
---

Cursor CLI 是 Cursor 的命令行智能体。Orca 以一等支持运行它——可从下拉框启动、完整的 OSC 状态检测，退出后还有重启微标。

## 安装

1. 安装 Cursor CLI，按 [Cursor 文档](https://cursor.com/cli)操作。
2. 登录一次。
3. Orca 自动检测 `PATH` 上的 CLI。

## 启动

在下拉框中选择 **Cursor**。Orca 会以该 worktree 为作用域启动 CLI。Cursor 的 TUI 会发出 Orca 渲染智能体状态圆点所需的状态事件。

## 模型选择

模型选择由 Cursor 自己的设置驱动。Orca 不会覆盖它——请在 CLI 内配置。
