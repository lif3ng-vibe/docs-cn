---
title: "热切换 Codex 账号"
description: "一键热切换活动 Codex 账号——无需重新登录，无需编辑配置；同一流程也适用于 Claude Code。"
source: "https://www.onorca.dev/docs/agents/codex-hot-swap"
---

同时运行多个 Codex 账号来最大化 token 用量是常见做法。Orca 让你一键热切换活动账号，无需重新登录，也无需编辑配置。同一套流程也适用于 Claude Code 账号。

状态栏中的 Codex 账号切换器下拉菜单

## 添加账号

1. 先用终端在每个 Codex 账号下至少登录一次，让身份验证信息落在 `~/.codex` 里。
2. 打开 [Settings → Agents → Codex Accounts](/settings)（设置 → 智能体 → Codex 账号）。
3. Orca 会列出检测到的所有账号及其用量与当前限额。
4. 给每个账号起个好认的标签——"personal"（个人）、"work"（工作）等。

## 切换账号

点击状态栏中的 Codex 微标打开账号切换器。选定一个账号后，此后新启动的 Codex 会话都会使用它。已在运行的会话则保留原账号，直到重启。

## 系统默认

**System default**（系统默认）一行就是你宿主机上 `~/.codex` 下的当前 Codex 登录。托管账号（在 Orca 中添加的）不会改写该登录，它们运行在各自隔离的 home 中。想让启动行为与在 Orca 之外的终端里跑 `codex` 一致时，选择 System default。

## 当配置修改似乎被忽略时

对托管的 Codex 账号，Orca 会把真实 `~/.codex/config.toml` 中的设置镜像到活动运行时 home。如果该源文件缺失、为空（例如云同步尚未下载完）或不可读，Accounts 页会显示警告：Codex 会沿用**上一次成功同步**的设置，直到源文件恢复健康。按横幅中给出的路径修好文件，然后重新启动或重新选择该账号。

## 规则与注意事项

- 切换是即时的——Orca 重写活动凭据指针，不会重新进行身份验证。
- 已存在的 Codex 进程会保留当前账号，直到重启。
- 状态栏中的用量读数跟随当前活动账号。
- 重启微标会保持重启那一刻的活动账号。

## Claude Code 账号

Claude 账号切换器的工作方式完全相同——只是数据目录不同（`~/.claude`），体验一致。
