---
title: 工作原理
description: 提取、存储、解析与自动同步的四段流水线。
---

CodeGraph 分四个阶段把源代码变成一张可查询的图谱。

```
files → Extraction (tree-sitter) → DB (nodes/edges/files)
            ↓
      Resolution (imports, name-matching, framework patterns)
            ↓
      Graph queries (callers, callees, impact)
            ↓
      Context building (markdown / JSON for AI consumption)
```

## 1. 提取

[tree-sitter](https://tree-sitter.github.io/) 把源码解析成 AST，再由针对各语言的查询从中提取**节点**（函数、类、方法、类型等）和**边**（调用、导入、继承、实现）。繁重的解析都在主线程之外进行。

## 2. 存储

所有内容都存入本地 SQLite 数据库（`.codegraph/codegraph.db`），自带 FTS5 全文检索，底层通过捆绑运行时中 Node 内置的 `node:sqlite` 以 WAL 模式运行。

## 3. 引用解析

提取完成后，各类引用会被解析：函数调用 → 定义、导入 → 源文件，外加类继承和框架特有的模式。一些动态派发边界（回调、观察者、React 重渲染、JSX 子组件）由合成器桥接，让流程端到端连通。详见[解析与框架](/core-concepts/resolution/)。

## 4. 自动同步

MCP 服务器借助操作系统原生文件事件（FSEvents / inotify / ReadDirectoryChangesW）监听你的项目。变更先经防抖，再过滤出源文件，然后增量同步——你写代码的同时图谱始终保持最新，无需任何配置。
