#!/usr/bin/env node
/**
 * fix-anchors-by-pairing.mjs —— 英文基线与中文导出按标题顺序配对，机械回修锚点
 *
 * 原理（锚点映射自动配对法）：翻译不改标题结构，故每页的 heading 序列在
 * dist-en（英文基线）与 dist（中文导出）里一一对应。按文档顺序把两边的
 * heading id 配对 → 得到每页的 旧锚点→新锚点 映射（以实际产物为准，
 * 不依赖翻译期的锚点预测）。再用它回修中文源码里的页内/跨页锚点链接。
 *
 * 注意：Mintlify 导出的正文标题 id 在 HTML 的 h1-h6 标签上（排除框架哈希
 * id `_R_*` 与 base-ui 组件 id）。飞行数据里另有 JSON 字符串形态的 id，
 * 本脚本只取标签属性形态，天然去重。
 *
 * 用法：node scripts/fix-anchors-by-pairing.mjs <dist-en> <dist> [--dry]
 * 环境变量 DOCS_BASE：产物已加部署前缀时自动剥离（默认 /docs-cn/pi）。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const EN = resolve(process.argv[2] || 'dist-en');
const CN = resolve(process.argv[3] || 'dist');
const DRY = process.argv.includes('--dry');
const STRIP = (process.env.DOCS_BASE || '/docs-cn/pi').replace(/\/+$/, '');

const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

/** 读一个导出目录：rel（'' 为根）→ { html, headingIds[]（按文档顺序） } */
function loadDist(dir) {
  const pages = new Map();
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') {
        const rel = relative(dir, d).replace(/\\/g, '/');
        const html = readFileSync(p, 'utf8');
        const ids = [];
        for (const m of html.matchAll(/<h[1-6][^>]*\bid="([^"]+)"/g)) {
          const id = decode(m[1]);
          if (id.startsWith('_R_') || id.startsWith('base-ui-')) continue;
          if (!ids.includes(id)) ids.push(id);
        }
        pages.set(rel, { html, ids });
      }
    }
  })(dir);
  return pages;
}

const en = loadDist(EN);
const cn = loadDist(CN);

// 逐页配对：旧 id → 新 id
const pair = new Map(); // rel -> Map(oldId -> newId)
let pairCount = 0, mismatched = [];
for (const [rel, { ids: enIds }] of en) {
  const cnPage = cn.get(rel);
  if (!cnPage) { mismatched.push(`${rel}: 中文产物缺页`); continue; }
  const cnIds = cnPage.ids;
  if (enIds.length !== cnIds.length) {
    mismatched.push(`${rel}: 标题数不一致 en=${enIds.length} cn=${cnIds.length}`);
  }
  const m = new Map();
  const n = Math.min(enIds.length, cnIds.length);
  for (let i = 0; i < n; i++) {
    if (enIds[i] !== cnIds[i]) m.set(enIds[i], cnIds[i]);
  }
  pairCount += m.size;
  if (m.size) pair.set(rel, m);
}

console.log(`配对完成：${pair.size} 页有锚点变更，共 ${pairCount} 个旧→新映射`);
if (mismatched.length) console.log('⚠ 结构差异（仍按位置配对，请人工复核）：\n  ' + mismatched.join('\n  '));
if (!pair.size) { console.log('CLEAN：锚点零变更'); process.exit(0); }

// ---- 回修中文源码 .md ----
// 源文件 <name>.md ↔ 产物目录 <name>/（index.md ↔ 根）
// 链接形态：[x](settings.md#old) [x](#old) [x](settings.md)
const srcDir = ROOT;
const changes = [];
for (const [rel, map] of pair) {
  const srcName = rel === '' ? 'index' : rel;
  const srcPath = join(srcDir, `${srcName}.md`);
  let src;
  try { src = readFileSync(srcPath, 'utf8'); } catch { continue; }
  let out = src.replace(/\]\(([^)#\s]*)(#[^)\s]*)?\)/g, (full, path, hash) => {
    if (!hash || hash === '#') return full;
    const anchor = decode(hash.slice(1));
    // 目标页：空 path = 页内；否则剥 .md 与前缀
    let targetRel;
    if (path === '') targetRel = srcName === 'index' ? '' : srcName;
    else {
      let p = path.replace(/\.md$/, '');
      if (p.startsWith(STRIP)) p = p.slice(STRIP.length);
      p = p.replace(/^\//, '');
      targetRel = p === 'index' ? '' : p;
    }
    const m = pair.get(targetRel);
    if (!m || !m.has(anchor)) return full;
    const nu = encodeURI(m.get(anchor));
    changes.push(`${srcName}.md: ${path}${hash} → ${path}#${m.get(anchor)}`);
    return `](${path}#${nu})`;
  });
  if (out !== src && !DRY) writeFileSync(srcPath, out);
}
console.log(DRY ? `[dry] 将回修 ${changes.length} 处：` : `回修 ${changes.length} 处：`);
console.log(changes.slice(0, 60).join('\n') || '（无）');
if (changes.length > 60) console.log(`… 等共 ${changes.length} 处`);
