#!/usr/bin/env node
// check-translations.mjs — 校验 data/translations/*.json：可解析、键为英文、值为非空中文
// 用法：node pipeline/check-translations.mjs [batch.json ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data', 'translations');
const allFiles = [];
(function walk(dir, relPrefix = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
    else if (e.name.endsWith('.json')) allFiles.push(rel);
  }
})(DIR);
let files = allFiles;
if (process.argv[2]) {
  const wanted = new Set(process.argv.slice(2).flatMap(b =>
    JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'batches', b), 'utf8')).pages.map(p => `${p}.json`)));
  files = files.filter(f => wanted.has(f));
}
let bad = 0, total = 0;
const norm = (s) => s.replace(/\s+/g, ' ').trim();
for (const f of files) {
  let table;
  try {
    table = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  } catch (e) {
    console.error(`✗ ${f}: JSON 解析失败 — ${e.message.slice(0, 80)}`);
    bad++; continue;
  }
  const issues = [];
  for (const [k, v] of Object.entries(table)) {
    total++;
    if (typeof v !== 'string' || !v.trim()) issues.push(`空值: ${k.slice(0, 40)}`);
    if (/[一-龥]/.test(k)) issues.push(`键含中文(疑似污染): ${k.slice(0, 40)}`);
    const keepSame = norm(v) === norm(k) || norm(v).toUpperCase() === norm(k).toUpperCase();
    if (!keepSame && !/[一-龥]/.test(v) && /[a-zA-Z]{3,}/.test(v)) issues.push(`值疑似未译: ${k.slice(0, 30)} → ${v.slice(0, 30)}`);
  }
  if (issues.length) {
    bad++;
    console.error(`✗ ${f}: ${issues.length} 项`);
    issues.slice(0, 5).forEach(i => console.error(`   ${i}`));
  }
}
console.log(`checked ${files.length} files, ${total} entries, ${bad} bad`);
process.exit(bad ? 1 : 0);
