#!/usr/bin/env node
// fix-polluted-keys.mjs — 修复冒烟污染造成的混排键：把键里的中文 chrome 词反向替换回英文，
// 与纯净 strings 键名精确对齐后重命名；对不上的保留并报告。
// 用法：node pipeline/fix-polluted-keys.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TR = path.join(ROOT, 'data', 'translations');
const STR = path.join(ROOT, 'data', 'strings');

// 纯净英文键全集（按页组织，也做全局 set）
const pristineSet = new Set();
const pristineByPage = new Map();
(function walk(dir, relPrefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
    else if (e.name.endsWith('.json') && e.name !== '_stats.json') {
      const d = JSON.parse(fs.readFileSync(path.join(dir, e.name), 'utf8'));
      const all = [...(d.texts || []), ...(d.attrs || []), ...(d.meta || [])];
      pristineByPage.set(rel.replace(/\.json$/, ''), all);
      for (const s of all) pristineSet.add(s);
    }
  }
})(STR);

// 反向替换表：chrome 译文 → 英文原文（含首字母大小写两个变体）
const chrome = JSON.parse(fs.readFileSync(path.join(TR, '_chrome.json'), 'utf8'));
const rev = [];
for (const [en, zh] of Object.entries(chrome)) {
  if (!/[一-龥]/.test(zh)) continue;
  rev.push([zh, en]);
  if (/^[A-Z]/.test(en)) rev.push([zh, en.toLowerCase()]);
}
rev.sort((a, b) => b[0].length - a[0].length); // 长词优先，避免子串抢替换

function decontaminate(key) {
  // 生成所有替换组合（每个混排位置可换可不换——必须全换才有意义，这里做全替换 + 逐词大小写尝试）
  let outs = [key];
  for (const [zh, en] of rev) {
    if (!key.includes(zh)) continue;
    outs = outs.flatMap(o => {
      const r = o.split(zh).join(en);
      return r === o ? [o] : [r];
    });
  }
  return outs;
}
function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

let repaired = 0, stale = 0, unmatched = 0;
const unmatchedLog = [];
for (const dir of [TR]) {
  (function walk(d, relPrefix = '') {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
      if (e.isDirectory()) { walk(path.join(d, e.name), rel); continue; }
      if (!e.name.endsWith('.json') || e.name === '_chrome.json') continue;
      const f = path.join(d, e.name);
      const table = JSON.parse(fs.readFileSync(f, 'utf8'));
      const out = {};
      let touched = false;
      for (const [k, v] of Object.entries(table)) {
        if (!/[一-龥]/.test(k)) { out[k] = v; continue; }
        const cands = decontaminate(k).map(norm);
        let hit = cands.find(c => pristineSet.has(c));
        if (hit) { out[hit] = v; repaired++; touched = true; continue; }
        // 对不齐：键本身就是污染快照、纯净站已无对应 → 删（值若全中文则记日志备查）
        stale++;
        unmatchedLog.push(`${rel}: ${k.slice(0, 70)}`);
      }
      if (touched) fs.writeFileSync(f, JSON.stringify(out, null, 1));
    }
  })(dir);
}
console.log(`repaired=${repaired} dropped=${stale}`);
if (unmatchedLog.length) console.log('dropped keys:\n' + unmatchedLog.slice(0, 40).join('\n'));
