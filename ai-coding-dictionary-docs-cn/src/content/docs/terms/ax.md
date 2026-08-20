---
title: "AX（智能体体验）"
source: "https://www.aihero.dev/ai-coding-dictionary/ax"
---

Agent experience（智能体体验）——[环境](/terms/environment)为一个[agent](/terms/agent)在代码库里做好工作设置得多好。[DX](/terms/dx)面向 agent 的对应物。当同一个 agent 在一个仓库表现出色、在另一个表现糟糕——同一个[model](/terms/model)、同一个[harness](/terms/harness)——差别通常是 AX。直觉是怪模型或改提示词；修法更多在仓库里。

好的 AX 有三个主要维度：

| 维度 | 好的 AX 长什么样 |
| --- | --- |
| 自动化检查 | 快的、确定性的[自动化检查](/terms/automated-check)——类型、测试、lint——agent 能借此自我纠正而不必有人 |
| 架构 | 一个 agent 不必读遍一切即可导航的代码库：可预测的结构、小接口背后的大量行为、见名知义的命名 |
| 空闲上下文 | [AGENTS.md](/terms/agents-md)、[技能](/terms/skill)和[工具](/terms/tool)保持精瘦，[上下文窗口](/terms/context-window)大半留给任务，agent 待在[聪明区](/terms/smart-zone)而不是溺水 |

AX 与 DX 重叠——好的检查和干净的架构对两边受众都有益——但它们分歧。人忍受部落知识、慢 CI、"billing 模块问 Sarah"；agent 不能。agent 不受益于 IDE 提示框或漂亮仪表盘；它们要的是以文本形式出现在[工具结果](/terms/tool-result)里的失败。一个代码库可以 DX 好而 AX 差。

避免：把 AX 当 DX 的同义词——两类受众需要不同的投资。

用法：

"agent 在 API 仓库写得很好，前端写出来是垃圾。"

"API 仓库类型严格、测试套件快；前端两样都没有，还常驻四十个技能。这是 AX 缺口，不是模型问题。"
