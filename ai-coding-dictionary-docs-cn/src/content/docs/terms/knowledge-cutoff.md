---
title: "Knowledge cutoff（知识截止点）"
source: "https://www.aihero.dev/ai-coding-dictionary/knowledge-cutoff"
---

[model](/terms/model)的[参数化知识](/terms/parametric-knowledge)到此为止的那个日期。截止点之后的库、API、事件，除非文档被加载为[情境知识](/terms/contextual-knowledge)，否则都是编造陷阱。每个模型版本都带着自己的截止点发布。

截止点存在，源于模型的制造方式：[训练](/terms/training)把一帧文本快照烤进模型的[参数](/terms/parameters)，之后参数冻结。模型不知道自己的知识有边——被问到截止点之后的东西，它不拒绝，而是从它知道的最近似物外推。这正是陷阱安静的原因：照旧版本库写的代码看着合理，常常还能编译，恰好在变过的那些部分上失败。

修法永远一样：把最新信息弄进[上下文](/terms/context)。加载变更日志，指向已装版本的类型定义，或让 agent 从网上读文档。上下文里的任何东西，都压过参数里的空缺。

用法：

"它老写 v3 的 SDK 语法——我们都在 v5 了。"

"v5 发布在知识截止点之后。把 v5 变更日志加载为情境知识，不然它会一直照旧的参数化版本编。"
