#!/usr/bin/env node
// 按定稿表逐条修 CJK 粗体闭合同类残留 + 两个特例锚点。幂等：无命中即跳过。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');

// [文件, 原文, 新文]
const FIXES = [
  ['as-built/architecture/content-surfaces.md',
    '**另见（v0.4.4）：**活页笔记', '**另见（v0.4.4）**：活页笔记'],
  ['as-built/architecture/content-surfaces.md',
    '**内容呈现面（content surfaces）**是', '**内容呈现面**（content surfaces）是'],
  ['as-built/architecture/content-surfaces.md',
    '**源码直译（AUTHOR-FROM-SOURCE）模块。**此前', '**源码直译（AUTHOR-FROM-SOURCE）模块**。此前'],
  ['as-built/architecture/content-surfaces.md',
    '**SPLIT NOTE（§10.6）。**本篇', '**SPLIT NOTE（§10.6）**。本篇'],
  ['as-built/architecture/content-surfaces.md',
    '**只追加；v0 永不轮转。**审计', '**只追加；v0 永不轮转**。审计'],
  ['as-built/architecture/content-surfaces.md',
    '**v0.4.4（OPR.0.4.4.20 FR-5）：**支持', '**v0.4.4（OPR.0.4.4.20 FR-5）**：支持'],
  ['as-built/architecture/content-surfaces.md',
    '**§10.7 路由实况：**`/progress`', '**§10.7 路由实况**：`/progress`'],
  ['as-built/architecture/content-surfaces.md',
    '**§10.7 路由实况：**`/steering`', '**§10.7 路由实况**：`/steering`'],
  ['as-built/architecture/coordination-primitive.md',
    '是**推导（DERIVED）**出来的', '是**推导**（DERIVED）出来的'],
  ['as-built/architecture/coordination-primitive.md',
    '是**不透明（OPAQUE）**的审计', '是**不透明**（OPAQUE）的审计'],
  ['as-built/architecture/plugin-agent-image-context-pack.md',
    '**上下文包（context pack）**是一个目录', '**上下文包**（context pack）是一个目录'],
  ['as-built/architecture/plugin-agent-image-context-pack.md',
    '**智能体镜像（agent image）**是一个', '**智能体镜像**（agent image）是一个'],
  ['as-built/architecture/plugin-agent-image-context-pack.md',
    '**上下文包（context pack）**，以及', '**上下文包**（context pack），以及'],
  ['as-built/architecture/workspace-primitive.md',
    '**工作区原语（workspace primitive，PL-007）**是', '**工作区原语**（workspace primitive，PL-007）是'],
  ['releases/v0.6.0.md',
    '#逐中权限模式', '#逐席位权限模式'],
  ['reference/help.md',
    'reference/getting-started.md#让智能体帮你配置权限', 'reference/getting-started.md#have-your-agent-configure-permissions'],
  ['reference/wave-sdlc.md',
    '（base-scoped at the tip）', '（base-scoped 的评审范围）'],
];

let n = 0;
for (const [rel, from, to] of FIXES) {
  const file = path.join(ROOT, rel);
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { console.log('MISSING ' + rel); continue; }
  if (!src.includes(from)) { console.log('SKIP ' + rel + ' :: ' + from.slice(0, 30)); continue; }
  fs.writeFileSync(file, src.split(from).join(to));
  n++;
  console.log('FIX  ' + rel + ' :: ' + from.slice(0, 30));
}
console.log('已修 ' + n + '/' + FIXES.length);
process.exit(0);