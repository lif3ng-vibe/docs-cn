---
title: "Memory system（记忆系统）"
source: "https://www.aihero.dev/ai-coding-dictionary/memory-system"
---

让[agent](/terms/agent)跨[会话](/terms/session)[有状态](/terms/stateful)的一套系统。会话期间把信息持久化进[环境](/terms/environment)，未来会话开始时重载进[上下文窗口](/terms/context-window)，于是 agent 在用户[清空](/terms/clearing)会话之后仍带着连续性。

记忆系统有两半。写路径：会话期间，agent 把学到的东西——你声明的偏好、关于项目的一个事实——记成环境里的文件。读路径：会话开始时，[harness](/terms/harness)把这些文件（或它们的索引）加载回上下文窗口。许多 harness 自带记忆系统——Claude Code 的 `/memory` 是一个——你也可以自己搭：一个笔记目录加[AGENTS.md](/terms/agents-md)里一条"查阅它"的指令。

任何常驻加载内容面临的取舍在这里同样成立。记忆会积累，所以多数系统只加载一行索引，正文留在[上下文指针](/terms/context-pointer)之后，而不是全部内联。而记忆是[二手来源](/terms/secondary-source)，所以会漂移：三月记下的事实，在项目早已前行的六月，以同等的自信被加载。记忆系统需要修剪，和 AGENTS.md 一样。

用法：

"我总得重新告诉它我用的是 Postgres，不是 MySQL。"

"接一套记忆系统——第一[turn](/terms/turn)把学到的写进[文件系统](/terms/filesystem)，会话开始时重载。[model](/terms/model)本身[无状态](/terms/stateless)；记忆层伪造连续性。"
