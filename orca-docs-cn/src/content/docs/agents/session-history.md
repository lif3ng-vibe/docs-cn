---
title: "智能体会话历史"
description: "从 Orca 右侧边栏浏览并恢复过去的 Claude、Codex、Cursor、Gemini 等智能体会话。"
source: "https://www.onorca.dev/docs/agents/session-history"
---

Orca 会扫描受支持的智能体 CLI 留在磁盘上的会话转录，并在右侧边栏一个名为 **Agent Session History**（智能体会话历史）的面板中列出它们。选中某个过去的会话，点击 **Resume**（恢复），Orca 就会在一个新终端里运行该智能体的恢复命令——同样的 `cwd`、同样的会话 ID，不必再手动折腾 `--resume` 标志。

## 打开面板

打开右侧边栏并切换到 **Agents** 标签页。面板标题为 "Agent Session History"。

头部会显示类似 `12 shown · 47 recent` 的计数和一个搜索框。输入即可按会话标题、工作目录、分支、模型或对话预览文本筛选。

## 范围

面板顶部的范围切换开关决定显示哪些会话：

- **Workspace**（工作区）——当前工作区或 worktree 的会话，取决于活动的工作区上下文。
- **Project**（项目）——归属到当前活动 Orca 项目的会话。
- **All**（全部）——Orca 在本机所有智能体中找到的全部会话。

远程工作区可以浏览本地历史，但恢复操作只能从本地工作区发起——当活动 worktree 是远程的时，Orca 会在面板中提示这一点。

## 视图选项

视图选项菜单（搜索框旁）控制扫描哪些智能体，以及排序和分组：

- **Agents**（智能体）——逐个开关各 CLI（Claude、Codex、Hermes、Pi、OMP、Prime Agent、Cursor、Gemini、Antigravity、Rovo Dev、Copilot、OpenCode、Grok、OpenClaw、Devin、Droid、Kimi）。禁用的智能体在扫描时跳过。用 Agents 头部的 **Select all**（全选）/ **Clear**（清除）可一次性翻转全部智能体——**Clear** 会全部取消选中，这样你只需打开关心的那一个 CLI，而不必在长列表里逐个取消勾选。空选择会显示 **No agents selected**（未选择任何智能体），而不是通常的空筛选提示。
- **Sort**（排序）——`Last updated`（最后更新）或 `Created`（创建时间）。
- **Group**（分组）——`Project`（项目）、`Folder`（文件夹，每个 `cwd` 一个标题）或 `Agent`（智能体，每个 CLI 一个标题）。
- **Hide empty sessions**（隐藏空会话）——丢弃没有记录任何消息的会话。

## 恢复会话

点击某个会话行展开详情：工作目录、分支、模型、消息数、**First prompt**（首条提示）以及最近的对话回合。展开详情时，**First prompt** 会从转录中加载未截断的第一条用户消息（列表行只为搜索保留简短预览）。用该卡片上的 **Copy** 可把完整提问放进剪贴板——不必重新打开日志就能复用一段长提示。你也可以把启用状态的会话行拖入工作区来恢复它。行内操作包括：

- **Resume**（恢复）——在会话的 `cwd` 打开一个新终端并运行该智能体的恢复命令（如 `claude --resume <id>`、`codex resume <id>`、`pi --session <session_file>`、`prime-agent --resume <path>`、`cursor-agent --resume <id>`、`acli rovodev run --restore <id>`）。若原会话设置过 `CODEX_HOME`，Codex 会话还会重新导出它。

Pi 依据其钩子报告的磁盘会话文件恢复（`--session <path>`），而不是仅凭一个裸会话 id。如果该文件缺失，即使存在会话 id，该行也无法使用恢复。

- **Copy resume command**（复制恢复命令）——把同一条 shell 命令复制到剪贴板，供外部终端使用。
- **Copy session ID**（复制会话 ID）/ **Copy log path**（复制日志路径）——用于编写脚本，或把转录附到缺陷报告里。
- **Open log**（打开日志）/ **Reveal log**（在文件管理器中显示）——在 Orca 中打开原始转录文件，或跳转到操作系统文件管理器中的对应位置。
- **Open cwd**（打开工作目录）——把该会话的工作目录作为工作区打开。

> **恢复需要本地工作区**：恢复操作会在 Orca 正在渲染的那台机器上运行智能体 CLI。如果你连接的是远程工作区，请先切回本地（或用 **Copy resume command** 自己在远端运行），再点击 **Resume**。

## 转录来自哪里

Orca 读取每个智能体自带的磁盘会话存储——Codex 的 `~/.codex/sessions`、Claude 的 `~/.claude` 历史、Cursor 的会话日志、OpenCode 的旧版会话文件或 `~/.local/share/opencode/opencode.db` 等等。无需额外开启什么；只要 CLI 写了转录，下次扫描后就会出现在面板中。用头部的 **Refresh Session History**（刷新会话历史）按钮可按需重新扫描。

## 后续步骤

- [热切换 Codex 账号](/agents/codex-hot-swap)——不重启活动会话即可切换其背后的 Codex 登录。
- [智能体钩子与记忆](/agents/hooks-memory)——控制智能体每次启动（包括恢复的会话）携带哪些上下文。
