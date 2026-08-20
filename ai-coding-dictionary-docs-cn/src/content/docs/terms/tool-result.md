---
title: "Tool result（工具结果）"
source: "https://www.aihero.dev/ai-coding-dictionary/tool-result"
---

[harness](/terms/harness)执行完一次[工具调用](/terms/tool-call)后送回的东西——文件内容、命令输出、错误。[agent](/terms/agent)对[环境](/terms/environment)的唯一视野。在下一次[模型提供商请求](/terms/model-provider-request)里回到[model](/terms/model)，由模型决定拿它做什么。工具调用和工具结果是同一场交换的两端，都在一个[turn](/terms/turn)之内。

工具结果的生命周期：

| 步骤 | 谁 | 发生什么 |
| --- | --- | --- |
| 1 | harness | 执行工具调用——跑命令、读文件 |
| 2 | harness | 捕获结果：输出、内容或错误 |
| 3 | harness | 作为一条消息追加进[上下文](/terms/context) |
| 4 | harness | 在下一次模型提供商请求里把整个上下文送给提供商 |
| 5 | 模型 | 读结果并决定：再一次工具调用，还是最终答案 |

结果留在上下文里直到[会话](/terms/session)结束。工具结果通常是编码会话上下文的大头：每次读文件、每次跑测试、每次搜索都全文落地，在早已没用的很久之后仍占着[token](/terms/token)。几个大结果——一份冗长的测试日志、一个被整个读进来的生成文件——能把会话推向[上下文窗口](/terms/context-window)边缘，比对话本身还快。

因为结果就是模型看到的全部，模型没有办法核对它背后的环境。如果输出被截断、命令无声失败、或 harness 返回的是错误而不是内容，模型就基于拿到的东西推理。当 agent 对你系统的图景显得不对时，该看的地方是工具结果：转录里某处有一条结果，说的和你知道的真实情况不一样。

用法：

"它推理这个文件时把它当成空的。"

"工具结果回来的是权限拒绝，不是内容。模型只看到了错误字符串——它没有别的办法看见文件。"
