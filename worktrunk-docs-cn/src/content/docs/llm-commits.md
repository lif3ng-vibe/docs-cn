---
title: "LLM 提交信息"
description: "使用任意 LLM 从 diff 生成提交信息。与 wt merge、wt step commit 和 wt step squash 集成。"
sidebar:
  order: 23
---
Worktrunk 会先构建模板化提示词，再通过管道传给外部命令来生成提交信息。该功能与 `wt merge`、`wt step commit` 和 `wt step squash` 集成。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-commit.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-commit.gif" alt="LLM 提交信息生成演示" width="1600" height="900">
</picture>
<figcaption>审阅暂存的 diff、生成提交信息并提交</figcaption>
</figure>

## 设置

任何从 stdin 读取提示词并输出提交信息的命令都可用。添加到 `~/.config/worktrunk/config.toml`：

### Claude Code

```toml
# ~/.config/worktrunk/config.toml
[commit.generation]
command = "MAX_THINKING_TOKENS=0 claude -p --no-session-persistence --model=haiku --tools='' --safe-mode --setting-sources='user' --system-prompt=''"
```

`--no-session-persistence` 防止提交对话污染 `claude --continue`。`--safe-mode` 让本次运行保持封闭——不加载 hooks、插件、MCP、skills 或 CLAUDE.md——同时认证照常工作，因此通过 `apiKeyHelper`（而不只是 OAuth 或 `ANTHROPIC_API_KEY`）完成认证的环境仍能拿到密钥。`--setting-sources='user'` 将设置范围限定为你的用户配置，使项目中的 `.claude/settings.json` 无法覆盖认证。其余标志会禁用工具、系统提示词与思考，以快速获得纯文本输出。`--safe-mode` 需要 Claude Code ≥ 2.1.169。安装说明见 [Claude Code 文档](https://code.claude.com/docs/en/setup)。

### Codex

创建 `~/.codex/worktrunk-commit-instructions.txt`，内容仅为一个 `.`（不含换行符）。接受 Worktrunk 首次运行时的 Codex 设置即可自动为你创建该文件。

```toml
# ~/.config/worktrunk/config.toml
[commit.generation]
command = "codex exec -m gpt-6-luna -c model_reasoning_effort='none' -c project_doc_max_bytes=0 -c skills.max_context_tokens=1 -c agents.enabled=false -c features.goals=false -c web_search=disabled -c 'model_instructions_file=\"~/.codex/worktrunk-commit-instructions.txt\"' -c features.shell_tool=false -c features.unified_exec=false -c features.apps=false -c features.plugins=false --ephemeral --sandbox=read-only --json - | jq -sr '[.[] | select(.item.type? == \"agent_message\")] | last.item.text'"
```

需要 `jq` 来解析 JSON。另见 [Codex CLI 文档](https://developers.openai.com/codex/cli/)。

### 其他工具

以下任意一项都可以替换上面的 `command` 行：

```toml
# opencode — use a fast model variant
command = "opencode run -m anthropic/claude-haiku-5-5 --variant fast"

# llm
command = "llm -m claude-haiku-4.5"

# aichat
command = "aichat -m claude:claude-haiku-4.5 --code"
```

## 用法

这些示例假设某个功能 worktree 中有待提交的更改。

### wt merge

将所有更改（未提交更改 + 已有提交）squash 为一条带 LLM 生成信息的提交，然后合并到默认分支：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__merge__docs_merge_squash_llm.snap — edit source to update -->

```console
$ wt merge
◎ Squashing 3 commits into a single commit (5 files, +16)...
◎ Generating squash commit message...
  feat(auth): Implement JWT authentication system

  Add comprehensive JWT token handling including validation, refresh
  logic, and authentication tests.
✓ Squashed @ a1b2c3d
◎ Merging 1 commit to main @ a1b2c3d (no rebase needed)
  * a1b2c3d feat(auth): Implement JWT authentication system
   auth.rs             | 2 ++
   auth_test.rs        | 2 ++
   integration_test.rs | 6 ++++++
   jwt.rs              | 3 +++
   jwt_test.rs         | 3 +++
   5 files changed, 16 insertions(+)
✓ Merged to main (1 commit, 5 files, +16)
◎ Removing feature worktree & branch in background (same commit as main, _)
○ Switched to worktree for main @ ~/repo
```

<!-- END AUTO-GENERATED -->

### wt step commit

暂存更改并以 LLM 生成的信息提交：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__merge__docs_step_commit_llm.snap — edit source to update -->

```console
$ wt step commit
◎ Generating commit message and committing changes... (2 files, +26)
  feat(validation): add input validation utilities
✓ Committed changes @ a1b2c3d
```

<!-- END AUTO-GENERATED -->

### wt step squash

将分支上的提交 squash 成一个带 LLM 生成信息的提交：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__merge__docs_step_squash_llm.snap — edit source to update -->

```console
$ wt step squash
◎ Squashing 3 commits into a single commit (5 files, +16)...
◎ Generating squash commit message...
  feat(auth): Implement JWT authentication system

  Add comprehensive JWT token handling including validation, refresh
  logic, and authentication tests.
✓ Squashed @ a1b2c3d
```

<!-- END AUTO-GENERATED -->

完整文档见 [`wt merge`](/merge/) 和 [`wt step`](/step/)。

## 分支摘要

配置 `summary = true` 和 `[commit.generation] command` 后，Worktrunk 会生成 LLM 分支摘要——每个分支自默认分支以来更改的一行式描述。

摘要出现在：

- **`wt switch`** 的[交互式选择器](/switch/#交互式选择器)——`summary` 预览标签页
- **`wt list --full`**——Summary 列（参见 [`wt list`](/list/#llm-摘要)）

在用户配置中启用：

```toml
# ~/.config/worktrunk/config.toml
[list]
summary = true
```

摘要会被缓存，仅在 diff 变化时重新生成。

## 提示词模板

Worktrunk 使用 [minijinja](https://docs.rs/minijinja/) 模板（语法类似 Jinja2）来构建提示词。

### 自定义模板

用内联模板覆盖默认模板：

```toml
# ~/.config/worktrunk/config.toml
[commit.generation]
command = "llm -m claude-haiku-4.5"

template = """
Write a commit message for this diff. One line, under 50 chars.

Branch: {{ branch }}
Diff:
{{ git_diff }}
"""

squash-template = """
Combine these {{ commit_details | length }} commits into one message:
{% for c in commit_details %}
- {{ c.subject }}
{% endfor %}

Diff:
{{ git_diff }}
"""
```

### 模板变量

| 变量 | 说明 |
|----------|-------------|
| `{{ git_diff }}` | diff 内容（暂存的更改，或 squash 时的合并 diff） |
| `{{ git_diff_stat }}` | diff 统计（变更文件数、插入行数、删除行数） |
| `{{ branch }}` | 当前分支名 |
| `{{ repo }}` | 仓库名 |
| `{{ recent_commits }}` | 最近的提交主题（用作风格参考） |
| `{{ commit_details }}` | 被 squash 的提交（仅 squash 模板）；每一项渲染为其主题，并暴露 `.subject` / `.body` |
| `{{ target_branch }}` | 合并目标分支（仅 squash 模板） |
| `{{ user_guidance }}` | 渲染后的用户 `template-append` 片段（见下文） |
| `{{ project_guidance }}` | 渲染后的项目 `template-append` 片段（见下文） |

### 模板语法

模板使用 [minijinja](https://docs.rs/minijinja/latest/minijinja/syntax/index.html)，它支持：

- **变量**：`{{ branch }}`、`{{ repo | upper }}`
- **过滤器**：`{{ commit_details | length }}`、`{{ repo | upper }}`
- **条件**：`{% if recent_commits %}...{% endif %}`
- **循环**：`{% for c in commit_details %}{{ c.subject }}{% endfor %}`
- **循环变量**：`{{ loop.index }}`、`{{ loop.length }}`
- **空白控制**：`{%- ... -%}` 去除两侧空白

完整的默认模板见 `wt config create --help`。

## 追加到提示词

`template-append` 会向默认的提交与 squash 提示词追加指令。在用户配置中设置可表达个人偏好，在 `.config/wt.toml` 中设置可作为整个项目共享的约定。片段支持与主提示词相同的模板变量。

```toml
# .config/wt.toml
[commit.generation]
template-append = """
- Use conventional commits (feat:, fix:, docs:, …)
- Reference the related issue ID in the body
"""
```

两者都配置时，用户指令排在项目指令之前。

用户片段无需审批——它就是开发者自己的配置。至于项目片段，渲染后的文本首次发送给 LLM 时，Worktrunk 会在审批提示中展示原始片段——与项目定义的钩子（hook）相同的一次性门禁。后续提交不会再次弹出提示，除非片段内容发生变化。拒绝也不会造成致命影响：LLM 将只带用户片段（如果有的话）运行。

不引用 `{{ user_guidance }}` / `{{ project_guidance }}` 的自定义用户模板即等于退出追加块——渲染后的值只会注入到模板中放置它们的位置。

## 回退行为

未配置 LLM 时，worktrunk 会生成确定性信息：提交以所更改的文件命名（如 “Changes to auth.rs & config.rs”），squash 的主题为 `Squash commits from <branch>`，并在正文中列出被合并的各条提交。
