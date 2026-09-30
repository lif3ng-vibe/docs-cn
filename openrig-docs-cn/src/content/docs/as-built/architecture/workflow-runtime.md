---
kind: as-built
title: 工作流运行时 + 看门狗策略（PL-004 Phase C/D）
status: active
topics: [coordination, runtime-control]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 daemon 原生工作流运行时如何工作——workflow specs 缓存、
  实例状态、步骤轨迹（step trails）、事务书记投影契约，或包含
  workflow-keepalive 在内的看门狗策略集。
siblings: [coordination-primitive.md, mission-control.md]
prerequisite-reads: [../README.md, coordination-primitive.md]
last-verified-against-source: slice/opr-0.4.6.wf2-spec-language tip (base d18907ed — WF-1 merged)
last-updated: 2026-07-06
---


daemon 原生的工作流运行时（PL-004 Phase D）把一段意图中的工作序列变成持久的 SQLite 状态：声明式 workflow spec、活实例状态、只追加的步骤轨迹，以及承重的事务书记（transactional-scribe）契约。PRD §L4 的运营模型在语义上是 owner-as-author，在机制上是 workflow-as-transactional-scribe（`architecture.md` §3 L398）。

> 已在 HEAD `7eaf524c` 对照源码验证。

## 1. 三张 Phase D 表（外加诊断性增补）

已在 HEAD 于 `packages/daemon/src/db/migrations/` 重新确认：

- **`workflow_specs`**（`033_workflow_specs.ts:33` 的 `CREATE TABLE … workflow_specs`）——人类撰写的 markdown/YAML spec 文件的读穿缓存。来源在工作区呈现面；daemon 按 `(name, version)` 缓存并带内容 `source_hash`，操作者对 spec 文件的有效编辑在下一次读取时胜出（workspace-surface reconciliation）。Spec 撰写仍以 markdown 为权威；缓存只为快速查找与运行时解析而存在（`architecture.md` §3 L400）。
- **`workflow_instances`**（`034_workflow_instances.ts:45` 的 `CREATE TABLE … workflow_instances`）——每个运行中工作流的活状态：`status`（`active|waiting|completed|failed`）、`current_frontier_json`（活跃 qitem id）、`hop_count`（循环守卫计数器）、`last_continuation_decision_json`。实例凭 SQLite 在 daemon 重启后存活——不做文件系统对账（`architecture.md` §3 L402）。
- **`workflow_step_trails`**（`035_workflow_step_trails.ts:32` 的 `CREATE TABLE … workflow_step_trails`）——有意义步骤流转的只追加历史。每次关闭产生一行轨迹，把先前的 qitem 与下一个 qitem 配对（终态时为 null）。`WorkflowStepTrailLog.record()` 是唯一写入者（`architecture.md` §3 L404）。
- **`040_workflow_specs_diagnostic.ts`**——slice-11（`f68f453a`，slice-00 §1.3 来源记录）。一条 `ALTER TABLE ADD COLUMN`，为 `workflow_specs` 加入解析器/验证器诊断列（**不新增表，除一个 DEFAULT 外不改任何约束**；缓存携带解析/验证诊断供 UI 渲染——`040_..._diagnostic.ts:5–25`）。**此迁移自 `architecture.md` 上次编辑以来是净新增**，且此前没有任何 as-built 文档描述过它（slice-00 §1.3——`f68f453a` 晚于 §3 正文）——按 slice-08 漂移待修登记表在此从源码撰写。

`036_watchdog_policy_enum_extension.ts` 是一个记录性 no-op，登记 Phase D 看门狗枚举扩展（Phase C 经 `PHASE_D_POLICIES` 数组用应用层强制，因此不需要 DDL——`architecture.md` §3 L363）。

## 2. 事务书记契约

承重的 Phase D 保证实现于 `WorkflowProjector.project()`（`packages/daemon/src/domain/workflow-projector.ts`）。已在 HEAD 重新确认：projector 文件头（`workflow-projector.ts:1–20`）声明 "transactional-scribe contract"，且 `project()` 运行单个 `db.transaction`（`workflow-projector.ts:184` `const txn = this.db.transaction(...)`）。在这个唯一事务内：

1. 关闭当前 packet（对 `queue_items` 的状态变更）。
2. 创建下一步 packet（`QueueRepository.createWithinTransaction()`，`workflow-projector.ts:230`）。
3. 记录轨迹条目。
4. 更新实例 frontier + 状态。
5. 持久化 workflow 事件。

要么全部提交，要么全部回滚；交接丢失在设计上不可能。提交后，订阅者收到通知，下一位负责人收到轻推（`architecture.md` §3 L406）。

`WorkflowRuntime`（`packages/daemon/src/domain/workflow-runtime.ts:61` `export class WorkflowRuntime`）是 projector 之上的编排类。

**Phase D 范围边界**（`architecture.md` §3 L412）：不含多跳链接、gate-return-sweep 与关闭强制路径。daemon 的事务状态仍凭借 Phase A 的 hot-potato 严格拒绝充当关闭权威（见 `coordination-primitive.md` §3）；工作流运行时**在关闭发生时投影，但不闸控关闭**。

## 3. workflow-keepalive 看门狗策略

`workflow-keepalive` 是 Phase C 推迟的看门狗策略，是 POC `lib/policies/workflow-keepalive.mjs` 的 TypeScript 移植版，改为读取 SQLite（`packages/daemon/src/domain/policies/workflow-keepalive.ts:1–5`）。已在 HEAD 重新确认（`workflow-keepalive.ts:5–16`）：

- **承重**：它必须经 SQLite 直接读 `workflow_instances`——绝不读 markdown 源。
- 资格判定：`status === "active" || status === "waiting"`。否则 `action=terminal, reason="workflow_not_active"`。
- frontier 为空且无回退目标：跳过，`reason="empty_frontier"`。
- 经查询 `queue_items` 解析 frontier qitem 的负责人；与显式 observer/created-by 目标合并；发送给第一个解析出的目标。

看门狗监督树本身（PL-004 Phase C，`031_watchdog_jobs.ts` / `032_watchdog_history.ts`）只记录有意义的评估；安静的跳过原因（`not_due`、`no_actionable_artifacts`、`active_wake_not_due`）不记录，也不发射 `watchdog.*` 事件——与 POC 对齐，智能体不会因调度器轮询被唤醒（`architecture.md` §3 L362）。Phase D 策略枚举在 Phase C 的三个值之外扩展了 `workflow-keepalive`。

## 4. Workflow 事件

> 漂移修正 D8 / OPEN-4（逐字沿用，slice-00）：`architecture.md` §3 L410 说 "Existing 20 PL-004 events are unchanged"——与 L394 的 "32 PL-004 events untouched" 内部不一致。**不要沿用其中任何一个数字**。当前的 `RigEvent` 联合类型（`packages/daemon/src/domain/types.ts:94`）共有 **73 个成员**（slice-00 §1.8，在 HEAD 重新确认）。下文描述 Phase D 增量的 `workflow.*` 事件，不断言有争议的 PL-004 子计数。

Phase D 以增量的 `workflow.*` 事件扩展 `RigEvent`（重新确认 `domain/types.ts:196–201`）：`workflow.instantiated`、`workflow.step_closed`、`workflow.next_qitem_projected`、`workflow.completed`、`workflow.failed`、`workflow.routing_table_changed`（6 个成员；联合类型中还存在一个独立的 `workflow_spec` 事件）。

## 5. 路由呈现面

`/api/workflow`（`server.ts:495`）——`POST /validate`（`routes/workflow.ts:82`）、`POST /instantiate`（`:93`，`getRuntime(c).instantiate(...)`）、`POST /project`（`:118`，`getRuntime(c).project(...)`——事务书记入口）、`GET /:instance_id/trace`（实例 + 轨迹）、`POST /:instance_id/continue`（幂等检视）。呈现面枚举于 `routes/workflow.ts:21–28`。交叉引用：`rig workflow` CLI 呈现面——见 `../cli-reference.md`。

## 6. WF-1 失败包络（OPR.0.4.6.WF1）

加在保留的 Phase D 核心之上（上文没有任何内容被重新规格化；FR-1 回归测试将其钉住）：

- **步骤截止时间（FR-2，派生——绝不存储）**：`workflow-deadline.ts` 按锚点对每个 active|waiting 实例的 frontier packet 分类——已认领且有 `closure_required_at` · 已认领但 NULL 截止（`claimed_at` + 阈值；workflow packet 出厂层级为 `mode2`，无 SLA 条目）· 从未被认领（`created_at` + 阈值）· 认领后又放弃（按 `created_at`；unclaim 会把 `claimed_at` 置 NULL）。`WORKFLOW_STEP_STUCK_THRESHOLD_SECONDS`（4 小时，等于 routine 层 SLA）是唯一阈值之家；WF-5 绑定它。卡住在正常重新投影时自清除。
- **keepalive 自动武装（FR-3）**：instantiate + 每次交接都在书记事务内部确保每个实例恰有一个 `workflow-keepalive` 看门狗作业；终态退出将其解除武装。自动武装的作业携带 `context.deadline_gated: true`——健康时安静，逾期时其发送瞄准卡住 packet 的负责人并带重投影引导。操作者注册的作业保持与 POC 逐字相同的总是发送对等。
- **启动清扫（FR-4）**：`workflow-boot-sweep.ts` 在 daemon 启动时——重新武装缺失的 keepalive、重发丢失的提交后轻推（frontier packet 待决且 `last_nudge_attempt` 为 NULL = 先提交后崩溃窗口，从 nudge 台账检测）、把卡住的实例浮现出来；一行汇总日志。
- **真正的幂等（FR-5）**：在完整关闭意图同一性（exit/packet/step/actor/resultNote/effective-blocker/evidence 深度相等）下的 waiting 重放吸收——精确重放 = 零写入；任何不匹配 = 经正常路径产生一个新决定。迁移 049 加入 `workflow_instances.version`：每次受守卫的推进以 `WHERE version = ?` 递增它；过期写入者得到结构化的 `instance_version_conflict`，其整个事务回滚。
- **max_hops 强制（FR-6）**：投影时经 `exceedsMaxHops(hopCount, baseline, maxHops)` 比较（v1 基线 = 0；该基线是 WF-5 的 resume 接缝）。超出会把交接转化为诚实的结构化失败（packet 关闭、实例失败、守卫证据入轨迹 + `workflow.failed`）。迁移 050 加入 `workflow_specs.spec_json`——在此之前，`loop_guards`/`invariants`/`closure`/`entry` 在投影时再水化中被静默丢弃（仅列重建）；遗留行在 readThrough 时自愈，并可见地降级（具名的每 spec 一次 advisory）。
- **校验（FR-7）**：`parseWorkflowSpec` 在每一层级对着导出的封闭键集大声拒绝未知键（WF-2 扩展这些键集）；验证器沿 projector 自己导出的 `resolveNextStep` 走可达性/环检测——不可达 step 失败；没有 `max_hops` 的环失败并点名修法；有它则属批准之环。
- **`continue` 诚实化（FR-8）**：在所有地方（CLI 描述/结果、路由注释）重新标注为它真正的只读检视语义；`project` 仍是唯一的推进写入路径。
- **v2 处置（FR-9）**：每一个声明但未强制的键——`invariants.{continuation_required,preserve_lineage,closure_required}`、`closure.*`、step 的 `gates[]`、role 的 `skill_refs`、`next_hop.mode: prefer`、`loop_guards.spawn_budget`——都产生 fail-open 的 `declared_not_enforced_v1` 验证器 advisory（警告；绝不阻断）。`spawn_budget` 的 advisory 点名其 WF-2/WF-6 并行 frontier 验收指针（arch 裁定 2026-07-06）。`fallbackSynthesis`（实例列，从不写入）在 `workflow-types.ts` JSDoc 中处置。

## 7. WF-2 spec 语言（OPR.0.4.6.WF2）

WF-2 扩充了已获批准的 WF-1 引擎所讲的语言。唯一一个具名引擎扩展（分支执行）；其余一切都是语言 + 编译到已交付接缝。

**按结果条件分支（FR-1）**。step 可声明 `next_hop.on: {<exit>: <step-id>}`——分支键只能是已记录的 exit 枚举（`handoff|waiting|done|failed`；封闭集，解析时强制——`spec_branch_key_invalid`）。已映射的 exit 在同一个书记事务内路由到其目标：in-txn 创建下一个 qitem、实例保持 ACTIVE 并绑定到目标、hop 计数 + 版本守卫以与线性推进完全相同的方式递增、所走的分支以增量方式记录（`lastContinuationDecision.branchTaken` + 轨迹行的 `closure_evidence.branch_taken`）——绝不进 `closure_reason`（Phase-A 封闭枚举）。未映射的 `failed`/`done` 与之前一样保持终态；未映射的 `waiting` 保持搁置。`max_hops` 守卫对任何路由都生效（分支路由创造出规范的修复环）；验证时的环检测遍历结构边 ∪ 分支边的并集，并要求声明了 `max_hops` 才批准任何环。路由接缝：`resolveNextStep(spec, step, recordedExit?)`——一个导出函数，未提供 exit 时走结构默认（验证器的路径）。

**逐 step `harness:` 钉定（FR-2）**。`claude-code | codex`（仅智能体运行框架——`terminal` 在解析时被拒并给出教学性错误；Pi 于 0.4.7 加入）。负责人解析选取其节点 `runtime` 列匹配的第一个 `preferred_target`（`nodeRuntimeOf`：最新 session → node 联接）；无匹配 = 结构化的 `harness_pin_unsatisfied`，点名该钉定 + 每个候选者的 runtime。显式负责人覆盖也参与调和——覆盖绝不能悄悄压过钉定。instantiate 时对每个被钉定的 step 做静态检查；每次路由时重查。

**逐 step `host:` 钉定（FR-3）**。`local`/缺省 = 今天即完整执行。registry id 对着 `~/.openrig/hosts.yaml` 验证（daemon 只读孪生；未知 id = `host_not_registered`，点名已注册 id），但远程钉定在 INSTANTIATE 时大声失败，报 `host_pin_remote_unsupported`，点名 MH-3 边界 + 变通办法——在 MH-3 之前队列仅限本地；绝不会把 qitem 铸进一个无法路由它的队列，也没有静默的本地回退。

**结构化的 step 级 `gate:`（FR-5——插座；语义归 WF-5）**。每 step 单数，封闭键集 `{target, summary, evidence_ref}`。HUMAN 目标（已交付的人类席位谓词）→ 编译为人类路由条目（层级 `human-gate` + summary + evidence_ref——已交付的 0.4.4 写路径），由已交付的 `resolve` 动词解决；HANDLER-ROLE 目标 → 发往该角色解析出席位的普通智能体条目。路由进一个设闸 step 会把 gate 条目创建为 frontier packet 并把实例搁置为 `waiting`；resolve/close 从该 step 继续流程（WF-1 的解除搁置——无需重启）。设闸的 ENTRY step 从出生即搁置。

**处置（FR-4）——惰性第三态已死**。遗留的 step `gates: [...]` 字符串列表在解析时移除（`spec_gates_removed`，what/why/fix 点名新的 `gate:` 对象）；`next_hop.mode: prefer` 在解析时移除（`spec_prefer_mode_removed`——它从未有过独特行为）。`skill_refs` / `closure.*` / `invariants.{continuation_required,preserve_lineage,closure_required}` 保留其 WF-1 FR-9 的显式 v2 advisory；`spawn_budget` 保持显式 v2（WF-6/并行 frontier 验收指针）。每个键要么被消费、要么被移除、要么机器可读地表现为 advisory——零个静默惰性键。

**版本化诚实（FR-6）**。新严格性落在 `parseWorkflowSpec`（唯一看到原始键的接缝；WF-1 导出的封闭键集扩展了 `harness`/`host`/`gate` + `next_hop.on`），并在 validate/instantiate/re-parse 时生效。钉定在 WF-2 之前 spec 版本上的活实例继续无失败地执行（project() 按设计没有校验闸；存储的 `spec_json` blob 缺新可选字段也能正常读取）；同一份 spec 文件重新校验则在新规则下失败。

**手写可达性（FR-6）**。`packages/daemon/src/builtins/workflow-specs/` 处有三个已交付的示例形状：`linear-build.yaml`（零 WF-2 特性——零回归参考）、`gated-release.yaml`（人类 gate + harness 钉定）、`branched-remediation.yaml`（有界的失败路径修复环）。

**组合式 RSI 示例（OPR.0.4.6.FAC2）**。`factory-rsi.yaml` 是单 rig 的递归自我改进工厂 MVP：它把分支 + gate + 守卫原语组合进内环——`plan → implement → qa_check → review → release_prep`——其中 `qa_check`/`review` 把 `failed` 分支回 `implement`（有界修复），而 `release_prep`（release-manager 准备工件，不设闸）交接给人类设闸的 `release_signoff`。Dogfood 与这个设闸环解耦：dogfood 席位带外对着已交付产品运行，把发现喂给下一个 plan（RSI 边，不设闸）。修复环仅由可强制的 `loop_guards.max_hops` 批准；一次触发是一次 WF-5 异常（编排器优先，经 `exception_routing`）。它面向已交付的 `factory-rsi` 启动预置模板（`specs/rigs/launch/factory-rsi/`），其席位经 `preferred_targets` 与角色一一钉定——v0 硬编码接缝，无绑定层。

## CLI 呈现面（OPR.0.4.6.WF3）

WF-3 让 CLI 成为人类/智能体的首要驱动呈现面。渲染侧按规则（BR-2）：`run`/`watch` 消费已交付的 SSE 端点（先快照后流式、priorQitemId 去重、重连 → 宣布的轮询回退、结果即退出码：0 完成 / 3 失败）；`trace`/`list`/`show` 的人类模式带格式（argo 形状树、ps 机制列、ATTN 标记）而 `--json` 保持逐字节稳定；`status` 在 CLI 侧由 API 携带的 `instance.deadline` 分类合成 needs-attention 汇总（单一阈值之家——CLI 从不重算类别）。daemon 侧的两个新增：

- **`route`**（`POST /api/workflow/:id/route`，runtime `route()`）：在一个书记事务内 close+recreate+rebind——带来源的诚实 `handed_off_to` 关闭、后继重建（同一 step；`current_step_id` 不变；不增 hop——route 不是推进）、版本守卫下的 frontier 重绑、in-txn 的 keepalive 重新定向。推进权限的撤销是结构性的：旧 packet 在事务中离开 frontier，因此僵尸负责人的过期 `project` 会撞上已交付的 `packet_not_on_frontier` 409。
- **frontier 关闭路径守卫**（`workflow-frontier-guard.ts` → 启动时注入 `QueueRepository`；队列绝不导入 workflow 域）：来自非 workflow 动词、对活的 frontier packet 的终态关闭会被拒绝，报 `workflow_frontier_packet`，what/why/fix 点名 `rig workflow project` / `route`。workflow 写入者传 `viaWorkflowVerb`；非 workflow qitem 看不到任何新行为。

## 异常 + 人类设闸模型（OPR.0.4.6.WF5）

确定性引擎的异常层：happy path 保持无编排器且被证明如此；每个异常在存在的当下恰好变成一个持久的注意条目；响应者解决它，流程从停止处恢复。

- **分类法**（`workflow-exception.ts`）：三个封闭类，作为对已记录状态的纯谓词——`unmapped_failed`（已记录 `status=failed`；WF-2 映射过的 `failed` 路由到修复，不是异常）、`stuck_overdue`（WF-1 截止评估器的裁决逐字消费——唯一阈值之家）、`human_gate_trip`（WF-2 HUMAN 闸；编译出的搁置本身就是该条目）。Handler 角色的闸触发是确定性交接，不是异常——(a)/(b) 类为 handler 自己的 step 兜底。发生键（occurrence key）是该事件段已记录的 packet id：重复检测去重，resolve+resume 关闭，新 packet 是新发生。
- **成熟度拨盘**（`workflow-exception-router.ts` + `exception_routing` spec 语法 + `workflow.exception_routing` 设置键）：目标解析 = spec 逐类 → spec 默认 → host 动态键 → 编排器优先（声明的编排器角色，使用选取 step 负责人的同一 `preferred_targets` 挑选）→ 已注册人类选择（`workflow-human-destination.ts`）。层级拆分：`human-gate` 只乘人类路由的位置——编排器路由的条目携带普通层级，因此已交付的注意并集（按层级匹配、不管目的地）绝不会把它泄入 NEEDS-YOU。已交付的注意谓词未动。
- **(a) 类在事务内诞生**：串行失败与未处理的依赖分支失败共享异常录入。失败 packet、依赖事件段、归属条目与暂存 wake 一起提交，即便某个无关 frontier 仍让实例保持活跃。已映射的修复仍是普通工作流工作；未映射或超 max-hop 的失败需要一位负责人。智能体目的地因未知 rig 被拒时，尝试已注册人类选择。选择、录入或存储失败会回滚这次关闭；它绝不提交幻影人类告警。其他错误保留其原始诊断。**(b) 类在检测时**：启动清扫与 keepalive 评估调用注入的保障器（`workflow-exception-escalation.ts`）——按发生键对照 OPEN 条目经 tag 查询去重，限定于确切的工作流、实例与 packet；从崩溃中幸存的清扫重建被漏掉的条目。正常投影、keepalive（含健康/终态返回）与启动（含已完成实例）对每个逾期条目自己的 packet 做调和。已解决的等待、完成或过时的 frontier packet 只关闭该事件段并保留流转记录；逾期的同侪保持开放。未知来源保留。后续的逾期事件段即便复用同一 packet 也能创建全新条目。
- **人类选择与失败**：现有 `workspace.operator_seat_name` 设置选出一位已注册人类；未设置时要求恰好一位已注册人类。不发明 `human@host` 别名，也不在多位人类中任意挑选。设置与 registry 在回退时读取，因此配置良好的智能体路由不需要人类 registry。缺失、歧义、无效或不可用的选择产生 `workflow_human_destination_unavailable`（失败投影时 HTTP 409）。修好注册/选择后重试。检测时录入失败由 boot 记录，并纳入 keepalive 现有的负责人轻推与评估备注；更晚的检测会重试。已注册目的地仍走网关的普通投递规则与回执台账。录入不是已投递或已阅读的证明。能力清单或检测器实例绑定读取失败会向上传播而不变成无匹配：失败投影返回 HTTP 500 并回滚其 packet、实例与历史写入；逾期检测浮现读取错误而不产出异常条目。有证据的无匹配仍使用已注册人类选择。
- **`resume`**（`POST /api/workflow/:id/resume`，runtime `resume()`，`rig workflow resume`）：一个书记事务内的重新驱动语义——failed→active 重新绑回已记录的失败 step；负责人经投影解析器重新解析（绝不从过时目的地复制——resume 是唯一获批的重新解析点）；`--decision` 持久落在 redrive packet 中；该事件段的开放条目带来源关闭；轨迹保留，绝不重写。对依赖图，`--occurrence <failed-qitem-id>` 选择事件段（存在多个未解决失败时必填）。其解决方案、redrive packet/wake 与确切的实例/事件段异常关闭共享一个事务；同侪保持完好。相同事件段/决策的重试返回既有 redrive；决策字节变化则冲突且不产生变更。活锁护栏（迁移 051）：`hops_baseline` 在 resume 时重新锚定 max_hops 守卫，使每次 redrive 恰好得到一个有界窗口；`resume_count` 是已记录的 redrive 事实；再次超限引发一次诚实的新发生。
- **workflow 感知的 ▲ 区块**（`review/compose.ts deriveWorkflowExceptions` + gatherer 来源）：缺条目兜底行、带评估器证据的卡住行、frontier 非开放的 ANOMALY 行（检测位于 WF-3 FR-6 预防之后），以及感知行——编排器路由的异常在人类区块渲染持有者 + 年龄（同一身份、两种投影、计数 = 1）；人类路由条目在那里不渲染任何内容（● 条目本身即那一行）。状态退出时重组清除。

## 工作流 ↔ rig 绑定层（OPR.0.4.6.FAC1）

在任何能够支撑它的 rig 上运行任何工作流，而无需编辑 spec——自动驾驶工厂的绑定基底。三个接缝：

- **A1——在例化时绑定**（迁移 052，`workflow_instances.bound_rig`）：有效绑定 = `--rig`/`targetRig` 覆盖 `?? spec.target.rig ?? null`；spec 字段保持为默认值（没有路由路径读它——仅展示）。rig 名称持久化（耐久的操作者空间坐标）；name→id 在每个解析点重新新鲜解析——rig 消失则大声失败（`bound_rig_not_found`），绝不静默。NULL = 未绑定 = 与 FAC-1 之前逐字节相同的行为。**未知 rig 校验按来源拆分**（arch 裁定 2026-07-07，target-rig 零回归）：操作者显式 `--rig`/`targetRig` 是权威——未知 → 任何变更之前 `bound_rig_unknown` 硬失败；spec 默认 `target.rig` 是建议性的（撰写于运行时忽略该字段的 FAC-1 前体制）——未知 → 降级为未绑定 + instantiate 结果上的醒目 `advisories` 通知（经路由 + CLI stderr 呈现），绝不硬失败。这为声明了描述性 `target.rig` 且经 `preferred_targets` 路由的已交付/示例 spec（例如 `conveyor`）保住了 AC-1 零回归：它们的例化与 FAC-1 前完全一致。真正需要绑定 rig 的 spec 仍会大声失败，逐 step（entry 在 instantiate，后续的仅角色 step 在投影）——降级是变成带提示的诚实逐 step 失败，绝非沉默。
- **A2——角色→席位能力解析**（`workflow-role-resolver.ts` 纯策略 + `workflow-role-context.ts` 惰性同步快照）：位于 `resolveDefaultOwner` 内的 TIER 3，仅当一个角色声明零个 `preferred_targets` 且实例已绑定时激活。层级顺序神圣：显式负责人 → gate 编译 → 声明的 `preferred_targets`（逐字节相同，绝不经清单过滤）→ 能力 → 大声 null。封闭事实集：role（`nodes.role`，每工作舱成员声明——席位侧，选择加入）· nodeKind · lifecycleState（仅 `running`）· runtime（感知 harness 钉定）· 同步 `pendingWorkCount`（仅 pending 积压）· 派生的规范坐标。异步 `attachAgentActivity`/tmux 探测在结构上不在事务中。仅限托管席位：被接入席位被大声排除（`adopted_seat_not_role_resolvable_v1`）。选择 = 积压最少，普通码点坐标决胜（`driver10@rig < driver2@rig`）。解析在 step 关闭时恰好运行一次（在 frontier + 吸收守卫之后——重放执行零清单读取），并记录为 packet 目的地；WF-5 resume 是唯一重新解析点，如今具备能力感知。全部六个负责人解析点都携带该上下文：projector 下一步、human-gate 搁置 packet 负责人、handler 角色 gate 目的地（无目标 + 已绑定 → 能力）、runtime 入口（活 + 已记录）、急切实例化循环（仅结构性的零角色覆盖检查——`bound_rig_role_uncovered`；不活解析未来 step；预热中的 rig 可例化）、以及 resume。WF-5 异常拨盘的编排器角色位置在两个家（in-txn 的 (a) 类 + 检测时的 (b) 类）都在绑定 rig 上以能力感知解析，若无智能体解析则用已注册人类选择。失败是大声且带候选者的：结构化的逐候选者不合格原因 + 具名的零候选者消息；绝不孵化、绝不自动 `add_member`、绝不路由到死席位。增量的 `owner_resolution` 轨迹证据对每个路由决策记录 `{mode, role, boundRig?, seat}`。
- **A3——角色绑定到席位，绝不绑定占用者**：唯一字符串规则——派生的规范坐标 `{pod}-{member}@{rig}` 既是决胜键也是被记录的目的地，因此席位背后的智能体交接永远不会让工作流搁浅（占用者时代的原始会话名绝不作为角色解析目的地记录）。

## 成员存在的 instantiate advisory（OPR.0.4.6.FAC3——引擎位）

队列传输校验目的地的 RIG，从不校验成员（`topologyValidateRig` 按设计只查 rig 存在——加固它会闸住每个队列写入并破坏合法的非托管目的地），因此一个点名已注册 rig 但成员拼写错误或过时的声明 `preferred_target` 会铸出孤儿 packet，直到后来才作为 WF-5 卡住异常浮现。FAC-3 在最早可知的时刻抓住它：instantiate 时，对每个被 step 引用的角色（每个 step 的 `actor_role` 加 handler gate 的目标角色——与结构覆盖检查遍历的同一引用集），每个解析为 CANONICAL 且点名本 daemon 上已注册 rig 的声明 `preferred_target` 都被探测成员存在性（`rigMemberExists` 在 `rigDeclaresRole` 之侧——同步 SQL，按 FAC-1 Q5 唯一字符串规则使用派生规范坐标，任意生命周期状态与节点类型下的存在性；活性仍归投影负责）。未知成员对每个唯一目标产生一条聚合 advisory——点名每个声明的 step/role 对、后果（工作将无人认领；它将作为卡住异常浮现）与修复提示——推入已交付的 `InstantiateResult.advisories` 列表（FAC-1 `target.rig` 降级呈现面：一个列表、如今两个生产者；由路由 body + CLI stderr 渲染，零新增呈现面）。只建议不否决：instantiate 总是继续。跳过项（按序）：人类席位引用（解析前分类，队列闸原型）、非规范的原始/接入目的地（清单无法为其作保）、未注册 rig（传输已在队列写入时大声拒绝它们——不做双重 advisory）。

## 另见

- `coordination-primitive.md`——PL-004 Phase A；运行时投影所面对的关闭权威。
- `mission-control.md`——PL-005 队列可观测性 + 7 动词契约。
- 源码根：`packages/daemon/src/domain/{workflow-projector,workflow-runtime,workflow-instance-store,workflow-spec-cache,workflow-step-trail-log,workflow-validator}.ts`、`packages/daemon/src/domain/policies/workflow-keepalive.ts`、`packages/daemon/src/domain/{workflow-exception,workflow-exception-router,workflow-exception-escalation}.ts`、`packages/daemon/src/routes/workflow.ts`。