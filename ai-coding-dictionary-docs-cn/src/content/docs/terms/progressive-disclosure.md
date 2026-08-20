---
title: "Progressive disclosure（渐进披露）"
source: "https://www.aihero.dev/ai-coding-dictionary/progressive-disclosure"
---

只加载[agent](/terms/agent)当下需要的[上下文](/terms/context)，其余留在[上下文指针](/terms/context-pointer)后面。借自 UI 设计，那里它的意思是：只给用户看与当前任务相关的控件，其余藏在一次点击之后。

这门技术存在，因为上下文是双重成本。预先加载的每个[token](/terms/token)，每[turn](/terms/turn)都按[输入 token](/terms/input-tokens)计费；而每个 token 都花[注意力预算](/terms/attention-budget)，无论 agent 需不需要。一份塞满完整风格指南、部署手册、数据库约定的[AGENTS.md](/terms/agents-md)，让 agent 在所有这些上都变差——当前任务要紧的指令，被不相干的那些稀释。信号是 agent 无视你明知在它上下文里的规则：规则在，但被埋着。

渐进披露把它反过来。常驻层保持小——每个主题一句话、一个指向细节所在处的指针。agent 写组件时读风格指南，部署时读部署手册，修测试时两者都不读。[技能](/terms/skill)是内建于[harness](/terms/harness)的这个模式：一段短描述每个[会话](/terms/session)加载，完整指令只在触发时加载。

用法：

"要不要把整份风格指南倒进 AGENTS.md？"

"不——渐进披露。把风格指南引用成一个技能，agent 真要写组件时才加载。AGENTS.md 可是每 turn 都付 token 成本的。"
