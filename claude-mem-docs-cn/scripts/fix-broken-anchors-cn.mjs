#!/usr/bin/env node
/**
 * fix-broken-anchors-cn.mjs —— 依据 dist 实际 heading id 回修源 mdx 的锚点链接
 *
 * 原则：链接文字（译态）≈ 目标标题文字，用 Mintlify slug 规则（e2e-docs-cn 实测：
 * 标点转连字符型，非 github-slugger 删除型）重算 slug，并在目标页真实 id 集里
 * 校验/兜底（含子串模糊）；同时把上游遗留的 ../page.md 相对 .md 内链改写为站点
 * 绝对路由（浏览器不会自动替换 .md，原样保留必死链）。
 *
 * 用法：node scripts/fix-broken-anchors-cn.mjs（项目根运行）
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const BASE = '/'; // 源码形态：站点根路径（部署前缀由前缀脚本统一加）

// Mintlify 标题 slug 规则（标点转连字符型，非 github-slugger 删除型）
function mintlifySlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}’\-_]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

// ---------- 1. dist → 页面 id 集 ----------
const pageIds = new Map(); // rel dir ('' root) -> Set<id>
function walkDist(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkDist(p);
    else if (e.name === 'index.html') {
      const rel = relative(DIST, dir).replace(/\\/g, '/');
      const set = new Set();
      for (const m of readFileSync(p, 'utf8').matchAll(/id="([^"]+)"/g)) set.add(m[1]);
      pageIds.set(rel, set);
    }
  }
}
walkDist(DIST);

function resolvePage(pageRaw, pageRoute) {
  // 相对链接以「页面路由目录」为基准（URL 目录语义，页面即 index.html）
  let page = pageRaw;
  if (/^(https?:|mailto:)/.test(page)) return null;
  if (!page.startsWith('/')) {
    const base = pageRoute ? pageRoute.split('/') : [];
    for (const s of page.split('/').filter((x) => x && x !== '.')) {
      if (s === '..') base.pop();
      else base.push(s);
    }
    page = base.join('/');
  } else {
    page = page.replace(/^\//, '');
  }
  if (/\.(md|mdx)$/.test(page)) page = page.replace(/\.(md|mdx)$/, '');
  return page;
}

// ---------- 2. 链接定位与回修 ----------
function findCorrectAnchor(text, targetSet) {
  const slug = mintlifySlug(text);
  if (targetSet.has(slug)) return slug;
  const norm = (s) => s.replace(/[-_、，（）()\s]/g, '').toLowerCase();
  // 兜底 1：去连字符归一相等（github-slugger 译态 vs Mintlify 连字符态）
  for (const id of targetSet) {
    if (id.startsWith('_R_') || id === 'page-title') continue;
    if (norm(id) === norm(slug)) return id;
  }
  // 兜底 2：模糊包含；取最短命中（短者≈更准的标题级 id）
  if (slug.length > 3) {
    const cands = [...targetSet].filter(
      (id) => !id.startsWith('_R_') && id !== 'page-title' && (id.includes(slug) || slug.includes(id)),
    );
    if (cands.length === 1) return cands[0];
    if (cands.length > 1) return cands.sort((a, b) => a.length - b.length)[0];
  }
  return null;
}

let changed = 0;
const unfixable = [];

function fixLinksInFile(file, rel) {
  const src = readFileSync(file, 'utf8');
  const pageRoute = rel.replace(/\.mdx$|\.md$/, '');
  if (process.env.FIXDBG) console.log(`-- ${rel} (route=${pageRoute}) matches:`, (src.match(/(\]\(|<Card href="|href=")([^)\s"]*?)(#[^)\s"]+)(\))/g) || []).length);

  const edited = src.replace(/(\]\(|<Card href="|href=")([^)\s"]*?)(#[^)\s"]+)(\))/g, (full, head, dest, hash, tail) => {
    if (!hash || /^(https?:|mailto:)/.test(dest)) return full;
    const targetPage = resolvePage(dest, pageRoute);
    const targetSet = pageIds.get(targetPage);
    if (!targetSet) {
      unfixable.push(`${rel}: ${full.slice(0, 120)}（目标页无产物：${targetPage}）`);
      return full;
    }
    // 链接文字：找同位置的 [text]
    const idx = src.indexOf(full);
    const before = src.slice(Math.max(0, idx - 220), idx);
    const lm = before.match(/\[([^\]]*)$/); //匹配串首字符就是链接的 ]，前文以未闭合的 [text 结尾
    const text = lm ? lm[1] : null;
    const correct = text ? findCorrectAnchor(text, targetSet) : null;
    if (process.env.FIXDBG) console.log(`DBG ${rel} dest="${dest}" hash="${hash.slice(0, 30)}" text="${(text || '').slice(0, 30)}" correct="${(correct || '').slice(0, 30)}"`);
    if (!correct) {
      if (text) unfixable.push(`${rel}: 无法定位「${text}」的锚点（目标 ${targetPage}#${hash.slice(1).slice(0, 40)}…）`);
      return full;
    }
    if (correct === decode(hash.slice(1))) return full;
    changed++;
    // 相对 .md 形态改为站点绝对路由（浏览器不解析 .md 后缀；../ 相对目录也一并归一）
    const destOut = /\.(md|mdx)$/.test(dest) || /^(\.\.?\/)/.test(dest) ? `/${targetPage}` : dest;
    return `${head}${destOut}${hash.slice(0, 1)}${correct}${tail}`;
  });
  if (edited !== src) writeFileSync(file, edited);
}

function walkSrc(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.anchor-maps', 'scripts', 'examples', 'snippets'].includes(e.name)) continue;
      walkSrc(join(dir, e.name), r);
    } else if (/\.(md|mdx)$/.test(e.name)) {
      fixLinksInFile(join(dir, e.name), r);
    }
  }
}
walkSrc(ROOT);

console.log(`回修处数：${changed}`);
if (unfixable.length) console.log('未自动回修（需人工）：\n' + unfixable.join('\n'));
if (!changed && !unfixable.length) console.log('无需修改');