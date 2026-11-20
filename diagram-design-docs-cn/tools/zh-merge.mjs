// 合并子代理词典 → tools/gallery-zh-dict.json,校验 key 与原文清单精确一致
// 用法:node tools/zh-merge.mjs(读 .zh-out-a/b.json + gallery-zh-core.json)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const valid = new Set(
  [...readFileSync(join(ROOT, '.zh-hi.txt'), 'utf8').split('\n'),
   ...readFileSync(join(ROOT, '.zh-lo.txt'), 'utf8').split('\n')].filter(Boolean),
);

const merged = {};
let dropped = [];
for (const p of ['.zh-out-a.json', '.zh-out-b.json']) {
  const obj = JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
  for (const [k, v] of Object.entries(obj)) {
    if (!valid.has(k)) { dropped.push(`${p}: ${k.slice(0, 60)}`); continue; }
    if (typeof v !== 'string' || !v.trim()) { dropped.push(`${p}: EMPTY ${k.slice(0, 40)}`); continue; }
    merged[k] = v;
  }
}
// core 定译最后覆盖(优先级最高)
Object.assign(merged, JSON.parse(readFileSync(join(ROOT, 'tools', 'gallery-zh-core.json'), 'utf8')));

const missing = [...valid].filter(t => !merged[t] && t.length > 0);
writeFileSync(join(ROOT, 'tools', 'gallery-zh-dict.json'), JSON.stringify(merged, null, 2) + '\n');
console.log(`merged ${merged.length} / ${valid.size} | dropped ${dropped.length} | missing ${missing.length}`);
if (dropped.length) console.log('dropped(改写原文或空值,已剔除):\n' + dropped.slice(0, 20).join('\n'));
if (missing.length) console.log('missing(未覆盖):\n' + missing.slice(0, 30).join('\n'));
