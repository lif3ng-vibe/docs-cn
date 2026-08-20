---
title: "Permission mode（权限模式）"
source: "https://www.aihero.dev/ai-coding-dictionary/permission-mode"
---


The permission-gating slice of an [agent mode](/terms/agent-mode) — which [tool calls](/terms/tool-call) trigger a [permission request](/terms/permission-request) and which run automatically. The original purpose of mode systems before [harnesses](/terms/harness) started bundling behavioral instructions on top.

Harnesses ship a ladder of these modes:

| Mode               | Reads | Writes & shell         | Typical use                                     |
| ------------------ | ----- | ---------------------- | ----------------------------------------------- |
| Read-only / plan   | Auto  | Blocked                | Research, planning, reviewing                   |
| Default            | Auto  | Ask                    | Day-to-day supervised work                      |
| Auto-edit          | Auto  | Edits auto, shell asks | Trusted repos, mechanical changes               |
| "Yolo" / full-auto | Auto  | Auto                   | [Sandboxes](/terms/sandbox), [AFK](/terms/afk) runs |

Choosing a rung is a trade between safety and interruption, and both failure modes are felt. Too tight, and you become the bottleneck: the [agent](/terms/agent) stops every few seconds for harmless reads, you click approve on autopilot, and the approvals stop meaning anything — rubber-stamping is the worst of both worlds, all the interruption with none of the protection. Too loose, and the agent edits files and runs commands you'd have wanted to see first.

The loose end is most defensible inside a sandbox, where the blast radius of a bad [tool](/terms/tool) call is contained. Outside one, most people settle on auto-approving reads and keeping a [human in the loop](/terms/human-in-the-loop) for anything irreversible.

_Usage:_

"It paused on every grep — totally killed the AFK run."

"Loosen the permission mode for read-only tools, keep prompting on writes and shell. Most permission requests on a research [session](/terms/session) are noise."
