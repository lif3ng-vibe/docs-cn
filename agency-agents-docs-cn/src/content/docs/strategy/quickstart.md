---
title: '⚡ NEXUS 快速上手指南'
---

> **5 分钟内从零开始，跑通一条编排就绪的多智能体流水线。**

---

## NEXUS 是什么？

**NEXUS**（Network of EXperts, Unified in Strategy）把代理公司（The Agency）的 AI 专家们整合成一条协调运转的流水线。你不再需要一次只激活一个智能体、然后指望它们自行配合——NEXUS 明确界定谁在什么时间做什么，以及每一步如何验证质量。

## 选择你的模式

| 我想…… | 使用 | 智能体 | 时间 |
|-------------|-----|--------|------|
| 从零构建一个完整产品 | **NEXUS-Full** | 全部 | 12-24 周 |
| 构建一个功能或 MVP | **NEXUS-Sprint** | 15-25 个 | 2-6 周 |
| 完成一个具体任务（修 bug、营销活动、审计） | **NEXUS-Micro** | 5-10 个 | 1-5 天 |

---

## 🚀 NEXUS-Full：启动完整项目

**复制这段提示词，激活完整流水线**：

```
Activate Agents Orchestrator in NEXUS-Full mode.

Project: [YOUR PROJECT NAME]
Specification: [DESCRIBE YOUR PROJECT OR LINK TO SPEC]

Execute the complete NEXUS pipeline:
- Phase 0: Discovery (Trend Researcher, Feedback Synthesizer, UX Researcher, Analytics Reporter, Legal Compliance Checker, Tool Evaluator)
- Phase 1: Strategy (Studio Producer, Senior Project Manager, Sprint Prioritizer, UX Architect, Brand Guardian, Backend Architect, Finance Tracker)
- Phase 2: Foundation (DevOps Automator, Frontend Developer, Backend Architect, UX Architect, Infrastructure Maintainer)
- Phase 3: Build (Dev↔QA loops — all engineering + Evidence Collector)
- Phase 4: Harden (Reality Checker, Performance Benchmarker, API Tester, Legal Compliance Checker)
- Phase 5: Launch (Growth Hacker, Content Creator, all marketing agents, DevOps Automator)
- Phase 6: Operate (Analytics Reporter, Infrastructure Maintainer, Support Responder, ongoing)

Quality gates between every phase. Evidence required for all assessments.
Maximum 3 retries per task before escalation.
```

---

## 🏃 NEXUS-Sprint：构建功能或 MVP

**复制这段提示词**：

```
Activate Agents Orchestrator in NEXUS-Sprint mode.

Feature/MVP: [DESCRIBE WHAT YOU'RE BUILDING]
Timeline: [TARGET WEEKS]
Skip Phase 0 (market already validated).

Sprint team:
- PM: Senior Project Manager, Sprint Prioritizer
- Design: UX Architect, Brand Guardian
- Engineering: Frontend Developer, Backend Architect, DevOps Automator
- QA: Evidence Collector, Reality Checker, API Tester
- Support: Analytics Reporter

Begin at Phase 1 with architecture and sprint planning.
Run Dev↔QA loops for all implementation tasks.
Reality Checker approval required before launch.
```

---

## 🎯 NEXUS-Micro：完成一个具体任务

**选择你的场景，复制对应提示词**：

### 修复 bug
```
Activate Backend Architect to investigate and fix [BUG DESCRIPTION].
After fix, activate API Tester to verify the fix.
Then activate Evidence Collector to confirm no visual regressions.
```

### 开展一次营销活动
```
Activate Social Media Strategist as campaign lead for [CAMPAIGN DESCRIPTION].
Team: Content Creator, Twitter Engager, Instagram Curator, Reddit Community Builder.
Brand Guardian reviews all content before publishing.
Analytics Reporter tracks performance daily.
Growth Hacker optimizes channels weekly.
```

### 开展合规审计
```
Activate Legal Compliance Checker for comprehensive compliance audit.
Scope: [GDPR / CCPA / HIPAA / ALL]
After audit, activate Executive Summary Generator to create stakeholder report.
```

### 排查性能问题
```
Activate Performance Benchmarker to diagnose performance issues.
Scope: [API response times / Page load / Database queries / All]
After diagnosis, activate Infrastructure Maintainer for optimization.
DevOps Automator deploys any infrastructure changes.
```

### 市场调研
```
Activate Trend Researcher for market intelligence on [DOMAIN].
Deliverables: Competitive landscape, market sizing, trend forecast.
After research, activate Executive Summary Generator for executive brief.
```

### UX 改进
```
Activate UX Researcher to identify usability issues in [FEATURE/PRODUCT].
After research, activate UX Architect to design improvements.
Frontend Developer implements changes.
Evidence Collector verifies improvements.
```

---

## 📁 战略文档

| 文档 | 用途 | 位置 |
|----------|---------|----------|
| **主战略** | 完整的 NEXUS 纲领 | `strategy/nexus-strategy.md` |
| **第 0 阶段 playbook** | 发现与情报 | `strategy/playbooks/phase-0-discovery.md` |
| **第 1 阶段 playbook** | 战略与架构 | `strategy/playbooks/phase-1-strategy.md` |
| **第 2 阶段 playbook** | 奠基与脚手架 | `strategy/playbooks/phase-2-foundation.md` |
| **第 3 阶段 playbook** | 构建与迭代 | `strategy/playbooks/phase-3-build.md` |
| **第 4 阶段 playbook** | 质量与加固 | `strategy/playbooks/phase-4-hardening.md` |
| **第 5 阶段 playbook** | 发布与增长 | `strategy/playbooks/phase-5-launch.md` |
| **第 6 阶段 playbook** | 运营与演进 | `strategy/playbooks/phase-6-operate.md` |
| **激活提示词** | 开箱即用的智能体提示词 | `strategy/coordination/agent-activation-prompts.md` |
| **交接模板** | 标准化的交接格式 | `strategy/coordination/handoff-templates.md` |
| **初创 MVP runbook** | 4-6 周 MVP 构建 | `strategy/runbooks/scenario-startup-mvp.md` |
| **企业功能 runbook** | 企业级功能开发 | `strategy/runbooks/scenario-enterprise-feature.md` |
| **营销活动 runbook** | 多渠道营销活动 | `strategy/runbooks/scenario-marketing-campaign.md` |
| **事故响应 runbook** | 生产事故处理 | `strategy/runbooks/scenario-incident-response.md` |

---

## 🔑 30 秒掌握关键概念

1. **质量关卡**——没有基于证据的批准，任何阶段都不得推进
2. **Dev↔QA 循环**——每个任务先构建再测试；PASS 才继续，FAIL 则重试（最多 3 次）
3. **交接**——智能体之间结构化的上下文传递（绝不冷启动）
4. **Reality Checker**——最终质量裁决者；默认判定为 "NEEDS WORK"
5. **Agents Orchestrator**——统筹整条流水线的控制器
6. **证据优先于断言**——要截图、测试结果和数据，不要口头保证

---

## 🎭 智能体一览

```
ENGINEERING         │ DESIGN              │ MARKETING
Frontend Developer  │ UI Designer         │ Growth Hacker
Backend Architect   │ UX Researcher       │ Content Creator
Mobile App Builder  │ UX Architect        │ Twitter Engager
AI Engineer         │ Brand Guardian      │ TikTok Strategist
DevOps Automator    │ Visual Storyteller  │ Instagram Curator
Rapid Prototyper    │ Whimsy Injector     │ Reddit Community Builder
Senior Developer    │ Image Prompt Eng.   │ App Store Optimizer
                    │                     │ Social Media Strategist
────────────────────┼─────────────────────┼──────────────────────
PRODUCT             │ PROJECT MGMT        │ TESTING
Sprint Prioritizer  │ Studio Producer     │ Evidence Collector
Trend Researcher    │ Project Shepherd    │ Reality Checker
Feedback Synthesizer│ Studio Operations   │ Test Results Analyzer
                    │ Experiment Tracker  │ Performance Benchmarker
                    │ Senior Project Mgr  │ API Tester
                    │                     │ Tool Evaluator
                    │                     │ Workflow Optimizer
────────────────────┼─────────────────────┼──────────────────────
SUPPORT             │ SPATIAL             │ SPECIALIZED
Support Responder   │ XR Interface Arch.  │ Agents Orchestrator
Analytics Reporter  │ macOS Spatial/Metal │ Analytics Reporter
Finance Tracker     │ XR Immersive Dev    │ LSP/Index Engineer
Infra Maintainer    │ XR Cockpit Spec.    │ Sales Data Extraction
Legal Compliance    │ visionOS Spatial    │ Data Consolidation
Exec Summary Gen.   │ Terminal Integration│ Report Distribution
```

---

<div align="center">

**选定一个模式。照着 playbook 执行。相信流水线。**

`strategy/nexus-strategy.md`——完整纲领

</div>