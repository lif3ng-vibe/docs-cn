---
title: "Subagent（子智能体）"
source: "https://www.aihero.dev/ai-coding-dictionary/subagent"
---


An [agent](/terms/agent) spawned by another agent via a [tool call](/terms/tool-call). Runs in its own [session](/terms/session) with its own [context window](/terms/context-window), and reports a single [tool result](/terms/tool-result) back. Distinct from a [handoff](/terms/handoff) — the parent specifically expects a return; a handoff has no return path. **Cannot spawn further subagents** — the tree is one level deep. Subagents exist to isolate [context](/terms/context), not to compose hierarchies.

The point is to keep noisy work out of the parent's context. A broad search or a long file-reading expedition produces pages of tool results, most of which matter only long enough to find the answer. Run inside the parent and all of it stays in the parent's context for the rest of the session. Run inside a subagent and the noise fills a disposable window instead — only the final report lands in the parent's context. The report is a [secondary source](/terms/secondary-source): the parent gets the subagent's account of what it found, not the raw results, so anything the report leaves out is invisible to the parent.

Subagents also run concurrently — a parent can fan several out at once over independent pieces of work.

_Usage:_

"The grep results are blowing out my context."

"Spawn a subagent to do the search — it'll burn its own context window on the noise and report back the two file paths you actually need."
