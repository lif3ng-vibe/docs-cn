// 终检脚本：把 src/content/docs 里所有站内链接的 #锚点 与构建产物里的 id 比对。
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src', 'content', 'docs');
const pages = new Map(); // slug -> Set of ids

function walk(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else cb(p);
  }
}

walk(dist, (p) => {
  if (path.basename(p) !== 'index.html') return;
  const html = fs.readFileSync(p, 'utf8');
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const slug = path.relative(dist, path.dirname(p)).split(path.sep).join('/');
  pages.set(slug === '' ? '(root)' : slug, ids);
});

const missing = [];
walk(srcDir, (p) => {
  if (!p.endsWith('.md')) return;
  const md = fs.readFileSync(p, 'utf8');
  for (const m of md.matchAll(/\]\((\/[^)#]*?)(?:#([^)]+))?\)/g)) {
    const slug = m[1].replace(/^\//, '').replace(/\/$/, '');
    const anchor = m[2];
    if (!anchor) continue;
    const ids = pages.get(slug === '' ? '(root)' : slug);
    if (!ids) { missing.push(`${path.basename(p)} -> page "${slug}" not found in dist`); continue; }
    const decoded = decodeURIComponent(anchor);
    if (!ids.has(decoded)) missing.push(`${path.basename(p)} -> #${decoded} (page ${slug || 'root'})`);
  }
});

console.log(missing.length ? `MISSING ${missing.length} ANCHOR(S):` : 'ALL INTERNAL ANCHORS OK');
missing.forEach((x) => console.log(' ', x));
process.exit(missing.length ? 1 : 0);
