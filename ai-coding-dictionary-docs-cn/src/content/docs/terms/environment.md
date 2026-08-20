---
title: "Environment（环境）"
source: "https://www.aihero.dev/ai-coding-dictionary/environment"
---

[agent](/terms/agent)作用于其上的世界——[harness](/terms/harness)之外的任何东西，agent 经[工具结果](/terms/tool-result)感知它、经[工具调用](/terms/tool-call)改变它。harness_运行_agent；环境是 agent_工作于其中_的东西。像[`AGENTS.md`](/terms/agents-md)这样的文件住在环境里；harness 是把它加载进[上下文窗口](/terms/context-window)的那位。[文件系统](/terms/filesystem)是最常见的环境，但不是唯一的（一个数据库、一个远程 API、一个浏览器会话都可以是环境）。

agent 只在看的时候才看见环境。它对环境的全部认知都经工具结果抵达，所以它的图景是一堆快照，每张在拍摄那一刻准确。如果 agent 读完一个文件后文件变了——你手改了它、一个构建步骤重新生成了它——agent 就继续从过期副本推理，直到有什么促使它重读。一个自信地描述着一个早已不是那样的文件的 agent，通常是这个：环境动了，快照没动。

环境也是持久的那一层——唯一永远[有状态](/terms/stateful)的一层。[会话](/terms/session)的上下文随会话结束而消失，但写进环境的文件留给下一个会话去读——[记忆系统](/terms/memory-system)、[交接产物](/terms/handoff-artifact)和 `AGENTS.md` 靠的正是这个。agent 明天还该知道的一切，最终都得进环境。

环境多大由你定。[沙箱](/terms/sandbox)缩小它，限制 agent 的够及；加一个[工具](/terms/tool)扩展它，把一个数据库或 API 纳入够及。边界之内是 agent 能感知和改变的；边界之外对 agent 不存在。环境被设置得多好、多支持 agent 的工作，就是代码库的[AX](/terms/ax)。

避免：用"environment"指运行时或 harness 本身——harness 是包装壳，环境是工作区。

用法：

"agent 看不见预发库的 schema。"

"把它接进环境——给一个限定预发只读的 `psql` 工具。harness 没问题，它只是没有可作用的对象。"
