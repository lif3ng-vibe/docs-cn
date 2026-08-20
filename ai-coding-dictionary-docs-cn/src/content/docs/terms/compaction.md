---
title: "Compaction（压缩）"
source: "https://www.aihero.dev/ai-coding-dictionary/compaction"
---

一次在内存中完成的[交接](/terms/handoff)：前一个[会话](/terms/session)的历史被摘要，摘要给新会话做种。设计上就有损：转录是[一手来源](/terms/primary-source)，摘要是[二手来源](/terms/secondary-source)——用细节换空间。由用户手动触发，或经[自动压缩](/terms/autocompact)自动触发。

机制：[上下文窗口](/terms/context-window)有限，长会话会填满它——每个[工具结果](/terms/tool-result)、每个读过的文件、每个走错的弯都留在历史里。当它变重，[harness](/terms/harness)请[model](/terms/model)把会话摘要一遍，扔掉原始历史，用摘要给新会话做种。没进摘要的一切，从上下文里消失。有些 harness 软化这一点：旧转录留在磁盘，摘要里留一个指向它的[上下文指针](/terms/context-pointer)——二手来源链回它的一手来源，于是摘要丢掉的细节可以通过重读原件找回来。

摘要由模型写，所以可以用提示词引导。"保住 schema 相关的决定"让生成的产物更有 deliberate。时机也要紧——在阶段边界压缩、在计划敲定之后，而不是任务中途。

对比[清空](/terms/clearing)——那个扔掉一切、冷启动：压缩试着把要点带过去；清空赌的是它们已经写在某个更好的地方了。

用法：

"[上下文](/terms/context)变重了，我还有一轮测试要跑。"

"开工前先压缩——把必须幸存的东西写进摘要提示词，让新会话保住 schema 决定、丢掉探索过程。"
