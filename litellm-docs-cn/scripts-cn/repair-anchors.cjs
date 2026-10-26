// 锚点回修：把源文件中仍指向旧英文锚点的链接改写为新中文锚点。
//
// 数据来源三方核对（publishing-docs-cn 阶段 A.3）：
//   anchors-en.json  EN 基线构建提取的旧 id（权威旧锚点）
//   anchors-cn.json  中文构建提取的新 id（权威新锚点）
//   .anchor-maps/*.map.md  每页「原英文标题 | 中文标题 | 新锚点」
//
// 用法：node scripts-cn/repair-anchors.cjs [--dry]
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const anchorsEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-en.json'), 'utf8'));
const anchorsCn = fs.existsSync(path.join(ROOT, 'anchors-cn.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-cn.json'), 'utf8'))
  : {};

// ---------- 收集锚点映射 ----------
// 页键与构建 HTML 相对路径一致：docs/proxy/index.md → docs/proxy/index
const norm = (p) => p.replace(/\\/g, '/').replace(/\.mdx?$/, '');

// 标题文本归一化（比对 EN/CN 构建产物里的标题文本用）
const stripTags = (s) => s
  .replace(/[​‌‍﻿]/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// map 文件里旧标题 → 新锚点（预测值）
const maps = {}; // pageKey -> {byTitleEn: Map<title, newAnchor>, list: [{en, cn, anchor}]}
const mapDir = path.join(ROOT, '.anchor-maps');
function walkMaps(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMaps(full);
    else if (entry.name.endsWith('.map.md')) {
      const rel = norm(path.relative(mapDir, full).replace(/\.map\.md$/, ''));
      const text = fs.readFileSync(full, 'utf8');
      const byTitleEn = new Map();
      const list = [];
      for (const line of text.split('\n')) {
        const parts = line.split('|').map((s) => s.trim());
        if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
          byTitleEn.set(parts[0], parts[2]);
          list.push({en: parts[0], cn: parts[1], anchor: parts[2]});
        }
      }
      if (list.length) maps[rel] = {byTitleEn, list};
    }
  }
}
if (fs.existsSync(mapDir)) walkMaps(mapDir);

// 构建产物标题文本 → 实际 id
const cnByText = {}; // pageKey -> Map<titleText, id>
for (const [key, page] of Object.entries(anchorsCn)) {
  const m = new Map();
  for (const [id, tagged] of Object.entries(page.anchors || {})) {
    const text = stripTags(tagged.replace(/^h\d /, ''));
    if (!m.has(text)) m.set(text, id);
  }
  cnByText[key] = m;
}
const enByText = {}; // pageKey -> Map<titleText, oldId>
for (const [key, page] of Object.entries(anchorsEn)) {
  const m = new Map();
  for (const [id, tagged] of Object.entries(page.anchors || {})) {
    const text = stripTags(tagged.replace(/^h\d /, ''));
    if (!m.has(text)) m.set(text, id);
  }
  enByText[key] = m;
}

// 每页：旧锚点 → 新锚点
// 旧锚点定位：优先用 map 的英文标题在 enByText 里查旧 id（以构建产物为准，兼容 slugger 差异）；
// 新锚点校验：预测值必须在 cnByText 的 id 集合或标题映射里，否则用标题文本回查，再不行保留预测值。
// 构建键 → maps 源键 别名表（maps 以源文件相对路径为键）
const buildToSource = {};
for (const k of Object.keys(maps)) {
  const bk = resolveBuildKey(k);
  if (bk && !buildToSource[bk]) buildToSource[bk] = k;
}

function pageMap(key) {
  const srcKey = buildToSource[key] || key;
  const m = maps[srcKey];
  if (!m) return null;
  const buildKey = resolveBuildKey(key);
  if (!buildKey) return null;
  const old2new = new Map();
  const cnIds = new Set(Object.keys((anchorsCn[buildKey] || {}).anchors || {}));
  const cnByTextPage = cnByText[buildKey] || new Map();
  let validated = 0, fuzzy = 0, unverified = 0;
  for (const {en, cn, anchor} of m.list) {
    const oldId = enByText[buildKey]?.get(en) || null;
    let newId = cnIds.has(anchor) ? (validated++, anchor) : null;
    if (!newId && cnByTextPage.has(cn)) { newId = cnByTextPage.get(cn); fuzzy++; }
    if (!newId) { unverified++; newId = anchor; }
    if (oldId && oldId !== newId) old2new.set(oldId, newId);
  }
  return {old2new, stats: {total: m.list.length, validated, fuzzy, unverified}};
}

// ---------- 链接解析 ----------
// 构建键解析：maps 键（源文件相对路径去扩展名）与构建产物键（URL 路径，目录页带 /index）存在多种对应。
// 返回该源键在 anchors-en/anchors-cn 中实际存在的键。
function buildKeyCandidates(key) {
  const cands = [key, key + '/index'];
  const noPages = key.replace(/^src\/pages\//, '');
  cands.push(noPages, noPages + '/index');
  return cands;
}
function resolveBuildKey(key) {
  for (const c of buildKeyCandidates(key)) {
    if (enByText[c] || cnByText[c]) return c;
  }
  return null;
}

const mdFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) mdFiles.push(full);
  }
})(path.join(ROOT, 'docs'));
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) mdFiles.push(full);
  }
})(path.join(ROOT, 'src', 'pages'));

// 相对/绝对路径 → 页键（尝试多种构建键形态）
function resolveKey(fromFile, href) {
  let p = href;
  if (p.startsWith('/docs/')) p = p.slice('/docs/'.length);
  else if (p.startsWith('/')) {
    const abs = norm(p.slice(1));
    for (const c of buildKeyCandidates(abs)) if (anchorsEn[c]) return c;
    return null;
  } else {
    p = path.relative(path.join(ROOT, 'docs'), path.resolve(path.dirname(fromFile), p));
  }
  p = norm(p).replace(/\\/g, '/');
  for (const base of [p, 'docs/' + p.replace(/^docs\//, '')]) {
    for (const c of buildKeyCandidates(base)) if (anchorsEn[c]) return c;
  }
  return null;
}

let filesChanged = 0, linksChanged = 0;
const unmatched = [];
for (const file of mdFiles) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src.replace(/\]\(([^)#\s]*)?(#[^)\s]+)?\)/g, (whole, href = '', anchor = '') => {
    if (!anchor) return whole;
    const oldAnchor = anchor.slice(1);
    let key;
    if (!href) {
      key = resolveBuildKey(norm(path.relative(ROOT, file))) || norm(path.relative(ROOT, file));
    } else if (/^https?:\/\//.test(href)) {
      return whole;
    } else {
      key = resolveKey(file, href);
      if (!key) return whole;
    }
    const pm = pageMap(key);
    if (!pm || !pm.old2new.has(oldAnchor)) return whole;
    const newId = pm.old2new.get(oldAnchor);
    linksChanged++;
    return `](${href}#${newId})`;
  });
  // 无 href 的纯锚点（同页）
  if (out !== src) {
    filesChanged++;
    if (!DRY) fs.writeFileSync(file, out);
  }
}

console.log(DRY ? '[dry] ' : '');
console.log('files changed:', filesChanged, '| links rewritten:', linksChanged);
const statRows = Object.entries(maps).map(([key]) => ({key, s: pageMap(key)?.stats}));
const bad = statRows.filter((r) => r.s && (r.s.validated + r.s.fuzzy) < r.s.total);
console.log('pages with unverified predicted anchors:', bad.length, '/', statRows.length);
for (const r of bad.slice(0, 10)) console.log('  ', r.key, JSON.stringify(r.s));
