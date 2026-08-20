---
title: "Output tokens（输出 token）"
source: "https://www.aihero.dev/ai-coding-dictionary/output-tokens"
---


[Tokens](/terms/token) the [model](/terms/model) generates back. Billed at a higher rate than [input tokens](/terms/input-tokens) — commonly around five times the rate — since they cost more compute to produce.

Everything the model writes counts: the prose you read, the code it emits, [tool calls](/terms/tool-call), and any extended thinking the model does before answering. That last one surprises people — reasoning tokens are billed as output even when the [harness](/terms/harness) often doesn't show them to you, and turning up [effort](/terms/effort) spends more of them.

Output tokens also set the pace of a [session](/terms/session). The model reads input quickly but generates output one token at a time, so when a [turn](/terms/turn) feels slow, it's almost always the output being written, not the input being read. A long wait usually means a long answer is coming.

_Usage:_

"The refactor session is burning through credit even though the inputs are small."

"Agent's rewriting whole files instead of patching. Output tokens cost roughly five times the input rate — get it emitting edits and the bill drops."
