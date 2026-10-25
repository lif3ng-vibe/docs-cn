// 锚点校验：构建后核对 dist 里页内 href="#..." 与实际 id 是否匹配（跨页也查）
// 用法：node scripts/verify-anchors.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', process.argv[2] || 'dist');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_astro' && e.name !== '.prerender') yield* walk(p); }
    else if (e.name === 'index.html') yield p;
  }
}

function stripNoise(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<code[\s\S]*?<\/code>/gi, (m) => m.replace(/href=|id=/g, 'x='))
    .replace(/<pre[\s\S]*?<\/pre>/gi, (m) => m.replace(/href=|id=/g, 'x='));
}

const idsByPage = new Map(); // pagePath -> Set(id)
for (const f of walk(DIST)) {
  const page = path.relative(DIST, path.dirname(f)).replaceAll('\\', '/');
  const ids = new Set();
  for (const m of stripNoise(fs.readFileSync(f, 'utf8')).matchAll(/ id="([^"]+)"/g)) ids.add(m[1]);
  idsByPage.set(page === '.' ? '' : page, ids);
}

function pageKeyFor(hrefPath) {
  // href="/about/x"（本地根路径构建）或 "/docs-cn/openshell/about/x"（带 base）→ dist 页目录 about/x
  let p = hrefPath;
  if (p.startsWith('/docs-cn/')) p = p.replace(/^\/docs-cn\/[^/]+/, '');
  return p.replace(/^\//, '').replace(/\/$/, '').replace(/\.html?$/, '');
}

let checked = 0;
const bad = [];
for (const [page, ids] of idsByPage) {
  const html = stripNoise(fs.readFileSync(path.join(DIST, page, 'index.html'), 'utf8'));
  for (const m of html.matchAll(/ href="([^"]*)#([^"]+)"/g)) {
    const [full, base, frag] = m;
    if (/^https?:|^mailto:/.test(base)) continue;
    checked++;
    const targetPage = base === '' ? page : pageKeyFor(base);
    const targetIds = idsByPage.get(targetPage);
    const decoded = decodeURIComponent(frag);
    if (!targetIds) { bad.push(`${page}: ${full}（目标页不存在: ${targetPage}）`); continue; }
    if (!targetIds.has(frag) && !targetIds.has(decoded)) {
      bad.push(`${page}: ${full}`);
    }
  }
}
console.log(`checked=${checked} broken=${bad.length}`);
for (const b of bad.slice(0, 80)) console.log('  ', b);
process.exit(bad.length ? 1 : 0);
