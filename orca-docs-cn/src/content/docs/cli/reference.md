---
title: "CLI 参考"
description: "从 shell 驱动 Orca 的命令、选择器与适合智能体的使用模式。"
source: "https://www.onorca.dev/docs/cli/reference"
---

# CLI 参考

从 shell 驱动 Orca 的命令、选择器与适合智能体的使用模式。

`orca` CLI 与运行中的 Orca 运行时通信。当 shell 脚本或智能体需要检查 worktree、启动终端、打开文件、自动化内置浏览器，或把进度回报给 Orca 时使用它。

## 验证运行时

先在 [Settings -> Experimental -> CLI](/settings) 中注册 CLI，再确认它能连上 Orca：

```
command -v orca
orca status --json
```

如果 Orca 尚未运行：

```
orca open --json
orca status --json
```

当结果要交给其他工具解析时使用 `--json`；人类可读输出用于终端快速检查。

## 选择器

大多数命令接受选择器，而不要求完整的长 ID：

```
orca repo show --repo id:<repoId> --json
orca worktree show --worktree active --json
orca worktree show --worktree path:/abs/path/to/worktree --json
orca worktree show --worktree branch:feature-name --json
orca worktree show --worktree issue:123 --json
```

`active` 和 `current` 会根据 shell 的当前目录或终端上下文解析出所在的 Orca 托管 worktree。可能运行在目标 worktree 之外的脚本请使用显式选择器。对于远程运行时，优先使用完整的服务器端选择器，例如 `id:<repoId>::<absolute-worktree-path>` 或 `path:<absolute-server-path>`，因为本地 shell 的当前目录在运行时主机上未必存在。

## 运行时命令

```
orca open --json
orca status --json
orca serve --port 6768 --pairing-address 100.64.1.20 --json
```

`orca serve` 在前台启动运行时服务器，不打开桌面窗口。用于[远程 Orca 服务器](/remote-servers)或无头环境，按 `Ctrl-C` 停止。

## 仓库

```
orca repo list --json
orca repo add --path /abs/path/to/repo --json
orca repo show --repo id:<repoId> --json
orca repo set-base-ref --repo id:<repoId> --ref origin/main --json
orca repo search-refs --repo id:<repoId> --query main --limit 10 --json
```

在批量创建 worktree 之前先设置仓库的基准引用（base ref），让新任务默认从正确的位置分叉。

## Worktree

```
orca worktree list --repo id:<repoId> --json
orca worktree ps --json
orca worktree current --json
orca worktree show --worktree active --json
orca worktree create --repo id:<repoId> --name fix-login --json
orca worktree create --name child-task --agent codex --prompt "Investigate the flaky login test" --json
orca worktree set --worktree active --comment "reproduced failure; testing token refresh fix" --json
orca worktree rm --worktree id:<worktreeId> --force --json
```

当 `worktree create` 在某个 Orca 托管 worktree 内部执行时，只要能推断出关系，Orca 就会把新 worktree 记录为子级。想显式指定就加 `--parent-worktree active`；新工作独立时用 `--no-parent`。

智能体启动标志：

```
orca worktree create --name review-api --agent claude --setup run --json
orca worktree create --name quick-check --agent codex --prompt "Summarize the diff" --setup skip --json
orca worktree create --name hidden-setup --setup inherit --json
```

`--agent` 会在第一个终端里启动所选智能体。`--prompt` 向该智能体发送初始工作。`--setup run|skip|inherit` 控制仓库 setup 钩子；`inherit` 遵循仓库策略。

## 终端

```
orca terminal list --worktree active --json
orca terminal show --terminal <handle> --json
orca terminal read --terminal <handle> --json
orca terminal read --terminal <handle> --cursor <cursor> --limit 1000 --json
orca terminal send --terminal <handle> --text "continue" --enter --json
orca terminal wait --terminal <handle> --for tui-idle --timeout-ms 300000 --json
orca terminal create --worktree active --title "tests" --command "npm test" --json
orca terminal split --terminal <handle> --direction horizontal --command "npm run dev" --json
orca terminal rename --terminal <handle> --title "runner" --json
orca terminal switch --terminal <handle> --json
orca terminal close --terminal <handle> --json
```

省略 `--terminal` 即以当前 worktree 的活动终端为目标。不确定终端在等什么时，先读再发。

> **终端句柄** 终端句柄的作用域是运行时。如果 Orca 重启，或某条命令报告句柄已失效，运行 `orca terminal list --json` 重新获取句柄。

输出很长时用游标读取：保存一次读取返回的 `nextCursor`，之后带 `--cursor` 传回，即可只获取新增输出。

## 文件

```
orca file open src/App.tsx --worktree active --json
orca file diff src/App.tsx --staged --worktree active --json
orca file open-changed --mode both --worktree active --json
```

路径相对所选 worktree。`open-changed` 读取 git status，并以编辑、Diff 或两者兼有的模式打开变更文件。

## 内置浏览器

浏览器命令控制所选 worktree 对应的 Orca 内嵌浏览器标签页，不控制 Chrome、Safari 或 Orca 桌面 UI。

使用"快照 → 操作 → 快照"循环：

```
orca goto --url http://localhost:3000 --worktree active --json
orca snapshot --worktree active --json
orca click --element @e3 --worktree active --json
orca fill --element @e1 --value "user@example.com" --worktree active --json
orca wait --text "Welcome" --worktree active --json
orca screenshot --worktree active --json
```

`@e3` 这类 ref 来自 `snapshot`。导航、切换标签页、引起页面变化的点击之后，以及遇到 ref 失效错误时，都要重新快照。

标签页与抓取命令：

```
orca tab list --worktree active --json
orca tab create --url http://localhost:3000 --worktree active --json
orca tab switch --index 1 --worktree active --json
orca capture start --worktree active --json
orca console --limit 50 --worktree active --json
orca network --limit 50 --worktree active --json
orca full-screenshot --worktree active --json
orca pdf --worktree active --json
```

仅当某个浏览器操作还没有对应的 Orca 类型化命令时，才使用 `orca exec --command "<agent-browser command>" --json`。

浏览器设备仿真：

```
orca set device --name "iPhone 12" --worktree active --json
orca screenshot --worktree active --json
```

## 桌面计算机使用

对内置浏览器之外的本地桌面应用，使用 `orca computer`：

```
orca computer permissions --json
orca computer list-apps --json
orca computer get-app-state --app com.apple.Safari --json
orca computer click --app com.apple.Safari --element-index 12 --json
orca computer paste-text --app com.apple.Safari --text "hello" --json
```

完整工作流与权限设置见[计算机使用](/cli/computer-use)。

## 移动模拟器

移动模拟器命令通过 Orca 以 worktree 为作用域的桥接控制 iOS Simulator 设备。当智能体在 Orca 内部操作时，请用这些命令而不是裸的 `serve-sim` 或 `simctl`，这样生命周期与活动设备状态始终挂在当前 worktree 上。

```
orca emulator list --worktree active --json
orca emulator attach "<device-name-or-udid>" --worktree active --json
orca emulator tap 0.5 0.7 --worktree active --json
orca emulator type "hello" --worktree active --json
orca emulator gesture '[{"type":"begin","x":0.5,"y":0.8},{"type":"move","x":0.5,"y":0.4},{"type":"end","x":0.5,"y":0.2}]' --worktree active --json
orca emulator button home --worktree active --json
orca emulator rotate landscape_left --worktree active --json
orca emulator exec --command "tap 0.5 0.7" --worktree active --json
orca emulator kill --worktree active --json
orca emulator shutdown --worktree active --json
```

坐标归一化到 `0` 到 `1` 之间。单击优先用 `tap`，拖动或多步触摸输入用 `gesture`。脚本必须指向特定模拟器而非 worktree 的活动模拟器时，传入 `--device <udid-or-name>` 或 `--emulator <id>`。

## Linear

`orca linear` 命令面即智能体通过 `orca-linear` 技能使用的能力（旧安装名 `linear-tickets` 仍然有效）。优先使用 `--json`。已关联的 worktree 用 `--current` 解析。

### 读取

```
orca linear issue --current --full --json
orca linear issue ENG-123 --comments --children --relations --activity --json
orca linear search "auth bug" --workspace all --json
orca linear list --filter assigned --limit 10 --json
orca linear list-issues --team ENG --state started --assignee me --json
orca linear list-issues --query auth --updated-at -P7D --cursor <cursor> --workspace <id> --json
orca linear team list --json
orca linear team states --team ENG --json
orca linear team labels --team ENG --json
orca linear project list --query launch --json
```

`--full` 展开评论、子事项、附件、关联与动态。分区标志（`--comments`、`--children`、`--attachments`、`--relations`、`--activity`）也可单独使用。

### MCP 风格写入

```
# 创建或更新（省略 id/--current 即为创建；创建时必须提供 --team 与 --title）
orca linear save-issue --team ENG --title "Fix auth" --priority high --json
orca linear save-issue ENG-123 --state "In Progress" --assignee me --json
orca linear save-issue --current --project null --due-date null --json

orca linear relation add ENG-1 --related ENG-2 --type blocks --json
orca linear relation remove ENG-1 --related ENG-2 --type related --json
```

`save-issue` 的标签会**整体替换**标签集（Linear MCP `save_issue` 语义）。字面量 `null` 用于清除经办人、预估、截止日期、项目或父事项。

### 字段辅助命令（仍然有效）

```
orca linear status set --current --to "In Progress" --json
orca linear assignee set --current --me --json
orca linear priority set ENG-123 --to high --json
orca linear estimate set --current --to 3 --json
orca linear due-date set --current --to 2026-08-01 --json
orca linear label add --current --label backend --json
orca linear comment add --current --body "Investigating regression" --json
orca linear attach --current --url https://example.com/repro --title "Repro" --json
orca linear create --title "Flaky login test" --team ENG --priority high --json
```

运行 `orca linear --help` 或 `orca skills get orca-linear` 查看与版本匹配的命令清单。脚本可能运行在未关联 Linear 的 worktree 之外时，请传入显式的事项 ID（例如 `ENG-123`）。

## 技能（本地，无需运行时）

列出内置指南、打印与版本匹配的指南，或在没有桌面 Settings 界面的情况下安装/更新混合技能包：

```
orca skills list
orca skills get orca-cli
orca skills get orchestration --full
orca skills install --skill orca-cli --skill orchestration
orca skills install --all --dry-run
orca skills update --all
```

`install` / `update` 实际调用的是 Settings 所用的同一批 `npx skills` 命令，不会连接 Orca 运行时。见[技能](/cli/skills#保持技能最新)。

## 账号（主机本地运行时）

在运行 Orca 的无头主机上（`orca serve` 或桌面应用），当远程客户端无法使用 **Add account** 时（远程运行时作用域会禁用该按钮），在此添加托管的 Claude/Codex 账号：

```
orca account list
orca account add # 默认为 Claude
orca account add --agent codex
```

`account add` 会在主机的**当前**终端里运行 `claude login` / `codex login`，然后把拿到的凭据注册到本地运行时。Codex 使用设备授权，因此可以在另一台机器的浏览器里完成登录。请在拥有这些账号的机器上运行这些命令，而不是在仅有客户端的远程会话里运行。

## Artifacts

通过已登录的 Orca 账号发布 HTML 或 Markdown。查看公开链接无需登录；创建/列出/更新/删除则需要。**发布默认关闭**——必须由人在设备上启用 **Settings → Artifacts → Allow publishing public artifact links**。没有任何 CLI 标志可以越过这道门槛。`list`、`unshare` 和 `delete` 始终可用，方便你在关闭发布后审计或撤销链接。

```
orca artifacts share ./report.html --json
orca artifacts share ./notes.md --json
orca artifacts update ./notes.md --json
orca artifacts unshare ./notes.md --json
orca artifacts list --json
orca artifacts list --cursor <cursor> --json
orca artifacts delete <id> --json
```

- 接受的文件类型：`.html`、`.htm`、`.md`、`.markdown`。
- `share` 把编辑令牌存入活动的 Orca 配置（profile），不会打印出来。`update` / `unshare` 按最初分享该文件时的本地路径与配置来定位。
- `list` 分页返回（`nextCursor` → `--cursor`）。`delete` 使用 `list` 里的 artifact ID，不需要原文件。
- 不会上传相对引用的 HTML 资源——请分享自包含的 HTML，或使用资源的绝对 URL。
- 被拒绝的发布/更新会以 `artifact_sharing_disabled` 失败；请修改 Settings，不要重试。
- 桌面端：打开本地 HTML 或 Markdown 文件并使用 **Share as artifact**，或在侧边栏 **Artifacts** 页面管理链接。

## 自动化、环境与钩子

计划提示：

```
orca automations list --json
orca automations create --name "Daily review" --trigger daily --time 09:00 --prompt "Review open changes" --provider codex --repo id:<repoId> --disabled --json
orca automations run <automationId> --json
```

远程运行时环境：

```
orca environment add --name work-laptop --pairing-code "orca://pair?code=..." --json
orca environment list --json
orca environment rm --environment <selector> --json
```

智能体状态钩子：

```
orca agent hooks status --json
orca agent hooks on --json
orca agent hooks off --json
```

## 智能体习惯

- 自动化与智能体调用优先使用 `--json`。
- 优先使用选择器，而不是解析 UI 标签。
- 除非下一条输入显而易见，否则发输入前先读终端状态。
- 用 worktree 评论记录进度检查点，见 [Worktree 检查点](/cli/worktree-checkpoints)。
- 可追踪的多智能体调度请使用[编排](/cli/orchestration)，而不是临时性的终端提示。
