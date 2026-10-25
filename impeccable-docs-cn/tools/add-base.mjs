#!/usr/bin/env node
/**
 * Source-level base prefixing for the Astro rebuild mirror.
 * Run AFTER translation: node tools/add-base.mjs
 *
 * Astro only rewrites generated URLs (canonical/sitemap via Astro.site); authored
 * links in md/astro stay root-relative, so we prefix them at the source level
 * (pattern proven on the agent-skills Astro mirror).
 *
 * Rewrites, in site/content, site/pages, site/layouts, site/components,
 * site/data, site/scripts (source files only):
 *   ](/x)        → ](/docs-cn/impeccable/x)          (md links)
 *   href="/x"    → href="/docs-cn/impeccable/x"      (astro/html)
 *   src="/x"     → src="/docs-cn/impeccable/x"
 *   url(/x)      → url(/docs-cn/impeccable/x)        (css)
 * Excludes // externals and already-prefixed paths. /api/* stays (rewritten at
 * deploy stage — see README).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = '/docs-cn/impeccable';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['site/content', 'site/pages', 'site/layouts', 'site/components', 'site/data', 'site/scripts', 'site/public'];
// 展示成品（虚构会议落地页）保持原样，不做前缀化
const SKIP_SUBSTR = ['site/public/neo-mirai'];
const EXTS = new Set(['.md', '.astro', '.ts', '.js', '.mjs', '.css', '.html']);

const LOCAL = /^\/(docs|tutorials|slop|gallery|research|cases|designing|live-mode|faq|privacy|changelog|neo-mirai|design-system|labs|live-lab|shader-lab|_data|js|assets|antipattern-images|antipattern-examples|images|favicon\.svg|apple-touch-icon\.png|og-image|sitemap\.xml|robots\.txt)/;

function prefix(url) {
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  if (url.startsWith(BASE + '/')) return null;      // already prefixed
  if (url.startsWith('/api/')) return null;         // handled separately
  if (!LOCAL.test(url.split('#')[0].split('?')[0])) return null;
  return BASE + url;
}

let files = 0;
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!EXTS.has(path.extname(p))) continue;
    const norm = p.replaceAll(path.sep, '/');
    if (SKIP_SUBSTR.some((s) => norm.includes(s))) continue;
    let t = fs.readFileSync(p, 'utf8');
    const before = t;
    t = t.replace(/\]\((\/[^)\s]+)/g, (m, u) => { const r = prefix(u); return r ? `](${r})` : m; });
    t = t.replace(/(href|src|poster|data-src)="(\/[^"*)]+)/g, (m, attr, u) => { const r = prefix(u); return r ? `${attr}="${r}"` : m; });
    t = t.replace(/(href|src)=\{?"(\/[^"}]*)"/g, (m, attr, u) => { const r = prefix(u); return r ? `${attr}="${r}"` : m; });
    // 单引号对象值（astro/ts 数据数组：href: '/docs/x'）
    t = t.replace(/(href|src|poster|data-src|path|url|link)\s*:\s*'(\/[^']+)'/g, (m, attr, u) => { const r = prefix(u); return r ? `${attr}: '${r}'` : m; });
    t = t.replace(/url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g, (m, u) => { const r = prefix(u); return r ? `url(${r})` : m; });
    t = t.replace(/["'](\/(?:_data|js)\/[^"'\s)]+)["']/g, (m, u) => { const r = prefix(u); return r ? `"${r}"` : m; });
    if (t !== before) { fs.writeFileSync(p, t); files++; }
  }
}

for (const d of DIRS) walk(path.join(ROOT, d));

// static sitemap/robots → deployed URLs
const SITE_URL = 'https://lif3ng-vibe.github.io';
for (const f of ['site/public/sitemap.xml', 'site/public/robots.txt']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) {
    const t = fs.readFileSync(p, 'utf8').replaceAll('https://impeccable.style', SITE_URL + BASE);
    if (t !== fs.readFileSync(p, 'utf8')) { fs.writeFileSync(p, t); files++; }
  }
}

console.log(`prefixed: ${files} files (base=${BASE})`);
