#!/usr/bin/env node
// 终检：扫 dist 渲染产物里的字面 "**"（CJK 粗体闭合失败的页上症状）。
// 剥掉 script/style/pre/code/figure（expressive-code 代码块是 <figure class="frame">）
// 后再查正文文本。命中即译文引入了 CommonMark 粗体闭合坑，回源修复。
// 用法：node scripts/scan-dist-bold.mjs   （构建后执行；干净打印 CLEAN 退出 0）
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');

function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith('.html')) out.push(p);
  }
  return out;
}

const stripBlocks = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code\b[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

let bad = 0;
for (const f of walk(DIST)) {
  const text = stripBlocks(readFileSync(f, 'utf8'));
  let i = text.indexOf('**');
  if (i < 0) continue;
  bad++;
  const snippet = text.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ');
  console.log(relative(DIST, f).replaceAll('\\', '/') + '  …' + snippet + '…');
}
console.log(bad === 0 ? 'CLEAN' : `hits: ${bad} pages`);
process.exit(bad === 0 ? 0 : 1);
