---
title: "MCP（模型上下文协议）"
source: "https://www.aihero.dev/ai-coding-dictionary/mcp"
---

**Model Context Protocol（模型上下文协议）。**把外部工具服务器插进[harness](/terms/harness)的协议——[agent](/terms/agent)借此获得 harness 自带之外的[工具](/terms/tool)。agent 从不"调用 MCP"；它调用一个工具，而 harness 恰好是从一个 MCP 服务器拿到那个工具的。协议也暴露资源（只读数据）和提示（可复用模板），但工具供给是主要用途。

协议解决的是集成问题。没有标准的话，每个 harness 都要自己的 Linear 集成、自己的 Slack 集成、自己的数据库集成——各自编写、各自维护。有了 MCP，集成一次写成一个服务器，任何兼容 MCP 的 harness 都能用。harness 连上服务器，服务器报出它提供哪些工具，这些工具就和内置工具一起对 agent 可用。

代价付在[上下文](/terms/context)。服务器报出的每个工具都以定义抵达——名字、描述、参数 schema——而[model](/terms/model)只能调用它知道的工具。朴素做法把所有定义预先装进[上下文窗口](/terms/context-window)：装几个大方的服务器，一个[会话](/terms/session)在你敲下任何字之前，就从几千[token](/terms/token)的工具 schema 开始，把[注意力预算](/terms/attention-budget)花在任务永远用不到的工具上。

许多 harness 现在用工具搜索缓解这一点：上下文里装的不是完整定义，而是指向可用工具的[上下文指针](/terms/context-pointer)——agent 按名字或用途搜工具，只在需要时加载定义。如果你的 harness 不做这件事，预付成本仍然成立，只启用项目真正需要的服务器就值得。

用法：

"agent 需要读 Linear 上的工单。"

"把 harness 配上 Linear 的 MCP 服务器——它把 Linear API 暴露成 agent 能调的工具。省得你写自定义工具包装。"
