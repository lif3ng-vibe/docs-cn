#!/usr/bin/env node
// check-home.mjs — 首页回填状态检查
import fs from 'node:fs';
const v = JSON.parse(fs.readFileSync('data/verify-report.json', 'utf8'));
console.log('断链:', JSON.stringify(v.brokenLinks));
const h = fs.readFileSync('site/index.html', 'utf8');
console.log('home标题:', (h.match(/<title>[^<]*<\/title>/) || [])[0]);
const rx = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m, c = 0, bad = 0, n = 0;
while ((m = rx.exec(h))) {
  n++;
  try { c += (JSON.parse('"' + m[1] + '"').match(/[一-龥]/g) || []).length; } catch { bad++; }
}
console.log('home flight段:', n, '中文命中:', c, '坏段:', bad);
const text = h.replace(/<(script|style|code|pre|textarea|svg|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
console.log('home可见中文数:', (text.match(/[一-龥]/g) || []).length);
