#!/usr/bin/env node
/**
 * repair-anchors-cn.mjs —— 全站跨页锚点回修（B6 用）
 *
 * 数据来源（不猜 slug，全部实测）：
 *   1. dist-en（翻译前英文基线导出，/tmp/dist-en）→ 每页 heading (text,id) = 旧锚点权威
 *   2. dist-cn（翻译后导出）→ 每页 heading (text,id) = 新锚点权威
 *   3. .anchor-maps/<批>/<页>.map.md（`原英文标题 | 中文标题 | 估算新锚点`）→ 旧标题↔新标题桥
 *
 * 逻辑：扫源码 .mdx 的 #锚点 链接（跳过代码围栏/行内代码/frontmatter），
 *   若 (目标页, 锚点) 命中 dist-en 该页真实 id（= 英文旧锚点）且映射能桥到新 dist 真实 id → 改写；
 *   锚点不在 dist-en id 集（已是中文/本来就是新锚点/纯外站）→ 不动。
 *
 * 用法：node scripts/repair-anchors-cn.mjs <dist-en> <dist-cn> [--apply]
 *   缺 dist-cn 时为半扫描：只列出将回修的存量英文锚点（不写文件）。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url))); // ag-ui-docs-cn/
const MAPS = join(ROOT, '..', '.anchor-maps-ag-ui'); // 映射在 Mintlify 内容根之外（防 validate/export 误扫）
const DIST_EN = process.argv[2] || '/tmp/dist-en';
const DIST_CN = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
const APPLY = process.argv.includes('--apply');

// ---------- 小工具 ----------
const norm = (s) =>
  s
    .replace(/<[^>]+>/g, '') // strip inner tags (anchor <a> wrappers)
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ ​]/g, ' ')
    .replace(/[`*]/g, '')
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

// dist 页: { 'spec/1.0/events/lifecycle': { byId: Map<id,text>, byText: Map<text,id[]>, order: [...] } }
function loadDistHeadings(dist) {
  const pages = {};
  for (const html of walk(dist, '.html')) {
    if (!html.endsWith('index.html')) continue;
    const rel = html.slice(dist.length, -'/index.html'.length).replace(/^\//, '');
    const raw = readFileSync(html, 'utf8');
    const byId = new Map();
    const byText = new Map();
    for (const m of raw.matchAll(/<h([1-6])\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
      const id = m[2].replace(/^_R_/, '');
      if (/^_R_/.test(m[2])) continue; // 框架哈希 id
      const text = norm(m[3]);
      byId.set(id, text);
      if (!byText.has(text)) byText.set(text, []);
      byText.get(text).push(id);
    }
    if (byId.size) pages[rel] = { byId, byText };
  }
  return pages;
}

// ---------- 锚点映射加载 ----------
// 页路径（如 spec/1.0/events/lifecycle）→ 映射条目 [{old,new}]
const maps = new Map();
for (const dirBase of walk(MAPS, '.map.md')) {
  const base = dirBase.split('/').pop().replace(/\.map\.md$/, '');
  const pagePath = base.replace(/-/g, '/'); // 与子代理约定：页路径 / → -
  const entries = [];
  for (const line of readFileSync(dirBase, 'utf8').split('\n')) {
    const m = line.match(/^([^|\n]+)\|([^|\n]+)\|([^|\n]+)$/);
    if (!m) continue;
    const old = norm(m[1]);
    const nw = norm(m[2]);
    if (!old || !nw || /^[-: ]+$/.test(old)) continue;
    entries.push({ old, nw });
  }
  if (entries.length) maps.set(pagePath, entries);
}

// ---------- 旧标题/新标题 → 实测 id ----------
// pagePath → { oldIdToEntry: Map<oldId,entry>, newIdFor: Map<entry,newId> }
function resolveBridge(enPages, cnPages) {
  const bridge = new Map();
  for (const [page, entries] of maps) {
    const en = enPages[page];
    const cn = cnPages ? cnPages[page] : null;
    if (!en) continue;
    const oldIdToEntry = new Map();
    const newIdFor = new Map();
    for (const e of entries) {
      const enIds = en.byText.get(e.old) || [];
      const enId = enIds[0] || null;
      if (enId) oldIdToEntry.set(enId, e);
      if (cn) {
        const cnIds = cn.byText.get(e.nw) || [];
        if (cnIds.length) newIdFor.set(e, cnIds[0]);
      }
    }
    bridge.set(page, { oldIdToEntry, newIdFor });
  }
  return bridge;
}

// ---------- 源码扫描 ----------
// 跳过 frontmatter、代码围栏、行内代码；抓 markdown 链接与 href 属性里的 path#anchor
function scanLinks(file) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const hits = [];
  let fence = false;
  let inFront = file.endsWith('.mdx') && lines[0]?.trim() === '---';
  lines.forEach((line, idx) => {
    if (inFront) {
      if (idx > 0 && line.trim() === '---') inFront = false;
      return;
    }
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      return;
    }
    if (fence) return;
    const noInline = line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
    // markdown 链接与 JSX href/…="#…" 里的 path#anchor
    const re = /\(([^()\s]+)#([^)\s]+)\)|\b(?:href|src)="([^"#\s]+)#([^"\s]+)"/g;
    let m;
    while ((m = re.exec(noInline))) {
      const target = m[1] ?? m[3];
      const anchor = m[2] ?? m[4];
      hits.push({ line: idx + 1, col: m.index, matchLen: m[0].length, target, anchor, raw: m[0] });
    }
  });
  return { hits, lines };
}

// 链接 target → 站内页路径；返回 null=外站/无关
function targetPage(file, target) {
  if (/^(https?:|mailto:|data:)/.test(target)) return null;
  if (target.startsWith('//')) return null;
  const dir = dirname(file);
  let p;
  if (target.startsWith('/')) p = target.slice(1);
  else p = join(dir, target).replace(/\\/g, '/').replace(/\.mdx?$/, '');
  p = p.replace(/\.mdx?$/, '');
  if (p === 'index' || p === '') p = 'introduction'; // 根落地页
  return p;
}

// ---------- 主流程 ----------
const enPages = loadDistHeadings(join(DIST_EN, '') );
const cnPages = DIST_CN ? loadDistHeadings(DIST_CN) : null;
const bridge = resolveBridge(enPages, cnPages);

const sources = walk(ROOT, '.mdx').filter((f) => !f.includes('node_modules') && !f.includes('/snippets/') || f.includes('/snippets/'));
const plan = [];
for (const file of sources) {
  const rel = file.slice(ROOT.length + 1);
  const { hits, lines } = scanLinks(file);
  for (const h of hits) {
    const page = targetPage(file, h.target);
    if (!page) continue;
    const b = bridge.get(page);
    if (!b || !b.oldIdToEntry.has(h.anchor)) continue;
    const entry = b.oldIdToEntry.get(h.anchor);
    const newId = cnPages ? b.newIdFor.get(entry) : null;
    if (cnPages && !newId) continue; // 桥不到新 id（映射缺或标题不符）→ 留给 verify 报告
    plan.push({ file: rel, line: h.line, col: h.col, matchLen: h.matchLen, raw: h.raw, page, anchor: h.anchor, newId, text: lines[h.line - 1].trim().slice(0, 120) });
  }
}

if (!cnPages) {
  console.log(`[dry-scan] 发现存量英文锚点（待回修） ${plan.length} 处：`);
  for (const p of plan) console.log(`  ${p.file}:${p.line}  #${p.anchor}  (目标 /${p.page})`);
  process.exit(0);
}

console.log(`[repair] 计划改写 ${plan.length} 处`);
if (!APPLY) {
  for (const p of plan) console.log(`  ${p.file}:${p.line}  #${p.anchor} → #${p.newId}`);
  console.log('[repair] dry-run，加 --apply 生效');
  process.exit(0);
}
// 按 file 分组，行内按列区间右→左替换（同一行多链、同锚点不同目标页均安全）
const byFile = new Map();
for (const p of plan) {
  if (!byFile.has(p.file)) byFile.set(p.file, []);
  byFile.get(p.file).push(p);
}
let done = 0;
for (const [rel, ps] of byFile) {
  const abs = join(ROOT, rel);
  const lines = readFileSync(abs, 'utf8').split('\n');
  for (const p of ps) {
    const li = p.line - 1;
    const line = lines[li];
    const segStart = line.indexOf(p.raw, Math.max(0, p.col - 8));
    if (segStart < 0) {
      console.warn(`[repair] 未命中原文，跳过 ${rel}:${p.line} ${p.raw}`);
      continue;
    }
    const seg = line.slice(segStart, segStart + p.matchLen);
    const rep = seg.replace('#' + p.anchor, '#' + p.newId);
    lines[li] = line.slice(0, segStart) + rep + line.slice(segStart + p.matchLen);
    done++;
  }
  writeFileSync(abs, lines.join('\n'));
}
console.log(`[repair] 已改写 ${done} 处，请重新 export 后跑 verify-anchors-cn.mjs 复验`);
