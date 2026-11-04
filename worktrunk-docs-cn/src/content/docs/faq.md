---
title: "FAQ"
description: "关于 Worktrunk 的常见问题：与 git worktree 和分支切换的对比、裸仓库、TUI 支持等。"
sidebar:
  order: 26
---
## Worktrunk 与替代方案相比如何？

### 对比分支切换

分支切换只使用一个目录：一个 agent 的未提交更改会与下一个 agent 的工作混在一起，或者干脆让切换无法进行。worktree 让每个 agent 拥有自己的目录，文件和索引相互独立。

### 对比原生 `git worktree`

git 内置的 worktree 命令可用，但生命周期需要手动管理：

```console
# Plain git worktree workflow
$ git worktree add -b feature-auth ../myproject.feature-auth main
$ cd ../myproject.feature-auth
# ...work, commit, push...
$ cd ../myproject
$ git merge feature-auth
$ git worktree remove ../myproject.feature-auth
$ git branch -d feature-auth
```

Worktrunk 把整个生命周期自动化：

```console
$ wt switch --create feature-auth  # Creates worktree, runs setup hooks
# ...work...
$ wt merge                            # Merges into default branch, cleans up
```

无需 cd 回主仓库——`wt merge` 从功能 worktree 运行并合并进目标分支，就像 GitHub 的合并按钮。

`git worktree` 未提供的：

- 统一的目录命名与清理校验
- 项目级自动化（安装依赖、启动服务）
- 跨所有 worktree 的统一状态（提交、CI、冲突、更改）

### 对比 git-machete / git-town

定位不同：

- **git-machete**：单目录内的分支堆栈管理
- **git-town**：单目录内的 Git 工作流自动化
- **worktrunk**：带钩子与状态聚合的多 worktree 管理

这些工具可以搭配使用——在单个 worktree 内部运行 git-machete 或 git-town。

### 对比 Git TUI（lazygit、gh-dash 等）

Git TUI 只操作单个仓库。Worktrunk 管理多个 worktree、运行自动化钩子并聚合跨分支状态。TUI 在每个 worktree 目录内工作。

## worktree 占用多少磁盘空间？

多个 worktree 共享同一个 `.git`。每个 worktree 会多出一份被跟踪文件的检出，再加上你拷贝进去的、被 gitignore 的构建产物。

在 APFS、btrfs 和 XFS（不含 ext4 与 NTFS）上，[`wt step copy-ignored`](/step/#wt-step-copy-ignored--写时复制-copy-on-write) 会对这些产物建立 reflink，新 worktree 因此与主 worktree 共享磁盘块。之后的构建只重写有变化的部分，其余继续保持共享。

## Worktrunk 支持堆叠分支吗？

原生不支持——堆叠分支工作流的设计空间很大，所以 Worktrunk 把它当作扩展而非内置功能。[`worktrunk-sync`](https://github.com/pablspe/worktrunk-sync) 是一个社区工具，能从 git 历史自动检测分支依赖树，并按拓扑顺序把每个分支 rebase 到其父分支上。用 `cargo install worktrunk-sync` 安装，以 `wt sync` 运行（通过[自定义子命令](/extending/#自定义子命令)）。

## 如何把未提交的更改移到新 worktree？

把更改 stash 起来，创建 worktree，然后 pop：

```bash
git stash push -u           # -u also stashes untracked files
wt switch --create feature  # new branch off the default branch
git stash pop               # changes reappear in the new worktree
```

stash 存放在共享的 `.git` 目录中，因此从新 worktree 也能取到。原分支保持干净。

`wt switch --create` 基于默认分支创建新分支。若要改为基于当前提交，传入 `--base=@`（当前分支已有超出默认分支的提交时需要这么做）。

## 我的 shell 配置有问题

如果 Shell 集成不工作（自动 cd 没有发生、补全缺失、`wt` 未被识别为函数），请按 [Shell 集成](/shell-integration/#调试清单)的调试清单逐项排查——它覆盖 `wt switch` 打印的每一种警告，以及每种 shell 分别要检查什么。

或者交给 agent：在 Claude Code 中安装 [Worktrunk 插件](/claude-code/)，让它调试 Worktrunk 的 Shell 集成。它会运行 `wt config show`、检查 shell 配置文件并定位问题。

如果两者都没解决，请带上 `wt config show` 的输出、所用 shell（bash/zsh/fish）和操作系统[提交 issue](https://github.com/max-sixty/worktrunk/issues/new?title=Shell%20setup%20issue&body=%23%23%20Shell%20and%20OS%0A%0A-%20Shell%3A%20%0A-%20OS%3A%20%0A%0A%23%23%20Output%20of%20%60wt%20config%20show%60%0A%0A%60%60%60%0A%0A%60%60%60%0A%0A%23%23%20What%20Claude%20found%20%28if%20available%29%0A%0A)。（而且即使问题解决了，也欢迎提 issue：非标准的成功案例有助于确保 Worktrunk 对其他人也一样容易配置。）

## `-v` / `-vv` 是干什么的？

共三档详细程度，每一档都是上一档的超集。

| 级别 | Stderr | 文件（`.git/wt/logs/`） | 用途 |
|-------|--------|-------------------------|----------|
| （无） | 仅警告 | — | 日常使用 |
| `-v` | 增加 info 级：hook 输出、别名模板变量解析 | — | 调试钩子/别名 |
| `-vv` | 与 `-v` 相同 | 增加 `trace.log`、`trace.jsonl`、`subprocess.log`、`diagnostic.md` | 提交 bug 报告 |

带 `-vv` 时，stderr 会显示日志目录。文件格式见 [`wt config state logs`](/config/#wt-config-state-logs)。

`RUST_LOG` 一旦设置就会覆盖这些标志的基线（`RUST_LOG=debug wt -v` 会把 `-v` 提升为 stderr 上的 debug 级别）。

这些标志只作用于你手动键入的命令；shell 补全作为独立进程运行，没有地方传标志。设置 `WORKTRUNK_VERBOSE=0|1|2` 可把该级别应用到*每一次*调用，补全也不例外——它相当于 `-v`/`-vv` 的环境变量版本，因此级别 2 会写入同样的 `trace.log`/`trace.jsonl`/`subprocess.log`/`diagnostic.md` 文件。命令上显式给出的 `-v`/`-vv` 可以进一步提高级别，但绝不会降低这一基线。要剖析变慢的 Tab 补全，按 shell 实际调用的方式运行它——例如 `WORKTRUNK_VERBOSE=2 COMPLETE=fish wt -- wt switch ''`——再用 `wt config state logs profile` 渲染结果。

## Worktrunk 会创建哪些文件？

### 1. Worktree 目录

由 `wt switch <branch>` 在切换到尚无 worktree 的分支时创建。用 `wt switch --create <branch>` 可创建新分支。默认位置是 `../<repo>.<branch>`（与主 worktree 同级），可通过用户配置中的 `worktree-path` 调整。

**移除**：`wt remove <branch>` 移除 worktree 目录并删除分支。

### 2. 配置文件

| 文件 | 创建方式 | 用途 |
|------|------------|---------|
| `~/.config/worktrunk/config.toml` | `wt config create` | 用户偏好 |
| `~/.config/worktrunk/approvals.toml` | 审批项目命令时 | 已批准的 hook 与别名命令 |
| `~/.codex/worktrunk-commit-instructions.txt` | 首次运行时接受 Codex 提交设置 | 已保存的提交命令所用的最小化 Codex 指令 |
| `.config/wt.toml` | `wt config create --project` | 项目钩子（提交入仓库） |

用户配置位置：Linux/macOS 上为 `$XDG_CONFIG_HOME/worktrunk/`（或 `~/.config/worktrunk/`），Windows 上为 `%APPDATA%\worktrunk\`。

**移除**：直接删除即可。用户配置：`rm ~/.config/worktrunk/config.toml`。项目配置：`rm .config/wt.toml`（并提交）。Codex 指令：在更改或移除已保存的 Codex 提交命令之后再 `rm ~/.codex/worktrunk-commit-instructions.txt`。若先删文件，那条命令会失败。

### 3. Shell 集成

`wt config shell install` 会在 bash、zsh 和 PowerShell 的 rc 文件里追加一行，并为 fish 和 Nushell 整体写入 worktrunk 自己的 wrapper 与补全文件。每种 shell 各会得到哪个文件，见 [Shell 集成](/shell-integration/#创建的文件)。

**移除**：`wt config shell uninstall`。

### 4. `.git/` 中的元数据（自动）

Worktrunk 在 `.git/` 下存放仓库状态、缓存和日志：

| 位置 | 用途 | 创建者 |
|----------|---------|------------|
| `git config worktrunk.*` | 缓存的默认分支、切换历史、分支标记、自定义变量 | 多条命令 |
| `refs/wt-backup/<branch>` | [squash 备份](/step/#wt-step-squash--恢复已暂存的变更)；清除状态时保留 | `wt step squash`、`wt merge` |
| `.git/wt/cache/{kind}/*.json` | 缓存的 CI 状态、出现过的最大 PR/MR 号（决定 `wt list` CI 列的宽度），以及 git 命令结果（merge-tree、集成分支探测、diff 统计、祖先检查、领先/落后计数、合并基） | `wt list`、`wt merge`、`wt remove` |
| `.git/wt/cache/summary/{branch}/{hash}.json` | 缓存的 LLM 分支摘要，按 diff 哈希做内容寻址 | `wt list --full`、`wt switch`（当 `[list] summary = true` 时） |
| `.git/wt/cache/picker-preview/*.json` | 交互式选择器的渲染后预览面板 | `wt switch` |
| `.git/wt/logs/{branch}/**/*.log` | 后台 hook 输出（按分支嵌套存放） | 钩子、后台 `wt remove` |
| `.git/wt/logs/commands.jsonl` | 命令审计日志（上限约 2MB） | 钩子、LLM 命令 |
| `.git/wt/logs/trace.log` | 供报告 issue 的人类可读调试追踪 | 以 `-vv` 运行时 |
| `.git/wt/logs/trace.jsonl` | 机器可读追踪（每条记录一个 JSON 对象） | 以 `-vv` 运行时 |
| `.git/wt/logs/subprocess.log` | 未截断的原始子进程 stdout/stderr（可能达数 MB） | 以 `-vv` 运行时 |
| `.git/wt/logs/diagnostic.md` | 供报告 issue 的诊断报告（以性能剖析开头） | 以 `-vv` 运行时 |
| `.git/wt/trash/<name>-<timestamp>` | 移入待删、等待后台删除的 worktree 内容 | `wt remove` |
| `.git/wt/trash.lock` | 后台回收站删除的锁 | `wt remove` |

这些内容都不被 git 跟踪，也不会推送到远程。

**移除**：`wt config state clear` 清除仓库状态：配置键、缓存、标记、提示、变量、日志与过期回收站。除非传入 `--yes`，否则删除任何 worktrunk 无法重新生成的内容前都会先询问。

### 5. Agent 集成

由 `wt config plugins <agent>` 的 install 命令创建。它们都写在 worktrunk 自己的配置目录之外、写进 agent 的目录：

| 文件 | 创建方式 | 用途 |
|------|------------|---------|
| `~/.config/opencode/plugins/worktrunk.ts` | `wt config plugins opencode install` | `wt list` 中的活动标记；通过 `wt` 操作 OpenCode 2 的 worktree |
| `~/.pi/agent/extensions/worktrunk.ts` | `wt config plugins pi install` | `wt list` 中的活动标记 |
| `~/.omp/agent/hooks/pre/worktrunk.ts` | `wt config plugins omp install` | `wt list` 中的活动标记 |
| `~/.claude/settings.json` | `wt config plugins claude install-statusline` | 添加一条运行 `wt list statusline --format=claude-code` 的 `statusLine` 条目 |

OpenCode 的路径依次取 `$OPENCODE_CONFIG_DIR` > `$XDG_CONFIG_HOME/opencode` > `~/.config/opencode`；Pi 的路径取 `$PI_CODING_AGENT_DIR`；oh-my-pi 的路径取 `$PI_CONFIG_DIR`、`$OMP_PROFILE`/`$PI_PROFILE` 与 `$PI_CODING_AGENT_DIR`；Claude Code 的取 `$CLAUDE_CONFIG_DIR`。三个插件文件属于 worktrunk 自己，因此 install 会整体写入（uninstall 也整体删除）。`settings.json` 属于 Claude Code，install 只把 `statusLine` 键合并进去，其余内容不动。

`wt config plugins claude install` 与 `wt config plugins codex install` 本身不写任何文件——它们调用 `claude` / `codex` 注册插件市场并安装插件，由各 CLI 记录到自己的配置（`~/.claude/plugins/`、`~/.codex/config.toml`）。

**移除**：`wt config plugins opencode uninstall`、`wt config plugins pi uninstall` 与 `wt config plugins omp uninstall` 删除各自的插件文件。`wt config plugins claude uninstall` / `codex uninstall` 通过对应 CLI 移除插件与插件市场。statusline 条目则通过编辑 `settings.json` 移除。

### 6. 临时文件（自动）

Worktrunk 会创建名为 `$TMPDIR/worktrunk-temp-index-*` 的临时 Git 索引副本。`wt list`、`wt list statusline`、`wt step diff`、`wt step commit --dry-run` 和 `wt switch` 用它们检查暂存区或工作区状态，而不改动真正的索引。`wt list` 还会创建 `$TMPDIR/worktrunk-list-objects-*` 目录，使其合并探测不会给仓库添加不可达对象。当系统临时目录不可用时，两者都回退到 Git 的元数据：`worktrunk-list-objects-*` 放在 Git 公共目录下，`worktrunk-temp-index-*` 放在该 worktree 的 Git 目录下。正常退出会删除这些文件和目录。之后创建临时索引的命令会回收超过一小时的索引副本及其锁文件；被中断进程留下的对象目录可能仍需手动清理。

### Worktrunk 不会创建什么

- 除上述六类位置外不创建任何文件：`.git/`、worktrunk 的配置目录、worktree 目录、第 3 节的 shell 启动文件与 wrapper 路径、第 5 节的 agent 配置路径（仅当你运行 `wt config plugins` 的 install 时），以及系统临时目录
- 不安装全局 git 钩子
- 不修改 `~/.gitconfig`
- 不运行长期驻留的后台进程或守护进程

## Worktrunk 能删除什么？

Worktrunk 能删除 **worktree** 和 **分支**。两者都有防护机制。

### Worktree 移除

`wt remove` 与 `git worktree remove` 行为一致：拒绝移除带有未提交更改的 worktree（已暂存、已修改或未跟踪的文件）。`--force` 标志会照常移除 worktree，丢弃所有这些更改。

当注册路径上的目录里装的已不是注册在那里的 worktree 时——比如 worktree 删除后又在那里克隆了仓库，或同一仓库的另一个 worktree 被移到了该路径——移除同样会拒绝，加 `--force` 也不例外。`--force` 豁免的是未提交更改，不是对目录内容的检查，`git worktree remove` 对这些情况同样拒绝。

要让一个 worktree 彻底免于移除（比如里面存有本地数据库），可以锁定它：

```bash
git worktree lock ../myproject.feature-auth --reason "Contains local database"
```

锁定的 worktree 在 `wt list` 中显示 `⊞`。无论是 `git worktree remove`，还是 Worktrunk 的任何移除路径——`wt remove` 或 `wt merge`——都不会删除它们，加 `--force` 也不行。用 `git worktree unlock` 解锁。

### 分支删除

默认情况下，`wt remove` 只删除内容已并入默认分支的分支。在 `wt list` 中显示 `_`（同一提交、干净）或 `⊂`（已集成）的分支可以放心删除。

完整算法见[分支清理](/remove/#分支清理)——它能处理提交历史不同但文件改动一致的 squash 合并与 rebase 工作流。

用 `-D` 强制删除含未合并更改的分支。用 `--no-delete-branch` 则无论状态如何都保留分支。

在另一个 worktree 中检出的分支则始终保留，`-D` 也不例外。删除它会使那个 worktree 无法解析 `HEAD`；只有 `git worktree add --force` 才会造成这种状态。

删除分支还会清除它的[标记](/config/#wt-config-state-marker)，之后同名的分支将不带标记开始。

### 其他清理

- `wt merge` / `wt step push`——目标分支上检出的 worktree 会更新到合并的提交，因此这些提交删除的文件会从中消失，位于其跟踪路径上的被忽略文件则会被覆盖——与在该 worktree 中运行 `git merge` 的结果相同。合并不触及的路径上的未提交更改原样保留，无论是否已暂存；位于合并触及路径上的那处更改则会让合并当场拒绝，并指明该文件
- `wt remove` / `wt step prune`——删除过期 worktree（`wt list` 中的 `⊟`）的 `.git/worktrees/<id>` 条目将其注销，做法与 `git worktree prune` 相同，但只针对该 worktree。其目录中仍存在的文件会保留。若某条目的索引中存有已暂存的更改，或正处于 rebase、合并等操作中途，则保留该条目，除非 `wt remove --force` 指名它——因为 `git worktree repair` 只有在条目存在时才能恢复它
- `wt remove`——还会停止被移除 worktree 的 `git fsmonitor--daemon`（在 `core.fsmonitor=true` 下），并继续删除此前被中断的移除留下的 `.git/wt/trash/` 条目，以及 worktree 已不存在的 fsmonitor 守护进程
- `wt config state clear`——清除配置键、缓存、标记、提示、变量、日志与过期回收站
- `wt config shell install`——整体替换已有的 fish 或 Nushell wrapper 文件，并删除旧版本装在旧位置的此类文件（fish 的 `conf.d/wt.fish`、Nushell 的 `<config-dir>/vendor/autoload/wt.nu`），每次删除都会打印；每种 shell 各会得到哪个文件，见[创建的文件](/shell-integration/#创建的文件)
- `wt config shell uninstall`——从 bash/zsh/PowerShell 的 rc 文件中移除可识别的初始化行，并删除带 worktrunk 内容标记的 wrapper 与补全文件（fish 的 `functions/`、`conf.d/`、`completions/`；Nushell 的 `vendor/autoload`）。被自行修改过的初始化行必须手动移除。每一行被移除的行都会打印出来
- `wt config plugins opencode uninstall` / `wt config plugins pi uninstall` / `wt config plugins omp uninstall`——删除该 agent 的 `worktrunk.ts` 插件文件。只动 worktrunk 自己的文件，agent 插件目录的其余部分不受影响

详情见 [Worktrunk 会创建哪些文件？](#worktrunk-会创建哪些文件)。

## Worktrunk 会执行哪些命令？

Worktrunk 在内部运行 `git` 命令，并可选运行 forge CLI（`gh`、`glab`、`tea` 或 `az`）获取 CI 状态。除此之外，用户定义的命令在四种上下文中执行：

1. **用户钩子**（`~/.config/worktrunk/config.toml`）——对所有仓库生效的个人自动化
2. **项目钩子**（`.config/wt.toml`）——针对单个仓库的自动化
3. **LLM 命令**（`~/.config/worktrunk/config.toml`）——提交信息生成与[分支摘要](/llm-commits/#分支摘要)
4. **--execute 标志**——显式提供的命令

用户钩子与用户别名无需审批（它们是你自己定义的）。来自项目钩子与项目别名的命令在首次运行时需要审批。批准的命令保存到审批文件（`approvals.toml`）。命令一旦变更，Worktrunk 会要求重新审批。

### 审批提示示例

```console
▲ repo needs approval to execute 3 commands:

○ pre-start install:
  npm ci
○ pre-start build:
  cargo build --release
○ pre-start env:
  echo 'PORT={{ branch | hash_port }}' > .env.local

❯ Allow and remember? [y/N]
```

用 `--yes` 跳过提示（对 CI/自动化场景有用）。

### 命令日志

所有钩子执行与 LLM 命令都记录在 `.git/wt/logs/commands.jsonl` 中，每行一个 JSON 对象；字段列表见 [`wt config state logs`](/config/#wt-config-state-logs)。

用 `wt config state logs get` 查看日志，也可以直接查询：

```console
# Recent commands
$ tail -5 .git/wt/logs/commands.jsonl | jq .

# Failed commands
$ jq 'select(.exit != 0 and .exit != null)' .git/wt/logs/commands.jsonl
```

用 `wt config state logs clear` 清除。

## Worktrunk 在 Windows 上能用吗？

能用。核心命令、Shell 集成与 Tab 补全在 Git Bash 和 PowerShell 中都能工作。安装细节（包括如何避开 Windows Terminal 的 `wt` 冲突）见[安装](/#安装)。

**必须安装 Git for Windows**——钩子使用 bash 语法并经由 Git Bash 执行，因此即使交互 shell 是 PowerShell，也必须安装 [Git for Windows](https://gitforwindows.org/)。

`wt switch` 的交互式选择器在 Windows 上同样可用。

## Worktrunk 如何确定默认分支？

Worktrunk 先查本地 git 缓存，必要时查询远程，没有远程时回退到本地推断。

如果远程的默认分支变了（比如从 master 改名为 main），用 `wt config state default-branch clear` 清除缓存。

检测机制的完整细节见 `wt config state default-branch --help`。

## 我的 `for-each` 或 `--execute` 别名在每个 worktree 里输出相同的值

别名主体在分发时渲染了一次，在嵌套的 `wt` 命令迭代之前，变量就被固化成了发起调用的 worktree 的值。如何让模板原样传递而不渲染，见[嵌套模板](/extending/#嵌套模板)。

## 需要哪些系统依赖？

Worktrunk 需要 Git 2.43 或更新版本。

用 Cargo 按默认特性安装时，还需要一个 C99 编译器来支持 bash 语法高亮。若 tree-sitter 或 C 编译失败（C99 模式、`le16toh` 未定义），可去掉语法高亮安装：

```bash
cargo install worktrunk --no-default-features --features cli
```

这会禁用命令输出中的 bash 语法高亮，但保留全部核心功能。

## 如何参与贡献？

见 README 中的[参与贡献](https://github.com/max-sixty/worktrunk#contributing)——反馈方式、分享链接与如何运行测试套件。
