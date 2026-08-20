---
title: "Context（上下文）"
source: "https://www.aihero.dev/ai-coding-dictionary/context"
---

[agent](/terms/agent)此刻能接触到的相关信息。这是抽象名词——不是模型看到的原始输入（那是[上下文窗口](/terms/context-window)），不是滚动的历史（那是[会话](/terms/session)），而是_agent 拥有的、与任务相关的所知_。"把某物加载进上下文"意思是把它变成这个集合的一部分；"上下文工程"是策展它的纪律。

三个术语分得干净：

| 术语 | 指什么 |
| --- | --- |
| Context（上下文） | agent 当前拥有的任务相关信息 |
| Context window（上下文窗口） | 模型每次请求看到的字面[token](/terms/token)序列 |
| Session（会话） | [harness](/terms/harness)存储的滚动对话 |

这个区分要紧，因为上下文是质量的度量，不是数量的。一个上下文窗口可以几乎满而上下文仍然差——几千 token 的过期工具输出，没有一段关于手头任务。它也可以几乎空而上下文极好：任务系于其上的那一个类型定义。

多数日常失败可以追到上下文。当 agent 编造一个 API、推翻一个决定、或瞎猜一个 schema，第一个问题是它那么做时上下文里有什么——通常是要紧的事实从没被加载，或被埋在[注意力退化](/terms/attention-degradation)之下。解法是策展：加载任务需要的，挡掉不需要的。

用法：

"它老是编出类型里没有的字段。"

"类型文件不在上下文里——它在读调用点然后猜。先把定义读进来。"
