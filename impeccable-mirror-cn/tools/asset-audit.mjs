#!/usr/bin/env node
// 全站静态资产审计：扫描所有本地文本文件里的站内资产引用，报告磁盘缺失
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const RE = /\/(?:_astro|assets|antipattern-images|antipattern-examples|images|js)\/[A-Za-z0-9._/-]+\.(?:webp|png|jpe?g|svg|css|js|json|woff2?|txt)/g;

const refs = new Map(); // ref -> Set(source)
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(html|js|json|css|xml|txt)$/i.test(f)) continue;
    const t = fs.readFileSync(p, 'utf8');
    const rel = path.relative(ROOT, p).split(path.sep).join('/');
    for (const m of t.matchAll(RE)) {
      if (!refs.has(m[0])) refs.set(m[0], new Set());
      refs.get(m[0]).add(rel);
    }
  }
}
walk(ROOT);

let missing = 0;
for (const [ref, srcs] of [...refs].sort()) {
  if (fs.existsSync(path.join(ROOT, ref.slice(1)))) continue;
  missing++;
  console.log(`MISSING ${ref}  ←  ${[...srcs].slice(0, 3).join(', ')}${srcs.size > 3 ? ` (+${srcs.size - 3})` : ''}`);
}
console.log(`\ntotal refs: ${refs.size}, missing: ${missing}`);
