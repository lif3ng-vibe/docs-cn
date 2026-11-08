#!/usr/bin/env node
/**
 * 终检：
 *  1) dist 正文扫字面 **（CJK 粗体闭合失败，剥 script/style/pre/code 后）
 *  2) 页内锚点核对：html href="#x" 与本页 id="x" 比对
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/docs/out');
// 收集 html 文件；txt(RSC payload) 只参与 ** 扫描
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html') || e.name.endsWith('.txt')) out.push(p);
  }
  return out;
};

const strip = (s) => {
  s = s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<[^>]+>/g, '');
  return s;
};

let starHits = 0, anchorBad = 0;
for (const p of walk(outDir)) {
  const raw = readFileSync(p, 'utf8');
  const text = strip(raw);
  let i = -1;
  while ((i = text.indexOf('**', i + 1)) !== -1 && starHits < 20) {
    const ctx = text.slice(Math.max(0, i - 40), i + 42).replace(/\s+/g, ' ');
    console.log('[literal **] ' + p.slice(outDir.length + 1) + '\n  …' + ctx + '…');
    starHits++;
    break;
  }
}

for (const p of walk(outDir)) {
  if (!p.endsWith('.html')) continue;
  const raw = readFileSync(p, 'utf8');
  const ids = new Set();
  for (const m of raw.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  for (const m of raw.matchAll(/\shref="#([^"]+)"/g)) {
    const a = decodeURIComponent(m[1]);
    if (!ids.has(a)) {
      anchorBad++;
      if (anchorBad <= 15)
        console.log('[broken #] ' + p.slice(outDir.length + 1) + ' #' + a);
    }
  }
}
console.log('literal-** pages: ' + starHits + ' | broken same-page anchors: ' + anchorBad);
