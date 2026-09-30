---
kind: as-built
title: UI Library/Specs 呈现面 + 设计系统指引
status: active
topics: [specification-and-bundles, observability]
domains: [engineering-advisor, product-advisor]
applies-when: |
  需要了解 Library（`/specs`）UI 是如何组装的 —— spec/技能/插件呈现面，
  以及为它提供数据的 spec 评审 + spec 库 + 实时身份流 —— 或规范化的
  视觉/设计系统 spec 位于何处。
siblings: [shell-and-routing.md]
prerequisite-reads: [../README.md, shell-and-routing.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


Library 目标页保留 `/specs` 作为路由，并呈现产品标签 “Library”：涵盖
spec、应用、上下文包、智能体 spec、智能体镜像、插件与技能。

> 已对照 HEAD `7eaf524c` 处的源码核实；软件包版本 **0.3.1**
> （slice-00 §1.1）。下列组件/基元（primitive）名称均已对照 HEAD 处的
> `packages/ui/src/components/` 核对——并非直接信任 `ui.md` 或
> `DESIGN.md` 中的清单。

## 1. Library / specs 呈现面

`packages/ui/src/components/specs/` 中的组件（已在 HEAD 再次确认）：

- `SpecsLibraryPage.tsx` —— `/specs` 的 Library 页面（统一列表：
  All / Apps / Rigs / Agents；由服务支撑的条目渲染为 `APP`）。
- `SpecsTable.tsx`、`SpecsTreeView.tsx` —— 列表 + Explorer 树。
- `SkillsIndexPage.tsx`、`SkillDetailPage.tsx` —— 基于文件夹的技能。
  技能树把每个技能当作一个文件夹；点击某个技能会打开详情路由，
  大小写不敏感地默认指向 `skill.md`，并经由共享的 `FileViewer` 在中央
  工作区渲染（页面内没有第二个文件浏览器——文件导航归属于
  Explorer 树）。
- `PluginsIndexPage.tsx`、`PluginDetailPage.tsx`、`AgentPluginsList.tsx` ——
  插件呈现面。

> 漂移注记（slice-00 0.3.0-GT 接缝 a）：插件基元是 **0.3.1** 的新特性
> （经 git 谱系证实；`v0.3.0` 中不存在，`v0.3.1` 中存在）。切勿把
> `/specs/plugins`、`/plugins/$pluginId` 路由或这些插件组件回溯归因于
> 0.3.0。`ui.md`（早于 0.3.x）对插件**全无叙述**——这些呈现面是依据
> 源码 + slice-00 0.3.0-GT 接缝新写的，并非迁移而来。

## 2. Spec 评审 / 库 / 实时身份流

这些由守护进程支撑的流程为 Library UI 提供数据（`architecture.md` §6
的 “Spec review and spec library flow” 与 “Live identity / specs UI flow”，
已在 HEAD 再次确认准确）：

- **原始 YAML 预览**：UI/CLI 把 YAML 发送至 `/api/specs/review/rig` 或
  `/api/specs/review/agent`；`SpecReviewService` 解析/校验并返回结构化的
  评审模型；UI 通过 `RigSpecDisplay` / `AgentSpecDisplay` 渲染它们
  （草稿预览、库评审与实时完整详情复用的正是这组基元）。
- **基于文件系统的库**：`SpecLibraryService` 扫描内置根目录与用户根目录
  （`packages/daemon/specs`、`~/.openrig/specs`、遗留回退
  `~/.rigged/specs`）；每个 YAML 经结构化评审分类；由服务支撑的 rig
  标记为 `hasServices`；`/api/specs/library` 提供 list/get/review/sync。
- **CLI 镜像**：`rig specs ls/show/preview/add/sync`；`rig specs add`
  安装单个 YAML spec 或完整的 spec 目录；`rig up` / `rig bootstrap`
  解析库名时优先于其他来源类型。
- **实时身份**：在 Explorer/图中选中会打开共享的右侧抽屉（运行时优先的
  节点详情：实时身份、对端、有向边、会话记录辅助、紧凑的 spec 摘要）；
  `Open Full Details` 会在中央工作区导航至
  `/rigs/$rigId/nodes/$logicalId`。

## 3. UI 基元清单（已对照源码核对）

> 漂移修正——`ui.md` 的 “Design Primitives”（L75–107）遗漏了
> `ProjectPill`。`docs/DESIGN.md` L195 列出了它；在 HEAD 再次确认它是
> 真实导出（`packages/ui/src/components/project/ProjectMetaPrimitives.tsx:196`
> 处的 `export function ProjectPill`）。下方已核对的清单来自源码，
> 而非两份文档中的任何一份清单。

- **Vellum/基础**（`components/ui/`）：`VellumCard`、`VellumSheet`、
  `RegistrationMarks`、`StatusPip`、`SectionHeader`、`EmptyState`、
  `Button`、`Tabs`、`Table`、各表单控件，以及 `rig-stamp.tsx`
  （`RigStamp`）——在 HEAD 处存在；不在 ui.md 的清单中。
- **图形**（`components/graphics/RuntimeMark.tsx`，导出已再次确认）：
  `RuntimeMark`、`RuntimeBadge`、`ToolMark`、`ToolBadge`、`ActorMark`、
  `OperatorMoodMark`；规范化逻辑位于 `lib/runtime-brand.ts` +
  `lib/tool-brand.ts`。
- **项目元数据**（`components/project/ProjectMetaPrimitives.tsx`，
  导出已再次确认）：`ProjectPill`（`:196`）、`EventBadge`（`:224`）、
  `QueueStateBadge`（`:228`）、`TagPill`（`:274`）、`ActorChip`（`:283`）、
  `DateChip`（`:303`）、`FlowChips`（`:315`）、`ProofThumbnailGrid`
  （`:334`）、`ProofPacketHeader`（`:380`）——另有 `QueueCountIcon` /
  `StatusDot`（存在于源码中，但不在 ui.md/DESIGN.md 的基元清单里）。
- **查看器**：`FileViewer`
  （`components/drawer-viewers/FileViewer.tsx`）、
  `MarkdownViewer`（`components/markdown/MarkdownViewer.tsx`）、
  `ProofImageViewer`、`SessionPreviewPane`（`components/preview/`）。

## 4. 设计系统指引（并非拷贝——Q1）

OpenRig 规范的视觉/设计系统是 **`docs/DESIGN.md`**（位于仓库 `docs/`
根目录，而非 `docs/as-built/` 之下）。Q1 已获批准：DESIGN.md 留在根目录、
逐字节不变，本模块**指向它而非复制**。DESIGN.md 是以下内容的出处：
Vellum 纸面与黑玻璃两种表面语言、颜色 token（`packages/ui/src/globals.css` +
`tailwind.config.ts`）、排版（`font-body` Inter / `font-headline` Space
Grotesk / `font-mono` JetBrains Mono）、布局（48px 侧栏 + Explorer +
中央区 + 抽屉 + 预览栈）、核心基元清单、图形系统，以及
交互/动效/无障碍/该做与不该做规则。

> 核对注记：DESIGN.md 的基元清单已对照 HEAD 处的
> `packages/ui/src/components/` 独立验证过——DESIGN.md 提到的每个基元
> （Vellum、Graphics、项目元数据、Topology、Preview）都能解析为 HEAD
> 处的真实导出。DESIGN.md 准确无误，且不携带 slice-00 的数字漂移，
> 因此照原样引用。请勿在此重复其内容；视觉 spec 请直接阅读
> `docs/DESIGN.md`。

## 参见

- `docs/DESIGN.md` —— 规范的视觉/设计系统 spec（仅指引；勿复制）。
- `shell-and-routing.md` —— `/specs` 路由族 + 外壳 + 抽屉。
- `../architecture/agent-spec-and-startup.md` —— 评审流程背后的 spec
  解析（parsing）/解析（resolution）契约。
- `../architecture/plugin-agent-image-context-pack.md` ——
  插件/智能体镜像/上下文包 Library 呈现面背后的 0.3.1 内容层。
- 源码根目录：`packages/ui/src/components/specs/`、
  `packages/daemon/src/domain/{spec-review-service,spec-library-service}*`。