#!/usr/bin/env node
// smoke-check.mjs — 冒烟期手检临时脚本（终检用 verify.mjs）
import fs from 'node:fs';
const html = fs.readFileSync('site/what-is-an-agent/index.html', 'utf8');
console.log('title:', (html.match(/<title>[^<]*<\/title>/) || [])[0]);
console.log('lang:', (html.match(/<html lang="[^"]*"/) || [])[0]);
console.log('mirror注入:', html.includes('__MIRROR_BASE__'));
console.log('前缀src样例:', (html.match(/src="\/docs-cn\/aihero\/_next\/[^"]{0,40}/) || [])[0]);
console.log('残留裸/_next src数:', (html.match(/src="\/_next\//g) || []).length);
console.log('canonical:', (html.match(/<link rel="canonical" href="[^"]*"/) || [])[0]);
console.log('og:image:', (html.match(/property="og:image" content="[^"]{0,80}/) || [])[0]);
const RX = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m, bad = 0, cjk = 0, n = 0, sample = '';
while ((m = RX.exec(html))) {
  n++;
  try {
    const s = JSON.parse('"' + m[1] + '"');
    cjk += (s.match(/[一-龥]/g) || []).length;
    if (!sample && s.includes('课程')) sample = s.slice(Math.max(0, s.indexOf('课程') - 60), s.indexOf('课程') + 30);
  } catch { bad++; }
}
console.log('flight段:', n, '坏段:', bad, '中文命中:', cjk);
if (sample) console.log('flight中文样例: …' + sample.replace(/\n/g, ' ') + '…');
// 报告样例
const v = JSON.parse(fs.readFileSync('data/verify-report.json', 'utf8'));
console.log('\n断链样例:', JSON.stringify(Object.entries(v.brokenLinks).slice(0, 2)));
console.log('无CJK页:', v.noCjk);
console.log('上游残留样例:', JSON.stringify(Object.entries(v.leftoverUpstream).slice(0, 2)));
