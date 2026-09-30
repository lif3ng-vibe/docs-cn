---
kind: as-built
title: 守护进程核心——接线、DB、迁移与启动
status: active
topics: [runtime-control, observability]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解守护进程如何启动、createDaemon 如何接线依赖图、SQLite schema/
  迁移集合，或路由挂载呈现面时。
siblings: [coordination-primitive.md, agent-spec-and-startup.md, lifecycle-snapshot-restore.md]
prerequisite-reads: [../README.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


OpenRig 是面向多智能体编码拓扑的本地控制平面。守护进程（`@openrig/daemon`）
是不依赖框架、由 SQLite 支撑的核心，CLI（`@openrig/cli`）、UI
（`@openrig/ui`）与 MCP 服务器都构建在它之上。

> 已对照 HEAD `7eaf524c`（`git describe` → `v0.3.1-6-g7eaf524c`）的源码
> 核实。三个包的当前包版本均为 **0.3.1**（根 `package.json`
> `"version": "0.3.1"`；slice-00 §1.1）。HEAD 上还有 6 个未发布的
> release-0.3.2 工作提交；不存在 `v0.3.2` 标签。

## 1. 系统总览

系统有六个架构层（`architecture.md` §1 L23–30）：

1. **AgentSpec / pod 感知核心**——规格解析、消解、优先级、启动编排、
   快照/恢复、bundle。
2. **操作员与拓扑层**——运行框架自动启动、节点清单、会话命名、基础设施
   节点、explorer UI、既有 rig 开机、自动快照、命令后交接。
3. **通信与历史层**——会话记录捕获（pipe-pane）、通信原语
   （send/capture/broadcast）、配置/预检、`rig ask` 上下文包、持久的 rig
   聊天。
4. **编写与身份层**——规格审阅 + 规格库、`whoami`、被收养会话的 tmux
   元数据对等性、bind/materialize/adopt 工作流。
5. **rig 环境层**——rig 作用域的服务记录、基于 Compose 的服务编排、就绪
   门控、环境快照/恢复集成。
6. **智能体管理的软件层**——托管应用分类、面向应用的 browse/review/runtime
   UI，以及规范的 `secrets-manager` 示例。

旧版扁平节点/包流程为向后兼容而保留。

### HEAD `7eaf524c` 处已核实的源码足迹

> 漂移修正 D1/D6——`architecture.md` L6,11 写着 `OpenRig v0.2.0` /
> “Current v0.2.0 release verification”，L7 写着 `376` 个源文件。两者都是
> 冻结在 v0.2.0 之前的过期头部（slice-00 §1.9——最后编辑于 `72982bb2`，
> 2026-03-30）。已更正为下表数值。

| 指标 | HEAD 处取值 | 来源（已独立重新确认） |
|---|---|---|
| 包版本 | **0.3.1**（HEAD + 6 个未发布的 0.3.2 提交） | slice-00 §1.1; `package.json:version` |
| 源码足迹总量 | **601** 个文件 | slice-00 §1.6; `find packages/*/src` 非测试 = 279+87+235 |
| 守护进程足迹 | **279** 总计 / **173** domain / **49** 路由挂载（46 个路由文件）/ **11** 适配器 / **40** 迁移 | slice-00 §1.5/§1.6; `find packages/daemon/src` 非测试 |
| CLI 足迹 | **87** 个文件 | slice-00 §1.6; `find packages/cli/src` 非测试 |
| UI 足迹 | **235** 个文件 | slice-00 §1.6; `find packages/ui/src` `.ts`+`.tsx` 非测试 |

> 足迹计数使用 `find packages/*/src -type f \( -name '*.ts' -o
> -name '*.tsx' \) ! -name '*.test.*'` 谓词（测试位于独立的
> `packages/*/test/` 目录）。用该谓词可复现这些计数；不同的统计口径会
> 平移绝对数值（slice-00 OPEN-5）。

### 技术栈

> 漂移修正 D2——`architecture.md` L37,125 写着 `CLI (53 command groups)`。
> 已在 HEAD 更正为 **58**（slice-00 §1.2：v0.2.0 标签处 53、v0.3.0 处 56、
> v0.3.1 处 57、**HEAD 处 58**——第 58 个是 `0b77cba4` 在 0.3.1 之后加入
> 的 `scopeCommand()`，已重新确认 `index.ts:20,187`）。
>
> 漂移修正 D4——`architecture.md` L40 写着 `31 route groups`，L76 写着
> “`createApp()` now mounts 22 route groups”。已更正为 **49 个
> `app.route()` 挂载 + 4 个专用处理器**（slice-00 §1.5；已重新确认
> `server.ts` 在 L450–513 有 49 处 `app.route(`，外加
> `app.get("/healthz")` :446、`handleExportYaml` :461、
> `handleExportJson` :462、`app.get("*")` :519）。保留 slice-00
> **OPEN-2**：“route-group count is definitional”——源码中没有单一权威的
> “route group” 定义；按挂载数 + 专用处理器口径报告。
>
> 漂移修正 D3——`architecture.md` L54 写着
> `SQLite state (36 migrations)`。已更正为 **40**（slice-00 §1.3；下文
> 重新确认）。

```text
CLI (58 command groups) / UI (explorer + workspace + drawer) / MCP (17 tools)
      |
      v
Hono daemon routes (49 app.route() mounts + 4 dedicated health/export/static handlers)
      |
      +-- dual-format route adapters (legacy v1 + rebooted v0.2)
      +-- env routes (status / logs / down)
      +-- transport routes (send/capture/broadcast)
      +-- transcript routes (tail/grep)
      +-- ask routes (context evidence packs)
      +-- chat routes (durable rig messaging + SSE)
      +-- spec review/library routes (managed-app enrichment + compose preview)
      +-- whoami identity + context-usage route
      +-- coordination routes (stream / queue / workflow / mission-control)
      |
      v
Framework-free domain services (173 daemon domain files)
      |
      +-- SQLite state (40 migrations)
      +-- tmux / cmux / resume adapters
      +-- runtime adapters (Claude Code / Codex / Terminal)
      +-- RigEnv substrate (compose adapter, readiness, orchestrator)
      +-- transport / transcript / chat / ask layers
      +-- whoami identity service
```

核心产品循环：`down (auto-snapshot) → up <rig-name> (auto-restore) →
handoff → inspect/attach → work → repeat`。

> MCP 工具数量为 **17**（`rig_*`）——slice-00 §1.4 确认计数正确且名字是
> `rig_*`（不是 `rigged_*`；`architecture.md` §2 中的 `rigged_*` 字样已
> 过期——重命名早于 v0.2.0）。对任何 `rigged_*` 引用的逐处核实归入
> `transport-and-transcripts.md`（D5）；tmux 的 `@rigged_*` 元数据键是
> 另一条轴，不做一刀切替换。

## 2. 数据库 schema

> 漂移修正 D3——`architecture.md` L243 写着 “27 migrations（22 existing
> plus 5 added by PL-004 Phase A）”，L1002 重复 “27 migrations”；§1 技术
> 栈图 L54 写着 “36 migrations”。全部更正为 **40** 个迁移（`001`–`040`）。
> 三重印证（slice-00 §1.3，已在 HEAD 重新确认）：(1) 文件系统
> `packages/daemon/src/db/migrations/[0-9][0-9][0-9]_*.ts` → 40 个文件，
> `001_core_schema.ts`……`040_workflow_specs_diagnostic.ts`；(2)
> `startup.ts:206` 的 `migrate(db, [...])` 传入 40 元素的 schema 数组
> （`coreSchema`……`workflowSpecsDiagnosticSchema`）；(3) `migrate.ts:13`
> 按名称排序施加，并在 `schema_migrations` 中记录。

### 核心状态表（`001_core_schema.ts`）

`rigs`（拓扑容器，`001_core_schema.ts:7`）、`nodes`（逻辑节点身份，`:17`）、
`edges`（逻辑拓扑关系，`:30`），外加 `bindings`（物理 tmux/cmux 呈现面
接入）、`sessions`（运行中执行状态）、`events`（只追加事件日志）、
`snapshots`（序列化的 rig 状态）、`checkpoints`（按节点恢复状态）。
`architecture.md` §3 L247–289。

### reboot 时代的 schema

- `014_agentspec_reboot.ts`——reboot schema 形态；新增 `pods`、
  `continuity_state`，以及 `nodes`/`sessions`/`checkpoints` 上的 reboot 列
  （`pod_id`、`agent_ref`、`resolved_spec_*`、`startup_status`、
  `continuity_source`）。`architecture.md` §3 L253–289。
- `015_startup_context.ts`——为恢复持久化的启动回放上下文。
- `016_chat_messages.ts`——持久的 rig 作用域聊天（SQLite 支撑；会话记录仍
  经 pipe-pane 由文件系统支撑）。
- `017_pod_namespace.ts`——一等公民的编写式 pod 命名空间，用于导出/收养。
- `018_context_usage.ts`——按节点的上下文用量快照。
- `019_external_cli_attachment.ts`——为外部 CLI 接入扩展的 binding 行。
- `020_rig_services.ts`——面向服务型 rig 的 rig 作用域环境记录。
- `021_seat_handover_observability.ts`, `022_node_codex_config_profile.ts`.

### 协作 / PL-004 / PL-005 / 工作区迁移

- `023_stream_items.ts`……`027_outbox_entries.ts`——PL-004 Phase A 协作表
  （详见 `coordination-primitive.md`）。
- `028_project_classifications.ts`、`029_classifier_leases.ts`、
  `030_views_custom.ts`——PL-004 Phase B 分类器 + 视图表。
  （注：`architecture.md` L361 写着 “028 through 030”；中间那个迁移逐字是
  `029_classifier_leases.ts`——已在 HEAD 重新确认。）
- `031_watchdog_jobs.ts`、`032_watchdog_history.ts`——PL-004 Phase C
  看门狗（watchdog）。
- `033_workflow_specs.ts`、`034_workflow_instances.ts`、
  `035_workflow_step_trails.ts`——PL-004 Phase D 工作流运行时表（详见
  `workflow-runtime.md`）。`036_watchdog_policy_enum_extension.ts` 是仅作
  文档说明的 no-op。
- `037_mission_control_actions.ts`——PL-005 Phase A 审计表
  （`037_mission_control_actions.ts:54` `CREATE TABLE …
  mission_control_actions`；详见 `mission-control.md`）。
- `038_workspace_primitive.ts`、`039_queue_target_repo.ts`——PL-007 类型化
  工作区原语（`bab24bf7`）。
- `040_workflow_specs_diagnostic.ts`——slice-11（`f68f453a`）；一条
  `ALTER TABLE ADD COLUMN`，为 `workflow_specs` 添加解析器/校验器诊断列
  （没有新表）。**是 `architecture.md` 最后一次编辑之后的净新增**——
  slice-00 §1.3 来源考据；归入 `workflow-runtime.md`。

旧版 package/bootstrap/discovery 表（`packages`、`package_installs`、
`install_journal`、`bootstrap_runs`、`bootstrap_actions`、
`runtime_verifications`、`discovered_sessions`）仍处于活跃状态。

## 3. 路由挂载呈现面

`createApp(deps)`（`packages/daemon/src/server.ts:295`）挂载 **49** 个
`app.route()` 路由组挂载（`server.ts` L450–513），外加 4 个专用的非路由
处理器：`GET /healthz`（`:446`）、`GET /api/rigs/:rigId/spec`
（`handleExportYaml`，`:461`）、`GET /api/rigs/:rigId/spec.json`
（`handleExportJson`，`:462`），以及静态/深链的 `app.get("*")` 兜底捕获
（`:519`）。

> OPEN-2（原文照录，slice-00）：路由组“计数”取决于定义——“49” 是
> `server.ts` 中 `app.route()` 挂载的个数。较早的 “31 route groups” /
> “createApp now mounts 22 route groups” 表述（`architecture.md` L40,76）
> 使用的是另一种更小的统计口径。独立佐证：
> `packages/daemon/src/routes/` 有 46 个非测试路由 `.ts` 文件（有些组由
> 共享模块组合而成；49 个挂载是已挂载组的权威计数——slice-00 §1.5）。

挂载族包括 reboot 时代的 rig/session/spec 路由，外加协作路由
（`/api/stream` `server.ts:489`、`/api/queue` `:490`、`/api/workflow`
`:495`、`missionControlRoutes(...)` `:498`）、`/api/health-summary`
（`:511`）、`/api/rigs/:rigId/env`（`:512`）与 `/api/restore-check`
（`:513`）。

## 4. 启动序列（`createDaemon`）

`createDaemon(opts?)` 位于 `packages/daemon/src/startup.ts:203`（异步，
返回 `DaemonResult`）。它返回 `{ app, db, deps, contextMonitor }`
（`startup.ts:1204`）。序列如下（`architecture.md` §9 L1000–1028，已对照
源码更正）：

1. 打开 SQLite 并执行**全部 40 个迁移**（`startup.ts:206`
   `migrate(db, [coreSchema … workflowSpecsDiagnosticSchema])`——40 元素
   数组；`architecture.md` L1002 写着 “27 migrations（22 existing plus
   the 5 PL-004 Phase A coordination tables）”——已更正为 40，漂移修正
   D3）。
2. 构造核心仓储与旧版服务。
3. 构造 package/bootstrap/discovery 服务。
4. 构造 reboot 后的启动/运行时服务：`StartupOrchestrator`、
   `ClaudeCodeAdapter`、`CodexRuntimeAdapter`、`TerminalAdapter`、
   `PodRigInstantiator`、`PodBundleSourceResolver`。
5. 构造 rig 环境服务：`ComposeServicesAdapter`、`ServiceOrchestrator`。
6. 构造操作员/传输/历史服务：`TranscriptStore`、`SessionTransport`、
   `ChatRepository`、`AskService`（含 `HistoryQuery`）、
   `ResumeMetadataRefresher`、`ContextUsageStore`、`ContextMonitor`、
   `NodeInventory`。
7. 构造编写/身份/托管应用服务：`SpecReviewService`、`SpecLibraryService`、
   `WhoamiService`。
8. 构造同时带旧版与 reboot 接缝的 `BootstrapOrchestrator`。
9. 从共享的 `QueueRepository` 实例构造 PL-004 Phase A 协作服务（使
   `InboxHandler.absorb()` 与 `/api/queue` 写同一个仓储）：`StreamStore`、
   `QueueRepository`、`InboxHandler`、`OutboxHandler`。
10. 构建 `AppDeps`，强制共享 DB 不变量，然后调用 `createApp(deps)`
    （`startup.ts:1202`）挂载完整路由树。

守护进程入口 `packages/daemon/src/index.ts:36` 调用
`createDaemon({ dbPath, bearerToken })`。

## 5. 测试与验证状态

> 漂移修正 D7 / OPEN-3（原文照录，slice-00）：`architecture.md` L12,13 与
> §10 L1036–1046 断言守护进程 `2561/2561`、CLI `794/794`、总计
> `2422/2422` 的测试通过计数，以及按包的文件计数（`127`/`37`/`37`）。
> **这些是运行时论断，此处并未重跑**——一次只读静态盘点只数了
> `*.test.ts` 文件：守护进程 **255**、cli **234**（slice-00 §1.7；ui
> 测试文件数未单独收集）。通过计数标记为 `unverified-runtime-claim`；
> 不要把它们当作现状来断言。要断言通过计数，请运行 `pnpm/npm test`
> 并重新核实。

## 另见

- `coordination-primitive.md`——PL-004 Phase A 的 stream/queue/inbox/outbox。
- `agent-spec-and-startup.md`——规格解析/消解/启动契约。
- `lifecycle-snapshot-restore.md`——快照/恢复/连续性。
- Source roots: `packages/daemon/src/{startup.ts,server.ts,index.ts}`,
  `packages/daemon/src/db/migrations/`, `packages/cli/src/index.ts`.
