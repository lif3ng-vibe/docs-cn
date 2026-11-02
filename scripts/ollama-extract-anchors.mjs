#!/usr/bin/env node
// 从 Mintlify 原站 HTML 底稿提取 h1-h4 锚点映射（英文基线）
// 用法: node ollama-extract-anchors.mjs <html目录> <输出json>
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [dir, outFile] = process.argv.slice(2);
const out = {};
function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      const ids = [];
      const re = /<h([1-4])[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
      let m;
      while ((m = re.exec(html))) {
        const txt = m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        ids.push([m[2], txt]);
      }
      const key = relative(dir, p).replace(/\\/g, '/').replace(/\.html$/, '');
      out[key] = ids;
    }
  }
}
walk(dir);
writeFileSync(outFile, JSON.stringify(out, null, 1));
const n = Object.values(out).reduce((a, b) => a + b.length, 0);
console.log('pages:', Object.keys(out).length, 'anchors:', n);
console.log('sample quickstart:', JSON.stringify(out['quickstart']?.slice(0, 8)));
