---
kind: as-built
title: Agent/Rig 规格、解析、启动与身份
status: active
topics: [specification-and-bundles, agent-runtime]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解规范的 AgentSpec/RigSpec/pod 感知 reboot 类型、profile 解析与叠加式
  启动分层如何运作、StartupOrchestrator 的启动前与交互交付分工，或
  whoami/materialize/bind/adopt 如何解析并保全身份时。
siblings: [daemon-core.md, adapters-and-runtimes.md, lifecycle-snapshot-restore.md, packaging-bootstrap-bundles.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


守护进程如何把编写好的 YAML 规格变成一份已解析、已投影、已启动且可按身份
寻址的拓扑。规格与启动契约：parse → resolve → project → deliver → launch →
wait → persist replay context。

> 已对照 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）的源码核实。
> 三个包的包版本均为 **0.3.1**（slice-00 §1.1）。按 slice-08 §10.1 的方法，
> 以 `architecture.md` 各标题（§4 Canonical Reboot Types、§5 Domain Services、
> §6 Execution Flows、§7 Architecture Rules）定位源码出处——行号仅供参考。

## 1. 规范的规格与拓扑类型

（`architecture.md` §4 “Spec and topology”）

- **AgentSpec**——从 `agent.yaml` 解析而来。拥有 imports、defaults、startup、
  resources 与 profiles。规范的 parse/normalize/validate 实现在
  `domain/agent-manifest.ts`。
- **RigSpec**——规范的 pod 感知 rig 拓扑。使用 `version: "0.2"` 与
  `pods[]`；拥有跨 pod 的 `edges[]`、rig 级启动叠加层与 `cultureFile`。

  > 漂移修正 D-spec-version——`architecture.md` §4 说 RigSpec
  > “Uses `version: "0.2"`”。这是**规格 schema 版本，不是包版本**——与
  > 0.3.1 包版本分属不同的版本轴。该值并非代码常量：`rigspec-schema.ts:52`
  > 对 `version` 的校验只是“必填的非空字符串”
  > （`if (!obj["version"] || typeof obj["version"] !== "string")`）；
  > `:163` 原样透传为 `raw["version"] as string`。`"0.2"` 是规范的编写值，
  > 作为 schema 轴的描述是正确的。不要把它“纠正”成 0.3.1
  > （slice-08 §4.6 约束）。已在 HEAD 重新确认 `rigspec-schema.ts:52,163`。

- **RigServicesSpec**——pod 感知 RigSpec 上可选的 `services` 块。随版本
  发布的 kind 是基于 Compose 的环境管理，字段有 `composeFile`、
  `projectName?`、`profiles?`、`downPolicy?`、`waitFor?`、`surfaces?`、
  `checkpoints?`。
- **RigSpecPod**——pod 局部的限界上下文，含 `members[]`、pod 局部
  `edges[]`、pod 启动与可选的连续性策略。
- **RigSpecPodMember**——成员级的 runtime/启动呈现面：`agentRef`、
  `profile`、`runtime`、`model?`、`cwd`、`restorePolicy?` 与成员启动叠加层。
- **Pod**——pod 的持久化 DB 实体。
- **ContinuityState**——以 `podId + nodeId` 为键的持久化实时连续性行。

## 2. 执行与投影类型

（`architecture.md` §4 “Execution and restore”——restore/snapshot 相关类型
详见 `lifecycle-snapshot-restore.md`；规格/投影相关类型在本篇）

- **ResolvedNodeConfig**——profile 解析的输出。携带生效的
  runtime/model/cwd、收窄后的恢复策略、选定的资源、分层叠加后的启动块，
  以及解析出的规格身份。
- **ProjectionPlan**——某节点的运行时投影计划：runtime、cwd、投影条目、
  启动块、诊断信息，以及冲突/无操作（conflict/no-op）分类。
- **RuntimeAdapter**——五方法契约（适配器细节见
  `adapters-and-runtimes.md`）：`listInstalled(binding)`
  （`runtime-adapter.ts:131`）、`project(plan, binding)`（`:134`）、
  `deliverStartup(files, binding)`（`:137`）、
  `launchHarness(binding, opts)`（`:147`）、`checkReady(binding)`
  （`:153`）。已在 HEAD 重新确认——契约是最新的。
- **HarnessLaunchResult**——`launchHarness` 返回的
  `{ ok, resumeToken?, resumeType?, error? }`。
- **StartupOrchestrator**——驱动完整启动序列（见下文 §4）。

## 3. 解析、校验与消解（resolve）管线

（`architecture.md` §5 “Parsing and validation” + “Resolution pipeline”；
全部位于 `packages/daemon/src/domain/` 下，按架构规则 1 零 Hono 导入）

**解析 / 校验：**

- `agent-manifest.ts`——规范的 AgentSpec parse/normalize/validate。
- `rigspec-schema.ts`——双格式 RigSpec 校验。
- `rigspec-codec.ts`——双格式 YAML 编解码器。
- `startup-validation.ts`——共享的启动块校验。
- `path-safety.ts`——共享的相对路径安全检查。
- `spec-validation-service.ts`——纯原始 YAML 校验辅助函数。
- `spec-review-service.ts`——守护进程自有的结构化审阅模型，面向
  RigSpec/AgentSpec YAML，含拓扑预览、来源（provenance）状态与托管应用
  服务元数据（`waitFor`、`surfaces`、`composePreview`）。

**消解：**

- `agent-resolver.ts`——消解 `agent_ref`、imports 与冲突元数据。
- `agent-preflight.ts`——单个智能体的消解/预检。
- `profile-resolver.ts`——应用默认值、profile 引用、资源选择、启动分层
  与恢复策略收窄。
- `startup-resolver.ts`——叠加式启动分层。
- `projection-planner.ts`——运行时资源投影规划。

全部十一个文件已在 HEAD 重新确认存在于 `packages/daemon/src/domain/`。

## 4. 启动编排（规格-启动契约）

（`architecture.md` §4 “StartupOrchestrator” + §5 “Startup, runtime, and
instantiation” + §7 架构规则 6）

`StartupOrchestrator`（`domain/startup-orchestrator.ts`）驱动：
标记 pending → 投影资源 → 交付启动前文件 → 启动运行框架 → 等待就绪 →
交付交互文件 → 执行动作 → 持久化上下文 → 标记 ready。

**启动前与交互交付的分工**——承重接缝，已在源码重新确认：

- 启动前（文件系统，运行框架引导之前）：`guidance_merge`、
  `skill_install`（`startup-orchestrator.ts:78,167`——“Deliver pre-launch
  files (guidance_merge, skill_install → filesystem)”）。
- 启动后（TUI，运行框架就绪之后）：`send_text`
  （`startup-orchestrator.ts:82,160,263`——在 `:141` 按具体提示划分，
  在 `:263` 就绪后交付）。

编排器会持久化回放上下文，包括供未来恢复使用的恢复令牌（由
`lifecycle-snapshot-restore.md` 消费）。

**架构规则 6——启动分层是叠加且有序的**（原文照录，`architecture.md` §7）：
(1) agent 基础层，(2) profile 层，(3) rig 文化文件（culture file）层，
(4) rig 启动层，(5) pod 启动层，(6) 成员启动层，(7) 操作员调试追加层。
这是规格-启动契约的不变量；完整的 25 条规则清单见
`architecture-rules-and-event-system.md`。

**启动动作约束**（`architecture.md` §7 “Current startup action
constraints”）：不允许 shell 启动动作；动作类型仅限 `slash_command` 与
`send_text`；非幂等动作不得在恢复时重复施加；启动失败的重试按恢复处理。

**远程导入约束**（§7）：reboot 支持 `local:...` 与 `path:/abs/...`。
远程 `agent_ref` 来源仍不受支持，会在预检阶段失败。

## 5. 实例化、预检与导出

（`architecture.md` §5 “Startup, runtime, and instantiation” + §6 “RigSpec
import / validate / preflight / export”）

- `runtime-adapter.ts`——适配器契约与桥接类型。
- `rigspec-preflight.ts`——双栈：旧版预检加上 reboot 后的
  `rigPreflight(...)`。
- `rigspec-instantiator.ts`——双栈：`RigInstantiator` 加上
  `PodRigInstantiator`。
- `rigspec-exporter.ts`——双格式的实时 rig 导出（YAML/JSON）。
- `pod-repository.ts`——pod CRUD 以及实时连续性状态 CRUD。

`routes/rigspec.ts` 是双格式接缝：validate（pod 感知 →
`RigSpecSchema.validate`；legacy → `LegacyRigSpecSchema.validate`）、
preflight（`rigPreflight({ rigSpecYaml, rigRoot, fsOps })` 对
`RigSpecPreflight.check(spec)`）、import
（`podInstantiator.instantiate(yaml, rigRoot)` 对
`RigInstantiator.instantiate(spec)`）、export（pod 感知导出规范的
`version: "0.2"` RigSpec；legacy 导出扁平节点 v1）。

## 6. 身份：whoami、materialize、bind、adopt

（`architecture.md` §6 “Whoami and adopted-session parity flow” +
“Materialize / bind / adopt flow”）

**whoami 消解**——守护进程经由 `/api/whoami`（`routes/whoami.ts`）掌握
真相呈现面；tmux 元数据只是被收养会话（adopted session）的锚点，并非最高
真相。`whoami-service.ts:8` 声明 `resolvedBy: "node_id" | "session_name"`。
该路由要求 `nodeId` 或 `sessionName`（`routes/whoami.ts:10-15`）。
消解顺序：显式 `--node-id` → 显式 `--session` → 环境变量 → tmux 元数据 →
原始 tmux 会话名兜底。

- 托管会话优先使用投影出的 `OPENRIG_NODE_ID` /
  `OPENRIG_SESSION_NAME`。
- 被收养会话使用认领/绑定时写入的 tmux 自有元数据。

  > 漂移细节 D5（谨慎轴——另见 `transport-and-transcripts.md`）：
  > `architecture.md` §6 中的 tmux 元数据键 `@rigged_node_id` /
  > `@rigged_session_name` / `@rigged_rig_id` / `@rigged_rig_name` /
  > `@rigged_logical_id` **原样正确**，且已在源码逐字核实——
  > `claim-service.ts:77-81` 写入的正是这些 `@rigged_*` 键；
  > `claim-service.ts` 与 `rig-lifecycle-service.ts` 读取它们。
  > 这与 MCP 工具名（后者为 `rig_*`，slice-00 §1.4）分属**独立的轴**。
  > 不要把 `rigged` 一刀切替换成 `rig`（已入库的
  > `feedback_release_prep_three_layer_depersonalization`：那次重命名是
  > 有范围限定的，不是全局的）。tmux 元数据键**并未**重命名。
  > 已在 HEAD 重新确认 `claim-service.ts:77-81`。

**Materialize / bind / adopt**（`architecture.md` §6）：
`POST /api/rigs/import/materialize` 创建 pod 感知拓扑但不启动会话；
`POST /api/discovery/:id/bind` 把发现到的活会话接到一个已有的逻辑节点上；
`POST /api/discovery/:id/adopt` 是复合路由（绑到已有节点，或在目标 pod 中
新建成员并立即绑定）。CLI 侧对应 `rig bind` / `rig adopt`。编写时确定的
pod 命名空间在收养全程保留，因此逻辑 id 始终是
`${podNamespace}.${memberName}`（架构规则 24：被收养会话的对等性是
tmux 元数据对等性，而不是虚假的环境变量对等性）。

## OPEN / 挂起事项

- **D-spec-version（判定为原样正确）**：RigSpec `version: "0.2"` 是规格
  schema 轴，源码中仅按非空字符串校验。已记录，而非“纠正”。
- **D5（谨慎处理，本模块判定为原样正确）**：tmux `@rigged_*` 元数据键在
  HEAD 处逐字仍是 `@rigged_*`——architecture.md §6 是准确的。MCP 工具名的
  `rigged_*` 漂移归入 `transport-and-transcripts.md`。

## 另见

- `daemon-core.md`——createDaemon 接线；迁移/路由呈现面。
- `adapters-and-runtimes.md`——五方法 RuntimeAdapter 契约的细节。
- `lifecycle-snapshot-restore.md`——快照/恢复消费持久化的回放上下文。
- `architecture-rules-and-event-system.md`——完整的 25 条架构规则。
- Source roots: `packages/daemon/src/domain/{agent-manifest,rigspec-schema,
  profile-resolver,startup-orchestrator,whoami-service,claim-service}.ts`,
  `packages/daemon/src/routes/{rigspec,whoami}.ts`.
