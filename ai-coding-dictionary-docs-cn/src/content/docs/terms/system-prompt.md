---
title: "System prompt（系统提示词）"
source: "https://www.aihero.dev/ai-coding-dictionary/system-prompt"
---

[harness](/terms/harness)前缀在每次[模型提供商请求](/terms/model-provider-request)开头的指令——[agent](/terms/agent)的常驻简报：它是谁、该怎么行事、能调哪些[工具](/terms/tool)、遵循什么约定。通常在一个[会话](/terms/session)内保持不变。

系统提示词由 harness 厂商写的，不是你写的，而且在编码 harness 里它很大——常常几万[token](/terms/token)的行为规则、工具描述、边界情形处理，全部按[输入 token](/terms/input-tokens)在每[turn](/terms/turn)付费。你自己的常驻指令搭它的车：像[AGENTS.md](/terms/agents-md)这样的文件在会话开始时加载到系统提示词旁边，于是[model](/terms/model)先一起读厂商的简报和你的，然后才见到你的消息。

因为它在每次请求上都相同，它构成[前缀缓存](/terms/prefix-cache)的起点——这也是 harness 让它整个会话固定、而不是边跑边改的部分原因。

模型被训练成把系统提示词置于用户消息之上。所以当一个 agent 固守一个你从没要过的约定、或用一种你甩不掉的格式输出时，它通常是在服从系统提示词——你的消息在输掉这场争论。有些 harness 可定制：给你系统提示词的完整访问权，你能读到 agent 实际被告知的内容并修改它。

用法：

"两个 harness、同一个模型，同一条提示词行为完全不同。"

"系统提示词不同。一个调成精简代码编辑，一个调成讲解——分歧在那儿，早在你的消息到达之前。"
