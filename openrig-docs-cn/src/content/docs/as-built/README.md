---
kind: as-built
title: As-Built 文档——实况地图与模块索引
status: active
topics: [knowledge-and-context, observability]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  开启任何需要以实际形态使用 OpenRig 已交付系统的技术任务时。先读本篇，了解
  as-built 树包含的内容以及应当打开哪个模块；随后前往 codemap.md 按用例导航，
  或直接进入指名模块。
siblings: [codemap.md, cli-reference.md, frontmatter-schema.md]
prerequisite-reads: []
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

OpenRig 是一个面向多智能体编码拓扑的本地控制平面——一个把你的 Claude Code 与
Codex 会话作为单一系统来管理的多智能体运行框架（harness），守护进程（daemon，
`@openrig/daemon`）、CLI（`@openrig/cli`）、UI（`@openrig/ui`）与一个 MCP 服务器
全部架在同一个以 SQLite 为底的核心之上。本目录树是对该系统实际交付形态的
**经源码核验**（source-verified）描述——每一个承重论断都锚定到具名 commit 处的
`packages/*/src`，而不是凭记忆、聊天记录或旧文档。

> 已对照 HEAD `7eaf524c` 处的源码核验（`git describe` → `v0.3.1-6-g7eaf524c`）。
> 三个包的版本号均为 **0.3.1**；HEAD 上另有 6 个尚未发布的 0.3.2 工作 commit，
> 没有 `v0.3.2` 标签。

## 本目录树的组织方式

as-built 文档集（slice 08，`context-architecture-v1`）由两份单体大文件模块化为
一个主题模块文件夹：每个模块都可独立加载，均带 frontmatter 标签以便检索，
均不超过 300 行（author 模式下此前没有散文正文的模块可放宽到 ≤400 行——见
slice-08 ACK）。

```
docs/as-built/
├── README.md            ← you are here: map-of-territory + index
├── codemap.md           ← navigation index (use-case lookup, source-root pointers)
├── frontmatter-schema.md← the frontmatter convention these docs follow
├── cli-reference.md     ← full rig CLI surface (kept whole)
├── architecture/        ← 14 backend/runtime modules
└── ui/                  ← 4 operator-surface modules
```

`docs/DESIGN.md`（权威的视觉/品牌/设计系统规范）**按设计保留在仓库 `docs/`
根目录**——许多既有的 `docs/DESIGN.md` 路径都在引用它，且它不存在源码漂移。
本目录树指向它（见 `ui/library-specs-and-design-system.md`），并不在此复制一份。

## 模块索引

### `architecture/`——后端、守护进程与运行时

| 模块 | 覆盖内容 |
|---|---|
| [daemon-core.md](/as-built/architecture/daemon-core/) | 守护进程如何启动、`createDaemon` 的装配、SQLite 模式/40 个迁移集、路由挂载面。 |
| [adapters-and-runtimes.md](/as-built/architecture/adapters-and-runtimes/) | 五方法的 RuntimeAdapter 契约、Claude/Codex/Terminal 适配器（在 tmux 中启动/恢复/分叉），以及恢复诚实层（对究竟属于恢复还是全新开始给出诚实评估）。 |
| [coordination-primitive.md](/as-built/architecture/coordination-primitive/) | PL-004 Phase A 的 stream/queue/inbox/outbox；烫手山芋（hot-potato）式关闭契约；队列关闭在何处被强制执行。 |
| [workflow-runtime.md](/as-built/architecture/workflow-runtime/) | PL-004 Phase D 工作流运行时——spec 缓存、实例状态、步骤轨迹、transactional-scribe 投影、看门狗策略。 |
| [mission-control.md](/as-built/architecture/mission-control/) | PL-005 队列可观测性呈现面——七个视图、七种写动词、操作审计、bearer-token 中间件。 |
| [agent-spec-and-startup.md](/as-built/architecture/agent-spec-and-startup/) | AgentSpec/RigSpec 类型、profile 解析、叠加式启动分层、StartupOrchestrator、whoami/materialize/bind/adopt 身份操作。 |
| [lifecycle-snapshot-restore.md](/as-built/architecture/lifecycle-snapshot-restore/) | 快照捕获、诚实恢复（恢复 vs 重建 vs 全新开始）、恢复诚实性强制、restore-check / restore-packet 探测。 |
| [transport-and-transcripts.md](/as-built/architecture/transport-and-transcripts/) | 基于 tmux 的 rig send/capture/broadcast、pipe-pane 会话记录捕获 + 检索、持久化 SQLite 聊天、`rig ask`、MCP 名称与 tmux 键的区分。 |
| [workspace-primitive.md](/as-built/architecture/workspace-primitive/) | PL-007 带类型的 workspace 声明（root/repos/defaultRepo/knowledgeRoot）、038/039 迁移、逐条目的 repo-scope 门控、基于文件的 missions/slices 索引。 |
| [content-surfaces.md](/as-built/architecture/content-surfaces/) | 操作员允许列表化的文件浏览器、带冲突检查的原子写入 + JSONL 编辑审计、PROGRESS.md 树索引器、单屏 Steering composer。 |
| [living-notes-review.md](/as-built/architecture/living-notes-review/) | **v0.4.4**——Living Notes 评审呈现面：唯一的 `ComposedSliceReview`（intent→plan→delivered）投影、纯 composer + gatherer、分阶段审批锁、绑定 C1 的 `verified`、`/api/review/*` 路由、冻结导出、按 range 请求的媒体服务，以及它所投影的 SDLC 磁盘约定。 |
| [plugin-agent-image-context-pack.md](/as-built/architecture/plugin-agent-image-context-pack/) | 以文件系统为准的内容层——插件发现、智能体镜像（agent image）、上下文包（context pack）、Claude 自动压缩策略执行器。 |
| [packaging-bootstrap-bundles.md](/as-built/architecture/packaging-bootstrap-bundles/) | Bundle 装配（schema-v2 工作舱 bundle + 旧版 v1）、bundle create/inspect/install + `/api/up`、分阶段的 BootstrapOrchestrator、旧版安装接缝。 |
| [architecture-rules-and-event-system.md](/as-built/architecture/architecture-rules-and-event-system/) | 横切不变量——25 条架构规则、RigEvent 联合类型 + SSE 投递、有意为之的兼容性限制。 |

### `ui/`——操作员呈现面

| 模块 | 覆盖内容 |
|---|---|
| [shell-and-routing.md](/as-built/ui/shell-and-routing/) | UI 外壳（rail / Explorer / 中央工作区 / 抽屉 / 预览栈）、已交付 UI 实际挂载的路由树、共享详情抽屉 + 事件消费。 |
| [topology.md](/as-built/ui/topology/) | 拓扑呈现面——宿主混合图、表格/终端视图、活动环 / 烫手山芋视觉语言、终端预览弹出框、导航/覆盖层契约。 |
| [project-and-for-you.md](/as-built/ui/project-and-for-you/) | 操作员目的地呈现面——For-You 关注信息流（5 卡分类器 + 动词操作）、Project 的 workspace/mission/slice scope 页面、基于 vellum 品牌系统的 Dashboard 落地页。 |
| [library-specs-and-design-system.md](/as-built/ui/library-specs-and-design-system/) | Library（`/specs`）UI——specs/skills/plugins/agent-images 呈现面、spec-review + spec-library + live-identity 流程、设计系统指引。 |

### 根目录文档

| 文档 | 覆盖内容 |
|---|---|
| [codemap.md](/as-built/codemap/) | 导航索引——模块地图、结构关系图、按用例快速查找、源码根指针表。当你清楚自己需要*什么*但不知道在*哪个模块*时，从这里开始。 |
| [cli-reference.md](/as-built/cli-reference/) | 完整的 `rig` CLI 呈现面——命令组、子命令、标志、JSON 输出、跨主机、协作原语。按 slice-08 Q4 的决定保留为单一文档。 |
| [frontmatter-schema.md](/as-built/frontmatter-schema/) | 约束本目录树每篇文档的 frontmatter 约定，以及 as-built 独有的那个字段（`last-verified-against-source`）。 |
| `../DESIGN.md` | 权威的视觉/品牌/设计系统规范（按设计位于 `docs/` 根目录；此处仅是指针——不做复制）。 |

## 源码锚定契约

每个模块都声明 `last-verified-against-source: <commit-sha>`——即其论断核验时所
对照的 commit。承重性修正以可审计的注记形式就地记录（`> Drift-fix Dx — said X;
corrected to Y; slice-00 §z; re-confirmed <file:line> @HEAD`）。OPEN 条目（属于
定义性或仅运行期可见的计数）原样保留，从不抹平。schema 定义见
[frontmatter-schema.md](/as-built/frontmatter-schema/)，治理约定位于
`openrig-work/conventions/frontmatter-for-context/`。
