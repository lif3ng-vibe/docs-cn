#!/usr/bin/env node
/**
 * check-bold-literal.mjs —— 扫导出产物正文里的字面 `**`（CJK 粗体闭合失败的特征）
 *
 * CommonMark 的 right-flanking 规则：粗体闭合 `**` 前是全角/半角标点且后面紧跟
 * 文字时闭合失败，页面字面显示 `**`。剥掉 script/style/code/pre 与全部标签后
 * grep 字面 `**`，命中即翻译引入的坑（英文原文本无字面 **）。
 *
 * 用法：node scripts/check-bold-literal.mjs [dist目录]
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), process.argv[2] || 'dist');
const hits = [];
let pages = 0;

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(code|pre)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') {
      pages++;
      const text = strip(readFileSync(p, 'utf8'));
      for (const m of text.matchAll(/\*\*/g)) {
        const ctx = text.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, ' ');
        hits.push(`${relative(DIST, join(dir, e.name)) || '(root)'}: …${ctx}…`);
      }
    }
  }
})(DIST);

console.log(`扫描 ${pages} 页`);
if (hits.length) {
  console.log(`字面 ** 命中 ${hits.length} 处：\n` + hits.join('\n'));
  process.exit(1);
}
console.log('CLEAN：无字面 **');
