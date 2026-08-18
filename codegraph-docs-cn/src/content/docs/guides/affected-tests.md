---
title: CI 中的受影响测试
description: 只运行一次变更真正触及的测试。
---

`codegraph affected` 会沿导入依赖传递追踪，找出一组已变更的源文件会波及哪些测试文件——CI 因此可以只运行相关的测试。

```bash
codegraph affected src/utils.ts src/api.ts          # pass files as arguments
git diff --name-only | codegraph affected --stdin    # pipe from git diff
codegraph affected src/auth.ts --filter "e2e/*"      # custom test-file pattern
```

## 选项

| 选项 | 描述 | 默认值 |
|---|---|---|
| `--stdin` | 从 stdin 读取文件列表 | `false` |
| `-d, --depth <n>` | 依赖遍历的最大深度 | `5` |
| `-f, --filter <glob>` | 用于识别测试文件的自定义 glob | auto-detect |
| `-j, --json` | 以 JSON 格式输出 | `false` |
| `-q, --quiet` | 只输出文件路径 | `false` |

## CI / 钩子示例

```bash
#!/usr/bin/env bash
AFFECTED=$(git diff --name-only HEAD | codegraph affected --stdin --quiet)
if [ -n "$AFFECTED" ]; then
  npx vitest run $AFFECTED
fi
```
