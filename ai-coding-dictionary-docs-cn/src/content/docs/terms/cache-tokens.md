---
title: "Cache tokens（缓存 token）"
source: "https://www.aihero.dev/ai-coding-dictionary/cache-tokens"
---

[提供商](/terms/model-provider)从上一次[模型提供商请求](/terms/model-provider-request)缓存下来的[输入 token](/terms/input-tokens)，免得重复处理。连续请求共享前缀时，提供商经[前缀缓存](/terms/prefix-cache)复用工作，把缓存部分按低得多的费率计价。这是让长[会话](/terms/session)付得起的杠杆——没有它，每个[turn](/terms/turn)都要为整个历史重新付费。

要紧的原因在于会话怎么计费。[model](/terms/model)[无状态](/terms/stateless)，所以每次请求重发整个对话——[系统提示词](/terms/system-prompt)、每条消息、每个[工具结果](/terms/tool-result)——作为输入 token。到第 50 轮，每次请求携带 50 轮历史，而你要为全部按全价付费，每次都是。缓存改变这笔数学：提供商在完全相同的前缀里已处理过的 token，按缓存 token 计，通常是输入单价的十分之一或更低。长会话上，你送出的大多是缓存 token，账单才保持清醒。

一个例子展示哪些 token 被缓存、哪些不。每个字母代表一段对话内容；每次请求送出至此的对话：

| 请求发送 | 已缓存 | 按全价计 | 原因 |
| --- | --- | --- | --- |
| `AB` | 无 | `AB` | 首次请求——没有可匹配的对象 |
| `ABC` | `AB` | `C` | `AB` 是上次请求的精确前缀 |
| `ABCD` | `ABC` | `D` | 前缀仍然完好 |
| `AXCD` | `A` | `XCD` | 一处编辑把 `B` 改成 `X`；匹配在那里失败 |

缓存以一种特定方式脆弱：它匹配精确前缀。对话更早处若有任何变化——[harness](/terms/harness)重排内容、时间戳更新、文件表示漂移——缓存从该点起失配，其后一切按全输入价计。缓存也在几分钟不活动后过期，长暂停后恢复的会话要为历史重付一次。当会话成本无故跳升时，对着用量报告里的缓存 token 和输入 token 比——缓存破裂最先在那里显形。

用法：

"长会话成本太狠——一次重构八美元。"

"查缓存 token。如果 harness 在轮间重排系统提示词或文件，前缀断裂，每个请求你都在按全输入价重付。"
