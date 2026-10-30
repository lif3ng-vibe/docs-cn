---
title: "9 Ways AI Coding Has Rewired My Brain"
slug: "ways-ai-coding-has-rewired-my-brain"
type: "post"
description: "Discover 9 ways AI-assisted coding rewires your development mindset: integration testing, architecture, modules, and strategies for managing cognitive load."
tags:
  - think-like-an-ai-engineer
updatedAt: "2026-03-11T14:33:11.900Z"
---

I have been writing all the software that I work on completely 100% AI-contributed for a few months now. [I tweeted about it](https://x.com/mattpocockuk/status/2024049581529460839), and people have been asking for more details.

People have been asking for more details on the nine ways it's changed how I think about coding. Let's break down each one.

## 1. Way More Time Thinking About Integration Testing

This is literally true even this morning. I was working on a CLI tool I use for teaching lessons and wanted to make updates with an AI agent.

I realized the testing was mostly done by manual QA. The reason? It's very Git-dependent, so I thought I would need to use GitHub to test it properly.

It turns out I was wrong. I can test it completely locally.

**Here's what I did:**

- Added an end-to-end test suite describing all user stories for how testing should operate
- Built a utility for creating temporary Git environments so the AI could test everything properly
- Ran the entire suite automatically with every change the AI made

Raising test boundaries lets you catch more bugs and work more comfortably with AI agents running code automatically.

## 2. Friction Via Pre-Commit Hooks, CI, and Strong Types is Super Desirable

Feedback loops are super important. They give the agent actual context about what's working and what's not in the real world.

Every single change the AI makes should trigger your pre-commit hooks, CI, and type checking so bugs get caught immediately. The more immediate the feedback, the better decisions the agent can make.

## 3. AI Has No Taste for UI - Prototype Extremely Aggressively

You see demos of AI creating beautiful one-shot UIs all the time. But AI struggles with iterating on existing brownfield UI.

**Before committing to a PRD:**

Ask the LLM for five different options for the UI change. Put them on throwaway routes so you can look at them. Iterate on the prototype without touching real code. Once you land on something you like, the AI can implement it properly.

## 4. AI Has No Taste for Software Architecture

Bad codebases have lots of shallow modules with big interfaces. Good codebases have a few big modules with simple interfaces.

**Deep vs shallow modules:**

- **Deep modules:** tiny interface with lots of implementation
- **Shallow modules:** big interface with little implementation

Deep modules are super important for this approach. They're easier to test and easier for the AI to work on without you needing to understand every implementation detail.

## 5. Deep, Grey-Box Modules with Simple Interfaces Are the King

If a module is deep enough, it becomes really easy to test around the box without worrying about what's inside.

Break your codebase into large modules and test at the boundaries. Then leave the implementation to the AI. I call them "grey-box modules" because you can look inside if you want to, but you're not really supposed to. Test at the right boundaries and you can ignore what's inside.

## 6. Use Effect.ts for Dependency Injection

`Effect` has a first-class concept called [services](https://effect.website/docs/requirements-management/services/) - reusable components that encapsulate common tasks across your application.

They're complex, deep modules with simple interfaces. If you're building backend in TypeScript, I really cannot recommend `Effect` enough. It makes this pattern incredibly straightforward and has been invaluable for my work with AI agents.

## 7. Much More Meta-Programming

I'm always thinking about how to make my agent run automatically. This means defining my own processes and figuring out what I do.

**Building features is simple:**

1. Add the tests
2. Build the feature
3. Run the tests and types
4. Commit

**But what about everything else?** Triaging issues, backlog pruning, task prioritization - these are all things you can delegate to AI or make the grunt work automatic while retaining control.

## 8. Beware of Doc Rot

Lots of people stuff their repos with markdown docs. Every time the LLM searches for something, it finds docs that might be outdated.

You end up with "doc rot" - where the codebase and documentation have diverged. The LLM doesn't know which to trust. Let the AI generate its own docs during the exploration phase instead. Those docs never go out of date because they're just-in-time generated.

## 9. Much Higher Cognitive Load to Keep Up with Changes

This is true. But deep grey-box modules help by letting you trust the tests and give a cursory glance without understanding every detail.

I've noticed less cognitive load when I do this. I'm also mostly not parallelizing - the stuff I'm building doesn't need multiple agents running in parallel. But if you were running four or five projects in parallel, I could see that being gnarly.

---

That's how AI has rewired my brain - thinking more about testing, the shape of modules, my own processes, being skeptical of docs, and reducing cognitive load.

How has AI coding rewired your brain? What are you paying more attention to now than you used to?