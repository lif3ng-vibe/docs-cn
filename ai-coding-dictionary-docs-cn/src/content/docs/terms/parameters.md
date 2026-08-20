---
title: "Parameters（参数量）"
source: "https://www.aihero.dev/ai-coding-dictionary/parameters"
---

[model](/terms/model)内部的那些数字——常常数十亿个——在[训练](/terms/training)中调定。模型"知道"的一切都住在里面。训练设定它们；[推理](/terms/inference)原样使用。也叫 _weights_（权重）。

机制上，参数就是把输入变成输出的东西。[下一 token 预测](/terms/next-token-prediction)是一场巨大的计算：[上下文窗口](/terms/context-window)里的[token](/terms/token)进去，被参数乘过一遍，出来一个对下一个 token 的预测。模型内部没有事实数据库，没有代码查表——只有这些数字，排列得让这场计算倾向于产出有用的输出。模型能从训练里背诵出来的事实，比如某个标准库的 API，是[参数化知识](/terms/parametric-knowledge)：存在参数里，不是从哪里检索来的。

值得内化的细节是：参数在训练后冻结。你在[会话](/terms/session)里做的任何事都改不了它们——你作的纠正、你给它看的代码库、它该吸取的教训，都不行。每个会话跑在同一套数字上。这正是模型[无状态](/terms/stateless)的原因，是它内置知识止步于[知识截止点](/terms/knowledge-cutoff)的原因，也是项目相关的东西必须经由[上下文](/terms/context)抵达的原因。参数唯一的变更方式是再训练——那实际上产出了另一个模型。

用法：

"能不能在我们的代码库上微调它？"

"那会更新参数——之后就是另一个模型了。为一个项目，把代码库当上下文加载，几乎总是比重训练便宜。"
