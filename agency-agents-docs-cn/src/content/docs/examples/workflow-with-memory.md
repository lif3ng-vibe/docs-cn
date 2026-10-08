---
title: '多智能体工作流：带持久记忆的创业公司 MVP'
---

> 和 [workflow-startup-mvp.md](/examples/workflow-startup-mvp/) 里是同一套创业公司 MVP 工作流，但由 MCP 记忆服务器在智能体之间打理状态。再也不用复制粘贴交接了。

## 手动交接的问题

标准工作流里，每次智能体之间的衔接长这样：

```
Activate Backend Architect.

Here's our sprint plan: [paste Sprint Prioritizer output]
Here's our research brief: [paste UX Researcher output]

Design the API and database schema for RetroBoard.
...
```

你就是那层胶水。你在智能体之间复制粘贴输出、记录哪些做完了，还要祈祷中途别丢上下文。小项目凑合能用，但遇到这些情况就会散架：

- 会话超时，输出丢了
- 多个智能体需要同一份上下文
- QA 挂了，需要回滚到之前的状态
- 项目跨越多个会话，持续数天甚至数周

## 修复方案

装上 MCP 记忆服务器后，智能体把各自的交付物存进记忆，需要时自动取回。交接变成：

```
Activate Backend Architect.

Project: RetroBoard. Recall previous context for this project
and design the API and database schema.
```

智能体从记忆里检索 RetroBoard 的上下文，找到先前智能体存好的 sprint 计划和研究简报，接着往下做。

## 安装

安装任意一个支持 `remember`、`recall`、`rollback` 操作的 MCP 兼容记忆服务器即可。配置方法见 [integrations/mcp-memory/README.md](/integrations/mcp-memory/)。

## 场景

与标准工作流相同：SaaS 团队复盘工具（RetroBoard），4 周到 MVP，单人开发者。

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

每个智能体的提示词里都有一段"记忆集成"章节（如何添加见 [integrations/mcp-memory/README.md](/integrations/mcp-memory/)）。

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
Remember your sprint plan tagged for this project when done.
```

Sprint Prioritizer 产出 sprint 计划，并以 `sprint-prioritizer`、`retroboard`、`sprint-plan` 为标签存入记忆。

**步骤 2——同时激活 UX Researcher（并行）**

```
Activate UX Researcher.

I'm building a team retrospective tool for remote teams (5-20 people).
Competitors: EasyRetro, Retrium, Parabol.

Run a quick competitive analysis and identify:
1. What features are table stakes
2. Where competitors fall short
3. One differentiator we could own

Output a 1-page research brief. Remember it tagged for this project when done.
```

UX Researcher 把研究简报以 `ux-researcher`、`retroboard`、`research-brief` 为标签存入记忆。

**步骤 3——交接给 Backend Architect**

```
Activate Backend Architect.

Project: RetroBoard. Recall the sprint plan and research brief from previous agents.
Stack: Node.js, Express, PostgreSQL, Socket.io for real-time.

Design:
1. Database schema (SQL)
2. REST API endpoints list
3. WebSocket events for real-time board updates
4. Auth strategy recommendation

Remember each deliverable tagged for this project and for the frontend-developer.
```

Backend Architect 自动从记忆里召回 sprint 计划和研究简报。零复制粘贴。它把自己的 schema 和 API 规范以 `backend-architect`、`retroboard`、`api-spec`、`frontend-developer` 为标签存入记忆。

### 第 2 周：实现核心功能

**步骤 4——激活 Frontend Developer + Rapid Prototyper**

```
Activate Frontend Developer.

Project: RetroBoard. Recall the API spec and schema from the Backend Architect.

Build the RetroBoard React app:
- Stack: React, TypeScript, Tailwind, Socket.io-client
- Pages: Login, Dashboard, Board view
- Components: RetroCard, VoteButton, ActionItem, BoardColumn

Start with the Board view — it's the core experience.
Focus on real-time: when one user adds a card, everyone sees it.
Remember your progress tagged for this project.
```

Frontend Developer 从记忆里拉取 API 规范，据此开发。

**步骤 5——中点现实检查**

```
Activate Reality Checker.

Project: RetroBoard. We're at week 2 of a 4-week MVP build.

Recall all deliverables from previous agents for this project.

Evaluate:
1. Can we realistically ship in 2 more weeks?
2. What should we cut to make the deadline?
3. Any technical debt that will bite us at launch?

Remember your verdict tagged for this project.
```

Reality Checker 能看到目前为止产出的一切——sprint 计划、研究简报、schema、API 规范、前端进度——不用你手动收集再粘过去。

### 第 3 周：打磨 + 落地页

**步骤 6——Frontend Developer 继续，Growth Hacker 开工**

```
Activate Growth Hacker.

Product: RetroBoard — team retrospective tool, launching in 1 week.
Target: Engineering managers and scrum masters at remote-first companies.
Budget: $0 (organic launch only).

Recall the project context and Reality Checker's verdict.

Create a launch plan:
1. Landing page copy (hero, features, CTA)
2. Launch channels (Product Hunt, Reddit, Hacker News, Twitter)
3. Day-by-day launch sequence
4. Metrics to track in week 1

Remember the launch plan tagged for this project.
```

### 第 4 周：发布

**步骤 7——最终现实检查**

```
Activate Reality Checker.

Project: RetroBoard, ready to launch.

Recall all project context, previous verdicts, and the launch plan.

Evaluate production readiness:
- Live URL: [url]
- Test accounts created: yes
- Error monitoring: Sentry configured
- Database backups: daily automated

Run through the launch checklist and give a GO / NO-GO decision.
Require evidence for each criterion.
```

### 当 QA 挂掉：回滚

标准工作流里，Reality Checker 拒收一份交付物后，你得回到负责的智能体，努力解释哪里出了问题。有了记忆，恢复循环更紧：

```
Activate Backend Architect.

Project: RetroBoard. The Reality Checker flagged issues with the API design.
Recall the Reality Checker's feedback and your previous API spec.
Roll back to your last known-good schema and address the specific issues raised.
Remember the updated deliverables when done.
```

Backend Architect 能看清 Reality Checker 到底标了什么、召回自己先前的工作、回滚到某个检查点、产出修复——全程不需要你手动管版本。

## 前后对比

| 维度 | 标准工作流 | 带记忆 |
|--------|------------------|-------------|
| **交接** | 在智能体之间复制粘贴完整输出 | 智能体自动召回所需内容 |
| **上下文丢失** | 会话超时就全丢 | 记忆跨会话持久保存 |
| **多智能体上下文** | 手动汇总 N 个智能体的上下文 | 智能体按项目标签检索记忆 |
| **QA 失败恢复** | 手动描述哪里出了问题 | 智能体召回反馈并回滚 |
| **跨天项目** | 每次会话重建上下文 | 智能体从上次中断处继续 |
| **前置条件** | 无 | 安装 MCP 记忆服务器 |

## 关键模式

1. **一切用项目名打标签**：这是召回能成立的前提。每条记忆都打上 `retroboard`（或你的项目名）标签。
2. **给接收方智能体打标签**：Backend Architect 完成 API 规范后，会给记忆打上 `frontend-developer` 标签，Frontend Developer 召回时就能找到。
3. **Reality Checker 拥有完整可见性**：所有智能体都把工作存进记忆，Reality Checker 无需你汇总就能召回项目的全部内容。
4. **用回滚代替手动撤销**：出了问题就回滚到上一个检查点，别去人肉排查改了什么。

## 技巧

- 不必一次改完所有智能体。先给你最常用的几个加上"记忆集成"，再逐步铺开。
- 记忆指令是提示词，不是代码。LLM 会自行解释并按需调用 MCP 工具，措辞可以按你的风格调整。
- 任何支持 `remember`、`recall`、`rollback`、`search` 工具的 MCP 兼容记忆服务器都能配合这套工作流。