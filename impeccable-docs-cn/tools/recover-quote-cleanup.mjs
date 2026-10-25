#!/usr/bin/env node
// 确定性恢复：除 docs/tutorials 两个索引页外，脏 astro 回退 HEAD →
// 重跑 add-base 逻辑（内联）→ 修正版笔误清理（跳过空属性 attr=""）→
// DocsSidebar/索引页模板链接前缀化。
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const KEEP = new Set(['site/pages/docs/index.astro', 'site/pages/tutorials/index.astro']);
const dirty = execSync('git diff --name-only', { encoding: 'utf8' })
  .trim().split(/\r?\n/)
  .filter((f) => f.endsWith('.astro') && !KEEP.has(f));

for (const f of dirty) execSync(`git checkout -- "${f}"`);
console.log('reverted:', dirty.length);

const B = '/docs-cn/impeccable';
const LOCAL = /^\/(docs|tutorials|slop|gallery|research|cases|designing|live-mode|faq|privacy|changelog|neo-mirai|design-system|labs|live-lab|shader-lab|_data|js|assets|antipattern-images|antipattern-examples|images|favicon\.svg|apple-touch-icon\.png|og-image|sitemap\.xml|robots\.txt)/;
function prefix(u) {
  if (!u.startsWith('/') || u.startsWith('//')) return null;
  if (u.startsWith(B + '/') || u.startsWith('/api/')) return null;
  if (!LOCAL.test(u.split('#')[0].split('?')[0])) return null;
  return B + u;
}

// 1. add-base 等价处理（双引号属性 + 单引号对象值 + md 链接 + css url + _data/js 字符串）
for (const dir of ['site/content', 'site/pages', 'site/layouts', 'site/components', 'site/data', 'site/scripts', 'site/public']) {
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = pathJoin(d, f);
      if (fs.statSync(p).isDirectory()) { walk(p); continue; }
      if (!/\.(md|astro|ts|js|mjs|css|html)$/.test(f)) continue;
      let t = fs.readFileSync(p, 'utf8');
      const before = t;
      t = t.replace(/\]\((\/[^)\s]+)/g, (m, u) => { const r = prefix(u); return r ? `](${r})` : m; });
      t = t.replace(/(href|src|poster|data-src)="(\/[^"*)]+)/g, (m, a, u) => { const r = prefix(u); return r ? `${a}="${r}"` : m; });
      t = t.replace(/(href|src|poster|data-src|path|url|link)\s*:\s*'(\/[^']+)'/g, (m, a, u) => { const r = prefix(u); return r ? `${a}: '${r}'` : m; });
      t = t.replace(/url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g, (m, u) => { const r = prefix(u); return r ? `url(${r})` : m; });
      t = t.replace(/["'](\/(?:_data|js)\/[^"'\s)]+)["']/g, (m, u) => { const r = prefix(u); return r ? `"${u}"` : m; });
      if (t !== before) fs.writeFileSync(p, t);
    }
  };
  walk(dir);
}

// 2. 笔误清理：属性闭合引号后紧跟多余引号（跳过空属性 attr=""）
let cleaned = 0;
for (const d of ['site/pages', 'site/components', 'site/layouts']) {
  const walk2 = (dd) => {
    for (const f of fs.readdirSync(dd)) {
      const p = pathJoin(dd, f);
      if (fs.statSync(p).isDirectory()) { walk2(p); continue; }
      if (!f.endsWith('.astro')) continue;
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      let changed = false;
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes('<') || !lines[i].includes('""')) continue;
        const fixed = lines[i].replace(/(?<=[a-zA-Z0-9;/%])""(?=[\s/>])/g, '"');
        if (fixed !== lines[i]) { lines[i] = fixed; changed = true; }
      }
      if (changed) { fs.writeFileSync(p, lines.join('\n')); cleaned++; }
    }
  };
  walk2(d);
}

// 3. 模板链接前缀（DocsSidebar + 两个索引页）
const tpl = [
  ['site/components/DocsSidebar.astro', [
    ['href={`/tutorials/${t.id}`}', `href={\`${B}/tutorials/\${t.id}\`}`],
    ['href={`/docs/${entry.id}`}', `href={\`${B}/docs/\${entry.id}\`}`],
    ['href={`/docs/${cmd.slug}`}', `href={\`${B}/docs/\${cmd.slug}\`}`],
  ]],
  ['site/pages/docs/index.astro', [
    ['href={`/docs/${step.slug}`}', `href={\`${B}/docs/\${step.slug}\`}`],
    ['href={`/docs/${chain.a}`}', `href={\`${B}/docs/\${chain.a}\`}`],
    ['href={`/docs/${chain.b}`}', `href={\`${B}/docs/\${chain.b}\`}`],
    ['href={`/docs/${entry.slug}`}', `href={\`${B}/docs/\${entry.slug}\`}`],
  ]],
  ['site/pages/tutorials/index.astro', [
    ['href={`/tutorials/${t.id}`}', `href={\`${B}/tutorials/\${t.id}\`}`],
  ]],
];
for (const [f, pairs] of tpl) {
  let t = fs.readFileSync(f, 'utf8');
  for (const [a, b] of pairs) t = t.split(a).join(b);
  fs.writeFileSync(f, t);
}

// 4. 修复被前缀化破坏的 filter（docs/index.astro）
let di = fs.readFileSync('site/pages/docs/index.astro', 'utf8');
di = di.split('`/docs/${entry.id}` === topic.href').join(`topic.href.endsWith('/docs/' + entry.id)`);
fs.writeFileSync('site/pages/docs/index.astro', di);

function pathJoin(d, f) { return d.replace(/\/$/, '') + '/' + f; }
console.log('re-prefixed + cleaned:', cleaned, 'files');
