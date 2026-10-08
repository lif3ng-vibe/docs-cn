---
title: 'Nexus Spatial：代理公司全员产品发现演练'
---

# Nexus Spatial：代理公司全员产品发现演练

> **演练类型**：多智能体产品发现
> **日期**：2026 年 3 月 5 日
> **投入智能体**：8 个（并行）
> **耗时**：实际用时约 10 分钟
> **目的**：演示代理公司（agency）的完整编排——从识别机会一路做到全面规划

---

## 目录

1. [机会](#1-机会)
2. [市场验证](#2-市场验证)
3. [技术架构](#3-技术架构)
4. [品牌战略](#4-品牌战略)
5. [上市与增长](#5-上市与增长)
6. [客户支持蓝图](#6-客户支持蓝图)
7. [UX 研究与设计方向](#7-ux-研究与设计方向)
8. [项目执行计划](#8-项目执行计划)
9. [空间界面架构](#9-空间界面架构)
10. [跨智能体综合](#10-跨智能体综合)

---

## 1. 机会

### 机会从何而来

对多个来源的网络调研发现了三个正在汇聚的趋势：

- **AI 基础设施/编排**是增长最快的软件品类（AI 编排市场 2026 年估值约 135 亿美元，CAGR 超过 22%）
- **空间计算**（Vision Pro、WebXR）日趋成熟，但缺乏企业级杀手应用
- 现有的每一个 AI 工作流工具（LangSmith、n8n、Flowise、CrewAI）都是**扁平的 2D 仪表盘**

### 产品概念：Nexus Spatial

一个空间计算中的 AI 智能体指挥中心——一款 VisionOS + WebXR 应用，为编排、监控和与 AI 智能体交互提供一个沉浸式 3D 指挥中心。用户以 3D 节点图可视化智能体流水线，在空间面板中监控实时输出，在 3D 空间里拖拽搭建工作流，并在共享空间环境中协作。

### 为什么这家代理公司具备独特优势

这家代理公司在空间计算上有深厚的专长（XR 开发者、VisionOS 工程师、Metal 专家、界面架构师），同时还有完整的工程、设计、市场营销和运营班底——对一个既要求空间计算造诣、又要求企业软件严谨性的产品来说，这样的组合非常罕见。

### 来源

- [2026 年可盈利的 SaaS 点子（273K+ 条评论）](https://bigideasdb.com/profitable-saas-micro-saas-ideas-2026)
- [2026 SaaS 与 AI 革命：20 大趋势](https://fungies.io/the-2026-saas-and-ai-revolution-20-top-trends/)
- [2026 年 21 个供给不足的市场](https://mktclarity.com/blogs/news/list-underserved-niches)
- [2026 年增长最快的产品 - G2](https://www.g2.com/best-software-companies/fastest-growing)
- [普华永道 2026 AI 商业预测](https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-predictions.html)

---

## 2. 市场验证

**智能体**：Product Trend Researcher

### 结论：有条件推进——先 2D，后空间

### 市场规模

| 细分市场 | 2026 年规模 | 增速 |
|---------|-----------|--------|
| AI 编排工具 | $13.5B | 22.3% CAGR |
| 自主 AI 智能体 | $8.5B | 45.8% CAGR，2030 年达 $50.3B |
| 扩展现实 | $10.64B | 40.95% CAGR |
| 空间计算（广义） | $170-220B | 视口径而定 |

### 竞争格局

**AI 智能体编排（全部是 2D）：**

| 工具 | 优势 | UX 缺口 |
|------|----------|--------|
| LangChain/LangSmith | 基于图的编排，$39/用户/月 | 扁平仪表盘；图一大就读不动 |
| CrewAI | 10 万+ 开发者，执行快 | CLI 优先，可视化工具薄弱 |
| Microsoft Agent Framework | 企业集成能力 | 嵌在 Azure 门户里，无独立 UI |
| n8n | 可视化工作流搭建器，$20-50/月 | 2D 画布难以表达智能体之间的关系 |
| Flowise | 拖拽式 AI 流程 | 仅限线性流程，无多智能体监控 |

**"任务控制台"类产品（新兴，全部是 2D）：**
- cmd-deck：面向 AI 编程智能体的看板
- Supervity Agent Command Center：企业级可观测性
- OpenClaw Command Center：智能体机群管理
- Mission Control AI：合成员工管理
- Mission Control HQ：小队级协同

**缺口所在**：现有产品要么主打空间却不主打 AI，要么主打 AI 却是平面 2D。没有一个产品站在这两者的交汇点上。

### Vision Pro 现实核查

- 全球装机量约 100 万台（销量较发布时下滑 95%）
- Apple 已把重心转向轻量化 AR 眼镜
- VisionOS 专属应用只有约 3,000 个
- **启示**：不要以 VisionOS 打头阵。先用 Web 起步，加上 WebXR，原生 VisionOS 放在最后。

### WebXR 是发行解锁点

- Safari 已于 2025 年底支持 WebXR Device API
- 2026 年 WebXR 采用率增长 40%
- WebGPU 在浏览器中实现接近原生的渲染
- Android XR 支持 WebXR 与 OpenXR 标准

### 目标用户画像与定价

| 档位 | 价格 | 目标人群 |
|------|-------|--------|
| Explorer | 免费 | 开发者、独立开发者（3 个智能体，WebXR 查看器） |
| Pro | $99/用户/月 | 小团队（25 个智能体，可协作） |
| Team | $249/用户/月 | 中端市场 AI 团队（智能体不限量，含分析） |
| Enterprise | 定制（$2K-10K/月） | 大型企业（SSO、RBAC、私有部署、SLA） |

### 推荐的分阶段战略

1. **第 1-6 个月**：打造一个带 Three.js 2.5D 能力的高级 2D Web 仪表盘。目标：50 个付费团队，$60K MRR。
2. **第 6-12 个月**：加入可选的 WebXR 空间模式（基于浏览器）。目标：200 个团队，$300K MRR。
3. **第 12-18 个月**：仅在空间需求得到验证后再做原生 VisionOS 应用。目标：500 个团队，$1M+ MRR。

### 关键风险

| 风险 | 严重度 |
|------|----------|
| Vision Pro 装机量极小 | HIGH |
| "拿着空间方案找问题"——3D 真的比 2D 好 10 倍吗？ | HIGH |
| "任务控制台"定位已经拥挤（已有 5+ 个产品） | MODERATE |
| 企业级空间计算的落地仍处早期 | MODERATE |
| 跨 AI 框架的集成复杂度 | MODERATE |

### 来源

- [MarketsandMarkets——AI 编排市场](https://www.marketsandmarkets.com/Market-Reports/ai-orchestration-market-148121911.html)
- [德勤——2026 AI 智能体编排预测](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html)
- [Mordor Intelligence——扩展现实市场](https://www.mordorintelligence.com/industry-reports/extended-reality-xr-market)
- [Fintool——Vision Pro 停产](https://fintool.com/news/apple-vision-pro-production-halt)
- [MadXR——2026 WebXR 浏览器体验](https://www.madxr.io/webxr-browser-immersive-experiences-2026.html)

---

## 3. 技术架构

**智能体**：Backend Architect

### 系统总览

一个 8 服务架构，职责边界清晰，为水平扩展和厂商无关的 AI 集而生。

```
+------------------------------------------------------------------+
|                     CLIENT TIER                                   |
|  VisionOS Native (Swift/RealityKit)  |  WebXR (React Three Fiber) |
+------------------------------------------------------------------+
                              |
+-----------------------------v------------------------------------+
|                      API GATEWAY (Kong / AWS API GW)              |
|  Rate limiting | JWT validation | WebSocket upgrade | TLS        |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      SERVICE TIER                                 |
|  Auth | Workspace | Workflow | Orchestration (Rust) |             |
|  Collaboration (Yjs CRDT) | Streaming (WS) | Plugin | Billing    |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      DATA TIER                                    |
|  PostgreSQL 16 | Redis 7 Cluster | S3 | ClickHouse | NATS        |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                    AI PROVIDER TIER                                |
|  OpenAI | Anthropic | Google | Local Models | Custom Plugins      |
+------------------------------------------------------------------+
```

### 技术选型

| 组件 | 技术 | 理由 |
|-----------|------------|-----------|
| 编排引擎 | **Rust** | 亚毫秒级调度、零 GC 停顿、为智能体沙箱提供内存安全 |
| API 服务 | TypeScript / NestJS | CRUD 密集型服务的开发速度快 |
| VisionOS 客户端 | Swift 6, SwiftUI, RealityKit | 借 Liquid Glass 实现一等公民的空间计算体验 |
| WebXR 客户端 | TypeScript, React Three Fiber | 生产级 WebXR + React 组件模型 |
| 消息中间件 | NATS JetStream | 轻量、恰好一次投递、比 Kafka 简单 |
| 协同编辑 | Yjs (CRDT) + WebRTC | 无冲突的并发 3D 图编辑 |
| 主数据库 | PostgreSQL 16 | JSONB 存灵活配置，行级安全实现租户隔离 |

### 核心数据模型

14 张表，覆盖：
- **身份与访问**：users、workspaces、team_memberships、api_keys
- **工作流**：workflows、workflow_versions、nodes、edges
- **执行**：executions、execution_steps、step_output_chunks
- **协同**：collaboration_sessions、session_participants
- **凭证**：provider_credentials（AES-256-GCM 加密）
- **计费**：subscriptions、usage_records
- **审计**：audit_log（只追加）

### 节点类型注册表

```
Built-in Node Types:
  ai_agent          -- Calls an AI provider with a prompt
  prompt_template   -- Renders a template with variables
  conditional       -- Routes based on expression
  transform         -- Sandboxed code snippet (JS/Python)
  input / output    -- Workflow entry/exit points
  human_review      -- Pauses for human approval
  loop              -- Repeats subgraph
  parallel_split    -- Fans out to branches
  parallel_join     -- Waits for branches
  webhook_trigger   -- External HTTP trigger
  delay             -- Timed pause
```

### WebSocket 通道

通过 WSS 实现实时流：
- 每通道带序列号保证顺序
- 缺口检测 + 补放请求
- 落后超过 1000 条事件时快照恢复
- 面向低性能设备的客户端节流

### 安全架构

| 层 | 机制 |
|-------|-----------|
| 用户认证 | OAuth 2.0 (GitHub, Google, Apple) + email/password + optional TOTP MFA |
| API 密钥 | SHA-256 hashed, scoped, optional expiry |
| 服务间通信 | mTLS via service mesh |
| WebSocket 认证 | One-time tickets with 30-second expiry |
| 凭证存储 | Envelope encryption (AES-256-GCM + AWS KMS) |
| 代码沙箱 | gVisor/Firecracker microVMs (no network, 256MB RAM, 30s CPU) |
| 租户隔离 | PostgreSQL Row-Level Security + S3 IAM policies + NATS subject scoping |

### 扩展目标

| 指标 | 第 1 年 | 第 2 年 |
|--------|--------|--------|
| 并发智能体执行数 | 5,000 | 50,000 |
| WebSocket 连接数 | 10,000 | 100,000 |
| P95 API 延迟 | < 150ms | < 100ms |
| P95 WS 事件延迟 | < 80ms | < 50ms |

### MVP 阶段

1. **第 1-6 周**：2D Web 编辑器、顺序执行、OpenAI + Anthropic 适配器
2. **第 7-12 周**：WebXR 3D 模式、并行执行、手部追踪、RBAC
3. **第 13-20 周**：多用户协同、原生 VisionOS、计费
4. **第 21-30 周**：企业 SSO、插件 SDK、SOC 2、规模化加固

---

## 4. 品牌战略

**智能体**：Brand Guardian

### 定位

**做品类创造者，不做品类竞争者**。Nexus Spatial 定义一个新品类——**空间 AI 运维**（SpatialAIOps）——而不是在拥挤的 AI 可观测性仪表盘赛道里抢位置。

**定位陈述**：面向管理复杂 AI 智能体工作流的技术团队，Nexus Spatial 是提供智能体编排空间感知的沉浸式 3D 指挥中心。与扁平的 2D 仪表盘不同，空间计算把监控从"看仪表盘"变成"置身于你的基础设施之中"。

### 名称验证

"Nexus Spatial" 这个名字**验证结果为强**：
- "Nexus" 呼应 NEXUS 编排框架（Network of EXperts, United in Strategy）
- "Nexus" 本义即"中枢连接点"——对一个指挥中心再合适不过
- "Spatial" 是 Apple 和整个行业已经教育好的行业标准用词
- 音节平衡：先三个音节，再两个
- **待办**：在尼斯分类第 9、42、38 类做商标清查

### 品牌人格：指挥官

| 特质 | 表达 | 避免 |
|-------|------------|--------|
| **权威** | 清晰、直接、技术上精确 | 炒作、最高级形容词、空泛的未来主义 |
| **沉稳** | 干净的设计、克制的节奏、留白 | 为紧迫而紧迫、混乱 |
| **开拓** | 低调的自豪、对新范式不动声色的引用 | "革命性""颠覆一切" |
| **精确** | 确切的规格、真实的指标、诚实的要求 | 模糊论断、营销黑话 |
| **亲和** | 自然的交互语言、空间隐喻 | 居高临下、设门槛 |

### 口号（按排序）

1. **"智能体时代的任务控制台"**——推荐主口号
2. "在空间中看见你的智能体"
3. "在三维中编排"
4. "让 AI 运营进入空间维度"
5. "指挥中心。在空间中重铸。"
6. "你的仪表盘缺失的那个维度"
7. "AI 智能体值得比平面屏幕更多的东西"

### 色彩系统

| 颜色 | Hex | 用途 |
|-------|-----|-------|
| 深空靛蓝 | `#1B1F3B` | 基础暗色画布、背景 |
| Nexus 蓝 | `#4A7BF7` | 品牌签名色、主动作 |
| 信号青 | `#00D4FF` | 空间高亮、数据连接 |
| 指挥绿 | `#00E676` | 系统健康、成功 |
| 警戒琥珀 | `#FFB300` | 警告、需要关注 |
| 危急红 | `#FF3D71` | 错误、故障 |

使用配比：深空靛蓝 60%、Nexus 蓝 25%、信号青 10%、语义色 5%。

### 字体排印

- **主字体**：Inter（UI、正文、标签）
- **等宽字体**：JetBrains Mono（代码、日志、智能体输出）
- **展示字体**：Space Grotesk（仅用于营销大标题）

### Logo 概念

三个供探索的方向：

1. **空间枢纽标记**——汇聚的线条在发光的中心节点交汇，带轻微的透视纵深
2. **维度之窗**——风格化的取景框，用透视线营造"望进 3D 空间"的效果
3. **轨道阵列**——围绕中心点的轨道环，暗示协同运转的智能体群

### 品牌价值观

- **空间的真实性**——如实呈现系统状态，不做表面粉饰
- **运营的重力**——为生产环境而造，不是为演示
- **维度的慷慨**——用 WebXR 保证空间价值人人可得
- **复杂之下的从容**——系统越复杂，界面越安静

### 设计令牌

```css
:root {
  --nxs-deep-space:       #1B1F3B;
  --nxs-blue:             #4A7BF7;
  --nxs-cyan:             #00D4FF;
  --nxs-green:            #00E676;
  --nxs-amber:            #FFB300;
  --nxs-red:              #FF3D71;
  --nxs-void:             #0A0E1A;
  --nxs-slate-900:        #141829;
  --nxs-slate-700:        #2A2F45;
  --nxs-slate-500:        #4A5068;
  --nxs-slate-300:        #8B92A8;
  --nxs-slate-100:        #C8CCE0;
  --nxs-cloud:           #E8EBF5;
  --nxs-white:            #F8F9FC;
  --nxs-font-primary:     'Inter', sans-serif;
  --nxs-font-mono:        'JetBrains Mono', monospace;
  --nxs-font-display:     'Space Grotesk', sans-serif;
}
```

---

## 5. 上市与增长

**智能体**：Growth Hacker

### 北极星指标

**周活跃流水线**（Weekly Active Pipelines，WAP）——过去 7 天内至少发生过一次空间交互的不重复智能体流水线数。它同时捕捉创建与参与，与价值强相关，且难以刷量。

### 定价

| 档位 | 年付 | 月付 | 目标 |
|------|--------|---------|--------|
| Explorer | Free | Free | 3 条流水线、WebXR 预览、社区 |
| Pro | $29/user/mo | $39/user/mo | 流水线不限量、VisionOS、30 天历史 |
| Team | $59/user/mo | $79/user/mo | 协同、RBAC、SSO、90 天历史 |
| Enterprise | Custom (~$150+) | Custom | 专属基础设施、SLA、可选私有部署 |

策略：14 天反向试用（先享 Pro 功能，到期降为 Free）。目标免费转付费率 5-8%。

### 三阶段 GTM

**阶段 1：创始人主导销售（第 1-3 个月）**
- 目标人群：初创公司里使用 LangChain/CrewAI 且拥有 Vision Pro 的个人 AI 工程师
- 战术：私信 200 位高影响力 AI 工程师、每周"公开构建"发帖、30 秒演示短片
- 渠道：X/Twitter、LinkedIn、AI 主题 Discord 服务器、Reddit

**阶段 2：开发者社区（第 4-6 个月）**
- Product Hunt 发布（安排在本阶段，不放在阶段 1）
- Hacker News Show HN、Dev.to 文章、会议演讲
- 与热门 AI 框架的集成公告

**阶段 3：企业市场（第 7-12 个月）**
- Apple 企业转介管道、LinkedIn ABM 活动
- 企业案例研究、分析师简报（Gartner、Forrester）
- 招入首位企业销售 AE、SOC 2 合规

### 增长循环

1. **"惊艳时刻"演示循环**——空间演示天然适合分享。一键"分享空间预览"生成 WebXR 链接或视频。目标 K = 0.3-0.5。
2. **模板市场**——高级用户发布流水线模板，通过搜索被发现，带动新注册。
3. **协同席位扩张**——一位工程师采用，分享给队友，团队升级为付费计划（Slack/Figma playbook）。
4. **集成驱动的发现**——登录 LangChain、n8n、OpenAI/Anthropic 的合作伙伴目录。

### 开源战略

**开源（Apache 2.0）：**
- `nexus-spatial-sdk`——用于接入智能体框架的 TypeScript/Python SDK
- `nexus-webxr-components`——用于 3D 流水线的 React Three Fiber 组件库
- `nexus-agent-schemas`——在 3D 中表示智能体流水线的标准化 schema

**保持闭源**：VisionOS 原生应用、协同引擎、企业功能、托管基础设施。

### 收入目标

| 指标 | 第 6 个月 | 第 12 个月 |
|--------|---------|----------|
| MRR | $8K-15K | $50K-80K |
| 免费账户 | 5,000 | 15,000 |
| 付费席位 | 300 | 1,200 |
| Discord 成员 | 2,000 | 5,000 |
| GitHub stars（SDK） | 500 | 2,000 |

### 首个 $50K 预算

| 类目 | 金额 | % |
|----------|--------|---|
| 内容生产 | $12,000 | 24% |
| 开发者关系 | $10,000 | 20% |
| 付费获客测试 | $8,000 | 16% |
| 社区与工具 | $5,000 | 10% |
| Product Hunt 与发布 | $3,000 | 6% |
| 开源维护 | $3,000 | 6% |
| 公关与外联 | $4,000 | 8% |
| 合作伙伴 | $2,000 | 4% |
| 机动 | $3,000 | 6% |

### 关键合作伙伴

- **第 1 梯队**（关键）：Anthropic、OpenAI——一等公民 API 集成、合作伙伴计划登录页
- **第 2 梯队**（采用）：LangChain、CrewAI、n8n——框架集成、社区交叉导流
- **第 3 梯队**（平台）：Apple——Vision Pro 开发者套件、App Store 推荐、WWDC
- **第 4 梯队**（生态）：GitHub、Hugging Face、Docker——开发者平台集成

### 来源

- [AI 编排市场规模——MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/ai-orchestration-market-148121911.html)
- [空间计算市场——Precedence Research](https://www.precedenceresearch.com/spatial-computing-market)
- [如何给 AI 产品定价——Aakash Gupta](https://www.news.aakashg.com/p/how-to-price-ai-products)
- [Product Hunt 发布指南 2026](https://calmops.com/indie-hackers/product-hunt-launch-guide/)

---

## 6. 客户支持蓝图

**智能体**：Support Responder

### 支持分层结构

| 属性 | Explorer（免费） | Builder（Pro） | Command（企业） |
|-----------|-----------------|---------------|---------------------|
| 首响 SLA | 尽力而为（48 小时） | 4 小时（工作时间） | 30 分钟（P1）、2 小时（P2） |
| 解决 SLA | 5 个工作日 | 24 小时（P1/P2）、72 小时（P3） | 4 小时（P1）、12 小时（P2） |
| 渠道 | 社区、知识库、AI 助手 | 加：在线聊天、邮件、视频（每月 2 次） | 加：专属 Slack、指定 CSE、7x24 |
| 范围 | 一般问题、文档 | 技术排障、集成 | 全面集成、定制设计、合规 |

### 优先级定义

- **P1 紧急**：编排宕机、数据丢失风险、安全入侵
- **P2 高**：主要功能降级、有绕行方案
- **P3 中**：不阻塞的问题、小毛病
- **P4 低**：功能请求、外观问题

### Nexus 指南：AI 驱动的产品内支持

最亮眼的设计决策：支持智能体就活在**用户空间工作区的内部**，作为一个可见节点。它完整掌握用户的布局、活跃智能体和近期错误。

**能力：**
- 关于功能的自然语言问答
- 实时智能体诊断（"为什么智能体 X 慢？"）
- 配置建议（"你的拓扑改成网状会更快"）
- 引导式空间排障走查
- 创建工单并自动附加上下文

**自愈：**

| 场景 | 检测 | 自动处置 |
|----------|-----------|-----------------|
| 智能体死循环 | CPU/token 尖峰 | 用最后一次良好配置杀掉并重启 |
| 渲染掉帧 | FPS 低于阈值 | 降低视觉保真度，建议关闭部分面板 |
| 凭证过期 | API 401 响应 | 提示重新认证，优雅暂停智能体 |
| 通信超时 | 延迟尖峰 | 通过备用路径重路由消息 |

### 新客引导流程

基于用户画像的自适应引导：

| AI 经验 | 空间经验 | 路径 |
|---------------|-------------------|------|
| 低 | 低 | 完整引导之旅（20 分钟） |
| 高 | 低 | 聚焦空间（12 分钟） |
| 低 | 高 | 聚焦智能体（12 分钟） |
| 高 | 高 | 快速设置（5 分钟） |

关键第一步：在任何产品交互前先做 60 秒空间校准（手部追踪、注视、舒适度检查）。

**激活里程碑**（达成以下条件即视为"完成引导"）：
- 创建过至少一个自定义智能体
- 在拓扑中连接过两个及以上智能体
- 锚定过至少一个监控仪表盘
- 回来进行第三次会话

### 团队搭建

| 阶段 | 编制 | 角色 |
|-------|-----------|-------|
| 第 0-6 个月 | 4 人 | CX 负责人、2 名支持工程师、技术写作 |
| 第 6-12 个月 | 8 人 | 加：2 名支持工程师、CSE、社区经理、运营分析 |
| 第 12-24 个月 | 16 人 | 加：4 名工程师（7x24）、空间专家、集成专家、知识库经理、工程经理 |

### 社区：Discord 优先

```
NEXUS SPATIAL DISCORD
  INFORMATION: #announcements, #changelog, #status
  SUPPORT: #help-getting-started, #help-agents, #help-spatial
  DISCUSSION: #general, #show-your-workspace, #feature-requests
  PLATFORMS: #visionos, #webxr, #api-and-sdk
  EVENTS: office-hours (weekly voice), community-demos (monthly)
  PRO MEMBERS: #pro-lounge, #beta-testing
  ENTERPRISE: per-customer private channels
```

**布道者计划**（"Nexus Navigators"）：5-10 位初始重度用户，授 Navigator 徽章、与产品团队直连 Slack、免费 Pro 档、新功能优先体验、年度峰会。

---

## 7. UX 研究与设计方向

**智能体**：UX Researcher

### 用户画像

**Maya Chen——AI 平台工程师（32 岁，旧金山）**
- 管理 15-30 条活跃智能体工作流，用 n8n + LangSmith
- 40% 的时间花在翻日志排查智能体故障
- 对空间计算持怀疑态度："这东西是真更快，还是只是更酷？"
- 核心诉求：把平均诊断时长从 45 分钟压到 10 分钟以内

**David Okoro——技术产品经理（38 岁，伦敦）**
- 审阅并批准智能体工作流设计，向 C 层汇报
- 因为现有工具要求读代码级细节，他没法真正参与工作流评审
- 核心诉求：不读代码也能理解并讲解智能体架构

**Dr. Amara Osei——研究科学家（45 岁，苏黎世）**
- 设计带 A/B 对比的多智能体研究工作流
- 同一条流水线有 12 个变体，却没有好的对比方式
- 核心诉求：在 3D 空间中并排对比流水线变体

**Jordan Rivera——创意技术专家（27 岁，奥斯汀）**
- 每天用 Vision Pro，做 AI 驱动的艺术装置
- 想要"像乐器而不是仪表盘"的工具
- 核心诉求：快速搭建智能体工作流，并获得即时空间反馈

### 关键发现：调试才是杀手级用例

把运行时追踪叠加到工作流结构上的空间呈现，解决了一个真实且可量化、所有 2D 工具都处理不好的痛点。这个工作流应当拿到最多的设计与工程投入。

### 关键设计洞察

空间对**结构性**任务（摆放、连线、重排节点）有增益，但对**参数型**任务（文字输入、配置）反而添堵。界面必须把空间模式与 2D 模式无缝融合——锚定在空间位置上的 2D 面板。

### 七条设计原则

1. **空间要配得上它的位置**——如果 2D 更清楚，就用 2D。每次评审都问一句："拍扁会不会更好？"
2. **先可扫视，再可细察**——关键信息靠颜色、大小、运动、位置在 2 秒内可感知
3. **免操作是基线**——注视 + 语音覆盖全部读取/导航操作；双手带来精度但不是必需
4. **尊重认知重力**——延展 2D 心智模型（从左到右的流向），不要取代它；z 轴只做分层
5. **渐进式空间复杂度**——新用户从近似 2D 起步；空间能力随信心逐步展开
6. **物理的隐喻，数字的能力**——节点可以"拿起"（物理），也可以复制和做版本（数字）
7. **安静是一种功能**——健康的系统看起来是平静的；颜色与运动只在偏离常态时出现

### 导航范式：四级语义缩放

| 层级 | 你看到什么 |
|-------|-------------|
| 机群视图 | 全部工作流化为抽象形状，按状态着色 |
| 工作流视图 | 带标签与连线的节点图 |
| 节点视图 | 展开的配置、近期输入输出、状态指标 |
| 追踪视图 | 完整执行轨迹，可检查数据 |

### 竞品 UX 摘要

| 能力 | n8n | Flowise | LangSmith | Langflow | Nexus Spatial 目标 |
|-----------|-----|---------|-----------|----------|---------------------|
| 可视化工作流搭建 | A | B+ | N/A | A | A+ (spatial) |
| 调试/追踪 | C+ | C | A | B | A+ (spatial overlay) |
| 监控 | B | C | A | B | A (spatial fleet) |
| 协同 | D | D | C | D | A (spatial co-presence) |
| 大型工作流可扩展性 | C | C | B | C | A (3D space) |

### 无障碍要求

- 每个交互至少可通过两种模态完成
- 不单靠颜色传达任何信息
- 高对比模式、减动效模式、深度压平模式
- 屏幕阅读器兼容，附空间元素描述
- 每 20-30 分钟提示一次会话时长
- 所有核心任务可在坐姿、单手、30 度活动锥内完成

### 研究计划（16 周）

| 阶段 | 周次 | 研究 |
|-------|-------|---------|
| 奠基 | 1-4 | 心智模型访谈（15-20 人）、竞品任务分析 |
| 概念验证 | 5-8 | 绿野仙踪（Wizard-of-Oz）空间原型测试、信息架构 3D 卡片分类 |
| 可用性测试 | 9-14 | 首次使用体验（20 人）、4 周纵向日记研究、结对协同测试 |
| 无障碍审计 | 12-16 | 专家启发式评估、残障用户测试 |

---

## 8. 项目执行计划

**智能体**：Project Shepherd

### 时间线：35 周（2026 年 3 月 9 日——11 月 6 日）

| 阶段 | 周次 | 时长 | 目标 |
|-------|-------|----------|------|
| 发现与研究 | W1-3 | 3 周 | 验证可行性、圈定范围 |
| 奠基 | W4-9 | 6 周 | 核心基础设施、双平台外壳、设计系统 |
| MVP 构建 | W10-19 | 10 周 | 带编排能力的单人智能体指挥中心 |
| Beta | W20-27 | 8 周 | 协同、打磨、加固、50-100 名 Beta 用户 |
| 发布 | W28-31 | 4 周 | App Store + Web 发布、市场营销冲量 |
| 规模化 | W32-35+ | 持续 | 插件市场、高级功能、增长 |

### 关键里程碑：第 12 周（5 月 29 日）

**首次端到端工作流执行**。用户在 3D 中创建并运行一个 3 节点智能体工作流。这是产品证明其核心价值主张的一刻。这一步滑期，下游全部顺延。

### 前 6 个 sprint（65 张工单）

**Sprint 1**（3 月 9-20 日）：VisionOS SDK 审计、WebXR 兼容性矩阵、编排引擎可行性、干系人访谈、两个平台的丢弃式原型。

**Sprint 2**（3 月 23 日 - 4 月 3 日）：架构决策记录、用 MoSCoW 锁定 MVP 范围、PRD v1.0、空间 UI 模式调研、交互模型定义、设计系统启动。

**Sprint 3**（4 月 6-17 日）：Monorepo 搭建、认证服务（OAuth2）、数据库 schema、API 网关、VisionOS Xcode 工程初始化、WebXR 工程初始化、CI/CD 流水线。

**Sprint 4**（4 月 20 日 - 5 月 1 日）：WebSocket 服务器 + 客户端 SDK、空间窗口管理、3D 组件库、手部追踪输入层、团队 CRUD、集成测试。

**Sprint 5**（5 月 4-15 日）：编排引擎核心（Rust）、智能体状态机、节点图渲染器（双平台）、插件接口 v0、OpenAI 提供方插件。

**Sprint 6**（5 月 18-29 日）：工作流持久化 + 版本管理、DAG 执行、实时执行可视化、Anthropic 提供方插件、眼动追踪集成、空间音频。

### 团队分配

5 个小队跨阶段作战：

| 小队 | 核心成员 | 活跃阶段 |
|-------|-------------|---------------|
| 核心架构 | Backend Architect、XR Interface Architect、Senior Dev、VisionOS Engineer | 发现到 MVP |
| 空间体验 | XR Immersive Dev、XR Cockpit Specialist、Metal Engineer、UX Architect、UI Designer | 奠基到 Beta |
| 编排 | AI Engineer、Backend Architect、Senior Dev、API Tester | MVP 到 Beta |
| 平台交付 | Frontend Dev、Mobile App Builder、VisionOS Engineer、DevOps | MVP 到发布 |
| 发布 | Growth Hacker、Content Creator、App Store Optimizer、Visual Storyteller、Brand Guardian | Beta 到规模化 |

### 五大风险

| 风险 | 概率 | 影响 | 缓解 |
|------|------------|--------|------------|
| Apple 拒收 VisionOS 应用 | Medium | Critical | 第 4 周接洽 Apple Developer Relations，第 20 周前完成预审 |
| WebXR 浏览器碎片化 | High | High | 第 1 周建立浏览器支持矩阵，自动化跨浏览器测试 |
| 多用户同步冲突 | Medium | High | 从第一天起用 CRDT 同步（Yjs），奠基阶段做原型 |
| 编排引擎扩展不动 | Medium | Critical | 从第一天起支持水平扩展，第 22 周前完成 10 倍负载测试 |
| RealityKit 扛不住 100+ 节点 | Medium | High | 尽早做性能剖析，实现 LOD 剔除与实例化渲染 |

### 预算：$121,500——$155,500（不含人力）

| 类目 | 预估费用 |
|----------|---------------|
| 云基础设施（35 周） | $35,000 - $45,000 |
| 硬件（3 台 Vision Pro、2 台 Quest 3、Mac Studio） | $17,500 |
| 许可与订阅服务 | $15,000 - $20,000 |
| 外部服务（法务、安全、公关） | $30,000 - $45,000 |
| AI API 成本（开发/测试） | $8,000 |
| 应急预留（15%） | $16,000 - $20,000 |

---

## 9. 空间界面架构

**智能体**：XR Interface Architect

### 指挥剧场

工作区围绕用户组织成一座弧形剧场：

```
                        OVERVIEW CANOPY
                     (pipeline topology)
                    ~~~~~~~~~~~~~~~~~~~~~~~~
                   /                        \
                  /     FOCUS ARC (120 deg)   \
                 /    primary node graph work   \
                /________________________________\
               |                                  |
    LEFT       |        USER POSITION             |       RIGHT
    UTILITY    |        (origin 0,0,0)            |       UTILITY
    RAIL       |                                  |       RAIL
               |__________________________________|
                \                                /
                 \      SHELF (below sightline) /
                  \   agent status, quick tools/
                   \_________________________ /
```

- **聚焦弧**（120 度，1.2-2.0m）：主节点图工作区
- **总览天棚**（上方，2.5-4.0m）：微缩流水线拓扑 + 健康热力图
- **工具栏导轨**（左右两翼）：智能体库、监控、日志
- **置物架**（视线之下，0.8-1.0m）：运行/停止、撤销/重做、快捷工具

### 三层景深系统

| 层 | 景深 | 内容 | 不透明度 |
|-------|-------|---------|---------|
| 前景 | 0.8 - 1.2m | 活动面板、检查器、模态框 | 100% |
| 中景 | 1.2 - 2.5m | 节点图、连线、工作区 | 100% |
| 背景 | 2.5 - 5.0m | 总览地图、环境状态 | 40-70% |

### 3D 中的节点图

**数据朝用户流动**。节点按执行顺序沿 z 轴排布：

```
USER (here)
  z=0.0m   [Output Nodes]     -- Results
  z=0.3m   [Transform Nodes]  -- Processors
  z=0.6m   [Agent Nodes]      -- LLM calls
  z=0.9m   [Retrieval Nodes]  -- RAG, APIs
  z=1.2m   [Input Nodes]      -- Triggers
```

并行分支沿横向（x 轴）展开。条件分支沿纵向（y 轴）展开。

**节点表示（3 个 LOD）：**
- **LOD-0**（静止，>1.5m）：12x8cm 磨砂玻璃矩形，带类型图标、名称、状态辉光
- **LOD-1**（悬停，注视 400ms）：扩展到 14x10cm，露出端口与最近一次运行信息
- **LOD-2**（选中）：滑到前景，扩展为 30x40cm 详情面板，支持实时配置编辑

**连线是发光管道：**
- 静止时直径 4mm，承载数据时 8mm
- 按数据类型着色（白色=文本、青色=结构化、品红=图像、琥珀=音频、绿色=工具调用）
- 动画粒子标示流向与流速
- 同层之间并行超过 3 条时自动捆束

### 七种智能体状态

| 状态 | 边缘辉光 | 内部 | 声音 | 粒子 |
|-------|-----------|----------|-------|-----------|
| 空闲 | 绿色稳定低亮 | 静态磨砂玻璃 | 无 | 无 |
| 排队中 | 琥珀色 1Hz 脉动 | 微弱旋转 | 无 | 输入端缓慢漂移 |
| 运行中 | 蓝色稳定中亮 | 动态流光 | 轻柔空间嗡鸣 | 连线上快速流动 |
| 流式输出中 | 蓝色 + 输出流 | 流光 + 文本碎片 | 嗡鸣 | 文本碎片向前流动 |
| 已完成 | 白色一闪转绿 | 静态 | 完成提示音 | 无 |
| 出错 | 红色 2Hz 脉动 | 红色浸染 | 警报音（一次） | 无 |
| 已暂停 | 琥珀色稳定 | 冻结帧 + 暂停图标 | 无 | 原地冻结 |

### 交互模型

| 动作 | VisionOS | WebXR 手柄 | 语音 |
|--------|----------|-------------------|-------|
| 选中节点 | 注视 + 捏合 | 射线指向 + 扳机 | "Select [name]" |
| 移动节点 | 捏合 + 拖动 | 握持 + 移动 | —— |
| 连接端口 | 捏住端口 + 拖动 | 扳机按住端口 + 拖动 | "Connect [A] to [B]" |
| 平移工作区 | 双手拖动 | 摇杆 | "Pan left/right" |
| 缩放 | 双手张开/捏合 | 摇杆前后推 | "Zoom in/out" |
| 检视节点 | 捏合 + 拉向自身 | 双击扳机 | "Inspect [name]" |
| 运行流水线 | 点按置物架按钮 | 扳机键 | "Run pipeline" |
| 撤销 | 双指双击 | B 键 | "Undo" |

### 协同在场

每位协作者由这些元素呈现：
- **头部代理**：半透明球体带头像，随头部朝向旋转
- **手部代理**：半影手部模型，显示捏合/抓取状态
- **注视锥**：10 度微弱锥体，显示对方看向哪里
- **名牌**：公告牌式渲染，显示当前动作（"正在编辑节点 X"）

**冲突解决**：先到的编辑者获得写锁；后到者看到"被 [姓名] 锁定"，可选择请求访问或复制该节点。

### 自适应布局

| 环境 | 节点尺寸 | 最大 LOD-2 节点数 | 图 Z 轴展开 |
|-------------|-----------|-----------------|----------------|
| VisionOS 窗口 | 4x3cm | 5 | 0.05m/层 |
| VisionOS 沉浸 | 12x8cm | 15 | 0.3m/层 |
| WebXR 桌面 | 120x80px | 8（浮层） | 透视投影 |
| WebXR 沉浸 | 12x8cm | 12 | 0.3m/层 |

### 过渡编排

一切过渡服务于寻路。重大过渡最多 600ms，次要 200ms，选中 0ms。

| 过渡 | 时长 | 关键动作 |
|-----------|----------|------------|
| 总览到聚焦 | 600ms | 相机漂移到目标，其余区域淡到 30% |
| 聚焦到详情 | 500ms | 节点前滑、展开、连线高亮 |
| 详情到总览 | 600ms | 面板收拢、节点退回、完整拓扑可见 |
| 区域切换 | 500ms | 当前区域侧滑出，新区域侧滑入 |
| 窗口到沉浸 | 1000ms | 边界消融、节点扩展到完整空间位置 |

### 舒适度措施

- 未经用户操作绝不启动相机运动
- 稳定的地平线（水平面永不倾斜）
- 主要交互发生在 0.8-2.5m、视线 +/-15 度以内
- 45 分钟后出现休息提示（环境光变化，非模态）
- 快速移动时出现周边暗角
- 所有高频控件垂手可得（仅手腕/手指）

---

## 10. 跨智能体综合

### 8 个智能体的一致结论

1. **先 2D，后空间**。每个智能体都独立得出了这个结论。先做一个出色的 Web 仪表盘，再逐步叠加空间能力。

2. **调试是杀手级用例**。Product Researcher、UX Researcher 和 XR Interface Architect 在这点上共同收敛：把运行时追踪叠加到工作流结构上，是 3D 真正胜过 2D 的地方。

3. **初期靠 WebXR 而非 VisionOS 触达**。Vision Pro 约 100 万的装机量撑不起一门生意。浏览器里的 WebXR 才是发行解锁点。

4. **"作战室"协同场景**。多个智能体都把协同式事故响应（incident response）列为最强的空间价值主张——团队进入共享 3D 空间，一起调试一条挂掉的流水线。

5. **渐进披露是必需品**。UX 研究、空间 UI 与支持三方都强调：空间复杂度必须逐步展开，绝不能一股脑砸向首次使用的用户。

6. **语音是高级用户的加速器**。UX Researcher 和 XR Interface Architect 都把语音命令定位为"空间计算的命令行"——对无障碍和专家效率都不可或缺。

### 待解决的关键张力

| 张力 | 立场 A | 立场 B | 需要的裁决 |
|---------|-----------|-----------|-------------------|
| **定价** | Growth Hacker：$29-59/用户/月 | Trend Researcher：$99-249/用户/月 | Beta 期做 A/B 测试 |
| **VisionOS 优先级** | 架构：阶段 3（第 13 周起） | 空间 UI：完整规范就绪 | 先做 WebXR，验证后再做 VisionOS |
| **编排语言** | 架构：Rust | 项目计划：未指定 | 对性能关键的 DAG 执行而言 Rust 是对的 |
| **MVP 范围** | 架构：阶段 1 只做 2D | 品牌：以空间为主打 | 先 2D，但每个演示都要带上空间 |
| **社区平台** | 支持：Discord 优先 | 市场营销：Discord + 开源 | 两者都要——Discord 做社区，GitHub 做开发者运营 |

### 这场演练证明了什么

这份发现文档由 8 个专业智能体并行产出，每个都把自己的领域纵深带到了同一个目标上。它们独立得出了彼此一致的结论，同时挖出了任何单个通才都难以产出的领域洞察：

- **Product Trend Researcher** 找到了令人清醒的 Vision Pro 销量数据，直接重塑了整个战略
- **Backend Architect** 设计了 Rust 编排引擎——这是营销导向的团队根本不会考虑的方案
- **Brand Guardian** 创造了一个新品类（"SpatialAIOps"）而不是在既有品类里硬挤
- **UX Researcher** 发现空间计算在参数型任务上反而添堵——一个反直觉的结论
- **XR Interface Architect** 设计了"数据朝你流来"的拓扑，契合天然的空间认知
- **Project Shepherd** 找出了三个可能拖垮整条时间线的关键瓶颈角色
- **Growth Hacker** 设计了专属于空间计算可分享性的病毒循环
- **Support Responder** 把产品自身的 AI 能力变成了支持层面的差异化优势

最终成果是一份全面的、跨职能的产品计划，足以作为实际开发的蓝本——由一整个 AI 智能体代理公司在单次会话中协同完成。