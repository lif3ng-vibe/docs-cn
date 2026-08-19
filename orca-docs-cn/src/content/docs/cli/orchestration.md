---
title: "编排"
description: "用 Run、任务、受监督的工作者、消息与决策门协调多个智能体。"
source: "https://www.onorca.dev/docs/cli/orchestration"
---

编排是 Orca 的结构化多智能体层：**Run**（命名空间 + 协调者收件箱）、任务（Task）、调度（Dispatch）、受监督的工作者（worker）、消息与决策门（decision gate）。

当你需要明确的归属、完成追踪或 DAG 时使用它。一次性提示用 `orca terminal send`；不做监督、完全移交归属时，用 `orca-cli` 技能里的 worktree/终端命令。

> **实验性** 使用这些命令前，先在 Settings → Experimental 中启用编排。CLI 与运行中的 Orca 运行时通信，因此 `orca status --json` 应当先成功。

> **旧命令已退役** `orca orchestration run` 和 `run-stop`（以及 `coordinator-start` / `coordinator-stop`）**不产生任何效果**。它们返回指向 `orca skills get orchestration --full` 的恢复说明。请使用下面的 Run + worker-start 流程。

## 核心模型

- **Run**——持久命名空间与主收件箱。从不调度或安置工作者。
- **任务（Task）**——带规格、依赖与状态的工作项，状态取值：`pending`、`ready`、`dispatched`、`completed`、`failed`、`blocked`。
- **调度（Dispatch）**——任务在某终端上的一次执行尝试；是 `worker_done` / 心跳的生命周期权威。
- **消息（Message）**——收件箱邮件（`status`、`dispatch`、`worker_done`、`escalation`、`question`、`heartbeat` 等）。
- **决策门（decision gate）**——由协调者持有的问题，在解决之前会阻塞任务。

完成权威来自活动调度上下文。工作者的完成与心跳消息应同时带 `taskId` 和 `dispatchId`。

终端里打印的任务 ID（形如 `task_...`）是可点击链接。点击后会向 Orca 运行时查询该任务当前的调度，并聚焦被指派的终端——即使任务位于远程或 SSH 运行时也是如此。

## 推荐的受监督循环

```
orca orchestration run-create --objective "Split checkout QA and summarize blockers" --json
orca orchestration task-create --spec "Audit billing settings for mobile layout" --task-title "Billing audit" --json
orca orchestration worker-start --task <taskId> --worktree current --agent codex --json
# 或新建 worktree：
orca orchestration worker-start --task <taskId> --worktree new-child --name billing-audit --agent codex --setup run --json
# 可选的按工作者 model / effort（仅 Claude、Codex、Cursor；不能与 --terminal 同用）：
orca orchestration worker-start --task <taskId> --worktree current --agent claude --model <opaque-model-id> --effort high --json
```

`--model` 接受 Claude、Codex 与 Cursor 的提供商不透明模型 ID。`--effort` 必须搭配 `--model`，且仅在该智能体/模型支持相应档位时生效。两个标志都不能与 `--terminal`（复用既有窗格）同用。覆盖只对那次启动生效，并显示在启动回执的 `launch.requested` / `launch.effective` 中。联邦启动要求工作者所在主机声明支持启动偏好。

等待完成（处理某次投递中的每条消息，然后确认）：

```
orca orchestration check --wait --types worker_done,escalation,question --timeout-ms 900000 --json
orca orchestration check --ack <deliveryId> --wait --types worker_done,escalation,question --timeout-ms 900000 --json
```

工作者上报完成（在工作者的窗格中执行；带上注入的 ID）：

```
orca orchestration send \
 --type worker_done \
 --subject "Completed mobile audit" \
 --body "Fixed footer overlap; no follow-ups." \
 --task-id <taskId> \
 --dispatch-id <dispatchId> \
 --outcome succeeded \
 --files-modified "src/app/settings/Billing.tsx" \
 --json
```

`worker_done` 必须带 `--outcome succeeded|failed`。

检查 / 恢复：

```
orca orchestration worker-show --dispatch <dispatchId> --json
orca orchestration worker-read --dispatch <dispatchId> --limit 50 --json
orca orchestration worker-stop --dispatch <dispatchId> --json
# worker_done 被接受后：复用同一终端做后续调度，或释放它
#（先归档可查看的输出，再只关闭那个协调者持有的智能体终端）：
orca orchestration worker-release --dispatch <dispatchId> --json
# 用户要求保留时，让已收尾的工作者保持存活以便调试：
orca orchestration worker-retain --dispatch <dispatchId> --json
# 重试安置是显式的——--retry-of 不继承 --on/worktree：
orca orchestration worker-start --task <taskId> --retry-of <dispatchId> --worktree current --agent codex --json
```

不要为了重读输出而让已完成的工作者终端一直开着——`worker-release` 之后再 `worker-read` 即可。当 release 返回 `release_pending` 或 `release_unknown` 时，不要用宽泛的 `terminal close` 代替，按回执中的恢复操作处理。

## 联邦工作者（可选）

```
orca orchestration worker-start \
 --task <taskId> \
 --on windows \
 --worktree new-top-level \
 --repo <exact_remote_repo_selector> \
 --name remote-worker \
 --agent codex \
 --setup run \
 --json
orca orchestration send --to dispatch:<dispatchId> --subject "Follow-up" --body "…" --json
```

后续命令按调度 ID 路由；不要重复 `--on`。

## 低层调度（自定义拓扑）

```
orca worktree create --name billing-audit --agent codex --json
orca terminal wait --terminal <workerHandle> --for tui-idle --timeout-ms 60000 --json
orca orchestration dispatch --task <taskId> --to <workerHandle> --inject --json
```

## 消息说明

- 默认情况下 `check` 返回所绑定 Run 最早的未确认投递（FIFO）。反复执行直到 `--ack`。
- `--peek` / `--all` 不消费邮件。
- 组地址：`@all`、`@idle`、`@claude`、`@codex`、`@opencode`、`@gemini`、`@droid`、`@grok`、`@cursor`、`@worktree:<id>`——绝不能用于 `worker_done` / 心跳。
- PowerShell 中组地址要加引号：`--to "@all"`。

```
orca orchestration send --to @all --subject "Heads up" --body "Pausing dispatches for a review." --json
orca orchestration send --to @idle --subject "Anyone free?" --json
orca orchestration send --to @codex --subject "Codex agents only" --json
```

等待期间，CLI 每 15 秒向 stderr 输出一行简短 JSON 心跳。stdout 始终是最终命令结果。

## 工作者契约

被调度的工作者会收到一段前导说明，告知如何与协调者通信：

- `worker_done` 恰好发送一次，失败也要发，并带 `--outcome`。
- 附一段简短的 `--body` 摘要：做了什么、发现了什么、还剩什么。
- 同时带任务 ID 和调度 ID，防止过期的重试完成错误的调度。
- 长时间活跃工作期间发送 `heartbeat` 消息。
- 阻塞性提问用 `orca orchestration ask`，不要用本地 TUI 提示。

```
orca orchestration ask \
 --to <coordinatorHandle> \
 --question "Should I update the shared component or only this page?" \
 --options "shared,page-only" \
 --timeout-ms 600000 \
 --json
```

带 `--json` 时，`ask` 输出单个 JSON 对象，工作者可以直接用管道接 `jq -r .answer`。

## 决策门

工作者向协调者提问用 `ask`。当协调者已建好任务 DAG、想让某任务在决策记录之前保持阻塞时，使用显式决策门：

```
orca orchestration gate-create \
 --task <taskId> \
 --question "Merge the shared button change into the task branch?" \
 --options '["yes","no"]' \
 --json

orca orchestration gate-resolve --id <gateId> --resolution "yes" --json
```

## 恢复

```
orca orchestration dispatch-show --task <taskId> --json
orca orchestration dispatch-show --task <taskId> --preamble --json
orca orchestration task-list --json
orca orchestration task-update --id <taskId> --status blocked --result '{"reason":"waiting on credentials"}' --json
```

只有在有意放弃编排状态时才重置：

```
orca orchestration reset --tasks --json
orca orchestration reset --messages --json
orca orchestration reset --all --json
```

`reset` 影响运行时全局的编排状态。除非本意就是清理，否则不要在其他协调者活跃时运行它。

## 选择正确的命令

向你正盯着的智能体发轻量提示，用 `orca terminal send`。

当工作者必须上报 `worker_done`、通过协调者提问、并按任务 ID 被追踪时，用 `orca orchestration worker-start`（或 `dispatch --inject`）。

需要持久 Run 命名空间与受监督的多智能体循环时，用 `orca orchestration run-create` + 任务 + 工作者——而不是已退役的 `orchestration run` 命令。

## 完整指南

命令标志随应用演进。安装后，智能体应运行：

```
orca skills get orchestration --full
```
