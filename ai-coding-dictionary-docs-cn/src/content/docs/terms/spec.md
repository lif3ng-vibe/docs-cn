---
title: "Spec（规格）"
source: "https://www.aihero.dev/ai-coding-dictionary/spec"
---

一份描述跨多个[会话](/terms/session)工作的[交接产物](/terms/handoff-artifact)——建什么，而不是每个会话怎么做自己的那份。随工作推进而变。由[工单](/terms/ticket)构成。

规格存在，因为会话是一次性的，而大工作不是。任何超过一个[上下文窗口](/terms/context-window)工作量的东西，都需要一个住在[上下文](/terms/context)之外的家——agent[环境](/terms/environment)里某个能活过[清空](/terms/clearing)的地方，无论是仓库里的文件、一个 GitHub issue，还是 agent 够得着的工单追踪器。规格就是那个家：目标、约束、至今做过的决定、以及带状态的工单清单。任何新会话读了它就知道工作站在哪，而不必继承上一个会话积累的噪音。

规格有几种可辨认的样式，多继承自团队已有的书写习惯。_产品需求文档（PRD）_偏向面向用户的 what 与 why——特性、行为、验收标准。_设计文档_或 _RFC_ 偏技术——选定的方案、被否的替代、取舍。小的那一端，一份带工单清单的普通 `plan.md`，对跨会话的特性干的是同一件事。样式不如角色要紧：对[agent](/terms/agent)来说，这些都是同一个东西——它每个会话开头读的那份耐久的意图陈述。

用法：

"这些要装进一个会话做完吗？"

"不，写成一份规格——拆成工单，每张工单自己一个会话。想在一个上下文里做完整个事，半路就会撞进笨区（见[smart zone](/terms/smart-zone)）。"
