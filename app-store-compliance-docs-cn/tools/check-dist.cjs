#!/usr/bin/env node
/**
 * check-dist.cjs — Jekyll 产物（site/）终检四件套
 * 1) 剥 script/style/code/pre 后扫字面 `**`（CJK 粗体闭合失败的字面显示）
 * 2) href="#frag" 与同页 id="frag" 匹配（跨页 fragment 视为错误，本站无此形态）
 * 3) 站内 .html/.md 相对内链的目标存在性
 * 4) 内链不得出现未带 baseurl 前缀的根路径（href="/xxx" 且非 baseurl 开头）
 * 用法：node tools/check-dist.cjs [siteDir]   （默认 ../site，相对本脚本）
 * 输出：分类问题清单；全部干净打印 CLEAN 退出 0，否则退出 1。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const siteDir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'site'));
const BASE = '/docs-cn/app-store-compliance';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function stripMarkup(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

const files = walk(siteDir);
let problems = 0;
const idsByFile = new Map();

// pass 1: literal ** + collect ids
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(siteDir, f);
  const text = stripMarkup(html);
  let idx = text.indexOf('**');
  while (idx !== -1) {
    const ctx = text.slice(Math.max(0, idx - 40), idx + 40).replace(/\s+/g, ' ');
    console.log(`[literal-**] ${rel}:${idx} …${ctx}…`);
    problems++;
    idx = text.indexOf('**', idx + 2);
  }
  const ids = new Set();
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  idsByFile.set(f, ids);
}

// pass 2: fragment + internal links + baseurl
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(siteDir, f);
  const fileDir = path.dirname(f);
  const ids = idsByFile.get(f);
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('#')) {
      const frag = href.slice(1);
      if (!ids.has(frag)) {
        console.log(`[missing-fragment] ${rel} #${frag}`);
        problems++;
      }
      continue;
    }
    if (/^https?:\/\//.test(href) || href.startsWith('mailto:')) continue;
    if (href.startsWith('/') && !href.startsWith(BASE + '/') && href !== BASE) {
      console.log(`[no-baseurl] ${rel} ${href}`);
      problems++;
      continue;
    }
    if (href.startsWith(BASE + '/') || href.startsWith(BASE)) {
      // 站内绝对链接：核对目标存在（去 fragment/查询）
      const clean = href.split('#')[0].split('?')[0];
      const target = path.join(siteDir, clean.replace(BASE, '').replace(/^\/+/, ''));
      const t1 = target.endsWith('/') ? path.join(target, 'index.html') : target;
      if (!fs.existsSync(t1) && !fs.existsSync(t1 + '.html') && !fs.existsSync(t1 + '/index.html')) {
        console.log(`[broken-internal] ${rel} ${href}`);
        problems++;
      }
      continue;
    }
    // 相对链接（jekyll-relative-links 未覆盖的手写相对路径）
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(fileDir, clean);
    if (!fs.existsSync(target) && !fs.existsSync(target + '.html')) {
      console.log(`[broken-relative] ${rel} ${href}`);
      problems++;
    }
  }
}

console.log(problems === 0 ? 'CLEAN' : `PROBLEMS: ${problems}`);
process.exit(problems === 0 ? 0 : 1);
