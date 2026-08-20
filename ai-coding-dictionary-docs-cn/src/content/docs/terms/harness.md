---
title: "Harness（智能体运行框架）"
source: "https://www.aihero.dev/ai-coding-dictionary/harness"
---


Everything around the [model](/terms/model) that turns it into an [agent](/terms/agent): [tools](/terms/tool), [system prompt](/terms/system-prompt), [context-window management](/terms/context-window), permissions, hooks. **Claude.ai** and **Claude Code** run on the same model but behave differently because their harnesses differ.

The model itself only does one thing: take text in, produce text out. It can't read a file, run a command, or remember the last [turn](/terms/turn). The harness supplies all of that. It assembles the [context](/terms/context) for each [model provider request](/terms/model-provider-request), executes the [tool calls](/terms/tool-call) the model asks for, feeds the [tool results](/terms/tool-result) back in, stores the [session](/terms/session) history, asks you for permission before risky actions, and decides when to [compact](/terms/compaction). The agent loop — model proposes, harness executes, repeat — is run by the harness.

This matters for diagnosis. When behaviour differs between two products, or between yesterday and today, the model is often not the variable — the harness is. A different system prompt, a different set of tools, a changed permission default, or a new context-management strategy all change behaviour without any change to the model. It also means the harness is where most of your configuration lives: [AGENTS.md](/terms/agents-md) files, permission settings, and hooks are all instructions to the harness, not the model.

Examples: Claude Code, Cursor, Codex CLI — and Claude.ai, which is a chat harness rather than a coding one.

_Usage:_

"Same model, why is Claude Code editing files and Claude.ai just answering questions?"

"Different harnesses — Claude Code has [filesystem](/terms/filesystem) tools, a different system prompt, and a permission layer. The model isn't the variable here."
