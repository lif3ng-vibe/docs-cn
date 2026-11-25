#!/usr/bin/env node
'use strict';
// 英文残留扫描：剥掉 <script>/<style>/<pre>/<code>/<summary>标签与注释后，
// 找"含停用词的英文句子"。豁免清单见 WHITELIST（数据/协议/代码 token）。
const fs = require('fs');
const path = require('path');

const STOP = [' the ', ' and ', ' with ', ' your ', ' from ', ' that ', ' for ', ' you ', ' are ', ' is '];
// 豁免：文件 → 行内容片段（合法保留的英文）
const WHITELIST = [
  'data:image/svg+xml',
  '<!DOCTYPE',
  'ui-view',
];

function strip(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code\b[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

let bad = 0;
const files = process.argv.slice(2);
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  // 逐行剥（保留行号）：<pre>/<code> 常跨行，这里按整块剥后按行扫注释里的英文句子
  const noScript = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, (m) => m.replace(/[^\n]/g, ''))
    .replace(/<style\b[\s\S]*?<\/style>/gi, (m) => m.replace(/[^\n]/g, ''))
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, (m) => m.replace(/[^\n]/g, ''))
    .replace(/<code\b[\s\S]*?<\/code>/gi, (m) => m.replace(/[^\n]/g, ''))
    .replace(/<[^>]+>/g, ' ');
  const lines = noScript.split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    if (WHITELIST.some(w => t.includes(w))) return;
    if (!/[A-Za-z]{3}/.test(t)) return;
    const low = ' ' + t.toLowerCase() + ' ';
    if (STOP.some(s => low.includes(s)) && !/[一-龥]/.test(t)) {
      // 纯英文行且含停用词 → 嫌疑；再排除纯数据行（无空格分词的串、URL、aria 数字）
      if (/^[\s\-\dK.:·/|]+$/.test(t)) return;
      console.log(`${file}:${i + 1}:${t.slice(0, 160)}`);
      bad++;
    }
  });
}
if (bad) { console.log(`\n${bad} suspicious line(s)`); process.exit(1); }
console.log('CLEAN');
