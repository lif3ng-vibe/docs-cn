---
kind: as-built
title: UI 外壳、路由与抽屉系统
status: active
topics: [observability]
domains: [engineering-advisor, product-advisor]
applies-when: |
  需要了解 UI 外壳（AppShell 轨栏 / Explorer / 中央工作区 / 抽屉 /
  预览栈）是如何组装的、已发布 UI 实际挂载的路由树，或共享详情
  抽屉与事件消费的工作方式。
siblings: [topology.md, project-and-for-you.md, library-specs-and-design-system.md]
prerequisite-reads: [../README.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


`@openrig/ui` 软件包是外壳优先、路由优先、基元驱动的操作员呈现面。
品牌/视觉规则位于 `docs/DESIGN.md`（由
`library-specs-and-design-system.md` 给出指引）；本模块说明外壳如何
组装，以及它挂载哪些路由。

> 已对照 HEAD `7eaf524c` 处的源码核实；软件包版本 **0.3.1**
> （slice-00 §1.1）。UI 足迹为 **235** 个源文件（`packages/ui/src`，
> `.ts`+`.tsx`，非测试文件；slice-00 §1.6 / D6）。

## 1. 软件包形态

UI 软件包：`packages/ui`。主要实现区域：

- `src/routes.tsx` —— TanStack Router 路由树。
- `src/components/AppShell.tsx` —— 全局外壳：轨栏、Explorer、抽屉、
  预览栈。
- `src/components/ui/` —— 可复用的 vellum 与基础 UI 基元。
- `src/components/graphics/RuntimeMark.tsx` —— 运行时/工具/角色
  （actor）标记。
- `src/components/topology/` —— 图/表/终端三类 topology 呈现面。
- `src/components/project/`、`for-you/`、`dashboard/`、`feed/` ——
  可观测性呈现面。
- `src/components/specs/` —— Library/技能/插件呈现面。
- `src/components/{preview,markdown,drawer-viewers}/` —— 各查看器。
- `src/hooks/`、`src/lib/` —— 路由数据 hook、分类器、格式化器、
  布局/品牌辅助。

## 2. 外壳模型

`AppShell` 包裹每一条路由。`AppShell.tsx` 铺设 48px 图标轨栏 +
感知路由的 Explorer 侧栏 + 中央工作区 + 共享右侧抽屉 + 预览栈 +
topology 覆盖层 provider，以及共享的抽屉选中（drawer-selection）/
发现放置（discovery-placement）上下文。

轨栏目标（`AppShell.tsx` 的 `RAIL_ICONS`，已在 HEAD 再次确认）恰好
是六个目标图标，外加 Advisor/Operator 入口：

- Dashboard `/`（`rail-dashboard`）
- Topology `/topology`（`rail-topology`）
- For You `/for-you`（`rail-for-you`）
- Project `/project`（`rail-project`）
- Library `/specs`（`rail-specs`）
- Settings `/settings`（`rail-settings`）

Explorer 是情境化的：它的树随当前目标变化，而非充当通用的文件
浏览器。

## 3. 路由模型

> 漂移修正 D16——`ui.md` 的 “Route Model”（L52–73 清单）与
> `architecture.md` §2 “UI architecture” 早于 0.3.x。下表是从 HEAD 处
> `packages/ui/src/routes.tsx`（共 542 行）**重新推导**的。路由树在
> `routes.tsx:480`（`rootRoute.addChildren([...])`）组装。
>
> 对 D16 预期本身的更正（已在 HEAD 源码级核实）：普查预期
> `/mission-control`、`/progress`、`/markdown` 是全新（net-new）的
> *真实*路由。而在 HEAD，`/mission-control` 与 `/progress` 是**重定向
> 存根**，不是目标路由，且**不存在 `/markdown` 路由**。确有一条
> 真实的 `/files` 路由（markdown 由 file/drawer 呈现面内部的
> `MarkdownViewer` 组件渲染，而非经由 `/markdown` 路由）。本路由表
> 按源码的实际说法报告，而非普查所预测。

### 主要目标路由

| 路径 | 组件 | 备注 |
|---|---|---|
| `/` | Dashboard（`indexRoute` `routes.tsx:88`） | 轨栏目标 |
| `/topology` | 宿主 topology（`:98`） | + rig/工作舱/席位 scope（见 `topology.md`） |
| `/topology/rig/$rigId` | rig scope（`:104`） | |
| `/topology/pod/$rigId/$podName` | 工作舱 scope（`:110`） | |
| `/topology/seat/$rigId/$logicalId` | 席位 scope（`:116`） | 实时节点详情 |
| `/for-you` | 注意力信息流（`:122`） | 轨栏目标 |
| `/project` | 工作区 project scope（`:128`） | 轨栏目标 |
| `/project/mission/$missionId` | 任务 scope（`:134`） | |
| `/project/slice/$sliceId` | 切片 scope（`:140`） | |
| `/specs` | Library（`:146`） | 轨栏目标 |
| `/specs/applications` | applications 区（`:152`） | |
| `/specs/skills` | 技能索引（`:160`） | |
| `/specs/skills/$skillToken` | 技能查看器（`:166`） | 默认为 `skill.md` |
| `/specs/skills/$skillToken/file/$fileToken` | 技能文件查看器（`:175`） | |
| `/specs/plugins` | 插件索引（`:186`） | 0.3.1（见 `library-specs…`） |
| `/plugins/$pluginId` | 插件详情（`:201`） | 0.3.1 |
| `/specs/$specKind/$specName` | 通用 spec → 库重定向（`:213`） | |
| `/files` | Files 工作区（`:192`） | 相对 ui.md/D16 为全新 |
| `/settings` | 设置中心（`:222`） | 轨栏目标 |
| `/settings/policies` | Policies（`:232`） | slice 27 的 Claude 压缩表单 |
| `/settings/log` | Log（`:237`） | slice 26 的 4 项设置探索器 |
| `/settings/status` | Status（`:242`） | |
| `/search` | 审计/历史视图（`:248`） | |

### 实验路由（设计实验）

`/lab/project-graphics-preview`（`:254`）、`/lab/card-previews`
（`:262`）、`/lab/vellum-lab`（`:272`）、
`/lab/vellum-bg/{a-large,b-small,c-allover}`（`:283`–`:293`）。
vellum-lab + vellum-bg 路由是 0.3.1 vellum 品牌系统的实验呈现面
（slice-00 0.3.0-GT 接缝 b：vellum 品牌识别在 0.3.1 成熟；
`dashboard/vellum/*` 系统属 0.3.1）。

### 遗留/兼容路由

`/rigs/$rigId`（`:318`）、`/rigs/$rigId/nodes/$logicalId`（`:324`）、
`/import`（`:333`）、`/packages`、`/packages/install`、
`/packages/$packageId`（`:339`–`:351`）、`/bootstrap`（`:357`）、
`/agents/validate`（`:363`）、`/specs/rig` + `/specs/agent` 评审
（`:372`/`:378`）、`/specs/library/$entryId`（`:384`）、
`/discovery` + `/discovery/inventory`（`:395`/`:410`）、
`/bundles/inspect` + `/bundles/install`（`:416`/`:422`）。

### 重定向存根（已删除的路由）

`routes.tsx:432`–`:474` 为已移除的路由挂载 `<Navigate>` 重定向——
它们不是目标页面：`/context` → `/topology`；`/mission-control` →
`/for-you`（SC-18：`/mission-control` 已删除，由 For-You 取代）；
`/slices` + `/slices/$name` → `/project`；`/progress` → `/project`；
`/steering` → `/project`。Mission Control *系统*仍存在于
daemon/PL-005 层（`../architecture/mission-control.md`）；被退役的
只是旧的 UI *路由*，让位于 For-You。

## 4. 抽屉与查看器系统

`SharedDetailDrawer` 是共享的临时详情呈现面，服务于队列条目查看器、
文件查看器、subspec 预览及其他详情选中项。抽屉触发器携带根路径/
路径来源（provenance），使查看器拉取/渲染到正确的内容；抽屉支持
点击外部关闭。图片证明查看由 `ProofImageViewer` 承担，采用黑玻璃
样式并遵循外壳布局。技能详情走 Library Explorer 导航 + 位于中央
工作区的 `FileViewer`（`components/drawer-viewers/FileViewer.tsx`），
而非嵌套的三栏浏览器。

## 5. 事件与活动消费

UI 的事件消费经共享事件 hook 集中管理，使应用在相关呈现面之间避免
重复的 SSE 连接。当前消费者：For You 信息流水合、topology 活动环
（activity ring）+ HotPotato 移动、活动信息流/系统呈现面，以及 rig
事件呈现面。脉冲/数据包动画遵循“减少动态”偏好。
（守护进程 SSE 呈现面：`/api/events`、`/api/stream/watch`、
`/api/queue/watch`——`architecture-rules-and-event-system.md` §2.4。）

## 参见

- `topology.md` —— 图/表/终端 topology 呈现面。
- `project-and-for-you.md` —— Project 可观测性 + For-You 信息流。
- `library-specs-and-design-system.md` —— Library/specs + DESIGN.md
  指引。
- 源码根：`packages/ui/src/routes.tsx`、
  `packages/ui/src/components/AppShell.tsx`。