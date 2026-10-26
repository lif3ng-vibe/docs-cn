#!/usr/bin/env node
// 盘点 gallery 数据/HTML 引用的资产，输出本地缺失清单
import fs from 'node:fs';

const t = fs.readFileSync('site/gallery/index.html', 'utf8');
const m = t.match(/<script id="gallery-data" type="application\/json">([\s\S]*?)<\/script>/);
const urls = new Set();
const RE = /\/gallery\/assets\/[A-Za-z0-9._-]+/g;
if (m) for (const mm of m[1].matchAll(RE)) urls.add(mm[0]);
for (const mm of t.matchAll(RE)) urls.add(mm[0]);

const missing = [];
const present = [];
for (const u of urls) {
  if (fs.existsSync('site' + u)) present.push(u);
  else missing.push(u);
}
fs.writeFileSync('/tmp/gallery-assets-missing.txt', missing.join('\n') + (missing.length ? '\n' : ''));
console.log('referenced:', urls.size, '| present:', present.length, '| missing:', missing.length);
