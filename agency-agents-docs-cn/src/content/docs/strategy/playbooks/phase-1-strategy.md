---
title: '🏗️ 第 1 阶段 playbook——战略与架构'
---

# 🏗️ 第 1 阶段 playbook——战略与架构

> **周期**：5-10 天 | **智能体**：8 个 | **守门人**：Studio Producer + Reality Checker

---

## 目标

在写下第一行代码之前，先定义我们要构建什么、如何组织结构、成功是什么样。每一项架构决策都记录在案，每一个功能都排好优先级，每一块钱都有账可查。

## 前置条件

- [ ] 第 0 阶段质量关卡（quality gate）已通过（GO 决策）
- [ ] 已收到第 0 阶段交接包（handoff package）
- [ ] 干系人就项目范围达成一致

## 智能体激活序列

### 第 1 步：战略框定（第 1-3 天，并行）

#### 🎬 Studio Producer——战略组合对齐
```
Activate Studio Producer for strategic portfolio alignment on [PROJECT].

Input: Phase 0 Executive Summary + Market Analysis Report
Deliverables required:
1. Strategic Portfolio Plan with project positioning
2. Vision, objectives, and ROI targets
3. Resource allocation strategy
4. Risk/reward assessment
5. Success criteria and milestone definitions

Align with: Organizational strategic objectives
Format: Strategic Portfolio Plan Template
Timeline: 3 days
```

#### 🎭 Brand Guardian——品牌身份体系
```
Activate Brand Guardian for brand identity development on [PROJECT].

Input: Phase 0 UX Research (personas, journey maps)
Deliverables required:
1. Brand Foundation (purpose, vision, mission, values, personality)
2. Visual Identity System (colors, typography, spacing as CSS variables)
3. Brand Voice and Messaging Architecture
4. Logo system specifications (if new brand)
5. Brand usage guidelines

Format: Brand Identity System Document
Timeline: 3 days
```

#### 💰 Finance Tracker——预算与资源规划
```
Activate Finance Tracker for financial planning on [PROJECT].

Input: Studio Producer strategic plan + Phase 0 Tech Stack Assessment
Deliverables required:
1. Comprehensive project budget with category breakdown
2. Resource cost projections (agents, infrastructure, tools)
3. ROI model with break-even analysis
4. Cash flow timeline
5. Financial risk assessment with contingency reserves

Format: Financial Plan with ROI Projections
Timeline: 2 days
```

### 第 2 步：技术架构（第 3-7 天，并行，待第 1 步产出可用后启动）

#### 🏛️ UX Architect——技术架构 + UX 奠基
```
Activate UX Architect for technical architecture on [PROJECT].

Input: Brand Guardian visual identity + Phase 0 UX Research
Deliverables required:
1. CSS Design System (variables, tokens, scales)
2. Layout Framework (Grid/Flexbox patterns, responsive breakpoints)
3. Component Architecture (naming conventions, hierarchy)
4. Information Architecture (page flow, content hierarchy)
5. Theme System (light/dark/system toggle)
6. Accessibility Foundation (WCAG 2.1 AA baseline)

Files to create:
- css/design-system.css
- css/layout.css
- css/components.css
- docs/ux-architecture.md

Format: Developer-Ready Foundation Package
Timeline: 4 days
```

#### 🏗️ Backend Architect——系统架构
```
Activate Backend Architect for system architecture on [PROJECT].

Input: Phase 0 Tech Stack Assessment + Compliance Requirements
Deliverables required:
1. System Architecture Specification
   - Architecture pattern (microservices/monolith/serverless/hybrid)
   - Communication pattern (REST/GraphQL/gRPC/event-driven)
   - Data pattern (CQRS/Event Sourcing/CRUD)
2. Database Schema Design with indexing strategy
3. API Design Specification with versioning
4. Authentication and Authorization Architecture
5. Security Architecture (defense in depth)
6. Scalability Plan (horizontal scaling strategy)

Format: System Architecture Specification
Timeline: 4 days
```

#### 🤖 AI Engineer——ML 架构（如适用）
```
Activate AI Engineer for ML system architecture on [PROJECT].

Input: Backend Architect system architecture + Phase 0 Data Audit
Deliverables required:
1. ML System Design
   - Model selection and training strategy
   - Data pipeline architecture
   - Inference strategy (real-time/batch/edge)
2. AI Ethics and Safety Framework
3. Model monitoring and retraining plan
4. Integration points with main application
5. Cost projections for ML infrastructure

Condition: Only activate if project includes AI/ML features
Format: ML System Design Document
Timeline: 3 days
```

#### 👔 Senior Project Manager——规格转任务
```
Activate Senior Project Manager for task list creation on [PROJECT].

Input: ALL Phase 0 documents + Architecture specs (as available)
Deliverables required:
1. Comprehensive Task List
   - Quote EXACT requirements from spec (no luxury features)
   - Each task has clear acceptance criteria
   - Dependencies mapped between tasks
   - Effort estimates (story points or hours)
2. Work Breakdown Structure
3. Critical path identification
4. Risk register for implementation

Rules:
- Do NOT add features not in the specification
- Quote exact text from requirements
- Be realistic about effort estimates

Format: Task List with acceptance criteria
Timeline: 3 days
```

### 第 3 步：优先级排序（第 7-10 天，串行，在第 2 步之后）

#### 🎯 Sprint Prioritizer——功能优先级排序
```
Activate Sprint Prioritizer for backlog prioritization on [PROJECT].

Input:
- Senior Project Manager → Task List
- Backend Architect → System Architecture
- UX Architect → UX Architecture
- Finance Tracker → Budget Framework
- Studio Producer → Strategic Plan

Deliverables required:
1. RICE-scored backlog (Reach, Impact, Confidence, Effort)
2. Sprint assignments with velocity-based estimation
3. Dependency map with critical path
4. MoSCoW classification (Must/Should/Could/Won't)
5. Release plan with milestone mapping

Validation: Studio Producer confirms strategic alignment
Format: Prioritized Sprint Plan
Timeline: 2 days
```

## 质量关卡检查清单

| # | 标准 | 证据来源 | 状态 |
|---|-----------|----------------|--------|
| 1 | 架构覆盖 100% 的规格要求 | Senior PM 任务清单与架构交叉核对 | ☐ |
| 2 | 品牌体系完整（logo、色彩、字体排印、语调） | Brand Guardian 交付物 | ☐ |
| 3 | 所有技术组件都有实现路径 | Backend Architect + UX Architect 规格 | ☐ |
| 4 | 预算已批准且未超约束 | Finance Tracker 计划 | ☐ |
| 5 | sprint 计划基于速率且切合实际 | Sprint Prioritizer 待办清单 | ☐ |
| 6 | 安全架构已定义 | Backend Architect 安全规格 | ☐ |
| 7 | 合规要求已并入架构 | 法规要求已映射到技术决策 | ☐ |

## 关卡决策

**需要双重签署放行**：Studio Producer（战略）+ Reality Checker（技术）

- **APPROVED**：携带完整架构包进入第 2 阶段
- **REVISE**：个别条目需要返工（回到相应步骤）
- **RESTRUCTURE**：架构存在根本性问题（重启第 1 阶段）

## 向第 2 阶段交接

```markdown
## Phase 1 → Phase 2 Handoff Package

### Architecture Package:
1. Strategic Portfolio Plan (Studio Producer)
2. Brand Identity System (Brand Guardian)
3. Financial Plan (Finance Tracker)
4. CSS Design System + UX Architecture (UX Architect)
5. System Architecture Specification (Backend Architect)
6. ML System Design (AI Engineer — if applicable)
7. Comprehensive Task List (Senior Project Manager)
8. Prioritized Sprint Plan (Sprint Prioritizer)

### For DevOps Automator:
- Deployment architecture from Backend Architect
- Environment requirements from System Architecture
- Monitoring requirements from Infrastructure needs

### For Frontend Developer:
- CSS Design System from UX Architect
- Brand Identity from Brand Guardian
- Component architecture from UX Architect
- API specification from Backend Architect

### For Backend Architect (continuing):
- Database schema ready for deployment
- API scaffold ready for implementation
- Auth system architecture defined
```

---

*当 Studio Producer 与 Reality Checker 双双在架构包上签署放行时，第 1 阶段即告完成。*