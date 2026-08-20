---
title: "Inference（推理）"
source: "https://www.aihero.dev/ai-coding-dictionary/inference"
---

运行一个训练好的[model](/terms/model)来生成输出——每次[模型提供商请求](/terms/model-provider-request)发生的事。[参数](/terms/parameters)保持冻结；模型只是对给它的[上下文](/terms/context)做[下一 token 预测](/terms/next-token-prediction)。相对[训练](/terms/training)便宜，但按[token](/terms/token)计费，是用一项模型的主要成本。

模型的一生分两个阶段：

| 阶段 | 何时发生 | 做什么 | 参数 |
| --------- | --- | --- | --- |
| 训练 | 发布前一次 | 从训练语料产出参数 | 被写入 |
| 推理 | 任何人每次使用模型 | 用冻结的参数跑你的上下文，生成 token | 只读 |

你在推理时做的任何事都不会写回参数——这正是你今天作的纠正明天不粘的原因。下一个[会话](/terms/session)里，在你仔细解释过修法之后又犯同一个错的模型，不是没听你的；它没有能力从这场交流中学习。模型[无状态](/terms/stateless)——连续性必须来自它之外：[上下文窗口](/terms/context-window)或[记忆系统](/terms/memory-system)。

这个机制也解释了账单怎么算。每次请求都在完整上下文上运行模型，所以成本随[输入 token](/terms/input-tokens)和[输出 token](/terms/output-tokens)缩放，一个做几十次[工具](/terms/tool)调用的智能体，每个来回都在为推理付费。这就是上下文体量既是质量问题也是成本问题的原因。

用法：

"为什么账单随用量涨，而不是一个固定的授权费？"

"你付的是推理——每次模型提供商请求都在提供商的硬件上跑模型。训练早就发生了，但推理成本按请求累积，而调用工具时单个[turn](/terms/turn)能膨胀成很多次请求。"
