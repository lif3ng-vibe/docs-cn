---
title: "Tool（工具）"
source: "https://www.aihero.dev/ai-coding-dictionary/tool"
---

[harness](/terms/harness)暴露给[agent](/terms/agent)调用的函数——Read、Write、Bash、Search。工具是 agent 感知和作用于[环境](/terms/environment)的方式：除经[工具结果](/terms/tool-result)外它看不见环境，除经[工具调用](/terms/tool-call)外它改不了环境。每次工具调用多花一次[模型提供商请求](/terms/model-provider-request)，因为结果必须先回模型，它才能决定下一步。

多数编码 agent 随附的工具：

| 工具 | 做什么 |
| --- | --- |
| Read | 把一个文件的内容作为工具结果返回 |
| Write | 在[文件系统](/terms/filesystem)里创建或编辑文件 |
| Bash | 跑一条 shell 命令并返回输出 |
| Search | 在代码库里找匹配某个模式的文件或文本 |

一个工具由三样东西定义：名字、做什么的描述、参数的 schema。harness 把这些定义随每次请求发给[model](/terms/model)，模型挑工具的方式和它产出一切的方式相同——写[token](/terms/token)，这里是带参数的结构化调用。模型自己从不执行任何东西；harness 读到调用，跑函数，送回结果。

工具清单划定 agent 能做什么。一个能力强的模型配一套窄的工具，就是一个窄的 agent：它会把一切绕到手里有的东西上，这正是 agent 重度依赖 Bash 的原因——一个 shell 就是一个够得着系统大半的工具。要干净地给 agent 一项能力，就为它加一个工具；[MCP](/terms/mcp)是从 harness 之外接入工具的标准。

工具定义每次请求都占[上下文](/terms/context)，所以一大套工具有一笔还没调用就存在的常驻成本——而且一堆描述相近的工具，会让模型更挑不对那个对的。

用法：

"agent 能直接查预发库吗？"

"给 harness 加一个 `psql` 工具，限定预发只读。没有对应工具，agent 对文件系统之外的一切是盲的。"
