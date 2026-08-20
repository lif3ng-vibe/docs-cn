---
title: "Permission mode（权限模式）"
source: "https://www.aihero.dev/ai-coding-dictionary/permission-mode"
---

[智能体模式](/terms/agent-mode)中把关权限的那一片——哪些[工具调用](/terms/tool-call)触发[权限请求](/terms/permission-request)、哪些自动执行。这是模式系统的原始用途，早于[harness](/terms/harness)开始在权限之上捆绑行为指令。

harness 发布一串阶梯式模式：

| 模式 | 读 | 写与 shell | 典型用途 |
| --- | --- | --- | --- |
| 只读 / 计划 | 自动 | 阻止 | 调研、规划、评审 |
| 默认 | 自动 | 询问 | 日常监督下的工作 |
| 自动编辑 | 自动 | 编辑自动，shell 询问 | 可信仓库、机械改动 |
| "Yolo" / 全自动 | 自动 | 自动 | [沙箱](/terms/sandbox)、[AFK](/terms/afk)运行 |

选哪一档，是安全与打扰之间的交易，两头的失败模式都有体感。太紧，你成为瓶颈：[agent](/terms/agent)每隔几秒为无害的读停下，你闭着眼睛点批准，批准不再意味着任何东西——橡皮图章是两头的最坏叠加，打扰全收、保护全无。太松，agent 编辑文件、跑命令，而那些你本想先看一眼。

松的那端在沙箱里最站得住，一次坏[工具](/terms/tool)调用的爆炸半径被兜住。沙箱之外，多数人落在：读自动批准，不可逆的事保持[人在回路](/terms/human-in-the-loop)。

用法：

"每次 grep 都停一下——AFK 运行彻底废了。"

"给只读工具放宽权限模式，写和 shell 保持询问。调研[会话](/terms/session)上的权限请求大多是噪音。"
