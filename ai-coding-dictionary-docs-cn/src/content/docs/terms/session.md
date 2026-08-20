---
title: "Session（会话）"
source: "https://www.aihero.dev/ai-coding-dictionary/session"
---

与[agent](/terms/agent)的一段有界交互。从空开始，积累消息、[工具结果](/terms/tool-result)和读过的文件，在[清空](/terms/clearing)、关闭、或被[压缩](/terms/compaction)成新会话时结束。会话正是_填满_[上下文窗口](/terms/context-window)的东西：如果说上下文窗口是箱子，会话就是慢慢把它装满的物件。装不进单个上下文窗口的工作，必须拆到多个会话里。

会话的消息历史是 agent 的工作记忆。[model](/terms/model)是[无状态](/terms/stateless)的，所以它表面记得的一切——你要过什么、测试说了什么、它三轮前决定过什么——都在消息历史里，随每次[模型提供商请求](/terms/model-provider-request)重发。不在会话里的东西，对 agent 来说不存在。

那段记忆随会话一起终结。新会话从零开始：昨天会话结束时还熟悉你代码库的 agent，今天早上对此一无所知。活下来的是[文件系统](/terms/filesystem)——一个会话里写的文件，下一个会话能读，[handoff](/terms/handoff)、[记忆系统](/terms/memory-system)和[AGENTS.md](/terms/agents-md)靠的正是这个。

会话在哪结束由你选。会话里的一切影响之后的每个[turn](/terms/turn)，所以塞在一个会话里的不相关任务会留下残渣，染脏下一个回答。一个会话一个任务，让上下文保持相关；做完一个任务正是清空的自然时点。

用法：

"一个会话能跑多久才散架？"

"看活儿——聚焦的重构比开放式调研保持锋利更久。会话一虚胖，就交接或压缩，别硬推。"
