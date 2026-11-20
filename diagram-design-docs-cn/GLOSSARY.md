# Glossary — diagramdesign.dev 汉化

上游快照 2026-11-20（diagramdesign.dev 首页 + 8 个 examples 示例页）。闭源纯手写静态站（无构建、无框架指纹、资源全相对路径），走 HTML 产物镜像汉化。

## 核心术语

| 英文 | 中文 | 备注 |
|---|---|---|
| editorial | 杂志级 | editorial design 语境；首次出现附英文 |
| taste | 品味 | "It was missing the taste" 的题眼 |
| slop | 俗套 | rounded-box slop → 圆角框俗套 |
| agent | 智能体 | coding agent → 编码智能体 |
| (agent/skills) host | 宿主 | 智能体宿主 / 技能宿主 |
| skill | 技能 | Agent Skill → 智能体技能 |
| brand-matched | 品牌匹配 | 动词用法：匹配你的品牌 |
| self-contained | 自包含 | |
| build step | 构建步骤 | 0 build steps → 0 构建步骤 |
| focal layer / room / building / part | 焦点层 / 焦点房间 / 焦点建筑 / 焦点部件 | FOCAL LAYER 大写版 → 焦点层 |
| teardown | 拆解 | phone teardown → 手机拆解 |
| unboxing | 开箱 | |
| exploded axonometric | 分解轴测图 | |
| axonometric plan | 轴测平面图 | |
| 2:1 projection | 2:1 投影 | |

## 不译名单

Diagram Design（产品名）、diagramdesign.dev、SKILL.md、HTML、SVG、MIT、GitHub、Figma、Cursor、Cline、Gemini CLI、Windsurf、Claude Code、Codex、Pi、GitHub Copilot、Factory Droid、Qoder、Kiro、OpenCode、draw.io、Mermaid、Excalidraw、PlantUML、Cloudflare、Postgres、Redis、MinIO、Trino、Superset、Airflow、Kubernetes、TypeScript、SBGN、Medallion（数据架构专名）、Wardley（人名专名，译"Wardley 地图"）、npx/plugin/codex/pi/copilot/droid/qoder/git 命令、路径与文件名、`data-*` 属性里的路径与命令、MIT © 2025 Cathryn Lavery（署名）、图内 PNG 截图（assets/gallery/* 图内英文照用）。

## 50 种图表类型名（gallery 卡片 + 正文统一）

Architecture 架构图 · Architecture delta 架构差异图 · IT current-state IT 现状图 · Flowchart 流程图 · Sequence 时序图 · State machine 状态机 · ER / data model ER / 数据模型 · Timeline 时间线 · Swimlane 泳道图 · Quadrant 四象限图 · Radar / spider 雷达图 / 蛛网图 · Polar chart 极坐标图 · Loop / flywheel 循环 / 飞轮 · Nested 嵌套图 · Tree 树形图 · Org chart 组织架构图 · Layer stack 层叠图 · Exploded axonometric 分解轴测图 · Axonometric plan 轴测平面图 · Venn 维恩图 · Pyramid / funnel 金字塔 / 漏斗 · Bar chart 条形图 · Waterfall 瀑布图 · Treemap 矩形树图 · Heatmap 热力图 · Line chart 折线图 · Gantt 甘特图 · Scatter plot 散点图 · High-Level 总览架构 · Process 过程图 · Medallion Medallion 分层 · Data flow 数据流图 · DP integration 数据平台集成 · DP security matrix 数据平台安全矩阵 · Sankey 桑基图 · Fishbone 鱼骨图 · Wardley map Wardley 地图 · Kanban 看板 · User journey 用户旅程图 · Deployment 部署图 · Dependency graph 依赖图 · UML class UML 类图 · Story map 用户故事地图 · Database schema 数据库结构 · Service blueprint 服务蓝图 · SBGN SBGN 图 · Requirement traceability 需求追溯图 · Event modeling 事件建模图 · Steps 步骤图 · Unit Grid 单元网格

## 译法决策记录

- 流程图 vs 过程图：Flowchart（决策分支）译"流程图"，Process（多角色顺序协作）译"过程图"以区分。
- High-Level：README 语义是"端到端全栈总览"，译"总览架构"而非直译"高层"。
- "Sheet 1 of 1"：工程图纸印记，译"图页 1 / 1"。
- "Fig. NN"：图注编号保留"图 NN"格式（Fig. 01 → 图 01）。
- 数字口径以快照为准：本快照 meta/hero 说 50 types（README 说 45、demo aria 说 44），互不改写。
- 终端会话模拟（Fig. 03）：提示词与注释译中文，`wrote architecture.html` 输出标记保留英文词形。
- 动画控件：Play/Pause/Next/Previous/Replay → 播放/暂停/下一帧/上一帧/重播。
