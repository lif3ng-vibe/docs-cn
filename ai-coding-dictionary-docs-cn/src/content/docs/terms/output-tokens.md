---
title: "Output tokens（输出 token）"
source: "https://www.aihero.dev/ai-coding-dictionary/output-tokens"
---

[model](/terms/model)生成回来的[token](/terms/token)。计价高于[输入 token](/terms/input-tokens)——通常约五倍——因为产出的算力成本更高。

模型写的一切都算：你读的行文、它吐的代码、[工具调用](/terms/tool-call)、以及回答前做的任何扩展思考。最后这项让人意外——推理 token 按输出计费，哪怕[harness](/terms/harness)常常不给你看；而调高[用力度](/terms/effort)花掉更多这类 token。

输出 token 也定[会话](/terms/session)的节奏。模型读输入快，产出却一次一个 token，所以当一个[turn](/terms/turn)感觉慢时，几乎总是输出在写，不是输入在读。漫长的等待通常意味着漫长的回答在路上。

用法：

"重构会话的积分烧得飞快，输入明明很小。"

"agent 在整文件重写而不是打补丁。输出 token 约五倍于输入单价——让它改成吐编辑，账单就掉下来。"
