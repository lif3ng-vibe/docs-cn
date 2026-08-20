---
title: "Prefix cache（前缀缓存）"
source: "https://www.aihero.dev/ai-coding-dictionary/prefix-cache"
---


The [provider](/terms/model-provider)-side store that lets consecutive [model provider requests](/terms/model-provider-request) skip re-processing a shared prefix. When the start of a request matches the start of a recent one — same [system prompt](/terms/system-prompt), same history up to some point — the provider reuses its prior work and bills those [tokens](/terms/token) as [cache tokens](/terms/cache-tokens) at a much lower rate.

The cache pays off because sessions grow append-only. Every request re-sends the whole history as [input tokens](/terms/input-tokens) (see that entry for why), and in a normal [session](/terms/session) the history only changes at the end — each request is the previous one plus a few new messages. The provider processes the long shared beginning once, stores the result, and picks up from where the prefix ends. Without the cache, a 50-[turn](/terms/turn) session would pay to re-process turn one fifty times.

Caches also expire. How long an entry stays warm varies per model provider — typically minutes, not hours. Leave a session idle past the window and the next request rebuilds the prefix at full price once before caching resumes. This is mostly a [harness](/terms/harness) builder's concern; as a user, the visible effect is that requests after a long pause cost more than the ones before it.

_Usage:_

"Why did the bill spike halfway through the session?"

"Harness started injecting the current time into the system prompt every turn. Prefix cache breaks at the first changed token, so every request after that billed at full rate."
