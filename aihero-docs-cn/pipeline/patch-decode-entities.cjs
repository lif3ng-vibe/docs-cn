#!/usr/bin/env node
// 一次性补丁：decodeEntities 支持数字/十六进制 HTML 实体
const fs = require('fs');
const p = require('path').join(__dirname, 'apply.mjs');
let src = fs.readFileSync(p, 'utf8');
if (src.includes('fromCodePoint')) { console.log('already patched'); process.exit(0); }
const oldFn = `function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ');
}`;
const newFn = `function decodeEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\\d+);/g, (_, d) => String.fromCodePoint(+d));
}`;
if (!src.includes(oldFn)) { console.error('anchor not found'); process.exit(1); }
src = src.replace(oldFn, newFn);
// tolerantRx 的撇号容差加 &#x27; 形态
src = src.replace("(?:&#39;|&apos;|')", "(?:&#x27;|&#39;|&apos;|')");
fs.writeFileSync(p, src);
console.log('decodeEntities + tolerantRx patched');
