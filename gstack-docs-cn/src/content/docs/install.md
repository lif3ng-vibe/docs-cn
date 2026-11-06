---
title: "安装细节"
---


README 讲的是两步安装。本页放的是细节：setup 需要什么、要多久，团队模式的
hook，setup 在 Claude Code 里注册的 hooks，agent 宿主注册，以及如何移除
gstack。

## setup 要花多久

在一台 4 vCPU 的 Linux 云主机上（v1.91.13.0，干净的 HOME，包含二进制构建和 Chromium 下载），clone 之后 `./setup` 花了 31 秒。网络更慢的机器和笔记本会更久。

## 详细要求

**要求**：[Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Git](https://git-scm.com/)、[Bun](https://bun.sh/) v1.4.2+（经测试的版本；安装器拒绝低于 1.3.3 的 Bun——那会让编译出的工具读到项目的 `.env`——介于两者之间则告警），[Node.js](https://nodejs.org/)（仅 Windows）。**macOS 推荐**：[Aside](https://aside.com) 浏览器（macOS 15+）——浏览器类技能、`/make-pdf` 和 `/diagram` 优先驱动它并使用你真实登录的会话。没有它，`./setup` 会构建 gstack 自带的内置浏览器，同样的技能改用它。`/cso` 额外需要一个支持全部四个 `--no-compile-autoload-*` 构建标志的 Bun 版本，外加原生工具链：Linux 上是支持静态链接的 C 编译器，macOS 上是 Xcode 命令行工具，Windows 上是带"使用 C++ 的桌面开发"的 Visual Studio 2022 Build Tools。这些缺失时，setup 会装好其余一切、清理过期的 CSO 助手，`/cso` 则报 `not assessed` 并附上前置条件。

合格的 CSO 运行时镜像发布后，setup 会给每个自动预拉取一个 30 秒窗口，外加按声明的目录给出的有界配置额度。镜像仓库（registry）较慢时可设一个整数，例如 `GSTACK_CSO_IMAGE_PULL_TIMEOUT_SECONDS=120`（接受范围：5-300 秒）。一个镜像超时不会吃掉其余镜像的窗口；setup 报告部分进度，下一次运行从本地 Docker 已有的精确摘要续起。完整预拉取的上限为一小时。

## 团队模式

在你的仓库里运行 `(cd ~/.claude/skills/gstack && ./setup --team) && ~/.claude/skills/gstack/bin/gstack-team-init required`，即切换到团队模式并引导仓库，让队友自动获得 gstack（README 里有完整的粘贴版，还会顺带提交变更）。

你的仓库里没有内嵌（vendored）文件，没有版本漂移，没有手动升级。每个 Claude Code 会话开始时都会做一次快速的自动更新检查（限频为每小时一次，网络故障安全，完全静默）。团队模式跟随 `stable` 渠道：周一和周四早上切的打标发布，除安全或回归修复外间隔绝不超过 72 小时，而不是每次合并到 main。`gstack-config set update_channel main` 则改为跟随每次合并；见 [releases.md](/releases/)。

如果你更想提醒队友而不是拦住他们，把 `required` 换成 `optional`。

`required` 用一个跑在 [Node.js](https://nodejs.org/) 上的 hook 拦截技能，所以每位队友在所有操作系统上都需要 PATH 里有 Node.js。Claude Code 2.1.295 及以上版本中，hook 跑不起来时（没有 Node.js，或缺少 `.claude/hooks/check-gstack.cjs`）也会拦截；旧版 Claude Code 在那种情况下会放行技能。

## `./setup` 注册的 hooks

`./setup` 在 `~/.claude/settings.json` 里最多注册三个 hook 家族，每一个都指向规范安装。团队模式下它会注册 `SessionStart` 自动更新 hook（`gstack-session-update`；`./setup --no-team` 跳过）。AskUserQuestion 的 `PreToolUse`（偏好强制）和 `PostToolUse`（确定性答案捕获）hook 是 `/plan-tune` 运行时用的，注册前会先询问；`./setup` 绝不默默写入。`docs/uninstall.md` 在告诉你手动移除什么时列出了同样的家族。

`./setup` 还会注册一个默认开启的 Stop hook：`gstack-timeline-stop`
（会话被中断时关闭悬空的会话时间线条目；失败即放行——2 秒内部预算，永远
以 0 退出，绝不会阻塞会话）。用 `./setup --no-timeline-stop-hook` 持久
退出——这个选择落在 `timeline_stop_hook` 配置键里，升级后保留，明确的"不要"
会移除现存注册。`GSTACK_TIMELINE_STOP_HOOK=no` 和
`gstack-config set timeline_stop_hook no` 也行（flag > 环境变量 > 配置）。
`./setup --no-team` 在那次运行中跳过它，`gstack-settings-hook remove-source
--source gstack-timeline-stop` 手动移除，`gstack-uninstall` 也会一并移除。

Hook 注册只认规范安装：每条 hook 命令都指向稳定的 `~/.claude/skills/gstack`
安装，绝不指向 setup 当时所在的目录树，所以删掉一个 worktree 或 Conductor
工作区不会留下在你会话里报错的死 hook。每次 `./setup` 运行还会先做自愈：
`gstack-settings-hook prune-stale --repoint` 移除死掉的 gstack hook 条目，
把过期的重新指向稳定安装，并合并重复项，只在确实改动了什么时打印一行（并在
文件旁写一份备份）。

## Agent 宿主

在 OpenClaw、Hermes 或某个 Dot 里运行时，`./setup` 还会把 gstack 的技能
注册到该宿主自己的技能目录里，并打印它写入的每一个路径。当 `--host` 指定了
其他宿主或使用 `--local` 时，它绝不这么做。用 `./setup --no-harness-auto`
或 `GSTACK_HARNESS_AUTO=0` 关闭。各宿主细节、任何其他宿主，以及 QM 为何
尚不可用：[hosts.md](/hosts/#agent-宿主)。

## 卸载

见 [uninstall.md](/uninstall/)。
