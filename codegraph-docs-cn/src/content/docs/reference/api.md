---
title: API
description: 将 CodeGraph 作为 TypeScript 库使用。
---

CodeGraph 提供了一套 TypeScript API。公开接口就是 `CodeGraph` 类。

```typescript
import CodeGraph from '@colbymchenry/codegraph';

const cg = await CodeGraph.init('/path/to/project');
// Or open an existing index:
// const cg = await CodeGraph.open('/path/to/project');

await cg.indexAll({
  onProgress: (p) => console.log(`${p.phase}: ${p.current}/${p.total}`),
});

const results = cg.searchNodes('UserService');
const callers = cg.getCallers(results[0].node.id);
const context = await cg.buildContext('fix login bug', {
  maxNodes: 20,
  includeCode: true,
  format: 'markdown',
});
const impact = cg.getImpactRadius(results[0].node.id, 2);

cg.watch();   // auto-sync on file changes
cg.unwatch(); // stop watching
cg.close();
```

## 关键方法

| 方法 | 用途 |
|---|---|
| `CodeGraph.init(path)` / `CodeGraph.open(path)` | 创建或打开项目索引 |
| `indexAll(opts)` | 全量索引，带进度回调 |
| `sync()` | 增量更新 |
| `searchNodes(query)` | 符号全文搜索 |
| `getCallers(id)` / `getCallees(id)` | 沿调用图遍历 |
| `getImpactRadius(id, depth)` | 某次变更的传递影响 |
| `buildContext(task, opts)` | 面向 AI 的 Markdown / JSON 上下文 |
| `watch()` / `unwatch()` | 启动 / 停止文件监听器 |
| `close()` | 关闭数据库连接 |

CommonJS 也可以——`const { CodeGraph } = require('@colbymchenry/codegraph');`。

## 更底层的构建块

同一个入口还导出一批底层原语，供绕过 `CodeGraph` 门面、直接驱动图谱的调用方使用：`DatabaseConnection`、`QueryBuilder`、`getDatabasePath`、`initGrammars` / `loadGrammarsForLanguages`，以及 `FileLock`。

```typescript
import {
  CodeGraph,
  DatabaseConnection,
  QueryBuilder,
  getDatabasePath,
  initGrammars,
  loadGrammarsForLanguages,
  FileLock,
} from '@colbymchenry/codegraph';
```

## 嵌入要求

- **从 npm 安装**（`npm i @colbymchenry/codegraph`），确保承载编译后库文件的对应平台包随 shim 一起被拉取。
- 这套 API 运行在**你自己的**运行时上，因此需要 **Node 22.5+** 才有内置的 `node:sqlite` 模块可用（Electron 主进程只要其捆绑的 Node 达到 22.5+ 即符合条件）。CLI 和 MCP 服务器不受影响——它们自带完整打包的运行时，完全不需要 Node。
- TypeScript 类型随包附带。请保持 `@types/node` 可用，并设置 `skipLibCheck: true`（常见默认值）。
