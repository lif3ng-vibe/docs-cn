---
title: '🏢 Runbook：企业级功能开发'
---

> **模式**：NEXUS-Sprint | **周期**：6-12 周 | **智能体**：20-30 个

---

## 场景

你要在现有企业级产品上新增一项重大功能。合规、安全与质量关卡禁不容妥协，多个干系人需要对齐，功能还必须与既有系统无缝集成。

## 智能体名册（roster）

### 核心团队
| 智能体 | 职责 |
|-------|------|
| Agents Orchestrator | 流水线控制器 |
| 项目牧羊人 | 跨职能协调 |
| 高级项目经理 | 规格到任务的转换 |
| Sprint 优先级排序师 | 待办事项管理 |
| UX 架构师 | 技术底座 |
| UX 研究员 | 用户验证 |
| UI 设计师 | 组件设计 |
| Frontend Developer | UI 实现 |
| Backend Architect | API 与系统集成 |
| Senior Developer | 复杂实现 |
| DevOps Automator | CI/CD 与部署 |
| 证据收集员 | 可视化 QA |
| API 测试员 | 端点验证 |
| 现实核查员 | 最终质量关卡 |
| 性能基准测试员 | 压力测试 |

### 合规与治理
| 智能体 | 职责 |
|-------|------|
| 法务合规审查专员 | 监管合规 |
| 品牌守护者 | 品牌一致性 |
| 财务追踪专员 | 预算跟踪 |
| 高管摘要生成器 | 干系人汇报 |

### 质量保障
| 智能体 | 职责 |
|-------|------|
| 测试结果分析师 | 质量指标 |
| 工作流优化师 | 流程改进 |
| 实验追踪员 | A/B 测试 |

## 执行计划

### 第 1 阶段：需求与架构（第 1-2 周）

```
Week 1: Stakeholder Alignment
├── Project Shepherd → Stakeholder analysis + communication plan
├── UX Researcher → User research on feature need
├── Legal Compliance Checker → Compliance requirements scan
├── Senior Project Manager → Spec-to-task conversion
└── Finance Tracker → Budget framework

Week 2: Technical Architecture
├── UX Architect → UX foundation + component architecture
├── Backend Architect → System architecture + integration plan
├── UI Designer → Component design + design system updates
├── Sprint Prioritizer → RICE-scored backlog
├── Brand Guardian → Brand impact assessment
└── Quality Gate: Architecture Review (Project Shepherd + Reality Checker)
```

### 第 2 阶段：奠基（第 3 周）

```
├── DevOps Automator → Feature branch pipeline + feature flags
├── Frontend Developer → Component scaffolding
├── Backend Architect → API scaffold + database migrations
├── Infrastructure Maintainer → Staging environment setup
└── Quality Gate: Foundation verified (Evidence Collector)
```

### 第 3 阶段：构建（第 4-9 周）

```
Sprint 1-3 (Week 4-9):
├── Agents Orchestrator → Dev↔QA loop management
├── Frontend Developer → UI implementation (task by task)
├── Backend Architect → API implementation (task by task)
├── Senior Developer → Complex/premium features
├── Evidence Collector → QA every task (screenshots)
├── API Tester → Endpoint validation every API task
├── Experiment Tracker → A/B test setup for key features
│
├── Bi-weekly:
│   ├── Project Shepherd → Stakeholder status update
│   ├── Executive Summary Generator → Executive briefing
│   └── Finance Tracker → Budget tracking
│
└── Sprint Reviews with stakeholder demos
```

### 第 4 阶段：加固（第 10-11 周）

```
Week 10: Evidence Collection
├── Evidence Collector → Full screenshot suite
├── API Tester → Complete regression suite
├── Performance Benchmarker → Load test at 10x traffic
├── Legal Compliance Checker → Final compliance audit
├── Test Results Analyzer → Quality metrics dashboard
└── Infrastructure Maintainer → Production readiness

Week 11: Final Judgment
├── Reality Checker → Integration testing (default: NEEDS WORK)
├── Fix cycle if needed (2-3 days)
├── Re-verification
└── Executive Summary Generator → Go/No-Go recommendation
```

### 第 5 阶段：上线（第 12 周）

```
├── DevOps Automator → Canary deployment (5% → 25% → 100%)
├── Infrastructure Maintainer → Real-time monitoring
├── Analytics Reporter → Feature adoption tracking
├── Support Responder → User support for new feature
├── Feedback Synthesizer → Early feedback collection
└── Executive Summary Generator → Launch report
```

## 干系人沟通节奏

| 受众 | 频率 | 智能体 | 形式 |
|----------|-----------|-------|--------|
| 高管发起人 | 每两周 | 高管摘要生成器 | SCQA 摘要（≤500 字） |
| 产品团队 | 每周 | 项目牧羊人 | 状态报告 |
| 工程团队 | 每日 | Agents Orchestrator | 流水线状态 |
| 合规团队 | 每月 | 法务合规审查专员 | 合规状态 |
| 财务 | 每月 | 财务追踪专员 | 预算报告 |

## 质量要求

| 要求 | 阈值 | 验证方 |
|-------------|-----------|-------------|
| 代码覆盖率 | > 80% | 测试结果分析师 |
| API 响应时间 | P95 < 200ms | 性能基准测试员 |
| 无障碍 | WCAG 2.1 AA | 证据收集员 |
| 安全 | 零严重漏洞 | 法务合规审查专员 |
| 品牌一致性 | 95%+ 遵循度 | 品牌守护者 |
| 规格符合度 | 100% | 现实核查员 |
| 负载承受力 | 10 倍当前流量 | 性能基准测试员 |

## 风险管理

| 风险 | 概率 | 影响 | 缓解措施 | 责任人 |
|------|------------|--------|-----------|-------|
| 集成复杂度 | 高 | 高 | 尽早集成测试，API 测试员进每个 sprint | Backend Architect |
| 范围蔓延 | 中 | 高 | Sprint 优先级排序师执行 MoSCoW，项目牧羊人管理变更 | Sprint 优先级排序师 |
| 合规问题 | 中 | 严重 | 法务合规审查专员从第 1 天就介入 | 法务合规审查专员 |
| 性能回退 | 中 | 高 | 性能基准测试员每个 sprint 做测试 | 性能基准测试员 |
| 干系人错位 | 低 | 高 | 每两周高管简报，项目牧羊人协调 | 项目牧羊人 |