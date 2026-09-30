---
kind: as-built
title: Mission Control——队列可观测性 + 7 动词契约（PL-005）
status: active
topics: [coordination, observability]
domains: [engineering-advisor, operating-advisor, orchestrator, human-operator]
applies-when: |
  需要了解基于守护进程的 Mission Control 呈现面如何工作——七个视图、
  七个写入动词、动作审计表、bearer-token 中间件，或队列可观测性如何
  映射到 PL-004 来源。
siblings: [coordination-primitive.md, workflow-runtime.md, ../ui/project-and-for-you.md]
prerequisite-reads: [../README.md, coordination-primitive.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


Mission Control（PL-005）是基于守护进程的队列可观测性呈现面：嵌在现有 shell 内的集成产品 UI（一个顶层 `/mission-control` 路由，而非新的托管应用），架在 PL-004 Phase A 协调原语之上。按 PRD 验收标准：七个视图、七个动词、一等公民的人类席位、recent-ships=10，以及一张基于守护进程的动作审计表；不做旧看板的迁移/切换（`architecture.md` §3 L368、L390）。

> 已在 HEAD `7eaf524c` 对照源码验证。Mission Control 属于 PL-005（一个 0.3.0 早期移植）；插件与 Claude auto-compaction 是 0.3.1 特性，不在此回溯归属（slice-00 0.3.0-ground-truth seams a/row-7）。

## 1. 七个视图

`MISSION_CONTROL_VIEWS` 是权威视图列表（在 HEAD 重新确认：`packages/daemon/src/domain/mission-control/mission-control-read-layer.ts:32–42`）：`my-queue`、`human-gate`、`fleet`、`active-work`、`recent-ships`、`recently-active`、`recent-observations`。

全部七个视图都以承重的 9 字段手机友好内容模型返回行（rig/mission 名称、当前 phase、active|idle|attention|blocked|degraded、next-action、pending-human-decision、read-cost、最后更新时间戳、confidence/freshness、证据链接）。该模型在所有 7 个视图中不容变通；UI 可以紧凑渲染，JSON 保留全部 9 个字段（`architecture.md` §3 L370）。

`MissionControlReadLayer` 把每个视图映射到其事实来源路径（`mission-control-read-layer.ts:4–14`，在 HEAD 重新确认）：

- `my-queue` / `human-gate` / `active-work` / `recent-ships` 经 `QueueRepository` 查询 PL-004 Phase A 的 `queue_items`。
- `fleet` 消费每 rig 的 CLI capability 缓存 + 队列摘要。
- `recently-active` 委托给 PL-004 Phase B 的 `ViewProjector.show("recently-active")`。
- `recent-observations` 经 `StreamStore` 读取 PL-004 Phase A 的 `stream_items`。

文件系统回退（`~/.openrig/stream/<date>.jsonl`、原始队列文件 grep）是优雅降级的辅助手段，不是主路径（`architecture.md` §3 L378）。

> 范围说明（slice-00 0.3.0-ground-truth OPEN-3，沿用）：For-You 动词子集的确切构成是一个未决的 velocity slice-01 裁定。本模块描述的是**系统级** 7 动词词汇表（已被证实，slice-00 §1.6/seam-c）。它不枚举 For-You 呈现面的子集——该呈现面成文后描述于 `../ui/project-and-for-you.md`。

## 2. 七个动词（写入契约）

七个动词经由承重的 `MissionControlWriteContract` 执行（在 HEAD 重新确认：`packages/daemon/src/domain/mission-control/mission-control-write-contract.ts:27–36`）：

| 动词 | 效果 |
|---|---|
| `approve` | `state="done"`、`closure_reason="no-follow-on"` |
| `deny` | `state="done"`、`closure_reason="denied"` |
| `route` | `state="done"`、`closure_reason="handed_off_to"`、`closure_target`+`handed_off_to`=路由目标；在路由目标处创建新 qitem（1-hop） |
| `annotate` | 不改动队列；仅记录审计 |
| `hold` | `state="blocked"`、`closure_reason="blocked_on"` |
| `drop` | `state="done"`、`closure_reason="canceled"` |
| `handoff` | 4 步形态（见下） |

每个动词是一个原子的守护进程事务：经 `QueueRepository.updateWithinTransaction()` 的队列变更（保留 Phase A 的 hot-potato 关闭校验——见 `coordination-primitive.md` §3）+ `mission_control_actions` 中的一条审计行 + 一条持久化的 `mission_control.action_executed` 事件，全部在同一个 `db.transaction` 中。4 步的 `handoff` 形态（源更新 + 目标创建 + 可选的尽力通知 + 追加审计记录）已验证为原子；通知失败不会回滚持久化的变更（PRD 不变量）。故障注入时，源关闭 + 审计行 + 新 qitem 一起回滚（`architecture.md` §3 L380；`mission-control-write-contract.ts:5,15`）。

## 3. 动作审计表

`mission_control_actions`（`037_mission_control_actions.ts:54` 的 `CREATE TABLE IF NOT EXISTS mission_control_actions`）在 API 面上只追加：它记录每一个经 Mission Control 进行的操作员动作，带变更前后的 qitem 快照以供取证重建。列包括 `action_verb`（TEXT，应用层枚举校验，`:56`）与 `acted_at`（TEXT NOT NULL ISO 时间戳）；索引为 `(acted_at DESC, action_verb)`、`(qitem_id, acted_at DESC)`、`(actor_session, acted_at DESC)`（`037_mission_control_actions.ts:28–44`）。Phase B 没有新增任何迁移——这张 Phase A 表是唯一数据来源（`architecture.md` §3 L364、L392）。

## 4. PL-005 Phase B——bearer 中间件、通知、审计浏览

Phase B 扩展了 daemon 的 Mission Control 呈现面：

- **Bearer-token 中间件**——`packages/daemon/src/middleware/auth-bearer-token.ts`（在 HEAD 重新确认：文件头 `auth-bearer-token.ts:1–9` "PL-005 Phase B"）。经 Node `crypto.timingSafeEqual` 做常数时间 bearer 比较；当绑定了非 loopback 接口且 bearer 配置为空时，daemon 拒绝启动（启动侧检查）。写入动词上强制 bearer：`app.post("/action", requireAuth)`（`routes/mission-control.ts:294`）与 `app.post("/notifications/test", requireAuth)`（`:295`）。v0 是写入时 bearer；没有 OAuth/SSO/按用户模型。
- **通知分发器**——两个适配器（`notification-adapter-ntfy.ts` 默认 + `notification-adapter-webhook.ts` 备选；经 `OPENRIG_NOTIFICATIONS_MECHANISM` 环境变量选择）加 `notification-dispatcher.ts`（在 `domain/mission-control/` 中重新确认）。推荐操作者手机经 tailnet 使用 ntfy.sh。
- **只读审计历史浏览**——基于 `mission_control_actions` 的 `audit-browse.ts`，暴露于 `GET /api/mission-control/audit`（`routes/mission-control.ts:346`），支持过滤，并以 SQLite `rowid` 为游标做 `(limit, before_id)` 分页（`architecture.md` §3 L392）。

## 5. Mission Control 事件

> 漂移修正 D8 / OPEN-4（逐字沿用，slice-00）：`architecture.md` §3 L394 说 "Existing 32 PL-004 events untouched"——与 §3 L410 的 "20" 内部不一致，且早于 0.3.x。**不要沿用其中任何一个数字**。当前的 `RigEvent` 联合类型（`packages/daemon/src/domain/types.ts:94`）共有 **73 个成员**（slice-00 §1.8，在 HEAD 重新确认）；下文描述增量加入的 `mission_control.*` 事件，不断言有争议的 PL-004 子计数。

重新确认 `domain/types.ts:212–218`：Phase A 加入 `mission_control.action_executed`、`mission_control.cli_drift_detected`、`mission_control.view_refreshed`；Phase B 加入 `mission_control.notification_sent`、`mission_control.notification_failed`（HEAD 时 `mission_control.*` 共 5 个成员）。

## 6. 路由呈现面

`missionControlRoutes({ bearerToken })` 挂载于 `server.ts:498`。关键路由（`routes/mission-control.ts`）：`GET /views`（`:245`）、`GET /cli-capabilities`（`:250`）、`POST /action`（`:298`，需认证）、`GET /audit`（`:346`）、`POST /notifications/test`（需认证），另有 SSE 呈现面。集成 UI 是 `packages/ui/src/routes.tsx` 中挂载 `MissionControlSurface` 的 `/mission-control` 顶层路由（`architecture.md` §3 L390）；UI 细节落在 `../ui/project-and-for-you.md`。

## 另见

- `coordination-primitive.md`——Mission Control 读取的 PL-004 Phase A `queue_items`/`stream_items` 来源，以及各动词遵守的 hot-potato 关闭契约。
- `workflow-runtime.md`——PL-004 Phase D 事务书记（transactional-scribe）运行时。
- `../ui/project-and-for-you.md`——UI 呈现面对应篇（成文阶段）。
- 源码根：`packages/daemon/src/domain/mission-control/`、`packages/daemon/src/middleware/auth-bearer-token.ts`、`packages/daemon/src/routes/mission-control.ts`、`packages/daemon/src/db/migrations/037_mission_control_actions.ts`。
