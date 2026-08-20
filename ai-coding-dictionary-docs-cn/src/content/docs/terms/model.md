---
title: "Model（模型）"
source: "https://www.aihero.dev/ai-coding-dictionary/model"
---

那些[参数](/terms/parameters)。[无状态](/terms/stateless)——只做[下一 token 预测](/terms/next-token-prediction)，别的不做。"Claude Opus 4.x"和"GPT-5.x"是模型。模型自身做不了任何智能体式的事情；它得被装进[harness](/terms/harness)。

模型读不了文件、跑不了命令、浏览不了网页、记不住昨天——它吞进[token](/terms/token)，吐出预测的 token，每次[模型提供商请求](/terms/model-provider-request)一轮。一切看起来像[agent](/terms/agent)在工作的东西——挑[工具](/terms/tool)、读结果、循环到任务完成——都是 harness 在把许多次这样的预测串起来编排。

[模型提供商](/terms/model-provider)分档发布模型：最大的一档最聪明但慢且贵，小一些的更快更便宜但能力弱。选档是个真实的决策——规划和硬调试用重量级，机械改动用轻量级——而 harness 允许你在[会话](/terms/session)中途切换。

对这个词严格，也让诊断更锋利。"模型不擅长这个"是一个具体的主张——同一个模型换一个 harness、或换一份[上下文](/terms/context)，表现常常完全不同。怪模型之前，先查它拿到了什么：多数令人失望的输出，根子都在上下文或 harness，不在参数。

用法：

"规划这一步要不要把模型从 Sonnet 换成 Opus？"

"可以试——但这个任务上 harness 承担了大部分工作。[系统提示词](/terms/system-prompt)和工具不对的话，换模型没用。"
