---
title: "Skills Changelog: Ubiquitous Language -> /grill-with-docs"
slug: "skills-changelog-ubiquitous-language-grill-with-docs"
type: "post"
description: "Skills repo changelog: /grill-with-docs, ADRs, improved architecture language, multi-tracker support & new debugging skills. Updates inside."
updatedAt: "2026-04-30T10:36:43.176Z"
---

With over 46.6k stars, my [skills repo](https://github.com/mattpocock/skills) has become a collection of my distilled thinking about engineering. What I'm doing now is posting regular updates about changes to the skills, and these videos act like a changelog so you can keep up to date with what's changing.

These skills are designed for you to download into your setups and start using immediately. They represent the approaches and techniques I use daily in my own work.

## Repository Structure Changes

The first major change is the repository structure. Skills are now organized into distinct categories:

| Category                                                                                      | Purpose                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [**Productivity Skills**](https://github.com/mattpocock/skills/tree/main/skills/productivity) | Skills useful in general workflow tools, not specific to code            |
| [**Engineering Skills**](https://github.com/mattpocock/skills/tree/main/skills/engineering)   | The main collection - skills I use daily and recommend learning well     |
| [**Misc Skills**](https://github.com/mattpocock/skills/tree/main/skills/misc)                 | Occasional-use skills; uncertain about their permanent place in the repo |
| [**Deprecated**](https://github.com/mattpocock/skills/tree/main/skills/deprecated)            | Skills being phased out or replaced by newer alternatives                |
| [**Personal Skills**](https://github.com/mattpocock/skills/tree/main/skills/personal)         | Skills I use personally, shared for inspiration rather than core usage   |

You can safely ignore the `misc` and `deprecated` folders for now.

## Major Changes & New Features

### `/ubiquitous-language` -> `/grill-with-docs`

The [`/ubiquitous-language`](https://github.com/mattpocock/skills/tree/main/skills/deprecated/ubiquitous-language) skill has been deprecated and merged into a powerful new skill: [`/grill-with-docs`](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs).

**What changed:**

- Instead of creating a `ubiquitous-language.md` file, it creates a `context.md` file
- Combines the grilling session with documentation in one stage
- Supports multiple bounded contexts, a common Domain-Driven Design (DDD) pattern

This means you can have:

- Different contexts for different parts of your system (e.g., ordering vs. billing)
- Each with their own `context.md` and shared language
- No need for a single ubiquitous language across the entire application

**[`/grill-with-docs`](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs) vs. [`/grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me):**

| Feature      | `/grill-with-docs` | `/grill-me`                                 |
| ------------ | ------------------ | ------------------------------------------- |
| **Best for** | Codebases          | General use (life, work, creative projects) |
| **Output**   | `context.md`, ADRs | Flexible documentation                      |
| **Location** | Engineering folder | Productivity folder                         |

[`/grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me) is totally unchanged, it's just been reorganized. Someone even used it to create a eulogy for their mum, and it worked wonderfully.

### `/grill-with-docs` - Architectural Decision Records (ADRs)

[`/grill-with-docs`](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs) now includes ADRs (Architectural Decision Records). You should create an ADR when all three conditions are true:

1. It's hard to reverse
2. It's surprising without context
3. It's the result of a real trade-off

This alignment between you and the AI on non-obvious decisions prevents the AI from suggesting the same bad idea repeatedly.

### `/improve-codebase-architecture` - New `LANGUAGE.md`

[`/improve-codebase-architecture`](https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture) has received a major upgrade with a full language definition for discussing codebase improvements.

The skill now uses precise terminology to describe architectural concepts. For example:

```md
**`Module`**

Anything with an interface and an implementation. Deliberately scale-agnostic - applies equally to a function, class, package, or tier-spanning slice.

**`Interface`**

Everything a caller must know to use the module correctly. Includes the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics.

**`Implementation`**

What's inside a module - its body of code. Distinct from Adapter: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake).
```

Having this shared language prevents verbose conversations and keeps you aligned with the AI about what a good codebase looks like.

### `/setup-matt-pocock-skills` - Issue Tracker Flexibility

Skills now work with **any** issue tracker, not just GitHub Issues.

**Previously:** Engineering skills like [`/to-issues`](https://github.com/mattpocock/skills/tree/main/skills/engineering/to-issues) were tuned specifically for GitHub Issues.

**Now:** Skills say "publish the issues to the issue tracker", but how does it know which one?

The answer is a new skill: [`/setup-matt-pocock-skills`](https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills).

This scaffolds per-repo configuration by creating a `CLAUDE.md` file that includes:

- Your issue tracker location
- Triage labels
- Domain documentation paths

**Custom trackers:** Since these are LLM-powered agents, you can plug in any custom issue tracker or even unsupported tools.

Here's what the setup looks like:

```
Set up Matt Pocock Skills
→ Install all engineering skills
→ Pick the skills you want
→ Run: matt-pocock set-up-matt-pocock-skills
```

The resulting `CLAUDE.md` is minimal and clean:

```
issues live at: github/issues at mattpocock.sandcastle
issue tracker: logged in here
```

This is progressively disclosed - the agent only grabs this configuration when it needs to.

## New Experimental Skills

### `/diagnose`

[`/diagnose`](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnose) is for fixing hard bugs. Run this every time you're debugging.

**The process:**

1. Build up a feedback loop
2. Reproduce the bug within that loop
3. Hypothesize about the bug (presenting ranked hypotheses)
4. Instrument (add logs to observe behavior)
5. Make a fix

**Note:** The AI currently jumps ahead too eagerly in these stages. This skill is still being tuned.

### `/triage`

[`/triage`](https://github.com/mattpocock/skills/tree/main/skills/engineering/triage) triages issues you didn't create, typically issues in your backlog.

**Use case:** Your PM adds vague notes about features they want; triage organizes them.

**How it works:** Uses a state machine with category and state roles.

**Category roles:**
- `bug` - something is broken
- `enhancement` - new feature or improvement

**State roles:**
- `needs-triage` - maintainer needs to evaluate
- `needs-info` - waiting on reporter for more information
- `ready-for-agent` - fully specified, ready for an AFK agent
- `ready-for-human` - needs human implementation
- `wontfix` - will not be actioned

Every triaged issue gets exactly one category role and one state role. I use this for my open-source repos, and it works really well. I can add vague messages, generate comments to clarify, and get issues ready for AI pickup.

## Getting More Updates

All skill updates and tips for getting the most out of agents are posted at [aihero.dev/skills](https://aihero.dev/skills). It's a tailored newsletter just for skills.

Thanks for following along. I hope you're enjoying these updates as much as I'm enjoying creating them. See you soon!
