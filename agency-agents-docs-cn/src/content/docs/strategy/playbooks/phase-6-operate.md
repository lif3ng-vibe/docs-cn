---
title: '🔄 第 6 阶段 playbook——运营与演进'
---

> **周期**：持续进行 | **智能体**：12+ 个（轮换）| **治理**：Studio Producer

---

## 目标

持续运营，不断改进。产品已上线——现在让它茁壮生长。本阶段没有结束日期；只要产品还在市场上，它就一直运转。

## 前置条件

- [ ] 第 5 阶段质量关卡已通过（发布稳定）
- [ ] 已收到第 5 阶段交接包
- [ ] 运营节奏已建立
- [ ] 基线指标已成文

## 运营节奏

### 持续（常驻）

| 智能体 | 职责 | SLA |
|-------|---------------|-----|
| **Infrastructure Maintainer** | 系统在线率、性能、安全 | 99.9% uptime，< 30min MTTR |
| **Support Responder** | 客户支持、问题解决 | < 4hr 首次响应 |
| **DevOps Automator** | 部署流水线、热修复 | 支持每日多次部署 |

### 每日

| 智能体 | 活动 | 产出 |
|-------|----------|--------|
| **Analytics Reporter** | KPI 仪表盘更新 | 每日指标快照 |
| **Support Responder** | 工单分诊与解决 | 支持工单汇总 |
| **Infrastructure Maintainer** | 系统健康检查 | 健康状态报告 |

### 每周

| 智能体 | 活动 | 产出 |
|-------|----------|--------|
| **Analytics Reporter** | 每周绩效分析 | 每周分析报告 |
| **Feedback Synthesizer** | 用户反馈综合 | 每周反馈摘要 |
| **Sprint Prioritizer** | 待办清单梳理 + sprint 规划 | sprint 计划 |
| **Growth Hacker** | 增长渠道优化 | 增长指标报告 |
| **Project Shepherd** | 跨团队协调 | 每周状态更新 |

### 双周

| 智能体 | 活动 | 产出 |
|-------|----------|--------|
| **Feedback Synthesizer** | 深度反馈分析 | 双周洞察报告 |
| **Experiment Tracker** | A/B 测试分析 | 实验结果摘要 |
| **Content Creator** | 内容日历执行 | 已发布内容报告 |

### 每月

| 智能体 | 活动 | 产出 |
|-------|----------|--------|
| **Executive Summary Generator** | 高管层汇报 | 每月高管简报 |
| **Finance Tracker** | 财务表现评审 | 每月财务报告 |
| **Legal Compliance Checker** | 监管动态监测 | 合规状态报告 |
| **Trend Researcher** | 市场情报更新 | 每月市场简报 |
| **Brand Guardian** | 品牌一致性审计 | 品牌健康报告 |

### 每季度

| 智能体 | 活动 | 产出 |
|-------|----------|--------|
| **Studio Producer** | 战略组合评审 | 季度战略评审 |
| **Workflow Optimizer** | 流程效率审计 | 优化报告 |
| **Performance Benchmarker** | 性能回归测试 | 季度性能报告 |
| **Tool Evaluator** | 技术栈评审 | 技术债评估 |

## 持续改进循环

```
MEASURE (Analytics Reporter)
    │
    ▼
ANALYZE (Feedback Synthesizer + Analytics Reporter)
    │
    ▼
PLAN (Sprint Prioritizer + Studio Producer)
    │
    ▼
BUILD (Phase 3 Dev↔QA Loop — mini-cycles)
    │
    ▼
VALIDATE (Evidence Collector + Reality Checker)
    │
    ▼
DEPLOY (DevOps Automator)
    │
    ▼
MEASURE (back to start)
```

### 第 6 阶段的功能开发

新功能走一条压缩版的 NEXUS 循环：

```
1. Sprint Prioritizer selects feature from backlog
2. Appropriate Developer Agent implements
3. Evidence Collector validates (Dev↔QA loop)
4. DevOps Automator deploys (feature flag or direct)
5. Experiment Tracker monitors (A/B test if applicable)
6. Analytics Reporter measures impact
7. Feedback Synthesizer collects user response
```

## 事故响应协议

### 严重度分级

| 级别 | 定义 | 响应时限 | 决策权 |
|-------|-----------|--------------|-------------------|
| **P0——危急** | 服务中断、数据丢失、安全入侵 | 立即 | Studio Producer |
| **P1——高** | 主要功能损坏、显著降级 | < 1 小时 | Project Shepherd |
| **P2——中** | 次要功能问题，有临时绕行方案 | < 4 小时 | Agents Orchestrator |
| **P3——低** | 外观问题、轻微不便 | 下一 sprint | Sprint Prioritizer |

### 事故响应序列

```
DETECTION (Infrastructure Maintainer or Support Responder)
    │
    ▼
TRIAGE (Agents Orchestrator)
    ├── Classify severity (P0-P3)
    ├── Assign response team
    └── Notify stakeholders
    │
    ▼
RESPONSE
    ├── P0: Infrastructure Maintainer + DevOps Automator + Backend Architect
    ├── P1: Relevant Developer Agent + DevOps Automator
    ├── P2: Relevant Developer Agent
    └── P3: Added to sprint backlog
    │
    ▼
RESOLUTION
    ├── Fix implemented and deployed
    ├── Evidence Collector verifies fix
    └── Infrastructure Maintainer confirms stability
    │
    ▼
POST-MORTEM
    ├── Workflow Optimizer leads retrospective
    ├── Root cause analysis documented
    ├── Prevention measures identified
    └── Process improvements implemented
```

## 增长运营

### 每月增长评审（Growth Hacker 主持）

```
1. Channel Performance Analysis
   - Acquisition by channel (organic, paid, referral, social)
   - CAC by channel
   - Conversion rates by funnel stage
   - LTV:CAC ratio trends

2. Experiment Results
   - Completed A/B tests and outcomes
   - Statistical significance validation
   - Winner implementation status
   - New experiment pipeline

3. Retention Analysis
   - Cohort retention curves
   - Churn risk identification
   - Re-engagement campaign results
   - Feature adoption metrics

4. Growth Roadmap Update
   - Next month's growth experiments
   - Channel budget reallocation
   - New channel exploration
   - Viral coefficient optimization
```

### 内容运营（Content Creator + Social Media Strategist）

```
Weekly:
- Content calendar execution
- Social media engagement
- Community management
- Performance tracking

Monthly:
- Content performance review
- Editorial calendar planning
- Platform algorithm updates
- Content strategy refinement

Platform-Specific:
- Twitter Engager → Daily engagement, weekly threads
- Instagram Curator → 3-5 posts/week, daily stories
- TikTok Strategist → 3-5 videos/week
- Reddit Community Builder → Daily authentic engagement
```

## 财务运营

### 每月财务评审（Finance Tracker）

```
1. Revenue Analysis
   - MRR/ARR tracking
   - Revenue by segment/plan
   - Expansion revenue
   - Churn revenue impact

2. Cost Analysis
   - Infrastructure costs
   - Marketing spend by channel
   - Team/resource costs
   - Tool and service costs

3. Unit Economics
   - CAC trends
   - LTV trends
   - LTV:CAC ratio
   - Payback period

4. Forecasting
   - Revenue forecast (3-month rolling)
   - Cost forecast
   - Cash flow projection
   - Budget variance analysis
```

## 合规运营

### 每月合规检查（Legal Compliance Checker）

```
1. Regulatory Monitoring
   - New regulations affecting the product
   - Existing regulation changes
   - Enforcement actions in the industry
   - Compliance deadline tracking

2. Privacy Compliance
   - Data subject request handling
   - Consent management effectiveness
   - Data retention policy adherence
   - Cross-border transfer compliance

3. Security Compliance
   - Vulnerability scan results
   - Patch management status
   - Access control review
   - Incident log review

4. Audit Readiness
   - Documentation currency
   - Evidence collection status
   - Training completion rates
   - Policy acknowledgment tracking
```

## 战略演进

### 季度战略评审（Studio Producer）

```
1. Market Position Assessment
   - Competitive landscape changes (Trend Researcher input)
   - Market share evolution
   - Brand perception (Brand Guardian input)
   - Customer satisfaction trends (Feedback Synthesizer input)

2. Product Strategy
   - Feature roadmap review
   - Technology debt assessment (Tool Evaluator input)
   - Platform expansion opportunities
   - Partnership evaluation

3. Growth Strategy
   - Channel effectiveness review
   - New market opportunities
   - Pricing strategy assessment
   - Expansion planning

4. Organizational Health
   - Process efficiency (Workflow Optimizer input)
   - Team performance metrics
   - Resource allocation optimization
   - Capability development needs

Output: Quarterly Strategic Review → Updated roadmap and priorities
```

## 第 6 阶段成功指标

| 类别 | 指标 | 目标 | 负责人 |
|----------|--------|--------|-------|
| **可靠性** | 系统在线率 | > 99.9% | Infrastructure Maintainer |
| **可靠性** | MTTR | < 30 分钟 | Infrastructure Maintainer |
| **增长** | 用户月增长（MoM） | > 20% | Growth Hacker |
| **增长** | 激活率 | > 60% | Analytics Reporter |
| **留存** | 第 7 天留存率 | > 40% | Analytics Reporter |
| **留存** | 第 30 天留存率 | > 20% | Analytics Reporter |
| **财务** | LTV:CAC 比率 | > 3:1 | Finance Tracker |
| **财务** | 组合 ROI | > 25% | Studio Producer |
| **质量** | NPS 评分 | > 50 | Feedback Synthesizer |
| **质量** | 支持解决时长 | < 4 小时 | Support Responder |
| **合规** | 监管遵循度 | > 98% | Legal Compliance Checker |
| **效率** | 部署频率 | 每日多次 | DevOps Automator |
| **效率** | 流程改进 | 每季度 20% | Workflow Optimizer |

---

*第 6 阶段没有结束日期。只要产品还在市场上，它就持续运转，靠一轮轮持续改进循环推动产品向前。遇到重大新功能或战略转向时，可以重新激活 NEXUS 流水线（NEXUS-Sprint 或 NEXUS-Micro）。*