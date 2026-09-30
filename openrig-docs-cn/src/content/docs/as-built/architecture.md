---
kind: as-built
title: architecture.md——已重组进模块化 As-Built 目录树（重定向存根）
status: superseded
topics: [knowledge-and-context]
domains: [engineering-advisor, operating-advisor, product-advisor]
applies-when: |
  你沿着一个旧引用来到了 docs/as-built/architecture.md。这份单体大文件已重组
  （slice-08，context-architecture-v1）为主题模块文件夹。请前往 README.md
  （实况地图）或 codemap.md（按用例查找），再进入指名模块。
siblings: [README.md, codemap.md, ui.md]
prerequisite-reads: []
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---

这份单文件单体已拆分为一个由可独立加载、带 frontmatter 标签的主题模块组成的
文件夹（slice-08，`context-architecture-v1`）。已交付 daemon/运行时的权威
as-built 描述现位于 `architecture/`。本存根只是一个转发指针，让旧引用仍可解析。

**从这里开始**：

- [`./README.md`](/as-built/README/)——实况地图与完整模块索引。
- [`./codemap.md`](/as-built/codemap/)——导航索引：按用例查找表与源码根指针。当你
  清楚自己需要*什么*但不知道是*哪个*模块时，用它。

## 主要内容去向

架构内容现为 **`architecture/` 下的 14 个模块**（slice-08 重组产生的 13 个 +
v0.4.4 新增的 `living-notes-review.md`）：

| 模块 | 迁移至此的内容 |
|---|---|
| [`architecture/daemon-core.md`](/as-built/architecture/daemon-core/) | 守护进程启动、`createDaemon` 装配、SQLite 模式/迁移集、路由挂载面、系统总览、包边界。 |
| [`architecture/adapters-and-runtimes.md`](/as-built/architecture/adapters-and-runtimes/) | 五方法的 RuntimeAdapter 契约；Claude/Codex/Terminal 适配器；**恢复诚实**（Resume honesty）层（§ Resume honesty）。 |
| [`architecture/coordination-primitive.md`](/as-built/architecture/coordination-primitive/) | PL-004 Phase A 的 stream/queue/inbox/outbox；烫手山芋式关闭契约；持久化交接。 |
| [`architecture/workflow-runtime.md`](/as-built/architecture/workflow-runtime/) | PL-004 Phase D 工作流运行时——spec 缓存、实例状态、步骤轨迹、transactional-scribe、看门狗策略。 |
| [`architecture/mission-control.md`](/as-built/architecture/mission-control/) | PL-005 Mission Control / 队列可观测性——`/api/mission-control/*` 呈现面、七个视图、七种写动词、操作审计、bearer-token 中间件。 |
| [`architecture/agent-spec-and-startup.md`](/as-built/architecture/agent-spec-and-startup/) | AgentSpec/RigSpec 类型、profile 解析、叠加式启动分层、StartupOrchestrator、whoami/materialize/bind/adopt。 |
| [`architecture/lifecycle-snapshot-restore.md`](/as-built/architecture/lifecycle-snapshot-restore/) | 快照捕获、诚实恢复（恢复 vs 重建 vs 全新开始）、逐字保留的恢复诚实规则、restore-check / restore-packet 探测。 |
| [`architecture/transport-and-transcripts.md`](/as-built/architecture/transport-and-transcripts/) | 基于 tmux 的 rig send/capture/broadcast、会话记录捕获 + 检索、持久化 SQLite 聊天、`rig ask`、MCP 名称与 tmux 键。 |
| [`architecture/workspace-primitive.md`](/as-built/architecture/workspace-primitive/) | PL-007 带类型的 workspace 声明、038/039 迁移、逐条目的 repo-scope 门控、基于文件的 missions/slices 索引。 |
| [`architecture/content-surfaces.md`](/as-built/architecture/content-surfaces/) | 操作员允许列表化的文件浏览器、带冲突检查的原子写入 + 编辑审计、PROGRESS.md 树索引器、Steering composer。 |
| [`architecture/plugin-agent-image-context-pack.md`](/as-built/architecture/plugin-agent-image-context-pack/) | 插件发现、智能体镜像、上下文包、Claude 自动压缩执行器。 |
| [`architecture/packaging-bootstrap-bundles.md`](/as-built/architecture/packaging-bootstrap-bundles/) | Bundle 装配（schema-v2 + 旧版 v1）、bundle create/inspect/install + `/api/up`、分阶段的 BootstrapOrchestrator、旧版安装接缝。 |
| [`architecture/architecture-rules-and-event-system.md`](/as-built/architecture/architecture-rules-and-event-system/) | 横切不变量——25 条架构规则（含 **rule 15**，恢复诚实）、RigEvent 联合类型 + SSE 投递、有意为之的兼容性限制。 |
| [`architecture/living-notes-review.md`](/as-built/architecture/living-notes-review/) | **v0.4.4 新增**（不属于原单体文件）：Living Notes 评审呈现面——唯一的 intent→plan→delivered 投影、分阶段审批锁、证明工件、冻结导出、按 range 请求的媒体服务。 |

旧 `### UI architecture` 小节中的 UI 一半，现为 **`ui/` 下的 4 个模块**（见同样
作为重定向存根的 [`ui.md`](/as-built/ui/)，以及 [`./README.md`](/as-built/README/) 中的
`ui/` 索引）。
