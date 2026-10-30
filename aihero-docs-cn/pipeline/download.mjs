#!/usr/bin/env node
// download.mjs — 抓取 aihero.dev 全站页面与静态资产到 site/（镜像底稿，英文原版）
// 用法：node pipeline/download.mjs [--pages-only]
// 产物：site/<path>/index.html、site/index.html（首页）、site/_next/...（资产）
//       data/asset-manifest.json（资产清单，供后续脚本复用）
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pexec = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const DATA = path.join(ROOT, 'data');
const ORIGIN = 'https://www.aihero.dev';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const CONCURRENCY = 3; // 用户要求全程并发 ≤3
const args = process.argv.slice(2);
const pagesOnly = args.includes('--pages-only');

fs.mkdirSync(SITE, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

// ---------- 并发池 ----------
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

async function curlTo(url, outFile, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await pexec('curl', ['-sL', '--max-time', '90', '-A', UA,
        '-o', outFile, url], { maxBuffer: 64 * 1024 * 1024 });
      const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
      if (size > 0) return size;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error(`download failed after ${attempts} tries`);
}

// ---------- 1. 页面清单 ----------
const pages = JSON.parse(fs.readFileSync(path.join(DATA, 'pages.json'), 'utf8'));
console.log(`pages: ${pages.length}`);

// ---------- 2. 下载页面 ----------
const pageResults = { ok: [], fail: [] };
await pool(pages, async (p) => {
  const rel = p === '' ? 'index.html' : path.join(p, 'index.html');
  const out = path.join(SITE, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const size = await curlTo(`${ORIGIN}/${p}`, out);
  if (size < 5000) throw new Error(`suspiciously small (${size}b): /${p}`);
  pageResults.ok.push(p);
  console.log(`  page /${p} (${size}b)`);
});
console.log(`pages ok=${pageResults.ok.length} fail=${pages.length - pageResults.ok.length}`);
fs.writeFileSync(path.join(DATA, 'download-report.json'), JSON.stringify(pageResults, null, 2));
if (pageResults.fail.length > 0 || pageResults.ok.length !== pages.length) {
  console.error('some pages failed — aborting asset phase');
  process.exit(1);
}

// ---------- 3. 收集资产引用 ----------
const ASSET_RE = /(?:href|src|imagesrcset|srcset|content)="(\/[^"]*)"/g;
const CSS_URL_RE = /url\((['"]?)\/[^)]*\1\)/g;
const assets = new Set();
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) htmlFiles.push(full);
  }
})(SITE);

function addAsset(u) {
  if (assets.has(u)) return;
  if (!u.startsWith('/')) return;
  if (u.startsWith('/api/') || u.startsWith('/mcp') || u.startsWith('/oauth')) return;
  if (/\.(html?|md|xml|txt|webmanifest)$/i.test(u) && !u.startsWith('/_next/')) return;
  assets.add(u.split('#')[0]);
}

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(ASSET_RE)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      addAsset(u);
      // next/image 优化端点 → 解析回原始静态路径
      if (u.startsWith('/_next/image?')) {
        try {
          const q = new URLSearchParams(u.split('?')[1]);
          const orig = q.get('url');
          if (orig && orig.startsWith('/')) addAsset(orig);
        } catch { /* ignore */ }
      }
    }
  }
}

// ---------- 4. 下载资产 ----------
if (!pagesOnly) {
  console.log(`assets: ${assets.size}`);
  const manifest = {};
  await pool([...assets], async (u) => {
    let rel = decodeURIComponent(u.split('?')[0]);
    const out = path.join(SITE, rel);
    if (fs.existsSync(out)) { manifest[u] = rel; return; }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await curlTo(`${ORIGIN}${u}`, out);
    manifest[u] = rel;
  });
  fs.writeFileSync(path.join(DATA, 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`assets done: ${Object.keys(manifest).length}`);
}

// ---------- 5. CSS 二次扫描（字体等 url() 引用） ----------
if (!pagesOnly) {
  const cssFiles = [];
  (function walk2(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk2(full);
      else if (e.name.endsWith('.css')) cssFiles.push(full);
    }
  })(SITE);
  const extra = new Set();
  for (const f of cssFiles) {
    const css = fs.readFileSync(f, 'utf8');
    for (const m of css.matchAll(/url\((['"]?)(\/[^)'"]+)\1\)/g)) extra.add(m[2]);
  }
  console.log(`css extra assets: ${extra.size}`);
  await pool([...extra], async (u) => {
    const rel = decodeURIComponent(u.split('?')[0]);
    const out = path.join(SITE, rel);
    if (fs.existsSync(out)) return;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await curlTo(`${ORIGIN}${u}`, out);
  });
}

console.log('download complete');
