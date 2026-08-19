---
title: "CLI 概览"
description: "使用 Orca CLI 在终端中脚本化驱动 Orca：管理 worktree、控制智能体终端、自动化内置浏览器、安装智能体技能。"
source: "https://www.onorca.dev/docs/cli/overview"
---

Orca CLI 是 `orca` 命令行接口，用于在任意 shell 中脚本化驱动正在运行的 Orca 编辑器。可以用它创建和检查 worktree（工作树）、驱动智能体终端、打开文件与 Diff、自动化内置浏览器、运行计划内自动化任务、分享 HTML/Markdown artifact，并在脚本或 AI 智能体中控制 Orca 原生工具。

它随桌面应用一并提供；在 [Settings → General → Orca CLI](/settings) 中注册。

智能体可以用以下命令安装配套的 Orca CLI 技能：

```
npx skills add https://github.com/stablyai/orca --skill orca-cli
# 无头环境 / 没有 Settings 界面：
orca skills install --skill orca-cli
```

所有可安装的 Orca 技能（包括 `orca skills install` / `orca skills update`）见[技能](/cli/skills)。

Orca CLI——在任意 shell 中驱动 worktree、终端与内置浏览器

## 安装与验证

```
command -v orca
orca status --json
```

## Worktree 命令

```
orca worktree ps --json
orca worktree create --repo id:<repoId> --name my-task --issue 123 --json
orca worktree current --json
orca worktree set --worktree active --comment "reproduced bug" --json
orca worktree rm --worktree id:<id> --force --json
```

关于选择器、setup 标志、父子 worktree 以及更完整的命令图谱，见 [CLI 参考](/cli/reference)。

## 终端命令

```
orca terminal list --json
orca terminal read --json
orca terminal send --text "continue" --enter --json
orca terminal wait --for tui-idle --timeout-ms 30000 --json
orca terminal create --worktree path:/projects/app --command "npm test" --json
orca terminal split --direction vertical --command "npm run dev" --json
```

需要可追踪的多智能体协作时，请使用[编排](/cli/orchestration)，而不是直接向终端发送提示。

## 文件命令

在 shell 中打开当前 Orca worktree 里的文件与 Diff：

```
orca file open src/App.tsx
orca file diff src/App.tsx --staged
orca file open-changed --mode both
```

当 shell 的当前目录不在目标 worktree 内时，使用 `--worktree <selector>`。

## 浏览器配置

浏览器配置隔离标签页的会话状态，让脚本或智能体可以用不同的 Cookie、localStorage 和已登录身份进行测试。CLI 在 `orca tab profile` 下提供配置命令；先用 `orca tab profile list --json` 查看，再按需使用 `create`、`set`、`clone` 或 `use-default`。

## 计划自动化

用 `orca automations` 在 shell 中创建、检查、运行和删除 Orca 计划任务。当你希望让一条提示词按周期在仓库或既有 worktree 上运行时，从[自动化](/cli/automations)开始。

## Artifacts

通过已登录的 Orca 账号把 HTML 或 Markdown 分享为公开查看链接（`orca artifacts share|update|list|delete`）。发布需要在 Settings → Artifacts 下**主动开启**。命令详情见 [CLI 参考 → Artifacts](/cli/reference#artifacts)。

## 浏览器自动化

CLI 还能以"快照 → 交互 → 再快照"的循环驱动内置浏览器：

```
orca goto --url https://example.com --json
orca snapshot --json # 返回 @e1、@e3 这样的 ref
orca click --element @e3 --json
orca fill --element @e1 --value "user@example.com" --json
orca screenshot --json
```

要做响应式检查时，把当前标签页切换到具名设备配置：

```
orca set device --name "iPhone 12" --json
orca screenshot --json
```

## 移动模拟器

CLI 还能通过 Orca 的移动模拟器桥接驱动 iOS Simulator。它以当前 worktree 为作用域，因此智能体和脚本无需离开 Orca，就能从 `orca emulator list` 附着模拟器、按归一化坐标点按、输入文本、发送手势、旋转设备并关闭它。

```
orca emulator list --json
orca emulator attach "<device-name-or-udid>" --json
orca emulator tap 0.5 0.7 --json
orca emulator type "hello" --json
orca emulator gesture '[{"type":"begin","x":0.5,"y":0.8},{"type":"move","x":0.5,"y":0.4},{"type":"end","x":0.5,"y":0.2}]' --json
orca emulator rotate landscape_left --json
orca emulator kill --json
```

脚本需要显式指定目标时，使用 `--worktree <selector>`、`--device <udid-or-name>` 或 `--emulator <id>`。

> $undefined 完整命令面（含标签页、等待、Cookie 与 frame）见 [CLI 参考](/cli/reference)；随后安装 Orca CLI 技能（见[技能](/cli/skills)）并交给你的智能体使用。
