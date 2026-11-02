#!/usr/bin/env node
/**
 * fix-anchors-from-maps.mjs —— 翻译期锚点回修（映射表法）
 *
 * 数据源：
 *  1. .anchor-maps/<batch>/<file>.map.md —— 子代理产出，行格式 `原英文标题 | 中文标题 | 新锚点`
 *  2. /tmp/ollama-html/anchors-en.json —— 原站 HTML 抓取的 [id, 标题] 权威对照（ANTHORS_EN）
 *
 * 旧锚点优先按英文标题从 anchors-en.json 反查（权威），查不到再按 Mintlify
 * slug 规则从英文标题计算并警告。然后全站 .mdx 里 `](path#old)` / `](#old)`
 * / href="#old" 的锚点统一重写为新锚点；未收录的锚点原样保留并列出供人工复核。
 *
 * 用法: node scripts/fix-anchors-from-maps.mjs [--dry] [anchors-en.json路径]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
const EN_ARG = process.argv.find((a) => a.endsWith('.json'));
const EN_JSON = EN_ARG || '/tmp/ollama-html/anchors-en.json';
const MAPDIR = join(ROOT, '.anchor-maps');

const clean = (s) => s.replace(/​/g, '').replace(/\s+/g, ' ').trim();
// 宽松归一化：反引号/撇号形态差异不影响标题匹配
const norm = (s) => clean(s).replace(/[`'’]/g, '').toLowerCase();

// Mintlify slug（记忆坑 5 实测规则，仅 fallback）
function mintSlug(t) {
  return t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}’-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

// 1. 权威 id 库：英文标题 → id（多页同名标题共享 id，映射按标题全局成立）
const enData = JSON.parse(readFileSync(EN_JSON, 'utf8'));
const titleToId = new Map();
const allIds = new Set();
for (const [, ids] of Object.entries(enData)) {
  for (const [id, text] of ids) {
    allIds.add(id);
    // 框架 id 与页面主标题 id 不参与标题反查（React 随机 id / 每页同名的 page-title 会让同名标题错位）
    if (/^(_R_|base-ui-)/.test(id) || id === 'page-title') continue;
    const t = clean(text);
    if (t && !titleToId.has(norm(t))) titleToId.set(norm(t), id);
  }
}

// 2. 读映射文件：old → new
const map = new Map();
const warns = [];
(function walk(d) {
  if (!existsSync(d)) return;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!f.endsWith('.map.md')) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const s = line.trim();
      if (!s || s === 'none') continue;
      const parts = s.split('|').map((x) => x.trim());
      if (parts.length !== 3) { warns.push(`映射格式异常: ${f}: ${s}`); continue; }
      const [en, zh] = parts;
      // 新锚点统一按 Mintlify slug 规则从中文标题重算（第三列仅作对照参考）
      const neu = mintSlug(zh);
      const old = titleToId.get(norm(en)) ?? mintSlug(en);
      if (!titleToId.has(norm(en)))
        warns.push(`基线未匹配（fallback slug）: "${en}" → #${old}`);
      const claimed = (parts[2] ?? '').trim();
      if (claimed && claimed !== neu)
        warns.push(`第三列与重算不一致（以重算为准）: "${zh}" 映射=${claimed} 重算=${neu}`);
      if (old !== neu) map.set(old, neu);
    }
  }
})(MAPDIR);

console.log(`映射 ${map.size} 条（old→new）`);
if (warns.length) console.log('⚠ 警告:\n  ' + [...new Set(warns)].join('\n  '));
if (!map.size) { console.log('CLEAN：无锚点变更'); process.exit(0); }

// 3. 全站 .mdx 回修
let total = 0;
const untouched = new Set();
(function walkSrc(d) {
  for (const f of readdirSync(d)) {
    if (f === 'node_modules' || f === 'dist' || f === '.anchor-maps' || f.startsWith('dist-')) continue;
    const p = join(d, f);
    const st = statSync(p);
    if (st.isDirectory()) { walkSrc(p); continue; }
    if (!/\.(mdx|md)$/.test(f)) continue;
    const src = readFileSync(p, 'utf8');
    let n = 0;
    const out = src
      .replace(/(\]\([^)\s]*)#([^)\s]+)\)/g, (full, head, a1) => {
        if (map.has(a1)) { n++; return `${head}#${map.get(a1)})`; }
        if (allIds.has(a1)) untouched.add(a1);
        return full;
      })
      .replace(/(href="#)([^"\s]+)(")/g, (full, head, a2, tail) => {
        if (map.has(a2)) { n++; return `${head}${map.get(a2)}${tail}`; }
        if (allIds.has(a2)) untouched.add(a2);
        return full;
      });
    if (n && !DRY) writeFileSync(p, out);
    if (n) { console.log(`${relative(ROOT, p)}: ${n} 处`); total += n; }
  }
})(ROOT);

console.log(DRY ? `[dry] 共 ${total} 处待回修` : `共回修 ${total} 处`);
if (untouched.size) console.log(`未翻译的英文锚点（保留原样，共 ${untouched.size} 个）:\n  ` + [...untouched].join('\n  '));
