---
title: "Automated review（自动化评审）"
source: "https://www.aihero.dev/ai-coding-dictionary/automated-review"
---

一个[agent](/terms/agent)评审另一个 agent 的工作，常配不同的[model](/terms/model)或[系统提示词](/terms/system-prompt)。非确定性：它形成判断。哪里都能跑——PR 合并前、提交历史的事后、会话中途作为[子智能体](/terms/subagent)。CI 里的 LLM-as-judge 是自动化评审，不是[自动化检查](/terms/automated-check)；定类别的是断言_做什么_，不是它在哪跑。

与干活的 agent 的分离，是它生效的原因。让写代码的 agent 评审自己的工作，得到的很少——产出 bug 的那个[会话](/terms/session)里也装着产出它的推理，agent 会把自己的结论读回来当确认。一个带着全新[上下文窗口](/terms/context-window)的评审者没有这份牵挂：它像一个陌生人那样看 diff，而这正是评审所依赖的。换一个模型或一套面向评审的系统提示词把这磨得更锋利——不同的盲区，而且系统提示词可以限定到你真正在乎的东西（安全、API 契约、性能），而不是含糊的"找找问题"。

它嵌在其他评审层之间。自动化检查是确定性的，抓机器可断言的；[人工评审](/terms/human-review)贵且最不 scale。自动化评审坐在中间：以机器的成本抓判断形状的问题——一个误导性的函数名、一个漏掉的边界情形。因为它非确定，它会漏东西、也会误报；把它当人看之前抬高下限的过滤器，不是取代人的闸门。

避免："AI review"/"agent review"——太含糊，分不清是不是指干活的 agent 本身。

用法：

"[AFK](/terms/afk)运行出来的坏 PR 太多了。"

"合并前加一道自动化评审——不同模型、独立系统提示词、限定在安全和契约变更上。"
