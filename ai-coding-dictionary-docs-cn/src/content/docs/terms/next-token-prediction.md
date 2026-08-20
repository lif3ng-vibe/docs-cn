---
title: "Next-token prediction（下一 token 预测）"
source: "https://www.aihero.dev/ai-coding-dictionary/next-token-prediction"
---

[model](/terms/model)实际做的事。给定[上下文](/terms/context)，采样出下一个[token](/terms/token)，追加，再跑一轮。一切输出——一句话、一次[工具调用](/terms/tool-call)、一个千行文件——都是一次一个 token 搭出来的。模型没有别的运行模式。

每一步都一样：[上下文窗口](/terms/context-window)里的 token 被送过[参数](/terms/parameters)，产出一整套词表上每个 token 的概率——这个很可能是下一个，那个次之。从这些概率里采样出一个 token，追加，循环用稍长的上下文再跑。正是那个采样步骤，让同一条提示词在不同运行里产出不同的输出：[非确定性](/terms/non-determinism)内建于机制，不是叠在上面的 bug。

咬住这个机制，能解释一些看着奇怪的行径。模型在吐出一个 token 之前从不检查它是否_为真_——只检查它是否_大概率_——这是[幻觉](/terms/hallucination)的根。它边走边押注每个 token，所以一个听着笃定的开场句能把后面的回答整个带偏。而[输出 token](/terms/output-tokens)严格一次一个地产出，所以生成速度给任何[agent](/terms/agent)的工作速度垫了底。

用法：

"agent 是怎么'决定'调用一个工具的？"

"它不决定——一路到底都是下一 token 预测。工具调用只是一段结构化的字符串，由[harness](/terms/harness)从输出流里解析出来。"
