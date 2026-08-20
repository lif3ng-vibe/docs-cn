---
title: "Attention relationship（注意力关系）"
source: "https://www.aihero.dev/ai-coding-dictionary/attention-relationship"
---

预测每个[token](/terms/token)时，[model](/terms/model)会把[上下文](/terms/context)里其余每个 token 都计入——有些权重很大，有些几乎为零。两个 token 之间的配对就是一个**注意力关系**，有意义的配对（"her"与"Sarah"，或一个 `getUser()` 调用与它 `function getUser` 的定义）比无关的配对互相影响更强。N 个 token 的上下文约有 N² 量级的关系。

这些配对正是模型表面理解力的居所。它解开一个代词，靠的是"her"与"Sarah"之间强的注意力关系。它用正确的参数调用一个函数，靠的是调用点与它先前读过的定义之间的关系在干活。这些没有一样是查出来的——每次[模型提供商请求](/terms/model-provider-request)都为每一对重新现算。

N² 这个数值得坐下来咂摸，因为它比直觉涨得快：

| 上下文大小 | 配对数（约 N²） |
| --- | --- |
| 1,000 token | 约 100 万 |
| 10,000 token | 约 1 亿 |
| 100,000 token | 约 100 亿 |

每对还被算不止一次。模型有多个注意力头——前沿模型的准确数目未公开，但五到一百是个合理的猜测——每个头对每个关系算它自己的一版。所以上表每个配对都被每个头复制了一遍。那是很多配对。

对任何给定任务，这些关系里只有少数要紧。你的指令与它所统辖的代码之间的配对，是算数的那几对之一；池子里其余几乎全是噪音。而两者增速不同：要紧的关系大致恒定，总池随上下文体量平方增长。1 万 token 时，你在乎的那个配对是百万分之一；10 万 token 时，是百亿分之一。这是[注意力预算](/terms/attention-budget)底下的算术；而当要紧的关系分到的份额太薄时，那就是[注意力退化](/terms/attention-degradation)的体感。

用法：

"它在 diff 里老把两个 `user` 符号搞混——听着我们进笨区了（见[smart zone](/terms/smart-zone)）。"

"对，每个调用点与自己声明的注意力关系在和另一个打架——token 形状相同，绑定不同。重命名一个，配对就锋利了。"
