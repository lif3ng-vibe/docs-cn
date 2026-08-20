---
title: "Handoff artifact（交接产物）"
source: "https://www.aihero.dev/ai-coding-dictionary/handoff-artifact"
---


A document used as the carry mechanism for a [handoff](/terms/handoff) — written to the [environment](/terms/environment) by one [session](/terms/session) to be read by another. [Specs](/terms/spec), [tickets](/terms/ticket), and plan docs are all handoff artifacts.

The reason to write one: the [model](/terms/model) is [stateless](/terms/stateless), so nothing in a session survives [clearing](/terms/clearing) it. Decisions, constraints, half-finished plans — all gone with the [context](/terms/context) that held them. The environment persists. Writing the important state into a file moves it somewhere the next session can read it back from.

The artifact is a [secondary source](/terms/secondary-source) — an account of the session's work, not the work itself. That's what makes it small enough to brief a fresh session, and also why it can mislead one: it records what the writing session believed, and anything it left out or got wrong is invisible to the reader. Where a claim matters, the next session should verify it against the [primary source](/terms/primary-source) — the code, the tests — rather than inherit it.

A good artifact is written to be read into a session that has zero context. Concrete file paths rather than "the file we discussed". What was decided and why, so the next session doesn't relitigate it. What's done and what's left. It helps to tell the writing session where the artifact is headed: "write a handoff doc for a fresh session that knows nothing about this work".

The alternative carry mechanism is [compaction](/terms/compaction), which summarises in-memory. The artifact has two advantages: it lives on disk where you can read and correct it before anything depends on it, and it can be reused — the same spec can brief five parallel sessions.

_Usage:_

"How do I split this between the planning [agent](/terms/agent) and the implementing one?"

"Have the planner write a handoff artifact — file paths, decisions, constraints. The implementer's session opens with a pointer to the artifact and works from it as its brief."
