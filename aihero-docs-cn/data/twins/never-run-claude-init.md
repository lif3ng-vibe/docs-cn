---
title: "Never Run Claude /init"
slug: "never-run-claude-init"
type: "post"
description: "Learn why auto-generated Claude.md files hurt your coding agents and what to use instead for better performance and lower costs."
tags:
  - set-up-your-agent
updatedAt: "2026-02-24T10:04:45.258Z"
---

If you're using Claude Code or any coding agent, there's an `init` command that promises to create a `CLAUDE.md` or `agents.md` file with documentation about your codebase.

Never run it. If you find one that was auto-generated, delete it.

The file it creates will burn tokens, distract the agent, and go out of date faster than a pear on a hot day. [Research confirms this](https://arxiv.org/abs/2602.11988): unnecessary context files make tasks harder, not easier.

## How Agents Use Context

An agent's context window gets divided into phases:

![Context Window Allocation](https://res.cloudinary.com/total-typescript/image/upload/v1771927533/ai-hero-images/hwhcoa9x5eg2acootps1.png)

| Phase              | Purpose                                                          | Flexibility                                |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------ |
| **System Prompt**  | LLM instructions, MCP servers, system tools, `CLAUDE.md` content | Not flexible, hardwired at start           |
| **Exploration**    | Understanding what's in the codebase                             | Very flexible                              |
| **Implementation** | Writing and modifying files                                      | Very flexible                              |
| **Testing**        | Running tests, debugging, feedback loops                         | Very flexible, can balloon if issues occur |

Exploration, implementation, and testing are flexible. A simple task needs little exploration. A bug-free implementation needs little testing.

But the system prompt is **hardwired the moment the agent starts**. Everything in your `CLAUDE.md` inflates it, leaving less room for the phases that actually do the work.

Shrinking the system prompt gives you more space for actual work and reduces your costs.

## The Instruction Budget

LLMs have a context window, but they also have an **instruction budget**: a limit on how many instructions they can follow at once.

Each sentence in your `CLAUDE.md` is an instruction. LLMs can realistically handle around **300 to 400 instructions** at a time. Bigger models push this to maybe 500.

If you're stuffing dozens of irrelevant instructions into `CLAUDE.md`, you're burning that budget before the agent even starts working on your task.

## The Globality Problem

A common piece of advice: if the agent does something you don't like, put a rule in `CLAUDE.md`.

Maybe it uses npm instead of pnpm. Maybe it reaches for a React pattern you hate. So you add a line.

The problem is that `CLAUDE.md` is **global**. Every instruction applies to every session: frontend, backend, docs, database, all of it.

![Different Request Types](https://res.cloudinary.com/total-typescript/image/upload/v1771927533/ai-hero-images/l9gyebsbhaf0fmhql96c.png)

That React rule is useful for frontend sessions. But the next session might be purely backend work where it's completely irrelevant. The session after that might be documentation.

Every line you add has a cost that compounds across every session, whether it's relevant or not.

## What Init Actually Generates

Init commands tend to generate the same categories of content. All of it is problematic.

**Command listings.** Init loves dumping every script from `package.json` into the file. These are trivially discoverable. The agent can just read `package.json`. You're paying tokens to duplicate the source of truth.

**Architecture descriptions.** Framework names, rendering modes, compiler settings. The agent can discover all of this from config files and imports. A `react-router.config` file already tells it you're using React Router. An `effect` import tells it you're using Effect.

**File and service references.** This is the worst category. Init documents specific files, services, and their relationships. The moment you rename a file, move a service, or change an implementation, this documentation is wrong. It now **actively misleads** the agent.

**Implementation patterns.** How specific features work, what patterns to use where. Not only is this discoverable from the code, it's only relevant to a fraction of sessions. Most tasks won't touch most patterns.

The throughline: everything init generates is either trivially discoverable from source or will go stale. Your file system _is_ the documentation. If you structure it well, the agent gets an accurate picture of your architecture from the source of truth, not from a rotting summary.

## The Solution

### Trust the Explore Step

Every modern coding agent has an explore phase. Before making changes, it reads files, searches the codebase, and builds up context just-in-time for the task at hand.

This is strictly better than a static `CLAUDE.md` because it only loads what's relevant, and it always reflects the current state of the code.

### Use Skills for Steering

There _is_ useful steering you want to give the agent. Maybe you want it to prefer reducers for complex UI state. Maybe you want it to follow a specific testing pattern.

This belongs in **skills**: discoverable instructions that the agent can pull in when relevant, without burning the instruction budget on every session.

### Keep CLAUDE.md Almost Empty

If basic setup stuff doesn't belong in `CLAUDE.md`, and steering belongs in skills, what's left?

Almost nothing. My entire `CLAUDE.md` is:

```
you are on WSL on Windows
```

Six words. It's there because WSL has unintuitive path resolution issues that the agent can't discover on its own. That's the bar: only include what is both **undiscoverable** and **globally relevant**.

## The Bottom Line

Never run init. The file it generates dumps irrelevant information into your global context, inflates your system prompt, wastes your instruction budget, and rots the moment your code changes.

You'll either burn tokens keeping it up to date, or you'll delete it. Just skip to deleting it.

**Trust the explore step. Use skills for steering. Keep `CLAUDE.md` nearly empty.**
