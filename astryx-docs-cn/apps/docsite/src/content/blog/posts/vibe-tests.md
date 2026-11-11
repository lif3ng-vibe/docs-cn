---
title: 'Vibe Test'
description: '我们在 Astryx 中如何做决策'
date: '2026-07-27'
type: 'engineering'
authors:
  - 'cixzhang'
  - 'ernest'
tags:
  - 'AI'
  - 'Testing'
  - 'Design systems'
coverImage: '/blog/vibe-tests/cover.png'
coverAlt: 'Astracat，Astryx 的吉祥物，装扮成科学家的样子：白大褂加圆眼镜，啜饮一瓶蓝色液体，两侧分别是 vibe 和 test 字样'
relatedDocs:
  - title: 'Astryx 是如何工作的'
    href: '/blog/how-astryx-works'
  - title: 'Vibe Tests wiki'
    href: 'https://github.com/meta/astryx/wiki/Vibe-Tests'
---

项目启动时，AI 领域一片混乱。隔三差五就有新方案冒出来（新框架、新提示技巧、新"智能体原生"模式），很难判断该把力气投在哪里。我们也坚信：一个设计良好、文档完善的系统应该同时对 AI 和人友好。除了开源我们的工作、让它进入模型的训练数据之外，我们还有上下文工程（context engineering）这个选项，但它有陈旧与维护成本的缺陷，几乎像是要同步维护的第二套代码。

于是我们需要一种_度量_它的方式。围绕 vibe tests，我们试着想清楚：我们希望设计系统的输出具备哪些具体性质——那些值得在我们的代码库中维护、编码并度量的东西。

我们的[vibe 测试第一版](https://github.com/meta/astryx/pull/57)搭好了测试装置：人设、一组提示电池，以及一个评估器——对照一份预期组件清单，给生成代码里的"逃生舱口"打分（幻觉组件、错误的组件选择、包装 div、冗余 CSS）。它有效，但太特殊。它主要度量的是_系统贴合度_（智能体是否按我们想要的方式使用 Astryx），这预设了 Astryx 就是正确答案，没法公平地与其他方案比较。

我们的[下一版](https://github.com/meta/astryx/pull/243)把_公平性_放在第一位。我们用目标中立的评估替代贴合度检查：同一套确定性分析跑在每个配置上（Astryx、Tailwind、shadcn、裸 HTML），按"任何好输出都该具备的性质"打分，而不是看它像不像我们的。这才让我们能问出真正的问题：Astryx 是真的好，还是我们只是偏爱它？

## 我们铭记的原则

思考 vibe tests 时，我们始终记着这些原则：

- **模拟朴素环境**。用户提示不应包含引导性措辞，测试智能体不应继承任何 SOUL.md、MEMORY.md 或先前上下文。提示应描述_用户体验_，而不是具体组件。例如"构建一个 FAQ 页面，用户展开每一条问题"，而不是"用可折叠列表做一个手风琴"。提示还应在各品类间合理分布，防止在某一区域过采样、只测正常路径。
- **让子智能体保持无上下文**。子智能体通常携带主智能体的上下文，因此要遵循[专门的操作说明](https://github.com/meta/astryx/wiki/Vibe-Evaluation#sub-agent-isolation)以保证隔离，防止上下文以会歪曲结果的方式渗入。
- **每次测试收窄到 3 至 5 个候选**。可以是小的设计细节（组件抽象层级、API 命名、配置形态），也可以是框架级决策，比如 Astryx 用 StyleX、Tailwind、shadcn 还是裸 HTML。
- **让独立的智能体当裁判**。子智能体跑完所有提示电池后，会孵化出一个裁判智能体，在所有结果之间比较。关键在于子智能体_不要_自我评审；我们发现自我评审会把发现结果间差异的能力压到最低。

裁判按一套写进 Astryx wiki 的评分细则行事，其中烙入了 Astryx 在意的方面。例如：

- [Astryx 系统测试](https://github.com/meta/astryx/wiki/Vibe-Evaluation#what-gets-measured)按正确性、无障碍、代码质量、效率、可维护性与设计等维度评分。（设计维度以渲染截图对照参考图打分，仍是进行中的维度。）
- [Astryx 的 API 测试](https://github.com/meta/astryx/wiki/API-Arbitration#what-to-look-for)按可发现性、幻觉、新增 div、冗长代码与未用特性等维度评分。

## 报告与自愈

vibe tests 可以大规模、高频次地运行，所以我们用[每夜定时任务](https://github.com/meta/astryx/wiki/Night-Watch-Vibe-Test-Runner)让它们_每晚_跑一次：一个 AI 编排器启动，同一组提示电池跑遍四个配置，按全部六个维度打分。我们称之为 [night watch](https://github.com/meta/astryx/wiki/Night-Watch-Overview)（夜巡），它们帮助我们把系统各部分的管理自动化。这给我们的是一张滚动的记分板，而不是一次性快照。

这是一个表现好的夜晚（[2026-07-10](https://github.com/meta/astryx/wiki/Vibe-Test-Scores)）。各目标的总体情况：

| 目标                       | 总分    |
| -------------------------- | ------- |
| **Astryx**                 | **98**  |
| Astryx + Tailwind          | 97      |
| 基线（shadcn/Tailwind）    | 95      |
| 裸 HTML                    | 82      |

该轮 Astryx 自身的维度拆解：

| 维度            | 分数            |
| --------------- | --------------- |
| 正确性          | 100             |
| 无障碍          | 100             |
| 代码质量        | 100             |
| 效率            | 88              |
| 可维护性        | 100             |
| 设计            | _WIP 维度_      |

并不总是这么好。AI 智能体不是确定性的，有些夜晚会跑偏。这是一个糟糕的夜晚（[2026-06-28](https://github.com/meta/astryx/wiki/Vibe-Test-Scores)）：Astryx 掉到总分 77，把这一夜输给了基线。

| 维度            | 分数            |
| --------------- | --------------- |
| 正确性          | **2**           |
| 无障碍          | 98              |
| 代码质量        | 99              |
| 效率            | 91              |
| 可维护性        | 96              |
| 设计            | _WIP 维度_      |

除正确性外其他都稳住了，而正确性一落千丈。智能体在少数几个提示上幻觉出了 import 和 prop 名，一个糟糕的类别拖垮了整夜。翻遍完整台账，赢得多数夜晚的其实是基线；我们不总是第一，记分板公开，恰恰是为了让我们无法掩盖这一点。

每夜运行的好处是我们可以跟进。一轮跑完，第二个夜巡——[vibe 测试调试器](https://github.com/meta/astryx/wiki/Night-Watch-Vibe-Test-Debugger)——就会接手。它读取失败的提示，为每个失败归类，并针对可修的东西向我们的文档或 CLI 开 PR（[例如这个](https://github.com/meta/astryx/pull/3907)）。

我们发现，AI 朴素地为 vibe 测试问题生成修复方案时，常常围绕它在单次测试中遇到的特定问题过度采样，所以调试器被指示去寻找反复出现的模式，并用复现 vibe 测试问题来提供证据，而不是追逐某个糟糕夜晚的一次性波动。

## 设计你自己的

vibe 测试不只用于我们自己的决策。你可以把它指向社区交付的几乎所有东西，判断是否值得跟进，也可以把它当作 API 检查或探索工具。vibe tests 成了我们的罗盘：快速评估新想法、收窄投资方向。一些真实塑造了 Astryx 设计的例子：

- [token 命名结构](https://github.com/meta/astryx/issues/864)
- [Selector API](https://github.com/meta/astryx/issues/477)
- [CLI 还是 MCP](https://github.com/meta/astryx/issues/2306)

例如，[impeccable 前端技能](https://impeccable.style/)发布时，我们[探索过用 Astryx 组件对它们做 vibe 测试](https://github.com/meta/astryx/issues/1000)。

给 AI 智能体提供几个关键材料，你就能设计自己的 vibe tests。[让你的智能体照着这里的说明操作。](https://github.com/meta/astryx/wiki/Designing-Vibe-Tests)希望这套方法论能帮人们在疯狂的 AI 世界里航行！
