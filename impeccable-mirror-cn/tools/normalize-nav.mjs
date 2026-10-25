#!/usr/bin/env node
// 统一全站 nav aria 与 header 脚本内导航字符串（一次性）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (f === 'index.html') out.push(p);
  }
  return out;
}

let n = 0;
for (const f of walk(ROOT)) {
  let t = fs.readFileSync(f, 'utf8');
  const before = t;
  t = t.split('aria-label="Primary"').join('aria-label="主导航"');
  t = t.split("'Close navigation' : 'Open navigation'").join("'关闭导航' : '打开导航'");
  if (t !== before) { fs.writeFileSync(f, t); n++; }
}
console.log('normalized files:', n);
