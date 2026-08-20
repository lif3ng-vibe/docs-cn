---
title: "Model provider request（模型提供商请求）"
source: "https://www.aihero.dev/ai-coding-dictionary/model-provider-request"
---

[harness](/terms/harness)到[模型提供商](/terms/model-provider)的一次往返。harness 送出当前[上下文](/terms/context)；提供商返回一个响应（一次[工具调用](/terms/tool-call)或最终答案）。如果[agent](/terms/agent)调了[工具](/terms/tool)，一条用户消息可以催生很多次模型提供商请求——每个[工具结果](/terms/tool-result)触发下一次请求。

每次请求携带一切：[系统提示词](/terms/system-prompt)、至此的完整对话、每个工具结果。[model](/terms/model)是[无状态](/terms/stateless)的，所以提供商在请求之间什么都不留——第 40 次请求重发第 39 次请求发过的一切，外加一个工具结果。[前缀缓存](/terms/prefix-cache)的存在就是让这种重复付得起。

请求也是计费单位。[输入 token](/terms/input-tokens)、[输出 token](/terms/output-tokens)、缓存折扣全按请求计，这就是一个看着无害的问题能花掉惊人一笔的原因：成本不和你的消息成正比，和请求数乘以每个请求携带的上下文体量成正比。

把请求和[turn](/terms/turn)分开值得。一轮是与你的一次交换，而单独一轮——"修好失败的测试"——展开成一串请求：

| 请求 | 模型返回 | harness 随即 |
| --- | --- | --- |
| 1 | 工具调用：跑测试 | 跑，追加失败输出 |
| 2 | 工具调用：读测试文件 | 追加文件内容 |
| 3 | 工具调用：读源码文件 | 追加文件内容 |
| 4 | 工具调用：编辑源码文件 | 应用编辑，追加结果 |
| 5 | 工具调用：再跑测试 | 跑，追加通过输出 |
| 6 | 最终答案："修好了，测试通过" | 给你看 |

一轮六次请求——每次重发整个上下文。当你琢磨[token](/terms/token)去哪了，数请求数，别数轮数。

用法：

"一个问题烧了四万 token？"

"看工具调用——十二次 grep、八次读、四次编辑。每个工具结果再催生一次模型提供商请求，而整个[会话](/terms/session)前缀每次都重发。"
