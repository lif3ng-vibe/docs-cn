---
title: "Tool call（工具调用）"
source: "https://www.aihero.dev/ai-coding-dictionary/tool-call"
---

[model](/terms/model)输出的、点名一个[工具](/terms/tool)及其参数的东西——只是结构化文本。它自己不做任何事；[harness](/terms/harness)得读到它并执行。由模型在一次[模型提供商请求](/terms/model-provider-request)中产出。

工具调用的生命周期：

| 步骤 | 谁 | 发生什么 |
| --- | --- | --- |
| 1 | 模型 | 从[系统提示词](/terms/system-prompt)里的描述得知有哪些工具 |
| 2 | 模型 | 吐出一次调用——工具名加参数，通常是 JSON——然后停下 |
| 3 | harness | 解析调用，对照[权限模式](/terms/permission-mode)检查 |
| 4 | harness | 允许则执行 |
| 5 | harness | 把结果作为[工具结果](/terms/tool-result)放进下一次请求送回 |

[agent](/terms/agent)工作的一[turn](/terms/turn)，通常就是许多个这样的来回串成。

因为调用和别的一切一样由[下一 token 预测](/terms/next-token-prediction)生成，它能以任何模型输出出错的方式出错：一条不存在的路径、一个命令没有的旗标、一套看着合理而不正确的参数。harness 执行的是写下的，不是想表达的——一个打错的路径不会体面地报错，它编辑错误的文件。

用法：

"它说跑了测试，可文件时间戳没变。"

"看转录——它真的吐了工具调用，还是只是描述了跑测试？模型产出调用，但 harness 没执行的话，什么都没发生。"
