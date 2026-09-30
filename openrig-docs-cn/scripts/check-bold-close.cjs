#!/usr/bin/env node
// 粗体闭合审计：配对行内 `**`，仅对【闭合侧】判 CommonMark right-flanking 失败——
// 闭合 `**` 前一字符为全角/半角标点，且后一字符紧跟文字（非空白/标点/行尾）时，
// 该闭合在页面上失效（字面显示 **）。围栏代码块内白名单。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');
const PUNCT = new Set('）。！？、；：（）.,;:!?——-&~<>+=|\'"'.split(''));

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(md|mdx)$/.test(e.name)) yield p;
  }
}

let n = 0;
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let fence = false;
  lines.forEach(function (line, i) {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return; }
    if (fence) return;
    let inBold = false, idx = line.indexOf('**');
    while (idx !== -1) {
      const prev = idx > 0 ? line[idx - 1] : '';
      const next = line[idx + 2] || '';
      if (!inBold) inBold = true; // 开侧不判（左翼恒成立）
      else {
        if (prev && PUNCT.has(prev) && next && !PUNCT.has(next) && !/\s/.test(next)) {
          n++;
          console.log(path.relative(ROOT, file) + ':' + (i + 1) + ': …' + line.slice(Math.max(0, idx - 40), idx + 40) + '…');
        }
        inBold = false;
      }
      idx = line.indexOf('**', idx + 2);
    }
  });
}
console.log('可疑闭合 ' + n + ' 处');
process.exit(n ? 1 : 0);