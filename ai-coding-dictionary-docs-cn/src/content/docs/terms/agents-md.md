---
title: "AGENTS.md（智能体说明文件）"
source: "https://www.aihero.dev/ai-coding-dictionary/agents.md"
---

[环境](/terms/environment)里的一个文件，[harness](/terms/harness)在[会话](/terms/session)开始时加载进[上下文窗口](/terms/context-window)——项目给[agent](/terms/agent)的常驻简报。跨 harness 的通用约定；有些 harness 还有自己的变体（Claude Code 的是 CLAUDE.md）。

因为它自动加载，它是免于跨会话重复自己的办法之一。[model](/terms/model)[无状态](/terms/stateless)——一个会话里给的纠正，下一个会话就没了，于是你只好告诉每个新会话：项目用 pnpm、测试要带某个旗标跑、那个目录是生成的别碰。同一件事纠正过 agent 两遍时，那条纠正就是 AGENTS.md 的候选行。

合适的内容是 agent 没法从代码推导的东西：构建与测试命令、代码库不显眼的约定、硬约束（"绝不编辑生成的 client"）。短而声明式——它是简报，不是文档。

代价是里面的东西永远在加载。指令越积越多，多数与任何给定任务无关，一份很长的 AGENTS.md 既花 token 又稀释自己——上下文里的指令越多，模型可靠遵循其中任何一条的程度越低。

避免：把应该[渐进披露](/terms/progressive-disclosure)的内容放进 AGENTS.md——里面的任何东西，每个[turn](/terms/turn)、每个会话都付[token](/terms/token)成本，无论那个会话需不需要。风格指南可以放进一个[技能](/terms/skill)或一个[上下文指针](/terms/context-pointer)后面；AGENTS.md 只留给处处适用的那些行。

用法：

"为什么每个会话一开场就烧了 4k token？"

"查查 AGENTS.md——有人把整份风格指南粘进去了，而不是放到一个技能后面。"
