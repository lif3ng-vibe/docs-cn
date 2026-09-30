#!/usr/bin/env node
// dist 的 base 前缀终检：DOCS_BASE 注入后，页内 href/src 根路径必须全部带前缀。
const fs = require('fs');

const base = (process.env.DOCS_BASE || '/').replace(/\/+$/, '');
if (base === '' || base === '/') {
  console.log('DOCS_BASE 未设置——根路径构建，跳过前缀校验');
  process.exit(0);
}

const files = [];
function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
}
collect('dist');

let seen = 0;
let bad = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const attr of html.match(/(?:src|href)="\/[^"]*"/g) || []) {
    seen++;
    const v = attr.slice(attr.indexOf('"') + 1, -1);
    if (v === base || v.startsWith(base + '/')) continue;
    bad++;
    if (bad <= 10) console.log(f, '=>', v);
  }
}
const home = fs.readFileSync('dist/index.html', 'utf8');
const canon = (home.match(/rel="canonical" href="([^"]+)"/) || [])[1] || '';
if (canon && !canon.startsWith((process.env.DOCS_SITE || '') + base + '/')) {
  bad++;
  console.log('canonical 不带站点+base:', canon);
}
console.log('站内根路径 ' + seen + ' 处，未带前缀 ' + bad + ' 处');
process.exit(bad ? 1 : 0);
