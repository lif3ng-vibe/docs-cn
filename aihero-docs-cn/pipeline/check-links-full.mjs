#!/usr/bin/env node
// check-links-full.mjs — 全站链接 404 检查（三级：镜像内文件 / 原站 HEAD / 页内锚点）
// 用法：node pipeline/check-links-full.mjs [--head-upstream]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const P = '/docs-cn/aihero';
const UPSTREAM = 'https://www.aihero.dev';
const doHead = process.argv.includes('--head-upstream');

// 收集全部页面
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === 'index.html') pages.push(full);
  }
})(SITE);

const local404 = new Map();     // page -> [坏的本站路径]
const upstreamLinks = new Set(); // 外指原站的唯一路径
const anchor404 = new Map();    // page -> [坏锚点]
const extLinks = new Set();
let totalRefs = 0;

for (const f of pages) {
  const rel = path.relative(SITE, f).split(path.sep).join('/').replace(/\/index\.html$/, '').replace(/^index\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);

  const badLocal = [], badAnchor = [];
  for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
    totalRefs++;
    let href = m[1];
    if (href.startsWith('#')) {
      const frag = decodeURIComponent(href.slice(1));
      if (frag && !ids.has(frag)) badAnchor.push(href);
      continue;
    }
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (href.startsWith('//') || /^https?:\/\//i.test(href)) {
      if (href.includes('aihero.dev')) {
        try { upstreamLinks.add(new URL(href).pathname + (new URL(href).search || '')); } catch { /* skip */ }
      } else extLinks.add(href.split('/')[2] || href);
      continue;
    }
    // 相对路径（不应存在，但防御）
    if (!href.startsWith('/')) { badLocal.push('(相对)' + href); continue; }
    if (href.startsWith(P + '/')) {
      const p = href.slice(P.length).split('#')[0].split('?')[0];
      const t = path.join(SITE, decodeURIComponent(p));
      if (!fs.existsSync(t) && !fs.existsSync(path.join(t, 'index.html'))) badLocal.push(href);
    }
    // 指回原站的短路径（登录/报名/运行时端点）已在 href 形态时为绝对 URL，不会进这里
  }
  if (badLocal.length) local404[rel || '(home)'] = [...new Set(badLocal)];
  if (badAnchor.length) anchor404[rel || '(home)'] = [...new Set(badAnchor)];
}

console.log(`页面 ${pages.length}，href 总数 ${totalRefs}，外站域名 ${extLinks.size}，原站外指唯一路径 ${upstreamLinks.size}`);
console.log(`\n== 镜像内 404（${Object.keys(local404).length} 页）==`);
for (const [p, list] of Object.entries(local404)) console.log(' ', p, '→', list.slice(0, 6).join(', '));
console.log(`\n== 页内锚点 404（${Object.keys(anchor404).length} 页）==`);
for (const [p, list] of Object.entries(anchor404)) console.log(' ', p, '→', list.slice(0, 6).join(', '));

if (doHead && upstreamLinks.size) {
  console.log(`\n== 原站外指 HEAD 检查（${upstreamLinks.size} 条，并发 3）==`);
  const list = [...upstreamLinks];
  const badUp = [];
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const u = list[i++];
      try {
        const out = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-I', '-L',
          '--max-time', '25', '-A', 'Mozilla/5.0', UPSTREAM + u], { encoding: 'utf8', timeout: 30000 });
        const code = parseInt(out.trim(), 10);
        if (code >= 400) badUp.push([code, u]);
        process.stdout.write(`  ${code} ${u}\n`);
      } catch { badUp.push([0, u]); }
      await new Promise(r => setTimeout(r, 300));
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  console.log(`原站 4xx/5xx（${badUp.length} 条）:`);
  for (const [c, u] of badUp) console.log(`  ${c} ${u}`);
}
