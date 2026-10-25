#!/usr/bin/env node
// 剩余失效锚点甄别：对 (old, dst) 在 dist 目标页 id 里找相似候选。
// 相似度 = 公共 5-gram 比例 + 公共长 token（≥4 字符）。输出建议清单供人工裁决。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const reportPath = process.argv[2];
const pairs = [];
for (const line of readFileSync(reportPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*(\/docs\/\S+) -> #([\w-]+) \(target page (\/docs\/\S+) has no such id\)/);
  if (m) pairs.push({ src: m[1], old: m[2], dst: m[3] });
}
const byKey = new Map();
for (const p of pairs) {
  const k = p.old + ' → ' + p.dst;
  if (!byKey.has(k)) byKey.set(k, { ...p, srcs: [] });
  byKey.get(k).srcs.push(p.src);
}

function headsOf(dstPage) {
  try {
    const html = readFileSync(join('dist', dstPage, 'index.html'), 'utf8');
    const heads = [];
    for (const m of html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      const id = m[1];
      if (/^(starlight__|theme-)/.test(id)) continue;
      heads.push({ id, key: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase() });
    }
    return heads;
  } catch {
    return [];
  }
}

function ngrams(s, n = 5) {
  const t = s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  const out = new Set();
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n));
  return out;
}
function sim(a, b) {
  const A = ngrams(a);
  const B = ngrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / Math.min(A.size, B.size);
}

let unresolvedCount = 0;
for (const [, { old: oldA, dst, srcs }] of byKey) {
  const heads = headsOf(dst);
  const scored = heads
    .map((h) => ({ id: h.id, s: Math.max(sim(oldA, h.id), sim(oldA, h.key)) }))
    .filter((h) => h.s > 0.45)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  if (scored.length) {
    console.log(`SUGGEST #${oldA} @ ${dst}`);
    for (const s of scored) console.log(`    → #${s.id} (sim ${s.s.toFixed(2)})`);
    console.log(`    ← ${srcs.length} 处引用，如 ${srcs[0]}`);
  } else {
    unresolvedCount++;
    console.log(`DANGLING #${oldA} @ ${dst}（无相似 id；${srcs.length} 处引用）`);
  }
}
console.log(`\ndangling(无候选): ${unresolvedCount} / unique ${byKey.size}`);
