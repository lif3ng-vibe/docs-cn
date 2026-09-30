#!/usr/bin/env node
// 抽取指定 dist 页面里字面 `**` 的上下文（剥 script/style/code/pre 与标签）。
const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<(code|pre)[^>]*>[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  let i = h.indexOf('**');
  console.log('== ' + f);
  while (i >= 0) {
    console.log('  …' + h.slice(Math.max(0, i - 70), i + 90).replace(/\s+/g, ' ') + '…');
    i = h.indexOf('**', i + 1);
  }
}