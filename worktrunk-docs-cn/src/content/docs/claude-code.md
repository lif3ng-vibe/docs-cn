---
title: "Agent 集成"
description: "Worktrunk 为 Claude Code、Codex、OpenCode、Pi、oh-my-pi 与 Gemini CLI 提供插件：一个配置技能、wt list 活动追踪，以及面向 Claude Code 与 OpenCode 的 worktree 隔离。"
sidebar:
  order: 21
---
Worktrunk 为每个受支持的 agent CLI 提供一个插件。插件能提供什么，取决于该 CLI 暴露了哪些钩子（hook）：

| 能力 | Claude Code | Codex | OpenCode | Pi | oh-my-pi | Gemini CLI |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 配置技能 | ✓ | ✓ |  |  |  | ✓ |
| 活动追踪（`wt list` 中的 🤖/💬） | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| worktree 隔离 | ✓ |  | ✓ |  |  |  |
| /wt-switch-create 技能 | ✓ |  |  |  |  |  |
| /wt-diff 面板 | ✓ |  |  |  |  |  |

配置技能是一份供 agent 阅读的文档，用于帮助完成 LLM 提交配置、钩子配置与故障排查。活动追踪显示哪些 worktree 中有正在运行的会话。worktree 隔离需要 worktree 生命周期钩子，而只有 Claude Code 和 OpenCode 2 暴露这类钩子，因此 Codex、Pi、oh-my-pi 与 Gemini 用户需直接调用 `wt switch --create` 和 `wt remove`。

## 安装

### Claude Code

```bash
wt config plugins claude install
```

手动等效命令：

```bash
claude plugin marketplace add max-sixty/worktrunk
claude plugin install worktrunk@worktrunk
```

`wt config plugins claude uninstall` 会移除插件及其 marketplace 条目。

### Codex

```bash
wt config plugins codex install
```

手动等效命令：

```bash
codex plugin marketplace add max-sixty/worktrunk
codex plugin add worktrunk@worktrunk
```

`wt config plugins codex uninstall` 会移除插件及其 marketplace 条目。

### OpenCode

```bash
wt config plugins opencode install
```

这会将插件写入 OpenCode 的全局插件目录 `~/.config/opencode/plugins/worktrunk.ts`（遵循 `$OPENCODE_CONFIG_DIR` 与 `$XDG_CONFIG_HOME`）。`wt config plugins opencode uninstall` 会将其移除。

### Pi

```bash
wt config plugins pi install
```

这会将活动扩展写入 `~/.pi/agent/extensions/worktrunk.ts`，Pi 启动时会在该处发现它；`$PI_CODING_AGENT_DIR` 用于替换 agent 目录。`wt config plugins pi uninstall` 会移除该扩展。

### oh-my-pi

```bash
wt config plugins omp install
```

oh-my-pi（`omp`）是一个派生自 Pi 的 agent，拥有自己的配置根目录与钩子 API，因此需要一条单独的命令。这会将活动钩子写入 `~/.omp/agent/hooks/pre/worktrunk.ts`。指定了 `$OMP_PROFILE` 或 `$PI_PROFILE` 的 profile 会使用 `~/.omp/profiles/<profile>/agent`；`$PI_CONFIG_DIR` 更改 `.omp` 配置根目录；`$PI_CODING_AGENT_DIR` 覆盖默认 profile 的 agent 目录。`wt config plugins omp uninstall` 会移除该钩子。

### Gemini CLI

```bash
gemini extensions install https://github.com/max-sixty/worktrunk
```

Gemini 会直接从仓库原生加载扩展，因此没有 `wt` 包装命令。`gemini extensions uninstall worktrunk` 会将其移除。

## 配置技能

借助 `/worktrunk` 技能，agent 可以帮助完成：

- 配置 LLM 生成的提交信息
- 添加项目钩子（pre-start、pre-merge、pre-commit）
- 配置 worktree 路径模板
- 修复 Shell 集成问题

Claude Code 的设计是：在检测到与 worktrunk 相关的问题时自动加载该技能。

## 活动追踪

每个插件都会通过 `wt list` 中的状态标记来追踪 agent 会话：

<!-- ⚠️ AUTO-GENERATED from tests/snapshots/integration__integration_tests__list__list_with_user_marker.snap — edit source to update -->

```console
$ wt list
  Branch       Status      HEAD±     main↕    main…±    Remote⇅  Commit    Age  Message
@ main             ^⇡                                    ⇡1      33323bc    1d  Initial commit
+ feature-api      ↑ 🤖              ↑1        +1                70343f0    1d  Add REST API endpo…
+ review-ui      ? ↑ 💬    +1        ↑1        +1                a585d6e    1d  Add dashboard comp…
+ wip-docs       ? –       +1                                    33323bc    1d  Initial commit

○ Showing 4 worktrees, 2 with changes, 2 ahead, hidden: Path
```

<!-- END AUTO-GENERATED -->

- 🤖——agent 正在工作
- 💬——agent 正在等待或空闲

会话结束时，每个插件都会清除标记。如果 agent 进程在其会话结束钩子运行之前被杀死，就可能残留过期标记。无论哪种情况，都可以用 `wt config state marker clear` 手动移除标记。

### 手动状态标记

可为任意工作流手动设置状态标记：

```console
$ wt config state marker set "🚧"                   # Current branch
$ wt config state marker set "✅" --branch feature  # Specific branch
$ git config worktrunk.state.feature.marker '{"marker":"💬","set_at":0}'  # Direct
```

### 无插件的 agent CLI

对于其他 agent CLI，可将以下命令配置为在会话事件发生时运行：

| 宿主事件 | 命令 |
|---|---|
| 会话开始，或 agent 恢复工作 | `wt config state marker set "🤖"` |
| agent 完成一轮并等待输入 | `wt config state marker set "💬"` |
| 会话结束 | `wt config state marker clear` |

## worktree 隔离（Claude Code 与 OpenCode）

Claude Code 的 agent 可以在隔离的 worktree 中运行（`isolation: "worktree"`）。默认情况下，Claude Code 使用 `git worktree add` 创建这些 worktree。插件的 `WorktreeCreate` 和 `WorktreeRemove` 钩子会将这一操作改为经由 `wt switch --create` 和 `wt remove`，这样 agent 创建的 worktree 就会获得 worktrunk 的命名约定、钩子与生命周期管理。如果分支已经存在，钩子会运行不带 `--create` 的 `wt switch`，它返回该分支的 worktree，若分支还没有 worktree 则会创建一个。

在 OpenCode 2 下，插件会注册一个 `worktrunk` worktree 策略，因此 OpenCode 创建和移除 worktree 时走的也是同样的命令。每个 worktree 都会得到一个以 OpenCode 选定的 worktree 名称命名的分支，位于 `worktree-path` 给出的路径；OpenCode 的 `worktree.directory` 设置会被忽略。新分支从默认分支（或 OpenCode 传入的起始 ref）起步，而不是从当前检出的 HEAD。移除脏 worktree 时会以 worktrunk 的报错信息失败，而不会提供强制移除的选项。

## /wt-switch-create 技能（仅 Claude Code）

`/wt-switch-create [<branch>] [<repo>] [-- <task>]` 在一个全新的 worktree 中启动任务，而无需离开当前会话：它会创建 worktree、切换进去并运行任务（所有参数均可省略）。该 worktree 会出现在 `wt list` 中；用 `wt merge` / `wt remove` 合并或移除它。

会话按路径进入 `.claude/worktrees/` 之外的既有 worktree 之前，Claude Code 会请求确认——而在 worktrunk 的默认布局下，每个 worktree 都在该目录之外。对于当前会话所在仓库、且恰好位于 `worktree-path` 为其分支安排的位置上的 worktree，插件的 `PermissionRequest` 钩子会代为应答“是”，后台会话因此不会停在这个提示上。进入任何其他 worktree 仍会请求确认。

## /wt-diff 面板（仅 Claude Code）

`/wt-diff` 会在对话旁打开一个面板，列出该会话工作过的 worktree，并在下方显示选中 worktree 的 [`wt step diff`](/step/#wt-step-diff)：自分支离开默认分支以来的全部内容——已提交、未提交与未跟踪的变更。`/wt-diff <branch>` 可选择另一个 worktree。

当会话启动或切换进入某个 worktree，或者会话本身及其某个子 agent 在其中编辑文件、或在其中运行非只读命令时，该 worktree 就会加入列表。在面板首次打开之前，它只会记下这些目录，不会运行 `git` 或 `wt`。

| 按键 | 操作 |
|---|---|
| `1`–`9` | 选择某个 worktree |
| `j` / `k` | 下一个或上一个文件 |
| `ctrl+↓` / `ctrl+↑` | 在提示符内跳到下一个或上一个文件 |
| `r` | 刷新 |
| ↑ ↓、PageUp、PageDown | 滚动 |

其余按键在面板持有键盘焦点时生效，而面板在打开时即取得焦点。再次运行 `/wt-diff` 会交还焦点，`ctrl+x tab` 也可以——当其他插件在提示符上方绘制了一行时，该快捷键会先把焦点从提示符移到那一行，再移到面板。`esc` 返回提示符。

该面板要求 Claude Code 版本支持加载插件钩子模块；更早的版本仍会加载插件的其余部分，但没有这个面板。

## statusline（仅 Claude Code）

`wt list statusline --format=claude-code` 为 Claude Code statusline 输出单行状态。Claude Code 会在后台运行它，因此偶尔出现的 1–2 秒 CI 拉取不会被察觉。

<code>~/w/myproject.feature-auth  !🤖  @<span style='color:#0a0'>+42</span> <span style='color:#a00'>-8</span>  <span style='color:#0a0'>↑3</span>  <span style='color:#0a0'>⇡1</span>  <span style='color:#0a0'>#3035</span>  Opus  🌔 65%  <span style='color:#a70'>1.4×(10am–3pm)</span></code>

statusline 显示 worktree 状态、模型、上下文用量和速率限制节奏。详见 [`wt list statusline`](/list/#wt-list-statusline)。

<figure class="demo">
<picture>
  <source srcset="/assets/docs/dark/wt-statusline.gif" media="(prefers-color-scheme: dark)">
  <img src="/assets/docs/light/wt-statusline.gif" alt="Claude Code statusline demo" width="1600" height="900">
</picture>
<figcaption>切换到某个 worktree，再启动已配置 statusline 的 Claude Code</figcaption>
</figure>

添加到 `~/.claude/settings.json`：

```json title="~/.claude/settings.json"
{
  "statusLine": {
    "type": "command",
    "command": "wt list statusline --format=claude-code"
  }
}
```
