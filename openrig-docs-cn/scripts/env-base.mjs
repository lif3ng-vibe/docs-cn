#!/usr/bin/env node
// 校验 dist 的 base 前缀：DOCS_BASE 注入后，内链/资/canonical 必须全部带前缀。
import fs from 'node:fs';

const base = (process.env.DOCS_BASE || '/').replace(/\/$/, '');
if (base === '/') {
  console.log('DOCS_BASE 未设置——本地根路径构建，跳过前缀校验');
  process.exit(0);
}
const site = process.env.DOCS_SITE || '';

const page = fs.readFileSync('dist/reference/getting-started/index.html', 'utf8');
const idx = fs.readFileSync('dist/index.html', 'utf8');
const home = fs.readFileSync('dist/index.html', 'utf8');
let bad = 0;
for (const [file, html] of [['reference/getting-started', page], ['index', idx]]) {
  void file;
  if (!html.includes(base + '/')) { bad++; console.log('MISS base 出现:', file); }
  for (const m of html.match(/(?:src|href)="\/(?:_(?:astro|fonts)|[^"s][^"]*)"/g) || []) {
    const v = m.slice(('src|href="').length + 0);
    if (v.startsWith(base + '/') || v.startsWith('/') === false) continue;
    bad++;
    console.log('NOT-PREFIXED', file, '→', v);
  }
}
if (site) {
  const canon = (page.match(/rel="canonical" href="([^"]+)"/) || [])[1] || '';
  if (!canon.startsWith(site + base + '/')) { bad++; console.log('canonical 不带站点+base:', canon); }
}
console.log('base 前缀校验：', bad ? bad + ' 处问题' : '全部通过');
process.exit(bad ? 1 : 0);
