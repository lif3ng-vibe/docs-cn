---
title: "My Claude Code Cohort - A Teaser"
slug: "my-claude-code-cohort-a-teaser"
type: "post"
description: "Here's a teaser to my Claude Code course: covering LLM constraints, planning, steering, feedback loops, autonomous agents, and human-in-the-loop techniques."
tags:
  - meta-announcements
updatedAt: "2026-03-11T15:10:20.473Z"
---

2-week learning cohort • Starting March 30
<Link href="/cohorts/claude-code-for-real-engineers-2026-04"><CldImage src="https://res.cloudinary.com/total-typescript/image/upload/v1773381499/claude-code-for-real-engineers-cohort_2x.jpg" alt="Claude Code for Real Engineers cohort" width={480} height={270} /></Link>

---

I've spent the last few months building a comprehensive course that goes beyond the basics of Claude Code. It's a framework for becoming a more effective AI-assisted developer.

Here's what you'll find inside.

## 1. Start with the Fundamentals (Before You Touch Claude Code)

Before diving into Claude Code itself, the course tackles two essential lessons on LLM constraints and sub-agents. This might seem backwards, but it's intentional.

Most developers jump straight into writing prompts without understanding why LLMs behave the way they do. Starting here helps you avoid frustration later when things don't work as expected.

Sub-agents deserve special attention because they're central to how Claude Code works. Understanding them will inform how you structure your tasks.

## 2. Master the Core Loop: Explore, Build, Clear

Day one focuses on code-based exploration as the fundamental primitive. This is where everything else builds from.

You'll learn to:

- Explore your codebase systematically
- Build individual features with Claude Code
- Hook up context awareness
- Use plan mode effectively
- Implement compaction to clear context windows

By the end of day one, you can ship a complete feature. But you won't yet know how to steer Claude Code consistently toward your vision.

## 3. Learn to Steer with AGENTS.md and Skills

Day two introduces steering, which solves the statelessness problem that affects LLMs.

Since language models don't retain memory between sessions, you need mechanisms to guide their behavior. The course teaches you to use `AGENTS.md` files and custom Agent Skills.

Skills encode your development practices into reusable tools that Claude Code can invoke repeatedly, ensuring consistency across your codebase.

## 4. Break Massive Tasks into Multi-Phase Plans

Most developers hit a wall when tasks exceed the context window. Day three shows you how to split massive features into multiple phases.

You'll learn the PRD framework for describing what you're building, then how to structure multi-phase plans that clear the context window between phases.

Tracer bullets (borrowed from the Pragmatic Programmer) help you tackle the valuable parts first. This approach reduces the likelihood of getting stuck in implementation details without shipping anything useful.

## 5. Build Tight Feedback Loops

Day four reframes how you think about code quality.

Every line of code you add carries a maintenance burden. You can't simply ask Claude Code to churn through problems and expect good results. Instead, you need feedback loops that guide the agent toward better solutions.

The course introduces a "do work" skill that encodes your development cycle: debugging, exploring, building, running feedback loops, and testing. Claude Code follows this process each time you invoke it.

Test-driven development (TDD) matters here. LLMs already understand these concepts from their training data. Red-green-refactor cycles naturally emerge from good prompting, and better tests lead to better agent performance.

## 6. Graduate to Autonomous Agents with Ralph

Ralph is the course's term for autonomous AI agents that commit code to your repository without human intervention.

Everything you've learned feeds into this. The steering mechanisms, feedback loops, and architecture patterns become essential. Ralph runs autonomously because your feedback loops and `AGENTS.md` file constrain it effectively.

The final step is wiring Ralph to your GitHub issue backlog, so you create issues and the agent works through them.

## 7. Bring Humans Back In (When It Matters)

The final day acknowledges that autonomous agents can't handle everything.

Certain tasks work better in human-in-the-loop mode: research phases let you apply your taste before Ralph executes, prototyping lets you explore design space, and QA plans ensure quality before code lands.

You'll also learn how to architect codebases that AI agents work well with, treating software architecture as part of your development taste.

## Course Format: Self-Paced Plus Cohort Benefits

This is a self-paced course where you keep all materials forever. But it's also structured as a cohort, with material dropping over two weeks.

This hybrid approach works well. You'll have access to live office hours and a Discord full of developers working through similar problems. You can't just follow a framework blindly; you need to apply it to your own codebase and constraints. That's where the cohort becomes useful.

## The Big Picture

This course builds a complete system. Multi-phase plans lead to better Ralph execution. Steering mechanisms improve code quality. Feedback loops guide agents toward better solutions. Each piece reinforces the others.

By the end, you'll understand the software engineering principles that make AI-assisted development work at scale.

If this resonates with you, I'll see you in the cohort.