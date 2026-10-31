#!/usr/bin/env node
// fetch-page-assets.mjs — 补抓指定页面引用但缺失的资产（含基线同步）
// 用法：node pipeline/fetch-page-assets.mjs <page-path 相对 site/，空串=首页>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const BASE = path.join(ROOT, 'data', 'site-en-baseline');
const ORIGIN = 'https://www.aihero.dev';
const P = '/docs-cn/aihero';
const page = process.argv[2] || '';
const htmlPath = path.join(SITE, page === '' ? 'index.html' : `${page}/index.html`);
const html = fs.readFileSync(htmlPath, 'utf8');

const refs = new Set();
for (const m of html.matchAll(/(?:href|src|imagesrcset|srcset)="([^"]*)"/g)) {
  for (const part of m[1].split(',')) {
    let u = part.trim().split(/\s+/)[0];
    if (u.startsWith(P + '/')) u = u.slice(P.length);
    else if (u.startsWith('https://lif3ng-vibe.github.io' + P + '/')) u = u.slice(('https://lif3ng-vibe.github.io' + P).length);
    else if (u.startsWith('/_next/') || (u.startsWith('/') && /\.(css|js|woff2?|png|jpe?g|svg|webp|ico|json)$/i.test(u.split('#')[0].split('?')[0]))) {
      // 基线原貌页（未前缀化）的根绝对引用
    }
    else continue;
    u = u.split('#')[0].split('?')[0];
    if (!u.startsWith('/_next/') && !/\.(css|js|woff2?|png|jpe?g|svg|webp|ico|json)$/i.test(u)) continue;
    refs.add(u);
  }
}
console.log(`[${page || '(home)'}] 引用资产: ${refs.size}`);
let got = 0, miss = 0;
for (const u of refs) {
  const rel = decodeURIComponent(u);
  const out = path.join(SITE, rel);
  if (fs.existsSync(out)) continue;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try {
    execFileSync('curl', ['-sL', '--max-time', '90', '-A', 'Mozilla/5.0', '-o', out, ORIGIN + u], { stdio: 'pipe' });
    const size = fs.existsSync(out) ? fs.statSync(out).size : 0;
    if (size === 0) { fs.rmSync(out, { force: true }); miss++; continue; }
    const bout = path.join(BASE, rel);
    fs.mkdirSync(path.dirname(bout), { recursive: true });
    fs.copyFileSync(out, bout);
    got++;
    console.log('  +', rel, `(${size}b)`);
  } catch { miss++; }
}
console.log(`补抓 ${got} 个, 失败 ${miss}`);
