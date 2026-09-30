---
kind: as-built
title: UI Topology——图/表/终端、HotPotato、ActivityRing
status: active
topics: [observability, coordination]
domains: [engineering-advisor, operating-advisor]
applies-when: |
  需要了解 topology 呈现面是如何构建的——宿主混合图、表格/终端
  视图、活动环（activity ring）/ 热土豆（hot-potato）视觉语言、
  终端预览弹窗，以及 topology 导航/覆盖层契约。
siblings: [shell-and-routing.md, project-and-for-you.md]
prerequisite-reads: [../README.md, shell-and-routing.md]
last-verified-against-source: 7eaf524c
last-updated: 2026-05-16
---


Topology 是一个以 scope 为单位的工作区，在 `/topology` 路由族
（`shell-and-routing.md` §3）下提供图、表、终端三种视图。它是操作员
对 host → rig → 工作舱 → 席位的实时图景。

> 已对照 HEAD `7eaf524c` 处的源码核实；软件包版本 **0.3.1**
> （slice-00 §1.1）。下列所有组件名均已对照 HEAD 处的
> `packages/ui/src/components/topology/` 再次确认——`ui.md` 与
> `DESIGN.md` 列的是*导出符号*；定义混合节点的源文件是
> `HybridTopologyNodes.tsx`（DESIGN.md L344 的实现引用）。

## 1. Topology 组件构成

> 漂移修正——`ui.md` 的 “Topology”（L108–137）把 `HybridAgentNode` /
> `HybridPodGroupNode` 列得像两个顶层文件。已在 HEAD 再次确认：二者
> 都是 `packages/ui/src/components/topology/HybridTopologyNodes.tsx`
> 内部的导出（`HybridPodGroupNode` 是 `HybridTopologyNodes.tsx:94`
> 处的 `memo(...)`；`HybridAgentNode` 是 `:272` 处的
> `memo(HybridAgentNodeInner, ...)`）。组件名准确无误；其文件位置
> 已被合并收纳。

`packages/ui/src/components/topology/` 中的组件（已在 HEAD 再次确认）：

- `HostMultiRigGraph.tsx` —— 宿主级混合 React Flow 图（multi-rig
  单一画布）。
- `HybridTopologyNodes.tsx` —— 导出 `HybridAgentNode`（紧凑的智能体
  卡片：运行时徽章、上下文百分比、token 总量、活动状态、终端预览、
  CMUX 操作）与 `HybridPodGroupNode`（柔和虚线的工作舱框）。
- `RigGroupNode.tsx` —— 带对位标记（registration marks）+ 聚合活动
  的柔和 rig 框。
- `ActivityRing.tsx` —— active / needs-input / blocked 状态的活动环；
  卡片活动类位于 `activity-card-visuals.ts`。
- `HotPotatoEdge.tsx` —— 有向队列移动的边动画。
- `TopologyTableView.tsx` —— topology 数据的紧凑表格镜像。
- `TopologyTerminalView.tsx` —— 终端导向的 topology 状态。
- `TopologyTreeView.tsx` —— 树形导航视图。
- `TopologyViewModeTabs.tsx` —— 图/表/终端/树的模式切换。
- `TerminalPreviewPopover.tsx` —— 黑玻璃快速终端预览，门户（portal）
  到图之上。
- `LaunchCmuxButton.tsx` —— 悬停/聚焦时的 CMUX 启动操作。
- `ScopePages.tsx` —— host/rig/工作舱/席位 scope 页面包装器。
- `topology-overlay-context.tsx` —— `TopologyOverlayProvider`
  （rig 展开状态）。

> 注记（对照 `DESIGN.md` 的 “Topology” L205–216）：DESIGN.md 列出了
> 同一批已导出基元（`HostMultiRigGraph`、`HybridAgentNode`、
> `HybridPodGroupNode`、`RigGroupNode`、`ActivityRing`、
> `HotPotatoEdge`、`TerminalPreviewPopover`、`TopologyTableView`、
> `TopologyTerminalView`）——已对照源码核对：均在 HEAD 处存在。
> `TopologyTreeView` / `TopologyViewModeTabs` / `LaunchCmuxButton` 在
> 源码中存在，但不在 DESIGN.md 的基元清单内（DESIGN.md 是品牌基元
> 清单，不是穷尽的组件清单；这不是漂移，而是范围差异）。DESIGN.md
> 保持逐字节不变（Q1）。

## 2. Topology 契约

取自 `architecture.md` §2 的 “Current topology UI” + `ui.md` 的
“Important topology contracts”，并已在 HEAD 处对照源码行为再次确认：

- 图/表/树三类导航全部解析为席位详情 URL
  （`/topology/seat/$rigId/$logicalId`）。
- 宿主级图使用跨 rig 的节点 ID 前缀，实现 multi-rig 单一画布。
- rig 展开状态由 `TopologyOverlayProvider`
  （`topology-overlay-context.tsx`）持有；图数据只为已展开的 rig
  懒加载。
- 紧凑智能体卡片显示上下文百分比、token 总量与活动卡片着色；
  `ActivityRing` + 活动类呈现 active / needs-input / blocked 三态。
- `HotPotatoEdge` 在图的各缩放级别为有向队列移动加动画；
  “减少动态”偏好会移除脉冲/位移动画，保留静态状态信号。
- 终端预览操作在悬停/聚焦可见（focus-visible）时触发；
  `TerminalPreviewPopover` 必须逃离 React Flow 的层叠上下文（门户到
  画布之上）并保持在视口之内。

## 3. 布局辅助

Topology 布局由 `src/lib/` 辅助模块计算（已在 HEAD 再次确认）：
`graph-layout.ts`、`hybrid-layout.ts`、`multi-rig-layout.ts`、
`topology-activity.ts`、`activity-visuals.ts`。卡片上的运行时/工具
身份来自中央的 `runtime-brand.ts` / `tool-brand.ts` +
`RuntimeMark.tsx`（不得复制品牌逻辑——DESIGN.md 的 “Do not”；此处
重申为 topology 卡片的品牌来源契约）。

## 参见

- `shell-and-routing.md` —— `/topology` 路由族与外壳。
- `project-and-for-you.md` —— 同级的可观测性呈现面。
- `../architecture/coordination-primitive.md` —— HotPotato 边所
  可视化的队列移动。
- 源码根：`packages/ui/src/components/topology/`、
  `packages/ui/src/lib/{graph,hybrid,multi-rig}-layout.ts`。