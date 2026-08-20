---
title: "AFK（离开键盘）"
source: "https://www.aihero.dev/ai-coding-dictionary/afk"
---


Away from keyboard. A working pattern where the user kicks off a [session](/terms/session) and leaves the [agent](/terms/agent) to run unattended. The throughput multiplier of [AI](/terms/ai) coding — many AFK sessions can run in parallel while you sleep, eat, or work on something else. Usually requires a permissive [permission mode](/terms/permission-mode) plus [sandboxing](/terms/sandbox) to be safe.

When you're not there, the agent handles ambiguity differently. While you're watching, an ambiguous decision surfaces as a question and you answer it; once you've walked away, the agent picks a default and keeps going, and every later decision builds on that guess. The characteristic failure is coming back to hours of finished, confident work built on a wrong call made in the first ten minutes. The work isn't sloppy — it's coherent, just coherent about the wrong thing.

Since you can't give input during the run, give it before and after instead. Before: resolve the ambiguity up front — a [grilling](/terms/grilling) session, a written [spec](/terms/spec) — so there are fewer gaps for the agent to fill alone. During: [automated checks](/terms/automated-check) and [automated review](/terms/automated-review) stand in for the attention you're not giving, failing fast on what can be caught mechanically. After: the run ends in something reviewable — a PR, not changes already merged. AFK doesn't remove [human review](/terms/human-review); it defers all of it to the end, which is why what arrives at the end has to be worth reviewing. This is also why [AX](/terms/ax) matters most in AFK runs — with no one watching, the environment is the only support the agent gets.

_Avoid:_ "background agent" — centers the machine ("running in the background") rather than the human pattern ("user has walked away"). AFK names the fact that matters: the user isn't watching.

_Usage:_

"I'm running this AFK — three sandboxed agents on the refactor, reviewing the PRs in the morning."

"[Bypass permissions](/terms/agent-mode)?"

"Yeah, read-only [filesystem](/terms/filesystem), no network."
