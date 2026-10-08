---
title: '🛡️ 第 4 阶段 playbook——质量与加固'
---

> **周期**：3-7 天 | **智能体**：8 个 | **守门人**：Reality Checker（唯一裁决权）

---

## 目标

最后一道质量关。Reality Checker 的默认裁定是 NEEDS WORK——你必须用压倒性的证据证明生产就绪。之所以设这个阶段，是因为第一版实现通常要经历 2-3 轮修订，这是健康的。

## 前置条件

- [ ] 第 3 阶段质量关卡已通过（全部任务过 QA）
- [ ] 已收到第 3 阶段交接包
- [ ] 全部功能已实现并逐项验证

## 关键心态

> **Reality Checker 的默认裁定是 NEEDS WORK。**
>
> 这不是悲观——这是务实。生产就绪要求：
> - 完整的用户旅程端到端可用
> - 跨设备一致性（桌面、平板、手机）
> - 负载下的性能（而不只是理想路径）
> - 安全验证（而不只是"我们加了鉴权"）
> - 规格遵从（每一条要求，而不是大多数）
>
> 首轮拿到 B/B+ 属于正常且在预期之内。

## 智能体激活序列

### 第 1 步：证据收集（第 1-2 天，全部并行）

#### 📸 Evidence Collector——全面视觉证据
```
Activate Evidence Collector for comprehensive system evidence on [PROJECT].

Deliverables required:
1. Full screenshot suite:
   - Desktop (1920x1080) — every page/view
   - Tablet (768x1024) — every page/view
   - Mobile (375x667) — every page/view
2. Interaction evidence:
   - Navigation flows (before/after clicks)
   - Form interactions (empty, filled, submitted, error states)
   - Modal/dialog interactions
   - Accordion/expandable content
3. Theme evidence:
   - Light mode — all pages
   - Dark mode — all pages
   - System preference detection
4. Error state evidence:
   - 404 pages
   - Form validation errors
   - Network error handling
   - Empty states

Format: Screenshot Evidence Package with test-results.json
Timeline: 2 days
```

#### 🔌 API Tester——完整 API 回归
```
Activate API Tester for complete API regression on [PROJECT].

Deliverables required:
1. Endpoint regression suite:
   - All endpoints tested (GET, POST, PUT, DELETE)
   - Authentication/authorization verification
   - Input validation testing
   - Error response verification
2. Integration testing:
   - Cross-service communication
   - Database operation verification
   - External API integration
3. Edge case testing:
   - Rate limiting behavior
   - Large payload handling
   - Concurrent request handling
   - Malformed input handling

Format: API Test Report with pass/fail per endpoint
Timeline: 2 days
```

#### ⚡ Performance Benchmarker——负载测试
```
Activate Performance Benchmarker for load testing on [PROJECT].

Deliverables required:
1. Load test at 10x expected traffic:
   - Response time distribution (P50, P95, P99)
   - Throughput under load
   - Error rate under load
   - Resource utilization (CPU, memory, network)
2. Core Web Vitals measurement:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1
3. Database performance:
   - Query execution times
   - Connection pool utilization
   - Index effectiveness
4. Stress test results:
   - Breaking point identification
   - Graceful degradation behavior
   - Recovery time after overload

Format: Performance Certification Report
Timeline: 2 days
```

#### ⚖️ Legal Compliance Checker——最终合规审计
```
Activate Legal Compliance Checker for final compliance audit on [PROJECT].

Deliverables required:
1. Privacy compliance verification:
   - Privacy policy accuracy
   - Consent management functionality
   - Data subject rights implementation
   - Cookie consent implementation
2. Security compliance:
   - Data encryption (at rest and in transit)
   - Authentication security
   - Input sanitization
   - OWASP Top 10 check
3. Regulatory compliance:
   - GDPR requirements (if applicable)
   - CCPA requirements (if applicable)
   - Industry-specific requirements
4. Accessibility compliance:
   - WCAG 2.1 AA verification
   - Screen reader compatibility
   - Keyboard navigation

Format: Compliance Certification Report
Timeline: 2 days
```

### 第 2 步：分析（第 3-4 天，并行，在第 1 步之后）

#### 📊 Test Results Analyzer——质量指标汇总
```
Activate Test Results Analyzer for quality metrics aggregation on [PROJECT].

Input: ALL Step 1 reports
Deliverables required:
1. Aggregate quality dashboard:
   - Overall quality score
   - Category breakdown (visual, functional, performance, security, compliance)
   - Issue severity distribution
   - Trend analysis (if multiple test cycles)
2. Issue prioritization:
   - Critical issues (must fix before production)
   - High issues (should fix before production)
   - Medium issues (fix in next sprint)
   - Low issues (backlog)
3. Risk assessment:
   - Production readiness probability
   - Remaining risk areas
   - Recommended mitigations

Format: Quality Metrics Dashboard
Timeline: 1 day
```

#### 🔄 Workflow Optimizer——流程效率评审
```
Activate Workflow Optimizer for process efficiency review on [PROJECT].

Input: Phase 3 execution data + Step 1 findings
Deliverables required:
1. Process efficiency analysis:
   - Dev↔QA loop efficiency (first-pass rate, average retries)
   - Bottleneck identification
   - Time-to-resolution for different issue types
2. Improvement recommendations:
   - Process changes for Phase 6 operations
   - Automation opportunities
   - Quality improvement suggestions

Format: Optimization Recommendations Report
Timeline: 1 day
```

#### 🏗️ Infrastructure Maintainer——生产就绪检查
```
Activate Infrastructure Maintainer for production readiness on [PROJECT].

Deliverables required:
1. Production environment validation:
   - All services healthy and responding
   - Auto-scaling configured and tested
   - Load balancer configuration verified
   - SSL/TLS certificates valid
2. Monitoring validation:
   - All critical metrics being collected
   - Alert rules configured and tested
   - Dashboard access verified
   - Log aggregation working
3. Disaster recovery validation:
   - Backup systems operational
   - Recovery procedures documented and tested
   - Failover mechanisms verified
4. Security validation:
   - Firewall rules reviewed
   - Access controls verified
   - Secrets management confirmed
   - Vulnerability scan clean

Format: Infrastructure Readiness Report
Timeline: 1 day
```

### 第 3 步：终审（第 5-7 天，串行）

#### 🔍 Reality Checker——最终裁定
```
Activate Reality Checker for final integration testing on [PROJECT].

MANDATORY PROCESS — DO NOT SKIP:

Step 1: Reality Check Commands
- Verify what was actually built (ls, grep for claimed features)
- Cross-check claimed features against specification
- Run comprehensive screenshot capture
- Review all evidence from Step 1 and Step 2

Step 2: QA Cross-Validation
- Review Evidence Collector findings
- Cross-reference with API Tester results
- Verify Performance Benchmarker data
- Confirm Legal Compliance Checker findings

Step 3: End-to-End System Validation
- Test COMPLETE user journeys (not individual features)
- Verify responsive behavior across ALL devices
- Check interaction flows end-to-end
- Review actual performance data

Step 4: Specification Reality Check
- Quote EXACT text from original specification
- Compare with ACTUAL implementation evidence
- Document EVERY gap between spec and reality
- No assumptions — evidence only

VERDICT OPTIONS:
- READY: Overwhelming evidence of production readiness (rare first pass)
- NEEDS WORK: Specific issues identified with fix list (expected)
- NOT READY: Major architectural issues requiring Phase 1/2 revisit

Format: Reality-Based Integration Report
Default: NEEDS WORK unless proven otherwise
```

## 质量关卡——最后一道关

| # | 标准 | 门槛 | 所需证据 |
|---|-----------|-----------|-------------------|
| 1 | 用户旅程完整 | 所有关键路径端到端可用 | Reality Checker 截图 |
| 2 | 跨设备一致性 | 桌面 + 平板 + 手机全部可用 | 响应式截图 |
| 3 | 性能已认证 | P95 < 200ms，LCP < 2.5s，uptime > 99.9% | Performance Benchmarker 报告 |
| 4 | 安全已验证 | 零关键漏洞 | 安全扫描 + 合规报告 |
| 5 | 合规已认证 | 满足全部监管要求 | Legal Compliance Checker 报告 |
| 6 | 规格遵从 | 100% 的规格要求已实现 | 逐条核对 |
| 7 | 基础设施就绪 | 生产环境已验证 | Infrastructure Maintainer 报告 |

## 关卡决策

**唯一裁决权**：Reality Checker

### 若为 READY（进入第 5 阶段）：
```markdown
## Phase 4 → Phase 5 Handoff Package

### For Launch Team:
- Reality Checker certification report
- Performance certification
- Compliance certification
- Infrastructure readiness report
- Known limitations (if any)

### For Growth Hacker:
- Product ready for users
- Feature list for marketing messaging
- Performance data for credibility

### For DevOps Automator:
- Production deployment approved
- Blue-green deployment plan
- Rollback procedures confirmed
```

### 若为 NEEDS WORK（退回第 3 阶段）：
```markdown
## Phase 4 → Phase 3 Return Package

### Fix List (from Reality Checker):
1. [Critical Issue 1]: [Description + evidence + fix instruction]
2. [Critical Issue 2]: [Description + evidence + fix instruction]
3. [High Issue 1]: [Description + evidence + fix instruction]
...

### Process:
- Issues enter Dev↔QA loop (Phase 3 mechanics)
- Each fix must pass Evidence Collector QA
- When all fixes complete → Return to Phase 4 Step 3
- Reality Checker re-evaluates with updated evidence

### Expected: 2-3 revision cycles is normal
```

### 若为 NOT READY（退回第 1/2 阶段）：
```markdown
## Phase 4 → Phase 1/2 Return Package

### Architectural Issues Identified:
1. [Fundamental Issue]: [Why it can't be fixed in Phase 3]
2. [Structural Problem]: [What needs to change at architecture level]

### Recommended Action:
- [ ] Revise system architecture (Phase 1)
- [ ] Rebuild foundation (Phase 2)
- [ ] Descope and redefine (Phase 1)

### Studio Producer Decision Required
```

---

*当 Reality Checker 以压倒性证据给出 READY 裁定时，第 4 阶段即告完成。NEEDS WORK 是预期的首轮结果——它意味着系统在运转，但还需要打磨。*