---
title: "Automated check（自动化检查）"
source: "https://www.aihero.dev/ai-coding-dictionary/automated-check"
---

跑在[环境](/terms/environment)里的确定性验证——测试、类型检查、lint、构建、pre-commit 钩子。过或不过，没有判断。agent 能借此自我纠正而不惊动任何人的信号。一个 flaky 的测试是一个坏掉的检查，不是"不算检查"；自动化检查_在设计上_就是确定性的。

自我纠正是一个循环。agent 做一个改动，把检查当作一次[工具调用](/terms/tool-call)来跑，失败输出落进它的[上下文窗口](/terms/context-window)——一个带文件和行号的类型错误、一条带期望值与实际值的失败断言。这足够 agent 修好问题、再跑检查，转了一圈又一圈直到通过，全程无人在回路。确定性让这个循环可信：同样的代码永远产出同样的判定，于是"通过"有意义。一个 flaky 的检查毒化这一切——agent 去"修"本来没问题的代码，或在一个真实失败面前反复重试。

这就是为什么好的检查是一个代码库[AX](/terms/ax)的一大半。一个跑在类型严格、测试套件快、有 linter 的仓库里的 agent，在你看到之前就抓住自己的多数错误；一个什么都没有的仓库里的 agent，产出什么交付什么。差别在[AFK](/terms/afk)运行里最要紧——检查是运行期间唯一的验证。但检查只抓它断言的东西——全绿的检查意味着被断言的性质成立，不意味着代码是对的。判断形状的缺口，是[自动化评审](/terms/automated-review)和[人工评审](/terms/human-review)的活。

避免："feedback loop"/"backpressure"——都把检查和评审混作一谈。避免："test"——测试是自动化检查，但不是所有自动化检查都是测试。

用法：

"AFK 运行里 agent 老交付坏代码。"

"[沙箱](/terms/sandbox)里接了哪些自动化检查？"

"只有单元测试。"

"加上 typecheck 和 lint——PR 落地之前它就会先自我纠正。"
