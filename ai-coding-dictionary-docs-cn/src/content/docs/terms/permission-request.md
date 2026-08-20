---
title: "Permission request（权限请求）"
source: "https://www.aihero.dev/ai-coding-dictionary/permission-request"
---

[harness](/terms/harness)在执行一个未经预先批准的[工具调用](/terms/tool-call)之前给用户看的东西。[model](/terms/model)产出工具调用；harness 不立即运行，而是暂停并问。批准则运行；拒绝则 harness 把拒绝作为[工具结果](/terms/tool-result)报回给模型。harness 借此把一个人放进危险或敏感动作的[回路](/terms/human-in-the-loop)。

权限请求的生命周期：

| 步骤 | 谁 | 发生什么 |
| --- | --- | --- |
| 1 | 模型 | 产出一次工具调用 |
| 2 | harness | 对照[权限模式](/terms/permission-mode)和已保存的批准检查 |
| 3 | harness | 已预批：立即执行。否则：暂停并展示请求 |
| 4 | 用户 | 批准一次、批准整个[会话](/terms/session)剩余部分、或拒绝 |
| 5 | harness | 执行调用，或把拒绝作为工具结果送回 |

拒绝一次请求就是在掌舵 agent。模型像读任何工具结果一样读拒绝并作出反应——它换一种思路，或问你想要哪种。多数 harness 允许在拒绝时附一句话，这把请求变成一个转向点："别那样，用迁移脚本"恰好在模型决定下一步做什么时落地。

代价是每个请求都在同步地等你。[agent](/terms/agent)阻塞到你回答为止，你盯着时无妨，你不在时是麻烦——一个不停触发请求的 agent 没法[AFK](/terms/afk)地放着跑。权限模式就是那个旋钮：哪些调用自由跑、哪些先问，理想情况配一个[沙箱](/terms/sandbox)，让放宽自由集合变得安全。

用法：

"它卡在一个权限请求上十分钟了——我在开会。"

"这就是人在回路的代价。把安全的[工具](/terms/tool)预先批准，让请求只在真正危险的调用上触发。"
