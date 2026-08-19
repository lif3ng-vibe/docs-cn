---
title: "技能"
description: "用 npx skills add 安装 Orca 智能体技能。混合桩保持轻量；orca skills get 提供与版本匹配的指南。Orca 支持在后台更新技能。"
source: "https://www.onorca.dev/docs/cli/skills"
---

Orca 自带**技能（skills）**，供智能体安装到各自的技能目录。公开的安装包是**混合发现桩（hybrid discovery stub）**：简短的 `SKILL.md` 文件，告诉智能体*何时*调用 Orca，以及如何从运行中的 CLI 加载完整指南。命令标志放在二进制里，因此不会与应用版本脱节。

## 可安装的 Orca 技能

用 `npx skills add` 加上公开的 Orca 仓库和技能名。默认的智能体初始化通常会安装 `orca-cli`、`computer-use` 和 `orchestration`。

| 技能 | 安装 | 用途 |
| --- | --- | --- |
| [`orca-cli`](#orca-cli) | `npx skills add https://github.com/stablyai/orca --skill orca-cli --global` | worktree、终端、文件、自动化、内嵌浏览器。 |
| [`orchestration`](#orchestration) | `npx skills add https://github.com/stablyai/orca --skill orchestration --global` |

## 混合桩与实时指南

`npx skills add` 之后，智能体看到一段简短的桩，内容是：

1. 为当前会话解析 CLI 可执行文件（`ORCA_CLI_COMMAND`、`orca-dev`、Linux 上的 `orca-ide`，否则用 `orca`）。
2. 加载完整指南：`orca skills get <topic>`（长版指南加 `--full`）。
3. 优先使用 `--json`，不要凭记忆编造标志。

```
orca skills list
orca skills get orca-cli
orca skills get orchestration --full
orca skills get orca-linear --json
```

智能体需要确定性输出用于自动化时加 `--json`。`skills show` 是 `skills get` 的别名。

## 保持技能最新

当 Orca 发布了比全局安装版本更新的技能包时，应用可以：

- 显示**有更新**的提醒（当某个副本在更新器无法安全改写的地方过期时，显示**需要关注**）。
- 打开 **Update skills**——列出各安装位置与跳过原因，然后无头执行 **`npx --yes skills update <names> --global -y`**（不打开内嵌终端）。
- 让更新在**后台**进行：关闭对话框不会取消它。状态栏上的一段显示进度（运行中转圈、成功后短暂打勾、失败则持续提示直到你处理）。点击该段可重新打开对话框。
- 在 **Settings → Agents** 里展示已安装技能（全局安装栏）的新鲜度，需要处理的行会给出 **Details**。

手动等价做法（桌面 Settings 仍显示同样的 `npx` 命令）：

```
npx skills update orca-cli orchestration computer-use --global
```

在没有 Settings 界面的无头主机上（SSH、容器、CI、`orca serve`），使用本地 CLI 包装——它们解析同样的 `npx` 命令、附加非交互标志，并且**不需要**运行中的 Orca 运行时：

```
orca skills install # 列出可安装的技能名
orca skills install --skill orca-cli --skill orchestration
orca skills install --skill orca-cli --agent claude-code,codex
orca skills install --all --dry-run
orca skills update --all
orca skills update --skill orca-cli --dry-run
```

- 默认作用域是**全局**（`--global`）；只想装到当前项目时传 `--local`。
- `install` 面向 Orca 在主机上检测到的智能体（外加共享的 `.agents/skills` 目录）。用 `--agent <name>[,<name>…]` 或 `--agent universal` 覆盖；未检测到任何智能体时必须传 `--agent`。
- `update` 只刷新已安装的技能。
- `--dry-run` 打印解析后的命令；`--json` 只在列取 / `--dry-run` 时有效。

当 Orca 提供应用内更新器时优先用它，这样应用扫描过的那些全局安装位置会被统一改写。标记为 **Skipped** 的行会说明该技能为何无法自动更新（例如缺少来源注册）——先修复安装位置，再重新检查。

## orca-cli

```
npx skills add https://github.com/stablyai/orca --skill orca-cli --global
```

安装后，用 `orca skills get orca-cli` 加载与版本匹配的命令指南。见 [CLI 概览](/cli/overview)。

## orchestration

```
npx skills add https://github.com/stablyai/orca --skill orchestration --global
```

当智能体需要通过 Run、任务、受监督的工作者与决策门协调其他智能体时使用。见[编排](/cli/orchestration)。修改编排状态前务必先加载 `orca skills get orchestration --full`——旧的 `orchestration run` 命令已退役。

## computer-use

```
npx skills add https://github.com/stablyai/orca --skill computer-use --global
```

当智能体需要检查并操作本地桌面应用窗口时使用。见[计算机使用](/cli/computer-use)。

## orca-linear

```
npx skills add https://github.com/stablyai/orca --skill orca-linear --global
```

智能体在修改工单前应先加载 `orca skills get orca-linear`。覆盖 `issue --full`、`save-issue`、`list-issues`、关联关系、完成时的附件+评论流程，以及不可信工单规则。既有的 `linear-tickets` 安装仍然可用。见 [CLI 参考 → Linear](/cli/reference#linear)。

## orca-emulator

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator --global
```

当智能体需要在 Orca 内部通过 `orca emulator` 命令控制 iOS Simulator 时使用。

## orca-emulator-android

```
npx skills add https://github.com/stablyai/orca --skill orca-emulator-android --global
```

用于 adb 连接的 Android AVD/设备：列出/启动、点按/滑动/输入、硬件按键、安装/启动应用、权限、无障碍树、logcat。用 `orca skills get orca-emulator-android` 加载详情。

## orca-per-workspace-env

```
npx skills add https://github.com/stablyai/orca --skill orca-per-workspace-env --global
```

在 `orca.yaml` 里配置或调试按工作区的环境配方时使用。见[运行方式](/ways-to-run#4-云-vm每工作区环境)。

## 发现来源

Orca 的技能界面会扫描 Claude、Codex、Agent Skills 以及 **OMP**（`~/.omp/agent/skills`）的技能安装目录，因此放在这些位置的技能无需手动符号链接即可显示。

## 添加你自己的技能

任何包含 `skills/<name>/SKILL.md` 文件的仓库都可以通过 `npx skills add` 安装。把内部仓库指给你的智能体，就能赋予它公司专属的能力。

## MCP 服务器

模型上下文协议（MCP）服务器向兼容的智能体暴露外部工具。在 [Settings → Integrations → MCP](/settings) 注册 MCP 端点；这些工具会出现在支持 MCP 的智能体 CLI 里。
