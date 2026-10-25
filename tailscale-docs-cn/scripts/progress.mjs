#!/usr/bin/env node
// 译态进度扫描：剥代码围栏后按 CJK 正文行占比判定 ZH / PARTIAL / EN。
// 用法：node scripts/progress.mjs   → 打印各目录计数 + 总进度
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'src', 'content', 'docs', 'docs');

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md')) out.push(p);
  }
  return out;
}

function judge(text) {
  let fence = false;
  let zh = 0;
  let total = 0;
  for (const line of text.split('\n')) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      fence = !fence;
      continue;
    }
    if (fence || !line.trim()) continue;
    const s = line.replace(/^#+\s*/, '').replace(/^\s*[-*>|]\s*/, '');
    if (!s.trim()) continue;
    total++;
    const cjk = (s.match(/[一-龥]/g) || []).length;
    if (cjk / Math.max(1, s.replace(/\s/g, '').length) > 0.1) zh++;
  }
  const ratio = total ? zh / total : 0;
  return ratio > 0.5 ? 'ZH' : ratio > 0.05 ? 'PARTIAL' : 'EN';
}

const byDir = new Map();
let zh = 0;
let partial = 0;
let en = 0;
for (const f of walk(docs)) {
  const v = judge(readFileSync(f, 'utf8'));
  const rel = relative(docs, f).replaceAll('\\', '/');
  const d = rel.includes('/') ? rel.split('/')[0] : '(root)';
  const e = byDir.get(d) || { ZH: 0, PARTIAL: 0, EN: 0 };
  e[v]++;
  byDir.set(d, e);
  if (v === 'ZH') zh++;
  else if (v === 'PARTIAL') partial++;
  else en++;
}
for (const [d, e] of byDir) {
  console.log(`${d.padEnd(32)} ZH=${String(e.ZH).padStart(3)}  PARTIAL=${String(e.PARTIAL).padStart(3)}  EN=${String(e.EN).padStart(3)}`);
}
console.log(`TOTAL: ${zh + partial + en}  ZH=${zh}  PARTIAL=${partial}  EN=${en}  (${Math.round((zh / (zh + partial + en)) * 100)}%)`);
