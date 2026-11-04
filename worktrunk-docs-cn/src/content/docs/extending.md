---
title: "扩展 Worktrunk"
description: "添加自定义行为的三种方式：用于生命周期自动化的钩子、用于复用命令的别名，以及用于独立工具的自定义子命令。"
sidebar:
  order: 22
---
| | [钩子](#钩子) | [别名](#别名) | [自定义子命令](#自定义子命令) |
|---|---|---|---|
| **触发方式** | 自动（生命周期事件） | 手动（`wt <name>`） | 手动（`wt <name>`） |
| **定义位置** | TOML 配置 | TOML 配置 | `PATH` 上的任意可执行文件 |
| **模板变量** | 支持 | 支持 | 不支持 |
| **随仓库共享** | `.config/wt.toml` | `.config/wt.toml` | 分发二进制文件 |
| **语言** | Shell 命令 | Shell 命令 | 任意 |

钩子和别名写在同一份 TOML 配置中，共用同一套[模板引擎](/hook/#模板变量)。用户配置默认受信任；项目配置首次运行时需要批准。当两者定义了同名条目时，两个都会运行（用户配置先运行）。

## 钩子

十个钩子覆盖五个生命周期事件——switch、start、commit、merge、remove——每个事件各配一个阻塞式的 `pre-` 变体（失败则中止操作）和一个后台运行的 `post-` 变体。[`wt hook`](/hook/#钩子类型) 页给出了每个钩子的触发时机与典型用途。

```toml
# .config/wt.toml
[pre-start]
deps = "npm ci"

[post-start]
server = "npm run dev -- --port {{ branch | hash_port }}"

[pre-merge]
test = "npm test"
```

完整参考与内置配方（每个 worktree 独立的开发服务器、每个 worktree 独立的数据库、渐进式校验）见 [`wt hook`](/hook/)。[技巧与模式](/tips-patterns/) 页中还有更多内容。

## 别名

别名配置在 `[aliases]` 之下，写在项目配置或用户配置里均可：

```toml
# .config/wt.toml
[aliases]
deploy = "fly deploy --config=fly.{{ env }}.toml --app=myproject-{{ branch }}"
open = "open http://localhost:{{ branch | hash_port }}"
since-main = "git log --oneline {{ default_branch }}..HEAD"
```

```bash
wt deploy --env=staging
wt open
```

`wt <name>` 的解析顺序是：先找内置命令，再找别名，最后才是[自定义子命令](#自定义子命令)。

### 模板

别名使用[与钩子相同的模板引擎](/hook/#模板变量)：变量、[过滤器](/hook/#worktrunk-过滤器)、[函数](/hook/#worktrunk-函数)，以及 [`--KEY=VALUE` 智能路由](/hook/#传值)（模板引用了 `KEY` 就绑定，否则转发给 `{{ args }}`）。例如，`wt deploy --env=staging` 会设置 `{{ env }}`。

别名模板额外提供 `{{ args }}`，用于接收 CLI 位置参数。操作上下文变量（`target`、`base`、`pr_number`）不会自动填充，但仍可用 `--KEY=VALUE` 绑定。

### 位置参数

`{{ args }}` 会渲染成以空格连接、经过 shell 转义的字符串，可直接拼接进命令：

```toml
# ~/.config/worktrunk/config.toml
[aliases]
s = "wt switch {{ args }}"
```

```bash
wt s some-branch
wt s feature/api
wt s 'has a space'
```

索引（`{{ args[0] }}`）、循环与计数的用法见 [传递值](/hook/#传值)。

`--` 之后的 token 无条件转发，绕过所有绑定。即使模板引用了 `{{ branch }}`，写成 `wt deploy -- --branch=foo` 也会把字面量 `--branch=foo` 转发给 `{{ args }}`。

把 `{{ args }}` 转发给 `wt` 命令的别名——如 `co = "wt switch {{ args }}"` 或 `cm = "wt step commit {{ args }}"`——会继承该命令的参数与选项补全，因此 `wt co <Tab>` 补全分支的方式与 `wt switch <Tab>` 完全一致。

### 查看与预览

- `wt config alias show <name>` 打印模板。
- `wt config alias dry-run <name> [-- args...]` 打印渲染后的命令。

```bash
wt config alias show deploy
wt config alias dry-run deploy
wt config alias dry-run deploy -- --env=staging
```

### 多步流水线

`[[aliases.NAME]]` 用[与钩子相同的 `[[block]]` 语义](/hook/#钩子形式)定义一条流水线：块按顺序执行，块内的键并发执行，某一步失败则中止其余步骤。

```toml
# .config/wt.toml
[[aliases.release]]
test = "cargo test"

[[aliases.release]]
build = "cargo build --release"
package = "cargo package --no-verify"

[[aliases.release]]
publish = "cargo publish {{ args }}"
```

每个步骤看到的 `{{ args }}` 和已绑定的变量都相同。`wt release -- --dry-run` 会把 `--dry-run` 转发给 `publish`，而不影响之前的步骤。

### 切换目录

即使从别名中调用，`wt switch`、`wt merge`（当它离开被移除的源 worktree 时）以及对当前 worktree 执行的 `wt remove` 也会改变父 shell 的目录；Worktrunk 的 Shell 集成会把这次变更传递出去。其他 shell 状态不会保留：别名运行在子 shell 里，`cd`、`export` 等命令只影响该子 shell。

### 嵌套模板

调用 `wt` 命令的别名，可能想把一个模板传给该命令去展开——比如每个 worktree 自己的分支，或 `wt switch` 即将创建的那个 worktree：

```toml
# ~/.config/worktrunk/config.toml
[aliases]
show-branches = "wt step for-each -- echo '{% raw %}{{ branch }}{% endraw %}'"
echo-target = "wt switch {{ args }} --no-cd --execute echo -- '{% raw %}{{ worktree_path }}{% endraw %}'"
```

别名主体在分发时只渲染一次，因此裸写的 `{{ branch }}` 到达嵌套命令时，已解析为发起调用的 worktree 的分支。`{% raw %}…{% endraw %}` 则让它未经渲染原样传递。记得加引号——被延迟的文本含有空格，而别名主体是一行 shell 命令。

`{{ default_branch }}` 这类仓库级变量在每个 worktree 中都相同，因此无需延迟。

### 配方：把每个 worktree rebase 到其上游

```toml
# ~/.config/worktrunk/config.toml
[aliases]
up = '''
git fetch --all --prune; wt step for-each -- sh -c '
  git rev-parse --verify -q @{u} >/dev/null || exit 0
  g=$(git rev-parse --git-dir)
  rebasing() { test -d "$g/rebase-merge" || test -d "$g/rebase-apply"; }
  rebasing && exit 0
  git diff --quiet HEAD || { git merge --ff-only --no-autostash @{u}; exit 0; }
  git rebase @{u} --no-autostash || { rebasing || exit 0; git rebase --abort; }
''''
```

`wt up` 先 fetch 所有远程，再让每个 worktree 与其上游同步：没有上游或 rebase 已在进行中则跳过；有已跟踪文件被修改或已暂存则 fast-forward；否则执行 rebase，冲突时中止。它 rebase 到的是 git 原生的 `@{u}` 而非 `{{ … }}` 模板，因此由 git 解析每个 worktree 自己的上游，也就没有什么需要延迟的。

`--no-autostash` 会覆盖全局的 `rebase.autostash` 或 `merge.autostash`——后者的 pop 一旦遇到冲突，会留下冲突标记却仍以退出码 0 结束。

### 配方：把进行中的改动移动或复制到新 worktree

`wt switch --create` 会把你带进一个干净的 worktree。若想把已暂存、未暂存和未跟踪的改动一并带走，可以配合 `git stash`：

```toml
# .config/wt.toml
[aliases]
move-changes = '''
if git diff --quiet HEAD && test -z "$(git ls-files --others --exclude-standard)"; then
  wt switch --create {{ to }} --execute sh -- -c \
    'if [ "$#" -gt 0 ]; then exec "$@"; fi' worktrunk-move {{ args }}
else
  git stash push --include-untracked --quiet || exit
  wt switch --create {{ to }} --execute sh -- -c \
    'git stash pop --index || exit; if [ "$#" -gt 0 ]; then exec "$@"; fi' worktrunk-move {{ args }}
fi
'''
```

用 `wt move-changes --to=feature-xyz` 运行。没有任何进行中的改动时，守卫条件会跳过 stash；否则 `git stash push` 捕获全部改动，由显式的 `sh -c` 步骤在新 worktree 中 pop 出来，暂存/未暂存的划分原样保留。`--` 之后的任何内容都会作为 argv 转发，并在 pop 之后于新 worktree 中运行。例如，`wt move-changes --to=feature-xyz -- claude` 就会在那里打开 Claude。

若要复制而不是移动，在 push 之后紧接着加一条 `git stash apply --index --quiet` 即可。

### 配方：跟踪特定钩子的日志

`wt config state logs --format=json` 输出结构化条目（`branch`、`source`、`hook_type`、`name`、`path`）。用管道接 `jq` 解析出其中一条，再包成别名以便快速访问：

```toml
# ~/.config/worktrunk/config.toml
[aliases]
hook-log = '''
tail -f "$(wt config state logs --format=json | jq -r --arg branch {{ branch }} --arg name {{ name | sanitize_hash }} --arg kind {{ kind }} '
  .hook_output[]
  | select([.branch, .hook_type, .name] == [$branch, $kind, $name])
  | .path
' | head -1)"
'''
```

用 `wt hook-log --kind=post-start --name=server` 即可跟踪当前分支上 `server` 钩子的日志。`--kind` 选择钩子类型；分支经 `{{ branch }}` 取自当前 worktree。JSON 中的 `branch` 是分支名本身，而 `name` 是钩子在磁盘上呈现的名称；`sanitize_hash` 对 `{{ name }}` 施加同样的变换，因此即使钩子名含有 `/` 之类的字符，别名也能解析到正确的日志。

## 自定义子命令

<span class="badge-experimental"></span>

`PATH` 上任何名为 `wt-<name>` 的可执行文件都会以 `wt <name>` 的形式可用，这与 git 使用 `git-foo` 的模式相同。内置命令和[别名](#别名)优先。

```bash
wt sync origin              # runs: wt-sync origin
wt -C /tmp/repo sync        # -C is forwarded as the child's working directory
```

参数逐字透传，stdio 被继承，子进程的退出码原样向外传播。

### 示例

- [`worktrunk-sync`](https://github.com/pablospe/worktrunk-sync)：按从 git 历史推断出的依赖顺序，rebase 堆叠的 worktree 分支。用 `cargo install worktrunk-sync` 安装，然后以 `wt sync` 运行。
- [`workz`](https://github.com/rohansx/workz)：为当前 worktree 配好一段不会冲突的端口区间，外加专属的数据库和 Docker Compose 项目，并合并进 `.env.local`，使并行的 worktree 互不冲突。用 `cargo install workz` 安装，把它的 [`wt-workz`](https://github.com/rohansx/workz/blob/main/examples/wt-workz) 适配器放到 `PATH` 上，然后以 `wt workz` 运行。
- [`wt-tui`](https://github.com/marcusjihansson/worktrunk-tui)：一个纵览所有 worktree 的终端仪表盘，支持实时更新、跨 worktree 搜索，以及 diff 和日志预览；创建、合并、移除和清理操作在确认对话框之后经 `wt` 执行。用 `cargo install --git https://github.com/marcusjihansson/worktrunk-tui` 安装，然后以 `wt tui` 运行。

## 参考：钩子与别名的差异

除以下差异外，钩子和别名的行为完全相同。

<details>
<summary>接口差异</summary>

| 维度 | 钩子 | 别名 |
|------|-------|---------|
| 调用方式 | `wt hook <type> [args...]`（嵌套在 `hook` 内置命令之下） | `wt <name> [args...]`（顶层） |
| 裸位置参数 | 过滤器名称（`wt hook pre-merge test build` 只运行 `test` 和 `build`） | 转发给 `{{ args }}` |
| 从位置参数进入 `{{ args }}` | 必须用 `--`（`wt hook pre-merge -- extra`） | 任何裸位置参数都会落入其中 |
| 跳过批准的标志 | 支持子命令后的 `--yes` / `-y`（`wt hook pre-merge --yes`） | 只有全局形式（`wt -y <alias>`）；别名后的 `--yes` 会落入 `{{ args }}` |
| 来源区分 | `user:` / `project:` / `user:name` / `project:name` 过滤器语法 | 先运行用户配置，再运行项目配置；无过滤器语法 |
| `--help` | `wt hook --help` 列出钩子类型；`wt hook <type> --help` 显示该类型的选项与参数 | 模板主体即是文档：`wt <alias> --help` 会重定向到 `wt config alias show` / `dry-run`。`wt --help` 和 `wt step --help` 会把已配置的别名与内置命令一并列出 |
| 查看方式 | `wt hook show [type] [--expanded]` | `wt config alias show <name>` / `wt config alias dry-run <name>` |
| 标准输入 | 单独在前台运行的命令继承 wt 的 stdin；并发与后台命令拿到空 stdin（[交互式钩子](/hook/#交互式钩子)） | 单独运行的命令继承 wt 的 stdin；并发命令拿到空 stdin |
| 模板上下文的额外变量 | `hook_type`、`hook_name`，以及各类型专属的操作变量（`base`、`target`、`pr_number` 等） | 在共享的基础变量之上另有 `args` |

</details>
