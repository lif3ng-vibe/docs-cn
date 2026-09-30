---
kind: as-built
title: 适配器与运行时——Claude/Codex/终端、tmux/cmux 与恢复诚实性
status: active
topics: [agent-runtime, runtime-control]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解运行时适配器契约时——OpenRig 如何在 tmux 内启动与恢复 Claude Code、
  Codex 或终端运行框架，五个适配器方法各做什么，以及守护进程如何诚实评估一个
  运行框架究竟是真正恢复了还是被静默全新启动（恢复诚实性层）。
siblings: [daemon-core.md, agent-spec-and-startup.md, lifecycle-snapshot-restore.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


本篇说明 OpenRig 如何驱动各智能体运行框架。守护进程从不直接与 Claude Code、
Codex 或 shell 对话——而是与 `RuntimeAdapter` 对话。三个适配器实现同一个
五方法契约；另有一个独立的恢复诚实性（resume honesty）层，对“这个运行框架是
*真正*恢复了，还是被静默全新启动”这一问题给出如实而非乐观的回答。

> 已对照 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）的源码核实。
> 本模块全部源码**在 `v0.3.0` 即已存在**（对全部 7 个文件执行
> `git cat-file -e v0.3.0:<path>` 均存在）——适配器层是 reboot 时代的核心机制，
> **并非** 0.3.x 的新特性；不要事后归因（§10.8 版本归因证明技法）。

> 漂移修正（scope）——`architecture.md` §5 “Runtime adapters” 一节**不存在
> slice-00 数值漂移**（proposed-structure §4.2：“adapter contract is current”）。
> 下文修正是源码比散文更具体之处的*精度*补正，并非过期计数修正。每一条均已
> 行内标注并在 HEAD 重新确认。

## 1. 五方法的 RuntimeAdapter 契约

`RuntimeAdapter` 定义于 `packages/daemon/src/domain/runtime-adapter.ts:127`
（`interface RuntimeAdapter`）。每个适配器声明一个 `readonly runtime` 字符串，
并恰好实现五个方法（`runtime-adapter.ts:128–153`）：

| 方法 | 签名（`runtime-adapter.ts`） | 职责 |
|---|---|---|
| `listInstalled` | `(binding)` `:131` | 列出某节点当前已安装/已投影的资源。 |
| `project` | `(plan, binding)` `:134` | 将 `ProjectionPlan` 中的资源投影到运行时的目标位置。 |
| `deliverStartup` | `(files, binding)` `:137` | 将解析后的启动文件交付给运行时。 |
| `launchHarness` | `(binding, opts)` `:147` | 在绑定的 tmux 会话内启动运行框架；返回恢复令牌。 |
| `checkReady` | `(binding)` `:153` | 探测运行框架是否已响应且就绪。 |

启动*动作*（`slash_command` / `send_text`）的执行被明确**排除**在该契约之外
——契约文档注释（`runtime-adapter.ts:121–125`）写明动作属于
`StartupOrchestrator`，在 `checkReady()` *之后*执行。编排器的交付分工见
`agent-spec-and-startup.md`。

### `launchHarness` 的 opts 与分叉接缝

`launchHarness` 的 opts 为 `{ name: string; resumeToken?: string; forkSource?:
ForkSource }`（`runtime-adapter.ts:147–150`）。

> 漂移修正（精度）——`architecture.md` §4 写的是 `launchHarness(binding,
> opts: { name, resumeToken? })`。源码新增第三个、与前两者互斥的
> `forkSource` 字段。按契约文档注释（`runtime-adapter.ts:142–146`），
> `resumeToken` 与 `forkSource` 互斥——若两者同时提供，适配器**必须拒绝**
> 并给出明确报错，而非自行猜测；`forkSource` 触发分叉，捕获到的令牌是分叉后的
> 全新令牌，绝不是父会话的令牌。`ForkSource` 定义于 `runtime-adapter.ts:116`
> （`kind: "native_id" | "artifact_path" | "name" | "last"`；v1 MVP 仅接受
> `native_id`——其他形态在 schema 校验即被拒绝，文档注释 `:106–119`）。

### `HarnessLaunchResult` 是带诚实失败分支的可辨识联合（discriminated union）

> 漂移修正（精度）——`architecture.md` §4 写的是 `HarnessLaunchResult` 为
> `{ ok, resumeToken?, resumeType?, error? }`（单一的可选字段形状）。源码实为
> **可辨识联合**（`runtime-adapter.ts:81–86`）：
> `| { ok: true; resumeToken?; resumeType? }`
> `| { ok: false; error: string; recovery?: HarnessLaunchRecovery; evidence? }`。
> 失败分支携带类型化的 `recovery` 提示
> （`HarnessLaunchRecovery = "retry_fresh" | "attention_required"`，
> `:79`）以及可选 `evidence`（最后 N 行 pane 内容，对 `attention_required`
> 结果会透传至 `RestoreNodeResult.attentionEvidence`，`:83–86`）。
> 这是诚实失败（honest-failure）形状，而非抹平后的可选 `error`。

## 2. 三个适配器

三者都位于 `packages/daemon/src/adapters/` 下，均实现
`RuntimeAdapter`（架构规则 1：`adapters/` 内零 Hono）。

### ClaudeCodeAdapter (`claude-code-adapter.ts:41`)

- `readonly runtime = "claude-code"`（`:42`）。
- **投影**至 `.claude/` 各目标：`guidance_merge` → `<cwd>/CLAUDE.md`
  （`:127`）；`skill_install` → `<cwd>/.claude/skills/<name>/`（`:71,133`）；
  子智能体 → `.claude/agents`，插件 → `.claude/plugins/<id>`，
  运行时资源 → `.claude/extensions/<id>`，settings 片段合并进
  `.claude/settings.local.json`（`:388–400`）。
- **启动**（`:213–215`）：fresh = `claude <permissionMode> --session-id
  <generatedId> --name <name>`；resume = `claude <permissionMode> --resume
  <token> --name <name>`；fork = `claude <permissionMode> --resume <parentId>
  --fork-session --name <seat>`（`:188`）。
  > 漂移修正（精度）——`architecture.md` §5 只说“经
  > `claude --name <name>` 启动、经 `claude --resume <token>` 恢复”。源码
  > 显示全新启动使用显式 `--session-id`（因此确定性的恢复令牌即刻存在），
  > 且存在 fork 分支。已在 HEAD 重新确认
  > `claude-code-adapter.ts:188,213–215`。
- **就绪检查**（`checkReady`，`:239`）：校验 tmux 会话存活，抓取 40 行 pane
  内容与 pane 命令，委托给 `assessNativeResumeProbe`（§3）；仅当探测
  `status === "resumed"` 时视为就绪。恢复启动验证循环
  `verifyResumeLaunch` 至多重试 **16 次**（`:273`），遇到
  `no_conversation_found` 时以 `recovery: "retry_fresh"` 高声失败
  （`:284–289`）——绝不静默回退到全新启动。

### CodexRuntimeAdapter (`codex-runtime-adapter.ts:37`)

- `readonly runtime = "codex"`（`:38`）。
- **投影**至 `.agents/` 各目标：`guidance_merge` → `<cwd>/AGENTS.md`
  （`:139,330`）；`skill_install` → `<cwd>/.agents/skills/<name>/`
  （`:89,145`）；skills 解析到 `.agents/skills/<id>` 之下（`:377`）。
- **启动/恢复**（`:205,225–226`）：全新启动后捕获新的 thread id；
  resume = `codex<profileArg> resume<queueStateDirArg> <token>`；
  fork = `codex<profileArg> fork<queueStateDirArg> <parentId>`（`:205`）。
  成功时返回 `{ ok: true, resumeToken: threadId, resumeType: "codex_id" }`
  （`:222,245,250`）。
  > 漂移修正（精度）——`architecture.md` §5 写的是“经 `codex` 启动、
  > 经 `codex resume <threadId>` 恢复”。源码确认了 `codex resume
  > <token>` 形态（`:226`），并补充 fork 分支与
  > `resumeType: "codex_id"` 标记。已在 HEAD 重新确认。
- 若 `resumeToken` 与 `forkSource` 同时给出则以明确报错拒绝
  （`:180–181`）——恪守互斥契约。

### TerminalAdapter (`terminal-adapter.ts:19`)

- `readonly runtime = "terminal"`（`:20`）。
- **所有操作都是空操作**——“shell 本身就是运行框架”
  （`terminal-adapter.ts:15`）：`project`/`deliverStartup`/`launchHarness`
  均为空操作（`:34`），而 `checkReady` 只要 tmux 会话一存在就立即返回就绪
  （`:47`）。用于基础设施节点——服务器、日志尾部、构建监视器。
  （终端节点无法分叉；runtime-adapter 文档注释说明不支持分叉的适配器会以
  运行时不匹配错误拒绝，`runtime-adapter.ts:113–115`。）

这三者由 `createDaemon` 第 4 步构造（`startup.ts`；见 `daemon-core.md`
§4 “Startup sequence”）。

## 3. 恢复诚实性

守护进程不会因为启动命令执行过就假定运行框架已恢复。三个 domain 文件
（`packages/daemon/src/domain/`，@v0.3.0 均已存在）让恢复评估变得诚实：

### `native-resume-probe.ts`

`assessNativeResumeProbe(input)`（`native-resume-probe.ts:43`）读取 pane
命令与 pane 内容，返回四种诚实状态之一（`NativeResumeProbeStatus`，
`:6`）：

- `resumed`——运行时专属指标确认这是一次已恢复的会话。
- `failed`——终态失败（例如 Claude 打印 “No conversation found” →
  代码 `no_conversation_found`，`:51–57`）。
- `inconclusive`——尚不可知（例如 Claude 信任门控，代码
  `trust_gate`，`:65–70`）。
- `attention_required`——存活且可挽救，但**需要操作员介入**
  （例如 Claude 的恢复会话选择提示，代码
  `claude_resume_selection_prompt`，`:58–64`）。这是“必须由操作员选择
  会话”的代理信号；它与 `inconclusive` 和 `failed` *截然不同*
  （文档注释 `:3–5`）。

`buildNativeResumeCommand`（`:27`）按运行时构建恢复命令：claude →
`claude --resume <token> [--name <name>]`（`:35`）；codex →
`codex resume <token>`（`:38`）；其他运行时 → `null`（`:40`）。

这就是代码中的架构规则 15：恢复失败就高声地报 FAILED；没有自动的全新启动
回退（适配器的 `verifyResumeLaunch` 返回 `ok:false` 并附带
`retry_fresh` 恢复提示，绝不静默重启）。

### `resume-metadata-refresher.ts`

`ResumeMetadataRefresher`（`resume-metadata-refresher.ts:37`）。启动后的
恢复令牌捕获：`refresh(sessions)`（`:62`）跳过已有 `resumeToken` 的会话
（`:65`）；对持有令牌的 `claude-code` 会话则运行
`probeClaudeResume`，返回 `"resumable" | "not_resumable" |
"inconclusive"`（`:31,74–75`）——这会在一个用后即弃的探测 tmux 会话里
真实执行恢复命令（`:106–111`），而非元数据层面的猜测。

### `codex-thread-id.ts`

Codex thread id 提取（`codex-thread-id.ts`）。从 `~/.codex/` 之下的
Codex *logs* SQLite 数据库读取 Codex thread id：
`readCodexThreadIdFromCandidateHomes(...)`（`:22`）→
`readCodexThreadIdFromLogs(...)`（`:49`）→
`resolveCodexLogDbPaths(homeDir)`（`:79`），后者对
`<homeDir>/.codex/logs_<N>.sqlite` 做 glob（`:84–89`，
正则 `^logs_(\d+)\.sqlite$`），无匹配时回退到 `logs_1.sqlite`（`:97`）。
使用 `better-sqlite3`（`:5`）。按运行框架 PID 解析主目录
（`defaultResolveHomeDirByPid`，`:9`）。

> 精度备注——`architecture.md` §5 “Resume honesty” 说 codex thread ID
> 来自 “the Codex SQLite database”。源码更具体：是按版本划分的 Codex
> *logs* 数据库 `~/.codex/logs_N.sqlite`。此处按精确口径陈述；
> 已在 HEAD 重新确认 `codex-thread-id.ts:79–97`。

## 4. 相关架构规则（已在 HEAD 对照源码核实）

摘自 `architecture.md` §7（已对照文中引用的源码逐一重新确认）：

- **规则 5**——在 pod 感知模型（pod-aware model）中，runtime 以成员
  记录为准（member-authoritative）。
- **规则 13**——就绪检查是带指数退避与可配置超时的重试循环，使用适配器
  专属探测（Claude TUI 指示器、Codex 就绪消息、终端立即就绪）。
  已重新确认：`checkReady` 委托给 `assessNativeResumeProbe`；重试循环位于
  `claude-code-adapter.ts:273`（16 次尝试）。
- **规则 14**——恢复状态是锁定的：`resumed` / `rebuilt` / `fresh`；
  `rebuilt` = 由工件拼装出的新进程。（探测层补充了
  `inconclusive` / `attention_required` 两种诚实的*过渡*状态，而非结果
  ——见 §3。）
- **规则 15**——恢复的诚实性：恢复失败就高声报 FAILED；没有自动全新启动
  回退；全新启动只能是显式的后续动作。§2/§3 在代码中强制执行这一点
  （`verifyResumeLaunch` 返回 `ok:false`，绝不重新启动）。

## 另见

- `daemon-core.md`——`createDaemon` 在其中构造三个适配器。
- `agent-spec-and-startup.md`——调用这些适配器并在 `checkReady()` 之后
  负责启动动作执行的 `StartupOrchestrator`。
- `lifecycle-snapshot-restore.md`——持久化的恢复令牌如何进入快照/恢复
  流程（resume、rebuild 还是 fresh）。
- Source roots: `packages/daemon/src/domain/runtime-adapter.ts`,
  `packages/daemon/src/adapters/{claude-code-adapter,codex-runtime-adapter,terminal-adapter}.ts`,
  `packages/daemon/src/domain/{native-resume-probe,resume-metadata-refresher,codex-thread-id}.ts`.
