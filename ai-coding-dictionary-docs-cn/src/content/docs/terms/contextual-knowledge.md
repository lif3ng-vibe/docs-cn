---
title: "Contextual knowledge（情境知识）"
source: "https://www.aihero.dev/ai-coding-dictionary/contextual-knowledge"
---

[agent](/terms/agent)此刻能直接从[上下文](/terms/context)里读到的事实——用户的任务、agent 读进来的文件、[工具结果](/terms/tool-result)、[会话](/terms/session)开始时加载的[AGENTS.md](/terms/agents-md)内容。与[参数化知识](/terms/parametric-knowledge)相对：参数化是从参数里_回忆_；情境化是从[窗口](/terms/context-window)里_阅读_。agent 基于情境知识工作时，[幻觉](/terms/hallucination)少得多——答案就在眼前，不是从模糊的记忆里打捞。

两种知识里，只有情境知识在你的控制之下。参数冻结，所以给[model](/terms/model)它缺的知识的唯一办法——一个内部 SDK、一个[知识截止点](/terms/knowledge-cutoff)之后发布的库、一个昨天做的决定——就是放进上下文。大量实际的[AI](/terms/ai)编码工作归结为这一件事：在模型需要的那一刻，把正确的事实摆到它面前。

情境知识与参数化知识冲突时，情境通常赢。贴上当前的 API 文档，模型就跟着文档而非它对旧 API 的过期记忆——不过旧版本仍可能渗出来，尤其在长会话深处。如果文档已加载、agent 却不断退回过时模式，那是参数化知识越过了情境知识；重申纠正、或把它挪到离工作更近处，会有帮助。

与参数化知识不同，情境知识用起来有成本。加载进窗口的一切都花[token](/terms/token)、都争抢模型的[注意力预算](/terms/attention-budget)，所以多装不自动更好——目标是相关的事实进窗口，不是全部事实进窗口。

_用这个词_只在和参数化知识对照时；否则直接说**上下文（context）**。

避免："working memory"——情境知识是_此刻_窗口里的东西；[记忆系统](/terms/memory-system)是把跨会话内容弄进窗口的机制。两个尺度，别混为一谈。

用法：

"为什么我贴文档它就答对 API，不贴就编？"

"文档在，就是情境知识——照页读。不在，就是参数化，冷门端点就糊。"
