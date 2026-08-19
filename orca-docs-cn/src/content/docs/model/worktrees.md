---
title: "Worktree"
description: "Orca 如何把每个功能或 bug 变成一个独立的 git worktree。"
source: "https://www.onorca.dev/docs/model/worktrees"
---

# Worktree

Orca 如何把每个功能或 bug 变成一个独立的 git worktree。

Orca 是 worktree 原生的。它不在单一检出上反复分支和 stash，而是通过 `git worktree` 让每个任务都拥有仓库自己的磁盘副本。这正是并行智能体安全的原因——它们绝不会互相踩踏文件。

## 模型

- 每个仓库有一个**基准引用（base ref）**（通常是 `origin/main`）。
- 每个 worktree 有一个**起始引用（start-from ref）**——即它从哪里分叉。
- 每个 worktree 有自己的分支、自己在磁盘上的文件和自己的智能体终端。
- 删除 worktree 会同时移除目录和分支（需确认）。如果 git 因为某个本地分支可能仍有未合并提交而保留了它，Orca 会提供一个审查步骤——参见[保留分支](#保留分支)。

## 每个功能的生命周期

1. **创建**——任务名、起始引用选择器、可选的 GitHub / Linear / Jira / GitLab 关联。
2. **工作**——智能体终端、编辑器标签页、浏览器标签页、终端窗格都限定在这个 worktree 内。
3. **审查**——相对起始引用的 diff 视图、标注 AI Diff、归属（Attribution）。
4. **交付**——提交、推送、开 PR、等检查——全部就地完成。
5. **归档或删除**——一次点击即移除 worktree 和分支。

## 创建在后台运行

提交 Create Worktree 对话框后它会立即关闭——`git fetch` 和 `git worktree add` 的工作在后台继续，你可以照常使用 Orca。新 worktree 会带一条进度行出现在侧边栏中，其标签页会实时显示安装状态，直到检出完成并切换到终端。创建进行中你可以切换到其他 worktree、查看进度，或从标签页面板中取消。如果创建失败，面板会显示错误并提供重试。

## 起始引用选择器

创建 worktree 时你选择从哪里分叉。可以是：

- 仓库的基准引用（快速路径）。
- 另一个本地分支——适合把工作堆叠在审查中的 PR 之上。
- 一个具体的提交 SHA。
- 一个已存在的远程分支——Orca 会拉取并检出。

## 共享目录与 gitignored 文件

一个全新的 worktree 是一份干净的检出。位于 gitignored 路径中的依赖、缓存和本地密钥不会存在，直到你重新创建它们。

Orca 用三种互补的方式填补这个缺口：

1. **Worktree Shared Paths**（每仓库，位于 Settings → Repository）——路径从主检出物化到每个新 worktree 中（macOS 上尽可能使用 APFS clone-copy，否则用符号链接）。
2. **`orca.yaml` 中的 `worktree.sharedDirectories`**——检入仓库的 **gitignored 目录**清单，以同样方式共享（符号链接/共享，而非复制）。适用于 `node_modules` 或 `.cache` 这类可重建的大目录。条目必须作为目录存在于主检出中**并且**被 gitignore；已跟踪或缺失的路径会被跳过。
3. **仓库根目录的 `.worktreeinclude`**——要**复制**（而非符号链接）到每个新 worktree 的 **gitignored 文件或目录**清单，让每个 worktree 拥有自己的副本。典型条目：`.env`、`.vscode/` 下的本地配置。允许空行和 `#` 注释。目前仅支持**字面**路径——glob 和否定会被跳过并给出警告。已跟踪、缺失或未被 gitignore 的路径不会被复制。

`orca.yaml` 的共享目录**叠加**在每用户的 Worktree Shared Paths 清单之上；它们从不替换后者。已经共享/链接过的路径不会再次从 `.worktreeinclude` 复制。

```
# orca.yaml（仓库根目录）
worktree:
  sharedDirectories:
    - node_modules
    - .cache
```

```
# .worktreeinclude（仓库根目录）
.env
.env.local
.vscode/settings.json
```

## 创建对话框：Project、Run on、智能体与任务关联

Create Workspace 对话框为 **Project** 和 **Run on** 使用预输入组合框：

- 输入即过滤；Enter 提交选中的行。
- **Project** 始终把 **Add a new project** 固定在底部——即使安装中还没有项目，创建也绝不会走入死胡同。
- **Run on** 列出就绪的主机和配方，以及仍需在那台机器上完成项目设置的主机。需要设置的行会显示诸如 *Project not set up on this host* 的详情；就绪之前可见但不可选。已断开的 SSH / 远程主机可以提供 **Connect** 而不必将其选为运行目标。**Add host** 为 SSH 或远程 Orca 服务器目标保持固定。
- **Agent** 选择器（折叠或展开）可以把创建时选择的智能体**设为默认（Set as default）**，包括 Blank Terminal。
- 从名称字段关联 GitHub PR、Linear 议题、GitLab MR 或 **Jira** 议题（粘贴 Jira URL 或在 **Jira** 模式下搜索）。关联的议题会显示在 worktree 卡片上。参见 [Jira 事项抽屉](/review/jira)。

参见 [Orca 的运行方式](/ways-to-run)。

## Emoji 工作区名

在工作区名称字段中，你可以输入 Slack 风格的短代码（`:rocket:`）并从短代码建议弹出框中选取。双击重命名 worktree、在 **Edit Worktree Details** 中编辑、或在 [worktree 跳转面板](/model/quick-open)（`Cmd-J`）中输入短代码时，用的都是同一个选择器。显示名保留 emoji；当 Orca 推导 git 分支名时，会把已知的 emoji 改写成可读的短代码（例如 🚀 → `rocket`）。跳转面板搜索可以通过该短代码派生的片段匹配以 emoji 命名的工作区。

## 分支命名

默认情况下，Orca 从你输入的工作区名推导新 worktree 的分支名；如果工作区是从 GitHub PR、Linear/Jira 议题或 GitLab MR 创建的，则从对应项推导。想显式指定分支名，展开 Create Worktree 对话框中的 **Advanced** 抽屉，在 **Branch name** 字段中输入（占位符 `feature/my-branch`）。

从 **Linear 议题**创建时，Orca 会把 Linear 为该议题提供的分支名（如果 Linear 提供了）用作分支覆盖——即 Linear 自己 UI 中会建议的名字——而不只是把议题标题转成 slug。

只有当你从输入的工作区名或基础分支创建时，才会提供 Branch name 字段。当工作区绑定到被跟踪的工作项时，分支由该事项推导——关联的 GitHub PR 甚至会在提交时重新解析分支——因此 Orca 会隐藏该字段，避免出现被静默忽略的覆盖。

## 侧边栏布局

侧边栏默认按**项目**分组 worktree——顶层行是项目（一个项目 = 一个 git 仓库或一组相关仓库），展开为你正在处理的 worktree。头部有自己独立的过滤输入框（与全局搜索分开），让你不必离开侧边栏就能收窄列表。

侧边栏头部的过滤菜单把主机和项目范围归入共享的 **Show** 区域（**Hosts** 和项目的子菜单行），然后是各项隐藏开关：

- **Sleeping**（休眠）工作区——在此过滤器下，每个项目的**入口 / 主**工作区保持可见，这样该检出闲置时项目行不会消失
- **Except default branch**（仅当 **Hide sleeping** 开启时出现）——休眠清理期间保持默认分支工作区可见；当休眠工作区已经显示时，该子选项隐藏
- **Default branch** 工作区（主检出行）
- **Automation-created**（自动化创建的）工作区
- **CLI-created** 工作区——通过 `orca worktree create` 创建（悬停卡片可见 **Orca CLI** 来源详情）
- **Other-client** 工作区——当共享的[远程 Orca 服务器](/remote-servers)上存在从其他配对客户端创建的工作区时，会出现 **Hide other-client workspaces**；开启它可让本设备的列表只显示你在这里创建的工作区。空的 `Cmd-J` 最近记录和数字快捷键遵循同一过滤；输入查询仍能找到被隐藏的行。
- **Detached HEAD** 工作区——检出于某个提交而非分支上

活动过滤数量显示在过滤控件上；**Clear** 只重置开启中的过滤器。一旦输入查询，文本搜索和 [worktree 跳转面板](/model/quick-open)（`Cmd-J`）仍能到达仅被这些过滤器隐藏的工作区——跳转面板还有自己的主机/项目过滤器（**Tab**）。

当你添加一个包含多个 Git 仓库的父文件夹时，Orca 可以分别导入所选仓库，或把它们归入一个项目组。

侧边栏顶部的 **Search** 按钮会打开 [worktree 跳转面板](/model/quick-open)（`Cmd-J`）——同一个界面，面向不依赖键盘导航的用户的点击入口。状态栏内联显示智能体活动；有未读的 worktree 以加粗标示而非角标。

你可以把 worktree 置顶到其项目上方，让长期进行的工作保持在视野内；右键点击 worktree 可看到归档 / 休眠 / 删除操作。按住 `Cmd`（Linux/Windows 上为 `Ctrl`）点击可将 worktree 加入多选，或按住 `Shift` 选择连续范围——右键点击选中的任意 worktree 会把操作应用到选区中的每一个。仓库行本身可以拖动重排。

当某个 worktree 有嵌套的子 worktree（例如来自编排或带父级的 `worktree create`）时，上下文菜单还会提供 **Sleep with Descendants (N)** 和 **Delete with Descendants…**。Sleep with descendants 会关闭所选工作区及同一项目、仓库和主机下每个已验证嵌套子级上的活动面板——只有拥有活动终端或浏览器标签页的工作区才会成为休眠目标。Delete with descendants 把既有的级联删除显式化。过期血缘链接、循环以及跨主机或仓库边界的子级会被排除。

双击侧边栏中的 worktree 标题可就地重命名。双击卡片其他位置仍会打开完整编辑对话框。在 **Edit Worktree Details** 中，议题字段接受 **GitHub** 或 **Linear**（字段上的微标；粘贴 URL 即自动识别）。每个工作区一个关联议题——更换提供商或清空字段会解除上一个的关联。对于主机已断开的 SSH 工作区，卡片标题行可以显示内联重连控件（参见 [SSH worktree](/ssh)）。

## 保留分支

批量删除工作区（侧边栏多选或 Resource Manager 清理）仍会移除磁盘上的文件夹。如果 git 因为某个本地分支可能含有未合并提交而拒绝丢弃它，Orca 会保留这些分支并显示一条 toast，例如 **Review N Branches**。打开它可以列出保留的分支，让你强制删除一部分、保留其余。未选择的分支留在仓库中；工作区文件夹不会恢复。

## 多仓库项目组与文件夹工作区

当你导入一个包含多个 Git 仓库的父文件夹时，Orca 可以把这些仓库归入侧边栏中的单个**项目组**。每个项目组提供一种**文件夹工作区**流程——一个类似 worktree 的条目，位于父文件夹层级，其任务源绑定到下面某个仓库。这样，即便工作区本身在侧边栏中与兄弟项归在一起，某个功能的 GitHub/GitLab/Linear/Jira 任务面依然挂在正确的仓库上。

要创建一个，悬停侧边栏中项目组的头部行并点击 **+** 操作（工具提示："Create workspace for *group*"）。编辑对话框（"Create Folder Workspace"）会让你选择工作区任务源的来源项目、命名工作区，并可选地附加关联议题或 PR。提交后，文件夹工作区就出现在项目组之下，与常规的仓库级 worktree 并列。

删除项目组时，Orca 还提供一个复选框，在同一次操作中移除组内容纳的项目（底层仓库注册）——这样清理一个不再使用的仓库集群只需一次确认，而不是多次。

## 使用原生 git

每个 Orca worktree 都是一个真实的 git worktree。你可以在其中打开终端，使用 `git status`、`git rebase`、`git cherry-pick` 和任何其他命令——Orca 会在下一次渲染时感知变更。

你自己用 `git worktree add` 创建的 worktree 在导入之前保持外部状态。如果仓库隐藏了外部 worktree，Orca 会在 **New externally-created worktrees** 收件箱中提示新检测到的项，让你导入或保持隐藏。

> **提示** 如果你从 CLI 执行 `git worktree remove`，Orca 会在下次刷新该仓库时注意到并清理自己的状态。
