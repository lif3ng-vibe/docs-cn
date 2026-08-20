---
title: "Compaction（压缩）"
source: "https://www.aihero.dev/ai-coding-dictionary/compaction"
---


A [handoff](/terms/handoff) done in-memory: the previous [session](/terms/session)'s history is summarised, and the summary seeds a fresh session. Lossy by design: the transcript is a [primary source](/terms/primary-source), the summary a [secondary source](/terms/secondary-source) — detail traded for headroom. Triggered manually by the user, or automatically via [autocompact](/terms/autocompact).

The mechanism: the [context window](/terms/context-window) is finite, and a long session fills it — every [tool result](/terms/tool-result), every file read, every wrong turn stays in history. When it gets heavy, the [harness](/terms/harness) asks the [model](/terms/model) to summarise the session, throws the original history away, and seeds a fresh session with the summary. Whatever didn't make it into the summary is gone from the context. Some harnesses soften this by keeping the old transcript on disk and leaving a [context pointer](/terms/context-pointer) to it in the summary — the secondary source links back to its primary source, so a detail the summary lost can be recovered by re-reading the original.

The summary is written by the model, so it can be prompted. "Preserve the schema decisions" makes the generated artifact more deliberate. Timing matters too — compact at a phase boundary, after the plan is settled, not mid-task.

Contrast with [clearing](/terms/clearing), which drops everything and starts cold: compaction tries to carry the essentials across; clearing bets they're already written down somewhere better.

_Usage:_

"[Context](/terms/context)'s getting heavy and I still have the test pass to do."

"Compact before you start — write what must survive into the summary prompt so the new session keeps the schema decisions and drops the exploration."
