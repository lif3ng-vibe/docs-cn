#!/usr/bin/env node
'use strict';
// HTML 英文残留扫描（官方页终检用）。
// 画廊页（layouts/mods）社区描述按用户决策保留英文，不在本扫描范围；
// 画廊页模板汉化覆盖度用 tools/template-coverage.cjs 精确校验。
// 用法：node tools/residue-check-html.cjs [dir, 默认 site；传 --official 只扫官方页]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const STOP = ['the', 'and', 'with', 'your', 'from', 'that', 'which', 'where', 'every', 'into', 'shows', 'when', 'what', 'who', 'why', 'how', 'their', 'them', 'they', 'this', 'these', 'those', 'there', 'then', 'than', 'because', 'about', 'after', 'before', 'between', 'each', 'any', 'all', 'can', 'will', 'just', 'also', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'too', 'very'];
// 界面复刻保留英文：演示终端/侧边栏 mockup 内容（JS 动态重建字符串与 SSR 同构）
// 产品/协议/文件名（GLOSSARY 不译名单）
const WHITELIST = [
  /\bHerdr\b/, /\bherdr-core\b/, /\bTUI\b/, /\bAGENTS\.md\b/, /\bOSC\b/, /7501/,
  /\bCopied\b/, /\bCopy\b/, /\bID\b/, /\bAGENT\b/, /\bWHERE\b/, /\bSTATUS\b/,
  /\bworking\b/, /\bblocked\b/, /\bdone\b/, /\bidle\b/, /needs you/,
  /pricing page/, /og tags/, /blog pass/, /docs nav/, /doc comments/, /readme\b/, /metrics\b/, /tests\b/,
  /quit herdr/, /hc ls/, /hc events/, /hc run/, /hc send/, /hc machine/,
  /waiting for the next change/, /bypass permissions/, /shift\+tab/, /gpt-6-luna/, /Claude Code/, /Codex\b/, /Claude\b/,
  /Updated mods\/tabs\/main\.js with/, // 落地页模拟 diff 输出（界面复刻）
  /Apache 2\.0/, /RECIPE\.md/, /GitHub/, /Discord/,
];
let bad = 0;
function isOfficial(rel) {
  const n = rel.replace(/\\/g, '/');
  if (/^(layouts|mods)\//.test(n)) return false;
  if (/^og\//.test(n)) return false;
  return /\.(html)$/.test(n);
}
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const rel = path.relative(SITE, p);
    if (!isOfficial(rel)) continue;
    const src = fs.readFileSync(p, 'utf8');
    const text = src
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ');
    text.split('\n').forEach((line, i) => {
      if (!line.trim()) return;
      for (const w of STOP) {
        const re = new RegExp('\\b' + w + '\\b', 'i');
        if (re.test(line)) {
          if (WHITELIST.some((r) => r.test(line))) continue;
          console.log(rel + ':' + (i + 1) + ': [' + w + '] ' + line.trim().slice(0, 140));
          bad++;
          break;
        }
      }
    });
  }
}
walk(SITE);
console.log(bad === 0 ? 'CLEAN' : bad + ' hits');
process.exit(bad === 0 ? 0 : 1);
