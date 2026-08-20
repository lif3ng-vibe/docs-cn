---
title: "Attention budget（注意力预算）"
source: "https://www.aihero.dev/ai-coding-dictionary/attention-budget"
---

每个[token](/terms/token)能分给[上下文](/terms/context)其余部分的影响力有限。在[某个关系](/terms/attention-relationship)上影响重，留给别人的就少。预算按 token 计，不随上下文增长，这正是长[会话](/terms/session)会稀释的原因。

把它想成信号与噪音。你的指令是一个音量固定的信号；[上下文窗口](/terms/context-window)里其余每个 token 都是竞争的声响。指令从没变小声——它还在那儿，一字不差——但随着上下文增长，它周围的房间越来越吵，信噪比下降。在 1 万 token 上下文里曾是最大声的指令，到 15 万 token 时成了背景嗡鸣。这是[注意力退化](/terms/attention-degradation)背后的机制：模型没有忘记；是信号淹在了噪音里。

症状读起来像不服从——agent 早早答应了一个约束，随后渐渐偏离，重新粘贴约束也只有片刻药效。病因不在指令；在窗口里与它竞争的其他一切。

你能控制的是进上下文的东西。不为任务服务的内容不是中性的——它是压在一切有用内容上的噪音。把窗口保持小，积累的上下文不再物有所值时就[清空](/terms/clearing)，要紧的约束重新陈述，而不是指望它早先的出场能撑到底。

用法：

"为什么它一直无视我粘在最顶上的 schema？"

"我们早就进笨区（见[smart zone](/terms/smart-zone)）了——每个 token 的注意力预算固定，上下文却一直在涨。schema 上的信号正在和几千个更新的 token 抢。"
