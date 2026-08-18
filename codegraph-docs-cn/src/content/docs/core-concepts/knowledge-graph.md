---
title: 知识图谱
description: 构成图谱的节点类型与边类型。
---

CodeGraph 存三样东西：**节点**（符号与文件）、**边**（它们之间的关系）和**文件**。每个节点和边都带有一个精确的 `kind`，取自一套固定词表，保证查询在各种语言之间口径一致。

## 节点类型

`file`, `module`, `class`, `struct`, `interface`, `trait`, `protocol`, `function`, `method`, `property`, `field`, `variable`, `constant`, `enum`, `enum_member`, `type_alias`, `namespace`, `parameter`, `import`, `export`, `route`, `component`.

## 边类型

`contains`, `calls`, `imports`, `exports`, `extends`, `implements`, `references`, `type_of`, `returns`, `instantiates`, `overrides`, `decorates`.

## 来源

大多数边直接来自 AST。少数边——位于静态解析跟不上的动态派发边界——是**合成**出来的，会标记 `provenance: 'heuristic'`，并附上创建它们的接线点。这些信息内联展示在 `explore` 结果和 `node` 追踪里，智能体因此能看清每一条连接的来历。

## 如何查询

- **搜索**——按名称查找符号（FTS5）。
- **调用方 / 被调用项**——沿调用图逐跳遍历。
- **影响**——计算某次变更会波及的影响半径。
- **探索**——一次调用返回多个相关符号的源码（按文件分组），以及它们之间的调用路径。

具体怎么运行这些查询，见 [CLI](/reference/cli/) 和 [MCP 服务器](/reference/mcp-server/)参考文档。
