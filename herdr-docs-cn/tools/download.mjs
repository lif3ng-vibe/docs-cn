#!/usr/bin/env node
// download.mjs — 抓取 herdr.dev 全站页面与静态资产到 upstream/（镜像底稿，英文原版）
// 用法：node tools/download.mjs [--pages-only]
// 产物：upstream/<path>/index.html、upstream/index.html（首页）、upstream/_astro/...（资产）
//       data/asset-manifest.json（资产清单）
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
const CONCURRENCY = 3;
const args = process.argv.slice(2);
const pagesOnly = args.includes('--pages-only');

fs.mkdirSync(UP, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

async function pool(items, worker, concurrency = CONCURRENCY) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); } catch (e) { console.error(`  ! ${JSON.stringify(item).slice(0, 120)}: ${e.message.split('\n')[0]}`); }
    }
  });
  await Promise.all(runners);
}

async function curlTo(url, outFile, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      await pexec('curl', ['-sL', '--max-time', '90', '-A', UA, '-o', outFile, url], { maxBuffer: 64 * 1024 * 1024 });
      const size = fs.existsSync(outFile) ? fs.statSync(outFile).size : 0;
      if (size > 0) return size;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error(`download failed after ${attempts} tries`);
}

// URL 路径 → 本地文件路径（目录式 URL 落 index.html）
function localPath(p) {
  let rel = p.replace(/^\//, '');
  if (rel === '') return 'index.html';
  if (/\.[a-z0-9]{2,5}$/i.test(rel)) return rel;
  return path.join(rel, 'index.html');
}

// ---------- 1. 页面清单 ----------
const pages = JSON.parse(fs.readFileSync(path.join(DATA, 'pages.json'), 'utf8'));
console.log(`pages: ${pages.length}`);

// ---------- 2. 下载页面 ----------
const assets = new Set();
const pageFail = [];
await pool(pages, async (p) => {
  const out = path.join(UP, localPath(p));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await curlTo(`${ORIGIN}/${p}`, out);
  // 提取资产引用（仅根绝对路径 / 开头 + 本站绝对 URL）
  const html = fs.readFileSync(out, 'utf8');
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src|poster)="(\/[^"#][^"]*)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/content="(https:\/\/herdr\.dev(\/[^"]*))"/g)) refs.add(m[2]);
  for (const m of html.matchAll(/srcset="([^"]*)"/g)) {
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith('/')) refs.add(u);
    }
  }
  for (const r of refs) {
    if (/\/(tui|ja|zh-cn)(\/|$)/.test(r)) continue; // TUI 三语不镜像
    assets.add(r);
  }
});
console.log(`pages done, assets refs: ${assets.size}`);
fs.writeFileSync(path.join(DATA, 'asset-manifest.json'), JSON.stringify([...assets], null, 0));
if (pageFail.length) console.error('page fails:', pageFail);

if (pagesOnly) process.exit(0);

// ---------- 3. 下载资产（一层 CSS 内 url() 递归） ----------
const done = new Set();
async function downloadAsset(urlPath, depth = 0) {
  if (done.has(urlPath) || depth > 3) return;
  done.add(urlPath);
  const out = path.join(UP, localPath(urlPath));
  if (fs.existsSync(out) && fs.statSync(out).size > 0) { /* sitemap 页面已落盘 */ }
  else {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    try { await curlTo(`${ORIGIN}${urlPath}`, out, 2); }
    catch (e) { console.error(`  asset miss: ${urlPath}`); return; }
  }
  // CSS 内引用递归（字体、图片）
  if (/\.css($|\?)/.test(urlPath)) {
    const css = fs.readFileSync(out, 'utf8');
    const base = urlPath.replace(/[^/]*$/, '');
    const inner = new Set();
    for (const m of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      let u = m[2];
      if (u.startsWith('data:')) continue;
      if (u.startsWith('/')) inner.add(u);
      else if (/^https:\/\/herdr\.dev\//.test(u)) inner.add(u.slice('https://herdr.dev'.length));
      else {
        // 相对路径 → 绝对
        let abs = base + u;
        const parts = [];
        for (const seg of abs.split('/')) {
          if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg);
        }
        inner.add('/' + parts.join('/'));
      }
    }
    for (const u of inner) await downloadAsset(u, depth + 1);
  }
}
await pool([...assets], (u) => downloadAsset(u));
console.log(`assets done: ${done.size}`);
