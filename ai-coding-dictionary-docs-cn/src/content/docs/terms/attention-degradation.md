---
title: "Attention degradation（注意力退化）"
source: "https://www.aihero.dev/ai-coding-dictionary/attention-degradation"
---


As a [session](/terms/session) grows, each [token](/terms/token)'s [attention budget](/terms/attention-budget) is spread across more competitors. The signal on any one [meaningful relationship](/terms/attention-relationship) shrinks; noise from irrelevant [context](/terms/context) crowds in. Same [model](/terms/model), same [parameters](/terms/parameters) — just more mouths to feed from the same plate. Cause of the smart zone / dumb [zone effect](/terms/smart-zone).

It presents as the model getting worse mid-session: constraints it followed for an hour start slipping, it re-asks things it was told, it writes code that ignores a file it read earlier. Nothing about the model changed — the only variable is how much context it's now attending over.

It's gradual, which is what makes it hard to catch from inside the session. There's no error and no threshold; each [turn](/terms/turn) is only slightly worse than the last, and by the time the slips are obvious you've been in the dumb zone for a while.

You recover by removing context, not adding more. Re-pasting the ignored instruction adds another competitor to the same crowded window and helps only briefly. What works: [clear](/terms/clearing) and reload only what the task needs, or [compact](/terms/compaction), or [hand off](/terms/handoff) to a fresh session. Treat declining instruction-following as a signal about context length, not about the model.

_Usage:_

"It's deep in the dumb zone — inventing generics that aren't in the type file."

"Attention degradation. The type definitions are still in context, but the signal on them is buried under everything we've added since. Clear and reload."
