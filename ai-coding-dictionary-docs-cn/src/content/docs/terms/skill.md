---
title: "Skill（技能）"
source: "https://www.aihero.dev/ai-coding-dictionary/skill"
---


A teachable capability bundled as a unit — instructions and resources for doing one task well, kept in the [environment](/terms/environment) until a [context pointer](/terms/context-pointer) pulls it into the [context window](/terms/context-window) for the task at hand. The unit of [progressive disclosure](/terms/progressive-disclosure) in a [harness](/terms/harness).

Skills are an open standard, defined at [agentskills.io](https://agentskills.io) — originally developed by Anthropic and since adopted by most major harnesses, so a skill written once works across them. The format is a folder containing:

- A `SKILL.md` file — metadata (a name and description, at minimum) plus the instructions themselves
- Optionally, scripts the [agent](/terms/agent) can run
- Optionally, templates and reference material the instructions point to

Only the name and description sit in [context](/terms/context) by default. When the agent's task matches, it loads the rest. Until then, the skill takes up almost no room — a sentence or two of [tokens](/terms/token), however large its full instructions are.

This distinguishes skills from [AGENTS.md](/terms/agents-md), which is loaded into every [session](/terms/session) regardless of the task. A skill is read when a particular kind of work comes up — releasing, scaffolding a new service, writing a migration — and ignored the rest of the time.

_Avoid:_ "[tool](/terms/tool)" — a tool is what the agent _calls_; a skill is instructions it _reads_.

_Usage:_

"Where should I put the deploy runbook?"

"As a skill — the agent loads it only when the task involves deploys. In AGENTS.md it'd burn tokens on every [turn](/terms/turn) for something we use weekly."
