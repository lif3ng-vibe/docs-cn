---
title: "DX（开发者体验）"
source: "https://www.aihero.dev/ai-coding-dictionary/dx"
---

Developer experience（开发者体验）——一个代码库及其工具链让人做好工作有多容易。好的 DX 是快的反馈、清晰的报错、能回答你真正所问的文档、一次就通的安装配置。这个词远早于 AI 编码；它进本词典主要是作为[AX](/terms/ax)的对照。

DX 是人与代码库之间的交互——仅此而已。两类受众的主要差别是：人[有状态](/terms/stateful)，agent[无状态](/terms/stateless)。人学习一次代码库，此后每天带着这份知识，这正是差 DX 也能活的原因：他们用攒批 push 绕开慢 CI，用去 Slack 问一次绕开缺失的文档，用记住东西在哪绕开混乱的结构。变通积累起来，一个团队于是在一个和他们作对的代码库里干得有声有色。

[Agent](/terms/agent)面对同一个代码库，没有这份积累。跨[会话](/terms/session)无状态，agent 每次从头重新学代码库——快的测试套件和清晰的报错它受益，但它昨天搞明白的任何东西都没了，除非被写进[环境](/terms/environment)，而 agent 只经[工具结果](/terms/tool-result)感知环境。这就是 AX 命名的缺口：当开发者是 agent 时仍然幸存的那些 DX，加上人类没有的顾虑，比如保持[上下文窗口](/terms/context-window)的空余。

重叠意味着 DX 投资常常免费改善 AX——严格的类型、快的测试、可预测的结构对两边都有益。分歧意味着不总是：一份漂亮的新人文档帮人一周、帮 agent 零——除非从[AGENTS.md](/terms/agents-md)够得着。

用法：

"我们 DX 挺好——新员工一周就上手。"

"上手是因为那一周有人挨着坐。agent 没有那一周；把 AX 单独查一遍。"
