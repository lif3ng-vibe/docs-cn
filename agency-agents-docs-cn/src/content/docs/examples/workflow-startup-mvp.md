---
title: '多智能体工作流：创业公司 MVP'
---

> 一个循序渐进的示例：如何协调多个智能体，从点子走到上线的 MVP。

## 场景

你在做一个 SaaS MVP——一个面向远程团队的复盘工具。你有 4 周时间，要交付一个能用的产品：有用户注册、有核心功能、有落地页。

## 智能体团队

| 智能体 | 在本工作流中的职责 |
|-------|---------------------|
| Sprint Prioritizer | 把项目拆成每周 sprint |
| UX Researcher | 用快速用户访谈验证点子 |
| Backend Architect | 设计 API 与数据模型 |
| Frontend Developer | 实现 React 应用 |
| Rapid Prototyper | 让第一版尽快跑起来 |
| Growth Hacker | 边开发边规划发布战略 |
| Reality Checker | 每个里程碑放行前把关 |

## 工作流

### 第 1 周：发现 + 架构

**步骤 1——激活 Sprint Prioritizer**

```
Activate Sprint Prioritizer.

Project: RetroBoard — a real-time team retrospective tool for remote teams.
Timeline: 4 weeks to MVP launch.
Core features: user auth, create retro boards, add cards, vote, action items.
Constraints: solo developer, React + Node.js stack, deploy to Vercel + Railway.

Break this into 4 weekly sprints with clear deliverables and acceptance criteria.
```

**步骤 2——同时激活 UX Researcher（并行）**

```
Activate UX Researcher.

I'm building a team retrospective tool for remote teams (5-20 people).
Competitors: EasyRetro, Retrium, Parabol.

Run a quick competitive analysis and identify:
1. What features are table stakes
2. Where competitors fall short
3. One differentiator we could own

Output a 1-page research brief.
```

**步骤 3——交接给 Backend Architect**

```
Activate Backend Architect.

Here's our sprint plan: [paste Sprint Prioritizer output]
Here's our research brief: [paste UX Researcher output]

Design the API and database schema for RetroBoard.
Stack: Node.js, Express, PostgreSQL, Socket.io for real-time.

Deliver:
1. Database schema (SQL)
2. REST API endpoints list
3. WebSocket events for real-time board updates
4. Auth strategy recommendation
```

### 第 2 周：实现核心功能

**步骤 4——激活 Frontend Developer + Rapid Prototyper**

```
Activate Frontend Developer.

Here's the API spec: [paste Backend Architect output]

Build the RetroBoard React app:
- Stack: React, TypeScript, Tailwind, Socket.io-client
- Pages: Login, Dashboard, Board view
- Components: RetroCard, VoteButton, ActionItem, BoardColumn

Start with the Board view — it's the core experience.
Focus on real-time: when one user adds a card, everyone sees it.
```

**步骤 5——中点现实检查**

```
Activate Reality Checker.

We're at week 2 of a 4-week MVP build for RetroBoard.

Here's what we have so far:
- Database schema: [paste]
- API endpoints: [paste]
- Frontend components: [paste]

Evaluate:
1. Can we realistically ship in 2 more weeks?
2. What should we cut to make the deadline?
3. Any technical debt that will bite us at launch?
```

### 第 3 周：打磨 + 落地页

**步骤 6——Frontend Developer 继续，Growth Hacker 开工**

```
Activate Growth Hacker.

Product: RetroBoard — team retrospective tool, launching in 1 week.
Target: Engineering managers and scrum masters at remote-first companies.
Budget: $0 (organic launch only).

Create a launch plan:
1. Landing page copy (hero, features, CTA)
2. Launch channels (Product Hunt, Reddit, Hacker News, Twitter)
3. Day-by-day launch sequence
4. Metrics to track in week 1
```

### 第 4 周：发布

**步骤 7——最终现实检查**

```
Activate Reality Checker.

RetroBoard is ready to launch. Evaluate production readiness:

- Live URL: [url]
- Test accounts created: yes
- Error monitoring: Sentry configured
- Database backups: daily automated

Run through the launch checklist and give a GO / NO-GO decision.
Require evidence for each criterion.
```

## 关键模式

1. **串行交接**：上一个智能体的输出就是下一个智能体的输入
2. **并行工作**：第 1 周里 UX Researcher 和 Sprint Prioritizer 可以同时跑
3. **质量关卡**：中点和发布前的 Reality Checker 把关，防止把坏代码发上线
4. **上下文传递**：始终把上一个智能体的完整输出粘进下一个提示词——智能体之间不共享记忆

## 技巧

- 步骤之间完整复制粘贴智能体输出——不要摘要，用全文
- 如果 Reality Checker 标记了问题，回到对应专家智能体修复
- 熟练掌握手动流程后，可以考虑用 Orchestrator 智能体把这条流程自动化