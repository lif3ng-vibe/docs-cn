#!/usr/bin/env node
// plan-batches.mjs — 把 208 页按板块分批（每批 ≤8 页），产出 data/batches/batch-NN.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const pages = JSON.parse(fs.readFileSync(path.join(DATA, 'pages.json'), 'utf8'));

function groupOf(p) {
  if (p.startsWith('ai-coding-dictionary')) return 'dict';
  if (p === 'skills' || p.startsWith('skills-')) return 'skills';
  if (p.startsWith('sandcastle')) return 'sandcastle';
  if (p.startsWith('workshops')) return 'workshops';
  if (p.startsWith('what-')) return 'learn';
  if (p.startsWith('vercel-ai-sdk') || p.includes('-with-vercel-ai-sdk') || p === 'agents-with-vercel-ai-sdk') return 'ai-sdk';
  if (['', 'learn', 'courses', 'faq', 'about', 'newsletter', 'privacy', 'api', 'developers', 'ai-engineer-roadmap', 'llm-fundamentals'].includes(p)) return 'app';
  return 'posts';
}

const groups = {};
for (const p of pages) {
  const g = groupOf(p);
  (groups[g] ||= []).push(p);
}

// 每组内按字符串量降序、切成 ≤8 页的批
const BATCH_SIZE = 8;
const batches = [];
let n = 0;
for (const [g, list] of Object.entries(groups)) {
  const stats = JSON.parse(fs.readFileSync(path.join(DATA, 'strings', '_stats.json'), 'utf8'));
  list.sort((a, b) => (stats[b]?.texts || 0) - (stats[a]?.texts || 0));
  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    n++;
    const chunk = list.slice(i, i + BATCH_SIZE);
    const file = `batch-${String(n).padStart(2, '0')}.json`;
    fs.writeFileSync(path.join(DATA, 'batches', file), JSON.stringify({ id: n, group: g, pages: chunk }, null, 1));
    console.log(`${file} [${g}] ${chunk.length}p`);
  }
}
console.log(`total batches: ${n}`);
