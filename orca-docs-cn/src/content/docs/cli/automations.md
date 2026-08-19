---
title: "自动化"
description: "计划自动化——用 CLI 按时间表运行提示词。"
source: "https://www.onorca.dev/docs/cli/automations"
---

$undefined

Orca 自动化让你从 CLI 按计划运行一条提示词，因此周期性的分诊、评审与维护任务无需手动打开 worktree 就能启动。读完本页，你将创建一个处于禁用状态的自动化，检查它，并在准备就绪时运行它。

## 创建一个安全的首个自动化

在调整提示词和目标期间，先带上 `--disabled`：

```
orca automations create \
 --name "Weekday triage" \
 --trigger weekdays \
 --time 09:00 \
 --prompt "Triage new issues and summarize blockers" \
 --provider codex \
 --repo my-repo \
 --disabled \
 --json
```

`--trigger` 接受 `hourly`、`daily`、`weekdays`、`weekly` 等预设，也接受 cron 表达式或 RRULE 字符串。当计划应遵循特定 IANA 时区而非运行时默认时区时，使用 `--timezone <tz>`。

## 选择运行位置

当每次运行都应在某个仓库中创建或选择工作时，用 `--repo <selector>`。当自动化应改为在既有的 Orca worktree 内运行时，用 `--workspace <selector>`：

```
orca automations create \
 --name "Nightly status" \
 --trigger "0 18 * * 1-5" \
 --prompt "Summarize today's changes" \
 --provider claude \
 --workspace active \
 --disabled
```

当两个目标标志都省略时，Orca 会尽可能从当前 shell 目录解析所在的 worktree。

## 运行前预检

让廉价的 shell 探测失败时跳过计划任务（非零退出会记为一次跳过的运行）：

```
orca automations create \
 --name "PR review" \
 --trigger hourly \
 --precheck "gh pr list --json number -q .[0].number" \
 --prompt "Review requested PRs" \
 --provider codex \
 --repo my-repo \
 --disabled \
 --json
```

## 项目主机 / setup 目标

当自动化应运行在特定的项目主机 setup 上，而不只是 `--repo` / `--workspace` 时：

```
orca automations create \
 --name "Remote triage" \
 --trigger daily \
 --time 09:00 \
 --prompt "Triage open issues" \
 --provider claude \
 --project <projectId> \
 --host <hostId> \
 --disabled \
 --json
```

已有 setup ID 时用 `--project-host-setup <id>`。可选的 `--source-context '<json>'` 把任务/提供商数据固定到某台主机/某个账号（编辑时传 `null` 清除）。

## 错过运行的宽限期

```
orca automations edit <automationId> --missed-run-grace-minutes 30 --json
```

## 复用既有自动化会话

对于以既有 worktree 为目标的自动化，如果后续运行应继续使用之前仍存活的自动化终端、而不是每次都从空白终端开始，请加 `--reuse-session`：

```
orca automations create \
 --name "Inbox digest" \
 --trigger hourly \
 --prompt "Summarize unread mail" \
 --provider codex \
 --workspace active \
 --reuse-session \
 --disabled
```

用 `orca automations edit <automationId> --fresh-session --json` 把自动化改回每次运行用全新终端。

## 检查并启用

启用前先列出并检查自动化：

```
orca automations list --json
orca automations show <automationId> --json
orca automations edit <automationId> --enabled --json
```

在桌面端的自动化列表里，当计划很多时，可用搜索框按**名称**、**项目**或**提示词**文本过滤。位于 SSH 主机上的外部自动化在该主机断开时仍显示为可管理的任务（包括删除）——仅为了删除一条计划，你不需要保持活跃的 SSH 会话。

用 **Filters** 按 **Enabled** 或 **Paused** 状态，或按上次运行结果（**Failed**、**Succeeded**、**Never ran**）缩小列表范围。表格显示每个自动化上次运行的结果与相对时间。点击 **Name** 或 **Last run** 列可排序；名称按字母排序，上次运行默认最新在前。

用 `edit` 修改名称、提示词、提供商、目标、计划或启用状态。`remove` 删除自动化及其运行历史。

## 手动运行

创建自动化后，先手动触发一次，验证提示词与目标，不必干等下一个计划时间：

```
orca automations run <automationId> --json
orca automations runs --id <automationId> --json
```

如果某次运行在打开工作区或重连目标之前就失败了，在 Orca 中打开该运行并点击 **Rerun**，为同一自动化排入一次新的手动运行。

## 后续步骤

- [CLI 概览](/cli/overview)——查看 worktree、终端与浏览器控制的其余 CLI 能力。
- [技能](/cli/skills)——安装 Orca CLI 技能，让智能体能调用同样的命令。
