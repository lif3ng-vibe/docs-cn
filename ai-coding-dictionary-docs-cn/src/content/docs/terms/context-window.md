---
title: "Context window（上下文窗口）"
source: "https://www.aihero.dev/ai-coding-dictionary/context-window"
---

[model](/terms/model)在每次[模型提供商请求](/terms/model-provider-request)看到的一切。有限、随模型而异，而且是模型感知任何事物的_唯一_界面。

它是单条[token](/terms/token)序列：[系统提示词](/terms/system-prompt)、至此的对话、[harness](/terms/harness)喂回的每个[工具结果](/terms/tool-result)。在这条序列里的，模型就能用；不在的，模型就不知道它存在——你的代码库、你昨天编辑的文件、你三个会话前给的指令，都不知道。窗口外的任何东西要产生影响，必须先被带进来，通常经由一次[工具调用](/terms/tool-call)。

有限意味着会填满。每轮追加更多——你的消息、模型的回答、工具结果——长[会话](/terms/session)终会撞上上限，逼出[压缩](/terms/compaction)或[清空](/terms/clearing)。它也意味着窗口内的一切在互相竞争：你加载的每个 token 都是从其余那里拿走一个，而你不需要的内容仍占着模型的[注意力](/terms/attention-budget)。实际的姿态是把窗口当预算——任务要什么装什么，其余留在门外。

避免："memory"——上下文窗口是工作状态，不跨会话持久。[记忆](/terms/memory-system)是叠在上面另一个概念。

用法：

"能不能把整个 monorepo 直接粘进提示词？"

"上下文窗口 200k token——大约是仓库的五分之一。挑任务碰的那些文件，其余留在工具调用之后。"
