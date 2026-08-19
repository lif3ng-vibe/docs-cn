---
title: "Linear 事项抽屉"
description: "Linear 事项抽屉——Orca 文档。"
source: "https://www.onorca.dev/docs/review/linear"
---

# Linear 事项抽屉

Linear 与各托管评审服务商并排出现在任务抽屉中。浏览、创建、更新 Linear 事项并把它们关联到 worktree，方式与关联 GitHub 议题相同。

## 设置

1. 打开 [Settings → Integrations → Linear](/settings)。
2. 粘贴来自 [Linear → Settings → API](https://linear.app/settings/api) 的个人 API 令牌。
3. 选择你想查看的团队。

## 使用 Linear

- 任务抽屉在一个合并视图中同时显示 GitHub 议题和 Linear 事项。
- 在 Linear 任务视图中使用 **Has Workspace**（已有工作区）模式，只列出已关联到本地 worktree 或文件夹工作区的事项。附带工作区的行会打开该工作区；需要第二份检出时，仍可从同一事项新建。
- 从 Linear 事项创建 worktree 会打开交互式工作区创建对话框（与 GitHub 条目同一路径），因此议题命令自动化、SSH 和文件夹工作区同样适用。Orca 会预填名称并附着事项 ID。当 Linear 为该事项公开了分支名时，Orca 会用它作为 worktree 分支（即 Linear 会建议的命名），而不仅是标题的 slug。事项详情菜单可 **Copy suggested branch name**（复制建议的分支名）。
- 创建后，在工作区卡片上打开 **Edit Worktree Details**（编辑 worktree 详情），使用 **Issue** 字段的议题微标（chip）（或粘贴一个 Linear URL）来关联或更改议题，而不必重建 worktree。GitHub 和 Linear 共用这一个字段——保存新链接会替换先前的服务商链接。
- 打开事项详情视图可更新状态、经办人、优先级、标签和预估等字段。优先级用 Linear 自带的优先级图标渲染，抽屉里的显示与 Linear 中一致。
- 从 Linear 事项启动智能体时，Orca 会把事项描述、评论和子事项中内嵌的图片与媒体纳入提示词上下文，智能体因此能看到设计稿或 bug 复现，无需你手动粘贴截图。
- **New Linear issue**（新建 Linear 事项）和 **New Linear project**（新建 Linear 项目）在你误关对话框时保留标题/描述（以及项目名称、摘要和简介）——Escape、Cancel、点击外部或关闭均可触发误关。同一应用会话内重开对话框时文本会恢复；草稿在成功创建后清空，应用重启后不保留。团队/项目选择器仍沿用通常的打开时默认值。
- 长列表通过 **Load more**（加载更多）分页——当项目的事项数超出抽屉首屏时很有用。
- 布局选择跨重启保留：列表 vs 看板、分组、排序、可见列和属性筛选器。属性筛选器按 **Linear 工作区**分别存储，切换工作区不会套用另一个工作区的筛选项。
- Orca 会按仓库记住你上次使用的任务来源（GitHub、Linear 或 Jira）。

> Linear 状态同步（创建 worktree 时把事项移至 "In Progress"）为按团队选择启用。

## 智能体与 CLI

智能体可以通过 `orca linear`（以及 `orca-linear` 技能）读写 Linear。该能力面包含与 MCP 兼容的创建/更新和列表筛选（`save-issue`、`list-issues`、关系添加/移除），以及 `--activity`、`--full` 等议题上下文标志。参见 [CLI 参考 → Linear](/cli/reference#linear)。

## 后续步骤

- [托管评审、议题与 Actions](/review/github)——任务进行中后，把代码评审状态接入 worktree。
- [在 Orca 中提交与推送](/review/commit-push)——不离开 Orca 发布分支。
