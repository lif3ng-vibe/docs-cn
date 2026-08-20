---
title: "Prefix cache（前缀缓存）"
source: "https://www.aihero.dev/ai-coding-dictionary/prefix-cache"
---

[提供商](/terms/model-provider)一侧的存储，让连续的[模型提供商请求](/terms/model-provider-request)跳过对共享前缀的重复处理。当一个请求的开头与近期某次请求的开头吻合——同样的[系统提示词](/terms/system-prompt)、直到某处为止的同样历史——提供商复用它先前的工作，把那些[token](/terms/token)按[缓存 token](/terms/cache-tokens)以低得多的费率计价。

缓存划算，因为会话只追加地增长。每次请求把整个历史重发为[输入 token](/terms/input-tokens)（原因见那个词条），而正常[会话](/terms/session)里历史只在尾部变化——每次请求就是上一次加几条新消息。提供商把长长的共享开头处理一遍，存下结果，从前缀结束处接着算。没有缓存，一个 50 [turn](/terms/turn)的会话要为第 1 轮付 50 次重处理的的钱。

缓存也会过期。条目保持多久随提供商而异——通常分钟级，不是小时级。会话闲置超过窗口，下一次请求就以全价重建前缀一次，然后缓存恢复。这主要是[harness](/terms/harness)开发者操心的事；作为用户，可见的效应是长暂停之后的请求比之前的贵。

用法：

"为什么账单在会话中途跳了一下？"

"harness 开始每轮往系统提示词里注入当前时间。前缀缓存在第一个变化的 token 处断裂，之后每个请求都按全价计。"
