---
title: '🔨 第 3 阶段 playbook——构建与迭代'
---

> **周期**：2-12 周（视范围而定）| **智能体**：15-30+ 个 | **守门人**：Agents Orchestrator

---

## 目标

通过持续的 Dev↔QA 循环实现全部功能。每一项任务都在下一项开始前完成验证。这里是工作量的主体所在——也是 NEXUS 编排创造最大价值的地方。

## 前置条件

- [ ] 第 2 阶段质量关卡已通过（地基已验证）
- [ ] Sprint Prioritizer 待办清单可用，含 RICE 评分
- [ ] CI/CD 流水线已可运行
- [ ] 设计系统与组件库已就绪
- [ ] 带鉴权系统的 API 脚手架已就绪

## Dev↔QA 循环——核心机制

Agents Orchestrator 用这个循环管理每一项任务：

```
FOR EACH task IN sprint_backlog (ordered by RICE score):

  1. ASSIGN task to appropriate Developer Agent (see assignment matrix)
  2. Developer IMPLEMENTS task
  3. Evidence Collector TESTS task
     - Visual screenshots (desktop, tablet, mobile)
     - Functional verification against acceptance criteria
     - Brand consistency check
  4. IF verdict == PASS:
       Mark task complete
       Move to next task
     ELIF verdict == FAIL AND attempts < 3:
       Send QA feedback to Developer
       Developer FIXES specific issues
       Return to step 3
     ELIF attempts >= 3:
       ESCALATE to Agents Orchestrator
       Orchestrator decides: reassign, decompose, defer, or accept
  5. UPDATE pipeline status report
```

## 智能体分配矩阵

### 主力开发分配

| 任务类别 | 主力智能体 | 备选智能体 | QA 智能体 |
|--------------|--------------|-------------|----------|
| **React/Vue/Angular 界面** | Frontend Developer | Rapid Prototyper | Evidence Collector |
| **REST/GraphQL API** | Backend Architect | Senior Developer | API Tester |
| **数据库操作** | Backend Architect | — | API Tester |
| **移动端（iOS/Android）** | Mobile App Builder | — | Evidence Collector |
| **ML 模型/流水线** | AI Engineer | — | Test Results Analyzer |
| **CI/CD/基础设施** | DevOps Automator | Infrastructure Maintainer | Performance Benchmarker |
| **高端/复杂功能** | Senior Developer | Backend Architect | Evidence Collector |
| **快速原型/POC** | Rapid Prototyper | Frontend Developer | Evidence Collector |
| **WebXR/沉浸式** | XR Immersive Developer | — | Evidence Collector |
| **visionOS** | visionOS Spatial Engineer | macOS Spatial/Metal Engineer | Evidence Collector |
| **座舱交互界面** | XR Cockpit Interaction Specialist | XR Interface Architect | Evidence Collector |
| **CLI/终端工具** | Terminal Integration Specialist | — | API Tester |
| **代码智能** | LSP/Index Engineer | — | Test Results Analyzer |
| **性能优化** | Performance Benchmarker | Infrastructure Maintainer | Performance Benchmarker |

### 专家支援（按需激活）

| 专家 | 何时激活 | 触发条件 |
|-----------|-----------------|---------|
| UI Designer | 组件需要视觉打磨 | 开发者请求设计指导 |
| Whimsy Injector | 功能需要趣味/个性 | UX 评审发现机会 |
| Visual Storyteller | 需要视觉叙事内容 | 内容需要视觉素材 |
| Brand Guardian | 品牌一致性存疑 | QA 发现品牌偏离 |
| XR Interface Architect | 需要空间交互设计 | XR 功能需要 UX 指导 |
| Analytics Reporter | 需要深度数据分析 | 功能需要埋点分析集成 |

## 并行构建轨道

在 NEXUS-Full 部署中，四条轨道同时推进：

### 轨道 A：核心产品开发
```
Managed by: Agents Orchestrator (Dev↔QA loop)
Agents: Frontend Developer, Backend Architect, AI Engineer,
        Mobile App Builder, Senior Developer
QA: Evidence Collector, API Tester, Test Results Analyzer

Sprint cadence: 2-week sprints
Daily: Task implementation + QA validation
End of sprint: Sprint review + retrospective
```

### 轨道 B：增长与营销筹备
```
Managed by: Project Shepherd
Agents: Growth Hacker, Content Creator, Social Media Strategist,
        App Store Optimizer

Sprint cadence: Aligned with Track A milestones
Activities:
- Growth Hacker → Design viral loops and referral mechanics
- Content Creator → Build launch content pipeline
- Social Media Strategist → Plan cross-platform campaign
- App Store Optimizer → Prepare store listing (if mobile)
```

### 轨道 C：质量与运营
```
Managed by: Agents Orchestrator
Agents: Evidence Collector, API Tester, Performance Benchmarker,
        Workflow Optimizer, Experiment Tracker

Continuous activities:
- Evidence Collector → Screenshot QA for every task
- API Tester → Endpoint validation for every API task
- Performance Benchmarker → Periodic load testing
- Workflow Optimizer → Process improvement identification
- Experiment Tracker → A/B test setup for validated features
```

### 轨道 D：品牌与体验打磨
```
Managed by: Brand Guardian
Agents: UI Designer, Brand Guardian, Visual Storyteller,
        Whimsy Injector

Triggered activities:
- UI Designer → Component refinement when QA identifies visual issues
- Brand Guardian → Periodic brand consistency audit
- Visual Storyteller → Visual narrative assets as features complete
- Whimsy Injector → Micro-interactions and delight moments
```

## sprint 执行模板

### sprint 规划（第 1 天）

```
Sprint Prioritizer activates:
1. Review backlog with updated RICE scores
2. Select tasks for sprint based on team velocity
3. Assign tasks to developer agents
4. Identify dependencies and ordering
5. Set sprint goal and success criteria

Output: Sprint Plan with task assignments
```

### 每日执行（第 2 天至第 N-1 天）

```
Agents Orchestrator manages:
1. Current task status check
2. Dev↔QA loop execution
3. Blocker identification and resolution
4. Progress tracking and reporting

Status report format:
- Tasks completed today: [list]
- Tasks in QA: [list]
- Tasks in development: [list]
- Blocked tasks: [list with reason]
- QA pass rate: [X/Y]
```

### sprint 评审（第 N 天）

```
Project Shepherd facilitates:
1. Demo completed features
2. Review QA evidence for each task
3. Collect stakeholder feedback
4. Update backlog based on learnings

Participants: All active agents + stakeholders
Output: Sprint Review Summary
```

### sprint 回顾

```
Workflow Optimizer facilitates:
1. What went well?
2. What could improve?
3. What will we change next sprint?
4. Process efficiency metrics

Output: Retrospective Action Items
```

## 编排者决策逻辑

### 任务失败处理

```
WHEN task fails QA:
  IF attempt == 1:
    → Send specific QA feedback to developer
    → Developer fixes ONLY the identified issues
    → Re-submit for QA
    
  IF attempt == 2:
    → Send accumulated QA feedback
    → Consider: Is the developer agent the right fit?
    → Developer fixes with additional context
    → Re-submit for QA
    
  IF attempt == 3:
    → ESCALATE
    → Options:
      a) Reassign to different developer agent
      b) Decompose task into smaller sub-tasks
      c) Revise approach/architecture
      d) Accept with known limitations (document)
      e) Defer to future sprint
    → Document decision and rationale
```

### 并行任务管理

```
WHEN multiple tasks have no dependencies:
  → Assign to different developer agents simultaneously
  → Each runs independent Dev↔QA loop
  → Orchestrator tracks all loops concurrently
  → Merge completed tasks in dependency order

WHEN task has dependencies:
  → Wait for dependency to pass QA
  → Then assign dependent task
  → Include dependency context in handoff
```

## 质量关卡检查清单

| # | 标准 | 证据来源 | 状态 |
|---|-----------|----------------|--------|
| 1 | 全部 sprint 任务通过 QA（100% 完成） | 每项任务的 Evidence Collector 截图 | ☐ |
| 2 | 全部 API 端点已验证 | API Tester 回归报告 | ☐ |
| 3 | 性能基线达标（P95 < 200ms） | Performance Benchmarker 报告 | ☐ |
| 4 | 品牌一致性已验证（95%+ 遵从度） | Brand Guardian 审计 | ☐ |
| 5 | 无关键 bug（P0/P1 清零） | Test Results Analyzer 汇总 | ☐ |
| 6 | 全部验收标准已满足 | 逐项任务核对 | ☐ |
| 7 | 所有 PR 均完成代码评审 | git 历史证据 | ☐ |

## 关卡决策

**守门人**：Agents Orchestrator

- **PASS**：功能完整的应用 → 激活第 4 阶段
- **CONTINUE**：还需更多 sprint → 继续第 3 阶段
- **ESCALATE**：出现系统性问题 → Studio Producer 介入

## 向第 4 阶段交接

```markdown
## Phase 3 → Phase 4 Handoff Package

### For Reality Checker:
- Complete application (all features implemented)
- All QA evidence from Dev↔QA loops
- API Tester regression results
- Performance Benchmarker baseline data
- Brand Guardian consistency audit
- Known issues list (if any accepted limitations)

### For Legal Compliance Checker:
- Data handling implementation details
- Privacy policy implementation
- Consent management implementation
- Security measures implemented

### For Performance Benchmarker:
- Application URLs for load testing
- Expected traffic patterns
- Performance budgets from architecture

### For Infrastructure Maintainer:
- Production environment requirements
- Scaling configuration needs
- Monitoring alert thresholds
```

---

*当全部 sprint 任务通过 QA、全部 API 端点验证完毕、性能基线达标、且没有遗留未解决的关键 bug 时，第 3 阶段即告完成。*