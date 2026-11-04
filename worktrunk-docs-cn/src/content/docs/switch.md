---
title: "wt switch"
description: "切换到某个 worktree；需要时创建。"
sidebar:
  order: 10
---
<!-- ⚠️ AUTO-GENERATED from `wt switch --help-page` — edit src/cli/mod.rs to update -->

切换到某个 worktree；需要时创建。

worktree 通过分支名寻址；路径由可配置的模板计算得出。与 `git switch` 不同，这条命令是在各个 worktree 之间跳转，而不是在原地更换分支。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-switch.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-switch.gif" alt="wt switch 演示" width="1600" height="900">
</picture>
<figcaption>切换到某个 worktree、创建一个 worktree，以及创建一个会启动 agent 的 worktree</figcaption>
</figure>

## 示例

```console
$ wt switch feature-auth           # Switch to worktree
$ wt switch -                      # Previous worktree (like cd -)
$ wt switch --create new-feature   # Create new branch and worktree
$ wt switch --create hotfix --base production
$ wt switch pr:123                 # Switch to PR #123's branch
$ wt switch https://github.com/owner/repo/pull/123   # ...or paste the PR's URL
```

## 创建分支

`--create` 标志基于 `--base` 创建新分支——未另行指定时，`--base` 即默认分支。不加 `--create` 时，分支必须已经存在。切换到远程分支（例如仅存在 `origin/feature` 时执行 `wt switch feature`）会创建一个本地跟踪分支。

要补全来自特定远程的分支，先输入该远程的前缀再按 Tab（例如 `wt switch origin/`）。

只有当新分支与起点分支同名时，它才会跟踪该远程分支：`--create release --base origin/release` 会跟踪 `origin/release`，而 `--create feature --base origin/release` 则没有上游。发布这样的分支可使用 `git push --set-upstream origin <branch>`，或者一次性设置好 git 的 `push.autoSetupRemote = true`。

## 创建 worktree

如果分支已有 worktree，`wt switch` 会直接切换到该目录。否则，它会创建一个：

1. 运行 [pre-switch 钩子（hook）](/hook/#钩子类型)，阻塞直至完成
2. 在配置的路径（或 `--path` 指定的路径）创建 worktree
3. 切换到新目录
4. 运行 [pre-start 钩子](/hook/#钩子类型)，阻塞直至完成
5. 在后台拉起 [post-start](/hook/#钩子类型) 与 [post-switch 钩子](/hook/#钩子类型)

```console
$ wt switch feature                        # Existing branch → creates worktree
$ wt switch --create feature               # New branch and worktree
$ wt switch --create fix --base release    # New branch from release
$ wt switch --create temp --no-hooks       # Skip hooks
```

### 自定义路径

<span class="badge-experimental"></span>

`--path` 可将某个 worktree 放到 `worktree-path` 模板之外，同时保持分支名不变：

```console
$ wt switch --create feature/JIRA-1234 --path ../dark-mode
$ wt switch ../dark-mode                   # Switch by path...
$ wt switch feature/JIRA-1234              # ...or by branch
```

其他命令照常可以通过分支或路径访问它。由于它不在其分支所对应的路径上，[`wt list`](/list/#worktree) 会给它标上 `⚐`，而 [`wt step relocate`](/step/#wt-step-relocate) 会提议把它移回模板路径。

## 命名 worktree

worktree 通过分支名寻址，而所有接受分支名的参数也都接受 worktree 自身的路径——路径在分支之后解析，因此目录永远不会遮蔽与其同名的分支。路径能指名分支无法指名的对象：脱离 HEAD（detached HEAD）的 worktree，或同一分支的两处检出之一。相对路径相对 `-C` 解析，前导 `~` 则相对主目录解析，因此 worktrunk 打印过的路径都可以直接粘贴回来使用。

## 快捷方式

| 快捷方式 | 含义 |
|----------|---------|
| `^` | 默认分支（`main`/`master`） |
| `@` | 当前分支/worktree |
| `-` | 上一个 worktree（类似 `cd -`） |
| `pr:{N}` | GitHub PR #N 的分支 |
| `mr:{N}` | GitLab MR !N 的分支 |

```console
$ wt switch -                           # Back to previous
$ wt switch ^                           # Default branch worktree
$ wt switch --create fix --base=@       # Branch from current HEAD
$ wt switch --create fix --base=pr:123  # Branch from PR #123's head
$ wt switch pr:123                      # PR #123's branch
$ wt switch mr:101                      # MR !101's branch
```

快捷方式同样适用于 `--base`。

## 交互式选择器

不带参数调用时，`wt switch` 会打开一个交互式选择器，在实时预览中浏览和选择 worktree。候选集会随 `--branches`（尚无 worktree 的本地分支）、`--remotes`（远程分支）和 `--prs`（开放状态的 PR/MR——见下文）而扩大。

CI 列会显示每一行 PR/MR 的 CI 与评审状态，与 [`wt list --full`](/list/) 相同。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-switch-picker.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-switch-picker.gif" alt="wt switch 选择器演示" width="1600" height="900">
</picture>
<figcaption>按 Alt-p 展开仍在填充中的 CI 列与摘要列，随后翻页浏览 diff、某条 PR 的评论串，以及 PR 本身</figcaption>
</figure>

**按键**：

| 按键 | 动作 |
|-----|--------|
| `↑`/`↓` | 在 worktree 列表中移动 |
| （输入） | 过滤 worktree |
| `Enter` | 切换到选中的 worktree |
| `Alt-c` | 以已输入的文字为名创建新 worktree |
| `Alt-x` | 移除选中的 worktree/分支（绝不强制；不可作用于当前 worktree） |
| `Alt-y` | 将选中的分支名复制到剪贴板 |
| `Alt-o` | 在浏览器中打开所选行的 PR/MR URL |
| `Alt-r` | 刷新列表（收录别处创建的 worktree） |
| `Esc` | 取消 |
| `Alt-1`–`Alt-8` | 跳转到某个预览标签页 |
| `Tab`/`Shift-Tab` | 向前/向后循环切换可用的预览标签页 |
| `Alt-p` | 开关预览面板 |
| `Ctrl-u`/`Ctrl-d` | 上下滚动预览内容 |

在 macOS 上，`Alt` 即 Option 键；终端需要将其作为 Meta 键发送（例如 Terminal.app 的 [将 Option 键用作 Meta 键](https://support.apple.com/guide/terminal/change-profiles-keyboard-settings-trmlkbrd/mac) 选项）。

过滤器会匹配每一行的分支和路径；当该行关联 PR/MR 时，还会匹配 PR/MR 的编号、标题与作者。输入 `+` 可收窄到已关联的 worktree，输入 `@` 可收窄到当前 worktree。

**预览标签页**：

1. **diff** — 从比较基准贯穿到当前 worktree 的单份净 diff：已提交、已暂存、未暂存与未跟踪的变更
2. **working** — 相对 `HEAD` 的已暂存、未暂存与未跟踪变更
3. **committed** — 自比较基准以来的已提交变更
4. **log** — 近期提交；已在默认分支上的提交，其哈希显示为暗色
5. **remote⇅** — 相对上游跟踪分支的领先/落后 diff
6. **summary** — LLM 生成的分支摘要；需要 `[list] summary = true` 和 [`commit.generation`](/config/#commit)
7. **pr** — 所选行的 PR/MR，适用于分支带有 PR/MR 的任意行
8. **comments** — 该 PR/MR 的评论串，从 forge 拉取，适用于分支带有 PR/MR 的任意行

比较基准是与默认分支的 merge-base；当本地默认分支落后时，则改用与该分支上游的 merge-base。对于本地行，选择器默认打开 **diff**；对于由 `--prs` 列出但本地没有的 PR/MR，默认打开 **pr**。对所选行没有内容的标签页，其标签显示为暗色；活动标签页的标签则带下划线。`Tab` 和 `Shift-Tab` 会跳过暗色标签页；`Alt-1` 到 `Alt-8` 可直接打开任意标签页。选定某个标签页后，继续浏览时该选择会保持为活动状态。

**分页器配置**：预览面板会把 diff 输出送入 git 的分页器。可在用户配置中覆盖：

```toml
# ~/.config/worktrunk/config.toml
[switch.picker]
pager = "delta --paging=never --width=$COLUMNS"
```

**隐藏预览**：在 `[switch.picker]` 下设置 `preview = false`，选择器就会在预览隐藏的状态下打开；`Alt-p` 仍可将其显示出来。

## Pull Request 与 Merge Request

`pr:<number>` / `mr:<number>` 快捷方式和 PR/MR 的网页 URL 都会解析到其分支。对同仓库的 PR/MR，worktrunk 直接切换到该分支；对来自 fork 的 PR/MR，它会抓取相应 ref（`refs/pull/N/head` 或 `refs/merge-requests/N/head`），并把 `pushRemote` 配置为 fork 的 URL。

```console
$ wt switch pr:101                                  # GitHub PR #101
$ wt switch https://github.com/owner/repo/pull/101  # ...the same PR, by URL
$ wt switch mr:101                                  # GitLab MR !101
$ wt switch https://gitlab.com/owner/repo/-/merge_requests/101  # ...the same MR, by URL
$ wt switch --prs                                   # Browse open PRs/MRs in the picker
```

这两种写法在任何接受分支的地方都可用，包括 `--base`。`--create` 无法与 PR/MR 引用同时使用，因为分支已经存在。

如果 PR 或 MR 来自 fork，本地分支会直接使用其分支名，因此 `git push` 可以正常工作。若本地已存在同名分支且跟踪着其他对象，需要先重命名。

`--prs` 标志会把仓库中开放的 PR（GitHub）或 MR（GitLab）——交互式选择器里还没有的那些——添加进来。选中其中一条即会切换过去，效果与 `pr:<number>` / `mr:<number>` 相同。

需要安装并认证 `gh`（GitHub）、`glab`（GitLab）或等效的 CLI；Gitea、Azure DevOps 及其他受支持的平台请参阅 [forge 平台](/config/#forge-平台)。

## wt switch 失败时

- **分支不存在** — 使用 `--create`，或查看 `wt list --branches`
- **路径被占用** — 目标路径上已有另一个 worktree；切换过去或将其移除
- **残留目录** — 使用 `--clobber` 移除目标路径上的非 worktree 目录

要更改某个 worktree 所在的分支，请在该 worktree 中使用 `git switch`。

## 另请参阅

- [`wt list`](/list/) — 查看所有 worktree
- [`wt remove`](/remove/) — 用完后删除 worktree
- [`wt merge`](/merge/) — 把变更合回默认分支

## 命令参考

```text wt-command-reference
wt switch - Switch to a worktree; create if needed

Usage: wt switch [OPTIONS] [BRANCH] [-- <EXECUTE_ARGS>...]

Arguments:
  [BRANCH]
          Branch, worktree path, shortcut, or PR/MR URL

          Opens interactive picker if omitted. Shortcuts: ^ (default branch), - (previous), @
          (current), pr:{N} (GitHub PR), mr:{N} (GitLab MR)

  [EXECUTE_ARGS]...
          Additional arguments for --execute command (after --)

          Each argument is expanded for templates and passed directly to the program.

Options:
  -c, --create
          Create a new branch

  -b, --base <BASE>
          Base branch

          Defaults to default branch. Supports the same shortcuts as the branch argument: ^, @, -,
          pr:{N}, mr:{N}.

      --path <PATH>
          Worktree directory for a new worktree [experimental]

          Overrides the worktree-path template for this worktree. Relative paths resolve from the
          current directory, as with git worktree add. The branch keeps its own name; afterwards,
          switch by branch or by path.

  -x, --execute <EXECUTE>
          Program to run after switch

          Runs one external program after switching, with full terminal control. Arguments after --
          go directly to that program without Worktrunk shell parsing. Program lookup and argument
          decoding follow the operating system. Shell syntax requires an explicit shell, for example
          -x sh -- -c 'npm install && npm test'. On Windows, shell shims need their extension (-x
          code.cmd) or an explicit shell such as -x cmd.exe -- /C code.

          Without a branch argument, the interactive picker opens and the command runs against the
          selected worktree — so wt switch -x claude picks a worktree, then launches Claude Code
          there.

          The program starts in the worktree the switch selected, whether or not your shell follows
          it there: --no-cd governs only the shell.

          Supports hook template variables ({{ branch }}, {{ worktree_path }}, etc.) and filters. {{
          base }} and {{ base_worktree_path }} describe the source: the selected base with --create,
          or the invoking worktree when switching to an existing worktree.

          A variable inside a shell body is substituted before that shell parses it, so a path with
          spaces splits into several arguments. Pass it as a separate argument instead — sh binds
          the first one to $0, so the path arrives as $1:

            wt switch feature -x sh -- -c 'cd "$1" && npm test' sh '{{ worktree_path }}'

          Especially useful with shell aliases:

            alias wsc='wt switch --create -x claude'
            wsc feature-branch -- 'Fix GH #322'

          Then wsc feature-branch creates the worktree and launches Claude Code. Arguments after --
          are passed to the command, so wsc feature -- 'Fix GH #322' runs claude 'Fix GH #322',
          starting Claude with a prompt.

          Template example: -x code -- '{{ worktree_path }}' opens VS Code at the worktree, -x tmux
          -- new -s '{{ branch | sanitize }}' starts a tmux session named after the branch.

      --clobber
          Remove stale paths at target

      --no-cd
          Skip directory change after switching

          Hooks still run normally, and an --execute program still starts in the worktree — only
          your shell stays put, so wt switch feature --no-cd -x code -- . opens the worktree in an
          editor and leaves your terminal where it was. Useful when hooks handle navigation (e.g.,
          tmux workflows) or for CI/automation. Use --cd to override.

  -h, --help
          Print help (see a summary with '-h')

Picker Options:
      --branches
          Include branches without worktrees

      --remotes
          Include remote branches

      --prs
          Include open PRs/MRs

Automation:
      --no-hooks
          Skip hooks

      --format <FORMAT>
          Output format

          JSON prints one structured result to stdout once the switch, including any --execute
          command, completes. A worktree created before a later failure remains in place and is
          included in the result. Read stdout even when the exit status is nonzero. Errors,
          diagnostics, and --execute output go to stderr. Failure before a result exists and
          canceling the interactive picker produce no result. Background hooks run independently of
          the result. Designed for tool integration (e.g., Claude Code WorktreeCreate hooks).

          [default: text]
          [possible values: text, json]

Global Options:
  -C <path>
          Working directory for this command

      --config <path>
          User config file path

      --config-set <toml>
          Override config with inline TOML, e.g. --config-set list.full=true (repeatable)

  -v, --verbose...
          Verbose output (-v: info logs + hook/alias template variables on stderr; -vv: also debug
          logs and raw subprocess output written to .git/wt/logs/). Set WORKTRUNK_VERBOSE=0|1|2 to
          apply the same level everywhere — including shell completion, which no flag can reach

  -y, --yes
          Skip approval prompts
```

<!-- END AUTO-GENERATED -->
