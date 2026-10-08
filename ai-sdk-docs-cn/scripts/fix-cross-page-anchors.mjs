#!/usr/bin/env node
/**
 * 跨页锚点回修：内容页里的 `](/docs/xxx#english-anchor)` 指向旧英文锚点，
 * 而目标页的标题已译成中文（锚点随之改变）。本脚本用 .anchor-maps/
 * 的逐文件映射（原英文标题 | 中文标题 | 新锚点）重算这些链接。
 *
 * 映射行格式：`原英文标题 | 中文标题 | 新锚点`
 * 页面路径归一：源码路径带 NN- 前缀（02-foundations/02-prompts.mdx），
 * 链接用 clean 路径（/docs/foundations/prompts），按 sync-content 同规则归一。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
// 优先全量自动映射（git 快照配对），无则回退手工映射目录
const mapsDir = existsSync(join(root, '.anchor-maps-auto'))
  ? join(root, '.anchor-maps-auto')
  : join(root, '.anchor-maps');

const log = (m) => console.log(`[fix-anchors] ${m}`);

/** github-slugger 规则（足够近似的实现）：小写、去标点、空格转连字符、保留 CJK。 */
const slug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');

/** 源码相对路径 -> clean URL 路径（去 NN- 前缀、去 .mdx、index 归目录根）。 */
const cleanOf = (rel) => {
  let parts = rel.replace(/\.mdx$/, '').split('/');
  parts = parts.map((p) => p.replace(/^\d{2,3}-/, ''));
  if (parts[parts.length - 1] === 'index') parts = parts.slice(0, -1);
  return parts.join('/');
};

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.map.md')) out.push(p);
  }
  return out;
};

// pageCleanUrl -> Map(enSlug -> cnAnchor)
const pageAnchors = new Map();
for (const mapFile of walk(mapsDir)) {
  const relMap = relative(mapsDir, mapFile).replace(/\.map\.md$/, '');
  // .anchor-maps/docs/02-foundations/02-prompts.mdx -> docs/02-foundations/02-prompts.mdx
  const rel = relMap.replace(/^content[\\/]/, '').split('\\').join('/');
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

const walkMdx = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkMdx(p, out);
    else if (e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
};

// 跨页锚点链接：](/docs/xxx#anchor) 、](/providers/xxx#anchor)、](/cookbook/xxx#anchor)
const linkRe =
  /\]\((\/(?:docs|providers|cookbook|resources\/recipes)\/[^)#\s]+)#([^)\s]+)\)/g;

let filesChanged = 0;
let linksRewritten = 0;
let linksUnresolved = 0;
const unresolvedSamples = [];

for (const file of walkMdx(contentDir)) {
  const rel = relative(contentDir, file).split('\\').join('/');
  let src = readFileSync(file, 'utf8');
  let changed = false;

  src = src.replace(linkRe, (match, path, anchor) => {
    const targetUrl = path.replace(/^\//, '').replace(/\/$/, '');
    const dict = pageAnchors.get(targetUrl);
    const cn = dict?.get(anchor);
    if (cn) {
      linksRewritten++;
      changed = true;
      return `](${path}#${cn})`;
    }
    linksUnresolved++;
    if (unresolvedSamples.length < 15)
      unresolvedSamples.push(`${rel} -> ${path}#${anchor}`);
    return match;
  });

  if (changed) {
    writeFileSync(file, src);
    filesChanged++;
  }
}

log(`rewrote ${linksRewritten} links in ${filesChanged} files`);
log(`unresolved (kept as-is): ${linksUnresolved}`);
if (unresolvedSamples.length) {
  log('samples:');
  for (const s of unresolvedSamples) log('  ' + s);
}
