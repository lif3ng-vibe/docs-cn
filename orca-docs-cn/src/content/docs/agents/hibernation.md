---
title: "智能体休眠"
description: "让 Orca 暂停闲置的后台智能体终端，并在你重新打开 worktree 时自动恢复。"
source: "https://www.onorca.dev/docs/agents/hibernation"
---

同时开着几十个 worktree 时，闲置的智能体会不断累积——每一个都是一个在内存中托着模型会话的活跃 PTY。智能体休眠让 Orca 在终端完成且长时间无人触碰后悄悄停掉它们，等你下次打开 worktree 时再恢复同一会话。

> **实验性**：智能体休眠默认关闭。在我们继续打磨安全模型期间，可在 **Settings → Experimental → Agent hibernation**（设置 → 实验 → 智能体休眠）中开启。

## 哪些会被休眠

只有当以下条件**全部**成立时，Orca 才会休眠某个智能体终端：

- 智能体处于 **done**（完成）状态——已完成最后一个回合，且不在等待输入。
- 该终端不在活动 worktree 中，也不在任何正在渲染前台终端的 worktree 中。
- 自智能体完成以来没有收到任何按键。
- 该智能体属于支持[可恢复会话](/agents/session-history)的那一类：Claude、Codex、Gemini、Antigravity、OpenCode、Pi、MiMo Code、Droid、Grok、Devin 或 OMP。
- 闲置时间至少达到配置的闲置窗口（默认 30 分钟）。
- 当前没有移动端会话正在驱动该终端。
- 没有尚未了结的[编排](/cli/orchestration) Dispatch（处于 `pending`、`dispatched` 或未知状态）。运行时确认 `completed`、`failed` 或 `circuit_broken` 之后才允许再次休眠。
- 窗格上没有仍存活的子智能体/队友（只要子项还挂着，单凭提供方报的 "done" 还不够）。

任一检查不通过的终端会保持运行。如果一个 worktree 有多个智能体窗格，它们会作为一个整体一起休眠，绝不会出现只暂停了一半的 worktree。

你也可以从侧边栏手动休眠 worktree（存在嵌套子项时还包括 **Sleep with Descendants**，即连同后代一起休眠）。参见 [Worktrees](/model/worktrees)（worktree）。手动休眠会保留**已完成**与**已中断**的可恢复会话，因此重新打开 worktree 时仍可用相同的恢复标志重新启动——不会因为窗格不再"活跃"就抹掉那些会话记录。

## 调整闲置窗口

在 **Agent hibernation**（智能体休眠）开关下方，**Hibernate after**（休眠等待）设定已完成的后台智能体需要闲置多少分钟，Orca 才会暂停它。

- 默认：**30 分钟**。
- 范围：**1 分钟**到 **24 小时**。
- 计时从智能体最后一次 `done` 更新开始；任何按键、新输出或回到该智能体的终端标签页都会重置计时。

更长的窗口以更少的暂停换取更小的内存节省；更短的窗口暂停更激进，但你下次切回时要付出一次恢复的代价。

## 找到休眠中的 worktree

侧边栏的筛选菜单控制是否显示休眠中的 worktree。如果你经常隐藏它们，可在 [Settings → Shortcuts](/settings)（设置 → 快捷键）中给 **Toggle Sleeping Workspaces**（切换休眠工作区显示）分配快捷键，无需打开筛选菜单即可显示/隐藏。

## 恢复

当你打开一个已休眠的 worktree，Orca 会用与[智能体会话历史](/agents/session-history)相同的恢复标志重新启动智能体 CLI——`claude --resume <id>`、`codex resume <id>` 等——对话、工作目录和提供方会话都从中断处继续。无需任何点击；恢复就发生在终端被带回前台的过程中。

恢复还会复用 Orca 首次打开该智能体时捕获的启动命令、参数和私有环境变量。

如果智能体 CLI 因任何原因无法恢复会话（转录被删除、提供方轮换了会话 ID），终端会打开一个全新的提示符，而之前的转录仍可在该智能体的会话历史中找到。

## 限制

只有上列可恢复智能体会休眠。Cursor CLI、Hermes、Copilot、Trae 及其他不可恢复的终端保持运行。

## 后续步骤

- [智能体会话历史](/agents/session-history)——手动恢复任意过去的会话，包括未被 Orca 休眠的那些。
- [热切换 Codex 账号](/agents/codex-hot-swap)——不重启会话即可切换活动 Codex 登录，可与休眠配合使用。
