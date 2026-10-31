#!/usr/bin/env node
// apply.mjs — 把译文回填进镜像 HTML（文本/属性/meta/flight 四层），并做 URL 前缀、支付外指、镜像脚本注入
// 用法：node pipeline/apply.mjs
// 输入：site/（英文底稿，就地改写；基线自动存 data/site-en-baseline/，重跑自动还原）
//       data/translations/_chrome.json（全站 UI 通用译文）+ data/translations/<page>.json（各页译文）
// 产物：site/mirror.js、site/sitemap.xml、data/apply-report.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const DATA = path.join(ROOT, 'data');
const BASELINE = path.join(DATA, 'site-en-baseline');
const P = '/docs-cn/aihero';
const SITE_URL = 'https://lif3ng-vibe.github.io';
const MIRROR_BASE = `${SITE_URL}${P}`;
const UPSTREAM = 'https://www.aihero.dev';

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}
// 基线管理：首次运行时存底稿；之后每次运行先还原（apply 可安全重跑）
if (!fs.existsSync(BASELINE)) {
  console.log('creating english baseline copy …');
  copyRecursive(SITE, BASELINE);
} else {
  console.log('restoring english baseline …');
  fs.rmSync(SITE, { recursive: true, force: true });
  copyRecursive(BASELINE, SITE);
}

// ---------- 译文装载 ----------
const trDir = path.join(DATA, 'translations');
const chromeTable = new Map();       // _chrome.json：全站通用 UI
const pageTables = new Map();        // <page>（含子路径）→ Map
const conflicts = [];
(function loadTables(dir, relPrefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
    if (e.isDirectory()) { loadTables(full, rel); continue; }
    if (!e.name.endsWith('.json')) continue;
    const table = JSON.parse(fs.readFileSync(full, 'utf8'));
    const target = rel === '_chrome.json' ? chromeTable
      : pageTables.set(rel.replace(/\.json$/, ''), new Map()).get(rel.replace(/\.json$/, ''));
    for (const [en, zh] of Object.entries(table)) {
      if (typeof zh !== 'string' || !zh.trim()) continue;
      if (target.has(en) && target.get(en) !== zh) conflicts.push({ en, file: rel });
      else target.set(en, zh);
    }
  }
})(trDir);
console.log(`translations: chrome=${chromeTable.size}, pages=${pageTables.size}, conflicts=${conflicts.length}`);

// bundle 渲染白名单：不在任何页 flight 中出现的 chrome 串（客户端组件硬编码渲染），
// HTML 直译零 hydration 风险（flight 无此文本，无从 mismatch）。由上次 apply 报告生成。
const UNPRUNE_FILE = path.join(DATA, 'unprune-allowlist.json');
let unpruneAllow = new Set();
if (fs.existsSync(UNPRUNE_FILE)) unpruneAllow = new Set(JSON.parse(fs.readFileSync(UNPRUNE_FILE, 'utf8')));

// ---------- 正则工具 ----------
function escapeRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// 空白容忍 + 实体容忍的匹配正则
function tolerantRx(en, flags = 'g') {
  const words = en.split(/\s+/).map(w =>
    escapeRx(w)
      .replace(/&/g, '(?:&amp;|&)')
      .replace(/</g, '(?:&lt;|<)')
      .replace(/>/g, '(?:&gt;|>)')
      .replace(/"/g, '(?:&quot;|")')
      .replace(/'/g, "(?:&#x27;|&#39;|&apos;|')")
  );
  return new RegExp(words.join('\\s+'), flags);
}
function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
}
function encodeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// ---------- HTML 分段 ----------
const BLOCK_TAGS = new Set(['script', 'style', 'code', 'pre', 'textarea', 'svg', 'template']);
function segmentHtml(html) {
  const segs = [];
  let i = 0; const n = html.length;
  while (i < n) {
    let lt = html.indexOf('<', i);
    if (lt < 0) { segs.push({ text: html.slice(i), prot: false }); break; }
    if (lt > i) segs.push({ text: html.slice(i, lt), prot: false });
    i = lt;
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      const e = end < 0 ? n : end + 3;
      segs.push({ text: html.slice(i, e), prot: true }); i = e; continue;
    }
    const m = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(i, i + 60));
    const tagName = m ? m[1].toLowerCase() : '';
    if (tagName && BLOCK_TAGS.has(tagName) && !html.startsWith('</', i)) {
      let depth = 1, j = i + 1, guard = 0;
      const openRe = new RegExp(`<${tagName}(\\s|>|/)`, 'gi');
      const closeRe = new RegExp(`</${tagName}>`, 'gi');
      openRe.lastIndex = j; closeRe.lastIndex = j;
      let o = openRe.exec(html), c = closeRe.exec(html);
      while (depth > 0 && guard++ < 50000) {
        if (!c) { j = n; break; }
        if (o && o.index < c.index) { depth++; closeRe.lastIndex = o.index; o = openRe.exec(html); }
        else { depth--; j = c.index + c[0].length; c = closeRe.exec(html); }
      }
      segs.push({ text: html.slice(i, j), prot: true }); i = j; continue;
    }
    let gt = i, q = null;
    while (gt < n) {
      const ch = html[gt];
      if (q) { if (ch === q) q = null; }
      else if (ch === '"' || ch === "'") q = ch;
      else if (ch === '>') break;
      gt++;
    }
    const end = gt < n ? gt + 1 : n;
    segs.push({ text: html.slice(i, end), prot: true }); i = end;
  }
  return segs;
}

// ---------- flight ----------
const FLIGHT_RX = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;

// ---------- URL ----------
const PAYWALL_PATHS = /^\/(login|cohorts\/|products\/|confirm|check-your-email|thanks|welcome|team\/|progress|subscribe)/;
// 运行时端点：镜像无法提供 → 指回原站
const RUNTIME_PATHS = /^\/(api\/|mcp|oauth|rss\.xml|[^\/]+\/rss\.xml|sitemap\.md|llms\.txt|skills\.md|sitemap\.xml|s\/)/;

function decodeNextImageUrl(val) {
  try {
    const q = new URLSearchParams(val.split('?')[1]);
    const u = q.get('url');
    if (u && u.startsWith('/')) return u;
  } catch { /* ignore */ }
  return null;
}

function prefixAttrValue(val) {
  if (!val || !val.trim()) return val;
  let v = val.trim();
  if (/^(mailto:|tel:|data:|#|\/\/)/.test(v)) return val;
  // 折叠绝对 URL 为路径统一处理
  let wasAbsolute = false;
  if (v.startsWith(UPSTREAM + '/')) { v = v.slice(UPSTREAM.length); wasAbsolute = true; }
  else if (v.startsWith('http')) return val; // 其他外部站不动
  if (v.includes('_next/image?')) {
    const orig = decodeNextImageUrl(v);
    if (orig) return wasAbsolute ? MIRROR_BASE + orig : orig;
    return val;
  }
  if (!v.startsWith('/')) return val;
  if (v === P || v.startsWith(P + '/')) return val;
  if (PAYWALL_PATHS.test(v) || RUNTIME_PATHS.test(v)) return UPSTREAM + v; // 报名/支付/登录/运行时端点 → 指回原站
  return wasAbsolute ? MIRROR_BASE + v : P + v;
}

// ---------- 页面清单 ----------
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === 'index.html') {
      const rel = path.relative(SITE, full).replace(/\\/g, '/');
      pages.push(rel === 'index.html' ? '' : rel.replace(/\/index\.html$/, ''));
    }
  }
})(SITE);
console.log(`pages: ${pages.length}`);

// ---------- 主流程 ----------
const stringsDir = path.join(DATA, 'strings');
const report = {};
let totalApplied = 0, totalPruned = 0;

for (const page of pages) {
  const rel = page === '' ? 'index.html' : `${page}/index.html`;
  const f = path.join(SITE, rel);
  const html = fs.readFileSync(f, 'utf8');
  const key = page === '' ? '_home' : page;

  // 本页候选译文 = chrome + 本页表
  const active = new Map(chromeTable);
  const pt = pageTables.get(key);
  if (pt) for (const [en, zh] of pt) active.set(en, zh);
  // 页面级表覆盖 chrome 后，删掉两表都不含的本页 strings（统计用）
  const pageStrings = fs.existsSync(path.join(stringsDir, `${key}.json`))
    ? JSON.parse(fs.readFileSync(path.join(stringsDir, `${key}.json`), 'utf8'))
    : { texts: [], attrs: [], meta: [] };

  // --- 1. flight 预检：flight 中找不到的 EN 不能回填（hydration 一致性） ---
  const flightSegs = [];
  for (const m of html.matchAll(FLIGHT_RX)) {
    try { flightSegs.push(JSON.parse('"' + m[1] + '"')); } catch { /* skip */ }
  }
  const flightJoined = flightSegs.join('\n\u0000\n');
  const pruned = new Set();
  for (const [en] of active) {
    if (unpruneAllow.has(en)) continue; // bundle 渲染串：flight 无此文本，直译安全
    const onPage = pageStrings.texts.includes(en) || pageStrings.attrs.includes(en) || pageStrings.meta.includes(en);
    if (onPage && !tolerantRx(en, '').test(flightJoined)) pruned.add(en);
  }
  for (const en of pruned) active.delete(en);
  // 长串优先：防止 chrome 短词先命中把长句打成混合态
  const ordered = [...active].sort((a, b) => b[0].length - a[0].length);

  // --- 2. 正文文本替换（分段保护） ---
  let htmlHits = 0;
  const rebuilt = segmentHtml(html).map(s => {
    if (s.prot) return s.text;
    let t = s.text;
    for (const [en, zh] of ordered) {
      const rx = tolerantRx(en, 'g');
      if (rx.test(t)) { rx.lastIndex = 0; t = t.replace(rx, () => zh); htmlHits++; }
    }
    return t;
  }).join('');

  // --- 3. 属性替换 ---
  let attrHits = 0;
  let out = rebuilt.replace(/\s(title|aria-label|alt|placeholder)="([^"]*)"/g, (whole, attr, val) => {
    if (!/[a-zA-Z]/.test(val)) return whole;
    const dec = decodeEntities(val).replace(/\s+/g, ' ').trim();
    const zh = active.get(dec);
    if (!zh) return whole;
    attrHits++;
    return ` ${attr}="${encodeAttr(zh)}"`;
  });

  // --- 4. title 与 meta ---
  out = out.replace(/<title>([^<]*)<\/title>/, (whole, t) => {
    const zh = active.get(decodeEntities(t).replace(/\s+/g, ' ').trim());
    return zh ? `<title>${zh}</title>` : whole;
  });
  out = out.replace(/(<meta\s[^<>]*?content=")([^"]*)(")/g, (whole, a, val, c) => {
    if (!/[a-zA-Z]/.test(val)) return whole;
    const dec = decodeEntities(val).replace(/\s+/g, ' ').trim();
    const zh = active.get(dec);
    return zh ? `${a}${encodeAttr(zh)}${c}` : whole;
  });

  // --- 5. flight 替换 ---
  let flightHits = 0;
  out = out.replace(FLIGHT_RX, (whole, esc) => {
    let seg;
    try { seg = JSON.parse('"' + esc + '"'); } catch { return whole; }
    let t = seg, hit = 0;
    for (const [en, zh] of ordered) {
      const rx = tolerantRx(en, 'g');
      if (rx.test(t)) { rx.lastIndex = 0; t = t.replace(rx, () => zh); hit++; }
    }
    if (hit) flightHits += hit;
    return `self.__next_f.push([1,${JSON.stringify(t)}])`;
  });

  // --- 6. HTML 属性 URL 前缀 ---
  out = out.replace(/\s(href|src|poster)="([^"]*)"/g, (w, a, v) => {
    const nv = prefixAttrValue(v);
    return nv === v ? w : ` ${a}="${nv}"`;
  });
  out = out.replace(/\s(srcset|imagesrcset)="([^"]*)"/g, (w, a, v) => {
    if (!v.includes('_next/image?') && !v.startsWith('/')) return w;
    const orig = decodeNextImageUrl(v.split(',')[0].trim());
    return orig ? ` ${a}="${orig}"` : w;
  });
  out = out.replace(/\scontent="(\/[^"]*|https:\/\/www\.aihero\.dev\/[^"]*)"/g, (w, v) => {
    if (v.includes('_next/image?')) {
      const orig = decodeNextImageUrl(v);
      if (orig) return ` content="${MIRROR_BASE}${orig}"`;
    }
    const nv = prefixAttrValue(v);
    return nv === v ? w : ` content="${nv}"`;
  });
  out = out.replace(/\simagesizes="[^"]*"/g, '');
  // 目录部署带尾斜杠会改变相对链接解析层级（原站无尾斜杠）：
  // 课时页侧栏的相对解法链接改写为镜像根绝对路径（Mintlify 镜像坑 #14 同款）
  out = out.replace(/href="generating-objects-via-output~dkm2k\/solution"/g,
    `href="${P}/workshops/ai-sdk-v6-crash-course/generating-objects-via-output~dkm2k/solution"`);

  // --- 7. flight URL 前缀（含转义/未转义两种形态；带防双前缀守卫） ---
  out = out.replace(/(?<!\/docs-cn\/aihero)\/_next\//g, `${P}/_next/`);
  out = out.replace(/(\\?")(href|src|image|poster)(\\?":\\?")(\/(?!\/)(?!docs-cn))/g,
    (w, q1, k, q2) => `${q1}${k}${q2}${P}`);
  out = out.replace(/\\?"p\\?":\\?"(?!\/|d)/g, () => `\\"p\\":\\"${P}`);

  // --- 8. 语言与注入 ---
  out = out.replace(/<html lang="en"/, '<html lang="zh-CN"');
  const inject = `<script>window.__MIRROR_BASE__="${P}";</script><script src="${P}/mirror.js" defer></script></body>`;
  out = out.replace(/<\/body>/, inject);

  fs.writeFileSync(f, out);
  const untranslated = pageStrings.texts.filter(en => !chromeTable.has(en) && !(pt && pt.has(en)));
  report[page || '(home)'] = {
    htmlHits, attrHits, flightHits, pruned: [...pruned],
    untranslated: untranslated.slice(0, 400), untranslatedCount: untranslated.length,
  };
  totalApplied += htmlHits + attrHits + flightHits;
  totalPruned += pruned.size;
  console.log(`  ${page || '(home)'}: html=${htmlHits} attr=${attrHits} flight=${flightHits} pruned=${pruned.size} untrans=${untranslated.length}`);
}

// --- 9. mirror.js、manifest 与 sitemap ---
fs.copyFileSync(path.join(ROOT, 'pipeline', 'mirror.js'), path.join(SITE, 'mirror.js'));
const manifestPath = path.join(SITE, 'manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  const mf = fs.readFileSync(manifestPath, 'utf8')
    .replace(/"(src|start_url)":\s*"\/([^"]*)"/g, (w, k, p) => `"${k}": "${P}/${p}"`);
  fs.writeFileSync(manifestPath, mf);
}
const sm = ['<?xml version="1.0" encoding="UTF-8">', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const page of pages) sm.push(`  <url><loc>${MIRROR_BASE}/${page}</loc></url>`);
sm.push('</urlset>');
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sm.join('\n') + '\n');

fs.writeFileSync(path.join(DATA, 'apply-report.json'), JSON.stringify(report, null, 1));
console.log(`apply done: applied=${totalApplied} pruned=${totalPruned}`);
