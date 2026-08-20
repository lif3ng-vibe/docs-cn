---
title: "Context window（上下文窗口）"
source: "https://www.aihero.dev/ai-coding-dictionary/context-window"
---


Everything the [model](/terms/model) sees on each [model provider request](/terms/model-provider-request). Finite, model-specific, and the _only_ surface through which the model perceives anything.

It's a single sequence of [tokens](/terms/token): the [system prompt](/terms/system-prompt), the conversation so far, every [tool result](/terms/tool-result) the [harness](/terms/harness) has fed back in. If something is in that sequence, the model can use it; if it isn't, the model doesn't know it exists — not your codebase, not the file you edited yesterday, not the instruction you gave three sessions ago. Anything outside the window has to be brought in, usually via a [tool call](/terms/tool-call), before it can affect anything.

Finite means it fills up. Every turn appends more — your messages, the model's responses, tool results — and a long [session](/terms/session) will eventually hit the limit, forcing [compaction](/terms/compaction) or [clearing](/terms/clearing). It also means everything in the window competes: each token you load is one less available for the rest, and content you didn't need still occupies the model's [attention](/terms/attention-budget). The practical stance is to treat the window as a budget — load what the task needs, leave the rest out.

_Avoid:_ "memory" — the context window is working state and doesn't persist across sessions. [Memory](/terms/memory-system) is a separate concept layered on top.

_Usage:_

"Can I just paste the whole monorepo into the prompt?"

"The context window's 200k tokens — that's maybe a fifth of the repo. Pick the files the task touches, leave the rest behind a tool call."
