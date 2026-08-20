---
title: "Clearing（清空）"
source: "https://www.aihero.dev/ai-coding-dictionary/clearing"
---

结束当前[会话](/terms/session)，开启新的。下一条消息以空会话、空[上下文窗口](/terms/context-window)开始。通常由用户驱动。

清空是被污染上下文的解药。一个会话积累一切：失败的尝试、走错的弯、过期的[工具结果](/terms/tool-result)、被放弃的计划。[model](/terms/model)每[turn](/terms/turn)重读全部，坏历史拖累新工作。长会话深处，[agent](/terms/agent)变得含糊而不听话——你给得清清楚楚的指令被无视，质量滑落，催它做好也没用，因为它蹚的噪音仍在它的[上下文](/terms/context)里。清空移除噪音。

清空不抹掉对话。多数[harness](/terms/harness)把会话历史留在你电脑上，转录还在，可读可恢复。没了的是 agent 的工作状态：模型[无状态](/terms/stateless)，新会话对旧会话所知一无所知。如果会话里有下一个会话需要的决定或进展，先让 agent 写一份[交接产物](/terms/handoff-artifact)，再开新会话指向它。

对比[压缩](/terms/compaction)——后者把会话摘要进新上下文，而不是从空开始。清空是更钝的工具：什么都不带走，包括垃圾。

用法：

"它卡在失败的测试上打转。"

"直接清空——带着计划文档和测试文件开个新会话。没必要跟现有上下文缠斗。"
