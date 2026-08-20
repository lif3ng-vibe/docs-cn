---
title: "Attention degradation（注意力退化）"
source: "https://www.aihero.dev/ai-coding-dictionary/attention-degradation"
---

随着[会话](/terms/session)增长，每个[token](/terms/token)的[注意力预算](/terms/attention-budget)被摊到更多竞争者头上。任一[有意义关系](/terms/attention-relationship)上的信号缩小；无关[上下文](/terms/context)的噪音挤进来。同一个[model](/terms/model)、同一套[参数](/terms/parameters)——只是同一盘菜要喂的嘴更多。聪明区/笨区[效应](/terms/smart-zone)的成因。

它表现为模型在会话中途变差：遵守了一个小时的约束开始滑脱，重新问起被告知过的事，写出的代码无视它先前读过的文件。模型什么都没变——唯一的变量是它此刻在其上分配注意力的上下文有多少。

它是渐进的，这正是从会话内部难以察觉的原因。没有报错，没有阈值，每个[turn](/terms/turn)只比上一个略差，等到滑脱显而易见时，你在笨区里已经待了一阵了。

恢复靠移除上下文，不是添加。重新粘贴被无视的指令，是往同一个拥挤的窗口里再加一个竞争者，只有片刻药效。管用的是：[清空](/terms/clearing)后只重载任务需要的、或[压缩](/terms/compaction)、或[交接](/terms/handoff)给一个新会话。把指令遵循的下降当作关于上下文长度的信号，而不是关于模型的。

用法：

"它深陷笨区——在编类型文件里没有的泛型。"

"注意力退化。类型定义还在上下文里，但它们上面的信号被我们之后加进的一切埋住了。清空，重载。"
