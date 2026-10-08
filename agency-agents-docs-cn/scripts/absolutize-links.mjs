// 把 src/content/docs 里正文 authored 相对 .md 链接改写为根绝对 URL（去掉 .md）。
// 与 import-sources.mjs 的映射保持同一口径：README.md→catalog.md、
// integrations/*/README.md→integrations/*/index.md。
// 一次性脚本：跑完提交后不再需要；对已是 / 开头的链接跳过。
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const docs = join(root, 'src', 'content', 'docs');

const DIVISIONS = new Set([
  'academic', 'design', 'engineering', 'finance', 'game-development', 'gis',
  'healthcare', 'marketing', 'paid-media', 'product', 'project-management',
  'research', 'sales', 'security', 'spatial-computing', 'specialized',
  'support', 'testing',
]);

// docs 根相对目标 .md 路径 -> 目标 URL（不含 base）
function targetUrl(docRootRel) {
  if (docRootRel === 'README.md') return '/catalog/';
  if (docRootRel === 'CONTRIBUTING.md') return '/contributing/';
  if (docRootRel === 'SECURITY.md') return '/security/';
  if (docRootRel === 'integrations/README.md') return '/integrations/';
  let p = docRootRel;
  const m = p.match(/^integrations\/([^/]+)\/README\.md$/);
  if (m) return `/integrations/${m[1]}/`;
  const top = p.split('/')[0];
  if (top === 'integrations') return '/' + p.replace(/\.md$/, '').replace(/\/index$/, '/') ;
  if (!(DIVISIONS.has(top) || top === 'strategy' || top === 'examples')) return null;
  return '/' + p.replace(/\.md$/, '') + '/';
}

function walk(dir) {
  let out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (n.endsWith('.md')) out.push(p);
  }
  return out;
}

let rewrites = 0;
const files = walk(docs);
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  const fileDir = dirname(f);
  let changed = 0;
  const out = text.replace(/\]\(([^:()\s]+?\.md)((?:#[^)\s]*)?)\)/g, (whole, rel, frag) => {
    if (rel.startsWith('/') || rel.startsWith('http')) return whole;
    const abs = resolve(fileDir, rel);
    const docRootRel = relative(docs, abs).replaceAll(sep, '/');
    if (docRootRel.startsWith('..')) { console.log('OUTSIDE:', f === undefined ? '' : relative(root, f).replaceAll(sep, '/'), '->', docRootRel); return whole; }
    const url = targetUrl(docRootRel);
    // 目标文件按同一映射口径还原：README→catalog.md、integrations/*/README→index.md
    let targetFile = docRootRel
      .replace(/^README\.md$/, 'catalog.md')
      .replace(/^integrations\/([^/]+)\/README\.md$/, 'integrations/$1/index.md');
    const hasTarget = url !== null && existsSync(join(docs, targetFile));
    if (!url || !hasTarget) {
      console.log('MISS:', relative(root, f).replaceAll(sep, '/'), '->', docRootRel, '(no target)');
      return whole;
    }
    rewrites++;
    changed++;
    return '](' + url + (frag || '') + ')';
  });
  if (changed) writeFileSync(f, out);
}
console.log('rewrites:', rewrites);