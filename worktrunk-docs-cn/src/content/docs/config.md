---
title: "wt config"
description: "管理用户与项目配置。包含 Shell 集成、钩子（hook）与已保存状态。"
sidebar:
  order: 15
---
<!-- ⚠️ AUTO-GENERATED from `wt config --help-page` — edit src/cli/mod.rs to update -->

管理用户与项目配置。包含 Shell 集成、钩子（hook）与已保存状态。

## 示例

安装 Shell 集成（切换目录必需）：

```console
$ wt config shell install
```

创建带注释示例的用户配置文件：

```console
$ wt config create
```

创建用于钩子（hook）的项目配置文件（`.config/wt.toml`）：

```console
$ wt config create --project
```

查看当前配置与文件位置：

```console
$ wt config show
```

## 配置文件

| 文件 | 位置 | 内容 | 提交并共享 |
|------|----------|----------|--------------------|
| **用户配置** | `~/.config/worktrunk/config.toml` | worktree 路径模板、LLM 提交配置等 | ✗ |
| **项目配置** | `.config/wt.toml` | 项目钩子（hook）、开发服务器 URL | ✓ |

组织可以部署一份系统级配置文件作为共享默认值——运行 `wt config show` 可查看平台专属的位置。

**用户配置**——个人偏好：

```toml
# ~/.config/worktrunk/config.toml
worktree-path = ".worktrees/{{ branch | sanitize }}"

[commit.generation]
command = "MAX_THINKING_TOKENS=0 claude -p --no-session-persistence --model=haiku --tools='' --safe-mode --setting-sources='user' --system-prompt=''"
```

**项目配置**——团队共享设置：

```toml
# .config/wt.toml
[pre-start]
deps = "npm ci"

[pre-merge]
test = "npm test"
```

<!-- USER_CONFIG_START -->
# 用户配置

用 `wt config create` 创建。除另有说明外，所示值均为默认值。

位置：

- macOS/Linux：`~/.config/worktrunk/config.toml`（若设置了 `$XDG_CONFIG_HOME` 则位于其下）
- Windows：`%APPDATA%\worktrunk\config.toml`

## worktree 路径模板

控制新 worktree 的创建位置。

**可用模板变量**：

- `{{ repo_path }}` —— 仓库根目录的绝对路径（例如 `/Users/me/code/myproject`；bare 仓库则是 bare 目录本身）
- `{{ repo }}` —— 仓库目录名（例如 `myproject`）
- `{{ owner }}` —— 主远程的 owner 路径（可能包含子组，如 `group/subgroup`）
- `{{ remote_repo }}` —— 主远程 URL 中的仓库名，不含 `.git`（例如 `myproject`）；当克隆被重命名过目录时，它与磁盘上的目录名 `{{ repo }}` 不同
- `{{ branch }}` —— 原始分支名（例如 `feature/auth`）
- `{{ branch | sanitize }}` —— 文件系统安全：`/` 与 `\` 变为 `-`（例如 `feature-auth`）
- `{{ branch | sanitize_db }}` —— 数据库安全：小写、下划线、哈希后缀（例如 `feature_auth_x7k`）
- `{{ branch | codename(2) }}` —— 取自约 126 万种组合的确定性友好名（例如 `malleable-opah`）

这比[钩子（hook）与别名可用的变量](/hook/#模板变量)集合要小。

**示例**以仓库位于 `~/code/myproject`、分支为 `feature/auth` 为准：

默认——同级目录（`~/code/myproject.feature-auth`）：

```toml
worktree-path = "{{ repo_path }}/../{{ repo }}.{{ branch | sanitize }}"
```

仓库内部（`~/code/myproject/.worktrees/feature-auth`）：

```toml
worktree-path = "{{ repo_path }}/.worktrees/{{ branch | sanitize }}"
```

由分支派生的友好名称（`~/code/myproject.malleable-opah`）：

```toml
worktree-path = "{{ repo_path }}/../{{ repo }}.{{ branch | codename(2) }}"
```

友好名称并在父目录中保留分支标识（`~/code/worktrees/feature-auth/malleable-opah`）：

```toml
worktree-path = "{{ repo_path }}/../worktrees/{{ branch | sanitize }}/{{ branch | codename(2) }}"
```

集中式 worktrees 目录（`~/worktrees/myproject/feature-auth`）：

```toml
worktree-path = "~/worktrees/{{ repo }}/{{ branch | sanitize }}"
```

按远程 owner 路径（`~/development/max-sixty/myproject/feature/auth`）：

```toml
worktree-path = "~/development/{{ owner }}/{{ repo }}/{{ branch }}"
```

bare 仓库克隆到 `~/code/myproject/.git`（`~/code/myproject/feature-auth`）：

```toml
worktree-path = "{{ repo_path }}/../{{ branch | sanitize }}"
```

`~` 展开为主目录。相对路径从 `repo_path` 起解析。

## LLM 提交信息

在合并时自动生成提交信息。需要外部 CLI 工具。

### Claude Code

```toml
[commit.generation]
command = "MAX_THINKING_TOKENS=0 claude -p --no-session-persistence --model=haiku --tools='' --safe-mode --setting-sources='user' --system-prompt=''"
```

### Codex

创建内容仅为 `.`（无换行）的 `~/.codex/worktrunk-commit-instructions.txt`。接受 Worktrunk 首次运行时的 Codex 设置即会替你创建该文件。

```toml
[commit.generation]
command = "codex exec -m gpt-6-luna -c model_reasoning_effort='none' -c project_doc_max_bytes=0 -c skills.max_context_tokens=1 -c agents.enabled=false -c features.goals=false -c web_search=disabled -c 'model_instructions_file=\"~/.codex/worktrunk-commit-instructions.txt\"' -c features.shell_tool=false -c features.unified_exec=false -c features.apps=false -c features.plugins=false --ephemeral --sandbox=read-only --json - | jq -sr '[.[] | select(.item.type? == \"agent_message\")] | last.item.text'"
```

### OpenCode

```toml
[commit.generation]
command = "opencode run -m anthropic/claude-haiku-5-5 --variant fast"
```

### llm

```toml
[commit.generation]
command = "llm -m claude-haiku-4.5"
```

### aichat

```toml
[commit.generation]
command = "aichat -m claude:claude-haiku-4.5 --code"
```

设置方法见 [LLM 提交文档](/llm-commits/)，模板定制见[自定义提示词模板](#自定义提示词模板)。

## 命令配置

### List

`wt list` 的持久化选项值。可在命令行按需覆盖。

```toml
[list]
summary = false    # Enable LLM branch summaries (requires [commit.generation])

full = false       # Show CI status and LLM summaries (--full)
branches = false   # Include branches without worktrees (--branches)
remotes = false    # Include remote-only branches (--remotes)

json-schema = 2    # JSON output schema: 2 (envelope, default) or 1 (bare array)

columns = ["branch", "status", "ci", "path"]   # Columns to show, in order — built-ins or custom headers (omit for the default set)

timeout-ms = 0     # Wall-clock budget for the entire collect phase; 0 disables
```

`columns` 用于选择并排序 `wt list` 表格与 `wt switch` 选择器渲染的
列；`--format json` 会忽略它并总是输出全部字段。省略它即使用默认
列集。它的设计意图是配合每次调用的
[别名](/extending/#别名)（`wt --config-set 'list.columns=[…]' list`），
在不打扰默认 `wt list` 的前提下提供一个命名视图。静态设置也
可用，但会把一种布局钉死在原本随 `--full` 和终端宽度自适应的表格上。

有效的内置列名：

- `branch` —— 分支名
- `status` —— git 状态符号，加上用户自定义状态
- `working-diff` —— 相对 `HEAD` 的未提交行变更，含未跟踪文件（表头 `HEAD±`）
- `ahead-behind` —— 领先和落后默认分支的提交数（表头 `main↕`）
- `branch-diff` —— 相对默认分支的行变更（表头 `main…±`）
- `summary` —— 该分支的 LLM 生成摘要
- `upstream` —— 领先和落后上游跟踪分支的提交数（表头 `Remote⇅`）
- `ci` —— head 提交的 CI 状态
- `path` —— worktree 的路径
- `url` —— 来自 `[list] url` 模板的开发服务器 URL
- `commit` —— head 提交的短哈希
- `age` —— 距上次提交的时长
- `message` —— head 提交的主题

所选列可混用内置列与[自定义列](#自定义列)，各列以其 `[list.custom-columns]` 表头命名
（`columns = ["branch", "Ticket", "ci"]`），且是穷举的：只有列出的列会
渲染。省略 `columns` 则保留默认列集，此时自定义列会自动追加。

列出某列即会在空间允许时强制开启它：`ci` 无需 `--full` 也会显示。但
数据源缺失的列仍保持隐藏——`summary` 需要 LLM 命令
（`[commit.generation]`），`url` 需要 `[list] url` 模板。

#### 自定义列

<span class="badge-experimental"></span>

自定义列为 `wt list` 表格添加按分支的上下文。每个
`[list.custom-columns]` 条目就是一列：键是表头，模板渲染
每一行的单元格。

```toml
[list.custom-columns.Ticket]
template = "{{ vars.ticket }}"   # Required; the result is the cell text
width = 20                       # Optional max display width (default: 40)
priority = 9                     # Optional drop order when the terminal narrows;
                                 # lower = kept longer (default: 9, the URL band)
```

模板可引用 `{{ branch }}`、`{{ worktree_path }}`、
`{{ worktree_name }}`（仅分支的行取空值），以及两个按分支的
命名空间：

- `{{ vars.* }}` —— 用
  [`wt config state vars set`](/config/#wt-config-state-vars) 存储的值。
- `{{ git.branch.* }}` —— 该分支自身 git 配置中 `branch.<name>.*` 下的条目，
  直接从 `git config` 读取（例如你自己设置的键用 `{{ git.branch.jira }}`，
  或 git 原生的 `description`）。Git 会把配置变量名转为小写，
  因此 `branch.<name>.nvciShelf` 要写成 `{{ git.branch.nvcishelf }}`。

所有标准过滤器都可用（`sanitize`、`hash_port`、`codename` 等）。模板渲染为空的行
（例如没有该键的分支）显示空单元格；每一行都为空的列会从表格中剔除。
`wt list --format json` 在 schema 2 下将渲染值包含在
`items[].display.columns`，在 schema 1 下包含在 `columns`。

一个读取保存在 git 配置中的键的 `Jira` 列，和一个只显示
git 原生分支描述首行的 `Summary` 列：

```toml
[list.custom-columns.Jira]
template = "{{ git.branch.jira }}"

[list.custom-columns.Summary]
template = "{{ git.branch.description | lines | first }}"
```

### Commit

由 `wt step commit`、`wt step squash` 与 `wt merge` 共享。

```toml
[commit]
stage = "all"      # What to stage before commit: "all", "tracked", or "none"
```

### Merge

多数选项默认开启。设为 false 可更改默认行为。

```toml
[merge]
squash = true      # Squash commits into one (--no-squash to preserve history)
commit = true      # Commit uncommitted changes first (--no-commit to skip)
rebase = true      # Rebase onto target before merge (--no-rebase to skip)
remove = true      # Remove worktree after merge (--no-remove to keep)
verify = true      # Run project hooks (--no-hooks to skip)
ff = true          # Fast-forward merge (--no-ff to create a merge commit instead)
```

### Remove

`wt remove` 的持久化选项值。可在命令行按需覆盖。

```toml
[remove]
delete-branch = true   # Delete branch after removal (--no-delete-branch to keep)
```

### Switch

```toml
[switch]
cd = true          # Change directory after switching (--no-cd to skip)

[switch.picker]
pager = "delta --paging=never"   # Example: override git's core.pager for diff preview
preview = true                   # Show the preview panel on open (Alt-p toggles)
```

### Step

```toml
[step.copy-ignored]
exclude = []   # Additional excludes (e.g., [".cache/", ".turbo/"])
```

内置排除项（VCS 元数据与工具状态目录）始终生效；完整清单见 [`wt step copy-ignored` 文档](/step/#wt-step-copy-ignored)。用户配置与项目配置的排除项会合并。

### 用户别名

以 `wt <name>` 形式运行的命令模板。用法与选项见[扩展 Worktrunk 指南](/extending/#别名)。

```toml
[aliases]
greet = "echo Hello from {{ branch }}"
url = "echo http://localhost:{{ branch | hash_port }}"
```

这里定义的别名适用于所有项目。项目专属的别名请改用[项目配置](/config/#项目别名)的 `[aliases]` 节。

### 用户的项目专属设置

用户配置可以包含一个 `[projects]` 表，存放项目专属设置——worktree 布局、设置覆盖等任何内容——与队友共享的[项目配置](/config/#项目配置)相互独立。

条目以项目标识符为键——由主远程 URL 派生的 `<host>/<owner>/<repo>`（无 `.git` 后缀；SSH 默认 22 端口以外的显式端口保留在主机名中，如 `gitlab.example.com:2222/team/project`），无远程时则用仓库的规范路径。在仓库内运行 `wt config show` 可查看当前项目的标识符；它显示在 `PROJECT CONFIG` 节中，形式为 `Identifier: …`。

标量值（如 `worktree-path`）替换全局值；其余内容（钩子、别名等）则追加，全局的在前。参见[各层级的高下顺序](/config/#优先级)。

```toml
[projects."github.com/user/repo"]
worktree-path = ".worktrees/{{ branch | sanitize }}"
list.full = true
merge.squash = false
remove.delete-branch = false
pre-start.env = "cp .env.example .env"
step.copy-ignored.exclude = [".repo-local-cache/"]
aliases.deploy = "make deploy BRANCH={{ branch }}"
```

#### 用一个条目匹配多个仓库

包含 `*` 的键匹配任意字符序列（含 `/`），因此一个条目即可覆盖整台主机或整个命名空间——包括嵌套的组。`*` 是唯一的通配符；其余每个字符（包括 `.`）都是字面量。

```toml
# Every repository on a self-hosted forge whose hostname carries no brand
[projects."git.company.example/*"]
forge.platform = "gitlab"

# Everything under one namespace shares a layout
[projects."git.company.example/platform/*"]
worktree-path = ".worktrees/{{ branch | sanitize }}"
```

按上述规则，所有匹配的条目都生效，从最不具体到最具体：当两个条目设置同一项时，更具体的条目——`git.company.example/platform/*` 优先于 `git.company.example/*`——胜出；而每个匹配条目的钩子与别名都会运行，最不具体的在前。字面量键是所有键中最具体的；具体程度按键中非 `*` 字符数计。覆盖整台主机的键要以 `/*` 结尾——单独一个 `git.company.example*` 会连名字恰好以该字符串开头的主机也一并覆盖。使用非默认 SSH 端口的远程，其标识符中带有端口，因此它覆盖整台主机的键是 `git.company.example:2222/*`。

`approvals.toml` 中的条目按同样方式匹配，因此一条手写的模式条目会为它覆盖的每个仓库批准相应命令。

#### forge 平台与主机名

`forge` 为匹配的仓库指明 forge——它是项目配置中 [forge 平台](/config/#forge-平台)块在用户层的对应物，适用于名称中不含 `github`、`gitlab` 或 `gitea` 供自动检测识别的自托管主机。

```toml
[projects."git.company.example/*"]
forge.platform = "gitlab"                    # or "github", "gitea" (experimental), "azure-devops" (experimental)
forge.hostname = "api.git.company.example"   # API host, when the remote's own host isn't it
```

仓库自身的 `[forge]` 块仍逐字段优先于这里的任何条目。

钩子支持全部三种[钩子形式](/hook/#钩子形式)。表形式并发运行多条命令；表数组流水线按顺序运行各步骤：

```toml
# Single command
[projects."github.com/user/repo"]
post-start = "mise trust"

# Multiple commands, running concurrently
[projects."github.com/user/repo".post-start]
mise = "mise trust"
server = "npm run dev"

# Pipeline: steps run in sequence
[[projects."github.com/user/repo".post-start]]
install = "npm ci"

[[projects."github.com/user/repo".post-start]]
build = "npm run build"
server = "npm run dev"
```

### 自定义提示词模板

模板使用 [minijinja](https://docs.rs/minijinja/) 语法。

#### 提交模板

可用变量：

- `{{ git_diff }}`、`{{ git_diff_stat }}` —— diff 内容
- `{{ branch }}`、`{{ repo }}` —— 上下文
- `{{ recent_commits }}` —— 近期提交信息
- `{{ user_guidance }}`、`{{ project_guidance }}` —— 渲染后的追加片段（参见[追加到提示词](/config/#追加到提示词)）

默认模板：

<!-- DEFAULT_TEMPLATE_START -->
```toml
[commit.generation]
template = """
<task>Write a commit message for the staged changes below.</task>

<format>
- Subject line under 50 chars
- For material changes, add a blank line then a body paragraph explaining the change
- Output only the commit message, no quotes or code blocks
</format>

<style>
- Imperative mood: "Add feature" not "Added feature"
- Match recent commit style (conventional commits if used)
- Describe the change, not the intent or benefit
</style>
{% if user_guidance %}
<user-guidance>
{{ user_guidance }}
</user-guidance>
{% endif %}{% if project_guidance %}
<project-guidance>
{{ project_guidance }}
</project-guidance>
{% endif %}
<diffstat>
{{ git_diff_stat }}
</diffstat>

<diff>
{{ git_diff }}
</diff>

<context>
Branch: {{ branch }}
{% if recent_commits %}<recent_commits>
{% for commit in recent_commits %}- {{ commit }}
{% endfor %}</recent_commits>{% endif %}
</context>

"""
```
<!-- DEFAULT_TEMPLATE_END -->

#### squash 模板

可用变量（在提交模板的变量之外新增）：

- `{{ commit_details }}` —— 待 squash 的提交列表；每一项渲染为其主题，并暴露 `.subject` / `.body`
- `{{ target_branch }}` —— 合并目标分支

默认模板：

<!-- DEFAULT_SQUASH_TEMPLATE_START -->
```toml
[commit.generation]
squash-template = """
<task>Write a commit message for the change in <diff>, which is everything the squash will record. <commits> lists what it folds in.</task>

<format>
- Subject line under 50 chars
- For material changes, add a blank line then a body paragraph explaining the change
- Output only the commit message, no quotes or code blocks
</format>

<style>
- Imperative mood: "Add feature" not "Added feature"
- Match the style of commits being squashed (conventional commits if used)
- Describe the change, not the intent or benefit
</style>
{% if user_guidance %}
<user-guidance>
{{ user_guidance }}
</user-guidance>
{% endif %}{% if project_guidance %}
<project-guidance>
{{ project_guidance }}
</project-guidance>
{% endif %}
<commits branch="{{ branch }}" target="{{ target_branch }}">
{% for detail in commit_details %}- {{ detail.subject }}
{% endfor %}</commits>

<diffstat>
{{ git_diff_stat }}
</diffstat>

<diff>
{{ git_diff }}
</diff>

"""
```
<!-- DEFAULT_SQUASH_TEMPLATE_END -->

#### 追加到提示词

`template-append` 向提交与 squash 提示词追加个人约定，无需重述整个模板：

```toml
[commit.generation]
template-append = """
- Explain the rationale in the body, not just the change
"""
```

片段如何渲染及其项目配置对应项，见 [LLM 提交指南](/llm-commits/#追加到提示词)。

## 用户钩子

钩子类型、执行顺序、模板变量与示例见 [`wt hook`](/hook/)。用户钩子适用于所有项目；[项目钩子](/config/#项目钩子)只作用于对应仓库。
<!-- USER_CONFIG_END -->
<!-- PROJECT_CONFIG_START -->
# 项目配置

项目配置让团队共享仓库专属设置——钩子、开发服务器 URL 及其他默认值。文件位于 `.config/wt.toml`，通常纳入版本控制。

要创建带注释示例的起步文件，请运行 `wt config create --project`。

## 项目钩子

项目钩子只作用于本仓库。钩子类型、执行顺序与示例见 [`wt hook`](/hook/)。

```toml
pre-start = "npm ci"
post-start = "npm run dev"
pre-merge = "npm test"
```

## 开发服务器 URL

`wt list` 中的 URL 列（端口未监听时显示为暗色）：

```toml
[list]
url = "http://localhost:{{ branch | hash_port }}"
```

## forge 平台

forge 从远程的主机名读取：任何名称中任意位置带有 `github`、`gitlab` 或 `gitea` 的主机，加上 Azure DevOps 服务域名。对于不含这些字样的主机——例如位于 `forge.example.com` 的 Forgejo 实例——需显式指明 forge：

```toml
[forge]
platform = "github"  # or "gitlab", "gitea" (experimental), "azure-devops" (experimental)
hostname = "github.example.com"  # Example: API host (GHE / self-hosted GitLab)
```

当许多仓库共用一台自托管主机时，可在用户配置中用一条[模式键的 `[projects]` 条目](/config/#用户的项目专属设置)统一指定，而不必在每个仓库里重复这个块。仓库自身的 `[forge]` 仍逐字段优先。

## 提交信息追加

`template-append` 向 LLM 提交与 squash 提示词加入项目级约定，共享之后每位队友的 LLM 看到的都是同一份风格指南：

```toml
[commit.generation]
template-append = """
- Use conventional commits (feat:, fix:, docs:, …)
- Reference the relevant issue ID in the body
"""
```

片段首次使用时（以及每次变更时），`wt` 会提示用户批准——与项目定义钩子相同的一次性门禁。项目文件中只有 `template-append` 会被采纳；LLM 命令与主提示词模板仍留在[用户配置](/config/)中。片段如何渲染见 [LLM 提交指南](/llm-commits/#追加到提示词)。

## copy-ignored 排除项

`wt step copy-ignored` 的额外排除项：

```toml
[step.copy-ignored]
exclude = [".cache/", ".turbo/"]
```

内置排除项（VCS 元数据与工具状态目录）始终生效；完整清单见 [`wt step copy-ignored` 文档](/step/#wt-step-copy-ignored)。用户配置与项目配置的排除项会合并。

## 项目别名

以 `wt <name>` 形式运行的命令模板。用法与选项见[扩展 Worktrunk 指南](/extending/#别名)。

```toml
[aliases]
deploy = "make deploy BRANCH={{ branch }}"
url = "echo http://localhost:{{ branch | hash_port }}"
```

这里定义的别名与队友共享。个人别名请改用[用户配置](/config/#用户别名)的 `[aliases]` 节。
<!-- PROJECT_CONFIG_END -->

# Shell 集成

安装、激活与当前 shell 诊断见 [`wt config shell`](#wt-config-shell)。

### 首次运行提示

首次运行时若没有 Shell 集成，Worktrunk 会提议安装。首次提交时若没有 LLM 配置，它会提议配置检测到的工具（`claude`、`codex`、`opencode`）。拒绝后会自动设置 `skip-shell-integration-prompt` 或 `skip-commit-generation-prompt`。

# 其他

## 环境变量

所有用户配置项都可用带 `WORKTRUNK_` 前缀的环境变量覆盖。

### 命名约定

配置键使用 kebab-case（`worktree-path`），环境变量则使用 SCREAMING_SNAKE_CASE（`WORKTRUNK_WORKTREE_PATH`）。转换自动完成。

嵌套配置节用双下划线分隔层级：

| 配置 | 环境变量 |
|--------|---------------------|
| `worktree-path` | `WORKTRUNK_WORKTREE_PATH` |
| `commit.generation.command` | `WORKTRUNK_COMMIT__GENERATION__COMMAND` |
| `commit.stage` | `WORKTRUNK_COMMIT__STAGE` |

### 示例：CI/测试覆盖

在 CI 中覆盖 LLM 命令以使用 mock：

```console
$ WORKTRUNK_COMMIT__GENERATION__COMMAND="echo 'test: automated commit'" wt merge
```

### 其他环境变量

| 变量 | 用途 |
|----------|---------|
| `WORKTRUNK_BIN` | 覆盖 shell 包装器使用的二进制路径；便于测试开发构建 |
| `WORKTRUNK_CONFIG_PATH` | 覆盖用户配置文件位置 |
| `WORKTRUNK_SYSTEM_CONFIG_PATH` | 覆盖系统配置文件位置 |
| `WORKTRUNK_PROJECT_CONFIG_PATH` | 覆盖项目配置文件位置（默认 `.config/wt.toml`）；相对路径从 worktree 根解析 |
| `WORKTRUNK_MAX_CONCURRENT_COMMANDS` | 并行 git 命令上限（默认 32）。遇到文件描述符限制时调低。 |
| `WORKTRUNK_VERBOSE` | 输出详细级别（`0`/`1`/`2`），类似 `-v`/`-vv` 但作用于一切场景——包括任何选项都触达不到的 shell 补全 |
| `RUST_LOG` | 日志指令（如 `worktrunk=debug`）；覆盖进入 stderr 的内容所依据的详细级别基线 |
| `NO_COLOR` | 禁用彩色输出（[标准](https://no-color.org/)） |
| `CLICOLOR_FORCE` | 即使不是 TTY 也强制彩色输出 |

## 内联配置覆盖（`--config-set`）

`--config-set <toml>` 为单次调用覆盖任意用户配置键。值是 TOML 片段，因此数组与表可直接使用；该选项是全局的（可放在子命令之前或之后）、可重复，且同键时后一个 `--config-set` 会替换前一个。

```console
$ wt --config-set list.full=true list
$ wt step copy-ignored --config-set 'step.copy-ignored.exclude=["target", "dist"]'
```

这可以与别名组合——别名体可以调用 `wt --config-set … <command>` 来渲染命名视图而不改动已保存的配置。

## 优先级

离调用越近的来源优先级越高（用户配置高于系统配置），而在同一配置文件内，[项目条目](/config/#用户的项目专属设置)高于同名的全局键。因此 `worktree-path` 取自下列中最先设置它的一项：

1. `--config-set 'worktree-path = …'`
2. `WORKTRUNK_WORKTREE_PATH`
3. 配置文件中的 `[projects."github.com/owner/repo"]`
4. 配置文件中的全局 `worktree-path`

指名某个项目条目的 `--config-set` 既是最上层又是最具体的键，因此胜过同一选项的全局键：

```console
$ wt --config-set 'projects."github.com/owner/repo".worktree-path = "/tmp/scratch"' switch --create feature
```

钩子、别名与 `step.copy-ignored.exclude` 是累积而非替换，因此环境变量设置的钩子和项目的钩子都会运行。

## 命令参考

```text wt-command-reference
wt config - Manage user & project configs

Includes shell integration, hooks, and saved state.

Usage: wt config [OPTIONS] <COMMAND>

Commands:
  shell      Shell integration setup
  create     Create configuration file
  show       Show configuration files & locations
  update     Update deprecated config settings
  approvals  Manage command approvals
  alias      Inspect and preview aliases
  plugins    Plugin management
  state      Manage internal data and cache

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

## wt config shell

Shell 集成安装。

子进程无法更改其父 shell 的目录。Shell 集成定义一个函数来运行 Worktrunk 二进制，并在命令请求时更改 shell 的目录。它还启用 Tab 补全。

### 安装

```console
$ wt config shell install
```

安装后启动新的 shell 以加载包装器。按名称调用 `wt`。直接运行二进制路径或 `git wt` 会绕过包装器，shell 的目录因此保持不变。

- `wt config shell install --help` —— 安装选项
- `wt config shell init --help` —— 手动安装
- `wt config shell uninstall` —— 移除集成

### 检查当前 shell

```console
$ wt config show
```

SHELL INTEGRATION 节报告包装器在当前会话中是否生效。安装与激活是两回事：已配置的 shell 在重新加载其配置之前，仍可能运行在未加载包装器的状态下。

在 bash、zsh 或 fish 中，`type wt` 可检查 `wt` 是否解析为一个函数。在 PowerShell 中，`Get-Command wt -All` 会列出 Function 与 Application 两个定义。

警告信息、安装的文件与包装器行为见 [worktrunk.dev/shell-integration](/shell-integration/)。

### 命令参考

```text wt-command-reference
wt config shell - Shell integration setup

Usage: wt config shell [OPTIONS] <COMMAND>

Commands:
  init        Generate shell integration code
  install     Write shell integration to config files
  uninstall   Remove shell integration from config files
  show-theme  Show output theme samples

Options:
  -h, --help
          Print help (see a summary with '-h')
```

## wt config shell init

生成 Shell 集成代码。

输出供 `eval` 或 source 的 shell 代码。多数用户应改用 `wt config shell install`，它会自动添加。

### 手动安装

bash、fish、zsh 与 PowerShell 需在 shell 配置中加入对应行；Nushell 则运行该命令，把包装器保存到其 autoload 目录。

Bash（~/.bashrc）：
```console
$ eval "$(wt config shell init bash)"
```

Fish（~/.config/fish/config.fish）：
```fish
wt config shell init fish | source
```

Zsh（~/.zshrc）：
```zsh
eval "$(wt config shell init zsh)"
```

Nushell 0.113+ <span class="badge-experimental"></span>——保存到 vendor autoload 目录：
```console
$ wt config shell init nu | save -f ($nu.vendor-autoload-dirs | last | path join wt.nu)
```

PowerShell（$PROFILE）：
```powershell
Invoke-Expression (& wt config shell init powershell | Out-String)
```

### 命令参考

```text wt-command-reference
wt config shell init - Generate shell integration code

Usage: wt config shell init [OPTIONS] <bash|fish|nu|zsh|powershell>

Arguments:
  <bash|fish|nu|zsh|powershell>
          Shell to generate code for

          [possible values: bash, fish, nu, zsh, powershell]

Options:
      --cmd <CMD>
          Command name for shell integration (defaults to binary name)

          Use this to create shell integration for an alternate command name. For example,
          --cmd=git-wt creates a git-wt shell function instead of wt, useful on Windows where wt
          conflicts with Windows Terminal.

  -h, --help
          Print help (see a summary with '-h')
```

## wt config shell install

将 Shell 集成写入配置文件。

向 bash、zsh 与 PowerShell 的配置文件追加初始化行。对 fish 与 Nushell，它会替换 autoload 的包装器文件；fish 还会另有一个独立的补全文件。它们的位置见 [worktrunk.dev/shell-integration](/shell-integration/#创建的文件)。

### 示例

为所有检测到的 shell 安装：
```console
$ wt config shell install
```

只为特定 shell 安装：
```console
$ wt config shell install zsh
```

修改任何文件前会展示拟议变更并等待确认。
使用 --yes 可跳过确认。

### 命令参考

```text wt-command-reference
wt config shell install - Write shell integration to config files

Usage: wt config shell install [OPTIONS] [bash|fish|nu|zsh|powershell]

Arguments:
  [bash|fish|nu|zsh|powershell]
          Shell to install (default: all)

          [possible values: bash, fish, nu, zsh, powershell]

Options:
      --dry-run
          Show what would be changed

      --cmd <CMD>
          Command name for shell integration (defaults to binary name)

          Use this to create shell integration for an alternate command name. For example,
          --cmd=git-wt creates a git-wt shell function instead of wt, useful on Windows where wt
          conflicts with Windows Terminal.

  -h, --help
          Print help (see a summary with '-h')
```

## wt config shell uninstall

从配置文件移除 Shell 集成。

从 bash、zsh 与 PowerShell 的配置文件移除 Worktrunk 初始化行，并移除 fish 与 Nushell 的 Worktrunk 包装器与补全文件。

### 示例

从所有 shell 卸载：
```console
$ wt config shell uninstall
```

只从特定 shell 卸载：
```console
$ wt config shell uninstall zsh
```

跳过确认提示：
```console
$ wt config shell uninstall --yes
```

### 版本容忍

卸载能识别 Worktrunk 写入的或 `wt config shell init --help` 中展示的独立安装行，包括旧版生成形态与自定义二进制名。用户改过的初始化行须手动移除。

### 命令参考

```text wt-command-reference
wt config shell uninstall - Remove shell integration from config files

Usage: wt config shell uninstall [OPTIONS] [bash|fish|nu|zsh|powershell]

Arguments:
  [bash|fish|nu|zsh|powershell]
          Shell to uninstall (default: all)

          [possible values: bash, fish, nu, zsh, powershell]

Options:
      --dry-run
          Show what would be changed

  -h, --help
          Print help (see a summary with '-h')
```

## wt config show

查看配置文件与位置。

显示配置来源，并检查无效的 TOML 或 list 列、放错位置或已弃用的
键，以及等待批准的命令。即使失败也会先渲染完每一节；警告以零退出码结束。

### 完整诊断

使用 `--full` 运行诊断检查：

```console
$ wt config show --full
```

它会检测：
- **CI 工具状态** —— 仓库 forge 对应的 CLI（`gh`、`glab`、`tea` 或 `az`）是否已安装并通过认证
- **提交生成** —— LLM 命令能否生成提交信息
- **版本检查** —— GitHub 上是否有更新版本

### 命令参考

```text wt-command-reference
wt config show - Show configuration files & locations

Usage: wt config show [OPTIONS]

Options:
      --full
          Run diagnostic checks (CI tools, commit generation, version)

  -h, --help
          Print help (see a summary with '-h')

Output:
      --format <FORMAT>
          Output format

          [default: text]
          [possible values: text, json]
```

## wt config update

更新已弃用的配置设置。

将用户与项目配置文件中已弃用的设置更新为其当前等价形式，移除没有
等价形式的弃用键，并逐一报告。会展示 diff 并请求确认。

### 示例

预览并应用更新：
```console
$ wt config update
```

不经确认直接应用：
```console
$ wt config update --yes
```

将迁移后的配置写入文件而非原地更新：
```console
$ wt config update --output migrated.toml
```

打印迁移后的配置：
```console
$ wt config update --output=-
```

### 命令参考

```text wt-command-reference
wt config update - Update deprecated config settings

Usage: wt config update [OPTIONS]

Options:
      --output <PATH>
          Output migrated config (- for stdout)

  -h, --help
          Print help (see a summary with '-h')
```

## wt config approvals

管理命令批准。

项目钩子与项目别名在首次运行时会请求批准，以防不受信任的项目执行任意命令。两种流程的批准存储在一起。

### 示例

列出当前项目的命令及其批准状态：
```console
$ wt config approvals list
```

预批准当前项目的全部钩子与别名命令：
```console
$ wt config approvals add
```

免提示预批准，适用于容器或 CI 作业：
```console
$ wt config approvals add --yes
```

清除当前项目的批准：
```console
$ wt config approvals clear
```

只清除已不在项目配置中的命令的批准：
```console
$ wt config approvals clear --stale
```

清除全局批准：
```console
$ wt config approvals clear --global
```

检查无人值守运行是否会停下等待批准：
```console
$ wt config approvals list --format=json | jq -r .state
```

### 批准的工作方式

已批准的命令保存到 `~/.config/worktrunk/approvals.toml`。命令模板变更或项目移动时需要重新批准。

`--yes` 为本次运行批准项目命令但不保存批准。`wt config approvals add --yes` 会保存批准供后续运行使用。

### 读取批准状态

`wt config approvals list` 只读取状态，不提示也不写入，编排器可在调度前据此判断非交互运行是否会因批准而暂停。`--format=json` 输出：

```json
{
  "state": "approval_required",
  "commands": [
    {"phase": "post-start", "name": "dev", "template": "npm run dev", "approved": false},
    {"phase": "pre-merge", "template": "cargo test", "approved": true}
  ],
  "stale": ["some removed command"]
}
```

`state` 为 `no_commands`（项目未声明任何命令）、`approval_required`（至少一条未批准）或 `approved`。未命名命令与提交模板片段没有 `name` 字段。

`stale` 可与任何 `state` 同时出现，列出其命令此后已被编辑或已从项目配置移除的批准。

### 命令参考

```text wt-command-reference
wt config approvals - Manage command approvals

Usage: wt config approvals [OPTIONS] <COMMAND>

Commands:
  list   List project commands and their approval status
  add    Store approvals in approvals.toml
  clear  Clear approved commands from approvals.toml

Options:
  -h, --help
          Print help (see a summary with '-h')
```

## wt config alias

查看与预览别名。

别名是配置在用户（`~/.config/worktrunk/config.toml`）或项目（`.config/wt.toml`）配置中、以 `wt <name>` 形式运行的命令模板。配置格式见[扩展 Worktrunk 指南](/extending/#别名)。

### 示例

显示每个已配置别名的模板：
```console
$ wt config alias show
```

显示 `deploy` 的模板：
```console
$ wt config alias show deploy
```

预览调用而不实际运行：
```console
$ wt config alias dry-run deploy
$ wt config alias dry-run deploy -- --env=staging
```

### 命令参考

```text wt-command-reference
wt config alias - Inspect and preview aliases

Usage: wt config alias [OPTIONS] <COMMAND>

Commands:
  show     Show an alias's template, or all aliases' templates
  dry-run  Preview an alias invocation with template expansion

Options:
  -h, --help
          Print help (see a summary with '-h')
```

## wt config state

管理内部数据与缓存。

状态存储在 `.git/` 中（配置条目与日志文件），与配置文件相互独立。

### 键

- **cache**：[可重建缓存——CI 状态、摘要、git 命令、提示与 `wt switch -` 目标](/config/#wt-config-state-cache)
- **default-branch**：[仓库的默认分支（`main`、`master` 等）](/config/#wt-config-state-default-branch)
- **marker**：[分支的自定义状态标记（显示在 `wt list` 中）](/config/#wt-config-state-marker)
- **vars**：[按分支的自定义变量](/config/#wt-config-state-vars)
- **logs**：[操作与调试日志](/config/#wt-config-state-logs)

### 示例

获取默认分支：
```console
$ wt config state default-branch
```

手动设置默认分支：
```console
$ wt config state default-branch set main
```

为当前分支设置标记：
```console
$ wt config state marker set 🚧
```

存储任意数据：
```console
$ wt config state vars set env=staging
```

丢弃可重建缓存：
```console
$ wt config state cache clear
```

显示全部已存储状态：
```console
$ wt config state get
```

清除全部已存储状态：
```console
$ wt config state clear
```

### 命令参考

```text wt-command-reference
wt config state - Manage internal data and cache

Usage: wt config state [OPTIONS] <COMMAND>

Commands:
  get             Get all stored state
  clear           Clear all stored state
  cache           Regenerable caches
  default-branch  Default branch detection and override
  logs            Operation and debug logs
  marker          Branch markers
  vars            Custom variables per branch

Options:
  -h, --help
          Print help (see a summary with '-h')
```

## wt config state cache

可重建缓存。

在一处查看或丢弃 worktrunk 的可重建缓存。这里的一切都按需重建——清除只会强制重算，绝不丢数据。

### 缓存了什么

- **CI 状态** —— 按分支的 forge CI（30–60 秒 TTL），显示在 [`wt list`](/list/#ci-状态) 中
- **摘要** —— LLM 生成的分支摘要（`wt list --full`、`wt switch` 预览）
- **git 命令** —— 缓存的 merge-tree、祖先关系、diff-stat 与 `wt switch` 预览结果
- **提示** —— 本仓库已展示过的一次性提示
- **上一个分支** —— `wt switch -` 的目标，下次切换时重新记录

`cache clear` 不经提示丢弃上述全部。它会重新展示一次性提示，并遗忘 `wt switch -` 的目标直到下次切换——两者都会自行恢复。

不带子命令时运行 `get`。

### 示例

显示缓存内容：
```console
$ wt config state cache
```

丢弃全部缓存：
```console
$ wt config state cache clear
```

### 命令参考

```text wt-command-reference
wt config state cache - Regenerable caches

Usage: wt config state cache [OPTIONS] [COMMAND]

Commands:
  get    Show cache contents
  clear  Drop all caches

Options:
  -h, --help
          Print help (see a summary with '-h')

Output:
      --format <FORMAT>
          Output format (text, json) [default: text]
```

## wt config state default-branch

默认分支检测与覆盖。

可在脚本中用来避免硬编码 `main` 或 `master`：

```console
$ git rebase $(wt config state default-branch)
```

在钩子或别名模板中，优先使用 `{{ default_branch }}` [模板变量](/hook/#模板变量)；`$(wt config state default-branch)` 适用于普通 shell 脚本。

不带子命令时运行 `get`。`set` 将覆盖值存入仓库的本地 git 配置。该覆盖不添加项目文件，且对克隆中每个关联的 worktree 都生效。`clear` 之后 `get` 会重新检测。`wt list` 做比较时该分支必须在本地存在。

### 检测

Worktrunk 自动检测默认分支：

1. **Worktrunk 缓存** —— 检查 `git config worktrunk.default-branch`
2. **git 缓存** —— 检测主远程并检查其 HEAD（如 `origin/HEAD`）
3. **远程查询** —— 若无缓存，查询 `git ls-remote`，10 秒后放弃
4. **本地推断** —— 若无远程或查询已被放弃，从本地分支推断

检测结果一经得出即缓存到 `worktrunk.default-branch`——唯一例外是远程查询被放弃后推断出的值，这样一次故障不会把猜测变成永久值。`origin/HEAD` 之后的变更不会被自动感知：`wt config state` 会标记不一致，`set` 采纳新分支，`clear` 重新检测。

本地推断回退按顺序使用以下启发式规则：
- 若只有一个本地分支，直接使用它
- bare 仓库或空仓库，检查 `symbolic-ref HEAD`
- 检查 `git config init.defaultBranch`
- 查找常见名称：`main`、`master`、`develop`、`trunk`

若都不匹配则检测失败；请用 `wt config state default-branch set BRANCH` 显式设置。

### 命令参考

```text wt-command-reference
wt config state default-branch - Default branch detection and override

Usage: wt config state default-branch [OPTIONS] [COMMAND]

Commands:
  get    Get the default branch
  set    Set the default branch
  clear  Clear the default branch cache

Options:
  -h, --help
          Print help (see a summary with '-h')
```

## wt config state logs

操作与调试日志。

查看与管理日志文件——钩子输出、命令审计记录与调试诊断。

### 记录了什么

三类日志位于 `.git/wt/logs/`：

#### 命令日志（`commands.jsonl`）

所有钩子执行与 LLM 命令都会自动记录——每行一个 JSON 对象。达到 1MB 时轮转为 `commands.jsonl.old`（总计约 2MB）。字段：

| 字段 | 说明 |
|-------|-------------|
| `ts` | ISO 8601 时间戳 |
| `wt` | 触发本次记录的 `wt` 命令（如 `wt hook pre-merge --yes`） |
| `label` | 所运行的内容（如 `pre-merge user:lint`、`commit.generation`） |
| `cmd` | 执行的 shell 命令 |
| `exit` | 退出码（后台命令为 `null`） |
| `dur_ms` | 时长（毫秒；后台命令为 `null`） |

命令日志只追加条目，且不区分分支——它记录所有 worktree 的全部活动。

#### 钩子输出日志

钩子输出位于 `.git/wt/logs/{branch}/` 下按分支的子目录中：

| 操作 | 日志路径 |
|-----------|----------|
| 后台钩子 | `{branch}/{source}/{hook-type}/{name}.log` |
| 后台移除 | `{branch}/internal/remove.log` |

所有 `post-*` 钩子（post-start、post-switch、post-commit、post-merge、post-remove）都在后台运行并产生日志文件。source 为 `user` 或 `project`。分支名与钩子名会做文件系统安全化处理。同一分支上的同一操作会覆盖先前的日志。删除分支会清空其子目录；已删分支遗留的孤儿日志可用 `wt config state logs clear` 清扫。

#### 诊断文件

| 文件 | 产生时机 |
|------|-------------|
| `trace.log` | 以 `-vv` 运行时 |
| `trace.jsonl` | 以 `-vv` 运行时 |
| `subprocess.log` | 以 `-vv` 运行时 |
| `diagnostic.md` | 以 `-vv` 运行时 |

`trace.log` 是命令及其耗时的人类可读追踪。`trace.jsonl` 以 JSON 行保存同样的事件，`wt config state logs profile` 会将其汇总为性能报告。`subprocess.log` 保存完整的子进程输出。`diagnostic.md` 是缺陷报告打包；`wt` 会打印用于它的 `gh gist create` 命令。四者都在每次 `-vv` 运行时被覆盖。

### 位置

所有日志存储在 `.git/wt/logs/`（主 worktree 的 git 目录中）。所有 worktree 都写入同一目录。

### 结构化输出

`wt config state logs --format=json` 输出三个数组——`command_log`、`hook_output`、`diagnostic`。每个条目带 `file`（相对路径）、`path`（绝对路径）、`size` 与 `modified_at`（unix 秒）。钩子输出条目还额外暴露 `branch`、`source`（`user` / `project` / `internal`）、`hook_type`（`post-*` 类；内部操作为 `null`）与 `name`。`branch` 是分支名，当没有本地分支写入该日志目录时（例如分支已删除）为 `null`。`name` 是日志路径中出现的钩子名，仅当配置名含文件名不安全字符时才会与配置名不同。可用 `jq` 过滤出特定条目。

### 示例

列出全部日志文件：
```console
$ wt config state logs
```

查询命令日志：
```console
$ tail -5 .git/wt/logs/commands.jsonl | jq .
```

某个钩子日志的路径（例如当前分支的 `post-start` `server` 钩子）：
```console
$ wt config state logs --format=json | jq -r --arg branch "$(git branch --show-current)" '.hook_output[] | select([.branch, .source, .hook_type, .name] == [$branch, "user", "post-start", "server"]) | .path'
```

特定分支的日志：
```console
$ wt config state logs --format=json | jq '.hook_output[] | select(.branch == "feature/auth")'
```

清除全部日志：
```console
$ wt config state logs clear
```

### 命令参考

```text wt-command-reference
wt config state logs - Operation and debug logs

Usage: wt config state logs [OPTIONS] [COMMAND]

Commands:
  get      List all log file paths
  profile  Performance profile from a trace
  clear    Clear all log files

Options:
  -h, --help
          Print help (see a summary with '-h')

Output:
      --format <FORMAT>
          Output format (text, json) [default: text]
```

## wt config state marker

分支标记。

显示在 `wt list` Status 列的自定义状态文字或 emoji。

### 显示

标记出现在 Status 列末尾、git 符号之后：

```console
$ wt list
  Branch       Status      HEAD±     main↕    main…±    Remote⇅  Commit    Age  Message
@ main             ^⇡                                    ⇡1      33323bc    1d  Initial commit
+ feature-api      ↑ 🤖              ↑1        +1                70343f0    1d  Add REST API endpo…
+ review-ui      ? ↑ 💬    +1        ↑1        +1                a585d6e    1d  Add dashboard comp…
+ wip-docs       ? –       +1                                    33323bc    1d  Initial commit

○ Showing 4 worktrees, 2 with changes, 2 ahead, hidden: Path
```

### 用途

- **工作状态** —— `🚧` 进行中、`✅` 可评审、`🔥` 紧急
- **agent 跟踪** —— [agent 插件](/claude-code/)会自动设置标记
- **备注** —— 任意短文本：`"blocked"`、`"needs tests"`

### 存储

以 `worktrunk.state.<branch>.marker` 存于 git 配置。可直接设置：

```console
$ git config worktrunk.state.feature.marker '{"marker":"🚧","set_at":0}'
```

`wt` 删除分支时会清除该分支的标记。

不带子命令时对当前分支运行 `get`。要用 `--branch`，请使用 `get --branch=NAME`。

### 命令参考

```text wt-command-reference
wt config state marker - Branch markers

Usage: wt config state marker [OPTIONS] [COMMAND]

Commands:
  get    Get marker for a branch
  set    Set marker for a branch
  clear  Clear marker for a branch

Options:
  -h, --help
          Print help (see a summary with '-h')

Output:
      --format <FORMAT>
          Output format (text, json) [default: text]
```

## wt config state vars

按分支的自定义变量。

按分支存储自定义变量。值原样存储——纯字符串或 JSON。

### 示例

设置与读取值：
```console
$ wt config state vars set env=staging
$ wt config state vars get env
```

存储 JSON：
```console
$ wt config state vars set config='{"port": 3000, "debug": true}'
```

列出全部键：
```console
$ wt config state vars list
```

操作其他分支：
```console
$ wt config state vars set env=production --branch=main
```

### 模板访问

变量在[钩子模板](/hook/#模板变量)中以 `{{ vars.<key> }}` 可用。对可能未设置的键使用 `default` 过滤器：

```toml
# .config/wt.toml
[post-start]
dev = "ENV={{ vars.env | default('development') }} npm start -- --port {{ vars.port | default('3000') }}"
```

JSON 对象与数组值支持点访问：

```console
$ wt config state vars set config='{"port": 3000, "debug": true}'
```
```toml
# .config/wt.toml
[post-start]
dev = "npm start -- --port {{ vars.config.port }}"
```

### 存储格式

以 `worktrunk.state.<branch>.vars.<key>` 存于 git 配置。键只能包含字母、数字与连字符。

### 命令参考

```text wt-command-reference
wt config state vars - Custom variables per branch

Usage: wt config state vars [OPTIONS] <COMMAND>

Commands:
  get    Get a value
  list   List all keys
  set    Set a value
  clear  Clear a key or all keys

Options:
  -h, --help
          Print help (see a summary with '-h')
```

<!-- END AUTO-GENERATED -->
