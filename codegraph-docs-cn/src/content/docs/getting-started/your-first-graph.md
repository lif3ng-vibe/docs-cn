---
title: 你的第一个图谱
description: 构建索引并运行你的第一批查询。
---

装好 CodeGraph 之后，构建并探索一张图谱只需几条命令。

## 索引一个项目

```bash
cd your-project
codegraph init
```

`codegraph init` 会创建 `.codegraph/` 目录，并在同一步完成全量图谱的构建——一条命令，就此搞定。之后原生文件监听器会在每次变更时保持索引同步，你几乎不需要手动重建。真想手动来的时候：

```bash
codegraph index          # full re-index
codegraph sync           # incremental update of changed files
```

## 检查是否成功

```bash
codegraph status
```

它会报告节点/边/文件的数量、当前生效的 SQLite 后端以及 journal 模式——快速确认索引已就绪的健康检查。

## 运行查询

优先用 `codegraph explore`——一句自然语言问题或一组符号名，一次调用就能拿到相关源码以及这些符号之间的调用路径（与 `codegraph_explore` 工具提供给智能体的输出完全相同）：

```bash
codegraph explore "how does login work"
```

更窄、可脚本化的查询则有专门命令：

```bash
codegraph query UserService          # find symbols by name
codegraph callers handleRequest      # what calls a function
codegraph callees handleRequest      # what a function calls
codegraph impact AuthMiddleware      # what a change would affect
```

这四个命令都支持 `--json` 以输出机器可读的结果。完整用法见 [CLI 参考](/reference/cli/)。

## 交给你的智能体

只要存在 `.codegraph/` 目录并且配置好了智能体（见[安装](/getting-started/installation/)），你的智能体就会自动使用 [MCP 工具](/reference/mcp-server/)——无需任何额外步骤。
