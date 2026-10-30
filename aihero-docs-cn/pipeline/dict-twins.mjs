#!/usr/bin/env node
// dict-twins.mjs — 从 mattpocock/dictionary-of-ai-coding 上游仓库生成词典页 twins（英文原文）
// 用法：node pipeline/dict-twins.mjs <dict-repo-dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TWINS = path.join(ROOT, 'data', 'twins', 'ai-coding-dictionary');
const repoDir = process.argv[2];
if (!repoDir || !fs.existsSync(repoDir)) { console.error('usage: node pipeline/dict-twins.mjs <dict-repo-dir>'); process.exit(1); }

fs.mkdirSync(TWINS, { recursive: true });
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pages.json'), 'utf8'))
  .filter(p => p.startsWith('ai-coding-dictionary/'));
const files = fs.readdirSync(path.join(repoDir, 'dictionary'));

// slug 匹配：文件名小写、空格转连字符；AGENTS.md.md → agents-md；X.md.md 特例归一
function candidates(file) {
  const base = file.replace(/\.md$/i, '');
  const norm = base.toLowerCase().replace(/\s+/g, '-');
  return [norm, norm.replace(/\./g, '-')];
}
const byNorm = new Map();
for (const f of files) for (const c of candidates(f)) byNorm.set(c, f);

let hit = 0;
const miss = [];
for (const p of pages) {
  const slug = p.replace('ai-coding-dictionary/', '');
  const f = byNorm.get(slug);
  if (!f) { miss.push(slug); continue; }
  const body = fs.readFileSync(path.join(repoDir, 'dictionary', f), 'utf8');
  fs.writeFileSync(path.join(TWINS, `${slug}.md`), body);
  hit++;
}
console.log(`dict twins: ${hit}/${pages.length}`);
if (miss.length) console.log('miss:', miss.join(', '));
