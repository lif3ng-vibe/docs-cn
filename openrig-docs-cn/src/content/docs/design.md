---
title: "OpenRig 设计"
---

本文记录 OpenRig 当前的视觉系统，使产品可以被复现、扩展或转译为其他媒介，而无需从代码逆向破解 UI。

## 设计本质

OpenRig 是一个面向多智能体工作的本地控制平面。界面应当像操作者的战术卷宗：精确、技术化、冷静，在压力之下依然清晰可读。它不是面向消费者的 SaaS 仪表盘，也不是装饰性的终端皮肤。它是一处以纸与玻璃为材质的工作空间，用来观察工作如何流经 rig、智能体、队列、项目、文件与证明包。

品牌需要传达：

- 操作者的信心：人能看到正在发生什么、什么需要处理。
- 可组合的系统：工作区、任务（mission）、切片、rig、工作舱、席位、队列、文件与证明呈现面共享同一套原语，而不是各自定制一次性的卡片。
- 实时的工作：活动、流转、上下文用量、证明与终端状态均清晰可见，同时不会把 UI 变成一摊日志。
- 本地优先的控制：应用看起来是一个严肃的本地驾驶舱，而不是云端营销产品。

## 设计语言

OpenRig 目前采用两种刻意区分的呈现面语言。

### 羊皮纸（Vellum）

羊皮纸是默认的浅色呈现面语言，出现在导航外框、仪表盘卡片、拓扑卡片、项目卡片、抽屉、文件查看器与元数据容器上。

常驻的产品呈现面使用羊皮纸：

- Explorer 侧边栏
- 仪表盘卡片
- 拓扑中的 rig、工作舱与智能体卡片
- 项目卡片与 For You 卡片
- 抽屉面板与文档查看器
- 文件与 markdown 呈现面

羊皮纸的核心特征：

- 纸张网格背景，可见于呈现面之后，有时还能透过呈现面隐约显现
- 白色半透明填充，通常为 `bg-white/25` 到 `bg-white/40`
- 用 `backdrop-blur-[8px]` 营造层叠纸张效果
- 1px 描边或幽灵边框
- 硬阴影只出现在纸质卡片上，不出现在悬浮玻璃上
- 带边框的战术图版使用对位标记（registration marks）
- 除极小的状态圆点外，一律直角

羊皮纸绝不应变得完全透明。如果纸张网格让文字难以阅读，先提高不透明度，其次才是加重边框。

### 黑玻璃

黑玻璃是悬浮的深色呈现面语言，目前用于拓扑终端预览与截图/证明浮层。

临时预览呈现面使用黑玻璃：

- 终端弹出框
- 图像证明查看器
- 其他需要让内容悬浮在画布之上的速览浮层

黑玻璃的核心特征：

- 透明的深色填充，目前约为 `bg-stone-950/65`
- 浅色文字，通常为 `text-stone-50`
- 可选的轻微背景模糊
- 无硬阴影
- 无 1px 羊皮纸边框
- 外框装饰削减到理解内容所必需的最低限度

黑玻璃的感觉应当是悬于画布之上的一片烟色玻璃薄片，而不是一个镶了边框的终端模拟器。

## 颜色令牌

权威令牌定义在 `packages/ui/src/globals.css` 中，并经 `packages/ui/tailwind.config.ts` 暴露给 Tailwind。

纸色：

- `--background: 47 20% 97%` - 基础纸色，`#faf9f5`
- `--surface-container-lowest: 0 0% 100%` - 卡片主体白
- `--surface-container-low: 80 10% 95%`
- `--surface-container: 80 10% 92%`
- `--surface-container-high: 100 10% 89%`
- `--surface-container-highest: 100 10% 87%`

墨色：

- `--on-surface: 120 8% 19%` - 主文字色，`#2e342e`
- `--on-surface-variant: 108 5% 36%` - 次级文字色，`#5b615a`
- `--inverse-surface: 120 10% 4%` - 深色条带填充，近乎纯黑

技术线条：

- `--secondary: 213 15% 39%` - 连接线、控制柄与对位标记
- `--secondary-container: 220 39% 91%`

状态色：

- `--success: 145 63% 35%`
- `--warning: 40 90% 50%`
- `--tertiary: 1 63% 42%` - 印章红 / 危急
- `--error: 0 43% 44%`

边框：

- `--outline: 108 4% 47%`
- `--outline-variant: 108 4% 68%`

使用规则：

- 大多数结构性边框使用 `outline-variant`。
- stone-900 边框只留给重要的卡片边缘、激活的页签和硬朗的战术强调。
- 不要为每个功能另造一次性配色。先对状态做分类，再映射到共享的中性、信息、成功、警告或危险色调。

## 字体排印

Tailwind 字体族：

- `font-body`：Inter，用于可读的正文文字
- `font-headline`：Space Grotesk，用于展示型与盖章式标题
- `font-mono`：JetBrains Mono，用于标签、ID、队列状态、技术元数据、终端预览、页签、徽片与计数器

通用排印规则：

- 产品标签使用大写等宽字体，字间距约为 `tracking-[0.10em]`。
- 供人阅读的正文应使用句首大写（sentence case）。
- 代码标识符应尽可能转换为人类可读的标签，而非原样展示。
- 终端与会话记录内容保持等宽，但不应迫使产品的其余部分读起来像一份日志。

## 布局

外壳采取路由优先、Explorer 优先的设计：

- 桌面端 48px 图标栏
- Explorer 侧边栏，提供随路由变化的树状上下文
- 中央工作区，承载目的地内容
- 右侧抽屉，用于临时性的详情与文件视图
- 预览堆栈，用于钉住的速览面板

主要目的地：

- `/` 仪表盘
- `/topology` 主机拓扑
- `/for-you` For You 信息流
- `/project` 工作区/项目可观测性
- `/specs` 资源库
- `/settings` 设置

拓扑与项目都采用层级式的范围（scope）：

- 拓扑：主机 -> rig -> 工作舱 -> 席位
- 项目：工作区 -> 任务 -> 切片

更低一级的范围收窄过滤条件，更高一级的范围拓宽上下文。

## 核心原语

在新增组件样式之前，先使用这些原语。

羊皮纸：

- `VellumCard`
- `VellumSheet`
- `RegistrationMarks`
- `StatusPip`
- `SectionHeader`
- `EmptyState`

图形：

- `RuntimeMark`
- `RuntimeBadge`
- `ToolMark`
- `ToolBadge`
- `ActorMark`
- `OperatorMoodMark`
- `runtime-brand.ts`
- `tool-brand.ts`

项目元数据：

- `ProjectPill`
- `EventBadge`
- `QueueStateBadge`
- `TagPill`
- `ActorChip`
- `DateChip`
- `FlowChips`
- `ProofThumbnailGrid`
- `ProofPacketHeader`

拓扑：

- `HostMultiRigGraph`
- `HybridAgentNode`
- `HybridPodGroupNode`
- `RigGroupNode`
- `ActivityRing`
- `HotPotatoEdge`
- `TerminalPreviewPopover`
- `TopologyTableView`
- `TopologyTerminalView`

预览与文档：

- `SessionPreviewPane`
- `ProofImageViewer`
- `FileViewer`
- `MarkdownViewer`

## 图形系统

OpenRig 采用共享的图形包，而不是把一处处具体的图标逻辑散布在产品呈现面上。

运行时标识：

- Claude：像素风格的 Claude 标识，标签为 `Claude`
- Codex：Codex CLI 的终端圆形标识，标签为 `Codex`
- Terminal：紧凑的终端字形，标签为 `TTY` 或 `Terminal`
- Unknown：中性兜底样式

工具标识：

- CMUX：蓝色山形纹标识
- tmux：带绿色底色的窗格网格标识
- VS Code：蓝色代码标识
- 终端、文件、markdown、配置、代码、截图、证明、会话记录、提交、文件夹、技能、视频与追踪（trace）在统一的品牌定义中各有条目

参与者标识：

- 人类/操作者使用单色的登山者面具
- 智能体/运行时参与者复用运行时标识

图形布置规则：

- 在运行时是重要扫读维度之处，使用运行时标识。
- 同一行的相邻列不要重复同一个运行时标识。
- 表达动作时用工具标识，不要用运行时标识。
- 当一张卡片在视觉上已经很密时，优先使用内联标识与开放式的元数据行，而不是再堆叠矩形胶囊徽章。
- 标识要小到足以支撑扫读。它们是地标，不是吉祥物。

## 交互模式

仅悬停可见的操作：

- 密集的拓扑卡片在悬停/聚焦时显示 CMUX 与终端操作。
- 键盘聚焦必须呈现出与鼠标悬停相同的一组操作。
- 操作的点击必须阻止事件传播，避免行或节点导航同时被触发。

抽屉与浮层：

- 抽屉可通过关闭按钮或点击面板外部关闭。
- 图像查看器与终端弹出框属于速览呈现面。
- 拓扑终端弹出框以 portal 方式渲染在 React Flow 节点层叠上下文之上。

队列与项目：

- 队列是运营视角：什么待处理、可行动、已路由或已关闭。
- Story 是叙事视角：一段时间里发生了什么，正文为主，元数据为辅。
- For You 是注意力路由：轮到你、待审批、已交付的证明、进展与观察。

## 动效

动效应当解释状态，而非装饰。

现有的动效语汇：

- 活动卡片脉冲：用于活跃、需要输入与被阻塞状态
- 交接事件的源端与目标端闪烁
- 拓扑图边上的热土豆（hot-potato）数据包动画
- rig 外框脉冲表示聚合活动
- 路由与节点进入时的轻微淡入

规则：

- 优先缓慢的脉冲，而非闪烁。
- 方向性的工作流动要醒目到在图的缩放级别下也能看见。
- 遵守 `prefers-reduced-motion`：移除脉冲/移动动画，保留静态状态信号。

## 无障碍

- 纯图标操作需要标签或工具提示。
- 装饰性标识应使用 `aria-hidden`。
- 语义化状态应使用 `StatusPip`，而不是活动动画类。
- 键盘聚焦必须能触达仅悬停可见的控件。
- 不要仅靠颜色表达操作结果。
- 在预期的拓扑缩放范围内保持密集卡片可读。

## 应做与不应做

应做：

- 将羊皮纸与黑玻璃作为两种不同的呈现面范式来使用。
- 保持直角几何、1px 线条与硬纸质阴影。
- 通过品牌辅助函数集中管理图形。
- 把原始的事件/状态代码转换为人类可读的标签。
- 凡出现缩略图或终端标识之处，都提供证明与终端预览。
- 保持层级可见：工作区 -> 任务 -> 切片，主机 -> rig -> 工作舱 -> 席位。

不应做：

- 原语能够胜任时，不要再造一次性的卡片样式。
- 不要用 emoji 充当产品图形。
- 不要把元数据变成一整面矩形胶囊墙。
- 不要让终端/日志美学主导供人做决策的呈现面。
- 不要添加装饰性渐变色块或千篇一律的 SaaS hero 样式。
- 不要给黑玻璃弹出框加黑色边框或硬阴影。
- 不要在 `runtime-brand.ts`、`tool-brand.ts` 与 `RuntimeMark.tsx` 之外复制运行时/工具品牌逻辑。

## 实现参考

- 令牌：`packages/ui/src/globals.css`
- Tailwind 主题：`packages/ui/tailwind.config.ts`
- 外壳：`packages/ui/src/components/AppShell.tsx`
- 路由：`packages/ui/src/routes.tsx`
- 羊皮纸原语：`packages/ui/src/components/ui/`
- 图形原语：`packages/ui/src/components/graphics/RuntimeMark.tsx`
- 运行时品牌：`packages/ui/src/lib/runtime-brand.ts`
- 工具品牌：`packages/ui/src/lib/tool-brand.ts`
- 项目元数据原语：`packages/ui/src/components/project/ProjectMetaPrimitives.tsx`
- 拓扑图节点：`packages/ui/src/components/topology/HybridTopologyNodes.tsx`
- 终端弹出框：`packages/ui/src/components/topology/TerminalPreviewPopover.tsx`
- 会话预览：`packages/ui/src/components/preview/SessionPreviewPane.tsx`
