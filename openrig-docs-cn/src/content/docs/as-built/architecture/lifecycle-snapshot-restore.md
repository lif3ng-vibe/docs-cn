---
kind: as-built
title: 生命周期——快照、恢复与连续性
status: active
topics: [continuity, runtime-control]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 OpenRig 如何捕获快照、如何恢复一个 rig（resume、rebuild 还是
  fresh）、如何强制恢复诚实性、如何查询实时连续性状态，或守护进程侧的
  restore-check / restore-packet 就绪探测如何工作时。
siblings: [daemon-core.md, agent-spec-and-startup.md, transport-and-transcripts.md]
prerequisite-reads: [../README.md, agent-spec-and-startup.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


核心产品循环的持久状态半边：
`down (auto-snapshot) → up <rig-name> (auto-restore) → handoff`。快照捕获
序列化的 rig 状态；恢复如实地回放它（没有静默的 fresh 回退）；restore-check
是一条独立的只读就绪探测。

> 已对照 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）的源码
> 核实。包版本 **0.3.1**（slice-00 §1.1）。按 slice-08 §10.1 的方法，以
> `architecture.md` 各标题（§4 Execution and restore、§5
> Snapshot/restore/continuity、§6 Snapshot/restore + Auto-snapshot、
> §7 rules）定位源码——行号仅供参考。本模块是纯拆分，唯独 §6
> （restore-check/restore-packet）是 D15 的源码直译
> （author-from-source）小节——在该处明确标注。

## 1. 快照/恢复/连续性类型

（`architecture.md` §4 “Execution and restore”——规格/投影相关类型见
`agent-spec-and-startup.md`；快照/恢复相关类型在本篇）

- **NodeRestoreOutcome**——`"resumed" | "rebuilt" | "fresh" | "failed" |
  "n-a"`——锁定的恢复词汇表。已在源码重新确认：
  `restore-orchestrator.ts:725-726` 在运行框架已恢复时设
  `baseStatus = "resumed"`；`:763` 在回放检查点时设 `"rebuilt"`；结果联合
  出现在 `:944`（`{ kind: "resumed" }`……）。
- **SnapshotData**——当前的序列化快照载荷。为了兼容旧快照，reboot 扩展
  字段是可选的：`pods?`、`continuityStates?`、`nodeStartupContext?`。
- **NodeStartupSnapshot**——持久化的恢复回放输入：不带分类的投影条目、
  解析后的启动文件、启动动作、runtime。
- **PersistedProjectionEntry**——不带分类的恢复回放接缝：只持久化条目
  身份 + 来源元数据，**不**持久化过时的 `classification`、`conflicts` 或
  `noOps`（架构规则 10）。

## 2. 快照、恢复与连续性 domain 服务

（`architecture.md` §5 “Snapshot, restore, and continuity”）

- `checkpoint-store.ts`——带 pod/连续性上下文的检查点持久化。
- `snapshot-capture.ts`——捕获 pods、连续性状态、启动回放上下文与最近的
  环境回执。已重新确认：`snapshot-capture.ts:66-77` 按 rig 拉取 `pods`、
  `continuity_state` 与 `node_startup_context` 行。
- `snapshot-repository.ts`——快照 CRUD。
- `restore-orchestrator.ts`——resume、检查点交付、启动回放、实时连续性
  查询、拓扑排序，以及在恢复智能体之前的 RigEnv 引导把关。

## 3. 恢复流程与恢复诚实性

（`architecture.md` §6 “Snapshot / restore” + §7 规则 7/14/15/16）

恢复行为，每一点都已在 `restore-orchestrator.ts` 重新确认：

- 按**单调 ULID** 读取最新会话，而不是只看时间戳（`:700`——"Find the
  NEWEST session for this node. ULIDs are monotonic, so latest = max id"）。
- 查询实时 `continuity_state`；节点已处于 `restoring` 时保留其状态
  （`:611-615`——`SELECT status FROM continuity_state …`；
  若 `status === "restoring"` 则跳过该节点并告警）。
- 使用持久化的启动上下文回放恢复安全的启动；把缺失的可选工件预过滤为
  警告；**必需启动文件缺失时让节点硬失败**（`:799`——状态 `"failed"`，
  报错 "Missing required startup files: …"）。
- 在**重新启动之前写入会话记录边界标记**（`:652`——"Write transcript
  boundary marker BEFORE launch (before pipe-pane attaches)"）。
- 拒绝在活会话之上恢复（`:168`——`rig_not_stopped`："Rig … has live
  sessions. Stop the rig with 'rig down' before restoring"）。
- 用 `nativeResumeProbe` 如实评估运行框架是否真的恢复了（`:857` 连续性
  结果对账）。

**恢复诚实性规则**（原文照录，`architecture.md` §7）：

- 规则 7——恢复策略收窄是单向的：`resume_if_possible` →
  `relaunch_fresh` → `checkpoint_only`。
- 规则 14——恢复状态是锁定的：`resumed` / `rebuilt` / `fresh`。
  `rebuilt` = 由工件拼装出的新进程。
- 规则 15——恢复失败就高声报 FAILED。没有自动全新启动回退。全新启动
  只能是显式的后续动作。
- 规则 16——在 `up`、`down`、`restore`、`snapshot create` 之后必须交接：
  发生了什么 + 当前状态 + 下一步动作。

（完整的 25 条规则清单见 `architecture-rules-and-event-system.md`。）

## 4. 自动快照与既有 rig 开机

（`architecture.md` §6 “Auto-snapshot and existing-rig power-on”）

- `rig down <rigId>` 在拆除之前自动捕获 `auto-pre-down` 快照。
- `rig up <rig-name>`（不带文件扩展名）按名称查找既有 rig，并从最新的
  `auto-pre-down` 快照恢复。
- 没有快照时：报错并给出指引（"No saved snapshot for rig 'X'. Boot from
  a spec or bundle path."）。
- 命令后交接：`down` 输出包含快照 ID + 恢复命令；`up` 输出包含节点状态 +
  接入命令。

## 5. 守护进程侧的 restore-check / restore-packet——源码直译（D15）

> **D15 作者小节（按 slice-08 §4.7 约束标注）**：`restore-check` 与
> `restore-packet` 没有任何 `architecture.md` 叙述。本节是本模块（其余皆
> 为纯拆分）唯一的一节源码直译——按 slice-00 的取证标准，从
> `routes/restore-check.ts` + `domain/restore-check-service.ts` +
> `commands/restore-packet.ts` 写就，引用 file:line，版本归因经取证核查。
>
> **版本归因（取证）**：restore-check 不是 0.3.1 特性。
> `routes/restore-check.ts` 首次创建于 `277e279c`（"feat: native rig
> restore-check command"，2026-04-23，早于 0.3.0）；在 `v0.3.0` 与
> `v0.3.1` 两棵 git 树中均存在（`git ls-tree` 确认）。`restore-packet`
> 首次创建于 `23f2921e`（"Restore-Packet vertical M2a"，2026-05-01），
> 同样在 v0.3.0 与 v0.3.1 中存在。缺口在于缺失 architecture.md *散文*，
> 而不是版本归因漂移。

### 5.1 `rig restore-check`——就绪探测

`GET /api/restore-check?rig=<name>&noQueue=<bool>&noHooks=<bool>`
（`routes/restore-check.ts:131`）。该路由在现有的守护进程投影之上组装出
不依赖框架的 `RestoreCheckDeps`（`:138-168`）——来自 `rigRepo` 的
`listRigs`、`getNodeInventory`（按 `logical_id` 联接 `node_id`，
`:21-26,143-149`）、`getStartupContext`（读取 `node_startup_context`，
解析 `projection_entries_json` / `resolved_files_json` /
`startup_actions_json`，`:44-128`）、来自 `snapshotRepo` 的
`hasSnapshot` / `getLatestSnapshot`，以及 `probeDaemonHealth`
（不言自明："We're inside the daemon — if this route is responding,
daemon is healthy"，`:160-163`）。随后运行
`new RestoreCheckService(deps).check(...)`（`:170-171`）。

`RestoreCheckService.check()`（`restore-check-service.ts:244`）分层执行：

1. **主机检查**——`checkDaemonReachable`（探测抛错 →
   `verdict: unknown`，而不是 `not_restorable`，`:252-259`）、
   `checkStateDirWritable`（`:261`）、`checkHostInfraDeclaration`
   （`:262`，实现 `:406`）。
2. **rig 枚举**——`listRigs()` 抛错 → `buildUnknown`（`:267-274`）；
   `--rig` 过滤；未知 rig → 红色 `rig.<name>.exists`（`:276-284`）。
3. **按 rig 检查**——`checkSnapshot`（`:290`，实现 `:675`）、
   `checkSpecPresent`（`:295`）。
4. **按席位检查**——`checkSeatReadiness`（`:311`）、
   `checkStartupContext`（`:315`，实现 `:763`；`unknownChecks` →
   `buildUnknown`）、`checkTranscript`（`:325`）、`checkResumePath`
   （`:329`），以及未被选择退出时的：`checkQueueFile`（`:334`，由
   `--no-queue` 把关，实现 `:870`）与 `checkHooks`（`:339`，由
   `--no-hooks` 把关，实现 `:896`）。
5. **判定**——`buildResult` 汇总：任何红 → `not_restorable`；任何黄 →
   `restorable_with_caveats`；否则 `restorable`；探测不可检视 →
   `unknown`（`:1074-1085`、`:1362-1379`）。另附 `RecoveryPlan`
   （`buildRecovery`，`:1186`）与 `RepairStep[]` 数据包
   （`buildRepairPacket`，`:1392`；完全可恢复时为 `null`）。

结果形状是 `RestoreCheckResult`（`restore-check-service.ts:120-130`）：
`verdict`、`readiness`、`continuity`、`rigs[]`、`hostInfra`、`recovery`、
`counts {red,yellow,green}`、`checks[]`、`repairPacket`。

**诚实报错设计（slice-00 标准）**：守护进程探测的*异常*产生
`verdict: unknown`（不可检视状态），这与守护进程确定宕机的状态不同——
后者是 `red` / `not_restorable`（`restore-check-service.ts:249-259`）。
路由的兜底 catch 返回同样的 `unknown` 形状响应体，配 HTTP 500 +
一条 `probe.error` 红色检查（`routes/restore-check.ts:174-222`）。
`CheckEntry.remediationSafe` 默认 `false`（保守——未分类的修复措施
**不**是自动执行安全的，`restore-check-service.ts:18-24`）。

CLI 呈现面（`cli-reference.md` `### rig restore-check`）：
`rig restore-check [--rig <name>] [--no-queue] [--no-hooks] [--json]`。
退出码：`0` 可恢复（或带注意事项）、`1` 不可恢复（红）、`2` unknown /
探测错误。

### 5.2 `rig restore-packet`——跨运行时恢复数据包

CLI 侧，没有守护进程路由。`commands/restore-packet.ts`（528 行）实现三个
子命令（`cli-reference.md` `### rig restore-packet`）：`write [options]`
（从来源会话或 JSONL 文件生成数据包目录，带 `omitted-records` 统计）、
`read <packet-dir> [--json]`（渲染内容；不改状态）、
`validate <packet-dir> [--json]`（对照 v0 schema 校验；不改状态）。
数据包形状是跨运行时 v0 标准——经运行时解析器 + 脱敏，同时支持
Claude Code 与 Codex 会话记录。

## OPEN / 挂起事项

- **D15（源码直译，已完成）**：restore-check / restore-packet 已从上文
  源码写就；标注为本模块唯一的作者小节。版本归因经取证解决（两者都早于
  0.3.0；缺口在于缺失散文，而不是漂移）。
- slice-00 数值漂移不适用于本模块的拆分内容（足迹/迁移/路由计数归入
  `daemon-core.md`）。

## 另见

- `agent-spec-and-startup.md`——StartupOrchestrator 持久化恢复所消费的
  回放上下文。
- `daemon-core.md`——`/api/restore-check` 是 49 个路由挂载之一
  （`server.ts:513`）。
- `transport-and-transcripts.md`——恢复时写入的会话记录边界标记。
- Source roots: `packages/daemon/src/domain/{restore-orchestrator,
  snapshot-capture,snapshot-repository,checkpoint-store,
  restore-check-service}.ts`, `packages/daemon/src/routes/restore-check.ts`,
  `packages/cli/src/commands/restore-packet.ts`.
