---
title: MCP 服务器
description: CodeGraph 通过 MCP 向 AI 智能体暴露的工具。
---

CodeGraph 以[模型上下文协议](https://modelcontextprotocol.io/)（MCP）服务器的形式运行。安装器配置过的智能体会自动启动它——你无需手动运行：

```bash
codegraph serve --mcp
```

只要存在 `.codegraph/` 索引，智能体就能获得下文的工具。在**没有**索引的工作区里，服务器会报告自己处于未激活状态，**不**列出任何工具——智能体照常用它内置的工具工作，是否建立索引仍由你决定。

## 默认只有一个工具：`codegraph_explore`

默认情况下，服务器只暴露**一个工具**：`codegraph_explore`。它与 `Read` 等价：给它一个自然语言问题，或一串符号名与文件名，它就会按文件分组返回相关符号的**带行号原文源码**——与 `Read` 工具给你的形式一致——外加这些符号之间的调用路径（包括回调、React 重渲染、JSX 子组件等 grep 追踪不到的动态派发跳转），以及一份说明哪些代码依赖它们的影响半径摘要。单次调用通常就能回答整个问题。

只暴露一个强力工具是有意为之。对智能体行为的实测表明，一个瞄准问题的工具比一排更窄的工具更能把智能体径直引向答案——误选更少——而且无论在回答问题时还是编辑代码时，智能体都会用到它。

## 其余工具

另外还有七个工具，全部保持完整功能，但**默认不予列出**——它们返回的一切都已经内联出现在 `codegraph_explore` 的响应里（它的影响半径部分、关系图、符号本体及其被调用项列表）：

| 工具 | 用途 |
|---|---|
| `codegraph_node` | 某个符号的源码及其调用方/被调用项链路，或带行号读取整个文件（与 `Read` 等价）。对有歧义的名称，返回每一个重载的本体。 |
| `codegraph_search` | 在整个代码库中按名称查找符号（仅返回位置） |
| `codegraph_callers` | 查找谁调用了某个函数 |
| `codegraph_callees` | 查找某个函数调用了什么 |
| `codegraph_impact` | 分析修改某个符号会影响哪些代码 |
| `codegraph_files` | 获取已索引的文件结构（比扫描文件系统更快） |
| `codegraph_status` | 检查索引健康状况与统计信息 |

通过 `CODEGRAPH_MCP_TOOLS` 环境变量可重新启用其中任何一个——它是一个逗号分隔的短名称允许列表，会整体替换默认值：

```bash
CODEGRAPH_MCP_TOOLS=explore,node,search,callers
```

每个工具在 CLI 中也都有对应命令（`codegraph node` / `query` / `callers` / `callees` / `impact` / `files` / `status`），供脚本和不通过 MCP 接入的智能体外壳使用。

## 智能体应当如何使用

CodeGraph 本身*就是*现成的搜索索引。无论是“X 是怎么工作的？”这类问题、架构、某个流程（“X 如何到达 Y”），还是“X 在哪里”——包括编辑代码的时候——智能体都应该用 `codegraph_explore` 得出答案后就此打住，通常**零次文件读取**，而不是用 `grep` + `Read` 重新推导一遍。直接用 CodeGraph 回答只需一到数次调用；grep/读取式的探索则要几十次。

MCP 服务器会在 MCP `initialize` 响应中自动把这份指引下发给主智能体。由于子智能体和不通过 MCP 接入的智能体外壳永远看不到该响应，安装器还会在每个智能体的指令文件里写入一小段由标记围起来的区块，指向对应的 CLI 命令 `codegraph explore`。
