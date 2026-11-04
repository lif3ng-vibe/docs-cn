---
title: "wt step"
description: "执行单项操作。wt merge 的构成积木——commit、squash、rebase、push——外加独立实用工具。"
sidebar:
  order: 16
---
<!-- ⚠️ AUTO-GENERATED from `wt step --help-page` — edit src/cli/mod.rs to update -->

执行单项操作。wt merge 的构成积木——commit、squash、rebase、push——外加独立实用工具。

## 示例

使用 LLM 生成的提交信息进行提交：

```console
$ wt step commit
◎ Generating commit message and committing changes... (2 files, +26)
  feat(validation): add input validation utilities
✓ Committed changes @ a1b2c3d
```

在步骤之间进行审查的手动合并工作流：

```console
$ wt step commit
$ wt step squash
$ wt step rebase
$ wt step push
```

## 操作

- [`commit`](#wt-step-commit) —— 使用 [LLM 生成的提交信息](/llm-commits/)暂存并提交
- [`squash`](#wt-step-squash) —— 使用 [LLM 生成的提交信息](/llm-commits/)把分支的全部提交 squash 为一个
- [`rebase`](#wt-step-rebase) —— rebase 到目标分支之上
- [`push`](#wt-step-push) —— 将目标分支 fast-forward 到当前分支
- [`diff`](#wt-step-diff) —— 显示分叉以来的全部变更（已提交、已暂存、未暂存、未跟踪）
- [`copy-ignored`](#wt-step-copy-ignored) —— 在 worktree 之间复制 gitignored 文件
- [`eval`](#wt-step-eval) —— 对模板表达式求值
- [`for-each`](#wt-step-for-each) —— 在每个 worktree 中运行命令
- [`promote`](#wt-step-promote) —— <span class="badge-experimental"></span> 将分支换入主 worktree
- [`prune`](#wt-step-prune) —— 移除已合并进默认分支的 worktree 与分支
- [`relocate`](#wt-step-relocate) —— <span class="badge-experimental"></span> 将 worktree 移动到预期路径
- [`tether`](#wt-step-tether) —— <span class="badge-experimental"></span> 运行一条命令；在其 worktree 被移除时杀掉整个进程树
- [`<alias>`](/extending/#别名) —— 运行已配置的命令别名

## 另请参阅

- [`wt merge`](/merge/) —— 自动依次执行 commit → squash → rebase → 钩子 → push → 清理
- [`wt hook`](/hook/) —— 运行已配置的钩子
- [别名](/extending/#别名) —— 以 `wt <name>` 形式运行的自定义命令模板

## 命令参考

```text wt-command-reference
wt step - Run individual operations

The building blocks of wt merge — commit, squash, rebase, push — plus standalone utilities.

Usage: wt step [OPTIONS] <COMMAND>

Commands:
  commit        Stage and commit with LLM-generated message
  squash        Squash commits since branching
  rebase        Rebase onto target
  push          Fast-forward target to current branch
  diff          Show all changes since branching
  copy-ignored  Copy gitignored files to another worktree
  eval          Evaluate a template expression
  for-each      Run command in each worktree
  promote       [experimental] Swap a branch into the main worktree
  prune         Remove worktrees and branches merged into the default branch
  relocate      [experimental] Move worktrees to expected paths
  tether        [experimental] Run a command; kill its whole process tree when its worktree is
                removed

Options:
  -h, --help
          Print help (see a summary with '-h')

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

# 子命令

## wt step commit

暂存变更并使用 LLM 生成的提交信息进行提交。

配置与提示词自定义参见[LLM 生成的提交信息](/llm-commits/)。未配置 `[commit.generation]` 命令时提交仍会进行——提交信息改由已暂存的文件名生成（`Changes to README.md`）。

### 在另一 worktree 上操作

`--branch` 在另一 worktree 的分支上提交，无需离开当前 worktree：

```console
$ wt step commit --branch feature
```

该分支必须有一个已检出的 worktree；暂存、钩子与提交都在那里进行。

### 钩子

`pre-commit` 钩子在提交前运行，失败时中止提交；`post-commit` 钩子在提交后于后台运行，输出记入日志。`--no-hooks` 跳过两者。参见 [`wt hook`](/hook/)。

### 选项

#### 暂存

控制提交前暂存哪些内容：

| 取值 | 行为 |
|-------|----------|
| `all` | 暂存全部变更，含未跟踪文件（默认） |
| `tracked` | 仅暂存已修改的跟踪文件 |
| `none` | 不暂存任何内容，只提交已暂存的部分 |

```console
$ wt step commit --stage=tracked
```

在用户配置中设置默认值：

```toml
# ~/.config/worktrunk/config.toml
[commit]
stage = "tracked"
```

#### 试运行

渲染提示词、打印 LLM 命令、生成提交信息，然后退出——不暂存、不运行钩子、不提交：

```console
$ wt step commit --dry-run
```

输出分三部分：渲染后的提示词、将要调用 LLM 的 shell 命令、以及返回的提交信息。LLM 调用仍会发生——只是跳过提交。

### 命令参考

```text wt-command-reference
wt step commit - Stage and commit with LLM-generated message

Usage: wt step commit [OPTIONS]

Options:
  -b, --branch <BRANCH>
          Branch to operate on (defaults to current worktree)

      --stage <STAGE>
          What to stage before committing [default: all]

          Possible values:
          - all:     Stage everything: untracked files + unstaged tracked changes
          - tracked: Stage tracked changes only (like git add -u)
          - none:    Stage nothing, commit only what's already in the index

      --dry-run
          Preview prompt, command, and generated message without committing

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --no-hooks
          Skip hooks

      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the commit completes.

          [default: text]
          [possible values: text, json]
```

## wt step squash

将分叉以来的提交 squash 为一个。暂存变更并用 LLM 生成提交信息。

配置与提示词自定义参见[LLM 生成的提交信息](/llm-commits/)。未配置 `[commit.generation]` 命令时 squash 仍会进行——提交信息改为在 `Squash commits from <branch>` 之下列出被 squash 各提交的主题。

### 钩子

`pre-commit` 钩子在 squash 提交前运行，失败时中止该提交；`post-commit` 钩子在其后于后台运行，输出记入日志。`--no-hooks` 跳过两者。参见 [`wt hook`](/hook/)。

squash 提交在脱离 HEAD（detached HEAD）状态下进行，与 `git rebase` 的做法一致，因此 git 自身的提交钩子会运行，且看不到当前分支。

### 恢复已暂存的变更

squash 之前，Worktrunk 会把本次 squash 纳入的未提交变更（所有已暂存内容，无论是手动暂存还是由 `--stage` 暂存）保存到 `refs/wt-backup/<branch>`。未纳入 squash 的变更留在工作区中，不做备份。

命令输出中会给出一条命令，用于在新 worktree 中恢复这些已保存的变更——即便原 worktree 已被 `wt merge` 移除。

### 选项

#### 暂存

控制 squash 前暂存哪些内容：

| 取值 | 行为 |
|-------|----------|
| `all` | 暂存全部变更，含未跟踪文件（默认） |
| `tracked` | 仅暂存已修改的跟踪文件 |
| `none` | 不暂存任何内容；squash 各提交加上已暂存的内容 |

```console
$ wt step squash --stage=none
```

在用户配置中设置默认值：

```toml
# ~/.config/worktrunk/config.toml
[commit]
stage = "tracked"
```

#### 试运行

渲染提示词、打印 LLM 命令、生成 squash 提交信息，然后退出——不暂存、不运行钩子、不执行 squash：

```console
$ wt step squash --dry-run
```

输出分三部分：渲染后的提示词、将要调用 LLM 的 shell 命令、以及返回的提交信息。LLM 调用仍会发生——只是跳过 squash。

### 命令参考

```text wt-command-reference
wt step squash - Squash commits since branching

Stages changes and generates message with LLM.

Usage: wt step squash [OPTIONS] [TARGET]

Arguments:
  [TARGET]
          Target branch

          Defaults to default branch.

Options:
      --stage <STAGE>
          What to stage before committing [default: all]

          Possible values:
          - all:     Stage everything: untracked files + unstaged tracked changes
          - tracked: Stage tracked changes only (like git add -u)
          - none:    Stage nothing, commit only what's already in the index

      --dry-run
          Preview prompt, command, and generated message without squashing

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --no-hooks
          Skip hooks

      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the squash completes.

          [default: text]
          [possible values: text, json]
```

## wt step rebase

rebase 到目标之上。

rebase 把分支的提交放到目标之上，这正是 [`wt step push`](#wt-step-push) 所需要的——只有当目标是分支的祖先时，push 才能 fast-forward。`wt merge` 会在流水线中执行这一步；单独运行时，它让分支跟上已前移的目标，而不合并进目标。

目标可以是任意提交：分支、标签或 SHA。

### 示例

```console
$ wt step rebase            # Rebase onto default branch
$ wt step rebase develop    # Rebase onto develop
$ wt step rebase v1.2.0     # Rebase onto a tag
```

### 结果

按第一行匹配的结果执行：

| 分支与目标的关系 | 结果 |
|-------------------|--------|
| 目标已是分支的祖先，且中间没有合并提交 | 不执行任何操作——`Already up to date` |
| 分支是目标的祖先，即它没有自己的提交 | `Fast-forwarded to <target>` |
| 其他情况 | 分支的提交重放到目标顶端——若两者没有共同历史则直接拒绝 |

### 冲突

遇到冲突的提交会让 rebase 保持打开状态，而不是将其撤销。worktree 中保留 git 的冲突标记，出路是解决冲突后执行 `git rebase --continue`，或者 `git rebase --skip`、`git rebase --abort`。在 rebase 了结之前，`wt step rebase`、`wt step squash`、`wt step push` 与 `wt merge` 都拒绝运行。

### 命令参考

```text wt-command-reference
wt step rebase - Rebase onto target

Usage: wt step rebase [OPTIONS] [TARGET]

Arguments:
  [TARGET]
          Target branch, tag, or commit

          Defaults to default branch.

Options:
  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the rebase completes.

          [default: text]
          [possible values: text, json]
```

## wt step push

将目标分支 fast-forward 到当前分支。

尽管名字叫 push，并没有任何提交离开仓库。目标分支的引用在本地前移，持有该分支的 worktree 也随之更新。发布是随后另做的一步——向远程执行 `git push`。

目标是一个分支，且必须已是当前分支的祖先。若目标已前移则会拒绝，也没有强制（force）变体——先用 [`wt step rebase`](#wt-step-rebase) 把分支放回目标之上。

### 示例

```console
$ wt step push             # Fast-forward main to current branch
$ wt step push develop     # Fast-forward develop instead
$ wt step push --no-ff     # Merge commit instead of a fast-forward
```

### 目标 worktree

当目标分支有自己的 worktree 时，该 worktree 的文件也会移动到新提交上。其中的未提交变更绝不移动：push 未触及的文件——无论是否已暂存——原封不动地留在原地；而触及 push 所改文件的变更会被直接拒绝，并指明文件名。若更新无法应用，则整体回滚，分支与 worktree 保持原样。

### 命令参考

```text wt-command-reference
wt step push - Fast-forward target to current branch

Usage: wt step push [OPTIONS] [TARGET]

Arguments:
  [TARGET]
          Target branch

          Defaults to default branch.

Options:
      --no-ff
          Create a merge commit (no fast-forward)

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the push completes.

          [default: text]
          [possible values: text, json]
```

## wt step diff

显示分叉以来的全部变更。包括已提交、已暂存、未暂存与未跟踪的文件。

这正是 `wt merge` 将会纳入的内容——一份针对合并基（merge base）的完整 diff。

### 在另一 worktree 上操作

`--branch` 对另一 worktree 的分支做 diff，无需离开当前 worktree：

```console
$ wt step diff --branch feature
```

该分支必须有一个已检出的 worktree。

### 额外的 git diff 参数

`--` 之后的参数会转发给 `git diff`：

```console
$ wt step diff -- --stat
$ wt step diff -- --name-only
$ wt step diff -- -- '*.rs'
```

diff 可以通过管道传给 `delta` 之类的工具：

```console
$ wt step diff | delta
```

### 命令参考

```text wt-command-reference
wt step diff - Show all changes since branching

Includes committed, staged, unstaged, and untracked files.

Usage: wt step diff [OPTIONS] [TARGET] [-- <EXTRA_ARGS>...]

Arguments:
  [TARGET]
          Target branch

          Defaults to default branch.

  [EXTRA_ARGS]...
          Extra arguments forwarded to git diff

Options:
  -b, --branch <BRANCH>
          Branch to operate on (defaults to current worktree)

  -h, --help
          Print help (see a summary with '-h')
```

## wt step copy-ignored

把 gitignored 文件复制到另一 worktree。通过复制构建缓存与依赖来消除冷启动。

### 设置

添加到项目配置：

```toml
# .config/wt.toml
[post-start]
copy = "wt step copy-ignored"
```

### 选择来源与目的地

默认从主 worktree 复制到当前 worktree——这正是 `post-start` 钩子所需的，因为钩子运行在新 worktree 里。`--from` 与 `--to` 按分支名指定任一端，因此从任何位置都能在两个 worktree 之间复制：

```console
$ wt step copy-ignored --from main --to feature   # between two named worktrees
$ wt step copy-ignored --from feature             # from feature into the current worktree
```

`--from` 或 `--to` 指定的分支必须已有 worktree。

### 复制哪些内容

默认复制全部 gitignored 文件，但内置排除的目录除外：VCS 元数据（`.bzr/`、`.hg/`、`.jj/`、`.pijul/`、`.sl/`、`.svn/`）、工具状态（`.conductor/`、`.entire/`、`.worktrees/`）以及嵌套 worktree。跟踪文件绝不会被触碰。文件发现会处理嵌套 `.gitignore` 文件、全局排除规则与 `.git/info/exclude`。目的地已存在的文件会被跳过，因此重复运行是安全的；`--force` 会覆盖它们。

要进一步限制复制范围，可创建 `.worktreeinclude`，写入 gitignore 风格的模式。文件必须**同时**满足 gitignored **且**列于 `.worktreeinclude`：

```text
# .worktreeinclude
.env
node_modules/
target/
```

在 `.worktreeinclude` 筛选出条目之后，还可以在用户配置、按项目的用户覆盖或项目配置中添加更多 gitignore 风格的排除规则：

```toml
# ~/.config/worktrunk/config.toml
[step.copy-ignored]
exclude = [".cache/", ".turbo/"]
```

若希望没有 `.worktreeinclude` 就什么都不复制——与桌面版 Claude Code 的行为一致，那里必须有该文件——请传入 `--require-include`：

```console
$ wt step copy-ignored --require-include
```

没有 `.worktreeinclude` 时，该命令不做任何事（会报告什么都没复制及原因）。有该文件时，只有匹配的文件按上述规则复制。要在所有仓库统一应用，可把该选项放进用户配置的钩子：`post-start = "wt step copy-ignored --require-include"`。

### 常见模式

| 类型 | 模式 |
|------|----------|
| 依赖 | `node_modules/`, `.venv/`, `target/`, `vendor/`, `Pods/` |
| 构建缓存 | `.cache/`, `.next/`, `.parcel-cache/`, `.turbo/` |
| 生成产物 | 对 git 而言过大的图片、ML 模型与二进制文件 |
| 环境文件 | `.env`（若并非按 worktree 生成） |

### 写时复制（copy-on-write）

在文件系统支持的地方会以 reflink 方式复制：APFS（macOS）、btrfs 与 XFS（Linux）、ReFS（Windows）。reflink 副本共享源的磁盘块，直到一方写入。以 14GB 的 `target/` 目录为例：

| 命令 | 耗时 | 磁盘 |
|---------|------|------|
| `cp -R` (full copy) | 2m | 14GB |
| `cp -Rc` / `wt step copy-ignored` | 20s | ~0 |

在不支持 reflink 的 ext4 与 NTFS 上，每个文件都完整复制；摘要会显示 `(reflinked, no extra disk)` 或 `(full copy)`。

reflink 按文件进行（类似 `cp -Rc`），因此复制时间随文件数量增长。

使用 `post-start` 钩子可让复制在后台运行。若后续钩子或 `--execute` 命令需要立即用到复制来的文件，请改用 `pre-start`。

### 各语言注意事项

#### Rust

`target/` 目录非常庞大（常达 1-10GB）。reflink 复制能复用已编译的依赖，把首次构建从约 68 秒缩短到约 3 秒。

#### Node.js

`node_modules/` 体积大但基本是静态内容。如果项目没有原生依赖，符号链接甚至更快：

```toml
# .config/wt.toml
[pre-start]
deps = "ln -sf {{ primary_worktree_path }}/node_modules ."
```

#### Python

虚拟环境包含绝对路径，无法复制。改用 `uv sync` 即可——它足够快，复制并不划算。

### 与桌面版 Claude Code 的行为差异

`.worktreeinclude` 模式与[桌面版 Claude Code](https://code.claude.com/docs/en/desktop) 共享，后者在创建 worktree 时复制匹配的文件。差异在于：

- worktrunk 默认复制全部 gitignored 文件；Claude Code 则要求 `.worktreeinclude`。传入 `--require-include` 即可与 Claude Code 保持一致（没有 `.worktreeinclude` 时不复制任何内容）
- worktrunk 以可配置钩子的形式参与 worktree 生命周期

### 命令参考

```text wt-command-reference
wt step copy-ignored - Copy gitignored files to another worktree

Eliminates cold starts by copying build caches and dependencies.

Usage: wt step copy-ignored [OPTIONS]

Options:
      --from <FROM>
          Source worktree branch

          Defaults to primary worktree.

      --to <TO>
          Destination worktree branch

          Defaults to current worktree.

      --dry-run
          Show what would be copied

      --force
          Overwrite existing files in destination

      --require-include
          Require .worktreeinclude to copy anything

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the copy completes.

          [default: text]
          [possible values: text, json]
```

## wt step eval

对模板表达式求值。结果打印到 stdout，供脚本与 shell 替换使用。

全部[钩子模板变量与过滤器](/hook/#模板变量)均可用。

### 示例

获取当前分支的端口：

```console
$ wt step eval '{{ branch | hash_port }}'
16066
```

用于 shell 替换：

```console
$ curl http://localhost:$(wt step eval '{{ branch | hash_port }}')/health
```

组合多个值：

```console
$ wt step eval '{{ branch | hash_port }},{{ ("supabase-api-" ~ branch) | hash_port }}'
16066,16739
```

使用条件与过滤器：

```console
$ wt step eval '{{ branch | sanitize_db }}'
feature_auth_oauth2_a1b
```

用 `-v` 列出可用的模板变量（与展开结果一起，输出在 stderr）。真实输出会打印作用域内的每个变量；此处为节选：

```console
$ wt step eval -v '{{ branch }}'
○ eval template variables:
  branch                = feature/auth
  worktree_path         = /home/user/code/myproject.feature-auth
  …
  cwd                   = /home/user/code/myproject.feature-auth
○ eval source
  {{ branch }}
○ eval result
  feature/auth

feature/auth
```

### 命令参考

```text wt-command-reference
wt step eval - Evaluate a template expression

Prints the result to stdout for use in scripts and shell substitutions.

Usage: wt step eval [OPTIONS] <TEMPLATE>

Arguments:
  <TEMPLATE>
          Template expression to evaluate

Options:
  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints {name, template, result} to stdout instead of the bare result.

          [default: text]
          [possible values: text, json]
```

## wt step for-each

在每个 worktree 中运行命令。顺序执行并实时输出；命令失败后继续。

结束时显示成功与失败的摘要。上下文 JSON——一个包含全部模板变量的扁平对象——会通过 stdin 提供，供需要结构化数据的脚本使用。

### 参数

`--` 之后的参数是程序及其参数——直接运行，不经过 shell。

```console
$ wt step for-each -- git status --short
$ wt step for-each -- npm install
```

需要管道、重定向、变量或通配符时，用 `sh -c` 包裹：

```console
$ wt step for-each -- sh -c 'git status | wc -l'
$ wt step for-each -- sh -c 'echo $HOME && git pull'
```

### 模板变量

变量会在 exec 之前替换进每个 argv 元素。完整清单与过滤器参见 [`wt hook` 模板变量](/hook/#模板变量)。

```console
$ wt step for-each -- echo 'Branch: {{ branch }}'
```

每个元素在各个 worktree 中都会重新展开，因此 `{{ branch }}` 就是该 worktree 的分支。包裹 for-each 的别名会在更早的阶段——即调用方的 worktree 中——渲染模板；[嵌套模板](/extending/#嵌套模板)介绍了如何让变量保持按 worktree 展开。

### 示例

在有上游的 worktree 中拉取更新（其余跳过）：

```console
$ git fetch --prune && wt step for-each -- sh -c '[ "$(git rev-parse @{u} 2>/dev/null)" ] || exit 0; git pull --autostash'
```

### 命令参考

```text wt-command-reference
wt step for-each - Run command in each worktree

Executes sequentially with real-time output; continues past command failures.

Usage: wt step for-each [OPTIONS] -- <ARGS>...

Arguments:
  <ARGS>...
          Command template (see --help for all variables)

Options:
      --format <FORMAT>
          Output format

          [default: text]
          [possible values: text, json]

  -h, --help
          Print help (see a summary with '-h')
```

## wt step promote

<span class="badge-experimental"></span>

把分支换入主 worktree。在两个 worktree 之间交换分支与 gitignored 文件。

**实验性功能**。当主 worktree 具有特殊意义（Docker Compose、IDE 配置、锚定在项目根目录的重型构建产物），而钩子和工具尚未配置到能在任意 worktree 上运行时，可用 promote 做临时测试。Worktrunk 的惯用工作流并不使用 `promote`；每个 worktree 都应有完整环境。`promote` 是 Worktrunk 中唯一会改动现有 worktree 所持分支的命令。

### 示例

```console
# from ~/project (main worktree)
$ wt step promote feature
```

之前：

```
  Branch   Path
@ main     ~/project
+ feature  ~/project.feature
```

之后：

```
  Branch   Path
@ feature  ~/project
+ main     ~/project.feature
```

恢复方式：在任意位置执行 `wt step promote main`，或在主 worktree 中直接执行 `wt step promote`。

不带参数时，promote 当前分支——若在主 worktree 中运行，则恢复默认分支。

### 前提条件

- 两个 worktree 都必须是干净的
- 该分支必须已有 worktree

### gitignored 文件

gitignored 文件（构建产物、`node_modules/`、`.env`）会随分支一起交换，使每个 worktree 保有属于自己分支的产物。文件发现机制与 [`copy-ignored`](#wt-step-copy-ignored) 相同，并可用 `.worktreeinclude` 过滤。

### 命令参考

```text wt-command-reference
wt step promote - [experimental] Swap a branch into the main worktree

Exchanges branches and gitignored files between two worktrees.

Usage: wt step promote [OPTIONS] [BRANCH]

Arguments:
  [BRANCH]
          Branch to promote to main worktree

          Defaults to current branch, or default branch from main worktree.

Options:
  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the promote completes. The mismatch warning
          still appears on stderr in JSON mode (safety signal).

          [default: text]
          [possible values: text, json]
```

## wt step prune

移除已合并进默认分支的 worktree 与分支。

批量移除已集成进默认分支的 worktree 与分支，判定标准与 `wt remove` 的分支清理一致。过期的 worktree 条目也会被清理，但 git 元数据中存有暂存变更或进行中操作的除外；后者仍可用 `git worktree repair` 恢复。

在 `wt list` 中，候选对象会标出 `_`（同一提交）或 `⊂`（内容已集成）。运行 `--dry-run` 可预览。完整的集成判定标准见 `wt remove --help`。

锁定的 worktree、有未提交变更的 worktree 以及主 worktree 始终跳过。当前 worktree 最后移除，并触发 cd 到主 worktree。每次移除都会运行 pre-remove 与 post-remove 钩子；若候选对象的钩子中包含未经批准的项目命令，则该候选被跳过并显示 `(approval required)`（可用 `wt config approvals add` 预先批准，或传入 `--yes`）。

prune 并发移除 worktree，因此写共享资源的钩子必须自行协调写入。

### 最小年龄防护

年龄小于 `--min-age`（默认 1 天）的候选会被跳过，这样刚从默认分支创建的 worktree 就不会因为看起来“已合并”（其分支指向同一提交）而被移除。worktree 的年龄取其创建时间；没有 worktree 的分支则取其 reflog 的时间。没有 reflog 的分支——在裸仓库中很常见——可能在 Git 维护或分支删除后显得再度“年轻”，从而在 `--min-age` 到期前一直被跳过。

```console
$ wt step prune --min-age=0s     # no age guard
$ wt step prune --min-age=2d     # skip candidates younger than 2 days
```

### JSON 输出

`--format=json` 会把每个候选对象的一个 JSON 对象打印到 stdout。实际运行报告 `branch_outcome`，与 [`wt remove`](/remove/#json-输出) 相同。`--dry-run` 则报告 `branch_deleted`（移除是否会删除分支）、`reason`（候选为何符合条件）与 `target`（衡量所参照的目标）。

### 示例

预览将要移除的内容：

```console
$ wt step prune --dry-run
```

移除所有已合并的 worktree：

```console
$ wt step prune
```

### 命令参考

```text wt-command-reference
wt step prune - Remove worktrees and branches merged into the default branch

Usage: wt step prune [OPTIONS]

Options:
      --dry-run
          Show what would be removed

      --min-age <MIN_AGE>
          Skip worktrees and branches younger than this

          [default: 1d]

      --foreground
          Run removal in foreground (block until complete)

      --format <FORMAT>
          Output format

          [default: text]
          [possible values: text, json]

  -h, --help
          Print help (see a summary with '-h')
```

## wt step relocate

<span class="badge-experimental"></span>

将 worktree 移动到预期路径。重新定位路径与 worktree 路径模板不符的 worktree。

### 示例

预览将要移动的内容：

```console
$ wt step relocate --dry-run
```

移动所有路径不符的 worktree：

```console
$ wt step relocate
```

自动提交并清走阻挡路径（绝不会失败）：

```console
$ wt step relocate --commit --clobber
```

移动指定的 worktree：

```console
$ wt step relocate feature bugfix
```

### 互换处理

当两个 worktree 正好位于彼此的预期位置（例如 `alpha` 位于 `repo.beta`，而 `beta` 位于 `repo.alpha`）时，relocate 会自动借助一个临时位置解决。

### 强制清障（clobber）

指定 `--clobber` 时，目标位置上不属于 worktree 的路径会在迁移前被移动到 `<path>.bak.<timestamp>`，且绝不覆盖已有的备份。

### 主 worktree 的行为

主 worktree 无法用 `git worktree move` 移动。relocate 的做法是把它切换到默认分支，再在预期路径创建一个新的链接 worktree。未跟踪与 gitignored 文件仍留在原位置。

### 脏 worktree

链接 worktree 会原样迁移——`git worktree move` 会把未提交变更一并带走。只有主 worktree 在脏的时候会被跳过（其 `git switch` 会拒绝），除非传入 `--commit`。

### 被跳过的 worktree

- **脏的主 worktree**（未传 `--commit`）——用 `--commit` 先自动提交
- **已锁定**——用 `git worktree unlock` 解锁
- **目标位置被占**（未传 `--clobber`）——用 `--clobber` 备份阻挡路径
- **脱离 HEAD**（detached HEAD）——没有分支可用于计算预期路径

### 命令参考

```text wt-command-reference
wt step relocate - [experimental] Move worktrees to expected paths

Relocates worktrees whose path doesn't match the worktree-path template.

Usage: wt step relocate [OPTIONS] [BRANCHES]...

Arguments:
  [BRANCHES]...
          Worktrees to relocate (defaults to all mismatched)

Options:
      --dry-run
          Show what would be moved

      --commit
          Commit uncommitted changes before relocating

      --clobber
          Backup non-worktree paths at target locations

          Moves blocking paths to <path>.bak.<timestamp>.

  -h, --help
          Print help (see a summary with '-h')

Automation:
      --format <FORMAT>
          Output format

          JSON prints structured result to stdout after the relocate completes.

          [default: text]
          [possible values: text, json]
```

## wt step tether

<span class="badge-experimental"></span>

运行一条命令；在其 worktree 被移除时杀掉整个进程树。清场自动完成，无需 pre-remove 钩子；进程组会先收到 SIGTERM，再收到 SIGKILL。

### 为什么需要

`pre-remove` 钩子只在 Worktrunk 移除 worktree 时运行。`tether` 则在其他工具移除 worktree 时也会停止命令。

### 参数

`--` 之后的参数是程序及其参数，直接运行，不经过 shell。

```console
$ wt step tether -- npm run dev
```

需要管道、重定向、变量或通配符时，用 `sh -c` 包裹：

```console
$ wt step tether -- sh -c 'PORT=$P npm run dev | tee dev.log'
```

要在子目录中运行命令，请传入全局选项 `-C`：

```console
$ wt step tether -C frontend -- npm run dev
```

### 示例

运行开发服务器，worktree 消失时自动拆解：

```toml
# .config/wt.toml
[post-start]
server = "wt step tether -- npm run dev -- --port {{ branch | hash_port }}"
```

### 命令参考

```text wt-command-reference
wt step tether - [experimental] Run a command; kill its whole process tree when its worktree is removed

Teardown is automatic and needs no pre-remove hook; the group gets SIGTERM then SIGKILL.

Usage: wt step tether [OPTIONS] -- <COMMAND>...

Arguments:
  <COMMAND>...
          Command to run (after --, run directly, no shell)

Options:
  -h, --help
          Print help (see a summary with '-h')
```

<!-- END AUTO-GENERATED -->
