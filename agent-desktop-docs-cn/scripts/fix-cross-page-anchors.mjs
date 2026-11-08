#!/usr/bin/env node
/**
 * 锚点回修：标题译成中文后锚点改变。用 .anchor-maps/ 的逐文件映射
 * （英文标题 | 中文标题 | 新锚点）重算两类链接：
 *  1) 跨页：](/desktop/xxx#english-anchor)
 *  2) 同页：](#english-anchor)
 * 命令名标题未译的页不在映射表中，链接原样保留（锚点未变）。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'apps/docs/content/docs');
const mapsDir = join(root, '.anchor-maps');

const log = (m) => console.log(`[fix-anchors] ${m}`);

/** github-slugger 近似规则：小写、去标点、空格转连字符、保留 CJK。 */
const slug = (s) =>
  s.toLowerCase().trim().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/\s/g, '-');

/** 源码相对路径 -> 站内 URL 路径（/desktop/…，index 归目录根）。 */
const cleanOf = (rel) => {
  let parts = (rel.endsWith('.mdx') ? rel.slice(0, -4) : rel).split('/');
  if (parts[parts.length - 1] === 'index') parts = parts.slice(0, -1);
  return '/' + ['desktop', ...parts.filter(Boolean)].join('/');
};

const walk = (dir, ext, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
};

// pageUrl -> Map(enSlug -> cnAnchor)
const pageAnchors = new Map();
for (const mapFile of walk(mapsDir, '.map.md')) {
  const relMap = relative(mapsDir, mapFile).replace(/\.map\.md$/, '');
  const rel = relMap.split(String.fromCharCode(92)).join('/');
  const pageUrl = cleanOf(rel);
  const rows = readFileSync(mapFile, 'utf8')
    .split('\n')
    .map((l) => l.split('|').map((s) => s.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] && cols[2]);
  if (!rows.length) continue;
  const dict = pageAnchors.get(pageUrl) ?? new Map();
  for (const [en, , cnAnchor] of rows) dict.set(slug(en), cnAnchor);
  pageAnchors.set(pageUrl, dict);
}
log(`loaded ${pageAnchors.size} pages with anchor maps`);

let filesChanged = 0, rewrote = 0, unresolved = 0;
const samples = [];

for (const file of walk(contentDir, '.mdx')) {
  const rel = relative(contentDir, file).split(String.fromCharCode(92)).join('/');
  const pageUrl = cleanOf(rel);
  const own = pageAnchors.get(pageUrl);
  let src = readFileSync(file, 'utf8');
  let changed = false;

  // 跨页：](/desktop/xxx#en)
  src = src.replace(/\]\(\/desktop\/[^)#\s]*#([^)\s]+)\)/g, (m, en) => {
    const path = m.slice(2, m.indexOf('#'));
    const dict = pageAnchors.get(path.replace(/\/$/, ''));
    const cn = dict?.get(slug(en));
    if (cn) { rewrote++; changed = true; return '](' + path + '#' + cn + ')'; }
    unresolved++;
    if (samples.length < 15) samples.push(rel + ' -> ' + path + '#' + en);
    return m;
  });

  // 同页：](#en)
  src = src.replace(/\]\(#([^)\s]+)\)/g, (m, en) => {
    const cn = own?.get(slug(en));
    if (cn) { rewrote++; changed = true; return '](#' + cn + ')'; }
    unresolved++;
    if (samples.length < 15) samples.push(rel + ' -> #' + en + ' (same page)');
    return m;
  });

  if (changed) { writeFileSync(file, src); filesChanged++; }
}

log('rewrote ' + rewrote + ' links in ' + filesChanged + ' files');
log('unresolved (kept as-is): ' + unresolved);
for (const s of samples) log('  ' + s);
