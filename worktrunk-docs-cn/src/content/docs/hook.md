---
title: "wt hook"
description: "运行已配置的钩子。"
sidebar:
  order: 17
---
<!-- ⚠️ AUTO-GENERATED from `wt hook --help-page` — edit src/cli/mod.rs to update -->

运行已配置的钩子。

钩子（hook）是在 worktree 生命周期关键节点上运行的 shell 命令——在 `wt switch`、`wt merge` 与 `wt remove` 期间自动触发，也可通过 `wt hook <type>` 按需运行。用户钩子与项目钩子均受支持。

# 钩子类型

| 事件 | `pre-`——阻塞式 | `post-`——后台式 |
|-------|-------------------|---------------------|
| **switch** | `pre-switch` | `post-switch` |
| **create** | `pre-start` | `post-start` |
| **commit** | `pre-commit` | `post-commit` |
| **merge** | `pre-merge` | `post-merge` |
| **remove** | `pre-remove` | `post-remove` |

`pre-*` 钩子会阻塞——一旦失败即中止操作。`post-*` 钩子在后台运行并记录输出（用 [`wt config state logs`](/config/#wt-config-state-logs) 查找和管理日志文件）；改用 `wt hook <type> --foreground` 则让单个钩子内联运行，输出直接进入终端。加 `-v` 可查看后台钩子的模板变量；`wt hook <type> --dry-run` 可预览命令。

最常用的创建钩子是 `post-start`——它在不阻塞 worktree 创建的前提下运行后台任务（开发服务器、文件复制、构建）。除非后续步骤需要先完成这些工作，否则优先用 `post-start` 而非 `pre-start`。

| 钩子 | 用途 |
|------|---------|
| `pre-switch` | 切换前在源 worktree 中运行——涵盖新建、切换到已有、或留在当前 worktree |
| `post-switch` | 在所有切换结果上都触发：新建、切换到已有、或留在当前 |
| `pre-start` | 新 worktree 创建时运行一次，阻塞 `post-start`/`--execute` 直至完成：依赖安装、env 文件生成 |
| `post-start` | 新 worktree 创建时在后台运行一次：开发服务器、长构建、文件监视器、复制缓存 |
| `pre-commit` | 格式化器、linter、类型检查——在任何 Worktrunk 提交之前运行（`wt step commit`、`wt step squash`，以及 `wt merge` 产生的提交） |
| `post-commit` | CI 触发、通知、后台 lint |
| `pre-merge` | 测试、安全扫描、构建校验——在 rebase 之后、合并到目标分支之前运行 |
| `post-merge` | 部署、通知、安装更新后的二进制。若目标分支的 worktree 存在则在其中运行，否则在主 worktree 中运行 |
| `pre-remove` | worktree 删除前的清理：保存测试产物、备份状态。在被删除的 worktree 中运行 |
| `post-remove` | 停止开发服务器、移除容器、通知外部系统。模板变量指向被删除的 worktree |

在 `wt merge` 期间，阻塞式钩子按此顺序运行：pre-commit → pre-merge → pre-remove。合并一结束，各 `post-*` 钩子便同时启动。完整流水线见 [`wt merge`](/merge/#流水线)。

# 安全

项目命令在首次运行时需要批准：

```
▲ repo needs approval to execute 3 commands:

○ pre-start install:
   npm ci
○ pre-start build:
   cargo build --release
○ pre-start env:
   echo 'PORT={{ branch | hash_port }}' > .env.local

❯ Allow and remember? [y/N]
```

- 批准结果保存到 `~/.config/worktrunk/approvals.toml`
- 命令一旦变更，需重新批准
- 拒绝会跳过该操作的全部项目命令——包括已批准的——并在没有它们的情况下继续；已保存的批准不受影响
- 用 `--yes` 跳过批准提示——适合 CI 与自动化
- 用 `--no-hooks` 跳过钩子——运行钩子的那些命令（`wt switch`、`wt merge`、`wt remove`、`wt step commit`、`wt step squash`）接受该选项，`wt hook` 不接受

用 `wt config approvals add` 与 `wt config approvals clear` 管理批准。

# 配置

钩子可定义在项目配置（`.config/wt.toml`）或用户配置（`~/.config/worktrunk/config.toml`）中，两者格式相同。项目配置从运行命令的 worktree 中读取。

## 钩子形式

钩子有三种形式，由其 TOML 结构决定。

字符串形式就是单条命令：

```toml
# .config/wt.toml
pre-start = "npm install"
```

表（table）形式为命令命名。有多个键时，命令并发运行：

```toml
# .config/wt.toml
[post-start]
server = "npm run dev"
watch = "npm run watch"
```

流水线形式是一串按顺序运行的 `[[hook]]` 块。每个块是一个步骤；块内的多个键并发运行。某步失败会中止流水线的其余部分：

```toml
# .config/wt.toml
[[post-start]]
install = "npm ci"

[[post-start]]
build = "npm run build"
server = "npm run dev"
```

上例中 `install` 先运行，随后 `build` 与 `server` 一起运行。

模板在流水线启动前做语法检查，并在每个步骤运行时渲染，因此某一步可以存入[按分支变量](/config/#wt-config-state-vars)，供后续步骤通过 `{{ vars.<key> }}` 读取。也正因如此，预览（`wt hook <type> --dry-run`、`wt hook show --expanded`）不会展开 `{{ vars.* }}` 引用。

大多数钩子不需要 `[[hook]]` 块。存在依赖链时才用——典型场景是必须先完成的准备工作，比如在并发运行构建与开发服务器之前先安装依赖。

## 项目钩子与用户钩子

| 方面 | 项目钩子 | 用户钩子 |
|--------|--------------|------------|
| 位置 | `.config/wt.toml` | `~/.config/worktrunk/config.toml` |
| 作用域 | 单个仓库 | 所有仓库（或[按项目](/config/#用户的项目专属设置)） |
| 批准 | 需要 | 不需要 |
| 执行顺序 | `pre-*`：在用户钩子之后。`post-*`：与用户钩子并行 | `pre-*`：先运行。`post-*`：与项目钩子并行 |

当用户与项目定义了同名钩子、只想运行其中某一个时，使用 `user:name` 或 `project:name` 语法。

对 `pre-*` 钩子，用户钩子失败会跳过项目钩子。对 `post-*` 钩子，一侧失败不会停止另一侧。并发钩子在写同一文件或于同一 worktree 中运行 Git 时可能发生竞态。相互依赖的命令应在同一来源内使用有序的 `[[hook]]` 块。

## 模板变量

钩子可以使用在运行时展开的模板变量：

| 类别 | 变量 | 说明 |
|------|----------|-------------|
| active    | `{{ branch }}`                | 分支名；脱离的 worktree 中未设置 |
|           | `{{ worktree_path }}`         | worktree 路径 |
|           | `{{ worktree_name }}`         | worktree 目录名 |
|           | `{{ commit }}`                | 分支 HEAD SHA |
|           | `{{ short_commit }}`          | 分支 HEAD SHA，按 `core.abbrev` 缩短 |
|           | `{{ upstream }}`              | 分支上游（若在跟踪远程） |
| operation | `{{ base }}`                  | 基础分支名（仅 switch/create） |
|           | `{{ base_worktree_path }}`    | 基础 worktree 路径 |
|           | `{{ target }}`                | 目标分支名 |
|           | `{{ target_worktree_path }}`  | 目标 worktree 路径（当目标有 worktree 时） |
|           | `{{ pr_number }}`             | PR/MR 编号（switch 与 create 钩子；通过 `pr:N` / `mr:N` 切换时） |
|           | `{{ pr_url }}`                | PR/MR 网页 URL（switch 与 create 钩子；通过 `pr:N` / `mr:N` 切换时） |
| repo      | `{{ repo }}`                  | 仓库目录名 |
|           | `{{ repo_path }}`             | 仓库根目录绝对路径 |
|           | `{{ owner }}`                 | 主远程 owner 路径（可能含子组） |
|           | `{{ remote_repo }}`           | 主远程 URL 中的仓库名，不含 `.git` |
|           | `{{ primary_worktree_path }}` | 主 worktree 路径 |
|           | `{{ default_branch }}`        | 默认分支名 |
|           | `{{ remote }}`                | 主远程名 |
|           | `{{ remote_url }}`            | 远程 URL |
| exec      | `{{ cwd }}`                   | 钩子命令运行的目录 |
|           | `{{ hook_type }}`             | 正在运行的钩子类型（如 `pre-start`、`pre-merge`） |
|           | `{{ hook_name }}`             | 钩子命令名（若已命名） |
|           | `{{ args }}`                  | 从 CLI 转发来的 token——见[手动运行钩子](#手动运行钩子) |
| user      | `{{ vars.<key> }}`            | 来自 [`wt config state vars`](/config/#wt-config-state-vars) 的按分支变量 |

`repo` 类变量（`repo`、`repo_path`、`owner`、`remote_repo`、`primary_worktree_path`、`default_branch`、`remote`、`remote_url`）在整个仓库内不变——`default_branch` 在每个 worktree 中都相同。`active` 类变量（`branch`、`worktree_path`、`worktree_name`、`commit`、`short_commit`、`upstream`）则随 worktree 而异。

裸变量（`branch`、`worktree_path`、`commit`）指向操作所作用的分支：switch/create 指向目的地，merge/remove 指向来源。`base` 与 `target` 给出另一侧：

| 操作 | 裸变量 | `base` | `target` |
|-----------|-----------|--------|----------|
| switch/create | 目的地 | 你从哪里来 | = 裸变量 |
| commit（merge/squash 期间） | 被 squash 的 worktree | = 裸变量 | 集成目标 |
| merge | 正在合并的 feature 分支 | = 裸变量 | 合并目标 |
| remove | 正在删除的分支 | = 裸变量 | 你最终所在之处 |

所有钩子共享同一视角——`{{ branch | hash_port }}` 在 `post-start` 与 `post-remove` 中产生相同端口。

`cwd` 是钩子命令运行的 worktree 根目录。除以下三种情况外，它等于 `worktree_path`：

- `pre-switch`：钩子在源 worktree 中运行；`worktree_path` 是目的地，当切换创建了新 worktree 时则是源（想在新 worktree 中工作请用 `pre-start`）
- `post-remove`：活动 worktree 已被删除，因此钩子在主 worktree 中运行
- `post-merge`：钩子在目标分支的 worktree 中运行（若目标没有 worktree，则在主 worktree 中运行）

未定义的变量会报错——可选行为请用条件语句或默认值：

```toml
# .config/wt.toml
[pre-start]
# Rebase onto upstream if tracking a remote branch (e.g., wt switch --create feature --base origin/feature)
sync = "{% if upstream %}git fetch && git rebase {{ upstream }}{% endif %}"
```

脱离的 worktree 没有分支，因此 `branch`——以及指向该 worktree 的 `base` 或 `target`——在那里未定义；请用 `{% if branch %}` 做保护。

运行任何会触发钩子的命令时加 `-v`，即可看到本次实际调用解析后的变量——每个钩子都会打印一个 `template variables:` 块，列出作用域内的全部变量及其值（未填充的条件变量显示为 `(unset)`，如 `wt switch -` 期间的 `target_worktree_path`）。别名在 `-v` 下同样如此：`wt -v <alias>` 会在流水线运行前打印该别名作用域内的变量。

变量支持点访问，缺失的键可用 `default` 过滤器。JSON 对象/数组值会被自动解析，因此当值为 `{"port": 3000}` 时，`{{ vars.config.port }}` 可用：

```toml
# .config/wt.toml
[post-start]
dev = "ENV={{ vars.env | default('development') }} npm start -- --port {{ vars.config.port | default('3000') }}"
```

`tojson` 过滤器把整个对象或数组渲染成 JSON，适合接收 JSON 输入的命令：

```toml
# .config/wt.toml
[post-start]
seed = "curl -X POST localhost:3000/seed -d {{ vars.config | tojson }}"
```

模板表达不了的逻辑应放进脚本，所需值以参数传入：

```toml
# .config/wt.toml
[post-start]
setup = "python3 scripts/post-start-setup.py {{ branch }} {{ repo }}"
```

```python
# scripts/post-start-setup.py
import subprocess, sys
branch, repo = sys.argv[1], sys.argv[2]
if branch.startswith('feature/') and 'backend' in repo:
    subprocess.run(['make', 'seed-db'])
```

## Worktrunk 过滤器

模板支持用于变换值的 Jinja2 过滤器：

| 过滤器 | 示例 | 说明 |
|--------|---------|-------------|
| `sanitize` | `{{ branch \| sanitize }}` | 把 `/` 与 `\` 替换为 `-` |
| `sanitize_db` | `{{ branch \| sanitize_db }}` | 带哈希后缀的数据库安全标识符（`[a-z0-9_]`，最长 48 字符） |
| `sanitize_hash` | `{{ branch \| sanitize_hash }}` | 带哈希后缀保证唯一性的文件系统安全名称 |
| `hash` | `{{ branch \| hash }}` | 输入的 3 字符 base36 摘要 |
| `hash_port` | `{{ branch \| hash_port }}` | 哈希到 10000-19999 范围的端口 |
| `dirname` | `{{ repo_path \| dirname }}` | 去掉最后一段路径（`/a/b/c` → `/a/b`） |
| `basename` | `{{ repo_path \| basename }}` | 只保留最后一段路径（`/a/b/c` → `c`） |
| `codename(n)` | `{{ branch \| codename(2) }}` | 确定性的友好词组 |

`sanitize_db` 过滤器生成数据库安全的标识符——小写字母、数字与下划线，不以数字开头，并附加 3 字符哈希后缀以避免冲突与保留字。`sanitize_hash` 过滤器生成文件系统安全的名称，当清理改变了输入时附加 3 字符哈希后缀，因此不同的原始输入永不冲突——本已安全的名称原样通过。`codename(n)` 过滤器从输入字符串生成确定性的友好名称：`codename(1)` 返回一个名词，`codename(2)` 返回“形容词-名词”，更大的 n 会追加更多形容词。词池很大（`codename(2)` 约 126 万种组合），因此通常直接单独用作 worktree 叶子名——[`worktree-path` 配方](/config/#worktree-路径模板)展示了它单独使用与放在以分支名命名的父目录之下两种用法。

`hash` 过滤器是裸的 3 字符 base36 摘要，适合在输出预算紧张时（例如 Unix 套接字路径上限 107 字节）自行组合“截断加防冲突”的配方：

```toml
# ~/.config/worktrunk/config.toml
# Truncated branch slug + hash: collisions remain disambiguated even when prefixes match
worktree-path = "/tmp/{{ (branch | sanitize)[:20] }}_{{ branch | sanitize | hash }}"
```

`dirname` 与 `basename` 过滤器用于遍历路径。它们对位于 `myproject/.git` 这类隐藏目录中的裸仓库很有用，此时 `{{ repo }}` 会解析为 `.git`：

```toml
# ~/.config/worktrunk/config.toml
# Place worktrees as siblings of the bare repo, named `<wrapper>.<branch>`
worktree-path = "{{ repo_path }}/../{{ repo_path | dirname | basename }}.{{ branch | sanitize }}"
```

`hash_port` 过滤器适合让每个 worktree 的开发服务器跑在唯一端口上：

```toml
# .config/wt.toml
[post-start]
dev = "npm run dev -- --host {{ branch }}.localhost --port {{ branch | hash_port }}"
```

可对任意字符串做哈希，包括拼接串：

```toml
# .config/wt.toml
# Unique port per repo+branch combination
[post-start]
dev = "npm run dev --port {{ (repo ~ '-' ~ branch) | hash_port }}"
```

变量会自动做 shell 转义——`{{ ... }}` 外面不必加引号，加了反而可能因特殊字符出问题。

## Worktrunk 函数

模板还支持用于动态查找的函数：

| 函数 | 示例 | 说明 |
|----------|---------|-------------|
| `worktree_path_of_branch(branch)` | `{{ worktree_path_of_branch("main") }}` | 查找某分支 worktree 的路径 |
| `expected_worktree_path_of_branch(branch)` | `{{ expected_worktree_path_of_branch("feature") }}` | `wt switch` 预期该分支 worktree 所在的路径 |

`worktree_path_of_branch` 函数根据分支名返回对应 worktree 的文件系统路径；若该分支没有 worktree，则返回空字符串。这便于引用其他 worktree 中的文件：

```toml
# .config/wt.toml
[pre-start]
# Copy config from main worktree
setup = "cp {{ worktree_path_of_branch('main') }}/config.local {{ worktree_path }}"
```

`expected_worktree_path_of_branch` 函数返回 `wt switch --create` 为某分支会使用的路径，无论那里是否已有 worktree。与 `worktree_path_of_branch` 不同，即使该处的 worktree 已切换到其他分支，它仍返回那个路径。例如，下面这条命令会切换到 `feature` 路径上的 worktree，不管它现在持有哪个分支：

```bash
wt switch "$(wt step eval "{{ expected_worktree_path_of_branch('feature') }}")"
```

## 交互式钩子

钩子命令会继承 wt 的 stdin，因此只要它在前台运行、身旁没有其他命令，就可以进行交互提问。并发运行的命令——比如多键表中的各个键——拿到的是空 stdin；后台运行的 `post-*` 钩子，以及 `wt step prune` 同时为多个 worktree 运行的钩子，拿到的也是空 stdin。下面这条 `pre-start` 钩子会在信任 worktree 之前先询问：

```toml
# .config/wt.toml
[pre-start]
trust = "gum confirm 'trust this worktree?' && mise trust"
```

## 复制未跟踪文件

Git 的各个 worktree 共享仓库，但不共享未跟踪文件。[`wt step copy-ignored`](/step/#wt-step-copy-ignored) 可在 worktree 之间复制被 gitignore 的文件：

```toml
# .config/wt.toml
[post-start]
copy = "wt step copy-ignored"
```

# 手动运行钩子

`wt hook <type>` 按需运行钩子——适合开发期间测试、在 CI 流水线中运行，或失败后重跑。

```console
$ wt hook pre-merge              # Run all pre-merge hooks
$ wt hook pre-merge test         # Run hooks named "test" from both sources
$ wt hook pre-merge test build   # Run hooks named "test" and "build"
$ wt hook pre-merge user:        # Run all user hooks
$ wt hook pre-merge project:     # Run all project hooks
$ wt hook pre-merge user:test    # Run only user's "test" hook
$ wt hook pre-merge --yes        # Skip approval prompts (for CI)
$ wt hook pre-start --branch=feature/test    # Override a template variable
$ wt hook pre-merge -- --extra args     # Forward tokens into {{ args }}
```

`user:` 与 `project:` 前缀按来源筛选。单独用 `user:` 或 `project:` 运行该来源的全部钩子；用 `user:name` / `project:name` 则只运行某个特定钩子。

```console
$ wt hook pre-merge
◎ Running pre-merge project:test
  cargo test
    Finished test [unoptimized + debuginfo] target(s) in 0.12s
     Running unittests src/lib.rs (target/debug/deps/worktrunk-abc123)

running 18 tests
test auth::tests::test_jwt_decode ... ok
test auth::tests::test_jwt_encode ... ok
test auth::tests::test_token_refresh ... ok
test auth::tests::test_token_validation ... ok

test result: ok. 18 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.08s
◎ Running pre-merge project:lint
  cargo clippy
    Checking worktrunk v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 1.23s
```

```console
$ wt hook post-start
◎ Running post-start: project @ ~/acme
```

## 传值

只要任何被选中的钩子命令里出现 `{{ KEY }}`，`--KEY=VALUE` 就会绑定 `KEY`——这与 `wt <alias>` 使用的智能路由规则相同。内建变量可被覆盖：`--branch=foo` 会设置钩子模板内的 `{{ branch }}`（worktree 的实际分支不会动）。键中的连字符会转为下划线：`--my-var=x` 设置的是 `{{ my_var }}`。

若某个 `--KEY=VALUE` 的键没有被任何选中的钩子模板引用，它会作为字面 `--KEY=VALUE` token 转发进 `{{ args }}`。`--` 之后的 token 同样原样转发进 `{{ args }}`。`{{ args }}` 渲染为以空格连接、经 shell 转义的字符串；用 `{{ args[0] }}` 做索引，用 `{% for a in args %}…{% endfor %}` 做循环，用 `{{ args | length }}` 计数。

# 配方

- [消除冷启动](/tips-patterns/#消除冷启动)：`post-start` 中的 `wt step copy-ignored` 共享构建缓存与依赖；当后续钩子依赖这次复制时，改用 `[[post-start]]` 流水线
- [每个 worktree 一个开发服务器](/tips-patterns/#每个-worktree-一个开发服务器)：`post-start` 中的 `wt step tether` 运行开发服务器，并在 worktree 被删除时杀掉其整个进程组，还可选启用子域名路由
- [每个 worktree 一个数据库](/tips-patterns/#每个-worktree-一个数据库)：`post-start` 流水线把容器名、端口与连接串存为[按分支变量](/config/#wt-config-state-vars)，供后续钩子引用
- [渐进式校验](/tips-patterns/#渐进式校验)：快速的 lint/类型检查放 `pre-commit`，昂贵的测试与构建放 `pre-merge`
- [按目标分支区分的钩子](/tips-patterns/#按目标分支区分的钩子)：在 `post-merge` 中按 `{{ target }}` 分流，实现按环境部署

## 另请参阅

- [`wt merge`](/merge/)——合并期间自动运行钩子
- [`wt switch`](/switch/)——在 `--create` 时运行 pre-start/post-start 钩子
- [`wt config approvals`](/config/#wt-config-approvals)——管理批准
- [`wt config state logs`](/config/#wt-config-state-logs)——访问后台钩子日志

## 命令参考

```text wt-command-reference
wt hook - Run configured hooks

Usage: wt hook [OPTIONS] <COMMAND>

Commands:
  show         Show configured hooks
  pre-switch   Run pre-switch hooks
  post-switch  Run post-switch hooks
  pre-start    Run pre-start hooks
  post-start   Run post-start hooks
  pre-commit   Run pre-commit hooks
  post-commit  Run post-commit hooks
  pre-merge    Run pre-merge hooks
  post-merge   Run post-merge hooks
  pre-remove   Run pre-remove hooks
  post-remove  Run post-remove hooks

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

<!-- END AUTO-GENERATED -->
