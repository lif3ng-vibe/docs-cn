---
title: "Stateless（无状态）"
source: "https://www.aihero.dev/ai-coding-dictionary/stateless"
---

不向前携带任何信息。[model](/terms/model)在[模型提供商请求](/terms/model-provider-request)之间无状态——每次请求重发整个[上下文窗口](/terms/context-window)，因为模型没有别的办法看见任何东西。[agent](/terms/agent)默认在[会话](/terms/session)之间无状态：新会话从空开始，不带先前会话的痕迹。与[有状态](/terms/stateful)相对。

模型本身永久无状态：它的[参数](/terms/parameters)在[训练](/terms/training)后冻结，你在[推理](/terms/inference)时做的任何事都改变不了它们。模型不从你的纠正中学习，不记得昨天被告知过同样的事，也不会渐渐认识你——无论对话给你多少相反的感觉。会话内的连续感由[harness](/terms/harness)制造：它保管对话记录，随每次请求重发。模型不是在记住对话；它是在重读对话。

实际推论：要有什么东西跨会话被记住，你必须把它写到一个 agent 会回头读的地方。[AGENTS.md](/terms/agents-md)文件、[记忆系统](/terms/memory-system)、[交接产物](/terms/handoff-artifact)正是这种东西——被加载进未来会话[上下文](/terms/context)的文件，替模型顶上它没有的记忆。当 agent 反复犯一个你纠正过的错，问题不是它为什么没学会——它不能——而是那条纠正该写到哪里，好让未来的每个会话都读到。

用法：

"为什么每次我[清空](/terms/clearing)之后它就忘了约定？"

"模型无状态——新会话从空开始。想留住就写进 AGENTS.md 或一个 harness 在会话开始时加载的记忆文件。"
