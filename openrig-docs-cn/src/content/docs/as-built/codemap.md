---
kind: as-built
title: OpenRig Codemap——导航索引/实况地图
status: active
topics: [knowledge-and-context, observability]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  你清楚自己需要了解已交付 OpenRig 系统的什么，但不知道哪个 as-built 模块
  载有它。用模块地图、按用例查找或源码根表路由到正确的文档——或直接跳到
  codemap 指向的源码根。
siblings: [README.md, cli-reference.md]
prerequisite-reads: [README.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

这是一份**实况地图**，不是内容倾倒。它告诉你哪个 as-built 模块回答某个
问题，以及该模块锚定在哪个 `packages/*/src` 根上。深度内容在模块里；代码
在源码根里；本文件同时指向两者。

> 旧 codemap 是一份 425 行、逐文件的 `Exports:`/`Related:` 平铺倾倒，漂移
> 最快（其自身的头部带着过期的 v0.2.0 足迹和一个内部矛盾的命令组计数），
> 且永远塞不进一个上下文窗口。该反模式已退役（slice-08 Q5，创始人批准）。
> 真正有用的部分——源码根索引——按下文源码根指针表的形式保留；逐文件的
> 转录则不再保留。

## (a) 产品框架

OpenRig 是一个面向多智能体编码拓扑的本地控制平面——一个把你的 Claude Code
与 Codex 会话作为单一系统来管理的多智能体运行框架。守护进程
（`@openrig/daemon`）是无关框架、以 SQLite 为底的核心；CLI（`@openrig/cli`）、
UI（`@openrig/ui`）与 MCP 服务器都架在它之上。

> 于 HEAD `7eaf524c`（`v0.3.1-6-g7eaf524c`）完成源码核验；包版本 **0.3.1**，
> HEAD 上有 6 个未发布的 0.3.2 commit，无 `v0.3.2` 标签。框架句经
> `architecture/daemon-core.md` §1 + `openrig-internal/product/positioning.md`
> （"a multi-agent harness, a local control plane that manages your Claude
> Code and Codex sessions as a single system"）三角验证。

## (b) 模块地图

每个模块一行。"何时用它……"镜像每个模块实际的 `applies-when` frontmatter。

### architecture/

| 模块 | 一句话摘要 | 何时用它…… |
|---|---|---|
| `daemon-core.md` | CLI/UI/MCP 共同架于其上的无关框架、SQLite 为底的核心。 | 你需要知道守护进程如何启动、`createDaemon` 如何装配依赖图、SQLite 模式/迁移集或路由挂载面。 |
| `adapters-and-runtimes.md` | 五方法的运行时适配器契约 + 恢复诚实层。 | 你需要运行时适配器契约、OpenRig 如何在 tmux 中启动/恢复 Claude Code、Codex 或终端运行框架，或守护进程如何诚实评估运行框架究竟是真恢复还是全新启动。 |
| `coordination-primitive.md` | PL-004 Phase A：以 SQLite 为规范的持久工作层（`/api/stream`、`/api/queue`）。 | 你需要 stream/queue/inbox/outbox 表、烫手山芋关闭契约、事务化交接保证，或队列关闭在哪里强制执行。 |
| `workflow-runtime.md` | PL-004 Phase D：把预期的工作序列转化为持久的 SQLite 状态。 | 你需要工作流 spec 缓存、实例状态、步骤轨迹、transactional-scribe 投影契约，或含 workflow-keepalive 的看门狗策略集。 |
| `mission-control.md` | PL-005：既有 shell 内由守护进程支撑的队列可观测性呈现面。 | 你需要七个视图、七种写动词、操作审计表、bearer-token 中间件，或队列可观测性如何映射到 PL-004 来源。 |
| `agent-spec-and-startup.md` | 手写的 YAML spec 如何成为已解析、已启动、可按身份寻址的拓扑。 | 你需要 AgentSpec/RigSpec/工作舱感知的重启类型、profile 解析 + 叠加启动分层、StartupOrchestrator 的投递拆分，或 whoami/materialize/bind/adopt 如何解析身份。 |
| `lifecycle-snapshot-restore.md` | `down → up → handoff` 的持久状态一半。 | 你需要 OpenRig 如何捕获快照、恢复 rig（恢复 vs 重建 vs 全新开始）、强制恢复诚实、查询存活连续性，或 restore-check / restore-packet 就绪探测如何工作。 |
| `transport-and-transcripts.md` | 通信与历史层；tmux 是传输，不是真相。 | 你需要 rig send/capture/broadcast 如何工作、pipe-pane 会话记录捕获 + 检索、持久 SQLite 聊天、`rig ask` 收集什么，或 MCP 工具名与 tmux 元数据键的区分。 |
| `workspace-primitive.md` | PL-007：rig 的工作住在哪里的带类型声明。 | 你需要 rig 如何声明带类型的 workspace（root/repos/defaultRepo/knowledgeRoot）、它如何持久化/解析进 whoami / 节点清单、逐条目的 `target_repo` 范围如何校验，或基于文件的 missions/slices 树如何被索引并投影进 Project。 |
| `content-surfaces.md` | Project/Steering 架于其上的操作者允许列表化、以文件系统为准的读写层。 | 你需要文件浏览器如何强制路径安全、带冲突检查的原子写入 + JSONL 编辑审计如何工作、PROGRESS.md 树如何被索引，或单屏 Steering 呈现面如何组装。 |
| `plugin-agent-image-context-pack.md` | 守护进程发现并提供服务的四个以文件系统为准的内容原语。 | 你需要 OpenRig 如何发现插件、捕获/分叉智能体镜像、组装/发送上下文包，或 Claude 自动压缩强制器如何决定发送 `/compact`。 |
| `packaging-bootstrap-bundles.md` | 拓扑如何被打包为可分享 bundle 并在别处重构。 | 你需要 rig/工作舱 bundle 如何装配（schema-v2 vs 旧版 v1）、bundle create/inspect/install + `/api/up` 如何跨来源类别路由、分阶段的 BootstrapOrchestrator 流程，或哪些旧安装引擎接缝仍在交付。 |
| `architecture-rules-and-event-system.md` | 不属于任何单一子系统的横切不变量。 | 你需要 25 条架构规则 + 启动/导入约束、RigEvent 联合类型的形状及其 SSE 投递，或仍描述已交付系统的有意兼容性限制。 |
| `living-notes-review.md` | **v0.4.4**——磁盘 SDLC markdown 上唯一的 intent→plan→delivered 评审投影。 | 你需要 `ComposedSliceReview` 契约、`/api/review/*` 路由、分阶段审批锁（`--scope spec|delivery`）、`## Proof contract` ↔ 证明工件的联接与绑定 C1 的 `verified`、冻结导出，或评审证据的按 range 媒体服务。 |

### ui/

| 模块 | 一句话摘要 | 何时用它…… |
|---|---|---|
| `shell-and-routing.md` | 外壳优先、路由优先、原语驱动的操作者呈现面。 | 你需要 UI 外壳（rail / Explorer / 中央工作区 / 抽屉 / 预览栈）如何组装、已交付 UI 实际挂载的路由树，或共享详情抽屉与事件消费如何工作。 |
| `topology.md` | 操作者眼中 host → rig → 工作舱 → 席位的实况图。 | 你需要拓扑呈现面如何构建——宿主混合图、表格/终端视图、活动环 / 烫手山芋视觉语言、终端预览弹出框，以及导航/覆盖层契约。 |
| `project-and-for-you.md` | 三个面向操作者的目的地呈现面（For You / Project / Dashboard）。 | 你需要 For-You 关注信息流（5 卡分类器 + 动词操作）、Project 的 workspace/mission/slice scope 页面，以及基于 vellum 品牌系统的 Dashboard 落地页如何构建。 |
| `library-specs-and-design-system.md` | Library（`/specs`）目的地 + 设计系统指引。 | 你需要 Library UI 如何组装——spec/skills/plugins 呈现面，供其输入的 spec-review + spec-library + live-identity 流程——或权威视觉/设计系统规范住在哪里。 |

### 根目录

| 文档 | 一句话摘要 | 何时用它…… |
|---|---|---|
| `cli-reference.md` | 完整的 `rig` CLI 呈现面，保留为单一文档。 | 你需要精确的 rig CLI 呈现面——命令组、子命令、标志、JSON 输出、跨主机、协作原语。 |
| `frontmatter-schema.md` | 这些文档遵循的 frontmatter 约定 + as-built 独有字段。 | 你正在 `docs/as-built/` 下编写或更新文档。 |
| `../DESIGN.md` | 权威的视觉/品牌/设计系统规范（仓库 `docs/` 根）。 | 你需要视觉系统、品牌标识或设计系统词条。（按设计保留在根；仅是指针。） |

## (c) 结构关系图

由每个模块的 `siblings` / `prerequisite-reads` frontmatter 构建。
`daemon-core.md` 是脊柱（几乎每个 architecture 模块的前置）；
`shell-and-routing.md` 是 UI 脊柱。

```
                         README.md  (entry — prerequisite for all)
                              │
              ┌───────────────┴───────────────┐
              ▼                                ▼
        architecture/                         ui/
              │                                │
   daemon-core.md ◀── (prerequisite spine for the column below)
      │   │   │  │
      │   │   │  └──▶ adapters-and-runtimes.md
      │   │   │         (five-method contract + resume honesty;
      │   │   │          consumed by agent-spec startup orchestration)
      │   │   └────────────────────────────┐
      │   └──────────────┐                  │
      ▼                  ▼                  ▼
 coordination-      agent-spec-and-    transport-and-
 primitive.md        startup.md         transcripts.md
   │     │              │  │
   ▼     ▼              │  ▼
 workflow-  mission-    │  lifecycle-snapshot-restore.md
 runtime.md control.md  │     ▲ (consumes persisted replay context)
   │          │         │
   └────┬─────┘         ├──▶ packaging-bootstrap-bundles.md
        ▼               │        ▲
 architecture-rules-    │        │ (0.3.x reusable starter-state cluster)
 and-event-system.md    │        ▼
 (consumes all          └──▶ plugin-agent-image-context-pack.md
  PL-004/005 events)

 workspace-primitive.md ──▶ content-surfaces.md
   (PL-007 declaration)      (filesystem read/write layer on top)
        │                          │
        └──────────┬───────────────┘
                   ▼  (UI counterpart)
            ui/project-and-for-you.md

 shell-and-routing.md ──▶ topology.md
        │             └──▶ project-and-for-you.md ◀──▶ architecture/mission-control.md
        └──────────────▶ library-specs-and-design-system.md ──▶ ../DESIGN.md (pointer)
```

阅读顺序规则：先打开模块的 `prerequisite-reads`（`README.md`，多数
architecture 模块接着是 `daemon-core.md`；多数 ui 模块则是 `README.md` 接
`shell-and-routing.md`）。

## (d) 按用例快速查找

| 我需要知道…… | → 查看 |
|---|---|
| 守护进程如何启动 / `createDaemon` 装配 / 迁移集 / 路由挂载 | `architecture/daemon-core.md` |
| 运行时适配器契约 / 运行框架如何在 tmux 中启动或恢复 | `architecture/adapters-and-runtimes.md` |
| Claude 恢复诚实住在哪里 / 恢复 vs 全新的评估 | `architecture/adapters-and-runtimes.md` |
| 队列关闭在哪里强制执行 / 烫手山芋契约 / 持久交接 | `architecture/coordination-primitive.md` |
| 工作流 spec 如何在关闭时投影 / transactional-scribe / 看门狗策略 | `architecture/workflow-runtime.md` |
| Mission Control 视图/动词 / 队列可观测性 / 操作审计 | `architecture/mission-control.md` |
| AgentSpec/RigSpec 类型、profile 解析、启动分层、whoami/bind/adopt | `architecture/agent-spec-and-startup.md` |
| 快照/恢复、恢复诚实、restore-check / restore-packet 探测 | `architecture/lifecycle-snapshot-restore.md` |
| rig send/capture/broadcast、会话记录、持久聊天、`rig ask`、MCP 名与 tmux 键 | `architecture/transport-and-transcripts.md` |
| workspace 原语（root/repos）、`target_repo` 范围门控、missions/slices 索引 | `architecture/workspace-primitive.md` |
| 文件浏览器路径安全、原子写入 + 编辑审计、PROGRESS 树、Steering composer | `architecture/content-surfaces.md` |
| 组合式 slice/mission 评审（`/api/review/*`）、分阶段审批锁、证明工件 + `verified`、冻结导出、按 range 媒体 | `architecture/living-notes-review.md` |
| 插件发现 / 智能体镜像 / 上下文包 / Claude 自动压缩强制器 | `architecture/plugin-agent-image-context-pack.md` |
| bundle 装配、bundle install / `/api/up`、BootstrapOrchestrator、旧安装接缝 | `architecture/packaging-bootstrap-bundles.md` |
| 25 条架构规则 / RigEvent 联合类型 / SSE 投递 / 兼容性限制 | `architecture/architecture-rules-and-event-system.md` |
| UI 外壳、真实路由树、共享详情抽屉 | `ui/shell-and-routing.md` |
| 拓扑图/表格/终端视图、活动环 / 烫手山芋视觉 | `ui/topology.md` |
| For-You 关注信息流、Project scope 页面、Dashboard 落地页 | `ui/project-and-for-you.md` |
| 目的地呈现面上的 vellum 品牌系统（0.3.1 品牌身份） | `ui/project-and-for-you.md`（vellum 品牌 = **0.3.1**，按 slice-00 0.3.0-GT 接缝 (b)；slice-00 §2 第 1 行 = vellum-primitives → brand-identity，第 2 行 = destination-model → polished-destinations） |
| Library `/specs` UI + spec-review/spec-library/live-identity 流程 | `ui/library-specs-and-design-system.md` |
| 完整 `rig` CLI 呈现面 | `cli-reference.md` |
| 视觉/品牌/设计系统规范 | `../DESIGN.md`（仓库 `docs/` 根） |
| 这些文档用哪种 frontmatter + as-built 独有字段 | `frontmatter-schema.md` |

## (e) 源码根指针表

模块 → 主要的 `packages/*/src/...` 根。它取代旧的逐文件
`Exports:`/`Related:` 倾倒：指向代码，而不转录代码。每条论断的源码锚定都
住在模块内部，带 file:line 引证。

| 模块 | 主要源码根 |
|---|---|
| `architecture/daemon-core.md` | `packages/daemon/src/{startup.ts,server.ts,index.ts}`, `packages/daemon/src/db/migrations/`, `packages/cli/src/index.ts` |
| `architecture/adapters-and-runtimes.md` | `packages/daemon/src/domain/runtime-adapter.ts`, `packages/daemon/src/adapters/{claude-code-adapter,codex-runtime-adapter,terminal-adapter}.ts`, `packages/daemon/src/domain/{native-resume-probe,resume-metadata-refresher,codex-thread-id}.ts` |
| `architecture/coordination-primitive.md` | `packages/daemon/src/domain/{stream-store,queue-repository,queue-transition-log,hot-potato-enforcer,inbox-handler,outbox-handler}.ts`, `packages/daemon/src/routes/{stream,queue}.ts` |
| `architecture/workflow-runtime.md` | `packages/daemon/src/domain/{workflow-projector,workflow-runtime,workflow-instance-store,workflow-spec-cache,workflow-step-trail-log,workflow-validator}.ts`, `packages/daemon/src/domain/policies/workflow-keepalive.ts`, `packages/daemon/src/routes/workflow.ts` |
| `architecture/mission-control.md` | `packages/daemon/src/domain/mission-control/`, `packages/daemon/src/middleware/auth-bearer-token.ts`, `packages/daemon/src/routes/mission-control.ts`, `packages/daemon/src/db/migrations/037_mission_control_actions.ts` |
| `architecture/agent-spec-and-startup.md` | `packages/daemon/src/domain/{agent-manifest,rigspec-schema,profile-resolver,startup-orchestrator,whoami-service,claim-service}.ts`, `packages/daemon/src/routes/{rigspec,whoami}.ts` |
| `architecture/lifecycle-snapshot-restore.md` | `packages/daemon/src/domain/{restore-orchestrator,snapshot-capture,snapshot-repository,checkpoint-store}.ts`, `packages/daemon/src/routes/restore-check.ts`, `packages/cli/src/commands/restore-packet.ts` |
| `architecture/transport-and-transcripts.md` | `packages/daemon/src/domain/{session-transport,transcript-store,history-query,ask-service,chat-repository}.ts`, `packages/daemon/src/routes/{transport,transcripts,ask,chat}.ts`, `packages/cli/src/mcp-server.ts` |
| `architecture/workspace-primitive.md` | `packages/daemon/src/domain/workspace/`, `packages/cli/src/commands/config-init-workspace.ts`, `packages/daemon/src/db/migrations/{038,039}*`, `packages/ui/src/routes.tsx` |
| `architecture/content-surfaces.md` | `packages/daemon/src/domain/{files,progress,steering}*`, `packages/daemon/src/routes/{files,progress,steering}.ts`, `packages/ui/src/routes.tsx` |
| `architecture/living-notes-review.md` | `packages/daemon/src/domain/review/{types,compose,gather,freeze,brief-spine}.ts`, `packages/daemon/src/routes/{review,files,slices}.ts`, `packages/cli/src/commands/{scope,proof}.ts`, `packages/ui/src/components/review/` |
| `architecture/plugin-agent-image-context-pack.md` | `packages/daemon/src/domain/plugin-discovery-service.ts`, `packages/daemon/src/domain/{agent-images,context-packs}/`, `packages/daemon/src/domain/claude-compaction-enforcer.ts` |
| `architecture/packaging-bootstrap-bundles.md` | `packages/daemon/src/domain/{pod-bundle-assembler,bootstrap-orchestrator,bundle-*,package-*,install-*}.ts`, `packages/daemon/src/routes/{bundles,up}.ts` |
| `architecture/architecture-rules-and-event-system.md` | `packages/daemon/src/domain/types.ts` (RigEvent union), `packages/daemon/src/routes/{stream,queue}.ts` (SSE watch), `packages/daemon/src/server.ts` (`/api/events`) |
| `ui/shell-and-routing.md` | `packages/ui/src/routes.tsx`, `packages/ui/src/components/AppShell.tsx` |
| `ui/topology.md` | `packages/ui/src/components/topology/`, `packages/ui/src/lib/{graph,hybrid,multi-rig}-layout.ts` |
| `ui/project-and-for-you.md` | `packages/ui/src/routes.tsx`, `packages/ui/src/components/dashboard/vellum/` |
| `ui/library-specs-and-design-system.md` | `packages/ui/src/components/specs/`, `packages/daemon/src/domain/{spec-review-service,spec-library-service}.ts`, `../DESIGN.md` (pointer) |
| `cli-reference.md` | `packages/cli/src/index.ts`, `packages/cli/src/commands/*` |

> 没有逐文件平铺倾倒。文件级细节属于代码；本 codemap 指向源码根与解释它的
> 模块。逐文件索引反模式（旧 codemap）已退役，而不是搬家。