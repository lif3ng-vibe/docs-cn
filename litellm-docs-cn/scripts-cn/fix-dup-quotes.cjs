// 修复清扫事故的双闭合引号：...sdk'' / ...benchmark"" → 单个闭合引号。
const fs = require('fs');
const files = [
  'docs/auto_router/benchmarks.md',
  'docs/auto_router/evaluate.md',
  'docs/auto_router/prompt_caching.md',
  'src/components/Conversion/content.js',
];
for (const f of files) {
  let t = fs.readFileSync(f, 'utf8');
  const before = t;
  t = t.replace(/(https:\/\/docs\.litellm\.ai\/(?:blog|release_notes)[^\s'"]*)''/g, '$1\'');
  t = t.replace(/(https:\/\/docs\.litellm\.ai\/(?:blog|release_notes)[^\s'"]*)""/g, '$1"');
  if (t !== before) { fs.writeFileSync(f, t); console.log('fixed', f); }
}
