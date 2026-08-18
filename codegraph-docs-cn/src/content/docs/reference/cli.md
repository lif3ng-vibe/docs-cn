---
title: CLI
description: CodeGraph 的每一条命令及其支持的标志。
---

```bash
codegraph                         # 运行交互式安装器
codegraph install                 # 运行安装器（显式调用）
codegraph uninstall               # 从你的智能体中移除 CodeGraph（install 的逆操作）
codegraph init [path]             # 初始化项目并构建其图谱（一步完成）
codegraph uninit [path]           # 从项目中移除 CodeGraph（--force 可跳过确认）
codegraph index [path]            # 从零开始全量重建索引（--force、--quiet、--verbose）
codegraph sync [path]             # 增量更新（--quiet）
codegraph status [path]           # 显示统计信息（--json）
codegraph unlock [path]           # 移除阻塞索引的过期锁文件
codegraph query <search>          # 搜索符号（--kind、--limit、--json）
codegraph explore <query>         # 一次性返回相关符号的源码与调用路径（输出与 codegraph_explore MCP 工具相同）
codegraph node <symbol|file>      # 某个符号的源码及调用方，或带行号读取文件（输出与 codegraph_node 相同）
codegraph files [path]            # 显示文件结构（--format、--filter、--pattern、--max-depth、--json）
codegraph callers <symbol>        # 查找谁调用了某个函数/方法（--limit、--json）
codegraph callees <symbol>        # 查找某个函数/方法调用了什么（--limit、--json）
codegraph impact <symbol>         # 分析修改某个符号会影响哪些代码（--depth、--json）
codegraph affected [files...]     # 找出受变更影响的测试文件（见下文）
codegraph daemon                  # 管理后台守护进程——选择一个来停止（别名：daemons）
codegraph telemetry [on|off]      # 查看或更改匿名使用遥测
codegraph upgrade [version]       # 更新到最新发布版本（--check、--force）
codegraph version                 # 打印已安装的版本（也可用 -v、--version）
codegraph help [command]          # 显示帮助，也可只针对单个命令
```

MCP 服务器（`codegraph serve --mcp`）由你的智能体自动启动——你无需手动运行。参见 [MCP 服务器](/reference/mcp-server/)。

## init、index 与 sync

`codegraph init` 会创建本地 `.codegraph/` 目录，**并**在同一步完成全量图谱的构建。（旧的 `-i`/`--index` 标志现在是无操作，保留它只是为了不让现有脚本失效。）此后文件监听器会自动保持图谱最新——`index`（从零全量重建）与 `sync`（增量更新）只在监听器被禁用，或你在智能体会话之外编写脚本操作索引时才用得到。

## 查询命令

`query`、`callers`、`callees` 和 `impact` 都接受 `--json`，以输出机器可读的结果。

```bash
codegraph query UserService --kind class --limit 10
codegraph callers handleRequest --json
codegraph impact AuthMiddleware --depth 3
```

`explore` 和 `node` 是 MCP 工具 `codegraph_explore` 与 `codegraph_node` 的 CLI 形态——输出相同——让子智能体和不通过 MCP 接入的智能体外壳也能在 shell 里访问图谱。

## affected

沿导入依赖传递追踪，找出一组已变更的源文件会波及哪些测试文件。各选项与 CI 示例见 [CI 中的受影响测试](/guides/affected-tests/)。
