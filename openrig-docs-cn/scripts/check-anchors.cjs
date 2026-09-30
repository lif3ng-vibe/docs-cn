#!/usr/bin/env node
// dist 锚点核对：每个 html 页内 href="#x" 必须能命中本页某个 id。
// 用法：node scripts/check-anchors.cjs  （先 npm run build）
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

let pages = 0, links = 0, bad = 0;
for (const file of walk(DIST)) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  const rel = path.relative(DIST, file);
  const hrefs = new Set();
  for (const m of html.matchAll(/href="#([^"]+)"/g)) hrefs.add(m[1]);
  if (!hrefs.size) continue;
  pages++;
  for (const h of hrefs) {
    links++;
    if (!ids.has(h)) {
      bad++;
      console.log(`MISS ${rel}  #${h}`);
    }
  }
}
console.log(`\n页 ${pages}，页内锚点链接 ${links}，失配 ${bad}`);
process.exit(bad ? 1 : 0);
