#!/usr/bin/env node
// build-site.mjs — upstream/（英文底稿）→ site/（生产形态汉化基座）
// 职责：资源/内链前缀改写（/docs-cn/herdr）、TUI 链接改指官方中文版、
//       script/JS/CSS 内容同步改写。翻译由后续批次在 site/ 上进行。
// 用法：node tools/build-site.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UP = path.join(ROOT, 'upstream');
const SITE = path.join(ROOT, 'site');
const BASE = '/docs-cn/herdr';
const TUI = 'https://herdr.dev/zh-cn/tui';

// 站内路径段白名单：只有这些开头的根绝对路径才加前缀
const SEGMENTS = ['blog', 'core', 'guide', 'download', 'gallery', 'layouts', 'mods',
  'mobile', 'privacy', 'og', '_astro', 'live', 'assets', 'cdn-cgi', 'showcase', 'css', 'favicon.ico',
  'sitemap-index.xml', 'sitemap-0.xml', 'sitemap.xml', 'robots.txt'];
const segRe = new RegExp(`^/(${SEGMENTS.map(s => s.replace('.', '\\.')).join('|')})([/?#]|$)`);

function inSite(p) { return segRe.test(p); }
function withBase(p) { return BASE + p; }

// TUI 链接改写：/tui/ → 官方中文版文档首页；/tui/X → 官方中文版对应页
function rewriteTui(p) {
  if (p === '/tui/' || p === '/tui') return TUI + '/docs/';
  return TUI + p.replace(/^\/tui/, '');
}

function rewriteAttrValue(v) {
  if (v === '/' ) return BASE + '/'; // 站根链接（logo/页脚 Home）
  if (v === '/cloud' || v === '/cloud/') return 'https://herdr.dev/cloud/';
  if (v.startsWith('/tui')) return rewriteTui(v);
  if (inSite(v)) return withBase(v);
  return v;
}

// script/JS 内容里的站内字符串字面量改写（保留引号形态）
function rewriteJs(code) {
  let n = 0;
  let out = code.replace(/(["'])(\/[^"'\n]{1,300}?)\1/g, (m, q, p) => {
    if (p.startsWith('/tui')) { n++; return q + rewriteTui(p) + q; }
    if (inSite(p)) { n++; return q + withBase(p) + q; }
    return m;
  });
  return { out, n };
}

// CSS url() 改写（绝对路径；相对路径基于 CSS 位置，子路径部署天然成立，不动）
function rewriteCss(code) {
  let n = 0;
  const out = code.replace(/url\((['"]?)(\/[^'")]+)\1\)/g, (m, q, p) => {
    if (inSite(p)) { n++; return `url(${q}${withBase(p)}${q})`; }
    return m;
  });
  return { out, n };
}

// ---------- 1. 复制 ----------
fs.rmSync(SITE, { recursive: true, force: true });
execFileSync('cp', ['-r', UP + '/.', SITE]);
// /cloud/ 是上游死链（Cloudflare fallback 返回首页），镜像不收录，链接指回原站
fs.rmSync(path.join(SITE, 'cloud'), { recursive: true, force: true });
console.log('copied upstream → site (cloud/ dropped)');

// ---------- 2. 遍历改写 ----------
let stats = { html: 0, attr: 0, tui: 0, js: 0, jsRef: 0, css: 0 };
function walk(dir, exts, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, fn);
    else if (exts.some(x => e.name.endsWith(x))) fn(p);
  }
}

walk(SITE, ['.html'], (p) => {
  let html = fs.readFileSync(p, 'utf8');
  stats.html++;
  // 属性：href/src/poster/srcset/content(og:image 等为 herdr.dev 绝对 URL，不动)
  html = html.replace(/\b(href|src|poster|srcset)="([^"]*)"/g, (m, a, v) => {
    const nv = rewriteAttrValue(v);
    if (nv !== v) { stats.attr++; if (v.startsWith('/tui')) stats.tui++; }
    return `${a}="${nv}"`;
  });
  // srcset 内多值
  html = html.replace(/\ssrcset="([^"]*)"/g, (m, list) => {
    const nl = list.split(',').map(part => {
      const t = part.trim().split(/\s+/);
      if (t[0] && t[0].startsWith('/')) { const nv = rewriteAttrValue(t[0]); if (nv !== t[0]) { stats.attr++; t[0] = nv; } }
      return t.join(' ');
    }).join(', ');
    return ` srcset="${nl}"`;
  });
  // 内联 script 内容
  html = html.replace(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g, (m, attrs, code) => {
    const { out, n } = rewriteJs(code);
    stats.jsRef += n;
    return `<script${attrs}>${out}</script>`;
  });
  fs.writeFileSync(p, html);
});

walk(SITE, ['.js'], (p) => {
  const code = fs.readFileSync(p, 'utf8');
  const { out, n } = rewriteJs(code);
  if (n) { stats.js++; stats.jsRef += n; fs.writeFileSync(p, out); }
});

walk(SITE, ['.css'], (p) => {
  const code = fs.readFileSync(p, 'utf8');
  const { out, n } = rewriteCss(code);
  if (n) { stats.css += n; fs.writeFileSync(p, out); }
});

console.log('rewrite stats:', JSON.stringify(stats));
