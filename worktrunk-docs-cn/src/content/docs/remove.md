---
title: "wt remove"
description: "移除 worktree；若分支已合并则删除该分支。默认作用于当前 worktree。"
sidebar:
  order: 13
---
<!-- ⚠️ AUTO-GENERATED from `wt remove --help-page` — edit src/cli/mod.rs to update -->

移除 worktree；若分支已合并则删除该分支。默认作用于当前 worktree。

## 示例

移除当前 worktree：

```console
$ wt remove
◎ Running pre-remove project:cleanup
  flyctl scale count 0
Scaling app to 0 machines
◎ Removing api worktree & branch in background (same commit as main, _)
○ Switched to worktree for main @ ~/repo
```

移除指定的 worktree / 分支：

```console
$ wt remove feature-branch
$ wt remove old-feature another-branch
```

保留分支：

```console
$ wt remove --no-delete-branch feature-branch
```

若已配置 `[remove] delete-branch = false`，可用 `--delete-branch` 在单次移除中删除分支：

```console
$ wt remove --delete-branch feature-branch
```

强制删除未合并的分支：

```console
$ wt remove -D experimental
```

## 分支清理

默认情况下，若分支合并后不会给默认分支带来任何变更，就会被删除。这既适用于 git 历史未发生变化的情形，也适用于提交历史不同、但文件变更一致的 squash 合并或 rebase 工作流。

Worktrunk 会检查六个条件：

1. **同一提交**——分支 HEAD 与默认分支相同。在 `wt list` 中显示 `_`。
2. **祖先**——分支已包含在目标的历史中（fast-forward 或 rebase 的情形）。显示 `⊂`。
3. **无新增变更**——三点 diff（`target...branch`）为空。显示 `⊂`。
4. **树相同**——分支的 tree SHA 与目标的 tree SHA 相同。显示 `⊂`。
5. **合并不带来变更**——模拟合并得到与目标相同的树。可覆盖这样的情形：分支已被 squash 合并，而目标其后又对不同文件做了改动继续前进。显示 `⊂`。
6. **patch-id 匹配**——分支的完整 diff 与目标上单个 squash 合并提交一致。这是模拟合并因目标随后修改了分支触碰过的同一批文件而冲突时的兜底。显示 `⊂`。

对默认分支的遍历设有上限，让单次检查保持快速；自合并点以来又累积了数百个提交的 squash merge 会超出上限，需要用 `-D` 移除。

“同一提交”检查使用本地默认分支；对其他检查而言，“目标”指默认分支，或当其严格领先时的上游（如 `origin/main`）。

满足这些条件且工作区为空的分支，会在 `wt list` 中显示为暗淡样式，表示可以安全删除。

## 强制标志

Worktrunk 提供两个强制标志，用于不同情况：

| 标志 | 作用范围 | 使用时机 |
|------|-------|-------------|
| `--force` (`-f`) | Worktree | worktree 有未提交变更 |
| `--force-delete` (`-D`) | 分支 | 分支有未合并提交 |

```console
$ wt remove feature --force       # Remove dirty worktree
$ wt remove feature -D            # Delete unmerged branch
$ wt remove feature --force -D    # Both
```

无论合并状态如何，都可以用 `--no-delete-branch` 保留分支。

## 后台移除

移除默认在后台执行——命令立即返回，输出写入 `.git/wt/logs/{branch}/internal/remove.log`。可用 `--foreground` 等待其完成。

## 清理残留进程

<span class="badge-experimental"></span>

`--reap` 会在 worktree 被移除前，终止其中仍在运行的进程——`post-start` 启动的开发服务器、文件监视器、语言服务器——释放它们占用的端口和文件句柄。进程按工作目录发现：当前目录位于 worktree 路径本身或其下的任何进程都会被终止（先 `SIGTERM`，幸存者再 `SIGKILL`）。

```console
$ wt remove --reap feature
◎ Reaping 2 processes under feature worktree
   ┃ 51234 node
   ┃ 51240 esbuild
✓ Reaped 2 processes
◎ Removing feature worktree & branch in background (same commit as main, _)
```

为避免误杀用户无意终止的工作，两道防护让 `--reap` 保持保守：

- **交互式进程会被放过**。持有控制终端的进程——交互式 shell，或带有未保存缓冲区的 `vim` 之类的终端编辑器——绝不会被清理；只有脱离终端的进程仍属候选。
- **发现仅依据工作目录**。在 worktree 中启动、随后切换了目录的进程，或重新挂到 `init` 名下的守护进程，不再报告 worktree 之下的目录，因此发现不了。要可靠地清理这类进程，请用 [`wt step tether`](/step/#wt-step-tether) 启动它们——worktree 被移除时，它会杀掉整个进程组。

仅限 Unix；在 Windows 上 `--reap` 会被拒绝。

## JSON 输出

`--format=json` 会为每次移除向 stdout 打印一个对象：worktree 对象的字段为 `{kind, branch, path, branch_outcome, branch_checked_out_at}`，仅移除分支时 `path` 由 `pruned` 取代。仅移除分支的结果还包含 `detached_worktree`：位于该分支预期位置的脱离 worktree 的路径（移除会将其留在原地），或为 `null`。

`branch_outcome` 说明分支的最终结果，让调用方能区分“移除时被拒绝的删除”与“从未被要求的删除”：

| 值 | 含义 |
|-------|---------|
| `deleted` | 分支已不存在 |
| `deferred` | 交由后台移除处理，其结果本次运行看不到。`--foreground` 永不报告此值 |
| `not_attempted` | 未尝试删除：脱离 worktree、兄弟检出，或指定了 `--no-delete-branch` |
| `retained_unmerged` | 已拒绝：分支尚未并入目标 |
| `retained_checked_out` | 已拒绝：分支被另一个 worktree 检出 |
| `retained_raced` | 已拒绝：移除期间分支发生了变动。请重试 |
| `retained_failed` | 删除命令本身执行失败 |

## 钩子

`pre-remove` 钩子在 worktree 被删除之前运行（此时仍可访问 worktree 文件）。`post-remove` 钩子在移除之后运行。配置方法见 [`wt hook`](/hook/)。

## 脱离 HEAD 的 worktree

脱离 worktree 没有分支名。此时改为传入 worktree 路径：`wt remove /path/to/worktree`。

## 另请参阅

- [`wt merge`](/merge/) —— 合并后移除 worktree
- [`wt list`](/list/) —— 查看所有 worktree

## 命令参考

```text wt-command-reference
wt remove - Remove worktree; delete branch if merged

Defaults to the current worktree.

Usage: wt remove [OPTIONS] [BRANCHES]...

Arguments:
  [BRANCHES]...
          Branch name or worktree path [default: current]

Options:
      --no-delete-branch
          Keep branch after removal

      --delete-branch
          Delete branch after removal (overrides config [remove] delete-branch = false)

  -D, --force-delete
          Delete unmerged branches

      --foreground
          Run removal in foreground (block until complete)

      --reap
          Kill processes started in the worktree [experimental]

          Before removal, terminate processes whose working directory is under the worktree — dev
          servers, watchers, language servers. Processes holding a controlling terminal (interactive
          shells, terminal editors) are left alone. Unix only.

  -f, --force
          Force worktree removal

          Remove a dirty worktree, including staged, modified, and untracked files. Without this
          flag, removal fails if the worktree has any uncommitted changes.

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --no-hooks
          Skip hooks

      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after removal completes.

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
