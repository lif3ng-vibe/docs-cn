#!/usr/bin/env node
// 锚点回修（数据驱动版）：
//   1. 解析 .anchor-maps 下所有 .map.md 的「英文标题 | 中文标题 | 新锚点」行
//   2. 用 git show <scaffold-sha>:<path> 取每篇 MDX 的英文基线标题，
//      按标题集合把映射文件匹配到文档文件（不依赖映射文件名）
//   3. 扫描正文链接 ](path#anchor)：anchor 命中目标文件基线英文标题 slug → 换成映射里的新锚点
//      已是新锚点/无匹配 → 原样保留并报告
// 用法：node scripts/repair-anchors.mjs [--apply]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "apps/web/content/docs");
const MAPS = path.join(ROOT, ".anchor-maps");
const BASE_SHA = "5c991de"; // 脚手架提交（英文基线）
const APPLY = process.argv.includes("--apply");

let Slugger;
{
  const p = path.join(ROOT, "node_modules/.pnpm");
  const dir = fs.readdirSync(p).find((d) => d.startsWith("github-slugger@"));
  const mod = await import(
    pathToFileURL(path.join(p, dir, "node_modules/github-slugger/index.js")).href
  );
  Slugger = mod.default;
}
const slug = (s) => new Slugger().slug(s.trim());

// ── 1. 读映射：EN 标题集 → {rows, cnRows} ──
const mapEntries = []; // {file, rows: Map<enHead,{cn,slug}>}
function walkMaps(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) walkMaps(p);
    else if (e.name.endsWith(".map.md")) {
      const rows = new Map();
      for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
        const m = line.match(/^([^|]+)\|([^|]+)\|(.+)$/);
        if (!m) continue;
        const en = m[1].trim(), cn = m[2].trim();
        let s = m[3].trim().replace(/^#/, "");
        // 映射里可能是完整 slug（github-slugger 形态）；保持原样
        if (en && cn && s) rows.set(en, { cn, slug: s });
      }
      if (rows.size) mapEntries.push({ file: p, rows });
    }
  }
}
if (fs.existsSync(MAPS)) walkMaps(MAPS);

// ── 2. 文档基线英文标题 ──
const docsFiles = [];
function walkDocs(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) walkDocs(p);
    else if (/\.mdx$/.test(e.name)) docsFiles.push(p);
  }
}
walkDocs(DOCS);

const relOf = (f) => path.relative(DOCS, f).replace(/\\/g, "/");
const baselineCache = new Map();
function baselineHeadings(rel) {
  if (baselineCache.has(rel)) return baselineCache.get(rel);
  const heads = baselineHeadingsUncached(rel);
  baselineCache.set(rel, heads);
  return heads;
}
function baselineHeadingsUncached(rel) {
  try {
    const text = execSync(`git show ${BASE_SHA}:apps/web/content/docs/${rel}`, {
      cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    });
    const heads = [];
    let fence = false;
    for (const line of text.split(/\r?\n/)) {
      if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
      if (fence) continue;
      const m = line.match(/^(#{2,4})\s+(.+?)\s*$/);
      if (m) heads.push(m[2].replace(/[#*`]/g, "").trim());
    }
    return heads;
  } catch {
    return null;
  }
}

// docsRel → rows（映射）
const docMaps = new Map();
let unmatchedMaps = 0;
for (const me of mapEntries) {
  const enSet = new Set([...me.rows.keys()].map((h) => h.toLowerCase()));
  let best = null, bestScore = 0;
  for (const f of docsFiles) {
    const rel = relOf(f);
    const base = baselineHeadings(rel);
    if (!base || !base.length) continue;
    let score = 0;
    for (const h of base) if (enSet.has(h.toLowerCase())) score++;
    if (score > bestScore) { bestScore = score; best = rel; }
  }
  if (best && bestScore >= Math.max(1, Math.floor(me.rows.size * 0.4))) {
    if (!docMaps.has(best)) docMaps.set(best, me.rows);
    else {
      // 已有映射：并集（多个批次各含部分标题时合并）
      const cur = docMaps.get(best);
      for (const [k, v] of me.rows) if (!cur.has(k)) cur.set(k, v);
    }
  } else unmatchedMaps++;
}

// ── 3. 改写链接 ──
let changed = 0;
const warns = [];
const slugByCn = new Map(); // rel → Map<cnSlugLower, cnSlug>
for (const [rel, rows] of docMaps) {
  const m = new Map();
  for (const { cn, slug: s } of rows.values()) m.set(s.toLowerCase(), s);
  slugByCn.set(rel, m);
}

for (const f of docsFiles) {
  const rel = relOf(f);
  let text = fs.readFileSync(f, "utf8");
  const orig = text;
  // markdown 链接 ](path#anchor)——path 可为空（页内）
  text = text.replace(/\]\(([^)\s]*)#([^)\s]+)\)/g, (full, p, anchor) => {
    let targetRel;
    if (!p) targetRel = rel;
    else if (p.startsWith("/docs/")) {
      let r = p.slice(6).replace(/\/$/, "");
      const cands = [r + ".mdx", r + "/index.mdx", r === "" ? "index.mdx" : null];
      targetRel = cands.find((c) => c && docMaps.has(c)) ||
        cands.find((c) => c && fs.existsSync(path.join(DOCS, c)));
    } else if (p.startsWith("http") || p.startsWith("/")) return full;
    else {
      const r = path.posix.normalize(path.posix.join(path.posix.dirname(rel), p)).replace(/\.mdx?$/, "").replace(/\/$/, "");
      const cands = [r + ".mdx", r + "/index.mdx"];
      targetRel = cands.find((c) => docMaps.has(c)) || cands.find((c) => fs.existsSync(path.join(DOCS, c)));
    }
    if (!targetRel || !docMaps.has(targetRel)) return full;
    const rows = docMaps.get(targetRel);
    // 已是新锚点？
    if (slugByCn.get(targetRel).has(anchor.toLowerCase())) return full;
    // 英文标题 slug → 新锚点
    for (const [en, { slug: s }] of rows) {
      if (slug(en) === anchor || en === anchor) {
        changed++;
        return `](${p}#${s})`;
      }
    }
    // agent 已自改过的/找不到的：保留
    return full;
  });
  if (text !== orig) {
    if (APPLY) fs.writeFileSync(f, text);
    console.log((APPLY ? "CHANGED " : "WOULD-CHANGE ") + rel);
  }
}
console.log(`\n映射文件 ${mapEntries.length} 份，匹配到 ${docMaps.size} 个文档（未匹配 ${unmatchedMaps} 份）`);
console.log(`${APPLY ? "已改写" : "将改写"} ${changed} 处锚点链接`);
if (!APPLY) console.log("（加 --apply 执行改写）");