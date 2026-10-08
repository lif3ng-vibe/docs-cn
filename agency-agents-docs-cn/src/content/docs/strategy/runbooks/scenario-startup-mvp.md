---
title: '🚀 Runbook：创业公司 MVP 构建'
---

# 🚀 Runbook：创业公司 MVP 构建

> **模式**：NEXUS-Sprint | **周期**：4-6 周 | **智能体**：18-22 个

---

## 场景

你在构建一个创业公司 MVP——一个需要快速验证产品市场契合度的新产品。速度固然重要，质量同样不能丢。你需要在 4-6 周内从想法走到有真实用户在用的上线产品。

## 智能体名册（roster）

### 核心团队（常驻）
| 智能体 | 职责 |
|-------|------|
| Agents Orchestrator | 流水线控制器 |
| 高级项目经理 | 规格到任务的转换 |
| Sprint 优先级排序师 | 待办事项管理 |
| UX 架构师 | 技术底座 |
| Frontend Developer | UI 实现 |
| Backend Architect | API 与数据库 |
| DevOps Automator | CI/CD 与部署 |
| 证据收集员 | 每个任务的 QA |
| 现实核查员 | 最终质量关卡 |

### 增长团队（第 3 周起激活）
| 智能体 | 职责 |
|-------|------|
| Growth Hacker | 获客策略 |
| 内容创作者 | 上线内容 |
| 社交媒体策略师 | 社交活动 |

### 支持团队（按需）
| 智能体 | 职责 |
|-------|------|
| 品牌守护者 | 品牌识别 |
| 分析报告专员 | 指标与仪表盘 |
| Rapid Prototyper | 快速验证实验 |
| AI Engineer | 产品含 AI 功能时使用 |
| 性能基准测试员 | 上线前压力测试 |
| 基础设施维护专员 | 生产环境搭建 |

## 逐周执行

### 第 1 周：发现 + 架构（第 0 阶段 + 第 1 阶段压缩）

```
Day 1-2: Compressed Discovery
├── Trend Researcher → Quick competitive scan (1 day, not full report)
├── UX Architect → Wireframe key user flows
└── Senior Project Manager → Convert spec to task list

Day 3-4: Architecture
├── UX Architect → CSS design system + component architecture
├── Backend Architect → System architecture + database schema
├── Brand Guardian → Quick brand foundation (colors, typography, voice)
└── Sprint Prioritizer → RICE-scored backlog + sprint plan

Day 5: Foundation Setup
├── DevOps Automator → CI/CD pipeline + environments
├── Frontend Developer → Project scaffolding
├── Backend Architect → Database + API scaffold
└── Quality Gate: Architecture Package approved
```

### 第 2-3 周：核心构建（第 2 阶段 + 第 3 阶段）

```
Sprint 1 (Week 2):
├── Agents Orchestrator manages Dev↔QA loop
├── Frontend Developer → Core UI (auth, main views, navigation)
├── Backend Architect → Core API (auth, CRUD, business logic)
├── Evidence Collector → QA every completed task
├── AI Engineer → ML features if applicable
└── Sprint Review at end of week

Sprint 2 (Week 3):
├── Continue Dev↔QA loop for remaining features
├── Growth Hacker → Design viral mechanics + referral system
├── Content Creator → Begin launch content creation
├── Analytics Reporter → Set up tracking and dashboards
└── Sprint Review at end of week
```

### 第 4 周：打磨 + 加固（第 4 阶段）

```
Day 1-2: Quality Sprint
├── Evidence Collector → Full screenshot suite
├── Performance Benchmarker → Load testing
├── Frontend Developer → Fix QA issues
├── Backend Architect → Fix API issues
└── Brand Guardian → Brand consistency audit

Day 3-4: Reality Check
├── Reality Checker → Final integration testing
├── Infrastructure Maintainer → Production readiness
└── DevOps Automator → Production deployment prep

Day 5: Gate Decision
├── Reality Checker verdict
├── IF NEEDS WORK: Quick fix cycle (2-3 days)
├── IF READY: Proceed to launch
└── Executive Summary Generator → Stakeholder briefing
```

### 第 5-6 周：上线 + 增长（第 5 阶段）

```
Week 5: Launch
├── DevOps Automator → Production deployment
├── Growth Hacker → Activate acquisition channels
├── Content Creator → Publish launch content
├── Social Media Strategist → Cross-platform campaign
├── Analytics Reporter → Real-time monitoring
└── Support Responder → User support active

Week 6: Optimize
├── Growth Hacker → Analyze and optimize channels
├── Feedback Synthesizer → Collect early user feedback
├── Experiment Tracker → Launch A/B tests
├── Analytics Reporter → Week 1 analysis
└── Sprint Prioritizer → Plan iteration sprint
```

## 关键决策

| 决策点 | 时机 | 决策者 |
|---------------|------|-------------|
| 概念是否继续（Go/No-Go） | 第 2 天结束时 | 工作室制作人 |
| 架构审批 | 第 4 天结束时 | 高级项目经理 |
| MVP 功能范围 | sprint 规划时 | Sprint 优先级排序师 |
| 生产就绪判定 | 第 4 周第 5 天 | 现实核查员 |
| 上线时机 | 现实核查员给出 READY 之后 | 工作室制作人 |

## 成功标准

| 指标 | 目标 |
|--------|--------|
| 产品上线周期 | ≤ 6 周 |
| 核心功能完成度 | MVP 范围的 100% |
| 首批用户入驻 | 上线后 48 小时内 |
| 系统可用性 | 首周 > 99% |
| 收集到的用户反馈 | 前 2 周 ≥ 50 条 |

## 常见陷阱与对策

| 陷阱 | 对策 |
|---------|-----------|
| 构建期间范围蔓延 | Sprint 优先级排序师执行 MoSCoW——"Won't" 就是坚决不做 |
| 为规模过度设计 | 用 Rapid Prototyper 的思路——先验证，再扩展 |
| 为赶速度跳过 QA | 证据收集员对每个任务都跑——没有例外 |
| 不带监控就上线 | 基础设施维护专员在第 1 周就把监控搭好 |
| 缺少反馈机制 | 分析与反馈收集内置于 Sprint 1 |