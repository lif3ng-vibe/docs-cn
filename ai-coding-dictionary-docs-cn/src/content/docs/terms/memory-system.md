---
title: "Memory system（记忆系统）"
source: "https://www.aihero.dev/ai-coding-dictionary/memory-system"
---


A system that attempts to make an [agent](/terms/agent) [stateful](/terms/stateful) across [sessions](/terms/session). Persists information into the [environment](/terms/environment) during a session and reloads it into the [context window](/terms/context-window) at the start of future ones, so the agent carries continuity beyond the user [clearing](/terms/clearing) the session.

A memory system has two halves. The write path: during a session, the agent records what it learned — a preference you stated, a fact about the project — as files in the environment. The read path: at session start, the [harness](/terms/harness) loads those files, or an index of them, back into the context window. Many harnesses ship their own memory system — Claude Code's `/memory` is one — but you can also build one yourself: a directory of notes plus an instruction in [AGENTS.md](/terms/agents-md) to consult it.

The same trade-offs as any always-loaded content apply. Memories accumulate, so most systems load a one-line index and leave the bodies behind [context pointers](/terms/context-pointer) rather than inlining everything. And memories are [secondary sources](/terms/secondary-source), so they drift: a fact recorded in March is loaded with equal confidence in June, after the project has moved on. A memory system needs pruning, the same way AGENTS.md does.

_Usage:_

"I keep having to re-tell it I'm on Postgres, not MySQL."

"Wire up a memory system — write what it learns to the [filesystem](/terms/filesystem) on the first [turn](/terms/turn), reload it at session start. The [model](/terms/model) itself is [stateless](/terms/stateless); the memory layer fakes continuity."
