---
title: "wt merge"
description: "将分支合并到目标分支。执行 squash 与 rebase，fast-forward 目标分支，并移除 worktree。"
sidebar:
  order: 12
---
<!-- ⚠️ AUTO-GENERATED from `wt merge --help-page` — edit src/cli/mod.rs to update -->

将分支合并到目标分支。执行 squash 与 rebase，fast-forward 目标分支，并移除 worktree。

与 `git merge` 不同，这条命令是把源分支合并到目标分支，而不是把目标分支合并到当前分支。效果类似于在 GitHub 上点击 “Merge pull request” 按钮，只是发生在本地。源分支默认为当前分支（`--branch` 可指定其他分支）；目标分支默认为默认分支。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-merge.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-merge.gif" alt="wt merge demo" width="1600" height="900">
</picture>
<figcaption>创建 worktree、在其中提交，再将其合并移除</figcaption>
</figure>

## 示例

合并到默认分支：

```console
$ wt merge
◎ Running pre-merge project:test
  cargo nextest run
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.02s
     Summary [   0.002s] 2 tests run: 2 passed, 0 skipped
◎ Merging 1 commit to main @ a1b2c3d (no commit/squash/rebase needed)
  * a1b2c3d feat: add hook registration
   hook.rs | 31 +++++++++++++++++++++++++++++++
   1 file changed, 31 insertions(+)
✓ Merged to main (1 commit, 1 file, +31)
◎ Removing hooks worktree & branch in background (same commit as main, _)
○ Switched to worktree for main @ ~/repo
```

合并到其他分支：

```console
$ wt merge develop
```

在不离开当前 worktree 的前提下合并另一个 worktree 的分支：

```console
$ wt merge --branch feature/auth
$ wt merge develop --branch feature/auth
```

源分支必须有一个已检出的 worktree。提交、squash、rebase 与钩子（hook）都使用该 worktree 及其项目配置。清理阶段会移除源 worktree；发起调用的 worktree 保持原位。rebase 冲突会留在源 worktree 中，等待解决或中止。

合并后保留 worktree：

```console
$ wt merge --no-remove
```

保留提交历史（不做 squash）：

```console
$ wt merge --no-squash
```

创建合并提交——默认在 rebase 后形成半线性历史：

```console
$ wt merge --no-ff
```

跳过提交/squash（除非指定 --no-rebase，否则 rebase 仍会执行）：

```console
$ wt merge --no-commit
```

原样保留精确干净的提交图与 tip：

```console
$ wt merge --no-commit --no-rebase
```

## 流水线

`wt merge` 依次执行以下步骤：

1. **提交**（Commit）——运行 pre-commit 钩子，随后提交未提交的更改。post-commit 钩子在后台运行。执行 squash（默认行为）时会跳过这一步——未提交的更改改在 squash 步骤中暂存。使用 `--no-squash` 时，这是唯一的提交步骤。
2. **Squash**——把目标分支之后的全部提交合成一个（类似 GitHub 的 “Squash and merge”）。pre-commit 钩子会看到暂存的更改，其修改也会被暂存进 squash 提交；post-commit 钩子在提交后于后台运行。用 `--stage` 控制暂存哪些内容：`all`（默认）、`tracked` 或 `none`。被一并卷入 squash 的工作区更改会先备份到 `refs/wt-backup/<branch>`；恢复方法见 [`wt step squash`](/step/#wt-step-squash)。使用 `--no-squash` 时，各个提交会原样保留。
3. **Rebase**——把提交 rebase 到目标分支上，没有需要重放的提交时跳过（具体条件见 [`wt step rebase`](/step/#wt-step-rebase)）。出现冲突时合并停止，rebase 在 worktree 中保持打开状态，等待解决或中止。使用 `--no-rebase` 时，保留先前提交/squash 步骤生成的提交图，且目标分支必须能够 fast-forward 到其 tip。
4. **Pre-merge 钩子**——钩子在 rebase 之后、合并之前运行。失败即中止。参见 [`wt hook`](/hook/)。
5. **合并**（Merge）——fast-forward 合并到目标分支（[`wt step push`](/step/#wt-step-push)）。指定 `--no-ff` 时改为创建合并提交——默认 rebase 之后是半线性历史，而显式指定 `--no-rebase` 时，则在添加合并提交之前保留先前步骤生成的提交图。非 fast-forward 的合并会被拒绝。
6. **Pre-remove 钩子**——钩子在移除 worktree 之前运行。失败即中止。
7. **清理**（Cleanup）——移除 worktree 与分支。使用 `--no-remove` 可保留 worktree。若已位于目标分支、处于主 worktree 中、worktree 已被锁定，或其中包含另一个已注册的 worktree，则保留该 worktree。
8. **Post-remove 与 post-merge 钩子**——在清理之后于后台运行。

使用 `--no-commit` 可跳过提交未提交的更改与 squash；rebase 默认仍会执行，除非传入 `--no-rebase`，否则可能改写提交。两个标志组合使用可原样保留源提交图，并要求目标分支是其祖先。在用 `wt step commit` 手动准备好提交之后很有用。要求工作区干净。

`wt merge` 合并到*本地*目标分支，并且从不 fetch。

## 本地 CI

pre-merge 钩子会在合并前于本地运行检查。任一检查失败都会中止合并：

```toml
# .config/wt.toml
[[pre-merge]]
test = "cargo test"
lint = "cargo clippy"
```

## 另请参阅

- [`wt step`](/step/)——逐项单独执行操作（commit、squash、rebase、push）
- [`wt remove`](/remove/)——移除 worktree 而不合并
- [`wt switch`](/switch/)——切换到其他 worktree

## 命令参考

```text wt-command-reference
wt merge - Merge a branch into the target branch

Squash & rebase, fast-forward the target branch, remove the worktree.

Usage: wt merge [OPTIONS] [TARGET]

Arguments:
  [TARGET]
          Target branch

          Defaults to default branch.

Options:
  -b, --branch <BRANCH>
          Branch to merge (defaults to the current branch)

      --no-squash
          Skip commit squashing

      --no-commit
          Skip commit and squash

      --no-rebase
          Skip rebase; require the target to fast-forward to the resulting tip

      --no-remove
          Keep worktree after merge

      --no-ff
          Create a merge commit (no fast-forward)

      --stage <STAGE>
          What to stage before committing [default: all]

          Possible values:
          - all:     Stage everything: untracked files + unstaged tracked changes
          - tracked: Stage tracked changes only (like git add -u)
          - none:    Stage nothing, commit only what's already in the index

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --no-hooks
          Skip hooks

      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after merge completes.

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
