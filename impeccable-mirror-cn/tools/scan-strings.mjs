#!/usr/bin/env node
// 临时扫描：列出 chunk 里疑似 UI 文案的短字符串（大写开头、无标记符号）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site', '_astro');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
for (const f of files) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const cands = new Set();
  for (const m of t.matchAll(/[`'"]([^`'"\n]{3,60})[`'"]/g)) {
    const s = m[1];
    if (!/^[A-Z][A-Za-z'' ]+$/.test(s)) continue; // 纯词组，无标点
    if (s.split(' ').length > 5 || s.split(' ').length < 1) continue;
    if (s.length < 4) continue;
    cands.add(s);
  }
  if (cands.size) console.log(`== ${f} ==\n  ${[...cands].slice(0, 20).join('\n  ')}`);
}
