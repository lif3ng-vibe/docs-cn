---
title: '🔍 第 0 阶段 playbook——情报与发现'
---

> **周期**：3-7 天 | **智能体**：6 个 | **守门人**：Executive Summary Generator

---

## 目标

在投入资源之前先验证机会。在理解问题、市场与监管环境之前，绝不开始构建。

## 前置条件

- [ ] 已有项目简报或初步概念
- [ ] 已确定干系人发起人（sponsor）
- [ ] 发现阶段的预算已获批准

## 智能体激活序列

### 第一波：并行启动（第 1 天）

#### 🔍 Trend Researcher——市场情报负责人
```
Activate Trend Researcher for market intelligence on [PROJECT DOMAIN].

Deliverables required:
1. Competitive landscape analysis (direct + indirect competitors)
2. Market sizing: TAM, SAM, SOM with methodology
3. Trend lifecycle mapping: where is this market in the adoption curve?
4. 3-6 month trend forecast with confidence intervals
5. Investment and funding trends in the space

Sources: Minimum 15 unique, verified sources
Format: Strategic Report with executive summary
Timeline: 3 days
```

#### 💬 Feedback Synthesizer——用户需求分析
```
Activate Feedback Synthesizer for user needs analysis on [PROJECT DOMAIN].

Deliverables required:
1. Multi-channel feedback collection plan (surveys, interviews, reviews, social)
2. Sentiment analysis across existing user touchpoints
3. Pain point identification and prioritization (RICE scored)
4. Feature request analysis with business value estimation
5. Churn risk indicators from feedback patterns

Format: Synthesized Feedback Report with priority matrix
Timeline: 3 days
```

#### 🔍 UX Researcher——用户行为分析
```
Activate UX Researcher for user behavior analysis on [PROJECT DOMAIN].

Deliverables required:
1. User interview plan (5-10 target users)
2. Persona development (3-5 primary personas)
3. Journey mapping for primary user flows
4. Usability heuristic evaluation of competitor products
5. Behavioral insights with statistical validation

Format: Research Findings Report with personas and journey maps
Timeline: 5 days
```

### 第二波：并行启动（第 1 天，与第一波相互独立）

#### 📊 Analytics Reporter——数据全景评估
```
Activate Analytics Reporter for data landscape assessment on [PROJECT DOMAIN].

Deliverables required:
1. Existing data source audit (what data is available?)
2. Signal identification (what can we measure?)
3. Baseline metrics establishment
4. Data quality assessment with completeness scoring
5. Analytics infrastructure recommendations

Format: Data Audit Report with signal map
Timeline: 2 days
```

#### ⚖️ Legal Compliance Checker——监管扫描
```
Activate Legal Compliance Checker for regulatory scan on [PROJECT DOMAIN].

Deliverables required:
1. Applicable regulatory frameworks (GDPR, CCPA, HIPAA, etc.)
2. Data handling requirements and constraints
3. Jurisdiction mapping for target markets
4. Compliance risk assessment with severity ratings
5. Blocking vs. manageable compliance issues

Format: Compliance Requirements Matrix
Timeline: 3 days
```

#### 🛠️ Tool Evaluator——技术全景
```
Activate Tool Evaluator for technology landscape assessment on [PROJECT DOMAIN].

Deliverables required:
1. Technology stack assessment for the problem domain
2. Build vs. buy analysis for key components
3. Integration feasibility with existing systems
4. Open source vs. commercial evaluation
5. Technology risk assessment

Format: Tech Stack Assessment with recommendation matrix
Timeline: 2 days
```

## 汇合点（第 5-7 天）

六个智能体全部交付报告，由 Executive Summary Generator 汇总综合：

```
Activate Executive Summary Generator to synthesize Phase 0 findings.

Input documents:
1. Trend Researcher → Market Analysis Report
2. Feedback Synthesizer → Synthesized Feedback Report
3. UX Researcher → Research Findings Report
4. Analytics Reporter → Data Audit Report
5. Legal Compliance Checker → Compliance Requirements Matrix
6. Tool Evaluator → Tech Stack Assessment

Output: Executive Summary (≤500 words, SCQA format)
Decision required: GO / NO-GO / PIVOT
Include: Quantified market opportunity, validated user needs, regulatory path, technology feasibility
```

## 质量关卡检查清单

| # | 标准 | 证据来源 | 状态 |
|---|-----------|----------------|--------|
| 1 | 市场机会已验证，TAM 高于最低可行门槛 | Trend Researcher 报告 | ☐ |
| 2 | 已有 ≥3 个经数据验证的用户痛点 | Feedback Synthesizer + UX Researcher | ☐ |
| 3 | 未发现阻塞性合规问题 | Legal Compliance Checker 矩阵 | ☐ |
| 4 | 关键指标与数据源已识别 | Analytics Reporter 审计 | ☐ |
| 5 | 技术栈可行且已评估 | Tool Evaluator 评估 | ☐ |
| 6 | 高管简报已交付，附 GO/NO-GO 建议 | Executive Summary Generator | ☐ |

## 关卡决策

- **GO**：进入第 1 阶段——战略与架构
- **NO-GO**：归档调研成果，记录经验教训，资源转投他处
- **PIVOT**：根据发现调整范围/方向，重跑一次聚焦式发现

## 向第 1 阶段交接

```markdown
## Phase 0 → Phase 1 Handoff Package

### Documents to carry forward:
1. Market Analysis Report (Trend Researcher)
2. Synthesized Feedback Report (Feedback Synthesizer)
3. User Personas and Journey Maps (UX Researcher)
4. Data Audit Report (Analytics Reporter)
5. Compliance Requirements Matrix (Legal Compliance Checker)
6. Tech Stack Assessment (Tool Evaluator)
7. Executive Summary with GO decision (Executive Summary Generator)

### Key constraints identified:
- [Regulatory constraints from Legal Compliance Checker]
- [Technical constraints from Tool Evaluator]
- [Market timing constraints from Trend Researcher]

### Priority user needs (for Sprint Prioritizer):
1. [Pain point 1 — from Feedback Synthesizer]
2. [Pain point 2 — from UX Researcher]
3. [Pain point 3 — from Feedback Synthesizer]
```

---

*当 Executive Summary Generator 交付 GO 决策、并附上全部六个发现智能体的支持证据时，第 0 阶段即告完成。*