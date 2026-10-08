---
title: '🚨 Runbook：事故响应'
---

> **模式**：NEXUS-Micro | **周期**：数分钟到数小时 | **智能体**：3-8 个

---

## 场景

生产环境出了问题，用户受到了影响。响应速度固然重要，但把事做对同样重要。本 runbook 覆盖从发现到复盘的全过程。

## 严重程度分级

| 等级 | 定义 | 示例 | 响应时限 |
|-------|-----------|----------|--------------|
| **P0——严重** | 服务完全中断、数据丢失、安全入侵 | 数据库损坏、DDoS 攻击、认证系统故障 | 立即响应（全员上阵） |
| **P1——高** | 重大功能不可用、性能显著劣化 | 支付处理中断、错误率 50%+、延迟 10 倍 | < 1 小时 |
| **P2——中** | 次要功能不可用、有临时替代方案 | 搜索失效、非关键 API 报错 | < 4 小时 |
| **P3——低** | 外观问题、轻微不便 | 样式 bug、错别字、轻微 UI 故障 | 下一个 sprint |

## 按严重程度组建的响应团队

### P0——严重响应团队
| 智能体 | 职责 | 动作 |
|-------|------|--------|
| **基础设施维护专员** | 事故指挥官 | 评估影响范围，统筹响应 |
| **DevOps Automator** | 部署/回滚 | 必要时执行回滚 |
| **Backend Architect** | 根因排查 | 诊断系统问题 |
| **Frontend Developer** | UI 侧排查 | 诊断客户端问题 |
| **客户支持响应专员** | 用户沟通 | 更新状态页、通知用户 |
| **高管摘要生成器** | 干系人沟通 | 实时向高管通报 |

### P1——高响应团队
| 智能体 | 职责 |
|-------|------|
| **基础设施维护专员** | 事故指挥官 |
| **DevOps Automator** | 部署支持 |
| **相关开发智能体** | 修复实现 |
| **客户支持响应专员** | 用户沟通 |

### P2——中响应
| 智能体 | 职责 |
|-------|------|
| **相关开发智能体** | 修复实现 |
| **证据收集员** | 验证修复 |

### P3——低响应
| 智能体 | 职责 |
|-------|------|
| **Sprint 优先级排序师** | 加入待办事项 |

## 事故响应流程

### 第 1 步：发现与分诊（0-5 分钟）

```
TRIGGER: Alert from monitoring / User report / Agent detection

Infrastructure Maintainer:
1. Acknowledge alert
2. Assess scope and impact
   - How many users affected?
   - Which services are impacted?
   - Is data at risk?
3. Classify severity (P0/P1/P2/P3)
4. Activate appropriate response team
5. Create incident channel/thread

Output: Incident classification + response team activated
```

### 第 2 步：排查（5-30 分钟）

```
PARALLEL INVESTIGATION:

Infrastructure Maintainer:
├── Check system metrics (CPU, memory, network, disk)
├── Review error logs
├── Check recent deployments
└── Verify external dependencies

Backend Architect (if P0/P1):
├── Check database health
├── Review API error rates
├── Check service communication
└── Identify failing component

DevOps Automator:
├── Review recent deployment history
├── Check CI/CD pipeline status
├── Prepare rollback if needed
└── Verify infrastructure state

Output: Root cause identified (or narrowed to component)
```

### 第 3 步：止损（15-60 分钟）

```
DECISION TREE:

IF caused by recent deployment:
  → DevOps Automator: Execute rollback
  → Infrastructure Maintainer: Verify recovery
  → Evidence Collector: Confirm fix

IF caused by infrastructure issue:
  → Infrastructure Maintainer: Scale/restart/failover
  → DevOps Automator: Support infrastructure changes
  → Verify recovery

IF caused by code bug:
  → Relevant Developer Agent: Implement hotfix
  → Evidence Collector: Verify fix
  → DevOps Automator: Deploy hotfix
  → Infrastructure Maintainer: Monitor recovery

IF caused by external dependency:
  → Infrastructure Maintainer: Activate fallback/cache
  → Support Responder: Communicate to users
  → Monitor for external recovery

THROUGHOUT:
  → Support Responder: Update status page every 15 minutes
  → Executive Summary Generator: Brief stakeholders (P0 only)
```

### 第 4 步：恢复验证（修复完成后）

```
Evidence Collector:
1. Verify the fix resolves the issue
2. Screenshot evidence of working state
3. Confirm no new issues introduced

Infrastructure Maintainer:
1. Verify all metrics returning to normal
2. Confirm no cascading failures
3. Monitor for 30 minutes post-fix

API Tester (if API-related):
1. Run regression on affected endpoints
2. Verify response times normalized
3. Confirm error rates at baseline

Output: Incident resolved confirmation
```

### 第 5 步：复盘（48 小时内）

```
Workflow Optimizer leads post-mortem:

1. Timeline reconstruction
   - When was the issue introduced?
   - When was it detected?
   - When was it resolved?
   - Total user impact duration

2. Root cause analysis
   - What failed?
   - Why did it fail?
   - Why wasn't it caught earlier?
   - 5 Whys analysis

3. Impact assessment
   - Users affected
   - Revenue impact
   - Reputation impact
   - Data impact

4. Prevention measures
   - What monitoring would have caught this sooner?
   - What testing would have prevented this?
   - What process changes are needed?
   - What infrastructure changes are needed?

5. Action items
   - [Action] → [Owner] → [Deadline]
   - [Action] → [Owner] → [Deadline]
   - [Action] → [Owner] → [Deadline]

Output: Post-Mortem Report → Sprint Prioritizer adds prevention tasks to backlog
```

## 沟通模板

### 状态页更新（客户支持响应专员）
```
[TIMESTAMP] — [SERVICE NAME] Incident

Status: [Investigating / Identified / Monitoring / Resolved]
Impact: [Description of user impact]
Current action: [What we're doing about it]
Next update: [When to expect the next update]
```

### 高管通报（高管摘要生成器——仅限 P0）
```
INCIDENT BRIEF — [TIMESTAMP]

SITUATION: [Service] is [down/degraded] affecting [N users/% of traffic]
CAUSE: [Known/Under investigation] — [Brief description if known]
ACTION: [What's being done] — ETA [time estimate]
IMPACT: [Business impact — revenue, users, reputation]
NEXT UPDATE: [Timestamp]
```

## 上报矩阵

| 条件 | 上报给 | 动作 |
|-----------|------------|--------|
| P0 在 30 分钟内未解决 | 工作室制作人 | 追加资源，向供应商升级 |
| P1 在 2 小时内未解决 | 项目牧羊人 | 重新分配资源 |
| 疑似数据外泄 | 法务合规审查专员 | 评估监管通报义务 |
| 用户数据受影响 | 法务合规审查专员 + 高管摘要生成器 | GDPR/CCPA 通报 |
| 营收影响超过 $X | 财务追踪专员 + 工作室制作人 | 业务影响评估 |