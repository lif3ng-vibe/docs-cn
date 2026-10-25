#!/usr/bin/env node
// 跨页锚点回修 v2：标题文本配对法。
// 旧锚点 = slug(映射表 EN 标题)；新 id = 该 ZH 标题在 dist 目标页里的真实标题 id。
// 映射表手算的 slug 不可靠（斜杠/括号口径偏差），因此一律以 dist 实际 id 为准。
// 用法：node scripts/pair-anchor-repair.mjs <check-anchors-output.txt>
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import GitHubSlugger from 'github-slugger';

const [, , reportPath] = process.argv;
const norm = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

// ---------- 解析失效清单 ----------
const pairs = [];
for (const line of readFileSync(reportPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*(\/docs\/\S+) -> #([\w-]+) \(target page (\/docs\/\S+) has no such id\)/);
  if (m) pairs.push({ src: m[1], old: m[2], dst: m[3] });
}
console.log(`broken cross-page anchors: ${pairs.length}`);

// ---------- 映射表：slug(EN) -> [ZH 标题] ----------
function walk(dir, ext, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, ext, out);
    else if (n.endsWith(ext)) out.push(p);
  }
  return out;
}
const slug2zh = new Map();
for (const f of walk('.anchor-maps', '.map.md')) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length !== 3 || !parts[0] || !parts[1]) continue;
    const slugger = new GitHubSlugger();
    const oldSlug = slugger.slug(parts[0].replace(/\\_/g, '_'));
    if (!slug2zh.has(oldSlug)) slug2zh.set(oldSlug, new Set());
    slug2zh.get(oldSlug).add(parts[1]);
  }
}
console.log(`map entries (unique old slugs): ${slug2zh.size}`);

// ---------- dist 目标页标题清单（惰性加载） ----------
const dstHeads = new Map(); // dstPage -> [{id, key}]
function headsOf(dstPage) {
  if (dstHeads.has(dstPage)) return dstHeads.get(dstPage);
  const f = join('dist', dstPage, 'index.html');
  let html;
  try {
    html = readFileSync(f, 'utf8');
  } catch {
    dstHeads.set(dstPage, null);
    return null;
  }
  const heads = [];
  for (const m of html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    const id = m[1];
    if (/^(starlight__|theme-)/.test(id)) continue;
    heads.push({ id, key: norm(m[2]) });
  }
  dstHeads.set(dstPage, heads);
  return heads;
}

// ---------- 逐条改写 ----------
const srcOf = (page) => join('src/content/docs/docs', page.replace(/^\/docs\/?/, '').replace(/\/+$/, '') + '.md');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let fixed = 0;
const unresolved = new Map(); // old -> Set(src)
const bySrc = new Map();
for (const p of pairs) {
  if (!bySrc.has(p.src)) bySrc.set(p.src, []);
  bySrc.get(p.src).push(p);
}
for (const [src, list] of bySrc) {
  const f = srcOf(src);
  let text;
  try {
    text = readFileSync(f, 'utf8');
  } catch {
    for (const p of list) {
      if (!unresolved.has(p.old)) unresolved.set(p.old, new Set());
      unresolved.get(p.old).add(src);
    }
    continue;
  }
  let changed = false;
  for (const p of list) {
    const zhs = slug2zh.get(p.old);
    if (!zhs) {
      if (!unresolved.has(p.old)) unresolved.set(p.old, new Set());
      unresolved.get(p.old).add(src + ' [无映射]');
      continue;
    }
    const heads = headsOf(p.dst);
    if (!heads) {
      if (!unresolved.has(p.old)) unresolved.set(p.old, new Set());
      unresolved.get(p.old).add(src + ' [dist 缺目标页]');
      continue;
    }
    let newId = null;
    for (const zh of zhs) {
      const key = norm(zh);
      const hit = heads.find((h) => h.key === key);
      if (hit) {
        newId = hit.id;
        break;
      }
    }
    if (!newId) {
      if (!unresolved.has(p.old)) unresolved.set(p.old, new Set());
      unresolved.get(p.old).add(src + ' [dist 无对应标题: ' + [...zhs].join('/') + ']');
      continue;
    }
    const re = new RegExp('#' + esc(p.old) + '(?![\\w-])', 'g');
    if (re.test(text)) {
      text = text.replace(re, '#' + newId);
      changed = true;
      fixed++;
    }
  }
  if (changed) writeFileSync(f, text);
}
console.log(`rewritten anchors: ${fixed}`);
console.log(`unresolved: ${unresolved.size}`);
for (const [k, v] of [...unresolved].slice(0, 80)) console.log('  UNRESOLVED #' + k + '  ← ' + [...v].join(', '));
