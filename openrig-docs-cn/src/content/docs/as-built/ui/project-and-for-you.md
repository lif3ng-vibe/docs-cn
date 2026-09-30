---
kind: as-built
title: UI Project 可观测性、For You、Dashboard
status: active
topics: [observability, coordination]
domains: [engineering-advisor, product-advisor, operating-advisor]
applies-when: |
  需要了解面向操作员的目标呈现面是如何构建的——For You 注意力
  信息流（5 卡分类器 + 动词操作）、Project 的工作区/任务（mission）/
  切片 scope 页面（分页签汇总），以及建于 vellum 品牌系统之上的
  Dashboard 落地呈现面。作者模式模块——ui.md 中关于这些呈现面的
  叙述早于 0.3.x；每条论断均溯源至 HEAD 的 file:line。
siblings: [shell-and-routing.md, ../architecture/mission-control.md]
prerequisite-reads: [../README.md, shell-and-routing.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-07-06
---


三个面向操作员的目标呈现面：**For You**（`/for-you`，注意力信息流）、
**Project**（`/project*`，工作区/任务/切片 scope 页面）与
**Dashboard**（`/`，建于 vellum 品牌系统之上的落地呈现面）。它们都
读取守护进程的实时状态；除逐事件的软关闭（soft-dismiss）之外，
均不添加任何 UI 本地持久化。

> **作者补写比重高的模块。** `ui.md` 的 Project Observability / For You /
> Graphics-Layer 章节内容单薄，且早于 0.3.1 的 dashboard/vellum 品牌
> 更新。每条承重论断都附有 `> Source: <file:line> @HEAD`；含糊之处
> 一律声明为 OPEN 事项，绝不粉饰。路径相对于 `packages/ui/src/`，
> 除非以 `docs/` 开头。
>
> 已在 HEAD `7eaf524c` 处核实（`git describe` → `v0.3.1-6-g7eaf524c`）。
> 软件包版本 **0.3.1**；HEAD 携带 6 个尚未发布的 release-0.3.2 提交；
> 尚无 `v0.3.2` 标签（daemon-core.md；slice-00 §1.1）。

## 0. 发布归属（取证接缝——请先阅读）

已在 HEAD 处通过 `git cat-file -e <tag>:<path>` 再次核实：

| 层 | 发布 | HEAD 处的取证证据 |
|---|---|---|
| Project 可观测性基座（For-You 信息流、feed-classifier、project scope 页面、Mission Control 的 7 动词词表） | **0.3.0** | `v0.3.0:components/for-you/Feed.tsx`、`v0.3.0:lib/feed-classifier.ts`、`v0.3.0:components/project/ScopePages.tsx`、`v0.3.0:components/mission-control/components/VerbActions.tsx` 均可在 `v0.3.0` 处解析（slice-00 0.3.0-GT §1.5/§1.6/§1.7） |
| Dashboard/For-You 现今渲染其上的 Vellum **品牌识别系统**（`dashboard/vellum/*`：CornerBracket、VellumDestinationCard、marks（标记）、graphics（图形）、单一事实来源 barrel） | **0.3.1，而非 0.3.0** | `git cat-file -e v0.3.0:components/dashboard/vellum/index.ts` → **缺失**（"exists on disk, but not in 'v0.3.0'"）；`v0.3.1:` → 存在（slice-00 0.3.0-GT 接缝 (b)；§2 第 1/2 行） |

> Source: 在 HEAD `7eaf524c` 处重跑——
> `git cat-file -e v0.3.0:packages/ui/src/components/dashboard/vellum/index.ts`
> 失败；`v0.3.0:.../for-you/Feed.tsx`、`.../lib/feed-classifier.ts`、
> `.../project/ScopePages.tsx`、`.../mission-control/components/VerbActions.tsx`
> 均可在 `v0.3.0` 处解析。Vellum 表面*基元*（`components/ui/vellum-*.tsx`）
> 随 0.3.0 发布；`dashboard/vellum/` 之下完整的 vellum *品牌系统*则属
> 0.3.1——slice-00 0.3.0-GT 接缝 (b) 正是这道精确分界。**切勿把
> vellum 品牌系统回溯归因于 0.3.0。**

## 1. 路由实况（已按 `routes.tsx`@HEAD 源码核实——具有约束力）

在叙述任何呈现面之前，每条路由都已在 `packages/ui/src/routes.tsx`@HEAD
（共 542 行）处核实。Phase-8.1 普查的“缺失路由”预期出自 grep 推导，
部分有误；本表依据 `routes.tsx` 的实况撰写，而非该普查：

| 路径 | HEAD 处实况 | 组件 | 出处 |
|---|---|---|---|
| `/for-you` | **真实的目标路由** | `Feed` | `routes.tsx:122-126` |
| `/project` | **真实的目标路由** | `WorkspaceScopePage` | `routes.tsx:128-132` |
| `/project/mission/$missionId` | **真实的目标路由** | `MissionScopePage` | `routes.tsx:134-138` |
| `/project/slice/$sliceId` | **真实的目标路由** | `SliceScopePage` | `routes.tsx:140-144` |
| `/`（索引） | **真实的目标路由** | `Dashboard` | `routes.tsx:88-92` |
| `/mission-control` | **已删除的 `<Navigate to="/for-you">` 重定向存根** | `() => <Navigate to="/for-you">` | `routes.tsx:440-444` |
| `/progress` | **`<Navigate to="/project">` 重定向存根**（并入 Project 页签） | `() => <Navigate to="/project">` | `routes.tsx:463-467` |
| `/slices` | **已删除的 `<Navigate to="/project">` 重定向存根** | `() => <Navigate to="/project">` | `routes.tsx:447-451` |
| `/slices/$name` | **`<Navigate to="/project/slice/$sliceId">` 重定向存根** | `useParams` → `<Navigate>` | `routes.tsx:453-460` |
| `/steering` | **`<Navigate to="/project">` 重定向存根** | `() => <Navigate to="/project">` | `routes.tsx:470-474` |
| `/markdown` | **并非路由**——`MarkdownViewer` 是在 `MissionScopePage` 内部使用的组件 | （无路由） | grep `routes.tsx`@HEAD：零个 `path: "/markdown"` |

> Source: `routes.tsx:88-92`、`:122-144`、`:440-474` @HEAD；组件导入见
> `routes.tsx:40-41`（`Dashboard`、`Feed`）、`:60-63`（来自
> `components/project/ScopePages.js` 的
> `WorkspaceScopePage`/`MissionScopePage`/`SliceScopePage`）@HEAD。

> **路由实况契约（slice-08 §10.7）**：**Mission Control *系统***位于
> daemon/PL-005（见 `../architecture/mission-control.md`）——
> `/mission-control` **不是 UI 目标**；它是一个已删除的重定向存根
> （SC-18）。7 动词*操作词表*经由内嵌于 For-You 卡片中的 `VerbActions`
> 在本模块露出，但该系统本身并非本模块的主题。`/progress`、`/slices`、
> `/steering` 全部并入 `/project` 页签——它们是重定向存根，而非需要
> 叙述的呈现面。

## 2. For You——注意力信息流（`/for-you` → `Feed`）

`Feed` 是操作员的注意力呈现面：铺在实时活动信息流之上的一条按时间
排序、按订阅过滤、可软关闭的卡片流。页头显示 `Attention` / `For You`；
最大宽度 720px。

> Source: `components/for-you/Feed.tsx:364-369`（`data-testid="for-you-feed"`、
> max-w-720 + `For You` 页头），feed 中心化设计注记 `:3-12`
> （首要 UX = 信息流本身；订阅不占主导——承重 SC-16）@HEAD。

### 2.1 5 卡分类器（0.3.0 主干）

`classifyFeed(events)` 把每个 `ActivityEvent` 一一映射到五个
`FeedCardKind` 取值之一——`action-required`、`approval`、`shipped`、
`progress`、`observation`——随后按 `receivedAt` 降序排序。**没有任何
内容被静默丢弃**：任何未匹配的事件类型都会兜底落入 `observation`。
队列可见性事件再由 `queueKind(type, state)` 细分（例如 `*.closed` →
shipped；`human-gate` / `pending-approval` → action-required；
`closeout-pending-ratify` → approval）；目的地为人类席位时强制归为
`action-required`。

> Source: `lib/feed-classifier.ts:9-14`（`FeedCardKind` 联合类型），
> `classifyEvent` `:145-218`（默认落入 observation 的兜底 L216-217），
> `queueKind` `:93-110`，`classifyFeed` `:220-223`（按 receivedAt 降序
> 排序），`isHumanSeat` `:141-144` @HEAD。

信息流管线（`Feed.tsx`）：`classifyFeed` → 截断至 `HISTORY_LIMIT = 50`
→ 从实时队列条目映射 + 操作审计中水合（hydrate）每张卡片的类别
（`hydratedCardKind`：action/approval 卡上已有记录结果 → `approval`；
`done|closed|completed` 状态的 qitem → `shipped`）→ **订阅过滤**
（对照 5 个 `feed.subscriptions.*` 配置键执行 `isCardKindSubscribed`；
`action-required` 始终可见，`observation` 仅在审计订阅开启时可见）
→ 临时的 **lens-chip 过滤**（All / Action req / Approvals / Shipped /
Progress / Audit；不持久化）→ 按事件序号（event-seq）的软关闭过滤。

> Source: `components/for-you/Feed.tsx:63`（`HISTORY_LIMIT = 50`），
> `:238`（`classifyFeed(events).slice(0, HISTORY_LIMIT)`），
> `hydratedCardKind` `:156-180`，订阅 + lens + dismiss 管线
> `:269-285`（订阅最先 L280-282；lens L283；dismiss L284），
> `LENS_CHIPS` `:54-61` @HEAD；
> 订阅强制/默认规则 `Feed.tsx:3-12`（action_required 强制开启 L9；
> observation 由 audit_log 门控 L10）@HEAD。

### 2.2 队列条目水合 + 证明预览

对携带 `qitemId` 载荷的卡片，`useQueueItemMap` 会水合完整的队列条目
主体；对 `shipped` 卡片，`sliceForCard` 按标签/文本匹配切片，
`proofPreviewForSlice` 拉取首个带截图的证明包（proof packet），使卡片
内联渲染 `ProofThumbnailGrid` → `ProofImageViewer`。这正是 slice-00
§1.5 的“队列卡片水合 qitem 主体 + 证明预览”基座，现已实时接通。

> Source: `components/for-you/Feed.tsx:263`（`useQueueItemMap`），
> `sliceForCard` `:182-201`，`proofPreviewForSlice` `:203-213`，
> 逐卡片证明接线 `:421-427`；`FeedCard.tsx` 证明块 `:453-471`
> （`ProofPacketHeader`+`ProofThumbnailGrid`）、`ProofImageViewer`
> `:521` @HEAD。

### 2.3 action/approval 卡上的动词操作（7 动词系统；OPEN-3）

可操作的卡片（`action-required` 或 `approval`、尚无记录结果、非终态
qitem）内嵌 `VerbActions`。**规范的 Mission Control 操作词表就是这套
7 动词系统**——`MISSION_CONTROL_VERBS = [approve, deny, route,
annotate, hold, drop, handoff]`——定义于 Mission Control 系统层面
（slice-00 0.3.0-GT §1.6/接缝 (c)：该词表*起源于 0.3.0 源码*）。

> Source: `components/mission-control/hooks/useMissionControlAction.ts:5-15`
> （`MISSION_CONTROL_VERBS` 7 元素常量 `:5-13` + `MissionControlVerb`
> 类型 `:15`）、`components/mission-control/components/VerbActions.tsx:82`
> （经 `enabledVerbs = [...MISSION_CONTROL_VERBS]` 默认启用全部 7 个）、
> 各动词的输入需求 `:97-99`（route/handoff→destination L97；
> annotate→annotation L98；hold/drop→reason L99）@HEAD；slice-00
> 0.3.0-GT §1.6 + 接缝 (c)。

> **OPEN-3 已解决**（v0.4.4 living-notes 修正案，创始人裁定 N-1，
> 2026-07-05）。For-You 可操作卡片的呈现面就是**裸的一次点按
> APPROVE + CHAT——别无其他**。`FeedCard` 传入
> `enabledVerbs={["approve"]}` + `oneClickVerbs={["approve"]}` +
> v0.4.4 的 `bare` prop（仅影响 JSX：跳过“Choose response”页头修饰；
> mutation/回执/错误路径逐字节一致——由一个原始 body 测试钉死），
> 旁边是一个打开**共享 `ProgressiveTerminal`** 的 CHAT 按钮，以
> `buildChatPreamble` 预置内容（是终端，绝非聊天面板——BR-12）。
> deny/route 已从该呈现面退役（包括 action-required lens 的空状态
> 文案：“one-tap approve and chat with the owning agent”）；卡片级
> kind 标签是状态标签 “Action required”，绝非指令性修饰。上述
> 7 动词词表仍是 MISSION-CONTROL 系统级词表；For-You 只提供两动作
> 子集。
>
> Source @`bb5ad219`：`FeedCard.tsx:547-593`（裸 `VerbActions`
> `enabledVerbs=["approve"]` `:561-566` + chat 按钮 + 内联
> `ProgressiveTerminal`）、`:87-94`（`resolveCardTerminalSession`——
> 人类操作卡片与发送方聊天）、`Feed.tsx:76-82`
> （`EMPTY_COPY["action-required"]`）、`VerbActions.tsx`（`bare` prop）、
> `review/chat.ts:21`（`buildChatPreamble`）；测试
> `test/foryou-bare-approve-chat.test.tsx`（逐字节一致的 mutation +
> chatBtns:1/denyRoute:0 + 退役文案源码扫描）。

mutation 成功时，`VerbActions` 会触发 `onOptimisticOutcome`；`Feed`
维护一张以 `qitemId` 为键的乐观结果（optimistic-outcome）映射，使
`ActionOutcomePanel` 的回执即时渲染，无须等待审计日志重取（审计重取
最终也会呈现同一形态）。没有记录结果的终态 qitem 会从其关闭原因
推导出一份兜底回执。

> Source: `components/for-you/Feed.tsx:224-236`（乐观结果映射 +
> `setOptimisticOutcome`）、`:426-428`（乐观优先、审计兜底：
> `optimisticOutcomes.get ?? actionOutcomes.get ?? null`）；
> `FeedCard.tsx:473-500`（`isActionableCard` 门控 L473 +
> `VerbActions` 接线 L489-499）、`isActionableCard` `:166-175`、
> `fallbackOutcomeFromQueueItem` `:177-198`、`ActionOutcomePanel`
> `:271-310`；`VerbActions.tsx:138-145`（在 mutation 的 `onSuccess`
> 上触发 `onOptimisticOutcome`）@HEAD。

### 2.4 卡片表面——与 vellum 一致（0.3.1 品牌层）

`FeedCard` 渲染在 **0.3.1 vellum 品牌系统**之上：一个
`bg-stone-100/45 backdrop-blur` 表面，带三段式环境盒阴影（无边框）、
四个穿过 vellum 划定边界的 `CornerBracket` 标记、等宽大写的 kind
标签 + 彩色圆点，以及运行时图形标记（会话用 `ActorMark`）——这正
是 slice-00 §1.7 的“图形标记跨抽屉/证明行/队列引用/故事行共享”基座，
如今以成熟的 vellum 语汇表达。卡片支持键盘关闭（Backspace/Delete）
与滑动手势关闭，并配有 `UndoToast`。

> Source: `components/for-you/FeedCard.tsx:72-73`（`CARD_SURFACE_CLASS`）、
> `:74-80`（`CARD_SHADOW_STYLE` 三段式盒阴影）、角括号标记
> `:401-404`（4 个 `<CornerBracket position=…>`）、`KIND_DOT`
> `:33-39`、kind 标签 span `:410-414`、`ActorMark` 导入 `:25` +
> 用法 `:229`；`CornerBracket` 来自 0.3.1 品牌 barrel
> `dashboard/vellum/index.ts:17`；slice-00 0.3.0-GT 接缝 (b) + §1.7
> @HEAD。

### 2.5 叙事预览带

在旧式卡片列表之上，`Feed` 渲染一条由 `buildStorytellingFeedItems`
从发现的任务构建的 `StorytellingFeed` 预览（`useMissionDiscovery` →
`ProgressCard`，取前 2 个）+ 切片（`useSlices` → shipped/done 用
`ShippedCard`，其余用 `IncidentCard`，上限 3 个）。任务行携带守护
进程派生的 `status`，使“Getting Started”式的“完成即隐藏”能持久过滤
（`status === "complete"`）；先乐观地在本地隐藏，再尽力发起
`POST /api/missions/:id/complete` 审计写入——网络错误会被吞掉，
从而部分隔离（air-gapped）的守护进程不会阻塞隐藏动作。

> Source: `components/for-you/Feed.tsx:319-343`（任务/切片适配器：
> `useMissionDiscovery` L319、`missionsWithStatus` L329-335、
> `buildStorytellingFeedItems` L336-343；适配器注释 L305-318）、
> `handleMarkMissionComplete` `:351-361`（尽力式 `void fetch` L354、
> 吞错 L357）、预览渲染 `:399-409`；
> `components/feed/cards/storytelling-cards.tsx:36`（`CardKind`）、
> `ShippedCard` `:184`、`IncidentCard` `:235`、`ProgressCard`
> `:289` @HEAD。

## 3. Project——工作区/任务/切片 scope 页面（0.3.0 主干）

`/project*` 挂载三个 scope 页面，全部构建于共享的 `ScopeShell` +
分页签汇总（tabbed-rollup）模式之上（slice-00 §1.5 的 Project 可观测
性基座）。`SHARED_TABS` 集合——`overview / story / progress /
artifacts / tests / queue / topology`——驱动 `WorkspaceScopePage` 与
`MissionScopePage`；`SLICE_TABS` 为 `SliceScopePage` 把 `story` 调到
首位，但其 `useState` 默认值仍是 `overview`（README + 就绪度优先，
而非指标网格）。

> Source: `components/project/ScopePages.tsx:75-76`（`SharedTab` /
> `SliceTab` 类型）、`SHARED_TABS` `:78-86`、`SLICE_TABS` `:88-96`、
> `ScopeShell` `:137-166`、`TabNav` `:98-135` @HEAD。

### 3.1 WorkspaceScopePage (`/project`)

读取实时工作区名称（`useWorkspaceName`）；未设置时呈现诚实的空状态
（`NO WORKSPACE CONNECTED` + 一个打开设置的入口）。`overview` 页签
渲染 `WorkspaceOverviewPanel`：先把切片归组进任务，再由
`partitionProjectMissions` 把它们切分为两栏的**当前工作 / 归档**布局
（slice-00 §1.5 的“当前/归档分组”）。每张任务卡片把自己的切片列为
指向 `/project/slice/$sliceId` 的 `Link`，并附带 `QueueCountIcon` +
`StatusDot`。其余页签即各 scope 汇总（§3.4）。

> Source: `components/project/ScopePages.tsx:676-749`
> （`WorkspaceScopePage`；无工作区空状态守卫 `:682-693`、
> `workspace-scope-no-workspace` `:689`）、`WorkspaceOverviewPanel`
> `:534-674`（任务分桶 `:536-551`、`partitionProjectMissions`
> `:552`、双栏面板 `:631`、Current 区 `:632-651`、Archive 区
> `:652-671`）@HEAD。

### 3.2 MissionScopePage (`/project/mission/$missionId`)

同样使用 `ScopeShell`/`SHARED_TABS`。`overview` 在切片栏之上渲染任务
README（`useScopeMarkdown(missionPath, "README.md")`，经由
`MarkdownViewer`）；`progress` 渲染 `MissionProgressHeatmap` + 任务的
`PROGRESS.md` + 共享的 `ScopeProgressRollup`。`topology` 页签在任务
README 的 frontmatter 声明了一个存在于 `WorkflowSpecCache` 中的
`workflow_spec` 时（守护进程返回 `topology.specGraph`），经由
`TopologyTab` 渲染**投影出的 workflow spec 图**；否则回退到会话名
聚合。

> Source: `components/project/ScopePages.tsx:751-895`
> （`MissionScopePage`；`useMission` `:759`、`missionPath`
> `:760-761`、README/PROGRESS markdown `:762-763`、overview 的
> README 区 `:775`、进度热力图 `:832`、`mission-progress-readme`
> `:838`、spec-graph topology 分支 `:875-891`——`missionTopology`
> `:875`、`specGraph` 检查 `:879`、会话名回退 `:890`）@HEAD。

### 3.3 SliceScopePage (`/project/slice/$sliceId`)

默认页签为 `overview`（`SliceOverviewTab`——README + 当前步骤 +
就绪度）。加载/错误状态皆为诚实的空状态（错误状态会点名
`rig config get workspace.slices_root` 为最可能的配置错误）。
`progress` 并入 `AcceptanceTab`（验收是切片 scope 下规范的进度证明）；
`story` 渲染 `TimelineTab`，把策展的 `timeline.md`
（`useSliceTimelineMarkdown`）置于自动采集的事件流之上；`topology`
渲染该切片的工作流实例感知版 `TopologyTab`；**`review`（v0.4.4）
渲染 Living Notes 的 `SliceReviewTab`**（§3.5）。

> Source: `components/project/ScopePages.tsx:1187-1297`
> （`SliceScopePage`；默认 `overview` `:1192`、timeline md
> `:1204`、加载状态守卫 `:1206`、错误状态守卫 `:1225`
> （slices_root 修复提示 `:1239`）、story=`TimelineTab`
> `:1258-1265`、progress=`AcceptanceTab` `:1269-1273`、topology
> `:1294`）@HEAD。

### 3.4 共享 scope 汇总

`ScopeStoryRollup`、`ScopeProgressRollup`、`ScopeArtifactsRollup`、
`ScopeTestsRollup`、`ScopeQueueRollup`、`ScopeTopologyRollup`（即
overview 之外的各页签）都从同一个
`useProjectScopeRollup(missionId, loadDetails)` hook 读取数据，使工作
区 scope 与任务 scope 在各自的切片集合上共享完全一致的汇总行为——
这就是 slice-00 §1.5 的“工作区/任务汇总”基座。详情拉取由当前页签
门控（`active !== "overview"`），使 overview 路径保持轻量。

> Source: `components/project/ScopePages.tsx:198-217`
> （`useProjectScopeRollup`；`rowsForScope` `:193-196`）、汇总组件
> `:219-532`；门控 `:679`、`:754`（`active !== "overview"`）@HEAD。

### 3.5 评审页签（v0.4.4——Living Notes 呈现面）

切片与任务 scope 页面都挂载一个 `Review` 页签（`SLICE_TABS`/任务
页签，`ScopePages.tsx:99-113`）。切片页签（`review/SliceReviewTab.tsx`）
渲染每个切片唯一可评审的结构——依序排列的分区带 **NEEDS YOU →
AGENTS → INTENT / PLAN / DELIVERED → verify-lineage → SETTLED**——
数据来自 `GET /api/review/slice/:name`（`hooks/useReview.ts`）：

- **DELIVERED** 一栏把每个规划交付物与其策展证明沿栏自上而下配对
  （规划稿在上、交付工件在下），媒体内联于文字高度、点按后逐一
  放大（`?item=` 深链）；`verified` 用平实语言呈现 QA 记录的比对
  结果（✓ QA-verified · ◇ unverified · ✗ missing + QA 备注）——
  可见，但从不阻塞。“See all proof”会钻取到 `proof/`。
- **媒体真的能播放**：视频带原生控件内联渲染（采集核验用
  `?seek`/`?play` 深链）；图片打开自带的 `Lightbox`；证据以及
  “完整 PRD →”入口则在共享的**右缘**抽屉里打开自带的
  `FileViewer`（v0.4.4 修正案在其三个 token 处撤销了 FR-11.1 的
  左翻转）。
- **两把锁**（架构模块 §4）渲染为醒目的印记：plan-lock 在 PLAN 带，
  双印记在 SETTLED 带；未经审计的印记会高调渲染为 UNVERIFIED。
- 评审卡片都走同一份 vellum 配方（`review/vellum.ts`——与背景匹配的
  半透明 + backdrop blur，两种主题均由 token 驱动）；在 `sm` 断点
  以下，DELIVERED 行纵向堆叠（手机优先的单栏扫读）。
- 任务页签（`review/MissionReviewTab.tsx`）以看板为先：折叠契约中的
  阶段格、完成台账、cut-complete，以及读取同一契约的 U5 行展开
  （intent 原样保留 + 有界的逐条已核实摘要；完整配对放在切片页）。
  rig 层俯瞰（`review/RigAgentsPage.tsx`）读取 `GET /api/review/rig`。

后端契约 + 组合方式：见
[`../architecture/living-notes-review.md`](/as-built/architecture/living-notes-review/)。

> Source @`bb5ad219`：`components/review/{SliceReviewTab,MissionReviewTab,
> NeedsYouAccordion,AgentsBandView,VerifyLineageCard,EvidenceOpener,
> RigAgentsPage}.tsx`、`review/vellum.ts`、`hooks/useReview.ts`、
> `SharedDetailDrawer.tsx`（右缘锚点 + 翻转前 z）；测试
> `test/{fileviewer-resolvable-target,drawer-primitives}.test.tsx`。
> 已被否决的三栏对比与独立的条目拼接表文件均已删除（修正原则为
> 删除而非降级；已无任何引用残留）。

## 4. Dashboard——落地呈现面（`/` → `Dashboard`）

`Dashboard` 是叠在 **0.3.1 vellum 品牌系统**之上的薄层组合：它从
`dashboard/vellum/index.js` 导入 `MidLayerContent`、`TopLayerContent`、
`DestinationsLayer`——与 `/lab/vellum-lab` 导入的是同一个 barrel，
因此生产 Dashboard 与设计实验室精确同步（单一事实来源）。真实数据
接线：`useRigSummary` → totalRigs/totalAgents、`usePsEntries` →
activeAgents、`useSpecLibrary` → librarySize、
`window.location.hostname` → 分类眉题（classification eyebrow）。
依据 2026-05-15 的创始人调令，沉重的 `BackLayerContent` /
`BackVellumSheet` 背层已被移除，使 dashboard 坐落于页面级的奶油色
纸纹网格之上；barrel 仍导出这两个组件（供实验室使用）。

> Source: `components/dashboard/Dashboard.tsx:1-52`（vellum-barrel
> 导入 `:12-16`、单一事实来源注记 `:2-5`、真实数据 hook `:29-39`、
> 背层移除注记 `:21-27`、渲染 `:40-50`）；
> `components/dashboard/vellum/index.ts:1-26`（barrel；`BackLayerContent`
> `:5` / `BackVellumSheet` `:6` 仍在导出）；slice-00 0.3.0-GT 接缝 (b)
> + §2 第 1/2 行 @HEAD。

## 5. 横切性质

- **实时守护进程状态；除软关闭外无 UI 本地持久化**——所有呈现面都
  读取守护进程 hook；仅有的 UI 本地状态是逐事件序号的关闭集合 +
  临时的 lens chips + 乐观结果映射（`Feed.tsx:217` lens、`:224`
  optimistic map、`:240-241` dismiss set；`ScopePages.tsx` 的
  `useState` 页签状态 `:677`、`:753`、`:1192`）@HEAD。
- **诚实的空/错误状态**——`WorkspaceScopePage` 无工作区
  （`ScopePages.tsx:682-693`）、`WorkspaceOverviewPanel` 索引不可用
  （`:565-573`，标签 `:568`）、`SliceScopePage` 条目不可用
  （`:1225-1245`，标签 `:1235`）都会露出成因 + 一个修复指引，
  绝非空白屏 @HEAD。
- **0.3.0 的可观测性主干、0.3.1 的 vellum 品牌层**——分类器/动词
  操作/scope 汇总的*逻辑*是 0.3.0 基座（§0）；*视觉表面*（vellum
  卡片、角括号标记、图形标记、dashboard）是 0.3.1 的品牌成熟化。
  分界即 slice-00 0.3.0-GT 接缝 (b)；任何方向都不得混同 @HEAD。

## OPEN 事项（记录在案，不予抹平）

- **OPEN——For-You 动词子集**（slice-00 0.3.0-GT OPEN-3）。For-You
  呈现面实际发布的动词子集到底是什么，取决于一桩尚未裁决的
  velocity slice-01 裁定（CHANGELOG `[0.3.1]` 写“全部 7 个”与源材料
  §6 写“子集”互有出入）。本模块仅描述**系统级的 7 动词词表**，并把
  当前 `enabledVerbs` prop 的字面取值（§2.3）作为源码现状报告，而非
  作为解决结论。For-You 子集的枚举留待待定的 velocity 裁定。
- **OPEN——`/project` 重定向存根的归并**。`/progress`、`/slices`、
  `/steering` 都是 `<Navigate to="/project">` 存根，
  `/slices/$name` 则重定向进 `/project/slice/$sliceId`（§1）。昔日的
  独立呈现面已并入 Project 页签；这些存根是永久性还是过渡性的，是
  源码无法回答的产品决策。
- slice-00 的数字漂移 OPEN（1–5）在此均不适用——本模块不涉及
  migration / route-group / PL-004 事件计数。