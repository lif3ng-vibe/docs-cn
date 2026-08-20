---
title: "Context pointer（上下文指针）"
source: "https://www.aihero.dev/ai-coding-dictionary/context-pointer"
---

一份文档里指向另一份的提及，让[agent](/terms/agent)只在任务需要时才把它拉进[上下文窗口](/terms/context-window)。[渐进披露](/terms/progressive-disclosure)的构造单元。

用指针（而不是内联内容）的理由是成本。一个指针是上下文窗口里的一行。它背后的文档可能有几千[token](/terms/token)，但在 agent 真正顺着指针走之前，那些 token 分文不花。把一份 2,000 token 的手册内联进[AGENTS.md](/terms/agents-md)，每个[会话](/terms/session)都为它付钱；换成"部署流程：见 `internal/deploy.md`"，只有部署的会话才加载它。任务对上时，agent 用一次[工具调用](/terms/tool-call)顺着指针走。

一个指针要能工作需要两样：一个稳定的路径，以及足够的描述让 agent 知道什么时候值得走。光秃秃的路径是一个 agent 没理由走的指针；"见 `internal/deploy.md`"不带任何里面有什么的暗示，会被一个正需要它的会话跳过。把那行写成与任务呈现方式匹配的样子："发布、部署或回滚——先读 `internal/deploy.md`"。

一旦开始找，指针无处不在：AGENTS.md 里的行、[技能](/terms/skill)描述（harness 加载描述；技能正文在它后面等着）、目录清单里的文件名、文档之间的链接。

指针还能把一份[二手来源](/terms/secondary-source)系回它派生自的[一手来源](/terms/primary-source)——点名原始转录的压缩摘要、点名它所描述源文件的文档。这让二手来源的损失变得可挽回：当摘要不够用时，agent 顺着指针读原件，而不是对着摘要留下的东西硬干。

避免："reference"——太干；传达不出跟着走会拉进更多上下文。"portal"——太花哨。

用法：

"AGENTS.md 越来越大。"

"它大半应该是上下文指针，不是内容。常开的规则保持内联；把部署手册和风格指南做成技能，留一个指针在后面。"
