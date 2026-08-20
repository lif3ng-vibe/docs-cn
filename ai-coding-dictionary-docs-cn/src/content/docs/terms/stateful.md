---
title: "Stateful（有状态）"
source: "https://www.aihero.dev/ai-coding-dictionary/stateful"
---


Carries information forward. A [session](/terms/session) is stateful across [turns](/terms/turn) — [context](/terms/context) accumulates as the session runs, which is why long sessions drift into the [dumb zone](/terms/smart-zone). An [agent](/terms/agent) can be made stateful across **sessions** by adding a [memory system](/terms/memory-system) that persists information into the [environment](/terms/environment) and reloads it at the start of future sessions. The [model](/terms/model) is never stateful; any apparent continuity is the [harness](/terms/harness) re-feeding context. Counterpart to [stateless](/terms/stateless).

Where state lives at each layer:

| Layer       | Stateful?       | How                                                                                                                    |
| ----------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Model       | Never           | [Parameters](/terms/parameters) are frozen; it sees only what's in each request                                          |
| Session     | Across turns    | The harness appends every message and [tool result](/terms/tool-result) to the context                                 |
| Harness     | Across sessions | Memory files, [AGENTS.md](/terms/agents-md), [handoff artifacts](/terms/handoff-artifact) — written down, reloaded later |
| Environment | Always          | Files persist whether or not any session is running                                                                    |

Each layer's statefulness is built by re-reading something stored a layer below: the session feels continuous because the harness re-sends the message history to the stateless model, and the agent remembers across sessions because the harness re-loads files from the environment. No state is ever stored in the model itself.

State isn't always wanted. Everything carried forward influences what comes next, so a wrong assumption made early in a session is carried forward too. [Clearing](/terms/clearing) is the deliberate act of throwing session state away and starting from what's written down.

_Usage:_

"It remembered my preferences from yesterday — does that mean the model learned them?"

"No, the agent's stateful because the harness wrote them to a memory file and reloaded them at session start. The model itself saw nothing of yesterday."
