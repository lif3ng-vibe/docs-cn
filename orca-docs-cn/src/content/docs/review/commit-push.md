---
title: "在 Orca 中提交与推送"
description: "在 Orca 中提交与推送——Orca 文档。"
source: "https://www.onorca.dev/docs/review/commit-push"
---

你可以提交、推送并打开评审，全程不必离开 Orca。提交面板位于 Diff 查看器旁边，为最常见的流程而设计——评审、暂存、提交、推送、继续下一项。

## 提交

1. 在 diff 中按 hunk 或按文件暂存变更。
2. 在底部面板撰写提交信息，或使用 **Generate with AI**（AI 生成）让 Orca 根据已暂存的变更起草一条。
3. 焦点处于 Source Control（源代码管理）且主操作为 Commit 时，点击 **Commit**（提交）（macOS 上 `Cmd-Enter`，Windows / Linux 上 `Ctrl-Enter`）。

仓库的 pre-commit 钩子照常运行。钩子失败时，Orca 会在界面内联展示其输出。

提交失败时，在失败详情中使用 **Fix with AI**（AI 修复），在当前 worktree 里以默认智能体启动修复，并附上钩子输出、尝试过的提交信息和暂存文件列表。智能体收到的只是修复提示——不会要求它绕过钩子、提交、推送或打开评审。

## 推送

**Push**（推送）会把 worktree 的分支推送到 `origin`，首次推送时设置上游。分支落后时，Orca 不会悄悄强推。

当你重写了历史（rebase、amend、squash）而远端只留有本地提交的旧副本时，Source Control 面板会把 **Force push with lease**（带租约强推）作为显式的独立操作呈现——绝不作为普通 Push 的兜底。标签会显示被替换的提交数量和上游分支名，让你清楚即将改变什么。强推使用 `--force-with-lease`，因此本地对远端的视图过期时会中止推送，而不是覆盖别人的提交。

## 打开托管评审

分支推送后，使用 Source Control 面板的托管评审操作创建 PR 或合并请求（merge request）。提交前确认基准分支、标题、描述和草稿状态。Bitbucket Cloud 可以从同一个创建对话框新建 PR；它不支持草稿 PR，因此 Draft 开关被隐藏。GitHub 场景下，当所选 base 已有打开的 PR 时，可以 **Stack this PR above #N**（把此 PR 堆叠到 #N 之上）——参见[堆叠 PR](/review/github#堆叠-pr)。

如果 Orca 需要在创建 PR 流程中执行一次后续提交而该提交失败——钩子拒绝它，或工作树处于无法提交的状态——对话框会给出包含钩子输出和后续步骤按钮的详细失败摘要，而不是把你丢回毫无上下文的面板。在摘要中使用 **Fix with AI** 把失败交给智能体，或者自行解决后重试。

想在创建评审对话框里让 Orca 根据分支 diff 和提交起草标题、描述与草稿状态时，使用 **Generate pull request details with AI**（AI 生成 PR 详情）。生成的文案力求简短的 ELI5 式问题/解决方案小节和关联议题指引（附有 GitHub 议题时该用 `Fixes` 还是 `Refs`）。Orca 会保留你选择的基准分支，拒绝空描述并给出明确报错，让你可以重试而不是发出空白正文。创建评审前请检查各字段。

## 按仓库定制的 AI 操作配方

**Generate with AI**、**Generate pull request details with AI**、**Fix with AI** 和 **Resolve with AI** 都是 Source Control 的 AI 操作——每个操作背后都有一个 **action recipe**（操作配方），指定你触发操作时 Orca 运行的智能体、CLI 参数和提示词模板。可在 [Settings → Git & Source Control](/settings) → **Action recipes** 下编辑，既可作为全局默认，也可仅作用于当前仓库。

模板可包含变量，例如 `{basePrompt}`、`{branch}`、`{stagedFiles}`、`{stagedPatch}`，以及用于提交信息的 **`{linkedIssue}`**；PR 详情还支持 `{baseBranch}`、`{currentTitle}`、`{currentBody}`、`{commitSummary}`、`{changedFiles}` 和 `{patch}`。

`{linkedIssue}` 会展开为工作区关联的 **GitHub 议题编号**，未关联时为空（包括纯 Linear/GitLab 工作区）。措辞宜写成带条件的指令——直接写 `Fixes #{linkedIssue}` 的话，未关联时会变成 `Fixes #`。

当仓库为某操作配了自己的配方时，保存对全局默认的修改不会影响它——设置面板会显示 **Repository overrides**（仓库覆盖）说明，列出哪些仓库存在分叉以及覆盖了什么（智能体、CLI 参数或命令模板），并附 **Review** 链接跳转到该仓库的设置，便于更新或移除覆盖。

## Amend

Amend 是显式操作——**Commit → Amend**。除非你确认，否则 Orca 不会 amend 已推送的提交。

## Source Control 面板

侧边栏的 **Source Control** 面板提供同样的操作而无需离开当前视图：暂存和丢弃文件、撰写提交信息，以及一键执行 **Commit**、**Push**、**Pull** 或 **Sync**。路径按 UTF-8 渲染，即使包含非 ASCII 字符。

顶部的分支上下文行显示当前分支（或 detached HEAD），叠在对比基准之上（`branch → base`），因此 Create PR 和远端操作永远不会让你看不清自己所在的分支。分支存在可用的合并基准时，一枚紧凑的微标会显示相对该分叉点新增和删除的总行数（一次区间 diff，而非暂存/未暂存区域的加总）。悬停微标可在托管方公布细分时查看 **Code breakdown**（代码构成）：**Source**、**Tests** 和 **Generated**（仅在非零时显示）——仅基于路径启发式，不做内容分析。过长的分支名会截断，不会盖住微标。

右键点击变更文件可 **Copy Path** / **Copy Relative Path**（复制路径 / 复制相对路径，相对 worktree 根目录）。

面板底部的主按钮随状态切换，让下一个有用的操作永远一步可达：有未暂存变更时是 **Stage Files**（暂存文件），然后是 **Commit**，再根据分支相对上游的位置显示 **Push** / **Pull** / **Sync**。

当 merge、rebase、cherry-pick 或 revert 留下冲突时，Source Control 会在 **Review conflicts**（评审冲突）旁显示 **Resolve with AI**（AI 解决），你可以把冲突集交给智能体，也可以自己检查后再继续。对于不再想要的进行中的 merge 或 rebase，可从 Source Control 使用 **Abort merge** 或 **Abort rebase**。

## 后续步骤

- [托管评审、议题与 Actions](/review/github)——接入掌管评审的服务商。
- [标注 AI Diff](/review/annotate-ai-diff)——提交前留下行内备注。
