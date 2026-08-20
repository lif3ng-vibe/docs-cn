---
title: "System prompt（系统提示词）"
source: "https://www.aihero.dev/ai-coding-dictionary/system-prompt"
---


The instructions the [harness](/terms/harness) prepends to every [model provider request](/terms/model-provider-request) — the [agent](/terms/agent)'s standing brief: who it is, how to behave, which [tools](/terms/tool) it can call, what conventions to follow. Usually stable across a [session](/terms/session).

The system prompt is written by the harness vendor, not by you, and in coding harnesses it's big — often tens of thousands of [tokens](/terms/token) of behavioural rules, tool descriptions, and edge-case handling, all paid as [input tokens](/terms/input-tokens) on every [turn](/terms/turn). Your own standing instructions ride along with it: files like [AGENTS.md](/terms/agents-md) are loaded next to the system prompt at the start of the session, so the [model](/terms/model) reads the vendor's brief and yours together before it ever sees your message.

Because it's identical on every request, it forms the start of the [prefix cache](/terms/prefix-cache) — which is part of why harnesses keep it fixed for a whole session rather than editing it as they go.

Models are trained to prioritise the system prompt over user messages. So when an agent insists on a convention you never asked for, or formats output in a way you can't shake, it's usually obeying its system prompt — and your message is losing the argument. Some harnesses are customisable: they give you full access to the system prompt, so you can read what the agent is actually being told and change it.

_Usage:_

"Two harnesses, same model, totally different behavior on the same prompt."

"Different system prompts. One's tuned for terse code edits, the other for explaining — that's where the divergence lives, before your message even arrives."
