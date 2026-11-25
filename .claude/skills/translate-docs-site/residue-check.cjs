#!/usr/bin/env node
/**
 * residue-check.cjs — 文档英文残留检查（translate-docs-site skill 附带工具）
 *
 * 用法：node residue-check.cjs <file-or-dir> [more files/dirs...]
 * 行为：跳过 ``` / ~~~ 围栏代码块后，对非表格行（不以 | 开头）跑
 *      /^[^`|#>-].*\b(the|and|with|your|from|that)\b/i
 * 输出：残留行按 文件:行号:内容 打印；全干净时打印 CLEAN 并退出 0，
 *      有残留退出 1。
 *
 * 为什么不用 awk：Git Bash (gawk) 的 \b 是退格符不是词边界，且无匹配
 * 退出码仍为 0 —— `awk ... || echo CLEAN` 永远显示 CLEAN（假阴性）。
 *
 * 已知误报：链接目标里的英文 slug（如 (../your-first-graph/)）会命中
 * \byour\b —— 人工判断后可忽略，或先剔除链接再查。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RE = /^[^`|#>-].*\b(the|and|with|your|from|that)\b/i;

function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    return fs.readdirSync(p).flatMap((f) => walk(path.join(p, f)));
  }
  return /\.(md|mdx)$/i.test(p) ? [p] : [];
}

const files = process.argv.slice(2).flatMap(walk);
if (files.length === 0) {
  console.error('usage: node residue-check.cjs <file-or-dir> [...]');
  process.exit(2);
}

let found = false;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let incode = false;
  lines.forEach((l, i) => {
    if (/^(```|~~~)/.test(l)) {
      incode = !incode;
      return;
    }
    if (incode) return;
    if (RE.test(l)) {
      found = true;
      console.log(`${f}:${i + 1}: ${l}`);
    }
  });
}
if (!found) console.log('CLEAN');
process.exit(found ? 1 : 0);
