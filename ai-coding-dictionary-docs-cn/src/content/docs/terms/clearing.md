---
title: "Clearing（清空）"
source: "https://www.aihero.dev/ai-coding-dictionary/clearing"
---


Ending the current [session](/terms/session) and starting a fresh one. The next message begins with an empty session and an empty [context window](/terms/context-window). Usually user-driven.

Clearing is the cure for a polluted context. A session accumulates everything: failed attempts, wrong turns, stale [tool results](/terms/tool-result), abandoned plans. The [model](/terms/model) re-reads all of it on every [turn](/terms/turn), and bad history drags on new work. Deep into a long session the [agent](/terms/agent) gets vaguer and less obedient — instructions you gave clearly get ignored, quality slips, and prodding it to do better doesn't help, because the noise it's wading through is still in its [context](/terms/context). Clearing removes the noise.

Clearing doesn't erase the conversation. Most [harnesses](/terms/harness) keep session history on your computer, so the transcript is still there to read or resume. What's gone is the agent's working state: the model is [stateless](/terms/stateless), so the new session knows nothing the old one knew. If the session holds decisions or progress the next one will need, have the agent write a [handoff artifact](/terms/handoff-artifact) first, then start the new session by pointing at it.

Compare [compaction](/terms/compaction), which summarises the session into the new context instead of starting empty. Clearing is the blunter tool: nothing carries over, including the junk.

_Usage:_

"It's stuck looping on the failing test."

"Just clear it — start a fresh session with the plan doc and the test file. No point fighting the existing context."
