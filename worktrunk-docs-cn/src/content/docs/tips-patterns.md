---
title: "技巧与模式"
description: "Worktrunk 工作流的实用配方：仓库布局、别名与钩子、按 worktree 划分的开发服务器与数据库、agent 交接，以及分支状态。"
sidebar:
  order: 24
---
常见 Worktrunk 工作流的实用配方。

## 设置与布局

### 新建 worktree 并启动 agent 的 shell 别名

一条命令创建 worktree 并启动 Claude：

```bash
alias wsc='wt switch --create --execute=claude'
wsc new-feature                       # Creates worktree, runs hooks, launches Claude
wsc feature -- 'Fix GH #322'          # Runs `claude 'Fix GH #322'`
```

### 快捷参数

特殊参数在所有命令中通用——完整列表见 [`wt switch`](/switch/#快捷方式)。

```bash
wt switch --create hotfix --base=@       # Branch from current HEAD
wt switch -                              # Switch to previous worktree
wt remove @                              # Remove current worktree
```

### 堆叠分支

从当前 HEAD 而非默认分支创建分支：

```bash
wt switch --create feature-part2 --base=@
```

### 复用 `default-branch`

默认分支[检测](/config/#wt-config-state-default-branch)让脚本在任何仓库都能直接工作——无需硬编码 `main` 或 `master`：

```bash
git rebase $(wt config state default-branch)
```

在钩子与别名中，同一个值是 `{{ default_branch }}` [模板变量](/hook/#模板变量)；这条命令留给纯 shell 脚本使用。

### 为单个克隆覆盖 `default-branch`

当集成分支与远程的 `HEAD` 不一致时，设置[克隆级覆盖](/config/#wt-config-state-default-branch)：

```bash
wt config state default-branch set integration
```

### 裸仓库布局

[裸仓库（bare repository）](https://git-scm.com/docs/gitrepository-layout)没有工作区，因此所有分支——包括默认分支——都是路径平等的[链接 worktree](https://git-scm.com/docs/git-worktree)，没有任何分支享有特殊地位。

把裸仓库克隆到 `<project>/.git`，即可让所有 worktree 归入同一个目录：

```bash
git clone --bare <url> myproject/.git
cd myproject
git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
git fetch origin
git remote set-head origin --auto
```

fetch refspec 会创建 `origin/main` 这样的远程跟踪分支；`git remote set-head` 则记录远程的默认分支。

配置 `worktree-path = "{{ repo_path }}/../{{ branch | sanitize }}"` 后，各 worktree 成为 `myproject/` 的子目录：

```
myproject/
├── .git/       # bare repository
├── main/       # default branch worktree
├── feature/    # feature branch worktree
└── bugfix/     # bugfix branch worktree
```

#### 配置 worktree 路径

在位于隐藏路径（`.git`、`.bare`）的裸仓库里首次运行 `wt switch` 时，worktrunk 会检测到默认模板将生成 `myproject/.git.main` 这类坏路径，并主动给出修复选项：

```
▲ Bare repo at myproject/.git — worktrees will be at myproject/.git.main
◎ Configure worktree-path to place worktrees at myproject/main? [y/N/?]
```

接受后会向用户配置写入一条项目级条目：

```toml
# ~/.config/worktrunk/config.toml
[projects."github.com/myorg/myrepo"]
worktree-path = "{{ repo_path }}/../{{ branch | sanitize }}"
```

在任意 worktree 内运行 `wt config show`，即可找到项目标识（PROJECT CONFIG 部分的 `Identifier: …`）。如果希望所有裸仓库都采用这种布局，可在顶层用 `worktree-path = "..."` 全局设置。

#### 创建第一个 worktree

```bash
wt switch main
```

刚克隆的裸仓库中默认分支已经存在，因此 `wt switch main`（不带 `--create`）就够了。新建分支则用 `wt switch --create <branch>`。

此后 `wt switch --create feature` 就会创建 `myproject/feature/`。

#### 设置项目配置

项目配置（`.config/wt.toml`）必须位于某个 worktree 内——裸 `.git` 目录没有跟踪文件。第一个 worktree 建好后，从中创建它：

```bash
wt switch main
wt config create --project
```

提交该文件后，它会自动出现在每个 worktree 中。

## 别名与钩子

### `wt` 别名

结合模板过滤器与 [vars](/tips-patterns/#分支级变量) 来组合：

```toml
# .config/wt.toml
[aliases]
# Open this worktree's dev server
open = "open http://localhost:{{ branch | hash_port }}"

# Test with branch-specific features from vars
test = "cargo test --features {{ vars.features | default('default') }}"

# Switch via the interactive picker, print the chosen branch
pick = "wt switch --format=json | jq -r '.branch'"
```

作用域、审批与完整参考见[别名](/extending/#别名)。

### 分支级变量

`wt config state vars` 按分支保存状态，可从模板（`{{ vars.key }}`）与 CLI 访问。常见用法：

- **在流水线各步骤之间协调状态**——完整配方见下文[每个 worktree 一个数据库](/tips-patterns/#每个-worktree-一个数据库)
- **把分支固定到某个环境**——`wt config state vars set env=staging`，然后在钩子里用 `{{ vars.env | default('dev') }}`
- **按分支参数化别名**——见上文 [`wt` 别名](/tips-patterns/#wt-别名)

存储格式、JSON 支持与完整参考见 [`wt config state vars`](/config/#wt-config-state-vars)。

### 钩子中的任务运行器

在钩子中引用 Taskfile/Justfile/Makefile：

```toml
# .config/wt.toml
[pre-start]
"setup" = "task install"

[pre-merge]
"validate" = "just test lint"
```

### 渐进式校验

把检查拆分到不同钩子类型——每次提交前快速反馈，合并前再跑耗时的套件：

```toml
# .config/wt.toml
[[pre-commit]]
lint = "npm run lint"
typecheck = "npm run typecheck"

[[pre-merge]]
test = "npm test"
build = "npm run build"
```

`pre-commit` 在 `wt merge` 期间、squash 提交之前运行；`pre-merge` 在每次合并的 rebase 之后运行一次，因此适合放慢速测试。

### 按目标分支区分的钩子

根据 `{{ target }}` 分流，即可按合并目标改变行为——例如从 `main` 部署到生产环境、从发布分支部署到 staging：

```toml
# .config/wt.toml
post-merge = """
if [ {{ target }} = main ]; then
    npm run deploy:production
elif [ {{ target }} = staging ]; then
    npm run deploy:staging
fi
"""
```

`{{ target }}` 是合并的目标分支。`post-merge` 在目标分支的 worktree 中运行（目标没有 worktree 时则在主 worktree 运行），因此部署命令看到的是已合并的代码。

## 按 worktree 划分的服务

### 每个 worktree 一个开发服务器

每个 worktree 在一个确定性端口上运行自己的开发服务器。`hash_port` 过滤器从分支名生成稳定端口（10000-19999）：

```toml
# .config/wt.toml
[post-start]
server = "wt step tether -- npm run dev -- --port {{ branch | hash_port }}"

[list]
url = "http://localhost:{{ branch | hash_port }}"
```

[`wt step tether`](/step/#wt-step-tether) 在独立进程组中运行服务器，并在移除 worktree 时一并终止整个进程组，因此无需 `pre-remove` 钩子。完整缘由与平台行为见 [`wt step tether`](/step/#wt-step-tether) 文档。

`wt list` 的 URL 列显示每个 worktree 的开发服务器：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__list__tips_dev_server_workflow.snap — edit source to update -->

```console
$ wt list
  Branch       Status      HEAD±     main↕    main…±    Remote⇅  URL                     Commit
@ main           ? ^⇅      +5                            ⇡1  ⇣1  http://localhost:12107  41ee083
+ feature-api  +   ↕⇡     +54   -5   ↑4  ↓1  +234  -24   ⇡3      http://localhost:10703  6814f02
+ fix-auth         ↕|                ↑2  ↓1   +25  -11     |     http://localhost:16460  b772e68
+ fix-typos        _|                                      |     http://localhost:14301  41ee083

○ Showing 4 worktrees, 2 with changes, 2 ahead, hidden: Path, Age, Message
```

<!-- END AUTO-GENERATED -->

无论在哪台机器上，`fix-auth` 拿到的都是 16460 端口。服务器未运行时 URL 会显示为暗色。

### 每个 worktree 一个数据库

每个 worktree 都可以拥有独立的数据库。流水线先把名称与端口存为 [vars](/config/#wt-config-state-vars)，后续步骤与钩子再引用它们：

```toml
# .config/wt.toml
[[post-start]]
set-vars = """
wt config state vars set container='{{ repo }}-{{ branch | sanitize }}-postgres' &&
wt config state vars set port='{{ ('db-' ~ branch) | hash_port }}' &&
wt config state vars set db-url='postgres://postgres:dev@localhost:{{ ('db-' ~ branch) | hash_port }}/{{ branch | sanitize_db }}'
"""

[[post-start]]
db = """
docker run -d --rm \
  --name {{ vars.container }} \
  -p {{ vars.port }}:5432 \
  -e POSTGRES_DB={{ branch | sanitize_db }} \
  -e POSTGRES_PASSWORD=dev \
  postgres:16
"""

[pre-remove]
db-stop = "docker stop {{ vars.container }} 2>/dev/null || true"
```

流水线第一步从分支名推导出取值并存为 vars。第二步引用 `{{ vars.container }}` 与 `{{ vars.port }}`——模板在每一步运行时才渲染，此时 vars 已就位。`pre-remove` 读取同样的 vars 来停止容器。

`('db-' ~ branch)` 拼接串的哈希结果与单纯的 `branch` 不同，因此数据库端口与开发服务器端口不会冲突。`sanitize_db` 过滤器生成数据库安全的标识符（小写、下划线、不以数字开头，并带短哈希后缀）。

连接串随处可用——不限于钩子：

```bash
DATABASE_URL=$(wt config state vars get db-url) npm start
```

### 每个 worktree 的环境变量

要把环境变量限定在某个 worktree 内——工具的包路径、某个 profile、某个 API 端点——可以使用 [direnv](https://direnv.net) 或 [mise](https://mise.jdx.dev) 这类目录级环境管理器。两者都挂在 shell 提示符上，因此会在 `wt switch` 已经执行的那次 `cd` 时自动激活——无需任何 worktrunk 配置。把配置提交到仓库根目录，每个 worktree 就各有自己的一份副本，路径相对各自 worktree 解析。

**direnv**——在仓库根目录提交 `.envrc`：

```sh
# .envrc
export MY_PACKAGES_PATH="$(expand_path .packages)"
```

在每个 worktree 中运行一次 `direnv allow` 以信任该文件（[入门指南](https://direnv.net/#getting-started)）。此后切入 worktree 时加载环境变量，切出时卸载。

**mise**——在仓库根目录提交 `mise.toml`：

```toml
# mise.toml
[env]
MY_PACKAGES_PATH = "{{ config_root }}/.packages"
```

`{{ config_root }}` 是 mise 解析相对路径所依据的项目根（[env 指令](https://mise.jdx.dev/environments/)）——即当前 worktree 的根，而非主 worktree。mise 还覆盖 Windows / PowerShell，direnv 原生并不支持。

两者都在 shell 会话中设置真实的环境变量，因此所有子进程都会继承——钩子、构建工具、子 shell。每个新 worktree 都是一条新路径，因此需要各自的一次性信任步骤（`direnv allow` / `mise trust`）。

### 消除冷启动

用 [`wt step copy-ignored`](/step/#wt-step-copy-ignored) 在 worktree 之间复制被 gitignore 的文件（缓存、依赖、`.env`）：

```toml
# .config/wt.toml
[post-start]
copy = "wt step copy-ignored"
```

当另一个钩子依赖这次复制时——例如在 `pnpm install` 之前先复制 `node_modules/`，让安装复用缓存的包——用 `[[post-start]]` 流水线编排先后顺序：

```toml
# .config/wt.toml
[[post-start]]
copy = "wt step copy-ignored"

[[post-start]]
install = "pnpm install"
```

若 `--execute` 命令需要立即用到复制过来的文件，则改用 `pre-start`。

默认复制所有被 gitignore 的文件。要限制复制范围，可创建带匹配模式的 `.worktreeinclude`——文件必须既被 gitignore 又被列出。详见 [`wt step copy-ignored`](/step/#wt-step-copy-ignored)。

### 用 Caddy 做子域名路由

<!-- Hand-tested 2026-03-07 -->

得到 `http://feature-auth.myproject.localhost` 这样不带端口号的干净 URL。对 cookie、CORS 以及对齐生产环境 URL 结构都很有用。

**前置条件**：[Caddy](https://caddyserver.com/docs/install)（`brew install caddy`）

```toml
# .config/wt.toml
[post-start]
server = "wt step tether -- npm run dev -- --port {{ branch | hash_port }}"
proxy = """
  curl -sf --max-time 0.5 http://localhost:2019/config/ || caddy start
  curl -sf http://localhost:2019/config/apps/http/servers/wt || \
    curl -sfX PUT http://localhost:2019/config/apps/http/servers/wt -H 'Content-Type: application/json' \
      -d '{"listen":[":8080"],"automatic_https":{"disable":true},"routes":[]}'
  curl -sf -X DELETE http://localhost:2019/id/wt:{{ repo }}:{{ branch | sanitize }} || true
  curl -sfX PUT http://localhost:2019/config/apps/http/servers/wt/routes/0 -H 'Content-Type: application/json' \
    -d '{"@id":"wt:{{ repo }}:{{ branch | sanitize }}","match":[{"host":["{{ branch | sanitize }}.{{ repo }}.localhost"]}],"handle":[{"handler":"reverse_proxy","upstreams":[{"dial":"127.0.0.1:{{ branch | hash_port }}"}]}]}'
"""

[pre-remove]
proxy = "curl -sf -X DELETE http://localhost:2019/id/wt:{{ repo }}:{{ branch | sanitize }} || true"

[list]
url = "http://{{ branch | sanitize }}.{{ repo }}.localhost:8080"
```

**工作原理**：

1. `wt switch --create feature-auth` 运行 `post-start` 钩子，在确定性端口上启动开发服务器（`{{ branch | hash_port }}` → 18283）
2. 钩子按需启动 Caddy，并用同一端口注册路由：`feature-auth.myproject` → `localhost:18283`
3. `*.localhost` 由操作系统解析到 `127.0.0.1`
4. 访问 `http://feature-auth.myproject.localhost:8080` 时，Caddy 匹配子域名并代理到开发服务器

### 每个 worktree 一个 Tmux 会话

每个 worktree 都有自己的 tmux 会话，采用多窗格布局。

```toml
# .config/wt.toml
[pre-start]
tmux = """
S={{ branch | sanitize }}
W={{ worktree_path }}
tmux new-session -d -s "$S" -c "$W" -n dev

# Create 4-pane layout: shell | backend / claude | frontend
tmux split-window -h -t "$S:dev" -c "$W"
tmux split-window -v -t "$S:dev.0" -c "$W"
tmux split-window -v -t "$S:dev.2" -c "$W"

# Start services in each pane
tmux send-keys -t "$S:dev.1" 'npm run backend' Enter
tmux send-keys -t "$S:dev.2" 'claude' Enter
tmux send-keys -t "$S:dev.3" 'npm run frontend' Enter

tmux select-pane -t "$S:dev.0"
echo "✓ Session '$S' — attach with: tmux attach -t $S"
"""

[pre-remove]
tmux = "tmux kill-session -t {{ branch | sanitize }} 2>/dev/null || true"
```

创建 worktree 并立即附着会话：

```console
$ wt switch --create feature -x tmux -- attach -t '{{ branch | sanitize }}'
```

### 每个 worktree 一个 cmux 工作区

每个 worktree 都有自己的 [cmux](https://cmux.com) 工作区。切换 worktree 即切换工作区；移除 worktree 时关闭其工作区。配置由 [@endigma](https://github.com/endigma) 贡献（[#2796](https://github.com/max-sixty/worktrunk/issues/2796)）。

**前置条件**：[jq](https://jqlang.org)（`brew install jq`）

```toml
# ~/.config/worktrunk/config.toml

# cmux is the navigation primitive; don't also cd the invoking shell.
[switch]
cd = false

[pre-start]
cmux = "cmux new-workspace --name {{ repo | sanitize }}/{{ branch | sanitize }} --cwd {{ worktree_path }} --focus true"

[pre-switch]
cmux = """
WS=$(cmux --json list-workspaces 2>/dev/null \\
  | jq -r --arg t '{{ repo | sanitize }}/{{ branch | sanitize }}' \\
      '.workspaces[] | select(.title == $t) | .ref' | head -1)
[ -n "$WS" ] && cmux select-workspace --workspace "$WS" || true
"""

[pre-remove]
cmux = """
WS=$(cmux --json list-workspaces 2>/dev/null \\
  | jq -r --arg t '{{ repo | sanitize }}/{{ branch | sanitize }}' \\
      '.workspaces[] | select(.title == $t) | .ref' | head -1)
[ -n "$WS" ] && cmux close-workspace --workspace "$WS" || true
"""
```

**为什么用 `pre-*` 而不是 `post-*`**？cmux 把 socket 访问限制在 cmux 终端内启动的进程。`post-*` 钩子作为分离的后台进程运行，会打断进程谱系；`pre-*` 钩子在前台运行，继承终端的进程谱系。

### 清理 Xcode DerivedData

移除 worktree 时清理 Xcode 的 DerivedData。每个 DerivedData 目录里都有一个记录其项目路径的 `info.plist`——用 grep 匹配 worktree 路径即可找到并删除对应的构建缓存：

```toml
# ~/.config/worktrunk/config.toml
[post-remove]
clean-derived = """
  grep -Fl {{ worktree_path }} \
    ~/Library/Developer/Xcode/DerivedData/*/info.plist 2>/dev/null \
  | while read plist; do
      derived_dir=$(dirname "$plist")
      rm -rf "$derived_dir"
      echo "Cleaned DerivedData: $derived_dir"
    done
"""
```

## 与 agent 协作

### 追踪 agent 状态

agent 插件会在 `wt list` 中把各 worktree 标记为 🤖（工作中）或 💬（等待中）；其他工作流可用 `wt config state marker set` 手动设置标记。见[活动追踪](/claude-code/#活动追踪)。

### agent 交接

创建一个 worktree，并让 agent CLI 在后台运行。`-x` 指定要运行的程序，`--` 之后的所有内容都会传给它，因此 OpenCode 的子命令要放在 `--` 之后：`-x opencode -- run '<task>'`。

**tmux**（新建分离会话）：
```bash
tmux new-session -d -s fix-auth-bug "wt switch --create fix-auth-bug -x claude -- \
  'The login session expires after 5 minutes. Find the session timeout config and extend it to 24 hours.'"
```

**Zellij**（当前会话中新建窗格）：
```bash
zellij run -- wt switch --create fix-auth-bug -x claude -- \
  'The login session expires after 5 minutes. Find the session timeout config and extend it to 24 hours.'
```

这样，一个 agent 会话就能把工作交接给另一个在后台运行的会话。钩子在复用器的会话/窗格内运行。

[worktrunk skill](/claude-code/) 内含指导，供 Claude Code（以及其他加载它的 agent CLI）执行这一模式。要启用它，可以显式提出请求（“spawn a parallel worktree for...”），或写进项目指令（`CLAUDE.md` 或 `AGENTS.md`）：

```markdown title="AGENTS.md"
When I ask you to spawn parallel worktrees, use the agent handoff pattern
from the worktrunk skill.
```

## 状态、提交与日志

### 跨分支监控 CI

```bash
wt list --full --branches
```

显示所有分支的 PR/CI 状态，包括没有 worktree 的分支。CI 指示器是指向 PR 页面的可点击链接。

### LLM 分支摘要

配置 `summary = true` 与 [`commit.generation`](/config/#commit) 后，`wt list --full` 会为每个分支显示一行 LLM 生成的摘要。同样的摘要也会出现在 [`wt switch` 选择器](/switch/#交互式选择器)的 `summary` 标签页中。

```toml
# ~/.config/worktrunk/config.toml
[list]
summary = true
```

详见 [LLM 提交](/llm-commits/#分支摘要)。

### JSON API

```bash
wt list --format=json
```

面向仪表盘、statusline 与脚本的结构化输出。查询示例见 [`wt list`](/list/)。

### 手写提交信息

`commit.generation.command` 从 stdin 接收渲染好的提示词，并把提交信息写到 stdout。如果想手写提交信息而不用 LLM，把它指向 `$EDITOR`：

```toml
# ~/.config/worktrunk/config.toml
[commit.generation]
command = '''f=$(mktemp); printf '\n\n' > "$f"; sed 's/^/# /' >> "$f"; ${EDITOR:-vi} "$f" < /dev/tty > /dev/tty; grep -v '^#' "$f"'''
```

这段命令用 `#` 前缀把渲染好的提示词（diff、分支名、统计信息）注释掉，打开编辑器，保存时再去掉注释行。顶部留出几行空白供输入；下方的提示词上下文可作参考。

想保留 LLM 为默认、只在特定合并时用编辑器，可以加一个 [worktrunk 别名](/extending/#别名)：

```toml
# ~/.config/worktrunk/config.toml
[aliases]
mc = '''WORKTRUNK_COMMIT__GENERATION__COMMAND='f=$(mktemp); printf "\n\n" > "$f"; sed "s/^/# /" >> "$f"; ${EDITOR:-vi} "$f" < /dev/tty > /dev/tty; grep -v "^#" "$f"' wt merge'''
```

此后 `wt mc` 会打开编辑器撰写提交信息，而普通的 `wt merge` 仍继续使用 LLM。

### 监控钩子日志

跟踪后台钩子输出：

```bash
tail -f "$(wt config state logs --format=json | jq -r --arg branch "$(git branch --show-current)" '.hook_output[] | select([.branch, .source, .hook_type, .name] == [$branch, "user", "post-start", "server"]) | .path')"
```

每条 `hook_output` 记录都带有 `branch`、`source`（`user`、`project` 或 `internal`）、`hook_type`、`name` 与 `path`——调整 `select` 即可选择其他钩子或分支。运行 `wt config state logs` 可列出全部可用日志。

常用的话可以建一个 shell 函数（`wtlog server`）：

```bash
wtlog() {
  tail -f "$(wt config state logs --format=json | jq -r --arg branch "$(git branch --show-current)" --arg name "$1" '.hook_output[] | select([.branch, .source, .hook_type, .name] == [$branch, "user", "post-start", $name]) | .path')"
}
```
