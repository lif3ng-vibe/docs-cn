---
title: "支持层级"
---


gstack 有两个支持层级。完整支持（full support）享有整套测试套件、付费评测和持续投入。最低限度支持（minimal support）意味着 gstack 不会彻底坏掉，仅此而已。Garry Tan 在 2026-11-01 定下了这条线："我们不想让它彻底坏掉，但也确实不需要投入那么多。"

## 完整支持

- **操作系统**：macOS 和 Linux。
- **模型**：Claude 和 OpenAI 模型，既作为宿主 agent，也作为评审者。
- **测试**：完整的免费套件和付费评测。

## 最低限度支持

- **Windows**（Git Bash 或 MSYS）：在默认的 Git for Windows 安装下，`./setup` 能完成安装，核心技能能无报错启动。核心技能指跑在 gstack 自带浏览器上的 `/ship`、`/review`、`/qa-only`、`/investigate` 和 `/browse`。一个必需的 CI 任务 `windows-smoke` 在每个 pull request 上检查这一点（见下文 Windows CI）。
- **Gemini 模型**：当 Gemini 是宿主 agent 或评审者时，核心工作流能无报错跑到底。我们靠人工或一次廉价的冒烟运行来验证，不用评测单元。

承诺到此为止。其他技能、可选部分（如 `/cso` 的原生助手）、非默认 shell 设置和速度不在覆盖范围内。

## 我们不再做的事

- 不做 Windows 专属或 Gemini 专属的功能、对齐工作、调优或打磨。
- 不新增 Windows 或 Gemini 的 CI 任务或评测单元——下文 Windows CI 里按路径划定的 Windows 检查除外（ship-90-90 方案 D）。其余 Windows CI 调优一并停止。
- 不破坏安装、启动或核心工作流的 Windows 专属或 Gemini 专属报告，按不予修复关闭（[分诊规则](https://github.com/garrytan/gstack/blob/main/docs/triage.md#closing-an-issue)），并附上本页链接。确实破坏了其中之一的报告会得到一个小修复。

## Windows CI

- `windows-smoke` 是 pull request 上必需的 Windows 检查。
- 六分片的 Windows 免费套件（`Windows Free Tests` 工作流，`windows-free-tests`）每晚在 main 上运行，或有人手动触发时运行，从不阻塞 pull request。
- 夜间运行的红灯只有显示出安装、启动或核心工作流被破坏时才会被修复。
- Windows 检查按路径运行（ship-90-90 方案 D，2026-11-03 批准）：`Windows Scoped Tests` 仅当 pull request 涉及路径、文件名或进程代码时，才在一个 Windows 任务上运行该请求改动的 Windows 安全测试文件（红灯会阻塞该 pull request，和其他失败的检查一样）；`Windows Setup E2E` 仅当安装文件变化时运行（仅改版本的 `package.json` 变更不算）。

## 不变的部分

这些层级不会改变 gstack 自有评测测试哪些模型，也不会改变 gstack 使用哪个跨家族的评审声线。
