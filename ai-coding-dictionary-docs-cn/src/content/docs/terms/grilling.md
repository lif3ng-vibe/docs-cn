---
title: "Grilling（追问）"
source: "https://www.aihero.dev/ai-coding-dictionary/grilling"
---

与[agent](/terms/agent)共同发展[设计概念](/terms/design-concept)的技术：agent 苏格拉底式地访谈用户，一次一个决定，每个都附一个推荐答案。它给冲向成品计划的脚步降速——设计概念稳定之前，不写任何[交接产物](/terms/handoff-artifact)。

这门技术存在，因为 agent 会无声地填缺口。被要求从两行提示词写一份[规格](/terms/spec)时，agent 不会在你没做的决定处停下——它挑默认值写进去。结果看着完整，猜测和选择无从分辨，于是你发现得很晚：在评审时，或建好的特性以一种你从没选过的方式处理边界情形时。追问把它反过来——不许猜，agent 必须问。

它是一门[人在回路](/terms/human-in-the-loop)技术：你的回答就是输入。当一个问题没法在交谈中回答——你得亲眼看到那样东西——就切换到[原型](/terms/prototyping)。

用法：

"它直奔写规格，把取消逻辑写错了。"

"先追问它——让它先问你部分取消、退款、时序，再往文档里落一个字。在对话里解决，比在代码里便宜。"
