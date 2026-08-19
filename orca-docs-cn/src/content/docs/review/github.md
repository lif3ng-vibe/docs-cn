---
title: "托管评审、议题与 Actions"
description: "托管评审、议题与 Actions——Orca 文档。"
source: "https://www.onorca.dev/docs/review/github"
---

托管代码评审是 worktree 的一等能力。Orca 把 worktree 与它们的 PR 或合并请求关联起来，就地呈现评审状态，还能让你不离开应用就分诊议题。

*GitHub 集成——不离开 worktree 即可打开 PR、关注检查并分诊议题。*

## 接入服务商

从 [Settings → Integrations](/settings) 接入你的仓库所用的服务商。GitHub 对 Actions 和议题的支持最深；GitLab 的合并请求与议题使用同一套 worktree 评审流程。

Bitbucket Cloud 从同一面板在应用内接入——用 **Email & API token** 或 **Access token** 点击 **Connect**。Orca 会在保存前验证凭据，并能从 Source Control 创建 PR。Bitbucket Cloud 没有草稿 PR，因此创建对话框隐藏 Draft 开关。`ORCA_BITBUCKET_*` 环境变量仍优先于已保存的凭据。Azure DevOps 和 Gitea 的 PR 会与 GitHub、GitLab、Bitbucket 一起出现在 worktree 侧边栏和 Checks 面板——worktree 创建流程会在推送前检查它们的远端冲突。

## 评审

- worktree 推送后即可从 Source Control 面板打开托管评审——创建前确认基准分支、标题、描述和草稿状态。
- 你创建或打开托管评审时，Source Control 会在分支上下文行保持当前分支可见，Create PR 操作绝不会替换掉分支标签。
- 关联的评审会带状态显示在侧边栏，一眼可知分支是仍打开、已合并还是已关闭。
- 当 Orca 拿到关联 PR / MR 的 URL 时，分支上下文行会显示紧凑的 **Open review page in browser**（在浏览器打开评审页）链接——一次点击即可跳到 GitHub、GitLab、Bitbucket、Azure DevOps 或 Gitea 上的评审，不必打开内置 PR 视图。
- 对 GitHub PR，可用侧边栏的 PR 操作菜单复制评审链接、关闭评审，或在确认状态变更后重新打开。
- GitHub 的检查、评审和评论在 PR 标签页中行内打开；GitLab 的合并请求和议题在同一评审界面打开。
- 对 GitLab 流水线，**Checks** 侧面板包含 bridge 和子流水线作业（不止顶层作业）。展开作业会加载该作业的 trace（日志，如果可用）——与 GitHub 检查详情打开的位置相同——因此失败的作业不再是"无行内详情"的死胡同。
- 在 Checks 面板中，你可以回复评审话题中的任何评论，而不只是根评论。
- GitHub PR 会话评论和行内评审话题评论带表情选择器，与 GitHub 的八个表情一致（👍 👎 😄 😕 ❤️ 🎉 🚀 👀）。已有的表情微标可点击切换。GitLab 评论保持原样。
- 分组的 PR 评论小节按最新在前排序，一条新回复会把其话题顶到最上。Timeline 标签页保持最旧在前。
- GitHub PR 检查失败时，在 PR 视图中使用 **Fix broken checks**（修复失败的检查），把失败的检查名称和链接交给智能体。

### 自动合并

对打开的 GitHub PR，PR 视图的合并按钮提供 **Enable auto-merge**（启用自动合并），让 GitHub 在其要求（检查、必需评审）通过后自动合并分支。合并方式跟随仓库默认值，为 **Squash and merge**、**Create merge commit** 或 **Rebase and merge** 三者之一——仓库不允许的方式不会显示。从同一控件使用 **Disable auto-merge** 可取消待处理的自动合并。基准分支使用 GitHub 合队列时，同一控件显示为 **Merge when ready**（就绪即合并），改为把 PR 加入队列。GitHub 报告为草稿、已关闭、有冲突或不稳定的 PR，以及不允许自动合并的仓库，会隐藏自动合并控件——这些情况下你只会看到手动合并操作。

### 堆叠 PR

创建所选 base 已有打开 PR 的 GitHub PR 时，创建对话框会提供 **Stack this PR above #N**（把此 PR 堆叠到 #N 之上）。勾选它会创建一个 GitHub Stack（或扩展父 PR 已有的 stack），并把提交按钮改为 **Create PR in stack**（或 **Create draft PR in stack** / **Push & Create PR in stack**）。一处小预览会显示父 PR 和新分支。该选项仅限 GitHub，且仅当执行托管方支持堆叠创建时出现。GitLab 合并请求和 Bitbucket PR 保持单 PR 创建。

GitHub 将 PR 注册为 **stack** 的一部分时，PR 侧边栏会显示可折叠的 **Stack #N** 地图：你在堆叠中的位置、堆叠规模和堆叠基准分支。展开可看到带状态的有序层级（打开、草稿、检查等待/失败、待评审、冲突、已合并、已关闭）。点击某层即在 Orca 中打开该 PR。

感知堆叠的合并会把单 PR 合并标签替换为 **Merge through #N · M PRs**（经由 #N 合并 · M 个 PR；仓库使用合并队列时为 **Queue through #N · M PRs**）。该操作覆盖当前 PR 及堆叠中其下的所有 PR。堆叠元数据完整时，确认框会列出包含的编号。原子堆叠合并失败即整体不合并——任何一层不能合并，就一层都不合并。没有 GitHub 注册堆叠元数据的普通依赖 PR 链保持常规的单 PR 合并流程。GitLab 合并请求不受影响。

## 议题

议题抽屉让你在 Orca 内浏览、筛选和编辑 GitHub 与 GitLab 议题。从 GitHub 议题或 PR 创建 worktree 会打开交互式工作区创建对话框（而非静默后台创建），因此议题命令自动化、SSH 目标和文件夹工作区与其他创建路径行为一致。创建对话框会预填任务名并关联议题，让评审始终附着在任务上。

对 GitHub 议题，详情对话框有 **Activity**（活动）小节，把评论与时间线事件穿插排列——指派、提及、交叉引用、状态变更和项目列移动——不离开 Orca 就能看到完整历史。

用工作区侧边栏的关联议题菜单复制议题链接，无需打开抽屉。

对 GitLab 仓库，抽屉列出所选项目的打开议题，并能把列表收窄到指派给你的议题。

## Actions

失败的 GitHub Actions 检查会以红色微标显示在 worktree 上。点击即可行内查看失败作业的日志。

## 任务

Orca 在侧边栏 **Tasks**（任务）条目下提供完整的 GitHub Projects 视图——跨仓库浏览项目卡片、按来源仓库筛选、查看草稿 PR 状态，并从任意卡片创建 worktree。

## 故障排查

如果 PR 状态、检查或 Tasks 无法刷新——限流、`gh` 认证、权限或网络——参见 **[GitHub 错误排查](/github-errors)**。

## 后续步骤

- [在 Orca 中提交与推送](/review/commit-push)——暂存变更、推送分支，然后创建托管评审。
- [Linear 事项抽屉](/review/linear)——任务来源不在 git 托管方时改用 Linear。
- [GitHub 错误排查](/github-errors)——限流、认证与 `gh` 故障。
