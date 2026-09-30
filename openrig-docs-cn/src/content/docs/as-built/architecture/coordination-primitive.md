---
kind: as-built
title: 协作原语——Stream/Queue/Inbox/Outbox（PL-004 Phase A）
status: active
topics: [coordination, observability]
domains: [engineering-advisor, operating-advisor, orchestrator]
applies-when: |
  需要了解守护进程支撑的协作原语如何工作——stream/queue/inbox/outbox 表、
  hot-potato 关闭契约、事务性交接保证，或队列关闭在哪里强制执行时。
siblings: [workflow-runtime.md, mission-control.md, daemon-core.md]
prerequisite-reads: [../README.md, daemon-core.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


PL-004 Phase A 协作原语是守护进程经 `/api/stream` 与 `/api/queue` 呈现的、
以 SQLite 为准的持久工作层。对守护进程支撑的工作而言，它取代了 POC 文件
系统的 `rigx queue` / `rigx stream` 路径；POC 文件系统路径原封未动，守护
进程的 `rig queue` / `rig stream` 只写 SQLite（`architecture.md` §5 L651）。

> 已对照 HEAD `7eaf524c` 的源码核实。

## 1. 五张 host 作用域的表

五张 host 作用域的表支撑该原语（`architecture.md` §3 L416–438；迁移已在
HEAD 于 `packages/daemon/src/db/migrations/` 重新确认）：

- **`stream_items`**（`023_stream_items.ts`）——L1 只追加的接入/审计根。
  列：`stream_item_id`（ULID 主键）、`ts_emitted`、`stream_sort_key`、
  `source_session`、`body`、`format`（默认 `text`）、`hint_type`、
  `hint_urgency`、`hint_destination`、`hint_tags`（JSON）、`interrupt`、
  `archived_at`。条目发射后不可变（只有 `archived_at` 可以再设置）。
- **`queue_items`**（`024_queue_items.ts`）——L3 归属工作队列。
  `qitem_id` 是 TEXT 主键，保留 POC 的 `qitem-YYYYMMDDHHMMSS-<hex>` 形态。
  状态枚举（8 个值）：`pending | in-progress | done | blocked | failed |
  denied | canceled | handed-off`。携带 `closure_reason`、`closure_target`、
  `closure_required_at`、`chain_of_record`（JSON）、`blocked_on`、
  `handed_off_to`/`handed_off_from` 以及 nudge/heartbeat 字段。
- **`queue_transitions`**（`025_queue_transitions.ts`）——L3 只追加的流转
  日志；状态演进的权威审计轨迹。domain 代码不做 UPDATE/DELETE。
- **`inbox_entries`**（`026_inbox_entries.ts`）——信箱式的异步投递；以
  `inbox_id` 幂等。状态：`pending | absorbed | denied`。
- **`outbox_entries`**（`027_outbox_entries.ts`）——发送侧审计；与 inbox
  对称；以 `outbox_id` 幂等。投递状态：
  `pending | delivered | failed`。

> 漂移修正 D3——`architecture.md` §3 L243 把 schema 描述为“27
> migrations（22 existing plus 5 added by PL-004 Phase A）”。PL-004
> Phase A 的 5 张协作表（`023`–`027`）作为*区间*仍然正确，但迁移总数是
> **40**，不是 27（slice-00 §1.3，已在 HEAD 重新确认：`startup.ts:206`
> 是 40 元素的 `migrate()` 数组；完整的漂移修正依据与更正见
> `daemon-core.md`）。

## 2. 六个 host 作用域的服务

六个 host 作用域的 domain 服务实现该层（`architecture.md` §5 L649–658；
文件已在 HEAD 于 `packages/daemon/src/domain/` 重新确认）。路由导入这些
服务；服务零 Hono：

- **`stream-store.ts`**——L1 流：幂等发射（以 `stream_item_id` 为准）、
  按时间顺序的列表（带游标分页，外加来源、目的地、精确标签与闭区间时间窗
  过滤器）、软归档。`direction=latest` 先施加全部过滤器再取最新的一页，
  然后按时间顺序返回该页。
- **`queue-repository.ts`**——L3 队列：create、claim/unclaim、update
  （通用状态修改器，对 `done` 施加 hot-potato 严格拒绝）、事务性交接
  （在同一事务中把来源关闭为 `handed-off` 并新建一条归属 qitem）、pod
  回退重路由、逾期查询、nudge/heartbeat 跟踪。跨 rig 校验钩子以
  `validateRig` 构造选项暴露。
- **`queue-transition-log.ts`**——只追加的状态流转日志；由
  `queue-repository.ts` 使用，经 `queue_repository.transitionLog` 只读
  暴露。
- **`hot-potato-enforcer.ts`**——承重 API 契约的纯校验器（见 §3）。
- **`inbox-handler.ts`**——信箱处理器：经认证的投递（以 `inbox_id` 幂等）、
  absorb（把 pending 条目提升为 `queue_item`，幂等）、deny（记录原因）。
  认证检查是可插拔的构造钩子。
- **`outbox-handler.ts`**——发送侧 outbox：幂等记录、标记 delivered/failed、
  列表。不发射任何事件总线事件（纯审计）。

`queue-stuck-sweep.ts` 中的常驻探测器经队列仓储创建 findings，
`evidenceRef: rig queue show <source-qitem-id>` 指向底层持久工作行。这满足
了现有人工路由的证据契约，同时不改变目的地解析：一条已被接受（admitted）
的 finding 仍可能无法路由。重复探测会刷新既有 finding；当源头条件消解后，
清扫器会关闭自己的 finding。

## 3. hot-potato 关闭契约（队列关闭在哪里强制执行）

`hot-potato-enforcer.ts` 是承重 API 契约的纯校验器。已在 HEAD 重新确认
（`hot-potato-enforcer.ts:10–24`）：

`state=done` 要求 `closure_reason ∈ {handed_off_to, blocked_on, denied,
canceled, no-follow-on, escalation}`。其中
`handed_off_to | blocked_on | escalation` 三种原因还额外要求
`closure_target`：

- `handed_off_to`——工作由另一个席位继续（`closure_target` = 新归属者）。
- `blocked_on`——工作被搁置，等待另一条 qitem（`closure_target` = 阻塞它
  的 `qitem_id`）。
- `denied`——接收方拒绝了工作（`closure_target` = 原因文本）。
- `canceled`——发送方或接收方撤回（`closure_target` = 备注）。
- `no-follow-on`——终态完成，无需其他动作。
- `escalation`——上报到更高层级（`closure_target` = 上报目标）。

`closure_required_at` 的 Tier→SLA 映射也在 `hot-potato-enforcer.ts` 中。
该校验器由 `QueueRepository.update()`（以及 `updateWithinTransaction()`）
调用，因此关闭在守护进程事务边界处强制执行——工作流运行时只是在关闭之上
做*投影*，并不为它把关（见 `workflow-runtime.md`）。

## 3b. 跨主机队列路由（v0.4.6——OPR.0.4.6.MH3）

队列的两个协作 WRITE 动词——**只有 create + handoff（含完成）**——是主机
感知的：写请求体可以携带带外的 `hostId` 信封（BR-1——会话字符串在任何地方
都保持 `member@rig`；三段式 `agent@rig@host` 形态只是 CLI 输入糖，绝不会
离开 CLI 边界）。该机制**把已发布的 mission-control 先转发后剥离 WRITE
模板一般化**（`routes/mission-control.ts` § remote action）：一个共享的
路由层助手（`forwardQueueWrite`，`routes/queue.ts`）在守护进程侧解析主机
注册表（bearer 永远不会到达调用方），拒绝 ssh 声明的主机
（`unsupported-transport`——daemon→daemon 路径仅支持 http，因为正是这条
路径触发远程 nudge），剥离 `hostId`，并在一个具名的写入类截止时间
（`QUEUE_FORWARD_TIMEOUT_MS`）内经 `remoteJsonRequest` 转发**整个**请求体。
来源端的响应原样返回；传输失败映射为结构化的按主机命名的分类法
（`remote_queue_write_failed`：unknown-host / unsupported-transport /
unreachable / auth-failed / remote-error）。跨主机路径上绝不写本地行。

**模型：记录归来源端所有（origin-owns-the-record）、至少一次 + 幂等、
消息传递式关闭（绝不用 2PC）。**

- **记录归来源端所有（origin-owns-the-record）**。qitem 存放在目标主机的
  DB 中；那一行就是记录本体。目标守护进程**自己的** `maybeNudge` 在
  **它的**本地 tmux 上触发（转发的请求体带 `nudge` 旗标）——发送方守护
  进程绝不跨主机边界伸手。
- **幂等性（arch Q-a）**。转发方守护进程在第一次转发前就**铸造（MINT）**
  `qitemId`，因此每次重试都携带同一个 id；去重依托现有的
  `qitem_id TEXT PRIMARY KEY`。PK 冲突时，若身份字段匹配，来源端返回已存
  行（幂等吸收）；若不匹配，返回结构化的 `qitem_id_reuse` 错误
  （`QueueRepository.create()` catch 路径 + `isQitemPrimaryKeyConflict`）。
- **跨主机交接编排（arch Q-c）**。本地的原子 close+create 无法横跨两个
  DB，因此由路由层编排（`crossHostHandoff`，`routes/queue.ts`）执行：先在
  目标主机上创建后继者（经那个唯一的转发助手），再在本地关闭来源
  （`QueueRepository.closeCrossHostHandoffSource`）——绝不反过来。两步之间
  崩溃会留下一个活着的重复项，幂等重驱会将其收敛；反过来则会留下一个已
  关闭的来源指向一个不存在的后继者（掉落的土豆——唯一被禁止的结果）。
  后继 id 是**推导**（DERIVED）出来的，不是铸造的：
  `deriveCrossHostSuccessorId(source, destination, host)` →
  `qitem-xh-<sha256[:16]>`——纯无状态函数，因此重驱会在守护进程重启后
  重新推导出同一个 id，并在目标 PK 上吸收。*（具名残留：at-least-once/
  无 2PC 栅栏所固有的——重驱若指定**不同**的目的地，会推导出不同的 id，
  无法吸收更早的后继者——该孤儿经 chain + provenance 标签保持可见；来源
  关闭的冲突检查会暴露这一分歧。）*
- **跨越边界的关闭**。来源端以 `closure_reason=handed_off_to` 与
  `closure_target=member@rig@<host>` 关闭——三段式形态**在那里**合法，
  因为 `closure_target` 是**不透明**（OPAQUE）的审计/展示元数据，只做
  存在性检查、绝不为路由而解析（arch R1；任何把它当会话字符串解析的 PR
  都是违反规格）。这一豁免恰好只覆盖 `queue_items` 的 `closure_target`
  列以及它在 `queue_transitions` 上的逐字镜像——别无其他。特别地，流转
  日志的自由文本 `transition_note` 也是持久载体：铸造的跨主机关闭备注只写
  两段式 `toSession`（rev1-r2 B1）。`handed_off_to` 与所有其他会话字符串
  载体都保持两段式。重驱语义：已终态 + `closure_target` **匹配** = 吸收；
  **不匹配** = 结构化的 `cross_host_close_conflict`（409）。后继者携带
  `chain_of_record = [...source.chain, source.qitemId]`——A 侧 id 在 B 上
  是不透明的谱系标识符（arch R2b；不会在 B 的 DB 中解引用）——外加
  provenance 标签 `cross-host` 与 `from-host:<self-declared name>`
  （如实尽力而为，不是经过认证的身份）。
- **边界纪律**。claim / update / inbox 按原则保持本地（跨主机交接之后，
  后继者住在它的 worker 所在之处）；对已转发条目的发送侧操作列为具名
  后续。本地（无 host）路径与 MH-3 之前的行为逐字节相同；hot-potato 校验
  契约（§3）跨越边界亦无削弱。

## 4. 协作事件

> 漂移修正 D8 / OPEN-4（原文照录，slice-00）：`architecture.md` §3 L394
> 说 “Existing 32 PL-004 events untouched”，L410 又说 “Existing 20
> PL-004 events are unchanged”——这两处正文论断彼此矛盾，且早于 0.3.x。
> **两个数字都不要沿用**。现行 `RigEvent` 联合
> （`packages/daemon/src/domain/types.ts:94`）共有 **73 个联合成员**
> （slice-00 §1.8，已在 HEAD 重新确认：
> `grep -cE '^\s*\| \{ type: ' = 73`）。若不引入 slice 对全部 73 个成员
> 逐一分类，仅凭静态检查无法对账出精确的仅 PL-004 与仅 PL-005 子划分；
> slice-00 OPEN-4 已标注此点，照录在案，不作抹平。

这些服务发射的协作事件（已在 HEAD 于 `domain/types.ts` 重新确认）：
`stream.emitted`（StreamStore.emit，`types.ts:155`）；`queue.created` /
`queue.handed_off` / `queue.claimed` / `queue.unclaimed` /
`qitem.fallback_routed` / `qitem.closure_overdue`（QueueRepository）；
`inbox.absorbed`（`types.ts:162`）/ `inbox.denied`（InboxHandler）。
`architecture.md` §8 L987–990 把它们列为 “9 coordination events”；更宽的
`stream|queue|inbox|qitem` 事件族在 HEAD 的计数是 10（`stream` 1 +
`queue` 5 + `inbox` 2 + `qitem` 2）——以重新推导的族计数口径陈述，而不是
作为存有争议的 PL-004 子计数（OPEN-4）。

两个 SSE 呈现面流式传输协作事件：`/api/stream/watch`（别名
`/api/stream/sse`，`routes/stream.ts:117–118`）用于新的流条目；
`/api/queue/watch` 用于队列/收件箱事件。事件日志依旧只追加、由 SQLite
支撑。`rig stream watch` 是 `/api/stream/sse` 的薄封装、单连接消费者；
它不新增守护进程路由，也没有重连策略。

## 5. 路由呈现面

- `/api/stream`（`server.ts:489`）——`POST /emit`（`routes/stream.ts:24`）、
  `GET /list`（`:56`，含 `sourceSession`、`hintDestination`、`hintTag`、
  `since` 与 `until` 过滤器）、`GET /watch` + `/sse` SSE（`:117`）、
  `GET /:streamItemId`（`:121`）、`POST /:streamItemId/archive`（`:130`）。
- `/api/queue`（`server.ts:490`）——`POST /create`（`routes/queue.ts:99`）、
  `POST /:qitemId/claim`（`:144`）、`POST /:qitemId/unclaim`（`:157`）、
  `POST /:qitemId/update`（`:170`），以及 handoff/list/watch 呈现面。

## 另见

- `daemon-core.md`——守护进程接线、40 个迁移的集合、路由呈现面。
- `workflow-runtime.md`——在关闭之上做投影的 PL-004 Phase D 运行时。
- `mission-control.md`——架在 `queue_items` 之上的 PL-005 队列可观测性。
- Source roots: `packages/daemon/src/domain/{stream-store,queue-repository,
  queue-transition-log,hot-potato-enforcer,inbox-handler,outbox-handler}.ts`,
  `packages/daemon/src/routes/{stream,queue}.ts`.
