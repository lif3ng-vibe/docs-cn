---
title: "Filesystem（文件系统）"
source: "https://www.aihero.dev/ai-coding-dictionary/filesystem"
---

一棵[agent](/terms/agent)在其中读、写、执行的文件与目录树——编码 agent 的默认[环境](/terms/environment)。[AGENTS.md](/terms/agents-md)、[技能](/terms/skill)、源代码、构建脚本、[工具](/terms/tool)配置都住在文件系统里。当一个[harness](/terms/harness)"在你的项目里启动"，它就是在把 agent 指向一个文件系统。

agent 只经[工具调用](/terms/tool-call)触碰它——读一个文件、写一个、跑一条 shell 命令。磁盘上的任何东西，在工具调用加载它之前都不在[上下文窗口](/terms/context-window)里，而这正是 agent 能在一个远大于窗口的仓库里工作的原因：文件系统装着一切，上下文只装当前任务读过的。有些 harness 默认把当前目录的文件名加载进上下文窗口——不是内容，只是树——充当[上下文指针](/terms/context-pointer)：agent 看见存在什么，再去读需要的文件。

而且它与你共享。agent 编辑的文件，就是你编辑器里打开、git 里 diff 的同一批——文件系统是你审查 agent 所作的公共工作区。

用法：

"为什么它没认到我的 AGENTS.md？"

"它跑在另一个文件系统上——[沙箱](/terms/sandbox)挂载的是父目录，不是项目根。把 harness 重新指过去。"
