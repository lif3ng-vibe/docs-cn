---
title: "Input tokens（输入 token）"
source: "https://www.aihero.dev/ai-coding-dictionary/input-tokens"
---


[Tokens](/terms/token) the [harness](/terms/harness) sends on each [model provider request](/terms/model-provider-request) — the [system prompt](/terms/system-prompt), the conversation history, [tool results](/terms/tool-result), everything the [model](/terms/model) reads before it writes. Billed at a lower rate than [output tokens](/terms/output-tokens), because they are less expensive to process than output tokens.

When doing [AI](/terms/ai) coding, input tokens make up most of your bill. The model is [stateless](/terms/stateless), so each [turn](/terms/turn) re-sends the entire [session](/terms/session) as input: your first message, every response, every tool result since. The input for turn fifty contains the previous forty-nine turns. A single model provider request might produce a few hundred output tokens but re-send a hundred thousand input tokens of accumulated history.

The [prefix cache](/terms/prefix-cache) reduces the cost: history that exactly matches a previous request is billed as cheap [cache tokens](/terms/cache-tokens) rather than full-price input. When input costs still hurt, the fix is to shrink what gets re-sent — [clearing](/terms/clearing) or [compacting](/terms/compaction) between tasks.

_Usage:_

"Bill's high but the [agent](/terms/agent)'s barely writing anything."

"It's the input tokens — every turn re-sends the whole session. Without the prefix cache you re-pay for the history each request."
