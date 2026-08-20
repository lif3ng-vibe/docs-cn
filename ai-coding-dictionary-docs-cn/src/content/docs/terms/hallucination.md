---
title: "Hallucination（幻觉）"
source: "https://www.aihero.dev/ai-coding-dictionary/hallucination"
---

自信满满的错误[model](/terms/model)输出。两种味道，成因与修法都不同：

| 味道 | 哪里错了 | 成因 | 修法 |
| --- | --- | --- | --- |
| _事实性（Factuality）_ | 编造或弄错世界的事实——一个不存在的函数、一个错误的 API 签名、一条假引用 | [参数化知识](/terms/parametric-knowledge)的缺口，常在[知识截止点](/terms/knowledge-cutoff)之后 | 加载正确的[情境知识](/terms/contextual-knowledge) |
| _忠实性（Faithfulness）_ | 输出偏离已加载的情境知识、用户指令、或模型自己先前的推理 | [注意力退化](/terms/attention-degradation)；在笨区（见[smart zone](/terms/smart-zone)）恶化 | [清空](/terms/clearing)或[压缩](/terms/compaction) |

[下一 token 预测](/terms/next-token-prediction)无论底层事实真假都产出流畅输出——模型没有"我不知道"的内部信号，所以一个编造的方法和正确的方法以同一种笃定的腔调抵达。幻觉代码在构造上就是合理的：它是那个 API _假如存在_会有的样子，而这正是它能溜过浏览式评审、只在运行时失败的原因。

你得知道眼前是哪种味道，因为一种的修法会加重另一种。事实性意味着知识缺失：修法是加上下文——文档、类型定义、文件。忠实性意味着知识在场却在注意力的竞争里落败：修法是减上下文。把忠实性误诊成事实性，你就会往里粘更多文档，上下文变大，漂移更糟。agent 弄错什么时，先查正确信息是否已在上下文里，再决定你面对的是哪个问题。

避免：把"幻觉"当"错误"的裸同义词——不点出味道，这个词没有诊断价值。

用法：

"它给 schema 幻觉出一个 `parseAsync` 方法。"

"事实性还是忠实性？"

"方法在我粘的文档里就有——第 40 [turn](/terms/turn)之后它就不读了。"

"那是忠实性。压缩重载，别费劲加文档了。"
