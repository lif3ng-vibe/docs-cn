/**
 * 跨页锚点回修脚本：翻译并行进行时子代理无法预知他页译名，故跨页 #锚点
 * 统一留在英文原样；本脚本在全部批次完成后跑——
 * 汇总 .anchor-maps 各批次目录下「锚点映射」内的 .map.md（原英文标题 → 新锚点），
 * 得到英文 slug → 新中文锚点 的全局表，然后扫描全站 mdx 中
 *   ](/page#oldAnchor) / href="/page#oldAnchor" / 页内 (#oldAnchor)
 * 里 oldAnchor 命中全局表的替换为新锚点；docs.json redirects 的 destination
 * 锚点按 JSON 单独回修。
 *
 * 用法：node fix-anchors.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const DRY = process.argv.includes('--dry');

// 1. 汇总映射表
const enToNew = new Map();
const conflicts = [];
function collectMaps(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) collectMaps(join(dir, e.name), r);
    else if (r.includes('锚点映射') && e.name.endsWith('.map.md')) {
      for (const raw of readFileSync(join(dir, e.name), 'utf8').split('\n')) {
        const line = raw.trim().replace(/^\|/, '').replace(/\|$/, '');
        const parts = line.split('|').map(s => s.trim()).filter(s => s !== '');
        if (parts.length !== 3) continue; // 表头/说明行/列数不对者跳过
        const [en, , newAnchor] = parts;
        if (en === '原英文标题') continue;
        const enSlug = en.toLowerCase().trim().replace(/[^a-z0-9-_]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
        if (!enSlug || !newAnchor || /[|]/.test(newAnchor)) continue;
        if (enToNew.has(enSlug) && enToNew.get(enSlug) !== newAnchor) {
          conflicts.push(`${enSlug}: ${enToNew.get(enSlug)} != ${newAnchor}（${r}）`);
        }
        enToNew.set(enSlug, newAnchor);
      }
    }
  }
}
collectMaps(ROOT);

if (conflicts.length) console.log('映射冲突（同英文 slug 译文不同，需人工确认）：\n' + conflicts.join('\n'));
console.log(`映射条目：${enToNew.size}`);

// 2. 全站替换（页内 #anchor 也兜底：子代理已自改的中文锚点不在表内，天然跳过）
function fixLinkLine(line) {
  return line.replace(/(\]\(|href=")(\/*[a-zA-Z0-9/_-]*)#([a-zA-Z0-9-_]+)/g, (full, head, page, anchor) => {
    const target = enToNew.get(anchor);
    if (!target || target === anchor) return full;
    return `${head}${page}#${target}`;
  });
}
let changed = 0;
function fixLinks(path, rel) {
  const src = readFileSync(path, 'utf8');
  const lines = src.split('\n');
  const out = lines.map((l, i) => {
    const n = fixLinkLine(l);
    if (n !== l) {
      changed++;
      if (DRY) console.log(`${rel}:${i + 1}\n  - ${l.trim().slice(0, 150)}\n  + ${n.trim().slice(0, 150)}`);
    }
    return n;
  });
  if (!DRY && changed) writeFileSync(path, out.join('\n'));
}
function walk(dir, rel = '') {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (['node_modules', 'examples', 'snippets', '.git', '.anchor-maps'].includes(e.name)) continue;
      walk(join(dir, e.name), r);
    } else if (e.name.endsWith('.mdx') || e.name.endsWith('.md')) {
      fixLinks(join(dir, e.name), r);
    }
  }
}
walk(ROOT);

// 3. docs.json redirects：destination 形如 "/ci#mobile-jobs"，无 ]( / href=" 前缀，按 JSON 单独处理
const docsPath = join(ROOT, 'docs.json');
const docsRaw = readFileSync(docsPath, 'utf8');
const docs = JSON.parse(docsRaw);
let docsChanged = 0;
for (const r of docs.redirects ?? []) {
  const hashIdx = r.destination.indexOf('#');
  if (hashIdx < 0) continue;
  const anchor = r.destination.slice(hashIdx + 1);
  const target = enToNew.get(anchor);
  if (target && target !== anchor) {
    r.destination = r.destination.slice(0, hashIdx) + '#' + target;
    docsChanged++;
  }
}

if (!DRY) {
  if (docsChanged) { writeFileSync(docsPath, JSON.stringify(docs, null, 2) + '\n'); console.log(`docs.json redirects 回修：${docsChanged} 处`); }
  else console.log('docs.json redirects：无需回修');
  console.log(`mdx 改动行数：${changed}`);
} else {
  console.log(`docs.json redirects 将回修：${docsChanged} 处；mdx 将改动行数：${changed}`);
}