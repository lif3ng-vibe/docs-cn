#!/usr/bin/env node
// fetch-assets.mjs — 按 data/asset-manifest.json 补抓缺失资产（download.mjs 资产阶段卡死后的快速通道）
// 跳过：页面 URL、email-protection 垃圾；CSS 内 url() 递归补齐（字体/图片）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UP = path.join(ROOT, 'upstream');
const DATA = path.join(ROOT, 'data');
const ORIGIN = 'https://herdr.dev';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

const pages = new Set(JSON.parse(fs.readFileSync(path.join(DATA, 'pages.json'), 'utf8'))
  .map(p => p === '' ? 'index.html' : p.replace(/^\//, '') + '/index.html'));
const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'asset-manifest.json'), 'utf8'));

function localPath(p) {
  let rel = p.split('?')[0].replace(/^\//, ''); // query 剥离（Windows 文件名不允许 ?；伺服时 query 不参与静态匹配）
  if (rel === '') return 'index.html';
  if (/\.[a-z0-9]{2,5}$/i.test(rel)) return rel;
  return path.join(rel, 'index.html');
}

async function curlTo(url, outFile) {
  await pexec('curl', ['-sL', '--max-time', '30', '--connect-timeout', '10', '-A', UA, '-o', outFile, url],
    { maxBuffer: 32 * 1024 * 1024, timeout: 35000 });
  return fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
}

const queue = [];
const done = new Set();
const missing = [];
for (const p of manifest) {
  const rel = localPath(p);
  if (pages.has(rel)) continue;                    // 页面项：抓页阶段已落盘
  if (p.includes('email-protection')) continue;    // email 混淆垃圾
  const out = path.join(UP, rel);
  if (fs.existsSync(out) && fs.statSync(out).size > 0) { done.add(p); continue; }
  queue.push({ urlPath: p, out, depth: 0 });
}
console.log(`manifest ${manifest.length}, need ${queue.length}`);

async function pool(items, worker, concurrency = 4) {
  const q = [...items];
  await Promise.all(Array.from({ length: Math.min(concurrency, q.length) }, async () => {
    while (q.length) {
      const item = q.shift();
      try { await worker(item); } catch (e) { console.error(`  ! ${item.urlPath}: ${e.message.split('\n')[0]}`); }
    }
  }));
}

async function fetchOne({ urlPath, out, depth }) {
  if (done.has(urlPath) || depth > 3) return;
  done.add(urlPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let size = 0;
  try { size = await curlTo(`${ORIGIN}${urlPath}`, out); } catch { /* fallthrough */ }
  if (size === 0) { fs.rmSync(out, { force: true }); missing.push(urlPath); return; }
  if (/\.css($|\?)/.test(urlPath)) {
    const css = fs.readFileSync(out, 'utf8');
    const base = urlPath.replace(/[^/]*$/, '');
    for (const m of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      let u = m[2];
      if (u.startsWith('data:')) continue;
      let abs;
      if (u.startsWith('/')) abs = u;
      else if (/^https:\/\/herdr\.dev\//.test(u)) abs = u.slice('https://herdr.dev'.length);
      else {
        const parts = [];
        for (const seg of (base + u).split('/')) {
          if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg);
        }
        abs = '/' + parts.join('/');
      }
      if (abs.includes('email-protection')) continue;
      const o = path.join(UP, localPath(abs));
      if (!(fs.existsSync(o) && fs.statSync(o).size > 0)) await fetchOne({ urlPath: abs, out: o, depth: depth + 1 });
    }
  }
}

await pool(queue, fetchOne);
console.log(`done ${done.size}, missing ${missing.length}`);
if (missing.length) { console.log(missing.join('\n')); process.exit(1); }
