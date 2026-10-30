#!/usr/bin/env node
// extract.mjs — 从镜像 HTML 抽取可见翻译字符串（保护代码区）
// 用法：node pipeline/extract.mjs
// 产物：data/strings/<page>.json — { texts: [...], attrs: [...], meta: [...] }
//       data/strings/_stats.json — 各页字符串量统计
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const STRINGS = path.join(ROOT, 'data', 'strings');
fs.mkdirSync(STRINGS, { recursive: true });

const PROTECTED = 'script, style, code, pre, textarea, template, svg';

function hasLatin(s) {
  return /[a-zA-Z]/.test(s);
}

function extractPage(rel) {
  const html = fs.readFileSync(path.join(SITE, rel), 'utf8');
  const $ = cheerio.load(html);
  const texts = new Set();
  const attrs = new Set();
  const metas = new Set();

  // meta 与 <title>
  const title = $('title').first().text().trim();
  if (title) metas.add(title);
  for (const sel of [
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:site_name"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
  ]) {
    const v = $(sel).attr('content');
    if (v && v.trim() && hasLatin(v)) metas.add(v.trim());
  }

  // 可见文本节点（保护区域外）
  $(PROTECTED).each((_, el) => { $(el).remove(); });
  const walkText = (node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'text') {
        const t = child.data.replace(/\s+/g, ' ').trim();
        if (t.length >= 2 && hasLatin(t)) texts.add(t);
      } else if (child.type === 'tag') {
        walkText(child);
      }
    }
  };
  const bodyNode = $('body')[0];
  if (bodyNode) walkText(bodyNode);

  // 属性
  for (const el of $('body [title], body [aria-label], body [alt], body [placeholder]')) {
    for (const a of ['title', 'aria-label', 'alt', 'placeholder']) {
      const v = $(el).attr(a);
      if (v && v.trim() && hasLatin(v)) attrs.add(v.trim());
    }
  }

  // flight payload 抽取（客户端渲染页/流式壳的正文只存在于 flight）
  const FLIGHT_RX = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  const CHILD_RX = /"(?:children|title|label|description|text)":"((?:[^"\\]|\\.)*)"/g;
  for (const m of html.matchAll(FLIGHT_RX)) {
    let seg;
    try { seg = JSON.parse('"' + m[1] + '"'); } catch { continue; }
    if (seg.length > 20000) continue; // 巨串是序列化 markdown/数据块，句子级来自正文抽取
    for (const c of seg.matchAll(CHILD_RX)) {
      let s;
      try { s = JSON.parse('"' + c[1] + '"'); } catch { continue; }
      const t = s.replace(/\s+/g, ' ').trim();
      if (t.length >= 2 && t.length <= 600 && hasLatin(t) && !/^[$/{}[\]<>]/.test(t)) texts.add(t);
    }
  }

  return { texts: [...texts], attrs: [...attrs], meta: [...metas] };
}

// 页面清单 = site/ 下所有 index.html
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === 'index.html') {
      const rel = path.relative(SITE, full).replace(/\\/g, '/');
      pages.push(rel === 'index.html' ? '' : rel.replace(/\/index\.html$/, ''));
    }
  }
})(SITE);

const stats = {};
for (const p of pages) {
  const key = p === '' ? '_home' : p;
  const out = path.join(STRINGS, `${key}.json`);
  try {
    const data = extractPage(p === '' ? 'index.html' : `${p}/index.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(data, null, 1));
    stats[p] = { texts: data.texts.length, attrs: data.attrs.length, meta: data.meta.length };
    console.log(`  ${p || '(home)'}: ${data.texts.length} texts, ${data.attrs.length} attrs`);
  } catch (e) {
    console.error(`  ! ${p}: ${e.message.split('\n')[0]}`);
    stats[p] = { error: e.message.split('\n')[0] };
  }
}
fs.writeFileSync(path.join(STRINGS, '_stats.json'), JSON.stringify(stats, null, 2));
const total = Object.values(stats).reduce((s, v) => s + (v.texts || 0), 0);
console.log(`extract done: ${pages.length} pages, ${total} unique text strings`);
