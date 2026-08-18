---
title: 索引一个项目
description: 全量索引、增量同步与文件监听器。
---

## 初始化并建立索引

```bash
cd your-project
codegraph init      # creates .codegraph/ and builds the full graph — one step
```

`codegraph init` 会创建本地 `.codegraph/` 目录，并在同一步完成全量图谱的构建——一条命令，就此搞定。之后没有单独的索引步骤要跑，图谱从这里起[始终保持最新](#始终保持最新)。

## 全量与增量

```bash
codegraph index           # full index of the whole project
codegraph index --force   # re-index from scratch
codegraph sync            # incremental — only changed files
```

`sync` 之所以快，是因为它只重新解析有变更的内容——文件监听器在每次编辑后替你运行的就是它（见[始终保持最新](#始终保持最新)）。你几乎不需要手动运行它。

## 始终保持最新

**在智能体会话期间，你不需要手动运行 `codegraph sync`。** 当你的智能体（Claude Code、Cursor、Codex、opencode、Hermes、Gemini、Antigravity、Kiro）启动 `codegraph serve --mcp` 时，有三层机制协同工作，让索引始终跟得上代码——并保证在从编辑到下一次同步之间的短暂窗口内，智能体绝不会拿到无声的错误答案。

### 1. 带防抖自动同步的文件监听器（始终开启）

`serve --mcp` 会在项目根目录上启动一个原生文件监听器（macOS 上是 FSEvents，Linux 上是 inotify，Windows 上是 ReadDirectoryChangesW）。源文件的每一次创建 / 修改 / 删除都会被捕获。防抖计时器把成串的编辑合并为一次同步。

```
agent writes src/Widget.ts
  → watcher fires (event delivery: typically <100ms)
  → 2000ms debounce
  → sync runs; Widget.ts's nodes + edges are in the index
  → next agent query sees it
```

**可调**：`CODEGRAPH_WATCH_DEBOUNCE_MS` 可覆盖默认的 2000ms，取值被钳制在 `[100ms, 60s]`。当构建步骤或格式化工具在短时间内密集写入大量文件时很有用——把它调到 `5000` 或 `10000`，监听器就会把这些写入合并为一次同步。

### 2. 按文件的过期提示横幅——覆盖防抖窗口

监听器的防抖带来一个短暂窗口（通常 2 秒）：刚编辑过的文件已写入磁盘，却还未进入索引。CodeGraph 用按文件的过期提示横幅封住这个窗口：只要某个 MCP 工具响应会引用一个正处于待重新索引状态的文件，该响应就会在开头附加一条 `⚠️` 横幅，点名这个过期文件：

```
⚠️ Some files referenced below were edited since the last index sync —
their codegraph entries may be stale:
  - src/Widget.ts (edited 800ms ago, pending sync)
For accurate content of those specific files, Read them directly.
The rest of this response is fresh.

## Code Context
…
```

智能体读到横幅后，会直接 `Read` 被点名的文件作为后续动作——这一点已在 Claude Code 上端到端验证过：智能体在打开文件之前，会明确表示要先直接读取该文件以获取实时内容。因此即便处在 2 秒的防抖窗口内，智能体也绝不会得到无声的错误答案。

响应中**未**引用的待处理文件则以一个小脚注呈现（`(Note: N file(s) elsewhere in this project are pending index sync but were not referenced above: …)`）。无论哪种方式，信号都是明确的。

### 3. 连接时补齐——覆盖 MCP 服务器未运行期间的空档

当你的编辑器 / 智能体（重）连接到 MCP 服务器时，codegraph 会在回答第一个查询之前先做一次快速的、基于文件系统的对账（先用 `(size, mtime)` stat 预筛，再对剩余文件计算内容哈希）。这样，在 MCP 服务器未运行期间发生变更的文件——终端里执行的一次 `git pull`、另一个编辑器里做的修改、一个跑完就退出的智能体——都会在下一次会话的第一次工具调用时自动补齐。

### 核验监听器看到了什么

`codegraph_status` 完整公开待处理集合——智能体想一次调用就问清“索引追上了吗”时正好用得上：

```
codegraph_status →
  ## CodeGraph Status
  …
  ### Pending sync:
  - src/Widget.ts (edited 1200ms ago)
```

如果响应中没有 `### Pending sync:`，就说明没有任何文件在等待同步。

### 何时需要手动 `codegraph sync`

几乎从来不需要。只有这些边缘情况：

- **监听器被禁用。** 沙箱阻止了本地文件监听，或者你设置了 `CODEGRAPH_NO_DAEMON=1` 以退出共享守护进程。这些情况下，`codegraph sync` 就是手动兜底。
- **CI 运行前预检。** 如果你在智能体会话之外针对索引写脚本，在脚本开头跑一次 `codegraph sync`，即可保证索引反映当前工作树。

其余情况：放心用就好。监听器 + 横幅 + 连接时同步已经端到端覆盖 AI 辅助工作流。如果防抖窗口过后仍发现有文件确实被漏掉，那是一个 bug——请附上可复现步骤提交 issue。

> v0.9.5 发布说明中详细记录了[过期提示横幅（#403）](https://github.com/colbymchenry/codegraph/releases/tag/v0.9.5)与连接时补齐（#414）；两者一同发布。

## 查看状态

```bash
codegraph status
```

它会报告节点/边/文件数量、当前生效的 SQLite 后端以及 journal 模式。在智能体会话中，MCP 侧的 `codegraph_status` 还会额外展示上文描述的 `### Pending sync:` 区块。

## 哪些内容会被索引

所有扩展名对应[受支持语言](/reference/languages/)的文件，减去默认排除的依赖/构建目录（`node_modules`、`vendor`、`dist` 等）、`.gitignore` 排除的一切内容，以及超过 1 MB 的文件。参见[配置](/getting-started/configuration/)。
