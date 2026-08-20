---
title: "Stateful（有状态）"
source: "https://www.aihero.dev/ai-coding-dictionary/stateful"
---

向前携带信息。一个[会话](/terms/session)跨[turn](/terms/turn)有状态——[上下文](/terms/context)随会话累积，这正是长会话会漂进笨区的原因（见[smart zone](/terms/smart-zone)）。一个[agent](/terms/agent)可以跨**会话**有状态，靠加装一个[记忆系统](/terms/memory-system)：把信息持久化进[环境](/terms/environment)，在未来会话开始时重新加载。[model](/terms/model)永远不会有状态；任何表面的连续性都是[harness](/terms/harness)在重新喂上下文。与[无状态](/terms/stateless)相对。

状态住在每一层的位置：

| 层 | 有状态吗 | 怎么做到 |
| --- | --- | --- |
| Model | 永不 | [参数](/terms/parameters)冻结；它只看到每次请求里的东西 |
| Session | 跨轮 | harness 把每条消息和[工具结果](/terms/tool-result)追加进上下文 |
| Harness | 跨会话 | 记忆文件、[AGENTS.md](/terms/agents-md)、[交接产物](/terms/handoff-artifact)——写下来，之后再加载 |
| Environment | 永远 | 文件持续存在，无论有没有会话在跑 |

每一层的有状态，都是靠重读低一层存下的东西建成的：会话显得连续，是因为 harness 向无状态的模型重发消息历史；agent 跨会话记得，是因为 harness 从环境重载文件。没有任何状态存在模型本身。

状态不总是想要的。一切被带向前的东西都影响接下来的，所以会话早期立下的错误假设也会被带向前。[清空](/terms/clearing)就是有意丢弃会话状态、从写下的东西重启的那个动作。

用法：

"它记得我昨天的偏好——这是模型学会了吗？"

"不，agent 有状态是因为 harness 把它们写进了记忆文件、在会话开始时重载。模型本身对昨天一无所见。"
