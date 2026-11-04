---
title: "Worktrunk"
description: "用于 Git worktree 管理的 CLI，为并行 AI agent 工作流而设计。"
sidebar:
  order: 1
pagefind: false
head:
  - tag: link
    attrs:
      rel: canonical
      href: "https://worktrunk.dev/"
  - tag: meta
    attrs:
      name: robots
      content: noindex
  - tag: meta
    attrs:
      property: og:url
      content: "https://worktrunk.dev/"
---
Worktrunk 是一个用于 Git worktree 管理的 CLI，专为**并行 AI agent
工作流**而设计。

Worktrunk 的三个核心命令让 worktree 用起来像分支一样简单。
此外，Worktrunk 还带有一批改善日常体验的功能，让同时处理多个并行变更更轻松，
其中包括用于自动化本地工作流的钩子（hook）与写时复制（copy-on-write）构建缓存。

快速演示：

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-core-mobile.gif" media="(prefers-color-scheme: dark) and (max-width: 42rem)" data-demo-theme="dark" data-demo-media="(max-width: 42rem)">
  <source srcset="/assets/docs/light/wt-core-mobile.gif" media="(max-width: 42rem)" data-demo-theme="light" data-demo-media="(max-width: 42rem)">
  <source srcset="/assets/docs/dark/wt-core.gif" media="(prefers-color-scheme: dark)" data-demo-theme="dark">
  <img src="/assets/docs/light/wt-core.gif" alt="Worktrunk 演示：wt list、wt switch 与钩子" width="1600" height="900">
</picture>
<figcaption>列出 worktree、切换、清理</figcaption>
</figure>

## 背景：git worktree

像 Claude Code 和 Codex 这样的 AI agent 能够在无人监督的情况下处理更长的任务，
因此并行管理 5-10+ 个 agent 完全可行。Git 原生的 worktree 功能让每个
agent 拥有自己的工作目录，互不干扰彼此的变更。

但 git worktree 的使用体验很笨拙。哪怕只是新建一个 worktree 这样的小事，
也需要把分支名敲三遍：`git worktree add -b feat
../repo.feat`，然后 `cd ../repo.feat`。

## Worktrunk 让 git worktree 像分支一样简单

worktree 用分支名来指代，路径则根据可配置的模板计算得出。接受分支参数的命令，同样接受该分支所检出 worktree 的路径。

<p class="workflow-stage">从核心命令开始</p>

**核心命令**：

<table class="cmd-compare">
  <thead>
    <tr>
      <th>任务</th>
      <th>Worktrunk</th>
      <th>原生 git</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>切换 worktree</td>
      <td data-label="Worktrunk"><code>wt switch feat</code></td>
      <td data-label="原生 git"><code>cd ../repo.feat</code></td>
    </tr>
    <tr>
      <td>新建并启动 Claude</td>
      <td data-label="Worktrunk"><code>wt switch -c -x claude feat</code></td>
      <td data-label="原生 git"><pre><code>git worktree add -b feat ../repo.feat && \
cd ../repo.feat && \
claude</code></pre></td>
    </tr>
    <tr>
      <td>清理</td>
      <td data-label="Worktrunk"><code>wt remove</code></td>
      <td data-label="原生 git"><pre><code>cd ../repo && \
git worktree remove ../repo.feat && \
git branch -d feat</code></pre></td>
    </tr>
    <tr>
      <td>列出并显示状态</td>
      <td data-label="Worktrunk"><code>wt list</code></td>
      <td data-label="原生 git"><span class="cmd-compare-value"><code>git worktree list</code>（仅路径）</span></td>
    </tr>
  </tbody>
</table>

<p class="workflow-stage">按需扩展到更高级的命令</p>

<p class="workflow-heading"><strong>工作流自动化</strong>：</p>

- **[钩子](/hook/)**——在创建、pre-merge、post-merge 等时机运行命令
- **[LLM 提交信息](/llm-commits/)**——从 diff 生成提交信息
- **[合并工作流](/merge/)**——一条命令完成 squash、rebase、合并与清理
- **[交互式选择器](/switch/#交互式选择器)**——浏览 worktree 并实时查看 CI 状态，可预览 diff、日志、PR 与评论
- **[共享构建缓存](/step/#wt-step-copy-ignored)**——十个 worktree 无需构建或复制即可共享 `target/`、`node_modules/` 等目录（支持 APFS、btrfs 与 XFS）
- **[`wt list --full`](/list/#完整模式)**——按分支显示 [CI 状态](/list/#ci-状态)与 [AI 生成的摘要](/list/#llm-摘要)
- **[PR 检出](/switch/#pull-request-与-merge-request)**——用 `wt switch pr:123` 直接跳转到 PR 的分支
- **[每个 worktree 独立开发服务器](/tips-patterns/#每个-worktree-一个开发服务器)**——`hash_port` 模板过滤器为每个 worktree 分配唯一端口
- **[别名](/extending/#别名)与[按分支变量](/config/#wt-config-state-vars)**——自定义 `wt <name>` 命令与供钩子模板使用的分支级状态
- ……以及 **[更多功能](#后续步骤)**

多个并行 agent，同样简单的命令：

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-zellij-omnibus.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-zellij-omnibus.gif" alt="Worktrunk 综合演示：多个 Claude agent 在 Zellij 标签页中运行，配合钩子、LLM 提交信息与合并工作流" width="1600" height="900" loading="lazy">
</picture>
<figcaption>多个 Claude agent 并行运行，配合交互式选择器、钩子、LLM 提交信息与合并</figcaption>
</figure>

## 安装

**Homebrew**（macOS 与 Linux）：

```bash
brew install worktrunk && wt config shell install
```

Shell 集成让命令能够切换目录。

**Cargo**：

```bash
cargo install worktrunk && wt config shell install
```

<details>
<summary><strong>Windows 与其他平台</strong></summary>

**Windows**。`wt` 这个名字默认归 Windows Terminal 的命令所有，因此 Winget 会额外把 Worktrunk 安装为 `git-wt` 以避免冲突：

```bash
winget install max-sixty.worktrunk
git-wt config shell install
```

另一种办法是禁用 Windows Terminal 的别名（设置 → 应用 → 高级应用设置 → 应用执行别名 → “Terminal”/“Terminal Preview”），即可直接使用 `wt`。

> 免费代码签名由 [SignPath.io](https://signpath.io/) 提供，证书来自 [SignPath Foundation](https://signpath.org/)——[政策](/code-signing/)。

**Arch Linux**：

```bash
sudo pacman -S worktrunk && wt config shell install
```

**Conda / Pixi**（社区维护的 [feedstock](https://github.com/conda-forge/worktrunk-feedstock)）：

```bash
conda install -c conda-forge worktrunk && wt config shell install
```

或者使用 [Pixi](https://pixi.sh)：`pixi global install worktrunk && wt config shell install`。

</details>

## 快速上手

为新功能创建一个 worktree：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__list__quickstart_switch.snap — edit source to update -->

```console
$ wt switch --create feature-auth
✓ Created branch feature-auth from main and worktree @ ~/repo.feature-auth
```

<!-- END AUTO-GENERATED -->

这会创建新的分支与 worktree，然后切换过去。完成工作后，用 [`wt list`](/list/) 查看所有 worktree：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__list__quickstart_list.snap — edit source to update -->

```console
$ wt list
  Branch        Status      HEAD±     main↕    main…±    Remote⇅  Commit    Age  Message
@ feature-auth  +   ↑      +27   -8   ↑1       +31                4bc72dc    2h  Add authenticatio…
^ main              ^⇡                                    ⇡1      0e631ad    1d  Initial commit

○ Showing 2 worktrees, 1 with changes, 1 ahead, hidden: Path
```

<!-- END AUTO-GENERATED -->

`@` 标记当前 worktree。`+` 表示有已暂存的变更，`↑1` 表示领先 main 1 个提交，`⇡` 表示有未推送的提交。

完成后，任选其一收尾：

**PR 工作流**——提交、推送、发起 PR，在 GitHub/GitLab 上合并，然后清理：

```bash
wt step commit                    # commit staged changes
gh pr create                      # or glab mr create
wt remove                         # after PR is merged
```

**本地合并**——squash、rebase 到 main、fast-forward 合并、清理：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__list__quickstart_merge.snap — edit source to update -->

```console
$ wt merge main
◎ Generating commit message and committing changes... (2 files, +53, no squashing needed)
  Add authentication module
✓ Committed changes @ a1b2c3d
◎ Merging 1 commit to main @ a1b2c3d (no rebase needed)
  * a1b2c3d Add authentication module
   auth.rs | 51 +++++++++++++++++++++++++++++++++++++++++++++++++++
   lib.rs  |  2 ++
   2 files changed, 53 insertions(+)
✓ Merged to main (1 commit, 2 files, +53)
◎ Removing feature-auth worktree & branch in background (same commit as main, _)
○ Switched to worktree for main @ ~/repo
```

<!-- END AUTO-GENERATED -->

要并行运行多个 agent，可创建多个 worktree，并在每个 worktree 中启动一个 agent：

```bash
wt switch -x claude -c feature-a -- 'Add user authentication'
wt switch -x claude -c feature-b -- 'Fix the pagination bug'
wt switch -x claude -c feature-c -- 'Write tests for the API'
```

`-x` 选项会在切换后运行一条命令，`--` 之后的参数会传给该命令。配置 [post-start 钩子](/hook/#钩子类型)来自动完成准备工作（安装依赖、启动开发服务器）。

## 后续步骤

- 学习核心命令：[`wt switch`](/switch/)、[`wt list`](/list/)、[`wt merge`](/merge/)、[`wt remove`](/remove/)
- 配置[钩子](/hook/)实现自动化准备
- 探索 [LLM 提交信息](/llm-commits/)、[交互式选择器](/switch/#交互式选择器)、[Claude Code 集成](/claude-code/)、[CI 状态与 PR 链接](/list/#ci-状态)
- 浏览[技巧与模式](/tips-patterns/)中的实用做法：别名、开发服务器、数据库、agent 交接等
- [扩展 Worktrunk](/extending/)——用钩子与别名定制工作流
- 观看 [@DevOpsToolbox 讲解 Worktrunk 的视频](https://youtu.be/WBQiqr6LevQ?t=345)
- 运行 `wt --help` 或 `wt <command> --help` 快速查阅 CLI 参考
