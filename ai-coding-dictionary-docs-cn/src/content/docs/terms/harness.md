---
title: "Harness（智能体运行框架）"
source: "https://www.aihero.dev/ai-coding-dictionary/harness"
---

[model](/terms/model)周围把它变成[agent](/terms/agent)的一切：[工具](/terms/tool)、[系统提示词](/terms/system-prompt)、[上下文窗口](/terms/context-window)管理、权限、钩子。**Claude.ai** 和 **Claude Code** 跑同一个模型但行为不同，因为 harness 不同。

模型本身只会一件事：文本进，文本出。它读不了文件、跑不了命令、记不住上一个[turn](/terms/turn)。harness 补上其余一切。它为每次[模型提供商请求](/terms/model-provider-request)组装[上下文](/terms/context)，执行模型要的[工具调用](/terms/tool-call)，把[工具结果](/terms/tool-result)喂回去，存储[会话](/terms/session)历史，在危险动作前向你请求许可，并决定何时[压缩](/terms/compaction)。智能体循环——模型提议、harness 执行、重复——由 harness 驱动。

这对诊断很要紧。两个产品之间、或昨天与今天之间行为有差时，模型往往不是那个变量——harness 才是。换了系统提示词、换了一组工具、改了一个权限默认值、或新的上下文管理策略，都在模型分毫未动的情况下改变行为。这也意味着你的大多数配置住在 harness 里：[AGENTS.md](/terms/agents-md)文件、权限设置、钩子，全是对 harness 的指令，不是对模型的。

例子：Claude Code、Cursor、Codex CLI——还有 Claude.ai，一个聊天而非编码的 harness。

用法：

"同一个模型，为什么 Claude Code 在改文件，Claude.ai 只在答题？"

"harness 不同——Claude Code 有[文件系统](/terms/filesystem)工具、不同的系统提示词、还有一层权限。变量不在模型。"
