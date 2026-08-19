---
title: "在 Orca 中使用 Codex"
description: "Codex 是 Orca 中集成最深的智能体之一——用量、热切换与重启全程保持账号身份。"
source: "https://www.onorca.dev/docs/agents/codex"
---

# 在 Orca 中使用 Codex

Codex 是 OpenAI 的智能体 CLI。Orca 对 Codex 的集成是全应用最深的一档——用量、热切换与重启全程保持账号身份。

## 安装

1. 按 OpenAI 文档安装 Codex。
2. 在任意终端登录。
3. Orca 从 `~/.codex` 读取账号与凭据。

## 启动

在智能体下拉框中选择 **Codex**。Orca 会以该 worktree 为 `cwd` 启动 `codex`，并让身份验证走当前选中的账号。

## 账号热切换

很多 Codex 用户会同时跑多个账号来摊薄限流。Orca 的账号切换器无需重新登录或改配置即可换掉活动账号。参见[热切换 Codex 账号](/agents/codex-hot-swap)。

## 系统默认账号与附加账号

**System default**（系统默认）使用你真实的 `~/.codex` 登录（与在 Orca 之外裸跑 `codex` 所用的 home 相同）。Orca 托管的附加账号则在 Orca 的账号数据下拥有各自的 home，凭据与 rollout 相互隔离。新启动的 Codex 跟随活动账号；已在运行的会话则保留其启动时的 home，直到你重启它。

## 嵌套 Task 子智能体

当 Codex 派生 Task 子智能体时，Orca 可以在 worktree 智能体列表和[智能体仪表盘](/model/agents-sessions#智能体仪表盘)中把它们显示为父智能体下的子行。展开箭头可查看每个子项；点击某个子项会聚焦父终端（子智能体不独占单独的窗格）。

## 在新会话中继续

在智能体终端的头部或上下文菜单中选择 **Continue in New Session…**（在新会话中继续）。Orca 会启动一个全新的智能体会话（CLI 可同可不同），并从之前的转录或已捕获的上下文中注入一段有边界的交接提示。原会话保持原样——这不是 `codex resume`。

## 重启微标

Codex 退出后，重启微标会用同一账号重新启动智能体。如果你在会话中途切换过账号并想用新账号重启，请先用账号切换器切换，再重启。

## 用量与限流

Orca 读取活动账号的本地 Codex 用量状态，并显示在状态栏。参见[用量与限流追踪](/agents/usage-tracking)。

## Windows 上的 Codex（WSL）

在 Windows 上，Orca 既可以从宿主机安装运行 Codex，也可以从某个 WSL 发行版运行。在账号切换器中添加一个 WSL 托管的 Codex 账号——Orca 会在该发行版内创建隔离的账号 home（位于 `~/.local/share/orca/codex-accounts/<id>/home`），并以 `\\wsl.localhost\<distro>\...` 路径映射回宿主机供身份验证读取，同时让启动、热切换和限流查询都经由选中的发行版。如果目标发行版未安装 Codex，**Add account**（添加账号）对话框会报错并给出可操作的提示，指明哪个发行版缺少该二进制文件。
