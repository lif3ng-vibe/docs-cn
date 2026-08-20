---
title: "Skill（技能）"
source: "https://www.aihero.dev/ai-coding-dictionary/skill"
---

一个作为单元打包的可教能力——把一件事做好的指令与资源，放在[环境](/terms/environment)里，等一个[上下文指针](/terms/context-pointer)为手头任务把它拉进[上下文窗口](/terms/context-window)。[harness](/terms/harness)中[渐进披露](/terms/progressive-disclosure)的单元。

技能是一个开放标准，定义在 [agentskills.io](https://agentskills.io)——最初由 Anthropic 开发，此后被多数主流 harness 采纳，所以一次写成的技能跨它们通用。格式是一个文件夹，内含：

- 一个 `SKILL.md` 文件——元数据（至少名字和描述）加指令本身
- 可选，[agent](/terms/agent)能运行的脚本
- 可选，指令指向的模板和参考材料

默认只有名字和描述待在[上下文](/terms/context)里。agent 的任务匹配时，它加载其余。在那之前，技能几乎不占地方——一两句话的[token](/terms/token)，无论它的完整指令多大。

这把技能和[AGENTS.md](/terms/agents-md)区分开——后者无论任务如何都加载进每个[会话](/terms/session)。技能在一类工作出现时被读——发版、脚手架一个新服务、写一个迁移——其余时间被忽略。

避免："[工具](/terms/tool)"——工具是 agent_调用_的；技能是它_读_的指令。

用法：

"部署手册放哪？"

"做成技能——agent 只在任务涉及部署时才加载。放进 AGENTS.md 的话，一件我们每周用一次的事，每[turn](/terms/turn)都在烧 token。"
