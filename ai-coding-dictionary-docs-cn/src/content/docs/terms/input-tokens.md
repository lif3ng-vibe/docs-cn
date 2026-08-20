---
title: "Input tokens（输入 token）"
source: "https://www.aihero.dev/ai-coding-dictionary/input-tokens"
---

[harness](/terms/harness)在每次[模型提供商请求](/terms/model-provider-request)送出的[token](/terms/token)——[系统提示词](/terms/system-prompt)、对话历史、[工具结果](/terms/tool-result)，[model](/terms/model)动笔之前读到的一切。计价低于[输出 token](/terms/output-tokens)，因为处理它们比处理输出便宜。

做[AI](/terms/ai)编码时，输入 token 构成账单的大头。模型[无状态](/terms/stateless)，所以每个[turn](/terms/turn)都把整个[会话](/terms/session)重发为输入：你的第一条消息、此后的每个回答、每个工具结果。第 50 轮的输入包含此前 49 轮。单独一次模型提供商请求可能只产出几百个输出 token，却重发十万条积累历史的输入 token。

[前缀缓存](/terms/prefix-cache)压低这笔成本：与上次请求精确吻合的历史，按便宜的[缓存 token](/terms/cache-tokens)计费，而非全价输入。输入还是贵得疼时，解法是缩小重发的量——任务之间[清空](/terms/clearing)或[压缩](/terms/compaction)。

用法：

"账单很高，可[agent](/terms/agent)几乎没写什么。"

"是输入 token——每轮重发整个会话。没有前缀缓存的话，每次请求你都在为历史重新付费。"
