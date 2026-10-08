// Anchor check: scans the generated dist/, extracts id="..." from each page,
// then checks whether the targets of all href="...#anchor" links all exist.
// Usage: node scripts/check-anchors.mjs  (run after build)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}
import { dirname } from 'node:path';

// pagePath (site-relative, starting with /) -> Set(ids)
const idsByPage = new Map();
for (const f of walk(DIST)) {
  const page = '/' + relative(DIST, f).replaceAll('\\', '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  const html = readFileSync(f, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  idsByPage.set(page, ids);
}

const broken = [];
for (const [page, ids] of idsByPage) {
  const file = join(DIST, page === '/' ? 'index.html' : page.replace(/\/$/, '') + '/index.html');
  let html;
  try { html = readFileSync(file, 'utf8'); } catch { html = readFileSync(join(DIST, page.replace(/\/$/, '') + '.html'), 'utf8'); }
  for (const m of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const href = m[1];
    // Skip in-page and cross-page anchors
    if (href.startsWith('http')) continue;
    const [rawPath, anchor] = href.split('#');
    let targetPage = page;
    if (rawPath !== '') {
      if (!rawPath.startsWith('/')) continue; // relative js/css etc.
      targetPage = rawPath.endsWith('/') ? rawPath : rawPath + '/';
    }
    const target = idsByPage.get(targetPage);
    if (!target) { broken.push(`link page does not exist: ${href} (on ${page})`); continue; }
    if (!target.has(anchor)) broken.push(`${page} -> #${anchor} (target page ${targetPage} has no such id)`);
  }
}

if (broken.length === 0) {
  console.log('ANCHORS CLEAN (' + idsByPage.size + ' pages)');
} else {
  console.log('BROKEN ANCHORS: ' + broken.length);
  for (const b of broken) console.log('  ' + b);
  process.exit(1);
}