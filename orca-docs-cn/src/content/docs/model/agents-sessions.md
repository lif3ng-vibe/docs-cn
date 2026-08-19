---
title: "智能体与会话"
description: "状态圆点、Restart 卡片，以及一个智能体会话的完整生命周期。"
source: "https://www.onorca.dev/docs/model/agents-sessions"
---

一个**智能体会话（agent session）**是运行在一个 worktree 的一个终端中的一个 CLI 智能体。Orca 会跟踪其生命周期，让你随时知道哪些会话在工作、哪些在闲置——不必逐个点进标签页检查。

每张 worktree 卡片上的内联智能体状态——工作时黄色，完成时绿色

## 状态指示器

智能体标签页和 worktree 行使用统一的状态符号：

- **旋转指示（Spinner）**——工作中
- **琥珀色问号**——在等你（权限 / 需要输入）；侧边栏 "Needs You" 计数使用同一符号
- **翠绿色对勾**（仪表盘）或**翠绿色圆点**（侧边栏）——已完成 / 安静活动中
- **红色圆点**——受阻、被中断或失败
- **灰色圆点**——闲置
- **无指示器**——普通 shell，不是可识别的智能体 CLI

状态通过终端的 OSC 标题序列和智能体钩子检测，Claude Code、Codex 和其他一些智能体会发出这些信号。

## 智能体仪表盘

打开 **Settings → Experimental → Agent Dashboard**。Orca 会在左侧边栏添加一个 **Agent Dashboard** 入口：一个跨 worktree 的智能体看板（kanban），外加可选的 **Agent Map** 视图。

### 列

- **Needs You**——正在等待一个权限或问题回复
- **Working**——正在运行
- **Done**——已完成、你可能还想审查的会话
- **Idle**——约 30 分钟未报告完成的安静智能体。在看板上**默认隐藏**；从仪表盘的 **board settings** 控件（齿轮）开启 **Show idle agents**——在窗口内或弹出窗口中皆可，而不是在全局 Experimental 设置里。窗口内与弹出视图保持同步。

### 视图

用头部切换在 **Dashboard**（看板列）和 **Agent Map**（实验性拓扑视图）之间切换：

- worktree 嵌套在项目之下；智能体位于其 worktree 环上，Orca 已知父/子工作区时还包括血缘。编排的父 → 子边绘制在智能体卡片之间（同 worktree 或跨 worktree），在派发仍活动或刚落定时显示。
- 地图状态与看板对应：需要注意（在等你）、工作中、完成和闲置。打开一个智能体会把已完成的会话标记为已看，使其从绿色 **Done** 走向灰色 **Idle**。
- 地图专属过滤器可按主机类型（local / SSH / WSL / remote）收窄，并可选显示无智能体的工作区。在 **Filter → Map content** 下，切换 **Orchestration links**（默认开启）可隐藏或显示这些边而不移除智能体节点；隐藏会计入过滤器徽标，**Clear all filters** 会把边重新打开。
- 在**窗口内**地图中右键点击 worktree 环，可得到与侧边栏相同的工作区上下文菜单（本地、SSH、文件夹和远程主机）。弹出窗口中的地图工作区菜单仍然受限，因为该窗口不拥有主侧边栏存储。

仪表盘卡片和 Agent Map 项目环会为 SSH 工作区和已配对的[远程 Orca 服务器](/remote-servers)显示主机徽标。悬停或聚焦徽标可见已保存的主机名，例如 **SSH host · openclaw** 或 **Remote Orca host · Build Mac**。本地工作区不显示主机徽标。

### 打开方式

**In-window**（侧边栏旁的窗口内看板），或 **Pop-out**（独立弹出窗口）。

### 搜索与过滤

看板工具栏包括：

- **Search**——worktree、项目或智能体名（查询或过滤器活动时显示结果计数）
- **Filter**——多选 **Project**、**Workspace status** 和 **PR / MR status**（Open、Draft、Merged、Closed、No review）
- 可移除的过滤 chip 和 **Clear all filters**

### 卡片

- **头部**——智能体图标、会话**对话名**（重命名、生成标题、AI Vault / 智能体会话标题，或回退到 worktree 名）、状态符号
- **预览**——可用时的最后一条用户 / 智能体消息；否则是任务摘要
- **底部**——项目图标、worktree 名（当头部已显示会话名时）和时长；存在时显示缓存的审查状态。工作区状态只留在工具栏过滤器中——卡片不再显示每个 worktree 的状态圆点。
- **Needs You** 卡片呈琥珀色（并可显示待处理问题摘要）；**Done** 卡片呈绿色；其他状态保持中性，这样颜色即意味着"看这里"
- 点击卡片可打开/聚焦该智能体的活动终端
- 嵌套的 Codex/Claude 子智能体可以作为可展开的子项出现在父行之下

当实验性看板关闭时，worktree 卡片仍以相同符号内联显示智能体行。如果你看不到状态指示器，说明该会话中的智能体 CLI 不是 Orca 可识别的那种——请通过智能体组合框启动，而不是手动输入二进制名。

## 启动默认值

Orca 启动每个受支持的智能体时都预置了完全自主的权限标志——Claude 用 `--dangerously-skip-permissions`，Codex 用 `--dangerously-bypass-approvals-and-sandbox`，Gemini 用 `--yolo`，选择器中其他每个智能体亦然。意图是让 worktree 本身成为沙箱：智能体可以放手干活，而不会被逐个工具的批准弹窗打断心流。

如果你想为某个智能体设置不同的默认值，打开 **Settings → Agents**，展开该智能体的行，编辑其**启动参数（launch arguments）**——Orca 会记住这个覆盖并在之后每次启动时应用。字段旁的 **Reset** 按钮可在你想还原时恢复出厂标志。

## Restart 卡片

当智能体退出（无论正常还是崩溃），标签页会显示 **Restart** 卡片。一次点击即可用相同的工作目录重新唤起同一智能体。Codex 的 restart 卡片还会保留当前账号（参见[热切换 Codex 账号](/agents/codex-hot-swap)）。

## 会话生命周期

1. **启动**——从组合框选择智能体；Orca 拉起 CLI。
2. **工作**——OSC 标题更新状态；终端输出可滚动，带搜索、复制和 Ghostty 主题。
3. **闲置**——Orca 检测到工作 → 闲置的转换并触发[智能体完成通知](/notifications)。
4. **退出**——进程结束；出现 Restart 卡片。

> **提示** 确切的检测规则参见 [Orca CLI](/cli/overview) 中的 `terminal wait --for tui-idle` 命令。
