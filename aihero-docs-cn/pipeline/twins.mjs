#!/usr/bin/env node
// twins.mjs — 抓取 aihero.dev 的 markdown twins（<path>.md）作为翻译源文本
// 用法：node pipeline/twins.mjs
// 产物：data/twins/<path>.md（404 的 app 页跳过）；data/twins-report.json
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const TWINS = path.join(DATA, 'twins');
const ORIGIN = 'https://www.aihero.dev';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const CONCURRENCY = 3;

fs.mkdirSync(TWINS, { recursive: true });
const pages = JSON.parse(fs.readFileSync(path.join(DATA, 'pages.json'), 'utf8'));

async function pool(items, worker, concurrency = CONCURRENCY) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); } catch (e) { console.error(`  ! ${item}: ${e.message.split('\n')[0]}`); }
    }
  });
  await Promise.all(runners);
}

const ok = [], miss = [];
await pool(pages, async (p) => {
  const rel = p === '' ? '_home.md' : `${p}.md`;
  const out = path.join(TWINS, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try {
    await pexec('curl', ['-sL', '--max-time', '60', '-A', UA, '-o', out, `${ORIGIN}/${p}.md`]);
    const body = fs.readFileSync(out, 'utf8');
    if (body.trim().length < 80 || /^9b?$/.test(body.trim()) || body.includes('<!DOCTYPE')) {
      fs.rmSync(out, { force: true });
      miss.push(p);
      return;
    }
    ok.push(p);
    console.log(`  twin /${p}.md (${body.length}b)`);
  } catch {
    miss.push(p);
  }
});
fs.writeFileSync(path.join(DATA, 'twins-report.json'), JSON.stringify({ ok, miss }, null, 2));
console.log(`twins ok=${ok.length} miss=${miss.length}`);
